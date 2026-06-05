/**
 * BaZi Wallpaper Recommendation Module (Fixed Layout & i18n)
 * Function: Renders wallpapers at the bottom of BaZi result page.
 * Safety: Appends to existing container, respects current language.
 */
(function() {
  'use strict';

  async function init() {
    const container = document.getElementById('bazi-wp-rec-container');
    if (!container) return;

    // --- i18n Logic ---
    // 1. Check window.currentLang (used by bazi-result.js)
    // 2. Check window.DaoI18n
    // 3. Check URL path /zh/
    let lang = 'en';
    if (typeof window.currentLang !== 'undefined' && window.currentLang === 'zh') {
      lang = 'zh';
    } else if (window.DaoI18n && window.DaoI18n.current && window.DaoI18n.current() === 'zh') {
      lang = 'zh';
    } else if (window.location.pathname.indexOf('/zh/') === 0) {
      lang = 'zh';
    }

    const title = lang === 'zh' ? '搭配玄学壁纸，增强您的运势' : "Enhance your energy with metaphysical wallpapers";
    const btnText = lang === 'zh' ? '查看更多玄学壁纸 →' : 'Browse All Wallpapers →';

    // --- Content Generation ---
    try {
      const res = await fetch('/wallpapers.json');
      if (!res.ok) return;
      const wps = await res.json();
      
      // Pick 3 random
      const picks = wps.sort(() => 0.5 - Math.random()).slice(0, 3);
      
      // Build HTML with inline flex centering
      let html = `
        <div style="padding-top:40px; text-align:center;">
          <h3 style="font-size:18px; color:#D4AF37; margin:0 0 20px 0; font-weight:600;">${title}</h3>
          <div style="display:flex; justify-content:center; gap:16px; flex-wrap:wrap; margin-bottom:24px;">
      `;
      
      picks.forEach(wp => {
        html += `<a href="/wallpaper/${wp.slug || wp.id}" style="display:block; width:110px; border-radius:10px; overflow:hidden; border:1px solid rgba(212,175,55,0.2); transition:transform 0.2s;">
                   <img src="${wp.thumb || ''}" style="width:100%; display:block; min-height:160px;" loading="lazy"/>
                 </a>`;
      });
      
      html += `</div>`;
      html += `<a href="/wallpaper" style="display:inline-block; padding:10px 24px; background:rgba(212,175,55,0.15); color:#D4AF37; border:1px solid rgba(212,175,55,0.3); border-radius:8px; text-decoration:none; font-size:14px; font-weight:500;">${btnText}</a>`;
      html += `</div>`;
      
      container.innerHTML = html;
      
    } catch (e) {
      console.error('[BaZi Wallpaper] Error:', e);
    }
  }

  // Run immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
