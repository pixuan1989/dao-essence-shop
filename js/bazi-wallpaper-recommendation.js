/**
 * BaZi Wallpaper Recommendation Module (Task P1)
 * Function: In BaZi result page, recommends wallpapers matching the favorable element.
 * Strategy: Append-Only, uses MutationObserver on #bazi-result.
 * Safety: Checks for result keywords ('Favorable'/'喜用神') to avoid premature display.
 */
(function() {
  'use strict';

  const CONFIG = {
    elementToCategory: {
      '火': 'Energy', 'fire': 'Energy', 'Fire': 'Energy',
      '水': 'Five Elements', 'water': 'Five Elements', 'Water': 'Five Elements',
      '木': 'Nature', 'wood': 'Nature', 'Wood': 'Nature',
      '金': 'Five Elements', 'metal': 'Five Elements', 'Metal': 'Five Elements',
      '土': 'Feng Shui', 'earth': 'Feng Shui', 'Earth': 'Feng Shui'
    },
    targetId: 'bazi-result',
    limit: 3
  };

  let storedWallpapers = [];
  let storedElements = [];

  // Utility: Get current language from DaoI18n state or URL
  function getLang() {
    if (window.DaoI18n && typeof window.DaoI18n.current === 'function') {
      return window.DaoI18n.current();
    }
    return window.location.pathname.indexOf('/zh/') === 0 ? 'zh' : 'en';
  }

  // Normalize element name
  function normalizeElement(el) {
    const zhToEn = { '火': 'fire', '水': 'water', '木': 'wood', '金': 'metal', '土': 'earth' };
    const lower = (el || '').toLowerCase();
    return zhToEn[el] || zhToEn[lower] || lower;
  }

  function buildTitle(elements, lang) {
    const isZh = lang === 'zh';
    const cn = { fire: '火', water: '水', wood: '木', metal: '金', earth: '土' };
    const en = { fire: 'Fire', water: 'Water', wood: 'Wood', metal: 'Metal', earth: 'Earth' };
    const elNames = elements.map(e => {
      const key = normalizeElement(e);
      return isZh ? (cn[key] || e) : (en[key] || e);
    });
    const elStr = elNames.join(' & ');
    return isZh
      ? `搭配${elStr}元素壁纸，增强您的运势`
      : `Enhance your ${elStr} energy with these wallpapers`;
  }

  function getMoreBtnText(lang) {
    return lang === 'zh' ? '查看更多玄学壁纸 →' : 'Browse All Wallpapers →';
  }

  function renderRecommendations(container, wallpapers, elements, title) {
    const existing = container.querySelector('.bazi-wp-rec-box');
    if (existing) existing.remove();

    if (!wallpapers || wallpapers.length === 0) return;

    if (!document.getElementById('bazi-wp-rec-style')) {
      const style = document.createElement('style');
      style.id = 'bazi-wp-rec-style';
      style.textContent = `
        .bazi-wp-rec-box {
          margin-top: 40px; padding: 32px 20px; background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; text-align: center;
        }
        .rec-title { font-size: 18px; color: #D4AF37; margin: 0 0 24px; font-weight: 600; }
        .rec-grid { display: flex; justify-content: center; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
        .rec-card { width: 110px; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); transition: transform 0.2s; }
        .rec-card:hover { transform: translateY(-4px); border-color: #D4AF37; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .rec-card img { width: 100%; height: auto; display: block; }
        .rec-btn {
          display: inline-block; padding: 10px 24px; background: rgba(212,175,55,0.15); color: #D4AF37;
          border: 1px solid rgba(212,175,55,0.3); border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;
        }
        .rec-btn:hover { background: rgba(212,175,55,0.25); color: #fff; }
      `;
      document.head.appendChild(style);
    }

    const lang = getLang();
    const recBox = document.createElement('div');
    recBox.className = 'bazi-wp-rec-box';
    recBox.innerHTML = `
      <h3 class="rec-title">${title || buildTitle(elements, lang)}</h3>
      <div class="rec-grid">
        ${wallpapers.map(wp => `<a href="/wallpaper/${wp.slug || wp.id}" class="rec-card"><img src="${wp.thumb}" alt="${wp.title}" loading="lazy"/></a>`).join('')}
      </div>
      <a href="/wallpaper" class="rec-btn">${getMoreBtnText(lang)}</a>
    `;
    container.appendChild(recBox);
  }

  async function init() {
    const target = document.getElementById(CONFIG.targetId);
    if (!target) return;

    try {
      const res = await fetch('/wallpapers.json');
      if (res.ok) storedWallpapers = await res.json();
    } catch (e) {}
    if (storedWallpapers.length === 0) return;

    // Extract elements from result
    function extractElements() {
      const text = target.innerText || '';
      const elements = ['火', '水', '木', '金', '土', 'fire', 'water', 'wood', 'metal', 'earth', 'Fire', 'Water', 'Wood', 'Metal', 'Earth'];
      const found = [];
      for (const el of elements) {
        if (text.includes(el) && !found.some(f => f.toLowerCase() === el.toLowerCase())) {
          found.push(el);
        }
      }
      return found.slice(0, 2);
    }

    // Re-render on language switch
    function reRender() {
      if (storedElements.length === 0) return;
      const title = buildTitle(storedElements, getLang());
      const categories = new Set();
      for (const el of storedElements) {
        const cat = CONFIG.elementToCategory[el];
        if (cat) categories.add(cat);
      }
      let matched = [];
      if (categories.size > 0) {
        for (const cat of categories) matched = matched.concat(storedWallpapers.filter(wp => wp.category === cat));
        const seen = new Set();
        matched = matched.filter(wp => { if (seen.has(wp.id)) return false; seen.add(wp.id); return true; });
      }
      if (matched.length === 0) matched = storedWallpapers.sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);
      else matched = matched.sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);
      renderRecommendations(target, matched, storedElements, title);
    }

    document.addEventListener('daoessence:i18n-changed', reRender);

    // Observe result rendering
    const observer = new MutationObserver((mutations, obs) => {
      // Check if result is ready by looking for keywords
      const text = target.innerText || '';
      if (!text.includes('Favorable') && !text.includes('喜用神')) return;

      storedElements = extractElements();
      if (storedElements.length === 0) return;

      const categories = new Set();
      for (const el of storedElements) {
        const cat = CONFIG.elementToCategory[el];
        if (cat) categories.add(cat);
      }
      let matched = [];
      if (categories.size > 0) {
        for (const cat of categories) matched = matched.concat(storedWallpapers.filter(wp => wp.category === cat));
        const seen = new Set();
        matched = matched.filter(wp => { if (seen.has(wp.id)) return false; seen.add(wp.id); return true; });
      }
      if (matched.length === 0) matched = storedWallpapers.sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);
      else matched = matched.sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);

      if (matched.length > 0) {
        renderRecommendations(target, matched, storedElements, buildTitle(storedElements, getLang()));
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
