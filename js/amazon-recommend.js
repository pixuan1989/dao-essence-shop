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

  function buildAmazonUrl(p, tag) {
    tag = tag || 'daoessentia-20';
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
    var isZh = (document.documentElement.lang || '').toLowerCase().indexOf('zh') !== -1 ||
      (window.DAO_LANG === 'zh');
    var displayName = (isZh && p.nameZh) ? p.nameZh : p.name;
    var url = buildAmazonUrl(p, tag);
    var btn = isZh ? '在 Amazon 查看' : 'View on Amazon';
    var badge = context === 'inline'
      ? (isZh ? '開運好物' : 'Lucky Pick')
      : (isZh ? '好物推薦' : 'Recommended');
    return '<div class="amazon-product-card' + (context === 'inline' ? ' amazon-product-card--inline' : '') + '">' +
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
      if (raw) {
        var arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length) {
          return arr.map(function (e) { return String(e).toLowerCase(); });
        }
      }
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

  function personalize() {
    var lib = window.AMAZON_PRODUCT_LIBRARY;
    var tag = window.AMAZON_ASSOCIATE_TAG;
    if (!lib || !lib.length) return;
    var favs = getFavElements();
    var isZh = (document.documentElement.lang || '').toLowerCase().indexOf('zh') !== -1 ||
      (window.DAO_LANG === 'zh');

    // Re-rank each bottom grid
    var sections = document.querySelectorAll('.amazon-products-bottom');
    sections.forEach(function (section) {
      var grid = section.querySelector('.amazon-products-grid');
      if (!grid) return;
      var category = section.getAttribute('data-article-category') || '';
      var ranked = lib.slice().sort(function (a, b) {
        return scoreProduct(b, category, favs) - scoreProduct(a, category, favs);
      });
      grid.innerHTML = ranked.map(function (p) { return renderCard(p, 'grid', tag); }).join('');
      if (favs.length) {
        var title = section.querySelector('.amazon-section-title');
        if (title) title.textContent = isZh ? '為你精選（依五行喜用）' : 'Picked for Your Element';
      }
    });

    // Expose helper for the /shop page
    window.AmazonRecommend = {
      renderCard: renderCard,
      scoreProduct: scoreProduct,
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
