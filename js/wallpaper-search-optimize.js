/**
 * wallpaper-search-optimize.js v4
 * 功能：中文搜索使用子串精确匹配，英文使用 Fuse.js 模糊搜索。
 * 安全：独立模块，Append-Only。
 * 
 * 设计原则：
 * - 中文：逐字拆分，子串精确匹配（String.includes），OR 逻辑，按匹配字数排序
 * - 英文：Fuse.js 模糊搜索，支持拼写容错
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

  // 中文子串匹配：检查壁纸的所有文本字段是否包含关键词（精确匹配，非模糊）
  function textContains(wp, keyword) {
    const text = [
      wp.titleZh || '',
      wp.title || '',
      wp.categoryZh || '',
      wp.category || '',
      (wp.keywordsZh || []).join(' '),
      (wp.keywords || []).join(' '),
      wp.descriptionZh || '',
      wp.description || ''
    ].join(' ').toLowerCase();
    return text.includes(keyword.toLowerCase());
  }

  waitForData(function() {
    // 1. 初始化 Fuse (仅用于英文搜索)
    if (typeof Fuse !== 'undefined') {
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
        threshold: 0.35,
        ignoreLocation: true,
        distance: 1000,
        minMatchCharLength: 2
      });
    }

    // 2. 重写 getFiltered
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
          const isChinese = /[\u4e00-\u9fa5]/.test(searchQuery);

          if (isChinese) {
            // 【中文搜索】逐字拆分 + 子串精确匹配 + OR 逻辑 + 按匹配度排序
            const chars = searchQuery.trim().split('').filter(k => k.trim().length > 0);
            const uniqueChars = [...new Set(chars)];

            // 统计每个壁纸匹配了多少个字符
            let matchedItems = new Map();
            for (const char of uniqueChars) {
              for (const wp of list) {
                if (textContains(wp, char)) {
                  const id = wp.id;
                  if (matchedItems.has(id)) {
                    matchedItems.get(id).matchCount++;
                  } else {
                    matchedItems.set(id, { item: wp, matchCount: 1 });
                  }
                }
              }
            }

            // 按匹配字数降序排序
            list = [...matchedItems.values()]
              .sort((a, b) => b.matchCount - a.matchCount)
              .map(entry => entry.item);

          } else {
            // 【英文搜索】Fuse.js 模糊搜索
            if (typeof fuseInstance !== 'undefined' && fuseInstance) {
              const results = fuseInstance.search(searchQuery);
              const ids = new Set(results.map(r => r.item.id));
              list = list.filter(w => ids.has(w.id));
            }
          }
        }

        // Sort (无搜索时才按热门/最新排序)
        if (typeof searchQuery === 'undefined' || !searchQuery) {
          if (typeof activeSort !== 'undefined') {
            if (activeSort === 'popular') {
              list.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
            } else if (activeSort === 'newest') {
              list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
            }
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
