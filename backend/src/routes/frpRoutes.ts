import { Router } from 'express';
import * as frpController from '../controllers/frpController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getServerList } from '../controllers/frpController';
import { getNodeNameByNodeId } from '../controllers/frpController';

const router = Router();

// 服务器列表（放在authMiddleware之前，允许未登录获取）
router.get('/server-list', getServerList);

// 所有FRP路由都需要身份验证
router.use(authMiddleware);

// 配置管理
router.get('/configs', frpController.getAllConfigs);
router.get('/configs/:id', frpController.getConfig);
router.post('/configs', frpController.createConfig);
router.put('/configs/:id', frpController.editConfig);
router.delete('/configs/:id', frpController.deleteConfig);

// FRP操作
router.post('/configs/:id/start', frpController.startFrp);
router.post('/configs/:id/stop', frpController.stopFrp);
router.get('/configs/:id/logs', frpController.getLogs);
router.get('/configs/:id/content', frpController.readConfigFile);

// 模板
router.get('/templates/:type', frpController.getTemplateConfig);

// 查询节点名称
router.get('/tunnels/node-name/:nodeId', getNodeNameByNodeId);

// 获取指定节点下的空闲端口
router.get('/free-port', frpController.getFreePort);

export default router; 