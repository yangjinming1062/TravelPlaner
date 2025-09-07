from enum import Enum


class PlanningTypeEnum(Enum):
    """
    规划类型
    """

    SINGLE = "single"
    ROUTE = "route"
    MULTI = "multi"
    SMART = "smart"
