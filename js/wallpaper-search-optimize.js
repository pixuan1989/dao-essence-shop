/**
 * wallpaper-search-optimize.js v3
 * 功能：修复中文搜索匹配问题，采用 OR 逻辑 + 匹配度排序，确保用户输入任何词都能找到相关内容。
 * 安全：独立模块，Append-Only。
 * 
 * 设计原则：
 * - 中文逐字拆分，包含任意一字即匹配（OR 逻辑）
 * - 按匹配字数排序，匹配度高的排前面
 * - 英文保持按空格拆分，支持多词搜索
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
        threshold: 0.6,           // 提高阈值，增加召回率
        distance: 3000,           // 增加距离，允许更远距离匹配
        ignoreLocation: true,     // 忽略位置，全文搜索
        minMatchCharLength: 1
      });
    }

    // 2. 优化 getFiltered 逻辑
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
            const isChinese = /[\u4e00-\u9fa5]/.test(searchQuery);
            const keywords = isChinese
                ? searchQuery.trim().split('').filter(k => k.trim().length > 0) // 中文逐字拆分
                : searchQuery.trim().split(/\s+/).filter(k => k.length > 0);    // 英文按空格拆分

            // 去重
            const uniqueKeywords = [...new Set(keywords)];

            // 【核心逻辑】：OR 匹配 + 按匹配度排序
            // 对于每个壁纸，统计它匹配了多少个关键词，匹配越多越靠前
            let matchedItems = new Map(); // id -> { item, matchCount }

            for (const keyword of uniqueKeywords) {
              const results = fuseInstance.search(keyword);
              for (const result of results) {
                const id = result.item.id;
                if (matchedItems.has(id)) {
                  matchedItems.get(id).matchCount++;
                } else {
                  matchedItems.set(id, { item: result.item, matchCount: 1 });
                }
              }
            }

            // 转换为数组并按匹配度降序排序
            list = [...matchedItems.values()]
              .sort((a, b) => b.matchCount - a.matchCount)
              .map(entry => entry.item);
          }
        }

        // Sort (保持原有排序逻辑，但搜索结果的匹配度排序优先)
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
