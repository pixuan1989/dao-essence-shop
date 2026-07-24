"""
DaoEssence 选题生成脚本 v3
基于热点数据 + 大词策略 + 现有文章去重 + 工具关联 + 配图提示词
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path

# 现有文章列表（54 篇，避免重复）
EXISTING_ARTICLES = [
    "五常（仁义礼智信）与五行（金木水火土）",
    "10-home-feng-shui-hacks-that-actually-work-backed-by-energy-psychology",
    "3-places-to-visit-when-bad-luck",
    "auspicious-date-selection-a-practical-guide",
    "bazi-10-day-masters-guide",
    "bazi-10-year-luck-cycles-guide",
    "bazi-marriage-prediction-spouse-star",
    "bazi-ten-gods-friendship-patterns",
    "ben-ming-nian-why-your-zodiac-year-matters-in-bazi",
    "birth-hours-wealth-personalities-a-western-friendly-guide",
    "chinese-zodiac-daily-forecast-thursday-april-16-2026",
    "chinese-zodiac-july-2026-monthly-horoscope",
    "desk-feng-shui-career-luck",
    "door-facing-door-feng-shui-energy-clash",
    "dragon-boat-festival-lucky-rituals",
    "elon-musk-bazi-yang-wood-day-master-decoded",
    "feng-shui-4-items-dont-replace",
    "feng-shui-headboard-placement-5-rules",
    "feng-shui-home-office-7-rules",
    "feng-shui-tips-before-buying-house",
    "five-elements-body-type-bazi-health-constitution",
    "five-elements-theory-wu-xing-guide",
    "five-poisons-month-daoist-summer-wellness",
    "heavenly-stems-compatibility-love-match",
    "how-to-choose-the-best-date-for-any-important-life-event",
    "how-to-choose-your-phone-wallpaper-using-chinese-five-elements",
    "how-to-read-bazi-chart",
    "is-bazi-real-skeptics-guide",
    "is-weak-day-master-bad-bazi",
    "jia-wu-month-2026-best-day-masters",
    "jia-wu-month-june-2026-fire-energy-warning",
    "july-2026-lucky-wallpaper-yi-wei-month-five-elements",
    "kazuo-inamori-bazi-three-xin-fortune-500",
    "learn-bazi-free-course-guide",
    "learn-bazi-free-course",
    "love-prediction-by-date-of-birth",
    "lucky-colors-2026-fire-horse-year",
    "minor-heat-2026-luck-rituals-wallpapers",
    "seven-killings-bazi-wealth-star",
    "she-was-36-divorced-bazi-love-story",
    "the-mbti-alternative-angle",
    "toxic-relationship-energy-bazi-compatibility",
    "trump-bazi-fire-earth",
    "what-is-bazi-beginners-guide",
    "when-will-i-find-love",
    "where-will-i-meet-my-soulmate",
    "why-ai-bazi-gets-it-wrong",
    "why-am-i-depressed-bazi-cycles-10-year-luck-periods-explained",
    "why-your-zodiac-reading-doesnt-match-you",
    "world-cup-champions-five-elements-lens",
    "yi-wood-may-2026-gui-si-month",
]

# 网站功能工具
SITE_TOOLS = {
    "八字排盘": {
        "name": "BaZi Calculator",
        "url": "/bazi-calculator",
        "description": "免费八字排盘工具，输入生辰获取四柱八字"
    },
    "五行测试": {
        "name": "Five Elements Test",
        "url": "/five-elements-test",
        "description": "五行属性测试，了解你的主导元素"
    },
    "老黄历": {
        "name": "Almanac",
        "url": "/almanac",
        "description": "每日老黄历查询，宜忌事项"
    },
    "灵魂伴侣": {
        "name": "Soulmate Calculator",
        "url": "/soulmate",
        "description": "八字合盘，测算灵魂伴侣兼容性"
    },
    "生肖运势": {
        "name": "Zodiac Horoscope",
        "url": "/zodiac-horoscope",
        "description": "十二生肖每日/每月运势"
    },
}

# 关键词数据库（大词 + 长尾词）— 中文显示
KEYWORD_DB = {
    "八字": {
        "big_words": [
            {"keyword": "八字解读", "volume": "12K", "kd": 45},
            {"keyword": "星盘", "volume": "50K", "kd": 65},
            {"keyword": "中国占星", "volume": "18K", "kd": 55},
        ],
        "long_tails": [
            {"keyword": "如何看八字入门", "volume": "1K-2K", "kd": 25},
            {"keyword": "八字与西方占星区别", "volume": "500-1K", "kd": 20},
            {"keyword": "免费八字排盘", "volume": "200-500", "kd": 15},
            {"keyword": "八字日主指南", "volume": "100-200", "kd": 10},
        ]
    },
    "风水": {
        "big_words": [
            {"keyword": "风水", "volume": "100K+", "kd": 70},
            {"keyword": "家居风水", "volume": "18K", "kd": 50},
            {"keyword": "风水技巧", "volume": "12K", "kd": 45},
        ],
        "long_tails": [
            {"keyword": "小公寓风水", "volume": "1K-2K", "kd": 25},
            {"keyword": "卧室风水规则", "volume": "2K-5K", "kd": 30},
            {"keyword": "办公桌风水方向", "volume": "500-1K", "kd": 20},
            {"keyword": "家庭办公室财位", "volume": "200-500", "kd": 15},
        ]
    },
    "五行": {
        "big_words": [
            {"keyword": "五行", "volume": "8K", "kd": 40},
            {"keyword": "五行属性", "volume": "2K", "kd": 25},
        ],
        "long_tails": [
            {"keyword": "五行人格测试", "volume": "500-1K", "kd": 20},
            {"keyword": "我是什么五行", "volume": "200-500", "kd": 15},
            {"keyword": "五行兼容性", "volume": "100-200", "kd": 10},
        ]
    },
    "中医养生": {
        "big_words": [
            {"keyword": "中医养生", "volume": "5K", "kd": 35},
            {"keyword": "中医", "volume": "20K", "kd": 55},
        ],
        "long_tails": [
            {"keyword": "肝脏健康八字", "volume": "100-200", "kd": 10},
            {"keyword": "季节性养生五行", "volume": "200-500", "kd": 15},
            {"keyword": "中医体质测试", "volume": "500-1K", "kd": 20},
        ]
    },
    "泛心理学": {
        "big_words": [
            {"keyword": "有毒关系", "volume": "74K-100K", "kd": 68},
            {"keyword": "人格类型", "volume": "30K", "kd": 60},
            {"keyword": "MBTI", "volume": "50K+", "kd": 65},
        ],
        "long_tails": [
            {"keyword": "有毒关系能量八字", "volume": "100-200", "kd": 8},
            {"keyword": "MBTI 与八字人格", "volume": "200-500", "kd": 12},
            {"keyword": "如何知道对方是否适合你", "volume": "2K-5K", "kd": 25},
            {"keyword": "滋养与有毒关系", "volume": "100-200", "kd": 5},
        ]
    },
    "家庭关系": {
        "big_words": [
            {"keyword": "家庭兼容性", "volume": "5K", "kd": 35},
            {"keyword": "亲子关系", "volume": "8K", "kd": 40},
        ],
        "long_tails": [
            {"keyword": "八字亲子兼容性", "volume": "100-200", "kd": 10},
            {"keyword": "家庭和谐风水", "volume": "200-500", "kd": 15},
            {"keyword": "婚姻兼容性八字", "volume": "500-1K", "kd": 20},
        ]
    },
    "财富健康": {
        "big_words": [
            {"keyword": "财运", "volume": "10K", "kd": 45},
            {"keyword": "事业运", "volume": "8K", "kd": 40},
        ],
        "long_tails": [
            {"keyword": "如何提升财运八字", "volume": "200-500", "kd": 15},
            {"keyword": "职业转换八字时机", "volume": "100-200", "kd": 10},
            {"keyword": "财位风水", "volume": "500-1K", "kd": 20},
        ]
    },
}


def load_hot_topics():
    """加载最新热点数据"""
    topic_dir = os.path.join(os.path.dirname(__file__), '..', 'topic_data')
    
    # 找最新的 JSON 文件
    json_files = sorted(Path(topic_dir).glob('topics_*.json'), reverse=True)
    
    if not json_files:
        print("未找到热点数据，请先运行 topic_scraper.py")
        return None
    
    with open(json_files[0], 'r', encoding='utf-8') as f:
        return json.load(f)


def calculate_relevance_score(hot_topic, keyword_category):
    """计算热点与关键词类别的相关度"""
    hot_lower = hot_topic.lower()
    
    # 关键词映射
    relevance_keywords = {
        "八字": ["bazi", "birth chart", "astrology", "zodiac", "fortune", "命理", "八字", "运势"],
        "风水": ["feng shui", "风水", "home", "desk", "bedroom", "office", "方向", "布局"],
        "五行": ["five elements", "wu xing", "五行", "wood", "fire", "earth", "metal", "water"],
        "中医养生": ["health", "wellness", "TCM", "中医", "养生", "liver", "heart", "seasonal"],
        "泛心理学": ["relationship", "personality", "toxic", "MBTI", "psychology", "心理", "关系"],
        "家庭关系": ["family", "parent", "child", "marriage", "家庭", "婚姻", "亲子"],
        "财富健康": ["wealth", "career", "money", "luck", "财富", "事业", "财运"],
    }
    
    score = 0
    for keyword in relevance_keywords.get(keyword_category, []):
        if keyword.lower() in hot_lower:
            score += 1
    
    return score


def generate_topic_candidates(hot_topics, num_candidates=3):
    """生成候选选题（3 个，去重 + 工具关联 + 配图提示词）"""
    candidates = []
    
    for category, keywords in KEYWORD_DB.items():
        # 找最相关的热点
        best_hot = None
        best_score = 0
        best_source = None
        
        for platform in hot_topics:
            if platform == "timestamp":
                continue
            for hot in hot_topics.get(platform, []):
                score = calculate_relevance_score(hot, category)
                if score > best_score:
                    best_score = score
                    best_hot = hot
                    best_source = platform
        
        # 即使没有强相关热点，也生成选题（用类别默认方向）
        if best_score == 0:
            best_hot = f"{category} trending topic"
            best_source = "general"
        
        # 生成选题
        big_word = keywords['big_words'][0]
        long_tail = keywords['long_tails'][0]
        
        # 生成中文标题和描述
        title_cn = generate_chinese_title(category, big_word, long_tail)
        description_cn = generate_chinese_description(category, big_word)
        outline_cn = generate_chinese_outline(category, big_word, long_tail)
        
        # 网站关联说明
        site_relevance = generate_site_relevance(category)
        
        # 关联工具
        related_tool = get_related_tool(category)
        
        # 配图提示词
        cover_prompt = generate_cover_prompt(title_cn, category)
        
        # 检查是否与现有文章重复
        is_duplicate = check_duplicate(title_cn, category)
        
        candidate = {
            "category": category,
            "title_en": f"{big_word['keyword']}: {long_tail['keyword'].title()} — A BaZi Guide",
            "title_cn": title_cn,
            "description_cn": description_cn,
            "outline_cn": outline_cn,
            "site_relevance": site_relevance,
            "related_tool": related_tool,
            "cover_prompt": cover_prompt,
            "is_duplicate": is_duplicate,
            "big_words": keywords['big_words'][:2],
            "long_tails": keywords['long_tails'][:4],
            "hot_source": best_hot,
            "hot_source_site": best_source,
            "hot_relevance_score": best_score,
            "competitor_gap": f"Top 3 articles lack {category} perspective from BaZi angle",
            "score": round((best_score * 3 + (10 - big_word['kd'] / 10) + (10 - long_tail['kd'] / 5)) / 3, 1)
        }
        
        candidates.append(candidate)
    
    # 按评分排序，取前 3 个（排除重复）
    candidates.sort(key=lambda x: x['score'], reverse=True)
    
    # 过滤重复文章
    unique_candidates = [c for c in candidates if not c['is_duplicate']]
    
    return unique_candidates[:num_candidates]


def generate_chinese_title(category, big_word, long_tail):
    """生成中文标题"""
    title_map = {
        "八字": f"八字解读：{long_tail['keyword']}的命理分析",
        "风水": f"风水布局：{long_tail['keyword']}实用指南",
        "五行": f"五行分析：{long_tail['keyword']}的五行属性",
        "中医养生": f"中医养生：{long_tail['keyword']}的养生之道",
        "泛心理学": f"心理与命理：{long_tail['keyword']}的深层解读",
        "家庭关系": f"家庭关系：{long_tail['keyword']}的命理密码",
        "财富健康": f"财富运势：{long_tail['keyword']}的招财方法",
    }
    return title_map.get(category, f"{category}：{long_tail['keyword']}指南")


def generate_chinese_description(category, big_word):
    """生成中文描述"""
    desc_map = {
        "八字": f"通过{big_word['keyword']}深入解读你的命理特征，了解性格、事业、感情的先天倾向。本文结合传统八字理论与现代心理学，提供实用的自我认知工具。",
        "风水": f"学习{big_word['keyword']}的核心原则，掌握家居、办公室风水布局技巧。本文提供简单易懂的风水调整方法，帮助你改善生活环境能量场。",
        "五行": f"了解{big_word['keyword']}的基本概念，学习如何判断自己的五行属性。本文包含五行测试方法和针对性的养生、事业建议。",
        "中医养生": f"探索{big_word['keyword']}与传统中医的关联，学习根据自身体质进行季节性养生。本文提供实用的饮食、作息调整建议。",
        "泛心理学": f"从{big_word['keyword']}角度分析人际关系模式，识别消耗能量的关系类型。本文结合命理学与心理学，提供改善关系质量的方法。",
        "家庭关系": f"通过{big_word['keyword']}分析家庭成员间的能量互动，理解亲子、夫妻关系的命理基础。本文提供促进家庭和谐的风水与沟通建议。",
        "财富健康": f"学习{big_word['keyword']}的提升方法，了解八字中的财富信号与事业时机。本文提供实用的招财风水布局与职业决策建议。",
    }
    return desc_map.get(category, f"深入了解{category}，提供实用指南和建议。")


def generate_chinese_outline(category, big_word, long_tail):
    """生成中文大纲"""
    return [
        f"引子：真实生活场景切入（为什么{category}对你重要）",
        f"核心概念：{big_word['keyword']}基础理论（用白话解释，不用术语堆砌）",
        f"深度分析：{long_tail['keyword']}的命理/风水原理",
        f"实用指南：读者可直接用的建议（步骤化、清单化）",
        f"工具联动：引导使用网站免费工具（八字排盘/五行测试等）",
        f"FAQ：5 个高频问题解答"
    ]


def generate_site_relevance(category):
    """生成与网站的关联说明"""
    relevance_map = {
        "八字": "关联网站工具：八字排盘计算器（bazi-calculator）+ 八字入门文章系列",
        "风水": "关联网站工具：风水文章系列 + 家居风水指南页面",
        "五行": "关联网站工具：五行测试（five-elements-test）+ 五行理论文章",
        "中医养生": "关联网站内容：八字健康解读 + 季节性养生文章",
        "泛心理学": "关联网站内容：八字关系兼容性 + 心理与命理交叉文章",
        "家庭关系": "关联网站内容：八字合盘 + 家庭风水文章",
        "财富健康": "关联网站内容：财富运势解读 + 事业风水文章",
    }
    return relevance_map.get(category, "关联网站相关内容和工具")


def get_related_tool(category):
    """获取关联的网站工具"""
    tool_map = {
        "八字": SITE_TOOLS["八字排盘"],
        "五行": SITE_TOOLS["五行测试"],
        "中医养生": SITE_TOOLS["老黄历"],
        "泛心理学": SITE_TOOLS["灵魂伴侣"],
        "家庭关系": SITE_TOOLS["灵魂伴侣"],
        "财富健康": SITE_TOOLS["八字排盘"],
        "风水": None,  # 风水没有专门工具
    }
    return tool_map.get(category)


def generate_cover_prompt(title_cn, category):
    """生成封面图提示词（遵循 article-cover-image 技能）"""
    # 根据类别选择视觉元素
    visual_elements = {
        "八字": "ancient Chinese scroll with celestial stems and earthly branches, ink wash painting style",
        "风水": "minimalist compass (luopan) with gold needle on black marble, feng shui elements",
        "五行": "five elements symbols (wood fire earth metal water) in gold calligraphy, rice paper texture",
        "中医养生": "traditional Chinese medicine herbs (ginseng, goji berries) with mortar and pestle",
        "泛心理学": "yin-yang symbol with modern psychology icons (brain, heart) in gold line art",
        "家庭关系": "interlocking family figures in gold silhouette, harmonious composition",
        "财富健康": "gold ingots and coins with wealth gods, prosperous imagery",
    }
    
    visual = visual_elements.get(category, "Chinese metaphysics symbols")
    
    prompt = f"""Premium editorial magazine poster, vertical 9:16. Matte black textured background.
