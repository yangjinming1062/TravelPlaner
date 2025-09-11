import asyncio
import heapq
import time
import uuid
from concurrent.futures import ThreadPoolExecutor
from typing import Any
from typing import Callable
from typing import Generic
from typing import TypeVar

from pydantic import BaseModel
from pydantic import Field
from utils import RateLimiter

from ..enums import RequestPriority
from ..enums import RequestStatus
from ..schemas import RequestConfig

T = TypeVar("T")


class RequestInfo(BaseModel):
    """请求信息"""

    request_id: str
    function_name: str
    priority: RequestPriority
    status: RequestStatus
    created_at: float
    started_at: float | None = None
    completed_at: float | None = None
    timeout: float | None = None
    retry_count: int = 0
    error_message: str | None = None
    result: Any | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)

    class Config:
        arbitrary_types_allowed = True  # 允许任意类型的result

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


class AsyncPriorityQueue(Generic[T]):
    """异步优先级队列"""

    def __init__(self):
        self._heap: list[tuple[int, int, T]] = []  # (priority_value, counter, item)
        self._counter = 0  # 用于维持插入顺序
        self._lock = asyncio.Lock()
        self._not_empty = asyncio.Condition(self._lock)

    async def put(self, item: T, priority: RequestPriority) -> None:
        """添加项目到队列"""
        async with self._not_empty:
            # 优先级值越小，优先级越高（与RequestPriority.value相反）
            priority_value = 5 - priority.value
            heapq.heappush(self._heap, (priority_value, self._counter, item))
            self._counter += 1
            self._not_empty.notify()

    async def get(self, timeout: float | None = None) -> T | None:
        """从队列获取项目（按优先级）"""
        async with self._not_empty:
            while not self._heap:
                if timeout is None:
                    await self._not_empty.wait()
                else:
                    try:
                        await asyncio.wait_for(self._not_empty.wait(), timeout=timeout)
                    except asyncio.TimeoutError:
                        return None

            _, _, item = heapq.heappop(self._heap)
            return item

    def size(self) -> int:
        """获取队列总大小"""
        return len(self._heap)

    def empty(self) -> bool:
        """检查队列是否为空"""
        return len(self._heap) == 0

    def get_items_by_id(self, request_id: str) -> T | None:
        """根据请求ID查找队列中的项目"""
        for _, _, item in self._heap:
            if hasattr(item, "request_id") and item.request_id == request_id:
                return item
        return None

    async def clear(self) -> None:
        """清空队列"""
        async with self._lock:
            self._heap.clear()
            self._counter = 0


