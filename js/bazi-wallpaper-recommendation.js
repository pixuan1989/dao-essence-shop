/**
 * BaZi Wallpaper Recommendation Module
 * Renders wallpapers at the bottom of BaZi result page.
 */
(function() {
  'use strict';

  function getLang() {
    if (window.DaoI18n && typeof window.DaoI18n.current === 'function') {
      return window.DaoI18n.current() === 'zh' ? 'zh' : 'en';
    }
    const activeBtn = document.querySelector('.lang-option.active');
    if (activeBtn && activeBtn.getAttribute('data-lang') === 'zh') {
      return 'zh';
    }
    if (window.location.pathname.includes('/zh/')) {
      return 'zh';
    }
    if (typeof window.currentLang !== 'undefined' && window.currentLang === 'zh') {
      return 'zh';
    }
    return 'en';
  }

  async function render() {
    const container = document.getElementById('bazi-wp-rec-container');
    if (!container) return;

    const lang = getLang();
    const title = lang === 'zh' ? '\u642d\u914d\u7384\u5b66\u58c1\u7eb8\uff0c\u589e\u5f3a\u60a8\u7684\u8fd0\u52bf' : 'Enhance your energy with metaphysical wallpapers';
    const btnText = lang === 'zh' ? '\u67e5\u770b\u66f4\u591a\u7384\u5b66\u58c1\u7eb8 \u2192' : 'Browse All Wallpapers \u2192';

    try {
      const res = await fetch('/wallpapers-lite.json');
      if (!res.ok) return;
      const wps = await res.json();
      const picks = wps.sort(() => 0.5 - Math.random()).slice(0, 3);

      let html = '<div style="max-width:1140px;margin:50px auto 0;padding:0 1.5rem;">';
      html += '<div style="max-width:800px;text-align:center;">';
      html += '<h3 style="font-size:20px;color:#D4AF37;margin:0 0 24px 0;font-weight:600;">' + title + '</h3>';
      html += '<div style="display:flex;justify-content:center;gap:20px;flex-wrap:wrap;margin-bottom:30px;">';

      picks.forEach(function(wp) {
        html += '<a href="/wallpaper/' + (wp.slug || wp.id) + '" style="display:block;width:130px;border-radius:12px;overflow:hidden;border:1px solid rgba(212,175,55,0.3);box-shadow:0 4px 12px rgba(0,0,0,0.1);transition:transform 0.2s;">';
        html += '<img src="' + (wp.thumb || '') + '" style="width:100%;display:block;" loading="lazy" onerror="this.onerror=null;this.src=this.src.split(\'?\')[0]+\'?t=\'+Date.now()"/>';
        html += '</a>';
      });

      html += '</div>';
      html += '<a href="/wallpaper" style="display:inline-block;padding:12px 28px;background:#D4AF37;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;transition:opacity 0.2s;">' + btnText + '</a>';
      html += '</div></div>';

      container.innerHTML = html;
    } catch (e) {
      console.error('[BaZi Wallpaper] Error:', e);
    }
  }

  function init() {
    if (!window.DaoI18n || typeof window.DaoI18n.current !== 'function') {
      setTimeout(render, 200);
    } else {
      render();
    }
    document.addEventListener('daoessence:i18n-changed', render);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
