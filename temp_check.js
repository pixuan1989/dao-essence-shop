const fs = require('fs');
const d = JSON.parse(fs.readFileSync('./zodiac/seo-content/2026-05-19.json', 'utf8'));
const c = d.fortunesEn.rat.content;
const blocks = c.split('\n\n');
console.log('Block count:', blocks.length);
blocks.slice(0, 6).forEach((b, i) => console.log('B' + i + ':', JSON.stringify(b.substring(0, 100))));
