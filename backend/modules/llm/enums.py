from enum import Enum


class HistoryMode(Enum):
    """历史记录模式"""

    COMPREHENSIVE = "comprehensive"  # 完整模式：包含所有消息
    CURATED = "curated"  # 精选模式：只包含有效的对话轮次


class OutputFormat(Enum):
    """输出格式枚举"""

    JSON = "json"
    PYDANTIC = "pydantic"
    LIST = "list"


class ToolCallStatus(Enum):
    """工具调用状态枚举"""

    EXECUTING = "executing"  # 执行中
    SUCCESS = "success"  # 执行成功
    ERROR = "error"  # 执行错误
    CANCELLED = "cancelled"  # 已取消


class CompressionStatus(Enum):
    """压缩状态枚举"""

    NOOP = "noop"  # 无需压缩
    COMPRESSED = "compressed"  # 压缩完成
    COMPRESSION_FAILED_TOKEN_COUNT_ERROR = "compression_failed_token_count_error"
    COMPRESSION_FAILED_INFLATED_TOKEN_COUNT = "compression_failed_inflated_token_count"
    COMPRESSION_FAILED_TIMEOUT = "compression_failed_timeout"
    COMPRESSION_FAILED_MODEL_ERROR = "compression_failed_model_error"


class RequestPriority(Enum):
    """请求优先级"""

    LOW = 1
    NORMAL = 2
    HIGH = 3
    URGENT = 4


class RequestStatus(Enum):
    """请求状态"""

    QUEUED = "queued"  # 队列中
    EXECUTING = "executing"  # 执行中
    COMPLETED = "completed"  # 已完成
    FAILED = "failed"  # 失败
    TIMEOUT = "timeout"  # 超时
