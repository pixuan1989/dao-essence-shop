import urllib.request

url = 'https://raw.githubusercontent.com/pixuan1989/dao-essence-shop/feature/wallpaper-dev/wallpaper-detail.html'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
resp = urllib.request.urlopen(req, timeout=15)
c = resp.read().decode('utf-8')

lines = c.split('\n')

# Extract JS from L643 to L1041
js_lines = lines[642:1041]
js_code = '\n'.join(js_lines)

# Try to parse it with a simple JS parser approach
# We'll extract and check each function

with open(r'C:\Users\agenew\Desktop\DaoEssence1.0\js_validation.txt', 'w', encoding='utf-8') as f:
    f.write('=== JS Validation Report ===\n\n')
    
    # Track depth at each line
    depth = 0
    errors = []
    for i, line in enumerate(js_lines):
        for ch in line:
            if ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth < 0:
                    errors.append(f'L{i+643}: depth went negative ({depth})')
    
    f.write(f'Final depth: {depth}\n')
    f.write(f'Errors: {len(errors)}\n')
    for e in errors:
        f.write(f'  {e}\n')
    
    # Now let's trace through line by line around key areas
    f.write('\n=== Line-by-line depth trace (L835-L845) ===\n')
    depth = 0
    for i in range(834, 845):
        line = lines[i]
        pre_depth = depth
        for ch in line:
            if ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
        f.write(f'L{i+1}: depth {pre_depth}→{depth} | {line.rstrip()[:80]}\n')
    
    # Check init function
    f.write('\n=== Line-by-line depth trace (L654-L675) ===\n')
    depth = 0
    for i in range(653, 675):
        line = lines[i]
        pre_depth = depth
        for ch in line:
            if ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
        f.write(f'L{i+1}: depth {pre_depth}→{depth} | {line.rstrip()[:80]}\n')

print('Done - check js_validation.txt')
