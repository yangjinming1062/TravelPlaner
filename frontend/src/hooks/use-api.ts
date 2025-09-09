import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as userApi from '../api/user';
import * as planningApi from '../api/planning';
import {
  LoginRequest,
  RegisterRequest,
  UpdateUserProfileRequest,
  UpdatePasswordRequest,
  UserPreferencesSchema,
  LoginResponse,
} from '../types/user';
import {
  PlanningSingleTaskSchema,
  PlanningRouteTaskSchema,
  PlanningMultiTaskSchema,
  PlanningSmartTaskSchema,
  PlanningResultFavoriteRequest,
  PlanningTaskUnifiedListRequest,
} from '../types/planning';

// 用户相关 Hooks
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => userApi.login(data),
    onSuccess: (data) => {
      // 保存 token 到 localStorage
      const loginData = data as unknown as LoginResponse;
      localStorage.setItem('token', loginData.token);
      // 更新用户信息缓存
      queryClient.setQueryData(['user'], loginData.user);
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => userApi.register(data),
    onSuccess: (data) => {
      // 保存 token 到 localStorage
      const loginData = data as unknown as LoginResponse;
      localStorage.setItem('token', loginData.token);
      // 更新用户信息缓存
      queryClient.setQueryData(['user'], loginData.user);
    },
  });
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: userApi.getUserProfile,
    staleTime: 1000 * 60 * 5, // 5分钟
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserProfileRequest) =>
      userApi.updateUserProfile(data),
    onSuccess: (data) => {
      // 更新用户信息缓存
      queryClient.setQueryData(['user'], data);
    },
  });
};

export const useUserPreferences = () => {
  return useQuery({
    queryKey: ['user-preferences'],
    queryFn: userApi.getUserPreferences,
    staleTime: 1000 * 60 * 5, // 5分钟
  });
};

export const useUpdateUserPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<UserPreferencesSchema>) =>
      userApi.updateUserPreferences(data),
    onSuccess: (data) => {
      // 更新用户偏好缓存
      queryClient.setQueryData(['user-preferences'], data);
      // 更新用户信息缓存中的preferences_configured字段
      queryClient.setQueryData(['user'], (oldData: any) => {
        if (oldData) {
          return { ...oldData, preferences_configured: true };
        }
        return oldData;
      });
    },
  });
};

// 规划相关 Hooks
// 单一目的地规划
export const useCreateSinglePlan = () => {
  return useMutation({
    mutationFn: (data: PlanningSingleTaskSchema) =>
      planningApi.createSinglePlan(data),
  });
};

// 通用规划任务状态查询
export const usePlanTaskStatus = (taskType: string, taskId: number) => {
  return useQuery({
    queryKey: ['plan-task-status', taskType, taskId],
    queryFn: () => planningApi.getPlanTaskStatus(taskType, taskId),
    refetchInterval: 10000, // 每10秒自动刷新状态
    refetchIntervalInBackground: true, // 后台也继续刷新
    staleTime: 0, // 立即过期，确保总是获取最新状态
  });
};

// 各规划类型的便捷状态查询hooks
export const useSinglePlanStatus = (taskId: number) =>
  usePlanTaskStatus('single', taskId);
export const useRoutePlanStatus = (taskId: number) =>
  usePlanTaskStatus('route', taskId);
export const useMultiPlanStatus = (taskId: number) =>
  usePlanTaskStatus('multi', taskId);
export const useSmartPlanStatus = (taskId: number) =>
  usePlanTaskStatus('smart', taskId);

export const useSinglePlanResult = (
  taskId: number,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ['single-plan-result', taskId],
    queryFn: () => planningApi.getSinglePlanResult(taskId),
    enabled: enabled, // 只有在任务完成时才尝试获取结果
    retry: (failureCount, error: any) => {
      // 如果是任务正在处理中的错误，不重试
      if (error?.response?.status === 400) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: 5000, // 5秒后重试
  });
};

// 沿途游玩规划
export const useCreateRoutePlan = () => {
  return useMutation({
    mutationFn: (data: PlanningRouteTaskSchema) =>
      planningApi.createRoutePlan(data),
  });
};

export const useRoutePlanResult = (taskId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['route-plan-result', taskId],
    queryFn: () => planningApi.getRoutePlanResult(taskId),
    enabled: enabled,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 400) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: 5000,
  });
};

// 多节点规划
export const useCreateMultiPlan = () => {
  return useMutation({
    mutationFn: (data: PlanningMultiTaskSchema) =>
      planningApi.createMultiPlan(data),
  });
};

export const useMultiPlanResult = (taskId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['multi-plan-result', taskId],
    queryFn: () => planningApi.getMultiPlanResult(taskId),
    enabled: enabled,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 400) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: 5000,
  });
};

// 智能推荐规划
export const useCreateSmartPlan = () => {
  return useMutation({
    mutationFn: (data: PlanningSmartTaskSchema) =>
      planningApi.createSmartPlan(data),
  });
};

export const useSmartPlanResult = (taskId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['smart-plan-result', taskId],
    queryFn: () => planningApi.getSmartPlanResult(taskId),
    enabled: enabled,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 400) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: 5000,
  });
};

// 通用规划操作
export const useUpdatePlanFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskType,
      taskId,
      data,
    }: {
      taskType: string;
      taskId: number;
      data: PlanningResultFavoriteRequest;
    }) => planningApi.updatePlanFavorite(taskType, taskId, data),
    onSuccess: () => {
      // 失效相关查询以触发重新获取
      queryClient.invalidateQueries({ queryKey: ['single-plans'] });
      queryClient.invalidateQueries({ queryKey: ['route-plans'] });
      queryClient.invalidateQueries({ queryKey: ['multi-plans'] });
      queryClient.invalidateQueries({ queryKey: ['smart-plans'] });
      queryClient.invalidateQueries({ queryKey: ['all-plans'] });
    },
  });
};

export const usePlanningStats = () => {
  return useQuery({
    queryKey: ['planning-stats'],
    queryFn: planningApi.getPlanningStats,
  });
};

// 统一规划查询
export const useAllPlansList = (params: PlanningTaskUnifiedListRequest) => {
  return useQuery({
    queryKey: ['all-plans', params],
    queryFn: () => planningApi.getAllPlans(params),
  });
};

export const useAllPlans = (params: PlanningTaskUnifiedListRequest) => {
  return useAllPlansList(params);
};
