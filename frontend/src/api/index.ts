import axios from 'axios';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // token 过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // 提取后端返回的错误信息
    if (error.response?.data?.message) {
      // 创建一个新的错误对象，将后端的错误信息作为 message
      const customError = new Error(error.response.data.message);
      customError.name = 'APIError';
      // 保留原始的响应信息
      (customError as any).response = error.response;
      (customError as any).code = error.response.data.code;
      (customError as any).details = error.response.data.details;
      return Promise.reject(customError);
    }
    
    return Promise.reject(error);
  },
);

export default apiClient;
