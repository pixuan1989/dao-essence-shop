/**
 * Almanac Wallpaper Recommendation Module (Task P4)
 * Function: Recommends wallpapers matching the user's selected scenario after auspicious date results.
 * Strategy: Append-Only, uses MutationObserver on #selectResult, supports i18n language switching.
 * Style: Dark semi-transparent glass cards, consistent with existing modules.
 */
(function() {
  'use strict';

  const CONFIG = {
    scenarioToCategory: {
      marry: 'Feng Shui', engagement: 'Feng Shui',
      business: 'Energy', contract: 'Energy',
      moving: 'Nature', housewarm: 'Feng Shui',
      travel: 'Energy', purchase: 'Five Elements',
      medical: 'Five Elements', interview: 'Energy',
      pet_vet: 'Nature', date: 'Feng Shui'
    },
    targetId: 'selectResult',
    limit: 3
  };

  let storedWallpapers = [];
  let storedScenario = null;

  // Get current language from DaoI18n or URL
  function getLang() {
    if (window.DaoI18n && typeof window.DaoI18n.current === 'function') {
      return window.DaoI18n.current();
    }
    return window.location.pathname.indexOf('/zh/') === 0 ? 'zh' : 'en';
  }

  // Extract scenario from result title text
  function extractScenario() {
    const titleEl = document.getElementById('resultTitle');
    if (!titleEl) return null;
    const text = (titleEl.textContent || '').toLowerCase();
    const keywords = [
      { key: 'marry', words: ['married', 'getting married', '缁撳', 'wedding'] },
      { key: 'engagement', words: ['engaged', 'getting engaged', '璁㈠'] },
      { key: 'business', words: ['business', 'starting business', '寮€涓?, '鍒涗笟'] },
      { key: 'contract', words: ['contract', 'signing contract', '绛剧害', '鍚堝悓'] },
      { key: 'moving', words: ['moving', 'moving home', '鎼', '鎼縼'] },
      { key: 'housewarm', words: ['housewarming', '鍏ュ畢', '涔旇縼'] },
      { key: 'travel', words: ['travel', 'vacation', '鍑鸿', '鏃呮父'] },
      { key: 'purchase', words: ['purchase', 'buying', '璐拱', '璐墿'] },
      { key: 'medical', words: ['medical', 'procedure', '鍖荤枟', '鎵嬫湳'] },
      { key: 'interview', words: ['interview', 'job interview', '闈㈣瘯'] },
      { key: 'pet_vet', words: ['pet', 'vet', '瀹犵墿', '鐪嬪吔鍖?] },
      { key: 'date', words: ['date', 'going on a date', '绾︿細', '鐩镐翰'] }
    ];
    for (const kw of keywords) {
      if (kw.words.some(w => text.includes(w))) return kw.key;
    }
    return null;
  }

  function buildTitle(scenario, lang) {
    const isZh = lang === 'zh';
    const scenarioNames = {
      marry: { zh: '缁撳', en: 'Marriage' }, engagement: { zh: '璁㈠', en: 'Engagement' },
      business: { zh: '寮€涓?, en: 'Business' }, contract: { zh: '绛剧害', en: 'Contract' },
      moving: { zh: '鎼', en: 'Moving' }, housewarm: { zh: '涔旇縼', en: 'Housewarming' },
      travel: { zh: '鍑鸿', en: 'Travel' }, purchase: { zh: '璐墿', en: 'Purchase' },
      medical: { zh: '鍖荤枟', en: 'Medical' }, interview: { zh: '闈㈣瘯', en: 'Interview' },
      pet_vet: { zh: '瀹犵墿', en: 'Pet' }, date: { zh: '绾︿細', en: 'Date' }
    };
    const name = scenarioNames[scenario] || { zh: '鎷╂棩', en: 'Auspicious Day' };
    return isZh
      ? `閫変釜濂芥棩瀛?{name.zh}锛岀敤${name.zh}涓婚澹佺焊鍔犳寔濂借繍`
      : `Picked an auspicious day for ${name.en}? Carry the energy home with these wallpapers`;
  }

  function getMoreBtnText(lang) {
    return lang === 'zh' ? '鏌ョ湅鏇村鐜勫澹佺焊 鈫? : 'Browse All Wallpapers 鈫?;
  }

  function renderRecommendations(container, wallpapers, scenario, title) {
    const existing = container.querySelector('.alm-wallpaper-rec-box');
    if (existing) existing.remove();

    if (!wallpapers || wallpapers.length === 0) return;

    if (!document.getElementById('alm-wp-rec-style')) {
      const style = document.createElement('style');
      style.id = 'alm-wp-rec-style';
      style.textContent = `
        .alm-wallpaper-rec-box {
          margin-top: 28px; padding: 24px 16px; background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; text-align: center;
        }
        .rec-title { font-size: 16px; color: #D4AF37; margin: 0 0 18px; font-weight: 600; }
        .rec-grid { display: flex; justify-content: center; gap: 14px; margin-bottom: 18px; flex-wrap: wrap; }
        .rec-card { width: 100px; border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); transition: transform 0.2s; }
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

    const recBox = document.createElement('div');
    recBox.className = 'alm-wallpaper-rec-box';
    recBox.innerHTML = `
      <h3 class="rec-title">${title}</h3>
      <div class="rec-grid">
        ${wallpapers.map(wp => `<a href="/wallpaper/${wp.slug || wp.id}" class="rec-card"><img src="${wp.thumb}" alt="${wp.title}" loading="lazy"/></a>`).join('')}
      </div>
      <a href="/wallpaper" class="rec-btn">${getMoreBtnText(getLang())}</a>
    `;
    container.appendChild(recBox);
  }

  async function init() {
    const target = document.getElementById(CONFIG.targetId);
    if (!target) return;

    try {
      const res = await fetch('/wallpapers-lite.json');
      if (res.ok) storedWallpapers = await res.json();
    } catch (e) {}
    if (storedWallpapers.length === 0) return;

    // Re-render on language switch
    function reRender() {
      if (!storedScenario) return;
      const lang = getLang();
      const title = buildTitle(storedScenario, lang);
      let matched = [];
      if (CONFIG.scenarioToCategory[storedScenario]) {
        matched = storedWallpapers.filter(wp => wp.category === CONFIG.scenarioToCategory[storedScenario]);
      }
      if (matched.length === 0) matched = storedWallpapers.sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);
      else matched = matched.sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);
      renderRecommendations(target, matched, storedScenario, title);
    }

    document.addEventListener('daoessence:i18n-changed', reRender);

    const observer = new MutationObserver((mutations, obs) => {
      if (!target.classList.contains('visible')) return;
      const listEl = document.getElementById('resultList');
      if (!listEl || listEl.children.length === 0) return;

      const scenario = extractScenario();
      storedScenario = scenario;
      let matched = [];
      if (scenario && CONFIG.scenarioToCategory[scenario]) {
        matched = storedWallpapers.filter(wp => wp.category === CONFIG.scenarioToCategory[scenario]);
      }
      if (matched.length === 0) matched = storedWallpapers.sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);
      else matched = matched.sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);

      if (matched.length > 0) {
        const title = buildTitle(scenario || 'marry', getLang());
        renderRecommendations(target, matched, scenario, title);
        obs.disconnect();
      }
    });

    observer.observe(target, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
