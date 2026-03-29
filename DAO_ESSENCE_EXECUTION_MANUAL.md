# DaoEssence 运营执行手册
## Step-by-Step 可操作版本 | 从今天开始，逐步推进

> **使用说明**：这不是计划文档，这是行动指令。每完成一项打 ✅，遇到问题记录在对应步骤下方。
> 
> **参考文档**：`DAO_ESSENCE_OPERATION_PLAN_v2.md`（战略层）
> **本文档**：执行层，告诉你每天做什么、怎么做

---

## 📍 PHASE 1：基础建设（Week 1-2）
### 目标：把地基打牢，一次做对

---

### STEP 1：技术SEO修复（预计时间：3-4小时）
**优先级：🔴 最高 — 所有后续推广的基础**

#### 1.1 修复各页面 `<title>` 标签
打开每个HTML文件，替换标题：

| 文件 | 当前标题 | 修改为 |
|------|---------|-------|
| index.html | DAO Essence & Five Elements... | `DAO Essence | Taoist Meditation Audio & Xianxia Novels` |
| shop.html | DAO Essence - Authentic... | `Shop | Taoist Meditation Audio, Xianxia Novels & Readings` |
| product-detail.html | DAO Essence - Digital Resource Detail | `[产品名动态插入] | DAO Essence` |
| about.html | About Us - DAO Essence | `About DAO Essence | Our Story & Mission` |
| culture.html | Energy Universe - DAO Essence | `Five Elements & Taoist Culture | DAO Essence` |
| guide.html | Energy Principles - DAO Essence | `Taoist Wisdom Guide | Five Elements, Meditation & More` |

**执行方式**：直接告诉AI"帮我修改 [文件名] 的 title 和 meta description"，AI会直接操作文件。

#### 1.2 修复 meta description（每页独立撰写）

**各页面 meta description 模板**：
```
index.html：
"Explore authentic Taoist digital resources — guided meditation audio, 
xianxia novels in English, and Five Elements wisdom. Instant download. 
Crafted by Eastern philosophy practitioners."
（143字符 ✓）

shop.html：
"Shop Taoist meditation audio, Chinese cultivation novels, and Daoist 
readings. Professionally crafted digital products. Instant delivery. 
30-day satisfaction guarantee."
（161字符，需缩减至155以内）

product-detail.html（动态，JS插入）：
"{产品名} — {10字产品简介}. Instant digital download. 
Part of the DAO Essence Five Elements collection."

about.html：
"DAO Essence was founded to bring authentic Taoist wisdom to modern 
seekers worldwide — through meditation audio, xianxia translations, 
and Five Elements teachings."

guide.html：
"Learn Five Elements theory, Taoist meditation techniques, and ancient 
Chinese wisdom. Free educational resources from DAO Essence practitioners."
```

#### 1.3 添加 Open Graph 标签（所有页面）
在每个页面 `<head>` 末尾添加：
```html
<!-- Open Graph -->
<meta property="og:title" content="[对应标题]">
<meta property="og:description" content="[对应描述，可与meta description相同]">
<meta property="og:image" content="https://daoessence.com/images/og-default.jpg">
<meta property="og:url" content="https://daoessence.com/[对应页面]">
<meta property="og:type" content="website">
<meta property="og:site_name" content="DAO Essence">
<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="[对应标题]">
<meta name="twitter:description" content="[对应描述]">
<meta name="twitter:image" content="https://daoessence.com/images/og-default.jpg">
```

**注意**：需要制作一张 1200×630px 的 og-default.jpg（品牌图），可用 Canva 制作。

#### 1.4 添加 Schema Markup

**首页添加 Organization Schema**（在 `</body>` 前）：
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "DAO Essence",
  "url": "https://daoessence.com",
  "logo": "https://daoessence.com/images/logo.png",
  "description": "Authentic Taoist digital resources including meditation audio, xianxia novels, and Five Elements wisdom tools",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": ["English", "Chinese"]
  }
}
</script>
```

**商店页添加 ItemList Schema**：
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "DAO Essence Digital Products",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Product",
        "name": "Agarwood Meditation Audio Collection",
        "url": "https://daoessence.com/product-detail.html?id=prod_[ID]",
        "offers": {"@type": "Offer", "price": "9.00", "priceCurrency": "USD"}
      }
    }
  ]
}
</script>
```

