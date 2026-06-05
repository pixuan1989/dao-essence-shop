/**
 * Zodiac Aggregate Bottom Wallpaper Module (Append-Only)
 * Function: Renders 3 random wallpapers at the bottom of the aggregate page.
 * Safety: Wrapped in try-catch, fails silently, zero impact on core logic.
 */
(function() {
  'use strict';

  async function init() {
    const grid = document.getElementById('zodiac-wp-grid');
    if (!grid) return;

    try {
      const res = await fetch('/wallpapers.json');
      if (!res.ok) return;
      const wps = await res.json();

      // Randomly pick 3
      const picks = wps.sort(() => 0.5 - Math.random()).slice(0, 3);

      picks.forEach(wp => {
        const a = document.createElement('a');
        a.href = '/wallpaper/' + (wp.slug || wp.id);
        a.style.cssText = "display:block;width:110px;border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);transition:transform 0.2s;";
        a.innerHTML = '<img src="' + wp.thumb + '" style="width:100%;display:block;" loading="lazy"/>';
        a.onmouseenter = () => a.style.transform = "translateY(-4px)";
        a.onmouseleave = () => a.style.transform = "";
        grid.appendChild(a);
      });
    } catch (e) {
      // Fail silently
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
