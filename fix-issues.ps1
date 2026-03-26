$dir = "C:\Users\agenew\Desktop\DaoEssence - 副本"
$files = Get-ChildItem "$dir\*.html" | Select-Object -ExpandProperty FullName

foreach ($f in $files) {
    $content = Get-Content $f -Raw -Encoding UTF8
    $original = $content

    # 删除 social-link 样式的 wa.me 链接块（含图标SVG）
    $content = $content -replace '(?s)\s*<a\s+href="https://wa\.me/your-number"[^>]*class="social-link"[^>]*>.*?</a>', ''
    # 删除 social-link 样式的 t.me 链接块
    $content = $content -replace '(?s)\s*<a\s+href="https://t\.me/your-handle"[^>]*class="social-link"[^>]*>.*?</a>', ''
    # 删除普通文字 WhatsApp 链接
    $content = $content -replace '\s*<a\s+href="https://wa\.me/your-number"[^>]*>WhatsApp</a>', ''
    # 删除普通文字 Telegram 链接
    $content = $content -replace '\s*<a\s+href="https://t\.me/your-handle"[^>]*>Telegram</a>', ''
    # contact.html 里独立的 WhatsApp 按钮块
    $content = $content -replace '(?s)\s*<a\s+href="https://wa\.me/your-number"[^>]*class="contact-btn[^"]*"[^>]*>.*?</a>', ''

    if ($content -ne $original) {
        Set-Content $f $content -Encoding UTF8
        Write-Host "Fixed WA/TG: $([System.IO.Path]::GetFileName($f))"
    }
}

Write-Host "Done."
