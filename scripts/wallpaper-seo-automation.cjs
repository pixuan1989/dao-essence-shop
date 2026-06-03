// scripts/wallpaper-seo-automation.cjs
// 壁纸跑图后的全自动 SEO 处理（由 壁纸跑图.py 调用）
// 用法: node scripts/wallpaper-seo-automation.cjs

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'wallpapers.json');
const SITEMAP_FILE = path.join(ROOT, 'sitemap.xml');
const VERCEL_FILE = path.join(ROOT, 'vercel.json');
const GEN_SCRIPT = path.join(ROOT, 'scripts', 'generate-wallpapers.cjs');

function sh(cmd) {
  console.log('  $ ' + cmd);
  const r = execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' });
  process.stdout.write(r);
  return r;
}

function main() {
  console.log('[AUTO SEO] 开始全自动处理...\n');

  // 1. 为新增壁纸生成 slug
  console.log('[1/4] 生成语义化 slug...');
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const used = new Set();
  data.forEach(w => { if (w.slug) used.add(w.slug); });

  let newSlugs = 0;
  data.forEach(w => {
    if (w.slug) return;
    let base = (w.title || 'wallpaper').toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\b(a|an|the|of|in|on|at|for|with|to|your|and|is|are|this|that|it)\b/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'wallpaper';
    let slug = base, n = 2;
    while (used.has(slug)) { slug = base + '-' + n; n++; }
    w.slug = slug;
    used.add(slug);
    newSlugs++;
    console.log('  ' + w.id + ' => ' + slug);
  });

  if (newSlugs > 0) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('  ✅ ' + newSlugs + ' 个 slug 已写入 wallpapers.json\n');
  } else {
    console.log('  ✅ 所有壁纸已有 slug，无需处理\n');
  }

  // 2. 重新生成所有静态页面
  console.log('[2/4] 重新生成静态页面...');
  try {
    sh('node "' + GEN_SCRIPT + '" --all');
    console.log('  ✅ 静态页面已重新生成\n');
  } catch(e) {
    console.error('  ❌ 生成页面失败：' + e.message);
    process.exit(1);
  }

  // 3. 更新 sitemap.xml
  console.log('[3/4] 更新 sitemap.xml...');
  try {
    // 读取现有 sitemap，去掉末尾 </urlset>
    let sitemap = fs.readFileSync(SITEMAP_FILE, 'utf8');
    sitemap = sitemap.replace(/\s*<\/urlset>\s*$/, '');

    // 添加壁纸首页
    const today = new Date().toISOString().split('T')[0];
    sitemap += '\n\n    <!-- Wallpaper Index -->\n';
    sitemap += '    <url>\n';
    sitemap += '        <loc>https://www.daoessentia.com/wallpaper</loc>\n';
    sitemap += '        <lastmod>' + today + '</lastmod>\n';
    sitemap += '        <changefreq>daily</changefreq>\n';
    sitemap += '        <priority>0.9</priority>\n';
    sitemap += '    </url>\n';

    data.forEach(w => {
      const slug = w.slug || w.id;
      const date = (w.date || today);
      const title = (w.title || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      const titleZh = (w.titleZh || w.title || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      const thumb = w.thumb || '';

      // 英文页
      sitemap += '    <url>\n';
      sitemap += '        <loc>https://www.daoessentia.com/wallpaper/' + slug + '</loc>\n';
      sitemap += '        <lastmod>' + date + '</lastmod>\n';
      sitemap += '        <changefreq>weekly</changefreq>\n';
      sitemap += '        <priority>0.8</priority>\n';
      if (thumb) {
        sitemap += '        <image:image>\n';
        sitemap += '            <image:loc>' + thumb + '</image:loc>\n';
        sitemap += '            <image:title>' + title + '</image:title>\n';
        sitemap += '        </image:image>\n';
      }
      sitemap += '    </url>\n';

      // 中文页
      sitemap += '    <url>\n';
      sitemap += '        <loc>https://www.daoessentia.com/zh/wallpaper/' + slug + '</loc>\n';
      sitemap += '        <lastmod>' + date + '</lastmod>\n';
      sitemap += '        <changefreq>weekly</changefreq>\n';
      sitemap += '        <priority>0.8</priority>\n';
      if (thumb) {
        sitemap += '        <image:image>\n';
        sitemap += '            <image:loc>' + thumb + '</image:loc>\n';
        sitemap += '            <image:title>' + titleZh + '</image:title>\n';
        sitemap += '        </image:image>\n';
      }
      sitemap += '    </url>\n';
    });

    sitemap += '\n</urlset>\n';
    fs.writeFileSync(SITEMAP_FILE, sitemap);
    console.log('  ✅ sitemap.xml 已更新（' + (data.length * 2 + 1) + ' 条 URL）\n');
  } catch(e) {
    console.error('  ❌ 更新 sitemap 失败：' + e.message + '\n');
  }

  // 4. 更新 vercel.json 重定向（旧 ID URL => 新 slug URL）
  console.log('[4/4] 更新 vercel.json 重定向...');
  try {
    const config = JSON.parse(fs.readFileSync(VERCEL_FILE, 'utf8'));
    // 移除旧的 wallpaper 重定向
    config.redirects = (config.redirects || []).filter(r =>
      !r.source || (!r.source.startsWith('/wallpaper/wallpaper_') && !r.source.startsWith('/zh/wallpaper/wallpaper_'))
    );

    // 添加新重定向
    data.forEach(w => {
      if (w.slug && w.slug !== w.id) {
        config.redirects.unshift({
          source: '/wallpaper/' + w.id,
          destination: '/wallpaper/' + w.slug,
          permanent: true
        });
        config.redirects.unshift({
          source: '/zh/wallpaper/' + w.id,
          destination: '/zh/wallpaper/' + w.slug,
          permanent: true
        });
      }
    });

    fs.writeFileSync(VERCEL_FILE, JSON.stringify(config, null, 2));
    console.log('  ✅ vercel.json 重定向已更新\n');
  } catch(e) {
    console.error('  ❌ 更新 vercel.json 失败：' + e.message + '\n');
  }

  // 5. Git 提交 + 推送
  console.log('[Git] 提交并推送...');
  try {
    sh('git add -A');
    sh('git commit -m "feat(wallpaper): auto SEO slug + regenerate"');
    sh('git push');
    console.log('  ✅ Git push 成功\n');
  } catch(e) {
    console.log('  ⚠️ Git 操作失败（可能需要手动处理）：' + e.message + '\n');
  }

  console.log('[AUTO SEO] ✅ 全部完成！');
}

main();
