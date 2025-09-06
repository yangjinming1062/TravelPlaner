import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as userApi from '../api/user';
import * as planningApi from '../api/planning';
import { 
  LoginRequest, 
  RegisterRequest, 
  UpdateUserProfileRequest,
  UpdatePasswordRequest
} from '../types/user';
import {
  PlanningSingleTaskSchema,
  PlanningRouteTaskSchema,
  PlanningMultiTaskSchema,
  PlanningSmartTaskSchema,
  PlanningResultFavoriteRequest,
  PlanningSingleListRequest,
  PlanningRouteListRequest,
  PlanningMultiListRequest,
  PlanningSmartListRequest
} from '../types/planning';

// 用户相关 Hooks
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: LoginRequest) => userApi.login(data),
    onSuccess: (data) => {
      // 保存 token 到 localStorage
      localStorage.setItem('token', data.token);
      // 更新用户信息缓存
      queryClient.setQueryData(['user'], data.user);
    }
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RegisterRequest) => userApi.register(data),
    onSuccess: (data) => {
      // 保存 token 到 localStorage
      localStorage.setItem('token', data.token);
      // 更新用户信息缓存
      queryClient.setQueryData(['user'], data.user);
    }
  });
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: userApi.getUserProfile,
    staleTime: 1000 * 60 * 5 // 5分钟
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateUserProfileRequest) => userApi.updateUserProfile(data),
    onSuccess: (data) => {
      // 更新用户信息缓存
      queryClient.setQueryData(['user'], data);
    }
  });
};

export const useUserPreferences = () => {
  return useQuery({
    queryKey: ['user-preferences'],
    queryFn: userApi.getUserPreferences,
    staleTime: 1000 * 60 * 5 // 5分钟
  });
};

export const useUpdateUserPreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<any>) => userApi.updateUserPreferences(data),
    onSuccess: (data) => {
      // 更新用户偏好缓存
      queryClient.setQueryData(['user-preferences'], data);
    }
  });
};

// 规划相关 Hooks
// 单一目的地规划
export const useCreateSinglePlan = () => {
  return useMutation({
    mutationFn: (data: PlanningSingleTaskSchema) => planningApi.createSinglePlan(data)
  });
};

export const useSinglePlans = (params: PlanningSingleListRequest) => {
  return useQuery({
    queryKey: ['single-plans', params],
    queryFn: () => planningApi.getSinglePlans(params)
  });
};

export const useSinglePlanResult = (taskId: string) => {
  return useQuery({
    queryKey: ['single-plan-result', taskId],
    queryFn: () => planningApi.getSinglePlanResult(taskId),
    retry: 3, // 对于规划结果，可能需要重试几次，因为生成需要时间
    retryDelay: 3000 // 3秒后重试
  });
};

// 沿途游玩规划
export const useCreateRoutePlan = () => {
  return useMutation({
    mutationFn: (data: PlanningRouteTaskSchema) => planningApi.createRoutePlan(data)
  });
};

export const useRoutePlans = (params: PlanningRouteListRequest) => {
  return useQuery({
    queryKey: ['route-plans', params],
    queryFn: () => planningApi.getRoutePlans(params)
  });
};

export const useRoutePlanResult = (taskId: string) => {
  return useQuery({
    queryKey: ['route-plan-result', taskId],
    queryFn: () => planningApi.getRoutePlanResult(taskId),
    retry: 3,
    retryDelay: 3000
  });
};

// 多节点规划
export const useCreateMultiPlan = () => {
  return useMutation({
    mutationFn: (data: PlanningMultiTaskSchema) => planningApi.createMultiPlan(data)
  });
};

export const useMultiPlans = (params: PlanningMultiListRequest) => {
  return useQuery({
    queryKey: ['multi-plans', params],
    queryFn: () => planningApi.getMultiPlans(params)
  });
};

export const useMultiPlanResult = (taskId: string) => {
  return useQuery({
    queryKey: ['multi-plan-result', taskId],
    queryFn: () => planningApi.getMultiPlanResult(taskId),
    retry: 3,
    retryDelay: 3000
  });
};

// 智能推荐规划
export const useCreateSmartPlan = () => {
  return useMutation({
    mutationFn: (data: PlanningSmartTaskSchema) => planningApi.createSmartPlan(data)
  });
};

export const useSmartPlans = (params: PlanningSmartListRequest) => {
  return useQuery({
    queryKey: ['smart-plans', params],
    queryFn: () => planningApi.getSmartPlans(params)
  });
};

export const useSmartPlanResult = (taskId: string) => {
  return useQuery({
    queryKey: ['smart-plan-result', taskId],
    queryFn: () => planningApi.getSmartPlanResult(taskId),
    retry: 3,
    retryDelay: 3000
  });
};

// 通用规划操作
export const useUpdatePlanFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskType, taskId, data }: { taskType: string; taskId: string; data: PlanningResultFavoriteRequest }) => 
      planningApi.updatePlanFavorite(taskType, taskId, data),
    onSuccess: () => {
      // 失效相关查询以触发重新获取
      queryClient.invalidateQueries({ queryKey: ['single-plans'] });
      queryClient.invalidateQueries({ queryKey: ['route-plans'] });
      queryClient.invalidateQueries({ queryKey: ['multi-plans'] });
      queryClient.invalidateQueries({ queryKey: ['smart-plans'] });
    }
  });
};

export const usePlanningStats = () => {
  return useQuery({
    queryKey: ['planning-stats'],
    queryFn: planningApi.getPlanningStats
  });
};