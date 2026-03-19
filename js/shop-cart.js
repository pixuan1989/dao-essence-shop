/**
 * 购物车页 - Shopify Cart API 对接
 * 
 * 功能：
 * - 显示购物车商品列表
 * - 修改商品数量
 * - 移除商品
 * - 计算总价
 * - 跳转结账
 */

// ============================================
// 全局变量
// ============================================

let currentCart = null;

// ============================================
// 初始化
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    await loadCart();
});

// ============================================
// 加载购物车
// ============================================

async function loadCart() {
    try {
        showLoading();
        
        const cartId = localStorage.getItem('shopify_cart_id');
        
        if (!cartId) {
            showEmptyCart();
            return;
        }
        
        currentCart = await getCart(cartId);
        
        if (!currentCart || !currentCart.lines || currentCart.lines.edges.length === 0) {
            showEmptyCart();
            return;
        }
        
        console.log('购物车数据:', currentCart);
        
        renderCart();
        updateCartSummary();
        
        hideLoading();
        
    } catch (error) {
        console.error('加载购物车失败:', error);
        showError('无法加载购物车');
        hideLoading();
    }
}

// ============================================
// 渲染购物车
// ============================================

function renderCart() {
    const cartContainer = document.querySelector('.cart-items') ||
                           document.getElementById('cart-items') ||
                           document.querySelector('.cart-list');
    if (!cartContainer) return;
    
    const items = currentCart.lines.edges;
    
    cartContainer.innerHTML = items.map(edge => {
        const item = edge.node;
        const variant = item.merchandise;
        const product = variant.product;
        
        return `
            <div class="cart-item" data-line-id="${item.id}" data-variant-id="${variant.id}">
                <div class="item-image">
                    <a href="product-detail.html?product=${product.handle}">
                        <img src="${variant.image?.url || 'images/placeholder.jpg'}" 
                             alt="${variant.image?.altText || product.title}">
                    </a>
                </div>
                <div class="item-details">
                    <h3 class="item-title">
                        <a href="product-detail.html?product=${product.handle}">${product.title}</a>
                    </h3>
                    ${variant.title !== 'Default Title' ? `
                        <p class="item-variant">${variant.title}</p>
                    ` : ''}
                    <p class="item-price">${formatPrice(variant.price.amount, variant.price.currencyCode)}</p>
                </div>
                <div class="item-quantity">
                    <button class="qty-btn qty-minus" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">
                        −
                    </button>
                    <input type="number" 
                           class="qty-input" 
                           value="${item.quantity}" 
                           min="1" 
                           onchange="updateQuantity('${item.id}', parseInt(this.value))"
                           onblur="updateQuantity('${item.id}', parseInt(this.value))">
                    <button class="qty-btn qty-plus" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">
                        +
                    </button>
                </div>
                <div class="item-total">
                    <p class="total-price">${formatPrice(variant.price.amount * item.quantity, variant.price.currencyCode)}</p>
                </div>
                <div class="item-actions">
                    <button class="remove-btn" onclick="removeItem('${item.id}')" title="移除商品">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// 更新商品数量
// ============================================

async function updateQuantity(lineId, newQuantity) {
    if (newQuantity < 1) {
        if (confirm('确定要移除该商品吗？')) {
            await removeItem(lineId);
        }
        return;
    }
    
    try {
        const cartId = localStorage.getItem('shopify_cart_id');
        
        showUpdating();
        
        currentCart = await updateCartLine(cartId, lineId, newQuantity);
        
        renderCart();
        updateCartSummary();
        updateCartBadge();
        
        hideUpdating();
        
    } catch (error) {
        console.error('更新数量失败:', error);
        showError('更新失败，请重试');
        hideUpdating();
    }
}

// ============================================
// 移除商品
// ============================================

async function removeItem(lineId) {
    try {
        const cartId = localStorage.getItem('shopify_cart_id');
        
        showUpdating();
        
        currentCart = await removeFromCart(cartId, [lineId]);
        
        if (!currentCart || currentCart.lines.edges.length === 0) {
            showEmptyCart();
        } else {
            renderCart();
            updateCartSummary();
            updateCartBadge();
        }
        
        hideUpdating();
        showNotification('商品已移除');
        
    } catch (error) {
        console.error('移除商品失败:', error);
        showError('移除失败，请重试');
        hideUpdating();
    }
}

// ============================================
// 清空购物车
// ============================================

async function clearCart() {
    if (!confirm('确定要清空购物车吗？')) return;
    
    try {
        const cartId = localStorage.getItem('shopify_cart_id');
        const lineIds = currentCart.lines.edges.map(edge => edge.node.id);
        
        showUpdating();
        
        await removeFromCart(cartId, lineIds);
        
        showEmptyCart();
        updateCartBadge();
        
        hideUpdating();
        showNotification('购物车已清空');
        
    } catch (error) {
        console.error('清空购物车失败:', error);
        showError('操作失败，请重试');
        hideUpdating();
    }
}

// ============================================
// 购物车摘要
// ============================================

function updateCartSummary() {
    if (!currentCart) return;
    
    const subtotalEl = document.querySelector('.cart-subtotal') ||
                        document.getElementById('cart-subtotal');
    const taxEl = document.querySelector('.cart-tax') ||
                   document.getElementById('cart-tax');
    const totalEl = document.querySelector('.cart-total') ||
                     document.getElementById('cart-total');
    const itemCountEl = document.querySelector('.cart-item-count') ||
                         document.getElementById('cart-item-count');
    
    const subtotal = currentCart.cost.subtotalAmount;
    const tax = currentCart.cost.totalTaxAmount;
    const total = currentCart.cost.totalAmount;
    
    const itemCount = currentCart.lines.edges.reduce((sum, edge) => sum + edge.node.quantity, 0);
    
    if (subtotalEl) {
        subtotalEl.textContent = formatPrice(subtotal.amount, subtotal.currencyCode);
    }
    
    if (taxEl) {
        taxEl.textContent = tax ? formatPrice(tax.amount, tax.currencyCode) : '$0.00';
    }
    
    if (totalEl) {
        totalEl.textContent = formatPrice(total.amount, total.currencyCode);
    }
    
    if (itemCountEl) {
        itemCountEl.textContent = `${itemCount} 件商品`;
    }
}

// ============================================
// 结账
// ============================================

async function proceedToCheckout() {
    if (!currentCart || currentCart.lines.edges.length === 0) {
        alert('购物车是空的');
        return;
    }
    
    try {
        const checkoutBtn = document.querySelector('.checkout-btn') ||
                             document.getElementById('checkout-btn');
        
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.textContent = '处理中...';
        }
        
        // 保存买家信息到购物车（如果页面有表单）
        const emailInput = document.querySelector('input[name="email"]') ||
                           document.getElementById('customer-email');
        
        if (emailInput && emailInput.value) {
            await updateCartBuyerIdentity(currentCart.id, emailInput.value, 'US');
        }
        
        // 跳转到 Shopify 结账页面
        const checkoutUrl = currentCart.checkoutUrl;
        
        if (checkoutUrl) {
            window.location.href = checkoutUrl;
        } else {
            throw new Error('无法获取结账链接');
        }
        
    } catch (error) {
        console.error('跳转结账失败:', error);
        showError('无法跳转到结账页面，请重试');
        
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = '去结账';
        }
    }
}

// ============================================
// 继续购物
// ============================================

function continueShopping() {
    window.location.href = 'shop.html';
}

// ============================================
// UI 辅助函数
// ============================================

function showLoading() {
    const container = document.querySelector('.cart-items') ||
                      document.getElementById('cart-items');
    if (container) {
        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>加载购物车...</p>
            </div>
        `;
    }
}

function hideLoading() {
    const spinner = document.querySelector('.loading-spinner');
    if (spinner) spinner.remove();
}

function showUpdating() {
    const container = document.querySelector('.cart-items');
    if (container) {
        container.style.opacity = '0.6';
        container.style.pointerEvents = 'none';
    }
}

function hideUpdating() {
    const container = document.querySelector('.cart-items');
    if (container) {
        container.style.opacity = '1';
        container.style.pointerEvents = 'auto';
    }
}

function showEmptyCart() {
    const container = document.querySelector('.cart-container') ||
                      document.querySelector('main') ||
                      document.body;
    
    container.innerHTML = `
        <div class="empty-cart">
            <div class="empty-cart-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"></path>
                </svg>
            </div>
            <h2>购物车是空的</h2>
            <p>您还没有添加任何商品</p>
            <a href="shop.html" class="continue-shopping-btn">去购物</a>
        </div>
    `;
    
    const emptyCartStyle = document.createElement('style');
    emptyCartStyle.textContent = `
        .empty-cart {
            text-align: center;
            padding: 80px 20px;
        }
        .empty-cart-icon {
            color: #ccc;
            margin-bottom: 20px;
        }
        .empty-cart h2 {
            margin-bottom: 10px;
            color: #333;
        }
        .empty-cart p {
            color: #666;
            margin-bottom: 30px;
        }
        .continue-shopping-btn {
            display: inline-block;
            padding: 12px 40px;
            background: #000;
            color: #fff;
            text-decoration: none;
            border-radius: 4px;
            transition: background 0.3s;
        }
        .continue-shopping-btn:hover {
            background: #333;
        }
    `;
    document.head.appendChild(emptyCartStyle);
}

function showError(message) {
    const container = document.querySelector('.cart-items') ||
                      document.querySelector('.cart-container');
    if (container) {
        const errorEl = document.createElement('div');
        errorEl.className = 'cart-error';
        errorEl.textContent = message;
        errorEl.style.cssText = `
            background: #fee;
            color: #c00;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        `;
        container.insertBefore(errorEl, container.firstChild);
        
        setTimeout(() => errorEl.remove(), 5000);
    }
}

function showNotification(message) {
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

async function updateCartBadge() {
    try {
        const cartId = localStorage.getItem('shopify_cart_id');
        if (!cartId) {
            const badge = document.querySelector('.cart-badge');
            if (badge) badge.style.display = 'none';
            return;
        }
        
        const cart = await getCart(cartId);
        const itemCount = cart?.lines?.edges?.reduce((sum, edge) => sum + edge.node.quantity, 0) || 0;
        
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            badge.textContent = itemCount;
            badge.style.display = itemCount > 0 ? 'block' : 'none';
        }
    } catch (error) {
        console.error('更新购物车徽章失败:', error);
    }
}

// 添加动画样式
const cartStyles = document.createElement('style');
cartStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .cart-item {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 20px;
        border-bottom: 1px solid #eee;
    }
    
    .item-image {
        width: 100px;
        flex-shrink: 0;
    }
    
    .item-image img {
        width: 100%;
        height: auto;
        border-radius: 4px;
    }
    
    .item-details {
        flex: 1;
    }
    
    .item-title a {
        color: #333;
        text-decoration: none;
        font-weight: 500;
    }
    
    .item-title a:hover {
        text-decoration: underline;
    }
    
    .item-variant {
        color: #666;
        font-size: 14px;
        margin: 5px 0;
    }
    
    .item-price {
        color: #333;
        font-weight: 500;
    }
    
    .item-quantity {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .qty-btn {
        width: 32px;
        height: 32px;
        border: 1px solid #ddd;
        background: #fff;
        cursor: pointer;
        font-size: 18px;
        border-radius: 4px;
    }
    
    .qty-btn:hover {
        background: #f5f5f5;
    }
    
    .qty-input {
        width: 50px;
        height: 32px;
        text-align: center;
        border: 1px solid #ddd;
        border-radius: 4px;
    }
    
    .item-total {
        min-width: 100px;
        text-align: right;
    }
    
    .total-price {
        font-weight: 600;
        font-size: 16px;
    }
    
    .remove-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: #999;
        padding: 5px;
    }
    
    .remove-btn:hover {
        color: #c00;
    }
    
    .loading-spinner {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 50px;
    }
    
    .spinner {
        width: 40px;
        height: 40px;
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
document.head.appendChild(cartStyles);
