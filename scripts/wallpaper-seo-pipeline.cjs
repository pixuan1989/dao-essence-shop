/**
 * 壁纸上线 SEO 流水线 (Wallpaper SEO Pipeline)
 * 供 壁纸跑图.py 调用，实现“一气呵成”
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '..');
const JSON_PATH = path.join(PROJECT_ROOT, 'wallpapers.json');
const VERCEL_JSON = path.join(PROJECT_ROOT, 'vercel.json');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');

function kebabCase(str) {
  return str.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function main() {
  console.log('\n🚀 [SEO 流水线] 启动...');

  // Step 1: Check Slugs
  console.log('\n[Step 1] 检查 wallpapers.json slug...');
  const wallpapers = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  let changed = false;
  const newWallpapers = [];
  
  for (const wp of wallpapers) {
    if (!wp.slug || wp.slug.trim() === '') {
      const base = kebabCase(wp.title || wp.titleZh || `wallpaper-${wp.id}`);
      wp.slug = base.includes('wallpaper') ? base : `${base}-feng-shui-wallpaper`;
      console.log(`  ✅ 分配 slug: ${wp.id} → ${wp.slug}`);
      changed = true;
      newWallpapers.push(wp);
    }
  }
  
  if (changed) {
    fs.writeFileSync(JSON_PATH, JSON.stringify(wallpapers, null, 2), 'utf8');
  }

  if (newWallpapers.length === 0) {
    console.log('  ✅ 所有壁纸已有 slug，无新增壁纸需处理');
    return;
  }

  console.log(`\n📦 待处理: ${newWallpapers.length} 张`);
  
  // Step 2: Generate Pages
  console.log('\n[Step 2] 生成静态 SEO 页面...');
  for (const wp of newWallpapers) {
    execSync(`node scripts/generate-wallpapers.cjs --id=${wp.id}`, { cwd: PROJECT_ROOT, stdio: 'pipe' });
    console.log(`  ✅ 已生成: ${wp.slug}`);
  }

  // Step 3: Check Dirty Links
  console.log('\n[Step 3] 检查脏内链...');
  let passed = true;
  for (const wp of newWallpapers) {
    const enPath = path.join(PROJECT_ROOT, 'wallpaper', wp.slug, 'index.html');
    if (!fs.existsSync(enPath)) continue;
    const content = fs.readFileSync(enPath, 'utf8');
    if (content.includes('href="/zh/')) { console.error(`  ❌ 4.1 失败: ${wp.slug}`); passed = false; }
    if ((content.match(/href="[^"]*\.html"/g) || []).length > 0) { console.error(`  ❌ 4.2 失败: ${wp.slug}`); passed = false; }
  }
  if (passed) console.log('  ✅ 4.1、4.2 通过');
  else process.exit(1);

  // Step 4: Vercel Redirects
  console.log('\n[Step 4] 更新 vercel.json 重定向...');
  const vercel = JSON.parse(fs.readFileSync(VERCEL_JSON, 'utf8'));
  if (!vercel.redirects) vercel.redirects = [];
  const existingSources = new Set(vercel.redirects.map(r => r.source));
  let added = 0;
  
  for (const wp of newWallpapers) {
    const oldId = wp.id.replace('wallpaper_', '');
    const rules = [
      { source: `/wallpaper/${oldId}`, destination: `/wallpaper/${wp.slug}`, permanent: true },
      { source: `/wallpaper/${oldId}/`, destination: `/wallpaper/${wp.slug}/`, permanent: true },
      { source: `/zh/wallpaper/${oldId}`, destination: `/zh/wallpaper/${wp.slug}`, permanent: true },
      { source: `/zh/wallpaper/${oldId}/`, destination: `/zh/wallpaper/${wp.slug}/`, permanent: true },
    ];
    for (const rule of rules) {
      if (!existingSources.has(rule.source)) {
        vercel.redirects.push(rule);
        existingSources.add(rule.source);
        added++;
      }
    }
  }
  fs.writeFileSync(VERCEL_JSON, JSON.stringify(vercel, null, 2), 'utf8');
  console.log(`  ✅ 已添加 ${added} 条重定向`);

  // Step 5: Sitemap
  console.log('\n[Step 5] 运行 build-blog.js...');
  execSync('node build-blog.js', { cwd: PROJECT_ROOT, stdio: 'pipe' });
  console.log('  ✅ sitemap 已更新');

  // Step 6 & 7: Checks
  console.log('\n[Step 6-7] SEO 回测 (4.4-4.11)...');
  const results = { '4.4 无 index.zh 目录': true, '4.6 meta 正确': true, '4.7 无重定向': true, '4.11 sitemap 完整': true };
  
  const distWallpaper = path.join(DIST_DIR, 'wallpaper');
  if (fs.existsSync(distWallpaper)) {
    for (const dir of fs.readdirSync(distWallpaper)) {
      if (fs.existsSync(path.join(distWallpaper, dir, 'index.zh'))) results['4.4 无 index.zh 目录'] = false;
    }
  }

  for (const wp of newWallpapers) {
    const enPath = path.join(PROJECT_ROOT, 'wallpaper', wp.slug, 'index.html');
    if (!fs.existsSync(enPath)) continue;
    const content = fs.readFileSync(enPath, 'utf8');
    if (!content.includes('daoessentia.com')) results['4.6 meta 正确'] = false;
    const hasRedirect = content.includes('http-equiv="refresh"') || (content.includes('window.location') && !content.includes('window.location.href = "/wallpaper?q="'));
    if (hasRedirect) results['4.7 无重定向'] = false;
  }

  const sitemap = fs.readFileSync(path.join(DIST_DIR, 'sitemap.xml'), 'utf8');
  for (const wp of newWallpapers) {
    if (!sitemap.includes(`wallpaper/${wp.slug}`)) results['4.11 sitemap 完整'] = false;
  }

  let allPassed = true;
  for (const [k, v] of Object.entries(results)) {
    console.log(`  ${v ? '✅' : '❌'} ${k}`);
    if (!v) allPassed = false;
  }
  if (!allPassed) { console.error('\n  ❌ SEO 回测未通过'); process.exit(1); }

  // Step 8: Git Push
  console.log('\n[Step 8] Git 提交 + Push...');
  try {
    execSync('git add wallpaper/ wallpapers.json vercel.json', { cwd: PROJECT_ROOT, stdio: 'pipe' });
    execSync('git add -f dist/sitemap.xml dist/wallpaper/', { cwd: PROJECT_ROOT, stdio: 'pipe' });
    execSync(`git commit -m "feat: add ${newWallpapers.length} new wallpapers (SEO checks ALL PASS)"`, { cwd: PROJECT_ROOT, stdio: 'pipe' });
    execSync('git push origin main', { cwd: PROJECT_ROOT, stdio: 'inherit' });
    console.log('  ✅ Git 提交 + Push 完成');
  } catch (err) {
    if (!err.message.includes('nothing to commit')) {
      console.error('  ❌ Git 失败:', err.message);
      process.exit(1);
    }
  }

  console.log('\n🎉 [SEO 流水线] 完成！');
}

main().catch(err => {
  console.error('❌ 流程失败:', err);
  process.exit(1);
});
