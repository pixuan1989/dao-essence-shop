/**
 * compare-pig-v3.cjs — 猪年运势 v3 模板化版本 vs AI 实际版本
 * 用法：node compare-pig-v3.cjs [日期 YYYY-MM-DD]
 */
const fs = require('fs');
const path = require('path');
const { getDailyFourPillars } = require('./scripts/paipan-helper.cjs');

const DATE_STR = process.argv[2] || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
const DATE_OBJ = new Date(DATE_STR + 'T12:00:00+08:00');

const LIUHE    = { '子':'丑','丑':'子','寅':'亥','亥':'寅','卯':'戌','戌':'卯','辰':'酉','酉':'辰','巳':'申','申':'巳','午':'未','未':'午' };
const LUICHONG = { '子':'午','丑':'未','寅':'申','卯':'酉','辰':'戌','巳':'亥','午':'子','未':'丑','申':'寅','酉':'卯','戌':'辰','亥':'巳' };
const XIANGHAI = { '子':'未','丑':'午','寅':'巳','卯':'辰','辰':'卯','巳':'寅','午':'丑','未':'子','申':'亥','酉':'戌','戌':'酉','亥':'申' };
const XIANGXING= { '子':'卯','卯':'子','寅':'巳','巳':'寅','申':'亥','亥':'申','丑':'戌','戌':'丑','辰':'辰','午':'午','酉':'酉','未':'未' };
const SANHE    = { '申':['子','辰'],'子':['申','辰'],'辰':['申','子'],'亥':['卯','未'],'卯':['亥','未'],'未':['亥','卯'],'寅':['午','戌'],'午':['寅','戌'],'戌':['寅','午'],'巳':['酉','丑'],'酉':['巳','丑'],'丑':['巳','酉'] };
const PIG = '亥';

function rel(dayZhi) {
  return { he:LIUHE[PIG]===dayZhi, chong:LUICHONG[PIG]===dayZhi, hai:XIANGHAI[PIG]===dayZhi, xing:XIANGXING[PIG]===dayZhi, sanhe:SANHE[PIG]?.includes(dayZhi)||false };
}
function verdict(r) {
  if (r.chong||r.xing) return '降低';
  if (r.hai) return '喜忧参半';
  if (r.he||r.sanhe) return '上升';
  return '一般';
}
function v3(v) {
  return {
    '上升':'猪今日运势扶摇直上，吉星高照，多年积累的人脉和努力即将开花结果。无论是工作、财运还是感情，都有惊喜在等着你，是难得的好日子，好好把握不要浪费。事业上执行力强，可开拓市场，领导对你刮目相看。财运亨通，偏财有望，适合小额投资。人缘佳，异性缘旺盛，单身者有望遇到心仪对象。精力充沛，适合运动出汗。',
    '降低':'猪今日运势走低，不利因素较多，做事容易事倍功半。保持低调谦和的心态，凡事多留一个心眼，不要做出冲动的决定或冒险的举动。今天的核心是「守」，守住现有的成果比追求新的突破更重要。工作上压力山大，同事之间可能因意见不合产生摩擦，宜明哲保身。有劫财迹象，忌冲动消费，投资需谨慎。感情方面容易闹脾气，谨防发火伤身体。身体方面注意胃肠道不适，避免熬夜。',
    '喜忧参半':'猪今日运势喜忧参半，如同硬币的两面，有让你开心的事，也有需要你冷静应对的挑战。机遇与风险并存，需要你有一双慧眼去分辨，更需要一颗沉稳的心去应对。工作上执行力尚可，但朋友之间可能因金钱产生纠纷。正财平稳，但暗中容易受阻，控制情绪避免花钱消灾。感情运势一般，不宜冷战，多沟通化解误会。健康方面注意失眠问题，睡前泡脚有助改善。',
    '一般':'猪今日运势平稳，做事按部就班，不会有太大波澜。如同平静的湖面，适合整理思绪、规划未来。不必急于求成，今天的每一步都是在为明天的爆发积蓄力量。工作上稳扎稳打，适合处理日常事务。财运平平，不宜大额支出。感情方面保持耐心，顺其自然。身体健康无大碍，注意休息即可。',
  }[v] || '猪今日运势平稳，做事按部就班，不会有太大波澜。如同平静的湖面，适合整理思绪、规划未来。不必急于求成，今天的每一步都是在为明天的爆发积蓄力量。工作上稳扎稳打，适合处理日常事务。财运平平，不宜大额支出。感情方面保持耐心，顺其自然。身体健康无大碍，注意休息即可。';
}

const seoDir = path.join(__dirname, 'zodiac', 'seo-content');
const seoFile = path.join(seoDir, `${DATE_STR}.json`);
if (!fs.existsSync(seoFile)) { console.error(`❌ 找不到 ${DATE_STR} 数据`); process.exit(1); }
const seo = JSON.parse(fs.readFileSync(seoFile, 'utf8'));
const pig = seo.fortunes?.pig;
if (!pig) { console.error(`❌ 无猪数据`); process.exit(1); }
const fp = getDailyFourPillars(DATE_OBJ);
const r = rel(fp.day.branch);
const vRel = verdict(r);

console.log(`\n${'='.repeat(70)}`);
console.log(` v3 模板化版本（${DATE_STR}）`);
console.log(`${'='.repeat(70)}`);
console.log(`📅 日支：${fp.day.ganzhi}（${fp.day.stem}${fp.day.branch}） | 关系：合=${r.he} 冲=${r.chong} 害=${r.hai} | verdict推演=${vRel} | AI=${pig.verdict}(${pig.score})`);
console.log(`\n── v3 模板 ──`);
console.log(v3(vRel));
console.log(`\n── AI 实际 ──`);
console.log(pig.content);
const v3kw=['吉星高照','扶摇直上','喜忧参半','硬币','慧眼','沉稳','低调谦和','按部就班'];
const aikw=['贵人','劫财','相害','相冲','六合','五行','火旺','土重','金气','水弱'];
console.log(`\n v3词命中：${v3kw.filter(k=>v3(vRel).includes(k)).length}/8 | AI术语命中：${aikw.filter(k=>pig.content.includes(k)).length}/10`);
