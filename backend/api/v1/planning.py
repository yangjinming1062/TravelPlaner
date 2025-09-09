from common.api import *
from fastapi import BackgroundTasks
from fastapi import Query
from modules.planning import *
from modules.user import User
from sqlalchemy import func
from sqlalchemy import literal
from sqlalchemy import union_all

router = get_router()

# 全局规划类型与模型映射关系
PLANNING_TYPE_MODEL_MAP = {
    PlanningTypeEnum.SINGLE: (PlanningSingleTask, PlanningSingleResult),
    PlanningTypeEnum.ROUTE: (PlanningRouteTask, PlanningRouteResult),
    PlanningTypeEnum.MULTI: (PlanningMultiTask, PlanningMultiResult),
    PlanningTypeEnum.SMART: (PlanningSmartTask, PlanningSmartResult),
}


# region 通用任务处理函数


def create_task_handler(bg_task, planning_type: PlanningTypeEnum, request, user_id):
    """创建任务的通用处理函数"""
    task_model, _ = PLANNING_TYPE_MODEL_MAP[planning_type]
    with DatabaseManager() as db:
        item = task_model(**request.model_dump(), user_id=user_id)
        db.add(item)
        db.commit()
        item_id = item.id
    add_planning_tasks(bg_task, planning_type, item_id)
    return item_id


def delete_tasks_handler(planning_type: PlanningTypeEnum, task_ids, user_id):
    """删除任务的通用处理函数"""
    task_model, result_model = PLANNING_TYPE_MODEL_MAP[planning_type]
    with DatabaseManager() as db:
        db.query(result_model).filter(result_model.task_id.in_(task_ids)).delete(synchronize_session=False)
        db.query(task_model).filter(task_model.id.in_(task_ids), task_model.user_id == user_id).delete(
            synchronize_session=False
        )


def get_task_result_handler(planning_type: PlanningTypeEnum, result_schema, task_id, user_id):
    """获取任务结果的通用处理函数"""
    task_model, result_model = PLANNING_TYPE_MODEL_MAP[planning_type]
    with DatabaseManager() as db:
        # 检查任务状态
        task = db.query(task_model).filter(task_model.id == task_id, task_model.user_id == user_id).first()
        if not task:
            raise APIException(APICode.NOT_FOUND, "任务不存在")

        if task.status == "pending":
            raise APIException(APICode.QUERY, "任务尚未开始处理")
        elif task.status == "processing":
            raise APIException(APICode.QUERY, "任务正在处理中，请稍后再试")
        elif task.status == "failed":
            raise APIException(APICode.QUERY, "任务处理失败")

        result = db.query(result_model).filter(result_model.task_id == task_id).first()
        if not result:
            raise APIException(APICode.NOT_FOUND, "规划结果不存在")
        db.expunge(result)
    return result_schema.model_validate(result)


# endregion

# region API: 单一目的地规划


@router.post("/single-tasks", status_code=201, summary="新增单一目的地规划")
async def create_single_plan(
    request: PlanningSingleTaskSchema, bg_task: BackgroundTasks, user: User = Depends(get_user)
) -> int:
    return create_task_handler(bg_task, PlanningTypeEnum.SINGLE, request, user.id)


@router.delete("/single-tasks", status_code=204, summary="删除单一目的地规划")
async def delete_single_plans(request: list[int] = Query(), user: User = Depends(get_user)):
    delete_tasks_handler(PlanningTypeEnum.SINGLE, request, user.id)


@router.get("/single-tasks/{task_id}/result", summary="获取单一目的地规划结果")
async def get_single_plan_result(task_id: int, user: User = Depends(get_user)) -> PlanningSingleResultSchema:
    return get_task_result_handler(PlanningTypeEnum.SINGLE, PlanningSingleResultSchema, task_id, user.id)


# endregion

# region API: 沿途游玩规划


@router.post("/route-tasks", status_code=201, summary="新增沿途游玩规划")
async def create_route_plan(
    request: PlanningRouteTaskSchema, bg_task: BackgroundTasks, user: User = Depends(get_user)
) -> int:
    return create_task_handler(bg_task, PlanningTypeEnum.ROUTE, request, user.id)


@router.delete("/route-tasks", status_code=204, summary="删除沿途游玩规划")
async def delete_route_plans(request: list[int] = Query(), user: User = Depends(get_user)):
    delete_tasks_handler(PlanningTypeEnum.ROUTE, request, user.id)