**产品详情页添加动态 Product Schema**（在 product-detail.js 中）：
```javascript
// 在 CARD_DATA 加载完成后调用
function injectProductSchema(cardData) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": cardData.title,
        "description": cardData.description,
        "image": cardData.images[0].src,
        "brand": {"@type": "Brand", "name": "DAO Essence"},
        "offers": {
            "@type": "Offer",
            "price": cardData.price.toFixed(2),
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "url": window.location.href
        }
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
}
```

#### 1.5 更新 sitemap.xml

**当前问题**：产品URL使用查询参数（`?id=xxx`），搜索引擎不友好。

**短期修复**（保持现有URL结构，至少更新 lastmod 和添加博客）：
```xml
<!-- 添加到 sitemap.xml -->
<url>
    <loc>https://daoessence.com/blog/</loc>
    <lastmod>2026-04-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
</url>
<url>
    <loc>https://daoessence.com/blog/what-is-xianxia/</loc>
    <lastmod>2026-04-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
</url>
```

#### 1.6 修复 robots.txt

**当前问题**：屏蔽了SEMrush/Ahrefs，导致无法用这些工具监控竞品和自身排名。

```
# 修改：删除以下3行
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /
```

#### ✅ Step 1 完成确认
- [ ] 所有6个页面标题已更新
- [ ] 所有6个页面 meta description 已更新
- [ ] OG标签已添加到所有页面
- [ ] Organization Schema 已添加至首页
- [ ] Product Schema 注入代码已添加至 product-detail.js
- [ ] sitemap.xml 已更新
- [ ] robots.txt 已修复
- [ ] **Git commit + 告诉我，手动 push**

---

### STEP 2：Google Analytics 4 + Search Console 配置（预计时间：1小时）
**优先级：🔴 最高 — 没有数据就是盲飞**

#### 2.1 配置 GA4

