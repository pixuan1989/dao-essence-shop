/**
 * 生肖每日运势生成器 v2.0
 * 功能：基于天干地支五行计算，生成每日12生肖运势
 * 用法：node scripts/generate-daily.js [日期 YYYY-MM-DD]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── 加载 .env.local（用于本地开发时读取 API Key）───
const ENV_FILE = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(ENV_FILE)) {
  const envContent = fs.readFileSync(ENV_FILE, 'utf8');
  for (const line of envContent.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim();
    }
  }
}

// ─── 路径配置 ───
const PROJECT_ROOT = path.join(__dirname, '..');
const SEO_DIR = path.join(PROJECT_ROOT, 'zodiac', 'seo-content');
const DATA_FILE = path.join(PROJECT_ROOT, 'zodiac', 'js', 'zodiac-data.js');
// 兼容 ES Module __dirname

// ─── 生肖列表 ───
const ZODIAC_LIST = [
  { key: 'rat',     name: '鼠', sign: '子', en: 'Rat', element: '水' },
  { key: 'ox',      name: '牛', sign: '丑', en: 'Ox', element: '土' },
  { key: 'tiger',   name: '虎', sign: '寅', en: 'Tiger', element: '木' },
  { key: 'rabbit',  name: '兔', sign: '卯', en: 'Rabbit', element: '木' },
  { key: 'dragon',  name: '龙', sign: '辰', en: 'Dragon', element: '土' },
  { key: 'snake',   name: '蛇', sign: '巳', en: 'Snake', element: '火' },
  { key: 'horse',   name: '马', sign: '午', en: 'Horse', element: '火' },
  { key: 'goat',    name: '羊', sign: '未', en: 'Goat', element: '土' },
  { key: 'monkey',  name: '猴', sign: '申', en: 'Monkey', element: '金' },
  { key: 'rooster', name: '鸡', sign: '酉', en: 'Rooster', element: '金' },
  { key: 'dog',     name: '狗', sign: '戌', en: 'Dog', element: '土' },
  { key: 'pig',     name: '猪', sign: '亥', en: 'Pig', element: '水' },
];

// ─── 博客导流推荐（12生肖 × 2篇，按语义匹配）───
// 每条包含 slug + 中文标题 + 英文标题，generate-daily.js 按需输出对应语言版本
const BLOG_RECOMMENDATIONS = {
  rat:     [
    { slug: 'five-elements-theory-wu-xing-guide',        titleCN: '五行性格測試：你是木、火、土、金還是水？',           titleEN: 'Five Elements Personality Test: Are You Wood, Fire, Earth, Metal or Water?' },
    { slug: 'love-prediction-by-date-of-birth',          titleCN: '依出生日期預測姻緣：八字解讀',                         titleEN: 'Love Prediction by Date of Birth: BaZi Reading' },
  ],
  ox:      [
    { slug: 'five-elements-theory-wu-xing-guide',        titleCN: '五行性格測試：你是木、火、土、金還是水？',           titleEN: 'Five Elements Personality Test: Are You Wood, Fire, Earth, Metal or Water?' },
    { slug: 'when-will-i-find-love',                     titleCN: '八字姻緣預測：你的出生日期揭示何時遇見真愛',        titleEN: 'When Will I Find Love? What Your Birth Chart Says' },
  ],
  tiger:   [
    { slug: 'five-elements-theory-wu-xing-guide',        titleCN: '五行性格測試：你是木、火、土、金還是水？',           titleEN: 'Five Elements Personality Test: Are You Wood, Fire, Earth, Metal or Water?' },
    { slug: 'feng-shui-home-office-7-rules',            titleCN: '居家辦公風水：7條實用規則',                          titleEN: 'Feng Shui Home Office: 7 Rules' },
  ],
  rabbit:  [
    { slug: 'love-prediction-by-date-of-birth',          titleCN: '依出生日期預測姻緣：八字解讀',                        titleEN: 'Love Prediction by Date of Birth: BaZi Reading' },
    { slug: 'five-elements-theory-wu-xing-guide',        titleCN: '五行性格測試：你是木、火、土、金還是水？',           titleEN: 'Five Elements Personality Test: Are You Wood, Fire, Earth, Metal or Water?' },
  ],
  dragon:  [
    { slug: 'five-elements-theory-wu-xing-guide',        titleCN: '五行性格測試：你是木、火、土、金還是水？',           titleEN: 'Five Elements Personality Test: Are You Wood, Fire, Earth, Metal or Water?' },
    { slug: 'feng-shui-headboard-placement-5-rules',    titleCN: '風水床頭擺放：5大法則',                                titleEN: 'Feng Shui Bed Headboard Placement: 5 Essential Rules' },
  ],
  snake:   [
    { slug: 'five-elements-theory-wu-xing-guide',        titleCN: '五行性格測試：你是木、火、土、金還是水？',           titleEN: 'Five Elements Personality Test: Are You Wood, Fire, Earth, Metal or Water?' },
    { slug: 'love-prediction-by-date-of-birth',          titleCN: '依出生日期預測姻緣：八字解讀',                        titleEN: 'Love Prediction by Date of Birth: BaZi Reading' },
  ],
  horse:   [
    { slug: 'feng-shui-headboard-placement-5-rules',    titleCN: '風水床頭擺放：5大法則',                                titleEN: 'Feng Shui Bed Headboard Placement: 5 Essential Rules' },
    { slug: 'five-elements-theory-wu-xing-guide',        titleCN: '五行性格測試：你是木、火、土、金還是水？',           titleEN: 'Five Elements Personality Test: Are You Wood, Fire, Earth, Metal or Water?' },
  ],
  goat:    [
    { slug: 'love-prediction-by-date-of-birth',          titleCN: '依出生日期預測姻緣：八字解讀',                        titleEN: 'Love Prediction by Date of Birth: BaZi Reading' },
    { slug: 'when-will-i-find-love',                     titleCN: '八字姻緣預測：你的出生日期揭示何時遇見真愛',        titleEN: 'When Will I Find Love? What Your Birth Chart Says' },
  ],
  monkey:  [
    { slug: 'five-elements-theory-wu-xing-guide',        titleCN: '五行性格測試：你是木、火、土、金還是水？',           titleEN: 'Five Elements Personality Test: Are You Wood, Fire, Earth, Metal or Water?' },
    { slug: 'feng-shui-home-office-7-rules',            titleCN: '居家辦公風水：7條實用規則',                          titleEN: 'Feng Shui Home Office: 7 Rules' },
  ],
  rooster: [
    { slug: 'love-prediction-by-date-of-birth',          titleCN: '依出生日期預測姻緣：八字解讀',                        titleEN: 'Love Prediction by Date of Birth: BaZi Reading' },
    { slug: 'five-elements-theory-wu-xing-guide',        titleCN: '五行性格測試：你是木、火、土、金還是水？',           titleEN: 'Five Elements Personality Test: Are You Wood, Fire, Earth, Metal or Water?' },
  ],
  dog:     [
    { slug: 'feng-shui-headboard-placement-5-rules',    titleCN: '風水床頭擺放：5大法則',                                titleEN: 'Feng Shui Bed Headboard Placement: 5 Essential Rules' },
    { slug: 'when-will-i-find-love',                     titleCN: '八字姻緣預測：你的出生日期揭示何時遇見真愛',        titleEN: 'When Will I Find Love? What Your Birth Chart Says' },
  ],
  pig:     [
    { slug: 'five-elements-theory-wu-xing-guide',        titleCN: '五行性格測試：你是木、火、土、金還是水？',           titleEN: 'Five Elements Personality Test: Are You Wood, Fire, Earth, Metal or Water?' },
    { slug: 'love-prediction-by-date-of-birth',          titleCN: '依出生日期預測姻緣：八字解讀',                        titleEN: 'Love Prediction by Date of Birth: BaZi Reading' },
  ],
};

// ─── 天干 ───
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const TIANGAN_WUXING = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];
const TIANGAN_YINYANG = ['阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴'];

// ─── 地支 ───
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const DIZHI_WUXING = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'];
const DIZHI_YINYANG = ['阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴'];

// ─── 六合 ───
const LIUHE = { '子': '丑', '丑': '子', '寅': '亥', '亥': '寅', '卯': '戌', '戌': '卯', '辰': '酉', '酉': '辰', '巳': '申', '申': '巳', '午': '未', '未': '午' };

// ─── 六冲（值年太岁相冲） ───
const LUICHONG = { '子': '午', '丑': '未', '寅': '申', '卯': '酉', '辰': '戌', '巳': '亥', '午': '子', '未': '丑', '申': '寅', '酉': '卯', '戌': '辰', '亥': '巳' };

// ─── 三合（半合） ───
const SANHE = { '申': ['子', '辰'], '子': ['申', '辰'], '辰': ['申', '子'], '亥': ['卯', '未'], '卯': ['亥', '未'], '未': ['亥', '卯'], '寅': ['午', '戌'], '午': ['寅', '戌'], '戌': ['寅', '午'], '巳': ['酉', '丑'], '酉': ['巳', '丑'], '丑': ['巳', '酉'] };

// ─── 相害 ───
const XIANGHAI = { '子': '未', '丑': '午', '寅': '巳', '卯': '辰', '辰': '卯', '巳': '寅', '午': '丑', '未': '子', '申': '亥', '酉': '戌', '戌': '酉', '亥': '申' };

// ─── 相刑 ───
const XIANGXING = { '子': '卯', '卯': '子', '寅': '巳', '巳': '寅', '申': '亥', '亥': '申', '丑': '戌', '戌': '丑', '辰': '辰', '午': '午', '酉': '酉', '未': '未' };

// ─── 二十四节气 ───
const SOLAR_TERMS = {
  '01-05': '小寒', '01-20': '大寒',
  '02-04': '立春', '02-19': '雨水',
  '03-05': '惊蛰', '03-20': '春分',
  '04-04': '清明', '04-20': '谷雨',
  '05-05': '立夏', '05-21': '小满',
  '06-05': '芒种', '06-21': '夏至',
  '07-07': '小暑', '07-22': '大暑',
  '08-07': '立秋', '08-23': '处暑',
  '09-07': '白露', '09-23': '秋分',
  '10-08': '寒露', '10-23': '霜降',
  '11-07': '立冬', '11-22': '小雪',
  '12-07': '大雪', '12-21': '冬至',
};

// ─── 五行颜色 ───
const WUXING_COLORS = {
  '木': { hex: '#5E825E', name: '绿色' },
  '火': { hex: '#B8665E', name: '红色' },
  '土': { hex: '#9E8E6E', name: '棕色' },
  '金': { hex: '#D4AF37', name: '金色' },
  '水': { hex: '#5B8299', name: '蓝色' },
};

// ─── 金句库（100条，用户提供，按顺序循环）───
const BASE_QUOTES = [
  // 一、成长与坚持（1-20）
  '慢慢来，比较快', '每一步都算数', '坚持就是胜利', '今天比昨天好',
  '种子终会发芽', '水滴石穿的力量', '不积跬步无以至千里', '努力终有回报',
  '每天进步一点点', '时间会给出答案', '慢慢走，沿途有风景', '你比想象中坚强',
  '不怕慢，只怕停', '成长需要耐心', '所有坚持都有意义', '熬过黑夜就是黎明',
  '扎根才能枝繁叶茂', '沉淀是为了爆发', '日拱一卒无有尽', '功不唐捐终入海',
  // 二、希望与光明（21-40）
  '阳光总在风雨后', '黑暗尽头是光明', '明天会更好', '希望永不灭',
  '向阳而生', '心若向阳无畏悲伤', '光就在前方', '拨开云雾见月明',
  '寒冬过后是春天', '黎明前的夜最黑', '总有一束光为你亮', '雨后会天晴',
  '星光不问赶路人', '万物皆有裂痕', '那是光照进来的地方', '心有明灯不迷茫',
  '追光的人终会光芒万丈', '破茧才能成蝶', '涅槃重生', '风雨过后见彩虹',
  // 三、心态与心境（41-60）
  '心宽路就宽', '放下便是拥有', '随缘自在', '心静自然凉',
  '知足常乐', '平常心是道', '一切都是最好的安排', '顺其自然',
  '心安即是归处', '从容面对一切', '不争不抢自有岁月打赏', '慢下来，感受生活',
  '内心丰盈者独行也众', '心若不动风又奈何', '淡定从容是最好的状态', '修心养性',
  '一念放下万般自在', '心简单世界就简单', '温柔对待这个世界', '与自己和解',
  // 四、行动与勇气（61-80）
  '勇敢出发', '想做就去做', '行动是最好的答案', '迈出第一步',
  '趁年轻去追梦', '乘风破浪', '逆风翻盘', '越挫越勇',
  '敢于重新开始', '去成为你想成为的人', '不要等，现在就出发', '行动力决定未来',
  '去做就对了', '勇敢的人先享受世界', '路在脚下', '向前看别回头',
  '敢于突破自己', '逆风飞翔', '迎难而上', '勇者无畏',
  // 五、自然与哲理（81-100）
  '道法自然', '万物皆有定时', '春生夏长秋收冬藏', '顺应天时',
  '花开有时', '草木有本心', '天地有大美', '静水流深',
  '厚德载物', '上善若水', '大道至简', '返璞归真',
  '天人合一', '万物并育而不相害', '顺势而为', '风物长宜放眼量',
  '守得云开见月明', '岁月从不败美人', '人间值得', '未来可期',
];

// ─── 节气金句 ───
const SOLAR_TERM_QUOTES = {
  '小寒': '寒梅傲雪，静待春归。', '大寒': '瑞雪兆丰，静待花开。',
  '立春': '春回大地，万物复苏。', '雨水': '细雨润物，生机勃发。',
  '惊蛰': '春雷惊醒，蛰虫始振。', '春分': '昼夜均分，阴阳平衡。',
  '清明': '清明时节，春暖花开。', '谷雨': '雨生百谷，播种希望。',
  '立夏': '夏日至临，阳气渐盛。', '小满': '小满未满，盈而不溢。',
  '芒种': '芒种忙种，有收有种。', '夏至': '阳极阴生，昼长夜短。',
  '小暑': '小暑温风，至而未极。', '大暑': '大暑酷热，乘凉养生。',
  '立秋': '秋高气爽，收获在望。', '处暑': '暑气渐消，秋意渐浓。',
  '白露': '白露为霜，秋意渐深。', '秋分': '秋分昼夜，寒暑平分。',
  '寒露': '寒露凝霜，注意添衣。', '霜降': '霜降天凉，保暖为上。',
  '立冬': '冬藏万物，养精蓄锐。', '小雪': '小雪封地，保暖驱寒。',
  '大雪': '大雪纷飞，银装素裹。', '冬至': '冬至阳生，一阳复始。',
};

// ─── 节日金句 ───
const FESTIVAL_QUOTES = {
  '01-01': '元旦吉祥，开年大吉！', '01-28': '除夕团圆，福满人间。',
  '01-29': '新春快乐，万事如意！', '02-14': '情人节快乐，有情人终成眷属。',
  '04-05': '清明追思，慎终追远。', '05-01': '劳动最光荣，向劳动者致敬！',
  '05-05': '端午安康，粽香四溢。', '06-01': '儿童节快乐，永葆童心。',
  '08-22': '中 秋 佳 节 ， 月 圆 人 团 圆 。',
  '10-01': '国庆快乐，祖国万岁！',
  '09-09': '重阳登高，福寿安康。',
  '12-25': '圣诞快乐，平安吉祥！',
};

// ════════════════════════════════════════════════════════════
// 核心函数
// ════════════════════════════════════════════════════════════

/**
 * 计算指定日期的天干地支
 * @param {Date} date
 * @returns {Object} { ganzhi, tiangan, dizhi, wuxing, yinyang }
 */
