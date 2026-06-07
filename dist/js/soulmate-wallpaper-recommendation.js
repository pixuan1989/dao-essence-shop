/**
 * Soulmate Calculator Wallpaper Recommendation Module (Task P3)
 * Function: Recommends "peach blossom / love luck" wallpapers after the soulmate reading.
 * Strategy: Append-Only, uses MutationObserver on #sc-step-3, supports i18n language switching.
 * Style: Dark semi-transparent glass cards, consistent with existing modules.
 */
(function() {
  'use strict';

  const CONFIG = {
    targetId: 'sc-step-3',
    limit: 3
  };

  let storedWallpapers = [];

  // Get current language from DaoI18n or URL
  function getLang() {
    if (window.DaoI18n && typeof window.DaoI18n.current === 'function') {
      return window.DaoI18n.current();
    }
    return window.location.pathname.indexOf('/zh/') === 0 ? 'zh' : 'en';
  }

  function buildTitle(lang) {
    const isZh = lang === 'zh';
    return isZh
      ? '催桃花壁纸 — 旺姻缘、招正缘'
      : 'Peach Blossom Wallpapers — Attract Love & Romance';
  }

  function getMoreBtnText(lang) {
    return lang === 'zh' ? '查看更多玄学壁纸 →' : 'Browse All Wallpapers →';
  }

  function renderRecommendations(container, wallpapers, title) {
    const existing = container.querySelector('.sc-wallpaper-rec-box');
    if (existing) existing.remove();

    if (!wallpapers || wallpapers.length === 0) return;

    if (!document.getElementById('sc-wp-rec-style')) {
      const style = document.createElement('style');
      style.id = 'sc-wp-rec-style';
      style.textContent = `
        .sc-wallpaper-rec-box {
          margin-top: 32px; padding: 28px 20px; background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; text-align: center;
        }
        .rec-title { font-size: 16px; color: #D4AF37; margin: 0 0 20px; font-weight: 600; }
        .rec-grid { display: flex; justify-content: center; gap: 14px; margin-bottom: 20px; flex-wrap: wrap; }
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
    recBox.className = 'sc-wallpaper-rec-box';
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
      const res = await fetch('/wallpapers.json');
      if (res.ok) storedWallpapers = await res.json();
    } catch (e) {}
    if (storedWallpapers.length === 0) return;

    // Re-render on language switch
    function reRender() {
      if (storedWallpapers.length === 0) return;
      const title = buildTitle(getLang());
      const matched = storedWallpapers.sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);
      renderRecommendations(target, matched, title);
    }

    document.addEventListener('daoessence:i18n-changed', reRender);

    const observer = new MutationObserver((mutations, obs) => {
      const dirBody = document.getElementById('sc-direction-body');
      if (!dirBody || dirBody.children.length === 0) return;

      const matched = storedWallpapers.sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);
      if (matched.length > 0) {
        renderRecommendations(target, matched, buildTitle(getLang()));
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
