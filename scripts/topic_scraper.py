"""
DaoEssence 热点抓取脚本 v2
抓取国内外高流量玄学大站最新文章标题
"""

import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import os

# 输出目录
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'topic_data')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 国内外高流量玄学大站（前 20）
SITES = {
    # 国外（10 个）
    "astrology_com": {
        "url": "https://www.astrology.com/horoscope/daily/",
        "selector": ".module-horoscope-daily .module-horoscope-daily__item h3",
        "type": "css"
    },
    "astrostyle": {
        "url": "https://astrostyle.com/",
        "selector": ".post-title",
        "type": "css"
    },
    "mindbodygreen": {
        "url": "https://www.mindbodygreen.com/articles",
        "selector": "h3",
        "type": "css"
    },
    "wellandgood": {
        "url": "https://www.wellandgood.com/tag/astrology/",
        "selector": ".archive-post-title",
        "type": "css"
    },
    "apartmenttherapy": {
        "url": "https://www.apartmenttherapy.com/tag/feng-shui",
        "selector": ".search-result__title",
        "type": "css"
    },
    "goop": {
        "url": "https://goop.com/wellness/",
        "selector": ".post-title",
        "type": "css"
    },
    "realsimple": {
        "url": "https://www.realsimple.com/holidays-entertaining/holidays/astrology",
        "selector": ".search-result__title",
        "type": "css"
    },
    "cafeastrology": {
        "url": "https://cafeastrology.com/",
        "selector": ".entry-title",
        "type": "css"
    },
    "astrologyzone": {
        "url": "https://www.astrologyzone.com/",
        "selector": ".post-title",
        "type": "css"
    },
    "theastrologypodcast": {
        "url": "https://theastrologypodcast.com/",
        "selector": ".post-title",
        "type": "css"
    },
    # 国内（10 个）
    "sina_astro": {
        "url": "https://astro.sina.com.cn/",
        "selector": ".blkContainer .news-item h2 a",
        "type": "css"
    },
    "qq_astro": {
        "url": "https://astro.qq.com/",
        "selector": ".news-list h3 a",
        "type": "css"
    },
    "d1xz": {
        "url": "https://www.d1xz.net/",
        "selector": ".news_list li a",
        "type": "css"
    },
    "cece": {
        "url": "https://www.cece.com/",
        "selector": ".article-list h3 a",
        "type": "css"
    },
    "lingji": {
        "url": "https://www.lingji.com/",
        "selector": ".news-item h3 a",
        "type": "css"
    },
    "huangli": {
        "url": "https://www.huangli.com/",
        "selector": ".article-list h3 a",
        "type": "css"
    },
    "zhouyi": {
        "url": "https://www.zhouyi.cc/",
        "selector": ".news-list h3 a",
        "type": "css"
    },
    "qiming": {
        "url": "https://www.qiming.net/",
        "selector": ".article-list h3 a",
        "type": "css"
    },
    "yuncheng": {
        "url": "https://www.yuncheng.com/",
        "selector": ".news-list h3 a",
        "type": "css"
    },
    "xzw": {
        "url": "https://www.xzw.com/",
        "selector": ".news-list h3 a",
        "type": "css"
    }
}


def scrape_site(name, config):
    """抓取单个网站"""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        response = requests.get(config['url'], headers=headers, timeout=15)
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.text, 'html.parser')
        
        items = soup.select(config['selector'])
        titles = []
        for item in items[:15]:
            text = item.text.strip()
            if text and len(text) > 10:
                titles.append(text)
        
        return titles
    except Exception as e:
        print(f"{name} 抓取失败：{e}")
        return []


def scrape_baidu_hot():
    """百度热搜（玄学相关）"""
    try:
        url = "https://top.baidu.com/board"
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        items = soup.select('.c-single-text-ellipsis')
        return [item.text.strip() for item in items[:20]]
    except Exception as e:
        print(f"百度热搜抓取失败：{e}")
        return []


def scrape_reddit_astrology():
    """Reddit r/astrology"""
    try:
        url = "https://old.reddit.com/r/astrology/hot/"
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        items = soup.select('.title a')
        return [item.text.strip() for item in items[:20] if item.text.strip()]
    except Exception as e:
        print(f"Reddit 抓取失败：{e}")
        return []


def scrape_reddit_fengshui():
    """Reddit r/fengshui"""
    try:
        url = "https://old.reddit.com/r/fengshui/hot/"
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        items = soup.select('.title a')
        return [item.text.strip() for item in items[:20] if item.text.strip()]
    except Exception as e:
        print(f"Reddit r/fengshui 抓取失败：{e}")
        return []


def save_topics(topics):
    """保存选题数据"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M")
    filename = os.path.join(OUTPUT_DIR, f'topics_{timestamp}.json')
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(topics, f, ensure_ascii=False, indent=2)
    
    print(f"已保存：{filename}")
    return filename


def main():
    print("开始抓取国内外玄学大站...")
    
    topics = {
        "timestamp": datetime.now().isoformat(),
        "baidu": scrape_baidu_hot(),
        "reddit_astrology": scrape_reddit_astrology(),
        "reddit_fengshui": scrape_reddit_fengshui()
    }
    
    # 抓取各网站
    for name, config in SITES.items():
        print(f"正在抓取：{name}...")
        topics[name] = scrape_site(name, config)
    
    # 统计
    total = 0
    for platform, items in topics.items():
        if platform != "timestamp":
            count = len(items)
            total += count
            print(f"{platform}: {count} 条")
    
    # 保存
    filename = save_topics(topics)
    
    print(f"\n抓取完成！共 {total} 条热点")
    print(f"数据文件：{filename}")
    
    return topics


if __name__ == "__main__":
    main()
