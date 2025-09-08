// 用户相关 API
import apiClient from './index';
import {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  UserProfileSchema,
  UserPreferencesSchema,
} from '../types/user';

// 登录
export const login = (data: LoginRequest) => {
  return apiClient.post<LoginResponse>('/user/login', data);
};

// 注册
export const register = (data: RegisterRequest) => {
  return apiClient.post<LoginResponse>('/user/register', data);
};

// 获取用户信息
export const getUserProfile = () => {
  return apiClient.get<UserProfileSchema>('/user/profile');
};

// 更新用户信息
export const updateUserProfile = (data: Partial<UserProfileSchema>) => {
  return apiClient.put<UserProfileSchema>('/user/profile', data);
};

// 获取用户偏好设置
export const getUserPreferences = () => {
  return apiClient.get<UserPreferencesSchema>('/user/preferences');
};

// 更新用户偏好设置
export const updateUserPreferences = (data: Partial<UserPreferencesSchema>) => {
  return apiClient.put<UserPreferencesSchema>('/user/preferences', data);
};
