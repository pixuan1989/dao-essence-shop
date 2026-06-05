/**
 * BaZi Wallpaper Recommendation Module (Fixed Layout & i18n)
 * Function: Renders wallpapers at the bottom of BaZi result page.
 * Safety: Appends to existing container, respects current language.
 * 
 * Fixed: 
 * 1. Align with left column of .bazi-page (grid 1fr 300px layout)
 * 2. Use window.DaoI18n.current() for language detection (consistent with BaZi SPA)
 * 3. Listen to daoessence:i18n-changed event for dynamic language switching
 */
(function() {
  'use strict';

  // --- Language Detection (Consistent with BaZi SPA) ---
  function getLang() {
    // Method 1: Use DaoI18n (same as bazi-result.js uses window.DaoI18n.current())
    if (window.DaoI18n && typeof window.DaoI18n.current === 'function') {
      return window.DaoI18n.current() === 'zh' ? 'zh' : 'en';
    }
    // Method 2: Check URL path (/zh/ prefix)
    if (window.location.pathname.includes('/zh/')) {
      return 'zh';
    }
    // Method 3: Check active language button
    const activeBtn = document.querySelector('.lang-option.active');
    if (activeBtn && activeBtn.getAttribute('data-lang') === 'zh') {
      return 'zh';
    }
    // Method 4: Check window.currentLang
    if (typeof window.currentLang !== 'undefined' && window.currentLang === 'zh') {
      return 'zh';
    }
    return 'en';
  }

  async function render() {
    const container = document.getElementById('bazi-wp-rec-container');
    if (!container) return;

    const lang = getLang();
    const title = lang === 'zh' ? '搭配玄学壁纸，增强您的运势' : "Enhance your energy with metaphysical wallpapers";
    const btnText = lang === 'zh' ? '查看更多玄学壁纸 →' : 'Browse All Wallpapers →';

    try {
      const res = await fetch('/wallpapers.json');
      if (!res.ok) return;
      const wps = await res.json();

      // Pick 3 random
      const picks = wps.sort(() => 0.5 - Math.random()).slice(0, 3);

      // Build HTML - align with LEFT column of .bazi-page (grid-template-columns: 1fr 300px)
      // The left column width ≈ 800px (1140px total - 300px sidebar - 2.5rem gap)
      // We wrap in 1140px container to match .bazi-page, then inner 800px for left column alignment
      let html = `
        <div style="max-width: 1140px; margin: 50px auto 0; padding: 0 1.5rem;">
          <div style="max-width: 800px; text-align: center;">
            <h3 style="font-size: 20px; color: #D4AF37; margin: 0 0 24px 0; font-weight: 600;">${title}</h3>
            <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin-bottom: 30px;">
      `;

      picks.forEach(wp => {
        html += `<a href="/wallpaper/${wp.slug || wp.id}" style="display: block; width: 130px; border-radius: 12px; overflow: hidden; border: 1px solid rgba(212,175,55,0.3); box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: transform 0.2s;">
                   <img src="${wp.thumb || ''}" style="width: 100%; display: block;" loading="lazy"/>
                 </a>`;
      });

      html += `</div>`;
      html += `<a href="/wallpaper" style="display: inline-block; padding: 12px 28px; background: #D4AF37; color: #fff; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; transition: opacity 0.2s;">${btnText}</a>`;
      html += `</div></div>`;

      container.innerHTML = html;

    } catch (e) {
      console.error('[BaZi Wallpaper] Error:', e);
    }
  }

  // --- Init ---
  function init() {
    // Render immediately
    render();
    
    // Listen for language changes (SPA dynamic switching)
    // BaZi SPA fires 'daoessence:i18n-changed' when user switches language
    document.addEventListener('daoessence:i18n-changed', function() {
      render();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
