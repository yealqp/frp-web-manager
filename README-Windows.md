# FRP 管理系统 - Windows 安装指南 | FRP Management System - Windows Installation Guide

[English](#english) | [中文](#中文)

<a name="english"></a>
## English

### System Requirements

- Windows 10 or higher
- Node.js 14+ 
- npm 6+ or yarn 1.22+
- Supported browsers: Chrome, Edge, Firefox (latest versions)

### Installation Steps

#### 1. Install Node.js

1. Visit the [Node.js website](https://nodejs.org/) and download the latest LTS version
2. Run the installer and follow the wizard to complete the installation
3. After installation, open Command Prompt or PowerShell and run the following commands to confirm successful installation:
   ```
   node -v
   npm -v
   ```

#### 2. Download and Install FRP Management System

1. Download the project archive from GitHub or the provided source
2. Extract to your preferred location, for example `C:\FrpManager`
3. Open Command Prompt or PowerShell and navigate to the project directory
   ```
   cd C:\FrpManager
   ```

#### 3. Install Dependencies

Install dependencies for both frontend and backend:

```
cd backend
npm install

cd ..\frontend
npm install
```

#### 4. Build the Frontend

```
cd frontend
npm run build
```

#### 5. Start the Services

Development mode:

```
# Start the backend service
cd backend
npm run dev

# In another Command Prompt window, start the frontend service
cd frontend
npm start
```

Production mode:

```
cd backend
npm run start
```

### Configuration

#### Backend Connection Configuration

By default, the frontend will automatically connect to `http://localhost:3001` or port 3001 on the same hostname as the frontend.

To customize the backend connection address:

1. After logging in, click on the username in the top-right corner
2. Select "System Settings" from the dropdown menu
3. Enable "Use Custom API Address" and enter the complete backend address
4. Click "Save Settings"

#### Default User

The system creates a default administrator account:
- Username: admin
- Password: admin123

It is recommended to change the default password immediately after your first login!

### Common Issues

#### Frontend Cannot Connect to Backend

1. Ensure the backend service is running
2. Check if the firewall allows access to port 3001
3. If using a custom address, make sure the address format is correct
4. Check the browser console for cross-origin errors

#### Permission Issues

Make sure you run Command Prompt or PowerShell with administrator privileges.

### Updates

Regularly check for updates to get the latest features and security fixes:

```
git pull
cd backend
npm install
cd ..\frontend
npm install
npm run build
```

### Troubleshooting

If you encounter issues, try the following steps:

1. Check the console logs
2. Restart the services
3. Clear browser cache and cookies
4. Make sure all dependencies are installed correctly

### Support

For help, please contact the system administrator or submit an issue on the project's Issues page.

---

<a name="中文"></a>
## 中文

### 系统要求

- Windows 10 或更高版本
- Node.js 14+ 
- npm 6+ 或 yarn 1.22+
- 支持的浏览器：Chrome, Edge, Firefox 最新版本

### 安装步骤

#### 1. 安装 Node.js

1. 访问 [Node.js 官网](https://nodejs.org/) 下载最新的 LTS 版本
2. 运行安装程序，按照向导完成安装
3. 安装完成后，打开命令提示符或 PowerShell，执行以下命令确认安装成功：
   ```
   node -v
   npm -v
   ```

#### 2. 下载和安装 FRP 管理系统

1. 从 GitHub 或提供的源下载项目压缩包
2. 解压到您喜欢的位置，例如 `C:\FrpManager`
3. 打开命令提示符或 PowerShell，进入项目目录
   ```
   cd C:\FrpManager
   ```

#### 3. 安装依赖

分别进入前端和后端目录安装依赖：

```
cd backend
npm install

cd ..\frontend
npm install
```

#### 4. 构建前端

```
cd frontend
npm run build
```

#### 5. 启动服务

开发模式：

```
# 启动后端服务
cd backend
npm run dev

# 在另一个命令提示符窗口中启动前端服务
cd frontend
npm start
```

生产模式：

```
cd backend
npm run start
```

### 配置说明

#### 后端连接配置

默认情况下，前端会自动连接到 `http://localhost:3001` 或与前端相同主机名的3001端口。

如需自定义后端连接地址：

1. 登录系统后，点击右上角用户名
2. 在下拉菜单中选择"系统设置"
3. 开启"使用自定义API地址"并输入完整的后端地址
4. 点击"保存设置"

#### 默认用户

系统默认创建管理员账户：
- 用户名：admin
- 密码：admin123

首次登录后，建议立即修改默认密码！

### 常见问题

#### 前端无法连接到后端

1. 确保后端服务正在运行
2. 检查防火墙是否允许3001端口的访问
3. 如果使用自定义地址，确保地址格式正确
4. 查看浏览器控制台是否有跨域错误

#### 权限问题

确保运行命令提示符或PowerShell时拥有管理员权限。

### 更新

定期检查更新以获取最新功能和安全修复：

```
git pull
cd backend
npm install
cd ..\frontend
npm install
npm run build
```

### 故障排除

如果遇到问题，请尝试以下步骤：

1. 检查控制台日志
2. 重新启动服务
3. 清除浏览器缓存和Cookie
4. 确保所有依赖都已正确安装

### 支持

如需帮助，请联系系统管理员或在项目的Issues页面提交问题。 
