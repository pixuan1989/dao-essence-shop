/**
 * build-blog.js
 * Vercel build script: converts CMS .md files to .html and updates article listings.
 * 
 * Build flow:
 *   1. Copy project files to dist/ (excluding .git, node_modules, .md sources)
 *   2. Read .md files from blog/posts/ and blog/<category>/
 *   3. Generate article HTML → dist/blog/*.html
 *   4. Generate category pages → dist/blog/*.html
 *   5. Generate blog index → dist/blog/index.html
 *   6. Vercel deploys from dist/ (outputDirectory)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = __dirname;
const DIST_DIR = path.join(__dirname, 'dist');
const BLOG_DIR = path.join(SRC_DIR, 'blog');
const POSTS_DIR = path.join(BLOG_DIR, 'posts');
const DIST_BLOG_DIR = path.join(DIST_DIR, 'blog');

// Category subfolder collections from CMS config
const CATEGORY_FOLDERS = [
  'bazi-astrology',
  'zodiac-horoscope',
  'feng-shui',
  'daily-horoscope',
  'lucky-tips'
];

// Category display names
const CATEGORY_LABELS = {
  'bazi-astrology': 'BaZi Astrology',
  'zodiac-horoscope': 'Zodiac Horoscope',
  'feng-shui': 'Feng Shui',
  'daily-horoscope': 'Daily Horoscope',
  'lucky-tips': 'Lucky Tips'
};

// CSS version for cache busting
const CSS_VERSION = Date.now();
const SITE_URL = 'https://www.daoessentia.com';

// Shared nav HTML
const NAV_HTML = `
    <header class="header">
        <div class="container">
            <nav class="nav">
                <a href="../index.html" class="logo">
                    <div class="logo-icon"></div>
                    <div class="logo-text"><span class="logo-en">DAO ESSENCE</span></div>
                </a>
                <ul class="nav-menu">
                    <li><a href="../index.html" class="nav-link">Home</a></li>
                    <li class="nav-dropdown">
                        <span class="nav-dropdown-trigger">Blog <i class="nav-dropdown-arrow"></i></span>
                        <div class="nav-dropdown-menu">
                            <a href="../blog/bazi-astrology.html">八字命理学 Bazi</a>
                            <a href="../blog/zodiac-horoscope.html">十二生肖运势 Zodiac</a>
                            <a href="../blog/feng-shui.html">风水知识 Feng Shui</a>
                            <a href="../blog/daily-horoscope.html">每日运势 Daily</a>
                            <a href="../blog/lucky-tips.html">旺运术 Lucky Tips</a>
                        </div>
                    </li>
                    <li><a href="../culture.html" class="nav-link">Energy Universe</a></li>
                    <li><a href="../shop.html" class="nav-link">Shop</a></li>
                    <li><a href="../about.html" class="nav-link">About Us</a></li>
                </ul>
                <button class="mobile-menu-btn"><span></span><span></span><span></span></button>
            </nav>
        </div>
    </header>`;

const FOOTER_HTML = `
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <div class="footer-logo">
                        <div class="logo-icon"></div>
                        <span class="logo-en">DAO ESSENCE</span>
                    </div>
                    <p class="footer-desc">Practical Chinese metaphysics for modern life. Free BaZi analysis, Feng Shui guidance, and Five Elements wisdom — no mystification, no fortune-cookie readings.</p>
                </div>
                <div class="footer-links">
                    <h4>Explore</h4>
                    <a href="../culture.html">Energy Universe</a>
                    <a href="../shop.html">Shop</a>
                    <a href="bazi-astrology.html">BaZi Blog</a>
                </div>
                <div class="footer-links">
                    <h4>Blog Categories</h4>
                    <a href="bazi-astrology.html">BaZi Astrology</a>
                    <a href="zodiac-horoscope.html">Zodiac Horoscope</a>
                    <a href="feng-shui.html">Feng Shui</a>
                    <a href="daily-horoscope.html">Daily Horoscope</a>
                    <a href="lucky-tips.html">Lucky Tips</a>
                </div>
                <div class="footer-links">
                    <h4>Support</h4>
                    <a href="../about.html">About Us</a>
                    <a href="../contact.html">Contact</a>
                    <a href="../privacy.html">Privacy Policy</a>
                    <a href="../terms.html">Terms of Service</a>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024-2026 DAO Essence. All rights reserved.</p>
                <div class="footer-social">
                    <a href="https://www.instagram.com/daoessence" target="_blank" rel="noopener" aria-label="Instagram">Instagram</a>
                    <a href="https://www.pinterest.com/daoessence" target="_blank" rel="noopener" aria-label="Pinterest">Pinterest</a>
                    <a href="https://www.reddit.com/r/daoessence" target="_blank" rel="noopener" aria-label="Reddit">Reddit</a>
                </div>
            </div>
        </div>
    </footer>`;

const ARTICLE_STYLES = `
        body { background-color: #FFFFFF !important; }
        .blog-article { max-width: 800px; margin: 0 auto; padding: 4rem 5%; }
        .blog-article h1 { font-family: var(--font-display); font-size: clamp(2rem, 5vw, 2.8rem); color: #1A1A1A; margin-bottom: 0.5rem; letter-spacing: 0.08em; line-height: 1.2; }
        .blog-meta { color: var(--text-secondary); font-size: 0.88rem; margin-bottom: 2.5rem; padding-bottom: 2rem; border-bottom: 1px solid rgba(212,175,55,0.15); }
        .blog-article h2 { font-family: var(--font-display); font-size: 1.6rem; color: #1A1A1A; margin: 2.5rem 0 1rem; letter-spacing: 0.05em; }
        .blog-article h3 { font-family: var(--font-display); font-size: 1.2rem; color: #1A1A1A; margin: 2rem 0 0.8rem; }
        .blog-article p { color: var(--text-secondary); line-height: 1.9; font-size: 1rem; margin-bottom: 1.2rem; }
        .blog-article strong { color: var(--text-primary); }
        .blog-article ul, .blog-article ol { color: var(--text-secondary); line-height: 2; margin-bottom: 1.2rem; padding-left: 1.5rem; }
        .blog-article li { margin-bottom: 0.5rem; }
        .blog-article blockquote { border-left: 4px solid var(--accent-color); padding: 1rem 1.5rem; margin: 2rem 0; background: rgba(212,175,55,0.04); border-radius: 0 8px 8px 0; }
        .blog-article blockquote p { margin-bottom: 0; font-style: italic; }
        .blog-article table { width: 100%; border-collapse: collapse; margin: 2rem 0; }
        .blog-article th, .blog-article td { border: 1px solid rgba(212,175,55,0.15); padding: 0.8rem 1rem; text-align: left; }
        .blog-article th { background: rgba(212,175,55,0.06); color: var(--accent-color); font-family: var(--font-display); font-size: 0.9rem; letter-spacing: 0.03em; }
        .blog-article td { color: var(--text-secondary); font-size: 0.95rem; }
        .blog-article img { max-width: 100%; border-radius: 8px; margin: 1.5rem 0; }
        .blog-article a { color: var(--accent-color); text-decoration: underline; }
        .blog-article a:hover { color: #E8C547; }
        .blog-cta { text-align: center; padding: 3rem; margin: 3rem 0; background: linear-gradient(135deg, rgba(212,175,55,0.06), rgba(212,175,55,0.02)); border: 1px solid rgba(212,175,55,0.2); border-radius: 16px; }
        .blog-cta a { display: inline-block; padding: 1rem 2.5rem; background: var(--accent-color); color: #1A1208; text-decoration: none; font-weight: 600; letter-spacing: 0.05em; border-radius: 6px; transition: all 0.3s; }
        .blog-cta a:hover { background: #E8C547; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(212,175,55,0.3); }`;

// ─── Helpers ────────────────────────────────────────────────

function copyDirSync(src, dest, excludeDirs = []) {
  // Create destination if it doesn't exist
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (excludeDirs.includes(entry.name)) continue;

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath, excludeDirs);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function generateSlug(filename, data, existingSlugs) {
  // Remove .md extension and surrounding quotes
  let base = filename.replace(/\.md$/, '').replace(/^["'""'']+|["'""'']+$/g, '');
  
  // Replace CJK parens and special chars with dash
  base = base.replace(/[（()）\[\]【】]/g, '-');
  
  // Try ASCII slug first
  const asciiSlug = base.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
  
  if (/^[\w-]+$/.test(asciiSlug) && asciiSlug.length > 2) {
    let finalSlug = asciiSlug;
    let counter = 1;
    while (existingSlugs.has(finalSlug)) {
      finalSlug = `${asciiSlug}-${counter++}`;
    }
    existingSlugs.add(finalSlug);
    return finalSlug;
  }
  
  // For Chinese titles: use date + short hash
  const rawDate = data.date instanceof Date ? data.date.toISOString() : String(data.date || '');
  const dateStr = rawDate.replace(/[-\sT:Z]/g, '').substring(0, 8) || 'untitled';
  const hash = base.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0).toString(36).substring(0, 4);
  let finalSlug = `post-${dateStr}-${hash}`;
  let counter = 1;
  while (existingSlugs.has(finalSlug)) {
    finalSlug = `post-${dateStr}-${hash}-${counter++}`;
  }
  existingSlugs.add(finalSlug);
  return finalSlug;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function readAllMdFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const raw = fs.readFileSync(path.join(dir, f), 'utf-8');
      const { data, content } = matter(raw);
      return { filename: f, slug: f.replace(/\.md$/, ''), data, content };
    });
}

// ─── Generate Article HTML ──────────────────────────────────

function generateArticleHtml(post, category) {
  const { data, content, slug } = post;
  const htmlBody = marked.parse(content);
  const dateFormatted = formatDate(data.date);
  const categoryLabel = CATEGORY_LABELS[category] || category;
  const categoryHref = `${category}.html`;

  // FAQ structured data
  let faqJsonLd = '';
  if (data.faq && data.faq.length > 0) {
    const faqItems = data.faq.map(q => ({
      '@type': 'Question',
      'name': q.question,
      'acceptedAnswer': { '@type': 'Answer', 'text': q.answer }
    }));
    faqJsonLd = `
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": ${JSON.stringify(faqItems, null, 4)}
    }
    </script>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(data.title)} | DAO Essence</title>
    <meta name="description" content="${escapeHtml(data.description || '')}">
    <meta name="robots" content="index, follow">
    <meta property="og:title" content="${escapeHtml(data.title)} | DAO Essence">
    <meta property="og:description" content="${escapeHtml(data.description || '')}">
    <meta property="og:image" content="${data.image || SITE_URL + '/images/og-default.jpg'}">
    <meta property="og:url" content="${SITE_URL}/blog/${slug}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="DAO Essence">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(data.title)}">
    <meta name="twitter:description" content="${escapeHtml(data.description || '')}">
    <meta name="twitter:image" content="${data.image || SITE_URL + '/images/og-default.jpg'}">
    <link rel="canonical" href="${SITE_URL}/blog/${slug}">
    <link rel="stylesheet" href="../styles.min.css?v=${CSS_VERSION}">
    <script src="../main.min.js?v=${CSS_VERSION}" defer></script>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": "${SITE_URL}/"},
            {"@type": "ListItem", "position": 2, "name": "Blog", "item": "${SITE_URL}/blog/"},
            {"@type": "ListItem", "position": 3, "name": "${escapeHtml(data.title)}", "item": "${SITE_URL}/blog/${slug}"}
        ]
    }
    </script>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "${escapeHtml(data.title)}",
        "description": "${escapeHtml(data.description || '')}",
        "image": "${data.image || SITE_URL + '/images/og-default.jpg'}",
        "author": {"@type": "Organization", "name": "${escapeHtml(data.author || 'DAO Essence')}"},
        "publisher": {"@type": "Organization", "name": "DAO Essence", "logo": {"@type": "ImageObject", "url": "${SITE_URL}/images/og-default.jpg"}},
        "datePublished": "${data.date || ''}",
        "dateModified": "${data.date || ''}",
        "mainEntityOfPage": "${SITE_URL}/blog/${slug}"
    }
    </script>${faqJsonLd}
    <style>${ARTICLE_STYLES}</style>
</head>
<body>
${NAV_HTML}

    <article class="blog-article">
        <p style="font-size: 0.8rem; color: var(--accent-color); letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 0.5rem;">${escapeHtml(categoryLabel)}</p>
        <h1>${escapeHtml(data.title)}</h1>
        ${data.image ? `<img src="${data.image}" alt="${escapeHtml(data.title)}" style="max-width:100%;border-radius:12px;margin:1.5rem 0;">` : ''}
        <div class="blog-meta">
            <span>By ${escapeHtml(data.author || 'DAO Essence')}</span>
            ${dateFormatted ? ` · <span>${dateFormatted}</span>` : ''}
            ${data.readTime ? ` · <span>${data.readTime} min read</span>` : ''}
        </div>

        ${htmlBody}

        <div class="blog-cta">
            <h3 style="font-family: var(--font-display); color: var(--accent-color); margin-bottom: 0.8rem;">Discover Your Energy Path</h3>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Get a personalized BaZi reading and unlock the secrets of your birth chart.</p>
            <a href="../bazi-form.html">Get Your BaZi Reading →</a>
        </div>
    </article>

${FOOTER_HTML}
</body>
</html>`;
}

// ─── Generate Category Page ─────────────────────────────────

function generateCategoryHtml(category, articles) {
  const label = CATEGORY_LABELS[category] || category;
  const cardHtml = articles.map(a => `
            <a href="${a.slug}.html" class="blog-card">
                ${a.data.image ? `<img src="${a.data.image}" alt="${escapeHtml(a.data.title)}" style="width:100%;border-radius:8px 8px 0 0;margin-bottom:1rem;">` : ''}
                <h2>${escapeHtml(a.data.title)}</h2>
                <p>${escapeHtml(a.data.description || '')}</p>
                <div class="blog-card-meta">
                    <span>${escapeHtml(a.data.author || 'DAO Essence')}</span>
                    ${a.data.readTime ? `<span>·</span><span>${a.data.readTime} min read</span>` : ''}
                </div>
            </a>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${label} Blog | DAO Essence</title>
    <meta name="description" content="Explore our ${label} articles — Chinese metaphysics, BaZi, Feng Shui, and more.">
    <meta name="robots" content="index, follow">
    <meta property="og:title" content="${label} Blog | DAO Essence">
    <meta property="og:url" content="${SITE_URL}/blog/${category}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="DAO Essence">
    <link rel="canonical" href="${SITE_URL}/blog/${category}">
    <link rel="stylesheet" href="../styles.min.css?v=${CSS_VERSION}">
    <script src="../main.min.js?v=${CSS_VERSION}" defer></script>
    <style>
        .blog-category { max-width: 900px; margin: 0 auto; padding: 5rem 5% 4rem; }
        .blog-category-header { margin-bottom: 3rem; }
        .blog-category-header h1 { font-family: var(--font-display); font-size: clamp(1.8rem, 4vw, 2.6rem); color: var(--accent-color); letter-spacing: 0.08em; margin-bottom: 0.5rem; }
        .blog-category-header p { color: var(--text-secondary); font-size: 1.05rem; line-height: 1.7; }
        .blog-category-breadcrumb { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem; }
        .blog-category-breadcrumb a { color: var(--accent-color); text-decoration: none; }
        .blog-category-breadcrumb a:hover { text-decoration: underline; }
        .blog-card-list { display: flex; flex-direction: column; gap: 1.5rem; }
        .blog-card { display: block; padding: 2rem; background: rgba(212,175,55,0.03); border: 1px solid rgba(212,175,55,0.1); border-radius: 12px; text-decoration: none; transition: all 0.3s ease; }
        .blog-card:hover { background: rgba(212,175,55,0.06); border-color: rgba(212,175,55,0.25); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
        .blog-card img { max-width: 100%; }
        .blog-card h2 { font-family: var(--font-display); font-size: 1.3rem; color: var(--accent-color); letter-spacing: 0.05em; margin-bottom: 0.6rem; transition: color 0.3s; }
        .blog-card:hover h2 { color: #E8C547; }
        .blog-card p { color: var(--text-secondary); font-size: 0.95rem; line-height: 1.7; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .blog-card-meta { display: flex; gap: 1rem; font-size: 0.82rem; color: var(--text-secondary); opacity: 0.7; }
        .blog-card-meta span { display: flex; align-items: center; gap: 0.3rem; }
        .blog-back-link { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--accent-color); text-decoration: none; font-size: 0.9rem; margin-bottom: 2rem; opacity: 0.8; transition: opacity 0.3s; }
        .blog-back-link:hover { opacity: 1; text-decoration: underline; }
    </style>
</head>
<body>
${NAV_HTML}

    <main class="blog-category">
        <a href="index.html" class="blog-back-link">← Back to Blog</a>
        <div class="blog-category-header">
            <p class="blog-category-breadcrumb"><a href="../index.html">Home</a> / <a href="index.html">Blog</a> / ${label}</p>
            <h1>${label}</h1>
            <p>Articles and guides on ${label} by DAO Essence.</p>
        </div>

        <div class="blog-card-list">
${cardHtml}
        </div>
    </main>

${FOOTER_HTML}
</body>
</html>`;
}

// ─── Generate Blog Index ────────────────────────────────────

function generateBlogIndex(allArticles) {
  // Group by category for latest section
  const latestCards = allArticles
    .sort((a, b) => new Date(b.data.date) - new Date(a.data.date))
    .slice(0, 8)
    .map(a => {
      const cat = a.data.category || 'bazi-astrology';
      const catLabel = CATEGORY_LABELS[cat] || cat;
      return `
                <a href="${a.slug}.html" class="blog-card">
                    <span class="blog-card-category">${catLabel}</span>
                    <h2>${escapeHtml(a.data.title)}</h2>
                    <p>${escapeHtml(a.data.description || '')}</p>
                    <div class="blog-card-meta">
                        <span>${escapeHtml(a.data.author || 'DAO Essence')}</span>
                        ${a.data.readTime ? `<span>·</span><span>${a.data.readTime} min read</span>` : ''}
                    </div>
                </a>`;
    }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog | DAO Essence — Chinese Metaphysics & Taoist Wisdom</title>
    <meta name="description" content="Explore articles on BaZi astrology, Feng Shui, Five Elements theory, Taoist meditation, Chinese zodiac, and daily horoscopes.">
    <meta name="robots" content="index, follow">
    <meta property="og:title" content="Blog | DAO Essence">
    <meta property="og:url" content="${SITE_URL}/blog/">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="DAO Essence">
    <link rel="canonical" href="${SITE_URL}/blog/">
    <link rel="stylesheet" href="../styles.min.css?v=${CSS_VERSION}">
    <script src="../main.min.js?v=${CSS_VERSION}" defer></script>
    <style>
        .blog-home { max-width: 960px; margin: 0 auto; padding: 5rem 5% 4rem; }
        .blog-home-header { text-align: center; margin-bottom: 3.5rem; }
        .blog-home-header h1 { font-family: var(--font-display); font-size: clamp(2rem, 5vw, 2.8rem); color: var(--accent-color); letter-spacing: 0.1em; margin-bottom: 0.8rem; }
        .blog-home-header p { color: var(--text-secondary); font-size: 1.05rem; line-height: 1.7; max-width: 600px; margin: 0 auto; }
        .blog-categories { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 1rem; margin-bottom: 4rem; }
        .blog-cat-link { display: flex; flex-direction: column; align-items: center; padding: 1.5rem 1rem; background: rgba(212,175,55,0.03); border: 1px solid rgba(212,175,55,0.1); border-radius: 12px; text-decoration: none; transition: all 0.3s ease; }
        .blog-cat-link:hover { background: rgba(212,175,55,0.06); border-color: rgba(212,175,55,0.25); transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
        .blog-cat-icon { font-size: 2rem; margin-bottom: 0.6rem; }
        .blog-cat-name { color: var(--accent-color); font-family: var(--font-display); font-size: 0.9rem; letter-spacing: 0.05em; text-align: center; }
        .blog-cat-sub { color: var(--text-secondary); font-size: 0.75rem; opacity: 0.6; margin-top: 0.3rem; text-align: center; }
        .blog-section-title { font-family: var(--font-display); font-size: 1.4rem; color: var(--accent-color); letter-spacing: 0.08em; margin-bottom: 1.5rem; padding-bottom: 0.8rem; border-bottom: 1px solid rgba(212,175,55,0.15); }
        .blog-latest { margin-bottom: 4rem; }
        .blog-card-list { display: flex; flex-direction: column; gap: 1.2rem; }
        .blog-card { display: block; padding: 1.8rem 2rem; background: rgba(212,175,55,0.03); border: 1px solid rgba(212,175,55,0.1); border-radius: 12px; text-decoration: none; transition: all 0.3s ease; }
        .blog-card:hover { background: rgba(212,175,55,0.06); border-color: rgba(212,175,55,0.25); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
        .blog-card-category { display: inline-block; font-size: 0.72rem; color: var(--accent-color); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 0.5rem; padding: 0.2rem 0.6rem; background: rgba(212,175,55,0.08); border-radius: 4px; }
        .blog-card h2 { font-family: var(--font-display); font-size: 1.25rem; color: var(--accent-color); letter-spacing: 0.05em; margin-bottom: 0.5rem; transition: color 0.3s; }
        .blog-card:hover h2 { color: #E8C547; }
        .blog-card p { color: var(--text-secondary); font-size: 0.92rem; line-height: 1.7; margin-bottom: 0.8rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .blog-card-meta { display: flex; gap: 1rem; font-size: 0.8rem; color: var(--text-secondary); opacity: 0.7; }
        .blog-home-cta { text-align: center; padding: 3rem 2rem; margin-top: 3rem; background: linear-gradient(135deg, rgba(212,175,55,0.06), rgba(212,175,55,0.02)); border: 1px solid rgba(212,175,55,0.15); border-radius: 16px; }
        .blog-home-cta h3 { font-family: var(--font-display); color: var(--accent-color); font-size: 1.3rem; letter-spacing: 0.06em; margin-bottom: 0.8rem; }
        .blog-home-cta p { color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 1rem; }
        .blog-home-cta a { display: inline-block; padding: 0.9rem 2.2rem; background: var(--accent-color); color: #1A1208; text-decoration: none; font-weight: 600; letter-spacing: 0.05em; border-radius: 6px; transition: all 0.3s; }
        .blog-home-cta a:hover { background: #E8C547; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(212,175,55,0.3); }
    </style>
</head>
<body>
${NAV_HTML}

    <main class="blog-home">
        <div class="blog-home-header">
            <h1>Blog</h1>
            <p>Ancient wisdom meets modern insight. Explore articles on BaZi astrology, Feng Shui, meditation, and the Five Elements.</p>
        </div>

        <div class="blog-categories">
            <a href="bazi-astrology.html" class="blog-cat-link">
                <span class="blog-cat-icon">🐉</span>
                <span class="blog-cat-name">BaZi Astrology</span>
                <span class="blog-cat-sub">八字命理学</span>
            </a>
            <a href="zodiac-horoscope.html" class="blog-cat-link">
                <span class="blog-cat-icon">🐀</span>
                <span class="blog-cat-name">Zodiac Horoscope</span>
                <span class="blog-cat-sub">十二生肖运势</span>
            </a>
            <a href="feng-shui.html" class="blog-cat-link">
                <span class="blog-cat-icon">🏡</span>
                <span class="blog-cat-name">Feng Shui</span>
                <span class="blog-cat-sub">风水知识</span>
            </a>
            <a href="daily-horoscope.html" class="blog-cat-link">
                <span class="blog-cat-icon">📅</span>
                <span class="blog-cat-name">Daily Horoscope</span>
                <span class="blog-cat-sub">每日运势</span>
            </a>
            <a href="lucky-tips.html" class="blog-cat-link">
                <span class="blog-cat-icon">✨</span>
                <span class="blog-cat-name">Lucky Tips</span>
                <span class="blog-cat-sub">旺运术</span>
            </a>
        </div>

        <section class="blog-latest">
            <h2 class="blog-section-title">Latest Articles</h2>
            <div class="blog-card-list">
${latestCards}
            </div>
        </section>

        <div class="blog-home-cta">
            <h3>Discover Your Energy Path</h3>
            <p>Get a personalized BaZi reading and unlock the secrets of your birth chart.</p>
            <a href="../bazi-form.html">Get Your BaZi Reading</a>
        </div>
    </main>

${FOOTER_HTML}
</body>
</html>`;
}

// ─── Main Build ─────────────────────────────────────────────

function main() {
  console.log('=== Blog Build Started ===');
  console.log('SRC_DIR:', SRC_DIR);
  console.log('DIST_DIR:', DIST_DIR);
  console.log('POSTS_DIR:', POSTS_DIR);
  console.log('POSTS_DIR exists:', fs.existsSync(POSTS_DIR));

  if (fs.existsSync(POSTS_DIR)) {
    console.log('Files in POSTS_DIR:', fs.readdirSync(POSTS_DIR));
  }

  // Step 1: Clean and create dist/
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.mkdirSync(DIST_BLOG_DIR, { recursive: true });

  // Step 2: Copy entire project to dist/ (excluding build artifacts)
  console.log('Copying project to dist/...');
  copyDirSync(SRC_DIR, DIST_DIR, [
    '.git', 'node_modules', 'dist', '.vercel',
    'build-blog.js', 'build-blog.cjs', 'package.json', 'package-lock.json'
  ]);

  // Step 3: Collect all articles from CMS
  let allArticles = [];

  // Read from blog/posts/ (main blog collection)
  const mainPosts = readAllMdFiles(POSTS_DIR);
  mainPosts.forEach(post => {
    allArticles.push({ ...post, category: post.data.category || 'bazi-astrology' });
  });

  // Read from category subfolders
  for (const cat of CATEGORY_FOLDERS) {
    const catDir = path.join(BLOG_DIR, cat);
    const catPosts = readAllMdFiles(catDir);
    catPosts.forEach(post => {
      allArticles.push({ ...post, category: cat });
    });
  }

  console.log(`Found ${allArticles.length} articles total`);

  if (allArticles.length === 0) {
    console.log('WARNING: No articles found. Deploying static files only.');
    console.log('=== Blog Build Complete (no articles) ===');
    return;
  }

  // Step 4: Generate article HTML files in dist/blog/
  const usedSlugs = new Set();
  for (const post of allArticles) {
    const slug = generateSlug(post.filename, post.data, usedSlugs);
    post.slug = slug;

    const html = generateArticleHtml(post, post.category);
    const outPath = path.join(DIST_BLOG_DIR, `${slug}.html`);
    fs.writeFileSync(outPath, html);
    console.log(`  Generated: dist/blog/${slug}.html`);
  }

  // Step 5: Group articles by category and generate category pages
  const byCategory = {};
  for (const post of allArticles) {
    const cat = post.category || 'bazi-astrology';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(post);
  }

  for (const [cat, articles] of Object.entries(byCategory)) {
    const html = generateCategoryHtml(cat, articles);
    const outPath = path.join(DIST_BLOG_DIR, `${cat}.html`);
    fs.writeFileSync(outPath, html);
    console.log(`  Updated: dist/blog/${cat}.html (${articles.length} articles)`);
  }

  // Step 6: Generate blog index
  const indexHtml = generateBlogIndex(allArticles);
  const indexPath = path.join(DIST_BLOG_DIR, 'index.html');
  fs.writeFileSync(indexPath, indexHtml);
  console.log(`  Updated: dist/blog/index.html`);

  // Step 7: Inject latest articles into homepage
  console.log('Injecting latest articles into homepage...');
  const homeIndexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(homeIndexPath)) {
    let homeHtml = fs.readFileSync(homeIndexPath, 'utf-8');
    const latest4 = allArticles
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date))
      .slice(0, 4);
    const cardsHtml = latest4.map(post => {
      const catLabel = CATEGORY_LABELS[post.category] || post.category || 'Blog';
      const imgSrc = post.data.image || SITE_URL + '/images/og-default.jpg';
      const dateStr = formatDate(post.data.date);
      return `                <a href="/blog/${post.slug}" class="article-card scroll-animate">
                    <div class="article-card-image">
                        <img src="${imgSrc}" alt="${escapeHtml(post.data.title)}" loading="lazy">
                    </div>
                    <div class="article-card-body">
                        <span class="article-card-category">${escapeHtml(catLabel)}</span>
                        <h3>${escapeHtml(post.data.title)}</h3>
                        <p>${escapeHtml(post.data.description || '')}</p>
                        <div class="article-card-meta">
                            <span>${escapeHtml(post.data.author || 'DAO Essence')}</span>
                            ${dateStr ? `<span>${dateStr}</span>` : ''}
                            ${post.data.readTime ? `<span>${post.data.readTime} min read</span>` : ''}
                        </div>
                    </div>
                </a>`;
    }).join('\n');
    homeHtml = homeHtml.replace(
      /<div class="articles-list">([\s\S]*?)<\/div>\s*<\/div>\s*<div class="articles-more">/,
      `<div class="articles-list">\n${cardsHtml}\n            </div>\n            <div class="articles-more">`
    );
    fs.writeFileSync(homeIndexPath, homeHtml);
    console.log(`  Updated: index.html (${latest4.length} latest articles)`);
  }

  // Step 8: Generate dynamic sitemap.xml
  console.log('Generating sitemap.xml...');
  const today = new Date().toISOString().split('T')[0];
  const staticUrls = [
    { loc: '/', changefreq: 'weekly', priority: '1.0' },
    { loc: '/shop', changefreq: 'daily', priority: '0.9' },
    { loc: '/culture', changefreq: 'monthly', priority: '0.7' },
    { loc: '/about', changefreq: 'monthly', priority: '0.6' },
    { loc: '/contact', changefreq: 'monthly', priority: '0.5' },
    { loc: '/bazi-form', changefreq: 'monthly', priority: '0.8' },
    { loc: '/guide', changefreq: 'monthly', priority: '0.7' },
    { loc: '/destiny', changefreq: 'monthly', priority: '0.7' },
    { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
    { loc: '/terms', changefreq: 'yearly', priority: '0.3' },
    { loc: '/blog/', changefreq: 'weekly', priority: '0.9' },
  ];
  // Add category pages
  for (const cat of CATEGORY_FOLDERS) {
    staticUrls.push({ loc: `/blog/${cat}`, changefreq: 'weekly', priority: '0.7' });
  }
  let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
  for (const u of staticUrls) {
    sitemapXml += `    <url>
        <loc>${SITE_URL}${u.loc}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>${u.changefreq}</changefreq>
        <priority>${u.priority}</priority>
    </url>\n`;
  }
  // Add blog articles from CMS
  for (const post of allArticles) {
    const d = post.data.date instanceof Date ? post.data.date.toISOString().split('T')[0] : String(post.data.date || today);
    sitemapXml += `    <url>
        <loc>${SITE_URL}/blog/${post.slug}</loc>
        <lastmod>${d}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>\n`;
  }
  sitemapXml += `</urlset>`;
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml);
  console.log(`  Generated: sitemap.xml (${staticUrls.length + allArticles.length} URLs)`);

  // Step 9: Generate clean URLs (create /about/index.html from /about.html)
  console.log('Generating clean URLs...');
  const htmlFiles = [];
  function collectHtmlFiles(dir) {
    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        collectHtmlFiles(fullPath);
      } else if (file.endsWith('.html') && file !== 'index.html') {
        htmlFiles.push(fullPath);
      }
    }
  }
  collectHtmlFiles(DIST_DIR);
  for (const htmlPath of htmlFiles) {
    const dirName = htmlPath.replace(/\.html$/, '');
    fs.mkdirSync(dirName, { recursive: true });
    fs.copyFileSync(htmlPath, path.join(dirName, 'index.html'));
    console.log(`  ${path.relative(DIST_DIR, htmlPath)} -> ${path.relative(DIST_DIR, dirName)}/index.html`);
  }

  console.log('=== Blog Build Complete ===');
}

main();
