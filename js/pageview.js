/**
 * pageview.js - 阅读量显示
 * 功能：
 *   1. 文章页面：自动 +1 并展示阅读量
 *   2. 文章列表页：批量查询所有文章阅读量并展示
 */

const PAGEVIEW_API = '/api/pageview';

// 从 URL 路径提取 slug
// 支持: /blog/slug-name → slug-name
//       /learn-bazi/chapter → learn-bazi/chapter
//       /zh/blog/slug-name → zh/slug-name
//       /zh/learn-bazi/chapter → zh/learn-bazi/chapter
function getSlugFromPath() {
  const path = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
  // /learn-bazi/ 路径（去掉前导 /，与 data-slug 保持一致）
  const lbm = path.match(/^(\/zh)?(\/learn-bazi\/[^/?#]+)/);
  if (lbm) return (lbm[1] || '') + lbm[2].replace(/^\//, '');
  // /blog/ 路径
  const bm = path.match(/\/blog\/([^/?#]+)/);
  if (bm) {
    const zhPrefix = path.indexOf('/zh/blog/') === 0 ? 'zh/' : '';
    return zhPrefix + bm[1];
  }
  return null;
}

// 格式化数字（1234 → 1.2K）
function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

// ── 文章页面：计数 + 显示 ──
async function trackAndShowPageview() {
  const slug = getSlugFromPath();
  if (!slug) return;

  try {
    // POST：阅读量 +1
    await fetch(PAGEVIEW_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    });
  } catch (e) { /* 静默失败，不影响用户体验 */ }

  // GET：获取最新阅读量（含本次+1）
  try {
    const res = await fetch(`${PAGEVIEW_API}?slugs=${encodeURIComponent(slug)}`);
    const data = await res.json();
    const count = data[slug] || 0;
    showPageviewInArticle(slug, count);
  } catch (e) { /* 静默失败 */ }
}

function showPageviewInArticle(slug, count) {
  // 在 .blog-meta 行内显示阅读量（author · date · reads）
  let el = document.getElementById('pageview-count');
  if (!el) {
    // 没有占位符则插入到 .blog-meta 末尾
    const meta = document.querySelector('.blog-meta');
    if (!meta) return;
    el = document.createElement('span');
    el.id = 'pageview-count';
    el.className = 'blog-meta-views';
    meta.appendChild(el);
  }
  el.innerHTML = ` · ${formatCount(count)} views`;
  el.style.cssText = 'font-size:0.85rem;';
}

// ── 文章列表页：批量查询并显示 ──
async function loadPageviewsForListing() {
  // 找到所有文章卡片中的 slug（从链接提取）
  const cards = document.querySelectorAll('a[href*="/blog/"]');
  const slugSet = new Set();
  cards.forEach(a => {
    const m = a.getAttribute('href').match(/\/blog\/([^/?#]+)/);
    if (m) slugSet.add(m[1]);
  });

  const slugs = [...slugSet];
  if (slugs.length === 0) return;

  try {
    const res = await fetch(`${PAGEVIEW_API}?slugs=${encodeURIComponent(slugs.join(','))}`);
    const data = await res.json();
    displayPageviewsInListing(data);
  } catch (e) { /* 静默失败 */ }
}

function displayPageviewsInListing(data) {
  // 在每个文章卡片标题后插入阅读量
  const cards = document.querySelectorAll('a[href*="/blog/"]');
  cards.forEach(a => {
    const m = a.getAttribute('href').match(/\/blog\/([^/?#]+)/);
    if (!m) return;
    const slug = m[1];
    const count = data[slug] || 0;

    // 找到标题元素（通常在 a 内或父级内）
    let container = a.closest('article, .blog-card, .post-card');
    if (!container) container = a.parentElement;
    if (!container) return;

    let el = container.querySelector('.pageview-badge');
    if (!el) {
      el = document.createElement('span');
      el.className = 'pageview-badge';
      el.style.cssText = 'font-size:11px;margin-left:6px;';
      const metaEl = container.querySelector('.article-card-meta, .blog-card-body .read-time-label');
      if (metaEl) {
        metaEl.parentElement.insertBefore(el, metaEl.nextSibling);
      } else {
        const titleEl = container.querySelector('h2, h3');
        if (titleEl) titleEl.insertAdjacentElement('afterend', el);
      }
    }
    if (el) el.innerHTML = `${formatCount(count)} views`;
  });
}

// ── 自动执行 ──
function runPageview() {
  const slug = getSlugFromPath();
  if (slug) {
    // 文章页面
    trackAndShowPageview();
  } else {
    // 列表页
    loadPageviewsForListing();
  }
}

document.addEventListener('DOMContentLoaded', runPageview);

// 后退缓存(bfcache)恢复时重新加载
window.addEventListener('pageshow', function(e) {
  if (e.persisted) runPageview();
});

// 语言切换时重新获取浏览量（英文和繁中 slug 不同）
document.addEventListener('daoessence:i18n-changed', runPageview);
