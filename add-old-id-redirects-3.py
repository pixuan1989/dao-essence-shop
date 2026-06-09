import json

with open('vercel.json', 'r', encoding='utf-8') as f:
    v = json.load(f)

with open('wallpapers.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

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

print(f"Adding old-ID redirects for {len(new_ids)} wallpapers (76 redirects total)...\n")

added = 0
for wid in new_ids:
    w = [x for x in data if x['id'] == wid][0]
    slug = w.get('slug', '')
    if not slug:
        print(f"SKIP: {wid} has no slug")
        continue
    
    # 4 redirects per wallpaper
    redirects = [
        # EN: no slash, slash
        {'source': f'/wallpaper/{wid}', 'destination': f'/wallpaper/{slug}', 'permanent': False},
        {'source': f'/wallpaper/{wid}/', 'destination': f'/wallpaper/{slug}', 'permanent': False},
        # ZH: no slash, slash
        {'source': f'/zh/wallpaper/{wid}', 'destination': f'/zh/wallpaper/{slug}', 'permanent': False},
        {'source': f'/zh/wallpaper/{wid}/', 'destination': f'/zh/wallpaper/{slug}', 'permanent': False}
    ]
    
    for r in redirects:
        if r not in v['redirects']:
            v['redirects'].append(r)
            added += 1

print(f"Added {added} new redirects")

# Check for duplicates
sources = {}
duplicates = []
for r in v['redirects']:
    src = r['source']
    if src in sources:
        duplicates.append(src)
    else:
        sources[src] = 1

if duplicates:
    print(f"\nWARNING: Found {len(duplicates)} duplicate redirects:")
    for d in duplicates[:10]:
        print(f"  {d}")
else:
    print("\nNo duplicate redirects")

with open('vercel.json', 'w', encoding='utf-8') as f:
    json.dump(v, f, ensure_ascii=False, indent=2)

print("\nvercel.json updated successfully")
