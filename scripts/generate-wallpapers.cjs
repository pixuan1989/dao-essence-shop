// scripts/generate-wallpapers.cjs
// 为每个壁纸生成独立静态 HTML 详情页（SEO 优化，适配 OSS 图片 URL）
// 用法:
//   node scripts/generate-wallpapers.cjs        → 增量：只生成新增的
//   node scripts/generate-wallpapers.cjs --all  → 全量重新生成
//
// 输入:  wallpapers.json (OSS URL 格式)
// 输出:  wallpaper/{id}/index.html       (英文源码)
//        wallpaper/{id}/index.zh.html    (繁体中文源码)
//        dist/wallpaper/{id}/index.html  (构建输出)
//        dist/wallpaper/{id}/index.zh.html

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'wallpapers.json');
const OUT_DIR = path.join(ROOT, 'wallpaper');
const DIST_OUT_DIR = path.join(ROOT, 'dist', 'wallpaper');

// 全局：从 wallpapers.json 提取的唯一分类列表
var ALL_CATEGORIES = [];

// 分类中英文映射（与 JSON 标准分类对齐）
const CAT_NAME_EN = {
  'Five Elements': 'Five Elements', 'Feng Shui': 'Feng Shui',
  'Chinese Zodiac': 'Chinese Zodiac', 'Astrology': 'Astrology',
  'Energy': 'Energy', 'Talismans': 'Talismans',
  // 向后兼容旧数据
  'Talisman': 'Talismans', '八字': 'BaZi', '占星': 'Astrology',
  '生肖': 'Zodiac', '神仙': 'Deities', '符箓': 'Talismans', '能量': 'Energy', '风水': 'Feng Shui'
};
const CAT_NAME_ZH = {
  'Five Elements': '五行', 'Feng Shui': '風水',
  'Chinese Zodiac': '生肖', 'Astrology': '占星',
  'Energy': '能量', 'Talismans': '符籙',
  // 向后兼容旧数据
  'Talisman': '符籙', 'Nature': '自然', 'Deities': '神仙',
  '八字': '八字', '占星': '占星', '生肖': '生肖', '神仙': '神仙', '符箓': '符籙', '能量': '能量', '风水': '風水'
};

// ── 工具函数 ─────────────────────────────────────────────

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

