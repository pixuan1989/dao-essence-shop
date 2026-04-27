import re

with open('zh-tutorial-content.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all x造 placeholder patterns
# Pattern 1: Pure placeholder (case-label + case-note + closing div)
pure_pattern = r'    <div class="case-label">📋 舉例：x造\s+甲\s+甲\s+甲\s+甲</div>\n    <div class="case-note">子\s+子\s+子\s+子</div>\n  </div>'
pure_replacement = '    <div class="case-note">📋 案例待補充</div>\n  </div>'
content = re.sub(pure_pattern, pure_replacement, content)

# Pattern 2: Mixed (case-label + case-note + more case-notes before closing div)
mixed_pattern = r'    <div class="case-label">📋 舉例：x造\s+甲\s+甲\s+甲\s+甲</div>\n    <div class="case-note">子\s+子\s+子\s+子</div>'
mixed_replacement = '    <div class="case-note">📋 案例待補充</div>'
content = re.sub(mixed_pattern, mixed_replacement, content)

with open('zh-tutorial-content.html', 'w', encoding='utf-8') as f:
    f.write(content)

remaining = len(re.findall(r'x造', content))
print(f'Remaining x造: {remaining}')
print('Done!')
