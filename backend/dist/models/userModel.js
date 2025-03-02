"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const lowdb_1 = __importDefault(require("lowdb"));
const FileSync_1 = __importDefault(require("lowdb/adapters/FileSync"));
const logger_1 = __importDefault(require("../utils/logger"));
// 保证数据存储目录存在
const dbDir = path_1.default.resolve(__dirname, '../../data');
fs_extra_1.default.ensureDirSync(dbDir);
// 创建数据库文件
const adapter = new FileSync_1.default(path_1.default.join(dbDir, 'users.json'));
const db = (0, lowdb_1.default)(adapter);
// 初始化数据库
db.defaults({ users: [] }).write();
class UserModel {
    // 创建用户
    async createUser(username, password) {
        // 检查用户名是否已存在
        const existingUser = db.get('users').find({ username }).value();
        if (existingUser) {
            throw new Error('用户名已存在');
        }
        // 加密密码
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // 创建新用户
        const newUser = {
            id: (0, uuid_1.v4)(),
            username,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        // 保存到数据库
        db.get('users').push(newUser).write();
        logger_1.default.info(`创建用户 ${username} 成功`);
        return newUser;
    }
    // 根据用户名查找用户
    findByUsername(username) {
        return db.get('users').find({ username }).value();
    }
    // 根据ID查找用户
    findById(id) {
        return db.get('users').find({ id }).value();
    }
    // 验证密码
    async validatePassword(user, password) {
        return bcryptjs_1.default.compare(password, user.password);
    }
    // 初始化默认管理员账户
    async initAdminUser() {
        // 检查是否已存在任何用户
        const users = db.get('users').value();
        if (users.length === 0) {
            try {
                // 创建默认管理员账户
                await this.createUser('admin', 'admin123');
                logger_1.default.info('默认管理员账户创建成功: admin/admin123');
            }
            catch (error) {
                logger_1.default.error(`创建默认管理员账户失败: ${error}`);
            }
        }
    }
}
const userModel = new UserModel();
exports.default = userModel;
