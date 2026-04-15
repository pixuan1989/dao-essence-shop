/**
 * DAO Essence Blog Build Script
 * Converts Markdown articles to SEO-optimized HTML pages
 * 
 * Usage: node build-blog.js
 * 
 * Requires: npm install marked gray-matter
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');

// ============================
// Configuration
// ============================
const SITE_URL = 'https://www.daoessentia.com';
const SITE_NAME = 'DAO Essence';
const CSS_VERSION = '202604131200';

const CATEGORIES = {
  'bazi-astrology': {
    label: 'BaZi Astrology',
    breadcrumb: 'BaZi Astrology'
  },
  'zodiac-horoscope': {
    label: 'Zodiac Horoscope',
    breadcrumb: 'Zodiac Horoscope'
  },
  'feng-shui': {
    label: 'Feng Shui',
    breadcrumb: 'Feng Shui'
  },
  'daily-horoscope': {
    label: 'Daily Horoscope',
    breadcrumb: 'Daily Horoscope'
  },
  'lucky-tips': {
    label: 'Lucky Tips',
    breadcrumb: 'Lucky Tips'
  }
};

// Directories to scan for markdown files
const POST_DIRS = [
  'blog/posts',
  'blog/bazi-astrology',
  'blog/zodiac-horoscope',
  'blog/feng-shui',
  'blog/daily-horoscope',
  'blog/lucky-tips'
];

// ============================
// Configure Marked
// ============================
marked.setOptions({
  gfm: true,
  breaks: false,
  headerIds: true
});

// ============================
// Utility Functions
// ============================

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function estimateReadTime(content) {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// ============================
// HTML Template Generator
// ============================

function generateHtml(frontmatter, markdownContent, category, categoryLabel) {
  const {
    title = 'Untitled',
    description = '',
    tags = [],
    date = new Date().toISOString().split('T')[0],
    author = 'DAO Essence',
    readTime = 5,
    image = '',
    faq = [],
    body: rawBody
  } = frontmatter;

  const htmlBody = marked.parse(rawBody || markdownContent);
  const slug = slugify(title);
  const tagKeywords = tags.join(', ');
  const ogImage = image ? `${SITE_URL}${image}` : `${SITE_URL}/images/og-default.jpg`;
  const tagLabels = tags.map(t => escapeHtml(t)).join(' · ');
  const readTimeCalc = readTime || estimateReadTime(rawBody || markdownContent);

  // Build FAQ JSON-LD
  let faqJsonLd = '';
  if (faq && faq.length > 0) {
    const faqItems = faq.map(item => {
      const q = typeof item === 'object' ? item.question : '';
      const a = typeof item === 'object' ? item.answer : '';
      return `{
                    "@type": "Question",
                    "name": "${escapeHtml(q)}",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "${escapeHtml(a)}"
                    }
                }`;
    }).join(',');

    faqJsonLd = `
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [${faqItems}]
    }
    </script>`;
  }

  // Build breadcrumb path
  const breadcrumbCategory = category ? 
    `{"@type": "ListItem", "position": 2, "name": "${categoryLabel}", "item": "${SITE_URL}/blog/${category}"},` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)} | ${SITE_NAME}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="keywords" content="${escapeHtml(tagKeywords)}">
    <link rel="canonical" href="${SITE_URL}/blog/${slug}">
    <link rel="alternate" hreflang="en" href="${SITE_URL}/blog/${slug}">
    <link rel="alternate" hreflang="x-default" href="${SITE_URL}/blog/${slug}">
    <meta name="robots" content="index, follow">
    <!-- Open Graph -->
    <meta property="og:title" content="${escapeHtml(title)} | ${SITE_NAME}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:url" content="${SITE_URL}/blog/${slug}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="${SITE_NAME}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${ogImage}">
    <link rel="stylesheet" href="/styles.min.css?v=${CSS_VERSION}">
    <script src="/main.min.js?v=${CSS_VERSION}" defer></script>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": "${SITE_URL}/"},
            ${breadcrumbCategory}
            {"@type": "ListItem", "position": ${category ? 3 : 2}, "name": "${escapeHtml(title)}", "item": "${SITE_URL}/blog/${slug}"}
        ]
    }
    </script>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "${escapeHtml(title)}",
        "description": "${escapeHtml(description)}",
        "image": "${ogImage}",
        "author": {"@type": "Organization", "name": "${SITE_NAME}"},
        "publisher": {"@type": "Organization", "name": "${SITE_NAME}", "logo": {"@type": "ImageObject", "url": "${SITE_URL}/images/og-default.jpg"}},
        "datePublished": "${date}",
        "dateModified": "${date}",
        "mainEntityOfPage": "${SITE_URL}/blog/${slug}"
    }
    </script>${faqJsonLd}
    <style>
        .blog-article { max-width: 800px; margin: 0 auto; padding: 4rem 5%; }
        .blog-article h1 { font-family: var(--font-display); font-size: clamp(2rem, 5vw, 2.8rem); color: var(--accent-color); margin-bottom: 0.5rem; letter-spacing: 0.08em; line-height: 1.2; }
        .blog-meta { color: var(--text-secondary); font-size: 0.88rem; margin-bottom: 2.5rem; padding-bottom: 2rem; border-bottom: 1px solid rgba(212,175,55,0.15); }
        .blog-meta a { color: var(--accent-color); text-decoration: none; }
        .blog-meta a:hover { text-decoration: underline; }
        .blog-article h2 { font-family: var(--font-display); font-size: 1.6rem; color: var(--accent-color); margin: 2.5rem 0 1rem; letter-spacing: 0.05em; }
        .blog-article h3 { font-family: var(--font-display); font-size: 1.2rem; color: var(--text-primary); margin: 2rem 0 0.8rem; }
        .blog-article p { color: var(--text-secondary); line-height: 1.9; font-size: 1rem; margin-bottom: 1.2rem; }
        .blog-article strong { color: var(--text-primary); }
        .blog-article em { color: var(--text-secondary); }
        .blog-article ul, .blog-article ol { color: var(--text-secondary); line-height: 2; margin-bottom: 1.2rem; padding-left: 1.5rem; }
        .blog-article li { margin-bottom: 0.5rem; }
        .blog-article blockquote { border-left: 4px solid var(--accent-color); padding: 1rem 1.5rem; margin: 2rem 0; background: rgba(212,175,55,0.04); border-radius: 0 8px 8px 0; }
        .blog-article blockquote p { margin-bottom: 0; font-style: italic; }
        .blog-article img { max-width: 100%; border-radius: 12px; margin: 2rem 0; }
        .blog-article a { color: var(--accent-color); text-decoration: underline; text-underline-offset: 3px; }
        .blog-article a:hover { opacity: 0.85; }
        .blog-article code { background: rgba(212,175,55,0.08); padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.9em; }
        .blog-article pre { background: rgba(212,175,55,0.06); padding: 1.5rem; border-radius: 12px; overflow-x: auto; margin: 2rem 0; }
        .blog-article pre code { background: none; padding: 0; }
        .blog-article table { width: 100%; border-collapse: collapse; margin: 2rem 0; }
        .blog-article th, .blog-article td { padding: 0.8rem 1rem; text-align: left; border-bottom: 1px solid rgba(212,175,55,0.1); }
        .blog-article th { color: var(--accent-color); font-family: var(--font-display); letter-spacing: 0.05em; }
        .blog-article hr { border: none; border-top: 1px solid rgba(212,175,55,0.15); margin: 3rem 0; }
        .blog-tags { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid rgba(212,175,55,0.1); }
        .blog-tags span { display: inline-block; padding: 0.3rem 0.8rem; background: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.15); border-radius: 20px; font-size: 0.8rem; color: var(--accent-color); margin-right: 0.5rem; margin-bottom: 0.5rem; }
        .blog-cta { text-align: center; padding: 3rem; margin: 3rem 0; background: linear-gradient(135deg, rgba(212,175,55,0.06), rgba(212,175,55,0.02)); border: 1px solid rgba(212,175,55,0.2); border-radius: 16px; }
        .blog-cta a { display: inline-block; padding: 1rem 2.5rem; background: var(--accent-color); color: #1A1208; text-decoration: none; font-weight: 600; letter-spacing: 0.05em; border-radius: 6px; transition: all 0.3s; }
        .blog-cta a:hover { background: #E8C547; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(212,175,55,0.3); }
    </style>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <nav class="nav">
                <a href="/" class="logo">
                    <div class="logo-icon"></div>
                    <div class="logo-text"><span class="logo-en">DAO ESSENCE</span></div>
                </a>
                <ul class="nav-menu">
                    <li><a href="/" class="nav-link">Home</a></li>
                    <li class="nav-dropdown">
                        <span class="nav-dropdown-trigger">Blog <i class="nav-dropdown-arrow"></i></span>
                        <div class="nav-dropdown-menu">
                            <a href="/blog/bazi-astrology">八字命理学 Bazi</a>
                            <a href="/blog/zodiac-horoscope">十二生肖运势 Zodiac</a>
                            <a href="/blog/feng-shui">风水知识 Feng Shui</a>
                            <a href="/blog/daily-horoscope">每日运势 Daily</a>
                            <a href="/blog/lucky-tips">旺运术 Lucky Tips</a>
                        </div>
                    </li>
                    <li><a href="/culture" class="nav-link">Energy Universe</a></li>
                    <li><a href="/shop" class="nav-link">Shop</a></li>
                    <li><a href="/guide" class="nav-link">Energy Principles</a></li>
                    <li><a href="/about" class="nav-link">About Us</a></li>
                </ul>
                <button class="mobile-menu-btn"><span></span><span></span><span></span></button>
            </nav>
        </div>
    </header>

    <article class="blog-article">
        ${category ? `<p style="font-size: 0.8rem; color: var(--accent-color); letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 0.5rem;"><a href="/blog/${category}" style="color: var(--accent-color); text-decoration: none;">${categoryLabel}</a></p>` : ''}
        <h1>${escapeHtml(title)}</h1>
        <div class="blog-meta">
            <span>By ${escapeHtml(author)}</span> · <span>${formatDate(date)}</span> · <span>${readTimeCalc} min read</span>
        </div>

        ${htmlBody}

        <div class="blog-tags">
            ${tagLabels}
        </div>

        <div class="blog-cta">
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 1.05rem;">Discover your energy path with personalized guidance.</p>
            <a href="/bazi-form">Get Your BaZi Reading</a>
        </div>
    </article>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <div class="footer-logo">
                        <div class="logo-icon"></div>
                        <span class="logo-en">DAO ESSENCE</span>
                    </div>
                    <p class="footer-desc">Ancient wisdom meets modern insight. Discover the power of Chinese metaphysics, BaZi readings, Feng Shui, and energy healing practices.</p>
                </div>
                <div class="footer-links">
                    <h4>Explore</h4>
                    <a href="/culture">Energy Universe</a>
                    <a href="/shop">Shop</a>
                    <a href="/blog/bazi-astrology">BaZi Blog</a>
                    <a href="/guide">Energy Principles</a>
                </div>
                <div class="footer-links">
                    <h4>Blog Categories</h4>
                    <a href="/blog/bazi-astrology">BaZi Astrology</a>
                    <a href="/blog/zodiac-horoscope">Zodiac Horoscope</a>
                    <a href="/blog/feng-shui">Feng Shui</a>
                    <a href="/blog/daily-horoscope">Daily Horoscope</a>
                    <a href="/blog/lucky-tips">Lucky Tips</a>
                </div>
                <div class="footer-links">
                    <h4>Support</h4>
                    <a href="/about">About Us</a>
                    <a href="/contact">Contact</a>
                    <a href="/privacy">Privacy Policy</a>
                    <a href="/terms">Terms of Service</a>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024-${new Date().getFullYear()} DAO Essence. All rights reserved.</p>
                <div class="footer-social">
                    <a href="https://www.instagram.com/daoessence" target="_blank" rel="noopener" aria-label="Instagram">Instagram</a>
                    <a href="https://www.pinterest.com/daoessence" target="_blank" rel="noopener" aria-label="Pinterest">Pinterest</a>
                    <a href="https://www.reddit.com/r/daoessence" target="_blank" rel="noopener" aria-label="Reddit">Reddit</a>
                </div>
            </div>
        </div>
    </footer>
</body>
</html>`;
}

// ============================
// Main Build Process
// ============================

function build() {
  console.log('\n🚀 DAO Essence Blog Builder\n');
  
  let totalBuilt = 0;
  let errors = 0;

  // Ensure blog image directory exists
  const blogImgDir = path.join(process.cwd(), 'images', 'blog');
  if (!fs.existsSync(blogImgDir)) {
    fs.mkdirSync(blogImgDir, { recursive: true });
    console.log('  📁 Created images/blog/ directory');
  }

  POST_DIRS.forEach(dirPath => {
    const fullPath = path.join(process.cwd(), dirPath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`  ⚠️  Directory not found: ${dirPath}/`);
      return;
    }

    const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.md'));
    
    if (files.length === 0) {
      console.log(`  📭 No markdown files in ${dirPath}/`);
      return;
    }

    // Determine category from directory name
    const dirName = path.basename(dirPath);
    const isPostsDir = dirName === 'posts';
    const category = isPostsDir ? null : dirName;
    const categoryLabel = category ? (CATEGORIES[category]?.breadcrumb || category) : null;

    files.forEach(file => {
      try {
        const filePath = path.join(fullPath, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data: frontmatter, content: markdownBody } = matter(fileContent);

        // Determine the category from frontmatter if in posts/
        let effectiveCategory = category;
        let effectiveCategoryLabel = categoryLabel;
        if (isPostsDir && frontmatter.category) {
          effectiveCategory = frontmatter.category;
          effectiveCategoryLabel = CATEGORIES[effectiveCategory]?.breadcrumb || effectiveCategory;
        }

        const html = generateHtml(frontmatter, markdownBody, effectiveCategory, effectiveCategoryLabel);
        
        const slug = slugify(frontmatter.title || file.replace('.md', ''));
        const outputPath = path.join(process.cwd(), 'blog', `${slug}.html`);
        
        fs.writeFileSync(outputPath, html, 'utf-8');
        console.log(`  ✅ ${slug}.html`);
        totalBuilt++;
      } catch (err) {
        console.error(`  ❌ Error processing ${file}: ${err.message}`);
        errors++;
      }
    });
  });

  console.log(`\n${'─'.repeat(40)}`);
  console.log(`  Total built: ${totalBuilt} pages`);
  if (errors > 0) console.log(`  Errors: ${errors}`);
  console.log(`${'─'.repeat(40)}\n`);

  // Generate sitemap entries
  generateSitemapEntries();
}

// ============================
// Sitemap Helper
// ============================

function generateSitemapEntries() {
  const blogDir = path.join(process.cwd(), 'blog');
  const htmlFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.html') && f !== 'index.html');
  const today = new Date().toISOString().split('T')[0];
  
  let entries = htmlFiles.map(f => 
    `  <url>\n    <loc>${SITE_URL}/blog/${f}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
  ).join('\n');

  console.log('📋 Sitemap entries to add:\n');
  console.log(entries);
  console.log('\n(Manually add these to sitemap.xml, or run the full build pipeline)\n');
}

// Run
build();
