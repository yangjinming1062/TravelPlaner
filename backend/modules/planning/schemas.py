from datetime import datetime
from typing import Any
from typing import Optional

from common.schema import *


# region Schema: 通用规划参数


class PlanningTaskBase(SchemaBase):
    """规划任务基类"""

    title: str = Field(default="", description="规划标题")
    source: str = Field(description="出发地")
    departure_date: datetime = Field(description="出发日期")
    return_date: datetime = Field(description="返程日期")
    group_size: int = Field(default=1, ge=1, description="出行人数")
    transport_mode: str = Field(default="自驾", description="主要交通方式")


class PlanningTaskItemBase(PlanningTaskBase):
    """规划任务列表项基类"""

    id: str = Field("", description="规划ID")
    status: str = Field("", description="规划状态: pending, processing, completed, failed")
    created_at: datetime = Field("", description="创建时间")


class PlanningResultBase(SchemaBase):
    """规划结果基类"""

    id: str = Field(description="结果ID")
    plan_title: str = Field(description="方案标题")
    plan_description: str = Field(default="", description="方案描述")
    total_days: int = Field(description="总天数")
    estimated_budget: int = Field(default=0, description="预估费用")
    is_favorite: bool = Field(default=False, description="是否收藏")


class RoutePlanSchema(SchemaBase):
    """路线规划"""

    from_location: str = Field(description="出发地点")
    from_time: str = Field(description="出发时间")
    to_location: str = Field(description="到达地点")
    to_time: str = Field(description="到达时间")
    transport_type: str = Field(description="交通方式")
    description: str = Field(description="描述")
    total_distance: float = Field(description="总距离(km)")
    estimated_time: str = Field(description="预计时间")
    cost: Optional[float] = Field(default=None, description="费用")


class AccommodationPlanSchema(SchemaBase):
    """住宿规划"""

    name: str = Field(description="住宿名称")
    type: str = Field(description="住宿类型，如酒店、民宿等")
    price_range: str = Field(description="价格区间")
    description: Optional[str] = Field(default=None, description="推荐理由")


class ActivityPlanSchema(SchemaBase):
    """活动规划"""

    time: str = Field(description="活动时间")
    name: str = Field(description="活动名称")
    description: Optional[str] = Field(default=None, description="活动描述")
    location: Optional[str] = Field(default=None, description="活动地点")


class HighlightSchema(SchemaBase):
    """亮点项"""

    name: str = Field(description="亮点名称")
    description: str = Field(description="描述")
    best_visit_time: Optional[str] = Field(default=None, description="最佳游览时间")


class DailyPlanSchema(SchemaBase):
    """每日行程"""

    date: str = Field(description="日期")
    accommodation: AccommodationPlanSchema = Field(description="住宿建议")
    activities: list[ActivityPlanSchema] = Field(description="活动列表")
    route_plan: Optional[list[RoutePlanSchema]] = Field(description="路线规划")
    notes: Optional[str] = Field(default=None, description="备注")


# endregion


# region Schema: 单一目的地规划


class PlanningSingleResultSchema(PlanningResultBase):
    """单一目的地规划结果详情"""

    daily_plan: list[DailyPlanSchema] = Field(default=[], description="每日行程")
    highlights: list[HighlightSchema] = Field(default=[], description="行程亮点")
    tips: list[str] = Field(default=[], description="旅游贴士")


class PlanningSingleTaskSchema(PlanningTaskBase, PlanningPreferencesSchema):
    """单一目的地规划"""

    target: str = Field(description="目的地")


class PlanningSingleListRequest(PaginateRequest):
    """单一目的地规划列表查询请求"""

    class Query(PlanningTaskItemBase):
        target: str = None

    query: Query = None
    sort: list[str] = Field(["-created_at"], description="排序字段")


class PlanningSingleListResponse(PaginateResponse):
    """单一目的地规划列表"""

    class Item(PlanningTaskItemBase):
        target: str

    data: list[Item]


# endregion


# region Schema: 沿途游玩规划


class WaypointSchema(SchemaBase):
    """途经点"""

    name: str = Field(description="途经点名称")
    description: str = Field(description="描述")
    estimated_visit_time: str = Field(description="预计游览时间")
    rating: Optional[float] = Field(default=None, description="评分")
    latitude: float = Field(description="纬度")
    longitude: float = Field(description="经度")
    notes: Optional[str] = Field(default=None, description="备注")


class PlanningRouteResultSchema(SchemaBase):
    """沿途游玩规划结果详情"""

    daily_plan: list[DailyPlanSchema] = Field(default=[], description="每日计划")
    route_plan: list[RoutePlanSchema] = Field(default=[], description="路线规划详情")
    waypoints: list[WaypointSchema] = Field(default=[], description="途经点列表")


