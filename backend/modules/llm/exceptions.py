class LLMBaseException(Exception):
    """LLM模块基础异常"""

    pass


class EmptyStreamError(LLMBaseException):
    """流式处理异常"""

    pass


class StructuredOutputError(LLMBaseException):
    """结构化输出异常"""

    pass


class SchemaValidationError(StructuredOutputError):
    """Schema验证异常"""

    pass