function calculateGanzhi(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 简化算法：基于1900年1月1日（庚子日）为基准
  // 1900-01-01 是甲子日，天干索引0，地支索引0
  const baseDate = new Date(1900, 0, 1);
  const daysDiff = Math.floor((date - baseDate) / (24 * 60 * 60 * 1000));

  // 日干支：基准1900-01-01是甲子日（index 0），+daysDiff天后是对应干支
  const dayGanIndex = (daysDiff) % 10;
  const dayZhiIndex = (daysDiff) % 12;

  // 年干支：1900年是庚子年
  const yearGanIndex = (year - 1900 + 6) % 10;
  const yearZhiIndex = (year - 1900) % 12;

  // 月干支：月令以节气为准，简化用月份估算
  // 寅月（立春后）开始，月干 = (年干 * 2 + 月份) % 10
  const monthGanIndex = ((yearGanIndex * 2 + month) % 10);

  const tiangan = TIANGAN[dayGanIndex >= 0 ? dayGanIndex : dayGanIndex + 10];
  const dizhi = DIZHI[dayZhiIndex >= 0 ? dayZhiIndex : dayZhiIndex + 12];
  const wuxing = TIANGAN_WUXING[dayGanIndex >= 0 ? dayGanIndex : dayGanIndex + 10];

  return {
    ganzhi: tiangan + dizhi,
    tiangan,
    dizhi,
    wuxing,
    tianganIndex: dayGanIndex >= 0 ? dayGanIndex : dayGanIndex + 10,
    dizhiIndex: dayZhiIndex >= 0 ? dayZhiIndex : dayZhiIndex + 12,
    yearGan: TIANGAN[yearGanIndex],
    yearZhi: DIZHI[yearZhiIndex],
  };
}

