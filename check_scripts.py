import urllib.request

url = 'https://raw.githubusercontent.com/pixuan1989/dao-essence-shop/feature/wallpaper-dev/wallpaper-detail.html'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
resp = urllib.request.urlopen(req, timeout=15)
c = resp.read().decode('utf-8')

lines = c.split('\n')

# Find all script tags
with open(r'C:\Users\agenew\Desktop\DaoEssence1.0\script_tags.txt', 'w', encoding='utf-8') as f:
    for i, line in enumerate(lines):
        if '<script' in line or '</script>' in line:
            f.write(f'L{i+1}: {line.rstrip()[:120]}\n')

print('Done - check script_tags.txt')
