// ============================================
// Product Management & Display System
// ============================================

let allProducts = [];
let currentFilter = 'all';
let currentSort = 'featured';

<<<<<<< HEAD
// Embedded product data — single source of truth for all pages
const embeddedProducts = {
  "products": [
    {
=======
// ============================================
// ⚙️ 折扣开关配置
// ============================================
// 设置为 true 显示折扣（原价、折扣标签）
// 设置为 false 隐藏折扣（只显示实际价格）
const SHOW_DISCOUNT = true;

// Embedded product data to avoid fetch issues with local files
const embeddedProducts = {
  "products": [
    {
      "id": "tai-sui-protection-token",
      "name": "Tai Sui Protection Token",
      "nameCN": "生肖守护令牌",
      "category": "protection-tokens",
      "element": "fire",
      "price": 170.00,
      "originalPrice": 200.00,
      "currency": "USD",
      "description": "Dragon Year protection token, hand-painted and traditionally prepared. Protects against annual misfortune.",
      "descriptionCN": "龙年保护吉祥物，由传统工艺师手绘和仪式激活。保护您免受年度不利。",
      "image": "images/ee9f06067bcdc66babb7cc1dfbc9d59ecef3fe912a602-hYOU5Z_fw1200webp.webp",
      "stock": 50,
      "benefits": ["Protection", "Annual Fortune", "Safety"],
      "energyLevel": "High",
      "hidden": true  // 临时隐藏，等审核通过后再显示
    },
    {
>>>>>>> 4b60e59884e9d39562508ca9d15e7b66127677ef
      "id": "obsidian-bracelet",
      "name": "Obsidian Bracelet",
      "nameCN": "黑曜石手链",
      "category": "crystals",
      "categoryCN": "晶体",
      "element": "water",
<<<<<<< HEAD
      "price": 180,
      "compareAtPrice": 200,
      "currency": "USD",
      "discount": 10,
      "description": "Natural obsidian bracelet for energy purification and spiritual protection. Calms the mind and supports mental clarity.",
=======
      "price": 180.00,
      "originalPrice": 200.00,
      "currency": "USD",
      "description": "Natural obsidian bracelet for energy purification and spiritual protection. Calms mind and supports mental clarity.",
>>>>>>> 4b60e59884e9d39562508ca9d15e7b66127677ef
      "descriptionCN": "天然黑曜石手链，用于能量净化和精神保护。平复心灵，支持思维清晰。",
      "image": "images/5c9b913900c6b04c7d5feeeba36403b233e42e895de36-P0zmjC_fw1200webp.webp",
      "images": [
        "images/5c9b913900c6b04c7d5feeeba36403b233e42e895de36-P0zmjC_fw1200webp.webp",
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&h=1200&fit=crop",
        "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=1200&h=1200&fit=crop"
      ],
      "stock": 80,
      "benefits": ["能量净化", "精神保护", "思维清晰"],
      "energyLevel": "Medium",
      "element_cn": "水",
      "suitable_for": ["运势不佳", "工作压力大", "夜梦多"]
    },
    {
      "id": "natural-agarwood",
      "name": "Natural Agarwood",
      "nameCN": "天然沉香",
      "category": "incense",
      "categoryCN": "香",
      "element": "wood",
<<<<<<< HEAD
      "price": 170,
      "compareAtPrice": 200,
      "currency": "USD",
      "discount": 15,
      "description": "Premium natural agarwood for meditation and academic success. Enhances concentration and intellectual clarity.",
=======
      "price": 170.00,
      "originalPrice": 200.00,
      "currency": "USD",
      "description": "Premium natural agarwood for meditation and academic focus. Supports concentration and mental clarity.",
>>>>>>> 4b60e59884e9d39562508ca9d15e7b66127677ef
      "descriptionCN": "用于冥想和学业的优质天然沉香。支持专注力和思维清晰。",
      "image": "images/efd651724cd482a4d5c81552b23cb20253ea84311d64e5-9twrMQ_fw1200webp.webp",
      "images": [
        "images/efd651724cd482a4d5c81552b23cb20253ea84311d64e5-9twrMQ_fw1200webp.webp",
        "https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=1200&h=1200&fit=crop",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=1200&fit=crop"
      ],
      "stock": 100,
      "benefits": ["提升专注力", "增强智慧", "学业顺利"],
      "energyLevel": "Medium",
      "element_cn": "木",
      "suitable_for": ["学生", "考试人群", "职场人士"]
    },
    {
      "id": "custom-protection-token",
      "name": "Custom Protection Token",
      "nameCN": "定制守护令牌",
<<<<<<< HEAD
      "category": "protection",
      "categoryCN": "保护令牌",
      "element": "earth",
      "price": 180,
      "compareAtPrice": 200,
      "currency": "USD",
      "discount": 10,
      "description": "Personalized protection token created based on your individual birth chart and life path analysis. Each item is uniquely activated for you.",
=======
      "category": "protection-tokens",
      "element": "earth",
      "price": 180.00,
      "originalPrice": 200.00,
      "currency": "USD",
      "description": "Personalized protection token created based on your individual birth chart and life path analysis. Each item is uniquely prepared for you.",
>>>>>>> 4b60e59884e9d39562508ca9d15e7b66127677ef
      "descriptionCN": "根据您的个人出生图表和生命路径分析创建的个性化守护令牌。每件都为您独特仪式激活。",
      "image": "images/08d5a4d436cd88b784060136ffdf1dde4be269a93235b-haaswB_fw1200webp.webp",
      "images": [
        "images/08d5a4d436cd88b784060136ffdf1dde4be269a93235b-haaswB_fw1200webp.webp",
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=1200&fit=crop",
        "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=1200&h=1200&fit=crop"
      ],
      "stock": 30,
<<<<<<< HEAD
      "benefits": ["个性化定制", "命运对齐", "专属能量"],
=======
      "benefits": ["Personalization", "Life Path Alignment", "Custom Energy"],
>>>>>>> 4b60e59884e9d39562508ca9d15e7b66127677ef
      "energyLevel": "Very High",
      "element_cn": "土",
      "suitable_for": ["本命年", "运势调整", "寻求改变"],
      "customizable": true
    }
  ]
};

// Load products from embedded data
async function loadProducts() {
    try {
        console.log('📦 Loading embedded products...');

        // Use embedded data instead of fetch to avoid local file access issues
        allProducts = embeddedProducts.products;

        // Make allProducts available globally for addToCart function
        window.allProducts = allProducts;

        console.log('✅ Products loaded successfully:', allProducts.length, 'items');
<<<<<<< HEAD
        
=======
        console.log('📦 Product data:', allProducts);

>>>>>>> 4b60e59884e9d39562508ca9d15e7b66127677ef
        renderShop();
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
}

// Filter products by category
function filterProducts(category) {
    currentFilter = category;

    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    renderShop();
}

// Sort products
function sortProducts(sortType) {
    currentSort = sortType;
    renderShop();
}

// Get filtered and sorted products
function getFilteredProducts() {
    let filtered = allProducts;

    // Apply hidden filter - hide products marked as hidden
    filtered = filtered.filter(p => !p.hidden);

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
}

// Calculate discount percentage
function calculateDiscount(original, current) {
    if (!original || !current || original <= current) return 0;
    return Math.round(((original - current) / original) * 100);
}

// Render shop products
function renderShop() {
    const filtered = getFilteredProducts();
    const grid = document.getElementById('productGrid');
<<<<<<< HEAD
    if (!grid) return;
    
    // Update product count
    const countEl = document.getElementById('productCount');
    if (countEl) countEl.textContent = filtered.length;
    
    grid.innerHTML = filtered.map(product => `
=======

    const categoryMap = {
        'crystals': '晶体',
        'incense': '香',
        'protection-tokens': '守护令牌',
        'talismans': '符咒',
        'ritual': '仪式用品'
    };

    // Update product count
    document.getElementById('productCount').textContent = filtered.length;

    grid.innerHTML = filtered.map(product => {
        const discount = SHOW_DISCOUNT && product.originalPrice ? calculateDiscount(product.originalPrice, product.price) : 0;
        const discountBadge = discount > 0 ? `<span class="discount-badge">${discount}% OFF</span>` : '';
        const priceDisplay = SHOW_DISCOUNT && product.originalPrice
            ? `
                <div class="price-container">
                    <span class="original-price">$${product.originalPrice.toFixed(2)}</span>
                    <span class="current-price">$${product.price.toFixed(2)}</span>
                </div>
              `
            : `<div class="product-price">$${product.price.toFixed(2)}</div>`;

        return `
>>>>>>> 4b60e59884e9d39562508ca9d15e7b66127677ef
        <a href="product-detail.html?id=${product.id}" class="shop-product-card" style="text-decoration: none; color: inherit; display: block;">
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.nameCN}" onerror="this.src='https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=600&fit=crop'">
                <div class="product-element">
                    <span class="element-badge">${product.element.toUpperCase()}</span>
                </div>
<<<<<<< HEAD
                ${product.discount ? `<div class="product-discount-badge">${product.discount}% OFF</div>` : ''}
            </div>
            <div class="product-info">
                <div class="product-category">${product.categoryCN || product.category}</div>
                <div class="product-title">${product.nameCN}</div>
                <div class="product-desc-short">${product.descriptionCN}</div>
                <div class="product-meta">
                    <div class="product-price-group">
                        ${product.compareAtPrice ? `<div class="product-price-original">${product.compareAtPrice}美元</div>` : ''}
                        <div class="product-price">${product.price}美元</div>
                    </div>
                    <div class="product-stock">库存: ${product.stock}</div>
                </div>
                <button class="add-to-cart-btn" onclick="event.preventDefault(); event.stopPropagation(); addToCart('${product.id}')">
                    🛒 加入购物车
=======
                ${discountBadge}
            </div>
            <div class="product-info">
                <div class="product-category">${categoryMap[product.category] || product.category}</div>
                <div class="product-title">${product.nameCN}</div>
                <div class="product-desc-short">${product.descriptionCN}</div>
                <div class="product-meta">
                    ${priceDisplay}
                    <div class="product-stock">Stock: ${product.stock}</div>
                </div>
                <button class="add-to-cart-btn" onclick="event.preventDefault(); event.stopPropagation(); addToCart('${product.id}')">
                    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right: 8px; vertical-align: middle;"><circle cx="9" cy="19" r="1"/><circle cx="17" cy="19" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L19 6H6"/></svg> Add to Cart
>>>>>>> 4b60e59884e9d39562508ca9d15e7b66127677ef
                </button>
            </div>
        </a>
    `;
    }).join('');
}

<<<<<<< HEAD
// Add style for shop product cards
=======
// Add style for add-to-cart button and discount display
>>>>>>> 4b60e59884e9d39562508ca9d15e7b66127677ef
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

    .add-to-cart-btn {
        width: 100%;
        padding: 12px 16px;
<<<<<<< HEAD
        background: var(--fire-primary, #8B1A1A);
        color: white;
=======
        background: var(--primary-color, #D4AF37);
        color: white !important;
>>>>>>> 4b60e59884e9d39562508ca9d15e7b66127677ef
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
    loadProducts();

    // Update cart prices with latest product prices
    setTimeout(() => {
        if (typeof cart !== 'undefined' && typeof cart.updatePrices === 'function') {
            console.log('Updating cart prices...');
            cart.updatePrices();
        }
    }, 500); // Wait for products to load
});
