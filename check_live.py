import urllib.request
import json

# Let's try the original daoessentia.com domain which might not be protected
urls_to_try = [
    'https://www.daoessentia.com/wallpaper-detail?id=wallpaper_1780233504',
    'https://daoessence-shop-lqeai7v6m-daodao-74dfe427.vercel.app/wallpaper-detail.html?id=wallpaper_1780233504',
    'https://daoessence-shop-lqeai7v6m-daodao-74dfe427.vercel.app/wallpaper-detail',
]

for url in urls_to_try:
    print(f'\nTrying: {url}')
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        resp = urllib.request.urlopen(req, timeout=15)
        html = resp.read().decode('utf-8')
        print(f'Status: {resp.status}')
        print(f'Length: {len(html)}')
        print(f'wp-data: {"YES" if "wp-data" in html else "NO"}')
        print(f'DOMContentLoaded: {"YES" if "DOMContentLoaded" in html else "NO"}')
        print(f'onerror: {"YES" if "onerror" in html else "NO"}')
        
        # Save for inspection
        filename = url.split('/')[-1].split('?')[0] + '.html'
        filepath = f'C:\\Users\\agenew\\Desktop\\DaoEssence1.0\\vercel_{filename}'
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f'Saved to {filename}')
        break  # Stop on first success
        
    except Exception as e:
        print(f'Failed: {e}')
