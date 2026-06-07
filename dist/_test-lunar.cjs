const {Solar} = require('lunar-javascript');
const s = Solar.fromYmd(2026,4,19);
const l = s.getLunar();

// Test basic outputs
console.log('=== Basic ===');
console.log('YearGanZhi:', l.getYearInGanZhi());
console.log('MonthGanZhi:', l.getMonthInGanZhi());
console.log('DayGanZhi:', l.getDayInGanZhi());
console.log('Zodiac:', l.getYearShengXiao());

console.log('\n=== Try all relevant methods ===');
const methods = [
  'getDayInGanZhi', 'getDayInGanZhiExact',
  'getDayYi', 'getDayJi', 'getDayYiExact', 'getDayJiExact',
  'getDayChongDesc', 'getDaySha',
  'getDayPositionXi', 'getDayPositionXiDesc',
  'getDayPositionFu', 'getDayPositionFuDesc',
  'getDayPositionCai', 'getDayPositionCaiDesc',
  'getDayPositionGui', 'getDayPositionGuiDesc',
  'getDayTwelveStar',
  'getDayStar', 'getDayNineStar',
  'getDayLu', 'getDayTaiSui',
  'getYearTaiSui',
  'getMonthTaiSui',
  'getNaYin',
  'getDayNaYin',
];

methods.forEach(m => {
  try {
    const v = l[m]();
    console.log(`${m}: ${v !== null && v !== undefined ? v : 'null'}`);
  } catch(e) {
    console.log(`${m}: ERROR - ${e.message}`);
  }
});

// Try to iterate prototype chain deeper
console.log('\n=== All prototype methods ===');
let obj = l;
while (obj !== null && obj !== Object.prototype) {
  const own = Object.getOwnPropertyNames(obj);
  own.filter(k => k.startsWith('get')).forEach(k => {
    if (typeof l[k] === 'function') {
      try {
        const v = l[k]();
        if (v !== null && v !== undefined) {
          const t = typeof v;
          if (t === 'string' || t === 'number' || t === 'boolean') {
            console.log(`${k}: ${v}`);
          }
        }
      } catch(e) {}
    }
  });
  obj = Object.getPrototypeOf(obj);
}
