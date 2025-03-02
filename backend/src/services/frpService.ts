import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import toml from 'toml';
import { FrpConfig, FrpProcess } from '../types';
import logger from '../utils/logger';

class FrpService {
  private configs: FrpConfig[] = [];
  private processes: Map<string, FrpProcess> = new Map();
  private configDir: string;
  private binDir: string;
  private socketIo: any;
  private isWindows: boolean;

  constructor() {
    this.configDir = path.resolve(__dirname, '../../config');
    this.binDir = path.resolve(__dirname, '../../bin');
    this.isWindows = process.platform === 'win32';
    
    // 确保配置目录和bin目录存在
    fs.ensureDirSync(this.configDir);
    fs.ensureDirSync(this.binDir);
    
    // 加载现有配置
    this.loadConfigs();
  }

  // 设置Socket.IO实例，用于实时推送日志
  setSocketIo(io: any) {
    this.socketIo = io;
  }

  // 获取可执行文件名（根据操作系统自动添加扩展名）
  private getExecutableName(type: 'frpc' | 'frps'): string {
    return this.isWindows ? `${type}.exe` : type;
  }

  // 加载现有配置
  private async loadConfigs() {
    try {
      const configFolders = await fs.readdir(this.configDir);
      
      for (const folder of configFolders) {
        const folderPath = path.join(this.configDir, folder);
        const stats = await fs.stat(folderPath);
        
        if (stats.isDirectory()) {
          const files = await fs.readdir(folderPath);
          const configFiles = files.filter(file => file.endsWith('.toml'));
          
          for (const configFile of configFiles) {
            const configPath = path.join(folderPath, configFile);
            const configContent = await fs.readFile(configPath, 'utf-8');
            
            try {
              // 尝试解析TOML以确认它是有效的配置文件
              toml.parse(configContent);
              
              // 确定配置类型
              const type = configFile.startsWith('frpc') ? 'frpc' : 'frps';
              
              // 检查可执行文件是否存在
              const exeName = this.getExecutableName(type);
              const exePath = path.join(folderPath, exeName);
              
              if (!fs.existsSync(exePath)) {
                // 可执行文件不存在，尝试从bin目录复制
                const binExePath = path.join(this.binDir, exeName);
                if (fs.existsSync(binExePath)) {
                  await fs.copy(binExePath, exePath);
                  // 在Linux下为可执行文件添加执行权限
                  if (!this.isWindows) {
                    await fs.chmod(exePath, 0o755); // rwxr-xr-x
                  }
                  logger.info(`已复制可执行文件到 ${exePath}`);
                } else {
                  logger.error(`可执行文件 ${binExePath} 不存在`);
                  continue;
                }
              } else if (!this.isWindows) {
                // 确保Linux下的可执行文件有执行权限
                await fs.chmod(exePath, 0o755);
              }
              
              this.configs.push({
                id: uuidv4(),
                name: path.basename(folder).split('_')[0], // 使用文件夹名的第一部分作为名称
                type,
                status: 'stopped',
                configPath,
                folderPath,
                createdAt: new Date(),
                updatedAt: new Date()
              });
            } catch (error) {
              logger.error(`解析配置文件 ${configPath} 失败: ${error}`);
            }
          }
        }
      }
      
      logger.info(`已加载 ${this.configs.length} 个FRP配置`);
    } catch (error) {
      logger.error(`加载配置失败: ${error}`);
    }
  }

  // 获取所有配置
  getConfigs(): FrpConfig[] {
    return this.configs;
  }

  // 获取单个配置
  getConfig(id: string): FrpConfig | undefined {
    return this.configs.find(config => config.id === id);
  }

