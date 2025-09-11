import time
from typing import Any


class MetricsCollector:
    """统一的指标收集器

    为所有LLM组件提供统一的指标收集和管理功能，避免重复的统计信息收集。
    """

    def __init__(self, logger):
        """初始化指标收集器"""
        self.logger = logger
        # 各组件的指标数据
        self.history: dict[str, Any] = {}
        self.retry: dict[str, Any] = {}
        self.structured_output: dict[str, Any] = {}
        self.tool_management: dict[str, Any] = {}
        self.chat_compression: dict[str, Any] = {}
        self.request_manager: dict[str, Any] = {}
        self.stream_processing: dict[str, Any] = {}
        # 全局指标
        self.global_metrics: dict[str, Any] = {}
        # 初始化默认指标
        self._initialize_defaults()

    def _initialize_defaults(self):
        """初始化各组件的默认指标"""
        # 历史记录指标
        self.history = {
            "total_entries": 0,
            "valid_entries": 0,
            "invalid_entries": 0,
            "function_responses": 0,
            "tool_calls": 0,
            "comprehensive_count": 0,
            "curated_count": 0,
            "cache_valid": False,
        }
        # 重试机制指标
        self.retry = {
            "total_attempts": 0,
            "successful_retries": 0,
            "failed_retries": 0,
            "fallback_triggered": 0,
            "error_type_counts": {},
            "success_rate": 0.0,
        }
        # 结构化输出指标
        self.structured_output = {
            "total_requests": 0,
            "successful_extractions": 0,
            "failed_extractions": 0,
            "validation_failures": 0,
            "retry_attempts": 0,
            "success_rate": 0.0,
        }
        # 工具管理指标
        self.tool_management = {
            "total_calls": 0,
            "successful_calls": 0,
            "failed_calls": 0,
            "cancelled_calls": 0,
            "average_execution_time": 0.0,
            "active_calls_count": 0,
            "queued_calls_count": 0,
            "registered_tools": [],
        }
        # 聊天压缩指标
        self.chat_compression = {
            "total_compressions": 0,
            "successful_compressions": 0,
            "failed_compressions": 0,
            "total_tokens_saved": 0,
            "total_messages_compressed": 0,
            "average_compression_ratio": 0.0,
            "success_rate": 0.0,
            "trigger_counts": {},
        }
        # 请求管理器指标
        self.request_manager = {
            "total_requests": 0,
            "completed_requests": 0,
            "failed_requests": 0,
            "cancelled_requests": 0,
            "timeout_requests": 0,
            "current_active_requests": 0,
            "current_queue_size": 0,
            "peak_concurrent_requests": 0,
            "peak_queue_size": 0,
            "average_execution_time": 0.0,
            "average_queue_wait_time": 0.0,
            "total_execution_time": 0.0,
            "throughput_per_minute": 0.0,
            # 优先级分布
            "priority_urgent": 0,
            "priority_high": 0,
            "priority_normal": 0,
            "priority_low": 0,
        }
        # 流式处理指标
        self.stream_processing = {
            "total_streams": 0,
            "successful_streams": 0,
            "failed_streams": 0,
            "total_chunks_processed": 0,
            "average_stream_duration": 0.0,
        }
        # 全局指标
        self.global_metrics = {
            "client_start_time": time.time(),
            "total_chat_requests": 0,
            "total_successful_chats": 0,
            "total_failed_chats": 0,
            "average_response_time": 0.0,
        }

    def update_metric(self, component: str, metric_name: str, value: Any) -> None:
        """更新指定组件的指标

        Args:
            component: 组件名称 (history, retry, structured_output, global_metrics, etc.)
            metric_name: 指标名称
            value: 指标值
        """
        if hasattr(self, component):
            component_metrics = getattr(self, component)
            component_metrics[metric_name] = value
            self.logger.debug(f"更新指标: {component}.{metric_name} = {value}")
        else:
            self.logger.warning(f"未知组件: {component}")

    def increment_metric(self, component: str, metric_name: str, increment: int = 1) -> None:
        """增加指定组件的计数指标

        Args:
            component: 组件名称 (history, retry, structured_output, global_metrics, etc.)
            metric_name: 指标名称
            increment: 增加量
        """
        if hasattr(self, component):
            component_metrics = getattr(self, component)
            if metric_name in component_metrics:
                component_metrics[metric_name] += increment
            else:
                component_metrics[metric_name] = increment
            self.logger.debug(f"增加指标: {component}.{metric_name} += {increment}")
        else:
            self.logger.warning(f"未知组件: {component}")

    def get_all_metrics(self) -> dict[str, Any]:
        """获取所有组件的指标

        Returns:
            包含所有组件指标的字典
        """
        return {
            "history": self.history.copy(),
            "retry": self.retry.copy(),
            "structured_output": self.structured_output.copy(),
            "tool_management": self.tool_management.copy(),
            "chat_compression": self.chat_compression.copy(),
            "request_manager": self.request_manager.copy(),
            "stream_processing": self.stream_processing.copy(),
            "global_metrics": self.global_metrics.copy(),
        }

    def calculate_success_rate(self, component: str, success_metric: str, total_metric: str) -> float:
        """计算并更新成功率 - 内部使用，用于get_summary()"""
        if hasattr(self, component):
            component_metrics = getattr(self, component)
            total = component_metrics.get(total_metric, 0)
            success = component_metrics.get(success_metric, 0)
            if total > 0:
                rate = (success / total) * 100
                component_metrics["success_rate"] = round(rate, 2)
                return rate
            else:
                component_metrics["success_rate"] = 0.0
                return 0.0
        return 0.0

    def get_summary(self) -> dict[str, Any]:
        """获取指标摘要

        Returns:
            包含关键指标的摘要
        """
        return {
            "total_chat_requests": self.global_metrics.get("total_chat_requests", 0),
            "chat_success_rate": self.calculate_success_rate("global_metrics", "total_successful_chats", "total_chat_requests"),
            "compression_success_rate": self.chat_compression.get("success_rate", 0.0),
            "retry_success_rate": self.retry.get("success_rate", 0.0),
            "tool_calls": self.tool_management.get("total_calls", 0),
            "tokens_saved": self.chat_compression.get("total_tokens_saved", 0),
            "uptime_seconds": time.time() - self.global_metrics.get("client_start_time", time.time()),
        }
