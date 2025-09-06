from common.model import *
from sqlalchemy import JSON
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from utils import generate_key

from .enums import *


class User(ModelBase, ModelTimeColumns, PlanningPreferenceColumns):
    """
    用户信息 - 包含基本信息和旅游偏好设置
    """

    __tablename__ = "user"

    id: Mapped[str] = mapped_column(primary_key=True, default=generate_key)
    email: Mapped[str] = mapped_column(String(128), default="")
    phone: Mapped[str] = mapped_column(String(16))
    username: Mapped[str] = mapped_column(String(128))
    password: Mapped[str] = mapped_column(String(256))
    status: Mapped[UserStatusEnum] = mapped_column(default=UserStatusEnum.ACTIVE)
    # 个人基本信息
    nickname: Mapped[str] = mapped_column(String(256), default="", comment="昵称")
    gender: Mapped[str] = mapped_column(String(16), default="unknown", comment="性别：male, female, unknown")
    # 用户特有的偏好设置
    display_language: Mapped[str] = mapped_column(String(16), default="chinese", comment="规划结果展示语言")
