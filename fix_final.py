import os, re

base = r"C:\Users\agenew\Desktop\DaoEssence - 副本"
html_files = [f for f in os.listdir(base) if f.endswith(".html")]

# Step 1: 清理上次脚本留下的所有错误注释标记
for fname in html_files:
    fpath = os.path.join(base, fname)
    with open(fpath, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()
    original = content
    # 清理第一次脚本的包装（SOCIAL-ICONS-START/END）
    content = re.sub(
        r'<!-- SOCIAL-ICONS-START \(restore when accounts ready\)\s*\n(.*?)\s*\nSOCIAL-ICONS-END -->',
        r'\1', content, flags=re.DOTALL
    )
    # 清理第二次脚本的包装（WA-TG-SOCIAL-START/END）
    content = re.sub(
        r'<!-- WA-TG-SOCIAL-START \(uncomment when accounts ready\)\s*\n(.*?)\s*\nWA-TG-SOCIAL-END -->',
        r'\1', content, flags=re.DOTALL
    )
    # 清理 WA-LI / TG-LI 包装
    content = re.sub(
        r'<!-- WA-LI-START \(uncomment when account ready\)\s*\n(.*?)\s*\nWA-LI-END -->',
        r'\1', content, flags=re.DOTALL
    )
    content = re.sub(
        r'<!-- TG-LI-START \(uncomment when account ready\)\s*\n(.*?)\s*\nTG-LI-END -->',
        r'\1', content, flags=re.DOTALL
    )
    if content != original:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Cleaned old comments: {fname}")

print("Step 1 done.\n")

# Step 2: 重新注释 footer-social 块（正确方式）
for fname in html_files:
    fpath = os.path.join(base, fname)
    with open(fpath, "r", encoding="utf-8", errors="replace") as f:
        lines = f.readlines()
    
    new_lines = []
    i = 0
    changed = False
    
    while i < len(lines):
        line = lines[i]
        # 找到未注释的 footer-social <div>
        if 'footer-social' in line and '<div' in line and not line.strip().startswith('<!--'):
            indent = line[:len(line) - len(line.lstrip())]
            depth = 0
            block = []
            j = i
            while j < len(lines):
                l = lines[j]
                depth += l.count('<div') - l.count('</div>')
                block.append(l)
                j += 1
                if depth <= 0:
                    break
            # 生成正确的 HTML 注释包装
            new_lines.append(indent + '<!-- SOCIAL-ICONS: uncomment when accounts are ready\n')
            new_lines.extend(block)
            new_lines.append(indent + '-->\n')
            i = j
            changed = True
            continue
        new_lines.append(line)
        i += 1
    
    if changed:
        with open(fpath, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
        print(f"Commented footer-social: {fname}")

# Step 3: index.html 联系列表里的 WA/TG <li> 块
index_path = os.path.join(base, "index.html")
with open(index_path, "r", encoding="utf-8", errors="replace") as f:
    lines = f.readlines()

new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    s = line.strip()
    # 检测 <li> 后面紧跟 <!-- WhatsApp --> 或 <!-- Telegram --> 的块
    if s == '<li>' and i + 1 < len(lines):
        next_s = lines[i+1].strip()
        if next_s in ('<!-- WhatsApp -->', '<!-- Telegram -->'):
            indent = line[:len(line) - len(line.lstrip())]
            block = []
            j = i
            depth = 0
            while j < len(lines):
                l = lines[j]
                depth += l.count('<li>') - l.count('</li>')
                block.append(l)
                j += 1
                if depth <= 0:
                    break
            label = "WhatsApp" if "WhatsApp" in next_s else "Telegram"
            new_lines.append(indent + f'<!-- {label}-ICON: uncomment when account is ready\n')
            new_lines.extend(block)
            new_lines.append(indent + '-->\n')
            i = j
            continue
    new_lines.append(line)
    i += 1

with open(index_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)
print("Commented WA/TG li in index.html")

print("\nAll done!")
