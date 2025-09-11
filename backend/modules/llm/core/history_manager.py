import copy
import json
import time

from langchain.schema import BaseMessage
from pydantic import BaseModel

from ..enums import HistoryMode
from ..schemas import MessageMetadata


class HistoryEntry(BaseModel):
    """历史记录条目"""

    message: BaseMessage
    metadata: MessageMetadata
    entry_id: str
    parent_id: str | None = None  # 用于构建对话树

    class Config:
        arbitrary_types_allowed = True  # 允许BaseMessage类型


class ContentValidator:
    """内容验证器"""

    @staticmethod
    def is_valid_message(message: BaseMessage) -> bool:
        """验证消息是否有效"""
        if not message:
            return False
        # 检查消息内容
        if not hasattr(message, "content") or not message.content:
            return False
        # 检查内容是否为空字符串
        if isinstance(message.content, str):
            return bool(message.content.strip())
        # 检查列表类型的内容
        if isinstance(message.content, list):
            return len(message.content) > 0 and any(item for item in message.content if item)
        return True

    @staticmethod
    def is_function_response(message: BaseMessage) -> bool:
        """检查是否为函数响应消息"""
        if hasattr(message, "additional_kwargs"):
            kwargs = message.additional_kwargs
            return "function_call" in kwargs or "tool_calls" in kwargs
        return False

    @staticmethod
    def has_tool_calls(message: BaseMessage) -> bool:
        """检查是否包含工具调用"""
        if hasattr(message, "tool_calls"):
            return bool(message.tool_calls)
        if hasattr(message, "additional_kwargs"):
            return "tool_calls" in message.additional_kwargs
        return False


