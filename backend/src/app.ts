import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import path from 'path';
import frpRoutes from './routes/frpRoutes';
import authRoutes from './routes/authRoutes';
import frpService from './services/frpService';
import logger from './utils/logger';
import userModel from './models/userModel';

// 创建Express应用
const app = express();
const server = http.createServer(app);

// 设置Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

// 将Socket.IO实例传递给FrpService
frpService.setSocketIo(io);

// 中间件
app.use(cors({
  origin: '*', // 允许所有来源的请求
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 允许这些HTTP方法
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'] // 允许这些请求头
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 为静态前端文件提供服务（如果在生产环境）
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
}

// API路由
app.use('/api/auth', authRoutes);
app.use('/api', frpRoutes);

// 未找到的路由
app.use((req, res) => {
  if (process.env.NODE_ENV === 'production') {
    // 在生产环境中，将所有未知请求重定向到前端应用
    res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
  } else {
    res.status(404).json({ message: '资源未找到' });
  }
});

// Socket.IO连接处理
io.on('connection', (socket) => {
  logger.info('用户已连接');
  
  socket.on('disconnect', () => {
    logger.info('用户已断开连接');
  });
});

// 初始化默认管理员账户
(async () => {
  try {
    await userModel.initAdminUser();
  } catch (error) {
    logger.error(`初始化管理员账户失败: ${error}`);
  }
})();

// 启动服务器
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  logger.info(`服务器运行在端口 ${PORT}`);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error(`未捕获的异常: ${error}`);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`未处理的Promise拒绝: ${reason}`);
}); 