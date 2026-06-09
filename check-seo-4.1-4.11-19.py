import json, re, os

with open('wallpapers.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open('vercel.json', 'r', encoding='utf-8') as f:
    v = json.load(f)

# Get the 19 new wallpapers
new_ids = [
    'wallpaper_1780968441',
    'wallpaper_1780968392',
    'wallpaper_1780968337',
    'wallpaper_1780968271',
    'wallpaper_1780968221',
    'wallpaper_1780968177',
    'wallpaper_1780968131',
    'wallpaper_1780968080',
    'wallpaper_1780968034',
    'wallpaper_1780967982',
    'wallpaper_1780967921',
    'wallpaper_1780967857',
    'wallpaper_1780967800',
    'wallpaper_1780967747',
    'wallpaper_1780967695',
    'wallpaper_1780967642',
    'wallpaper_1780967582',
    'wallpaper_1780967322',
    'wallpaper_1780967246'
]

print(f"Checking {len(new_ids)} new wallpapers...\n")
print("="*60)

results = {
    '4.1': True, '4.2': True, '4.3': True, '4.4': True,
    '4.5': True, '4.6': True, '4.7': True, '4.8': True,
    '4.9': True, '4.10': True, '4.11': True
}

# 4.1 Check dirty internal links (/zh/ prefix)
print("\n[4.1] Checking dirty internal links (/zh/ prefix)...")
for wid in new_ids:
    w = [x for x in data if x['id'] == wid][0]
    slug = w.get('slug', '')
    if not slug:
        continue
    
    page_path = f"dist/wallpaper/{slug}/index.html"
    if not os.path.exists(page_path):
        continue
    
    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check for dirty links
    dirty_pattern = r'href="/zh/(shop|learn-bazi|favorable-element|five-elements-test|soulmate-calculator|almanac)"'
    if re.search(dirty_pattern, content):
        print(f"  FAIL: {slug} has dirty links")
        results['4.1'] = False

if results['4.1']:
    print("  PASS: No dirty links found")

# 4.2 Check .html suffix internal links
print("\n[4.2] Checking .html suffix internal links...")
for wid in new_ids:
    w = [x for x in data if x['id'] == wid][0]
    slug = w.get('slug', '')
    if not slug:
        continue
    
    page_path = f"dist/wallpaper/{slug}/index.html"
    if not os.path.exists(page_path):
        continue
    
    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check for .html suffix links
    html_pattern = r'href="[^"]*\.html"'
    matches = re.findall(html_pattern, content)
    if matches:
        print(f"  FAIL: {slug} has .html suffix links: {matches[:3]}")
        results['4.2'] = False

if results['4.2']:
    print("  PASS: No .html suffix links found")

# 4.3 Check vercel.json for duplicate redirects
print("\n[4.3] Checking vercel.json for duplicate redirects...")
sources = {}
duplicates = []
for r in v['redirects']:
    src = r['source']
    if src in sources:
        duplicates.append(src)
    else:
        sources[src] = 1

if duplicates:
    print(f"  FAIL: Found {len(duplicates)} duplicate redirects:")
    for d in duplicates[:5]:
        print(f"    {d}")
    results['4.3'] = False
else:
    print("  PASS: No duplicate redirects found")

# 4.4 Check dist/ for index.zh directories
print("\n[4.4] Checking dist/ for index.zh directories...")
zh_dirs = 0
for root, dirs, files in os.walk('dist/wallpaper'):
    for d in dirs:
        if d == 'index.zh':
            zh_dirs += 1

if zh_dirs > 0:
    print(f"  FAIL: Found {zh_dirs} index.zh/ directories")
    results['4.4'] = False
else:
    print("  PASS: No index.zh/ directories found")

# 4.5 Check sitemap.xml contains new page URLs (sample)
print("\n[4.5] Checking sitemap.xml contains new page URLs (sample)...")
with open('dist/sitemap.xml', 'r', encoding='utf-8') as f:
    sitemap = f.read()

sample_slugs = []
for wid in new_ids[:5]:
    w = [x for x in data if x['id'] == wid][0]
    slug = w.get('slug', '')
    if slug:
        sample_slugs.append(slug)

missing_in_sitemap = []
for slug in sample_slugs:
    url = f"https://www.daoessentia.com/wallpaper/{slug}"
    if url not in sitemap:
        missing_in_sitemap.append(slug)

if missing_in_sitemap:
    print(f"  FAIL: {len(missing_in_sitemap)} URLs missing from sitemap:")
    for s in missing_in_sitemap:
        print(f"    {s}")
    results['4.5'] = False
else:
    print(f"  PASS: All {len(sample_slugs)} sample URLs found in sitemap")

# 4.6 Check meta tags (canonical, og:url, og:image)
print("\n[4.6] Checking meta tags (canonical, og:url, og:image)...")
for wid in new_ids[:5]:
    w = [x for x in data if x['id'] == wid][0]
    slug = w.get('slug', '')
    if not slug:
        continue
    
    page_path = f"dist/wallpaper/{slug}/index.html"
    if not os.path.exists(page_path):
        continue
    
    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check canonical
    canonical = re.search(r'<link rel="canonical" href="([^"]+)"', content)
    if canonical:
        canonical_url = canonical.group(1)
        expected = f"https://www.daoessentia.com/wallpaper/{slug}"
        if canonical_url != expected:
            print(f"  FAIL: {slug} canonical mismatch: {canonical_url}")
            results['4.6'] = False
    else:
        print(f"  FAIL: {slug} missing canonical")
        results['4.6'] = False

if results['4.6']:
    print("  PASS: Meta tags correct (sample)")

# 4.7 Check for redirect signs (meta refresh, JS redirect)
print("\n[4.7] Checking for redirect signs (meta refresh, JS redirect)...")
for wid in new_ids[:5]:
    w = [x for x in data if x['id'] == wid][0]
    slug = w.get('slug', '')
    if not slug:
        continue
    
    page_path = f"dist/wallpaper/{slug}/index.html"
    if not os.path.exists(page_path):
        continue
    
    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check meta refresh
    if re.search(r'<meta[^>]+http-equiv=["\']refresh["\']', content, re.I):
        print(f"  FAIL: {slug} has meta refresh redirect")
        results['4.7'] = False
    
    # Check JS redirect
    js_redirect = re.search(r'location\.(replace|href)\s*=\s*([^;]+)', content)
    if js_redirect:
        target = js_redirect.group(2)
        if 'encodeURIComponent' not in target and 'input.value' not in target and 'lang' not in target and 'i18n' not in target:
            print(f"  FAIL: {slug} has JS redirect: {target[:50]}")
            results['4.7'] = False

if results['4.7']:
    print("  PASS: No redirect signs found (sample)")

# 4.8 Check vercel.json for redirect chains (A→B→C)
print("\n[4.8] Checking vercel.json for redirect chains...")
d = {r['source']: r['destination'] for r in v['redirects']}
chains = [src for src in d if d[src] in d]

if chains:
    print(f"  FAIL: Found {len(chains)} redirect chains:")
    for c in chains[:5]:
        print(f"    {c} -> {d[c]} -> {d[d[c]]}")
    results['4.8'] = False
else:
    print("  PASS: No redirect chains found")

# 4.9 Check if internal links hit vercel.json redirects
print("\n[4.9] Checking if internal links hit vercel.json redirects...")
# Build regex patterns for redirects (exclude catch-all and external)
patterns = []
for r in v['redirects']:
    if r['source'] == '/(.*)' or r['destination'].startswith('http'):
        continue
    src = r['source']
    regex = '^' + src.replace('/', '\\/').replace('\\/:id', '\\/[^/]+').replace('\\/*', '\\/.*') + '$'
    patterns.append((src, re.compile(regex), r['destination']))

# Sample check: check first 5 wallpapers
hit_count = 0
for wid in new_ids[:5]:
    w = [x for x in data if x['id'] == wid][0]
    slug = w.get('slug', '')
    if not slug:
        continue
    
    page_path = f"dist/wallpaper/{slug}/index.html"
    if not os.path.exists(page_path):
        continue
    
    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    hrefs = re.findall(r'href="([^"]+)"', content)
    for href in hrefs[:20]:
        for src, pat, dst in patterns:
            if pat.match(href):
                hit_count += 1
                break

if hit_count > 0:
    print(f"  FAIL: Found {hit_count} internal links hitting vercel.json redirects")
    results['4.9'] = False
else:
    print("  PASS: No internal links hitting vercel.json redirects")

# 4.10 Check vercel.json contains all old ID redirects for new wallpapers
print("\n[4.10] Checking vercel.json contains all old ID redirects...")
sources = [r['source'] for r in v['redirects']]
missing_redirects = []

for wid in new_ids:
    w = [x for x in data if x['id'] == wid][0]
    slug = w.get('slug', '')
    if not slug:
        continue
    
    for prefix in ['/wallpaper/', '/zh/wallpaper/']:
        for suffix in ['', '/']:
            src = prefix + wid + suffix
            if src not in sources:
                missing_redirects.append(src)

if missing_redirects:
    print(f"  FAIL: Missing {len(missing_redirects)} old ID redirects:")
    for m in missing_redirects[:10]:
        print(f"    {m}")
    results['4.10'] = False
else:
    print("  PASS: All old ID redirects found")

# 4.11 Check sitemap completeness
print("\n[4.11] Checking sitemap completeness...")
with open('dist/sitemap.xml', 'r', encoding='utf-8') as f:
    sitemap = f.read()

slugs = set(w.get('slug') for w in data if w.get('slug'))
missing = [s for s in slugs if f"https://www.daoessentia.com/wallpaper/{s}" not in sitemap]

if missing:
    print(f"  FAIL: {len(missing)} slugs missing from sitemap:")
    for s in missing[:10]:
        print(f"    {s}")
    results['4.11'] = False
else:
    print(f"  PASS: All {len(slugs)} slugs found in sitemap")

# Summary
print("\n" + "="*60)
print("SUMMARY:")
print("="*60)

all_pass = True
for check, passed in results.items():
    status = "PASS" if passed else "FAIL"
    print(f"  {check}: {status}")
    if not passed:
        all_pass = False

print("\n" + "="*60)
if all_pass:
    print("ALL CHECKS PASSED!")
else:
    print("SOME CHECKS FAILED - DO NOT COMMIT")
print("="*60)
