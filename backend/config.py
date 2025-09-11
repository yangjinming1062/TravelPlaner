import os

import yaml
from pydantic import BaseModel
from pydantic import field_validator


def _load_raw_config():
    """
    加载配置，优先级顺序: 环境变量 > dev.env > .env > config.yaml
    """
    conf = {}

    # 1. 从 config.yaml 加载
    if os.path.exists("config.yaml"):
        with open("config.yaml", "r") as f:
            yaml_config = yaml.safe_load(f)
            if isinstance(yaml_config, dict):
                conf.update(yaml_config)

    def parse_env_file(file_path):
        if os.path.exists(file_path):
            with open(file_path, "r") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        key, value = line.split("=", 1)
                        conf[key.strip()] = value.strip()

    # 2. 从 .env 文件加载
    parse_env_file(".env")

    # 3. 从 dev.env 文件加载 (覆盖 .env)
    parse_env_file("dev.env")

    # 4. 从环境变量加载 (最高优先级)
    for key, value in os.environ.items():
        conf[key] = value

    # For consistency, convert all keys to lowercase to match Pydantic model fields
    return {k.lower(): v for k, v in conf.items()}


_RAW_CONFIG = _load_raw_config()


class Config(BaseModel):
    debug: bool

    # region 日志配置
    log_dir: str
    log_level: str
    log_info_name: str
    log_error_name: str
    log_stdout: bool
    log_format: str = "%(asctime)s|%(levelname)-8s|%(funcName)s:%(lineno)d - %(message)s"
    log_date_format: str = "%Y-%m-%d %H:%M:%S.%f"[:-3]  # 精确到毫秒
    # endregion

    # region DB
    db_pool_size: int
    db_pool_recycle: int
    db_echo: bool
    db_uri: str
    # endregion

    # region LLM
    llm_model: str
    llm_api_key: str
    llm_base_url: str
    llm_retry_count: int
    llm_timeout: int
    llm_temperature: float
    # endregion

    # region 会话压缩配置
    compression_token_threshold_ratio: float
    compression_preserve_ratio: float
    compression_min_messages: int
    compression_model_token_limit: int
    compression_enable_auto: bool
    compression_max_attempts: int
    compression_min_ratio: float
    compression_max_inflation: float
    compression_preserve_system: bool
    compression_preserve_tools: bool
    compression_semantic_preservation: bool
    # endregion

    # region 其他参数
    jwt_token_expire_days: int
    jwt_secret: str
    secret_key: bytes  # Stored as bytes

    @field_validator("secret_key", mode="before")
    @classmethod
    def encode_secret_key(cls, v):
        if isinstance(v, str):
            return v.encode("utf-8")
        return v

    # endregion

    class Config:
        extra = "ignore"


# Instantiate the config object.
# Pydantic will handle validation and type casting.
# If any required setting is missing from all sources, this will raise an error.
CONFIG = Config(**_RAW_CONFIG)


class CONSTANTS:
    """
    常量定义：常量类型_常量名称
    """

    FORMAT_DATE = "%Y-%m-%d %H:%M:%S"
    JWT_ALGORITHM = "HS256"
    ID_LENGTH = 24
