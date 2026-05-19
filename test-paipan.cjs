/**
 * 测试排盘引擎：获取2026-05-19的四柱（使用fatemaps API）
 */
const fs = require('fs');
const vm = require('vm');

// stub browser globals
global.window = global;
global.document = { cookie: '' };

// 加载排盘引擎
const code = fs.readFileSync('./bazi-calculator/paipan.js', 'utf8')
  .replace('"use strict";', '')
  .replace('window.p = new paipan();', '');
vm.runInThisContext(code, { filename: 'paipan.js' });

// 2026-05-19，中午12点
const yy = 2026, mm = 5, dd = 19, hh = 12;
const p = new paipan();
const rt = p.fatemaps(0, yy, mm, dd, hh, 0, 0);

console.log('=== 2026-05-19 四柱 ===');
console.log('ctg (天干):', rt.ctg);
console.log('cdz (地支):', rt.cdz);
console.log('sz  (四柱):', rt.sz);
console.log('wxtg (天干五行):', rt.ewxtg);
console.log('wxdz (地支五行):', rt.ewxdz);
console.log('nwx (五行计数):', rt.nwx);
console.log('隐藏干 bctg:', rt.bctg);
console.log('生肖 sx:', rt.sx);
console.log('五行名称:', ['木','火','土','金','水']);

// 构建 AI 输入
const WX_CN = ['木','火','土','金','水'];
const stems = p.ctg;
const branches = p.cdz;

const fourPillars = {
  year: { ganzhi: rt.sz[0], stem: rt.ctg[0], branch: rt.cdz[0], wuxing: WX_CN[rt.ewxtg[0]] },
  month: { ganzhi: rt.sz[1], stem: rt.ctg[1], branch: rt.cdz[1], wuxing: WX_CN[rt.ewxtg[1]] },
  day: { ganzhi: rt.sz[2], stem: rt.ctg[2], branch: rt.cdz[2], wuxing: WX_CN[rt.ewxtg[2]] },
  hour: { ganzhi: rt.sz[3], stem: rt.ctg[3], branch: rt.cdz[3], wuxing: WX_CN[rt.ewxtg[3]] }
};

const hiddenStems = {
  year: rt.bctg.slice(0, 3).filter(Boolean),
  month: rt.bctg.slice(3, 6).filter(Boolean),
  day: rt.bctg.slice(6, 9).filter(Boolean),
  hour: rt.bctg.slice(9, 12).filter(Boolean)
};

const result = {
  date: '2026-05-19',
  fourPillars,
  hiddenStems,
  wuxingCount: rt.nwx.map((n, i) => ({ element: WX_CN[i], count: n })),
  zodiac: rt.sx
};

console.log('\n=== AI 输入 JSON ===');
console.log(JSON.stringify(result, null, 2));
