from common.api import *
from fastapi import BackgroundTasks
from fastapi import Query
from modules.planning import *
from modules.user import User

router = get_router()


# region 通用任务处理函数


def create_task_handler(bg_task, task_model, planning_type: PlanningTypeEnum, request, user_id):
    """创建任务的通用处理函数"""
    with DatabaseManager() as db:
        item = task_model(**request.model_dump(), user_id=user_id)
        db.add(item)
        db.commit()
        item_id = item.id
    add_planning_tasks(bg_task, planning_type, item_id)
    return item_id


def delete_tasks_handler(task_model, result_model, task_ids):
    """删除任务的通用处理函数"""
    with DatabaseManager() as db:
        db.query(result_model).filter(result_model.task_id.in_(task_ids)).delete(synchronize_session=False)
        db.query(task_model).filter(task_model.id.in_(task_ids)).delete(synchronize_session=False)


def get_task_result_handler(task_model, result_model, result_schema, task_id):
    """获取任务结果的通用处理函数"""
    with DatabaseManager() as db:
        # 检查任务状态
        task = db.query(task_model).filter(task_model.id == task_id).first()
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
    return create_task_handler(bg_task, PlanningSingleTask, PlanningTypeEnum.SINGLE, request, user.id)


@router.delete("/single-tasks", status_code=204, summary="删除单一目的地规划")
async def delete_single_plans(request: list[int] = Query(), _user: User = Depends(get_user)):
    delete_tasks_handler(PlanningSingleTask, PlanningSingleResult, request)


@router.post("/single-tasks/list", summary="获取单一目的地规划列表")
async def get_single_plans(
    request: PlanningSingleListRequest, _user: User = Depends(get_user)
) -> PlanningSingleListResponse:
    stmt = add_filters(
        select(
            PlanningSingleTask.id,
            PlanningSingleTask.title,
            PlanningSingleTask.source,
            PlanningSingleTask.target,
            PlanningSingleTask.departure_date,
            PlanningSingleTask.return_date,
            PlanningSingleTask.group_size,
            PlanningSingleTask.transport_mode,
            PlanningSingleTask.status,
            PlanningSingleTask.created_at,
        ),
        request.query,
        {
            PlanningSingleTask.title: FilterTypeEnum.Like,
            PlanningSingleTask.source: FilterTypeEnum.Like,
            PlanningSingleTask.target: FilterTypeEnum.Like,
            PlanningSingleTask.status: FilterTypeEnum.In,
            PlanningSingleTask.created_at: FilterTypeEnum.Datetime,
        },
    )
    return paginate_query(stmt, request, PlanningSingleListResponse, PlanningSingleTask.id)


@router.get("/single-tasks/{task_id}/result", summary="获取单一目的地规划结果")
async def get_single_plan_result(task_id: int, _user: User = Depends(get_user)) -> PlanningSingleResultSchema:
    return get_task_result_handler(PlanningSingleTask, PlanningSingleResult, PlanningSingleResultSchema, task_id)


# endregion

# region API: 沿途游玩规划


@router.post("/route-tasks", status_code=201, summary="新增沿途游玩规划")
async def create_route_plan(
    request: PlanningRouteTaskSchema, bg_task: BackgroundTasks, user: User = Depends(get_user)
) -> int:
    return create_task_handler(bg_task, PlanningRouteTask, PlanningTypeEnum.ROUTE, request, user.id)


@router.delete("/route-tasks", status_code=204, summary="删除沿途游玩规划")
async def delete_route_plans(request: list[int] = Query(), _user: User = Depends(get_user)):
    delete_tasks_handler(PlanningRouteTask, PlanningRouteResult, request)


@router.post("/route-tasks/list", summary="获取沿途游玩规划列表")
async def get_route_plans(
    request: PlanningRouteListRequest, _user: User = Depends(get_user)
) -> PlanningRouteListResponse:
    stmt = add_filters(
        select(
            PlanningRouteTask.id,
            PlanningRouteTask.title,
            PlanningRouteTask.source,
            PlanningRouteTask.target,
            PlanningRouteTask.departure_date,
            PlanningRouteTask.return_date,
            PlanningRouteTask.group_size,
            PlanningRouteTask.transport_mode,
            PlanningRouteTask.status,
            PlanningRouteTask.created_at,
        ),
        request.query,
        {
            PlanningRouteTask.title: FilterTypeEnum.Like,
            PlanningRouteTask.source: FilterTypeEnum.Like,
            PlanningRouteTask.target: FilterTypeEnum.Like,
            PlanningRouteTask.status: FilterTypeEnum.In,
            PlanningRouteTask.created_at: FilterTypeEnum.Datetime,
        },
    )
    return paginate_query(stmt, request, PlanningRouteListResponse, PlanningRouteTask.id)