  // 创建新配置
  async createConfig(name: string, type: 'frpc' | 'frps', content: string): Promise<FrpConfig> {
    // 创建配置文件夹
    const folderName = `${name}_${uuidv4().substring(0, 8)}`;
    const folderPath = path.join(this.configDir, folderName);
    
    await fs.mkdir(folderPath);
    
    // 复制可执行文件到配置文件夹
    const exeName = this.getExecutableName(type);
    const exePath = path.join(this.binDir, exeName);
    const targetExePath = path.join(folderPath, exeName);
    
    await fs.copy(exePath, targetExePath);
    
    // 在Linux下为可执行文件添加执行权限
    if (!this.isWindows) {
      await fs.chmod(targetExePath, 0o755); // rwxr-xr-x
    }
    
    // 创建配置文件
    const configFileName = `${type}.toml`;
    const configPath = path.join(folderPath, configFileName);
    
    await fs.writeFile(configPath, content, 'utf-8');
    
    // 添加到配置列表
    const config: FrpConfig = {
      id: uuidv4(),
      name,
      type,
      status: 'stopped',
      configPath,
      folderPath,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.configs.push(config);
    logger.info(`创建配置 ${name} 成功`);
    
    return config;
  }

  // 编辑配置
  async editConfig(id: string, content: string): Promise<FrpConfig | null> {
    const config = this.configs.find(c => c.id === id);
    
    if (!config) {
      logger.error(`未找到ID为 ${id} 的配置`);
      return null;
    }
    
    // 检查该配置是否正在运行
    if (config.status === 'running') {
      logger.error(`配置 ${config.name} 正在运行，无法编辑`);
      throw new Error('无法编辑运行中的配置');
    }
    
    // 更新配置文件
    await fs.writeFile(config.configPath, content, 'utf-8');
    
    // 更新配置
    config.updatedAt = new Date();
    
    logger.info(`编辑配置 ${config.name} 成功`);
    return config;
  }

  // 删除配置
  async deleteConfig(id: string): Promise<boolean> {
    const config = this.configs.find(c => c.id === id);
    
    if (!config) {
      logger.error(`未找到ID为 ${id} 的配置`);
      return false;
    }
    
    // 检查该配置是否正在运行
    if (config.status === 'running') {
      // 先停止
      await this.stopFrp(id);
    }
    
    // 删除配置文件夹
    await fs.remove(config.folderPath);
    
    // 从配置列表中移除
    this.configs = this.configs.filter(c => c.id !== id);
    
    logger.info(`删除配置 ${config.name} 成功`);
    return true;
  }

  // 启动FRP进程
  async startFrp(id: string): Promise<boolean> {
    const config = this.configs.find(c => c.id === id);
    
    if (!config) {
      logger.error(`未找到ID为 ${id} 的配置`);
      return false;
    }
    
    // 检查是否已经运行
    if (config.status === 'running') {
      logger.info(`配置 ${config.name} 已经在运行`);
      return true;
    }
    
    try {
      // 执行文件路径
      const exeName = this.getExecutableName(config.type);
      const exePath = path.join(config.folderPath, exeName);
      
      // 在Linux下确保有执行权限
      if (!this.isWindows) {
        await fs.chmod(exePath, 0o755); // rwxr-xr-x
      }
      
      // 启动进程
      const process = spawn(exePath, ['-c', config.configPath], {
        cwd: config.folderPath,
        windowsHide: false
      });
      
      const frpProcess: FrpProcess = {
        id: config.id,
        process,
        logs: []
      };
      
      // 处理标准输出
      process.stdout.on('data', (data) => {
        const log = data.toString();
        frpProcess.logs.push(log);
        
        // 如果设置了Socket.IO，发送日志
        if (this.socketIo) {
          this.socketIo.emit('frp-log', { id: config.id, log });
        }
        
        logger.info(`[${config.name}] ${log}`);
      });
      
      // 处理错误输出
      process.stderr.on('data', (data) => {
        const log = data.toString();
        frpProcess.logs.push(log);
        
        // 如果设置了Socket.IO，发送日志
        if (this.socketIo) {
          this.socketIo.emit('frp-log', { id: config.id, log });
        }
        
        logger.error(`[${config.name}] ${log}`);
      });
      
      // 处理进程退出
      process.on('exit', (code) => {
        logger.info(`[${config.name}] 进程退出，退出码: ${code}`);
        
        // 更新状态
        const configIndex = this.configs.findIndex(c => c.id === id);
        if (configIndex !== -1) {
          this.configs[configIndex].status = 'stopped';
          
          // 如果设置了Socket.IO，发送状态更新
          if (this.socketIo) {
            this.socketIo.emit('frp-status', {
              id: config.id,
              status: 'stopped'
            });
          }
        }
        
        // 移除进程
        this.processes.delete(id);
      });
      
      // 存储进程
      this.processes.set(id, frpProcess);
      
      // 更新状态
      config.status = 'running';
      
      // 如果设置了Socket.IO，发送状态更新
      if (this.socketIo) {
        this.socketIo.emit('frp-status', {
          id: config.id,
          status: 'running'
        });
      }
      
      logger.info(`启动 ${config.name} 成功`);
      return true;
    } catch (error) {
      logger.error(`启动 ${config.name} 失败: ${error}`);
      config.status = 'error';
      
      // 如果设置了Socket.IO，发送状态更新
      if (this.socketIo) {
        this.socketIo.emit('frp-status', {
          id: config.id,
          status: 'error'
        });
      }
      
      return false;
    }
  }

  // 停止FRP进程
  async stopFrp(id: string): Promise<boolean> {
    const config = this.configs.find(c => c.id === id);
    
    if (!config) {
      logger.error(`未找到ID为 ${id} 的配置`);
      return false;
    }
    
    // 检查是否已经停止
    if (config.status === 'stopped') {
      logger.info(`配置 ${config.name} 已经停止`);
      return true;
    }
    
    const frpProcess = this.processes.get(id);
    
    if (!frpProcess) {
      logger.error(`未找到ID为 ${id} 的进程`);
      return false;
    }
    
    try {
      // 根据操作系统选择不同的进程终止方式
      if (this.isWindows) {
        // 在Windows上使用taskkill强制终止进程
        spawn('taskkill', ['/pid', frpProcess.process.pid.toString(), '/f', '/t']);
      } else {
        // 在Linux上使用kill命令
        frpProcess.process.kill('SIGTERM');
      }
      
      // 更新状态
      config.status = 'stopped';
      
      // 如果设置了Socket.IO，发送状态更新
      if (this.socketIo) {
        this.socketIo.emit('frp-status', {
          id: config.id,
          status: 'stopped'
        });
      }
      
      logger.info(`停止 ${config.name} 成功`);
      return true;
    } catch (error) {
      logger.error(`停止 ${config.name} 失败: ${error}`);
      return false;
    }
  }

  // 获取FRP进程的日志
  getLogs(id: string): string[] {
    const frpProcess = this.processes.get(id);
    
    if (!frpProcess) {
      return [];
    }
    
    return frpProcess.logs;
  }

  // 获取FRP模板配置
  getTemplateConfig(type: 'frpc' | 'frps'): string {
    if (type === 'frpc') {
      return `# frpc.toml
[common]
server_addr = "127.0.0.1"
server_port = 7000
token = "12345678"

[ssh]
type = "tcp"
local_ip = "127.0.0.1"
local_port = 22
remote_port = 6000
`;
    } else {
      return `# frps.toml
[common]
bind_addr = "0.0.0.0"
bind_port = 7000
token = "12345678"
dashboard_addr = "0.0.0.0"
dashboard_port = 7500
dashboard_user = "admin"
dashboard_pwd = "admin"
`;
    }
  }

  // 读取配置文件内容
  async readConfigFile(id: string): Promise<string | null> {
    const config = this.configs.find(c => c.id === id);
    
    if (!config) {
      logger.error(`未找到ID为 ${id} 的配置`);
      return null;
    }
    
    try {
      const content = await fs.readFile(config.configPath, 'utf-8');
      return content;
    } catch (error) {
      logger.error(`读取配置文件 ${config.configPath} 失败: ${error}`);
      return null;
    }
  }
}

export default new FrpService(); 