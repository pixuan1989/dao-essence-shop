# DaoEssence Love Reading — 产品需求文档

> 创建日期：2026-04-18  
> 状态：核心逻辑已确认 ✅  
> 逻辑来源：fatenet.cn（正缘方位网）  
> 页面文件：`love-reading.html`

---

## 一、产品定位

面向海外英语用户的**恋爱运势免费测算工具**，基于出生信息提供：
1. **Soulmate Direction**（另一半方位）— 核心功能
2. **Love Timing**（恋爱机会时机）— 核心功能
3. **Love Style**（恋爱风格）— 免费钩子（paipan 驱动）

**目标**：免费吸流量 + SEO 长尾词排名 + 引导到八字排盘/付费报告变现

---

## 二、概念包装（面向欧美用户）

### 术语映射表

| 内部概念 | 对外展示名 | 说明 |
|:---|:---|:---|
| 桃花星 | ~~Romance Star~~ | **已取消**，老外不需要这个概念 |
| 桃花方位 | **Soulmate Direction** 🧭 | 独创词，零认知门槛，秒懂 |
| 恋爱时机 | **Love Timing** ⏰ | 行业通用词 |
| 恋爱风格 | **Love Style** ✨ | 基于日主五行的恋爱性格 |
| 八字/命盘 | **Birth Chart** | 行业通用词 |
| 大运流年 | **Life Cycles** | 老外理解的词 |
| 桃花旺 | **High romance potential** | 不用中国术语 |
| 地支（子卯午酉） | 直接用方位名（North/East/South/West） | 不出现中文 |

### 关键原则
- **零中国术语**：不出现"桃花""大运""流年""地支""八字"等词
- **零专业门槛**：任何英语母语者 3 秒内理解功能含义
- **品牌独创**：Soulmate Direction 是 DaoEssence 独创概念词

---

## 三、关键词策略

### 核心目标关键词

| 关键词 | 估算月搜索量 | 竞争度 | 用途 |
|:---|:---:|:---:|:---|
| `soulmate direction calculator` | 待验证 | 极低 | 页面核心词（独创蓝海） |
| `find your soulmate direction` | 待验证 | 极低 | 长尾词 |
| `where will I meet my soulmate` | 40K-90K | 高 | 博客文章引流 |
| `when will I find love` | 20K-50K | 高 | 博客文章引流 |
| `love prediction by date of birth` | 10K-20K | 中 | 页面关键词 |
| `love timing calculator` | 待验证 | 中 | 页面关键词 |

### SEO 元数据

| 字段 | 内容 |
|:---|:---|
| Page Title | `Free Love Reading — Soulmate Direction & Love Timing Calculator` |
| Meta Description | `Discover your Soulmate Direction, Love Timing, and Love Style. Enter your birth details to reveal where and when love will find you.` |
| H1 | `Discover Your Love Blueprint` |
| URL | `/love-reading.html` |

---

## 四、功能模块

### 模块 1：Love Style（恋爱风格）— 免费钩子

| 项 | 内容 |
|:---|:---|
| **引擎** | paipan.js |
| **输入** | 出生日期 + 性别 |
| **输出** | 日主五行 → 恋爱风格描述 |
| **技术** | paipan 返回日主天干 → STEM_WX 查五行 → 五行→恋爱风格映射表 |

**展示格式**：
```
✨ Your Love Style: Wood — The Growth-Seeker
"You connect through warmth and authenticity. Deep conversations 
and shared experiences matter more than grand gestures."
```

**五行恋爱风格映射表**：

| 五行 | 标题 | 描述 |
|:---|:---|:---|
| Wood | The Growth-Seeker | Warm, growth-oriented, values deep conversations and authenticity |
| Fire | The Passionate Spark | Expressive, spontaneous, drawn to excitement and adventure |
| Earth | The Steady Heart | Loyal, dependable, seeks stability and long-term commitment |
| Metal | The Fierce Protector | Bold, decisive, loves deeply but guards their heart carefully |
| Water | The Deep Dreamer | Intuitive, empathetic, connects on soul level before anything else |

---

### 模块 2：Soulmate Direction — 核心功能 ✅ 逻辑已确认

| 项 | 内容 |
|:---|:---|
| **引擎** | 五行相克查表（非 paipan，纯前端） |
| **输入** | 性别 + 日主五行（通过 paipan 自动提取） |
| **输出** | 方位（East/West/North/South）+ 英文建议 |
| **状态** | ✅ 核心逻辑已从 fatenet.cn 提取 |

**核心算法**：
1. 男命：我克者为妻 → `soulmateElement = conqueringRelations[dayMasterElement]`
2. 女命：克我者为夫 → 找到 `conqueringRelations[key] === dayMasterElement` 的 key
3. 配偶五行 → 方位映射：

| 日主五行 | 配偶五行（男/女） | Soulmate Direction |
|:---|:---|:---|
| Wood | Earth / Metal | **East** |
| Fire | Metal / Water | **South** |
| Earth | Water / Wood | **South**（火土同宫） |
| Metal | Wood / Fire | **West** |
| Water | Fire / Earth | **North** |

**五行相克关系**：金克木、木克土、土克水、水克火、火克金

---

### 模块 3：Love Timing — 核心功能 ✅ 逻辑已确认

