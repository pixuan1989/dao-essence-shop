@echo off
REM ============================================================
REM  DaoEssence 每日运势自动化 - Windows 任务计划启动脚本
REM  每日 02:00 由 Windows 任务计划调用，不依赖 WorkBuddy
REM ============================================================

REM --- 路径配置 ---
set "NODE_PATH=C:\Program Files\nodejs\node.exe"
set "GIT_PATH=D:\软件\Git\cmd"
set "PROJECT_DIR=C:\Users\agenew\Desktop\DaoEssence1.0"
set "LOG_DIR=%PROJECT_DIR%\scripts\logs"

REM --- 把 Git 加入 PATH ---
set "PATH=%GIT_PATH%;%PATH%"

REM --- 创建日志目录 ---
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

REM --- 日志文件（用 WMIC 获取可靠日期，避免 locale 问题）---
for /f "tokens=2 delims==" %%a in ('wmic os get localdatetime /value ^| find "="') do set "DT=%%a"
set "LOG_FILE=%LOG_DIR%\daily-%DT:~0,4%-%DT:~4,2%-%DT:~6,2%.log"

echo ============================================================ >> "%LOG_FILE%" 2>&1
echo [%DT:~0,4%-%DT:~4,2%-%DT:~6,2% %DT:~8,2%:%DT:~10,2%:%DT:~12,2%] Windows Task Scheduler 启动 >> "%LOG_FILE%" 2>&1
echo ============================================================ >> "%LOG_FILE%" 2>&1

REM --- 切换到项目目录 ---
cd /d "%PROJECT_DIR%"

REM --- 执行自动化脚本 ---
"%NODE_PATH%" scripts/daily-run-auto.js >> "%LOG_FILE%" 2>&1

REM --- 记录退出码 ---
echo [Exit Code: %ERRORLEVEL%] >> "%LOG_FILE%" 2>&1

REM --- 清理 30 天前的日志 ---
forfiles /p "%LOG_DIR%" /m "daily-*.log" /d -30 /c "cmd /c del @path" 2>nul
