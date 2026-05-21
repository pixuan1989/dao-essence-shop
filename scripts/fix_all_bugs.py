#!/usr/bin/env python3
"""
批量修复生肖运势页面所有已知bug
用法: python scripts/fix_all_bugs.py
"""
import os, re

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZODIAC_DIR = os.path.join(PROJECT_ROOT, 'zodiac')

SIGNS = ['rat','ox','tiger','rabbit','dragon','snake','horse','goat','monkey','rooster','dog','pig']

def fix_detail_pages():
    """修复24个详情页: 添加分享脚本 + 替换 luckyNum -> number + 金句显示逻辑"""
    fixed_count = 0
    for sign in SIGNS:
        for suffix in ['', '-en']:
            filepath = os.path.join(ZODIAC_DIR, f'{sign}{suffix}.html')
            if not os.path.exists(filepath):
                print(f"  文件不存在: {filepath}")
                continue

            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            original = content

            # 1. 添加 tool-share.js + share-card.js（在 zodiac-data.js 之后）
            if 'tool-share.js' not in content:
                content = content.replace(
                    '<script src="js/zodiac-data.js"></script>',
                    '<script src="js/zodiac-data.js"></script>\n  <script src="../js/tool-share.js"></script>\n  <script src="js/share-card.js"></script>'
                )

            # 2. 替换 display.luckyNum -> display.number
            content = content.replace('display.luckyNum', 'display.number')

            # 3. 修复金句显示：英文模式使用 quoteEn
            content = content.replace(
                'if (qtEl) qtEl.textContent = display.quote;',
                'if (qtEl) qtEl.textContent = isEn ? (display.quoteEn || display.quote) : display.quote;'
            )

            # 4. 修复分享文本中的 luckyNum
            content = content.replace("' + display.luckyNum + '", "' + display.number + '")
            content = content.replace('number: display.luckyNum', 'number: display.number')

            if content != original:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                fixed_count += 1
                print(f"  已修复: {sign}{suffix}.html")
            else:
                print(f"  无需修改: {sign}{suffix}.html")

    print(f"\n  详情页修复完成: {fixed_count}/24 个文件有变更")


def fix_zodiac_daily():
    """修复聚合页: 添加 ZODIAC_SIGNS 定义"""
    filepath = os.path.join(ZODIAC_DIR, 'zodiac-daily.html')
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'var ZODIAC_SIGNS' in content:
        print("  zodiac-daily.html 已有 ZODIAC_SIGNS")
        return

    old_line = "      var haveImages = ['rat','ox','tiger','rabbit','dragon','snake','horse','goat','monkey','rooster','dog','pig'];"
    new_block = """      var ZODIAC_SIGNS = [
        { key: 'rat', name: '鼠', emoji: '🐀' },
        { key: 'ox', name: '牛', emoji: '🐂' },
        { key: 'tiger', name: '虎', emoji: '🐅' },
        { key: 'rabbit', name: '兔', emoji: '🐇' },
        { key: 'dragon', name: '龙', emoji: '🐉' },
        { key: 'snake', name: '蛇', emoji: '🐍' },
        { key: 'horse', name: '马', emoji: '🐎' },
        { key: 'goat', name: '羊', emoji: '🐑' },
        { key: 'monkey', name: '猴', emoji: '🐒' },
        { key: 'rooster', name: '鸡', emoji: '🐓' },
        { key: 'dog', name: '狗', emoji: '🐕' },
        { key: 'pig', name: '猪', emoji: '🐖' }
      ];
      var haveImages = ['rat','ox','tiger','rabbit','dragon','snake','horse','goat','monkey','rooster','dog','pig'];"""

    if old_line in content:
        content = content.replace(old_line, new_block)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("  zodiac-daily.html 已添加 ZODIAC_SIGNS")
    else:
        print("  ⚠️ zodiac-daily.html 中未找到插入点")


def fix_zodiac_data():
    """为今天已有数据补 quoteEn 字段"""
    filepath = os.path.join(ZODIAC_DIR, 'js', 'zodiac-data.js')
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if '"2026-05-21"' not in content:
        print("  ⚠️ zodiac-data.js 中没有 2026-05-21 数据")
        return

    # 检查今日数据块是否已有 quoteEn
    start = content.find('"2026-05-21"')
    end = content.find('"2026-05-20"')
    if start == -1 or end == -1:
        print("  ⚠️ 无法定位今日数据块范围")
        return

    today_block = content[start:end]
    if 'quoteEn' in today_block:
        print("  今日数据已有 quoteEn")
        return

    quote_en = "Small gains, not yet full — abundance without overflow."
    new_block = today_block.replace(
        'quote: "小满未满，盈而不溢。" }',
        f'quote: "小满未满，盈而不溢。", quoteEn: "{quote_en}" }}'
    )

    if new_block != today_block:
        content = content[:start] + new_block + content[end:]
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  zodiac-data.js 今日数据已补 quoteEn")
    else:
        print("  ⚠️ 未能成功替换 quoteEn")


if __name__ == '__main__':
    print("=" * 60)
    print("开始批量修复生肖运势页面bug")
    print("=" * 60)
    fix_detail_pages()
    print()
    fix_zodiac_daily()
    print()
    fix_zodiac_data()
    print()
    print("=" * 60)
    print("批量修复完成！")
    print("=" * 60)
