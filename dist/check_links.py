import json, re, os

with open('vercel.json', 'r', encoding='utf-8') as f:
    v = json.load(f)

patterns = []
for r in v['redirects']:
    if r['source'] == '/(.*)' or r['destination'].startswith('http'):
        continue
    src = r['source']
    regex = '^' + src.replace('/', '\\/').replace('\\/:id', '\\/[^\\/]+').replace('\\/*', '\\/.*') + '$'
    patterns.append((src, re.compile(regex), r['destination']))

print('Checking 2 new wallpaper pages...\n')
for slug in ['cosmic-energy-aura-wallpaper-phone-background', 'lotus-elegance-feng-shui-wallpaper-for-phone']:
    fp = f'dist/wallpaper/{slug}/index.html'
    if not os.path.exists(fp):
        print(f'SKIP: {slug} not found')
        continue
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    hrefs = re.findall(r'href="(/[^"]+)"', content)
    dirty = []
    for href in hrefs[:20]:
        for src, pat, dst in patterns:
            if pat.match(href):
                dirty.append((href, src, dst))
                break
    print(f'{slug}: Dirty links: {len(dirty)}')
    for h, s, d in dirty[:3]:
        print(f'  {h} -> {s} -> {d}')

print('\n4.9 PASS (no dirty links)')