@router.get("/route-tasks/{task_id}/result", summary="获取沿途游玩规划结果")
async def get_route_plan_result(task_id: int, user: User = Depends(get_user)) -> PlanningRouteResultSchema:
    return get_task_result_handler(PlanningTypeEnum.ROUTE, PlanningRouteResultSchema, task_id, user.id)


# endregion

# region API: 多节点规划


@router.post("/multi-tasks", status_code=201, summary="新增多节点规划")
async def create_multi_plan(
    request: PlanningMultiTaskSchema, bg_task: BackgroundTasks, user: User = Depends(get_user)
) -> int:
    return create_task_handler(bg_task, PlanningTypeEnum.MULTI, request, user.id)


@router.delete("/multi-tasks", status_code=204, summary="删除多节点规划")
async def delete_multi_node_plans(request: list[int] = Query(), user: User = Depends(get_user)):
    delete_tasks_handler(PlanningTypeEnum.MULTI, request, user.id)


@router.get("/multi-tasks/{task_id}/result", summary="获取多节点规划结果")
async def get_multi_plan_result(task_id: int, user: User = Depends(get_user)) -> PlanningMultiResultSchema:
    return get_task_result_handler(PlanningTypeEnum.MULTI, PlanningMultiResultSchema, task_id, user.id)


# endregion

# region API: 智能推荐规划


@router.post("/smart-tasks", status_code=201, summary="新增智能推荐规划")
async def create_smart_plan(
    request: PlanningSmartTaskSchema, bg_task: BackgroundTasks, user: User = Depends(get_user)
) -> int:
    return create_task_handler(bg_task, PlanningTypeEnum.SMART, request, user.id)


@router.delete("/smart-tasks", status_code=204, summary="删除智能推荐规划")
async def delete_smart_plans(request: list[int] = Query(), user: User = Depends(get_user)):
    delete_tasks_handler(PlanningTypeEnum.SMART, request, user.id)


@router.get("/smart-tasks/{task_id}/result", summary="获取智能推荐规划结果")
async def get_smart_plan_result(task_id: int, user: User = Depends(get_user)) -> PlanningSmartResultSchema:
    return get_task_result_handler(PlanningTypeEnum.SMART, PlanningSmartResultSchema, task_id, user.id)


# endregion

# region API: 通用规划操作


@router.get("/tasks/{task_type}/{task_id}/status", summary="获取规划任务状态")
async def get_plan_task_status(
    task_type: PlanningTypeEnum, task_id: int, user: User = Depends(get_user)
) -> PlanTaskStatusResponse:
    task_model, result_model = PLANNING_TYPE_MODEL_MAP.get(task_type)
    with DatabaseManager() as db:
        task = db.query(task_model).filter(task_model.id == task_id, task_model.user_id == user.id).first()
        if not task:
            raise APIException(APICode.NOT_FOUND, "任务不存在")
        result = db.query(result_model).filter(result_model.task_id == task_id).first()
        has_result = result is not None
        return PlanTaskStatusResponse(
            task_id=task_id,
            task_type=task_type.value,
            status=task.status,
            has_result=has_result,
            title=task.title,
            created_at=task.created_at.isoformat(),
        )


@router.patch("/tasks/{task_type}/{task_id}/favorite", status_code=204, summary="更新规划收藏状态")
async def update_plan_favorite(
    task_type: PlanningTypeEnum, task_id: int, request: PlanningResultFavoriteRequest, user: User = Depends(get_user)
):
    task_model, result_model = PLANNING_TYPE_MODEL_MAP.get(task_type)
    with DatabaseManager() as db:
        # 首先验证任务是否属于当前用户
        task = db.query(task_model).filter(task_model.id == task_id, task_model.user_id == user.id).first()
        if not task:
            raise APIException(APICode.NOT_FOUND, "任务不存在")
        # 查询对应的结果记录
        result = db.query(result_model).filter(result_model.task_id == task_id).first()
        if not result:
            raise APIException(APICode.NOT_FOUND, "规划结果不存在")
        # 更新收藏状态
        if request.is_favorite is not None:
            result.is_favorite = request.is_favorite


