@echo off
chcp 65001
echo 正在启动FRP管理系统...

echo 安装后端依赖...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo 安装后端依赖失败！
    pause
    exit /b %ERRORLEVEL%
)

echo 编译后端代码...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo 编译后端代码失败！
    pause
    exit /b %ERRORLEVEL%
)

echo 安装前端依赖...
cd ..\frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo 安装前端依赖失败！
    pause
    exit /b %ERRORLEVEL%
)

echo 启动系统...
start cmd /k "cd ..\backend && npm start"
start cmd /k "npm start"

echo FRP管理系统已启动！
echo 后端地址: http://localhost:3001
echo 前端地址: http://localhost:3000
echo.
echo 按任意键关闭此窗口...
pause > nul 