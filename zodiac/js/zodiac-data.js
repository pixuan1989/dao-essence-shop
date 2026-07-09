/**
 * 十二生肖每日运势数据层
 * 数据按日期组织，每日一个 key，格式：YYYY-MM-DD
 * fallback: 如果当天数据不存在，使用 default
 */

var ZODIAC_DATA = {










  "2026-05-20": {
    "rat":     { score: 60, color: "#5B8299", colorName: "蓝色", number: 9, direction: "西南", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "风雨过后见彩虹" },
    "ox":     { score: 60, color: "#9E8E6E", colorName: "棕色", number: 8, direction: "西南", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心宽路就宽" },
    "tiger":     { score: 80, color: "#5E825E", colorName: "绿色", number: 2, direction: "西南", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "放下便是拥有" },
    "rabbit":     { score: 70, color: "#5E825E", colorName: "绿色", number: 3, direction: "西南", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "随缘自在" },
    "dragon":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 3, direction: "西南", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心静自然凉" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 2, direction: "西南", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "知足常乐" },
    "horse":     { score: 55, color: "#B8665E", colorName: "红色", number: 2, direction: "西南", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "平常心是道" },
    "goat":     { score: 85, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "西南", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "一切都是最好的安排" },
    "monkey":     { score: 70, color: "#D4AF37", colorName: "金色", number: 3, direction: "西南", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "顺其自然" },
    "rooster":     { score: 70, color: "#D4AF37", colorName: "金色", number: 4, direction: "西南", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心安即是归处" },
    "dog":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "西南", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "从容面对一切" },
    "pig":     { score: 80, color: "#5B8299", colorName: "蓝色", number: 9, direction: "西南", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "不争不抢自有岁月打赏" }
  },






  "2026-05-21": {
    "rat":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 1, direction: "正西", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "小满未满，盈而不溢。", quoteEn: "" },
    "ox":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "正西", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "小满未满，盈而不溢。", quoteEn: "" },
    "tiger":     { score: 70, color: "#5E825E", colorName: "绿色", number: 3, direction: "正西", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "小满未满，盈而不溢。", quoteEn: "" },
    "rabbit":     { score: 80, color: "#5E825E", colorName: "绿色", number: 4, direction: "正西", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "小满未满，盈而不溢。", quoteEn: "" },
    "dragon":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 4, direction: "正西", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "小满未满，盈而不溢。", quoteEn: "" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 3, direction: "正西", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "小满未满，盈而不溢。", quoteEn: "" },
    "horse":     { score: 85, color: "#B8665E", colorName: "红色", number: 3, direction: "正西", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "小满未满，盈而不溢。", quoteEn: "" },
    "goat":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 2, direction: "正西", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "小满未满，盈而不溢。", quoteEn: "" },
    "monkey":     { score: 70, color: "#D4AF37", colorName: "金色", number: 4, direction: "正西", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "小满未满，盈而不溢。", quoteEn: "" },
    "rooster":     { score: 70, color: "#D4AF37", colorName: "金色", number: 5, direction: "正西", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "小满未满，盈而不溢。", quoteEn: "" },
    "dog":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "正西", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "小满未满，盈而不溢。", quoteEn: "" },
    "pig":     { score: 90, color: "#5B8299", colorName: "蓝色", number: 1, direction: "正西", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "小满未满，盈而不溢。", quoteEn: "" }
  },


  "2026-05-22": {
    "rat":     { score: 80, color: "#5B8299", colorName: "蓝色", number: 2, direction: "西北", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "放下便是拥有", quoteEn: "" },
    "ox":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "西北", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "随缘自在", quoteEn: "" },
    "tiger":     { score: 60, color: "#5E825E", colorName: "绿色", number: 4, direction: "西北", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心静自然凉", quoteEn: "" },
    "rabbit":     { score: 80, color: "#5E825E", colorName: "绿色", number: 5, direction: "西北", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "知足常乐", quoteEn: "" },
    "dragon":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 5, direction: "西北", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "平常心是道", quoteEn: "" },
    "snake":     { score: 85, color: "#B8665E", colorName: "红色", number: 4, direction: "西北", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "一切都是最好的安排", quoteEn: "" },
    "horse":     { score: 70, color: "#B8665E", colorName: "红色", number: 4, direction: "西北", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "顺其自然", quoteEn: "" },
    "goat":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 3, direction: "西北", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心安即是归处", quoteEn: "" },
    "monkey":     { score: 70, color: "#D4AF37", colorName: "金色", number: 5, direction: "西北", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "从容面对一切", quoteEn: "" },
    "rooster":     { score: 70, color: "#D4AF37", colorName: "金色", number: 6, direction: "西北", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "不争不抢自有岁月打赏", quoteEn: "" },
    "dog":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 2, direction: "西北", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "慢下来，感受生活", quoteEn: "" },
    "pig":     { score: 55, color: "#5B8299", colorName: "蓝色", number: 2, direction: "西北", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "内心丰盈者独行也众", quoteEn: "" }
  },

  "2026-05-23": {
    "rat":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 3, direction: "西北", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "随缘自在", quoteEn: "" },
    "ox":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 2, direction: "西北", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心静自然凉", quoteEn: "" },
    "tiger":     { score: 80, color: "#5E825E", colorName: "绿色", number: 5, direction: "西北", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "知足常乐", quoteEn: "" },
    "rabbit":     { score: 60, color: "#5E825E", colorName: "绿色", number: 6, direction: "西北", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "平常心是道", quoteEn: "" },
    "dragon":     { score: 85, color: "#9E8E6E", colorName: "棕色", number: 6, direction: "西北", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "一切都是最好的安排", quoteEn: "" },
    "snake":     { score: 80, color: "#B8665E", colorName: "红色", number: 5, direction: "西北", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "顺其自然", quoteEn: "" },
    "horse":     { score: 70, color: "#B8665E", colorName: "红色", number: 5, direction: "西北", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心安即是归处", quoteEn: "" },
    "goat":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 4, direction: "西北", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "从容面对一切", quoteEn: "" },
    "monkey":     { score: 70, color: "#D4AF37", colorName: "金色", number: 6, direction: "西北", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "不争不抢自有岁月打赏", quoteEn: "" },
    "rooster":     { score: 55, color: "#D4AF37", colorName: "金色", number: 7, direction: "西北", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "慢下来，感受生活", quoteEn: "" },
    "dog":     { score: 60, color: "#9E8E6E", colorName: "棕色", number: 3, direction: "西北", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "内心丰盈者独行也众", quoteEn: "" },
    "pig":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 3, direction: "西北", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心若不动风又奈何", quoteEn: "" }
  },

  "2026-05-24": {
    "rat":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 4, direction: "正北", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心静自然凉", quoteEn: "" },
    "ox":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 3, direction: "正北", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "知足常乐", quoteEn: "" },
    "tiger":     { score: 80, color: "#5E825E", colorName: "绿色", number: 6, direction: "正北", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "平常心是道", quoteEn: "" },
    "rabbit":     { score: 85, color: "#5E825E", colorName: "绿色", number: 7, direction: "正北", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "一切都是最好的安排", quoteEn: "" },
    "dragon":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 7, direction: "正北", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "顺其自然", quoteEn: "" },
    "snake":     { score: 80, color: "#B8665E", colorName: "红色", number: 6, direction: "正北", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心安即是归处", quoteEn: "" },
    "horse":     { score: 90, color: "#B8665E", colorName: "红色", number: 6, direction: "正北", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "从容面对一切", quoteEn: "" },
    "goat":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 5, direction: "正北", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "不争不抢自有岁月打赏", quoteEn: "" },
    "monkey":     { score: 70, color: "#D4AF37", colorName: "金色", number: 7, direction: "正北", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "慢下来，感受生活", quoteEn: "" },
    "rooster":     { score: 60, color: "#D4AF37", colorName: "金色", number: 8, direction: "正北", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "内心丰盈者独行也众", quoteEn: "" },
    "dog":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 4, direction: "正北", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心若不动风又奈何", quoteEn: "" },
    "pig":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 4, direction: "正北", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "淡定从容是最好的状态", quoteEn: "" }
  },

  "2026-05-25": {
    "rat":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 5, direction: "东北", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "知足常乐", quoteEn: "" },
    "ox":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 4, direction: "东北", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "平常心是道", quoteEn: "" },
    "tiger":     { score: 85, color: "#5E825E", colorName: "绿色", number: 7, direction: "东北", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "一切都是最好的安排", quoteEn: "" },
    "rabbit":     { score: 80, color: "#5E825E", colorName: "绿色", number: 8, direction: "东北", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "顺其自然", quoteEn: "" },
    "dragon":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 8, direction: "东北", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心安即是归处", quoteEn: "" },
    "snake":     { score: 60, color: "#B8665E", colorName: "红色", number: 7, direction: "东北", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "从容面对一切", quoteEn: "" },
    "horse":     { score: 80, color: "#B8665E", colorName: "红色", number: 7, direction: "东北", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "不争不抢自有岁月打赏", quoteEn: "" },
    "goat":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 6, direction: "东北", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "慢下来，感受生活", quoteEn: "" },
    "monkey":     { score: 55, color: "#D4AF37", colorName: "金色", number: 8, direction: "东北", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "内心丰盈者独行也众", quoteEn: "" },
    "rooster":     { score: 70, color: "#D4AF37", colorName: "金色", number: 9, direction: "东北", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心若不动风又奈何", quoteEn: "" },
    "dog":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 5, direction: "东北", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "淡定从容是最好的状态", quoteEn: "" },
    "pig":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 5, direction: "东北", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "修心养性", quoteEn: "" }
  },

  "2026-05-26": {
    "rat":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 6, direction: "东北", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "平常心是道", quoteEn: "" },
    "ox":     { score: 95, color: "#9E8E6E", colorName: "棕色", number: 5, direction: "东北", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "一切都是最好的安排", quoteEn: "" },
    "tiger":     { score: 70, color: "#5E825E", colorName: "绿色", number: 8, direction: "东北", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "顺其自然", quoteEn: "" },
    "rabbit":     { score: 55, color: "#5E825E", colorName: "绿色", number: 9, direction: "东北", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心安即是归处", quoteEn: "" },
    "dragon":     { score: 90, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "东北", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "从容面对一切", quoteEn: "" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 8, direction: "东北", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "不争不抢自有岁月打赏", quoteEn: "" },
    "horse":     { score: 55, color: "#B8665E", colorName: "红色", number: 8, direction: "东北", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "慢下来，感受生活", quoteEn: "" },
    "goat":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 7, direction: "东北", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "内心丰盈者独行也众", quoteEn: "" },
    "monkey":     { score: 80, color: "#D4AF37", colorName: "金色", number: 9, direction: "东北", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心若不动风又奈何", quoteEn: "" },
    "rooster":     { score: 70, color: "#D4AF37", colorName: "金色", number: 1, direction: "东北", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "淡定从容是最好的状态", quoteEn: "" },
    "dog":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 6, direction: "东北", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "修心养性", quoteEn: "" },
    "pig":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 6, direction: "东北", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "一念放下万般自在", quoteEn: "" }
  },

  "2026-05-27": {
    "rat":     { score: 85, color: "#5B8299", colorName: "蓝色", number: 7, direction: "正东", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "一切都是最好的安排", quoteEn: "" },
    "ox":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 6, direction: "正东", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "顺其自然", quoteEn: "" },
    "tiger":     { score: 70, color: "#5E825E", colorName: "绿色", number: 9, direction: "正东", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心安即是归处", quoteEn: "" },
    "rabbit":     { score: 70, color: "#5E825E", colorName: "绿色", number: 1, direction: "正东", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "从容面对一切", quoteEn: "" },
    "dragon":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "正东", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "不争不抢自有岁月打赏", quoteEn: "" },
    "snake":     { score: 80, color: "#B8665E", colorName: "红色", number: 9, direction: "正东", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "慢下来，感受生活", quoteEn: "" },
    "horse":     { score: 60, color: "#B8665E", colorName: "红色", number: 9, direction: "正东", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "内心丰盈者独行也众", quoteEn: "" },
    "goat":     { score: 60, color: "#9E8E6E", colorName: "棕色", number: 8, direction: "正东", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心若不动风又奈何", quoteEn: "" },
    "monkey":     { score: 70, color: "#D4AF37", colorName: "金色", number: 1, direction: "正东", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "淡定从容是最好的状态", quoteEn: "" },
    "rooster":     { score: 80, color: "#D4AF37", colorName: "金色", number: 2, direction: "正东", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "修心养性", quoteEn: "" },
    "dog":     { score: 65, color: "#9E8E6E", colorName: "棕色", number: 7, direction: "正东", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "一念放下万般自在", quoteEn: "" },
    "pig":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 7, direction: "正东", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心简单世界就简单", quoteEn: "" }
  },

  "2026-05-28": {
    "rat":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 8, direction: "东南", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "顺其自然", quoteEn: "" },
    "ox":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 7, direction: "东南", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心安即是归处", quoteEn: "" },
    "tiger":     { score: 70, color: "#5E825E", colorName: "绿色", number: 1, direction: "东南", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "从容面对一切", quoteEn: "" },
    "rabbit":     { score: 70, color: "#5E825E", colorName: "绿色", number: 2, direction: "东南", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "不争不抢自有岁月打赏", quoteEn: "" },
    "dragon":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 2, direction: "东南", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "慢下来，感受生活", quoteEn: "" },
    "snake":     { score: 55, color: "#B8665E", colorName: "红色", number: 1, direction: "东南", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "内心丰盈者独行也众", quoteEn: "" },
    "horse":     { score: 80, color: "#B8665E", colorName: "红色", number: 1, direction: "东南", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心若不动风又奈何", quoteEn: "" },
    "goat":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "东南", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "淡定从容是最好的状态", quoteEn: "" },
    "monkey":     { score: 60, color: "#D4AF37", colorName: "金色", number: 2, direction: "东南", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "修心养性", quoteEn: "" },
    "rooster":     { score: 80, color: "#D4AF37", colorName: "金色", number: 3, direction: "东南", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "一念放下万般自在", quoteEn: "" },
    "dog":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 8, direction: "东南", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心简单世界就简单", quoteEn: "" },
    "pig":     { score: 85, color: "#5B8299", colorName: "蓝色", number: 8, direction: "东南", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "温柔对待这个世界", quoteEn: "" }
  },

  "2026-05-29": {
    "rat":     { score: 55, color: "#5B8299", colorName: "蓝色", number: 9, direction: "东南", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心安即是归处", quoteEn: "" },
    "ox":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 8, direction: "东南", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "从容面对一切", quoteEn: "" },
    "tiger":     { score: 70, color: "#5E825E", colorName: "绿色", number: 2, direction: "东南", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "不争不抢自有岁月打赏", quoteEn: "" },
    "rabbit":     { score: 70, color: "#5E825E", colorName: "绿色", number: 3, direction: "东南", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "慢下来，感受生活", quoteEn: "" },
    "dragon":     { score: 60, color: "#9E8E6E", colorName: "棕色", number: 3, direction: "东南", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "内心丰盈者独行也众", quoteEn: "" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 2, direction: "东南", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心若不动风又奈何", quoteEn: "" },
    "horse":     { score: 70, color: "#B8665E", colorName: "红色", number: 2, direction: "东南", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "淡定从容是最好的状态", quoteEn: "" },
    "goat":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "东南", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "修心养性", quoteEn: "" },
    "monkey":     { score: 80, color: "#D4AF37", colorName: "金色", number: 3, direction: "东南", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "一念放下万般自在", quoteEn: "" },
    "rooster":     { score: 60, color: "#D4AF37", colorName: "金色", number: 4, direction: "东南", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心简单世界就简单", quoteEn: "" },
    "dog":     { score: 85, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "东南", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "温柔对待这个世界", quoteEn: "" },
    "pig":     { score: 80, color: "#5B8299", colorName: "蓝色", number: 9, direction: "东南", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "与自己和解", quoteEn: "" }
  },

  "2026-05-30": {
    "rat":     { score: 90, color: "#5B8299", colorName: "蓝色", number: 1, direction: "正南", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "从容面对一切", quoteEn: "" },
    "ox":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "正南", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "不争不抢自有岁月打赏", quoteEn: "" },
    "tiger":     { score: 70, color: "#5E825E", colorName: "绿色", number: 3, direction: "正南", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "慢下来，感受生活", quoteEn: "" },
    "rabbit":     { score: 60, color: "#5E825E", colorName: "绿色", number: 4, direction: "正南", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "内心丰盈者独行也众", quoteEn: "" },
    "dragon":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 4, direction: "正南", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心若不动风又奈何", quoteEn: "" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 3, direction: "正南", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "淡定从容是最好的状态", quoteEn: "" },
    "horse":     { score: 70, color: "#B8665E", colorName: "红色", number: 3, direction: "正南", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "修心养性", quoteEn: "" },
    "goat":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 2, direction: "正南", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "一念放下万般自在", quoteEn: "" },
    "monkey":     { score: 80, color: "#D4AF37", colorName: "金色", number: 4, direction: "正南", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心简单世界就简单", quoteEn: "" },
    "rooster":     { score: 85, color: "#D4AF37", colorName: "金色", number: 5, direction: "正南", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "温柔对待这个世界", quoteEn: "" },
    "dog":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "正南", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "与自己和解", quoteEn: "" },
    "pig":     { score: 80, color: "#5B8299", colorName: "蓝色", number: 1, direction: "正南", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "勇敢出发", quoteEn: "" }
  },

  "2026-05-31": {
    "rat":     { score: 80, color: "#5B8299", colorName: "蓝色", number: 2, direction: "西南", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "不争不抢自有岁月打赏", quoteEn: "" },
    "ox":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "西南", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "慢下来，感受生活", quoteEn: "" },
    "tiger":     { score: 55, color: "#5E825E", colorName: "绿色", number: 4, direction: "西南", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "内心丰盈者独行也众", quoteEn: "" },
    "rabbit":     { score: 70, color: "#5E825E", colorName: "绿色", number: 5, direction: "西南", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心若不动风又奈何", quoteEn: "" },
    "dragon":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 5, direction: "西南", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "淡定从容是最好的状态", quoteEn: "" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 4, direction: "西南", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "修心养性", quoteEn: "" },
    "horse":     { score: 70, color: "#B8665E", colorName: "红色", number: 4, direction: "西南", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "一念放下万般自在", quoteEn: "" },
    "goat":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 3, direction: "西南", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心简单世界就简单", quoteEn: "" },
    "monkey":     { score: 85, color: "#D4AF37", colorName: "金色", number: 5, direction: "西南", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "温柔对待这个世界", quoteEn: "" },
    "rooster":     { score: 80, color: "#D4AF37", colorName: "金色", number: 6, direction: "西南", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "与自己和解", quoteEn: "" },
    "dog":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 2, direction: "西南", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "勇敢出发", quoteEn: "" },
    "pig":     { score: 60, color: "#5B8299", colorName: "蓝色", number: 2, direction: "西南", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "想做就去做", quoteEn: "" }
  },

  "2026-06-01": {
    "rat":     { score: 55, color: "#5B8299", colorName: "蓝色", number: 9, direction: "西南", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "儿童节快乐，永葆童心。", quoteEn: "" },
    "ox":     { score: 60, color: "#9E8E6E", colorName: "棕色", number: 8, direction: "西南", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "儿童节快乐，永葆童心。", quoteEn: "" },
    "tiger":     { score: 90, color: "#5E825E", colorName: "绿色", number: 2, direction: "西南", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "儿童节快乐，永葆童心。", quoteEn: "" },
    "rabbit":     { score: 80, color: "#5E825E", colorName: "绿色", number: 3, direction: "西南", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "儿童节快乐，永葆童心。", quoteEn: "" },
    "dragon":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 3, direction: "西南", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "儿童节快乐，永葆童心。", quoteEn: "" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 2, direction: "西南", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "儿童节快乐，永葆童心。", quoteEn: "" },
    "horse":     { score: 55, color: "#B8665E", colorName: "红色", number: 2, direction: "西南", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "儿童节快乐，永葆童心。", quoteEn: "" },
    "goat":     { score: 85, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "西南", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "儿童节快乐，永葆童心。", quoteEn: "" },
    "monkey":     { score: 70, color: "#D4AF37", colorName: "金色", number: 3, direction: "西南", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "儿童节快乐，永葆童心。", quoteEn: "" },
    "rooster":     { score: 70, color: "#D4AF37", colorName: "金色", number: 4, direction: "西南", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "儿童节快乐，永葆童心。", quoteEn: "" },
    "dog":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "西南", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "儿童节快乐，永葆童心。", quoteEn: "" },
    "pig":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 9, direction: "西南", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "儿童节快乐，永葆童心。", quoteEn: "" }
  },

  "2026-06-02": {
    "rat":     { score: 60, color: "#5B8299", colorName: "蓝色", number: 1, direction: "正西", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "内心丰盈者独行也众", quoteEn: "" },
    "ox":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "正西", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心若不动风又奈何", quoteEn: "" },
    "tiger":     { score: 80, color: "#5E825E", colorName: "绿色", number: 3, direction: "正西", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "淡定从容是最好的状态", quoteEn: "" },
    "rabbit":     { score: 90, color: "#5E825E", colorName: "绿色", number: 4, direction: "正西", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "修心养性", quoteEn: "" },
    "dragon":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 4, direction: "正西", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "一念放下万般自在", quoteEn: "" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 3, direction: "正西", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心简单世界就简单", quoteEn: "" },
    "horse":     { score: 85, color: "#B8665E", colorName: "红色", number: 3, direction: "正西", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "温柔对待这个世界", quoteEn: "" },
    "goat":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 2, direction: "正西", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "与自己和解", quoteEn: "" },
    "monkey":     { score: 70, color: "#D4AF37", colorName: "金色", number: 4, direction: "正西", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "勇敢出发", quoteEn: "" },
    "rooster":     { score: 70, color: "#D4AF37", colorName: "金色", number: 5, direction: "正西", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "想做就去做", quoteEn: "" },
    "dog":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "正西", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "行动是最好的答案", quoteEn: "" },
    "pig":     { score: 80, color: "#5B8299", colorName: "蓝色", number: 1, direction: "正西", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "迈出第一步", quoteEn: "" }
  },

  "2026-06-03": {
    "rat":     { score: 80, color: "#5B8299", colorName: "蓝色", number: 2, direction: "西北", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心若不动风又奈何", quoteEn: "" },
    "ox":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "西北", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "淡定从容是最好的状态", quoteEn: "" },
    "tiger":     { score: 55, color: "#5E825E", colorName: "绿色", number: 4, direction: "西北", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "修心养性", quoteEn: "" },
    "rabbit":     { score: 70, color: "#5E825E", colorName: "绿色", number: 5, direction: "西北", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "一念放下万般自在", quoteEn: "" },
    "dragon":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 5, direction: "西北", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心简单世界就简单", quoteEn: "" },
    "snake":     { score: 95, color: "#B8665E", colorName: "红色", number: 4, direction: "西北", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "温柔对待这个世界", quoteEn: "" },
    "horse":     { score: 80, color: "#B8665E", colorName: "红色", number: 4, direction: "西北", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "与自己和解", quoteEn: "" },
    "goat":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 3, direction: "西北", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "勇敢出发", quoteEn: "" },
    "monkey":     { score: 70, color: "#D4AF37", colorName: "金色", number: 5, direction: "西北", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "想做就去做", quoteEn: "" },
    "rooster":     { score: 70, color: "#D4AF37", colorName: "金色", number: 6, direction: "西北", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "行动是最好的答案", quoteEn: "" },
    "dog":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 2, direction: "西北", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "迈出第一步", quoteEn: "" },
    "pig":     { score: 55, color: "#5B8299", colorName: "蓝色", number: 2, direction: "西北", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "趁年轻去追梦", quoteEn: "" }
  },

  "2026-06-04": {
    "rat":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 3, direction: "西北", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "淡定从容是最好的状态", quoteEn: "" },
    "ox":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 2, direction: "西北", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "修心养性", quoteEn: "" },
    "tiger":     { score: 70, color: "#5E825E", colorName: "绿色", number: 5, direction: "西北", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "一念放下万般自在", quoteEn: "" },
    "rabbit":     { score: 55, color: "#5E825E", colorName: "绿色", number: 6, direction: "西北", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心简单世界就简单", quoteEn: "" },
    "dragon":     { score: 85, color: "#9E8E6E", colorName: "棕色", number: 6, direction: "西北", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "温柔对待这个世界", quoteEn: "" },
    "snake":     { score: 90, color: "#B8665E", colorName: "红色", number: 5, direction: "西北", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "与自己和解", quoteEn: "" },
    "horse":     { score: 80, color: "#B8665E", colorName: "红色", number: 5, direction: "西北", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "勇敢出发", quoteEn: "" },
    "goat":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 4, direction: "西北", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "想做就去做", quoteEn: "" },
    "monkey":     { score: 70, color: "#D4AF37", colorName: "金色", number: 6, direction: "西北", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "行动是最好的答案", quoteEn: "" },
    "rooster":     { score: 55, color: "#D4AF37", colorName: "金色", number: 7, direction: "西北", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "迈出第一步", quoteEn: "" },
    "dog":     { score: 60, color: "#9E8E6E", colorName: "棕色", number: 3, direction: "西北", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "趁年轻去追梦", quoteEn: "" },
    "pig":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 3, direction: "西北", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "乘风破浪", quoteEn: "" }
  },

  "2026-06-05": {
    "rat":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 4, direction: "正北", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "芒种忙种，有收有种。", quoteEn: "" },
    "ox":     { score: 65, color: "#9E8E6E", colorName: "棕色", number: 3, direction: "正北", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "芒种忙种，有收有种。", quoteEn: "" },
    "tiger":     { score: 80, color: "#5E825E", colorName: "绿色", number: 6, direction: "正北", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "芒种忙种，有收有种。", quoteEn: "" },
    "rabbit":     { score: 85, color: "#5E825E", colorName: "绿色", number: 7, direction: "正北", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "芒种忙种，有收有种。", quoteEn: "" },
    "dragon":     { score: 60, color: "#9E8E6E", colorName: "棕色", number: 7, direction: "正北", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "芒种忙种，有收有种。", quoteEn: "" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 6, direction: "正北", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "芒种忙种，有收有种。", quoteEn: "" },
    "horse":     { score: 80, color: "#B8665E", colorName: "红色", number: 6, direction: "正北", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "芒种忙种，有收有种。", quoteEn: "" },
    "goat":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 5, direction: "正北", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "芒种忙种，有收有种。", quoteEn: "" },
    "monkey":     { score: 70, color: "#D4AF37", colorName: "金色", number: 7, direction: "正北", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "芒种忙种，有收有种。", quoteEn: "" },
    "rooster":     { score: 60, color: "#D4AF37", colorName: "金色", number: 8, direction: "正北", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "芒种忙种，有收有种。", quoteEn: "" },
    "dog":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 4, direction: "正北", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "芒种忙种，有收有种。", quoteEn: "" },
    "pig":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 4, direction: "正北", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "芒种忙种，有收有种。", quoteEn: "" }
  },

  "2026-06-06": {
    "rat":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 5, direction: "东北", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "一念放下万般自在", quoteEn: "" },
    "ox":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 4, direction: "东北", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心简单世界就简单", quoteEn: "" },
    "tiger":     { score: 85, color: "#5E825E", colorName: "绿色", number: 7, direction: "东北", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "温柔对待这个世界", quoteEn: "" },
    "rabbit":     { score: 80, color: "#5E825E", colorName: "绿色", number: 8, direction: "东北", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "与自己和解", quoteEn: "" },
    "dragon":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 8, direction: "东北", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "勇敢出发", quoteEn: "" },
    "snake":     { score: 55, color: "#B8665E", colorName: "红色", number: 7, direction: "东北", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "想做就去做", quoteEn: "" },
    "horse":     { score: 70, color: "#B8665E", colorName: "红色", number: 7, direction: "东北", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "行动是最好的答案", quoteEn: "" },
    "goat":     { score: 90, color: "#9E8E6E", colorName: "棕色", number: 6, direction: "东北", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "迈出第一步", quoteEn: "" },
    "monkey":     { score: 55, color: "#D4AF37", colorName: "金色", number: 8, direction: "东北", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "趁年轻去追梦", quoteEn: "" },
    "rooster":     { score: 70, color: "#D4AF37", colorName: "金色", number: 9, direction: "东北", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "乘风破浪", quoteEn: "" },
    "dog":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 5, direction: "东北", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "逆风翻盘", quoteEn: "" },
    "pig":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 5, direction: "东北", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "越挫越勇", quoteEn: "" }
  },

  "2026-06-07": {
    "rat":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 6, direction: "东北", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心简单世界就简单", quoteEn: "" },
    "ox":     { score: 85, color: "#9E8E6E", colorName: "棕色", number: 5, direction: "东北", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "温柔对待这个世界", quoteEn: "" },
    "tiger":     { score: 70, color: "#5E825E", colorName: "绿色", number: 8, direction: "东北", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "与自己和解", quoteEn: "" },
    "rabbit":     { score: 55, color: "#5E825E", colorName: "绿色", number: 9, direction: "东北", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "勇敢出发", quoteEn: "" },
    "dragon":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "东北", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "想做就去做", quoteEn: "" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 8, direction: "东北", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "行动是最好的答案", quoteEn: "" },
    "horse":     { score: 55, color: "#B8665E", colorName: "红色", number: 8, direction: "东北", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "迈出第一步", quoteEn: "" },
    "goat":     { score: 60, color: "#9E8E6E", colorName: "棕色", number: 7, direction: "东北", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "趁年轻去追梦", quoteEn: "" },
    "monkey":     { score: 90, color: "#D4AF37", colorName: "金色", number: 9, direction: "东北", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "乘风破浪", quoteEn: "" },
    "rooster":     { score: 80, color: "#D4AF37", colorName: "金色", number: 1, direction: "东北", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "逆风翻盘", quoteEn: "" },
    "dog":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 6, direction: "东北", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "越挫越勇", quoteEn: "" },
    "pig":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 6, direction: "东北", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "敢于重新开始", quoteEn: "" }
  },

  "2026-06-08": {
    "rat":     { score: 85, color: "#5B8299", colorName: "蓝色", number: 7, direction: "正东", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "温柔对待这个世界", quoteEn: "" },
    "ox":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 6, direction: "正东", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "与自己和解", quoteEn: "" },
    "tiger":     { score: 70, color: "#5E825E", colorName: "绿色", number: 9, direction: "正东", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "勇敢出发", quoteEn: "" },
    "rabbit":     { score: 70, color: "#5E825E", colorName: "绿色", number: 1, direction: "正东", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "想做就去做", quoteEn: "" },
    "dragon":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "正东", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "行动是最好的答案", quoteEn: "" },
    "snake":     { score: 80, color: "#B8665E", colorName: "红色", number: 9, direction: "正东", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "迈出第一步", quoteEn: "" },
    "horse":     { score: 60, color: "#B8665E", colorName: "红色", number: 9, direction: "正东", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "趁年轻去追梦", quoteEn: "" },
    "goat":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 8, direction: "正东", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "乘风破浪", quoteEn: "" },
    "monkey":     { score: 80, color: "#D4AF37", colorName: "金色", number: 1, direction: "正东", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "逆风翻盘", quoteEn: "" },
    "rooster":     { score: 90, color: "#D4AF37", colorName: "金色", number: 2, direction: "正东", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "越挫越勇", quoteEn: "" },
    "dog":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 7, direction: "正东", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "敢于重新开始", quoteEn: "" },
    "pig":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 7, direction: "正东", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "去成为你想成为的人", quoteEn: "" }
  },

  "2026-06-09": {
    "rat":     { score: 80, color: "#5B8299", colorName: "蓝色", number: 8, direction: "东南", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "与自己和解", quoteEn: "" },
    "ox":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 7, direction: "东南", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "勇敢出发", quoteEn: "" },
    "tiger":     { score: 70, color: "#5E825E", colorName: "绿色", number: 1, direction: "东南", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "想做就去做", quoteEn: "" },
    "rabbit":     { score: 70, color: "#5E825E", colorName: "绿色", number: 2, direction: "东南", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "行动是最好的答案", quoteEn: "" },
    "dragon":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 2, direction: "东南", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "迈出第一步", quoteEn: "" },
    "snake":     { score: 55, color: "#B8665E", colorName: "红色", number: 1, direction: "东南", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "趁年轻去追梦", quoteEn: "" },
    "horse":     { score: 80, color: "#B8665E", colorName: "红色", number: 1, direction: "东南", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "乘风破浪", quoteEn: "" },
    "goat":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "东南", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "逆风翻盘", quoteEn: "" },
    "monkey":     { score: 55, color: "#D4AF37", colorName: "金色", number: 2, direction: "东南", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "越挫越勇", quoteEn: "" },
    "rooster":     { score: 70, color: "#D4AF37", colorName: "金色", number: 3, direction: "东南", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "敢于重新开始", quoteEn: "" },
    "dog":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 8, direction: "东南", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "去成为你想成为的人", quoteEn: "" },
    "pig":     { score: 95, color: "#5B8299", colorName: "蓝色", number: 8, direction: "东南", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "不要等，现在就出发", quoteEn: "" }
  },

  "2026-06-10": {
    "rat":     { score: 55, color: "#5B8299", colorName: "蓝色", number: 9, direction: "正东", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "勇敢出发", quoteEn: "" },
    "ox":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 8, direction: "正东", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "想做就去做", quoteEn: "" },
    "tiger":     { score: 70, color: "#5E825E", colorName: "绿色", number: 2, direction: "正东", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "行动是最好的答案", quoteEn: "" },
    "rabbit":     { score: 70, color: "#5E825E", colorName: "绿色", number: 3, direction: "正东", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "迈出第一步", quoteEn: "" },
    "dragon":     { score: 60, color: "#9E8E6E", colorName: "棕色", number: 3, direction: "正东", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "趁年轻去追梦", quoteEn: "" },
    "snake":     { score: 80, color: "#B8665E", colorName: "红色", number: 2, direction: "正东", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "乘风破浪", quoteEn: "" },
    "horse":     { score: 80, color: "#B8665E", colorName: "红色", number: 2, direction: "正东", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "逆风翻盘", quoteEn: "" },
    "goat":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "正东", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "越挫越勇", quoteEn: "" },
    "monkey":     { score: 70, color: "#D4AF37", colorName: "金色", number: 3, direction: "正东", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "敢于重新开始", quoteEn: "" },
    "rooster":     { score: 55, color: "#D4AF37", colorName: "金色", number: 4, direction: "正东", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "去成为你想成为的人", quoteEn: "" },
    "dog":     { score: 85, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "正东", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "不要等，现在就出发", quoteEn: "" },
    "pig":     { score: 80, color: "#5B8299", colorName: "蓝色", number: 9, direction: "正东", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "行动力决定未来", quoteEn: "" }
  },

  "2026-06-11": {
    "rat":     { score: 80, color: "#5B8299", colorName: "蓝色", number: 1, direction: "东南", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "想做就去做", quoteEn: "" },
    "ox":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "东南", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "行动是最好的答案", quoteEn: "" },
    "tiger":     { score: 70, color: "#5E825E", colorName: "绿色", number: 3, direction: "东南", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "迈出第一步", quoteEn: "" },
    "rabbit":     { score: 60, color: "#5E825E", colorName: "绿色", number: 4, direction: "东南", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "趁年轻去追梦", quoteEn: "" },
    "dragon":     { score: 65, color: "#9E8E6E", colorName: "棕色", number: 4, direction: "东南", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "乘风破浪", quoteEn: "" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 3, direction: "东南", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "逆风翻盘", quoteEn: "" },
    "horse":     { score: 70, color: "#B8665E", colorName: "红色", number: 3, direction: "东南", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "越挫越勇", quoteEn: "" },
    "goat":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 2, direction: "东南", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "敢于重新开始", quoteEn: "" },
    "monkey":     { score: 80, color: "#D4AF37", colorName: "金色", number: 4, direction: "东南", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "去成为你想成为的人", quoteEn: "" },
    "rooster":     { score: 85, color: "#D4AF37", colorName: "金色", number: 5, direction: "东南", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "不要等，现在就出发", quoteEn: "" },
    "dog":     { score: 60, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "东南", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "行动力决定未来", quoteEn: "" },
    "pig":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 1, direction: "东南", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "去做就对了", quoteEn: "" }
  },

  "2026-06-12": {
    "rat":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 2, direction: "东南", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "行动是最好的答案", quoteEn: "" },
    "ox":     { score: 90, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "东南", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "迈出第一步", quoteEn: "" },
    "tiger":     { score: 55, color: "#5E825E", colorName: "绿色", number: 4, direction: "东南", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "趁年轻去追梦", quoteEn: "" },
    "rabbit":     { score: 70, color: "#5E825E", colorName: "绿色", number: 5, direction: "东南", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "乘风破浪", quoteEn: "" },
    "dragon":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 5, direction: "东南", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "逆风翻盘", quoteEn: "" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 4, direction: "东南", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "越挫越勇", quoteEn: "" },
    "horse":     { score: 70, color: "#B8665E", colorName: "红色", number: 4, direction: "东南", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "敢于重新开始", quoteEn: "" },
    "goat":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 3, direction: "东南", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "去成为你想成为的人", quoteEn: "" },
    "monkey":     { score: 85, color: "#D4AF37", colorName: "金色", number: 5, direction: "东南", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "不要等，现在就出发", quoteEn: "" },
    "rooster":     { score: 80, color: "#D4AF37", colorName: "金色", number: 6, direction: "东南", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "行动力决定未来", quoteEn: "" },
    "dog":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 2, direction: "东南", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "去做就对了", quoteEn: "" },
    "pig":     { score: 55, color: "#5B8299", colorName: "蓝色", number: 2, direction: "东南", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "勇敢的人先享受世界", quoteEn: "" }
  },

  "2026-06-13": {
    "rat":     { score: 55, color: "#5B8299", colorName: "蓝色", number: 3, direction: "正南", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "迈出第一步", quoteEn: "" },
    "ox":     { score: 60, color: "#9E8E6E", colorName: "棕色", number: 2, direction: "正南", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "趁年轻去追梦", quoteEn: "" },
    "tiger":     { score: 80, color: "#5E825E", colorName: "绿色", number: 5, direction: "正南", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "乘风破浪", quoteEn: "" },
    "rabbit":     { score: 70, color: "#5E825E", colorName: "绿色", number: 6, direction: "正南", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "逆风翻盘", quoteEn: "" },
    "dragon":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 6, direction: "正南", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "越挫越勇", quoteEn: "" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 5, direction: "正南", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "敢于重新开始", quoteEn: "" },
    "horse":     { score: 55, color: "#B8665E", colorName: "红色", number: 5, direction: "正南", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "去成为你想成为的人", quoteEn: "" },
    "goat":     { score: 85, color: "#9E8E6E", colorName: "棕色", number: 4, direction: "正南", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "不要等，现在就出发", quoteEn: "" },
    "monkey":     { score: 80, color: "#D4AF37", colorName: "金色", number: 6, direction: "正南", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "行动力决定未来", quoteEn: "" },
    "rooster":     { score: 80, color: "#D4AF37", colorName: "金色", number: 7, direction: "正南", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "去做就对了", quoteEn: "" },
    "dog":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 3, direction: "正南", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "勇敢的人先享受世界", quoteEn: "" },
    "pig":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 3, direction: "正南", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "路在脚下", quoteEn: "" }
  },

  "--help": {
    "rat":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 6, direction: "西北", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "", quoteEn: "" },
    "ox":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 5, direction: "西北", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "", quoteEn: "" },
    "tiger":     { score: 85, color: "#5E825E", colorName: "绿色", number: 8, direction: "西北", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "", quoteEn: "" },
    "rabbit":     { score: 80, color: "#5E825E", colorName: "绿色", number: 9, direction: "西北", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "", quoteEn: "" },
    "dragon":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "西北", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "", quoteEn: "" },
    "snake":     { score: 55, color: "#B8665E", colorName: "红色", number: 8, direction: "西北", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "", quoteEn: "" },
    "horse":     { score: 70, color: "#B8665E", colorName: "红色", number: 8, direction: "西北", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "", quoteEn: "" },
    "goat":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 7, direction: "西北", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "", quoteEn: "" },
    "monkey":     { score: 55, color: "#D4AF37", colorName: "金色", number: 9, direction: "西北", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "", quoteEn: "" },
    "rooster":     { score: 80, color: "#D4AF37", colorName: "金色", number: 1, direction: "西北", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "", quoteEn: "" },
    "dog":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 6, direction: "西北", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "", quoteEn: "" },
    "pig":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 6, direction: "西北", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "", quoteEn: "" }
  },

  "2026-06-14": {
    "rat":     { score: 60, color: "#5B8299", colorName: "蓝色", number: 4, direction: "西南", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "趁年轻去追梦", quoteEn: "" },
    "ox":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 3, direction: "西南", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "乘风破浪", quoteEn: "" },
    "tiger":     { score: 70, color: "#5E825E", colorName: "绿色", number: 6, direction: "西南", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "逆风翻盘", quoteEn: "" },
    "rabbit":     { score: 80, color: "#5E825E", colorName: "绿色", number: 7, direction: "西南", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "越挫越勇", quoteEn: "" },
    "dragon":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 7, direction: "西南", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "敢于重新开始", quoteEn: "" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 6, direction: "西南", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "去成为你想成为的人", quoteEn: "" },
    "horse":     { score: 85, color: "#B8665E", colorName: "红色", number: 6, direction: "西南", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "不要等，现在就出发", quoteEn: "" },
    "goat":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 5, direction: "西南", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "行动力决定未来", quoteEn: "" },
    "monkey":     { score: 80, color: "#D4AF37", colorName: "金色", number: 7, direction: "西南", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "去做就对了", quoteEn: "" },
    "rooster":     { score: 80, color: "#D4AF37", colorName: "金色", number: 8, direction: "西南", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "勇敢的人先享受世界", quoteEn: "" },
    "dog":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 4, direction: "西南", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "路在脚下", quoteEn: "" },
    "pig":     { score: 80, color: "#5B8299", colorName: "蓝色", number: 4, direction: "西南", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "向前看别回头", quoteEn: "" }
  },

  "2026-06-15": {
    "rat":     { score: 90, color: "#5B8299", colorName: "蓝色", number: 5, direction: "西南", pair: "丑",     good: ["栽种","入学","祈福"],        avoid: ["搬家","动土"],       quote: "乘风破浪", quoteEn: "" },
    "ox":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 4, direction: "西南", pair: "子",     good: ["栽种","入学","祈福"],        avoid: ["搬家","动土"],       quote: "逆风翻盘", quoteEn: "" },
    "tiger":     { score: 55, color: "#5E825E", colorName: "绿色", number: 7, direction: "西南", pair: "亥",     good: ["栽种","入学","祈福"],        avoid: ["搬家","动土"],       quote: "越挫越勇", quoteEn: "" },
    "rabbit":     { score: 70, color: "#5E825E", colorName: "绿色", number: 8, direction: "西南", pair: "戌",     good: ["栽种","入学","祈福"],        avoid: ["搬家","动土"],       quote: "敢于重新开始", quoteEn: "" },
    "dragon":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 8, direction: "西南", pair: "酉",     good: ["栽种","入学","祈福"],        avoid: ["搬家","动土"],       quote: "去成为你想成为的人", quoteEn: "" },
    "snake":     { score: 85, color: "#B8665E", colorName: "红色", number: 7, direction: "西南", pair: "申",     good: ["栽种","入学","祈福"],        avoid: ["搬家","动土"],       quote: "不要等，现在就出发", quoteEn: "" },
    "horse":     { score: 70, color: "#B8665E", colorName: "红色", number: 7, direction: "西南", pair: "未",     good: ["栽种","入学","祈福"],        avoid: ["搬家","动土"],       quote: "行动力决定未来", quoteEn: "" },
    "goat":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 6, direction: "西南", pair: "午",     good: ["栽种","入学","祈福"],        avoid: ["搬家","动土"],       quote: "去做就对了", quoteEn: "" },
    "monkey":     { score: 70, color: "#D4AF37", colorName: "金色", number: 8, direction: "西南", pair: "巳",     good: ["栽种","入学","祈福"],        avoid: ["搬家","动土"],       quote: "勇敢的人先享受世界", quoteEn: "" },
    "rooster":     { score: 70, color: "#D4AF37", colorName: "金色", number: 9, direction: "西南", pair: "辰",     good: ["栽种","入学","祈福"],        avoid: ["搬家","动土"],       quote: "路在脚下", quoteEn: "" },
    "dog":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 5, direction: "西南", pair: "卯",     good: ["栽种","入学","祈福"],        avoid: ["搬家","动土"],       quote: "向前看别回头", quoteEn: "" },
    "pig":     { score: 55, color: "#5B8299", colorName: "蓝色", number: 5, direction: "西南", pair: "寅",     good: ["栽种","入学","祈福"],        avoid: ["搬家","动土"],       quote: "敢于突破自己", quoteEn: "" }
  },

  "2026-06-16": {
    "rat":     { score: 80, color: "#5B8299", colorName: "蓝色", number: 6, direction: "正西", pair: "丑",     good: ["栽种","入学","祈福"],        avoid: ["搬家","动土"],       quote: "逆风翻盘", quoteEn: "" },
    "ox":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 5, direction: "正西", pair: "子",     good: ["栽种","入学","祈福"],        avoid: ["搬家","动土"],       quote: "越挫越勇", quoteEn: "" },
    "tiger":     { score: 70, color: "#5E825E", colorName: "绿色", number: 8, direction: "正西", pair: "亥",     good: ["栽种","入学","祈福"],        avoid: ["搬家","动土"],       quote: "敢于重新开始", quoteEn: "" },
    "rabbit":     { score: 55, color: "#5E825E", colorName: "绿色", number: 9, direction: "正西", pair: "戌",     good: ["栽种","入学","祈福"],        avoid: ["搬家","动土"],       quote: "去成为你想成为的人", quoteEn: "" },
    "dragon":     { score: 85, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "正西", pair: "酉",     good: ["栽种","入学","祈福"],        avoid: ["搬家","动土"],       quote: "不要等，现在就出发", quoteEn: "" },
    "snake":     { score: 80, color: "#B8665E", colorName: "红色", number: 8, direction: "正西", pair: "申",     good: ["栽种","入学","祈福"],        avoid: ["搬家","动土"],       quote: "行动力决定未来", quoteEn: "" },
    "horse":     { score: 70, color: "#B8665E", colorName: "红色", number: 8, direction: "正西", pair: "未",     good: ["栽种","入学","祈福"],        avoid: ["搬家","动土"],       quote: "去做就对了", quoteEn: "" },
    "goat":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 7, direction: "正西", pair: "午",     good: ["栽种","入学","祈福"],        avoid: ["搬家","动土"],       quote: "勇敢的人先享受世界", quoteEn: "" },
    "monkey":     { score: 70, color: "#D4AF37", colorName: "金色", number: 9, direction: "正西", pair: "巳",     good: ["栽种","入学","祈福"],        avoid: ["搬家","动土"],       quote: "路在脚下", quoteEn: "" },
    "rooster":     { score: 55, color: "#D4AF37", colorName: "金色", number: 1, direction: "正西", pair: "辰",     good: ["栽种","入学","祈福"],        avoid: ["搬家","动土"],       quote: "向前看别回头", quoteEn: "" },
    "dog":     { score: 60, color: "#9E8E6E", colorName: "棕色", number: 6, direction: "正西", pair: "卯",     good: ["栽种","入学","祈福"],        avoid: ["搬家","动土"],       quote: "敢于突破自己", quoteEn: "" },
    "pig":     { score: 80, color: "#5B8299", colorName: "蓝色", number: 6, direction: "正西", pair: "寅",     good: ["栽种","入学","祈福"],        avoid: ["搬家","动土"],       quote: "逆风飞翔", quoteEn: "" }
  },

  "2026-06-17": {
    "rat":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 7, direction: "西北", pair: "丑",     good: ["开业","交易","出行"],        avoid: ["安葬","诉讼"],       quote: "越挫越勇", quoteEn: "" },
    "ox":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 6, direction: "西北", pair: "子",     good: ["开业","交易","出行"],        avoid: ["安葬","诉讼"],       quote: "敢于重新开始", quoteEn: "" },
    "tiger":     { score: 90, color: "#5E825E", colorName: "绿色", number: 9, direction: "西北", pair: "亥",     good: ["开业","交易","出行"],        avoid: ["安葬","诉讼"],       quote: "去成为你想成为的人", quoteEn: "" },
    "rabbit":     { score: 95, color: "#5E825E", colorName: "绿色", number: 1, direction: "西北", pair: "戌",     good: ["开业","交易","出行"],        avoid: ["安葬","诉讼"],       quote: "不要等，现在就出发", quoteEn: "" },
    "dragon":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "西北", pair: "酉",     good: ["开业","交易","出行"],        avoid: ["安葬","诉讼"],       quote: "行动力决定未来", quoteEn: "" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 9, direction: "西北", pair: "申",     good: ["开业","交易","出行"],        avoid: ["安葬","诉讼"],       quote: "去做就对了", quoteEn: "" },
    "horse":     { score: 80, color: "#B8665E", colorName: "红色", number: 9, direction: "西北", pair: "未",     good: ["开业","交易","出行"],        avoid: ["安葬","诉讼"],       quote: "勇敢的人先享受世界", quoteEn: "" },
    "goat":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 8, direction: "西北", pair: "午",     good: ["开业","交易","出行"],        avoid: ["安葬","诉讼"],       quote: "路在脚下", quoteEn: "" },
    "monkey":     { score: 70, color: "#D4AF37", colorName: "金色", number: 1, direction: "西北", pair: "巳",     good: ["开业","交易","出行"],        avoid: ["安葬","诉讼"],       quote: "向前看别回头", quoteEn: "" },
    "rooster":     { score: 60, color: "#D4AF37", colorName: "金色", number: 2, direction: "西北", pair: "辰",     good: ["开业","交易","出行"],        avoid: ["安葬","诉讼"],       quote: "敢于突破自己", quoteEn: "" },
    "dog":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 7, direction: "西北", pair: "卯",     good: ["开业","交易","出行"],        avoid: ["安葬","诉讼"],       quote: "逆风飞翔", quoteEn: "" },
    "pig":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 7, direction: "西北", pair: "寅",     good: ["开业","交易","出行"],        avoid: ["安葬","诉讼"],       quote: "迎难而上", quoteEn: "" }
  },

  "2026-06-18": {
    "rat":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 8, direction: "西北", pair: "丑",     good: ["开业","交易","出行"],        avoid: ["安葬","诉讼"],       quote: "敢于重新开始", quoteEn: "" },
    "ox":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 7, direction: "西北", pair: "子",     good: ["开业","交易","出行"],        avoid: ["安葬","诉讼"],       quote: "去成为你想成为的人", quoteEn: "" },
    "tiger":     { score: 95, color: "#5E825E", colorName: "绿色", number: 1, direction: "西北", pair: "亥",     good: ["开业","交易","出行"],        avoid: ["安葬","诉讼"],       quote: "不要等，现在就出发", quoteEn: "" },
    "rabbit":     { score: 90, color: "#5E825E", colorName: "绿色", number: 2, direction: "西北", pair: "戌",     good: ["开业","交易","出行"],        avoid: ["安葬","诉讼"],       quote: "行动力决定未来", quoteEn: "" },
    "dragon":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 2, direction: "西北", pair: "酉",     good: ["开业","交易","出行"],        avoid: ["安葬","诉讼"],       quote: "去做就对了", quoteEn: "" },
    "snake":     { score: 55, color: "#B8665E", colorName: "红色", number: 1, direction: "西北", pair: "申",     good: ["开业","交易","出行"],        avoid: ["安葬","诉讼"],       quote: "勇敢的人先享受世界", quoteEn: "" },
    "horse":     { score: 70, color: "#B8665E", colorName: "红色", number: 1, direction: "西北", pair: "未",     good: ["开业","交易","出行"],        avoid: ["安葬","诉讼"],       quote: "路在脚下", quoteEn: "" },
    "goat":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "西北", pair: "午",     good: ["开业","交易","出行"],        avoid: ["安葬","诉讼"],       quote: "向前看别回头", quoteEn: "" },
    "monkey":     { score: 55, color: "#D4AF37", colorName: "金色", number: 2, direction: "西北", pair: "巳",     good: ["开业","交易","出行"],        avoid: ["安葬","诉讼"],       quote: "敢于突破自己", quoteEn: "" },
    "rooster":     { score: 70, color: "#D4AF37", colorName: "金色", number: 3, direction: "西北", pair: "辰",     good: ["开业","交易","出行"],        avoid: ["安葬","诉讼"],       quote: "逆风飞翔", quoteEn: "" },
    "dog":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 8, direction: "西北", pair: "卯",     good: ["开业","交易","出行"],        avoid: ["安葬","诉讼"],       quote: "迎难而上", quoteEn: "" },
    "pig":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 8, direction: "西北", pair: "寅",     good: ["开业","交易","出行"],        avoid: ["安葬","诉讼"],       quote: "勇者无畏", quoteEn: "" }
  },

  "2026-06-19": {
    "rat":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 9, direction: "正北", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "去成为你想成为的人", quoteEn: "" },
    "ox":     { score: 85, color: "#9E8E6E", colorName: "棕色", number: 8, direction: "正北", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "不要等，现在就出发", quoteEn: "" },
    "tiger":     { score: 70, color: "#5E825E", colorName: "绿色", number: 2, direction: "正北", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "行动力决定未来", quoteEn: "" },
    "rabbit":     { score: 55, color: "#5E825E", colorName: "绿色", number: 3, direction: "正北", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "去做就对了", quoteEn: "" },
    "dragon":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 3, direction: "正北", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "勇敢的人先享受世界", quoteEn: "" },
    "snake":     { score: 80, color: "#B8665E", colorName: "红色", number: 2, direction: "正北", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "路在脚下", quoteEn: "" },
    "horse":     { score: 60, color: "#B8665E", colorName: "红色", number: 2, direction: "正北", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "向前看别回头", quoteEn: "" },
    "goat":     { score: 60, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "正北", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "敢于突破自己", quoteEn: "" },
    "monkey":     { score: 80, color: "#D4AF37", colorName: "金色", number: 3, direction: "正北", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "逆风飞翔", quoteEn: "" },
    "rooster":     { score: 70, color: "#D4AF37", colorName: "金色", number: 4, direction: "正北", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "迎难而上", quoteEn: "" },
    "dog":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "正北", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "勇者无畏", quoteEn: "" },
    "pig":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 9, direction: "正北", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "道法自然", quoteEn: "" }
  },

  "2026-06-20": {
    "rat":     { score: 85, color: "#5B8299", colorName: "蓝色", number: 1, direction: "东北", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "不要等，现在就出发", quoteEn: "" },
    "ox":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "东北", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "行动力决定未来", quoteEn: "" },
    "tiger":     { score: 70, color: "#5E825E", colorName: "绿色", number: 3, direction: "东北", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "去做就对了", quoteEn: "" },
    "rabbit":     { score: 70, color: "#5E825E", colorName: "绿色", number: 4, direction: "东北", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "勇敢的人先享受世界", quoteEn: "" },
    "dragon":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 4, direction: "东北", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "路在脚下", quoteEn: "" },
    "snake":     { score: 90, color: "#B8665E", colorName: "红色", number: 3, direction: "东北", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "向前看别回头", quoteEn: "" },
    "horse":     { score: 70, color: "#B8665E", colorName: "红色", number: 3, direction: "东北", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "敢于突破自己", quoteEn: "" },
    "goat":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 2, direction: "东北", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "逆风飞翔", quoteEn: "" },
    "monkey":     { score: 70, color: "#D4AF37", colorName: "金色", number: 4, direction: "东北", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "迎难而上", quoteEn: "" },
    "rooster":     { score: 80, color: "#D4AF37", colorName: "金色", number: 5, direction: "东北", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "勇者无畏", quoteEn: "" },
    "dog":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "东北", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "道法自然", quoteEn: "" },
    "pig":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 1, direction: "东北", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "万物皆有定时", quoteEn: "" }
  },

  "2026-06-21": {
    "rat":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 2, direction: "东北", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "阳极阴生，昼长夜短。", quoteEn: "" },
    "ox":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "东北", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "阳极阴生，昼长夜短。", quoteEn: "" },
    "tiger":     { score: 70, color: "#5E825E", colorName: "绿色", number: 4, direction: "东北", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "阳极阴生，昼长夜短。", quoteEn: "" },
    "rabbit":     { score: 70, color: "#5E825E", colorName: "绿色", number: 5, direction: "东北", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "阳极阴生，昼长夜短。", quoteEn: "" },
    "dragon":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 5, direction: "东北", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "阳极阴生，昼长夜短。", quoteEn: "" },
    "snake":     { score: 55, color: "#B8665E", colorName: "红色", number: 4, direction: "东北", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "阳极阴生，昼长夜短。", quoteEn: "" },
    "horse":     { score: 80, color: "#B8665E", colorName: "红色", number: 4, direction: "东北", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "阳极阴生，昼长夜短。", quoteEn: "" },
    "goat":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 3, direction: "东北", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "阳极阴生，昼长夜短。", quoteEn: "" },
    "monkey":     { score: 55, color: "#D4AF37", colorName: "金色", number: 5, direction: "东北", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "阳极阴生，昼长夜短。", quoteEn: "" },
    "rooster":     { score: 70, color: "#D4AF37", colorName: "金色", number: 6, direction: "东北", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "阳极阴生，昼长夜短。", quoteEn: "" },
    "dog":     { score: 90, color: "#9E8E6E", colorName: "棕色", number: 2, direction: "东北", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "阳极阴生，昼长夜短。", quoteEn: "" },
    "pig":     { score: 85, color: "#5B8299", colorName: "蓝色", number: 2, direction: "东北", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "阳极阴生，昼长夜短。", quoteEn: "" }
  },

  "2026-06-22": {
    "rat":     { score: 55, color: "#5B8299", colorName: "蓝色", number: 3, direction: "正东", pair: "丑",     good: ["求财","投资","纳财"],        avoid: ["搬家","安床"],       quote: "去做就对了", quoteEn: "" },
    "ox":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 2, direction: "正东", pair: "子",     good: ["求财","投资","纳财"],        avoid: ["搬家","安床"],       quote: "勇敢的人先享受世界", quoteEn: "" },
    "tiger":     { score: 70, color: "#5E825E", colorName: "绿色", number: 5, direction: "正东", pair: "亥",     good: ["求财","投资","纳财"],        avoid: ["搬家","安床"],       quote: "路在脚下", quoteEn: "" },
    "rabbit":     { score: 70, color: "#5E825E", colorName: "绿色", number: 6, direction: "正东", pair: "戌",     good: ["求财","投资","纳财"],        avoid: ["搬家","安床"],       quote: "向前看别回头", quoteEn: "" },
    "dragon":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 6, direction: "正东", pair: "酉",     good: ["求财","投资","纳财"],        avoid: ["搬家","安床"],       quote: "敢于突破自己", quoteEn: "" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 5, direction: "正东", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "逆风飞翔", quoteEn: "" },
    "horse":     { score: 70, color: "#B8665E", colorName: "红色", number: 5, direction: "正东", pair: "未",     good: ["求财","投资","纳财"],        avoid: ["搬家","安床"],       quote: "迎难而上", quoteEn: "" },
    "goat":     { score: 90, color: "#9E8E6E", colorName: "棕色", number: 4, direction: "正东", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "勇者无畏", quoteEn: "" },
    "monkey":     { score: 70, color: "#D4AF37", colorName: "金色", number: 6, direction: "正东", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "道法自然", quoteEn: "" },
    "rooster":     { score: 55, color: "#D4AF37", colorName: "金色", number: 7, direction: "正东", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "万物皆有定时", quoteEn: "" },
    "dog":     { score: 95, color: "#9E8E6E", colorName: "棕色", number: 3, direction: "正东", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "春生夏长秋收冬藏", quoteEn: "" },
    "pig":     { score: 80, color: "#5B8299", colorName: "蓝色", number: 3, direction: "正东", pair: "寅",     good: ["求财","投资","纳财"],        avoid: ["搬家","安床"],       quote: "顺应天时", quoteEn: "" }
  },

  "2026-06-23": {
    "rat":     { score: 80, color: "#5B8299", colorName: "蓝色", number: 4, direction: "东南", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "勇敢的人先享受世界", quoteEn: "" },
    "ox":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 3, direction: "东南", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "路在脚下", quoteEn: "" },
    "tiger":     { score: 70, color: "#5E825E", colorName: "绿色", number: 6, direction: "东南", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "向前看别回头", quoteEn: "" },
    "rabbit":     { score: 60, color: "#5E825E", colorName: "绿色", number: 7, direction: "东南", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "敢于突破自己", quoteEn: "" },
    "dragon":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 7, direction: "东南", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "逆风飞翔", quoteEn: "" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 6, direction: "东南", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "迎难而上", quoteEn: "" },
    "horse":     { score: 70, color: "#B8665E", colorName: "红色", number: 6, direction: "东南", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "勇者无畏", quoteEn: "" },
    "goat":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 5, direction: "东南", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "道法自然", quoteEn: "" },
    "monkey":     { score: 90, color: "#D4AF37", colorName: "金色", number: 7, direction: "东南", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "万物皆有定时", quoteEn: "" },
    "rooster":     { score: 95, color: "#D4AF37", colorName: "金色", number: 8, direction: "东南", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "春生夏长秋收冬藏", quoteEn: "" },
    "dog":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 4, direction: "东南", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "顺应天时", quoteEn: "" },
    "pig":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 4, direction: "东南", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "花开有时", quoteEn: "" }
  },

  "2026-06-24": {
    "rat":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 5, direction: "东南", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "路在脚下", quoteEn: "" },
    "ox":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 4, direction: "东南", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "向前看别回头", quoteEn: "" },
    "tiger":     { score: 55, color: "#5E825E", colorName: "绿色", number: 7, direction: "东南", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "敢于突破自己", quoteEn: "" },
    "rabbit":     { score: 70, color: "#5E825E", colorName: "绿色", number: 8, direction: "东南", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "逆风飞翔", quoteEn: "" },
    "dragon":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 8, direction: "东南", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "迎难而上", quoteEn: "" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 7, direction: "东南", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "勇者无畏", quoteEn: "" },
    "horse":     { score: 70, color: "#B8665E", colorName: "红色", number: 7, direction: "东南", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "道法自然", quoteEn: "" },
    "goat":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 6, direction: "东南", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "万物皆有定时", quoteEn: "" },
    "monkey":     { score: 95, color: "#D4AF37", colorName: "金色", number: 8, direction: "东南", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "春生夏长秋收冬藏", quoteEn: "" },
    "rooster":     { score: 90, color: "#D4AF37", colorName: "金色", number: 9, direction: "东南", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "顺应天时", quoteEn: "" },
    "dog":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 5, direction: "东南", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "花开有时", quoteEn: "" },
    "pig":     { score: 55, color: "#5B8299", colorName: "蓝色", number: 5, direction: "东南", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "草木有本心", quoteEn: "" }
  },

  "2026-06-25": {
    "rat":     { score: 60, color: "#5B8299", colorName: "蓝色", number: 6, direction: "正南", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "向前看别回头", quoteEn: "" },
    "ox":     { score: 60, color: "#9E8E6E", colorName: "棕色", number: 5, direction: "正南", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "敢于突破自己", quoteEn: "" },
    "tiger":     { score: 80, color: "#5E825E", colorName: "绿色", number: 8, direction: "正南", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "逆风飞翔", quoteEn: "" },
    "rabbit":     { score: 70, color: "#5E825E", colorName: "绿色", number: 9, direction: "正南", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "迎难而上", quoteEn: "" },
    "dragon":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "正南", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "勇者无畏", quoteEn: "" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 8, direction: "正南", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "道法自然", quoteEn: "" },
    "horse":     { score: 55, color: "#B8665E", colorName: "红色", number: 8, direction: "正南", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "万物皆有定时", quoteEn: "" },
    "goat":     { score: 85, color: "#9E8E6E", colorName: "棕色", number: 7, direction: "正南", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "春生夏长秋收冬藏", quoteEn: "" },
    "monkey":     { score: 70, color: "#D4AF37", colorName: "金色", number: 9, direction: "正南", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "顺应天时", quoteEn: "" },
    "rooster":     { score: 70, color: "#D4AF37", colorName: "金色", number: 1, direction: "正南", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "花开有时", quoteEn: "" },
    "dog":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 6, direction: "正南", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "草木有本心", quoteEn: "" },
    "pig":     { score: 80, color: "#5B8299", colorName: "蓝色", number: 6, direction: "正南", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "天地有大美", quoteEn: "" }
  },

  "2026-06-26": {
    "rat":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 7, direction: "西南", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "敢于突破自己", quoteEn: "" },
    "ox":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 6, direction: "西南", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "逆风飞翔", quoteEn: "" },
    "tiger":     { score: 70, color: "#5E825E", colorName: "绿色", number: 9, direction: "西南", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "迎难而上", quoteEn: "" },
    "rabbit":     { score: 80, color: "#5E825E", colorName: "绿色", number: 1, direction: "西南", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "勇者无畏", quoteEn: "" },
    "dragon":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "西南", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "道法自然", quoteEn: "" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 9, direction: "西南", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "万物皆有定时", quoteEn: "" },
    "horse":     { score: 85, color: "#B8665E", colorName: "红色", number: 9, direction: "西南", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "春生夏长秋收冬藏", quoteEn: "" },
    "goat":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 8, direction: "西南", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "顺应天时", quoteEn: "" },
    "monkey":     { score: 70, color: "#D4AF37", colorName: "金色", number: 1, direction: "西南", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "花开有时", quoteEn: "" },
    "rooster":     { score: 70, color: "#D4AF37", colorName: "金色", number: 2, direction: "西南", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "草木有本心", quoteEn: "" },
    "dog":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 7, direction: "西南", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "天地有大美", quoteEn: "" },
    "pig":     { score: 90, color: "#5B8299", colorName: "蓝色", number: 7, direction: "西南", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "静水流深", quoteEn: "" }
  },

  "2026-06-27": {
    "rat":     { score: 80, color: "#5B8299", colorName: "蓝色", number: 8, direction: "西南", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "逆风飞翔", quoteEn: "" },
    "ox":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 7, direction: "西南", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "迎难而上", quoteEn: "" },
    "tiger":     { score: 60, color: "#5E825E", colorName: "绿色", number: 1, direction: "西南", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "勇者无畏", quoteEn: "" },
    "rabbit":     { score: 80, color: "#5E825E", colorName: "绿色", number: 2, direction: "西南", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "道法自然", quoteEn: "" },
    "dragon":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 2, direction: "西南", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "万物皆有定时", quoteEn: "" },
    "snake":     { score: 85, color: "#B8665E", colorName: "红色", number: 1, direction: "西南", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "春生夏长秋收冬藏", quoteEn: "" },
    "horse":     { score: 70, color: "#B8665E", colorName: "红色", number: 1, direction: "西南", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "顺应天时", quoteEn: "" },
    "goat":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "西南", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "花开有时", quoteEn: "" },
    "monkey":     { score: 70, color: "#D4AF37", colorName: "金色", number: 2, direction: "西南", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "草木有本心", quoteEn: "" },
    "rooster":     { score: 70, color: "#D4AF37", colorName: "金色", number: 3, direction: "西南", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "天地有大美", quoteEn: "" },
    "dog":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 8, direction: "西南", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "静水流深", quoteEn: "" },
    "pig":     { score: 55, color: "#5B8299", colorName: "蓝色", number: 8, direction: "西南", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "厚德载物", quoteEn: "" }
  },

  "2026-06-28": {
    "rat":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 9, direction: "正西", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "迎难而上", quoteEn: "" },
    "ox":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 8, direction: "正西", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "勇者无畏", quoteEn: "" },
    "tiger":     { score: 80, color: "#5E825E", colorName: "绿色", number: 2, direction: "正西", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "道法自然", quoteEn: "" },
    "rabbit":     { score: 60, color: "#5E825E", colorName: "绿色", number: 3, direction: "正西", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "万物皆有定时", quoteEn: "" },
    "dragon":     { score: 85, color: "#9E8E6E", colorName: "棕色", number: 3, direction: "正西", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "春生夏长秋收冬藏", quoteEn: "" },
    "snake":     { score: 80, color: "#B8665E", colorName: "红色", number: 2, direction: "正西", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "顺应天时", quoteEn: "" },
    "horse":     { score: 70, color: "#B8665E", colorName: "红色", number: 2, direction: "正西", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "花开有时", quoteEn: "" },
    "goat":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "正西", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "草木有本心", quoteEn: "" },
    "monkey":     { score: 70, color: "#D4AF37", colorName: "金色", number: 3, direction: "正西", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "天地有大美", quoteEn: "" },
    "rooster":     { score: 55, color: "#D4AF37", colorName: "金色", number: 4, direction: "正西", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "静水流深", quoteEn: "" },
    "dog":     { score: 60, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "正西", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "厚德载物", quoteEn: "" },
    "pig":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 9, direction: "正西", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "上善若水", quoteEn: "" }
  },

  "2026-06-29": {
    "rat":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 1, direction: "西北", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "勇者无畏", quoteEn: "" },
    "ox":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "西北", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "道法自然", quoteEn: "" },
    "tiger":     { score: 80, color: "#5E825E", colorName: "绿色", number: 3, direction: "西北", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "万物皆有定时", quoteEn: "" },
    "rabbit":     { score: 85, color: "#5E825E", colorName: "绿色", number: 4, direction: "西北", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "春生夏长秋收冬藏", quoteEn: "" },
    "dragon":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 4, direction: "西北", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "顺应天时", quoteEn: "" },
    "snake":     { score: 80, color: "#B8665E", colorName: "红色", number: 3, direction: "西北", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "花开有时", quoteEn: "" },
    "horse":     { score: 90, color: "#B8665E", colorName: "红色", number: 3, direction: "西北", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "草木有本心", quoteEn: "" },
    "goat":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 2, direction: "西北", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "天地有大美", quoteEn: "" },
    "monkey":     { score: 70, color: "#D4AF37", colorName: "金色", number: 4, direction: "西北", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "静水流深", quoteEn: "" },
    "rooster":     { score: 60, color: "#D4AF37", colorName: "金色", number: 5, direction: "西北", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "厚德载物", quoteEn: "" },
    "dog":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "西北", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "上善若水", quoteEn: "" },
    "pig":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 1, direction: "西北", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "大道至简", quoteEn: "" }
  },

  "2026-06-30": {
    "rat":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 2, direction: "西北", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "道法自然", quoteEn: "" },
    "ox":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "西北", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "万物皆有定时", quoteEn: "" },
    "tiger":     { score: 85, color: "#5E825E", colorName: "绿色", number: 4, direction: "西北", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "春生夏长秋收冬藏", quoteEn: "" },
    "rabbit":     { score: 80, color: "#5E825E", colorName: "绿色", number: 5, direction: "西北", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "顺应天时", quoteEn: "" },
    "dragon":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 5, direction: "西北", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "花开有时", quoteEn: "" },
    "snake":     { score: 60, color: "#B8665E", colorName: "红色", number: 4, direction: "西北", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "草木有本心", quoteEn: "" },
    "horse":     { score: 80, color: "#B8665E", colorName: "红色", number: 4, direction: "西北", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "天地有大美", quoteEn: "" },
    "goat":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 3, direction: "西北", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "静水流深", quoteEn: "" },
    "monkey":     { score: 55, color: "#D4AF37", colorName: "金色", number: 5, direction: "西北", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "厚德载物", quoteEn: "" },
    "rooster":     { score: 70, color: "#D4AF37", colorName: "金色", number: 6, direction: "西北", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "上善若水", quoteEn: "" },
    "dog":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 2, direction: "西北", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "大道至简", quoteEn: "" },
    "pig":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 2, direction: "西北", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "返璞归真", quoteEn: "" }
  },

  "2026-07-01": {
    "rat":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 1, direction: "正北", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "万物皆有定时", quoteEn: "" },
    "ox":     { score: 95, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "正北", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "春生夏长秋收冬藏", quoteEn: "" },
    "tiger":     { score: 70, color: "#5E825E", colorName: "绿色", number: 3, direction: "正北", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "顺应天时", quoteEn: "" },
    "rabbit":     { score: 55, color: "#5E825E", colorName: "绿色", number: 4, direction: "正北", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "花开有时", quoteEn: "" },
    "dragon":     { score: 90, color: "#9E8E6E", colorName: "棕色", number: 4, direction: "正北", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "草木有本心", quoteEn: "" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 3, direction: "正北", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "天地有大美", quoteEn: "" },
    "horse":     { score: 55, color: "#B8665E", colorName: "红色", number: 3, direction: "正北", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "静水流深", quoteEn: "" },
    "goat":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 2, direction: "正北", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "厚德载物", quoteEn: "" },
    "monkey":     { score: 80, color: "#D4AF37", colorName: "金色", number: 4, direction: "正北", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "上善若水", quoteEn: "" },
    "rooster":     { score: 70, color: "#D4AF37", colorName: "金色", number: 5, direction: "正北", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "大道至简", quoteEn: "" },
    "dog":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "正北", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "返璞归真", quoteEn: "" },
    "pig":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 1, direction: "正北", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "天人合一", quoteEn: "" }
  },

  "2026-07-02": {
    "rat":     { score: 85, color: "#5B8299", colorName: "蓝色", number: 2, direction: "东北", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "春生夏长秋收冬藏", quoteEn: "" },
    "ox":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "东北", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "顺应天时", quoteEn: "" },
    "tiger":     { score: 70, color: "#5E825E", colorName: "绿色", number: 4, direction: "东北", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "花开有时", quoteEn: "" },
    "rabbit":     { score: 70, color: "#5E825E", colorName: "绿色", number: 5, direction: "东北", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "草木有本心", quoteEn: "" },
    "dragon":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 5, direction: "东北", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "天地有大美", quoteEn: "" },
    "snake":     { score: 80, color: "#B8665E", colorName: "红色", number: 4, direction: "东北", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "静水流深", quoteEn: "" },
    "horse":     { score: 60, color: "#B8665E", colorName: "红色", number: 4, direction: "东北", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "厚德载物", quoteEn: "" },
    "goat":     { score: 60, color: "#9E8E6E", colorName: "棕色", number: 3, direction: "东北", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "上善若水", quoteEn: "" },
    "monkey":     { score: 70, color: "#D4AF37", colorName: "金色", number: 5, direction: "东北", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "大道至简", quoteEn: "" },
    "rooster":     { score: 80, color: "#D4AF37", colorName: "金色", number: 6, direction: "东北", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "返璞归真", quoteEn: "" },
    "dog":     { score: 65, color: "#9E8E6E", colorName: "棕色", number: 2, direction: "东北", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "天人合一", quoteEn: "" },
    "pig":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 2, direction: "东北", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "万物并育而不相害", quoteEn: "" }
  },

  "2026-07-03": {
    "rat":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 3, direction: "东北", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "顺应天时", quoteEn: "" },
    "ox":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 2, direction: "东北", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "花开有时", quoteEn: "" },
    "tiger":     { score: 70, color: "#5E825E", colorName: "绿色", number: 5, direction: "东北", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "草木有本心", quoteEn: "" },
    "rabbit":     { score: 70, color: "#5E825E", colorName: "绿色", number: 6, direction: "东北", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "天地有大美", quoteEn: "" },
    "dragon":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 6, direction: "东北", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "静水流深", quoteEn: "" },
    "snake":     { score: 55, color: "#B8665E", colorName: "红色", number: 5, direction: "东北", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "厚德载物", quoteEn: "" },
    "horse":     { score: 80, color: "#B8665E", colorName: "红色", number: 5, direction: "东北", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "上善若水", quoteEn: "" },
    "goat":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 4, direction: "东北", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "大道至简", quoteEn: "" },
    "monkey":     { score: 60, color: "#D4AF37", colorName: "金色", number: 6, direction: "东北", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "返璞归真", quoteEn: "" },
    "rooster":     { score: 80, color: "#D4AF37", colorName: "金色", number: 7, direction: "东北", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "天人合一", quoteEn: "" },
    "dog":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 3, direction: "东北", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "万物并育而不相害", quoteEn: "" },
    "pig":     { score: 85, color: "#5B8299", colorName: "蓝色", number: 3, direction: "东北", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "顺势而为", quoteEn: "" }
  },

  "2026-07-04": {
    "rat":     { score: 55, color: "#5B8299", colorName: "蓝色", number: 4, direction: "正东", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "花开有时", quoteEn: "" },
    "ox":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 3, direction: "正东", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "草木有本心", quoteEn: "" },
    "tiger":     { score: 70, color: "#5E825E", colorName: "绿色", number: 6, direction: "正东", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "天地有大美", quoteEn: "" },
    "rabbit":     { score: 70, color: "#5E825E", colorName: "绿色", number: 7, direction: "正东", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "静水流深", quoteEn: "" },
    "dragon":     { score: 60, color: "#9E8E6E", colorName: "棕色", number: 7, direction: "正东", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "厚德载物", quoteEn: "" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 6, direction: "正东", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "上善若水", quoteEn: "" },
    "horse":     { score: 70, color: "#B8665E", colorName: "红色", number: 6, direction: "正东", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "大道至简", quoteEn: "" },
    "goat":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 5, direction: "正东", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "返璞归真", quoteEn: "" },
    "monkey":     { score: 80, color: "#D4AF37", colorName: "金色", number: 7, direction: "正东", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "天人合一", quoteEn: "" },
    "rooster":     { score: 60, color: "#D4AF37", colorName: "金色", number: 8, direction: "正东", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "万物并育而不相害", quoteEn: "" },
    "dog":     { score: 85, color: "#9E8E6E", colorName: "棕色", number: 4, direction: "正东", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "顺势而为", quoteEn: "" },
    "pig":     { score: 80, color: "#5B8299", colorName: "蓝色", number: 4, direction: "正东", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "风物长宜放眼量", quoteEn: "" }
  },

  "2026-07-05": {
    "rat":     { score: 90, color: "#5B8299", colorName: "蓝色", number: 5, direction: "东南", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "草木有本心", quoteEn: "" },
    "ox":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 4, direction: "东南", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "天地有大美", quoteEn: "" },
    "tiger":     { score: 70, color: "#5E825E", colorName: "绿色", number: 7, direction: "东南", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "静水流深", quoteEn: "" },
    "rabbit":     { score: 60, color: "#5E825E", colorName: "绿色", number: 8, direction: "东南", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "厚德载物", quoteEn: "" },
    "dragon":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 8, direction: "东南", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "上善若水", quoteEn: "" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 7, direction: "东南", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "大道至简", quoteEn: "" },
    "horse":     { score: 70, color: "#B8665E", colorName: "红色", number: 7, direction: "东南", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "返璞归真", quoteEn: "" },
    "goat":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 6, direction: "东南", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "天人合一", quoteEn: "" },
    "monkey":     { score: 80, color: "#D4AF37", colorName: "金色", number: 8, direction: "东南", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "万物并育而不相害", quoteEn: "" },
    "rooster":     { score: 85, color: "#D4AF37", colorName: "金色", number: 9, direction: "东南", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "顺势而为", quoteEn: "" },
    "dog":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 5, direction: "东南", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "风物长宜放眼量", quoteEn: "" },
    "pig":     { score: 80, color: "#5B8299", colorName: "蓝色", number: 5, direction: "东南", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "守得云开见月明", quoteEn: "" }
  },

  "2026-07-06": {
    "rat":     { score: 80, color: "#5B8299", colorName: "蓝色", number: 6, direction: "东南", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "天地有大美", quoteEn: "" },
    "ox":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 5, direction: "东南", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "静水流深", quoteEn: "" },
    "tiger":     { score: 55, color: "#5E825E", colorName: "绿色", number: 8, direction: "东南", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "厚德载物", quoteEn: "" },
    "rabbit":     { score: 70, color: "#5E825E", colorName: "绿色", number: 9, direction: "东南", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "上善若水", quoteEn: "" },
    "dragon":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "东南", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "大道至简", quoteEn: "" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 8, direction: "东南", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "返璞归真", quoteEn: "" },
    "horse":     { score: 70, color: "#B8665E", colorName: "红色", number: 8, direction: "东南", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "天人合一", quoteEn: "" },
    "goat":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 7, direction: "东南", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "万物并育而不相害", quoteEn: "" },
    "monkey":     { score: 85, color: "#D4AF37", colorName: "金色", number: 9, direction: "东南", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "顺势而为", quoteEn: "" },
    "rooster":     { score: 80, color: "#D4AF37", colorName: "金色", number: 1, direction: "东南", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "风物长宜放眼量", quoteEn: "" },
    "dog":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 6, direction: "东南", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "守得云开见月明", quoteEn: "" },
    "pig":     { score: 60, color: "#5B8299", colorName: "蓝色", number: 6, direction: "东南", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "岁月从不败美人", quoteEn: "" }
  },

  "2026-07-07": {
    "rat":     { score: 55, color: "#5B8299", colorName: "蓝色", number: 7, direction: "正南", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "小暑温风，至而未极。", quoteEn: "" },
    "ox":     { score: 60, color: "#9E8E6E", colorName: "棕色", number: 6, direction: "正南", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "小暑温风，至而未极。", quoteEn: "" },
    "tiger":     { score: 90, color: "#5E825E", colorName: "绿色", number: 9, direction: "正南", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "小暑温风，至而未极。", quoteEn: "" },
    "rabbit":     { score: 80, color: "#5E825E", colorName: "绿色", number: 1, direction: "正南", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "小暑温风，至而未极。", quoteEn: "" },
    "dragon":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "正南", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "小暑温风，至而未极。", quoteEn: "" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 9, direction: "正南", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "小暑温风，至而未极。", quoteEn: "" },
    "horse":     { score: 55, color: "#B8665E", colorName: "红色", number: 9, direction: "正南", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "小暑温风，至而未极。", quoteEn: "" },
    "goat":     { score: 85, color: "#9E8E6E", colorName: "棕色", number: 8, direction: "正南", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "小暑温风，至而未极。", quoteEn: "" },
    "monkey":     { score: 70, color: "#D4AF37", colorName: "金色", number: 1, direction: "正南", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "小暑温风，至而未极。", quoteEn: "" },
    "rooster":     { score: 70, color: "#D4AF37", colorName: "金色", number: 2, direction: "正南", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "小暑温风，至而未极。", quoteEn: "" },
    "dog":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 7, direction: "正南", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "小暑温风，至而未极。", quoteEn: "" },
    "pig":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 7, direction: "正南", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "小暑温风，至而未极。", quoteEn: "" }
  },

  "2026-07-08": {
    "rat":     { score: 60, color: "#5B8299", colorName: "蓝色", number: 8, direction: "西南", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "厚德载物", quoteEn: "" },
    "ox":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 7, direction: "西南", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "上善若水", quoteEn: "" },
    "tiger":     { score: 80, color: "#5E825E", colorName: "绿色", number: 1, direction: "西南", pair: "亥",     good: ["开业","交易","出行"],        avoid: ["安葬","诉讼"],       quote: "大道至简", quoteEn: "" },
    "rabbit":     { score: 90, color: "#5E825E", colorName: "绿色", number: 2, direction: "西南", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "返璞归真", quoteEn: "" },
    "dragon":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 2, direction: "西南", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "天人合一", quoteEn: "" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 1, direction: "西南", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "万物并育而不相害", quoteEn: "" },
    "horse":     { score: 85, color: "#B8665E", colorName: "红色", number: 1, direction: "西南", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "顺势而为", quoteEn: "" },
    "goat":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "西南", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "风物长宜放眼量", quoteEn: "" },
    "monkey":     { score: 70, color: "#D4AF37", colorName: "金色", number: 2, direction: "西南", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "守得云开见月明", quoteEn: "" },
    "rooster":     { score: 70, color: "#D4AF37", colorName: "金色", number: 3, direction: "西南", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "岁月从不败美人", quoteEn: "" },
    "dog":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 8, direction: "西南", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "人间值得", quoteEn: "" },
    "pig":     { score: 80, color: "#5B8299", colorName: "蓝色", number: 8, direction: "西南", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "未来可期", quoteEn: "" }
  },

  "2026-07-09": {
    "rat":     { score: 80, color: "#5B8299", colorName: "蓝色", number: 9, direction: "西南", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "上善若水", quoteEn: "" },
    "ox":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 8, direction: "西南", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "大道至简", quoteEn: "" },
    "tiger":     { score: 55, color: "#5E825E", colorName: "绿色", number: 2, direction: "西南", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "返璞归真", quoteEn: "" },
    "rabbit":     { score: 70, color: "#5E825E", colorName: "绿色", number: 3, direction: "西南", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "天人合一", quoteEn: "" },
    "dragon":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 3, direction: "西南", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "万物并育而不相害", quoteEn: "" },
    "snake":     { score: 95, color: "#B8665E", colorName: "红色", number: 2, direction: "西南", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "顺势而为", quoteEn: "" },
    "horse":     { score: 80, color: "#B8665E", colorName: "红色", number: 2, direction: "西南", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "风物长宜放眼量", quoteEn: "" },
    "goat":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "西南", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "守得云开见月明", quoteEn: "" },
    "monkey":     { score: 70, color: "#D4AF37", colorName: "金色", number: 3, direction: "西南", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "岁月从不败美人", quoteEn: "" },
    "rooster":     { score: 70, color: "#D4AF37", colorName: "金色", number: 4, direction: "西南", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "人间值得", quoteEn: "" },
    "dog":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "西南", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "未来可期", quoteEn: "" },
    "pig":     { score: 55, color: "#5B8299", colorName: "蓝色", number: 9, direction: "西南", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "慢慢来，比较快", quoteEn: "" }
  },

  "2026-07-10": {
    "rat":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 1, direction: "正西", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "大道至简", quoteEn: "" },
    "ox":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "正西", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "返璞归真", quoteEn: "" },
    "tiger":     { score: 70, color: "#5E825E", colorName: "绿色", number: 3, direction: "正西", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "天人合一", quoteEn: "" },
    "rabbit":     { score: 55, color: "#5E825E", colorName: "绿色", number: 4, direction: "正西", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "万物并育而不相害", quoteEn: "" },
    "dragon":     { score: 85, color: "#9E8E6E", colorName: "棕色", number: 4, direction: "正西", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "顺势而为", quoteEn: "" },
    "snake":     { score: 90, color: "#B8665E", colorName: "红色", number: 3, direction: "正西", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "风物长宜放眼量", quoteEn: "" },
    "horse":     { score: 80, color: "#B8665E", colorName: "红色", number: 3, direction: "正西", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "守得云开见月明", quoteEn: "" },
    "goat":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 2, direction: "正西", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "岁月从不败美人", quoteEn: "" },
    "monkey":     { score: 70, color: "#D4AF37", colorName: "金色", number: 4, direction: "正西", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "人间值得", quoteEn: "" },
    "rooster":     { score: 55, color: "#D4AF37", colorName: "金色", number: 5, direction: "正西", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "未来可期", quoteEn: "" },
    "dog":     { score: 60, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "正西", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "慢慢来，比较快", quoteEn: "" },
    "pig":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 1, direction: "正西", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "每一步都算数", quoteEn: "" }
  },




















































  "default": {
    "rat":     { score: 78, color: "#D4AF37", colorName: "金色", number: 7, direction: "东北", pair: "龙",     good: ["祈福", "祭祀"],        avoid: ["开业", "搬家"],       quote: "静待时机，贵人暗助。" },
    "ox":      { score: 72, color: "#5B8299", colorName: "蓝色", number: 3, direction: "西南", pair: "蛇",     good: ["出行", "会友"],        avoid: ["动土", "安葬"],       quote: "稳中求进，忌急躁。" },
    "tiger":   { score: 85, color: "#B8665E", colorName: "红色", number: 9, direction: "正北", pair: "狗",     good: ["求职", "签约"],        avoid: ["借贷", "谈判"],       quote: "机遇临门，乘势而上。" },
    "rabbit":  { score: 68, color: "#5E825E", colorName: "绿色", number: 5, direction: "东南", pair: "猪",     good: ["修身", "学习"],        avoid: ["投资", "合伙"],       quote: "韬光养晦，厚积薄发。" },
    "dragon":  { score: 92, color: "#D4AF37", colorName: "金色", number: 1, direction: "正西", pair: "鼠",     good: ["开业", "表白"],        avoid: ["诉讼", "迁徙"],       quote: "龙腾四海，气势如虹。" },
    "snake":   { score: 75, color: "#8B5CF6", colorName: "紫色", number: 4, direction: "东北", pair: "猴",     good: ["文艺", "创作"],        avoid: ["争斗", "口舌"],       quote: "灵蛇蜕皮，焕然一新。" },
    "horse":   { score: 81, color: "#B8665E", colorName: "红色", number: 6, direction: "正南", pair: "羊",     good: ["求财", "拜访"],        avoid: ["安床", "开业"],       quote: "马到成功，势不可挡。" },
    "goat":    { score: 70, color: "#9E8E6E", colorName: "棕色", number: 2, direction: "西南", pair: "马",     good: ["祈福", "嫁娶"],        avoid: ["投资", "迁徙"],       quote: "温顺待机，贵人相助。" },
    "monkey":  { score: 83, color: "#D4AF37", colorName: "金色", number: 8, direction: "正北", pair: "蛇",     good: ["创新", "变革"],        avoid: ["守旧", "拖延"],       quote: "猴王智慧，灵活制胜。" },
    "rooster": { score: 69, color: "#C084FC", colorName: "粉色", number: 3, direction: "正东", pair: "牛",     good: ["理财", "储蓄"],        avoid: ["投机", "赌博"],       quote: "守成为上，稳扎稳打。" },
    "dog":     { score: 76, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "正南", pair: "虎",     good: ["社交", "聚会"],        avoid: ["诉讼", "冲突"],       quote: "忠诚待人，福报自来。" },
    "pig":     { score: 74, color: "#5B8299", colorName: "蓝色", number: 6, direction: "正西", pair: "兔",     good: ["休养", "家庭"],        avoid: ["冒险", "扩张"],       quote: "猪拱福门，平安是福。" }
  },

  // ============================================================
  // 今日数据（2026-05-18）— 自动生成
  // ============================================================
  "2026-05-18": {
    "rat":     { score: 55, color: "#5B8299", colorName: "蓝色", number: 7, direction: "正南", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "破茧才能成蝶" },
    "ox":     { score: 60, color: "#9E8E6E", colorName: "棕色", number: 6, direction: "正南", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "破茧才能成蝶" },
    "tiger":     { score: 80, color: "#5E825E", colorName: "绿色", number: 9, direction: "正南", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "破茧才能成蝶" },
    "rabbit":     { score: 70, color: "#5E825E", colorName: "绿色", number: 1, direction: "正南", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "破茧才能成蝶" },
    "dragon":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 1, direction: "正南", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "破茧才能成蝶" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 9, direction: "正南", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "破茧才能成蝶" },
    "horse":     { score: 55, color: "#B8665E", colorName: "红色", number: 9, direction: "正南", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "破茧才能成蝶" },
    "goat":     { score: 85, color: "#9E8E6E", colorName: "棕色", number: 8, direction: "正南", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "破茧才能成蝶" },
    "monkey":     { score: 80, color: "#D4AF37", colorName: "金色", number: 1, direction: "正南", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "破茧才能成蝶" },
    "rooster":     { score: 80, color: "#D4AF37", colorName: "金色", number: 2, direction: "正南", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "破茧才能成蝶" },
    "dog":     { score: 80, color: "#9E8E6E", colorName: "棕色", number: 7, direction: "正南", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "破茧才能成蝶" },
    "pig":     { score: 70, color: "#5B8299", colorName: "蓝色", number: 7, direction: "正南", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "破茧才能成蝶" }
  },

  // ============================================================
  // 示例：明天数据（继续往后加）
  // ============================================================
























  "2026-05-19": {
    "rat":     { score: 60, color: "#5B8299", colorName: "蓝色", number: 8, direction: "西南", pair: "丑",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "涅槃重生" },
    "ox":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 7, direction: "西南", pair: "子",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "风雨过后见彩虹" },
    "tiger":     { score: 70, color: "#5E825E", colorName: "绿色", number: 1, direction: "西南", pair: "亥",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心宽路就宽" },
    "rabbit":     { score: 80, color: "#5E825E", colorName: "绿色", number: 2, direction: "西南", pair: "戌",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "放下便是拥有" },
    "dragon":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 2, direction: "西南", pair: "酉",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "随缘自在" },
    "snake":     { score: 70, color: "#B8665E", colorName: "红色", number: 1, direction: "西南", pair: "申",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心静自然凉" },
    "horse":     { score: 85, color: "#B8665E", colorName: "红色", number: 1, direction: "西南", pair: "未",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "知足常乐" },
    "goat":     { score: 55, color: "#9E8E6E", colorName: "棕色", number: 9, direction: "西南", pair: "午",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "平常心是道" },
    "monkey":     { score: 80, color: "#D4AF37", colorName: "金色", number: 2, direction: "西南", pair: "巳",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "一切都是最好的安排" },
    "rooster":     { score: 80, color: "#D4AF37", colorName: "金色", number: 3, direction: "西南", pair: "辰",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "顺其自然" },
    "dog":     { score: 70, color: "#9E8E6E", colorName: "棕色", number: 8, direction: "西南", pair: "卯",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "心安即是归处" },
    "pig":     { score: 80, color: "#5B8299", colorName: "蓝色", number: 8, direction: "西南", pair: "寅",     good: ["出行","搬家","沐浴"],        avoid: ["开业","安葬"],       quote: "从容面对一切" }
  },

};

