import os

base = r"C:\Users\agenew\Desktop\DaoEssence - 副本"
html_files = [f for f in os.listdir(base) if f.endswith(".html")]

def find_and_comment_footer_social(lines):
    """找到所有未被 HTML 注释包裹的 footer-social div，整块注释掉"""
    new_lines = []
    i = 0
    changed = False
    
    while i < len(lines):
        line = lines[i]
        s = line.strip()
        
        # 检测未注释的 footer-social 起始 div
        if "footer-social" in line and "<div" in line and not s.startswith("<!--"):
            # 向前检查是否已被注释包围
            already_commented = False
            for back in range(max(0, i-5), i):
                if "WA-TG-SOCIAL-START" in lines[back] or "SOCIAL-ICONS-START" in lines[back]:
                    already_commented = True
                    break
            
            if already_commented:
                new_lines.append(line)
                i += 1
                continue
            
            # 找到这个 div 块的结束位置
            indent = line[:len(line) - len(line.lstrip())]
            depth = 0
            start_i = i
            block_lines = []
            
            while i < len(lines):
                l = lines[i]
                depth += l.count("<div") - l.count("</div>")
                block_lines.append(l)
                i += 1
                if depth <= 0:
                    break
            
            # 输出注释块
            new_lines.append(f"{indent}<!-- WA-TG-SOCIAL-START: uncomment when accounts ready\n")
            new_lines.extend(block_lines)
            new_lines.append(f"{indent}WA-TG-SOCIAL-END -->\n")
            changed = True
            continue
        
        new_lines.append(line)
        i += 1
    
    return new_lines, changed

for fname in html_files:
    fpath = os.path.join(base, fname)
    with open(fpath, "r", encoding="utf-8", errors="replace") as f:
        lines = f.readlines()
    
    new_lines, changed = find_and_comment_footer_social(lines)
    
    if changed:
        with open(fpath, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
        print(f"Fixed: {fname}")

print("Done.")
