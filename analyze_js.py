import urllib.request
import re

url = 'https://raw.githubusercontent.com/pixuan1989/dao-essence-shop/feature/wallpaper-dev/wallpaper-detail.html'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
resp = urllib.request.urlopen(req, timeout=15)
c = resp.read().decode('utf-8')

lines = c.split('\n')

# Extract JS block (L643 to L1041)
js_lines = lines[642:1041]  # 0-indexed
js_code = '\n'.join(js_lines)

# Check brace balance
depth = 0
max_depth = 0
for i, ch in enumerate(js_code):
    if ch == '{':
        depth += 1
        max_depth = max(max_depth, depth)
    elif ch == '}':
        depth -= 1

with open(r'C:\Users\agenew\Desktop\DaoEssence1.0\js_analysis.txt', 'w', encoding='utf-8') as f:
    f.write('JS Block Analysis (L643-L1041)\n')
    f.write(f'Total lines: {len(js_lines)}\n')
    f.write(f'Max brace depth: {max_depth}\n')
    f.write(f'Final brace depth: {depth}\n')
    f.write(f'Status: {"BALANCED" if depth == 0 else "UNBALANCED (error!)"}\n')
    
    # Check for common syntax errors
    f.write('\n--- Checking for common errors ---\n')
    
    # 1. Check if all { have matching }
    opens = js_code.count('{')
    closes = js_code.count('}')
    f.write(f'Opening braces: {opens}\n')
    f.write(f'Closing braces: {closes}\n')
    f.write(f'Balance: {opens - closes}\n')
    
    # 2. Check parentheses balance
    parens_open = js_code.count('(')
    parens_close = js_code.count(')')
    f.write(f'\nOpening parens: {parens_open}\n')
    f.write(f'Closing parens: {parens_close}\n')
    f.write(f'Balance: {parens_open - parens_close}\n')
    
    # 3. Check bracket balance
    brackets_open = js_code.count('[')
    brackets_close = js_code.count(']')
    f.write(f'\nOpening brackets: {brackets_open}\n')
    f.write(f'Closing brackets: {brackets_close}\n')
    f.write(f'Balance: {brackets_open - brackets_close}\n')
    
    # 4. Find the DOMContentLoaded line
    for i, line in enumerate(js_lines):
        if 'DOMContentLoaded' in line:
            f.write(f'\nDOMContentLoaded at JS line {i+1} (HTML L{i+643}):\n')
            f.write(f'  {line.rstrip()}\n')
            # Show context
            for j in range(max(0, i-2), min(len(js_lines), i+3)):
                f.write(f'  L{j+643}: {js_lines[j].rstrip()}\n')
    
    # 5. Show lines 858-868 in JS context
    f.write('\n--- Lines 858-868 in HTML context ---\n')
    for i in range(857, 868):
        f.write(f'L{i+1}: {lines[i].rstrip()}\n')
    
    # 6. Show the toggle event listener section in detail
    f.write('\n--- Toggle listener section (L844-L864) ---\n')
    for i in range(843, 864):
        f.write(f'L{i+1}: {lines[i].rstrip()}\n')

print('Done - check js_analysis.txt')
