/**
 * 商品列表页 - Shopify 数据对接
 * 
 * 功能：
 * - 从 Shopify 拉取商品列表
 * - 支持分类筛选
 * - 商品卡片渲染
 */

// ============================================
// 全局变量
// ============================================

let allProducts = [];
let filteredProducts = [];
let currentFilter = 'all';

// ============================================
// 初始化
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    // 加载 Shopify 配置
    await loadShopifyProducts();
    
    // 初始化筛选器
    initFilters();
    
    // 渲染商品列表
    renderProducts();
});

// ============================================
// 加载商品数据
// ============================================

async function loadShopifyProducts() {
    try {
        showLoading();
        
        // 从 Shopify 拉取所有商品
        allProducts = await getAllProducts();
        filteredProducts = [...allProducts];
        
        console.log('已加载商品数量:', allProducts.length);
        
        hideLoading();
    } catch (error) {
        console.error('加载商品失败:', error);
        showError('无法加载商品数据，请稍后重试');
        hideLoading();
    }
}

// ============================================
// 筛选功能
// ============================================

function initFilters() {
    // 绑定筛选按钮事件
    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterValue = this.getAttribute('data-filter');
            filterProducts(filterValue);
            
            // 更新按钮状态
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function filterProducts(filterValue) {
    currentFilter = filterValue;
    
    if (filterValue === 'all') {
        filteredProducts = [...allProducts];
    } else {
        // 根据 Shopify tags 或 productType 筛选
        filteredProducts = allProducts.filter(product => {
            return product.tags && product.tags.includes(filterValue) ||
                   product.productType === filterValue;
        });
    }
    
    renderProducts();
}

// ============================================
// 渲染商品列表
// ============================================

function renderProducts() {
    const container = document.getElementById('products-grid') || 
                      document.querySelector('.products-grid') ||
                      document.querySelector('.product-list');
    
    if (!container) {
        console.error('找不到商品容器元素');
        return;
    }
    
    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div class="no-products">
                <p>暂无商品</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
    
    // 绑定添加到购物车按钮
    bindAddToCartButtons();
}

function createProductCard(product) {
    const mainImage = getMainImage(product);
    const imageUrl = mainImage ? mainImage.url : 'images/placeholder.jpg';
    const imageAlt = mainImage ? mainImage.altText : product.title;
    
    const minPrice = product.priceRange.minVariantPrice.amount;
    const maxPrice = product.priceRange.maxVariantPrice.amount;
    const currency = product.priceRange.minVariantPrice.currencyCode;
    
    const priceDisplay = minPrice === maxPrice 
        ? formatPrice(minPrice, currency)
        : `${formatPrice(minPrice, currency)} - ${formatPrice(maxPrice, currency)}`;
    
    const isAvailable = product.availableForSale;
    const firstVariant = product.variants.edges[0]?.node;
    
    return `
        <div class="product-card ${!isAvailable ? 'sold-out' : ''}" data-product-handle="${product.handle}">
            <div class="product-image">
                <a href="product-detail.html?product=${product.handle}">
                    <img src="${imageUrl}" alt="${imageAlt}" loading="lazy">
                </a>
                ${!isAvailable ? '<span class="sold-out-badge">已售罄</span>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">
                    <a href="product-detail.html?product=${product.handle}">${product.title}</a>
                </h3>
                <p class="product-price">${priceDisplay}</p>
                <p class="product-description">${product.description?.substring(0, 100) || ''}...</p>
                
                <!-- 显示自定义字段示例 -->
                ${getMetafieldValue(product, 'material') ? `
                    <p class="product-meta">材质: ${getMetafieldValue(product, 'material')}</p>
                ` : ''}
                
                ${isAvailable && firstVariant ? `
                    <button class="add-to-cart-btn" data-variant-id="${firstVariant.id}" data-product-title="${product.title}">
                        加入购物车
                    </button>
                ` : `
                    <button class="add-to-cart-btn disabled" disabled>已售罄</button>
                `}
            </div>
        </div>
    `;
}

// ============================================
// 添加到购物车
// ============================================

function bindAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn:not(.disabled)');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const variantId = this.getAttribute('data-variant-id');
            const productTitle = this.getAttribute('data-product-title');
            
            try {
                this.textContent = '添加中...';
                this.disabled = true;
                
                const cartId = await getOrCreateCartId();
                await addToCart(cartId, variantId, 1);
                
                this.textContent = '已添加 ✓';
                updateCartBadge();
                
                setTimeout(() => {
                    this.textContent = '加入购物车';
                    this.disabled = false;
                }, 2000);
                
                showNotification(`${productTitle} 已添加到购物车`);
                
            } catch (error) {
                console.error('添加到购物车失败:', error);
                this.textContent = '添加失败';
                this.disabled = false;
                
                setTimeout(() => {
                    this.textContent = '加入购物车';
                }, 2000);
            }
        });
    });
}

// ============================================
// UI 辅助函数
// ============================================

function showLoading() {
    const container = document.getElementById('products-grid') || 
                      document.querySelector('.products-grid');
    if (container) {
        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>加载中...</p>
            </div>
        `;
    }
}

function hideLoading() {
    const spinner = document.querySelector('.loading-spinner');
    if (spinner) {
        spinner.remove();
    }
}

function showError(message) {
    const container = document.getElementById('products-grid') || 
                      document.querySelector('.products-grid');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                <button onclick="loadShopifyProducts()">重试</button>
            </div>
        `;
    }
}

function showNotification(message) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 25px;
        border-radius: 4px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 更新购物车徽章数量
async function updateCartBadge() {
    try {
        const cartId = localStorage.getItem('shopify_cart_id');
        if (!cartId) return;
        
        const cart = await getCart(cartId);
        const itemCount = cart.lines.edges.reduce((sum, edge) => sum + edge.node.quantity, 0);
        
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            badge.textContent = itemCount;
            badge.style.display = itemCount > 0 ? 'block' : 'none';
        }
    } catch (error) {
        console.error('更新购物车徽章失败:', error);
    }
}

// 添加 CSS 动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .loading-spinner {
        text-align: center;
        padding: 50px;
    }
    .spinner {
        width: 40px;
        height: 40px;
        margin: 0 auto 20px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
