/**
 * wallpaper-search-optimize.js - 壁纸搜索功能优化
 * 功能：优化 Fuse.js 配置、多词搜索、搜索高亮、搜索建议
 * 安全：独立模块，不修改 wallpaper.html 现有逻辑，通过重新初始化 Fuse 覆盖配置
 */
(function() {
  'use strict';

  // 等待 wallpaper.html 的 allWallpapers 加载完成
  function waitForData(callback) {
    if (typeof allWallpapers !== 'undefined' && allWallpapers.length > 0) {
      callback();
    } else {
      setTimeout(function() { waitForData(callback); }, 100);
    }
  }

  waitForData(function() {
    initSearchOptimization();
  });

  function initSearchOptimization() {
    // P0: 优化 Fuse.js 配置（覆盖原有配置）
    if (typeof Fuse !== 'undefined') {
      // 重新初始化 Fuse，使用优化后的配置
      if (typeof fuseInstance !== 'undefined') {
        fuseInstance = new Fuse(allWallpapers, {
          keys: [
            { name: 'title', weight: 0.5 },
            { name: 'titleZh', weight: 0.5 },
            { name: 'category', weight: 0.2 },
            { name: 'categoryZh', weight: 0.2 },
            { name: 'keywords', weight: 0.15 },
            { name: 'keywordsZh', weight: 0.15 }
          ],
          includeScore: true,
          threshold: 0.25,           // 从 0.5 降至 0.25，提高精确度
          ignoreLocation: false,     // 英文要求匹配位置更接近开头
          distance: 600,             // 减小匹配距离，减少远距离误匹配
          minMatchCharLength: 2,     // 至少匹配 2 个字符，避免单字符噪音
          useExtendedSearch: true    // 支持 AND 逻辑搜索
        });
      }
    }

    // P1: 多词搜索支持（英文用户习惯用空格分隔关键词）
    // 覆盖 getFiltered 函数中的搜索逻辑
    const originalGetFiltered = typeof getFiltered === 'function' ? getFiltered : null;
    if (originalGetFiltered) {
      window.getFiltered = function() {
        let list = [...allWallpapers];
        // Category filter
        if (typeof activeCategory !== 'undefined' && activeCategory !== 'All') {
          list = list.filter(w => w.category === activeCategory);
        }
        // Search filter (优化后的多词搜索)
        if (typeof searchQuery !== 'undefined' && searchQuery) {
          if (typeof fuseInstance !== 'undefined' && fuseInstance) {
            // 处理多词搜索：拆分为多个词，要求同时匹配
            const words = searchQuery.trim().split(/\s+/).filter(w => w.length >= 2);
            if (words.length > 1) {
              // AND 逻辑：所有词都必须匹配
              let allMatchedIds = new Set();
              let firstResults = fuseInstance.search(words[0]);
              allMatchedIds = new Set(firstResults.map(r => r.item.id));
              
              for (let i = 1; i < words.length; i++) {
                const results = fuseInstance.search(words[i]);
                const wordIds = new Set(results.map(r => r.item.id));
                allMatchedIds = new Set([...allMatchedIds].filter(id => wordIds.has(id)));
              }
              list = list.filter(w => allMatchedIds.has(w.id));
            } else {
              // 单关键词搜索
              const results = fuseInstance.search(searchQuery);
              const ids = new Set(results.map(r => r.item.id));
              list = list.filter(w => ids.has(w.id));
            }
          }
        }
        // Sort
        if (typeof activeSort !== 'undefined') {
          if (activeSort === 'popular') {
            list.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
          } else if (activeSort === 'newest') {
            list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
          } else if (typeof searchQuery !== 'undefined' && searchQuery) {
            // 搜索时按 Fuse score 排序（相关性最高）
            if (typeof fuseInstance !== 'undefined' && fuseInstance) {
              const results = fuseInstance.search(searchQuery);
              const scoreMap = {};
              results.forEach(r => { scoreMap[r.item.id] = r.score; });
              list.sort((a, b) => (scoreMap[a.id] || 1) - (scoreMap[b.id] || 1));
            }
          }
        }
        return list;
      };
    }

    // P2: 搜索高亮（在卡片标题上高亮匹配文本）
    function highlightText(text, query) {
      if (!query || !text) return text;
      const words = query.trim().split(/\s+/).filter(w => w.length >= 2);
      let highlighted = text;
      words.forEach(word => {
        const regex = new RegExp(`(${word})`, 'gi');
        highlighted = highlighted.replace(regex, '<mark style="background:#D4AF37;color:#000;padding:0 2px;border-radius:2px;">$1</mark>');
      });
      return highlighted;
    }

    // 覆盖 renderGrid 函数，添加高亮
    const originalRenderGrid = typeof renderGrid === 'function' ? renderGrid : null;
    if (originalRenderGrid) {
      window.renderGrid = function() {
        const grid = document.getElementById('wallpaper-grid');
        const filtered = typeof getFiltered === 'function' ? getFiltered() : [];
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
        const searchQuery = typeof window.searchQuery !== 'undefined' ? window.searchQuery : '';
        
        filtered.forEach(wp => {
          const card = document.createElement('div');
          card.className = 'wallpaper-card';
          card.onclick = () => { const slug = wp.slug || wp.id; window.location.href = (lang === 'zh' ? '/zh' : '') + '/wallpaper/' + slug; };
          const cardTitle = lang === 'zh' ? (wp.titleZh || wp.title) : wp.title;
          const highlightedTitle = searchQuery ? highlightText(cardTitle, searchQuery) : cardTitle;
          card.innerHTML = `<img src="${wp.thumb}" alt="${cardTitle}" loading="lazy"><div class="card-title">${highlightedTitle}</div>`;
          grid.appendChild(card);
        });
      };
    }

    // P3: 搜索建议/自动补全
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      // 创建建议下拉框
      const suggestionsBox = document.createElement('div');
      suggestionsBox.id = 'search-suggestions';
      suggestionsBox.style.cssText = 'position:absolute;top:100%;left:0;right:0;background:#1a1a2e;border:1px solid rgba(255,255,255,0.1);border-radius:8px;margin-top:4px;max-height:200px;overflow-y:auto;z-index:1000;display:none;';
      searchInput.parentElement.style.position = 'relative';
      searchInput.parentElement.appendChild(suggestionsBox);

      // 生成建议列表
      function generateSuggestions(query) {
        if (!query || query.length < 2) return [];
        const suggestions = new Set();
        const keywords = ['fire', 'water', 'wood', 'metal', 'earth', 'dragon', 'phoenix', 'feng shui', 'lucky', 'energy', 'mandala', 'mountain', 'sunset', 'moon', 'sun', 'star', 'lotus', 'bamboo', 'koi', 'fish', 'temple', 'scroll', 'talisman', 'om', 'chakra', 'crystal', 'zen', 'meditation', 'yoga', 'spiritual', '风水', '火', '水', '木', '金', '土', '龙', '凤', '幸运', '能量', '曼陀罗', '山', '日落', '月亮', '太阳', '星', '莲', '竹', '鱼', '寺庙', '符', '咒', '脉轮', '水晶', '禅', '冥想'];
        
        keywords.forEach(keyword => {
          if (keyword.toLowerCase().includes(query.toLowerCase()) && keyword.toLowerCase() !== query.toLowerCase()) {
            suggestions.add(keyword);
          }
        });
        
        // 从现有壁纸标题中提取建议
        if (typeof allWallpapers !== 'undefined') {
          allWallpapers.forEach(wp => {
            const titles = [wp.title, wp.titleZh, wp.category, wp.categoryZh];
            titles.forEach(title => {
              if (title && title.toLowerCase().includes(query.toLowerCase()) && title.toLowerCase() !== query.toLowerCase()) {
                suggestions.add(title.substring(0, 30));
              }
            });
          });
        }
        
        return Array.from(suggestions).slice(0, 5);
      }

      // 显示建议
      searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        const suggestions = generateSuggestions(query);
        
        if (suggestions.length > 0) {
          suggestionsBox.innerHTML = suggestions.map(s => 
            `<div class="suggestion-item" style="padding:8px 12px;cursor:pointer;color:rgba(255,255,255,0.7);border-bottom:1px solid rgba(255,255,255,0.05);">${s}</div>`
          ).join('');
          suggestionsBox.style.display = 'block';
          
          // 点击建议
          suggestionsBox.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', function() {
              searchInput.value = this.textContent;
              suggestionsBox.style.display = 'none';
              // 触发搜索
              if (typeof searchInput.dispatchEvent === 'function') {
                searchInput.dispatchEvent(new Event('input'));
              }
            });
          });
        } else {
          suggestionsBox.style.display = 'none';
        }
      });

      // 点击外部关闭建议
      document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
          suggestionsBox.style.display = 'none';
        }
      });
    }

    // 添加卡片标题样式
    const style = document.createElement('style');
    style.textContent = `
      .card-title { 
        font-size: 13px; 
        color: rgba(255,255,255,0.8); 
        text-align: center; 
        padding: 8px 4px 4px;
        line-height: 1.3;
      }
      .wallpaper-card { 
        cursor: pointer; 
        transition: transform 0.2s; 
        background: rgba(255,255,255,0.02); 
        border-radius: 12px; 
        overflow: hidden;
      }
      .wallpaper-card:hover { 
        transform: translateY(-4px); 
        background: rgba(255,255,255,0.05); 
      }
      .wallpaper-card img { 
        width: 100%; 
        display: block; 
        border-radius: 12px 12px 0 0;
      }
      #search-suggestions .suggestion-item:hover { 
        background: rgba(212,175,55,0.1); 
        color: #D4AF37; 
      }
    `;
    document.head.appendChild(style);

    // 重新渲染网格以应用高亮
    if (typeof renderGrid === 'function') {
      setTimeout(function() { renderGrid(); }, 100);
    }
  }
})();