/**
 * 获取冲、害、刑生肖
 */
function getRelations(dizhi) {
  const chong = LUICHONG[dizhi] || null;
  const hai = XIANGHAI[dizhi] || null;
  const xing = XIANGXING[dizhi] || null;
  const he = LIUHE[dizhi] || null;

  // 三合半合（地支三会）
  const sanheTargets = SANHE[dizhi] || [];

  return { chong, hai, xing, he, sanhe: sanheTargets };
}

/**
 * 检测节气
 */
function getSolarTerm(dateStr) {
  const monthDay = dateStr.slice(5); // MM-DD
  return SOLAR_TERMS[monthDay] || null;
}

/**
 * 检测节日
 */
function getFestival(dateStr) {
  const monthDay = dateStr.slice(5);
  // 农历节日简化：只用公历固定节日
  return FESTIVAL_QUOTES[monthDay] || null;
}

/**
 * 计算运势分数（基于五行生克）
 */
function calculateScore(zodiac, ganzhi, relations, rizhuWuxing) {
  const { sign, element } = zodiac;
  const targetWuxing = DIZHI_WUXING[DIZHI.indexOf(relations.he)] || rizhuWuxing;
  let score = 70; // 基础分

  // 六合加15分
  if (relations.he === sign) score += 15;

  // 三合加10分
  if (relations.sanhe.includes(sign)) score += 10;

  // 冲减20分
  if (relations.chong === sign) score -= 20;

  // 害减10分
  if (relations.hai === sign) score -= 10;

  // 刑减15分
  if (relations.xing === sign) score -= 15;

  // 生肖五行与日干五行相生加10分
  const elementRelations = { '木': { '生': '火', '克': '土' }, '火': { '生': '土', '克': '金' }, '土': { '生': '金', '克': '水' }, '金': { '生': '水', '克': '木' }, '水': { '生': '木', '克': '火' } };
  if (elementRelations[element]?.['生'] === rizhuWuxing) score += 10;

  // 确保在55-95范围内
  return Math.max(55, Math.min(95, score));
}

