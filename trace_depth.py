import urllib.request

url = 'https://raw.githubusercontent.com/pixuan1989/dao-essence-shop/feature/wallpaper-dev/wallpaper-detail.html'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
resp = urllib.request.urlopen(req, timeout=15)
c = resp.read().decode('utf-8')

lines = c.split('\n')

with open(r'C:\Users\agenew\Desktop\DaoEssence1.0\depth_trace.txt', 'w', encoding='utf-8') as f:
    # Full depth trace from L654 to L1041
    f.write('Full depth trace L654-L1041 (0-indexed: 653-1040)\n')
    f.write('Only showing lines where depth changes\n\n')
    
    depth = 0
    for i in range(653, 1041):
        line = lines[i]
        pre = depth
        for ch in line:
            if ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
        if depth != pre:
            f.write(f'L{i+1}: {pre} -> {depth} | {line.strip()[:70]}\n')
            if depth < 0:
                f.write(f'  *** ERROR: depth negative! ***\n')

print('Done - check depth_trace.txt')
