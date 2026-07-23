// scripts/generate-wallpapers.js
// 为每个壁纸生成独立静态 HTML 详情页（SEO 优化）
// 用法: node scripts/generate-wallpapers.js

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'wallpapers.json');
const DETAIL_TEMPLATE = path.join(ROOT, 'wallpaper-detail.html');
const OUT_DIR = path.join(ROOT, 'wallpaper');       // /wallpaper/:id/index.html
const DIST_OUT_DIR = path.join(ROOT, 'dist', 'wallpaper');

// ── 工具函数 ─────────────────────────────────────

function loadWallpapers() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error('❌ wallpapers.json not found at', DATA_FILE);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
}

function truncate(str, len = 160) {
  if (!str) return '';
  const cleaned = str.replace(/\*\*(.*?)\*\*/g, '$1')
                     .replace(/\n+/g, ' ')
                     .trim();
  return cleaned.length > len ? cleaned.slice(0, len) + '...' : cleaned;
}

function formatDate(dateStr, lang = 'en') {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (lang === 'zh') {
    return d.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getWallpaperUrl(id, lang = 'en') {
  const base = 'https://daoessentia.com';
  const pathPart = '/wallpaper/' + id;
  return lang === 'zh' ? base + '/zh' + pathPart : base + pathPart;
}

// ── 生成单个静态壁纸详情页 ───────────────────────────────

function generateStaticPage(wp, lang) {
  const isZh = lang === 'zh';
  const id = wp.id;
  const title = isZh ? (wp.title_zh || wp.title) : wp.title;
  const desc  = isZh ? (wp.description_zh || wp.description) : wp.description;
  const seoDesc = truncate(desc, 160);
  const category = isZh ? (wp.category_zh || wp.category) : wp.category;
  const tags = isZh ? (wp.tags_zh || wp.tags || []) : (wp.tags || []);
  const imgThumb = wp.thumb || '';
  const imgOriginal = wp.original || '';
  const imgMockup = wp.mockup || '';
  const dateStr = wp.date || '';
  const formattedDate = formatDate(dateStr, lang);
  const creator = wp.creator || 'Dao Essentia';
  const avatar = wp.avatar || '';
  const downloads = wp.downloads || 0;

  const pageUrl   = getWallpaperUrl(id, lang);
  const pageUrlEn = getWallpaperUrl(id, 'en');
  const pageUrlZh = getWallpaperUrl(id, 'zh');
  const canonical  = pageUrl;

  // OG Image: 用 original 或 thumb
  const ogImage = imgThumb || imgOriginal || '';

  // JSON-LD Schema.org
  var schemaObj = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "name": title,
    "description": seoDesc,
    "contentUrl": imgThumb || imgOriginal,
    "thumbnailUrl": imgThumb,
    "author": {
      "@type": "Organization",
      "name": "Dao Essentia"
    },
    "datePublished": dateStr,
    "keywords": tags.concat(["lucky wallpaper", "feng shui", "Chinese metaphysics"]).join(", ")
  };
  var schemaStr = JSON.stringify(schemaObj, null, 2);
  // 把 schema 嵌入 HTML（需要转义 </script>）
  schemaStr = schemaStr.replace(/<\/script>/gi, '<\\/script>');

  // 相关壁纸（取前 6 个其他壁纸）
  var allWps = loadWallpapers();
  var related = allWps.filter(function(w) { return w.id !== id; }).slice(0, 6);

  var html = '<!DOCTYPE html>\n'
    + '<html lang="' + (isZh ? 'zh-TW' : 'en') + '">\n'
    + '<head>\n'
    + '    <meta charset="UTF-8">\n'
    + '    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '    <title>' + escapeHtml(title) + ' - Lucky Wallpapers | Dao Essentia</title>\n'
    + '    <meta name="description" content="' + escapeHtml(seoDesc) + '">\n'
    + '    <link rel="canonical" href="' + canonical + '">\n'
    + '\n'
    + '    <!-- Hreflang -->\n'
    + '    <link rel="alternate" hreflang="en" href="' + pageUrlEn + '">\n'
    + '    <link rel="alternate" hreflang="zh-TW" href="' + pageUrlZh + '">\n'
    + '    <link rel="alternate" hreflang="x-default" href="' + pageUrlEn + '">\n'
    + '\n'
    + '    <!-- Open Graph -->\n'
    + '    <meta property="og:title" content="' + escapeHtml(title) + '">\n'
    + '    <meta property="og:description" content="' + escapeHtml(seoDesc) + '">\n'
    + '    <meta property="og:image" content="' + ogImage + '">\n'
    + '    <meta property="og:url" content="' + pageUrl + '">\n'
    + '    <meta property="og:type" content="website">\n'
    + '    <meta property="og:site_name" content="Dao Essentia">\n'
    + '\n'
    + '    <!-- Twitter Card -->\n'
    + '    <meta name="twitter:card" content="summary_large_image">\n'
    + '    <meta name="twitter:title" content="' + escapeHtml(title) + '">\n'
    + '    <meta name="twitter:description" content="' + escapeHtml(seoDesc) + '">\n'
    + '    <meta name="twitter:image" content="' + ogImage + '">\n'
    + '\n'
    + '    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">\n'
    + '\n'
    + '    <style>\n'
    + '        * { margin:0; padding:0; box-sizing: border-box; }\n'
    + '        body {\n'
    + '            background-color: #0a0a0a;\n'
    + '            color: #fff;\n'
    + '            font-family: \'Inter\', sans-serif;\n'
    + '            -webkit-font-smoothing: antialiased;\n'
    + '        }\n'
    + '        a { color: inherit; text-decoration: none; }\n'
    + '\n'
    + '        /* ── Nav ── */\n'
    + '        .wpn {\n'
    + '            background: #0D0D0D;\n'
    + '            border-bottom: 1px solid rgba(255,255,255,0.06);\n'
    + '            position: sticky; top: 0; z-index: 100;\n'
    + '        }\n'
    + '        .wpn-inner {\n'
    + '            max-width: 1400px; margin: 0 auto;\n'
    + '            padding: 0 16px; height: 60px;\n'
    + '            display: flex; align-items: center; gap: 6px;\n'
    + '        }\n'
    + '        .wpn-logo { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }\n'
    + '        .wpn-logo-icon {\n'
    + '            width: 50px; height: 50px;\n'
    + '            border: 2px solid #D4AF37; border-radius: 50%;\n'
    + '            display: flex; align-items: center; justify-content: center;\n'
    + '            color: #D4AF37; font-family: Georgia, serif; font-weight: 600;\n'
    + '            font-size: 1.5rem;\n'
    + '        }\n'
    + '        .wpn-logo-en {\n'
    + '            color: rgba(255,255,255,0.85); font-family: Georgia, serif;\n'
    + '            font-size: 12px; letter-spacing: 0.2em; font-weight: 400;\n'
    + '            line-height: 1.2; text-transform: uppercase;\n'
    + '        }\n'
    + '        .wpn-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }\n'
    + '        .wpn-btn {\n'
    + '            padding: 8px 16px; border-radius: 8px;\n'
    + '            font-size: 13px; font-weight: 500;\n'
    + '            transition: all 0.2s; cursor: pointer;\n'
    + '        }\n'
    + '        .wpn-btn-outline {\n'
    + '            background: rgba(255,255,255,0.08); color: #fff;\n'
    + '            border: 1px solid rgba(255,255,255,0.15);\n'
    + '        }\n'
    + '        .wpn-btn-gold {\n'
    + '            background: linear-gradient(135deg, #D4AF37 0%, #B8962E 100%); color: #0a0a0a;\n'
    + '            border: none; font-weight: 600;\n'
    + '        }\n'
    + '\n'
    + '        /* ── Main Layout ── */\n'
    + '        .detail-container {\n'
    + '            max-width: 1200px; width: 100%;\n'
    + '            margin: 0 auto; padding: 100px 24px 48px;\n'
    + '            display: flex; flex-direction: row; gap: 48px;\n'
    + '            align-items: flex-start;\n'
    + '        }\n'
    + '        .left-column { flex: 1.25 1 0%; min-width: 0; }\n'
    + '        .right-column { flex: 1 1 0%; min-width: 0; padding-top: 8px; }\n'
    + '\n'
    + '        .preview-image {\n'
    + '            width: 100%; max-height: 72vh; border-radius: 16px;\n'
    + '            overflow: hidden; background: #111;\n'
    + '            display: flex; align-items: center; justify-content: center;\n'
    + '        }\n'
    + '        .preview-image img {\n'
    + '            max-width: 100%; max-height: 72vh;\n'
    + '            width: auto; height: auto; display: block;\n'
    + '            object-fit: contain;\n'
    + '        }\n'
    + '\n'
    + '        .wp-title { font-size: 28px; font-weight: 700; margin-bottom: 14px; line-height: 1.25; }\n'
    + '        .wp-seo-desc { font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.7; margin-bottom: 20px; }\n'
    + '        .wp-downloads { font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 20px; display: flex; align-items: center; gap: 4px; }\n'
    + '        .wp-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px; }\n'
    + '        .tag {\n'
    + '            padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 500;\n'
    + '            color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.06);\n'
    + '            border: 1px solid rgba(255,255,255,0.08);\n'
    + '        }\n'
    + '\n'
    + '        .btn-download {\n'
    + '            width: 100%; height: 52px; border-radius: 14px;\n'
    + '            background: linear-gradient(135deg, #D4AF37 0%, #B8962E 100%);\n'
    + '            color: #0a0a0a; font-weight: 700; font-size: 16px;\n'
    + '            border: none; display: flex; align-items: center; justify-content: center;\n'
    + '            gap: 10px; cursor: pointer; text-decoration: none;\n'
    + '            transition: transform 0.2s, box-shadow 0.2s;\n'
    + '        }\n'
    + '        .btn-download:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(212,175,55,0.3); }\n'
    + '\n'
    + '        .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 40px 0; }\n'
    + '\n'
    + '        .related-title { font-size: 18px; font-weight: 600; margin-bottom: 16px; }\n'
    + '        .related-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }\n'
    + '        .related-card {\n'
    + '            border-radius: 12px; overflow: hidden; cursor: pointer;\n'
    + '            transition: transform 0.2s; aspect-ratio: 9/16;\n'
    + '            background: #111;\n'
    + '        }\n'
    + '        .related-card img { width: 100%; height: 100%; object-fit: cover; display: block; }\n'
    + '        .related-card:hover { transform: translateY(-3px); }\n'
    + '\n'
    + '        .footer { background: #1A1612; padding: 80px 0 32px; margin-top: 40px; }\n'
    + '        .footer .container { max-width: 1400px; margin: 0 auto; padding: 0 32px; }\n'
    + '        .footer-bottom { text-align: center; padding-top: 32px; border-top: 1px solid rgba(212,175,55,0.2); color: rgba(245,240,230,0.5); font-size: 13px; }\n'
    + '\n'
    + '        @media (max-width: 900px) {\n'
    + '            .detail-container { flex-direction: column; padding: 80px 16px 48px; gap: 24px; }\n'
    + '            .left-column, .right-column { width: 100%; flex: none; }\n'
    + '            .wp-title { font-size: 22px; }\n'
    + '            .related-grid { grid-template-columns: repeat(3, 1fr); }\n'
    + '        }\n'
    + '        @media (max-width: 600px) {\n'
    + '            .related-grid { grid-template-columns: repeat(2, 1fr); }\n'
    + '        }\n'
    + '    </style>\n'
    + '</head>\n'
    + '<body>\n'
    + '\n'
    + '    <!-- Nav -->\n'
    + '    <nav class="wpn">\n'
    + '        <div class="wpn-inner">\n'
    + '            <a href="/' + (isZh ? 'zh/' : '') + '" class="wpn-logo">\n'
    + '                <div class="wpn-logo-icon">道</div>\n'
    + '                <div>\n'
    + '                    <span class="wpn-logo-en">DAO ESSENCE</span>\n'
    + '                </div>\n'
    + '            </a>\n'
    + '            <div class="wpn-right">\n'
    + '                <a href="/' + (isZh ? 'zh/' : '') + 'wallpaper" class="wpn-btn wpn-btn-outline">← ' + (isZh ? '返回壁纸列表' : 'Back to Wallpapers') + '</a>\n'
    + '            </div>\n'
    + '        </div>\n'
    + '    </nav>\n'
    + '\n'
    + '    <!-- Main -->\n'
    + '    <div class="detail-container">\n'
    + '        <!-- Left: Image -->\n'
    + '        <div class="left-column">\n'
    + '            <div class="preview-image">\n'
    + '                <img src="' + (imgThumb || imgOriginal) + '" alt="' + escapeHtml(title) + '" loading="lazy">\n'
    + '            </div>\n'
    + '        </div>\n'
    + '\n'
    + '        <!-- Right: Info -->\n'
    + '        <div class="right-column">\n'
    + '            <h1 class="wp-title">' + escapeHtml(title) + '</h1>\n'
    + '            <p class="wp-seo-desc">' + escapeHtml(desc || seoDesc) + '</p>\n'
    + '            <div class="wp-downloads">⬇ ' + downloads + ' ' + (isZh ? '次下载' : 'downloads') + '</div>\n'
    + '            <div class="wp-tags">\n'
    + (category ? '                <span class="tag">' + escapeHtml(category) + '</span>\n' : '')
    + tags.map(function(t) { return '                <span class="tag">' + escapeHtml(t) + '</span>'; }).join('\n')
    + '\n'
    + '            </div>\n'
    + '            <a href="' + (imgOriginal || '#') + '" download class="btn-download">\n'
    + '                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>\n'
    + '                ' + (isZh ? '下载壁纸' : 'Download Wallpaper') + '\n'
    + '            </a>\n'
    + '        </div>\n'
    + '    </div>\n'
    + '\n'
    + '    <!-- Related -->\n'
    + '    <div style="max-width:1200px;margin:0 auto;padding:0 24px 48px;">\n'
    + '        <div class="divider"></div>\n'
    + '        <h2 class="related-title">' + (isZh ? '更多壁纸' : 'More Wallpapers') + '</h2>\n'
    + '        <div class="related-grid">\n'
    + related.map(function(w) {
        var wUrl = '/wallpaper/' + w.id + (isZh ? '?lang=zh' : '');
        return '            <a href="' + wUrl + '" class="related-card"><img src="' + (w.thumb || '') + '" alt="' + escapeHtml(isZh ? (w.title_zh || w.title) : w.title) + '" loading="lazy"></a>';
      }).join('\n')
    + '\n'
    + '        </div>\n'
    + '    </div>\n'
    + '\n'
    + '    <!-- Footer -->\n'
    + '    <footer class="footer">\n'
    + '        <div class="container">\n'
    + '            <p class="footer-bottom">&copy; 2026 DAO Essence &amp; Five Elements. All rights reserved.</p>\n'
    + '        </div>\n'
    + '    </footer>\n'
    + '\n'
    + '    <!-- Schema.org JSON-LD -->\n'
    + '    <script type="application/ld+json">\n'
    + '    ' + schemaStr + '\n'
    + '    </script>\n'
    + '</body>\n'
    + '</html>\n';

  return html;
}

// ── 主函数 ─────────────────────────────────────────────────

function main() {
  console.log('\n🖼️  Generating static wallpaper detail pages...\n');

  const wallpapers = loadWallpapers();
  console.log('   Found ' + wallpapers.length + ' wallpapers');

  // 1. Generate /wallpaper/:id/index.html (source)
  ensureDir(OUT_DIR);
  var count = 0;
  wallpapers.forEach(function(wp) {
    var dir = path.join(OUT_DIR, wp.id);
    ensureDir(dir);

    // English
    fs.writeFileSync(path.join(dir, 'index.html'), generateStaticPage(wp, 'en'), 'utf8');
    // Chinese
    fs.writeFileSync(path.join(dir, 'index.zh.html'), generateStaticPage(wp, 'zh'), 'utf8');

    console.log('   ✅ ' + wp.id + ' (EN + ZH)');
    count++;
  });

  // 2. Generate /dist/wallpaper/:id/index.html (build output)
  ensureDir(DIST_OUT_DIR);
  wallpapers.forEach(function(wp) {
    var dir = path.join(DIST_OUT_DIR, wp.id);
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, 'index.html'), generateStaticPage(wp, 'en'), 'utf8');
    fs.writeFileSync(path.join(dir, 'index.zh.html'), generateStaticPage(wp, 'zh'), 'utf8');
  });

  console.log('\n✅ Generated ' + count + ' static wallpaper pages (EN + ZH, source + dist)\n');
  console.log('📝  Next steps:');
  console.log('   1. Commit and push these new files');
  console.log('   2. Test: open /wallpaper/wallpaper_1780233534 in browser');
  console.log('   3. Submit to Google Search Console for indexing\n');
}

main();
