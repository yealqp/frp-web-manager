import { Request, Response } from 'express';
import userModel from '../models/userModel';
import logger from '../utils/logger';

// 创建新用户
export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: '密码长度不能小于6位' });
    }

    const user = await userModel.createUser(username, password);
    res.status(201).json({ success: true, data: { id: user.id, username: user.username, role: user.role } });
  } catch (error: any) {
    logger.error(`创建用户失败: ${error}`);
    if (error.message === '用户名已存在') {
      return res.status(400).json({ success: false, message: '用户名已存在' });
    }
    res.status(500).json({ success: false, message: '创建用户失败' });
  }
};

// 获取所有用户
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userModel.findAll();
    res.json({
      success: true,
      data: users.map((u: any) => ({
        id: u.id,
        userId: u.userId,
        username: u.username,
        role: u.role,
        source: u.source,
        tunnels: u.tunnels || [],
        tunnelLimit: u.tunnelLimit,
        tunnelCount: u.tunnels ? u.tunnels.length : 0
      }))
    });
  } catch (error) {
    logger.error(`获取用户列表失败: ${error}`);
    res.status(500).json({ success: false, message: '获取用户列表失败' });
  }
};

// 删除用户
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // 防止删除自己
    if (req.user?.id === id) {
        return res.status(400).json({ success: false, message: '不能删除当前登录用户' });
    }
    await userModel.deleteUser(id);
    res.json({ success: true, message: '用户删除成功' });
  } catch (error) {
    logger.error(`删除用户失败: ${error}`);
    res.status(500).json({ success: false, message: '删除用户失败' });
  }
};

// 管理员为用户重置密码
export const adminResetPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: '新密码不能为空且长度不能小于6位' });
    }
    const updatedUser = await userModel.updateUser(id, { password: newPassword });
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    res.json({ success: true, message: '密码重置成功' });
  } catch (error) {
    logger.error(`重置用户密码失败: ${error}`);
    res.status(500).json({ success: false, message: '重置密码失败' });
  }
};

// 管理员设置用户隧道上限
export const setTunnelLimit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tunnelLimit } = req.body;
    if (typeof tunnelLimit !== 'number' || tunnelLimit < 1) {
      return res.status(400).json({ success: false, message: '隧道上限必须为正整数' });
    }
    const updatedUser = await userModel.updateUser(id, { tunnelLimit });
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    res.json({ success: true, message: '隧道上限已更新' });
  } catch (error) {
    logger.error(`设置隧道上限失败: ${error}`);
    res.status(500).json({ success: false, message: '设置隧道上限失败' });
  }
};