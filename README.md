# FRP 管理系统 | FRP Management System

[English](#english) | [中文](#中文)

<a name="english"></a>
## English

FRP Management System is a web application for managing and configuring FRP (Fast Reverse Proxy) services. This system provides a user-friendly interface to help users easily create, edit, start, and monitor FRP configurations.

### Key Features

- 📝 Create and edit FRP configuration files
- 🚀 Start and stop FRP services
- 📊 Real-time FRP log viewing
- 🔐 User authentication and permission management
- 🔄 Automatic detection and connection to backend services
- ⚙️ Support for custom API connection addresses

### Installation Guides

Please choose the installation guide according to your operating system:

- [Windows Installation Guide](README-Windows.md)
- [Linux Installation Guide](README-Linux.md)

### Key Installation Points

#### Windows

- Windows 10 or higher
- Requires Node.js 14+ and npm 6+
- Supports custom backend connection addresses
- Default user: admin / admin

For detailed steps, please see the [Windows Installation Guide](README-Windows.md).

#### Linux

- Supports Ubuntu 18.04+, Debian 10+, CentOS 7+
- Script execution permissions required
- Provides systemd service configuration
- Includes firewall and SELinux configuration instructions

For detailed steps, please see the [Linux Installation Guide](README-Linux.md).

### Technology Stack

#### Frontend
- React.js
- TypeScript
- Ant Design
- Axios

#### Backend
- Node.js
- Express.js
- Socket.IO
- JWT authentication

Thank you for using the FRP Management System! If you have any issues, please refer to the troubleshooting section in the installation guide for your system.

---

<a name="中文"></a>
## 中文

FRP管理系统是一个用于管理和配置FRP（Fast Reverse Proxy）服务的Web应用程序。本系统提供了一个友好的用户界面，帮助用户轻松创建、编辑、启动和监控FRP配置。

### 主要功能

- 📝 创建和编辑FRP配置文件
- 🚀 启动和停止FRP服务
- 📊 实时查看FRP日志
- 🔐 用户认证和权限管理
- 🔄 自动检测和连接后端服务
- ⚙️ 支持自定义API连接地址

### 安装指南

请根据您的操作系统选择相应的安装指南：

- [Windows 安装指南](README-Windows.md)
- [Linux 安装指南](README-Linux.md)

### 安装要点

#### Windows

- Windows 10 或更高版本
- 需要安装 Node.js 14+ 和 npm 6+
- 支持自定义后端连接地址
- 默认用户：admin / admin

详细步骤请查看 [Windows 安装指南](README-Windows.md)。

#### Linux

- 支持 Ubuntu 18.04+, Debian 10+, CentOS 7+
- 需要设置脚本执行权限
- 提供了 systemd 服务配置
- 包含防火墙和 SELinux 配置说明

详细步骤请查看 [Linux 安装指南](README-Linux.md)。

### 技术栈

#### 前端
- React.js
- TypeScript
- Ant Design
- Axios

#### 后端
- Node.js
- Express.js
- Socket.IO
- JWT认证

感谢使用FRP管理系统！如有问题，请参考相应系统的安装指南中的故障排除部分。 