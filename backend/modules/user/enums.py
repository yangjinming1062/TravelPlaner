from enum import Enum


class UserStatusEnum(Enum):
    """
    用户状态
    """

    ACTIVE = "active"
    FORBIDDEN = "forbidden"