// ============================================================
// 生肖元数据（名称、顺序、英文key）
// ============================================================
var ZODIAC_SIGNS = [
  { key: "rat",     name: "鼠", emoji: "🐀" },
  { key: "ox",      name: "牛", emoji: "🐂" },
  { key: "tiger",   name: "虎", emoji: "🐅" },
  { key: "rabbit",  name: "兔", emoji: "🐇" },
  { key: "dragon",  name: "龙", emoji: "🐉" },
  { key: "snake",   name: "蛇", emoji: "🐍" },
  { key: "horse",   name: "马", emoji: "🐎" },
  { key: "goat",    name: "羊", emoji: "🐑" },
  { key: "monkey",  name: "猴", emoji: "🐒" },
  { key: "rooster", name: "鸡", emoji: "🐓" },
  { key: "dog",     name: "狗", emoji: "🐕" },
  { key: "pig",     name: "猪", emoji: "🐖" }
];

// ============================================================
// 工具函数
// ============================================================

/**
 * 获取某天的运势数据
 * @param {string} date - YYYY-MM-DD，缺省取今天
 */
function getDayData(date) {
  var d = date || new Date().toISOString().split('T')[0];
  return ZODIAC_DATA[d] || ZODIAC_DATA['default'];
}

/**
 * 将分数转成星级（0-5）
 */
function scoreToStars(score) {
  var s = Math.round(score / 20); // 100->5, 80->4, 60->3, 40->2, 20->1
  return Math.max(1, Math.min(5, s));
}

/**
 * 渲染星级
 */
function renderStars(score) {
  var full  = '★';
  var empty = '☆';
  var n = scoreToStars(score);
  return full.repeat(n) + empty.repeat(5 - n);
}
