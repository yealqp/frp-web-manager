import { Router } from 'express';
import { createUser, getAllUsers, deleteUser, adminResetPassword, setTunnelLimit } from '../controllers/userController';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// 所有用户管理路由都需要认证和管理员权限

// 创建新用户 (仅管理员)
router.post('/', authMiddleware, adminMiddleware, createUser);

// 获取所有用户 (仅管理员)
router.get('/', authMiddleware, adminMiddleware, getAllUsers);

// 删除用户 (仅管理员)
router.delete('/:id', authMiddleware, adminMiddleware, deleteUser);

// 修改用户密码 (仅管理员)
router.put('/:id/password', authMiddleware, adminMiddleware, adminResetPassword);

// 设置用户隧道上限 (仅管理员)
router.put('/:id/tunnel-limit', authMiddleware, adminMiddleware, setTunnelLimit);

export default router;