// ============================================
// Product Management & Display System
// ============================================
// ⚠️ 注意：必须定义在全局作用域（window），否则外部脚本无法访问
window.allProducts = [];
let currentFilter = 'all';
let currentSort = 'featured';

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
                    <h3 style="color: var(--fire-primary);">Error Loading Products</h3>
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
    const filtered = window.getFilteredProducts();
    const grid = document.getElementById('productGrid');
    
    const categoryMap = {
        'bazi-analysis': (window.DaoI18n && window.DaoI18n.t('shop.filter_bazi')) || 'BaZi Analysis',
        'dao-meditation': (window.DaoI18n && window.DaoI18n.t('shop.filter_meditation')) || 'Taoist Meditation',
        'dao-readings': (window.DaoI18n && window.DaoI18n.t('shop.filter_readings')) || 'Taoist Readings',
        'mythology-stories': (window.DaoI18n && window.DaoI18n.t('shop.filter_mythology')) || 'Taoist Mythology',
        'cultivation-novels': (window.DaoI18n && window.DaoI18n.t('shop.filter_novels')) || 'Xianxia Novels'
    };

    // Update product count (only if element exists - for shop page compatibility)
    const productCountEl = document.getElementById('productCount');
    if (productCountEl) {
        productCountEl.textContent = filtered.length;
    }

    if (!grid) return;

    grid.innerHTML = filtered.map(product => {
        const discount = SHOW_DISCOUNT && product.originalPrice ? window.calculateDiscount(product.originalPrice, product.price) : 0;
        const discountBadge = discount > 0 ? `<span class="discount-badge">${discount}% OFF</span>` : '';
        
        const priceDisplay = SHOW_DISCOUNT && product.originalPrice
            ? `
                <div class="price-container">
                    <span class="original-price">$${product.originalPrice.toFixed(2)}</span>
                    <span class="current-price">$${product.price.toFixed(2)}</span>
                </div>
              `
            : `<div class="product-price">$${product.price.toFixed(2)}</div>`;

        // 为八字分析产品添加特殊处理
        const isBaziProduct = product.category === 'bazi-analysis' || product.id === 'bazi-analysis' || product.id === 'prod_28PqAKMEom5WGRH1w9O35n' || product.name.includes('BaZi') || product.name.includes('Bazi') || product.nameCN.includes('八字');
        const productLink = isBaziProduct ? 'bazi-form.html' : `product-detail.html?id=${product.id}`;

        return `
        <a href="${productLink}" class="shop-product-card" style="text-decoration: none; color: inherit; display: block;">
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.nameCN}" onerror="this.src='https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=600&fit=crop'">
                <!-- 五行标签已注释掉
                <div class="product-element">
                    <span class="element-badge">${product.element.toUpperCase()}</span>
                </div>
                -->
                ${discountBadge}
            </div>
            <div class="product-info">
                <div class="product-category">${categoryMap[product.category] || product.category}</div>
                <div class="product-title">${product.nameCN}</div>
                <div class="product-desc-short" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-overflow:ellipsis;">${product.descriptionCN}</div>
                <div class="product-meta">
                    ${priceDisplay}
                </div>
                <div class="product-action-hint">${isBaziProduct ? ((window.DaoI18n && window.DaoI18n.t('shop.get_analysis')) || 'Get Analysis →') : ((window.DaoI18n && window.DaoI18n.t('shop.view_details')) || 'Click to view details →')}</div>
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
document.addEventListener('DOMContentLoaded', () => {
    console.log('shop-manager.js loaded');
    // Wait a bit for creem-sync-v2.js to load
    setTimeout(() => {
        window.loadProducts();
    }, 500);
    
    // Update cart prices with latest product prices
    setTimeout(() => {
        if (typeof cart !== 'undefined' && typeof cart.updatePrices === 'function') {
            console.log('Updating cart prices...');
            cart.updatePrices();
        }
    }, 1500); // Wait for products to load

    // Re-render products when language changes
    document.addEventListener('daoessence:i18n-changed', () => {
        if (typeof window.renderShop === 'function') {
            window.renderShop();
        }
    });
});
