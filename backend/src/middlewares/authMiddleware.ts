import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel';
import logger from '../utils/logger';

// 恢复原始的JWT密钥，确保与现有令牌兼容
const JWT_SECRET = 'frp-manager-secret-key';
const JWT_EXPIRATION = '24h';

// 为Request接口扩展，添加user属性
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
      };
    }
  }
}

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
  // 从请求头中获取令牌
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: '未提供认证令牌' });
  }

  try {
    // 验证令牌
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string };
    
    // 查找用户
    const user = await userModel.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ success: false, message: '用户不存在或令牌无效' });
    }
    
    // 将用户信息添加到请求对象中
    req.user = { id: decoded.id, username: decoded.username };
    
    next();
  } catch (error) {
    logger.error(`认证失败: ${error}`);
    res.status(401).json({ success: false, message: '认证失败，令牌无效' });
  }
}; 