@router.get("/stats", summary="获取用户规划统计")
async def get_planning_stats(user: User = Depends(get_user)) -> PlanningStatsResponse:
    with DatabaseManager() as db:
        total_plans = 0
        favorited_plans = 0
        mode_distribution = {}
        for planning_type, (task_model, result_model) in PLANNING_TYPE_MODEL_MAP.items():
            # 统计任务总数
            task_count = db.query(task_model).filter(task_model.user_id == user.id).count()
            total_plans += task_count
            mode_distribution[planning_type.value] = task_count
            # 统计收藏数
            fav_count = (
                db.query(result_model)
                .filter(
                    result_model.is_favorite == True,
                    result_model.task_id.in_(db.query(task_model.id).filter(task_model.user_id == user.id)),
                )
                .count()
            )
            favorited_plans += fav_count
        return PlanningStatsResponse(
            total_plans=total_plans,
            favorited_plans=favorited_plans,
            mode_distribution=mode_distribution,
        )


def _build_single_plan_query(user_id: str):
    """构建单一目的地规划查询"""
    return (
        select(
            PlanningSingleTask.id,
            PlanningSingleTask.title,
            PlanningSingleTask.source,
            PlanningSingleTask.target.label("target"),
            PlanningSingleTask.departure_date,
            PlanningSingleTask.return_date,
            PlanningSingleTask.group_size,
            PlanningSingleTask.transport_mode,
            PlanningSingleTask.status,
            PlanningSingleTask.created_at,
            literal("single").label("planning_type"),
            func.coalesce(PlanningSingleResult.is_favorite, False).label("is_favorite"),
        )
        .outerjoin(PlanningSingleResult, PlanningSingleTask.id == PlanningSingleResult.task_id)
        .where(PlanningSingleTask.user_id == user_id)
    )


def _build_route_plan_query(user_id: str):
    """构建沿途游玩规划查询"""
    return (
        select(
            PlanningRouteTask.id,
            PlanningRouteTask.title,
            PlanningRouteTask.source,
            PlanningRouteTask.target.label("target"),
            PlanningRouteTask.departure_date,
            PlanningRouteTask.return_date,
            PlanningRouteTask.group_size,
            PlanningRouteTask.transport_mode,
            PlanningRouteTask.status,
            PlanningRouteTask.created_at,
            literal("route").label("planning_type"),
            func.coalesce(PlanningRouteResult.is_favorite, False).label("is_favorite"),
        )
        .outerjoin(PlanningRouteResult, PlanningRouteTask.id == PlanningRouteResult.task_id)
        .where(PlanningRouteTask.user_id == user_id)
    )


def _build_multi_plan_query(user_id: str):
    """构建多节点规划查询"""
    return (
        select(
            PlanningMultiTask.id,
            PlanningMultiTask.title,
            PlanningMultiTask.source,
            literal("").label("target"),  # 多节点没有单一目标
            PlanningMultiTask.departure_date,
            PlanningMultiTask.return_date,
            PlanningMultiTask.group_size,
            PlanningMultiTask.transport_mode,
            PlanningMultiTask.status,
            PlanningMultiTask.created_at,
            literal("multi").label("planning_type"),
            func.coalesce(PlanningMultiResult.is_favorite, False).label("is_favorite"),
        )
        .outerjoin(PlanningMultiResult, PlanningMultiTask.id == PlanningMultiResult.task_id)
        .where(PlanningMultiTask.user_id == user_id)
    )


def _build_smart_plan_query(user_id: str):
    """构建智能推荐规划查询"""
    return (
        select(
            PlanningSmartTask.id,
            PlanningSmartTask.title,
            PlanningSmartTask.source,
            func.coalesce(PlanningSmartResult.destination, "AI推荐").label("target"),
            PlanningSmartTask.departure_date,
            PlanningSmartTask.return_date,
            PlanningSmartTask.group_size,
            PlanningSmartTask.transport_mode,
            PlanningSmartTask.status,
            PlanningSmartTask.created_at,
            literal("smart").label("planning_type"),
            func.coalesce(PlanningSmartResult.is_favorite, False).label("is_favorite"),
        )
        .outerjoin(PlanningSmartResult, PlanningSmartTask.id == PlanningSmartResult.task_id)
        .where(PlanningSmartTask.user_id == user_id)
    )


