import axios from 'axios';
import { getApiBaseUrl } from '../utils/apiConfig';

// 使用apiConfig中的函数获取API基础URL
const API_URL = `${getApiBaseUrl()}/api/auth`;

// 用户类型定义
export interface User {
  id: string;
  username: string;
  token?: string;
}

// 登录响应类型
interface LoginResponse {
  success: boolean;
  data: User;
}

// 登录方法
export const login = async (username: string, password: string): Promise<User> => {
  const response = await axios.post<LoginResponse>(`${API_URL}/login`, {
    username,
    password
  });
  
  // 保存令牌到本地存储
  if (response.data.data.token) {
    localStorage.setItem('token', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data));
  }
  
  return response.data.data;
};

// 注册方法
export const register = async (username: string, password: string): Promise<User> => {
  const response = await axios.post<LoginResponse>(`${API_URL}/register`, {
    username,
    password
  });
  
  // 保存令牌到本地存储
  if (response.data.data.token) {
    localStorage.setItem('token', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data));
  }
  
  return response.data.data;
};

// 登出方法
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// 获取当前用户信息
export const getCurrentUser = async (): Promise<User | null> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return null;
  }
  
  try {
    const response = await axios.get<LoginResponse>(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data.data;
  } catch (error) {
    logout();
    return null;
  }
};

// 获取当前保存的用户
export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// 设置请求拦截器添加认证令牌
// 已在apiConfig.ts中配置，此处可以删除
// axios.interceptors.request.use... 部分 