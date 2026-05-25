const fs = require('fs');
let c = fs.readFileSync('almanac.html', 'utf8');

// 1. Remove ALL btn-icon spans (which contain emojis)
c = c.replace(/<span class="btn-icon">.*?<\/span>/g, '');

// 2. Add flex centering to select-btn
c = c.replace(/\.select-btn\s*\{/, '.select-btn {\n            display: flex; align-items: center; justify-content: center;');

fs.writeFileSync('almanac.html', c, 'utf8');
console.log('Done');