class HistoryManager:
    """历史记录管理器

    负责管理对话历史记录，包括：
    - 存储和检索历史记录
    - 支持curated/comprehensive双模式
    - 内容验证和过滤
    - 历史记录清理和压缩
    """

    def __init__(self, logger, metrics, max_history_size: int = 1000, enable_validation: bool = True, auto_cleanup: bool = True):
        """初始化历史记录管理器

        Args:
            logger: 日志记录器实例
            metrics: MetricsCollector实例，用于统计记录
            max_history_size: 最大历史记录数量
            enable_validation: 是否启用内容验证
            auto_cleanup: 是否自动清理无效记录
        """
        self.logger = logger
        self.metrics = metrics
        self.max_history_size = max_history_size
        self.enable_validation = enable_validation
        self.auto_cleanup = auto_cleanup
        # 历史记录存储
        self._comprehensive_history: list[HistoryEntry] = []
        self._curated_cache: list[HistoryEntry] | None = None
        self._cache_valid = False

    def add_message(self, message: BaseMessage, metadata: MessageMetadata | None = None, parent_id: str | None = None) -> str:
        """添加消息到历史记录

        Args:
            message: 要添加的消息
            metadata: 消息元数据
            parent_id: 父消息ID（用于构建对话树）

        Returns:
            str: 消息条目ID
        """
        # 生成条目ID
        entry_id = f"msg_{len(self._comprehensive_history)}_{int(time.time())}"
        # 创建或更新元数据
        if metadata is None:
            metadata = MessageMetadata(timestamp=time.time())
        # 内容验证
        if self.enable_validation:
            if ContentValidator.is_valid_message(message):
                metadata.validation_status = "valid"
                self.metrics.increment_metric("history", "valid_entries")
            elif not message.content:
                metadata.validation_status = "empty"
                self.metrics.increment_metric("history", "invalid_entries")
            else:
                metadata.validation_status = "invalid"
                self.metrics.increment_metric("history", "invalid_entries")
        # 检查特殊消息类型
        if ContentValidator.is_function_response(message):
            self.metrics.increment_metric("history", "function_responses")
        if ContentValidator.has_tool_calls(message):
            self.metrics.increment_metric("history", "tool_calls")
        # 创建历史条目
        entry = HistoryEntry(message=copy.deepcopy(message), metadata=metadata, entry_id=entry_id, parent_id=parent_id)
        # 添加到综合历史记录
        self._comprehensive_history.append(entry)
        self.metrics.increment_metric("history", "total_entries")
        # 使缓存失效
        self._invalidate_cache()
        # 自动清理
        if self.auto_cleanup and len(self._comprehensive_history) > self.max_history_size:
            self._cleanup_old_entries()
        self.logger.debug(f"添加历史条目: {entry_id}, 验证状态: {metadata.validation_status}")
        return entry_id

    def get_history(
        self, mode: HistoryMode = HistoryMode.COMPREHENSIVE, limit: int | None = None, include_metadata: bool = False
    ) -> list[BaseMessage | HistoryEntry]:
        """获取历史记录

        Args:
            mode: 历史记录模式（comprehensive/curated）
            limit: 限制返回的条目数量
            include_metadata: 是否包含元数据

        Returns:
            历史记录列表
        """
        if mode == HistoryMode.COMPREHENSIVE:
            entries = self._comprehensive_history
        else:
            entries = self._get_curated_history()
        # 应用限制
        if limit:
            entries = entries[-limit:]
        # 返回格式
        if include_metadata:
            return [copy.deepcopy(entry) for entry in entries]
        else:
            return [copy.deepcopy(entry.message) for entry in entries]

    def _get_curated_history(self) -> list[HistoryEntry]:
        """获取筛选后的历史记录（只包含有效内容）"""
        if self._cache_valid and self._curated_cache is not None:
            return self._curated_cache
        curated_entries = []
        i = 0
        while i < len(self._comprehensive_history):
            entry = self._comprehensive_history[i]
            if entry.message.type == "human":
                # 用户消息总是保留
                curated_entries.append(entry)
                i += 1
            else:
                # 处理模型输出序列
                model_sequence = []
                is_valid_sequence = True
                # 收集连续的模型消息
                while i < len(self._comprehensive_history) and self._comprehensive_history[i].message.type != "human":
                    model_entry = self._comprehensive_history[i]
                    model_sequence.append(model_entry)
                    # 检查序列有效性
                    if self.enable_validation and model_entry.metadata.validation_status != "valid":
                        is_valid_sequence = False
                    i += 1
                # 只有当整个模型序列都有效时才添加
                if is_valid_sequence:
                    curated_entries.extend(model_sequence)
        # 更新缓存
        self._curated_cache = curated_entries
        self._cache_valid = True
        return curated_entries

    def clear_history(self, keep_system_messages: bool = True):
        """清空历史记录

        Args:
            keep_system_messages: 是否保留系统消息
        """
        if keep_system_messages:
            # 只保留系统消息
            system_entries = [entry for entry in self._comprehensive_history if entry.message.type == "system"]
            self._comprehensive_history = system_entries
        else:
            self._comprehensive_history.clear()
        self._invalidate_cache()
        self.logger.debug("历史记录已清空")

    def replace_with_compressed_messages(self, compressed_messages: list[BaseMessage]) -> None:
        """用压缩后的消息替换当前历史记录

        Args:
            compressed_messages: 压缩后的消息列表
        """
        # 清空历史记录，保留系统消息
        self.clear_history(keep_system_messages=True)
        # 添加压缩后的消息
        for message in compressed_messages:
            metadata = MessageMetadata(timestamp=time.time(), validation_status="valid", additional_data={"compressed": True})
            self.add_message(message, metadata)
        self.logger.debug(f"历史记录已替换为压缩版本，包含 {len(compressed_messages)} 条消息")

    def find_entries_by_content(self, search_text: str, mode: HistoryMode = HistoryMode.COMPREHENSIVE) -> list[HistoryEntry]:
        """根据内容搜索历史条目

        Args:
            search_text: 搜索文本
            mode: 搜索模式

        Returns:
            匹配的历史条目列表
        """
        entries = self._comprehensive_history if mode == HistoryMode.COMPREHENSIVE else self._get_curated_history()
        matching_entries = []
        search_lower = search_text.lower()
        for entry in entries:
            content = str(entry.message.content).lower()
            if search_lower in content:
                matching_entries.append(copy.deepcopy(entry))
        return matching_entries

    def export_history(self, mode: HistoryMode = HistoryMode.COMPREHENSIVE, format: str = "json") -> str:
        """导出历史记录

        Args:
            mode: 导出模式
            format: 导出格式（json/txt）

        Returns:
            导出的数据字符串
        """
        entries = self.get_history(mode=mode, include_metadata=True)
        if format == "json":
            # 转换为可序列化的格式
            serializable_data = []
            for entry in entries:
                data = {
                    "entry_id": entry.entry_id,
                    "parent_id": entry.parent_id,
                    "message": {
                        "type": entry.message.type,
                        "content": entry.message.content,
                        "additional_kwargs": getattr(entry.message, "additional_kwargs", {}),
                    },
                    "metadata": {
                        "timestamp": entry.metadata.timestamp,
                        "model_name": entry.metadata.model_name,
                        "token_count": entry.metadata.token_count,
                        "processing_time": entry.metadata.processing_time,
                        "validation_status": entry.metadata.validation_status,
                        "additional_data": entry.metadata.additional_data,
                    },
                }
                serializable_data.append(data)
            return json.dumps(serializable_data, indent=2, ensure_ascii=False)
        elif format == "txt":
            # 文本格式导出
            lines = []
            for entry in entries:
                lines.append(f"[{entry.message.type.upper()}] {entry.metadata.timestamp}")
                lines.append(f"Content: {entry.message.content}")
                lines.append(f"Status: {entry.metadata.validation_status}")
                lines.append("-" * 50)
            return "\n".join(lines)
        else:
            raise ValueError(f"Unsupported export format: {format}")

    def _cleanup_old_entries(self):
        """清理旧的历史条目"""
        if len(self._comprehensive_history) <= self.max_history_size:
            return
        # 保留最新的条目
        remove_count = len(self._comprehensive_history) - self.max_history_size
        self._comprehensive_history = self._comprehensive_history[remove_count:]
        self._invalidate_cache()
        self.logger.debug(f"清理了 {remove_count} 个旧的历史条目")

    def _invalidate_cache(self):
        """使缓存失效"""
        self._cache_valid = False
        self._curated_cache = None
