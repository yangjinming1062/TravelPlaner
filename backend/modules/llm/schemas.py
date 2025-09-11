import time

from pydantic import BaseModel
from pydantic import Field

from .enums import *


class MessageMetadata(BaseModel):
    """消息元数据"""

    timestamp: float = Field(default_factory=time.time)
    model_name: str | None = None
    processing_time: float | None = None
    token_count: int | None = None
    error_info: dict | None = None
    validation_status: str = "valid"
    additional_data: dict = Field(default_factory=dict)


class RequestConfig(BaseModel):
    """RequestManager 统一配置"""

    # 并发限制
    max_concurrent_requests: int = 5  # 最大并发请求数
    max_queue_size: int = 100  # 最大队列大小
    max_requests_per_minute: int = 60  # 每分钟最大请求数
    # 超时配置
    default_timeout: float = 30.0  # 默认超时时间
    # 请求重试配置
    enable_auto_retry: bool = True  # 是否启用自动重试
    max_retry_attempts: int = 3  # 最大重试次数
    retry_delay: float = 1.0  # 重试延迟
