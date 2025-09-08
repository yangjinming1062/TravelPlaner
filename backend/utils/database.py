import logging
import time

from config import CONFIG
from sqlalchemy import create_engine
from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.pool import QueuePool

_ENGINE_PARAMS = {
    "pool_size": CONFIG.db_pool_size,
    "pool_recycle": CONFIG.db_pool_recycle,
    "echo": CONFIG.db_echo,
    "poolclass": QueuePool,
    "pool_pre_ping": True,  # 在使用连接前检查连接是否有效
    "pool_reset_on_return": "commit",  # 连接返回池时重置状态
    "max_overflow": 30,  # 连接池溢出的最大连接数
    "pool_timeout": 60,  # 获取连接的超时时间
}
_DB = create_engine(CONFIG.db_uri, **_ENGINE_PARAMS)

logger = logging.getLogger(__name__)


class DatabaseManager:
    """
    数据库连接管理器
    PS: 统一实现数据库的连接创建、关闭、提交回滚等逻辑
    """

    __slots__ = ("session", "autocommit", "type")
    session: Session | None

    def __init__(self, session=None):
        """
        请使用with上下文语法创建数据库连接。

        Args:
            session (Session | None): 默认None，如果传递了非None的数据库链接则复用该链接
        """
        if session is None:
            self.autocommit = True
            self.session = None  # 延迟创建session，在进入上下文的时候根据是with还是async with选择不同的连接引擎
        else:
            self.autocommit = False
            self.session = session

    def __enter__(self):
        """
        with的进入方法，返回一个上下文对象。

        Returns:
            Session: 数据库连接
        """
        if self.session is None:
            self.session = self._create_session_with_retry()
        return self.session

    def _create_session_with_retry(self, max_retries=3, retry_delay=1):
        """
        创建数据库会话，带重试机制

        Args:
            max_retries (int): 最大重试次数
            retry_delay (int): 重试延迟（秒）

        Returns:
            Session: 数据库会话

        Raises:
            Exception: 重试失败后抛出最后一个异常
        """
        for attempt in range(max_retries + 1):
            try:
                session = Session(_DB)
                # 测试连接是否有效
                session.execute(text("SELECT 1"))
                return session
            except Exception as e:
                logger.warning(f"数据库连接失败 (尝试 {attempt + 1}/{max_retries + 1}): {e}")
                if attempt < max_retries:
                    time.sleep(retry_delay)
                    retry_delay *= 2  # 指数退避
                else:
                    logger.error(f"数据库连接失败，已达到最大重试次数: {e}")
                    raise

    def __exit__(self, exc_type, exc_value, traceback):
        """
        当离开上下文时关闭数据库连接。

        Args:
            exc_type (type): The type of the exception that occurred, if any.
            exc_value (Exception): The exception object that was raised, if any.
            traceback (traceback): The traceback object that contains information about the exception, if any.
        """
        if self.session:
            try:
                if exc_value:
                    self.session.rollback()
                if self.autocommit:
                    self.session.commit()
            except Exception as e:
                logger.error(f"数据库事务处理失败: {e}")
                if self.session:
                    self.session.rollback()
            finally:
                if self.session:
                    self.session.close()
