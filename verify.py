import os

base = r"C:\Users\agenew\Desktop\DaoEssence - 副本"
issues = []

for fname in sorted(os.listdir(base)):
    if not fname.endswith(".html"):
        continue
    fpath = os.path.join(base, fname)
    with open(fpath, "r", encoding="utf-8", errors="replace") as f:
        lines = f.readlines()
    for i, line in enumerate(lines, 1):
        s = line.strip()
        # footer-social 未被注释（不在注释块内）
        if "footer-social" in s and "<div" in s and not s.startswith("<!--"):
            issues.append(f"UNCMT footer-social {fname}:{i}: {s[:80]}")
        # 咨询相关残留词
        for kw in ["one-on-one", "book a session", "schedule your session", "remote practitioner consultation"]:
            if kw.lower() in line.lower() and not s.startswith("<!--"):
                issues.append(f"CONSULT [{kw}] {fname}:{i}: {s[:80]}")
                break

if issues:
    for x in issues:
        print(x)
else:
    print("ALL CLEAR!")
