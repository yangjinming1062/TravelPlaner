import asyncio
import time
import uuid
from typing import Any

from langchain.tools import BaseTool
from pydantic import BaseModel

from ..enums import ToolCallStatus


class ToolCallInfo(BaseModel):
    """工具调用信息"""

    call_id: str
    tool_name: str
    arguments: dict[str, Any]
    status: ToolCallStatus
    start_time: float | None = None
    end_time: float | None = None
    duration_ms: float | None = None
    error_message: str | None = None
    result: Any | None = None


class ToolManager:
    """
    工具调用管理器

    实现完整的工具调用生命周期管理：
    - 工具调用状态跟踪
    - 自动函数响应处理
    - 完整工具调用流程管理
    """

    def __init__(self, logger, metrics, max_concurrent_calls: int = 3):
        """
        初始化工具管理器

        Args:
            max_concurrent_calls: 最大并发工具调用数
            metrics: MetricsCollector实例，用于统计记录
        """
        self.logger = logger
        self.metrics = metrics
        self.tools: dict[str, BaseTool] = {}
        self.active_calls: dict[str, ToolCallInfo] = {}
        self.call_queue: list[ToolCallInfo] = []
        self.max_concurrent_calls = max_concurrent_calls

    def register_tool(self, tool: BaseTool) -> None:
        """注册工具"""
        self.tools[tool.name] = tool
        self.logger.debug(f"注册工具: {tool.name}")

    def register_tools(self, tools: list[BaseTool]) -> None:
        """批量注册工具"""
        for tool in tools:
            self.register_tool(tool)

    def unregister_tool(self, tool_name: str) -> None:
        """注销工具"""
        if tool_name in self.tools:
            del self.tools[tool_name]
            self.logger.debug(f"注销工具: {tool_name}")

    async def schedule_tool_call(self, tool_name: str, arguments: dict[str, Any]) -> str:
        """
        调度工具调用

        Args:
            tool_name: 工具名称
            arguments: 工具参数

        Returns:
            str: 调用ID
        """
        if tool_name not in self.tools:
            raise ValueError(f"工具 '{tool_name}' 未注册")
        call_id = str(uuid.uuid4())
        # 创建工具调用信息
        call_info = ToolCallInfo(
            call_id=call_id,
            tool_name=tool_name,
            arguments=arguments,
            status=ToolCallStatus.EXECUTING,
        )
        # 验证参数
        try:
            tool = self.tools[tool_name]
            # 这里可以添加参数验证逻辑
            self.logger.debug(f"工具调用开始: {call_id}")
        except Exception as e:
            call_info.status = ToolCallStatus.ERROR
            call_info.error_message = f"参数验证失败: {e}"
            self.logger.error(f"工具调用验证失败 {call_id}: {e}")
            # 记录验证失败的工具调用
            self.metrics.increment_metric("tool_management", "failed_calls")
            self.metrics.increment_metric("tool_management", "total_calls")
            return call_id
        # 添加到队列或直接执行
        if len(self.active_calls) >= self.max_concurrent_calls:
            self.call_queue.append(call_info)
            self.logger.debug(f"工具调用加入队列: {call_id}")
        else:
            self.active_calls[call_id] = call_info
            asyncio.create_task(self._execute_tool_call(call_id))
        return call_id

    async def _execute_tool_call(self, call_id: str) -> None:
        """执行工具调用"""
        if call_id not in self.active_calls:
            return
        call_info = self.active_calls[call_id]
        tool = self.tools[call_info.tool_name]
        try:
            call_info.start_time = time.time()
            self.logger.debug(f"开始执行工具调用: {call_id} ({call_info.tool_name})")
            # 执行工具
            if hasattr(tool, "arun"):
                # 异步工具
                result = await tool.arun(**call_info.arguments)
            else:
                # 同步工具
                result = tool.run(**call_info.arguments)

            call_info.result = result
            call_info.status = ToolCallStatus.SUCCESS
            call_info.end_time = time.time()
            call_info.duration_ms = (call_info.end_time - call_info.start_time) * 1000
            # 记录成功的工具调用
            self.metrics.increment_metric("tool_management", "successful_calls")
            # 更新平均执行时间
            current_avg = self.metrics.tool_management.get("average_execution_time", 0.0)
            total_successful = self.metrics.tool_management.get("successful_calls", 1)
            new_avg = (current_avg * (total_successful - 1) + call_info.duration_ms) / total_successful
            self.metrics.update_metric("tool_management", "average_execution_time", new_avg)
            self.logger.debug(f"工具调用执行成功: {call_id}, 耗时: {call_info.duration_ms:.2f}ms")
        except Exception as e:
            call_info.status = ToolCallStatus.ERROR
            call_info.error_message = str(e)
            call_info.end_time = time.time()
            if call_info.start_time:
                call_info.duration_ms = (call_info.end_time - call_info.start_time) * 1000
            # 记录失败的工具调用
            self.metrics.increment_metric("tool_management", "failed_calls")
            self.logger.error(f"工具调用执行失败: {call_id} - {e}")
        finally:
            # 记录总调用数
            self.metrics.increment_metric("tool_management", "total_calls")
            del self.active_calls[call_id]
            # 处理队列中的下一个调用
            await self._process_next_in_queue()

    async def _process_next_in_queue(self) -> None:
        """处理队列中的下一个调用"""
        if not self.call_queue or len(self.active_calls) >= self.max_concurrent_calls:
            return
        next_call = self.call_queue.pop(0)
        self.active_calls[next_call.call_id] = next_call
        asyncio.create_task(self._execute_tool_call(next_call.call_id))
