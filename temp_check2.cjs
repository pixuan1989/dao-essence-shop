const fs = require('fs');
const html = fs.readFileSync('./zodiac/rat-en.html', 'utf8');
const idx = html.indexOf('"en":{');
const line = html.substring(idx, idx + 400);
console.log(line);
