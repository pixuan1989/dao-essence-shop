import re

# 修复 payment-success.html
fpath = r"C:\Users\agenew\Desktop\DaoEssence - 副本\payment-success.html"
with open(fpath, "r", encoding="utf-8", errors="replace") as f:
    content = f.read()
content = re.sub(r'\s*<a\s+href="https://wa\.me/your-number"[^>]*>.*?</a>', '', content, flags=re.DOTALL)
content = re.sub(r'\s*<a\s+href="https://t\.me/your-handle"[^>]*>.*?</a>', '', content, flags=re.DOTALL)
with open(fpath, "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed payment-success.html")

# 修复 update-footers.js
fpath2 = r"C:\Users\agenew\Desktop\DaoEssence - 副本\update-footers.js"
with open(fpath2, "r", encoding="utf-8", errors="replace") as f:
    content2 = f.read()
content2 = re.sub(r'\s*<a\s+href="https://wa\.me/your-number"[^>]*>.*?</a>', '', content2, flags=re.DOTALL)
content2 = re.sub(r'\s*<a\s+href="https://t\.me/your-handle"[^>]*>.*?</a>', '', content2, flags=re.DOTALL)
with open(fpath2, "w", encoding="utf-8") as f:
    f.write(content2)
print("Fixed update-footers.js")
