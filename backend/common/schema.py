from datetime import datetime
from typing import Optional

from pydantic import BaseModel
from pydantic import Field


class SchemaBase(BaseModel):
    class Config:
        """
        可以通过ORM对象实例序列化Schema
        """

        from_attributes = True


class DateFilterSchema(BaseModel):
    """
    时间过滤参数
    """

    started_at: datetime
    ended_at: datetime


class PaginateRequest(BaseModel):
    """
    分页类请求共同参数定义
    """

    page: int | None = Field(None, ge=0)
    size: int | None = Field(None, gt=0)
    sort: list[str] | None = None
    export: bool = Field(False, title="是否导出数据")
    key: list[str] | None = Field(None, title="按ID导出时的ID列表")


class PaginateResponse(BaseModel):
    """
    分页类响应共同参数定义: 注意子类需要提供类的的注释，因为其作用是提供下载时文档的名称
    """

    total: int = Field(default=0, title="总数")
    data: list


class PlanningPreferencesSchema(SchemaBase):
    """
    通用规划偏好设置
    """

    preferred_transport_modes: Optional[list[str]] = Field(None, description="偏好交通方式")
    accommodation_level: Optional[list[int]] = Field(None, ge=2, le=5, description="住宿标准")
    activity_preferences: Optional[list[str]] = Field(None, description="活动类型偏好")
    attraction_categories: Optional[list[str]] = Field(None, description="景点类型偏好")
    travel_style: Optional[str] = Field(None, description="旅游风格")
    budget_min: Optional[int] = Field(None, ge=0, description="最低预算")
    budget_max: Optional[int] = Field(None, ge=0, description="最高预算")
    budget_flexibility: Optional[str] = Field(None, description="预算灵活性")
    dietary_restrictions: Optional[list[str]] = Field(None, description="饮食限制")
    group_travel_preference: Optional[str] = Field(None, description="出行类型")
    custom_preferences: Optional[str] = Field(None, description="附加的需求")
