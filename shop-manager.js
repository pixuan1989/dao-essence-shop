// ============================================
// Product Management & Display System
// ============================================

let allProducts = [];
let currentFilter = 'all';
let currentSort = 'featured';

// ============================================
// ⚙️ 折扣开关配置
// ============================================
// 设置为 true 显示折扣（原价、折扣标签）
// 设置为 false 隐藏折扣（只显示实际价格）
const SHOW_DISCOUNT = true;

// Creem products - from Creem.io backend
const embeddedProducts = {
  "products": [
    {
      "id": "prod_7i2asEAuHFHl5hJMeCEsfB",
      "creemId": "prod_7i2asEAuHFHl5hJMeCEsfB",
      "name": "Traditional Agarwood",
      "nameCN": "传统沉香",
      "category": "incense",
      "element": "wood",
      "price": 200.00,
      "currency": "USD",
      "description": "Fosters tranquility and restful sleep, clears away negativity, and enhances a positive, balanced state of being.",
      "descriptionCN": "促进宁静和安稳睡眠，清除负面情绪，增强积极、平衡的状态。",
      "image": "https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=600&h=600&fit=crop",
      "stock": 999,
      "benefits": ["Tranquility", "Sleep", "Positivity"],
      "energyLevel": "High",
      "creemUrl": "https://www.creem.io/payment/prod_7i2asEAuHFHl5hJMeCEsfB"
    },
    {
      "id": "prod_1YuuAVysoYK6AOmQVab2uR",
      "creemId": "prod_1YuuAVysoYK6AOmQVab2uR",
      "name": "Five Elements Energy Bracelet",
      "nameCN": "五行能量手串",
      "category": "crystals",
      "element": "water",
      "price": 168.00,
      "currency": "USD",
      "description": "Five elements energy bracelet with natural amber beads. Balances body energy and promotes harmony.",
      "descriptionCN": "天然琥珀珠五行能量手串。平衡身体能量，促进和谐。",
      "image": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop",
      "stock": 999,
      "benefits": ["Balance", "Harmony", "Energy"],
      "energyLevel": "Medium",
      "creemUrl": "https://www.creem.io/payment/prod_1YuuAVysoYK6AOmQVab2uR"
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
        console.log('📦 Product data:', allProducts);

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

    const categoryMap = {
        'crystals': '晶体',
        'incense': '香',
        'protection-tokens': '守护令牌',
        'talismans': '符咒',
        'ritual': '仪式用品'
    };

    // Update product count (only if element exists - for shop page compatibility)
    const productCountEl = document.getElementById('productCount');
    if (productCountEl) {
        productCountEl.textContent = filtered.length;
    }

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
        <a href="product-detail.html?id=${product.id}" class="shop-product-card" style="text-decoration: none; color: inherit; display: block;">
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.nameCN}" onerror="this.src='images/placeholder.png'">
                <div class="product-element">
                    <span class="element-badge">${product.element.toUpperCase()}</span>
                </div>
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
                </button>
            </div>
        </a>
    `;
    }).join('');
}

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
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .add-to-cart-btn:hover {
        background: var(--fire-light, #CD853F);
        transform: translateY(-2px);
        color: white !important;
    }

    .add-to-cart-btn svg {
        stroke: white !important;
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
