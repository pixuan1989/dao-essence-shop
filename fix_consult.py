import os, re

base = r"C:\Users\agenew\Desktop\DaoEssence - 副本"

# ============================================================
# 替换规则：[旧文本, 新文本, 是否正则]
# ============================================================
replacements = [
    # 导航链接
    ["Personal Consultation", "Digital Wellness Programs", False],
    ["#wellness-booking", "shop.html", False],

    # destiny.html 标题
    ["Life Path Consultation", "Life Path Guidance", False],

    # 咨询相关措辞
    ["Destiny Consultation", "Destiny Guidance", False],
    ["book a life path consultation", "explore our life path guidance programs", False],
    ["Book a Session", "Explore Program", False],
    ["book online through our website, add our WeChat customer service, or contact us",
     "access instantly through our website after purchase", False],
    ["We offer both online and in-person services. Online sessions can be conducted",
     "All programs are fully digital and self-guided. Sessions are delivered", False],

    # product-detail.html
    ["Schedule Your Session", "Access Your Digital Program", False],
    ["Contact us via <a href=\"mailto:support@daoessentia.com\" style=\"color:var(--accent-color);\">email</a> or WhatsApp to schedule your session.",
     "After purchase, your activation code and download links will be sent to your email automatically.", False],
    ["Complete Your Session", "Complete Your Program", False],
    ["Participate in your scheduled session and receive personalized guidance from our certified practitioners.",
     "Follow the pre-recorded guidance at your own pace and complete all modules in your digital program.", False],
    ["Book your self-guided session with our certified practitioner",
     "Unlock your self-guided digital program with your activation code", False],

    # about.html
    ["connect with our practitioners directly", "explore our digital programs", False],
    ["Every traditional Ritual Service is carefully prepared by skilled Eastern wisdom practitioners at cultural",
     "Every digital wellness program is carefully curated by skilled Eastern wisdom researchers at cultural", False],

    # contact.html meta
    ["Contact DAO Essence for Ritual Service inquiries, order support, and life path",
     "Contact DAO Essence for digital wellness program inquiries, order support, and life path", False],

    # terms.html
    ["Following your consultation, your personalized digital guidance materials",
     "Following your purchase, your personalized digital guidance materials", False],
    ["Service packages for which the consultation has been completed and digital materials have been delivered",
     "Service packages for which the digital materials have been delivered", False],

    # shop.html
    ["Ritual & Energy Consultation", "Digital Wellness Programs", False],
    ["energy consultation, five elements balance", "energy guidance, five elements balance", False],
    ["energy consultation packages", "energy guidance programs", False],
    ["energy guidance, meditation courses, and personalized",
     "energy guidance, meditation courses, and digital wellness", False],
]

html_files = [f for f in os.listdir(base) if f.endswith(".html")]
for fname in html_files:
    fpath = os.path.join(base, fname)
    with open(fpath, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()
    original = content
    for old, new, is_re in replacements:
        if is_re:
            content = re.sub(old, new, content, flags=re.IGNORECASE | re.DOTALL)
        else:
            content = content.replace(old, new)
    if content != original:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated: {fname}")

print("\nDone - consultation terms replaced.")
