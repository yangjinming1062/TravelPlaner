from config import CONFIG
from langchain_openai import ChatOpenAI


def create_llm_model(model: str = CONFIG.llm_model, temperature: float = CONFIG.llm_temperature) -> ChatOpenAI:
    """创建LLM模型实例的工厂方法（无状态，无工具绑定）

    Args:
        model: 模型名称
        temperature: 温度参数

    Returns:
        ChatOpenAI: 原始模型实例
    """
    return ChatOpenAI(
        model=model,
        api_key=CONFIG.llm_api_key,
        base_url=CONFIG.llm_base_url,
        temperature=temperature,
        max_retries=CONFIG.llm_retry_count,
        timeout=CONFIG.llm_timeout,
    )
