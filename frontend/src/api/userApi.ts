import axios from 'axios';
import { getApiBaseUrl } from '../utils/apiConfig';
export interface User {
  id: string;
  userId?: number;
  username: string;
  role?: string;
  token?: string;
  source?: string;
  createdAt?: string;
  tunnels?: Array<{ tunnelId: number; name: string; configFile: string; }>;
}

const API_URL = `${getApiBaseUrl()}/api/users`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

// 获取所有用户
export const getAllUsers = async (): Promise<User[]> => {
  const response = await axios.get(`${API_URL}/`, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

// 创建新用户
export const createUser = async (username: string, password: string, source: string = '手动添加'): Promise<User> => {
  const response = await axios.post(`${API_URL}/`, { username, password, source }, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

// 删除用户
export const deleteUser = async (userId: string): Promise<void> => {
  await axios.delete(`${API_URL}/${userId}`, {
    headers: getAuthHeaders(),
  });
};

// 修改用户密码
export const updateUserPassword = async (userId: string, newPassword: string): Promise<void> => {
  await axios.put(`${API_URL}/${userId}/password`, { newPassword }, {
    headers: getAuthHeaders(),
  });
};

// 设置用户隧道上限
export const setTunnelLimit = async (userId: string, tunnelLimit: number): Promise<void> => {
  await axios.put(`${API_URL}/${userId}/tunnel-limit`, { tunnelLimit }, {
    headers: getAuthHeaders(),
  });
};