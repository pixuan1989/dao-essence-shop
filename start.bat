@echo off
echo ========================================
echo DAO Essence Shop - Stripe Server
echo ========================================
echo.

REM 检查配置
echo [1/3] 检查配置...
node quick-check.js
if %errorlevel% neq 0 (
    echo.
    echo 配置不完整，请先完成 Stripe 密钥配置！
    echo.
    echo 查看配置指南:
    echo   CONFIGURE_ENV_GUIDE.md
    echo.
    pause
    exit /b 1
)

echo.
echo [2/3] 检查服务器端口...
timeout /t 1 >nul

echo.
echo [3/3] 启动服务器...
echo.
echo ========================================
echo 服务器正在启动...
echo ========================================
echo.
echo 服务器地址: http://localhost:3001
echo 健康检查: http://localhost:3001/api/health
echo ========================================
echo.
echo 按 Ctrl+C 停止服务器
echo.

node server.js
