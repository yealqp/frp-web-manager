import { Request, Response } from 'express';
import userModel from '../models/userModel';
import logger from '../utils/logger';
import { generateToken } from '../middlewares/authMiddleware';
import fs from 'fs';
import path from 'path';

// 用户登录
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    logger.info(`尝试登录，用户名: ${username}`);
    
    if (!username || !password) {
      logger.warn(`登录失败: 用户名或密码为空，用户名: ${username}`);
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }
    
    // 查找用户
    const user = await userModel.findByUsername(username);
    
    if (!user) {
      logger.warn(`登录失败: 用户不存在，用户名: ${username}`);
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
    
    logger.info(`找到用户: ${username}, 用户ID: ${user.id}`);
    
    // 验证密码
    try {
      const isPasswordValid = await userModel.validatePassword(user.id, password);
      
      if (!isPasswordValid) {
        logger.warn(`登录失败: 密码验证失败，用户名: ${username}`);
        return res.status(401).json({ success: false, message: '用户名或密码错误' });
      }
      
      logger.info(`密码验证成功，用户名: ${username}`);
      
      // 生成令牌
      const token = generateToken(user.id, user.username);
      
      logger.info(`登录成功，为用户 ${username} 生成了令牌`);
      
      // 返回用户信息和令牌
      res.json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          role: user.role,
          token
        }
      });
    } catch (error) {
      logger.error(`密码验证过程中出错: ${error}`);
      return res.status(500).json({ success: false, message: '登录过程中出错，请稍后再试' });
    }
  } catch (error) {
    logger.error(`登录失败: ${error}`);
    res.status(500).json({ success: false, message: '登录失败' });
  }
};

// 注册用户
export const register = async (req: Request, res: Response) => {
  // 禁止注册
  logger.info(`注册请求被拒绝，注册功能已关闭`);
  return res.status(403).json({ success: false, message: '注册功能已关闭，请联系管理员' });

  // 以下代码不会执行
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }
    
    // 密码长度验证
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: '密码长度不能小于6位' });
    }
    
    // 创建用户
    const user = await userModel.createUser(username, password);
    
    // 生成令牌
    const token = generateToken(user.id, user.username);
    
    // 返回用户信息和令牌
    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        token
      }
    });
  } catch (error: any) {
    logger.error(`注册失败: ${error}`);
    
    if (error.message === '用户名已存在') {
      return res.status(400).json({ success: false, message: '用户名已存在' });
    }
    
    res.status(500).json({ success: false, message: '注册失败' });
  }
};

// 获取当前用户信息
export const getCurrentUser = (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: '未认证' });
  }
  
  res.json({
    success: true,
    data: {
      id: req.user.id,
      userId: req.user.userId,
      username: req.user.username,
      role: req.user.role,
      createdAt: req.user.createdAt
    }
  });
};

// 用户登出
export const logout = (req: Request, res: Response) => {
  // JWT 无需服务端失效处理，前端丢弃即可
  res.json({ success: true, message: '成功登出' });
};

// 获取当前用户信息
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }
    
    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    res.json({
      success: true,
      data: {
        id: user.id,
        userId: user.userId,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error(`获取用户信息错误: ${error}`);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 更新用户信息
export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }
    
    const { newUsername, currentPassword, newPassword } = req.body;
    
    logger.info(`用户 ${userId} 请求更新信息: ${JSON.stringify({
      hasNewUsername: !!newUsername,
      hasCurrentPassword: !!currentPassword,
      hasNewPassword: !!newPassword
    })}`);
    
    // 只有在提供了当前密码和新密码时才更新密码
    if (currentPassword && newPassword) {
      // 验证密码类型
      if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
        return res.status(400).json({ success: false, message: '密码必须是字符串类型' });
      }
      
      // 密码长度验证
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: '新密码长度不能小于6位' });
      }
      
      // 验证当前密码
      try {
        const isValidPassword = await userModel.validatePassword(userId, currentPassword);
        
        if (!isValidPassword) {
          return res.status(401).json({ success: false, message: '当前密码错误' });
        }
        
        // 更新密码
        await userModel.updateUser(userId, { password: newPassword });
        logger.info(`用户 ${userId} 更新了密码`);
      } catch (error) {
        logger.error(`密码验证/更新失败: ${error}`);
        return res.status(500).json({ success: false, message: '密码更新失败' });
      }
    }
    
    // 只有在提供了新用户名时才更新用户名
    if (newUsername) {
      // 验证用户名类型
      if (typeof newUsername !== 'string') {
        return res.status(400).json({ success: false, message: '用户名必须是字符串类型' });
      }
      
      // 用户名长度验证
      if (newUsername.length < 3) {
        return res.status(400).json({ success: false, message: '用户名长度不能小于3位' });
      }
      
      try {
        // 检查新用户名是否已存在
        const existingUser = await userModel.findByUsername(newUsername);
        
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ success: false, message: '用户名已存在' });
        }
        
        // 更新用户名
        await userModel.updateUser(userId, { username: newUsername });
        logger.info(`用户 ${userId} 更新了用户名为 ${newUsername}`);
      } catch (error) {
        logger.error(`用户名更新失败: ${error}`);
        return res.status(500).json({ success: false, message: '用户名更新失败' });
      }
    }
    
    // 如果没有提供任何更新内容
    if (!newUsername && !newPassword) {
      return res.status(400).json({ success: false, message: '未提供任何更新内容' });
    }
    
    // 获取更新后的用户信息
    const updatedUser = await userModel.findById(userId);
    
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    // 生成新的JWT令牌（因为用户名可能已更改）
    try {
      const token = generateToken(updatedUser.id, updatedUser.username);
      
      res.json({
        success: true,
        data: {
          id: updatedUser.id,
          username: updatedUser.username,
          token
        }
      });
    } catch (error) {
      logger.error(`生成令牌失败: ${error}`);
      return res.status(500).json({ success: false, message: '生成令牌失败' });
    }
  } catch (error) {
    logger.error(`更新用户信息错误: ${error}`);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 获取系统公告
export const getNotice = (req: Request, res: Response) => {
  const filePath = path.resolve(__dirname, '../../data/notice.md');
  try {
    const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, message: '读取公告失败' });
  }
};
// 编辑系统公告（仅管理员）
export const setNotice = (req: Request, res: Response) => {
  const filePath = path.resolve(__dirname, '../../data/notice.md');
  const { content } = req.body;
  if (typeof content !== 'string') {
    return res.status(400).json({ success: false, message: '内容不能为空' });
  }
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: '保存公告失败' });
  }
};