1. 进入 [analytics.google.com](https://analytics.google.com)
2. 创建账号 → 属性名："DAO Essence" → 时区：你的时区
3. 复制 GA4 测量ID（格式：G-XXXXXXXXXX）
4. 在所有页面 `<head>` 中添加：
```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**注意**：将 `G-XXXXXXXXXX` 替换为你的实际 Measurement ID。

#### 2.2 配置关键事件追踪

在 `cart.js` 或相关文件中，添加以下追踪代码：
```javascript
// 加入购物车事件
function trackAddToCart(productName, price) {
    gtag('event', 'add_to_cart', {
        currency: 'USD',
        value: price,
        items: [{item_name: productName, price: price}]
    });
}

// 购买完成事件（在 payment-success.html 添加）
function trackPurchase(orderId, total, productName) {
    gtag('event', 'purchase', {
        transaction_id: orderId,
        value: total,
        currency: 'USD',
        items: [{item_name: productName, price: total}]
    });
}
```

#### 2.3 配置 Google Search Console

1. 进入 [search.google.com/search-console](https://search.google.com/search-console)
2. 添加属性：输入 `https://daoessence.com`
3. 验证方式：HTML标签（在首页 `<head>` 添加验证代码）
4. 提交 sitemap：`https://daoessence.com/sitemap.xml`

#### ✅ Step 2 完成确认
- [ ] GA4 代码已添加到所有页面
- [ ] 购物车/购买事件追踪已配置
- [ ] Search Console 验证完成
- [ ] Sitemap 已提交
- [ ] **Git commit + 手动 push**

---

### STEP 3：定价调整（预计时间：30分钟）
**优先级：🟡 中 — 立刻影响转化率**

在 Creem 后台将产品价格调整为心理定价：

| 当前价格 | 调整为 | 理由 |
|---------|-------|------|
| $9.52 | $9.00 | 整数，简洁专业 |
| $12.32 | $12.00 | 同上 |
| $17.92 | $19.00 | 锚点更高，感知价值更好 |
| $40.50（如有）| $39.00 | 心理定价 |
| $54.32 | $49.00 | 49比54心理上便宜很多 |
| $68.00（如有）| $69.00 | 奇数结尾，感知更精准 |

**执行**：登录 Creem 后台 → Products → 逐个修改价格 → 同步更新 products.json 本地文件

#### ✅ Step 3 完成确认
- [ ] Creem 后台价格已更新
- [ ] products.json 本地同步更新

---

### STEP 4：邮件营销系统搭建（预计时间：2小时）
**优先级：🔴 高 — 邮件列表是最有价值的资产**

#### 4.1 注册 Mailchimp
1. 注册 [mailchimp.com](https://mailchimp.com)（免费版支持500订阅者）
2. 创建受众列表："DAO Essence Subscribers"
3. 设置 2 个分组标签：
   - `meditation-interest`（冥想兴趣）
   - `novel-interest`（小说兴趣）

#### 4.2 创建欢迎邮件序列
在 Mailchimp 创建 Automation → Welcome Series（5封）：

**邮件1（立即发送）**：
```
主题：Welcome to DAO Essence 🌙 Your free gift is here
预览文字：Ancient wisdom for your modern journey...

内容要点：
- 欢迎语（2-3句，温暖不套路）
- 品牌故事（你为什么创建这个平台，50字）
- 免费资源按钮：[Download Your Five Elements Guide →]
  （先用现有内容，后续制作PDF）
- 简单介绍两条产品线
- 社媒关注引导
```

**邮件2（Day 2）**：
```
主题：The 2,500-year-old system that explains your personality 🔮
内容：五行性格入门，文末引导至 guide.html
```

**邮件3（Day 5）**：
```
主题（冥想标签）：🎧 Your free meditation sample is waiting
主题（小说标签）：📚 Read the first chapter free — Lord of Mysteries
内容：基于标签个性化推送
```

**邮件4（Day 9）**：
```
主题："I've been doing this wrong for years" — from our community
内容：用户故事/转变案例（暂用虚构合理案例，后续换真实）
```

**邮件5（Day 14）**：
```
主题：Your exclusive welcome offer expires in 48 hours ⏰
内容：首单85折优惠码（在Creem生成优惠码）+ 推荐产品
```

#### 4.3 在网站添加订阅入口

**A. 首页弹窗**（浏览30秒后触发）：
```html
<!-- 添加到 index.html，放在 </body> 前 -->
<div id="emailPopup" style="display:none; position:fixed; bottom:20px; right:20px; 
     background:#1A1612; border:1px solid #D4AF37; padding:30px; border-radius:12px;
     z-index:9999; max-width:320px; box-shadow:0 20px 60px rgba(0,0,0,0.5)">
  <button onclick="document.getElementById('emailPopup').style.display='none'" 
     style="position:absolute;top:10px;right:15px;background:none;border:none;
     color:#D4AF37;font-size:20px;cursor:pointer">×</button>
  <h4 style="color:#D4AF37;margin-bottom:10px">🌙 Free Gift for You</h4>
  <p style="color:#C0B090;font-size:14px;margin-bottom:15px">
    Get your free Five Elements Personality Guide + weekly Taoist wisdom
  </p>
  <input type="email" id="popupEmail" placeholder="your@email.com" 
     style="width:100%;padding:10px;border:1px solid #D4AF37;background:#2C2416;
     color:#F5F0E6;border-radius:6px;margin-bottom:10px">
  <button onclick="subscribeEmail()" 
     style="width:100%;padding:10px;background:#D4AF37;color:#1A1612;
     border:none;border-radius:6px;font-weight:600;cursor:pointer">
    Get Free Guide →
  </button>
  <p style="color:#6B6050;font-size:11px;margin-top:8px;text-align:center">
    No spam. Unsubscribe anytime.
  </p>
</div>

<script>
// 30秒后显示弹窗
setTimeout(function() {
    if (!localStorage.getItem('emailPopupDismissed')) {
        document.getElementById('emailPopup').style.display = 'block';
    }
}, 30000);

function subscribeEmail() {
    const email = document.getElementById('popupEmail').value;
    if (!email) return;
    // 替换为你的 Mailchimp 表单提交URL
    // 或使用 Mailchimp Embedded Form API
    localStorage.setItem('emailPopupDismissed', 'true');
    document.getElementById('emailPopup').innerHTML = 
        '<p style="color:#D4AF37;text-align:center">✓ Welcome! Check your inbox for your free guide.</p>';
}
</script>
```

**B. 博客文章底部订阅框**（等博客建好后添加）

#### ✅ Step 4 完成确认
- [ ] Mailchimp 账号注册完成
- [ ] 受众列表和标签创建完成
- [ ] 5封欢迎序列创建完成（可先建1-2封测试）
- [ ] 首页弹窗代码添加完成
- [ ] **Git commit + 手动 push**

---

## 📍 PHASE 2：内容建设（Week 3-4）
### 目标：搭建SEO内容骨架，开始有机流量积累

---

### STEP 5：创建博客系统（预计时间：4小时）
**优先级：🔴 最高 — 当前网站最大SEO短板**

#### 5.1 创建博客目录结构
```
blog/
  index.html          ← 博客首页（文章列表）
  styles-blog.css     ← 博客专用样式（可复用主样式）
  what-is-xianxia/
    index.html        ← 文章1
  five-elements-guide/
    index.html        ← 文章2
  taoist-meditation/
    index.html        ← 文章3
```

#### 5.2 博客首页（blog/index.html）

**直接告诉AI**："帮我创建 blog/index.html，复用现有网站导航和样式，展示博客文章列表，要有SEO meta标签。"

**关键要素**：
- 继承现有导航（道字logo + 菜单）
- 文章列表卡片（封面图+标题+摘要+阅读时间）
- 右侧侧边栏：热门分类、订阅框
- SEO标题："Blog | Taoist Wisdom, Xianxia Culture & Five Elements | DAO Essence"

#### 5.3 发布第一篇文章（优先级最高）

**文章：《What Is Xianxia? The Ultimate Beginner's Guide》**

**直接告诉AI**："帮我创建 blog/what-is-xianxia/index.html，内容框架如下，用网站现有样式，确保：
1. 标题：What Is Xianxia? The Ultimate Beginner's Guide to Chinese Cultivation Fiction
2. Meta description：Learn what xianxia is, how it differs from wuxia, and discover the best xianxia novels available in English. Your complete guide to Chinese cultivation fiction.
3. 包含 FAQ Schema
4. 文章末尾有推荐产品CTA"

**文章大纲（AI执行时参考）**：
```markdown
# What Is Xianxia? The Ultimate Beginner's Guide

**Quick Answer**: Xianxia (仙侠, "immortal heroes") is a Chinese fantasy 
genre where protagonists cultivate spiritual power to achieve immortality. 
Unlike Western fantasy, the magic system is rooted in Taoist philosophy.

## What Does Xianxia Mean?
## Xianxia vs Wuxia: Key Differences
[对比表格]

## Core Elements of Xianxia Stories
- Cultivation Systems
- Realms and Levels  
- Spiritual Weapons
- Sects and Factions

## The Best Xianxia Novels (Classic Rankings)
- Lord of Mysteries (诡秘之主) ⭐⭐⭐⭐⭐
- A Will Eternal
- Coiling Dragon
[每本附购买链接]

## Why Westerners Are Obsessed with Xianxia
## Where to Read Xianxia in English
[引导至本站产品页]

## FAQ
Q: Is xianxia the same as cultivation novels?
Q: What's the best xianxia novel to start with?
Q: Is Lord of Mysteries xianxia or wuxia?
Q: Are there good xianxia novels in English?
Q: What is a xianxia protagonist like?
```

#### ✅ Step 5 完成确认
- [ ] blog/ 目录创建完成
- [ ] blog/index.html 创建完成
- [ ] 第一篇文章发布完成
- [ ] sitemap.xml 更新（添加博客URL）
- [ ] 导航菜单添加"Blog"入口
- [ ] **Git commit + 手动 push**

---

### STEP 6：社交媒体账号建立（预计时间：2小时）
**优先级：🟡 中**

#### 6.1 需要创建的账号

**Instagram** (`@daoessence`)：
- Bio：
  ```
  道 | Authentic Taoist Digital Resources
  🎧 Meditation Audio · 📚 Xianxia Novels
  🌿 Five Elements Wisdom
  👇 Free guide for new followers
  [link in bio → daoessence.com]
  ```
- 头像：道字logo（金色）
- Link in Bio 工具：用 Linktree 或直接链接主站

**Reddit** (`u/DaoEssence`)：
- 发布前先成为社区成员，参与30天再发推广内容
- 目标社区：r/xianxia, r/taoism, r/meditation, r/noveltranslations

**Pinterest** (`DaoEssence`)：
- 创建4个Board：
  1. "Taoist Wisdom & Quotes"
  2. "Five Elements Guide"  
  3. "Xianxia Art & Culture"
  4. "Eastern Meditation Practices"

**YouTube** (`@DaoEssence`)（可后期建立）：
- 频道描述、分类设置
- 首个视频：品牌介绍视频（可简单录制）

#### 6.2 发布第一批内容（各平台10帖内容）

**Instagram 内容批量创建**（用 Canva）：
```
帖1：介绍帖 — "What is DAO Essence? 🌙"
帖2：五行介绍系列 — Wood Element（木）
帖3：五行介绍系列 — Fire Element（火）
帖4：五行介绍系列 — Earth Element（土）
帖5：五行介绍系列 — Metal Element（金）
帖6：五行介绍系列 — Water Element（水）
帖7：道家金句 — "Knowing others is intelligence..."
帖8：修仙小说推荐 — Lord of Mysteries
帖9：冥想小贴士 — "3-minute morning practice"
帖10：产品介绍 — 沉香冥想音频
```

Canva 模板提示：金黑配色（#1A1612背景+#D4AF37文字），使用中国水墨元素，统一风格。

#### ✅ Step 6 完成确认
- [ ] Instagram 账号创建完成，首批10帖发布
- [ ] Reddit 账号创建，已加入目标社区（先潜水）
- [ ] Pinterest 账号创建，Board建立
- [ ] 首批 Pinterest Pins 发布（链接至博客）

---

## 📍 PHASE 3：流量增长（Week 5-8）
### 目标：开始产生可见的有机流量，建立第一批忠实用户

---

### STEP 7：博客内容扩充（持续进行）

**每周任务**：
- 周一：发布1篇博客（目标词+1,500字以上+FAQ Schema）
- 周四：更新/优化1篇现有页面（culture.html/guide.html加关键词）

**Week 5-6 发布文章**：
- 《Five Elements Personality Test: Which Element Are You?》
  （含互动测试元素，高分享率）
- 《Taoist Meditation for Beginners: 5 Techniques》
  （含免费5分钟音频试听CTA）

**Week 7-8 发布文章**：
- 《Lord of Mysteries Review: Why This is the Best Xianxia Novel》
  （直接引导产品购买，高商业价值）
- 《Chinese New Year 2027: Fortune Forecast for Each Zodiac Sign》
  （时效性内容，可带来爆发流量）

---

### STEP 8：Reddit 社区运营（持续进行）

**前4周**：只贡献，不推广
```
r/xianxia 每周贡献：
- 分析1本小说的情节/世界观
- 回答新人关于修仙小说的问题
- 分享一段翻译质量对比

r/taoism 每周贡献：
- 分享一条《道德经》原文解读
- 回答"道家哲学如何应用于现代生活"类问题

r/meditation 每周贡献：
- 分享道家冥想方法（区别于正念冥想）
```

**第5周起**：可以在帖子中自然提及网站
```
例如：
"I've been collecting resources about xianxia for a while — 
if anyone wants a detailed breakdown, I wrote about it here: [链接]"
```

---

### STEP 9：第一次 Reddit AMA（Week 6-8）

**准备工作**：
1. 账号在 r/xianxia 或 r/taoism 已有30天+活跃记录
2. 准备30个常见问题的答案
3. 选择时间：美东时间周六下午（流量高峰）

**发帖标题**：
`"I translate Chinese cultivation novels and study Taoism — AMA about xianxia, wuxia, or Five Elements theory"`

**规则**：诚实回答，在回答中自然提及网站资源，不要硬广。

---

### STEP 10：Affiliate 联盟计划启动（Week 8）

**步骤**：
1. 在 Creem 后台检查是否支持 Affiliate 追踪（Referral功能）
2. 准备 Affiliate 推广套件：
   - 产品图片压缩包
   - 标准推广文案（3种风格）
   - 佣金说明文档

3. 主动接触首批 10 个潜在 Affiliate：
   - 搜索 Instagram：`#xianxia review` `#taoistmeditation`，找1-10万粉博主
   - 私信模板：
   ```
   Hi [Name],
   I love your content about [具体内容]. I run DAO Essence, 
   a platform for Taoist meditation audio and xianxia novels in English.
   I'd love to offer you a partnership — 30% commission on all sales 
   through your link, plus free access to all our products.
   Would you be open to a quick chat?
   — [你的名字], DAO Essence
   ```

---

## 📍 PHASE 4：数据驱动优化（Month 3 起）
### 目标：基于真实数据，放大有效策略，放弃无效策略

---

### STEP 11：月度数据分析（每月1日执行）

**用这个模板复盘**：
```
📊 Month [X] Report — DAO Essence

流量数据（来自 GA4）：
  - 总访问：___（环比±___%)
  - 最大来源渠道：___
  - 最多访问页面：___
  - 平均停留时长：___

转化数据：
  - 总销售额：$___
  - 订单数：___
  - 客单价：$___
  - 最畅销产品：___

内容数据：
  - 最高流量博客：___
  - Instagram最高互动帖：___
  - Reddit最高点赞帖：___

邮件数据：
  - 新订阅：___
  - 欢迎邮件打开率：___% （行业均值：45%）
  - 首单转化率：___%

本月发现：
  1. ___有效（保持/扩大）
  2. ___无效（调整/放弃）
  
下月重点：
  1. 
  2.
  3.
```

---

### STEP 12：第一次付费广告测试（Month 3）

**仅在以下条件满足后开启广告**：
- [ ] 至少2篇博客文章有机排名前20
- [ ] 有机月访问量达到500+
- [ ] 邮件列表达到100+订阅者
- [ ] 已有至少5条真实用户评价

**Google Ads 测试（$100/月）**：
```
广告组1：xianxia购买意图词
关键词：[xianxia novel english] [buy xianxia novel]
落地页：/blog/what-is-xianxia/（先教育，再引导购买）

广告组2：品牌词防御
关键词：[dao essence] [daoessence]
落地页：首页
```

---

## 📋 全局检查清单

### 每天（5分钟）
- [ ] 回复社媒评论/私信
- [ ] 查看昨日 GA4 数据
- [ ] 回复客服邮件

### 每周（2小时）
- [ ] 发布1篇博客文章
- [ ] 发布3条 Instagram 内容
- [ ] Reddit 贡献3个有价值的回复
- [ ] 发送邮件给订阅者（如有新内容）
- [ ] 记录本周运营日志

### 每月（4小时）
- [ ] 完整数据复盘（用上面模板）
- [ ] 更新内容日历
- [ ] 检查并优化低流量页面
- [ ] 联系3个潜在合作伙伴

---

## 🚨 优先级总结

**立即执行（本周内）**：
1. ✅ STEP 1：技术SEO修复（title/meta/schema）
2. ✅ STEP 2：GA4 + Search Console 配置
3. ✅ STEP 3：定价调整

**本月内完成**：
4. STEP 4：邮件系统搭建
5. STEP 5：博客创建+首篇文章
6. STEP 6：社交媒体账号建立

**持续推进**：
7. STEP 7：博客内容扩充（每周1篇）
8. STEP 8：Reddit社区运营（每周3回复）
9. STEP 9：Reddit AMA（第6-8周）
10. STEP 10：Affiliate计划启动（第8周）

---

> **执行提示**：这份文档中的所有技术改动（HTML修改、JS添加、新页面创建），都可以直接告诉AI"帮我执行 STEP X"，AI会直接操作文件，完成后你只需要 git push 即可上线。

---

*文档版本：v1.0*
*创建日期：2026-03-29*
*参考战略文档：DAO_ESSENCE_OPERATION_PLAN_v2.md*
