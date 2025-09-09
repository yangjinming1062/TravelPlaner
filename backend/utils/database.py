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

    __slots__ = ("session", "autocommit", "_manually_committed")
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
        self._manually_committed = False

    def __enter__(self):
        """
        with的进入方法，返回一个上下文对象。

        Returns:
            DatabaseManager: 数据库管理器实例，代理session操作
        """
        if self.session is None:
            self.session = self._create_session_with_retry()
        return self

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
                    logger.warning(f"数据库事务回滚：{exc_value}")
                elif self.autocommit and not self._manually_committed:
                    # 只有在未手动提交的情况下才进行自动提交
                    self._commit_with_retry()
                elif self.autocommit and self._manually_committed:
                    # 已手动提交，跳过自动提交
                    logger.debug("已手动提交事务，跳过自动提交")
            except Exception as e:
                logger.error(f"数据库事务处理失败: {e}")
                if self.session:
                    try:
                        self.session.rollback()
                    except Exception as rollback_error:
                        logger.error(f"回滚失败: {rollback_error}")
                # 只有在未手动提交的情况下才抛出异常
                if not self._manually_committed:
                    raise e
                else:
                    logger.warning("手动提交后的自动提交失败，但不影响外部使用")
            finally:
                if self.session:
                    try:
                        self.session.close()
                    except Exception as close_error:
                        logger.warning(f"关闭数据库连接失败: {close_error}")

    def _commit_with_retry(self, max_retries=2):
        """
        带重试机制的提交操作

        Args:
            max_retries (int): 最大重试次数
        """
        for attempt in range(max_retries + 1):
            try:
                self.session.commit()
                return
            except Exception as e:
                logger.warning(f"数据库提交失败 (尝试 {attempt + 1}/{max_retries + 1}): {e}")
                if attempt < max_retries:
                    # 检查连接是否有效，如果无效则重新创建会话
                    try:
                        self.session.rollback()
                        # 测试连接
                        self.session.execute(text("SELECT 1"))
                    except Exception:
                        # 连接无效，重新创建
                        logger.info("重新创建数据库会话")
                        self.session.close()
                        self.session = self._create_session_with_retry()
                    time.sleep(0.1 * (attempt + 1))  # 短暂延迟
                else:
                    self.session.rollback()
                    raise

    # 数据库操作代理方法
    def commit(self):
        """手动提交事务，设置已手动提交标记"""
        if self.session:
            self.session.commit()
            self._manually_committed = True
            logger.debug("手动提交事务成功")

    def rollback(self):
        """回滚事务"""
        if self.session:
            self.session.rollback()

    def add(self, instance):
        """添加实例到会话"""
        if self.session:
            return self.session.add(instance)

    def delete(self, instance):
        """从会话中删除实例"""
        if self.session:
            return self.session.delete(instance)

    def scalar(self, stmt):
        """执行查询并返回标量结果"""
        if self.session:
            return self.session.scalar(stmt)

    def execute(self, stmt, parameters=None):
        """执行SQL语句"""
        if self.session:
            if parameters:
                return self.session.execute(stmt, parameters)
            return self.session.execute(stmt)

    def get(self, entity, ident):
        """根据主键获取实体"""
        if self.session:
            return self.session.get(entity, ident)

    def query(self, *entities):
        """创建查询"""
        if self.session:
            return self.session.query(*entities)

    def expunge(self, instance):
        """从会话中分离实例"""
        if self.session:
            return self.session.expunge(instance)
