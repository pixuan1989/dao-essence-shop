import urllib.request

url = 'https://raw.githubusercontent.com/pixuan1989/dao-essence-shop/feature/wallpaper-dev/wallpaper-detail.html'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
resp = urllib.request.urlopen(req, timeout=15)
c = resp.read().decode('utf-8')

lines = c.split('\n')

# Find the main <script> block
script_start = None
script_end = None
for i, line in enumerate(lines):
    if '<script id="wp-data"' in line:
        script_start = i
    if script_start and '</script>' in line and i > script_start and 'wp-data' not in line:
        script_end = i
        break

if script_start and script_end:
    # Find the actual JS script after wp-data
    js_start = None
    js_end = None
    for i in range(script_end + 1, len(lines)):
        if '<script>' in lines[i]:
            js_start = i
            break
    
    if js_start:
        for i in range(js_start + 1, len(lines)):
            if '</script>' in lines[i]:
                js_end = i
                break
        
        if js_start and js_end:
            with open(r'C:\Users\agenew\Desktop\DaoEssence1.0\js_block.txt', 'w', encoding='utf-8') as f:
                f.write(f'JS script block: L{js_start+1} to L{js_end+1}\n')
                f.write(f'Total JS lines: {js_end - js_start + 1}\n\n')
                # Show lines around L1029 (init call)
                for i in range(max(js_start, 1020), min(js_end, 1040)):
                    f.write(f'L{i+1}: {lines[i].rstrip()}\n')
            print('Done - check js_block.txt')
        else:
            print('Could not find </script>')
    else:
        print('Could not find JS script start')
else:
    print('Could not find script blocks')
