import axios from 'axios';
import { getApiBaseUrl } from '../utils/apiConfig';

// 使用apiConfig中的函数获取API基础URL
const API_URL = `${getApiBaseUrl()}/api`;

// 定义接口类型
export interface FrpConfig {
  id: string;
  name: string;
  type: 'frpc' | 'frps';
  status: 'running' | 'stopped' | 'error';
  configPath: string;
  folderPath: string;
  createdAt: string;
  updatedAt: string;
}

// 获取所有配置
export const getAllConfigs = async (): Promise<FrpConfig[]> => {
  const response = await axios.get(`${API_URL}/configs`);
  return response.data.data;
};

// 获取单个配置
export const getConfig = async (id: string): Promise<FrpConfig> => {
  const response = await axios.get(`${API_URL}/configs/${id}`);
  return response.data.data;
};

// 创建配置
export const createConfig = async (name: string, type: 'frpc' | 'frps', content: string): Promise<FrpConfig> => {
  const response = await axios.post(`${API_URL}/configs`, { name, type, content });
  return response.data.data;
};

// 编辑配置
export const editConfig = async (id: string, content: string): Promise<FrpConfig> => {
  const response = await axios.put(`${API_URL}/configs/${id}`, { content });
  return response.data.data;
};

// 删除配置
export const deleteConfig = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/configs/${id}`);
};

// 启动FRP
export const startFrp = async (id: string): Promise<void> => {
  await axios.post(`${API_URL}/configs/${id}/start`);
};

// 停止FRP
export const stopFrp = async (id: string): Promise<void> => {
  await axios.post(`${API_URL}/configs/${id}/stop`);
};

// 获取FRP日志
export const getLogs = async (id: string): Promise<string[]> => {
  const response = await axios.get(`${API_URL}/configs/${id}/logs`);
  return response.data.data;
};

// 获取模板配置
export const getTemplateConfig = async (type: 'frpc' | 'frps'): Promise<string> => {
  const response = await axios.get(`${API_URL}/templates/${type}`);
  return response.data.data;
};

// 读取配置文件
export const readConfigFile = async (id: string): Promise<string> => {
  const response = await axios.get(`${API_URL}/configs/${id}/content`);
  return response.data.data;
};