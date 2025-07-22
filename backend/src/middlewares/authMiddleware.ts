import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel';
import logger from '../utils/logger';

// 恢复原始的JWT密钥，确保与现有令牌兼容
const JWT_SECRET = 'frp-manager-secret-key';
const JWT_EXPIRATION = '24h';

// 生成JWT令牌
export const generateToken = (id: string, username: string): string => {
  try {
    return jwt.sign(
      { id, username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );
  } catch (error) {
    console.error('JWT令牌生成失败:', error);
    throw new Error('令牌生成失败');
  }
};

// 验证JWT令牌的中间件
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: '未提供认证令牌' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string };
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: '用户不存在或令牌无效' });
    }

    // 补充role字段
    req.user = user;
    next();
  } catch (error: any) {
    logger.error(`认证失败: ${error?.name} - ${error?.message} - token: ${token?.slice(0, 10)}...`);
    let message = '认证失败，令牌无效';
    if (error.name === 'TokenExpiredError') {
      message = '令牌已过期，请重新登录';
    } else if (error.name === 'JsonWebTokenError') {
      message = '令牌格式错误，请重新登录';
    } else if (error.name === 'NotBeforeError') {
      message = '令牌尚未生效';
    }
    res.status(401).json({ success: false, message });
  }
};

// 管理员权限中间件
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if ((req.user as any)?.role !== 'admin') {
    return res.status(403).json({ success: false, message: '需要管理员权限' });
  }
  next();
}; 