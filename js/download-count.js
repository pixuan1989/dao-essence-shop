/**
 * download-count.js - 壁纸下载计数显示（只读）
 * 功能：页面加载时显示下载次数
 * 安全：不再监听点击下载事件（计数已由后端 /api/auth?action=download 统一管理）
 *
 * 后端 auth.js 在额度验证通过后自动 incr 计数，前端只负责展示。
 * 修复：移除 incrementCount，避免额度用完后仍显示 +1 的问题。
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

  // 初始化计数显示（只读，不监听点击）
  function initCount(id) {
    if (initialized || !id) return;
    initialized = true;
    currentWallpaperId = id;

    // 加载当前下载次数
    loadCount(id);

    // ️ 移除：不再监听下载按钮点击，计数由后端统一管理
    // 旧代码会在任何点击时 +1，即使额度已用完也会显示，导致计数不准确
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

  // 显示计数
  function showCount(count) {
    const el = document.getElementById('dl-count-text');
    if (!el) return;

    const isZh = document.documentElement.lang === 'zh-Hant' ||
                 window.currentLang === 'zh' ||
                 window.location.pathname.includes('/zh/');

    const text = isZh ? `${formatCount(count)} 次下载` : `${formatCount(count)} downloads`;
    el.textContent = ' ' + text;
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
