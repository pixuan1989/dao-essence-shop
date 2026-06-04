/**
 * Five Elements Test Wallpaper Recommendation Module (Task P2)
 * 功能：在五行测试结果显示后，随机推荐"玄学精美壁纸"。
 * 策略：Append-Only，使用 MutationObserver 监听，绝不修改测试核心逻辑。
 * 风格：深色半透明卡片 (Dark Theme)，与结果页其他区块融合
 */
(function() {
  'use strict';

  // 配置
  const CONFIG = {
    targetId: 'resultContent', // 五行测试结果的容器 ID
    limit: 3
  };

  // 渲染推荐区块
  function renderRecommendations(container, wallpapers) {
    if (!wallpapers || wallpapers.length === 0) return;

    // 样式注入 (Append-Only CSS) - Dark Theme
    if (!document.getElementById('test-wp-rec-style')) {
      const style = document.createElement('style');
      style.id = 'test-wp-rec-style';
      style.textContent = `
        .test-wallpaper-rec-box {
          margin-top: 40px;
          padding: 32px 20px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          text-align: center;
          transition: all 0.3s ease;
        }
        .test-wallpaper-rec-box:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.08);
        }
        .rec-title {
          font-size: 18px;
          color: #D4AF37;
          margin: 0 0 24px;
          font-weight: 600;
          letter-spacing: 1px;
        }
        .rec-grid {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .rec-card {
          width: 110px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: transform 0.2s, border-color 0.2s;
          display: block;
          background: #111;
        }
        .rec-card:hover { 
          transform: translateY(-4px); 
          border-color: #D4AF37;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .rec-card img { width: 100%; height: auto; display: block; }
        .rec-btn {
          display: inline-block;
          padding: 10px 24px;
          background: rgba(212, 175, 55, 0.15);
          color: #D4AF37;
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 8px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .rec-btn:hover { 
          background: rgba(212, 175, 55, 0.25); 
          color: #fff; 
          border-color: #D4AF37;
        }
        @media (max-width: 600px) {
          .test-wallpaper-rec-box { padding: 24px 16px; }
          .rec-grid { gap: 12px; }
          .rec-card { width: 90px; }
        }
      `;
      document.head.appendChild(style);
    }

    // 创建容器
    const recBox = document.createElement('div');
    recBox.className = 'test-wallpaper-rec-box';
    recBox.innerHTML = `
      <h3 class="rec-title">搭配玄学壁纸，增强您的运势</h3>
      <div class="rec-grid">
        ${wallpapers.map(wp => `
          <a href="/wallpaper/${wp.slug || wp.id}" class="rec-card">
            <img src="${wp.thumb}" alt="${wp.title}" loading="lazy" />
          </a>
        `).join('')}
      </div>
      <a href="/wallpaper" class="rec-btn">查看更多玄学壁纸 →</a>
    `;
    container.appendChild(recBox);
  }

  // 核心逻辑
  async function init() {
    const target = document.getElementById(CONFIG.targetId);
    if (!target) return;

    // 获取壁纸数据
    let wallpapers = [];
    try {
      const res = await fetch('/wallpapers.json');
      if (res.ok) wallpapers = await res.json();
    } catch (e) {
      console.warn('[Test WP Rec] Failed to load wallpapers:', e);
    }

    if (wallpapers.length === 0) return;

    // 监听测试结果渲染
    const observer = new MutationObserver((mutations, obs) => {
      // 检查是否有测试结果内容
      if (target.children.length > 0 && !target.querySelector('.test-wallpaper-rec-box')) {
        // 随机打乱并选取 3 张
        const randomWps = [...wallpapers].sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);
        renderRecommendations(target, randomWps);
        obs.disconnect();
      }
    });

    observer.observe(target, { childList: true, subtree: true });
  }

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