class RequestManager:
    """
    模型请求管理器 - 统一的模型调用协调者

    作为LLM模块的核心组件，负责：
    - 并发控制与队列管理
    - 请求优先级处理
    - 速率限制与资源管理
    - 请求生命周期管理
    - 统计信息收集
    """

    def __init__(
        self,
        logger,
        metrics,
        config: RequestConfig | None = None,
    ):
        """
        初始化请求管理器

        Args:
            logger: 日志记录器实例
            metrics: 指标收集器实例
            config: 请求管理配置（RequestConfig）
        """
        self.config = config or RequestConfig()
        self.logger = logger
        self.metrics = metrics
        self.active_requests: dict[str, RequestInfo] = {}
        self.completed_requests: list[RequestInfo] = []
        # 异步优先级队列
        self.request_queue = AsyncPriorityQueue[RequestInfo]()
        self._semaphore = asyncio.Semaphore(self.config.max_concurrent_requests)
        self._lock = asyncio.Lock()
        self.rate_limiter = RateLimiter(self.config.max_requests_per_minute, 60.0)
        self.thread_pool = ThreadPoolExecutor(max_workers=self.config.max_concurrent_requests)
        self._worker_task: asyncio.Task | None = None
        self._monitoring_task: asyncio.Task | None = None
        self._shutdown_event = asyncio.Event()

        self._start_background_tasks()

    def _start_background_tasks(self) -> None:
        """启动后台任务"""
        try:
            # 检查是否有运行的事件循环
            loop = asyncio.get_running_loop()
            self._worker_task = loop.create_task(self._worker_loop())
            self._monitoring_task = loop.create_task(self._monitoring_loop())
            self.logger.debug("后台任务启动成功")
        except RuntimeError:
            # 没有运行的事件循环，延迟启动任务
            self.logger.debug("没有运行的事件循环，后台任务将在需要时启动")
            self._worker_task = None
            self._monitoring_task = None

    async def _ensure_worker_running(self) -> None:
        """确保worker任务正在运行"""
        if self._worker_task is None or self._worker_task.done():
            try:
                loop = asyncio.get_running_loop()
                if self._worker_task is None or self._worker_task.done():
                    self._worker_task = loop.create_task(self._worker_loop())
                    self.logger.debug("启动worker任务")
                if self._monitoring_task is None or self._monitoring_task.done():
                    self._monitoring_task = loop.create_task(self._monitoring_loop())
                    self.logger.debug("启动监控任务")
            except Exception as e:
                self.logger.error(f"启动后台任务失败: {e}")

    async def _worker_loop(self) -> None:
        """工作线程循环"""
        self.logger.debug("worker循环启动")
        loop_count = 0
        while not self._shutdown_event.is_set():
            try:
                loop_count += 1
                self.logger.debug(f"worker循环第{loop_count}次，队列大小: {self.request_queue.size()}")
                # 从优先级队列获取请求
                if request_info := await self.request_queue.get(timeout=1.0):
                    self.logger.debug(f"从队列获取到请求: {request_info.request_id}")
                    await self._execute_request(request_info)
                else:
                    self.logger.debug("队列超时，继续等待")
            except Exception as e:
                self.logger.exception(f"工作线程循环错误: {e}")
                await asyncio.sleep(1.0)

    async def _monitoring_loop(self) -> None:
        """监控循环"""
        while not self._shutdown_event.is_set():
            try:
                await asyncio.sleep(60.0)  # 每分钟更新一次
                async with self._lock:
                    current_active = len(self.active_requests)
                    current_queue_size = self.request_queue.size()
                    # 更新统计信息到 MetricsCollector
                    self.metrics.update_metric("request_manager", "current_active_requests", current_active)
                    self.metrics.update_metric("request_manager", "current_queue_size", current_queue_size)
                    current_peak_concurrent = self.metrics.request_manager.get("peak_concurrent_requests", 0)
                    current_peak_queue = self.metrics.request_manager.get("peak_queue_size", 0)
                    if current_active > current_peak_concurrent:
                        self.metrics.update_metric("request_manager", "peak_concurrent_requests", current_active)
                    if current_queue_size > current_peak_queue:
                        self.metrics.update_metric("request_manager", "peak_queue_size", current_queue_size)
                    completed_in_last_minute = len(
                        [req for req in self.completed_requests if req.completed_at and (time.time() - req.completed_at) <= 60.0]
                    )
                    self.metrics.update_metric("request_manager", "throughput_per_minute", completed_in_last_minute)
                    # 清理已完成的请求记录
                    if len(self.completed_requests) > 1000:
                        # 保留最近的记录
                        self.completed_requests = self.completed_requests[-1000:]
            except Exception as e:
                self.logger.error(f"监控循环错误: {e}")

    async def request(
        self,
        func: Callable,
        *args,
        priority: RequestPriority = RequestPriority.NORMAL,
        timeout: float | None = None,
        metadata: dict[str, Any] | None = None,
        **kwargs,
    ) -> Any:
        """
        统一的请求处理入口

        Args:
            func: 要执行的函数
            *args: 函数位置参数
            priority: 请求优先级
            timeout: 超时时间
            metadata: 元数据
            **kwargs: 函数关键字参数

        Returns:
            Any: 请求执行结果
        """
        # 确保worker任务正在运行
        await self._ensure_worker_running()
        # 提交请求到队列
        request_id = await self._request(func, *args, priority=priority, timeout=timeout, metadata=metadata, **kwargs)
        self.logger.debug(f"请求已提交到队列: {request_id}")
        # 等待完成并返回结果
        result = await self.wait_for_request(request_id, timeout)
        self.logger.debug(f"请求完成: {request_id}")
        return result

    async def _request(
        self,
        func: Callable,
        *args,
        priority: RequestPriority = RequestPriority.NORMAL,
        timeout: float | None = None,
        metadata: dict[str, Any] | None = None,
        **kwargs,
    ) -> str:
        """
        内部方法：提交请求到管理器

        Args:
            func: 要执行的函数
            *args: 函数位置参数
            priority: 请求优先级
            timeout: 超时时间
            metadata: 元数据
            **kwargs: 函数关键字参数

        Returns:
            str: 请求ID
        """
        # 检查队列大小限制
        if self.request_queue.size() >= self.config.max_queue_size:
            raise RuntimeError(f"请求队列已满 (最大: {self.config.max_queue_size})")
        # 检查速率限制
        if not self.rate_limiter.can_proceed():
            wait_time = self.rate_limiter.wait_time()
            raise RuntimeError(f"请求速率受限，需等待 {wait_time:.1f} 秒")
        # 创建请求信息
        request_id = str(uuid.uuid4())
        request_info = RequestInfo(
            request_id=request_id,
            function_name=func.__name__ if hasattr(func, "__name__") else str(func),
            priority=priority,
            status=RequestStatus.QUEUED,
            created_at=time.time(),
            timeout=timeout or self.config.default_timeout,
            metadata=metadata or {},
        )

        # 存储函数和参数
        request_info.metadata.update({"func": func, "args": args, "kwargs": kwargs})
        # 添加到优先级队列
        self.logger.debug(f"准备将请求添加到队列: {request_id}, 优先级: {priority.name}")
        await self.request_queue.put(request_info, priority)
        self.logger.debug(f"添加后队列大小: {self.request_queue.size()}")
        self.logger.debug(f"提交请求: {request_id} ({func.__name__ if hasattr(func, '__name__') else str(func)}) 优先级: {priority.name}")
        return request_id

    async def _execute_request(self, request_info: RequestInfo) -> None:
        """执行请求"""
        self.logger.debug(f"进入_execute_request: {request_info.request_id}")
        async with self._semaphore:
            self.logger.debug(f"获得semaphore，开始执行: {request_info.request_id}")
            async with self._lock:
                self.active_requests[request_info.request_id] = request_info
                self.logger.debug(f"请求加入活动列表: {request_info.request_id}")
            try:
                request_info.status = RequestStatus.EXECUTING
                request_info.started_at = time.time()
                self.logger.debug(f"开始执行请求: {request_info.request_id}, 函数: {request_info.function_name}")
                # 获取函数和参数
                func = request_info.metadata["func"]
                args = request_info.metadata["args"]
                kwargs = request_info.metadata["kwargs"]
                self.logger.debug(f"函数类型: {type(func)}, 是否协程函数: {asyncio.iscoroutinefunction(func)}")
                # 执行函数（支持同步和异步）
                if asyncio.iscoroutinefunction(func):
                    # 异步函数
                    self.logger.debug(f"执行异步函数: {func.__name__ if hasattr(func, '__name__') else str(func)}")
                    result = await asyncio.wait_for(func(*args, **kwargs), timeout=request_info.timeout)
                else:
                    # 同步函数 - 使用线程池执行
                    self.logger.debug(f"执行同步函数: {func.__name__ if hasattr(func, '__name__') else str(func)}")
                    # 创建一个独立的执行任务，避免共享线程池的问题
                    loop = asyncio.get_event_loop()
                    # 使用loop.run_in_executor而不是共享的thread_pool
                    # 这样可以避免线程池状态冲突
                    result = await asyncio.wait_for(
                        loop.run_in_executor(None, func, *args, **kwargs),
                        timeout=request_info.timeout,
                    )
                self.logger.debug(f"函数执行完成，结果类型: {type(result)}")
                request_info.result = result
                request_info.status = RequestStatus.COMPLETED
                request_info.completed_at = time.time()
                self.logger.debug(f"请求执行成功: {request_info.request_id}")
            except asyncio.TimeoutError:
                request_info.status = RequestStatus.TIMEOUT
                request_info.completed_at = time.time()
                request_info.error_message = f"LLM API请求超时 (当前超时设置: {request_info.timeout}秒)。"
                self.logger.warning(f"请求超时: {request_info.request_id} (当前超时设置: {request_info.timeout}秒)。")
            except Exception as e:
                request_info.status = RequestStatus.FAILED
                request_info.completed_at = time.time()
                request_info.error_message = str(e)
                self.logger.exception(f"请求执行失败: {request_info.request_id} - {e}")
                self.logger.debug(f"异常详情 - 类型: {type(e)}, 函数: {request_info.function_name}")
                # 检查是否需要重试
                if self.config.enable_auto_retry and request_info.retry_count < self.config.max_retry_attempts:
                    self.logger.debug(f"准备重试请求: {request_info.request_id}")
                    await self._retry_request(request_info)
                    return
            finally:
                # 移出活动请求
                async with self._lock:
                    if request_info.request_id in self.active_requests:
                        del self.active_requests[request_info.request_id]
                        self.logger.debug(f"请求从活动列表移除: {request_info.request_id}")
                # 添加到完成列表
                self.completed_requests.append(request_info)
                self.logger.debug(f"请求加入完成列表: {request_info.request_id}")
                # 更新统计信息
                self._update_request_metrics(request_info)

    def _update_request_metrics(self, request_info: RequestInfo) -> None:
        """更新请求指标"""
        self.metrics.increment_metric("request_manager", "total_requests")
        priority_name = request_info.priority.name
        self.metrics.increment_metric("request_manager", f"priority_{priority_name.lower()}")
        # 🔄 根据状态更新指标
        if request_info.status == RequestStatus.COMPLETED:
            self.metrics.increment_metric("request_manager", "completed_requests")
            if request_info.duration:
                current_total_time = self.metrics.request_manager.get("total_execution_time", 0.0)
                current_completed = self.metrics.request_manager.get("completed_requests", 1)
                new_total_time = current_total_time + request_info.duration
                new_avg_time = new_total_time / current_completed
                self.metrics.update_metric("request_manager", "total_execution_time", new_total_time)
                self.metrics.update_metric("request_manager", "average_execution_time", new_avg_time)
            if request_info.queue_wait_time:
                current_avg_wait = self.metrics.request_manager.get("average_queue_wait_time", 0.0)
                current_completed = self.metrics.request_manager.get("completed_requests", 1)
                if current_completed > 1:
                    new_avg_wait = (current_avg_wait * (current_completed - 1) + request_info.queue_wait_time) / current_completed
                else:
                    new_avg_wait = request_info.queue_wait_time
                self.metrics.update_metric("request_manager", "average_queue_wait_time", new_avg_wait)
        elif request_info.status == RequestStatus.FAILED:
            self.metrics.increment_metric("request_manager", "failed_requests")
        elif request_info.status == RequestStatus.TIMEOUT:
            self.metrics.increment_metric("request_manager", "timeout_requests")
        if request_info.retry_count > 0:
            self.metrics.increment_metric("request_manager", f"retries_{request_info.retry_count}")

    async def _retry_request(self, request_info: RequestInfo) -> None:
        """重试请求"""
        request_info.retry_count += 1
        request_info.status = RequestStatus.QUEUED
        request_info.created_at = time.time()
        request_info.started_at = None
        request_info.completed_at = None
        # 延迟后重新提交
        await asyncio.sleep(self.config.retry_delay * request_info.retry_count)
        await self.request_queue.put(request_info, request_info.priority)
        self.logger.info(f"重试请求: {request_info.request_id} (第 {request_info.retry_count} 次)")

    async def get_request_status(self, request_id: str) -> RequestInfo | None:
        """获取请求状态"""
        # 检查活动请求
        async with self._lock:
            if request_id in self.active_requests:
                return self.active_requests[request_id]

        # 检查完成请求
        for request_info in self.completed_requests:
            if request_info.request_id == request_id:
                return request_info

        # 检查队列中的请求
        if queued_item := self.request_queue.get_items_by_id(request_id):
            return queued_item

        return None

    async def wait_for_request(self, request_id: str, timeout: float | None = None) -> Any | None:
        """等待请求完成"""
        self.logger.debug(f"开始等待请求完成: {request_id}, 超时: {timeout}")
        start_time = time.time()
        loop_count = 0
        while True:
            loop_count += 1
            request_info = await self.get_request_status(request_id)
            self.logger.debug(f"等待循环第{loop_count}次，请求状态: {request_info.status if request_info else 'None'}")
            if not request_info:
                self.logger.debug(f"请求信息不存在: {request_id}")
                return None
            if request_info.status in [
                RequestStatus.COMPLETED,
                RequestStatus.FAILED,
                RequestStatus.TIMEOUT,
            ]:
                if request_info.status == RequestStatus.COMPLETED:
                    self.logger.debug(f"请求完成，返回结果: {request_info.result}")
                    return request_info.result
                else:
                    self.logger.debug(f"请求失败: {request_info.error_message}")
                    raise RuntimeError(f"请求失败: {request_info.error_message}")
            # 检查超时
            if timeout and (time.time() - start_time) > timeout:
                self.logger.debug(f"等待请求超时: {request_id}")
                raise asyncio.TimeoutError(f"等待请求完成超时 (当前超时设置: {timeout}秒)。")
            await asyncio.sleep(0.1)

    def get_queue_info(self) -> dict[str, Any]:
        """获取队列信息"""
        return {
            "current_queue_size": self.request_queue.size(),
            "max_queue_size": self.config.max_queue_size,
            "current_active_requests": len(self.active_requests),
            "max_concurrent_requests": self.config.max_concurrent_requests,
            "rate_limit_per_minute": self.config.max_requests_per_minute,
        }
