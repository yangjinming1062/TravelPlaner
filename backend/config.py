import os

import yaml
from cryptography.fernet import Fernet
from pydantic import BaseModel
from pydantic import Field


def get_env(name, default=None):
    """
    获取变量值，优先级：环境变量 > .env文件 > yaml文件 > 默认值

    Args:
        name: 变量名称
        default: 默认值

    Returns:

    """

    def load_env_file(file_path):
        tmp = {}
        if os.path.exists(file_path):
            with open(file_path, "r") as file:
                for line in file:
                    if line.strip() and not line.startswith("#"):
                        key, value = line.strip().split("=", 1)
                        tmp[key.strip()] = value.strip()
        return tmp

    def load_yaml_file(file_path):
        tmp = {}
        if os.path.exists(file_path):
            with open(file_path, "r") as file:
                tmp = yaml.safe_load(file)
        return tmp

    def _get_env():
        return (
            os.getenv(name)
            or _ENV_FILE_CONFIG.get(name)
            or _YAML_FILE_CONFIG.get(name)
            or _YAML_FILE_CONFIG.get(name.lower())
            or default
        )

    _ENV_FILE_CONFIG = {}
    _YAML_FILE_CONFIG = {}

    # 注入env文件
    _ENV_FILE_CONFIG.update(load_env_file(".env"))
    _ENV_FILE_CONFIG.update(load_env_file("dev.env"))
    # 注入yaml文件
    _YAML_FILE_CONFIG.update(load_yaml_file("config.yaml"))

    return _get_env()


class Config(BaseModel):
    debug: bool = bool(get_env("DEBUG", True))
    # region 日志配置
    log_dir: str = get_env("LOG_DIR")
    log_level: str = get_env("LOG_LEVEL", "INFO")
    log_info_name: str = get_env("LOG_INFO_NAME", "info.log")
    log_error_name: str = get_env("LOG_ERROR_NAME", "error.log")
    log_stdout: bool = bool(get_env("LOG_STDOUT", False))
    # 日志格式 - 使用logging标准格式
    log_format: str = "%(asctime)s|%(levelname)-8s|%(funcName)s:%(lineno)d - %(message)s"
    log_date_format: str = "%Y-%m-%d %H:%M:%S.%f"[:-3]  # 精确到毫秒
    # endregion

    # region DB
    db_pool_size: int = Field(
        default=int(get_env("DB_POOL_SIZE", 150)),
        description="数据库连接池大小",
    )
    db_pool_recycle: int = Field(
        default=int(get_env("DB_POOL_RECYCLE", 300)),
        description="数据库连接池回收时间",
    )
    db_echo: bool = Field(
        default=bool(get_env("DB_ECHO", False)),
        description="是否打印SQL语句",
    )
    db_uri: str = Field(
        default=get_env("DB_URI", "postgresql+psycopg://admin:IDoNotKnow@db:5432/app"), description="数据库URI"
    )
    # endregion

    # region LLM
    llm_model: str = Field(
        default=get_env("LLM_MODEL", "gpt-4o-mini"),
        description="模型",
    )
    llm_api_key: str = Field(
        default=get_env("LLM_API_KEY", ""),
        description="API密钥",
    )
    llm_base_url: str = Field(
        default=get_env("LLM_BASE_URL", "https://api.openai.com/v1"),
        description="基础URL",
    )
    llm_retry_count: int = Field(
        default=int(get_env("LLM_RETRY_COUNT", 3)),
        description="重试次数",
    )
    llm_timeout: int = Field(
        default=int(get_env("LLM_TIMEOUT", 10)),
        description="超时时间",
    )
    llm_temperature: float = Field(
        default=float(get_env("LLM_TEMPERATURE", 0.5)),
        description="默认温度",
    )
    # endregion

    # region 其他参数
    jwt_token_expire_days: int = Field(
        default=int(get_env("JWT_TOKEN_EXPIRE_DAYS", 30)),
        description="JWT令牌过期时间",
    )
    jwt_secret: str = Field(
        default=get_env("JWT_SECRET", "TravelPlanner-Secret-Key"),
        description="JWT密钥",
    )
    # Secret ※注意：请不要在生产环境中使用默认的随机密钥
    secret_key: bytes = get_env("SECRET_KEY").encode() if get_env("SECRET_KEY") else Fernet.generate_key()
    # endregion


class CONSTANTS:
    """
    常量定义：常量类型_常量名称
    """

    FORMAT_DATE = "%Y-%m-%d %H:%M:%S"
    JWT_ALGORITHM = "HS256"
    ID_LENGTH = 24


CONFIG = Config()
