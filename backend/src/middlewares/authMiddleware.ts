import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel';
import logger from '../utils/logger';

// JWT密钥，实际应用中应该存储在环境变量中
const JWT_SECRET = 'frp-manager-secret-key';

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
export const generateToken = (userId: string, username: string): string => {
  return jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '24h' });
};

// 验证JWT令牌的中间件
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
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
    const user = userModel.findById(decoded.id);
    
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