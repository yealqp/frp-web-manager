import axios from 'axios';

// 确定API基础URL的函数
export const getApiBaseUrl = (): string => {
  // 优先使用环境变量中的API URL
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }

  // 检查localStorage中是否有存储的自定义API地址
  const storedApiUrl = localStorage.getItem('api_base_url');
  if (storedApiUrl) {
    return storedApiUrl;
  }

  // 根据当前访问环境推断后端地址
  // 如果是localhost，使用localhost:3001
  // 否则使用同一主机名但端口为3001
  const currentProtocol = window.location.protocol;
  const currentHostname = window.location.hostname;
  
  if (currentHostname === 'localhost') {
    return 'http://localhost:3001';
  }
  
  // 默认使用与前端相同的协议和主机名，但端口为3001
  return `${currentProtocol}//${currentHostname}:3001`;
};

// 设置自定义API地址
export const setCustomApiBaseUrl = (url: string): void => {
  localStorage.setItem('api_base_url', url);
  // 刷新页面以应用新设置
  window.location.reload();
};

// 重置API地址为默认值
export const resetApiBaseUrl = (): void => {
  localStorage.removeItem('api_base_url');
  window.location.reload();
};

// 配置axios默认设置
axios.defaults.headers.common['Content-Type'] = 'application/json';

// 配置axios拦截器
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default {
  getApiBaseUrl,
  setCustomApiBaseUrl,
  resetApiBaseUrl
}; 