/**
 * 测试排盘引擎：获取2026-05-19的四柱
 */
// 加载排盘引擎（eval 到全局）
const fs = await import('fs');
// stub window/globalThis for browser compat
globalThis.window = globalThis;
globalThis.document = { cookie: '' };
const code = fs.default.readFileSync('./bazi-calculator/paipan.js', 'utf8');
(0, eval)(code);

// 2026-05-19，中午12点（取中间时辰代表日柱）
const yy = 2026, mm = 5, dd = 19, hh = 12, mt = 0, ss = 0;

const p = new paipan();
const [tg, dz, ob] = p.GetGZ(yy, mm, dd, hh, mt, ss);

const stems = p.ctg;  // 天干: 0=甲, 1=乙, ...
const branches = p.cdz; // 地支: 0=子, 1=丑, ...
const gz = p.gz; // 六十甲子完整数组

console.log('=== 2026-05-19 四柱 ===');
console.log(`年柱: ${gz[tg[0]*12 + dz[0]]} | 天干${stems[tg[0]]} | 地支${branches[dz[0]]} | 五行${p.wxtg[tg[0]]}`);
console.log(`月柱: ${gz[tg[1]*12 + dz[1]]} | 天干${stems[tg[1]]} | 地支${branches[dz[1]]} | 五行${p.wxtg[tg[1]]}`);
console.log(`日柱: ${gz[tg[2]*12 + dz[2]]} | 天干${stems[tg[2]]} | 地支${branches[dz[2]]} | 五行${p.wxtg[tg[2]]}`);
console.log(`时柱: ${gz[tg[3]*12 + dz[3]]} | 天干${stems[tg[3]]} | 地支${branches[dz[3]]} | 五行${p.wxtg[tg[3]]}`);
console.log('\n隐藏干:');
console.log('  年支藏干:', ob[0].map(i => stems[i]).join(', '));
console.log('  月支藏干:', ob[1].map(i => stems[i]).join(', '));
console.log('  日支藏干:', ob[2].map(i => stems[i]).join(', '));
console.log('  时支藏干:', ob[3].map(i => stems[i]).join(', '));

// 构建 AI 输入数据
const fourPillars = {
  year: { ganzhi: gz[tg[0]*12+dz[0]], stem: stems[tg[0]], branch: branches[dz[0]], wuxing: p.wxtg[tg[0]] },
  month: { ganzhi: gz[tg[1]*12+dz[1]], stem: stems[tg[1]], branch: branches[dz[1]], wuxing: p.wxtg[tg[1]] },
  day: { ganzhi: gz[tg[2]*12+dz[2]], stem: stems[tg[2]], branch: branches[dz[2]], wuxing: p.wxtg[tg[2]] },
  hour: { ganzhi: gz[tg[3]*12+dz[3]], stem: stems[tg[3]], branch: branches[dz[3]], wuxing: p.wxtg[tg[3]] }
};

console.log('\n=== AI 输入 JSON ===');
console.log(JSON.stringify(fourPillars, null, 2));
