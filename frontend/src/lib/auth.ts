import apiClient from '../api';

// 设置 API 基础 URL
export const setApiBaseUrl = (url: string) => {
  apiClient.defaults.baseURL = url;
};

// 获取当前 token
export const getToken = () => {
  return localStorage.getItem('token');
};

// 设置 token
export const setToken = (token: string) => {
  localStorage.setItem('token', token);
};

// 清除 token
export const clearToken = () => {
  localStorage.removeItem('token');
};

// 检查是否已登录
export const isAuthenticated = () => {
  return !!getToken();
};