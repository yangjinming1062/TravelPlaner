import asyncio
import time
import uuid
from enum import Enum
from typing import Any
from urllib.parse import urljoin

import aiohttp
from aiohttp import ClientSession
from aiohttp import ClientTimeout
from config import CONFIG
from pydantic import BaseModel
from utils import RateLimiter


class AmapAPIException(Exception):
    """高德地图API异常"""

    def __init__(self, message: str, status_code: str | None = None, info_code: str | None = None):
        super().__init__(message)
        self.status_code = status_code
        self.info_code = info_code


class RequestStatus(str, Enum):
    """请求状态"""

    QUEUED = "queued"
    EXECUTING = "executing"
    COMPLETED = "completed"
    FAILED = "failed"
    TIMEOUT = "timeout"


class AmapRequest(BaseModel):
    """高德地图请求信息"""

    request_id: str
    method: str
    endpoint: str
    params: dict[str, Any] | None = None
    data: dict[str, Any] | None = None
    headers: dict[str, str] | None = None
    status: RequestStatus
    created_at: float
    started_at: float | None = None
    completed_at: float | None = None
    result: dict[str, Any] | None = None
    error: Exception | None = None
    retry_count: int = 0

    class Config:
        arbitrary_types_allowed = True  # 允许任意类型的result和error

    @property
    def duration(self) -> float | None:
        """获取执行时间"""
        if self.started_at and self.completed_at:
            return self.completed_at - self.started_at
        return None

    @property
    def queue_wait_time(self) -> float | None:
        """获取队列等待时间"""
        if self.started_at:
            return self.started_at - self.created_at
        return None


class AmapRequestQueue:
    """高德地图异步请求队列"""

    def __init__(self):
        self._queue: asyncio.Queue[AmapRequest] = asyncio.Queue()
        self._results: dict[str, AmapRequest] = {}
        self._lock = asyncio.Lock()

    async def put(self, request: AmapRequest) -> None:
        """添加请求到队列"""
        await self._queue.put(request)

    async def get(self, timeout: float | None = None) -> AmapRequest | None:
        """从队列获取请求"""
        try:
            if timeout is None:
                return await self._queue.get()
            else:
                return await asyncio.wait_for(self._queue.get(), timeout=timeout)
        except asyncio.TimeoutError:
            return None

    async def get_result(self, request_id: str) -> AmapRequest | None:
        """获取请求结果"""
        async with self._lock:
            return self._results.get(request_id)

    async def set_result(self, request: AmapRequest) -> None:
        """设置请求结果"""
        async with self._lock:
            self._results[request.request_id] = request

    def size(self) -> int:
        """获取队列大小"""
        return self._queue.qsize()


