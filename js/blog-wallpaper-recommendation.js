/**
 * Blog Wallpaper Recommendation Module (Task P3) - FIXED
 * 修复：增加列表页拦截，确保只在文章详情页显示。
 */
(function() {
  'use strict';

  // 文案池 (随机轮换)
  const COPIES = [
    { title: '搭配玄学壁纸，让好运常伴左右', btn: '查看更多开运壁纸 →' },
    { title: '将能量带入日常：精选五行壁纸', btn: '浏览更多精选 →' },
    { title: '换个背景，换种气场', btn: '探索玄学壁纸 →' },
    { title: '每日注视的能量场：精选壁纸', btn: '查看壁纸合集 →' },
    { title: '能量加持：搭配对应元素壁纸', btn: '发现你的幸运壁纸 →' }
  ];

  const CONFIG = {
    limit: 3,
    insertionIndex: 2 // 第 3 个段落后 (0-indexed)
  };

  // 渲染推荐卡片
  function render(container) {
    if (!container) return;

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
        }
        .blog-wp-rec-title { font-size: 16px; color: #D4AF37; font-weight: 600; margin: 0 0 16px; }
        .blog-wp-rec-grid { display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .blog-wp-rec-item { width: 32%; border-radius: 8px; overflow: hidden; aspect-ratio: 9/16; background: #f8f8f8; }
        .blog-wp-rec-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .blog-wp-rec-btn { display: inline-block; padding: 8px 16px; color: #D4AF37; text-decoration: none; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #D4AF37; }
        @media (max-width: 480px) { .blog-wp-rec-grid { gap: 8px; } }
      `;
      document.head.appendChild(style);
    }

    // 获取壁纸数据并插入
    fetch('/wallpapers.json')
      .then(res => res.ok ? res.json() : [])
      .then(wallpapers => {
        if (!wallpapers || wallpapers.length === 0) return;
        const shuffled = [...wallpapers].sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);
        const html = `
          <div class="blog-wp-rec-card">
            <div class="blog-wp-rec-title">${copy.title}</div>
            <div class="blog-wp-rec-grid">
              ${shuffled.map(wp => `<a href="/wallpaper/${wp.slug || wp.id}" class="blog-wp-rec-item"><img src="${wp.thumb}" alt="${wp.title}" loading="lazy" /></a>`).join('')}
            </div>
            <a href="/wallpaper" class="blog-wp-rec-btn">${copy.btn}</a>
          </div>
        `;
        container.insertAdjacentHTML('afterend', html);
      })
      .catch(console.warn);
  }

  // 初始化
  function init() {
    // 1. 列表页拦截：如果页面包含文章列表容器，说明是列表页，直接退出
    if (document.querySelector('.blog-card-list')) return;

    // 2. 详情页定位：寻找文章正文容器
    const articleContent = document.querySelector('.blog-content') || document.querySelector('.blog-article');
    if (!articleContent) return;

    // 3. 寻找第 3 个段落
    const paragraphs = articleContent.querySelectorAll('p');
    if (paragraphs.length <= CONFIG.insertionIndex) return;

    // 4. 执行插入
    render(paragraphs[CONFIG.insertionIndex]);
  }

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