@router.get("/route-tasks/{task_id}/result", summary="获取沿途游玩规划结果")
async def get_route_plan_result(task_id: int, _user: User = Depends(get_user)) -> PlanningRouteResultSchema:
    return get_task_result_handler(PlanningRouteTask, PlanningRouteResult, PlanningRouteResultSchema, task_id)


# endregion

# region API: 多节点规划


@router.post("/multi-tasks", status_code=201, summary="新增多节点规划")
async def create_multi_plan(
    request: PlanningMultiTaskSchema, bg_task: BackgroundTasks, user: User = Depends(get_user)
) -> int:
    return create_task_handler(bg_task, PlanningMultiTask, PlanningTypeEnum.MULTI, request, user.id)


@router.delete("/multi-tasks", status_code=204, summary="删除多节点规划")
async def delete_multi_node_plans(request: list[int] = Query(), _user: User = Depends(get_user)):
    delete_tasks_handler(PlanningMultiTask, PlanningMultiResult, request)


@router.post("/multi-tasks/list", summary="获取多节点规划列表")
async def get_multi_plans(
    request: PlanningMultiListRequest, _user: User = Depends(get_user)
) -> PlanningMultiListResponse:
    stmt = add_filters(
        select(
            PlanningMultiTask.id,
            PlanningMultiTask.title,
            PlanningMultiTask.source,
            PlanningMultiTask.departure_date,
            PlanningMultiTask.return_date,
            PlanningMultiTask.group_size,
            PlanningMultiTask.transport_mode,
            PlanningMultiTask.status,
            PlanningMultiTask.created_at,
        ),
        request.query,
        {
            PlanningMultiTask.title: FilterTypeEnum.Like,
            PlanningMultiTask.source: FilterTypeEnum.Like,
            PlanningMultiTask.status: FilterTypeEnum.In,
            PlanningMultiTask.created_at: FilterTypeEnum.Datetime,
        },
    )
    return paginate_query(stmt, request, PlanningMultiListResponse, PlanningMultiTask.id)


@router.get("/multi-tasks/{task_id}/result", summary="获取多节点规划结果")
async def get_multi_plan_result(task_id: int, _user: User = Depends(get_user)) -> PlanningMultiResultSchema:
    return get_task_result_handler(PlanningMultiTask, PlanningMultiResult, PlanningMultiResultSchema, task_id)


# endregion

# region API: 智能推荐规划


@router.post("/smart-tasks", status_code=201, summary="新增智能推荐规划")
async def create_smart_plan(
    request: PlanningSmartTaskSchema, bg_task: BackgroundTasks, user: User = Depends(get_user)
) -> int:
    return create_task_handler(bg_task, PlanningSmartTask, PlanningTypeEnum.SMART, request, user.id)


@router.delete("/smart-tasks", status_code=204, summary="删除智能推荐规划")
async def delete_smart_plans(request: list[int] = Query(), _user: User = Depends(get_user)):
    delete_tasks_handler(PlanningSmartTask, PlanningSmartResult, request)


@router.post("/smart-tasks/list", summary="获取智能推荐规划列表")
async def get_smart_plans(
    request: PlanningSmartListRequest, _user: User = Depends(get_user)
) -> PlanningSmartListResponse:
    stmt = add_filters(
        select(
            PlanningSmartTask.id,
            PlanningSmartTask.title,
            PlanningSmartTask.source,
            PlanningSmartTask.departure_date,
            PlanningSmartTask.return_date,
            PlanningSmartTask.group_size,
            PlanningSmartTask.transport_mode,
            PlanningSmartTask.status,
            PlanningSmartTask.created_at,
        ),
        request.query,
        {
            PlanningSmartTask.title: FilterTypeEnum.Like,
            PlanningSmartTask.source: FilterTypeEnum.Like,
            PlanningSmartTask.status: FilterTypeEnum.In,
            PlanningSmartTask.created_at: FilterTypeEnum.Datetime,
        },
    )
    return paginate_query(stmt, request, PlanningSmartListResponse, PlanningSmartTask.id)


@router.get("/smart-tasks/{task_id}/result", summary="获取智能推荐规划结果")
async def get_smart_plan_result(task_id: int, _user: User = Depends(get_user)) -> PlanningSmartResultSchema:
    return get_task_result_handler(PlanningSmartTask, PlanningSmartResult, PlanningSmartResultSchema, task_id)


# endregion


# region API: 通用规划操作


