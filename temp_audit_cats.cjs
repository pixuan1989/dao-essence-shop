const fs = require('fs');
const path = require('path');

function countCats(dir) {
  const cats = {};
  fs.readdirSync(dir).filter(f => f.endsWith('.md')).forEach(f => {
    const content = fs.readFileSync(path.join(dir, f), 'utf8');
    const m = content.match(/^category:\s*(\S+)/m);
    const cat = m ? m[1] : 'none';
    cats[cat] = (cats[cat] || 0) + 1;
  });
  return cats;
}

function listCats(dir) {
  return fs.readdirSync(dir).filter(f => f.endsWith('.md')).map(f => {
    const content = fs.readFileSync(path.join(dir, f), 'utf8');
    const m = content.match(/^category:\s*(\S+)/m);
    return { file: f.replace('.md',''), cat: m ? m[1] : 'none' };
  });
}

console.log('=== EN categories ===');
console.log(JSON.stringify(countCats('./blog/posts'), null, 2));
console.log('\n=== EN detail ===');
console.log(JSON.stringify(listCats('./blog/posts'), null, 2));
console.log('\n=== ZH categories ===');
console.log(JSON.stringify(countCats('./blog/posts-zh'), null, 2));
console.log('\n=== ZH detail ===');
console.log(JSON.stringify(listCats('./blog/posts-zh'), null, 2));
