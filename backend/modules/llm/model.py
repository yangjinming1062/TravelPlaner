import time

from config import CONFIG
from langchain.schema import AIMessage
from langchain.schema import HumanMessage
from langchain.schema import SystemMessage
from langchain.tools import BaseTool
from utils import *

from .utils import get_model


class LLMClient:
    """
    LangChain模型适配器，支持工具调用和结果解析
    """

    def __init__(self, system_prompt: str = "", logger=None) -> None:
        """
        初始化LangChain模型

        Args:
            system_prompt: 系统提示
        """
        self.system_prompt = system_prompt
        self.tools: list[BaseTool] = []
        # 创建底层模型
        self.model = get_model()
        self.logger = logger or get_logger(module="llm")

    def add_tools(self, tools: list[BaseTool]) -> None:
        """
        添加工具到模型

        Args:
            tools: 工具列表
        """
        self.tools = tools
        if self.tools:
            # 使用bind_tools创建工具增强的模型
            self.model = self.model.bind_tools(tools)
            self.logger.info(f"已为模型绑定 {len(tools)} 个工具")

    def create_messages(self, user_prompt: str):
        """
        创建消息列表

        Args:
            user_prompt: 用户提示

        Returns:
            包含系统提示和用户提示的消息列表
        """
        if CONFIG.llm == "claude":
            if "Provide a very concise summary of the README.md content" in user_prompt:
                return [HumanMessage(content=user_prompt)]
            else:
                return [SystemMessage(content=self.system_prompt), HumanMessage(content=user_prompt)]
        else:
            return [SystemMessage(content=self.system_prompt), HumanMessage(content=user_prompt)]

    def chat(self, user_prompt: str, config: dict = None) -> AIMessage:
        """
        与模型进行对话

        Args:
            user_prompt: 用户提示

        Returns:
            解析后的响应或原始响应文本
        """
        messages = self.create_messages(user_prompt)
        for i in range(CONFIG.llm_retry_count):
            try:
                model_name = getattr(self.model, "model_name", None) or getattr(self.model, "model", "unknown")
                self.logger.info(f"第 {i+1} 次发送请求到 {CONFIG.llm}-{model_name}")
                if response := self.model.invoke(messages, config):
                    # 检查是否为工具调用响应
                    if response.tool_calls:
                        self.logger.debug(f"检测到工具调用: {response.tool_calls}")
                        return response
                    return response
            except Exception as e:
                if "max input limit" in str(e):
                    self.logger.error(f"输入长度超过限制: {user_prompt}")
                    return None
                self.logger.error(f"第 {i+1} 次请求失败: {e}")
            # 重试前等待
            self.logger.error(f"第 {i+1} 次请求失败，{CONFIG.llm_retry_interval}秒后重试")
            time.sleep(CONFIG.llm_retry_interval)

    def clone(self) -> "LLMClient":
        """
        克隆当前模型实例

        Returns:
            一个新的LangChainModel实例，包含相同的系统提示和工具
        """
        clone = LLMClient(system_prompt=self.system_prompt)
        # 添加工具
        if self.tools:
            clone.add_tools(self.tools)
        return clone