def _apply_query_filters(stmt, subquery_or_columns, query_params):
    """应用查询过滤条件"""
    if not query_params:
        return stmt

    query_dict = query_params.model_dump(exclude_none=True)
    if not query_dict:
        return stmt

    filter_conditions = []

    # 根据传入的是subquery还是直接的columns来选择访问方式
    if hasattr(subquery_or_columns, "c"):
        # 这是一个subquery
        columns = subquery_or_columns.c
    else:
        # 这是一个直接的column集合（用于单表查询）
        columns = subquery_or_columns

    for field, value in query_dict.items():
        if field == "title" and value:
            filter_conditions.append(columns.title.like(f"%{value}%"))
        elif field == "source" and value:
            filter_conditions.append(columns.source.like(f"%{value}%"))
        elif field == "target" and value:
            filter_conditions.append(columns.target.like(f"%{value}%"))
        elif field == "planning_type" and value:
            # 对于单表查询，planning_type过滤会在查询选择阶段处理
            if hasattr(columns, "planning_type"):
                filter_conditions.append(columns.planning_type == value.value)
        elif field == "status" and value:
            if isinstance(value, list):
                filter_conditions.append(columns.status.in_(value))
            else:
                filter_conditions.append(columns.status == value)

    if filter_conditions:
        stmt = stmt.where(*filter_conditions)

    return stmt


def _apply_sorting(stmt, subquery_or_columns, sort_fields):
    """应用排序"""
    # 根据传入的是subquery还是直接的columns来选择访问方式
    if hasattr(subquery_or_columns, "c"):
        columns = subquery_or_columns.c
    else:
        columns = subquery_or_columns

    if sort_fields:
        for sort_field in sort_fields:
            if sort_field.startswith("-"):
                field_name = sort_field[1:]
                if hasattr(columns, field_name):
                    stmt = stmt.order_by(getattr(columns, field_name).desc())
            else:
                if hasattr(columns, sort_field):
                    stmt = stmt.order_by(getattr(columns, sort_field))
    else:
        # 默认按创建时间倒序
        stmt = stmt.order_by(columns.created_at.desc())

    return stmt


@router.post("/tasks/list", summary="获取所有类型规划的统一列表")
async def get_all_plans(
    request: PlanningTaskUnifiedListRequest, user: User = Depends(get_user)
) -> PlanningTaskUnifiedListResponse:
    """
    智能查询规划列表：
    - 如果指定了planning_type，只查询对应类型的表（高效）
    - 如果未指定planning_type，使用UNION查询所有类型
    """
    # 检查是否指定了具体的规划类型
    planning_type = request.query.planning_type if request.query else None

    if planning_type:
        # 单表查询优化：只查询指定类型的数据
        if planning_type == PlanningTypeEnum.SINGLE:
            base_query = _build_single_plan_query(user.id)
        elif planning_type == PlanningTypeEnum.ROUTE:
            base_query = _build_route_plan_query(user.id)
        elif planning_type == PlanningTypeEnum.MULTI:
            base_query = _build_multi_plan_query(user.id)
        elif planning_type == PlanningTypeEnum.SMART:
            base_query = _build_smart_plan_query(user.id)
        else:
            raise APIException(APICode.UN_SUPPORT, f"不支持的规划类型: {planning_type}")
        final_stmt = _apply_query_filters(base_query, base_query.selected_columns, request.query)
        final_stmt = _apply_sorting(final_stmt, base_query.selected_columns, request.sort)
        return paginate_query(final_stmt, request, PlanningTaskUnifiedListResponse, base_query.selected_columns[0])

    else:
        # UNION查询：查询所有类型的数据
        single_subquery = _build_single_plan_query(user.id)
        route_subquery = _build_route_plan_query(user.id)
        multi_subquery = _build_multi_plan_query(user.id)
        smart_subquery = _build_smart_plan_query(user.id)
        # 使用UNION ALL合并所有查询
        union_query = union_all(single_subquery, route_subquery, multi_subquery, smart_subquery)
        # 创建子查询
        subquery = union_query.subquery("unified_plans")
        final_stmt = select(subquery)
        final_stmt = _apply_query_filters(final_stmt, subquery, request.query)
        final_stmt = _apply_sorting(final_stmt, subquery, request.sort)
        return paginate_query(final_stmt, request, PlanningTaskUnifiedListResponse, subquery.c.id)


# endregion
