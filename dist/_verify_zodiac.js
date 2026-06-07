const fs = require('fs');
const c = fs.readFileSync('C:/Users/agenew/Desktop/DaoEssence1.0/zodiac/js/zodiac-data.js', 'utf8');
new Function(c);
console.log('✅ zodiac-data.js 语法验证通过');
const dates = c.match(/\d{4}-\d{2}-\d{2}/g) || [];
const uniq = [...new Set(dates)];
console.log('唯一日期数量:', uniq.length);
uniq.forEach(d => console.log(' -', d));
