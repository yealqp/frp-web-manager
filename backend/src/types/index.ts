export interface FrpConfig {
  id: string;
  name: string;
  type: 'frpc' | 'frps';
  status: 'running' | 'stopped' | 'error';
  configPath: string;
  folderPath: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FrpProcess {
  id: string;
  process: any;
  logs: string[];
} 