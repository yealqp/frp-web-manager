"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const frpController = __importStar(require("../controllers/frpController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// 所有FRP路由都需要身份验证
router.use(authMiddleware_1.authMiddleware);
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
exports.default = router;
