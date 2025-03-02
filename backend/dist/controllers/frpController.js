"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readConfigFile = exports.getTemplateConfig = exports.getLogs = exports.stopFrp = exports.startFrp = exports.deleteConfig = exports.editConfig = exports.createConfig = exports.getConfig = exports.getAllConfigs = void 0;
const frpService_1 = __importDefault(require("../services/frpService"));
const logger_1 = __importDefault(require("../utils/logger"));
// 获取所有配置
const getAllConfigs = async (req, res) => {
    try {
        const configs = frpService_1.default.getConfigs();
        res.json({ success: true, data: configs });
    }
    catch (error) {
        logger_1.default.error(`获取所有配置失败: ${error}`);
        res.status(500).json({ success: false, message: '获取配置失败' });
    }
};
exports.getAllConfigs = getAllConfigs;
// 获取单个配置
const getConfig = async (req, res) => {
    try {
        const { id } = req.params;
        const config = frpService_1.default.getConfig(id);
        if (!config) {
            return res.status(404).json({ success: false, message: '配置不存在' });
        }
        res.json({ success: true, data: config });
    }
    catch (error) {
        logger_1.default.error(`获取配置失败: ${error}`);
        res.status(500).json({ success: false, message: '获取配置失败' });
    }
};
exports.getConfig = getConfig;
// 创建配置
const createConfig = async (req, res) => {
    try {
        const { name, type, content } = req.body;
        if (!name || !type || !content) {
            return res.status(400).json({ success: false, message: '缺少必要参数' });
        }
        if (type !== 'frpc' && type !== 'frps') {
            return res.status(400).json({ success: false, message: '类型必须是 frpc 或 frps' });
        }
        const config = await frpService_1.default.createConfig(name, type, content);
        res.json({ success: true, data: config });
    }
    catch (error) {
        logger_1.default.error(`创建配置失败: ${error}`);
        res.status(500).json({ success: false, message: '创建配置失败' });
    }
};
exports.createConfig = createConfig;
// 编辑配置
const editConfig = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ success: false, message: '缺少配置内容' });
        }
        const config = await frpService_1.default.editConfig(id, content);
        if (!config) {
            return res.status(404).json({ success: false, message: '配置不存在' });
        }
        res.json({ success: true, data: config });
    }
    catch (error) {
        logger_1.default.error(`编辑配置失败: ${error}`);
        res.status(500).json({ success: false, message: `编辑配置失败: ${error.message || '未知错误'}` });
    }
};
exports.editConfig = editConfig;
// 删除配置
const deleteConfig = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await frpService_1.default.deleteConfig(id);
        if (!result) {
            return res.status(404).json({ success: false, message: '配置不存在' });
        }
        res.json({ success: true });
    }
    catch (error) {
        logger_1.default.error(`删除配置失败: ${error}`);
        res.status(500).json({ success: false, message: '删除配置失败' });
    }
};
exports.deleteConfig = deleteConfig;
// 启动FRP
const startFrp = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await frpService_1.default.startFrp(id);
        if (!result) {
            return res.status(500).json({ success: false, message: '启动FRP失败' });
        }
        res.json({ success: true });
    }
    catch (error) {
        logger_1.default.error(`启动FRP失败: ${error}`);
        res.status(500).json({ success: false, message: '启动FRP失败' });
    }
};
exports.startFrp = startFrp;
// 停止FRP
const stopFrp = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await frpService_1.default.stopFrp(id);
        if (!result) {
            return res.status(500).json({ success: false, message: '停止FRP失败' });
        }
        res.json({ success: true });
    }
    catch (error) {
        logger_1.default.error(`停止FRP失败: ${error}`);
        res.status(500).json({ success: false, message: '停止FRP失败' });
    }
};
exports.stopFrp = stopFrp;
// 获取FRP日志
const getLogs = async (req, res) => {
    try {
        const { id } = req.params;
        const logs = frpService_1.default.getLogs(id);
        res.json({ success: true, data: logs });
    }
    catch (error) {
        logger_1.default.error(`获取日志失败: ${error}`);
        res.status(500).json({ success: false, message: '获取日志失败' });
    }
};
exports.getLogs = getLogs;
// 获取模板配置
const getTemplateConfig = async (req, res) => {
    try {
        const { type } = req.params;
        if (type !== 'frpc' && type !== 'frps') {
            return res.status(400).json({ success: false, message: '类型必须是 frpc 或 frps' });
        }
        const template = frpService_1.default.getTemplateConfig(type);
        res.json({ success: true, data: template });
    }
    catch (error) {
        logger_1.default.error(`获取模板配置失败: ${error}`);
        res.status(500).json({ success: false, message: '获取模板配置失败' });
    }
};
exports.getTemplateConfig = getTemplateConfig;
// 读取配置文件
const readConfigFile = async (req, res) => {
    try {
        const { id } = req.params;
        const content = await frpService_1.default.readConfigFile(id);
        if (content === null) {
            return res.status(404).json({ success: false, message: '配置文件不存在' });
        }
        res.json({ success: true, data: content });
    }
    catch (error) {
        logger_1.default.error(`读取配置文件失败: ${error}`);
        res.status(500).json({ success: false, message: '读取配置文件失败' });
    }
};
exports.readConfigFile = readConfigFile;
