/**
 * download-count.js - 壁纸下载计数显示
 * 功能：页面加载时显示下载次数，点击下载时 +1
 * 安全：独立模块，不修改现有下载逻辑
 * 复用 api/pageview 端点（合并下载计数到现有函数，不超限）
 * 
 * 修复：增加重试机制和 MutationObserver 双保险，确保异步数据加载后也能正确获取 ID
 */
(function() {
  'use strict';

  const API = '/api/pageview';
  let currentWallpaperId = '';
  let initialized = false;

  // 格式化数字（1234 → 1.2K）
  function formatCount(n) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  }

  // 初始化计数显示和按钮监听
  function initCount(id) {
    if (initialized || !id) return;
    initialized = true;
    currentWallpaperId = id;

    // 加载当前下载次数
    loadCount(id);

    // 监听下载按钮点击（不阻止原有逻辑）
    const dlLink = document.getElementById('download-link');
    if (dlLink) {
      dlLink.addEventListener('click', function(e) {
        if (!currentWallpaperId) return;
        incrementCount(currentWallpaperId);
      });
    }
  }

  // 查询下载次数并显示
  function loadCount(id) {
    fetch(`${API}?action=download&ids=${encodeURIComponent(id)}`)
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
      body: JSON.stringify({ action: 'download', id }),
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
    el.textContent = '⬇ ' + text;
  }

  // 获取 ID 的主逻辑
  function tryGetId() {
    if (initialized) return;
    
    const dlLink = document.getElementById('download-link');
    if (!dlLink) return;

    const id = dlLink.getAttribute('data-wallpaper-id');
    if (id) {
      initCount(id);
      return true;
    }
    return false;
  }

  // 启动
  function start() {
    // 1. 立即尝试
    if (tryGetId()) return;

    // 2. 轮询重试（最多 5 次，间隔 300ms）
    let retries = 0;
    const pollId = setInterval(function() {
      if (tryGetId()) {
        clearInterval(pollId);
      } else {
        retries++;
        if (retries >= 5) clearInterval(pollId);
      }
    }, 300);

    // 3. 监听属性变化（MutationObserver 作为备用）
    const dlLink = document.getElementById('download-link');
    if (dlLink) {
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-wallpaper-id') {
            const newId = dlLink.getAttribute('data-wallpaper-id');
            if (newId) {
              initCount(newId);
              observer.disconnect();
            }
          }
        });
      });
      observer.observe(dlLink, { attributes: true, attributeFilter: ['data-wallpaper-id'] });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
