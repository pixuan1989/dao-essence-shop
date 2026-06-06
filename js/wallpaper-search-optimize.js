/**
 * wallpaper-search-optimize.js v2
 * 功能：修复中文长句搜索匹配差的问题，支持多关键词匹配。
 * 安全：独立模块，Append-Only。
 */
(function() {
  'use strict';

  // 等待数据加载
  function waitForData(callback) {
    if (typeof allWallpapers !== 'undefined' && allWallpapers.length > 0) {
      callback();
    } else {
      setTimeout(function() { waitForData(callback); }, 100);
    }
  }

  waitForData(function() {
    // 1. 重新初始化 Fuse (优化配置)
    if (typeof Fuse !== 'undefined') {
      fuseInstance = new Fuse(allWallpapers, {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'titleZh', weight: 0.4 },
          { name: 'category', weight: 0.1 },
          { name: 'categoryZh', weight: 0.1 }
        ],
        includeScore: true,
        threshold: 0.35,          // 降低阈值，提高匹配度
        distance: 2000,           // 增加距离
        ignoreLocation: true,     // 忽略位置
        minMatchCharLength: 1
      });
    }

    // 2. 优化 getFiltered 逻辑 (支持多关键词)
    const originalGetFiltered = typeof getFiltered === 'function' ? getFiltered : null;
    if (originalGetFiltered) {
      window.getFiltered = function() {
        let list = [...allWallpapers];
        
        // Category filter
        if (typeof activeCategory !== 'undefined' && activeCategory !== 'All') {
          list = list.filter(w => w.category === activeCategory);
        }
        
        // Search filter
        if (typeof searchQuery !== 'undefined' && searchQuery) {
          if (typeof fuseInstance !== 'undefined' && fuseInstance) {
            // 将搜索词拆分为关键词（支持空格分隔，中文也可按字拆分）
            const keywords = searchQuery.trim().split(/\s+/).filter(k => k.length > 0);
            
            if (keywords.length > 1) {
              // 多关键词：取交集 (AND 逻辑)，要求所有词都匹配
              let matchedIds = new Set();
              let firstResults = fuseInstance.search(keywords[0]);
              matchedIds = new Set(firstResults.map(r => r.item.id));
              
              for (let i = 1; i < keywords.length; i++) {
                const results = fuseInstance.search(keywords[i]);
                const wordIds = new Set(results.map(r => r.item.id));
                matchedIds = new Set([...matchedIds].filter(id => wordIds.has(id)));
              }
              list = list.filter(w => matchedIds.has(w.id));
            } else {
              // 单关键词：直接搜索
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
          }
        }
        return list;
      };
    }

    // 3. 强制重新渲染
    if (typeof renderGrid === 'function') {
      renderGrid();
    }
  });
})();
