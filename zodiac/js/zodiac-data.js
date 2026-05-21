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
