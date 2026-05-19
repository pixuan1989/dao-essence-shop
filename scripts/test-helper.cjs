const { getDailyFourPillars } = require('./paipan-helper.cjs');
// 东八区 2026-05-19 00:00
const r = getDailyFourPillars(new Date('2026-05-19T00:00:00+08:00'));
console.log(JSON.stringify(r, null, 2));