class AmapClient:
    """高德地图API客户端 - 集成队列和速率限制"""

    def __init__(self, logger, session: ClientSession | None = None):
        """
        初始化高德地图API客户端

        Args:
            logger: 日志记录器
            session: 可选的aiohttp会话，如果不提供则自动创建
        """
        self.logger = logger
        self.api_key = CONFIG.amap_key
        self.sig = CONFIG.amap_sig
        self.base_url = CONFIG.amap_base_url
        self.timeout = CONFIG.amap_timeout
        self.retry_count = CONFIG.amap_retry_count
        self.retry_delay = CONFIG.amap_retry_delay
        self.max_requests_per_second = CONFIG.amap_max_requests_per_second
        self._session = session
        self._own_session = session is None
        # 队列和限制器（每秒限制，时间窗口1秒）
        self.rate_limiter = RateLimiter(self.max_requests_per_second, 1.0)
        self.request_queue = AmapRequestQueue()
        # 后台任务
        self._worker_task: asyncio.Task | None = None
        self._shutdown_event = asyncio.Event()

    async def __aenter__(self):
        """异步上下文管理器入口"""
        if self._session is None:
            timeout = ClientTimeout(total=self.timeout)
            self._session = ClientSession(timeout=timeout)

        # 启动worker任务
        await self._start_worker()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """异步上下文管理器出口"""
        # 停止worker任务
        await self._stop_worker()
        if self._own_session and self._session:
            await self._session.close()
            self._session = None

    async def _start_worker(self) -> None:
        """启动后台worker任务"""
        try:
            loop = asyncio.get_running_loop()
            self._worker_task = loop.create_task(self._worker_loop())
            self.logger.debug("高德地图API worker任务启动成功")
        except Exception as e:
            self.logger.error(f"启动worker任务失败: {e}")

    async def _stop_worker(self) -> None:
        """停止后台worker任务"""
        self._shutdown_event.set()
        if self._worker_task and not self._worker_task.done():
            try:
                await asyncio.wait_for(self._worker_task, timeout=5.0)
            except asyncio.TimeoutError:
                self._worker_task.cancel()
                self.logger.warning("强制取消worker任务")
        self._worker_task = None

    async def _worker_loop(self) -> None:
        """worker循环处理队列中的请求"""
        self.logger.debug("高德地图API worker循环启动")
        while not self._shutdown_event.is_set():
            try:
                # 从队列获取请求（1秒超时）
                request = await self.request_queue.get(timeout=1.0)
                if request is None:
                    continue
                self.logger.debug(f"处理请求: {request.request_id}")
                # 串行执行请求（每次只处理一个）
                await self._execute_request(request)
            except Exception as e:
                self.logger.exception(f"worker循环错误: {e}")
                await asyncio.sleep(1.0)

    async def _execute_request(self, request: AmapRequest) -> None:
        """执行单个请求"""
        try:
            # 速率限制检查
            while not self.rate_limiter.can_proceed():
                wait_time = self.rate_limiter.wait_time()
                self.logger.debug(f"速率限制，等待 {wait_time:.1f} 秒")
                await asyncio.sleep(min(wait_time, 1.0))
            request.status = RequestStatus.EXECUTING
            request.started_at = time.time()
            # 执行HTTP请求
            result = await self._make_request(request.method, request.endpoint, request.params, request.data, request.headers)
            request.result = result
            request.status = RequestStatus.COMPLETED
            request.completed_at = time.time()
            self.logger.debug(f"请求完成: {request.request_id}")
        except AmapAPIException as e:
            request.error = e
            request.completed_at = time.time()
            # 检查是否需要重试
            if e.info_code in ["10021", "10022", "10023"] and request.retry_count < self.retry_count:  # 配额相关错误
                # 重试
                request.retry_count += 1
                request.status = RequestStatus.QUEUED
                request.started_at = None
                # 延迟后重新加入队列
                delay = self.retry_delay * (2**request.retry_count)
                self.logger.warning(f"请求重试: {request.request_id} (第{request.retry_count}次)，延迟{delay}秒")
                await asyncio.sleep(delay)
                await self.request_queue.put(request)
                return
            else:
                request.status = RequestStatus.FAILED
                self.logger.error(f"请求失败: {request.request_id} - {e}")
        except Exception as e:
            request.error = AmapAPIException(f"请求执行异常: {str(e)}")
            request.status = RequestStatus.FAILED
            request.completed_at = time.time()
            self.logger.exception(f"请求执行异常: {request.request_id}")
        finally:
            # 保存结果
            await self.request_queue.set_result(request)

    def _build_url(self, endpoint: str) -> str:
        """构建完整的API URL"""
        return urljoin(self.base_url, endpoint)

    def _prepare_params(self, params: dict[str, Any]) -> dict[str, Any]:
        """准备请求参数"""
        prepared_params = params.copy() if params else {}
        # 添加API密钥
        prepared_params["key"] = self.api_key
        # 添加数字签名（如果配置了）
        if self.sig:
            prepared_params["sig"] = self.sig
        # 设置默认输出格式
        if "output" not in prepared_params:
            prepared_params["output"] = "JSON"
        # 移除值为None的参数
        prepared_params = {k: v for k, v in prepared_params.items() if v is not None}
        # 处理特殊类型的参数
        for key, value in prepared_params.items():
            if hasattr(value, "__str__") and not isinstance(value, str):
                prepared_params[key] = str(value)
        return prepared_params

    def _handle_response(self, response_data: dict[str, Any]) -> dict[str, Any]:
        """处理API响应"""
        status = response_data.get("status", "0")
        info = response_data.get("info", "")
        info_code = response_data.get("infocode", "")
        # 检查API响应状态
        if status != "1":
            error_msg = f"高德地图API错误: {info}"
            self.logger.error(f"API错误 - 状态码: {status}, 信息码: {info_code}, 详情: {info}")
            raise AmapAPIException(error_msg, status_code=status, info_code=info_code)
        return response_data

    async def _make_request(
        self,
        method: str,
        endpoint: str,
        params: dict[str, Any] | None = None,
        data: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        """发起HTTP请求"""
        if self._session is None:
            timeout = ClientTimeout(total=self.timeout)
            self._session = ClientSession(timeout=timeout)
            self._own_session = True
        url = self._build_url(endpoint)
        # 准备参数
        if params:
            params = self._prepare_params(params)
        # 设置默认请求头
        request_headers = {"User-Agent": "AMap-Python-SDK/1.0", "Accept": "application/json"}
        if headers:
            request_headers.update(headers)

        self.logger.debug(f"发起请求: {method} {url}, 参数: {params}")
        try:
            async with self._session.request(method=method, url=url, params=params, json=data, headers=request_headers) as response:
                response.raise_for_status()
                content_type = response.headers.get("content-type", "")
                if "application/json" in content_type:
                    response_data = await response.json()
                else:
                    # 处理非JSON响应（如静态地图图片）
                    response_data = {"status": "1", "info": "OK", "content": await response.read(), "content_type": content_type}
                return self._handle_response(response_data)
        except aiohttp.ClientError as e:
            error_msg = f"HTTP请求失败: {str(e)}"
            self.logger.error(error_msg)
            raise AmapAPIException(error_msg) from e
        except Exception as e:
            error_msg = f"请求处理失败: {str(e)}"
            self.logger.error(error_msg)
            raise AmapAPIException(error_msg) from e

    async def _queue_request(
        self,
        method: str,
        endpoint: str,
        params: dict[str, Any] | None = None,
        data: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        """将请求加入队列并等待结果"""
        # 创建请求对象
        request_id = str(uuid.uuid4())
        request = AmapRequest(
            request_id=request_id,
            method=method,
            endpoint=endpoint,
            params=params,
            data=data,
            headers=headers,
            status=RequestStatus.QUEUED,
            created_at=time.time(),
        )
        # 加入队列
        await self.request_queue.put(request)
        self.logger.debug(f"请求已加入队列: {request_id}")
        # 等待完成（增加队列等待时间）
        queue_wait_time = 30  # 额外的队列等待时间
        max_wait_time = self.timeout + (self.retry_count * self.retry_delay * 4) + queue_wait_time
        start_time = time.time()
        while time.time() - start_time < max_wait_time:
            result_request = await self.request_queue.get_result(request_id)
            if result_request and result_request.status in [RequestStatus.COMPLETED, RequestStatus.FAILED, RequestStatus.TIMEOUT]:
                if result_request.status == RequestStatus.COMPLETED:
                    return result_request.result
                else:
                    raise result_request.error or AmapAPIException("请求失败")
            await asyncio.sleep(0.1)
        raise AmapAPIException(f"请求超时: {request_id}")

    async def get(self, endpoint: str, params: dict[str, Any] | None = None, headers: dict[str, str] | None = None) -> dict[str, Any]:
        """
        发起GET请求

        Args:
            endpoint: API端点
            params: URL参数
            headers: 请求头

        Returns:
            API响应数据
        """
        return await self._queue_request("GET", endpoint, params=params, headers=headers)

    async def post(
        self, endpoint: str, params: dict[str, Any] | None = None, data: dict[str, Any] | None = None, headers: dict[str, str] | None = None
    ) -> dict[str, Any]:
        """
        发起POST请求

        Args:
            endpoint: API端点
            params: URL参数
            data: 请求体数据
            headers: 请求头

        Returns:
            API响应数据
        """
        return await self._queue_request("POST", endpoint, params=params, data=data, headers=headers)

    async def close(self):
        """关闭客户端，释放资源"""
        await self._stop_worker()
        if self._own_session and self._session:
            await self._session.close()
            self._session = None
