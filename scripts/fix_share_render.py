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

        # 把 head 中的 ToolShare.render 调用改为 DOMContentLoaded 包裹
        # 原代码: if (window.ToolShare) { window.ToolShare.render('zodiac-share', { ... }); }
        # 新代码: window.addEventListener('DOMContentLoaded', function() { if (window.ToolShare) { window.ToolShare.render('zodiac-share', { ... }); } });

        old_pattern = """      if (window.ToolShare) {
        window.ToolShare.render('zodiac-share', {
          label: isEn ? 'Share Your Horoscope' : '\u5206\u4eab\u4f60\u7684\u8fd0\u52bf',
          text: shareText,
          download: { sign: sign, lang: isEn ? 'en' : 'zh', data: { score: display.score, number: display.number, colorName: colorVal, direction: dirVal, quote: display.quote } }
        });
      }"""

        new_pattern = """      window.addEventListener('DOMContentLoaded', function() {
        if (window.ToolShare) {
          window.ToolShare.render('zodiac-share', {
            label: isEn ? 'Share Your Horoscope' : '\u5206\u4eab\u4f60\u7684\u8fd0\u52bf',
            text: shareText,
            download: { sign: sign, lang: isEn ? 'en' : 'zh', data: { score: display.score, number: display.number, colorName: colorVal, direction: dirVal, quote: display.quote } }
          });
        }
      });"""

        if old_pattern in content:
            content = content.replace(old_pattern, new_pattern)
            with open(fp, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'fixed {sign}{suffix}.html')
        else:
            print(f'skip {sign}{suffix}.html')

print('done')
