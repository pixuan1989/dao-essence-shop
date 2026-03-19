# DaoEssence 自动部署脚本 - PowerShell 版本
# 一键将项目推送到 GitHub

Write-Host "🚀 开始部署 DaoEssence 到 GitHub..." -ForegroundColor Cyan
Write-Host ""

# 检查是否已初始化 Git
if (-not (Test-Path ".\.git")) {
    Write-Host "📝 初始化 Git 仓库..." -ForegroundColor Yellow
    git init
}

# 配置 Git 用户（如果还没配置）
Write-Host "⚙️  配置 Git 用户信息..." -ForegroundColor Yellow
git config user.name "pixuan1989"
git config user.email "your-email@example.com"

# 添加所有文件
Write-Host "📦 添加文件到暂存区..." -ForegroundColor Yellow
git add .

# 提交更改
Write-Host "💾 提交更改..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Deploy: DaoEssence shop update - $timestamp"

# 设置远程仓库
Write-Host "🔗 配置远程仓库..." -ForegroundColor Yellow
$remoteUrl = "https://github.com/pixuan1989/道本.git"

# 检查是否已存在远程仓库
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote -and $existingRemote -ne $remoteUrl) {
    Write-Host "⚠️  更新远程仓库地址..." -ForegroundColor Yellow
    git remote remove origin
}

git remote add origin $remoteUrl 2>$null

# 设置主分支
Write-Host "🌿 设置主分支..." -ForegroundColor Yellow
git branch -M main 2>$null

# 推送到 GitHub
Write-Host "📤 推送到 GitHub..." -ForegroundColor Cyan
git push -u origin main --force

Write-Host ""
Write-Host "✅ 部署完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📍 GitHub 仓库链接: https://github.com/pixuan1989/道本" -ForegroundColor Green
Write-Host ""
Write-Host "接下来的步骤:" -ForegroundColor Cyan
Write-Host "1. 访问 https://app.netlify.com" -ForegroundColor White
Write-Host "2. 连接你的 GitHub 账户和仓库" -ForegroundColor White
Write-Host "3. 配置部署设置（基目录: shop）" -ForegroundColor White
Write-Host "4. 等待自动部署完成" -ForegroundColor White
Write-Host ""
Write-Host "💡 提示: 每次更新代码后，再次运行此脚本即可自动同步到 GitHub" -ForegroundColor Yellow
