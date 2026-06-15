# DaoEssence 每日运势自动化 - Windows 任务计划启动脚本
# 每日 02:00 由 Windows 任务计划调用，不依赖 WorkBuddy
# 用法: powershell -ExecutionPolicy Bypass -File scripts\daily-scheduler.ps1

$ErrorActionPreference = "Continue"
$ProjectDir = "C:\Users\agenew\Desktop\DaoEssence1.0"
$NodeExe = "C:\Program Files\nodejs\node.exe"
$LogDir = Join-Path $ProjectDir "scripts\logs"
$ProxyUrl = "http://127.0.0.1:7897"

# 设置代理环境变量（确保 git/node 能访问 GitHub）
$env:HTTP_PROXY = $ProxyUrl
$env:HTTPS_PROXY = $ProxyUrl
$env:http_proxy = $ProxyUrl
$env:https_proxy = $ProxyUrl

# 创建日志目录
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

# 日志文件名
$Date = Get-Date -Format "yyyy-MM-dd"
$LogFile = Join-Path $LogDir "daily-$Date.log"

function Write-Log($msg) {
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$ts] $msg"
    Add-Content -Path $LogFile -Value $line -Encoding UTF8
    Write-Host $line
}

Write-Log "========== Windows Task Scheduler 启动 =========="
Write-Log "Node: $NodeExe"
Write-Log "Project: $ProjectDir"
Write-Log "Proxy: $ProxyUrl"

# 验证 Node.js 存在
if (-not (Test-Path $NodeExe)) {
    Write-Log "ERROR: Node.js not found at $NodeExe"
    exit 1
}

# 切换到项目目录
Set-Location $ProjectDir

# 执行自动化脚本
Write-Log "开始执行 daily-run-auto.js ..."

$proc = Start-Process -FilePath $NodeExe `
    -ArgumentList "scripts/daily-run-auto.js" `
    -WorkingDirectory $ProjectDir `
    -NoNewWindow `
    -Wait `
    -PassThru `
    -RedirectStandardOutput (Join-Path $LogDir "stdout-$Date.log") `
    -RedirectStandardError (Join-Path $LogDir "stderr-$Date.log")

# 把 stdout/stderr 追加到主日志
if (Test-Path (Join-Path $LogDir "stdout-$Date.log")) {
    Get-Content (Join-Path $LogDir "stdout-$Date.log") | Add-Content $LogFile -Encoding UTF8
    Remove-Item (Join-Path $LogDir "stdout-$Date.log") -Force
}
if (Test-Path (Join-Path $LogDir "stderr-$Date.log")) {
    Get-Content (Join-Path $LogDir "stderr-$Date.log") | Add-Content $LogFile -Encoding UTF8
    Remove-Item (Join-Path $LogDir "stderr-$Date.log") -Force
}

Write-Log "退出码: $($proc.ExitCode)"
Write-Log "========== 执行完毕 =========="

# 清理 30 天前的日志
Get-ChildItem $LogDir -Filter "daily-*.log" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | Remove-Item -Force

exit $proc.ExitCode
