import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { Low, JSONFile } from 'lowdb';
import logger from '../utils/logger';

// 用户数据类型
export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: 'admin' | 'user';
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
    // 如果数据为null或undefined，初始化为默认结构
    if (!this.db.data) {
      this.db.data = { users: [] };
      await this.db.write();
    }
  }
  
  // 初始化管理员用户（如果数据库为空）
  async initAdminUser(): Promise<void> {
    await this.db.read();
    
    // 确保db.data始终有效
    if (!this.db.data) {
      this.db.data = { users: [] };
    }
    
    if (!this.db.data.users || this.db.data.users.length === 0) {
      logger.info('数据库中没有用户，创建默认管理员账户');
      const defaultAdmin = {
        id: uuidv4(),
        username: 'admin',
        passwordHash: await bcrypt.hash('admin', this.SALT_ROUNDS),
        role: 'admin' as 'admin',
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
    
    // 确保db.data始终有效
    if (!this.db.data) {
      this.db.data = { users: [] };
    }
    
    // 检查用户名是否已存在
    const existingUser = this.db.data.users.find(user => user.username === username);
    if (existingUser) {
      throw new Error('用户名已存在');
    }
    
    // 创建新用户
    const newUser: User = {
      id: uuidv4(),
      username,
      passwordHash: await bcrypt.hash(password, this.SALT_ROUNDS),
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.db.data.users.push(newUser);
    await this.db.write();
    
    return newUser;
  }
  
  // 根据用户名查找用户
  async findByUsername(username: string): Promise<User | null> {
    await this.db.read();
    
    // 确保db.data始终有效
    if (!this.db.data) {
      this.db.data = { users: [] };
      return null;
    }
    
    const user = this.db.data.users.find(user => user.username === username) || null;
    return user;
  }
  
  // 查找所有用户
  async findAll(): Promise<User[]> {
    await this.db.read();
    if (!this.db.data) {
      this.db.data = { users: [] };
    }
    return this.db.data.users;
  }

  // 根据ID查找用户
  async findById(id: string): Promise<User | null> {
    await this.db.read();
    
    // 确保db.data始终有效
    if (!this.db.data) {
      this.db.data = { users: [] };
      return null;
    }
    
    const user = this.db.data.users.find(user => user.id === id) || null;
    return user;
  }
  
  // 验证密码
  async validatePassword(userId: string, password: string): Promise<boolean> {
    try {
      await this.db.read();
      
      // 确保db.data始终有效
      if (!this.db.data) {
        this.db.data = { users: [] };
        return false;
      }
      
      const user = this.db.data.users.find(user => user.id === userId);
      if (!user) {
        logger.warn(`尝试验证不存在用户 ${userId} 的密码`);
        return false;
      }
      
      // 确保参数类型正确并存在密码哈希值
      if (typeof password !== 'string') {
        logger.error(`密码验证参数类型错误: password (${typeof password})`);
        return false;
      }
      
      if (!user.passwordHash || typeof user.passwordHash !== 'string') {
        logger.error(`用户 ${userId} 的密码哈希值不存在或类型错误: passwordHash (${typeof user.passwordHash})`);
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
      this.db.data = { users: [] };
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
        }
      } catch (error) {
        logger.error(`密码哈希失败: ${error}`);
        // 根据需要处理错误，例如抛出异常或返回null
      }
    }

    user.updatedAt = new Date().toISOString();
    this.db.data.users[userIndex] = user;
    await this.db.write();

    return user;
  }

  // 删除用户
  async deleteUser(userId: string): Promise<boolean> {
    await this.db.read();

    if (!this.db.data) {
      this.db.data = { users: [] };
      return false;
    }

    const initialLength = this.db.data.users.length;
    this.db.data.users = this.db.data.users.filter(user => user.id !== userId);

    if (this.db.data.users.length < initialLength) {
      await this.db.write();
      return true;
    }

    return false;
  }
}

export default new UserModel();