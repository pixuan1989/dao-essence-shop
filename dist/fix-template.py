import os

path = r'C:\Users\agenew\Desktop\DaoEssence1.0\scripts\generate-wallpapers.cjs'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the line with auth.js and insert download-guard.js after it
inserted = False
for i, line in enumerate(lines):
    if 'auth.js"></script>' in line and 'download-guard' not in ''.join(lines[max(0,i-2):i+3]):
        # Insert download-guard.js line after this line
        indent = line[:len(line) - len(line.lstrip())]
        new_line = indent + "    + '<script src=\"/js/download-guard.js\"></script>\\n'\n"
        lines.insert(i+1, new_line)
        inserted = True
        print(f'Inserted download-guard.js after line {i+1}')
        break

if inserted:
    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print('Done!')
else:
    print('ERROR: Could not find insertion point')
    # Debug: show lines around auth.js
    for i, line in enumerate(lines):
        if 'auth.js' in line:
            print(f'Line {i+1}: {line.rstrip()[:100]}')
