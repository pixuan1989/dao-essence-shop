// ============================================
// Product Management & Display System
// ============================================

let allProducts = [];
let currentFilter = 'all';
let currentSort = 'featured';

// Embedded product data to avoid fetch issues with local files
const embeddedProducts = {
  "products": [
    {
      "id": "tai-sui-protection-token",
      "name": "Tai Sui Protection Token",
      "nameCN": "生肖守护令牌",
      "category": "protection-tokens",
      "element": "fire",
      "price": 17.92,
      "currency": "USD",
      "description": "Dragon Year protection token, hand-painted and traditionally prepared. Protects against annual misfortune.",
      "descriptionCN": "龙年保护吉祥物，由传统工艺师手绘和仪式激活。保护您免受年度不利。",
      "image": "images/ee9f06067bcdc66babb7cc1dfbc9d59ecef3fe912a602-hYOU5Z_fw1200webp.webp",
      "stock": 50,
      "benefits": ["Protection", "Annual Fortune", "Safety"],
      "energyLevel": "High"
    },
    {
      "id": "obsidian-bracelet",
      "name": "Obsidian Bracelet",
      "nameCN": "黑曜石手链",
      "category": "crystals",
      "element": "water",
      "price": 12.32,
      "currency": "USD",
      "description": "Natural obsidian bracelet for energy purification and spiritual protection. Calms the mind and enhances clarity.",
      "descriptionCN": "天然黑曜石手链，用于能量净化和精神保护。平复心灵，增强清晰度。",
      "image": "images/5c9b913900c6b04c7d5feeeba36403b233e42e895de36-P0zmjC_fw1200webp.webp",
      "stock": 80,
      "benefits": ["Purification", "Protection", "Mental Clarity"],
      "energyLevel": "Medium"
    },
    {
      "id": "natural-agarwood",
      "name": "Natural Agarwood",
      "nameCN": "天然沉香",
      "category": "incense",
      "element": "wood",
      "price": 9.52,
      "currency": "USD",
      "description": "Premium natural agarwood for meditation and academic success. Enhances concentration and intellectual clarity.",
      "descriptionCN": "用于冥想和学业成功的优质天然沉香。增强专注力和智力清晰度。",
      "image": "images/efd651724cd482a4d5c81552b23cb20253ea84311d64e5-9twrMQ_fw1200webp.webp",
      "stock": 100,
      "benefits": ["Meditation", "Academic Success", "Concentration"],
      "energyLevel": "Medium"
    },
    {
      "id": "custom-protection-token",
      "name": "Custom Protection Token",
      "nameCN": "定制守护令牌",
      "category": "protection-tokens",
      "element": "earth",
      "price": 54.32,
      "currency": "USD",
      "description": "Personalized protection token created based on your individual birth chart and life path analysis. Each item is uniquely prepared for you.",
      "descriptionCN": "根据您的个人出生图表和生命路径分析创建的个性化守护令牌。每件都为您独特仪式激活。",
      "image": "images/08d5a4d436cd88b784060136ffdf1dde4be269a93235b-haaswB_fw1200webp.webp",
      "stock": 30,
      "benefits": ["Personalization", "Life Path Alignment", "Custom Energy"],
      "energyLevel": "Very High",
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
    
    // Update product count
    document.getElementById('productCount').textContent = filtered.length;
    
    grid.innerHTML = filtered.map(product => `
        <a href="product-detail.html?id=${product.id}" class="shop-product-card" style="text-decoration: none; color: inherit; display: block;">
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.nameCN}" onerror="this.src='images/placeholder.png'">
                <div class="product-element">
                    <span class="element-badge">${product.element.toUpperCase()}</span>
                </div>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <div class="product-title">${product.nameCN}</div>
                <div class="product-desc-short">${product.descriptionCN}</div>
                <div class="product-meta">
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <div class="product-stock">Stock: ${product.stock}</div>
                </div>
                <button class="add-to-cart-btn" onclick="event.preventDefault(); event.stopPropagation(); addToCart('${product.id}')">
                    🛒 Add to Cart
                </button>
            </div>
        </a>
    `).join('');
}

// Add style for add-to-cart button
const style = document.createElement('style');
style.textContent = `
    .add-to-cart-btn {
        width: 100%;
        padding: 12px 16px;
        background: var(--primary-color, #D4AF37);
        color: var(--bg-dark, #1A1612);
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
    }
`;
document.head.appendChild(style);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('shop-manager.js loaded');
    loadProducts();
});
