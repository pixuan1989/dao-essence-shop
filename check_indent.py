import urllib.request

url = 'https://raw.githubusercontent.com/pixuan1989/dao-essence-shop/feature/wallpaper-dev/wallpaper-detail.html'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
resp = urllib.request.urlopen(req, timeout=15)
c = resp.read().decode('utf-8')

lines = c.split('\n')

with open(r'C:\Users\agenew\Desktop\DaoEssence1.0\indentation_check.txt', 'w', encoding='utf-8') as f:
    f.write('=== Checking L776-L830 (download link section) ===\n\n')
    
    for i in range(775, 830):
        line = lines[i]
        # Count leading spaces
        spaces = len(line) - len(line.lstrip())
        content = line.lstrip()
        f.write(f'L{i+1}: [{spaces:2d} spaces] {content}\n')
    
    f.write('\n\n=== Brace depth analysis for this section ===\n')
    depth = 0
    for i in range(675, 843):  # from function render start to end
        line = lines[i]
        for ch in line:
            if ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
        if depth < 0:
            f.write(f'L{i+1}: WARNING - depth went negative: {depth}\n')
        # Show depth at key lines
        if i in [776, 780, 788, 798, 822, 827, 828, 837, 838, 841, 842]:
            f.write(f'L{i+1}: depth after line = {depth}\n')

print('Done - check indentation_check.txt')
