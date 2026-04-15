const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['dist','node_modules','.git','.vercel','scripts','docs','.workbuddy'].includes(entry.name)) continue;
      processDir(full);
    } else if (entry.name.endsWith('.html')) {
      let content = fs.readFileSync(full, 'utf8');
      const original = content;
      
      // Replace all href="xxx.html" with href="xxx"
      // But preserve index.html -> href="/"
      content = content.replace(/href="(\.\.\/)?index\.html"/g, 'href="/"');
      content = content.replace(/href="(\.\.\/)?blog\/index\.html"/g, 'href="/blog/"');
      // All other .html suffixes
      content = content.replace(/href="([^"]+)\.html"/g, 'href="$1"');
      
      if (content !== original) {
        fs.writeFileSync(full, content, 'utf8');
        console.log(`Updated: ${entry.name}`);
      }
    }
  }
}

const root = path.join(__dirname, '..');
console.log('Processing from:', root);
processDir(root);

// Verify
let total = 0;
function verify(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['dist','node_modules','.git','.vercel','scripts','docs','.workbuddy'].includes(entry.name)) continue;
      verify(full);
    } else if (entry.name.endsWith('.html')) {
      const c = fs.readFileSync(full, 'utf8');
      const m = c.match(/href="[^"]*\.html"/g);
      if (m) {
        total += m.length;
        m.forEach(x => console.log(`  ${x} in ${entry.name}`));
      }
    }
  }
}
console.log('\n--- Verification ---');
verify(root);
console.log(`Remaining .html hrefs: ${total}`);
