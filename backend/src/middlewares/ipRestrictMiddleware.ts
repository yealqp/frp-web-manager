import { Request, Response, NextFunction } from 'express';

export const ipRestrictMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Express的req.ip 可能是 ::ffff:10.0.0.x、127.0.0.1、::1 等
  const ip = req.ip || req.connection.remoteAddress || '';
  // 兼容IPv4和IPv6映射
  const match = ip.match(/(\d+\.\d+\.\d+\.\d+)$/);
  const ipv4 = match ? match[1] : ip;
  if (
    (/^10\.0\.0\.[0-9]{1,3}$/.test(ipv4) && ipv4 !== '10.0.0.2') ||
    ipv4 === '127.0.0.1' ||
    ip === '::1'
  ) {
    return next();
  }
  res.status(403).json({ success: false, message: '仅允许10.0.0.x（不含10.0.0.2）或本地访问' });
}; 