@router.get("/tasks/{task_type}/{task_id}/status", summary="获取规划任务状态")
async def get_plan_task_status(task_type: str, task_id: int, _user: User = Depends(get_user)) -> dict:
    # 定义任务类型与任务模型、结果模型的映射关系
    task_model_map = {
        "single": (PlanningSingleTask, PlanningSingleResult),
        "route": (PlanningRouteTask, PlanningRouteResult),
        "multi": (PlanningMultiTask, PlanningMultiResult),
        "smart": (PlanningSmartTask, PlanningSmartResult),
    }

    # 获取对应的模型
    models = task_model_map.get(task_type)
    if not models:
        raise APIException(APICode.UN_SUPPORT, "不支持的规划类型")

    task_model, result_model = models

    with DatabaseManager() as db:
        task = db.query(task_model).filter(task_model.id == task_id).first()
        if not task:
            raise APIException(APICode.NOT_FOUND, "任务不存在")

        # 检查是否有对应的结果
        result = db.query(result_model).filter(result_model.task_id == task_id).first()
        has_result = result is not None

        # 构建基础返回信息
        response = {
            "task_id": task_id,
            "task_type": task_type,
            "status": task.status,
            "has_result": has_result,
            "title": task.title,
            "created_at": task.created_at.isoformat(),
        }

        # 根据任务类型添加特定字段
        if task_type in ["single", "route"]:
            response["target"] = task.target
        elif task_type == "smart":
            response["max_travel_distance"] = task.max_travel_distance
            response["preferred_environment"] = task.preferred_environment
        # multi类型没有特定的target字段，使用通用信息

        return response


@router.patch("/tasks/{task_type}/{task_id}/favorite", status_code=204, summary="更新规划收藏状态")
async def update_plan_favorite(
    task_type: str, task_id: int, request: PlanningResultFavoriteRequest, _user: User = Depends(get_user)
):
    # 定义任务类型与结果模型的映射关系
    result_model_map = {
        "single": PlanningSingleResult,
        "route": PlanningRouteResult,
        "multi": PlanningMultiResult,
        "smart": PlanningSmartResult,
    }

    # 获取对应的结果模型
    result_model = result_model_map.get(task_type)
    if not result_model:
        raise APIException(APICode.UN_SUPPORT, "不支持的规划类型")

    # 更新收藏状态
    with DatabaseManager() as db:
        result = db.query(result_model).filter(result_model.task_id == task_id).first()
        if not result:
            raise APIException(APICode.NOT_FOUND)
        if request.is_favorite is not None:
            result.is_favorite = request.is_favorite
            db.commit()


@router.get("/stats", summary="获取用户规划统计")
async def get_planning_stats(_user: User = Depends(get_user)) -> PlanningStatsResponse:
    with DatabaseManager() as db:
        # 统计各类规划的总数
        single_count = db.query(PlanningSingleTask).filter(PlanningSingleTask.user_id == _user.id).count()
        route_count = db.query(PlanningRouteTask).filter(PlanningRouteTask.user_id == _user.id).count()
        multi_count = db.query(PlanningMultiTask).filter(PlanningMultiTask.user_id == _user.id).count()
        smart_count = db.query(PlanningSmartTask).filter(PlanningSmartTask.user_id == _user.id).count()

        # 统计收藏的规划数
        single_fav_count = (
            db.query(PlanningSingleResult)
            .filter(
                PlanningSingleResult.is_favorite == True,
                PlanningSingleResult.task_id.in_(
                    db.query(PlanningSingleTask.id).filter(PlanningSingleTask.user_id == _user.id)
                ),
            )
            .count()
        )

        route_fav_count = (
            db.query(PlanningRouteResult)
            .filter(
                PlanningRouteResult.is_favorite == True,
                PlanningRouteResult.task_id.in_(
                    db.query(PlanningRouteTask.id).filter(PlanningRouteTask.user_id == _user.id)
                ),
            )
            .count()
        )

        multi_fav_count = (
            db.query(PlanningMultiResult)
            .filter(
                PlanningMultiResult.is_favorite == True,
                PlanningMultiResult.task_id.in_(
                    db.query(PlanningMultiTask.id).filter(PlanningMultiTask.user_id == _user.id)
                ),
            )
            .count()
        )

        smart_fav_count = (
            db.query(PlanningSmartResult)
            .filter(
                PlanningSmartResult.is_favorite == True,
                PlanningSmartResult.task_id.in_(
                    db.query(PlanningSmartTask.id).filter(PlanningSmartTask.user_id == _user.id)
                ),
            )
            .count()
        )

        return PlanningStatsResponse(
            total_plans=single_count + route_count + multi_count + smart_count,
            favorited_plans=single_fav_count + route_fav_count + multi_fav_count + smart_fav_count,
            mode_distribution={
                "single": single_count,
                "route": route_count,
                "multi": multi_count,
                "smart": smart_count,
            },
        )


# endregion
