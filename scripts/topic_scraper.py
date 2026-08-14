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


# 百度热搜过滤关键词（只保留与命理/大健康/风水/运势相关的词条）
BAIDU_FILTER = [
    "健康", "养生", "健身", "运动", "睡眠", "减肥", "中医", "节气", "运势", "星座",
    "明星", "名人", "饮食", "情绪", "压力", "焦虑", "体检", "医院", "病毒", "疫情",
    "艾灸", "穴位", "熬夜", "长寿", "癌症", "心脏", "肝脏", "脾胃", "肾脏", "血压",
    "失眠", "抑郁", "婚姻", "情感", "桃花", "财运", "事业", "风水", "命理", "八字"
]


def scrape_baidu_hot():
    """百度热搜（过滤后只留命理/大健康/风水相关词条）"""
    try:
        url = "https://top.baidu.com/board"
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        items = soup.select('.c-single-text-ellipsis')
        all_items = [item.text.strip() for item in items[:30]]
        # 过滤：只保留命中关键词的词条（这些是命理/健康/运势相关）
        filtered = [i for i in all_items if any(k in i for k in BAIDU_FILTER)]
        return filtered[:20]
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


def scrape_google_news(query, hl="en-US", num=15):
    """Google News RSS 搜索（稳定、直接返回新闻标题，含海外命理/健康热点）"""
    try:
        url = f"https://news.google.com/rss/search?q={requests.utils.quote(query)}&hl={hl}"
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        response = requests.get(url, headers=headers, timeout=15)
        response.encoding = 'utf-8'
        # RSS 用 html.parser 也能解析简单 XML
        soup = BeautifulSoup(response.text, 'html.parser')
        items = soup.select('item title')
        titles = []
        for item in items[:num]:
            text = item.get_text().strip()
            # Google News 标题格式: "Title - Source"，去掉来源
            if ' - ' in text:
                text = text.rsplit(' - ', 1)[0].strip()
            if text:
                titles.append(text)
        return titles
    except Exception as e:
        print(f"Google News 抓取失败 ({query})：{e}")
        return []


def scrape_rss(url, num=15):
    """通用 RSS 源抓取（返回文章标题）"""
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        response = requests.get(url, headers=headers, timeout=15)
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.text, 'html.parser')
        items = soup.select('item title, entry title')
        titles = []
        for item in items[:num]:
            text = item.get_text().strip()
            if ' - ' in text:
                text = text.rsplit(' - ', 1)[0].strip()
            if text:
                titles.append(text)
        return titles
    except Exception as e:
        print(f"RSS 抓取失败 ({url})：{e}")
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
    print("开始抓取实时热点（命理 + 大健康方向）...")
    
    topics = {
        "timestamp": datetime.now().isoformat(),
        # 国内实时热点（过滤后只留命理/健康/运势相关）
        "baidu_filtered": scrape_baidu_hot(),
        # 海外实时新闻：命理/风水类
        "google_fengshui": scrape_google_news("feng shui OR bazi OR chinese astrology OR zodiac sign"),
        # 海外实时新闻：大健康/中医类
        "google_wellness": scrape_google_news("traditional chinese medicine OR tcm wellness OR five elements health OR qigong"),
        # 健康养生 RSS 源
        "mindbodygreen": scrape_rss("https://www.mindbodygreen.com/articles/rss.xml"),
        "goop_wellness": scrape_rss("https://goop.com/feed/")
    }
    
    # 保留少数仍有效的玄学大站（其余 CSS 选择器已失效，跳过以免超时浪费）
    for name in ("theastrologypodcast", "cafeastrology"):
        if name in SITES:
            print(f"正在抓取：{name}...")
            topics[name] = scrape_site(name, SITES[name])
    
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
