import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import toml from 'toml';
import { FrpConfig, FrpProcess } from '../types';
import logger from '../utils/logger';
import userModel from '../models/userModel';

class FrpService {
  private configs: FrpConfig[] = [];
  private processes: Map<string, FrpProcess> = new Map();
  private configDir: string;
  private binDir: string;
  private socketIo: any;
  private isWindows: boolean;

  constructor() {
    this.configDir = path.resolve(__dirname, '../../config/tunnelConfig');
    this.binDir = path.resolve(__dirname, '../../bin');
    this.isWindows = process.platform === 'win32';
    
    // 确保配置目录和bin目录存在
    fs.ensureDirSync(this.configDir);
    fs.ensureDirSync(this.binDir);
    
    // 配置文件热重载
    this.setupConfigWatcher();
  }

  // 配置文件热重载
  private setupConfigWatcher() {
    const watchRecursive = (dir: string) => {
      fs.watch(dir, { persistent: true }, (event, filename) => {
        if (filename && (filename.endsWith('.toml') || filename.endsWith('.json') || filename.endsWith('.js') || filename.endsWith('.ts'))) {
          this.loadConfigs();
        }
      });
      // 递归监听子目录
      fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
        if (entry.isDirectory()) {
          watchRecursive(path.join(dir, entry.name));
        }
      });
    };
    watchRecursive(this.configDir);
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
  public async loadConfigs() {
    try {
      // 1. 先获取所有用户的tunnels元数据
      const allUsers = await userModel.findAll();
      const allTunnels = allUsers.flatMap(user => (user.tunnels || []).map(t => ({ ...t, userId: user.id })));
      const tunnelConfigRoot = this.configDir;
      this.configs = [];
      // 2. 遍历tunnelConfig下所有用户id文件夹
      const userFolders = await fs.readdir(tunnelConfigRoot);
      for (const userId of userFolders) {
        const userFolderPath = path.join(tunnelConfigRoot, userId);
        const stats = await fs.stat(userFolderPath);
        if (!stats.isDirectory()) continue;
        const files = await fs.readdir(userFolderPath);
        const configFiles = files.filter(file => file.endsWith('.toml'));
        for (const configFile of configFiles) {
          const configPath = path.join(userFolderPath, configFile);
          const configContent = await fs.readFile(configPath, 'utf-8');
          try {
            const parsed = toml.parse(configContent);
            // 3. 从allTunnels中查找元数据，严格用configFile字段和实际文件名做匹配
            const meta = allTunnels.find(t => t.configFile === configFile && t.userId === userId);
            if (!meta) continue; // 没有元数据则跳过
            // 解析remotePort
            let remotePort = 0;
            if (parsed.proxies && Array.isArray(parsed.proxies) && parsed.proxies[0] && parsed.proxies[0].remotePort) {
              remotePort = Number(parsed.proxies[0].remotePort);
            }
            this.configs.push({
              id: meta.configFile || meta.tunnelId + '',
              tunnelId: meta.tunnelId,
              name: meta.name,
              type: 'frpc',
              status: 'stopped',
              configPath,
              folderPath: userFolderPath,
              createdAt: meta.createdAt ? new Date(meta.createdAt) : new Date(),
              updatedAt: meta.updatedAt ? new Date(meta.updatedAt) : new Date(),
              nodeId: meta.nodeId,
              nodeName: meta.nodeName || meta.name,
              remotePort // 新增
            });
          } catch (error) {
            logger.error(`解析配置文件 ${configPath} 失败: ${error}`);
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

  // 获取下一个tunnelId
  private getNextTunnelId(): number {
    if (this.configs.length === 0) return 1;
    return Math.max(...this.configs.map(c => c.tunnelId || 0)) + 1;
  }

  // 获取下一个nodeId
  private getNextNodeId(): number {
    // 统计所有已存在的节点id，顺延
    const allNodeIds = this.configs.map(cfg => cfg.nodeId).filter(Boolean) as number[];
    if (allNodeIds.length === 0) return 1;
    return Math.max(...allNodeIds) + 1;
  }

  // 创建新配置
  async createConfig(name: string, type: 'frpc', content: string, userId?: string, serverNodeId?: number): Promise<FrpConfig> {
    if (type !== 'frpc') {
      throw new Error('只支持frpc类型');
    }
    const tunnelId = this.getNextTunnelId();
    // nodeId应由前端传入（即所选服务器的nodeId）
    const nodeId = serverNodeId || 1;
    if (!userId) throw new Error('必须指定userId');
    const userFolder = path.join(this.configDir, userId);
    await fs.ensureDir(userFolder);
    const configFileName = `frp_${tunnelId}.toml`;
    const configPath = path.join(userFolder, configFileName);
    await fs.writeFile(configPath, content, 'utf-8');
    // 解析remotePort
    let remotePort = 0;
    try {
      const parsed = toml.parse(content);
      if (parsed.proxies && Array.isArray(parsed.proxies) && parsed.proxies[0] && parsed.proxies[0].remotePort) {
        remotePort = Number(parsed.proxies[0].remotePort);
      }
    } catch (e) {}
    const config: FrpConfig = {
      id: configFileName,
      tunnelId,
      name,
      type,
      status: 'stopped',
      configPath,
      folderPath: userFolder,
      createdAt: new Date(),
      updatedAt: new Date(),
      nodeId,
      nodeName: name,
      remotePort
    };
    await userModel.addTunnelToUser(userId, {
      tunnelId,
      name,
      configFile: configFileName,
      nodeId,
      nodeName: name,
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString()
    });
    this.configs.push(config);
    logger.info(`创建配置 ${name} 成功`);
    const user = await userModel.findById(userId);
    const tunnelLimit = (user && typeof user.tunnelLimit === 'number') ? user.tunnelLimit : 50;
    if (user && user.tunnels && user.tunnels.length > tunnelLimit - 1) {
      throw new Error(`每个用户最多只能创建${tunnelLimit}个隧道`);
    }
    await this.loadConfigs(); // 新建后强制刷新
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
    if (config.status === 'running') {
      await this.stopFrp(id);
    }
    // 只从所有用户配置中移除该tunnelId
    const allUsers = await userModel.findAll();
    for (const user of allUsers) {
      await userModel.removeTunnelFromUser(user.id, config.tunnelId);
    }
    // 删除配置文件
    const configFilePath = path.join(config.folderPath, config.id);
    if (await fs.pathExists(configFilePath)) {
      await fs.remove(configFilePath);
    }
    // 如果用户文件夹已空，自动删除
    if ((await fs.readdir(config.folderPath)).length === 0) {
      await fs.remove(config.folderPath);
    }
    // 从配置列表中移除
    this.configs = this.configs.filter(c => c.id !== id);
    await this.loadConfigs(); // 删除后强制刷新
    return true;
  }

  // 停止FRP进程
  async stopFrp(id: string): Promise<boolean> {
    const config = this.configs.find(c => c.id === id);
    if (!config) return false;
    const frpProcess = this.processes.get(id);
    if (!frpProcess) return false;
    try {
      if (this.isWindows) {
        spawn('taskkill', ['/pid', frpProcess.process.pid.toString(), '/f', '/t']);
      } else {
        frpProcess.process.kill('SIGTERM');
      }
      config.status = 'stopped';
      if (this.socketIo) {
        this.socketIo.emit('frp-status', { id: config.id, status: 'stopped' });
      }
      logger.info(`停止 ${config.name} 成功`);
      return true;
    } catch (error) {
      logger.error(`停止 ${config.name} 失败: ${error}`);
      return false;
    }
  }

  // 启动FRP进程
  async startFrp(id: string): Promise<boolean> {
    const config = this.configs.find(c => c.id === id);
    if (!config) {
      logger.error(`未找到ID为 ${id} 的配置`);
      return false;
    }
    if (config.status === 'running') {
      logger.info(`配置 ${config.name} 已经在运行`);
      return true;
    }
    try {
      const exeName = this.getExecutableName(config.type);
      const exePath = path.join(this.binDir, exeName);
      if (!this.isWindows) {
        await fs.chmod(exePath, 0o755);
      }
      const process = spawn(exePath, ['-c', config.configPath], {
        cwd: config.folderPath,
        windowsHide: false
      });
      const frpProcess: FrpProcess = {
        id: config.id,
        process,
        logs: []
      };
      process.stdout.on('data', (data) => {
        const log = data.toString();
        frpProcess.logs.push(log);
        if (this.socketIo) {
          this.socketIo.emit('frp-log', { id: config.id, log });
        }
        logger.info(`[${config.name}] ${log}`);
      });
      process.stderr.on('data', (data) => {
        const log = data.toString();
        frpProcess.logs.push(log);
        if (this.socketIo) {
          this.socketIo.emit('frp-log', { id: config.id, log });
        }
        logger.error(`[${config.name}] ${log}`);
      });
      process.on('exit', (code) => {
        logger.info(`[${config.name}] 进程退出，退出码: ${code}`);
        const configIndex = this.configs.findIndex(c => c.id === id);
        if (configIndex !== -1) {
          this.configs[configIndex].status = 'stopped';
          if (this.socketIo) {
            this.socketIo.emit('frp-status', { id: config.id, status: 'stopped' });
          }
        }
        this.processes.delete(id);
      });
      this.processes.set(id, frpProcess);
      config.status = 'running';
      if (this.socketIo) {
        this.socketIo.emit('frp-status', { id: config.id, status: 'running' });
      }
      logger.info(`启动 ${config.name} 成功`);
      return true;
    } catch (error) {
      logger.error(`启动 ${config.name} 失败: ${error}`);
      config.status = 'error';
      if (this.socketIo) {
        this.socketIo.emit('frp-status', { id: config.id, status: 'error' });
      }
      return false;
    }
  }

  // 获取日志
  getLogs(id: string): string[] {
    const frpProcess = this.processes.get(id);
    if (!frpProcess) return [];
    return frpProcess.logs;
  }

  // 获取模板
  getTemplateConfig(type: 'frpc'): string {
    return `# frpc.toml\n[common]\nserver_addr = "127.0.0.1"\nserver_port = 7000\ntoken = "12345678"\n\n[ssh]\ntype = "tcp"\nlocal_ip = "127.0.0.1"\nlocal_port = 22\nremote_port = 6000\n`;
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

  // 通过nodeId查找节点名称（从serverList.json获取）
  getNodeNameByNodeId(nodeId: number): string | undefined {
    try {
      const serverListPath = path.resolve(__dirname, '../../config/serverList.json');
      const serverList = fs.readJsonSync(serverListPath);
      const server = serverList.find((s: any) => s.nodeId === nodeId);
      return server ? server.name : undefined;
    } catch (e) {
      return undefined;
    }
  }
}

export default new FrpService();