class PlanningRouteTaskSchema(PlanningTaskBase, PlanningPreferencesSchema):
    """沿途游玩规划"""

    target: str = Field(description="目的地")
    max_stopovers: int = Field(default=3, ge=0, description="最多停留次数：沿途最多可以停留几次")
    max_stopover_duration: int = Field(default=2, ge=0, description="计划停留时长：每个途径点最多游玩多久（小时）")
    route_preference: str = Field(default="平衡", description="路线偏好")
    max_detour_distance: int = Field(default=100, ge=0, description="最大绕行距离(km)")
    preferred_stop_types: list[str] = Field(default=[], description="偏好停留类型")


class PlanningRouteListRequest(PaginateRequest):
    """沿途游玩规划列表查询请求"""

    class Query(PlanningTaskItemBase):
        target: str = None

    query: Query = None
    sort: list[str] = Field(["-created_at"], description="排序字段")


class PlanningRouteListResponse(PaginateResponse):
    """沿途游玩规划列表"""

    class Item(PlanningTaskItemBase):
        target: str

    data: list[Item]


# endregion


# region Schema: 多节点规划


class NodeScheduleDetailSchema(SchemaBase):
    """节点详细安排"""

    location: str = Field(description="地点名称")
    daily_plan: list[DailyPlanSchema] = Field(default=[], description="每日行程")


class PlanningMultiResultSchema(PlanningResultBase):
    """多节点规划结果详情"""

    nodes_details: list[NodeScheduleDetailSchema] = Field(default=[], description="节点详细安排")
    route_plan: list[RoutePlanSchema] = Field(default=[], description="节点间的交通安排")
    highlights: list[HighlightSchema] = Field(default=[], description="行程亮点")


class NodeScheduleSchema(SchemaBase):
    """节点时间安排"""

    location: str = Field(description="地点名称")
    arrival_date: str = Field(description="到达日期")
    departure_date: str = Field(description="离开日期")


class PlanningMultiTaskSchema(PlanningTaskBase, PlanningPreferencesSchema):
    """多节点规划"""

    nodes_schedule: list[NodeScheduleSchema] = Field(description="节点信息 - 详细的时间和地点安排")


class PlanningMultiListRequest(PaginateRequest):
    """多节点规划列表查询请求"""

    query: PlanningTaskItemBase = None
    sort: list[str] = Field(["-created_at"], description="排序字段")


class PlanningMultiListResponse(PaginateResponse):
    """多节点规划列表"""

    data: list[PlanningTaskItemBase]


# endregion


# region Schema: 智能推荐规划


class PlanningSmartResultSchema(PlanningResultBase):
    """智能推荐规划结果详情"""

    destination: str = Field(description="推荐的目的地")
    recommendation_reasons: list[str] = Field(default=[], description="推荐理由")
    destination_highlights: list[HighlightSchema] = Field(default=[], description="目的地亮点")
    daily_plan: list[DailyPlanSchema] = Field(default=[], description="每日行程")


class PlanningSmartTaskSchema(PlanningTaskBase, PlanningPreferencesSchema):
    """智能推荐规划"""

    max_travel_distance: int = Field(default=1000, ge=0, description="最大出行距离(km)")
    preferred_environment: str = Field(default="", description="环境偏好")
    avoid_regions: list[str] = Field(default=[], description="避免的地区")


class PlanningSmartListRequest(PaginateRequest):
    """智能推荐规划列表查询请求"""

    class Query(PlanningTaskItemBase):
        title: str = None
        destination: str = None

    query: Query = None
    sort: list[str] = Field(["-created_at"], description="排序字段")


class PlanningSmartListResponse(PaginateResponse):
    """智能推荐规划列表"""

    class Item(PlanningTaskItemBase):
        destination: str = Field(description="推荐的目的地")

    data: list[Item]


# endregion


# region Schema: 通用规划操作


class PlanningResultFavoriteRequest(SchemaBase):
    """更新收藏状态"""

    is_favorite: Optional[bool] = Field(None, description="收藏状态")


class FeedbackRequest(SchemaBase):
    """用户反馈"""

    user_rating: Optional[float] = Field(None, ge=0, le=5, description="用户评分")
    user_feedback: Optional[str] = Field(None, description="用户反馈")


class PlanningStatsResponse(SchemaBase):
    """用户规划统计"""

    total_plans: int = Field(description="总规划数")
    favorited_plans: int = Field(description="收藏的规划数")
    mode_distribution: dict[str, int] = Field(description="各模式分布情况")


# endregion
