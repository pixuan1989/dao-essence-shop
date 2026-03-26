import os, re

base = r"C:\Users\agenew\Desktop\DaoEssence - 副本"
html_files = [f for f in os.listdir(base) if f.endswith(".html")]

for fname in html_files:
    fpath = os.path.join(base, fname)
    with open(fpath, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()
    original = content

    # 1. 注释掉 footer-social 整个 div 块（保留WeChat，仅注释WA/TG已删，div本身还在）
    #    实际上 footer-social 现在只剩 WeChat，根据用户要求把整个 footer-social 注释掉
    content = re.sub(
        r'(\s*)<div class="footer-social">(.*?)</div>',
        lambda m: f'\n{m.group(1)}<!-- SOCIAL-ICONS-START (restore when accounts ready)\n{m.group(1)}<div class="footer-social">{m.group(2)}</div>\n{m.group(1)}SOCIAL-ICONS-END -->',
        content, flags=re.DOTALL
    )

    # 2. 注释掉 index.html 里 footer 联系列表中的 WhatsApp 和 Telegram <li> 块
    # WhatsApp li
    content = re.sub(
        r'(\s*)<li>\s*\n\s*<!-- WhatsApp -->\s*\n(.*?)</li>',
        lambda m: f'\n{m.group(1)}<!-- WA-ICON-START (restore when account ready)\n{m.group(1)}<li>\n{m.group(1)}    <!-- WhatsApp -->\n{m.group(2)}</li>\n{m.group(1)}WA-ICON-END -->',
        content, flags=re.DOTALL
    )
    # Telegram li
    content = re.sub(
        r'(\s*)<li>\s*\n\s*<!-- Telegram -->\s*\n(.*?)</li>',
        lambda m: f'\n{m.group(1)}<!-- TG-ICON-START (restore when account ready)\n{m.group(1)}<li>\n{m.group(1)}    <!-- Telegram -->\n{m.group(2)}</li>\n{m.group(1)}TG-ICON-END -->',
        content, flags=re.DOTALL
    )

    if content != original:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Commented social: {fname}")

print("\nDone.")
