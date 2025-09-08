// 规划相关 API
import apiClient from './index';
import {
  PlanningSingleTaskSchema,
  PlanningRouteTaskSchema,
  PlanningMultiTaskSchema,
  PlanningSmartTaskSchema,
  PlanningSingleResultSchema,
  PlanningRouteResultSchema,
  PlanningMultiResultSchema,
  PlanningSmartResultSchema,
  PlanningSingleListResponse,
  PlanningRouteListResponse,
  PlanningMultiListResponse,
  PlanningSmartListResponse,
  PlanningSingleListRequest,
  PlanningRouteListRequest,
  PlanningMultiListRequest,
  PlanningSmartListRequest,
  PlanningResultFavoriteRequest,
  PlanningStatsResponse,
} from '../types/planning';

// 单一目的地规划
export const createSinglePlan = (data: PlanningSingleTaskSchema) => {
  return apiClient.post<number>('/planning/single-tasks', data);
};

export const getSinglePlans = (params: PlanningSingleListRequest) => {
  return apiClient.post<PlanningSingleListResponse>(
    '/planning/single-tasks/list',
    params,
  );
};

// 通用任务状态检查
export const getPlanTaskStatus = (taskType: string, taskId: number) => {
  return apiClient.get<{
    task_id: number;
    task_type: string;
    status: string;
    has_result: boolean;
    title: string;
    target?: string;
    max_travel_distance?: number;
    preferred_environment?: string;
    created_at: string;
  }>(`/planning/tasks/${taskType}/${taskId}/status`);
};

export const getSinglePlanResult = (taskId: number) => {
  return apiClient.get<PlanningSingleResultSchema>(
    `/planning/single-tasks/${taskId}/result`,
  );
};

export const deleteSinglePlans = (taskIds: number[]) => {
  return apiClient.delete('/planning/single-tasks', { params: { taskIds } });
};

// 沿途游玩规划
export const createRoutePlan = (data: PlanningRouteTaskSchema) => {
  return apiClient.post<number>('/planning/route-tasks', data);
};

export const getRoutePlans = (params: PlanningRouteListRequest) => {
  return apiClient.post<PlanningRouteListResponse>(
    '/planning/route-tasks/list',
    params,
  );
};

export const getRoutePlanResult = (taskId: number) => {
  return apiClient.get<PlanningRouteResultSchema>(
    `/planning/route-tasks/${taskId}/result`,
  );
};

export const deleteRoutePlans = (taskIds: number[]) => {
  return apiClient.delete('/planning/route-tasks', { params: { taskIds } });
};

// 多节点规划
export const createMultiPlan = (data: PlanningMultiTaskSchema) => {
  return apiClient.post<number>('/planning/multi-tasks', data);
};

export const getMultiPlans = (params: PlanningMultiListRequest) => {
  return apiClient.post<PlanningMultiListResponse>(
    '/planning/multi-tasks/list',
    params,
  );
};

export const getMultiPlanResult = (taskId: number) => {
  return apiClient.get<PlanningMultiResultSchema>(
    `/planning/multi-tasks/${taskId}/result`,
  );
};

export const deleteMultiPlans = (taskIds: number[]) => {
  return apiClient.delete('/planning/multi-tasks', { params: { taskIds } });
};

// 智能推荐规划
export const createSmartPlan = (data: PlanningSmartTaskSchema) => {
  return apiClient.post<number>('/planning/smart-tasks', data);
};

export const getSmartPlans = (params: PlanningSmartListRequest) => {
  return apiClient.post<PlanningSmartListResponse>(
    '/planning/smart-tasks/list',
    params,
  );
};

export const getSmartPlanResult = (taskId: number) => {
  return apiClient.get<PlanningSmartResultSchema>(
    `/planning/smart-tasks/${taskId}/result`,
  );
};

export const deleteSmartPlans = (taskIds: number[]) => {
  return apiClient.delete('/planning/smart-tasks', { params: { taskIds } });
};

// 通用规划操作
export const updatePlanFavorite = (
  taskType: string,
  taskId: number,
  data: PlanningResultFavoriteRequest,
) => {
  return apiClient.patch(
    `/planning/tasks/${taskType}/${taskId}/favorite`,
    data,
  );
};

export const getPlanningStats = () => {
  return apiClient.get<PlanningStatsResponse>('/planning/stats');
};
