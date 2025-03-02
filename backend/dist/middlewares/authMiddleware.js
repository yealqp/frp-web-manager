"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
const logger_1 = __importDefault(require("../utils/logger"));
// JWT密钥，实际应用中应该存储在环境变量中
const JWT_SECRET = 'frp-manager-secret-key';
// 生成JWT令牌
const generateToken = (userId, username) => {
    return jsonwebtoken_1.default.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '24h' });
};
exports.generateToken = generateToken;
// 验证JWT令牌的中间件
const authMiddleware = (req, res, next) => {
    // 从请求头中获取令牌
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: '未提供认证令牌' });
    }
    try {
        // 验证令牌
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // 查找用户
        const user = userModel_1.default.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ success: false, message: '用户不存在或令牌无效' });
        }
        // 将用户信息添加到请求对象中
        req.user = { id: decoded.id, username: decoded.username };
        next();
    }
    catch (error) {
        logger_1.default.error(`认证失败: ${error}`);
        res.status(401).json({ success: false, message: '认证失败，令牌无效' });
    }
};
exports.authMiddleware = authMiddleware;
