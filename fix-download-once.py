#!/usr/bin/env python3
"""一键修复壁纸下载限制 - 安全区方案"""
import re

BASE = r'C:\Users\agenew\Desktop\DaoEssence1.0'

# ── 1. 确认 download-guard.js 内容正确 ─────────────
print('=== 1. Checking download-guard.js ===')
with open(f'{BASE}\js\download-guard.js', 'r', encoding='utf-8') as f:
    guard = f.read()
print('  has handleDownload:', 'handleDownload' in guard)
print('  has getSessionToken:', 'getSessionToken' in guard)
print('  has /api/auth:', 'api/auth' in guard)
print('  has window.open:', 'window.open' in guard)
if 'window.open' in guard:
    print('  WARNING: window.open found in download-guard.js!')

# ── 2. 修复 wallpaper-detail.html ─────────────────────
print('\n=== 2. Fixing wallpaper-detail.html ===')
with open(f'{BASE}\wallpaper-detail.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 2a. 加 <script src="/js/download-guard.js"></script> 在 </body> 前（如果还没有）
if 'download-guard.js' not in html:
    html = html.replace('</body>', '    <script src="/js/download-guard.js"></script>\n</body>')
    print('  Added download-guard.js script tag')
else:
    print('  download-guard.js script tag already present')

# 2b. 给下载按钮加 data-wallpaper-id 和 data-url（通过 JS 设置，不需要改 HTML）
# 确认 JS 里有设置 data-wallpaper-id
if 'data-wallpaper-id' not in html:
    # 在 dlLink.setAttribute('data-url', ...) 后面加一行设置 data-wallpaper-id
    html = html.replace(
        "dlLink.setAttribute('data-url', data.original);",
        "dlLink.setAttribute('data-url', data.original);\n                dlLink.setAttribute('data-wallpaper-id', wallpaperId);\n                dlLink.classList.add('btn-download-safe');"
    )
    print('  Added data-wallpaper-id setup')
else:
    print('  data-wallpaper-id setup already present')

# 2c. 删掉内嵌的下载处理逻辑（dlLink.onclick 整个块）
# 找到 "Store download URL" 注释到 "}" 的整个块
pattern = r"            // Store download URL.*?            \}"
html_new = re.sub(pattern, 
    "            // Download handled by download-guard.js (SAFE ZONE)\n            const dlLink = document.getElementById('download-link');\n            if (dlLink) {\n                dlLink.setAttribute('data-url', data.original);\n                dlLink.setAttribute('data-wallpaper-id', wallpaperId);\n                dlLink.classList.add('btn-download-safe');\n            }",
    html, flags=re.DOTALL)
if html_new != html:
    html = html_new
    print('  Removed inline download handler')
else:
    print('  WARNING: could not find inline handler to remove')

with open(f'{BASE}\wallpaper-detail.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('  Saved wallpaper-detail.html')

# ── 3. 修复 generate-allpapers.cjs 模板 ─────────────
print('\n=== 3. Fixing generate-allpapers.cjs ===')
with open(f'{BASE}\scripts\generate-allpapers.cjs', 'r', encoding='utf-8') as f:
    js = f.read()

# 3a. 加 download-guard.js script 标签（在 </body> 前）
if 'download-guard.js' not in js:
    js = js.replace(
        "    + '</body>\\n'",
        "    + '    <script src=\"/js/download-guard.js\"></script>\\n' + '    </body>\\n'"
    )
    print('  Added download-guard.js to template')
else:
    print('  download-guard.js already in template')

# 3b. 确认模板里的按钮有 data-wallpaper-id 和正确的 class
if 'btn-download-safe' not in js:
    js = js.replace(
        '.btn-download"',
        '.btn-download btn-download-safe"'
    )
    print('  Added btn-download-safe class to template button')
else:
    print('  btn-download-safe already in template')

with open(f'{BASE}\scripts\generate-allpapers.cjs', 'w', encoding='utf-8') as f:
    f.write(js)
print('  Saved generate-allpapers.cjs')

# ── 4. 重新生成所有静态页面 ─────────────────────
print('\n=== 4. Regenerating all static pages ===')
import subprocess
result = subprocess.run(
    ['node', 'scripts/generate-allpapers.cjs', '--all'],
    cwd=BASE, capture_output=True, text=True, timeout=120
)
print('  STDOUT:', result.stdout[-500:] if len(result.stdout) > 500 else result.stdout)
if result.returncode != 0:
    print('  STDERR:', result.stderr[-500:])
else:
    print('  Regeneration done!')

print('\n=== ALL DONE ===')
print('Next: git add -A && git commit && git push')
