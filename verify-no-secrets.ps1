# PowerShell 脚本：验证代码中是否包含 Stripe 密钥

Write-Host "🔍 正在检查代码中的敏感信息..." -ForegroundColor Cyan

# 要检查的完整密钥
$fullPrivateKey = "sk_test_51TCXN018te51GWiewKqP8Rp8reBZP8oL4WCxngJPliUJKjHbRbRIgpqeEnZ67XylRnLfNvC09I0FXSYhDZo5hsDx00ofI4i5z6"
$fullPublicKey = "pk_test_51TCXN018te51GWieGBFm9rFjcfiZoLq8HEopzrq9gKHOnCi7afzcdUGuptRdlDrLMs6QiFl7bvHfOmIOPKstjPGk00zANzAQjV"

Write-Host ""
Write-Host "检查完整的密钥..." -ForegroundColor Yellow

$files = Get-ChildItem -Path . -Recurse -File -Include *.js,*.html,*.md,*.json,*.toml | Where-Object { $_.DirectoryName -notlike "*node_modules*" -and $_.DirectoryName -notlike "*.git*" -and $_.DirectoryName -notlike "*orders*" }

$foundSecrets = $false

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    if ($content -match [regex]::Escape($fullPrivateKey)) {
        Write-Host "❌ 发现完整的 Stripe 私钥在: $($file.Name)" -ForegroundColor Red
        $foundSecrets = $true
    }

    if ($content -match [regex]::Escape($fullPublicKey)) {
        Write-Host "❌ 发现完整的 Stripe 公钥在: $($file.Name)" -ForegroundColor Red
        $foundSecrets = $true
    }
}

if (-not $foundSecrets) {
    Write-Host "✅ 未发现完整的 Stripe 密钥" -ForegroundColor Green
}

Write-Host ""
Write-Host "检查 .gitignore..." -ForegroundColor Yellow

$gitignore = Get-Content .gitignore -Raw -ErrorAction SilentlyContinue
if ($gitignore -match "\.env") {
    Write-Host "✅ .env 文件已在 .gitignore 中" -ForegroundColor Green
} else {
    Write-Host "❌ 警告：.env 文件不在 .gitignore 中！" -ForegroundColor Red
    $foundSecrets = $true
}

Write-Host ""

if ($foundSecrets) {
    Write-Host "❌ 检查失败！请先修复问题再提交。" -ForegroundColor Red
    exit 1
} else {
    Write-Host "🎉 所有检查通过！代码可以安全提交。" -ForegroundColor Green
}
