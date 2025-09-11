import asyncio

from config import CONFIG
from langchain.schema import BaseMessage
from langchain.schema import HumanMessage
from langchain.schema import SystemMessage
from langchain.schema.messages import get_buffer_string
from pydantic import BaseModel

from ..enums import *
from .model import create_llm_model


class CompressionResult(BaseModel):
    """压缩结果"""

    status: CompressionStatus
    original_token_count: int = 0
    compressed_token_count: int = 0
    original_message_count: int = 0
    compressed_message_count: int = 0
    compression_ratio: float = 0.0
    error_message: str | None = None
    summary_content: str | None = None
    compressed_messages: list[BaseMessage] | None = None

    class Config:
        arbitrary_types_allowed = True  # 允许BaseMessage类型


class ChatCompressor:
    """
    聊天压缩器

    实现智能聊天历史压缩：
    - 自动压缩触发机制
    - Token 计数和管理
    - 压缩策略优化
    - 压缩质量监控
    """

    def __init__(self, logger, metrics):
        """
        初始化聊天压缩器

        Args:
            logger: 日志记录器
            metrics: MetricsCollector实例，用于统计记录
        """
        self.logger = logger
        self.metrics = metrics
        # 创建独立的模型实例，避免与主LLMClient的历史记录冲突
        self._compression_model = create_llm_model()

    def count_tokens(self, messages: list[BaseMessage]) -> int:
        """
        计算消息列表的Token数量

        这是一个简化的实现，实际应该使用具体模型的tokenizer
        """
        try:
            # 将消息转换为字符串
            text = get_buffer_string(messages)
            # 简单估算：1 token ≈ 4 characters（对于英文）
            # 对于中文，1 token ≈ 1.5-2 characters
            # 这里使用保守估算
            estimated_tokens = len(text) // 3
            # 添加一些开销（系统消息、格式等）
            overhead = len(messages) * 10
            return estimated_tokens + overhead
        except Exception as e:
            self.logger.error(f"Token计数失败: {e}")
            # 返回一个保守的估算
            return len(messages) * 100

    def should_compress(self, messages: list[BaseMessage], force: bool = False) -> bool:
        """
        判断是否应该压缩

        Args:
            messages: 消息列表
            force: 是否强制压缩

        Returns:
            bool: 是否应该压缩
        """
        if force:
            return True
        if not CONFIG.compression_enable_auto:
            return False
        # 检查最少消息数
        if len(messages) < CONFIG.compression_min_messages:
            return False
        # 检查Token阈值
        token_threshold = CONFIG.compression_model_token_limit * CONFIG.compression_token_threshold_ratio
        if self.count_tokens(messages) > token_threshold:
            return True
        return False

    async def compress_messages(self, messages: list[BaseMessage], model_name: str, force: bool = False) -> CompressionResult:
        """
        压缩消息列表

        Args:
            messages: 要压缩的消息列表
            model_name: 模型名称
            force: 是否强制压缩

        Returns:
            CompressionResult: 压缩结果
        """
        # 初始化结果
        result = CompressionResult(status=CompressionStatus.NOOP, original_message_count=len(messages))
        try:
            # 检查是否应该压缩
            should_compress = self.should_compress(messages, force)
            if not should_compress and not force:
                return result
            # 计算原始Token数量
            result.original_token_count = self.count_tokens(messages)
            # 执行压缩
            compressed_messages, summary = await self._perform_compression(messages, model_name)
            # 计算压缩后Token数量
            result.compressed_token_count = self.count_tokens(compressed_messages)
            result.compressed_message_count = len(compressed_messages)
            result.summary_content = summary
            result.compressed_messages = compressed_messages  # 保存压缩后的消息
            # 计算压缩比例
            if result.original_token_count > 0:
                result.compression_ratio = result.compressed_token_count / result.original_token_count
            # 验证压缩质量
            if result.compression_ratio < CONFIG.compression_min_ratio:
                result.status = CompressionStatus.COMPRESSION_FAILED_INFLATED_TOKEN_COUNT
                result.error_message = f"压缩比例过低: {result.compression_ratio:.3f}"
            elif result.compression_ratio > CONFIG.compression_max_inflation:
                result.status = CompressionStatus.COMPRESSION_FAILED_INFLATED_TOKEN_COUNT
                result.error_message = f"压缩后Token数增加: {result.compression_ratio:.3f}"
            else:
                result.status = CompressionStatus.COMPRESSED
            self.logger.info(
                f"聊天压缩完成: {result.original_message_count}条消息 → {result.compressed_message_count}条消息, "
                f"{result.original_token_count}tokens → {result.compressed_token_count}tokens "
                f"({result.compression_ratio:.1%})"
            )
        except asyncio.TimeoutError:
            result.status = CompressionStatus.COMPRESSION_FAILED_TIMEOUT
            result.error_message = "聊天压缩超时 (当前压缩超时设置: 120秒)。"
            self.logger.error("聊天压缩超时")
        except Exception as e:
            result.status = CompressionStatus.COMPRESSION_FAILED_MODEL_ERROR
            result.error_message = str(e)
            self.logger.error(f"聊天压缩失败: {e}")
        return result

    async def _perform_compression(self, messages: list[BaseMessage], model_name: str) -> tuple[list[BaseMessage], str]:
        """
        执行实际的压缩操作

        Args:
            messages: 要压缩的消息列表
            model_name: 模型名称

        Returns:
            Tuple[list[BaseMessage], str]: (压缩后的消息, 摘要内容)
        """
        # 计算要保留和压缩的消息分割点
        preserve_count = int(len(messages) * CONFIG.compression_preserve_ratio)
        preserve_count = max(preserve_count, 2)  # 至少保留2条消息
        # 分离要压缩的消息和要保留的消息
        messages_to_compress = messages[:-preserve_count]
        messages_to_keep = messages[-preserve_count:]
        # 提取系统消息（如果需要保留）
        system_messages = []
        if CONFIG.compression_preserve_system:
            system_messages = [msg for msg in messages_to_compress if isinstance(msg, SystemMessage)]
            messages_to_compress = [msg for msg in messages_to_compress if not isinstance(msg, SystemMessage)]
        # 生成摘要
        summary = await self._generate_summary(messages_to_compress, model_name)
        # 构建压缩后的消息列表
        compressed_messages = []
        # 添加系统消息
        compressed_messages.extend(system_messages)
        # 添加摘要作为系统消息
        if summary:
            compressed_messages.append(SystemMessage(content=f"之前的对话摘要: {summary}"))
        # 添加保留的消息
        compressed_messages.extend(messages_to_keep)
        return compressed_messages, summary

    async def _generate_summary(self, messages: list[BaseMessage], model_name: str) -> str:
        """
        生成对话摘要

        Args:
            messages: 要摘要的消息列表
            model_name: 模型名称

        Returns:
            str: 摘要内容
        """
        if not messages or not self._compression_model:
            return "没有要摘要的对话历史"
        try:
            # 构建摘要提示
            conversation_text = get_buffer_string(messages)
            summary_prompt = f"""请提供以下对话的简洁摘要。 
关注关键点、决策和重要的上下文，以便将来参考。

要摘要的对话:
{conversation_text}
"""
            # 使用独立的模型实例，无历史记录干扰
            messages = [HumanMessage(content=summary_prompt)]
            # 添加超时控制，避免压缩操作无限等待
            response = await asyncio.wait_for(
                asyncio.get_event_loop().run_in_executor(None, self._compression_model.invoke, messages), timeout=120.0  # 120秒超时
            )
            summary_response = response.content if response and response.content else "生成摘要失败"
            return summary_response.strip()
        except Exception as e:
            self.logger.error(f"生成摘要失败: {e}")
            return f"生成摘要失败: {str(e)}"
