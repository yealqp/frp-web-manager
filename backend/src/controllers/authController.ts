import { Request, Response } from 'express';
import userModel from '../models/userModel';
import { generateToken } from '../middlewares/authMiddleware';
import logger from '../utils/logger';

// 用户登录
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }
    
    // 查找用户
    const user = userModel.findByUsername(username);
    
    if (!user) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
    
    // 验证密码
    const isPasswordValid = await userModel.validatePassword(user, password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
    
    // 生成令牌
    const token = generateToken(user.id, user.username);
    
    // 返回用户信息和令牌
    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        token
      }
    });
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
      username: req.user.username
    }
  });
}; 