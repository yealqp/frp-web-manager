"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.register = exports.login = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const logger_1 = __importDefault(require("../utils/logger"));
// 用户登录
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
        }
        // 查找用户
        const user = userModel_1.default.findByUsername(username);
        if (!user) {
            return res.status(401).json({ success: false, message: '用户名或密码错误' });
        }
        // 验证密码
        const isPasswordValid = await userModel_1.default.validatePassword(user, password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: '用户名或密码错误' });
        }
        // 生成令牌
        const token = (0, authMiddleware_1.generateToken)(user.id, user.username);
        // 返回用户信息和令牌
        res.json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                token
            }
        });
    }
    catch (error) {
        logger_1.default.error(`登录失败: ${error}`);
        res.status(500).json({ success: false, message: '登录失败' });
    }
};
exports.login = login;
// 注册用户
const register = async (req, res) => {
    // 禁止注册
    logger_1.default.info(`注册请求被拒绝，注册功能已关闭`);
    return res.status(403).json({ success: false, message: '注册功能已关闭，请联系管理员' });
    // 以下代码不会执行
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
        }
        // 密码长度验证
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: '密码长度不能小于6位' });
        }
        // 创建用户
        const user = await userModel_1.default.createUser(username, password);
        // 生成令牌
        const token = (0, authMiddleware_1.generateToken)(user.id, user.username);
        // 返回用户信息和令牌
        res.status(201).json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                token
            }
        });
    }
    catch (error) {
        logger_1.default.error(`注册失败: ${error}`);
        if (error.message === '用户名已存在') {
            return res.status(400).json({ success: false, message: '用户名已存在' });
        }
        res.status(500).json({ success: false, message: '注册失败' });
    }
};
exports.register = register;
// 获取当前用户信息
const getCurrentUser = (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: '未认证' });
    }
    res.json({
        success: true,
        data: {
            id: req.user.id,
            username: req.user.username
        }
    });
};
exports.getCurrentUser = getCurrentUser;
