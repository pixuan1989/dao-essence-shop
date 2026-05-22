const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const dirs = [
  path.join(__dirname, 'blog/posts'),
  path.join(__dirname, 'blog/posts-zh')
];

const errors = [];

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  for (const file of files) {
    const fp = path.join(dir, file);
    const content = fs.readFileSync(fp, 'utf-8');
    if (!content.startsWith('---')) continue;
    const endIdx = content.indexOf('\n---', 3);
    if (endIdx === -1) continue;
    const fmText = content.slice(3, endIdx);
    try {
      yaml.safeLoad(fmText);
    } catch (e) {
      errors.push({ file: fp.replace(__dirname + '\\', ''), line: e.mark?.line + 1, reason: e.reason, snippet: e.mark?.buffer?.slice(0, 200) });
    }
  }
}

if (errors.length === 0) {
  console.log('All files pass YAML validation.');
} else {
  console.log(`Found ${errors.length} files with YAML errors:`);
  for (const e of errors) {
    console.log(`\n${e.file} (line ~${e.line}): ${e.reason}`);
  }
}
