const SHOW_WALLPAPER_GIFT_PROMO = true;
﻿// ============================================
// Product Management & Display System
// ============================================
// ⚠️ 注意：必须定义在全局作用域（window），否则外部脚本无法访问
window.allProducts = [];
let currentFilter = 'all';
let currentSort = 'featured';

// 移动端图片优化：根据屏幕宽度返回合适的图片URL
// ============================================
// i18n helper: fallback when translation key not found
// DaoI18n.t() returns the key itself when translation is missing,
// so `||` fallback never triggers. This helper checks explicitly.
// ============================================
function _t(key, fallback) {
  if (!window.DaoI18n) return fallback;
  var val = window.DaoI18n.t(key);
  return (val !== null && val !== key) ? val : fallback;
}

function getOptimizedImageUrl(url, maxWidth) {
  if (!url) return url;
  if (url.startsWith('/')) return url; // 本地图片不处理
  // 改版回归修复：只对我们自己的 OSS/域名追加 Imgix 风格优化参数；
  // 远程图床(Creem/S3，常为带签名 URL)追加 ?width=&quality= 会破坏签名→破图，故原样返回
  if (url.includes('daoessentia') || url.includes('aliyuncs') || url.includes('oss-')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${maxWidth}&quality=80`;
  }
  return url;
}

function getShopImageSize() {
  const w = window.innerWidth;
  if (w <= 480) return 400;   // 手机
  if (w <= 768) return 600;   // 平板
  return 800;                  // PC
}

// ============================================

// ============================================
// ⚙️ 折扣开关配置
// ============================================
// 设置为 true 显示折扣（原价、折扣标签）
// 设置为 false 隐藏折扣（只显示实际价格）
const SHOW_DISCOUNT = true;

// Load products from Creem API via creem-sync-v2.js
window.loadProducts = async function() {
    try {
        console.log('📦 Loading products from Creem API...');
        // Wait for creem-sync-v2.js to populate window.allProducts
        if (typeof window.allProducts !== 'undefined' && window.allProducts.length > 0) {
            console.log('✅ Products loaded successfully from Creem API:', window.allProducts.length, 'items');
            // Filter out non-shop products (e.g. almanac unlock)
            window.allProducts = window.allProducts.filter(p => p.id !== 'prod_3fJInBNekM9UVJwtClgUtx');
            console.log('🛒 Shop products after filter:', window.allProducts.length, 'items');
        } else {
            // Fallback: wait a bit and check again
            setTimeout(() => {
                if (typeof window.allProducts !== 'undefined' && window.allProducts.length > 0) {
                    console.log('✅ Products loaded successfully from Creem API (delayed):', window.allProducts.length, 'items');
                    window.allProducts = window.allProducts.filter(p => p.id !== 'prod_3fJInBNekM9UVJwtClgUtx');
                    window.renderShop();
                } else {
                    console.warn('⚠️ No products from Creem API, using empty array');
                    window.allProducts = [];
                    window.renderShop();
                }
            }, 1000);
            return;
        }
        window.renderShop();
    } catch (error) {
        console.error('❌ Error loading products:', error);
        const grid = document.getElementById('productGrid');
        if (grid) {
            grid.innerHTML = `
                <div style="color: #e74c3c; padding: 40px; text-align: center; background: var(--bg-accent); border-radius: 8px;">
                    <h3 style="color: var(--fire-primary);">${_t('shop.error_loading', 'Error Loading Products')}</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
};

// Filter products by category
window.filterProducts = function(category) {
    currentFilter = category;
    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    }
    window.renderShop();
};

// Sort products
window.sortProducts = function(sortType) {
    currentSort = sortType;
    window.renderShop();
};

// Get filtered and sorted products
window.getFilteredProducts = function() {
    let filtered = window.allProducts;
    // Apply hidden filter - hide products marked as hidden
    filtered = filtered.filter(p => p.hidden !== true);
    // Apply filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(p => p.category === currentFilter);
    }
    // Apply sort
    switch (currentSort) {
        case 'price-low':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
            filtered.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
            break;
        case 'featured':
        default:
            // Keep original order
            break;
    }
    return filtered;
};

// Calculate discount percentage
window.calculateDiscount = function(original, current) {
    if (!original || !current || original <= current) return 0;
    return Math.round(((original - current) / original) * 100);
};

