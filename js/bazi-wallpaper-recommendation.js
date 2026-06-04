/**
 * BaZi Wallpaper Recommendation Module (Task P1)
 * 功能：在八字排盘结果页底部，根据喜用神推荐对应元素的壁纸。
 * 策略：Append-Only，使用 MutationObserver 监听，绝不修改排盘核心逻辑。
 * 风格：深色半透明卡片 (Dark Theme)，与结果页其他区块融合
 */
(function() {
  'use strict';

  // 配置
  const CONFIG = {
    // 喜用神 -> 壁纸分类映射 (基于五行颜色特征)
    elementToCategory: {
      '火': 'Energy', 'fire': 'Energy', 'Fire': 'Energy',
      '水': 'Five Elements', 'water': 'Five Elements', 'Water': 'Five Elements',
      '木': 'Nature', 'wood': 'Nature', 'Wood': 'Nature',
      '金': 'Five Elements', 'metal': 'Five Elements', 'Metal': 'Five Elements',
      '土': 'Feng Shui', 'earth': 'Feng Shui', 'Earth': 'Feng Shui'
    },
    // 目标容器
    targetId: 'bazi-result',
    // 推荐数量
    limit: 3
  };

  // 工具函数：从文本中提取五行
  function extractElement(text) {
    if (!text) return null;
    const cnKeywords = ['喜用神', '喜神', '用神', '五行喜'];
    const enKeywords = ['favorable', 'lucky element', 'needed element'];

    const lines = text.split(/\n|<br>/i);
    for (let line of lines) {
      const lower = line.toLowerCase();
      const hasCn = cnKeywords.some(k => lower.includes(k));
      const hasEn = enKeywords.some(k => lower.includes(k));

      if (hasCn || hasEn) {
        const elements = ['火', '水', '木', '金', '土', 'fire', 'water', 'wood', 'metal', 'earth'];
        for (let el of elements) {
          if (line.includes(el)) return el;
        }
      }
    }
    return null;
  }

  // 工具函数：渲染推荐区块
  function renderRecommendations(container, wallpapers, title) {
    if (!wallpapers || wallpapers.length === 0) return;

    // 样式注入 (Append-Only CSS) - Dark Theme
    if (!document.getElementById('bazi-wp-rec-style')) {
      const style = document.createElement('style');
      style.id = 'bazi-wp-rec-style';
      style.textContent = `
        .bazi-wallpaper-rec-box {
          margin-top: 40px;
          padding: 32px 20px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          text-align: center;
          transition: all 0.3s ease;
        }
        .bazi-wallpaper-rec-box:hover {
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
          .bazi-wallpaper-rec-box { padding: 24px 16px; }
          .rec-grid { gap: 12px; }
          .rec-card { width: 90px; }
        }
      `;
      document.head.appendChild(style);
    }

    // 创建容器
    const recBox = document.createElement('div');
    recBox.className = 'bazi-wallpaper-rec-box';
    recBox.innerHTML = `
      <h3 class="rec-title">${title || '搭配玄学壁纸，增强您的运势'}</h3>
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
      console.warn('[BaZi WP Rec] Failed to load wallpapers:', e);
    }

    if (wallpapers.length === 0) return;

    // 监听排盘结果渲染
    const observer = new MutationObserver((mutations, obs) => {
      // 检查是否有排盘内容
      const hasContent = target.innerText.length > 50;
      if (!hasContent) return;

      // 提取喜用神
      const text = target.innerText;
      const element = extractElement(text);
      let matchedWps = [];
      let title = '搭配玄学壁纸，增强您的运势';

      if (element && CONFIG.elementToCategory[element]) {
        const category = CONFIG.elementToCategory[element];
        matchedWps = wallpapers.filter(wp => wp.category === category);
        
        if (matchedWps.length > 0) {
          // 构建个性化标题
          const elMap = {
            '火': '您的喜用神为火，建议搭配能量壁纸',
            'water': '您的喜用神为水，建议搭配五行壁纸',
            'wood': '您的喜用神为木，建议搭配自然壁纸',
            'metal': '您的喜用神为金，建议搭配五行壁纸',
            'earth': '您的喜用神为土，建议搭配风水壁纸'
          };
          title = elMap[element] || title;
        }
      }

      // 如果没有匹配到，随机选 3 张
      if (matchedWps.length === 0) {
        matchedWps = [...wallpapers].sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);
      }

      if (matchedWps.length > 0) {
        renderRecommendations(target, matchedWps, title);
        obs.disconnect();
      }
    });

    observer.observe(target, { childList: true, subtree: true, characterData: true });
  }

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
