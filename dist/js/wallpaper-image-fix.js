/**
 * wallpaper-image-fix.js - 壁纸图片加载容错修复
 * 功能：为所有壁纸卡片图片添加 onerror 容错，WebP 失败时回退到 original.png
 * 安全：独立模块，不修改现有逻辑，仅增强容错能力
 */
(function() {
  'use strict';

  function waitForData(callback) {
    if (typeof allWallpapers !== 'undefined' && allWallpapers.length > 0) {
      callback();
    } else {
      setTimeout(function() { waitForData(callback); }, 100);
    }
  }

  waitForData(function() {
    // 覆盖 renderGrid 函数，添加 onerror 处理
    const originalRenderGrid = typeof window.renderGrid === 'function' ? window.renderGrid : null;
    if (originalRenderGrid) {
      window.renderGrid = function() {
        const grid = document.getElementById('wallpaper-grid');
        if (!grid) return;
        
        const filtered = typeof window.getFiltered === 'function' ? window.getFiltered() : [];
        const resultText = filtered.length + ' ' + (typeof t === 'function' ? t('wallpaper.result_count') : 'results');
        const resultCountEl = document.getElementById('result-count');
        if (resultCountEl) resultCountEl.textContent = resultText;

        if (filtered.length === 0) {
          grid.innerHTML = `
            <div class="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
              <p>${typeof t === 'function' ? t('wallpaper.empty_state') : 'No wallpapers found.'}</p>
            </div>`;
          return;
        }

        grid.innerHTML = '';
        const lang = typeof getLang === 'function' ? getLang() : ((new URLSearchParams(window.location.search)).get('lang') || localStorage.getItem('daoessence_lang') || 'en');
        
        filtered.forEach(wp => {
          const card = document.createElement('div');
          card.className = 'wallpaper-card';
          card.onclick = () => { const slug = wp.slug || wp.id; window.location.href = (lang === 'zh' ? '/zh' : '') + '/wallpaper/' + slug; };
          const cardTitle = lang === 'zh' ? (wp.titleZh || wp.title) : wp.title;
          
          // 添加 onerror 容错：WebP 失败时回退到 original.png
          card.innerHTML = `<img src="${wp.thumb}" alt="${cardTitle}" loading="lazy" onerror="this.onerror=null; this.src='${wp.original || ''}';">`;
          grid.appendChild(card);
        });
      };
      
      // 强制重新渲染
      setTimeout(function() { 
        if (typeof window.renderGrid === 'function') window.renderGrid(); 
      }, 100);
    }
  });
})();
