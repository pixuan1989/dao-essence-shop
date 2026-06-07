/**
 * pageview.js - 阅读量显示
 * 中英文共享同一个计数，不分语言统计
 */

const PAGEVIEW_API = '/api/pageview';

// 从 URL 路径提取 slug（统一去掉 /zh 前缀，中英文共享计数）
function getSlugFromPath() {
  const path = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
  const stripped = path.replace(/^\/zh/, '');
  // /learn-bazi/ 路径
  const lbm = stripped.match(/^(\/learn-bazi\/[^/?#]+)/);
  if (lbm) return lbm[1].replace(/^\//, '');
  // /blog/ 路径
  const bm = stripped.match(/\/blog\/([^/?#]+)/);
  if (bm) return bm[1];
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
    await fetch(PAGEVIEW_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    });
  } catch (e) {}

  try {
    const res = await fetch(`${PAGEVIEW_API}?slugs=${encodeURIComponent(slug)}`);
    const data = await res.json();
    const count = data[slug] || 0;
    showPageviewInArticle(count);
  } catch (e) {}
}

function showPageviewInArticle(count) {
  let el = document.getElementById('pageview-count');
  if (!el) {
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
  } catch (e) {}
}

function displayPageviewsInListing(data) {
  const cards = document.querySelectorAll('a[href*="/blog/"]');
  cards.forEach(a => {
    const m = a.getAttribute('href').match(/\/blog\/([^/?#]+)/);
    if (!m) return;
    const slug = m[1];
    const count = data[slug] || 0;

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
    trackAndShowPageview();
  } else {
    loadPageviewsForListing();
  }
}

document.addEventListener('DOMContentLoaded', runPageview);
window.addEventListener('pageshow', function(e) {
  if (e.persisted) runPageview();
});
document.addEventListener('daoessence:i18n-changed', function() { setTimeout(runPageview, 500); });