| 项 | 内容 |
|:---|:---|
| **引擎** | 八字命理条件判断（非 paipan，纯前端） |
| **输入** | 性别 + 完整八字四柱（通过 paipan 自动提取） |
| **输出** | 未来 5 年每年的 Romance Potential 百分比 |
| **状态** | ✅ 核心逻辑已从 fatenet.cn 提取 |

**核心算法**：逐年判断 12 个命理条件，累加得分：

| # | 条件 | 分值 | 适用 | 英文展示名 |
|:--|:---|:---:|:---|:---|
| 1 | 天干五合 | 25 | 通用 | — |
| 2 | 地支六合 | 20 | 通用 | — |
| 3 | 六穿（六害） | 15 | 仅女命 | — |
| 4 | 二破 | 10 | 通用 | — |
| 5 | 天合地合 | 30 | 通用 | — |
| 6 | 天干之刃合杀 | 25 | 仅女命 | — |
| 7 | 干支自合 | 25 | 通用 | — |
| 8 | 财星显/官杀显 | 30 | 分性别 | — |
| 9 | 夫妻宫禄被穿破 | 15 | 仅女命 | — |
| 10 | 夫妻宫本气被日干合 | 20 | 通用 | — |
| 11 | 流年=日柱且干支自合 | 30 | 通用 | — |
| 12 | 伤官合杀 | 40 | 仅女命+阴干 | — |

**概率分级**：≥3条件=80%, =2条件=50%, =1条件=30%

**关键数据表**：
```
天干五合: 甲己、乙庚、丙辛、丁壬、戊癸
地支六合: 子丑、寅亥、卯戌、辰酉、巳申、午未
六穿:   子未、丑午、寅巳、卯辰、申亥、酉戌
二破:   子卯、卯午
干支自合: 甲午、丁亥、戊子戌、辛巳、壬午、癸巳
```

**展示格式**（对外不展示命理术语）：
```
⏰ Your Love Timing

2026 — 30%  Low potential
2027 — 80%  Strong potential 🔥
2028 — 50%  Moderate potential
2029 — 80%  Strong potential 🔥
2030 — 30%  Low potential
```

---

### 模块 4（预留）：情侣方位匹配 ⏸️ 暂不开发

需要全球城市经纬度数据库，当前暂不实现。逻辑已提取备用：
- 通过城市坐标计算方位角
- 双方感情方位交叉匹配
- 双方匹配=100%, 单方=60%, 都不匹配=30%

---

## 五、技术架构

### 引擎分工

| 引擎 | 用途 | 说明 |
|:---|:---|:---|
| **paipan.js** | Love Style 免费钩子 | 日主天干→五行→恋爱风格 |
| **paipan.js** | 提取八字四柱数据 | 为 Love Timing 提供输入 |
| **自定义查表逻辑** | Soulmate Direction | 五行相克→方位映射 |
| **自定义条件判断** | Love Timing | 12 个命理条件逐年打分 |

### 输入方式

| 原站（fatenet.cn） | DaoEssence |
|:---|:---|
| 手动选择天干地支 | **paipan.js 自动计算**（用户输入出生年月日时） |
| 手动选择日主五行 | **paipan.js 自动提取** |

### 文件结构

```
love-reading.html          # 主页面（表单 + 结果展示）
love-reading.js            # 逻辑脚本
  ├── calcLoveStyle()           # paipan 驱动
  ├── calcSoulmateDirection()   # 五行相克→方位映射
  ├── calcLoveTiming()          # 12条件逐年打分
  └── predictTiming()           # 完整感情年份预测函数
```

### 用户流程

```
首页/Banner/Blog → "Discover Your Love Blueprint" CTA
    ↓
love-reading.html → 输入出生信息（年月日时 + 性别）
    ↓
paipan 自动排盘 → 提取日主五行 + 四柱
    ↓
展示结果：
    ├── ✨ Love Style（paipan，即时）
    ├── 🧭 Soulmate Direction（五行相克查表）
    ├── ⏰ Love Timing（12条件打分）
    └── [Get Your Full Birth Chart Reading →] ← CTA引流
```

### 变现路径

全部免费，通过底部 CTA 引导到现有八字排盘页面（bazi-form.html）→ 付费报告变现。

---

## 六、待办

- [x] ~~Soulmate Direction 判断逻辑~~ ✅ 已从 fatenet.cn 提取
- [x] ~~Love Timing 判断逻辑~~ ✅ 已从 fatenet.cn 提取
- [x] ~~是否需要后端/API~~ → 确认纯前端
- [ ] 开发 love-reading.html 页面
- [ ] 集成 paipan.js 提取日主五行和四柱
- [ ] 实现三个计算函数
- [ ] SEO 优化
- [ ] 全站导航加入口

---

## 七、竞品参考

| 竞品 | 功能 | 变现 |
|:---|:---|:---|
| **fatenet.cn** | 感情方位 + 情侣匹配 + 感情年份 | 免费工具（核心逻辑来源） |
| astrologybazi.com | 桃花星 + 恋爱方位 + 时机 | 免费基础 + 付费深度报告 |
| yinyangtools.com | 桃花星计算器 | 免费 |
| coatue.com | 年度运势概览 | 免费概览 + 付费每月详解 |
| tarotvista.ai | 免费每日1牌 | 完整牌阵付费 |

**DaoEssence 差异化**：Soulmate Direction 独创概念 + Love Timing 精确到年份 + 全英文零术语 + 全部免费引流

---

*文档维护：核心逻辑已确认（2026-04-18），待开发。*
