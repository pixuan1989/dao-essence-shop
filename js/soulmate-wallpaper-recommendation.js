/**
 * Soulmate Calculator Wallpaper Recommendation Module (Task P3)
 * Function: Recommends wallpapers matching the user's soulmate element after the reading.
 * Strategy: Append-Only, uses MutationObserver on #sc-step-3, never modifies core logic.
 * Style: Dark semi-transparent glass cards, consistent with existing modules.
 */
(function() {
  'use strict';

  const CONFIG = {
    elementToCategory: {
      'fire': 'Energy', 'Fire': 'Energy', '火': 'Energy',
      'water': 'Five Elements', 'Water': 'Five Elements', '水': 'Five Elements',
      'wood': 'Nature', 'Wood': 'Nature', '木': 'Nature',
      'metal': 'Five Elements', 'Metal': 'Five Elements', '金': 'Five Elements',
      'earth': 'Feng Shui', 'Earth': 'Feng Shui', '土': 'Feng Shui'
    },
    targetId: 'sc-step-3',
    limit: 3
  };

  // Extract soulmate element from direction card text
  function extractSoulmateElement() {
    const dirBody = document.getElementById('sc-direction-body');
    if (!dirBody) return null;
    const text = dirBody.textContent || '';
    const elements = ['fire', 'water', 'wood', 'metal', 'earth', 'Fire', 'Water', 'Wood', 'Metal', 'Earth', '火', '水', '木', '金', '土'];
    for (const el of elements) {
      if (text.includes(el)) return el;
    }
    return null;
  }

  function getLang() {
    return window.location.pathname.indexOf('/zh/') === 0 ? 'zh' : 'en';
  }

  function buildTitle(element, lang) {
    const isZh = lang === 'zh';
    const elMap = {
      fire: { zh: '火', en: 'Fire' }, water: { zh: '水', en: 'Water' },
      wood: { zh: '木', en: 'Wood' }, metal: { zh: '金', en: 'Metal' }, earth: { zh: '土', en: 'Earth' }
    };
    const el = elMap[element.toLowerCase()] || { zh: element, en: element };
    return isZh
      ? `你的伴侣五行属${el.zh}，搭配${el.zh}元素壁纸增进感情`
      : `Your soulmate's element is ${el.en} — enhance your relationship with these wallpapers`;
  }

  function renderRecommendations(container, wallpapers, title) {
    if (container.querySelector('.sc-wallpaper-rec-box')) return;

    // Append-Only CSS
    if (!document.getElementById('sc-wp-rec-style')) {
      const style = document.createElement('style');
      style.id = 'sc-wp-rec-style';
      style.textContent = `
        .sc-wallpaper-rec-box {
          margin-top: 32px;
          padding: 28px 20px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          text-align: center;
          transition: all 0.3s ease;
        }
        .sc-wallpaper-rec-box:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.08);
        }
        .rec-title {
          font-size: 16px;
          color: #D4AF37;
          margin: 0 0 20px;
          font-weight: 600;
          letter-spacing: 1px;
        }
        .rec-grid {
          display: flex;
          justify-content: center;
          gap: 14px;
          margin-bottom: 20px;
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
          .sc-wallpaper-rec-box { padding: 20px 14px; }
          .rec-grid { gap: 10px; }
          .rec-card { width: 85px; }
        }
      `;
      document.head.appendChild(style);
    }

    const recBox = document.createElement('div');
    recBox.className = 'sc-wallpaper-rec-box';
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
      console.warn('[SC WP Rec] Failed to load wallpapers:', e);
    }
    if (wallpapers.length === 0) return;

    const observer = new MutationObserver((mutations, obs) => {
      const dirBody = document.getElementById('sc-direction-body');
      if (!dirBody || dirBody.children.length === 0) return;

      const element = extractSoulmateElement();
      let matched = [];

      if (element && CONFIG.elementToCategory[element]) {
        const category = CONFIG.elementToCategory[element];
        matched = wallpapers.filter(wp => wp.category === category);
      }

      if (matched.length === 0) {
        matched = [...wallpapers].sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);
      } else {
        matched = matched.sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);
      }

      if (matched.length > 0) {
        const title = buildTitle(element || 'fire', getLang());
        renderRecommendations(target, matched, title);
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
