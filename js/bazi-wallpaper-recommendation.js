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
    // 1. Check HTML lang attribute (most reliable, e.g. "zh-Hant")
    // 2. Check window.currentLang
    let lang = 'en';
    const htmlLang = document.documentElement.lang;
    if (htmlLang && (htmlLang.startsWith('zh') || htmlLang.includes('Hant'))) {
      lang = 'zh';
    } else if (typeof window.currentLang !== 'undefined' && window.currentLang === 'zh') {
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
      
      // Build HTML with strict centering constraints
      let html = `
        <div style="max-width: 800px; margin: 50px auto 0; text-align: center; padding: 0 20px;">
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
