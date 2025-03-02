"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const frpRoutes_1 = __importDefault(require("./routes/frpRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const frpService_1 = __importDefault(require("./services/frpService"));
const logger_1 = __importDefault(require("./utils/logger"));
const userModel_1 = __importDefault(require("./models/userModel"));
// 创建Express应用
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// 设置Socket.IO
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
});
// 将Socket.IO实例传递给FrpService
frpService_1.default.setSocketIo(io);
// 中间件
app.use((0, cors_1.default)({
    origin: '*', // 允许所有来源的请求
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 允许这些HTTP方法
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'] // 允许这些请求头
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// 为静态前端文件提供服务（如果在生产环境）
if (process.env.NODE_ENV === 'production') {
    app.use(express_1.default.static(path_1.default.join(__dirname, '../../frontend/build')));
}
// API路由
app.use('/api/auth', authRoutes_1.default);
app.use('/api', frpRoutes_1.default);
// 未找到的路由
app.use((req, res) => {
    if (process.env.NODE_ENV === 'production') {
        // 在生产环境中，将所有未知请求重定向到前端应用
        res.sendFile(path_1.default.join(__dirname, '../../frontend/build', 'index.html'));
    }
    else {
        res.status(404).json({ message: '资源未找到' });
    }
});
// Socket.IO连接处理
io.on('connection', (socket) => {
    logger_1.default.info('用户已连接');
    socket.on('disconnect', () => {
        logger_1.default.info('用户已断开连接');
    });
});
// 初始化默认管理员账户
(async () => {
    try {
        await userModel_1.default.initAdminUser();
    }
    catch (error) {
        logger_1.default.error(`初始化管理员账户失败: ${error}`);
    }
})();
// 启动服务器
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    logger_1.default.info(`服务器运行在端口 ${PORT}`);
});
// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    logger_1.default.error(`未捕获的异常: ${error}`);
});
// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
    logger_1.default.error(`未处理的Promise拒绝: ${reason}`);
});
