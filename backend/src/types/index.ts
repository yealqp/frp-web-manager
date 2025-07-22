export interface FrpConfig {
  id: string;
  tunnelId: number; // 顺延
  name: string;
  type: 'frpc';
  status: 'running' | 'stopped' | 'error';
  configPath: string;
  folderPath: string;
  nodeId?: number;
  nodeName?: string;
  createdAt: Date;
  updatedAt: Date;
  remotePort: number; // 新增，远程端口
}

export interface FrpProcess {
  id: string;
  process: any;
  logs: string[];
} 