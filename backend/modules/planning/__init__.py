from .controller import add_planning_tasks
from .enums import PlanningTypeEnum
from .models import PlanningMultiResult
from .models import PlanningMultiTask
from .models import PlanningRouteResult
from .models import PlanningRouteTask
from .models import PlanningSingleResult
from .models import PlanningSingleTask
from .models import PlanningSmartResult
from .models import PlanningSmartTask
from .schemas import *

__all__ = [
    "add_planning_tasks",
    # 枚举类型
    "PlanningTypeEnum",
    # 数据模型
    "PlanningSingleTask",
    "PlanningSingleResult",
    "PlanningRouteTask",
    "PlanningRouteResult",
    "PlanningMultiTask",
    "PlanningMultiResult",
    "PlanningSmartTask",
    "PlanningSmartResult",
    # 通用规划参数
    "PlanningTaskBase",
    "PlanningTaskItemBase",
    "PlanningResultBase",
    "RoutePlanSchema",
    "AccommodationPlanSchema",
    "ActivityPlanSchema",
    "HighlightSchema",
    "DailyPlanSchema",
    # 单一目的地规划
    "PlanningSingleResultSchema",
    "PlanningSingleTaskSchema",
    # 沿途游玩规划
    "WaypointSchema",
    "PlanningRouteResultSchema",
    "PlanningRouteTaskSchema",
    # 多节点规划
    "NodeScheduleDetailSchema",
    "PlanningMultiResultSchema",
    "NodeScheduleSchema",
    "PlanningMultiTaskSchema",
    # 智能推荐规划
    "PlanningSmartResultSchema",
    "PlanningSmartTaskSchema",
    # 通用规划操作
    "PlanningResultFavoriteRequest",
    "FeedbackRequest",
    "PlanningStatsResponse",
    "PlanTaskStatusResponse",
    "PlanningTaskUnifiedListRequest",
    "PlanningTaskUnifiedListResponse",
]
