import os

base = r"C:\Users\agenew\Desktop\DaoEssence - 副本"
html_files = [f for f in os.listdir(base) if f.endswith(".html")]

def comment_block(lines, start_idx):
    """从 start_idx 找到完整的 <div class="footer-social">...</div> 块并注释掉"""
    # 确认这一行包含开始标签
    open_line = lines[start_idx]
    depth = open_line.count('<div') - open_line.count('</div>')
    end_idx = start_idx
    
    if depth <= 0:
        return None, None  # 不是正常开标签
    
    i = start_idx + 1
    while i < len(lines) and depth > 0:
        depth += lines[i].count('<div') - lines[i].count('</div>')
        i += 1
    end_idx = i - 1
    return start_idx, end_idx

for fname in html_files:
    fpath = os.path.join(base, fname)
    with open(fpath, "r", encoding="utf-8", errors="replace") as f:
        lines = f.readlines()
    
    changed = False
    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        # 找到未被注释的 footer-social div
        stripped = line.strip()
        if 'class="footer-social"' in line and stripped.startswith('<div') and not stripped.startswith('<!--'):
            start, end = comment_block(lines, i)
            if start is not None and end is not None:
                indent = line[:len(line) - len(line.lstrip())]
                new_lines.append(f'{indent}<!-- WA-TG-SOCIAL-START (uncomment when accounts ready)\n')
                for j in range(start, end + 1):
                    new_lines.append(lines[j])
                new_lines.append(f'{indent}WA-TG-SOCIAL-END -->\n')
                i = end + 1
                changed = True
                continue
        new_lines.append(line)
        i += 1
    
    if changed:
        with open(fpath, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
        print(f"Commented footer-social: {fname}")

# 单独处理 index.html 中联系列表里的 WA/TG <li> 块
index_path = os.path.join(base, "index.html")
with open(index_path, "r", encoding="utf-8", errors="replace") as f:
    content = f.read()

# 找到 WhatsApp SVG li 块并注释（在联系方式列表里）
import re

# 注释掉包含 <!-- WhatsApp --> 的 <li> 块
content = re.sub(
    r'(<li>\s*\n\s*<!-- WhatsApp -->.*?</li>)',
    r'<!-- WA-LI-START (uncomment when account ready)\n\1\nWA-LI-END -->',
    content, flags=re.DOTALL
)
# 注释掉包含 <!-- Telegram --> 的 <li> 块
content = re.sub(
    r'(<li>\s*\n\s*<!-- Telegram -->.*?</li>)',
    r'<!-- TG-LI-START (uncomment when account ready)\n\1\nTG-LI-END -->',
    content, flags=re.DOTALL
)

with open(index_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Commented WA/TG li blocks in index.html")

print("\nAll done!")
