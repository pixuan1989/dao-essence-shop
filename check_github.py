import urllib.request
import sys

url = 'https://raw.githubusercontent.com/pixuan1989/dao-essence-shop/feature/wallpaper-dev/wallpaper-detail.html'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
resp = urllib.request.urlopen(req, timeout=15)
c = resp.read().decode('utf-8')

with open(r'C:\Users\agenew\Desktop\DaoEssence1.0\github_check.txt', 'w', encoding='utf-8') as f:
    f.write('Length: ' + str(len(c)) + '\n')
    f.write('wp-data: ' + ('YES' if 'wp-data' in c else 'NO') + '\n')
    f.write('DOMContentLoaded: ' + ('YES' if 'DOMContentLoaded' in c else 'NO') + '\n')
    f.write('onerror: ' + ('YES' if 'onerror' in c else 'NO') + '\n')
    
    lines = c.split('\n')
    f.write('\n=== L688-696 (onerror) ===\n')
    for i in range(687, 696):
        f.write(f'L{i+1}: {lines[i].rstrip()}\n')
    
    f.write('\n=== L858-868 (toggle brace) ===\n')
    for i in range(857, 868):
        f.write(f'L{i+1}: {lines[i].rstrip()}\n')
    
    f.write('\n=== L1025-1035 (init call) ===\n')
    for i in range(1024, 1035):
        f.write(f'L{i+1}: {lines[i].rstrip()}\n')

print('Done - check github_check.txt')
