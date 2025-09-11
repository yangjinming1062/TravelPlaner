import threading
import time


class Singleton(type):
    """
    实现单例的基类
    """

    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]


class RateLimiter:
    """
    滑动时间窗口速率限制器

    注意：本类只管理请求时间戳，用于速率计算，不管理实际的请求对象或响应数据。
    清理操作只删除过期的时间戳记录，不会影响正在处理的请求或已完成的响应。

    工作原理：
    1. 记录每次请求的时间戳
    2. 定期清理超过时间窗口的旧时间戳
    3. 基于当前时间窗口内的时间戳数量判断是否允许新请求

    使用场景：防止API调用频率超过限制，避免触发速率限制错误
    """

    def __init__(self, max_requests_per_minute: int, time_window: float = 60.0):
        """
        初始化速率限制器

        Args:
            max_requests_per_minute: 在时间窗口内允许的最大请求数
            time_window: 时间窗口大小（秒），默认60秒（1分钟）
        """
        self.max_requests_per_minute = max_requests_per_minute
        self.time_window = time_window
        self.request_times: list[float] = []  # 存储请求时间戳（非请求对象）
        self._lock = threading.Lock()

    def can_proceed(self) -> bool:
        """
        检查是否可以继续发起新请求

        注意：本方法只检查和更新时间戳记录，不涉及实际的请求处理。
        清理操作只删除过期的时间戳，已发起的请求仍会正常处理和响应。

        Returns:
            bool: True表示可以发起新请求，False表示需要等待
        """
        with self._lock:
            now = time.time()

            # 清理超过时间窗口的时间戳记录（不是删除请求！）
            cutoff_time = now - self.time_window
            old_count = len(self.request_times)
            self.request_times = [t for t in self.request_times if t > cutoff_time]
            cleaned_count = old_count - len(self.request_times)

            # 清理日志（可选，用于调试）
            if cleaned_count > 0:
                # 注意：清理的是时间戳记录，不影响请求处理
                pass

            # 检查当前时间窗口内的请求数是否超过限制
            if len(self.request_times) >= self.max_requests_per_minute:
                return False

            # 记录当前请求的时间戳
            self.request_times.append(now)
            return True

    def wait_time(self) -> float:
        """
        获取需要等待的时间（秒）

        Returns:
            float: 需要等待的秒数，0表示可以立即发起请求
        """
        with self._lock:
            if len(self.request_times) < self.max_requests_per_minute:
                return 0.0

            # 计算最早时间戳何时过期
            earliest_request = min(self.request_times)
            wait_time = self.time_window - (time.time() - earliest_request)
            return max(0.0, wait_time)
