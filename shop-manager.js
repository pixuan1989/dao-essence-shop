// ============================================
// Product Management & Display System
// ============================================

let allProducts = [];
let currentFilter = 'all';
let currentSort = 'featured';

// Embedded product data — single source of truth for all pages
const embeddedProducts = {
  "products": [
    {
      "id": "obsidian-bracelet",
      "name": "Obsidian Bracelet",
      "nameCN": "黑曜石手链",
      "category": "crystals",
      "categoryCN": "晶体",
      "element": "water",
      "price": 180,
      "compareAtPrice": 200,
      "currency": "USD",
      "discount": 10,
      "description": "Natural obsidian bracelet for energy purification and spiritual protection. Calms the mind and supports mental clarity.",
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
      "price": 170,
      "compareAtPrice": 200,
      "currency": "USD",
      "discount": 15,
      "description": "Premium natural agarwood for meditation and academic success. Enhances concentration and intellectual clarity.",
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
      "category": "protection",
      "categoryCN": "保护令牌",
      "element": "earth",
      "price": 180,
      "compareAtPrice": 200,
      "currency": "USD",
      "discount": 10,
      "description": "Personalized protection token created based on your individual birth chart and life path analysis. Each item is uniquely activated for you.",
      "descriptionCN": "根据您的个人出生图表和生命路径分析创建的个性化守护令牌。每件都为您独特仪式激活。",
      "image": "images/08d5a4d436cd88b784060136ffdf1dde4be269a93235b-haaswB_fw1200webp.webp",
      "images": [
        "images/08d5a4d436cd88b784060136ffdf1dde4be269a93235b-haaswB_fw1200webp.webp",
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=1200&fit=crop",
        "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=1200&h=1200&fit=crop"
      ],
      "stock": 30,
      "benefits": ["个性化定制", "命运对齐", "专属能量"],
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

// Render shop products
function renderShop() {
    const filtered = getFilteredProducts();
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    
    // Update product count
    const countEl = document.getElementById('productCount');
    if (countEl) countEl.textContent = filtered.length;
    
    grid.innerHTML = filtered.map(product => `
        <a href="product-detail.html?id=${product.id}" class="shop-product-card" style="text-decoration: none; color: inherit; display: block;">
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.nameCN}" onerror="this.src='https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=600&fit=crop'">
                <div class="product-element">
                    <span class="element-badge">${product.element.toUpperCase()}</span>
                </div>
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
                </button>
            </div>
        </a>
    `).join('');
}

// Add style for shop product cards
const style = document.createElement('style');
style.textContent = `
    .add-to-cart-btn {
        width: 100%;
        padding: 12px 16px;
        background: var(--fire-primary, #8B1A1A);
        color: white;
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
});
