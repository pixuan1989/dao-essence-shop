// 每日壁纸提交批次生成器
// 规则：从未收录池（.wallpaper_submit_list.md 的 82 个）中，实时排除已收录(indexed)、
//       历史已给(manualGiven)、本批次已给(daily_batch)，每天取约 10 个 URL（EN 优先，配对 ZH 算 2 个），
//       生成当日清单并写入进度，绝不重复。
const fs = require('fs');
const base = 'C:/Users/agenew/Desktop/DaoEssence1.0/';
const STATE = base + '.gsc-wallpaper-state.json';
const LIST  = base + '.wallpaper_submit_list.md';
const BATCH = base + '.wallpaper_daily_batch.json';
const POOL  = base + '.wallpaper_unindexed_pool.json';

function buildPool() {
  const md = fs.readFileSync(LIST, 'utf8');
  const urls = [...md.matchAll(/https?:\/\/[^\s\)]+/g)].map(m => m[0]).filter(u => u.includes('/wallpaper/'));
  const uniq = [...new Set(urls)];
  const map = new Map();
  for (const u of uniq) {
    const zh = u.includes('/zh/wallpaper/');
    const m = u.match(/\/wallpaper\/([^/]+)$/);
    if (!m) continue;
    const slug = m[1];
    if (!map.has(slug)) map.set(slug, { slug, en: null, zh: null });
    map.get(slug)[zh ? 'zh' : 'en'] = u;
  }
  const arr = [...map.values()];
  fs.writeFileSync(POOL, JSON.stringify(arr, null, 2));
  return arr;
}

const pool = fs.existsSync(POOL) ? JSON.parse(fs.readFileSync(POOL, 'utf8')) : buildPool();
const st = JSON.parse(fs.readFileSync(STATE, 'utf8'));
const normUrl = x => (typeof x === 'string') ? x : (x && x.url ? x.url : null);
const idxSet = new Set(st.indexed.map(normUrl).filter(Boolean));
const mgSet = new Set((st.manualGiven || []).map(normUrl).filter(Boolean));
const mgSlugSet = new Set();
for (const u of mgSet) { const m = u.match(/\/wallpaper\/([^/]+)$/); if (m) mgSlugSet.add(m[1]); }

const batch = fs.existsSync(BATCH) ? JSON.parse(fs.readFileSync(BATCH, 'utf8')) : { givenSlugs: [] };
const givenSlugSet = new Set(batch.givenSlugs.map(g => g.slug));

const candidates = pool.filter(p => {
  const hasUnindexed = (p.en && !idxSet.has(p.en)) || (p.zh && !idxSet.has(p.zh));
  return hasUnindexed && !mgSlugSet.has(p.slug) && !givenSlugSet.has(p.slug);
}).sort((a, b) => {
  const aEn = (a.en && !idxSet.has(a.en)) ? 0 : 1;
  const bEn = (b.en && !idxSet.has(b.en)) ? 0 : 1;
  return aEn - bEn;
});

const today = [];
let count = 0;
for (const p of candidates) {
  if (count >= 10) break;
  const urls = [];
  if (p.en && !idxSet.has(p.en)) urls.push(p.en);
  if (p.zh && !idxSet.has(p.zh)) urls.push(p.zh);
  if (urls.length === 0) continue;
  today.push({ slug: p.slug, urls });
  count += urls.length;
}

const todayStr = new Date().toISOString().slice(0, 10);
const outMd = base + '.wallpaper_daily_' + todayStr + '.md';

if (today.length === 0) {
  const msg = `# 壁纸每日提交批次（${todayStr}）\n\n✅ 新批次已全部发完。剩余未收录均为历史已给清单中的条目，可从 .wallpaper_submit_list.md 总清单手动补提交，或等下次 full_recheck 后重新纳入。`;
  fs.writeFileSync(outMd, msg);
  console.log('DONE_EMPTY:' + outMd);
  process.exit(0);
}

// 写回进度
for (const t of today) {
  batch.givenSlugs.push({ slug: t.slug, date: todayStr, urls: t.urls });
  for (const u of t.urls) st.manualGiven.push({ url: u, givenAt: new Date().toISOString() });
}
fs.writeFileSync(BATCH, JSON.stringify(batch, null, 2));
fs.writeFileSync(STATE, JSON.stringify(st, null, 2));

const remaining = candidates.length - today.length;
let md = `# 壁纸每日提交批次（${todayStr}）\n\n`;
md += `本批 **${today.length} 个壁纸 / ${count} 个 URL**，去 GSC 逐个「请求编入索引」。\n`;
md += `剩余未给新批次：**${remaining}** 个壁纸。\n\n`;
md += `> 操作：Google Search Console → 网址检查 → 粘贴下方 URL → 若显示“网址未被收录”点「请求编入索引」。\n\n`;
today.forEach((t, i) => {
  md += `### ${i + 1}. ${t.slug}\n`;
  for (const u of t.urls) md += `- ${u}\n`;
  md += `\n`;
});
fs.writeFileSync(outMd, md);

console.log('DONE:' + outMd + '|slugs=' + today.length + '|urls=' + count + '|remaining=' + remaining);
