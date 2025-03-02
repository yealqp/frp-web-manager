import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';
import logger from '../utils/logger';

const router = Router();

// 公开路由
router.post('/login', authController.login);
// router.post('/register', authController.register); // 禁用注册功能

// 添加一个拒绝注册的路由
router.post('/register', (req, res) => {
  logger.info('注册请求被拒绝，注册功能已关闭');
  return res.status(403).json({ success: false, message: '注册功能已关闭，请联系管理员' });
});

// 需要认证的路由
router.get('/me', authMiddleware, authController.getMe);

// 用户信息更新路由
router.put('/update-user', authMiddleware, authController.updateUser);

export default router; 