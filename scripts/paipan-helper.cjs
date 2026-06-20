/**
 * paipan-helper.cjs
 * 封装排盘引擎，为 ES 模块 generate-daily.js 提供四柱计算
 * 使用 vm.runInThisContext 加载 paipan.js，避免 ES module + "use strict" 作用域问题
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// stub browser globals
global.window = global;
global.document = { cookie: '' };

// 加载排盘引擎（去掉 use strict 和末尾的 window.p 初始化）
const paipanPath = path.join(__dirname, '..', 'bazi-calculator', 'paipan.js');
const code = fs.readFileSync(paipanPath, 'utf8')
  .replace('"use strict";', '')
  .replace('window.p = new paipan();', '');
vm.runInThisContext(code, { filename: 'paipan.js' });

const WX_CN = ['木', '火', '土', '金', '水'];

/**
 * 获取完整四柱（含藏干、五行分布）
 * @param {Date} date - 日期对象（仅用于兼容，实际取年月日从参数）
 * @param {number} y - 年份（优先使用，避免时区问题）
 * @param {number} m - 月份 1-12
 * @param {number} d - 日期 1-31
 * @returns {Object} 完整四柱数据
 */
function getDailyFourPillars(date, y, m, d) {
  const yy = y || date.getFullYear();
  const mm = m || (date.getMonth() + 1);
  const dd = d || date.getDate();
  const hh = 12; // 取中午为代表时辰

  const p = new paipan();
  const rt = p.fatemaps(0, yy, mm, dd, hh, 0, 0);

  if (!rt) {
    throw new Error(`排盘失败: ${yy}-${mm}-${dd}`);
  }

  return {
    year:   { ganzhi: rt.sz[0], stem: rt.ctg[0], branch: rt.cdz[0], wuxing: WX_CN[rt.ewxtg[0]] },
    month:  { ganzhi: rt.sz[1], stem: rt.ctg[1], branch: rt.cdz[1], wuxing: WX_CN[rt.ewxtg[1]] },
    day:    { ganzhi: rt.sz[2], stem: rt.ctg[2], branch: rt.cdz[2], wuxing: WX_CN[rt.ewxtg[2]] },
    hour:   { ganzhi: rt.sz[3], stem: rt.ctg[3], branch: rt.cdz[3], wuxing: WX_CN[rt.ewxtg[3]] },
    hiddenStems: {
      year:  rt.bctg.slice(0, 3).filter(Boolean),
      month: rt.bctg.slice(3, 6).filter(Boolean),
      day:   rt.bctg.slice(6, 9).filter(Boolean),
      hour:  rt.bctg.slice(9, 12).filter(Boolean),
    },
    wuxingCount: rt.nwx.map((n, i) => ({ element: WX_CN[i], count: n })),
    zodiac: rt.sx, // 生肖（年支对应）
  };
}

module.exports = { getDailyFourPillars };
