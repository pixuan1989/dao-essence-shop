/**
 * Almanac Wallpaper Recommendation Module
 * Recommends wallpapers matching the user's selected scenario after auspicious date results.
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

  function getLang() {
    if (window.DaoI18n && typeof window.DaoI18n.current === 'function') {
      return window.DaoI18n.current();
    }
    return window.location.pathname.indexOf('/zh/') === 0 ? 'zh' : 'en';
  }

  function extractScenario() {
    const titleEl = document.getElementById('resultTitle');
    if (!titleEl) return null;
    const text = (titleEl.textContent || '').toLowerCase();
    const keywords = [
      { key: 'marry', words: ['married', 'getting married', '\u7ed3\u5a5a', 'wedding'] },
      { key: 'engagement', words: ['engaged', 'getting engaged', '\u8ba2\u5a5a'] },
      { key: 'business', words: ['business', 'starting business', '\u5f00\u4e1a', '\u521b\u4e1a'] },
      { key: 'contract', words: ['contract', 'signing contract', '\u7b7e\u7ea6', '\u5408\u540c'] },
      { key: 'moving', words: ['moving', 'moving home', '\u642c\u5bb6', '\u642c\u8fc1'] },
      { key: 'housewarm', words: ['housewarming', '\u5165\u5b85', '\u4e54\u8fc1'] },
      { key: 'travel', words: ['travel', 'vacation', '\u51fa\u884c', '\u65c5\u6e38'] },
      { key: 'purchase', words: ['purchase', 'buying', '\u8d2d\u4e70', '\u8d2d\u7269'] },
      { key: 'medical', words: ['medical', 'procedure', '\u533b\u7597', '\u624b\u672f'] },
      { key: 'interview', words: ['interview', 'job interview', '\u9762\u8bd5'] },
      { key: 'pet_vet', words: ['pet', 'vet', '\u5ba0\u7269', '\u770b\u517d\u533b'] },
      { key: 'date', words: ['date', 'going on a date', '\u7ea6\u4f1a', '\u76f8\u4eb2'] }
    ];
    for (const kw of keywords) {
      if (kw.words.some(w => text.includes(w))) return kw.key;
    }
    return null;
  }

  function buildTitle(scenario, lang) {
    const isZh = lang === 'zh';
    const scenarioNames = {
      marry: { zh: '\u7ed3\u5a5a', en: 'Marriage' }, engagement: { zh: '\u8ba2\u5a5a', en: 'Engagement' },
      business: { zh: '\u5f00\u4e1a', en: 'Business' }, contract: { zh: '\u7b7e\u7ea6', en: 'Contract' },
      moving: { zh: '\u642c\u5bb6', en: 'Moving' }, housewarm: { zh: '\u4e54\u8fc1', en: 'Housewarming' },
      travel: { zh: '\u51fa\u884c', en: 'Travel' }, purchase: { zh: '\u8d2d\u7269', en: 'Purchase' },
      medical: { zh: '\u533b\u7597', en: 'Medical' }, interview: { zh: '\u9762\u8bd5', en: 'Interview' },
      pet_vet: { zh: '\u5ba0\u7269', en: 'Pet' }, date: { zh: '\u7ea6\u4f1a', en: 'Date' }
    };
    const name = scenarioNames[scenario] || { zh: '\u62e9\u65e5', en: 'Auspicious Day' };
    return isZh
      ? '\u9009\u4e2a\u597d\u65e5\u5b50' + name.zh + '\uff0c\u7528' + name.zh + '\u4e3b\u9898\u58c1\u7eb8\u52a0\u6301\u597d\u8fd0'
      : 'Picked an auspicious day for ' + name.en + '? Carry the energy home with these wallpapers';
  }

  function getMoreBtnText(lang) {
    return lang === 'zh' ? '\u67e5\u770b\u66f4\u591a\u7384\u5b66\u58c1\u7eb8 \u2192' : 'Browse All Wallpapers \u2192';
  }

  function renderRecommendations(container, wallpapers, scenario, title) {
    const existing = container.querySelector('.alm-wallpaper-rec-box');
    if (existing) existing.remove();

    if (!wallpapers || wallpapers.length === 0) return;

    if (!document.getElementById('alm-wp-rec-style')) {
      const style = document.createElement('style');
      style.id = 'alm-wp-rec-style';
      style.textContent = '.alm-wallpaper-rec-box{margin-top:28px;padding:24px 16px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:16px;text-align:center}.rec-title{font-size:16px;color:#D4AF37;margin:0 0 18px;font-weight:600}.rec-grid{display:flex;justify-content:center;gap:14px;margin-bottom:18px;flex-wrap:wrap}.rec-card{width:100px;border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);transition:transform 0.2s}.rec-card:hover{transform:translateY(-4px);border-color:#D4AF37;box-shadow:0 4px 12px rgba(0,0,0,0.3)}.rec-card img{width:100%;height:auto;display:block}.rec-btn{display:inline-block;padding:10px 24px;background:rgba(212,175,55,0.15);color:#D4AF37;border:1px solid rgba(212,175,55,0.3);border-radius:8px;text-decoration:none;font-size:14px;font-weight:600}.rec-btn:hover{background:rgba(212,175,55,0.25);color:#fff}';
      document.head.appendChild(style);
    }

    const recBox = document.createElement('div');
    recBox.className = 'alm-wallpaper-rec-box';
    recBox.innerHTML = '<h3 class="rec-title">' + title + '</h3><div class="rec-grid">' +
      wallpapers.map(wp => '<a href="/wallpaper/' + (wp.slug || wp.id) + '" class="rec-card"><img src="' + wp.thumb + '" alt="' + wp.title + '" loading="lazy" onerror="this.onerror=null;this.src=this.src.split(\'?\')[0]+\'?t=\'+Date.now()"/></a>').join('') +
      '</div><a href="/wallpaper" class="rec-btn">' + getMoreBtnText(getLang()) + '</a>';
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
