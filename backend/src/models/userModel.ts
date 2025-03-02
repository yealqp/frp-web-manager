import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { Low, JSONFile } from 'lowdb';
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
  private db: Low<DbData>;
  private readonly SALT_ROUNDS = 10;
  
  constructor() {
    // 确保数据目录存在
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const dbFile = path.join(dataDir, 'users.json');
    const adapter = new JSONFile<DbData>(dbFile);
    this.db = new Low<DbData>(adapter);
    
    // 初始化默认数据结构
    this.initDb();
  }
  
  // 初始化数据库结构
  private async initDb() {
    await this.db.read();
    // 如果数据为null，初始化为空对象
    this.db.data = this.db.data || { users: [] };
    await this.db.write();
  }
  
  // 初始化管理员用户（如果数据库为空）
  async initAdminUser(): Promise<void> {
    await this.db.read();
    
    if (!this.db.data || !this.db.data.users || this.db.data.users.length === 0) {
      logger.info('数据库中没有用户，创建默认管理员账户');
      const defaultAdmin = {
        id: uuidv4(),
        username: 'admin',
        passwordHash: await bcrypt.hash('admin', this.SALT_ROUNDS),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.db.data.users = [defaultAdmin];
      await this.db.write();
      logger.info('已创建默认管理员用户');
    } else {
      logger.info(`数据库中已有 ${this.db.data.users.length} 个用户`);
    }
  }
  
  // 创建新用户
  async createUser(username: string, password: string): Promise<User> {
    await this.db.read();
    
    // 检查用户名是否已存在
    const existingUser = this.db.data?.users.find(user => user.username === username);
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
    
    this.db.data?.users.push(newUser);
    await this.db.write();
    
    return newUser;
  }
  
  // 根据用户名查找用户
  async findByUsername(username: string): Promise<User | null> {
    await this.db.read();
    
    const user = this.db.data?.users.find(user => user.username === username) || null;
    return user;
  }
  
  // 根据ID查找用户
  async findById(id: string): Promise<User | null> {
    await this.db.read();
    
    const user = this.db.data?.users.find(user => user.id === id) || null;
    return user;
  }
  
  // 验证密码
  async validatePassword(userId: string, password: string): Promise<boolean> {
    try {
      await this.db.read();
      
      const user = this.db.data?.users.find(user => user.id === userId);
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
    await this.db.read();
    
    if (!this.db.data) {
      return null;
    }
    
    const userIndex = this.db.data.users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      logger.warn(`尝试更新不存在的用户: ${userId}`);
      return null;
    }
    
    const user = this.db.data.users[userIndex];
    
    // 更新用户名
    if (updates.username) {
      user.username = updates.username;
    }
    
    // 更新密码
    if (updates.password) {
      try {
        // 明确检查password是否为字符串
        if (typeof updates.password === 'string') {
          user.passwordHash = await bcrypt.hash(updates.password, this.SALT_ROUNDS);
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
    await this.db.write();
    
    return user;
  }
}

export default new UserModel(); 