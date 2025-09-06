from datetime import timedelta

from common.api import *
from modules.user import *

router = get_router()


def _response(user: User):
    """生成登录响应"""
    expire = datetime.now() + timedelta(days=CONFIG.jwt_token_expire_days)
    to_encode = {"uid": user.id, "exp": expire}
    token = jwt.encode(to_encode, CONFIG.jwt_secret, algorithm=CONSTANTS.JWT_ALGORITHM)
    return LoginResponse(user=UserSchema.model_validate(user), token=token)


# region 认证相关接口


@router.post("/register", summary="用户注册")
async def register(request: RegisterRequest) -> LoginResponse:
    with DatabaseManager() as db:
        # 检查用户名、邮箱、手机号是否已存在
        existing_conditions = [User.username == request.username, User.phone == request.phone]
        if request.email:
            existing_conditions.append(User.email == request.email)

        sql = select(User).where(or_(*existing_conditions))
        if db.scalar(sql):
            raise APIException(APICode.INVALID_USERNAME)

        # 创建新用户
        user = User(
            id=generate_key(request.username),
            username=request.username,
            password=SecretManager.encrypt(request.password),
            phone=request.phone,
            email=request.email or "",
        )
        db.add(user)
        db.commit()
        return _response(user)


@router.post("/login", summary="用户登录")
async def login(request: LoginRequest) -> LoginResponse:
    with DatabaseManager() as db:
        sql = select(User).where(
            or_(
                User.username == request.username,
                User.email == request.username,
                User.phone == request.username,
            )
        )
        if user := db.scalar(sql):
            if user.status == UserStatusEnum.FORBIDDEN:
                raise APIException(APICode.FORBIDDEN)
            if request.password == SecretManager.decrypt(user.password):
                return _response(user)
        raise APIException(APICode.INVALID_PASSWORD)


@router.get("/captcha", summary="获取验证码")
def get_captcha(username: str):
    """获取重置密码验证码"""
    with DatabaseManager() as db:
        sql = select(User).where(
            or_(
                User.username == username,
                User.email == username,
                User.phone == username,
            )
        )
        if user := db.scalar(sql):
            code = generate_key(key_len=6)  # 6位验证码
            # REDIS.hset("user:captcha", user.id, code)
            # REDIS.expire("user:captcha", 300)  # 5分钟过期
            # TODO: 发送验证码（短信/邮件）
            logger.info(f"验证码已生成: {code} for user {user.id}")
            return {"message": "验证码已发送"}
        else:
            raise APIException(APICode.NOT_FOUND)


@router.post("/reset-password", summary="重置密码")
async def reset_password(request: ResetPasswordRequest) -> LoginResponse:
    with DatabaseManager() as db:
        sql = select(User).where(
            or_(
                User.username == request.username,
                User.email == request.username,
                User.phone == request.username,
            )
        )
        if user := db.scalar(sql):
            pass
            # TODO: 验证码验证
            # if request.captcha == REDIS.hget("user:captcha", user.id):
            #     user.password = SecretManager.encrypt(request.password)
            #     # REDIS.hdel("user:captcha", user.id)
            #     db.commit()
            #     return _response(user)
            # else:
            #     raise APIException(APICode.INVALID_CAPTCHA)
        raise APIException(APICode.INVALID_PASSWORD)


# endregion

# region 用户信息管理接口


@router.get("/profile", summary="获取用户完整档案")
def get_user_profile(user: User = Depends(get_user)) -> UserProfileSchema:
    """获取用户完整档案信息（包含偏好设置）"""
    return UserProfileSchema.model_validate(user)


@router.get("/info", summary="获取用户基本信息")
def get_user_info(user: User = Depends(get_user)) -> UserSchema:
    """获取用户基本信息（不含偏好设置）"""
    return UserSchema.model_validate(user)


@router.put("/profile", summary="更新用户基本信息")
def update_user_profile(request: UpdateUserProfileRequest, user: User = Depends(get_user)) -> UserSchema:
    """更新用户基本信息"""
    with DatabaseManager() as db:
        user = db.get(User, user.id)
        if not user:
            raise APIException(APICode.NOT_FOUND)

        # 只更新提供的字段
        if request.nickname is not None:
            user.nickname = request.nickname
        if request.email is not None:
            # 检查邮箱是否已被其他用户使用
            if request.email and db.scalar(select(User).where(User.email == request.email, User.id != user.id)):
                raise APIException(APICode.INVALID_USERNAME)
            user.email = request.email
        if request.phone is not None:
            # 检查手机号是否已被其他用户使用
            if db.scalar(select(User).where(User.phone == request.phone, User.id != user.id)):
                raise APIException(APICode.INVALID_USERNAME)
            user.phone = request.phone
        if request.gender is not None:
            user.gender = request.gender

        db.commit()
        return UserSchema.model_validate(user)


@router.post("/password", summary="修改登录密码")
def change_password(request: UpdatePasswordRequest, user: User = Depends(get_user)):
    """修改登录密码"""
    with DatabaseManager() as db:
        user = db.get(User, user.id)
        if not user:
            raise APIException(APICode.NOT_FOUND)

        if request.old != SecretManager.decrypt(user.password):
            raise APIException(APICode.INVALID_PASSWORD)

        user.password = SecretManager.encrypt(request.new)
        db.commit()
        return {"message": "密码修改成功"}


# endregion

# region 旅游偏好管理接口


@router.get("/preferences", summary="获取用户旅游偏好")
def get_user_preferences(user: User = Depends(get_user)) -> UserPreferencesSchema:
    """获取用户旅游偏好设置"""
    return UserPreferencesSchema.model_validate(user)


@router.put("/preferences", summary="更新用户旅游偏好")
def update_user_preferences(request: UserPreferencesSchema, user: User = Depends(get_user)) -> UserPreferencesSchema:
    """更新用户旅游偏好设置"""
    with DatabaseManager() as db:
        user = db.get(User, user.id)
        if not user:
            raise APIException(APICode.NOT_FOUND)

        # 只更新提供的字段
        if request.budget_min is not None:
            user.budget_min = request.budget_min
        if request.budget_max is not None:
            user.budget_max = request.budget_max
        if request.budget_flexibility is not None:
            user.budget_flexibility = request.budget_flexibility
        if request.preferred_transport_modes is not None:
            user.preferred_transport_modes = request.preferred_transport_modes
        if request.accommodation_level is not None:
            user.accommodation_level = request.accommodation_level
        if request.group_travel_preference is not None:
            user.group_travel_preference = request.group_travel_preference
        if request.activity_preferences is not None:
            user.activity_preferences = request.activity_preferences
        if request.attraction_categories is not None:
            user.attraction_categories = request.attraction_categories
        if request.travel_style is not None:
            user.travel_style = request.travel_style
        if request.dietary_restrictions is not None:
            user.dietary_restrictions = request.dietary_restrictions
        if request.display_language is not None:
            user.display_language = request.display_language
        if request.custom_preferences is not None:
            user.custom_preferences = request.custom_preferences

        db.commit()
        return UserPreferencesSchema.model_validate(user)


# endregion
