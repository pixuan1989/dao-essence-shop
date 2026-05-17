import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, 'blog', 'posts');
const POSTS_ZH_DIR = path.join(__dirname, 'blog', 'posts-zh');

// Extract all markdown links from content
function extractLinks(content) {
  const links = [];
  // Markdown links: [text](url)
  const mdRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = mdRegex.exec(content)) !== null) {
    const url = match[2].split(' ')[0]; // remove title attrs
    if (url && !url.startsWith('http') && !url.startsWith('#') && !url.startsWith('mailto')) {
      links.push(url);
    }
    // Also include absolute URLs for checking
    if (url && url.startsWith('http') && url.includes('daoessentia.com')) {
      links.push(url);
    }
  }
  return [...new Set(links)]; // deduplicate
}

// Check a single URL
async function checkUrl(url) {
  const fullUrl = url.startsWith('http') ? url : `https://www.daoessentia.com${url}`;
  try {
    const res = await fetch(fullUrl, { method: 'HEAD', redirect: 'follow' });
    return { url, status: res.status, fullUrl };
  } catch (e) {
    return { url, status: 'ERR', fullUrl, error: e.message };
  }
}

// Main
const files = [
  ...fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md')).map(f => ({ file: f, dir: POSTS_DIR, lang: 'EN' })),
  ...fs.readdirSync(POSTS_ZH_DIR).filter(f => f.endsWith('.md')).map(f => ({ file: f, dir: POSTS_ZH_DIR, lang: 'ZH' })),
];

console.log(`Scanning ${files.length} articles for dead links...\n`);

const allLinks = new Map(); // url -> [files]

for (const { file, dir, lang } of files) {
  const filePath = path.join(dir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const links = extractLinks(content);
  
  for (const link of links) {
    if (!allLinks.has(link)) allLinks.set(link, []);
    allLinks.get(link).push(`${lang}:${file}`);
  }
}

console.log(`Found ${allLinks.size} unique internal links. Checking...\n`);

const results = [];
for (const [link, files] of allLinks) {
  const result = await checkUrl(link);
  results.push({ ...result, files });
  if (result.status !== 200) {
    console.log(`  Checking: ${link}...`);
  }
}

console.log('\n=== DEAD LINKS (404 or ERR) ===\n');
const dead = results.filter(r => r.status !== 200);
if (dead.length === 0) {
  console.log('None found! All links return 200.');
} else {
  for (const r of dead) {
    console.log(`${r.status} ${r.url}`);
    console.log(`  -> found in: ${r.files.join(', ')}\n`);
  }
}

console.log('\n=== SUMMARY ===');
console.log(`Total links checked: ${results.length}`);
console.log(`Dead links: ${dead.length}`);