function cleanQuotes(str) {
  if (!str) return '';
  return str
    // 弯引号 → 直引号
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    // 直双引号 → 单引号（避免 escapeHtml 产生 &quot;）
    .replace(/"/g, "'")
    .replace(/'/g, "'");
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
  if (isNaN(d)) return '';
  if (lang === 'zh') {
    return d.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function toSlug(title) {
  if (!title) return 'wallpaper';
  var s = title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\b(a|an|the|of|in|on|at|for|with|to|your|and|is|are|this|that|it)\b/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return s || 'wallpaper';
}

function getSlug(wp) {
  if (wp.slug) return wp.slug;
  return toSlug(wp.title);
}

function getWallpaperUrl(wp, lang) {
  const base = 'https://www.daoessentia.com';
  const slug = getSlug(wp);
  const pathPart = '/wallpaper/' + slug;
  return lang === 'zh' ? base + '/zh' + pathPart : base + pathPart;
}

// ── 并行生成工具 ─────────────────────────────────────────────
// 用 Promise + 并发限制，避免内存爆炸
function generateInParallel(wallpapers, getDirFn, concurrency) {
  return new Promise(function(resolve) {
    var index = 0;
    var running = 0;
    var done = 0;
    var total = wallpapers.length;
    var errors = [];

    function next() {
      while (index < total && running < concurrency) {
        var wp = wallpapers[index++];
        var dir = getDirFn(wp);
        var enFile = path.join(dir, 'index.html');
        var zhFile = path.join(dir, 'index.zh.html');
        running++;

        setImmediate(function(currentWp, cEnFile, cZhFile) {
          try {
            ensureDir(path.dirname(cEnFile));
            fs.writeFileSync(cEnFile, generateStaticPage(currentWp, 'en'), 'utf8');
            fs.writeFileSync(cZhFile, generateStaticPage(currentWp, 'zh'), 'utf8');
            done++;
            running--;
            if (done % 10 === 0 || done === total) {
              console.log('   Progress: ' + done + '/' + total + ' (' + Math.round(done/total*100) + '%)');
            }
            next();
          } catch (e) {
            errors.push({ wp: currentWp.id, error: e.message });
            done++;
            running--;
            next();
          }
        }(wp, enFile, zhFile));
      }

      if (running === 0 && index >= total) {
        if (errors.length > 0) {
          console.warn('   ⚠️ ' + errors.length + ' errors:');
          errors.slice(0, 5).forEach(function(e) {
            console.warn('      ' + e.wp + ': ' + e.error);
          });
        }
        resolve();
      }
    }

    next();
  });
}

// ── 生成单个静态壁纸详情页 ─────────────────────────────────

function generateStaticPage(wp, lang) {
  const isZh = lang === 'zh';
  const id = wp.id;
  // 只读取 camelCase 格式（迁移后标准格式）
  const title = cleanQuotes(isZh ? (wp.titleZh || wp.title) : wp.title);
  const rawDesc = isZh ? (wp.descriptionZh || wp.description) : wp.description;
  const desc = cleanQuotes(rawDesc);
  const seoDesc = truncate(desc, 160);
  const category = isZh ? (wp.categoryZh || wp.category) : wp.category;
  const tags = isZh
    ? (wp.keywordsZh || wp.keywords || [])
    : (wp.keywords || []);
  const imgThumb = wp.thumb || '';
  const imgOriginal = wp.original || '';
  const imgMockup = wp.mockup || '';
  // Download URL: try multiple field names (safety)
  const downloadUrl = wp.original || wp.image || wp.url || wp.src || wp.downloadUrl || wp.fileUrl || imgOriginal || '';
  const dateStr = wp.date || '';
  const formattedDate = formatDate(dateStr, lang);
  const downloads = wp.downloads || 0;

  const slug = getSlug(wp);
  const pageUrl   = getWallpaperUrl(wp, lang);
  const pageUrlEn = getWallpaperUrl(wp, 'en');
  const pageUrlZh = getWallpaperUrl(wp, 'zh');
  const canonical  = pageUrl;

  // 动态生成分类导航链接（以 wallpapers.json 实际分类为准）
  var catLinks = '<a href="/wallpaper' + (isZh ? '?lang=zh' : '') + '">' + (isZh ? '全部' : 'All') + '</a>\n';
  ALL_CATEGORIES.forEach(function(cat) {
    var catLabel = isZh ? (CAT_NAME_ZH[cat] || cat) : (CAT_NAME_EN[cat] || cat);
    catLinks += '                    <a href="/wallpaper?cat=' + encodeURIComponent(cat) + (isZh ? '&lang=zh' : '') + '">' + escapeHtml(catLabel) + '</a>\n';
  });

  // OG Image: 优先用 original，fallback 到 thumb
  const ogImage = imgOriginal || imgThumb || '';

  // JSON-LD Schema.org
  var schemaObj = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "name": title,
    "description": seoDesc,
    "contentUrl": imgOriginal,
    "thumbnailUrl": imgThumb,
    "author": {
      "@type": "Organization",
      "name": "Dao Essentia"
    },
    "datePublished": dateStr,
    "keywords": tags.concat(["lucky wallpaper", "feng shui", "Chinese metaphysics"]).join(", ")
  };
  var schemaStr = JSON.stringify(schemaObj, null, 2);
  // 转义 </script>
  schemaStr = schemaStr.replace(/<\/script>/gi, '<\\/script>');

  // 相关壁纸（取前 6 个其他壁纸）
  var allWps = loadWallpapers();
  var related = allWps.filter(function(w) { return w.id !== id; }).slice(0, 6);

  var html = '<!DOCTYPE html>\n'
    + '<html lang="' + (isZh ? 'zh-TW' : 'en') + '">\n'
    + '<head>\n'
    + '    <meta charset="UTF-8">\n'
    + '    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '    <meta name="robots" content="index,follow">\n'
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
    + '            color: #D4AF37; position: relative;\n'
    + '        }\n'
    + '        .wpn-logo-icon::before {\n'
    + '            content: "道"; font-family: Georgia, "Times New Roman", serif;\n'
    + '            font-weight: 600; font-size: 1.5rem; line-height: 1; letter-spacing: 0;\n'
    + '        }\n'
    + '        .wpn-logo-text { display: flex; flex-direction: column; }\n'
    + '        .wpn-logo-en {\n'
    + '            color: rgba(255,255,255,0.85); font-family: Georgia, serif;\n'
    + '            font-size: 12px; letter-spacing: 0.2em; font-weight: 400;\n'
    + '            line-height: 1.2; text-transform: uppercase;\n'
    + '        }\n'
    + '        .wpn-dropdown { position: relative; flex-shrink: 0; }\n'
    + '        .wpn-dropdown-btn {\n'
    + '            background: none; border: none; color: rgba(255,255,255,0.7);\n'
    + '            font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 4px;\n'
    + '            padding: 6px 8px; border-radius: 6px; transition: all 0.2s; font-family: inherit;\n'
    + '        }\n'
    + '        .wpn-dropdown-btn:hover { color: #fff; background: rgba(255,255,255,0.06); }\n'
    + '        .wpn-dropdown-btn svg { width: 10px; height: 10px; }\n'
    + '        .wpn-search { flex: 1; position: relative; }\n'
    + '        .wpn-search svg {\n'
    + '            position: absolute; left: 10px; top: 50%; transform: translateY(-50%);\n'
    + '            width: 16px; height: 16px; color: rgba(255,255,255,0.3);\n'
    + '        }\n'
    + '        .wpn-search input {\n'
    + '            width: 100%; padding: 8px 12px 8px 32px; background: rgba(255,255,255,0.06);\n'
    + '            border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff;\n'
    + '            font-size: 13px; font-family: inherit; outline: none; transition: all 0.2s;\n'
    + '        }\n'
    + '        .wpn-search input::placeholder { color: rgba(255,255,255,0.3); }\n'
    + '        .wpn-search input:focus { border-color: rgba(212,175,55,0.4); background: rgba(255,255,255,0.1); }\n'
    + '        .wpn-right { margin-left: auto; display: flex; align-items: center; gap: 10px; flex-shrink: 0; }\n'
    + '        .wpn-btn-signin {\n'
    + '            padding: 8px 16px; background: rgba(255,255,255,0.08); color: #fff;\n'
    + '            border: 1px solid rgba(255,255,255,0.15); border-radius: 999px;\n'
    + '            font-size: 13px; font-weight: 500; text-decoration: none; transition: all 0.2s;\n'
    + '        }\n'
    + '        .wpn-btn-signin:hover { background: rgba(255,255,255,0.15); }\n'
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
    + '        .wpn-lang { position: relative; }\n'
    + '        .wpn-lang-trigger {\n'
    + '            color: rgba(255,255,255,0.7); cursor: pointer; display: flex;\n'
    + '            align-items: center; gap: 4px; font-size: 13px;\n'
    + '            font-family: inherit; text-decoration: none;\n'
    + '            padding: 8px 12px; border-radius: 6px; transition: all 0.2s;\n'
    + '        }\n'
    + '        .wpn-lang-trigger:hover { color: #fff; background: rgba(255,255,255,0.06); }\n'
    + '        .wpn-lang-arrow {\n'
    + '            width: 0; height: 0;\n'
    + '            border-left: 4px solid transparent;\n'
    + '            border-right: 4px solid transparent;\n'
    + '            border-top: 5px solid currentColor;\n'
    + '            transition: transform 0.2s;\n'
    + '        }\n'
    + '        .wpn-lang.open .wpn-lang-arrow { transform: rotate(180deg); }\n'
    + '        .wpn-dropdown-menu {\n'
    + '            position: absolute; top: calc(100% + 4px); left: 0;\n'
    + '            background: #1E1E1E; border: 1px solid rgba(212,175,55,0.15);\n'
    + '            border-radius: 4px; padding: 4px 0; min-width: 150px;\n'
    + '            opacity: 0; visibility: hidden;\n'
    + '            transform: translateY(4px); transition: all 0.2s ease;\n'
    + '            z-index: 1001;\n'
    + '        }\n'
    + '        .wpn-dropdown:hover .wpn-dropdown-menu,\n'
    + '        .wpn-dropdown-menu.open { opacity: 1; visibility: visible; transform: translateY(0); }\n'
    + '        .wpn-dropdown-menu a {\n'
    + '            display: block; padding: 8px 16px;\n'
    + '            color: rgba(255,255,255,0.7); text-decoration: none;\n'
    + '            font-size: 13px; transition: all 0.15s;\n'
    + '        }\n'
    + '        .wpn-dropdown-menu a:hover { color: #fff; background: rgba(255,255,255,0.06); }\n'
    + '        .wpn-dropdown-menu a.active { color: #D4AF37; }\n'
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
    + '            pointer-events: none;\n'
    + '            user-select: none;\n'
    + '            -webkit-user-drag: none;\n'
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
    + '            gap: 10px; cursor: pointer; font-family: inherit;\n'
    + '            transition: transform 0.2s, box-shadow 0.2s;\n'
    + '        }\n'
    + '        .btn-download:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(212,175,55,0.3); }\n'
    + '\n'
    + '        /* View Toggle */\n'
    + '        .view-toggle { display: flex; margin-top: 16px; justify-content: center; }\n'
    + '        .toggle-group { display: flex; background: rgba(255,255,255,0.06); border-radius: 10px; padding: 3px; border: 1px solid rgba(255,255,255,0.08); }\n'
    + '        .toggle-btn {\n'
    + '            padding: 8px 20px; border-radius: 8px; font-size: 13px;\n'
    + '            border: none; background: transparent; color: rgba(255,255,255,0.5);\n'
    + '            cursor: pointer; font-family: inherit; transition: all 0.2s;\n'
    + '        }\n'
    + '        .toggle-btn:hover:not(:disabled) { color: #fff; }\n'
    + '        .toggle-btn.active { background: rgba(255,255,255,0.12); color: #fff; }\n'
    + '        .toggle-btn:disabled { opacity: 0.3; cursor: not-allowed; }\n'
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
    + '        /* Footer */\n'
    + '        .footer { background: #1A1612; padding: 80px 0 32px; margin-top: 40px; }\n'
    + '        .footer .container { width: 100%; max-width: 1400px; margin: 0 auto; padding: 0 32px; }\n'
    + '        .footer-content { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 32px; margin-bottom: 32px; }\n'
    + '        .footer-brand .logo-en { color: rgba(245,240,230,0.6); font-family: Georgia, serif; letter-spacing: 0.15em; font-size: 20px; }\n'
    + '        .footer-brand p { color: rgba(245,240,230,0.7); margin-top: 16px; line-height: 1.8; font-size: 14px; }\n'
    + '        .footer-title { font-family: Georgia, serif; font-size: 16px; margin-bottom: 16px; color: #D4AF37; }\n'
    + '        .footer-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }\n'
    + '        .footer-links li { color: rgba(245,240,230,0.7); display: flex; align-items: center; font-size: 14px; line-height: 1.8; }\n'
    + '        .footer-links a { color: rgba(245,240,230,0.7); text-decoration: none; transition: color 200ms ease, padding-left 200ms ease; font-size: 14px; }\n'
    + '        .footer-links a:hover { color: #D4AF37; padding-left: 8px; }\n'
    + '        .footer-bottom { text-align: center; padding-top: 32px; border-top: 1px solid rgba(212,175,55,0.2); color: rgba(245,240,230,0.5); font-size: 13px; }\n'
    + '        .footer-bottom a { color: rgba(245,240,230,0.5); text-decoration: none; }\n'
    + '        .footer-bottom a:hover { color: #D4AF37; }\n'
    + '        .footer-legal-links { display: flex; justify-content: center; gap: 8px; align-items: center; margin-top: 8px; }\n'
    + '        .footer-legal-links span { color: rgba(245,240,230,0.3); }\n'
    + '        @media (max-width: 900px) { .footer-content { grid-template-columns: 1fr 1fr; gap: 32px; } .footer-brand { grid-column: span 2; } }\n'
    + '        @media (max-width: 600px) { .footer-content { grid-template-columns: 1fr; } .footer-brand { grid-column: span 1; } }\n'
    + '        @media (max-width: 768px) {\n'
    + '            .wpn-inner { padding: 0 16px; gap: 10px; height: 54px; }\n'
    + '            .wpn-logo-text { display: none; }\n'
    + '            .wpn-btn-signin { display: none; }\n'
    + '            .wpn-search { flex: 1; }\n'
    + '        }\n'
    + '        @media (max-width: 480px) {\n'
    + '            .wpn-dropdown-btn span { display: none; }\n'
    + '        }\n'
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
    + '                <div class="wpn-logo-icon"></div>\n'
    + '                <div class="wpn-logo-text">\n'
    + '                    <span class="wpn-logo-en">DAO ESSENCE</span>\n'
    + '                </div>\n'
    + '            </a>\n'
    + '            <div class="wpn-dropdown" id="wpn-cat-dropdown">\n'
    + '                <button class="wpn-dropdown-btn">\n'
    + '                    <span>' + (isZh ? '分類' : 'Categories') + '</span>\n'
    + '                    <svg viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>\n'
    + '                </button>\n'
    + '                <div class="wpn-dropdown-menu" id="wpn-cat-menu">\n'
    + '                    ' + catLinks
    + '                </div>\n'
    + '            </div>\n'
    + '            <div class="wpn-search">\n'
    + '                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>\n'
    + '                <input type="text" id="search-input" placeholder="' + (isZh ? '搜尋壁紙...' : 'Search wallpapers...') + '">\n'
    + '            </div>\n'
    + '            <div class="wpn-right">\n'
    + '                <a href="#" class="wpn-btn-signin" id="wpn-signin-btn">' + (isZh ? '登入' : 'Sign In') + '</a>\n'
    + '                <div class="wpn-lang" id="wpn-lang">\n'
    + '                    <a href="#" class="wpn-lang-trigger" id="lang-trigger">\n'
    + '                        <span id="lang-label">' + (isZh ? '繁體中文' : 'EN') + '</span>\n'
    + '                        <i class="wpn-lang-arrow"></i>\n'
    + '                    </a>\n'
    + '                    <div class="wpn-dropdown-menu" id="lang-menu" style="right:0;left:auto;">\n'
    + '                        <a href="' + getWallpaperUrl(wp, 'en') + '" class="lang-option' + (!isZh ? ' active' : '') + '">English</a>\n'
    + '                        <a href="' + getWallpaperUrl(wp, 'zh') + '" class="lang-option' + (isZh ? ' active' : '') + '">繁體中文</a>\n'
    + '                    </div>\n'
    + '                </div>\n'
    + '            </div>\n'
    + '        </div>\n'
    + '    </nav>\n'
    + '\n'
    + '    <!-- Main -->\n'
    + '    <div class="detail-container">\n'
    + '        <!-- Left: Image + Toggle -->\n'
    + '        <div class="left-column">\n'
    + '            <div class="preview-image">\n'
    + '                <img id="main-image" src="' + (imgThumb || imgOriginal) + '" alt="' + escapeHtml(title) + '" loading="lazy" oncontextmenu="return false">\n'
    + '            </div>\n'
    + '            <div class="view-toggle">\n'
    + '                <div class="toggle-group">\n'
    + '                    <button class="toggle-btn active" data-view="original" id="toggle-original">' + (isZh ? '原圖' : 'Original') + '</button>\n'
    + '                    <button class="toggle-btn" data-view="mockup" id="toggle-mockup"' + (imgMockup ? '' : ' disabled') + '>' + (isZh ? '手機預覽' : 'Preview on Device') + '</button>\n'
    + '                </div>\n'
    + '            </div>\n'
    + '        </div>\n'
    + '\n'
    + '        <!-- Right: Info -->\n'
    + '        <div class="right-column">\n'
    + '            <h1 class="wp-title">' + escapeHtml(title) + '</h1>\n'
    + '            <p class="wp-seo-desc">' + escapeHtml(desc || seoDesc) + '</p>\n'
    + '            <div class="wp-downloads">⬇ ' + downloads + ' ' + (isZh ? '次下載' : 'downloads') + '</div>\n'
    + '            <div class="wp-tags">\n'
    + (category ? '                <span class="tag">' + escapeHtml(isZh ? (CAT_NAME_ZH[category] || category) : (CAT_NAME_EN[category] || category)) + '</span>\n' : '')
    + tags.map(function(t) { return '                <span class="tag">' + escapeHtml(t) + '</span>'; }).join('\n')
    + '\n'
    + '            </div>\n'
    + '            <button class="btn-download btn-download-safe" data-wallpaper-id="' + wp.id + '" data-url="' + downloadUrl + '">\n'
    + '                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>\n'
    + '                ' + (isZh ? '下載壁紙' : 'Download Wallpaper') + '\n'
    + '            </button>\n'
    + '        </div>\n'
    + '    </div>\n'
    + '\n'
    + '    <!-- Related -->\n'
    + '    <div style="max-width:1200px;margin:0 auto;padding:0 24px 48px;">\n'
    + '        <div class="divider"></div>\n'
    + '        <h2 class="related-title">' + (isZh ? '更多壁紙' : 'More Wallpapers') + '</h2>\n'
    + '        <div class="related-grid">\n'
    + related.map(function(w) {
        var wSlug = getSlug(w);
        var wUrl = isZh ? '/zh/wallpaper/' + wSlug : '/wallpaper/' + wSlug;
        return '            <a href="' + wUrl + '" class="related-card"><img src="' + (w.thumb || '') + '" alt="' + escapeHtml(isZh ? (w.titleZh || w.title) : w.title) + '" loading="lazy"></a>';
      }).join('\n')
    + '\n'
    + '        </div>\n'
    + '    </div>\n'
    + '\n'
    + '    <!-- Footer -->\n'
    + '    <footer class="footer">\n'
    + '        <div class="container">\n'
    + '            <div class="footer-content">\n'
    + '                <div class="footer-brand">\n'
    + '                    <div class="logo">\n'
    + '                        <span class="logo-en">DAO ESSENCE</span>\n'
    + '                    </div>\n'
    + '                    <p>' + (isZh ? '古老智慧，現代明悟。透過八字分析、風水諮詢與五行指引，以結構化的洞察導航人生。' : 'Ancient Wisdom, Modern Clarity. Navigate life with structured insight through BaZi analysis, Feng Shui consultation, and Five Elements guidance.') + '</p>\n'
    + '                </div>\n'
    + '                <div>\n'
    + '                    <h4 class="footer-title">' + (isZh ? '工具' : 'Tools') + '</h4>\n'
    + '                    <ul class="footer-links">\n'
    + '                        <li><a href="/' + (isZh ? 'zh/' : '') + '#free-bazi">' + (isZh ? '八字排盤' : 'BaZi Birth Chart Calculator') + '</a></li>\n'
    + '                        <li><a href="/' + (isZh ? 'zh/' : '') + 'favorable-element">' + (isZh ? '用神指南' : 'Five Elements Favorable Guide') + '</a></li>\n'
    + '                        <li><a href="/' + (isZh ? 'zh/' : '') + 'five-elements-test">' + (isZh ? '五行性格測試' : 'Five Elements Personality Test') + '</a></li>\n'
    + '                        <li><a href="/' + (isZh ? 'zh/' : '') + 'soulmate-calculator">' + (isZh ? '靈魂伴侶尋找' : 'Soulmate Compatibility Finder') + '</a></li>\n'
    + '                        <li><a href="/' + (isZh ? 'zh/' : '') + 'almanac">' + (isZh ? '吉日選擇' : 'Auspicious Date Picker') + '</a></li>\n'
    + '                        <li><a href="/' + (isZh ? 'zh/' : '') + 'zodiac/zodiac-daily">' + (isZh ? '生肖運勢' : 'Zodiac Daily') + '</a></li>\n'
    + '                        <li><a href="/' + (isZh ? 'zh/' : '') + 'wallpaper">' + (isZh ? '開運壁紙' : 'Lucky Wallpapers') + '</a></li>\n'
    + '                    </ul>\n'
    + '                </div>\n'
    + '                <div>\n'
    + '                    <h4 class="footer-title">' + (isZh ? '探索' : 'Explore') + '</h4>\n'
    + '                    <ul class="footer-links">\n'
    + '                        <li><a href="/' + (isZh ? 'zh/' : '') + 'blog">' + (isZh ? '部落格' : 'Blog') + '</a></li>\n'
    + '                        <li><a href="/' + (isZh ? 'zh/' : '') + 'culture">' + (isZh ? '五行文化' : 'Five Elements') + '</a></li>\n'
    + '                        <li><a href="/' + (isZh ? 'zh/' : '') + 'shop">' + (isZh ? '商店' : 'Shop') + '</a></li>\n'
    + '                        <li><a href="/' + (isZh ? 'zh/' : '') + 'about">' + (isZh ? '關於我們' : 'About Us') + '</a></li>\n'
    + '                    </ul>\n'
    + '                </div>\n'
    + '                <div>\n'
    + '                    <h4 class="footer-title">' + (isZh ? '連結' : 'Links') + '</h4>\n'
    + '                    <ul class="footer-links">\n'
    + '                        <li style="margin-bottom:8px;display:block !important;">\n'
    + '                            <div><a href="https://fatenet.cn/" target="_blank" rel="noopener">FateNet</a></div>\n'
    + '                            <div style="font-size:12px;color:var(--text-secondary);margin-top:4px;line-height:1.4;">' + (isZh ? '中國算命<br>尋找你的靈魂伴侶' : 'Chinese Fortune Telling<br>Find Your Soulmate') + '</div>\n'
    + '                        </li>\n'
    + '                    </ul>\n'
    + '                </div>\n'
    + '                <div>\n'
    + '                    <h4 class="footer-title">' + (isZh ? '聯繫方式' : 'Contact') + '</h4>\n'
    + '                    <ul class="footer-links">\n'
    + '                        <li><svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" style="vertical-align:middle;margin-right:6px"><path d="M3 4h14a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z"/><path d="M3 5l7 6 7-6"/></svg><a href="mailto:support@daoessentia.com">support@daoessentia.com</a></li>\n'
    + '                        <li><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="vertical-align:middle;margin-right:6px;color:var(--accent-color)"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 10.623 7.17c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-7.062-6.122zm-3.957 3.467c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/></svg><a href="#" onclick="document.getElementById(\'wechat-modal\').style.display=\'flex\';return false;">' + (isZh ? 'WeChat' : 'WeChat') + '</a></li>\n'
    + '                        <li><svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" style="vertical-align:middle;margin-right:6px"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l2.5 2.5"/></svg><span>' + (isZh ? '週一至週六：上午9點至晚上9點（CST / UTC+8）' : 'Mon&#8211;Sat: 9AM&#8211;9PM (CST / UTC+8)') + '</span></li>\n'
    + '                        <li><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="vertical-align:middle;margin-right:6px;color:#229ED9"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg><a href="https://t.me/dingwei_123" target="_blank" rel="noopener">Telegram ' + (isZh ? '頻道' : 'Channel') + '</a></li>\n'
    + '                        <li><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="vertical-align:middle;margin-right:6px;color:#E60023"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg><a href="https://www.pinterest.com/pixuan/wallpapers/" target="_blank" rel="noopener">Pinterest</a></li>\n'
    + '                    </ul>\n'
    + '                </div>\n'
    + '            </div>\n'
    + '            <div class="footer-bottom">\n'
    + '                <p>&copy; 2026 DAO Essence &amp; Five Elements. All rights reserved.</p>\n'
    + '                <div class="footer-legal-links">\n'
    + '                    <a href="/' + (isZh ? 'zh/' : '') + 'privacy">' + (isZh ? '隱私政策' : 'Privacy Policy') + '</a>\n'
    + '                    <span>|</span>\n'
    + '                    <a href="/' + (isZh ? 'zh/' : '') + 'terms">' + (isZh ? '服務條款' : 'Terms of Service') + '</a>\n'
    + '                </div>\n'
    + '            </div>\n'
    + '        </div>\n'
    + '    </footer>\n'
    + '\n'
    + '    <!-- WeChat Modal -->\n'
    + '    <div id="wechat-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;align-items:center;justify-content:center;" onclick="if(event.target===this)this.style.display=\'none\'">\n'
    + '        <div style="background:var(--bg-secondary,#1a1a1a);border:1px solid rgba(212,175,55,0.4);border-radius:16px;padding:40px;text-align:center;max-width:320px;width:90%;position:relative;">\n'
    + '            <button onclick="document.getElementById(\'wechat-modal\').style.display=\'none\'" style="position:absolute;top:12px;right:16px;background:none;border:none;color:rgba(245,240,230,0.6);font-size:22px;cursor:pointer;line-height:1;">x</button>\n'
    + '            <p style="color:var(--text-primary);margin-bottom:16px;font-size:16px;">' + (isZh ? '掃描微信二維碼' : 'Scan WeChat QR Code') + '</p>\n'
    + '            <img src="https://daoessentia-wallpapers.oss-cn-hangzhou.aliyuncs.com/assets/wechat-qr.jpg" alt="WeChat QR" style="width:200px;height:200px;border-radius:8px;">\n'
    + '            <p style="color:var(--text-secondary);margin-top:12px;font-size:13px;">' + (isZh ? '或搜索微信ID：daoessentia' : 'Or search WeChat ID: daoessentia') + '</p>\n'
    + '        </div>\n'
    + '    </div>\n'
    + '\n'
    + '    <!-- Schema.org JSON-LD -->\n'
    + '    <script type="application/ld+json">\n'
    + '    ' + schemaStr + '\n'
    + '    </script>\n'
    + '\n'
    + '    <!-- Mockup Toggle JS -->\n'
    + '    <script>\n'
    + '        (function() {\n'
    + '            var img = document.getElementById("main-image");\n'
    + '            if (!img) return;\n'
    + '            var originalSrc = img.getAttribute("src");\n'
    + '            var mockupSrc = "' + (imgMockup || '') + '";\n'
    + '            var btns = document.querySelectorAll(".toggle-btn");\n'
    + '            btns.forEach(function(b) {\n'
    + '                b.addEventListener("click", function() {\n'
    + '                    if (b.disabled) return;\n'
    + '                    var view = b.getAttribute("data-view");\n'
    + '                    btns.forEach(function(x) { x.classList.remove("active"); });\n'
    + '                    b.classList.add("active");\n'
    + '                    if (view === "mockup" && mockupSrc) { img.src = mockupSrc; }\n'
    + '                    else { img.src = originalSrc; }\n'
    + '                });\n'
    + '            });\n'
    + '        })();\n'
    + '    <\/script>\n'
    + '\n'
    + '    <script defer crossorigin="anonymous" src="https://cdn.jsdelivr.net/npm/@clerk/ui@1/dist/ui.browser.js" type="text/javascript"></script>\n'
    + '    <script defer crossorigin="anonymous" src="https://cdn.jsdelivr.net/npm/@clerk/clerk-js@6/dist/clerk.browser.js" data-clerk-publishable-key="pk_live_Y2xlcmsuZGFvZXNzZW50aWEuY29tJA"></script>\n'
    + '    <script src="/js/auth.js"></script>\n'
    + '    <script src="/js/download-guard-v5.js"></script>\n'
    + '    <!-- Language Switcher JS -->\n'
    + '    <script>\n'
    + '        const langTrigger = document.getElementById("lang-trigger");\n'
    + '        const langMenu = document.getElementById("lang-menu");\n'
    + '        if (langTrigger && langMenu) {\n'
    + '            langTrigger.addEventListener("click", function(e) {\n'
    + '                e.preventDefault();\n'
    + '                langMenu.classList.toggle("open");\n'
    + '            });\n'
    + '            document.addEventListener("click", function(e) {\n'
    + '                if (!langTrigger.contains(e.target) && !langMenu.contains(e.target)) {\n'
    + '                    langMenu.classList.remove("open");\n'
    + '                }\n'
    + '            });\n'
    + '        }\n'
    + '    <\/script>\n'
    + '    <!-- Search redirect -->\n'
    + '    <script>\n'
    + '        (function() {\n'
    + '            var input = document.getElementById("search-input");\n'
    + '            if (input) {\n'
    + '                input.addEventListener("keydown", function(e) {\n'
    + '                    if (e.key === "Enter" && input.value.trim()) {\n'
    + '                        window.location.href = "/wallpaper?q=" + encodeURIComponent(input.value.trim()) + "' + (isZh ? '&lang=zh' : '') + '";\n'
    + '                    }\n'
    + '                });\n'
    + '            }\n'
    + '        })();\n'
    + '    <\/script>\n'
    + '    <script src="js/i18n-switcher.js" defer></script>\n'
    + '    <script>document.addEventListener("contextmenu", function(e) { if (e.target && (e.target.tagName === "IMG" || e.target.closest(".preview-image"))) { e.preventDefault(); } });</script>\n'
    + '</body>\n'
    + '</html>\n';

  return html;
}

// ── Generate single wallpaper (--id=xxx mode) ──
function generateOne(wp, outBase) {
  var dir = path.join(outBase, wp.slug || wp.id);
  ensureDir(dir);
    fs.writeFileSync(path.join(dir, 'index.html'), generateStaticPage(wp, 'en'), 'utf8');
    fs.writeFileSync(path.join(dir, 'index.zh.html'), generateStaticPage(wp, 'zh'), 'utf8');
    console.log('   ✅ ' + (wp.slug || wp.id));
}

// ── 主函数 ─────────────────────────────────────────────────────────
// 用法:
//   node scripts/generate-wallpapers.cjs        → 增量（只生成新增的）
//   node scripts/generate-wallpapers.cjs --all  → 全量重新生成

function main() {
  var args = process.argv.slice(2);
  var forceAll = args.indexOf('--all') !== -1;
  var idArg = null;
  args.forEach(function(a) {
    if (a.startsWith('--id=')) idArg = a.slice(5);
  });

  console.log('\n🖼️  Generating static wallpaper detail pages...\n');

  const wallpapers = loadWallpapers();
  console.log('   Found ' + wallpapers.length + ' wallpapers in wallpapers.json');

  // 提取所有唯一分类（英文），按字母排序
  var catSet = new Set();
  wallpapers.forEach(function(w) { if (w.category) catSet.add(w.category); });
  ALL_CATEGORIES = Array.from(catSet).sort();
  console.log('   Categories: ' + ALL_CATEGORIES.join(', '));

  // ── Single ID mode ──
  if (idArg) {
    var target = wallpapers.find(function(w) { return w.id === idArg; });
    if (!target) {
      console.error('❌ Wallpaper not found: ' + idArg);
      process.exit(1);
    }
    console.log('   Mode: SINGLE wallpaper (' + idArg + ')\n');
    var start1 = Date.now();
    ensureDir(OUT_DIR);
    generateOne(target, OUT_DIR);
    var elapsed1 = ((Date.now() - start1) / 1000).toFixed(1);
    console.log('   ✅ Source page done (' + elapsed1 + 's)');

    var start2 = Date.now();
    ensureDir(DIST_OUT_DIR);
    generateOne(target, DIST_OUT_DIR);
    var elapsed2 = ((Date.now() - start2) / 1000).toFixed(1);
    console.log('   ✅ Dist page done (' + elapsed2 + 's)');
    console.log('\n✅ Done! Generated 1 wallpaper (' + idArg + ')\n');
    return;
  }

  if (forceAll) {
    console.log('   Mode: FULL regenerate (--all)\n');
  } else {
    console.log('   Mode: INCREMENTAL (only new wallpapers)\n');
  }

  // 过滤出需要生成的壁纸（增量模式）
  var toGenerate = wallpapers.filter(function(wp) {
    if (forceAll) return true;
    var dir = path.join(OUT_DIR, wp.slug || wp.id);
    var enFile = path.join(dir, 'index.html');
    var zhFile = path.join(dir, 'index.zh.html');
    return !(fs.existsSync(enFile) && fs.existsSync(zhFile));
  });

  var skipped = wallpapers.length - toGenerate.length;
  console.log('   To generate: ' + toGenerate.length + ' | Skipped: ' + skipped + '\n');

  if (toGenerate.length === 0) {
    console.log('   (No new wallpapers to generate. Use --all to force full regenerate.)\n');
    return;
  }

  // 1. Generate /wallpaper/:id/index.html (source) — 并行，并发 10
  console.log('   [1/2] Generating source pages (concurrency: 10)...');
  ensureDir(OUT_DIR);
  var start1 = Date.now();
  generateInParallel(toGenerate, function(wp) {
    return path.join(OUT_DIR, wp.slug || wp.id);
  }, 10).then(function() {
    var elapsed1 = ((Date.now() - start1) / 1000).toFixed(1);
    console.log('   ✅ Source pages done (' + elapsed1 + 's)');

    // 2. Generate /dist/wallpaper/:id/index.html (build output) — 并行，并发 10
    console.log('   [2/2] Generating dist pages (concurrency: 10)...');
    ensureDir(DIST_OUT_DIR);
    var start2 = Date.now();
    generateInParallel(toGenerate, function(wp) {
      return path.join(DIST_OUT_DIR, wp.slug || wp.id);
    }, 10).then(function() {
      var elapsed2 = ((Date.now() - start2) / 1000).toFixed(1);
      var totalElapsed = ((Date.now() - start1) / 1000).toFixed(1);
      console.log('   ✅ Dist pages done (' + elapsed2 + 's)');
      console.log('\n✅ Done! Generated: ' + toGenerate.length + ' | Skipped: ' + skipped);
      console.log('   Total time: ' + totalElapsed + 's\n');
      console.log('📝  Next steps:');
      console.log('   1. git add wallpaper/ dist/wallpaper/');
      console.log('   2. git commit -m "feat: add ' + toGenerate.length + ' new wallpaper pages"');
      console.log('   3. git push');
      console.log('   4. Submit new URLs to Google Search Console\n');
    });
  });
}

main();