// Render shop products
window.renderShop = function() {
    // 防重入：同帧内不重复渲染（RAIC 风格，只防微任务重复，不防事件触发）
    if (window._renderShopPending) return;
    window._renderShopPending = true;
    requestAnimationFrame(function() {
        window._renderShopPending = false;
        _doRenderShop();
    });
};

function _doRenderShop() {
    // 如果产品还没加载完，跳过渲染（保留骨架屏）
    if (!window.__CREEM_PRODUCTS_READY__ && window.allProducts.length === 0) return;

    const filtered = window.getFilteredProducts();
    const grid = document.getElementById('productGrid');
    
    const categoryMap = {
        'bazi-analysis': _t('shop.filter_bazi', 'BaZi Analysis'),
        'dao-meditation': _t('shop.filter_meditation', 'Taoist Meditation'),
        'dao-readings': _t('shop.filter_readings', 'Taoist Readings'),
        'mythology-stories': _t('shop.filter_mythology', 'Taoist Mythology'),
        'cultivation-novels': _t('shop.filter_novels', 'Xianxia Novels')
    };

    // Update product count (only if element exists - for shop page compatibility)
    const productCountEl = document.getElementById('productCount');
    if (productCountEl) {
        productCountEl.textContent = filtered.length;
    }

    if (!grid) return;

    grid.innerHTML = filtered.map((product, index) => {
        const discount = SHOW_DISCOUNT && product.originalPrice ? window.calculateDiscount(product.originalPrice, product.price) : 0;
        const discountText = discount > 0 ? _t('shop.discount_off', 'OFF') : '';
        const discountBadge = discount > 0 ? `<span class="discount-badge">${discount}${discountText}</span>` : '';
        
        const priceDisplay = SHOW_DISCOUNT && product.originalPrice
            ? `
                <div class="price-container">
                    <span class="original-price">$${product.originalPrice.toFixed(2)}</span>
                    <span class="current-price">$${product.price.toFixed(2)}</span>
                </div>
              `
            : `<div class="product-price">$${product.price.toFixed(2)}</div>`;

        // 盲派课程：与标准详情页统一，深度文案内嵌于 product-detail 的 #courseRichContent 区块
        const isBlindCourse = product.id === 'prod_644bQm6EUmBGSNkaHZ02IE';
        // 八字相关（含报告服务及其他八字类产品）→ 跳八字排盘表单
        const isBaziProduct = !isBlindCourse && (
            product.category === 'bazi-analysis' ||
            product.id === 'prod_28PqAKMEom5WGRH1w9O35n' ||
            product.name.includes('BaZi') ||
            product.name.includes('Bazi') ||
            (product.nameCN && product.nameCN.includes('八字'))
        );
        // 课程与通用商品均走标准详情页；八字报告服务走排盘表单
        const productLink = isBlindCourse ? `/product-detail?id=${product.id}` : (isBaziProduct ? '/bazi-form' : `/product-detail?id=${product.id}`);

        const isZh = window.DaoI18n && window.DaoI18n.current() === 'zh';
    const giftBadge = (isBaziProduct && SHOW_WALLPAPER_GIFT_PROMO) ? `<span class="gift-badge">${isZh ? '赠壁纸' : '+Wallpapers'}</span>` : '';
    const displayName = (isZh && product.nameCN) ? product.nameCN : (product.nameEN || product.name);
    const displayDesc = (isZh && product.descriptionCN) ? product.descriptionCN : (product.descriptionEN || product.description);

    return `
        <a href="${productLink}" class="shop-product-card" style="text-decoration: none; color: inherit; display: block; animation-delay: ${index * 60}ms;">
            <div class="product-image-wrapper">
                <img src="${getOptimizedImageUrl(product.image, getShopImageSize())}" alt="${displayName}" loading="${index < 6 ? 'eager' : 'lazy'}" decoding="async" onload="this.parentElement.classList.add('loaded')" style="min-height:200px;" onerror="this.src='/images/og-default.jpg';this.parentElement.classList.add('loaded')">
                <!-- 五行标签已注释掉
                <div class="product-element">
                    <span class="element-badge">${product.element.toUpperCase()}</span>
                </div>
                -->
                ${discountBadge}
                ${giftBadge}
            </div>
            <div class="product-info">
                <div class="product-category">${categoryMap[product.category] || product.category}</div>
                <div class="product-title">${displayName}</div>
                <div class="product-desc-short" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-overflow:ellipsis;">${displayDesc}</div>
                <div class="product-meta">
                    ${priceDisplay}
                </div>
                <div class="product-action-hint">${isBaziProduct ? _t('shop.get_analysis', 'Get Analysis →') : _t('shop.view_details', 'Click to view details →')}</div>
            </div>
        </a>
    `;
    }).join('');
};

