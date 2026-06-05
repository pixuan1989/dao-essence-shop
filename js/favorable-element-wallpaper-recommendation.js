/**
 * Favorable Element Wallpaper Recommendation Module (Task P1 - Top Priority)
 * Function: Recommends wallpapers matching the user's favorable element(s) after the Five Elements analysis.
 * Strategy: Append-Only, uses MutationObserver, never modifies core logic.
 * Style: Dark semi-transparent glass cards, consistent with existing modules.
 */
(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    elementToCategory: {
      '火': 'Energy', 'fire': 'Energy', 'Fire': 'Energy',
      '水': 'Five Elements', 'water': 'Five Elements', 'Water': 'Five Elements',
      '木': 'Nature', 'wood': 'Nature', 'Wood': 'Nature',
      '金': 'Five Elements', 'metal': 'Five Elements', 'Metal': 'Five Elements',
      '土': 'Feng Shui', 'earth': 'Feng Shui', 'Earth': 'Feng Shui'
    },
    targetId: 'feResult',
    limit: 3
  };

  // Utility: Extract favorable element(s) from DOM text
  function extractFavElements() {
    const favNameEl = document.getElementById('feFavElementName');
    if (!favNameEl) return [];
    const text = favNameEl.textContent || '';
    const elements = ['火', '水', '木', '金', '土', 'fire', 'water', 'wood', 'metal', 'earth'];
    const found = [];
    for (const el of elements) {
      if (text.toLowerCase().includes(el.toLowerCase()) && !found.includes(el)) {
        found.push(el);
      }
    }
    return found.slice(0, 2); // Max 2 elements
  }

  // Utility: Build title based on elements and language
  function buildTitle(elements, lang) {
    const isZh = lang === 'zh';
    const elNames = elements.map(e => {
      const cn = { '火': '火', '水': '水', '木': '木', '金': '金', '土': '土' };
      const en = { 'fire': 'Fire', 'water': 'Water', 'wood': 'Wood', 'metal': 'Metal', 'earth': 'Earth' };
      return isZh ? (cn[e] || e) : (en[e.toLowerCase()] || e);
    });
    const elStr = elNames.join(' & ');
    return isZh
      ? `搭配${elStr}元素壁纸，增强您的运势`
      : `Enhance your ${elStr} energy with these wallpapers`;
  }

  // Render recommendation block
  function renderRecommendations(container, wallpapers, title) {
    if (!wallpapers || wallpapers.length === 0) return;

    // Append-Only CSS
    if (!document.getElementById('fe-wp-rec-style')) {
      const style = document.createElement('style');
      style.id = 'fe-wp-rec-style';
      style.textContent = `
        .fe-wallpaper-rec-box {
          margin-top: 40px;
          padding: 32px 20px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          text-align: center;
          transition: all 0.3s ease;
        }
        .fe-wallpaper-rec-box:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.08);
        }
        .rec-title {
          font-size: 18px;
          color: #D4AF37;
          margin: 0 0 24px;
          font-weight: 600;
          letter-spacing: 1px;
        }
        .rec-grid {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .rec-card {
          width: 110px;
          border-radius: 12px;
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
          .fe-wallpaper-rec-box { padding: 24px 16px; }
          .rec-grid { gap: 12px; }
          .rec-card { width: 90px; }
        }
      `;
      document.head.appendChild(style);
    }

    // Create container
    const recBox = document.createElement('div');
    recBox.className = 'fe-wallpaper-rec-box';
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

  // Core logic
  async function init() {
    const target = document.getElementById(CONFIG.targetId);
    if (!target) return;

    // Load wallpaper data
    let wallpapers = [];
    try {
      const res = await fetch('/wallpapers.json');
      if (res.ok) wallpapers = await res.json();
    } catch (e) {
      console.warn('[FE WP Rec] Failed to load wallpapers:', e);
    }
    if (wallpapers.length === 0) return;

    // Determine language
    function getLang() {
      const pathname = window.location.pathname;
      return pathname.indexOf('/zh/') === 0 ? 'zh' : 'en';
    }

    // Listen for result rendering
    const observer = new MutationObserver((mutations, obs) => {
      const favNameEl = document.getElementById('feFavElementName');
      if (!favNameEl || favNameEl.textContent.trim().length < 1) return;

      const elements = extractFavElements();
      let matchedWps = [];

      if (elements.length > 0) {
        const categories = new Set();
        for (const el of elements) {
          const cat = CONFIG.elementToCategory[el];
          if (cat) categories.add(cat);
        }
        if (categories.size > 0) {
          for (const cat of categories) {
            matchedWps = matchedWps.concat(wallpapers.filter(wp => wp.category === cat));
          }
          // Remove duplicates
          const seen = new Set();
          matchedWps = matchedWps.filter(wp => {
            if (seen.has(wp.id)) return false;
            seen.add(wp.id);
            return true;
          });
        }
      }

      // Fallback: random 3
      if (matchedWps.length === 0) {
        matchedWps = [...wallpapers].sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);
      } else {
        matchedWps = matchedWps.sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);
      }

      if (matchedWps.length > 0) {
        const title = buildTitle(elements, getLang());
        renderRecommendations(target, matchedWps, title);
        obs.disconnect();
      }
    });

    observer.observe(target, { childList: true, subtree: true, characterData: true });
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
