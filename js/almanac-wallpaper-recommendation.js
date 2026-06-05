/**
 * Almanac Wallpaper Recommendation Module (Task P4)
 * Function: Recommends wallpapers matching the user's selected scenario after auspicious date results.
 * Strategy: Append-Only, uses MutationObserver on #selectResult, supports i18n language switching.
 * Style: Dark semi-transparent glass cards, consistent with existing modules.
 */
(function() {
  'use strict';

  const CONFIG = {
    // Scenario → wallpaper category mapping
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
    // DaoI18n exposes .current() method (not getCurrentLang)
    if (window.DaoI18n && typeof window.DaoI18n.current === 'function') {
      return window.DaoI18n.current();
    }
    // Fallback: URL path
    return window.location.pathname.indexOf('/zh/') === 0 ? 'zh' : 'en';
  }

  // Extract scenario from result title text
  function extractScenario() {
    const titleEl = document.getElementById('resultTitle');
    if (!titleEl) return null;
    const text = (titleEl.textContent || '').toLowerCase();
    const keywords = [
      { key: 'marry', words: ['married', 'getting married', '结婚', 'wedding'] },
      { key: 'engagement', words: ['engaged', 'getting engaged', '订婚'] },
      { key: 'business', words: ['business', 'starting business', '开业', '创业'] },
      { key: 'contract', words: ['contract', 'signing contract', '签约', '合同'] },
      { key: 'moving', words: ['moving', 'moving home', '搬家', '搬迁'] },
      { key: 'housewarm', words: ['housewarming', '入宅', '乔迁'] },
      { key: 'travel', words: ['travel', 'vacation', '出行', '旅游'] },
      { key: 'purchase', words: ['purchase', 'buying', '购买', '购物'] },
      { key: 'medical', words: ['medical', 'procedure', '医疗', '手术'] },
      { key: 'interview', words: ['interview', 'job interview', '面试'] },
      { key: 'pet_vet', words: ['pet', 'vet', '宠物', '看兽医'] },
      { key: 'date', words: ['date', 'going on a date', '约会', '相亲'] }
    ];
    for (const kw of keywords) {
      if (kw.words.some(w => text.includes(w))) return kw.key;
    }
    return null;
  }

  function getLang() {
    return window.location.pathname.indexOf('/zh/') === 0 ? 'zh' : 'en';
  }

  function buildTitle(scenario, lang) {
    const isZh = lang === 'zh';
    const scenarioNames = {
      marry: { zh: '结婚', en: 'Marriage' }, engagement: { zh: '订婚', en: 'Engagement' },
      business: { zh: '开业', en: 'Business' }, contract: { zh: '签约', en: 'Contract' },
      moving: { zh: '搬家', en: 'Moving' }, housewarm: { zh: '乔迁', en: 'Housewarming' },
      travel: { zh: '出行', en: 'Travel' }, purchase: { zh: '购物', en: 'Purchase' },
      medical: { zh: '医疗', en: 'Medical' }, interview: { zh: '面试', en: 'Interview' },
      pet_vet: { zh: '宠物', en: 'Pet' }, date: { zh: '约会', en: 'Date' }
    };
    const name = scenarioNames[scenario] || { zh: '择日', en: 'Auspicious Day' };
    return isZh
      ? `选个好日子${name.zh}，用${name.zh}主题壁纸加持好运`
      : `Picked an auspicious day for ${name.en}? Carry the energy home with these wallpapers`;
  }

  function renderRecommendations(container, wallpapers, title) {
    if (container.querySelector('.alm-wallpaper-rec-box')) return;

    if (!document.getElementById('alm-wp-rec-style')) {
      const style = document.createElement('style');
      style.id = 'alm-wp-rec-style';
      style.textContent = `
        .alm-wallpaper-rec-box {
          margin-top: 28px;
          padding: 24px 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          text-align: center;
          transition: all 0.3s ease;
        }
        .alm-wallpaper-rec-box:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.08);
        }
        .rec-title {
          font-size: 16px;
          color: #D4AF37;
          margin: 0 0 18px;
          font-weight: 600;
          letter-spacing: 1px;
        }
        .rec-grid {
          display: flex;
          justify-content: center;
          gap: 14px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }
        .rec-card {
          width: 100px;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: transform 0.2s, border-color 0.2s;
          display: block;
          background: #111;
        }
        .rec-card:hover {
          transform: translateY(-4px);
          border-color: #D4AF37;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .rec-card img { width: 100%; height: auto; display: block; }
        .rec-btn {
          display: inline-block;
          padding: 10px 24px;
          background: rgba(212, 175, 55, 0.15);
          color: #D4AF37;
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 8px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .rec-btn:hover {
          background: rgba(212, 175, 55, 0.25);
          color: #fff;
          border-color: #D4AF37;
        }
        @media (max-width: 600px) {
          .alm-wallpaper-rec-box { padding: 18px 12px; }
          .rec-grid { gap: 10px; }
          .rec-card { width: 85px; }
        }
      `;
      document.head.appendChild(style);
    }

    const recBox = document.createElement('div');
    recBox.className = 'alm-wallpaper-rec-box';
    recBox.innerHTML = `
      <h3 class="rec-title">${title}</h3>
      <div class="rec-grid">
        ${wallpapers.map(wp => `
          <a href="/wallpaper/${wp.slug || wp.id}" class="rec-card">
            <img src="${wp.thumb}" alt="${wp.title}" loading="lazy" />
          </a>
        `).join('')}
      </div>
      <a href="/wallpaper" class="rec-btn">查看更多玄学壁纸 →</a>
    `;
    container.appendChild(recBox);
  }

  async function init() {
    const target = document.getElementById(CONFIG.targetId);
    if (!target) return;

    let wallpapers = [];
    try {
      const res = await fetch('/wallpapers.json');
      if (res.ok) wallpapers = await res.json();
    } catch (e) {
      console.warn('[Almanac WP Rec] Failed to load wallpapers:', e);
    }
    if (wallpapers.length === 0) return;

    const observer = new MutationObserver((mutations, obs) => {
      if (!target.classList.contains('visible')) return;
      const listEl = document.getElementById('resultList');
      if (!listEl || listEl.children.length === 0) return;

      const scenario = extractScenario();
      let matched = [];

      if (scenario && CONFIG.scenarioToCategory[scenario]) {
        const category = CONFIG.scenarioToCategory[scenario];
        matched = wallpapers.filter(wp => wp.category === category);
      }

      if (matched.length === 0) {
        matched = [...wallpapers].sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);
      } else {
        matched = matched.sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);
      }

      if (matched.length > 0) {
        const title = buildTitle(scenario || 'marry', getLang());
        renderRecommendations(target, matched, title);
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
