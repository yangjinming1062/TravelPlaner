from datetime import datetime

from sqlalchemy import DateTime
from sqlalchemy import JSON
from sqlalchemy import String
from sqlalchemy import TEXT
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm.properties import ColumnProperty


def get_timestamp():
    """
    数据库时间函数
    """
    return datetime.now().astimezone()


class ModelBase(DeclarativeBase):
    """
    提供公共方法的基类
    """

    __abstract__ = True
    # 尽量选择整型类型。因为整型类型的计算和查找效率远高于字符串。
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    @classmethod
    def get_columns(cls):
        """
        获取类中的全部数据库列。

        Returns:
            dict[str, ColumnProperty]: key是列名称，value是列定义
        """
        return {p.key: p for p in cls.__mapper__.iterate_properties if isinstance(p, ColumnProperty)}


class ModelTimeColumns:
    """
    时间列基类
    """

    __abstract__ = True

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_timestamp)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_timestamp, onupdate=get_timestamp)


class PlanningPreferenceColumns:
    """
    旅游偏好设置列基类
    包含所有与用户旅游偏好相关的字段定义
    """

    __abstract__ = True

    # 交通和住宿偏好
    preferred_transport_modes: Mapped[list] = mapped_column(JSON, default=[], comment="偏好交通方式")
    accommodation_level: Mapped[int] = mapped_column(default=3, comment="住宿标准 1-5星")

    # 活动和景点偏好
    activity_preferences: Mapped[list] = mapped_column(JSON, default=[], comment="活动类型偏好")
    attraction_categories: Mapped[list] = mapped_column(JSON, default=[], comment="景点类型偏好")
    travel_style: Mapped[str] = mapped_column(String(32), default="平衡型", comment="旅游风格：休闲型、平衡型、紧凑型")

    # 预算偏好
    budget_min: Mapped[int] = mapped_column(default=0, comment="最低预算")
    budget_max: Mapped[int] = mapped_column(default=0, comment="最高预算")
    budget_flexibility: Mapped[str] = mapped_column(
        String(32), default="性价比优先", comment="预算灵活性：节俭为主、性价比优先、舒适为主"
    )

    # 特殊需求
    dietary_restrictions: Mapped[list] = mapped_column(JSON, default=[], comment="饮食限制")
    group_travel_preference: Mapped[str] = mapped_column(
        TEXT, default="家庭", comment="出行类型：独行、情侣、家庭、朋友"
    )
    custom_preferences: Mapped[str] = mapped_column(TEXT, default="", comment="附加的需求")
