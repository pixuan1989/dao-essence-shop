// Amazon Affiliate Product Recommendations
// Universal script for all pages (except blog articles which use build-blog.js)

(function() {
    // Amazon 商品池 - 添加新商品只需在这里添加对象
    const AMAZON_PRODUCTS = [
        { name: 'Feng Shui Bracelet', nameZh: '风水手链', price: '$16.99', image: 'https://m.media-amazon.com/images/I/71vaNcAG5DL._AC_SL1500_.jpg', url: 'https://amzn.to/4wWIPSR', rating: '4.2', reviews: '1,730' },
        { name: 'Rider-Waite Tarot Deck', nameZh: '莱德韦特塔罗牌', price: '$15.50', image: 'https://m.media-amazon.com/images/I/51C-n5A3PiL._AC_SL1000_.jpg', url: 'https://amzn.to/4vEwzFp', rating: '4.8', reviews: '24,900' },
        { name: '7 Chakra Crystal Set', nameZh: '七脉轮水晶套装', price: '$14.99', image: 'https://m.media-amazon.com/images/I/81u2iZ8TctL._AC_SL1500_.jpg', url: 'https://amzn.to/4wXczix', rating: '4.7', reviews: '1,069' }
        // 添加新商品示例：
        // { name: 'New Product', nameZh: '新产品', price: '$19.99', image: 'https://...', url: 'https://...', rating: '4.5', reviews: '500' }
    ];
    
    // 配置：侧边栏显示几个商品
    const SIDEBAR_DISPLAY_COUNT = 2;
    // 配置：页面底部显示几个商品（0 = 全部）
    const BOTTOM_DISPLAY_COUNT = 0;

    const CSS = `
        .amazon-rec { margin: 2rem 0; padding: 1.5rem; background: linear-gradient(145deg, #2d2420, #1a1512); border: 1px solid rgba(212,175,55,0.2); border-radius: 12px; }
        .amazon-rec-title { font-family: var(--serif); font-size: 1rem; color: #d4af37; text-align: center; margin-bottom: 1rem; letter-spacing: 0.12em; text-transform: uppercase; }
        .amazon-rec-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        .amazon-rec-card { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 1rem; text-align: center; transition: transform 0.3s; }
        .amazon-rec-card:hover { transform: translateY(-4px); }
        .amazon-rec-card img { width: 100%; height: 150px; object-fit: contain; background: #fff; border-radius: 6px; padding: 0.5rem; margin-bottom: 0.75rem; }
        .amazon-rec-card h4 { font-size: 0.9rem; color: #f5e6d3; margin: 0 0 0.5rem; line-height: 1.3; }
        .amazon-rec-rating { display: flex; align-items: center; justify-content: center; gap: 0.3rem; margin-bottom: 0.5rem; }
        .amazon-rec-rating .stars { color: #d4af37; font-size: 0.8rem; }
        .amazon-rec-rating .count { font-size: 0.7rem; color: #999; }
        .amazon-rec-price { font-size: 1.1rem; font-weight: 700; color: #d4af37; margin-bottom: 0.75rem; }
        .amazon-rec-btn { display: inline-block; background: linear-gradient(135deg, #d4af37, #b8941f); color: #1a1512; font-weight: 700; font-size: 0.8rem; padding: 0.6rem 1.2rem; border-radius: 6px; text-decoration: none; transition: all 0.3s; }
        .amazon-rec-btn:hover { background: linear-gradient(135deg, #e5c048, #d4af37); transform: translateY(-2px); }
        /* Sidebar: vertical layout, no scroll */
        .bazi-sidebar .amazon-rec-grid { grid-template-columns: 1fr !important; gap: 0.75rem; }
        .bazi-sidebar .amazon-rec-card { padding: 0.75rem; }
        .bazi-sidebar .amazon-rec-card img { height: 120px; }
        @media (max-width: 768px) { .amazon-rec-grid { grid-template-columns: 1fr; } }
    `;

    function injectCSS() {
        if (document.getElementById('amazon-rec-css')) return;
        const style = document.createElement('style');
        style.id = 'amazon-rec-css';
        style.textContent = CSS;
        document.head.appendChild(style);
    }

    function renderAmazonRec(containerId, forceCount) {
        const recEl = document.getElementById(containerId);
        if (!recEl) return;
        injectCSS();
        const isZh = (window.DaoI18n && window.DaoI18n.current() === 'zh');
        const title = isZh ? '开运好物推荐' : 'Recommended for You';
        const btnText = isZh ? '查看详情' : 'View on Amazon';

        // Check if container is in sidebar
        const isSidebar = recEl.closest('.bazi-sidebar') !== null;
        const displayCount = forceCount || (isSidebar ? 2 : AMAZON_PRODUCTS.length);

        // Randomly select products
        let displayProducts = AMAZON_PRODUCTS;
        if (AMAZON_PRODUCTS.length > displayCount) {
            const shuffled = [...AMAZON_PRODUCTS].sort(() => Math.random() - 0.5);
            displayProducts = shuffled.slice(0, displayCount);
        }

        let html = '<div class="amazon-rec-title">' + title + '</div><div class="amazon-rec-grid">';
        displayProducts.forEach(function(p) {
            const displayName = isZh && p.nameZh ? p.nameZh : p.name;
            html += '<div class="amazon-rec-card">' +
                '<img src="' + p.image + '" alt="' + displayName + '" loading="lazy">' +
                '<h4>' + displayName + '</h4>' +
                '<div class="amazon-rec-rating"><span class="stars">★★★★★</span><span class="count">' + p.rating + ' (' + p.reviews + ')</span></div>' +
                '<div class="amazon-rec-price">' + p.price + '</div>' +
                '<a href="' + p.url + '" target="_blank" rel="nofollow sponsored" class="amazon-rec-btn">' + btnText + '</a>' +
                '</div>';
        });
        html += '</div>';
        recEl.innerHTML = html;
    }

    // Auto-render when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { renderAmazonRec('amazonRec'); });
    } else {
        renderAmazonRec('amazonRec');
    }

    // Export for manual re-render (e.g., after language switch)
    window.renderAmazonRec = renderAmazonRec;
})();
