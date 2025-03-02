import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
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
    this.db.data = this.db.data || { users: [] };
  }
  
  // 初始化管理员用户（如果数据库为空）
  async initAdminUser() {
    await this.db.read();
    
    if (!this.db.data?.users || this.db.data.users.length === 0) {
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
    const newUser = {
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
    await this.db.read();
    
    const user = this.db.data?.users.find(user => user.id === userId);
    if (!user) {
      return false;
    }
    
    return bcrypt.compare(password, user.passwordHash);
  }
  
  // 更新用户信息
  async updateUser(userId: string, updates: { username?: string; password?: string }): Promise<User | null> {
    await this.db.read();
    
    const userIndex = this.db.data?.users.findIndex(user => user.id === userId);
    if (userIndex === undefined || userIndex === -1 || !this.db.data?.users) {
      return null;
    }
    
    const user = this.db.data.users[userIndex];
    
    // 更新用户名
    if (updates.username) {
      user.username = updates.username;
    }
    
    // 更新密码
    if (updates.password) {
      user.passwordHash = await bcrypt.hash(updates.password, this.SALT_ROUNDS);
    }
    
    // 更新时间戳
    user.updatedAt = new Date().toISOString();
    
    // 保存更改
    await this.db.write();
    
    return user;
  }
}

export default new UserModel(); 