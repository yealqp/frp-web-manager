import { Request, Response, NextFunction } from 'express';
import userModel from '../models/userModel';

// 不再需要JwtPayload接口

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if ((req.user as any)?.role !== 'admin') {
    return res.status(403).json({ success: false, message: '需要管理员权限' });
  }
  next();
};