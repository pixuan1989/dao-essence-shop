"""
DaoEssence 选题生成脚本 v2
基于热点数据 + 大词策略生成 3 个候选选题（中文推送格式）
"""

import json
import os
from datetime import datetime
from pathlib import Path

# 关键词数据库（大词 + 长尾词）
KEYWORD_DB = {
    "八字": {
        "big_words": [
            {"keyword": "BaZi reading", "volume": "12K", "kd": 45},
            {"keyword": "birth chart", "volume": "50K", "kd": 65},
            {"keyword": "Chinese astrology", "volume": "18K", "kd": 55},
        ],
        "long_tails": [
            {"keyword": "how to read BaZi chart for beginners", "volume": "1K-2K", "kd": 25},
            {"keyword": "BaZi vs Western astrology", "volume": "500-1K", "kd": 20},
            {"keyword": "free BaZi calculator online", "volume": "200-500", "kd": 15},
            {"keyword": "BaZi day master guide", "volume": "100-200", "kd": 10},
        ]
    },
    "风水": {
        "big_words": [
            {"keyword": "feng shui", "volume": "100K+", "kd": 70},
            {"keyword": "home feng shui", "volume": "18K", "kd": 50},
            {"keyword": "feng shui tips", "volume": "12K", "kd": 45},
        ],
        "long_tails": [
            {"keyword": "feng shui for small apartment", "volume": "1K-2K", "kd": 25},
            {"keyword": "bedroom feng shui rules", "volume": "2K-5K", "kd": 30},
            {"keyword": "feng shui desk direction for career", "volume": "500-1K", "kd": 20},
            {"keyword": "home office wealth corner", "volume": "200-500", "kd": 15},
        ]
    },
    "五行": {
        "big_words": [
            {"keyword": "five elements", "volume": "8K", "kd": 40},
            {"keyword": "Wu Xing", "volume": "2K", "kd": 25},
        ],
        "long_tails": [
            {"keyword": "five elements personality test", "volume": "500-1K", "kd": 20},
            {"keyword": "which element am I BaZi", "volume": "200-500", "kd": 15},
            {"keyword": "five elements compatibility", "volume": "100-200", "kd": 10},
        ]
    },
    "中医养生": {
        "big_words": [
            {"keyword": "TCM wellness", "volume": "5K", "kd": 35},
            {"keyword": "Chinese medicine", "volume": "20K", "kd": 55},
        ],
        "long_tails": [
            {"keyword": "liver health BaZi", "volume": "100-200", "kd": 10},
            {"keyword": "seasonal wellness five elements", "volume": "200-500", "kd": 15},
            {"keyword": "TCM body type test", "volume": "500-1K", "kd": 20},
        ]
    },
    "泛心理学": {
        "big_words": [
            {"keyword": "toxic relationship", "volume": "74K-100K", "kd": 68},
            {"keyword": "personality types", "volume": "30K", "kd": 60},
            {"keyword": "MBTI", "volume": "50K+", "kd": 65},
        ],
        "long_tails": [
            {"keyword": "toxic relationship energy BaZi", "volume": "100-200", "kd": 8},
            {"keyword": "MBTI vs BaZi personality", "volume": "200-500", "kd": 12},
            {"keyword": "how to know if someone is right for you", "volume": "2K-5K", "kd": 25},
            {"keyword": "nourishing vs toxic relationships", "volume": "100-200", "kd": 5},
        ]
    },
    "家庭关系": {
        "big_words": [
            {"keyword": "family compatibility", "volume": "5K", "kd": 35},
            {"keyword": "parent child relationship", "volume": "8K", "kd": 40},
        ],
        "long_tails": [
            {"keyword": "BaZi parent child compatibility", "volume": "100-200", "kd": 10},
            {"keyword": "family harmony feng shui", "volume": "200-500", "kd": 15},
            {"keyword": "marriage compatibility BaZi", "volume": "500-1K", "kd": 20},
        ]
    },
    "财富健康": {
        "big_words": [
            {"keyword": "wealth luck", "volume": "10K", "kd": 45},
            {"keyword": "career luck", "volume": "8K", "kd": 40},
        ],
        "long_tails": [
            {"keyword": "how to improve wealth luck BaZi", "volume": "200-500", "kd": 15},
            {"keyword": "career change BaZi timing", "volume": "100-200", "kd": 10},
            {"keyword": "wealth corner feng shui", "volume": "500-1K", "kd": 20},
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
    """生成候选选题（3 个）"""
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
        
        candidate = {
            "category": category,
            "title_en": f"{big_word['keyword']}: {long_tail['keyword'].title()} — A BaZi Guide",
            "title_cn": title_cn,
            "description_cn": description_cn,
            "outline_cn": outline_cn,
            "site_relevance": site_relevance,
            "big_words": keywords['big_words'][:2],
            "long_tails": keywords['long_tails'][:4],
            "hot_source": best_hot,
            "hot_source_site": best_source,
            "hot_relevance_score": best_score,
            "competitor_gap": f"Top 3 articles lack {category} perspective from BaZi angle",
            "score": round((best_score * 3 + (10 - big_word['kd'] / 10) + (10 - long_tail['kd'] / 5)) / 3, 1)
        }
        
        candidates.append(candidate)
    
    # 按评分排序，取前 3 个
    candidates.sort(key=lambda x: x['score'], reverse=True)
    
    return candidates[:num_candidates]


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


def format_for_wechat(candidates):
    """格式化为微信推送格式（企业微信 Markdown，中文）"""
    lines = ["# 【DaoEssence 选题推荐】" + datetime.now().strftime("%Y-%m-%d"), ""]
    lines.append(f"**生成时间**：{datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append(f"**数据来源**：国内外 10+ 高流量玄学网站")
    lines.append("")
    
    for i, c in enumerate(candidates, 1):
        lines.append(f"---")
        lines.append(f"## 选题 {i}：{c['title_cn']}")
        lines.append("")
        lines.append(f"**英文标题**：{c['title_en']}")
        lines.append("")
        lines.append(f"**描述**：{c['description_cn']}")
        lines.append("")
        lines.append(f"**正文大纲**：")
        for point in c['outline_cn']:
            lines.append(f"- {point}")
        lines.append("")
        lines.append(f"**与网站关联**：{c['site_relevance']}")
        lines.append("")
        lines.append(f"**信息来源**：{c['hot_source_site']}（{c['hot_source']}）")
        lines.append("")
        lines.append(f"**热度评分**：{c['score']}")
        lines.append(f"**竞品缺口**：{c['competitor_gap']}")
        lines.append("")
        
        big_words_str = '、'.join([f"{w['keyword']}（{w['volume']}）" for w in c['big_words']])
        lines.append(f"**大词**：{big_words_str}")
        
        long_tails_str = '、'.join([f"{w['keyword']}（KD {w['kd']}）" for w in c['long_tails']])
        lines.append(f"**长尾词**：{long_tails_str}")
        lines.append("")
    
    lines.append("---")
    lines.append("**确认方式**：回复数字即可（如\"1\"），或提出修改建议（如\"选题 1 但改聚焦家庭关系\"）")
    lines.append("")
    lines.append("**下一步**：确认后 AI 将自动完成写作→SEO 检查→git commit，你只需 push 部署")
    
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
    
    # 生成微信推送格式
    wechat_msg = format_for_wechat(candidates)
    wechat_file = os.path.join(os.path.dirname(__file__), '..', 'topic_data', f'wechat_{timestamp}.txt')
    
    with open(wechat_file, 'w', encoding='utf-8') as f:
        f.write(wechat_msg)
    
    print(f"微信推送格式已保存：{wechat_file}")
    
    return candidates


if __name__ == "__main__":
    main()
