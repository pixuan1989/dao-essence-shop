import urllib.request

url = 'https://raw.githubusercontent.com/pixuan1989/dao-essence-shop/feature/wallpaper-dev/wallpaper-detail.html'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
resp = urllib.request.urlopen(req, timeout=15)
c = resp.read().decode('utf-8')

lines = c.split('\n')

with open(r'C:\Users\agenew\Desktop\DaoEssence1.0\render_structure.txt', 'w', encoding='utf-8') as f:
    f.write('=== render() function structure (L676-L842) ===\n\n')
    
    # Find render function
    for i, line in enumerate(lines):
        if 'function render(index)' in line:
            f.write(f'L{i+1}: {line.rstrip()}\n')
            # Show until we hit the next function or end of main script
            for j in range(i+1, min(i+170, len(lines))):
                stripped = lines[j].strip()
                if stripped.startswith('function ') and 'render' not in lines[j]:
                    f.write(f'\n--- Next function at L{j+1} ---\n')
                    f.write(f'L{j+1}: {lines[j].rstrip()}\n')
                    break
                f.write(f'L{j+1}: {lines[j].rstrip()}\n')
            break
    
    # Also show init() function
    f.write('\n\n=== init() function (L654-L674) ===\n')
    for i, line in enumerate(lines):
        if 'function init()' in line:
            for j in range(i, min(i+25, len(lines))):
                f.write(f'L{j+1}: {lines[j].rstrip()}\n')
            break

print('Done - check render_structure.txt')
