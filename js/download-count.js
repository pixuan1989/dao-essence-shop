/**
 * download-count.js - 壁纸下载计数显示
 * 功能：页面加载时显示下载次数，点击下载时 +1
 * 安全：独立模块，不修改现有下载逻辑
 */
(function() {
  'use strict';

  const API = '/api/download';
  let currentWallpaperId = '';

  // 格式化数字（1234 → 1.2K）
  function formatCount(n) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  }

  // 初始化：获取壁纸 ID 并加载计数
  function init() {
    const dlLink = document.getElementById('download-link');
    if (!dlLink) return;

    currentWallpaperId = dlLink.getAttribute('data-wallpaper-id') || '';
    if (!currentWallpaperId) return;

    // 加载当前下载次数
    loadCount(currentWallpaperId);

    // 监听下载按钮点击（不阻止原有逻辑）
    dlLink.addEventListener('click', function(e) {
      if (!currentWallpaperId) return;
      // 异步计数 +1，不影响下载流程
      incrementCount(currentWallpaperId);
    });
  }

  // 查询下载次数并显示
  function loadCount(id) {
    fetch(`${API}?ids=${encodeURIComponent(id)}`)
      .then(res => res.json())
      .then(data => {
        const count = data[id] || 0;
        showCount(count);
      })
      .catch(() => {});
  }

  // 下载次数 +1
  function incrementCount(id) {
    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
      .then(res => res.json())
      .then(data => {
        showCount(data.count || 0);
      })
      .catch(() => {});
  }

  // 显示计数
  function showCount(count) {
    const el = document.getElementById('dl-count-text');
    if (!el) return;
    
    const isZh = document.documentElement.lang === 'zh-Hant' || 
                 window.currentLang === 'zh' ||
                 window.location.pathname.includes('/zh/');
    
    const text = isZh ? `${formatCount(count)} 次下载` : `${formatCount(count)} downloads`;
    el.textContent = text;
  }

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
