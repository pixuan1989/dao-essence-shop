# DaoEssence 自动部署脚本 - 修复版本
# 一键将项目推送到 GitHub

Write-Host "Starting deployment of DaoEssence to GitHub..." -ForegroundColor Cyan
Write-Host ""

# Check if Git is initialized
if (-not (Test-Path ".\.git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
}

# Configure Git user
Write-Host "Configuring Git user..." -ForegroundColor Yellow
git config user.name "pixuan1989"
git config user.email "pixuan1989@outlook.com"

# Add all files
Write-Host "Adding files to staging area..." -ForegroundColor Yellow
git add .

# Commit changes
Write-Host "Committing changes..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Deploy: DaoEssence shop update - $timestamp"

# Configure remote repository
Write-Host "Configuring remote repository..." -ForegroundColor Yellow
$remoteUrl = "https://github.com/pixuan1989/dao-essence.git"

# Check if remote already exists
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote -and $existingRemote -ne $remoteUrl) {
    Write-Host "Updating remote repository URL..." -ForegroundColor Yellow
    git remote remove origin
}

git remote add origin $remoteUrl 2>$null

# Set main branch
Write-Host "Setting main branch..." -ForegroundColor Yellow
git branch -M main 2>$null

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push -u origin main --force

Write-Host ""
Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "GitHub Repository: https://github.com/pixuan1989/dao-essence" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Visit https://app.netlify.com" -ForegroundColor White
Write-Host "2. Connect your GitHub account" -ForegroundColor White
Write-Host "3. Deploy the dao-essence repository" -ForegroundColor White
Write-Host "4. Wait for automatic deployment" -ForegroundColor White
Write-Host ""
Write-Host "Note: Run this script again after updating code to sync with GitHub" -ForegroundColor Yellow
