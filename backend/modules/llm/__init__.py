import json
import time
from collections.abc import AsyncGenerator
from typing import Any

from config import CONFIG
from langchain.schema import AIMessage
from langchain.schema import HumanMessage
from langchain.schema import SystemMessage
from langchain.tools import BaseTool
from pydantic import BaseModel
from utils import *

from .core import *
from .enums import *
from .exceptions import *
from .schemas import *


class LLMClient:
    """
    LangChain模型适配器，支持工具调用和结果解析
    """

    def __init__(
        self,
        system_prompt: str = "",
        model_name: str = CONFIG.llm_model,
        temperature: float = CONFIG.llm_temperature,
        logger=None,
        max_history_size: int = 1000,
        max_concurrent_calls: int = 3,
        request_config: RequestConfig | None = None,
    ) -> None:
        """
        初始化客户端

        Args:
            system_prompt: 系统提示词
            logger: 日志记录器（可选，默认自动创建）
            max_history_size: 历史消息最大数量
            max_concurrent_calls: 最大并发调用数（工具管理器使用）
            request_config: RequestManager 统一配置（包含模型、重试、并发等所有配置）
        """
        self.system_prompt = system_prompt
        self.tools: list[BaseTool] = []
        self.logger = logger or get_logger("llm")
        self.metrics = MetricsCollector(self.logger)
        self.request_config = request_config or RequestConfig()
        self.model_name = model_name
        self.temperature = temperature
        self.request_manager = RequestManager(self.logger, self.metrics, self.request_config)
        self.history_manager = HistoryManager(self.logger, self.metrics, max_history_size=max_history_size, enable_validation=True, auto_cleanup=True)
        self.tool_manager = ToolManager(self.logger, self.metrics, max_concurrent_calls=max_concurrent_calls)
        self.chat_compressor = ChatCompressor(self.logger, self.metrics)
        self.model = create_llm_model(self.model_name, temperature=self.temperature)
        if self.system_prompt:
            system_msg = SystemMessage(content=self.system_prompt)
            self.history_manager.add_message(system_msg, MessageMetadata(timestamp=time.time(), model_name="system"))

    # region 工具管理

    def add_tools(self, tools: list[BaseTool]) -> None:
        """
        添加工具到模型

        Args:
            tools: 工具列表
        """
        if not self.tools:
            self.tools = []
        # 扩展工具列表而不是替换
        self.tools.extend(tools)
        # 添加到工具管理器
        for tool in tools:
            self.tool_manager.register_tool(tool)
        # 重新绑定所有工具到 LLMClient 的模型
        if self.tools and self.model:
            self.model = self.model.bind_tools(self.tools)
            self.logger.debug(f"已为模型绑定 {len(self.tools)} 个工具")

    def get_tools(self) -> list[BaseTool]:
        """
        获取已注册的工具列表

        Returns:
            list[BaseTool]: 工具列表
        """
        return self.tools.copy() if self.tools else []

    def remove_tool(self, tool_name: str) -> bool:
        """
        移除指定名称的工具

        Args:
            tool_name: 工具名称

        Returns:
            bool: 是否成功移除
        """
        if not self.tools:
            return False

        for i, tool in enumerate(self.tools):
            if tool.name == tool_name:
                # 重新绑定剩余工具到 LLMClient 的模型
                if self.tools and self.model:
                    self.model = self.model.bind_tools(self.tools)
                elif self.model:
                    # 如果没有工具了，重新创建原始模型
                    self.model = create_llm_model(self.model_name, temperature=self.temperature)
                self.logger.debug(f"移除工具: {tool_name}")
                return True

        self.logger.warning(f"未找到工具: {tool_name}")
        return False

    def clear_tools(self) -> None:
        """清空所有工具"""
        tool_count = len(self.tools) if self.tools else 0
        self.tools = []
        # 重新创建原始模型（无工具绑定）
        if self.model:
            self.model = create_llm_model(self.model_name, temperature=self.temperature)
        self.logger.debug(f"清空了 {tool_count} 个工具")

    def get_tool_by_name(self, tool_name: str) -> BaseTool | None:
        """
        按名称获取工具

        Args:
            tool_name: 工具名称

        Returns:
            BaseTool | None: 找到的工具，如果不存在则返回None
        """
        if not self.tools:
            return None

        for tool in self.tools:
            if tool.name == tool_name:
                return tool
        return None

    # endregion

    # region 历史记录

    def get_history(self, mode: HistoryMode = HistoryMode.CURATED, limit: int | None = None, include_metadata: bool = False):
        """获取对话历史记录

        Args:
            mode: 历史记录模式 (CURATED/COMPREHENSIVE)
            limit: 限制返回条目数量
            include_metadata: 是否包含元数据

        Returns:
            历史记录列表
        """
        return self.history_manager.get_history(mode=mode, limit=limit, include_metadata=include_metadata)

    def clear_history(self, keep_system_messages: bool = True):
        """清空历史记录

        Args:
            keep_system_messages: 是否保留系统消息
        """
        self.history_manager.clear_history(keep_system_messages)
        self.logger.debug("历史记录已清空")

    # endregion

    # region 核心交互

    async def create_messages(self, user_prompt: str, use_history: bool = True):
        """
        创建消息列表（集成智能压缩）

        Args:
            user_prompt: 用户提示
            use_history: 是否使用历史记录

        Returns:
            包含历史记录和当前用户提示的消息列表
        """
        messages = []

        if use_history and self.history_manager:
            # 获取更多历史记录用于压缩分析
            if context_messages := self.history_manager.get_history(mode=HistoryMode.CURATED, include_metadata=False):
                # 🔥 检查是否需要压缩
                should_compress = self.chat_compressor.should_compress(context_messages)
                if should_compress:
                    self.logger.info("触发聊天压缩：Token数量超过阈值")
                    try:
                        # 执行压缩
                        compression_result = await self.chat_compressor.compress_messages(context_messages, self.model_name)
                        # 更新指标
                        self.metrics.increment_metric("chat_compression", "total_compressions")
                        if compression_result.status == CompressionStatus.COMPRESSED:
                            # 压缩成功，使用压缩后的消息
                            messages.extend(compression_result.compressed_messages)
                            # 🔥 更新历史记录，避免重复压缩
                            self.history_manager.replace_with_compressed_messages(compression_result.compressed_messages)
                            self.metrics.increment_metric("chat_compression", "successful_compressions")
                            self.metrics.update_metric(
                                "chat_compression",
                                "total_tokens_saved",
                                compression_result.original_token_count - compression_result.compressed_token_count,
                            )
                            self.logger.debug(
                                f"聊天压缩成功: {compression_result.original_message_count}条→{compression_result.compressed_message_count}条消息"
                            )
                        else:
                            # 压缩失败，使用原始消息的截断版本
                            messages.extend(context_messages[-20:])  # 保留最后20条
                            self.metrics.increment_metric("chat_compression", "failed_compressions")
                            self.logger.warning(f"聊天压缩失败: {compression_result.error_message}")
                    except Exception as e:
                        # 压缩过程出错，使用原始消息
                        messages.extend(context_messages[-20:])
                        self.metrics.increment_metric("chat_compression", "failed_compressions")
                        self.logger.error(f"聊天压缩异常: {e}")
                else:
                    # 不需要压缩，使用原始消息（限制数量）
                    messages.extend(context_messages[-20:])
        else:
            # 传统方式：只添加系统提示
            if self.system_prompt:
                messages.append(SystemMessage(content=self.system_prompt))

        # 添加当前用户消息
        user_message = HumanMessage(content=user_prompt)
        messages.append(user_message)

        return messages

    async def chat(
        self,
        user_prompt: str,
        config: dict = None,
        save_history: bool = True,
        stream: bool = False,
        response_format: dict | type[BaseModel] | None = None,
        **kwargs,
    ) -> AIMessage | AsyncGenerator | dict | BaseModel:
        """
        统一的聊天方法 - 支持所有类型的请求

        Args:
            user_prompt: 用户输入
            config: 模型配置
            save_history: 是否保存到历史记录
            stream: 是否使用流式处理
            response_format: 可选的结构化输出格式
            **kwargs: 其他配置参数

        Returns:
            根据参数返回不同类型：
            - 标准模式: AIMessage
            - 流式模式: AsyncGenerator
            - 结构化模式: dict 或 BaseModel
        """
        # 输入验证
        if not user_prompt or not user_prompt.strip():
            raise ValueError("用户输入不能为空")

        start_time = time.time()
        messages = await self.create_messages(user_prompt)
        self.metrics.increment_metric("global_metrics", "total_chat_requests")

        # 添加用户消息到历史记录
        if save_history:
            user_message = HumanMessage(content=user_prompt)
            self.history_manager.add_message(user_message, MessageMetadata(timestamp=start_time))

        try:
            self.logger.debug(f"开始执行聊天请求: stream={stream}, response_format={response_format is not None}")
            self.logger.debug(f"消息数量: {len(messages)}, 模型: {self.model_name}")
            # 通过 RequestManager 统一的 request 方法调用模型
            if stream:
                # 流式请求
                async def stream_model_call():
                    """流式模型调用函数"""
                    self.logger.debug("执行流式模型调用")
                    try:
                        if response_format:
                            # 流式 + 结构化输出（需要特殊处理）
                            structured_model = self.model.with_structured_output(response_format)
                            result = structured_model.astream(messages, config or {})
                            self.logger.debug("流式结构化输出模型调用完成")
                            return result
                        else:
                            result = self.model.astream(messages, config or {})
                            self.logger.debug("流式普通模型调用完成")
                            return result
                    except Exception as e:
                        self.logger.exception(f"流式模型调用内部异常: {e}")
                        raise

                response = await self.request_manager.request(
                    stream_model_call,
                    priority=kwargs.get("priority", RequestPriority.NORMAL),
                    timeout=kwargs.get("timeout", 30.0),
                    metadata={"type": "stream", "user_prompt": user_prompt},
                )
            else:
                # 标准请求
                async def standard_model_call():
                    """标准模型调用函数"""
                    self.logger.debug("执行标准模型调用")
                    try:
                        if response_format:
                            # 结构化输出
                            self.logger.debug(f"使用结构化输出格式: {response_format}")
                            structured_model = self.model.with_structured_output(response_format)
                            result = structured_model.invoke(messages, config or {})
                            self.logger.debug(f"标准结构化输出模型调用完成, 响应类型: {type(result)}")
                            return result
                        else:
                            result = self.model.invoke(messages, config or {})
                            self.logger.debug(f"标准普通模型调用完成, 响应类型: {type(result)}")
                            return result
                    except Exception as e:
                        self.logger.exception(f"标准模型调用内部异常: {e}")
                        raise

                self.logger.debug("通过RequestManager提交标准请求")
                response = await self.request_manager.request(
                    standard_model_call,
                    priority=kwargs.get("priority", RequestPriority.NORMAL),
                    timeout=kwargs.get("timeout", 30.0),
                    metadata={"type": "standard", "user_prompt": user_prompt},
                )

            self.logger.debug(f"RequestManager返回响应: {type(response)}")

            # 处理成功响应
            processing_time = time.time() - start_time
            # 更新成功指标
            self.metrics.increment_metric("global_metrics", "total_successful_chats")
            current_avg = self.metrics.global_metrics.get("average_response_time", 0.0)
            total_successful = self.metrics.global_metrics.get("total_successful_chats", 1)
            if total_successful > 0:
                new_avg = (current_avg * (total_successful - 1) + processing_time) / total_successful
                self.metrics.update_metric("global_metrics", "average_response_time", new_avg)

            # 确保响应不为None
            if response is None:
                raise ValueError("模型返回了None响应，可能是API调用失败")

            # 保存响应到历史记录（非流式）
            if save_history and not stream:
                response_metadata = MessageMetadata(timestamp=time.time(), model_name=self.model_name, processing_time=processing_time)

                # 处理结构化输出 - 转换为AIMessage以便历史记录处理
                if response_format and not hasattr(response, "content"):
                    # 结构化输出：将其转换为AIMessage
                    if hasattr(response, "model_dump"):
                        # Pydantic模型
                        content_str = json.dumps(response.model_dump(), ensure_ascii=False, indent=2)
                    elif isinstance(response, dict):
                        # 字典格式
                        content_str = json.dumps(response, ensure_ascii=False, indent=2)
                    else:
                        # 其他类型
                        content_str = str(response)

                    ai_message = AIMessage(content=f"[结构化输出]\n{content_str}")
                    response_metadata.additional_data["structured_output"] = True
                    response_metadata.additional_data["original_format"] = str(type(response).__name__)
                    self.history_manager.add_message(ai_message, response_metadata)
                    self.logger.debug(f"保存结构化输出到历史记录: {type(response).__name__}")
                else:
                    # 普通响应
                    # 检查是否为工具调用响应
                    if hasattr(response, "tool_calls") and response.tool_calls:
                        self.logger.debug(f"检测到工具调用: {response.tool_calls}")
                        response_metadata.additional_data["has_tool_calls"] = True
                    self.history_manager.add_message(response, response_metadata)

            self.logger.debug(f"聊天请求完成，处理时间: {processing_time:.2f}秒")
            return response
        except Exception as e:
            self.logger.exception(f"聊天请求失败: {e}")
            self.logger.debug(f"异常详情 - 类型: {type(e)}, 消息: {str(e)}")
            # 更新失败指标
            self.metrics.increment_metric("global_metrics", "total_failed_chats")
            # 记录错误到历史
            if save_history:
                error_metadata = MessageMetadata(
                    timestamp=time.time(),
                    error_info={"error": str(e), "error_type": str(type(e))},
                    validation_status="invalid",
                )
                error_response = AIMessage(content="[ERROR: Request failed]")
                self.history_manager.add_message(error_response, error_metadata)
            # 重新抛出异常
            raise

    # endregion

    def get_system_status(self) -> dict[str, Any]:
        """获取系统整体状态信息"""
        return {
            "current_model": self.model_name,
            "tools_count": len(self.tools) if self.tools else 0,
            "system_prompt_length": len(self.system_prompt) if self.system_prompt else 0,
            "metrics": self.metrics.get_all_metrics(),
            "summary": self.metrics.get_summary(),
            "queue_info": self.request_manager.get_queue_info(),
        }


__all__ = ["LLMClient", "RequestConfig"]
