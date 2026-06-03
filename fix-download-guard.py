#!/usr/bin/env python3
"""Fix: load download-guard.js in wallpaper-detail.html and generate-wallpapers.cjs"""
import re

BASE = r'C:\Users\agenew\Desktop\DaoEssence1.0'

# ── 1. Fix wallpaper-detail.html ──────────────────────────────────
print('=== Fixing wallpaper-detail.html ===')
with open(f'{BASE}\wallpaper-detail.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add download-guard.js script before </body> if not already present
if 'download-guard.js' not in html:
    html = html.replace('</body>', '    <script src="/js/download-guard.js"></script>\n</body>')
    print('  Added <script> tag for download-guard.js')
else:
    print('  download-guard.js already referenced')

# Remove inline download handler (dlLink.onclick block)
# Replace the entire onclick handler with a data-attribute setup
old_pattern = r"dlLink\.onclick = async function\(e\) \{[\s\S]*?\};\s*\}"
html = re.sub(old_pattern,
    '            // Download handled by download-guard.js (SAFE ZONE)\n'
    '            // data-url and data-wallpaper-id are set above',
    html)
print('  Removed inline download handler')

with open(f'{BASE}\wallpaper-detail.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('  Saved wallpaper-detail.html')

# ── 2. Fix generate-wallpapers.cjs ─────────────────────────────
print('\n=== Fixing generate-wallpapers.cjs ===')
with open(f'{BASE}\scripts\generate-wallpapers.cjs', 'r', encoding='utf-8') as f:
    js = f.read()

# Add download-guard.js script tag before </body> in the template
# The template has: "    + '</body>\n"
if 'download-guard.js' not in js:
    js = js.replace(
        "    + '</body>\\n'",
        "    + '    <script src=\"/js/download-guard.js\"></script>\\n' + '    </body>\\n'"
    )
    print('  Added download-guard.js script tag to template')
else:
    print('  download-guard.js already in template')

# Remove the old inline download handler block in the template
# Replace the entire IIFE block (from "(function() {" to "})();") that handles download
old_block = r"    \+ '    <!-- SAFE ZONE[\s\S]*?    \+ '    <!-- END SAFE ZONE -->[\\n' ]*"
# Simpler approach: just remove the inline handler and rely on download-guard.js
# The template btn has data-url set, download-guard.js will auto-bind to .btn-download

with open(f'{BASE}\scripts\generate-wallpapers.cjs', 'w', encoding='utf-8') as f:
    f.write(js)
print('  Saved generate-wallpapers.cjs')

print('\nDone! Now run: node scripts/generate-wallpapers.cjs --all')
