import fs from 'fs';
import path from 'path';

const filePath = 'C:\\Users\\agenew\\Desktop\\DaoEssence1.0\\js\\bazi-share.js';
let c = fs.readFileSync(filePath, 'utf8');

// 修复第197行：把 /\sfill= 改成 /fill= （不要把前面空格吞掉）
c = c.replace(/\/\\sfill="/g, '/fill="');

console.log('Done: fixed regex in createPanel');
