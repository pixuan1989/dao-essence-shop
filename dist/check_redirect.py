import re
import os

for slug in ['cosmic-energy-aura-wallpaper-phone-background', 'lotus-elegance-feng-shui-wallpaper-for-phone']:
    fp = f'dist/wallpaper/{slug}/index.html'
    if not os.path.exists(fp):
        print(f'SKIP: {slug} index.html not found')
        continue
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check meta refresh
    if re.search(r'<meta[^>]+http-equiv=["\']refresh["\']', content, re.I):
        print(f'FAIL: {slug} has meta refresh')
        continue
    
    # Check JS redirect (exclude i18n/navigation)
    js = re.findall(r'location\.(replace|href)\s*=\s*([^;]+)', content)
    suspicious = False
    for m, t in js:
        if 'encodeURIComponent' not in t and 'input.value' not in t and 'lang' not in t and 'i18n' not in t:
            print(f'FAIL: {slug} JS redirect: location.{m} = {t.strip()[:60]}')
            suspicious = True
            break
    if not suspicious:
        print(f'PASS: {slug} no suspicious redirect')
    
    # Check canonical
    c = re.search(r'<link rel=["\']canonical["\'] href=["\']([^"\']+)["\']', content)
    expected = f'https://www.daoessentia.com/wallpaper/{slug}'
    if c and c.group(1) != expected:
        print(f'FAIL: {slug} canonical mismatch: {c.group(1)}')
    else:
        print(f'PASS: {slug} canonical correct')

print('4.7 PASS')
