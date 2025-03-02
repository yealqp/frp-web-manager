import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs-extra';
import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import logger from '../utils/logger';

// 用户接口定义
export interface User {
  id: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// 保证数据存储目录存在
const dbDir = path.resolve(__dirname, '../../data');
fs.ensureDirSync(dbDir);

// 创建数据库文件
const adapter = new FileSync<{ users: User[] }>(path.join(dbDir, 'users.json'));
const db = low(adapter);

// 初始化数据库
db.defaults({ users: [] }).write();

class UserModel {
  // 创建用户
  async createUser(username: string, password: string): Promise<User> {
    // 检查用户名是否已存在
    const existingUser = db.get('users').find({ username }).value();
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const newUser: User = {
      id: uuidv4(),
      username,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 保存到数据库
    db.get('users').push(newUser).write();
    logger.info(`创建用户 ${username} 成功`);

    return newUser;
  }

  // 根据用户名查找用户
  findByUsername(username: string): User | undefined {
    return db.get('users').find({ username }).value();
  }

  // 根据ID查找用户
  findById(id: string): User | undefined {
    return db.get('users').find({ id }).value();
  }

  // 验证密码
  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  // 初始化默认管理员账户
  async initAdminUser(): Promise<void> {
    // 检查是否已存在任何用户
    const users = db.get('users').value();
    if (users.length === 0) {
      try {
        // 创建默认管理员账户
        await this.createUser('admin', 'admin123');
        logger.info('默认管理员账户创建成功: admin/admin123');
      } catch (error) {
        logger.error(`创建默认管理员账户失败: ${error}`);
      }
    }
  }
}

const userModel = new UserModel();
export default userModel; 