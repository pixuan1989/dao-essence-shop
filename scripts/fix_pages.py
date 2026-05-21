import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZODIAC = os.path.join(ROOT, 'zodiac')
SIGNS = ['rat','ox','tiger','rabbit','dragon','snake','horse','goat','monkey','rooster','dog','pig']

for sign in SIGNS:
    for suffix in ['', '-en']:
        fp = os.path.join(ZODIAC, f'{sign}{suffix}.html')
        if not os.path.exists(fp):
            continue
        with open(fp, 'r', encoding='utf-8') as f:
            content = f.read()
        orig = content
        if 'tool-share.js' not in content:
            content = content.replace(
                '<script src="js/zodiac-data.js"></script>',
                '<script src="js/zodiac-data.js"></script>\n  <script src="../js/tool-share.js"></script>\n  <script src="js/share-card.js"></script>'
            )
        content = content.replace('display.luckyNum', 'display.number')
        content = content.replace(
            'if (qtEl) qtEl.textContent = display.quote;',
            'if (qtEl) qtEl.textContent = isEn ? (display.quoteEn || display.quote) : display.quote;'
        )
        content = content.replace("' + display.luckyNum + '", "' + display.number + '")
        content = content.replace('number: display.luckyNum', 'number: display.number')
        if content != orig:
            with open(fp, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'fixed {sign}{suffix}.html')
        else:
            print(f'skip {sign}{suffix}.html')

fp = os.path.join(ZODIAC, 'zodiac-daily.html')
with open(fp, 'r', encoding='utf-8') as f:
    content = f.read()
if 'var ZODIAC_SIGNS' not in content:
    old = "      var haveImages = ['rat','ox','tiger','rabbit','dragon','snake','horse','goat','monkey','rooster','dog','pig'];"
    new = """      var ZODIAC_SIGNS = [
        { key: 'rat', name: '\u9f20', emoji: '\ud83d\udc00' },
        { key: 'ox', name: '\u725b', emoji: '\ud83d\udc02' },
        { key: 'tiger', name: '\u864e', emoji: '\ud83d\udc05' },
        { key: 'rabbit', name: '\u5154', emoji: '\ud83d\udc07' },
        { key: 'dragon', name: '\u9f99', emoji: '\ud83d\udc09' },
        { key: 'snake', name: '\u86c7', emoji: '\ud83d\udc0d' },
        { key: 'horse', name: '\u9a6c', emoji: '\ud83d\udc0e' },
        { key: 'goat', name: '\u7f8a', emoji: '\ud83d\udc11' },
        { key: 'monkey', name: '\u7334', emoji: '\ud83d\udc12' },
        { key: 'rooster', name: '\u9e21', emoji: '\ud83d\udc13' },
        { key: 'dog', name: '\u72d7', emoji: '\ud83d\udc15' },
        { key: 'pig', name: '\u732a', emoji: '\ud83d\udc16' }
      ];
      var haveImages = ['rat','ox','tiger','rabbit','dragon','snake','horse','goat','monkey','rooster','dog','pig'];"""
    if old in content:
        content = content.replace(old, new)
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(content)
        print('fixed zodiac-daily.html')
    else:
        print('warn: zodiac-daily.html insert point not found')
else:
    print('skip zodiac-daily.html')

fp = os.path.join(ZODIAC, 'js', 'zodiac-data.js')
with open(fp, 'r', encoding='utf-8') as f:
    content = f.read()
start = content.find('"2026-05-21"')
end = content.find('"2026-05-20"')
if start > -1 and end > -1:
    block = content[start:end]
    if 'quoteEn' not in block:
        qe = 'Small gains, not yet full - abundance without overflow.'
        new_block = block.replace('quote: "\u5c0f\u6ee1\u672a\u6ee1\uff0c\u76c8\u800c\u4e0d\u6ea2\u3002" }', f'quote: "\u5c0f\u6ee1\u672a\u6ee1\uff0c\u76c8\u800c\u4e0d\u6ea2\u3002", quoteEn: "{qe}" }}')
        if new_block != block:
            content = content[:start] + new_block + content[end:]
            with open(fp, 'w', encoding='utf-8') as f:
                f.write(content)
            print('fixed zodiac-data.js quoteEn')
        else:
            print('warn: zodiac-data.js replace failed')
    else:
        print('skip zodiac-data.js')
else:
    print('warn: zodiac-data.js date block not found')

print('done')
