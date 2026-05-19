const fs = require('fs');
const html = fs.readFileSync('./zodiac/rat-en.html', 'utf8');
const enStart = html.indexOf('"en":{');
const enEnd = html.indexOf('},"quote"', enStart);
const enObj = JSON.parse('{' + html.substring(enStart, enEnd + 10) + '}');
console.log('en.yi:', JSON.stringify(enObj.en.yi));
console.log('en.ji:', JSON.stringify(enObj.en.ji));
console.log('en.quote:', JSON.stringify(enObj.en.quote));
