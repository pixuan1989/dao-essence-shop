/**
 * Five Elements Test Wallpaper Recommendation Module
 * Recommends wallpapers matching the user's dominant element after test results.
 */
(function() {
  'use strict';

  const CONFIG = {
    elementToCategory: {
      wood: 'Nature',
      fire: 'Energy',
      earth: 'Feng Shui',
      metal: 'Five Elements',
      water: 'Five Elements'
    },
    containerId: 'fet-wp-rec-container',
    limit: 3
  };

  let storedWallpapers = [];
  let storedElement = null;

  function getLang() {
    if (window.DaoI18n && typeof window.DaoI18n.current === 'function') {
      return window.DaoI18n.current();
    }
    return window.location.pathname.indexOf('/zh/') === 0 ? 'zh' : 'en';
  }

  function buildTitle(element, lang) {
    const isZh = lang === 'zh';
    const names = {
      wood: { zh: '\u6728', en: 'Wood' },
      fire: { zh: '\u706b', en: 'Fire' },
      earth: { zh: '\u571f', en: 'Earth' },
      metal: { zh: '\u91d1', en: 'Metal' },
      water: { zh: '\u6c34', en: 'Water' }
    };
    const name = names[element] || { zh: '\u4e94\u884c', en: 'Five Elements' };
    return isZh
      ? '\u642d\u914d' + name.zh + '\u5143\u7d20\u58c1\u7eb8\uff0c\u589e\u5f3a\u60a8\u7684\u8fd0\u52bf'
      : 'Enhance your ' + name.en + ' energy with these wallpapers';
  }

  function getMoreBtnText(lang) {
    return lang === 'zh' ? '\u67e5\u770b\u66f4\u591a\u7384\u5b66\u58c1\u7eb8 \u2192' : 'Browse All Wallpapers \u2192';
  }

  function renderRecommendations(container, wallpapers, element, title) {
    const existing = container.querySelector('.fet-wallpaper-rec-box');
    if (existing) existing.remove();

    if (!wallpapers || wallpapers.length === 0) return;

    if (!document.getElementById('fet-wp-rec-style')) {
      const style = document.createElement('style');
      style.id = 'fet-wp-rec-style';
      style.textContent = '.fet-wallpaper-rec-box{margin-top:32px;padding:28px 20px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:16px;text-align:center}.fet-rec-title{font-size:18px;color:#D4AF37;margin:0 0 24px;font-weight:600}.fet-rec-grid{display:flex;justify-content:center;gap:16px;margin-bottom:24px;flex-wrap:wrap}.fet-rec-card{width:110px;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);transition:transform 0.2s;display:block;background:#111}.fet-rec-card:hover{transform:translateY(-4px);border-color:#D4AF37}.fet-rec-card img{width:100%;height:auto;display:block}.fet-rec-btn{display:inline-block;padding:10px 24px;background:rgba(212,175,55,0.15);color:#D4AF37;border:1px solid rgba(212,175,55,0.3);border-radius:8px;text-decoration:none;font-size:14px;font-weight:600}.fet-rec-btn:hover{background:rgba(212,175,55,0.25);color:#fff}@media(max-width:600px){.fet-wallpaper-rec-box{padding:24px 16px}.fet-rec-grid{gap:12px}.fet-rec-card{width:90px}}';
      document.head.appendChild(style);
    }

    const lang = getLang();
    const moreBtn = getMoreBtnText(lang);
    const recTitle = title || buildTitle(element, lang);

    const recBox = document.createElement('div');
    recBox.className = 'fet-wallpaper-rec-box';
    recBox.innerHTML = '<h3 class="fet-rec-title">' + recTitle + '</h3><div class="fet-rec-grid">' +
      wallpapers.map(wp => '<a href="/wallpaper/' + (wp.slug || wp.id) + '" class="fet-rec-card"><img src="' + (wp.thumb || '') + '" alt="' + (wp.title || '') + '" loading="lazy"/></a>').join('') +
      '</div><a href="/wallpaper" class="fet-rec-btn">' + moreBtn + '</a>';
    container.appendChild(recBox);
  }

  function extractDominantElement() {
    const badge = document.getElementById('dominantBadge');
    if (!badge) return null;
    const text = (badge.textContent || '').toLowerCase();
    const elements = ['wood', 'fire', 'earth', 'metal', 'water', '\u6728', '\u706b', '\u571f', '\u91d1', '\u6c34'];
    for (const el of elements) {
      if (text.includes(el.toLowerCase())) return el;
    }
    return null;
  }

  async function init() {
    try {
      const res = await fetch('/wallpapers-lite.json');
      if (res.ok) storedWallpapers = await res.json();
    } catch (e) {
      console.warn('[FET WP Rec] Failed to load wallpapers:', e);
    }
    if (storedWallpapers.length === 0) return;

    const container = document.getElementById(CONFIG.containerId);
    if (!container) return;

    function reRender() {
      if (!storedElement) return;
      const lang = getLang();
      const title = buildTitle(storedElement, lang);
      const category = CONFIG.elementToCategory[storedElement];
      let matched = category ? storedWallpapers.filter(wp => wp.category === category) : [];
      if (matched.length === 0) matched = storedWallpapers.sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);
      else matched = matched.sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);
      if (matched.length > 0) renderRecommendations(container, matched, storedElement, title);
    }

    document.addEventListener('daoessence:i18n-changed', reRender);

    const observer = new MutationObserver((mutations, obs) => {
      const step3 = document.getElementById('step3');
      if (!step3 || !step3.classList.contains('active')) return;

      storedElement = extractDominantElement();
      if (!storedElement) return;

      const category = CONFIG.elementToCategory[storedElement];
      let matched = category ? storedWallpapers.filter(wp => wp.category === category) : [];
      if (matched.length === 0) matched = storedWallpapers.sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);
      else matched = matched.sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);

      if (matched.length > 0) {
        const title = buildTitle(storedElement, getLang());
        renderRecommendations(container, matched, storedElement, title);
        obs.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