/**
 * 生成运势判断词
 */
function getVerdict(score, relations, zodiacSign) {
  if (relations.chong === zodiacSign || relations.xing === zodiacSign) return '降低';
  if (relations.hai === zodiacSign) return '喜忧参半';
  if (relations.he === zodiacSign || relations.sanhe.includes(zodiacSign)) {
    return score >= 80 ? '上升' : '稳定';
  }
  if (score >= 85) return '上升';
  if (score >= 70) return '一般';
  return '降低';
}

/**
 * 生成工作/事业描述（扩展到150字）
 */
function generateWorkText(name, verdict, relations, zodiacSign) {
  const isHe = relations.he === zodiacSign || relations.sanhe.includes(zodiacSign);
  const isChong = relations.chong === zodiacSign;
  const isHai = relations.hai === zodiacSign;

  if (verdict === '上升') {
    return `${name}今日与天时相合，运势扶摇直上，吉星高照。工作上贵人暗助，有想法尽管提，很可能得到认可和采纳。今日适合主动出击，求职、面试、谈合作都有好结果。领导对你印象不错，可能会有意外的表扬或奖励降临。注意把握机遇，错过可能需要再等很久。另外，今天也适合整理工作环境或计划接下来的安排，会有新的灵感涌现。`;
  }
  if (verdict === '降低' || isChong) {
    return `${name}今日运势受阻，工作上容易犯小人，可能被领导或同事挑剔，凡事多留个心眼。有可能在文书、合同、报表上出现小失误，提交前一定要仔细核对三遍。保持低调谦虚的态度，遇事多忍让，不要强出头。今日适合处理日常事务，不宜做重大决策或冒险尝试。与同事沟通时注意语气，避免引起不必要的误会。`;
  }
  if (verdict === '喜忧参半') {
    return `今日工作上能够自我反省和总结，容易获得领导认可，但也要小心同事间的竞争，有人可能在暗中观察你的一举一动。稳中求进是今日的关键词，不要急于表现自己，踏实地完成手头的工作比什么都重要。今日适合做一些幕后的准备工作，为接下来的项目打基础。`;
  }
  return `今日工作平稳，做事按部就班，不会有太大波澜。适合处理日常事务，按计划推进即可，不必追求大突破。有小问题及时沟通解决，不要积压。稳扎稳打就是在为明天蓄力，今天的每一份付出都会在未来的某个时刻得到回报。`;
}

/**
 * 生成财运描述（扩展到100字）
 */
function generateMoneyText(verdict, score) {
  if (verdict === '上升') {
    return `正财收入稳定，可能会有额外奖金或加薪的好消息传来。偏财也有小惊喜，适合投资理财，但要见好就收，不宜贪心。今天适合关注与金钱相关的信息，比如账单、账目核对等，可能会发现之前遗漏的收支。如果有借贷或合作财务的机会，今天可以积极洽谈，但记得签合同前仔细看清每一条款。`;
  }
  if (verdict === '降低') {
    return `今日有小额钱财入账但守不住，因为有冲动消费倾向，购物或网络支付时要三思而后行。建议提前做好预算计划，把该存的先存起来，不要留太多现金在手边。今天也不适合做任何形式的投机行为，包括股票、彩票、赌博等。守现有资产为主，避免冒险。如果有人向你借钱或推销投资产品，果断拒绝为妙。`;
  }
  return `今日求稳为主，不宜做重大财务决策，偏财运一般，远离投机行为，保守理财为上策。今天在花钱方面要有所克制，非必要的消费尽量推迟到明天。同时这也是一个盘点财务状况的好日子，整理收支记录，制定接下来的储蓄计划，会有不错的收获。`;
}

/**
 * 生成感情描述（扩展到120字）
 */
function generateLoveText(name, verdict, isHe, isChong, zodiacSign) {
  if (verdict === '上升' || isHe) {
    return `感情上，单身${name}今日桃花运非常不错，有机会遇到心仪对象，勇敢表达会有惊喜！无论是社交场合还是日常相处，都散发着独特的魅力，吸引异性的目光。已婚或有伴侣者感情甜蜜默契，两人之间沟通顺畅，适合计划未来的事情，比如旅行、买房等人生大事。今日也适合与伴侣共进晚餐，重温浪漫时光。`;
  }
  if (verdict === '降低' || isChong) {
    return `感情上要谨慎，已婚或有伴侣者应避免与异性走得太近，以免引起误会。单身${name}今日桃花运较弱，不宜表白或推进感情，维持现状就好。今天在感情方面可能会感到有些孤独或失落，但这是暂时的，不妨把精力放在自我提升上，比如学习新技能、培养新爱好，缘分会在合适的时候到来。`;
  }
  if (verdict === '喜忧参半') {
    return `感情上今日容易受外界干扰，身边可能出现让你心动的异性，但要仔细分辨是好感还是一时冲动，不妨冷静下来好好审视眼前人，三思而后行。已婚者要警惕第三者的介入，有话好好说，多站在对方的角度思考问题。今日适合与伴侣进行深度沟通，聊聊彼此的想法和感受。`;
  }
  return `感情上，已婚或有伴侣的${name}要多花时间陪伴另一半，多沟通多关心，不要让忙碌成为忽略感情的借口。单身${name}今日桃花运普通，不必刻意强求，缘分到了自然会有。可以多参加一些社交活动拓宽圈子，或者把注意力放在自我成长上。今日适合学习如何更好地表达爱意和接收来自他人的情感。`;
}

/**
 * 生成健康描述（扩展到80字）
 */