Center/bottom two-thirds: {visual}.
Top third reserved for typography: large elegant serif title "{title_cn}" in gold foil calligraphy-style lettering with subtle glow.
Color palette: matte black + antique gold + sparing vermillion accent.
Style: Kinfolk magazine meets Chinese luxury brand campaign. Museum-catalogue aesthetic.
NO 3D, NO blur, NO fog, NO cartoon, NO emoji, NO busy patterns."""
    
    return prompt


def check_duplicate(title_cn, category):
    """检查是否与现有文章重复（改进版）"""
    title_lower = title_cn.lower()
    
    # 1. 检查与 EXISTING_ARTICLES 的重复（完整标题 + 关键词重叠）
    for article in EXISTING_ARTICLES:
        article_lower = article.lower()
        # 完整标题匹配
        if title_lower == article_lower:
            return True
        # 关键词重叠检查（提取核心词）
        title_words = set(title_lower.replace('：', ' ').replace(':', ' ').split())
        article_words = set(article_lower.replace('-', ' ').split())
        # 如果有 3 个以上共同词，判定为重复
        overlap = title_words & article_words
        if len(overlap) >= 3:
            return True

    # 2. 检查与已推送选题的重复（pushed_topics.json）
    pushed_file = os.path.join(os.path.dirname(__file__), '..', 'topic_data', 'pushed_topics.json')
    if os.path.exists(pushed_file):
        with open(pushed_file, 'r', encoding='utf-8') as f:
            pushed = json.load(f)
        # 检查最近 30 天的推送记录
        cutoff_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        for record in pushed:
            if record.get('date', '') < cutoff_date:
                continue
            pushed_title = record.get('title_cn', '').lower()
            # 完整匹配
            if title_lower == pushed_title:
                return True
            # 关键词重叠
            pushed_words = set(pushed_title.replace('：', ' ').replace(':', ' ').split())
            title_words = set(title_lower.replace('：', ' ').replace(':', ' ').split())
            overlap = title_words & pushed_words
            if len(overlap) >= 3:
                return True

    return False


def format_for_wechat(candidates):
    """格式化为微信推送格式（企业微信 Markdown，全中文）"""
    lines = ["# DaoEssence 选题 " + datetime.now().strftime("%m-%d"), ""]
    
    for i, c in enumerate(candidates, 1):
        lines.append(f"**{i}. {c['title_cn'][:40]}**")
        lines.append(f"描述：{c['description_cn'][:60]}...")
        lines.append(f"关联：{c['site_relevance'][:40]}")
        if c['related_tool']:
            lines.append(f"工具：{c['related_tool']['name']}")
        lines.append(f"来源：{c['hot_source'][:40]}")
        lines.append(f"评分：{c['score']} | 大词：{c['big_words'][0]['keyword']}")
        lines.append("")
    
    lines.append("---")
    lines.append("回复数字确认（如 1），或提修改建议")
    lines.append("确认后：写作→封面图→SEO→commit→你 push")
    
    return "\n".join(lines)


def main():
    print("加载热点数据...")
    hot_topics = load_hot_topics()
    
    if not hot_topics:
        return
    
    print(f"热点数据时间：{hot_topics.get('timestamp', '未知')}")
    
    # 统计各平台数据
    for platform, items in hot_topics.items():
        if platform != "timestamp":
            print(f"{platform}: {len(items)} 条")
    
    print("\n生成候选选题...")
    candidates = generate_topic_candidates(hot_topics, num_candidates=3)
    
    print(f"\n已生成 {len(candidates)} 个候选选题：")
    for i, c in enumerate(candidates, 1):
        print(f"{i}. {c['title_cn']} (评分：{c['score']})")
    
    # 保存选题
    timestamp = datetime.now().strftime("%Y%m%d_%H%M")
    output_file = os.path.join(os.path.dirname(__file__), '..', 'topic_data', f'candidates_{timestamp}.json')

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(candidates, f, ensure_ascii=False, indent=2)

    print(f"\n选题已保存：{output_file}")

    # 记录已推送选题（用于去重）
    pushed_file = os.path.join(os.path.dirname(__file__), '..', 'topic_data', 'pushed_topics.json')
    pushed = []
    if os.path.exists(pushed_file):
        with open(pushed_file, 'r', encoding='utf-8') as f:
            pushed = json.load(f)
    
    # 添加本次选题到记录
    for c in candidates:
        pushed.append({
            'title_cn': c['title_cn'],
            'category': c['category'],
            'date': datetime.now().strftime('%Y-%m-%d'),
            'score': c['score']
        })
    
    # 只保留最近 90 天的记录
    cutoff_date = (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d')
    pushed = [p for p in pushed if p.get('date', '') >= cutoff_date]
    
    with open(pushed_file, 'w', encoding='utf-8') as f:
        json.dump(pushed, f, ensure_ascii=False, indent=2)
    
    print(f"已推送记录已更新：{pushed_file}（共 {len(pushed)} 条）")
    
    # 生成微信推送格式
    wechat_msg = format_for_wechat(candidates)
    wechat_file = os.path.join(os.path.dirname(__file__), '..', 'topic_data', f'wechat_{timestamp}.txt')
    
    with open(wechat_file, 'w', encoding='utf-8') as f:
        f.write(wechat_msg)
    
    print(f"微信推送格式已保存：{wechat_file}")
    
    return candidates


if __name__ == "__main__":
    main()
