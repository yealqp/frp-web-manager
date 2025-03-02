# FRP 管理系统 - Linux 安装指南 | FRP Management System - Linux Installation Guide

[English](#english) | [中文](#中文)

<a name="english"></a>
## English

### System Requirements

- Supported Linux distributions: Ubuntu 18.04+, Debian 10+, CentOS 7+
- Node.js 14+ 
- npm 6+ or yarn 1.22+
- Supported browsers: Chrome, Firefox (latest versions)

### Installation Steps

#### 1. Install Node.js

Ubuntu/Debian:
```bash
# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node -v
npm -v
```

CentOS/RHEL:
```bash
# Install Node.js and npm
curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs

# Verify installation
node -v
npm -v
```

#### 2. Get the Project Code

```bash
# Clone from GitHub (if applicable)
git clone https://github.com/yealqp/frp-web-manager.git
cd frp-manager

```

#### 3. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 4. Build the Frontend

```bash
cd frontend
npm run build
```

#### 5. Set Execution Permissions

```bash
# Ensure scripts have execution permissions
cd ../backend/scripts
chmod +x *.sh
```

#### 6. Start the Services

Development mode:
```bash
# Start the backend
cd backend
npm run dev

# In another terminal, start the frontend
cd frontend
npm start
```

Production mode:
```bash
cd backend
npm run start
```

#### 7. Setup Auto-start (Optional)

Create a systemd service:
```bash
sudo nano /etc/systemd/system/frp-manager.service
```

Enter the following content:
```
[Unit]
Description=FRP Manager
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/path/to/frp-manager/backend
ExecStart=/usr/bin/npm run start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable the service:
```bash
sudo systemctl enable frp-manager
sudo systemctl start frp-manager
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

#### Port Configuration

To change the default port (3001), you can set the PORT environment variable when starting:

```bash
PORT=8080 npm run start
```

### Common Issues

#### Permission Problems

If you encounter permission issues, ensure that:

```bash
# Ensure the data directory has write permissions
sudo chown -R $(whoami) /path/to/frp-manager/backend/data
sudo chmod -R 755 /path/to/frp-manager/backend/data

# Ensure scripts have execution permissions
sudo chmod +x /path/to/frp-manager/backend/scripts/*.sh
```

#### Firewall Settings

Make sure ports are open in the firewall:

```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 3001/tcp
sudo ufw allow 3000/tcp

# Firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

#### SELinux Issues

On systems with SELinux enabled, you may need additional configuration:

```bash
sudo semanage port -a -t http_port_t -p tcp 3001
sudo semanage port -a -t http_port_t -p tcp 3000
```

### View Logs

Service logs are located at:
```bash
# Development mode
backend/logs/

# When running with systemd
sudo journalctl -u frp-manager
```

### Updates

Update the system:
```bash
git pull
cd backend
npm install
cd ../frontend
npm install
npm run build
```

If using systemd:
```bash
sudo systemctl restart frp-manager
```

### Troubleshooting

If you encounter issues, try the following steps:

1. Check logs: `cat backend/logs/app.log`
2. Check system resources: `free -m` and `df -h`
3. Ensure MongoDB service is running (if used)
4. Restart the service: `sudo systemctl restart frp-manager`
5. Clear browser cache and cookies

### Support

For help, please contact the system administrator or submit an issue on the project's Issues page.

---

<a name="中文"></a>
## 中文

### 系统要求

- 支持的Linux发行版：Ubuntu 18.04+, Debian 10+, CentOS 7+
- Node.js 14+ 
- npm 6+ 或 yarn 1.22+
- 支持的浏览器：Chrome, Firefox 最新版本

### 安装步骤

#### 1. 安装 Node.js

Ubuntu/Debian:
```bash
# 安装Node.js和npm
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v
npm -v
```

CentOS/RHEL:
```bash
# 安装Node.js和npm
curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs

# 验证安装
node -v
npm -v
```

#### 2. 获取项目代码

```bash
# 从GitHub克隆（如适用）
git clone https://github.com/yealqp/frp-web-manager.git
cd frp-manager
```

#### 3. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

#### 4. 构建前端

```bash
cd frontend
npm run build
```

#### 5. 设置执行权限

```bash
# 确保脚本有执行权限
cd ../backend/scripts
chmod +x *.sh
```

#### 6. 启动服务

开发模式:
```bash
# 启动后端
cd backend
npm run dev

# 在另一个终端启动前端
cd frontend
npm start
```

生产模式:
```bash
cd backend
npm run start
```

#### 7. 设置开机自启（可选）

创建systemd服务:
```bash
sudo nano /etc/systemd/system/frp-manager.service
```

填入以下内容:
```
[Unit]
Description=FRP Manager
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/path/to/frp-manager/backend
ExecStart=/usr/bin/npm run start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

启用服务:
```bash
sudo systemctl enable frp-manager
sudo systemctl start frp-manager
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

#### 端口配置

如需更改默认端口(3001)，可以在启动时设置PORT环境变量：

```bash
PORT=8080 npm run start
```

### 常见问题

#### 权限问题

如果遇到权限问题，请确保:

```bash
# 确保数据目录有写权限
sudo chown -R $(whoami) /path/to/frp-manager/backend/data
sudo chmod -R 755 /path/to/frp-manager/backend/data

# 确保脚本有执行权限
sudo chmod +x /path/to/frp-manager/backend/scripts/*.sh
```

#### 防火墙设置

确保端口已在防火墙中开放:

```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 3001/tcp
sudo ufw allow 3000/tcp

# Firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

#### SELinux 问题

在启用SELinux的系统上可能需要额外配置:

```bash
sudo semanage port -a -t http_port_t -p tcp 3001
sudo semanage port -a -t http_port_t -p tcp 3000
```

### 日志查看

服务日志位于:
```bash
# 开发模式
backend/logs/

# 使用systemd运行时
sudo journalctl -u frp-manager
```

### 更新

更新系统:
```bash
git pull
cd backend
npm install
cd ../frontend
npm install
npm run build
```

如果使用systemd:
```bash
sudo systemctl restart frp-manager
```

### 故障排除

如果遇到问题，请尝试以下步骤：

1. 检查日志: `cat backend/logs/app.log`
2. 检查系统资源: `free -m` 和 `df -h`
3. 确保MongoDB服务正在运行（如果使用）
4. 重启服务: `sudo systemctl restart frp-manager`
5. 清除浏览器缓存和Cookie

### 支持

如需帮助，请联系系统管理员或在项目的Issues页面提交问题。 
