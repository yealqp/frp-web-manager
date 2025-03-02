import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import lowdb from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import logger from '../utils/logger';

// 用户数据类型
interface User {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

// 数据库类型
interface DbData {
  users: User[];
}

class UserModel {
  private db: lowdb.LowdbSync<DbData>;
  private readonly SALT_ROUNDS = 10;
  
  constructor() {
    // 确保数据目录存在
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const dbFile = path.join(dataDir, 'users.json');
    const adapter = new FileSync<DbData>(dbFile);
    this.db = lowdb(adapter);
    
    // 初始化默认数据结构
    this.db.defaults({ users: [] }).write();
  }
  
  // 初始化管理员用户（如果数据库为空）
  async initAdminUser(): Promise<void> {
    if (!this.db.get('users').size().value()) {
      const defaultAdmin = {
        id: uuidv4(),
        username: 'admin',
        passwordHash: await bcrypt.hash('admin', this.SALT_ROUNDS),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.db.get('users').push(defaultAdmin).write();
      logger.info('已创建默认管理员用户');
    }
  }
  
  // 创建新用户
  async createUser(username: string, password: string): Promise<User> {
    // 检查用户名是否已存在
    const existingUser = this.db.get('users').find((user: User) => user.username === username).value();
    if (existingUser) {
      throw new Error('用户名已存在');
    }
    
    // 创建新用户
    const newUser: User = {
      id: uuidv4(),
      username,
      passwordHash: await bcrypt.hash(password, this.SALT_ROUNDS),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.db.get('users').push(newUser).write();
    
    return newUser;
  }
  
  // 根据用户名查找用户
  findByUsername(username: string): User | null {
    const user = this.db.get('users').find((user: User) => user.username === username).value();
    return user || null;
  }
  
  // 根据ID查找用户
  findById(id: string): User | null {
    const user = this.db.get('users').find((user: User) => user.id === id).value();
    return user || null;
  }
  
  // 验证密码
  async validatePassword(userId: string, password: string): Promise<boolean> {
    try {
      const user = this.db.get('users').find((user: User) => user.id === userId).value();
      if (!user) {
        logger.warn(`尝试验证不存在用户 ${userId} 的密码`);
        return false;
      }
      
      // 确保参数类型正确
      if (typeof password !== 'string' || typeof user.passwordHash !== 'string') {
        logger.error(`密码验证参数类型错误: password (${typeof password}), passwordHash (${typeof user.passwordHash})`);
        return false;
      }
      
      // 使用bcrypt比较密码
      const result = await bcrypt.compare(password, user.passwordHash);
      return result;
    } catch (error) {
      logger.error(`密码验证错误: ${error}`);
      return false;
    }
  }
  
  // 更新用户信息
  async updateUser(userId: string, updates: { username?: string; password?: string }): Promise<User | null> {
    const user = this.db.get('users').find((user: User) => user.id === userId).value();
    if (!user) {
      return null;
    }
    
    // 更新用户名
    if (updates.username) {
      user.username = updates.username;
    }
    
    // 更新密码 - 使用固定值10替代this.SALT_ROUNDS
    if (updates.password) {
      try {
        // 明确检查password是否为字符串
        if (typeof updates.password === 'string') {
          const saltRounds = 10; // 直接使用固定值避免this引用问题
          user.passwordHash = await bcrypt.hash(updates.password, saltRounds);
          logger.info(`已为用户 ${userId} 生成新的密码哈希`);
        } else {
          throw new Error('密码必须是字符串类型');
        }
      } catch (error) {
        logger.error(`密码哈希生成失败: ${error}`);
        throw error; // 重新抛出以便上层处理
      }
    }
    
    // 更新时间戳
    user.updatedAt = new Date().toISOString();
    
    // 保存更改
    this.db.write();
    
    return user;
  }
}

export default new UserModel(); 