function generateHealthText(verdict, rizhuWuxing) {
  if (verdict === '降低') {
    const healthTips = rizhuWuxing === '火' ? '心血管' : rizhuWuxing === '水' ? '肾泌尿' : '肠胃';
    return `健康上要注意${healthTips}系统，今日操劳过度容易疲劳，免疫力可能会有所下降，容易感冒或出现一些小毛小病。要主动给自己减压，保证充足睡眠，不要硬撑，身体是革命的本钱。建议晚上早点休息，泡泡脚放松一下。`;
  }
  if (verdict === '上升') {
    return `健康状态良好，精神饱满，状态全天在线，精力充沛，适合运动锻炼或户外活动。今天也是调理身体的好日子，可以尝试一些新的健康习惯，比如晨跑、瑜伽或者调整饮食结构。你的身体状态非常配合你的行动，坚持下去会有意想不到的收获。`;
  }
  return `健康方面注意肠胃保养，饮食宜清淡有节制，整体状态平稳，注意劳逸结合。今天适合进行一些温和的锻炼，比如散步、太极等，不要做过于剧烈的运动。如果有时间，可以给自己安排一次体检或者健康咨询，防患于未然。`;
}

/**
 * 生成宜忌
 */
function generateYiJi(wuxing) {
  const yiMap = {
    '木': ['栽种', '入学', '祈福'], '火': ['开业', '交易', '出行'],
    '土': ['修造', '动土', '安床'], '金': ['求财', '投资', '纳财'],
    '水': ['出行', '搬家', '沐浴'],
  };
  const jiMap = {
    '木': ['搬家', '动土'], '火': ['安葬', '诉讼'],
    '土': ['开业', '动土'], '金': ['搬家', '安床'],
    '水': ['开业', '安葬'],
  };
  return { yi: yiMap[wuxing] || ['祈福', '出行'], ji: jiMap[wuxing] || ['动土', '安葬'] };
}

/**
 * 生成单条中文运势（目标300-500字）
 */
function generateFortuneCN(zodiac, ganzhi, relations) {
  const { name, sign } = zodiac;
  const score = calculateScore(zodiac, ganzhi, relations, ganzhi.wuxing);
  const verdict = getVerdict(score, relations, sign);

  const workText = generateWorkText(name, verdict, relations, sign);
  const moneyText = generateMoneyText(verdict, score);
  const loveText = generateLoveText(name, verdict, relations.he === sign || relations.sanhe.includes(sign), relations.chong === sign, sign);
  const healthText = generateHealthText(verdict, ganzhi.wuxing);
  const { yi, ji } = generateYiJi(ganzhi.wuxing);

  // 生成判断句（扩展到60字）
  let verdictIntro = '';
  if (verdict === '上升') {
    verdictIntro = `${name}今日运势扶摇直上，吉星高照，多年积累的人脉和努力即将开花结果。无论是工作、财运还是感情，都有惊喜在等着你，是难得的好日子，好好把握不要浪费。`;
  } else if (verdict === '降低') {
    verdictIntro = `${name}今日运势走低，不利因素较多，做事容易事倍功半。保持低调谦和的心态，凡事多留一个心眼，不要做出冲动的决定或冒险的举动。今天的核心是「守」，守住现有的成果比追求新的突破更重要。`;
  } else if (verdict === '喜忧参半') {
    verdictIntro = `${name}今日运势喜忧参半，如同硬币的两面，有让你开心的事，也有需要你冷静应对的挑战。机遇与风险并存，需要你有一双慧眼去分辨，更需要一颗沉稳的心去应对。乐观但不盲目，积极但不失理性。`;
  } else {
    verdictIntro = `${name}今日运势平稳，做事按部就班，不会有太大波澜。如同平静的湖面，适合整理思绪、规划未来。不必急于求成，今天的每一步都是在为明天的爆发积蓄力量。`;
  }

  // 生成结尾提醒（扩展到40字）
  let tipText = verdict === '上升'
    ? `今日宜${yi[0]}、${yi[1]}，好好把握这难得的好运势。机会不等人，错过可能需要再等一年。`
    : verdict === '降低'
    ? `今日诸事小心，能不折腾就不折腾，多静少动，不要给自己找麻烦。遇事多请教身边可信的朋友。`
    : verdict === '喜忧参半'
    ? `保持清醒的头脑，不要被表面的风光迷惑。今日适合规划多于行动，三思而后行是明智之选。`
    : `整体以静制动，不要强出头。稳扎稳打，熬过今天明天就会好转，耐心是今日最重要的品质。`;

  const content = verdictIntro + workText + moneyText + loveText + healthText + tipText;

  return {
    score,
    verdict,
    content,
    yi,
    ji,
    length: content.length,
  };
}

/**
 * 生成英文运势（SEO优化版，async 调用 AI 翻译）
 */
async function generateFortuneEN(zodiac, cnData, ganzhi) {
  const { key, name, en } = zodiac;
  const { verdict, content, score } = cnData;

  const verdictMap = {
    '上升': 'Rising luck - an excellent day for all endeavors',
    '降低': 'Challenging energy - caution and restraint recommended',
    '一般': 'Balanced day - steady progress without major fluctuations',
    '喜忧参半': 'Mixed fortune - opportunities balanced with challenges',
    '稳定': 'Stable energy - consistent and predictable day',
  };

  const enContent = await translateToEnglish(content, en, verdict, key);

  return {
    keywords: null,
    verdict: verdictMap[verdict] || verdict,
    content: enContent,
    score,
    length: enContent.length,
  };
}

/**
 * 中译英（接入 DashScope API，扩展到300-500词，带SEO大词）
 */
