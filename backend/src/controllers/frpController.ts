import { Request, Response } from 'express';
import frpService from '../services/frpService';
import logger from '../utils/logger';
import fs from 'fs';
import path from 'path';
import userModel from '../models/userModel';

// 获取所有配置
export const getAllConfigs = async (req: Request, res: Response) => {
  try {
    let configs;
    if (req.user?.role === 'admin') {
      configs = frpService.getConfigs();
    } else {
      // 普通用户只显示自己拥有的隧道
      const user = await userModel.findById(String(req.user?.id));
      const tunnelIds = user?.tunnels?.map(t => t.tunnelId) || [];
      configs = frpService.getConfigs().filter(cfg => tunnelIds.includes(cfg.tunnelId));
    }
    res.json({ success: true, data: configs });
  } catch (error) {
    logger.error(`获取所有配置失败: ${error}`);
    res.status(500).json({ success: false, message: '获取配置失败' });
  }
};

// 获取单个配置
export const getConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const config = frpService.getConfig(id);
    
    if (!config) {
      return res.status(404).json({ success: false, message: '配置不存在' });
    }
    
    // 权限校验
    if (req.user?.role !== 'admin') {
      const user = await userModel.findById(String(req.user?.id));
      const tunnelIds = user?.tunnels?.map(t => t.tunnelId) || [];
      if (!tunnelIds.includes(config.tunnelId)) {
        return res.status(403).json({ success: false, message: '无权访问该隧道' });
      }
    }
    
    res.json({ success: true, data: config });
  } catch (error) {
    logger.error(`获取配置失败: ${error}`);
    res.status(500).json({ success: false, message: '获取配置失败' });
  }
};

// 创建配置
export const createConfig = async (req: Request, res: Response) => {
  try {
    const { name, type, content } = req.body;
    
    if (!name || !type || !content) {
      return res.status(400).json({ success: false, message: '缺少必要参数' });
    }
    
    if (type !== 'frpc') {
      return res.status(400).json({ success: false, message: '类型必须是 frpc' });
    }
    
    const config = await frpService.createConfig(name, type, content, req.user?.id);
    res.json({ success: true, data: config });
  } catch (error) {
    logger.error(`创建配置失败: ${error}`);
    res.status(500).json({ success: false, message: '创建配置失败' });
  }
};

// 编辑配置
export const editConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, message: '缺少配置内容' });
    }
    
    const config = await frpService.editConfig(id, content);
    
    if (!config) {
      return res.status(404).json({ success: false, message: '配置不存在' });
    }
    
    // 权限校验
    if (req.user?.role !== 'admin') {
      const user = await userModel.findById(String(req.user?.id));
      const tunnelIds = user?.tunnels?.map(t => t.tunnelId) || [];
      if (!tunnelIds.includes(config.tunnelId)) {
        return res.status(403).json({ success: false, message: '无权访问该隧道' });
      }
    }
    
    res.json({ success: true, data: config });
  } catch (error: any) {
    logger.error(`编辑配置失败: ${error}`);
    res.status(500).json({ success: false, message: `编辑配置失败: ${error.message || '未知错误'}` });
  }
};

// 删除配置
export const deleteConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await frpService.deleteConfig(id);
    
    if (!result) {
      return res.status(404).json({ success: false, message: '配置不存在' });
    }
    
    // 权限校验
    if (req.user?.role !== 'admin') {
      const user = await userModel.findById(String(req.user?.id));
      const tunnelIds = user?.tunnels?.map(t => t.tunnelId) || [];
      const config = frpService.getConfig(id); // Re-fetch config to check tunnelId
      if (config && !tunnelIds.includes(config.tunnelId)) {
        return res.status(403).json({ success: false, message: '无权访问该隧道' });
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    logger.error(`删除配置失败: ${error}`);
    res.status(500).json({ success: false, message: '删除配置失败' });
  }
};

// 启动FRP
export const startFrp = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await frpService.startFrp(id);
    
    if (!result) {
      return res.status(500).json({ success: false, message: '启动FRP失败' });
    }
    
    // 权限校验
    if (req.user?.role !== 'admin') {
      const user = await userModel.findById(String(req.user?.id));
      const tunnelIds = user?.tunnels?.map(t => t.tunnelId) || [];
      const config = frpService.getConfig(id); // Re-fetch config to check tunnelId
      if (config && !tunnelIds.includes(config.tunnelId)) {
        return res.status(403).json({ success: false, message: '无权访问该隧道' });
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    logger.error(`启动FRP失败: ${error}`);
    res.status(500).json({ success: false, message: '启动FRP失败' });
  }
};

// 停止FRP
export const stopFrp = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await frpService.stopFrp(id);
    
    if (!result) {
      return res.status(500).json({ success: false, message: '停止FRP失败' });
    }
    
    // 权限校验
    if (req.user?.role !== 'admin') {
      const user = await userModel.findById(String(req.user?.id));
      const tunnelIds = user?.tunnels?.map(t => t.tunnelId) || [];
      const config = frpService.getConfig(id); // Re-fetch config to check tunnelId
      if (config && !tunnelIds.includes(config.tunnelId)) {
        return res.status(403).json({ success: false, message: '无权访问该隧道' });
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    logger.error(`停止FRP失败: ${error}`);
    res.status(500).json({ success: false, message: '停止FRP失败' });
  }
};

// 获取FRP日志
export const getLogs = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const logs = frpService.getLogs(id);
    res.json({ success: true, data: logs });
  } catch (error) {
    logger.error(`获取日志失败: ${error}`);
    res.status(500).json({ success: false, message: '获取日志失败' });
  }
};

// 获取模板配置
export const getTemplateConfig = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    
    if (type !== 'frpc') {
      return res.status(400).json({ success: false, message: '类型必须是 frpc' });
    }
    
    const template = frpService.getTemplateConfig(type);
    res.json({ success: true, data: template });
  } catch (error) {
    logger.error(`获取模板配置失败: ${error}`);
    res.status(500).json({ success: false, message: '获取模板配置失败' });
  }
};

// 读取配置文件
export const readConfigFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const content = await frpService.readConfigFile(id);
    
    if (content === null) {
      return res.status(404).json({ success: false, message: '配置文件不存在' });
    }
    
    // 权限校验
    if (req.user?.role !== 'admin') {
      const user = await userModel.findById(String(req.user?.id));
      const tunnelIds = user?.tunnels?.map(t => t.tunnelId) || [];
      const config = frpService.getConfig(id); // Re-fetch config to check tunnelId
      if (config && !tunnelIds.includes(config.tunnelId)) {
        return res.status(403).json({ success: false, message: '无权访问该隧道' });
      }
    }
    
    res.json({ success: true, data: content });
  } catch (error) {
    logger.error(`读取配置文件失败: ${error}`);
    res.status(500).json({ success: false, message: '读取配置文件失败' });
  }
}; 

// 获取服务器列表
export const getServerList = (req: Request, res: Response) => {
  const filePath = path.resolve(__dirname, '../../config/serverList.json');
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    res.json({ success: true, data: JSON.parse(data) });
  } catch (error) {
    res.status(500).json({ success: false, message: '读取服务器列表失败' });
  }
}; 

// 通过nodeId查找节点名称
export const getNodeNameByNodeId = (req: Request, res: Response) => {
  const nodeId = Number(req.params.nodeId);
  if (!nodeId) return res.status(400).json({ success: false, message: '参数错误' });
  const name = frpService.getNodeNameByNodeId(nodeId);
  if (!name) return res.status(404).json({ success: false, message: '未找到节点' });
  res.json({ success: true, data: name });
}; 