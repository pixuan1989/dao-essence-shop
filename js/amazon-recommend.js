/**
 * Amazon affiliate personalization (client-side).
 * Re-ranks the "Recommended for You" grids using the reader's saved
 * Five-Element favorable profile (localStorage 'almanac_fav').
 * Falls back to category relevance when no profile is stored.
 */
(function () {
  'use strict';

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // 语言检测：优先使用站点统一的 DaoI18n（/zh 路径、?lang=、localStorage、浏览器语言），
  // 兜底回退到 <html lang> 属性，再兜底 window.DAO_LANG。与 shop.html 保持一致。
  function detectZh() {
    if (window.DaoI18n && typeof window.DaoI18n.current === 'function') {
      var cur = window.DaoI18n.current();
      if (cur === 'zh' || cur === 'zh-Hant') return true;
      if (cur === 'en') return false;
    }
    if ((document.documentElement.lang || '').toLowerCase().indexOf('zh') !== -1) return true;
    return window.DAO_LANG === 'zh';
  }

  function buildAmazonUrl(p, tag) {
    tag = tag || 'daoessence25-20';
    if (p.asin) return 'https://www.amazon.com/dp/' + p.asin + '?tag=' + tag;
    var q = encodeURIComponent(p.keywords || p.name);
    return 'https://www.amazon.com/s?k=' + q + '&tag=' + tag;
  }

  function imageHtml(p) {
    var el = (p.elements && p.elements[0]) || 'earth';
    if (p.image) {
      var svg = (window.AmazonIcons ? window.AmazonIcons.amazonIconSVG(p.icon, el) : '');
      return '<div class="amazon-img-wrap">' +
        '<img src="' + escapeHtml(p.image) + '" alt="' + escapeHtml(p.name) + '" loading="lazy" ' +
        'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
        '<div class="amazon-icon-fallback" style="display:none">' + svg + '</div>' +
        '</div>';
    }
    var fallback = window.AmazonIcons ? window.AmazonIcons.amazonIconSVG(p.icon, el) : '';
    return '<div class="amazon-img-wrap">' + fallback + '</div>';
  }

  function renderCard(p, context, tag) {
    if (!p) return '';
    var isZh = detectZh();
    var displayName = (isZh && p.nameZh) ? p.nameZh : p.name;
    var url = buildAmazonUrl(p, tag);
    var btn = isZh ? '在 Amazon 查看' : 'View on Amazon';
    var badge = context === 'inline'
      ? (isZh ? '開運好物' : 'Lucky Pick')
      : (isZh ? '好物推薦' : 'Recommended');
    var dataAttrs = ' data-id="' + escapeHtml(p.id) + '"' +
      ' data-elements="' + (p.elements || []).map(escapeHtml).join(' ') + '"' +
      ' data-categories="' + (p.categories || []).map(escapeHtml).join(' ') + '"';
    return '<div class="amazon-product-card' + (context === 'inline' ? ' amazon-product-card--inline' : '') + '"' + dataAttrs + '>' +
      '<span class="amazon-badge">' + badge + '</span>' +
      imageHtml(p) +
      '<h4>' + escapeHtml(displayName) + '</h4>' +
      '<div class="amazon-rating"><span class="stars">★★★★★</span>' +
      '<span class="rating-text">' + escapeHtml(p.rating) + ' (' + escapeHtml(p.reviews) + ')</span></div>' +
      '<div class="amazon-price">' + escapeHtml(p.price) + '</div>' +
      '<a href="' + url + '" target="_blank" rel="nofollow sponsored noopener" class="amazon-btn">' + btn + '</a>' +
      '</div>';
  }

  function getFavElements() {
    try {
      var raw = localStorage.getItem('almanac_fav');
      if (!raw) return [];
      raw = String(raw).trim();
      if (!raw) return [];
      // Accept either a JSON array (["Wood","Fire"]) or a plain string
      // ("Wood" / "Wood, Fire" / "Wood Fire") — the almanac stores a plain string.
      try {
        var arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length) {
          return arr.map(function (e) { return String(e).toLowerCase(); }).filter(Boolean);
        }
      } catch (e) { /* fall through to plain-string handling */ }
      return raw.split(/[,;/|\s]+/).map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
    } catch (e) {}
    return [];
  }

  function scoreProduct(p, category, favs) {
    var score = 0;
    if (p.categories && category && p.categories.indexOf(category) !== -1) score += 10;
    if (favs.length && p.elements) {
      p.elements.forEach(function (el) {
        if (favs.indexOf(String(el).toLowerCase()) !== -1) score += 6;
      });
    }
    return score;
  }

  // Score an existing DOM card by its data-* attributes (no lib lookup needed).
  function scoreCard(el, category, favs) {
    var score = 0;
    var cats = (el.getAttribute('data-categories') || '').toLowerCase().split(/\s+/).filter(Boolean);
    var els = (el.getAttribute('data-elements') || '').toLowerCase().split(/\s+/).filter(Boolean);
    if (category && cats.indexOf(category) !== -1) score += 10;
    if (favs.length) {
      els.forEach(function (e) { if (favs.indexOf(e) !== -1) score += 6; });
    }
    return score;
  }

  function personalize() {
    var lib = window.AMAZON_PRODUCT_LIBRARY;
    var tag = window.AMAZON_ASSOCIATE_TAG;
    var favs = getFavElements();
    var isZh = detectZh();

    // Re-rank each "Recommended for You" grid by reordering the CURATED cards
    // already rendered by the build step (do NOT replace them with the full library).
    var sections = document.querySelectorAll('.amazon-products-bottom');
    sections.forEach(function (section) {
      var grid = section.querySelector('.amazon-products-grid');
      if (!grid) return;
      var category = section.getAttribute('data-article-category') || '';

      var cards = Array.prototype.slice.call(grid.querySelectorAll('.amazon-product-card'));
      if (!cards.length && lib && lib.length) {
        // Fallback: nothing pre-rendered — render up to 6 from the library.
        var picks = lib.slice(0, 6);
        grid.innerHTML = picks.map(function (p) { return renderCard(p, 'grid', tag); }).join('');
        cards = Array.prototype.slice.call(grid.querySelectorAll('.amazon-product-card'));
      }
      if (cards.length) {
        cards.sort(function (a, b) {
          return scoreCard(b, category, favs) - scoreCard(a, category, favs);
        });
        cards.forEach(function (c) { grid.appendChild(c); });
      }

      if (favs.length) {
        var title = section.querySelector('.amazon-section-title');
        if (title) title.textContent = isZh ? '為你精選（依五行喜用）' : 'Picked for Your Element';
      }
    });

    // Expose helper for the /shop page
    window.AmazonRecommend = {
      renderCard: renderCard,
      scoreProduct: scoreProduct,
      scoreCard: scoreCard,
      getFavElements: getFavElements,
      buildAmazonUrl: buildAmazonUrl
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', personalize);
  } else {
    personalize();
  }
})();
