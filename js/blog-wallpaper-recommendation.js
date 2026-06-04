/**
 * Blog Wallpaper Recommendation Module (Task P3)
 * 功能：在博客文章正文中插入玄学壁纸推荐。
 * 策略：Append-Only，JS 动态插入，绝不修改构建逻辑。
 * 视觉：紧密排列、白底卡片、与博客正文完美融合。
 */
(function() {
  'use strict';

  // 文案池 (随机轮换，避免视觉疲劳)
  const COPIES = [
    { title: '搭配玄学壁纸，让好运常伴左右', btn: '查看更多开运壁纸 →' },
    { title: '将能量带入日常：精选五行壁纸', btn: '浏览更多精选 →' },
    { title: '换个背景，换种气场', btn: '探索玄学壁纸 →' },
    { title: '每日注视的能量场：精选壁纸', btn: '查看壁纸合集 →' },
    { title: '能量加持：搭配对应元素壁纸', btn: '发现你的幸运壁纸 →' }
  ];

  // 配置
  const CONFIG = {
    limit: 3, // 展示数量
    insertionIndex: 2 // 插入在第 3 个段落 (0-indexed) 之后
  };

  // 渲染推荐卡片
  function render(container) {
    if (!container) return;

    // 随机文案
    const copy = COPIES[Math.floor(Math.random() * COPIES.length)];

    // 样式注入
    if (!document.getElementById('blog-wp-rec-style')) {
      const style = document.createElement('style');
      style.id = 'blog-wp-rec-style';
      style.textContent = `
        .blog-wp-rec-card {
          background: #ffffff;
          border: 1px solid #f0f0f0;
          border-radius: 12px;
          padding: 24px 16px;
          margin: 32px auto;
          text-align: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
          max-width: 100%;
          transition: box-shadow 0.3s;
        }
        .blog-wp-rec-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.06); }
        .blog-wp-rec-title {
          font-size: 16px;
          color: #D4AF37;
          font-weight: 600;
          margin: 0 0 16px;
          letter-spacing: 0.5px;
        }
        .blog-wp-rec-grid {
          display: flex;
          justify-content: center;
          gap: 10px; /* 紧凑间距 */
          margin-bottom: 20px;
        }
        .blog-wp-rec-item {
          width: 32%; /* 3 列紧凑布局 */
          border-radius: 8px;
          overflow: hidden;
          aspect-ratio: 9/16;
          background: #f8f8f8;
          transition: transform 0.2s;
        }
        .blog-wp-rec-item:hover { transform: scale(1.02); }
        .blog-wp-rec-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .blog-wp-rec-btn {
          display: inline-block;
          padding: 8px 16px;
          color: #D4AF37;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          border-bottom: 1px dashed #D4AF37;
          transition: color 0.2s;
        }
        .blog-wp-rec-btn:hover { color: #b8962e; border-bottom-style: solid; }
        
        /* 移动端适配：保持紧凑 */
        @media (max-width: 480px) {
          .blog-wp-rec-card { padding: 16px 12px; margin: 24px 0; }
          .blog-wp-rec-grid { gap: 8px; }
        }
      `;
      document.head.appendChild(style);
    }

    // 获取壁纸数据
    fetch('/wallpapers.json')
      .then(res => res.ok ? res.json() : [])
      .then(wallpapers => {
        if (!wallpapers || wallpapers.length === 0) return;
        
        // 随机打乱
        const shuffled = [...wallpapers].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, CONFIG.limit);

        // 构建 HTML
        const html = `
          <div class="blog-wp-rec-card">
            <div class="blog-wp-rec-title">${copy.title}</div>
            <div class="blog-wp-rec-grid">
              ${selected.map(wp => `
                <a href="/wallpaper/${wp.slug || wp.id}" class="blog-wp-rec-item">
                  <img src="${wp.thumb}" alt="${wp.title}" loading="lazy" />
                </a>
              `).join('')}
            </div>
            <a href="/wallpaper" class="blog-wp-rec-btn">${copy.btn}</a>
          </div>
        `;

        // 插入 DOM
        container.insertAdjacentHTML('afterend', html);
      })
      .catch(console.warn);
  }

  // 初始化
  function init() {
    // 1. URL 判断：确保只在文章详情页执行 (排除列表页和分类页)
    // 列表页通常是 /blog 或 /blog/feng-shui，详情页是 /blog/slug (slug 中通常不含 /)
    // 兼容中英文路径判断
    const path = window.location.pathname;
    const blogRegex = /^\/(?:zh\/)?blog\/[^\/]+$/;
    if (!blogRegex.test(path)) return;

    // 2. 寻找文章正文容器 (精确匹配详情页结构)
    // 详情页通常有 .article-content 或单独的 article 标签
    const article = document.querySelector('.article-content') || document.querySelector('article');
    if (!article) return;

    // 3. 寻找第 3 个段落
    const paragraphs = article.querySelectorAll('p');
    if (paragraphs.length <= CONFIG.insertionIndex) return;

    // 4. 插入
    render(paragraphs[CONFIG.insertionIndex]);
  }

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
