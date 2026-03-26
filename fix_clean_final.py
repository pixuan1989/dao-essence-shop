import os, re

base = r"C:\Users\agenew\Desktop\DaoEssence - 副本"
html_files = [f for f in os.listdir(base) if f.endswith(".html")]

for fname in html_files:
    fpath = os.path.join(base, fname)
    with open(fpath, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()
    original = content

    # 彻底清理所有历次留下的注释包装（保留内部HTML内容）
    # 模式: <!-- xxx --> ... 包含 footer-social div ... <!-- 或 -->
    
    # 1. 清理 SOCIAL-ICONS-START 包装（保留内容）
    content = re.sub(
        r'<!--\s*SOCIAL-ICONS-START[^\n]*\n(.*?)SOCIAL-ICONS-END\s*-->',
        lambda m: m.group(1).strip() + '\n',
        content, flags=re.DOTALL
    )
    # 2. 清理 WA-TG-SOCIAL-START 包装
    content = re.sub(
        r'<!--\s*WA-TG-SOCIAL-START[^\n]*\n(.*?)WA-TG-SOCIAL-END\s*-->',
        lambda m: m.group(1).strip() + '\n',
        content, flags=re.DOTALL
    )
    # 3. 清理 SOCIAL-ICONS: uncomment 包装
    content = re.sub(
        r'<!--\s*SOCIAL-ICONS:[^\n]*\n(.*?)-->',
        lambda m: m.group(1).rstrip() + '\n',
        content, flags=re.DOTALL
    )
    # 4. 清理 WA-LI/TG-LI 包装
    content = re.sub(
        r'<!--\s*WhatsApp-ICON:[^\n]*\n(.*?)-->',
        lambda m: m.group(1).rstrip() + '\n',
        content, flags=re.DOTALL
    )
    content = re.sub(
        r'<!--\s*Telegram-ICON:[^\n]*\n(.*?)-->',
        lambda m: m.group(1).rstrip() + '\n',
        content, flags=re.DOTALL
    )
    content = re.sub(
        r'<!--\s*WA-LI-START[^\n]*\n(.*?)WA-LI-END\s*-->',
        lambda m: m.group(1).strip() + '\n',
        content, flags=re.DOTALL
    )
    content = re.sub(
        r'<!--\s*TG-LI-START[^\n]*\n(.*?)TG-LI-END\s*-->',
        lambda m: m.group(1).strip() + '\n',
        content, flags=re.DOTALL
    )

    if content != original:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Cleaned: {fname}")

print("Step 1 - cleanup done.\n")

# Step 2: 现在对每个干净的文件，找到 footer-social div 并整块注释
for fname in html_files:
    fpath = os.path.join(base, fname)
    with open(fpath, "r", encoding="utf-8", errors="replace") as f:
        lines = f.readlines()

    new_lines = []
    i = 0
    changed = False

    while i < len(lines):
        line = lines[i]
        # 找未注释的 footer-social <div ...>
        if 'footer-social' in line and re.search(r'<div\b', line) and not line.strip().startswith('<!--'):
            # 收集整个 div 块
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
            # 写入注释
            new_lines.append(f"{indent}<!-- SOCIAL-ICONS-HIDDEN: remove comment tags when accounts are ready\n")
            new_lines.extend(block)
            new_lines.append(f"{indent}-->\n")
            i = j
            changed = True
            continue
        new_lines.append(line)
        i += 1

    if changed:
        with open(fpath, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
        print(f"Commented footer-social: {fname}")

# Step 3: index.html 的 WA/TG <li> 块
index_path = os.path.join(base, "index.html")
with open(index_path, "r", encoding="utf-8", errors="replace") as f:
    lines = f.readlines()

new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    if line.strip() == '<li>' and i + 1 < len(lines):
        next_s = lines[i+1].strip()
        if next_s in ('<!-- WhatsApp -->', '<!-- Telegram -->'):
            indent = line[:len(line) - len(line.lstrip())]
            label = "WhatsApp" if "WhatsApp" in next_s else "Telegram"
            depth = 0
            block = []
            j = i
            while j < len(lines):
                l = lines[j]
                depth += l.count('<li>') - l.count('</li>')
                block.append(l)
                j += 1
                if depth <= 0:
                    break
            new_lines.append(f"{indent}<!-- {label}-ICON-HIDDEN: remove comment when account ready\n")
            new_lines.extend(block)
            new_lines.append(f"{indent}-->\n")
            i = j
            continue
    new_lines.append(line)
    i += 1

with open(index_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)
print("Commented WA/TG li in index.html")

# 验证
print("\n--- Verification ---")
issues = []
for fname in sorted(html_files):
    fpath = os.path.join(base, fname)
    with open(fpath, "r", encoding="utf-8", errors="replace") as f:
        lines = f.readlines()
    in_comment = False
    for i, line in enumerate(lines, 1):
        s = line.strip()
        if '<!--' in s:
            in_comment = True
        if '-->' in s and in_comment:
            in_comment = False
        if 'footer-social' in line and '<div' in line and not in_comment and not s.startswith('<!--'):
            issues.append(f"UNCMT {fname}:{i}")

if issues:
    for x in issues:
        print(x)
else:
    print("ALL CLEAR - footer-social properly commented!")
