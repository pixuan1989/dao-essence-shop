with open(r'C:\Users\agenew\Desktop\DaoEssence1.0\scripts\generate-wallpapers.cjs', 'r', encoding='utf-8') as f:
    c = f.read()

# Add download-guard.js after auth.js
old = "    + '    <script src=\"/js/auth.js\"></script>\\n'    + '    <script src=\"js/i18n-switcher.js\" defer></script>\\n'"
new = "    + '    <script src=\"/js/auth.js\"></script>\\n'    + '    <script src=\"/js/download-guard.js\"></script>\\n'    + '    <script src=\"js/i18n-switcher.js\" defer></script>\\n'"

if old in c:
    c = c.replace(old, new)
    with open(r'C:\Users\agenew\Desktop\DaoEssence1.0\scripts\generate-wallpapers.cjs', 'w', encoding='utf-8') as f:
        f.write(c)
    print('Added download-guard.js to template')
else:
    print('Pattern not found')
    # Debug: show what's around auth.js
    idx = c.find('auth.js')
    if idx > 0:
        print('Context:', repr(c[max(0,idx-100):idx+150]))
