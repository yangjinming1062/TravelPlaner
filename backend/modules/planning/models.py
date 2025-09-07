from datetime import datetime

from common.model import *
from sqlalchemy import Boolean
from sqlalchemy import Date
from sqlalchemy import ForeignKey
from sqlalchemy import JSON
from sqlalchemy import TEXT
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from utils import generate_key


class PlanningTaskBase(ModelBase, ModelTimeColumns):
    __abstract__ = True

    user_id: Mapped[str] = mapped_column(ForeignKey("user.id"))
    title: Mapped[str] = mapped_column(String(128), default="", comment="规划标题")
    source: Mapped[str] = mapped_column(String(128), comment="出发地")
    departure_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), comment="出发日期")
    return_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), comment="返程日期")
    group_size: Mapped[int] = mapped_column(default=1, comment="出行人数")
    transport_mode: Mapped[str] = mapped_column(String(16), default="自驾", comment="主要交通方式")
    status: Mapped[str] = mapped_column(
        String(16), default="pending", comment="规划状态: pending, processing, completed, failed"
    )


class PlanningResultBase(ModelBase, ModelTimeColumns):
    __abstract__ = True

    plan_title: Mapped[str] = mapped_column(String(128), comment="方案标题")
    plan_description: Mapped[str] = mapped_column(TEXT, default="", comment="方案描述")
    total_days: Mapped[int] = mapped_column(comment="总天数")
    estimated_budget: Mapped[int] = mapped_column(default=0, comment="预估费用")
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False, comment="是否收藏")


# region 单一目的地模式


class PlanningSingleTask(PlanningTaskBase, PlanningPreferenceColumns):
    """
    单一目的地规划 - 任务记录表
    """

    __tablename__ = "planning_single_task"
    target: Mapped[str] = mapped_column(String(128), comment="目的地")


class PlanningSingleResult(PlanningResultBase):
    """
    单一目的地规划 - 任务结果表
    """

    __tablename__ = "planning_single_result"

    task_id: Mapped[str] = mapped_column(ForeignKey("planning_single_task.id"))
    daily_plan: Mapped[list] = mapped_column(JSON, default=[], comment="每日行程")
    highlights: Mapped[list] = mapped_column(JSON, default=[], comment="行程亮点")
    tips: Mapped[list] = mapped_column(JSON, default=[], comment="旅游贴士")


# endregion

# region 沿途游玩模式


class PlanningRouteTask(PlanningTaskBase, PlanningPreferenceColumns):
    """
    沿途游玩规划 - 任务记录表
    """

    __tablename__ = "planning_route_task"

    target: Mapped[str] = mapped_column(String(128), comment="目的地")
    max_stopovers: Mapped[int] = mapped_column(default=3, comment="最多停留次数：沿途最多可以停留几次")
    max_stopover_duration: Mapped[int] = mapped_column(
        default=2, comment="计划停留时长：每个途径点最多游玩多久（小时）"
    )
    route_preference: Mapped[str] = mapped_column(
        default="平衡", comment="路线偏好：速度优先, 风景优先, 经济优先, 平衡"
    )
    max_detour_distance: Mapped[int] = mapped_column(default=100, comment="最大绕行距离(km)")
    preferred_stop_types: Mapped[list] = mapped_column(JSON, default=[], comment="偏好停留类型")


class PlanningRouteResult(PlanningResultBase):
    """
    沿途游玩规划 - 任务结果表
    """

    __tablename__ = "planning_route_result"

    task_id: Mapped[str] = mapped_column(ForeignKey("planning_route_task.id"))
    daily_plan: Mapped[list] = mapped_column(JSON, default=[], comment="每日行程")
    route_plan: Mapped[list] = mapped_column(JSON, default=[], comment="详细路线信息")
    waypoints: Mapped[list] = mapped_column(JSON, default=[], comment="途经点列表")


# endregion

# region 多节点模式


class PlanningMultiTask(PlanningTaskBase, PlanningPreferenceColumns):
    """
    多节点规划 - 任务记录表
    """

    __tablename__ = "planning_multi_task"

    nodes_schedule: Mapped[list] = mapped_column(JSON, default=[], comment="节点信息 - 详细的时间和城市安排")


class PlanningMultiResult(PlanningResultBase):
    """
    多节点规划 - 任务结果表
    """

    __tablename__ = "planning_multi_result"

    id: Mapped[str] = mapped_column(primary_key=True, default=generate_key)
    task_id: Mapped[str] = mapped_column(ForeignKey("planning_multi_task.id"))
    nodes_details: Mapped[list] = mapped_column(JSON, default=[], comment="节点详细安排")
    route_plan: Mapped[list] = mapped_column(JSON, default=[], comment="节点间的交通安排")
    highlights: Mapped[list] = mapped_column(JSON, default=[], comment="行程亮点")


# endregion

# region 智能推荐模式


class PlanningSmartTask(PlanningTaskBase, PlanningPreferenceColumns):
    """
    智能推荐 - 任务记录表
    """

    __tablename__ = "planning_smart_task"

    max_travel_distance: Mapped[int] = mapped_column(default=1000, comment="最大出行距离(km)")
    preferred_environment: Mapped[str] = mapped_column(default="", comment="环境偏好")
    avoid_regions: Mapped[list] = mapped_column(JSON, default=[], comment="避免的地区")


class PlanningSmartResult(PlanningResultBase):
    """
    智能推荐 - 任务结果表
    """

    __tablename__ = "planning_smart_result"

    task_id: Mapped[str] = mapped_column(ForeignKey("planning_smart_task.id"))
    destination: Mapped[str] = mapped_column(String(128), comment="推荐的目的地")
    recommendation_reasons: Mapped[str] = mapped_column(TEXT, comment="推荐理由")
    destination_highlights: Mapped[list] = mapped_column(JSON, default=[], comment="目的地亮点")
    daily_plan: Mapped[list] = mapped_column(JSON, default=[], comment="每日行程")


# endregion
