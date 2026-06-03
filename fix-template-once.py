#!/usr/bin/env python3
# Fix generate-wallpapers.cjs template: replace inline download logic with download-guard.js reference

import re

with open(r'C:\Users\agenew\Desktop\DaoEssence1.0\scripts\generate-wallpapers.cjs', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Add download-guard.js script tag after auth.js line
old_auth_tag = "+ '    <script src=\"/js/auth.js\"></script>\\n'"
new_auth_tag = "+ '    <script src=\"/js/auth.js\"></script>\\n' + '    <script src=\"/js/download-guard.js\"></script>\\n'"
if old_auth_tag in c:
    c = c.replace(old_auth_tag, new_auth_tag)
    print('Added download-guard.js script tag to template')
else:
    print('WARNING: auth.js tag not found - trying alternate search')
    if '/js/auth.js' in c:
        print('  auth.js found elsewhere in file')
    else:
        print('  auth.js NOT found in file')

# 2. Remove inline download logic (SAFE ZONE block) from template
# The block starts with: + '    <!-- SAFE ZONE: Download limit ...
# and ends with:   + '    <!-- END SAFE ZONE -->\n'
safe_start = "+ '    <!-- SAFE ZONE: Download limit"
safe_end = "+ '    <!-- END SAFE ZONE -->\\n"

idx_start = c.find(safe_start)
if idx_start >= 0:
    idx_end = c.find(safe_end, idx_start)
    if idx_end >= 0:
        # Remove the entire SAFE ZONE block
        # Replace with empty string (download-guard.js handles it now)
        block_len = idx_end + len(safe_end) - idx_start
        removed = c[idx_start:idx_start+block_len]
        c = c[:idx_start] + c[idx_end + len(safe_end):]
        print(f'Removed inline download logic ({block_len} chars)')
        print('  download-guard.js now handles all download limiting')
    else:
        print('WARNING: SAFE ZONE end not found')
else:
    print('WARNING: SAFE ZONE start not found')
    # Try to find any download-related inline logic
    if 'btn.addEventListener' in c and 'download' in c:
        print('  Found download-related code in template')

# 3. Make sure the download button in template has btn-download class
# The template uses: var btn = document.querySelector(".btn-download");
# This should match buttons with class "btn-download"
# Check if the template button has the right class
if 'btn-download' in c:
    print('Template uses .btn-download selector - OK')
else:
    print('WARNING: .btn-download not found in template')

# 4. Write back
with open(r'C:\Users\agenew\Desktop\DaoEssence1.0\scripts\generate-wallpapers.cjs', 'w', encoding='utf-8') as f:
    f.write(c)

print('\nDone! Now run: node scripts/generate-wallpapers.cjs --all')
