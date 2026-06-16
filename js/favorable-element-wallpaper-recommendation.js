/**
 * Favorable Element Wallpaper Recommendation Module
 * Recommends wallpapers matching the user's favorable element(s).
 */
(function() {
  'use strict';

  const CONFIG = {
    elementToCategory: {
      '\u706b': 'Energy', 'fire': 'Energy', 'Fire': 'Energy',
      '\u6c34': 'Five Elements', 'water': 'Five Elements', 'Water': 'Five Elements',
      '\u6728': 'Nature', 'wood': 'Nature', 'Wood': 'Nature',
      '\u91d1': 'Five Elements', 'metal': 'Five Elements', 'Metal': 'Five Elements',
      '\u571f': 'Feng Shui', 'earth': 'Feng Shui', 'Earth': 'Feng Shui'
    },
    targetId: 'feResult',
    limit: 3
  };

  let storedWallpapers = [];
  let storedElements = [];

  function getLang() {
    if (window.DaoI18n && typeof window.DaoI18n.current === 'function') {
      return window.DaoI18n.current();
    }
    return window.location.pathname.indexOf('/zh/') === 0 ? 'zh' : 'en';
  }

  function normalizeElement(el) {
    const zhToEn = { '\u706b': 'fire', '\u6c34': 'water', '\u6728': 'wood', '\u91d1': 'metal', '\u571f': 'earth' };
    const lower = (el || '').toLowerCase();
    return zhToEn[el] || zhToEn[lower] || lower;
  }

  function buildTitle(elements, lang) {
    const isZh = lang === 'zh';
    const cn = { fire: '\u706b', water: '\u6c34', wood: '\u6728', metal: '\u91d1', earth: '\u571f' };
    const en = { fire: 'Fire', water: 'Water', wood: 'Wood', metal: 'Metal', earth: 'Earth' };
    const elNames = elements.map(e => {
      const key = normalizeElement(e);
      return isZh ? (cn[key] || e) : (en[key] || e);
    });
    const elStr = elNames.join(' & ');
    return isZh
      ? '\u642d\u914d' + elStr + '\u5143\u7d20\u58c1\u7eb8\uff0c\u589e\u5f3a\u60a8\u7684\u8fd0\u52bf'
      : 'Enhance your ' + elStr + ' energy with these wallpapers';
  }

  function getMoreBtnText(lang) {
    return lang === 'zh' ? '\u67e5\u770b\u66f4\u591a\u7384\u5b66\u58c1\u7eb8 \u2192' : 'Browse All Wallpapers \u2192';
  }

  function renderRecommendations(container, wallpapers, elements, title) {
    const existing = container.querySelector('.fe-wallpaper-rec-box');
    if (existing) existing.remove();

    if (!wallpapers || wallpapers.length === 0) return;

    if (!document.getElementById('fe-wp-rec-style')) {
      const style = document.createElement('style');
      style.id = 'fe-wp-rec-style';
      style.textContent = '.fe-wallpaper-rec-box{margin-top:40px;padding:32px 20px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:16px;text-align:center}.rec-title{font-size:18px;color:#D4AF37;margin:0 0 24px;font-weight:600}.rec-grid{display:flex;justify-content:center;gap:16px;margin-bottom:24px;flex-wrap:wrap}.rec-card{width:110px;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);transition:transform 0.2s;display:block;background:#111}.rec-card:hover{transform:translateY(-4px);border-color:#D4AF37}.rec-card img{width:100%;height:auto;display:block}.rec-btn{display:inline-block;padding:10px 24px;background:rgba(212,175,55,0.15);color:#D4AF37;border:1px solid rgba(212,175,55,0.3);border-radius:8px;text-decoration:none;font-size:14px;font-weight:600}.rec-btn:hover{background:rgba(212,175,55,0.25);color:#fff}@media(max-width:600px){.fe-wallpaper-rec-box{padding:24px 16px}.rec-grid{gap:12px}.rec-card{width:90px}}';
      document.head.appendChild(style);
    }

    const lang = getLang();
    const moreBtn = getMoreBtnText(lang);
    const recTitle = title || buildTitle(elements, lang);

    const recBox = document.createElement('div');
    recBox.className = 'fe-wallpaper-rec-box';
    recBox.innerHTML = '<h3 class="rec-title">' + recTitle + '</h3><div class="rec-grid">' +
      wallpapers.map(wp => '<a href="/wallpaper/' + (wp.slug || wp.id) + '" class="rec-card"><img src="' + (wp.thumb || '') + '" alt="' + (wp.title || '') + '" loading="lazy"/></a>').join('') +
      '</div><a href="/wallpaper" class="rec-btn">' + moreBtn + '</a>';
    container.appendChild(recBox);
  }

  async function init() {
    const target = document.getElementById(CONFIG.targetId);
    if (!target) return;

    try {
      const res = await fetch('/wallpapers-lite.json');
      if (res.ok) storedWallpapers = await res.json();
    } catch (e) {
      console.warn('[FE WP Rec] Failed to load wallpapers:', e);
    }
    if (storedWallpapers.length === 0) return;

    function extractFavElements() {
      // Read directly from cached API result (accurate)
      if (window._feLastData && window._feLastData.analysis) {
        const favElements = window._feLastData.analysis.favorableElements || [];
        return favElements.slice(0, 2);
      }
      // Fallback: extract from DOM (less accurate)
      const favNameEl = document.getElementById('feFavElementName');
      if (!favNameEl) return [];
      const text = favNameEl.textContent || '';
      const elements = ['\u706b', '\u6c34', '\u6728', '\u91d1', '\u571f', 'fire', 'water', 'wood', 'metal', 'earth', 'Fire', 'Water', 'Wood', 'Metal', 'Earth'];
      const found = [];
      for (const el of elements) {
        const matchText = text.toLowerCase();
        const matchEl = el.toLowerCase();
        if (matchText.includes(matchEl) && !found.some(f => f.toLowerCase() === matchEl)) {
          found.push(el);
        }
      }
      return found.slice(0, 2);
    }

    function reRender() {
      if (storedElements.length === 0) return;
      const lang = getLang();
      const title = buildTitle(storedElements, lang);
      const categories = new Set();
      for (const el of storedElements) {
        const cat = CONFIG.elementToCategory[el];
        if (cat) categories.add(cat);
      }
      let matched = [];
      if (categories.size > 0) {
        for (const cat of categories) {
          matched = matched.concat(storedWallpapers.filter(wp => wp.category === cat));
        }
        const seen = new Set();
        matched = matched.filter(wp => { if (seen.has(wp.id)) return false; seen.add(wp.id); return true; });
      }
      if (matched.length === 0) {
        matched = [...storedWallpapers].sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);
      } else {
        matched = matched.sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);
      }
      if (matched.length > 0) {
        renderRecommendations(target, matched, storedElements, title);
      }
    }

    document.addEventListener('daoessence:i18n-changed', reRender);

    // Expose refresh method for external calls
    window.FeWallpaperRec = {
      refresh: function() {
        storedElements = extractFavElements();
        reRender();
      }
    };

    const observer = new MutationObserver((mutations, obs) => {
      const favNameEl = document.getElementById('feFavElementName');
      if (!favNameEl || favNameEl.textContent.trim().length < 1) return;

      storedElements = extractFavElements();
      if (storedElements.length === 0) return;

      const categories = new Set();
      for (const el of storedElements) {
        const cat = CONFIG.elementToCategory[el];
        if (cat) categories.add(cat);
      }
      let matched = [];
      if (categories.size > 0) {
        for (const cat of categories) {
          matched = matched.concat(storedWallpapers.filter(wp => wp.category === cat));
        }
        const seen = new Set();
        matched = matched.filter(wp => { if (seen.has(wp.id)) return false; seen.add(wp.id); return true; });
      }
      if (matched.length === 0) {
        matched = [...storedWallpapers].sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);
      } else {
        matched = matched.sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);
      }

      if (matched.length > 0) {
        const title = buildTitle(storedElements, getLang());
        renderRecommendations(target, matched, storedElements, title);
        obs.disconnect();
      }
    });

    observer.observe(target, { childList: true, subtree: true, characterData: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