async function translateToEnglish(cnText, zodiacEn, verdict, zodiacKey) {
  const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
  const DASHSCOPE_MODEL = 'qwen-plus';
  const DASHSCOPE_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

  // SEO 分层关键词（head / longTail / semantic）
  const seoTerms = {
    rat: {
      head: 'Chinese zodiac Rat, Rat daily horoscope, Rat fortune today',
      longTail: 'Rat horoscope today love, Rat career money prediction, what is Rat fortune today, Rat daily predictions, Rat zodiac compatibility reading',
      semantic: 'Five Elements water, Wu Xing Rat element, Rat personality Chinese astrology, Rat lucky numbers and directions'
    },
    ox: {
      head: 'Chinese zodiac Ox, Ox daily horoscope, Ox fortune today',
      longTail: 'Ox horoscope today love, Ox career money prediction, what is Ox fortune today, Ox daily predictions, Ox zodiac compatibility',
      semantic: 'Five Elements earth, Wu Xing Ox element, Ox personality traits, Ox lucky numbers and directions'
    },
    tiger: {
      head: 'Chinese zodiac Tiger, Tiger daily horoscope, Tiger fortune today',
      longTail: 'Tiger horoscope today love, Tiger career prediction, Tiger money luck today, Tiger daily zodiac reading',
      semantic: 'Five Elements wood, Wu Xing Tiger element, Tiger personality Chinese astrology, Tiger lucky directions'
    },
    rabbit: {
      head: 'Chinese zodiac Rabbit, Rabbit daily horoscope, Rabbit fortune today',
      longTail: 'Rabbit horoscope today love, Rabbit career money prediction, Rabbit daily zodiac reading, Rabbit love compatibility',
      semantic: 'Five Elements wood, Wu Xing Rabbit element, Rabbit personality traits, Rabbit lucky numbers'
    },
    dragon: {
      head: 'Chinese zodiac Dragon, Dragon daily horoscope, Dragon fortune today',
      longTail: 'Dragon horoscope today love, Dragon career money prediction, Dragon daily predictions 2026, Dragon zodiac power',
      semantic: 'Five Elements earth, Wu Xing Dragon element, Dragon personality Chinese astrology, Dragon lucky directions'
    },
    snake: {
      head: 'Chinese zodiac Snake, Snake daily horoscope, Snake fortune today',
      longTail: 'Snake horoscope today love, Snake career prediction, Snake money luck today, Snake daily zodiac reading',
      semantic: 'Five Elements fire, Wu Xing Snake element, Snake personality traits, Snake lucky numbers and directions'
    },
    horse: {
      head: 'Chinese zodiac Horse, Horse daily horoscope, Horse fortune today',
      longTail: 'Horse horoscope today love, Horse career money prediction, Horse daily predictions, Horse zodiac compatibility',
      semantic: 'Five Elements fire, Wu Xing Horse element, Horse personality Chinese astrology, Horse lucky directions'
    },
    goat: {
      head: 'Chinese zodiac Goat, Goat daily horoscope, Goat fortune today',
      longTail: 'Goat horoscope today love, Goat career money prediction, Goat daily zodiac reading, Goat love compatibility',
      semantic: 'Five Elements earth, Wu Xing Goat element, Goat personality traits, Goat lucky numbers'
    },
    monkey: {
      head: 'Chinese zodiac Monkey, Monkey daily horoscope, Monkey fortune today',
      longTail: 'Monkey horoscope today love, Monkey career prediction, Monkey money luck today, Monkey daily zodiac reading',
      semantic: 'Five Elements metal, Wu Xing Monkey element, Monkey personality Chinese astrology, Monkey lucky directions'
    },
    rooster: {
      head: 'Chinese zodiac Rooster, Rooster daily horoscope, Rooster fortune today',
      longTail: 'Rooster horoscope today love, Rooster career money prediction, Rooster daily predictions, Rooster zodiac compatibility',
      semantic: 'Five Elements metal, Wu Xing Rooster element, Rooster personality traits, Rooster lucky numbers and directions'
    },
    dog: {
      head: 'Chinese zodiac Dog, Dog daily horoscope, Dog fortune today',
      longTail: 'Dog horoscope today love, Dog career prediction, Dog money luck today, Dog daily zodiac reading',
      semantic: 'Five Elements earth, Wu Xing Dog element, Dog personality Chinese astrology, Dog lucky directions'
    },
    pig: {
      head: 'Chinese zodiac Pig, Pig daily horoscope, Pig fortune today',
      longTail: 'Pig horoscope today love, Pig career money prediction, Pig daily predictions, Pig zodiac compatibility reading',
      semantic: 'Five Elements water, Wu Xing Pig element, Pig personality traits, Pig lucky numbers and directions'
    },
  };

  const verdictMap = {
    '上升': 'Rising luck - an excellent day ahead',
    '降低': 'Challenging day - proceed with caution',
    '一般': 'Balanced day - steady progress expected',
    '喜忧参半': 'Mixed fortune - opportunities and challenges',
    '稳定': 'Stable energy - consistent day ahead',
  };

  // 如果有 DashScope API Key，用 AI 翻译
  if (DASHSCOPE_API_KEY) {
    try {
      const seo = seoTerms[zodiacKey] || seoTerms.rat;
      const systemPrompt = `You are a professional Chinese metaphysics content expert, specializing in translating Chinese astrology content into natural English for Western audiences.

## Translation Requirements
1. **SEO Optimization**: Include key phrases like "Chinese zodiac [Animal]", "[Animal] daily horoscope", "[Animal] fortune today" in titles and first paragraph
2. **Wu Xing Terminology**: Use proper Five Elements terminology - Wood, Fire, Earth, Metal, Water
3. **Tone**: Natural Western astrology website style, conversational but professional
4. **Length**: 400-500 words per fortune, detailed but engaging
5. **Structure**: Title → Overview → Career → Finance → Love → Health → Summary

## SEO Keywords to Naturally Integrate
### Head Terms (use in title and first paragraph):
${seo.head}

### Long-tail Keywords (distribute naturally in body paragraphs, 3-5 times):
${seo.longTail}

### Semantic Terms (use for content depth and FAQ section):
${seo.semantic}

## Verdict Translation
- 上升 → "Rising luck" / "Excellent day ahead"
- 降低 → "Challenging day" / "Proceed with caution"
- 一般 → "Balanced day" / "Steady progress"
- 喜忧参半 → "Mixed fortune" / "Opportunities with challenges"
- 稳定 → "Stable energy" / "Consistent day"

Translate the following ${zodiacEn} daily horoscope from Chinese to English, maintaining the SEO keywords and professional tone:`;

      const res = await fetch(`${DASHSCOPE_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DASHSCOPE_API_KEY}`
        },
        body: JSON.stringify({
          model: DASHSCOPE_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: cnText }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (res.ok) {
        const data = await res.json();
        const translated = data.choices?.[0]?.message?.content;
        if (translated) {
          console.log(`   🌐 AI翻译成功 (${translated.length} chars)`);
          return translated;
        }
      } else {
        console.warn(`   ⚠️ DashScope API error: ${res.status}`);
      }
    } catch (err) {
      console.warn(`   ⚠️ Translation error: ${err.message}`);
    }
  }

  // Fallback: 硬编码英文版（无 API 时使用）
  console.log(`   📝 使用模板英文版`);
  let enText = '';

  if (verdict === '上升') {
    enText = `Chinese zodiac ${zodiacEn} Daily Horoscope - Rising Luck Ahead\n\n`;
    enText += `The ${zodiacEn} is graced with exceptional celestial energy today, making this one of the most favorable periods for pursuing your goals. Your natural talents and accumulated efforts are well-supported by the Wu Xing elemental forces, creating ideal conditions for breakthrough moments in career, finance, and relationships.\n\n`;
    enText += `Career and Work: The ${zodiacEn} can expect positive developments in professional matters. If you have been considering a job change, asking for a raise, or launching a new project, today presents optimal timing. Your communication skills are enhanced, making it an excellent day for negotiations, presentations, or pitching ideas to decision-makers. Trust your instincts and express your thoughts with confidence.\n\n`;
    enText += `Financial Fortune: Your financial luck shows promising signs today. Steady income streams are reinforced, and there may be unexpected monetary gains or windfalls. This is a good time to review investment portfolios, though remember to exercise prudent judgment rather than chasing high-risk opportunities.\n\n`;
    enText += `Love and Relationships: For singles, romantic opportunities may arise in social settings or through mutual connections. Your charm and charisma are naturally elevated today, attracting potential partners. Those in committed relationships can benefit from open communication and planning shared future experiences together.\n\n`;
    enText += `Health and Wellness: Your physical condition remains robust. This is an excellent day for exercise, outdoor activities, or starting new wellness routines. Channel this positive energy into maintaining healthy habits.\n\n`;
    enText += `Overall, the ${zodiacEn} enjoys a day of favorable conditions. Seize the opportunities that present themselves today.`;
  } else if (verdict === '降低') {
    enText = `Chinese zodiac ${zodiacEn} Daily Horoscope - Proceed with Caution\n\n`;
    enText += `The ${zodiacEn} faces challenging celestial influences today, requiring careful navigation of affairs and a generally conservative approach. While the energy may feel restrictive, this period offers valuable lessons in patience and strategic restraint.\n\n`;
    enText += `Career and Work: Professional matters may encounter obstacles or delays today. Interpersonal dynamics could be tense, making it wise to maintain a low profile and avoid confrontations. Focus on completing routine tasks competently rather than pursuing ambitious projects. Double-check all documents for errors.\n\n`;
    enText += `Financial Fortune: Guard your resources carefully today. Impulsive spending or high-risk investments are strongly discouraged. Prioritize paying existing bills and debts rather than taking on new financial obligations.\n\n`;
    enText += `Love and Relationships: Relationships require extra attention and sensitivity. Married individuals should avoid getting too close to members of the opposite sex. Single ${zodiacEn} may find romantic prospects subdued today.\n\n`;
    enText += `Health and Wellness: Pay attention to your physical well-being. Prioritize adequate rest, maintain a balanced diet, and avoid strenuous activities. This challenging period is temporary; maintaining composure now will position you favorably when circumstances improve.`;
  } else {
    enText = `Chinese zodiac ${zodiacEn} Daily Horoscope - Steady Progress\n\n`;
    enText += `The ${zodiacEn} can expect a balanced and steady day, with no dramatic shifts in fortune but consistent progress across various life areas. This stable energy provides an ideal foundation for maintaining routines, organizing thoughts, and preparing for future opportunities.\n\n`;
    enText += `Career and Work: Your professional activities will proceed smoothly without major obstacles. This is a productive day for handling daily responsibilities and maintaining the momentum of ongoing projects. Focus on refining your current approach and building upon established foundations.\n\n`;
    enText += `Financial Fortune: Your financial situation remains stable today. This is an excellent time for financial housekeeping: reviewing budgets, tracking expenses, and planning savings strategies.\n\n`;
    enText += `Love and Relationships: For those in relationships, today offers opportunities to strengthen bonds through small gestures of care. Single ${zodiacEn} may find that romantic opportunities are modest but present.\n\n`;
    enText += `Health and Wellness: Maintain your current health routines without making dramatic changes. Every small step forward contributes to larger goals over time. Patience and persistence are your allies.`;
  }

  return enText;
}

/**
 * 生成幸运数字（基于日期Hash）
 */
function generateLuckyNumber(dateStr, zodiacKey) {
  const hash = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const base = (hash + zodiacKey.length) % 9 + 1;
  return base;
}

/**
 * 生成幸运方位
 */
function generateLuckyDirection(dizhi) {
  const directionMap = { '子': '正北', '丑': '东北', '寅': '东北', '卯': '正东', '辰': '东南', '巳': '东南', '午': '正南', '未': '西南', '申': '西南', '酉': '正西', '戌': '西北', '亥': '西北' };
  return directionMap[dizhi] || '正北';
}

/**
 * 生成六合生肖
 */
function generatePairSign(sign) {
  return LIUHE[sign] || '龙';
}

/**
 * 生成金句
 * 优先级：节日 > 节气 > 顺序循环（100条）
 * 顺序循环：以2026-01-01为起点，每过一天序号+1，循环周期100天
 */
function generateDailyQuote(dateStr) {
  const solarTerm = getSolarTerm(dateStr);
  const festival = getFestival(dateStr);

  if (festival) {
    return FESTIVAL_QUOTES[festival] || festival;
  }
  if (solarTerm) {
    return SOLAR_TERM_QUOTES[solarTerm] || `节气更迭，顺应天时。`;
  }

  // 顺序循环：从 epoch 到 date 的天数 % 100 = 今日金句序号
  const epoch = new Date('2026-01-01');
  const current = new Date(dateStr);
  const daysSinceEpoch = Math.floor((current - epoch) / (24 * 60 * 60 * 1000));
  return BASE_QUOTES[Math.abs(daysSinceEpoch) % BASE_QUOTES.length];
}

/**
 * 更新 zodiac-data.js
 */
function updateDataFile(date, fortunes) {
  let content = fs.readFileSync(DATA_FILE, 'utf8');

  // 生成JS格式的日期数据块
  const blockLines = ZODIAC_LIST.map(z => {
    const f = fortunes[z.key];
    return `    "${z.key}":     { score: ${f.score}, color: "${WUXING_COLORS[z.element]?.hex || '#D4AF37'}", colorName: "${WUXING_COLORS[z.element]?.name || '金色'}", number: ${f.luckyNum}, direction: "${f.direction}", pair: "${f.pair}",     good: ${JSON.stringify(f.yi)},        avoid: ${JSON.stringify(f.ji)},       quote: "${f.quote}" }`;
  });

  const newBlock = `\n  "${date}": {\n${blockLines.join(',\n')}\n  },\n`;

  // 检查是否已有该日期数据
  const dateRegex = new RegExp(`"${date}":\\s*\\{`);
  if (dateRegex.test(content)) {
    // 替换已有数据
    const startMatch = content.match(dateRegex);
    const start = content.indexOf(startMatch[0]);
    let braceCount = 0, end = start;
    for (let i = start; i < content.length; i++) {
      if (content[i] === '{') braceCount++;
      if (content[i] === '}') braceCount--;
      if (braceCount === 0) { end = i + 1; break; }
    }
    content = content.slice(0, start) + newBlock.trim() + content.slice(end);
  } else {
    // 在 "default" 块结束后插入
    const defaultRegex = /"default":\s*\{/g;
    const defaultMatch = defaultRegex.exec(content);
    if (defaultMatch) {
      const defaultStart = defaultMatch.index;
      let braceCount = 0, defaultEnd = defaultStart;
      for (let i = defaultStart; i < content.length; i++) {
        if (content[i] === '{') braceCount++;
        if (content[i] === '}') braceCount--;
        if (braceCount === 0 && i > defaultStart) {
          defaultEnd = i + 1; // 包含 '}'
          break;
        }
      }
      // 跳过 default 块后面的逗号和空白
      while (defaultEnd < content.length && /[,\s]/.test(content[defaultEnd])) {
        defaultEnd++;
      }
      content = content.slice(0, defaultEnd) + newBlock + content.slice(defaultEnd);
    }
  }

  fs.writeFileSync(DATA_FILE, content, 'utf8');
  console.log('✅ zodiac-data.js 已更新');
}

/**
 * 保存SEO内容JSON
 */
function saveSeoContent(date, fortunesCN, fortunesEN, quote, ganzhi) {
  if (!fs.existsSync(SEO_DIR)) {
    fs.mkdirSync(SEO_DIR, { recursive: true });
  }

  const data = {
    date,
    generatedAt: new Date().toISOString(),
    ganzhi: {
      ganzhi: ganzhi.ganzhi,
      wuxing: ganzhi.wuxing,
      tiangan: ganzhi.tiangan,
      dizhi: ganzhi.dizhi,
    },
    fortunes: fortunesCN,
    fortunesEn: fortunesEN,
    quote,
  };

  fs.writeFileSync(
    path.join(SEO_DIR, `${date}.json`),
    JSON.stringify(data, null, 2),
    'utf8'
  );
  console.log(`✅ SEO内容已保存: zodiac/seo-content/${date}.json`);
}

// ════════════════════════════════════════════════════════════
// 主流程
// ════════════════════════════════════════════════════════════

async function main() {
  const dateStr = process.argv[2] || new Date().toISOString().split('T')[0];
  console.log(`\n🚀 开始生成 ${dateStr} 生肖运势...\n`);

  // ① 计算天干地支
  const date = new Date(dateStr + 'T00:00:00+08:00');
  const ganzhi = calculateGanzhi(date);
  const relations = getRelations(ganzhi.dizhi);

  console.log('📅 今日黄历:');
  console.log(`   干支: ${ganzhi.ganzhi}（${ganzhi.wuxing}）`);
  console.log(`   冲: ${relations.chong}  |  六合: ${relations.he}  |  害: ${relations.hai}  |  三合: ${relations.sanhe.join(',')}`);

  // ② 生成金句
  const quote = generateDailyQuote(dateStr);
  const solarTerm = getSolarTerm(dateStr);
  const festival = getFestival(dateStr);
  console.log(`\n✨ 今日金句: ${quote}${solarTerm ? ` [${solarTerm}]` : festival ? ' [节日]' : ''}`);

  // ③ 生成12生肖运势
  console.log('\n✍️  生成中文运势:');
  const fortunesCN = {};
  ZODIAC_LIST.forEach(z => {
    const f = generateFortuneCN(z, ganzhi, relations);
    const luckyNum = generateLuckyNumber(dateStr, z.key);
    const direction = generateLuckyDirection(ganzhi.dizhi);
    const pair = generatePairSign(z.sign);

    fortunesCN[z.key] = {
      ...f,
      luckyNum,
      direction,
      pair,
      quote,
      yi: f.yi,
      ji: f.ji,
      // 博客导流（中文：/zh/blog/，英文：/blog/）
      blogLinksCN: (BLOG_RECOMMENDATIONS[z.key] || []).map(b => ({
        url: `/zh/blog/${b.slug}`,
        title: b.titleCN,
      })),
      blogLinksEN: (BLOG_RECOMMENDATIONS[z.key] || []).map(b => ({
        url: `/blog/${b.slug}`,
        title: b.titleEN,
      })),
    };

    console.log(`   ${z.name} ${z.sign}: ${f.verdict} | 幸运数${luckyNum} | ${direction} | ${pair} | ${f.content.length}字`);
  });

  // ④ 生成英文运势
  console.log('\n🌐 生成英文运势:');
  const fortunesEN = {};
  for (const z of ZODIAC_LIST) {
    const fortuneEN = await generateFortuneEN(z, fortunesCN[z.key], ganzhi);
    // 注入英文博客导流链接（/blog/ 前缀）
    fortuneEN.blogLinksEN = (BLOG_RECOMMENDATIONS[z.key] || []).map(b => ({
      url: `/blog/${b.slug}`,
      title: b.titleEN,
    }));
    fortunesEN[z.key] = fortuneEN;
    console.log(`   ${z.en}: ${fortunesEN[z.key].verdict.slice(0, 40)}... (${fortunesEN[z.key].length} words)`);
  }

  // ⑤ 保存文件
  console.log('\n💾 保存文件...');
  saveSeoContent(dateStr, fortunesCN, fortunesEN, quote, ganzhi);
  updateDataFile(dateStr, fortunesCN);

  // ⑥ Git指令
  console.log('\n📦 Git 提交指令:');
  console.log(`   git add zodiac/js/zodiac-data.js zodiac/seo-content/${dateStr}.json`);
  console.log(`   git commit -m "chore: ${dateStr} daily horoscope update"`);
  console.log(`   git push`);
  console.log('\n✅ 生成完成！\n');
}

main().catch(console.error);