// Add style for add-to-cart button and discount display
const style = document.createElement('style');
style.textContent = `
    /* 折扣标签样式 */
    .discount-badge {
        position: absolute;
        top: 15px;
        right: 15px;
        background: #e74c3c;
        color: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        z-index: 10;
        box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
    }

    /* 赠品标签 - 广告条感，深色底金字高对比，确保在图片上清晰可读 */
    .gift-badge {
        position: absolute;
        top: 15px;
        left: 15px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: rgba(26, 20, 8, 0.82);
        color: #D4AF37;
        border: 1px solid rgba(212, 175, 55, 0.55);
        padding: 4px 10px 4px 8px;
        border-radius: 5px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.06em;
        z-index: 10;
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
    }
    .gift-badge::before {
        content: '';
        display: inline-block;
        width: 5px;
        height: 5px;
        background: #D4AF37;
        border-radius: 50%;
        box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.25);
    }

    /* 价格容器 */
    .price-container {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }

    /* 原价样式 */
    .original-price {
        font-size: 14px;
        color: #8B8070;
        text-decoration: line-through;
        font-weight: 400;
    }

    /* 现价样式 */
    .current-price {
        font-size: 22px;
        font-weight: 600;
        color: var(--fire-primary, #8B2500);
    }

    /* 点击查看详情提示 */
    .product-action-hint {
        width: 100%;
        padding: 10px 16px;
        text-align: center;
        background: rgba(212, 175, 55, 0.08);
        border: 1px solid rgba(212, 175, 55, 0.15);
        border-radius: var(--radius-sm, 8px);
        font-size: 13px;
        color: var(--primary-color, #D4AF37);
        letter-spacing: 0.05em;
        margin-top: 12px;
        transition: all var(--transition-fast, 0.2s);
    }

    .shop-product-card:hover .product-action-hint {
        background: var(--primary-color, #D4AF37);
        color: white;
        border-color: var(--primary-color, #D4AF37);
    }

    .add-to-cart-btn {
        width: 100%;
        padding: 12px 16px;
        background: var(--primary-color, #D4AF37);
        color: white !important;
        border: none;
        border-radius: var(--radius-sm, 8px);
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all var(--transition-fast, 0.2s);
        letter-spacing: 0.05em;
        margin-top: 10px;
    }

    .add-to-cart-btn:hover {
        background: var(--fire-dark, #6B0F0F);
        transform: translateY(-2px);
        color: white !important;
    }

    .add-to-cart-btn svg {
        stroke: white !important;
    }

    .product-discount-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background: var(--fire-primary, #8B1A1A);
        color: white;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 700;
        z-index: 2;
    }

    .product-image-wrapper {
        position: relative;
        overflow: hidden;
    }

    .product-price-group {
        display: flex;
        flex-direction: column;
    }

    .product-price-original {
        font-size: 13px;
        color: var(--text-muted, #999);
        text-decoration: line-through;
    }

    .product-price {
        font-size: 18px;
        font-weight: 700;
        color: var(--fire-primary, #8B1A1A);
    }
`;
document.head.appendChild(style);

// Initialize on page load
// 产品渲染由 shop.html 中的 initializeShop() 统一触发，避免重复加载
setTimeout(() => {
    if (typeof cart !== 'undefined' && typeof cart.updatePrices === 'function') {
        console.log('Updating cart prices...');
        cart.updatePrices();
    }
}, 1500); // Wait for products to load

// Re-render products when language changes (only if products are already loaded)
document.addEventListener('daoessence:i18n-changed', () => {
    if (typeof window.renderShop === 'function' && window.__CREEM_PRODUCTS_READY__) {
        window.renderShop();
    }
});
