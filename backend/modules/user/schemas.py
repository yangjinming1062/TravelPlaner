from typing import Optional

from common.schema import *

from .enums import *


class UserSchema(SchemaBase):
    """
    用户基本信息响应
    """

    id: str
    username: str
    email: str
    phone: str
    nickname: str
    gender: str
    status: UserStatusEnum


class UserProfileSchema(UserSchema, PlanningPreferencesSchema):
    """
    用户完整档案信息（包含偏好设置）
    """

    display_language: str


class UpdateUserProfileRequest(SchemaBase):
    """
    更新用户档案请求
    """

    nickname: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None


class UpdatePasswordRequest(SchemaBase):
    """
    修改密码
    """

    old: str
    new: str


class LoginRequest(SchemaBase):
    """
    登录认证
    """

    username: str = Field(title="账号")
    password: str = Field(title="密码")


class LoginResponse(SchemaBase):
    """
    登录成功响应
    """

    user: UserSchema
    token: str = Field(title="访问令牌")


class RegisterRequest(SchemaBase):
    """
    注册用户
    """

    username: str = Field(title="账号")
    password: str = Field(title="密码")
    phone: str = Field(title="手机号")
    email: Optional[str] = Field(None, title="邮箱")


class ResetPasswordRequest(SchemaBase):
    """
    重置密码
    """

    username: str = Field(title="账号")
    password: str = Field(title="密码")
    captcha: str = Field(title="验证码")


class UserPreferencesSchema(PlanningPreferencesSchema):
    """
    用户偏好设置响应（仅偏好部分）
    """

    display_language: Optional[str] = Field("中文", title="规划结果展示语言")
