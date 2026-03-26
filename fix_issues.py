import os
import re

base = r"C:\Users\agenew\Desktop\DaoEssence - 副本"

html_files = [f for f in os.listdir(base) if f.endswith(".html")]

for fname in html_files:
    fpath = os.path.join(base, fname)
    with open(fpath, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()
    original = content

    # 1. 删除 social-link 样式的 wa.me 完整 <a> 块（含SVG图标）
    content = re.sub(
        r'\s*<a\s+href="https://wa\.me/your-number"[^>]*class="social-link"[^>]*>.*?</a>',
        '', content, flags=re.DOTALL
    )
    # 2. 删除 social-link 样式的 t.me 完整 <a> 块
    content = re.sub(
        r'\s*<a\s+href="https://t\.me/your-handle"[^>]*class="social-link"[^>]*>.*?</a>',
        '', content, flags=re.DOTALL
    )
    # 3. 删除普通文字 WhatsApp 链接
    content = re.sub(
        r'\s*<a\s+href="https://wa\.me/your-number"[^>]*>WhatsApp</a>',
        '', content, flags=re.DOTALL
    )
    # 4. 删除普通文字 Telegram 链接
    content = re.sub(
        r'\s*<a\s+href="https://t\.me/your-handle"[^>]*>Telegram</a>',
        '', content, flags=re.DOTALL
    )
    # 5. contact.html 独立的大按钮 WhatsApp 块
    content = re.sub(
        r'\s*<a\s+href="https://wa\.me/your-number"[^>]*class="contact-btn[^"]*"[^>]*>.*?</a>',
        '', content, flags=re.DOTALL
    )

    if content != original:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Fixed WA/TG: {fname}")

# ---- 问题2: terms.html 旧域名 + one-on-one 描述 ----
terms_path = os.path.join(base, "terms.html")
with open(terms_path, "r", encoding="utf-8", errors="replace") as f:
    content = f.read()

# 旧域名
content = content.replace("dao-essence-shop.vercel.app", "www.daoessentia.com")
# one-on-one remote practitioner consultation → automated digital delivery
content = content.replace(
    "Each service package includes one-on-one remote practitioner consultation, energy alignment guidance, and digitally delivered wellness practice materials.",
    "Each service package includes automated digital delivery of energy alignment guides, pre-recorded audio programs, and digitally delivered wellness practice materials."
)
content = content.replace(
    "<li><strong>Consultation:</strong> Contact us at <strong>support@daoessentia.com</strong> to schedule your one-on-one remote practitioner consultation.</li>",
    "<li><strong>Access:</strong> After purchase, you will receive an activation code by email to unlock your complete digital content package immediately.</li>"
)
# ritual service package
content = content.replace("a ritual service package", "a digital service package")
content = content.replace("ritual guidance materials", "digital guidance materials")
# prices include practitioner consultation
content = content.replace(
    "Prices include the full digital service package including practitioner consultation and all digitally delivered materials.",
    "Prices include the full digital service package including all pre-recorded audio guides, written resources, and digitally delivered materials."
)

with open(terms_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed terms.html: old domain + one-on-one")

# ---- 问题1: culture.html one-on-one 描述 ----
culture_path = os.path.join(base, "culture.html")
with open(culture_path, "r", encoding="utf-8", errors="replace") as f:
    content = f.read()

content = content.replace(
    "Feeling stuck at a crossroads — career, relationships, finances, health? A one-on-one energy guidance session helps you understand your current Five Elements patterns, identify areas of imbalance, and recommends mindfulness practices to restore harmony and align with your personal wellness goals.",
    "Feeling stuck at a crossroads — career, relationships, finances, health? Our self-guided Five Elements audio program helps you understand your current energy patterns, identify areas of imbalance, and follow pre-recorded mindfulness practices to restore harmony and align with your personal wellness goals."
)
# Book a Session -> Explore Program
content = content.replace(
    '<a href="index.html#life-path-booking" class="card-cta">Book a Session</a>',
    '<a href="shop.html" class="card-cta">Explore Program</a>'
)

with open(culture_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed culture.html: one-on-one session")

# ---- 同步修复其他页面中残留的 one-on-one ----
for fname in html_files:
    fpath = os.path.join(base, fname)
    if fname in ("terms.html", "culture.html"):
        continue
    with open(fpath, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()
    original = content
    content = content.replace(
        "one-on-one remote practitioner consultation",
        "automated digital delivery of your energy guidance package"
    )
    content = content.replace("one-on-one", "self-guided")
    if content != original:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Fixed one-on-one: {fname}")

print("\nAll done!")
