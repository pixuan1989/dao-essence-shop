/**
 * 结账页 - Shopify Checkout 对接
 * 
 * 说明：
 * Shopify 结账流程推荐使用托管的结账页面（checkoutUrl）
 * 这样可以自动处理：
 * - 支付网关集成（Creem、信用卡等）
 * - 订单确认邮件
 * - 库存扣减
 * - 税费计算
 * - 配送选项
 * - 安全合规（PCI-DSS）
 * 
 * 此文件提供两种结账方式：
 * 1. 跳转到 Shopify 托管结账页面（推荐）
 * 2. 在当前页面嵌入结账（需要额外配置）
 */

// ============================================
// 方式一：跳转到 Shopify 托管结账（推荐）
// ============================================

async function redirectToShopifyCheckout() {
    try {
        showCheckoutLoading();
        
        const cartId = localStorage.getItem('shopify_cart_id');
        
        if (!cartId) {
            alert('购物车已过期，请重新添加商品');
            window.location.href = 'shop.html';
            return;
        }
        
        // 获取购物车
        const cart = await getCart(cartId);
        
        if (!cart || cart.lines.edges.length === 0) {
            alert('购物车是空的');
            window.location.href = 'cart.html';
            return;
        }
        
        // 如果页面上有收集买家信息，更新到购物车
        await updateBuyerInfoToCart(cart.id);
        
        // 跳转到 Shopify 结账页面
        const checkoutUrl = cart.checkoutUrl;
        
        if (checkoutUrl) {
            window.location.href = checkoutUrl;
        } else {
            throw new Error('无法获取结账链接');
        }
        
    } catch (error) {
        console.error('跳转结账失败:', error);
        hideCheckoutLoading();
        showError('无法跳转到结账页面，请重试');
    }
}

// ============================================
// 方式二：嵌入 Shopify 结账（高级）
// ============================================

async function embedShopifyCheckout() {
    try {
        const cartId = localStorage.getItem('shopify_cart_id');
        
        if (!cartId) {
            alert('购物车已过期');
            return;
        }
        
        const cart = await getCart(cartId);
        const checkoutUrl = cart.checkoutUrl;
        
        // 创建 iframe 嵌入结账页面
        const checkoutContainer = document.querySelector('.checkout-embed') ||
                                   document.getElementById('checkout-embed');
        
        if (checkoutContainer) {
            checkoutContainer.innerHTML = `
                <iframe 
                    src="${checkoutUrl}" 
                    style="width: 100%; min-height: 600px; border: none;"
                    allow="payment"
                ></iframe>
            `;
        }
        
    } catch (error) {
        console.error('嵌入结账失败:', error);
        showError('无法加载结账页面');
    }
}

// ============================================
// 更新买家信息到购物车
// ============================================

async function updateBuyerInfoToCart(cartId) {
    const emailInput = document.querySelector('input[name="email"]') ||
                       document.getElementById('customer-email');
    
    const countrySelect = document.querySelector('select[name="country"]') ||
                          document.getElementById('country');
    
    if (emailInput && emailInput.value) {
        const countryCode = countrySelect?.value || 'US';
        try {
            await updateCartBuyerIdentity(cartId, emailInput.value, countryCode);
        } catch (error) {
            console.warn('更新买家信息失败:', error);
            // 不阻断结账流程
        }
    }
}

// ============================================
// 页面初始化
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    // 检查购物车状态
    await checkCartStatus();
    
    // 绑定结账按钮
    bindCheckoutButton();
    
    // 预填充买家信息（如果有）
    prefillBuyerInfo();
});

async function checkCartStatus() {
    try {
        const cartId = localStorage.getItem('shopify_cart_id');
        
        if (!cartId) {
            showEmptyCartWarning();
            return;
        }
        
        const cart = await getCart(cartId);
        
        if (!cart || cart.lines.edges.length === 0) {
            showEmptyCartWarning();
            return;
        }
        
        // 显示订单摘要
        displayOrderSummary(cart);
        
    } catch (error) {
        console.error('检查购物车状态失败:', error);
    }
}

function bindCheckoutButton() {
    const checkoutBtn = document.querySelector('.checkout-btn') ||
                        document.getElementById('checkout-btn') ||
                        document.querySelector('[onclick*="checkout"]');
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            redirectToShopifyCheckout();
        });
    }
}

function prefillBuyerInfo() {
    // 从 localStorage 读取之前保存的买家信息
    const savedInfo = localStorage.getItem('buyer_info');
    
    if (savedInfo) {
        try {
            const info = JSON.parse(savedInfo);
            
            const emailInput = document.querySelector('input[name="email"]');
            const phoneInput = document.querySelector('input[name="phone"]');
            const countrySelect = document.querySelector('select[name="country"]');
            
            if (emailInput && info.email) emailInput.value = info.email;
            if (phoneInput && info.phone) phoneInput.value = info.phone;
            if (countrySelect && info.country) countrySelect.value = info.country;
            
        } catch (error) {
            console.warn('读取买家信息失败:', error);
        }
    }
}

function saveBuyerInfo() {
    const emailInput = document.querySelector('input[name="email"]');
    const phoneInput = document.querySelector('input[name="phone"]');
    const countrySelect = document.querySelector('select[name="country"]');
    
    const info = {
        email: emailInput?.value || '',
        phone: phoneInput?.value || '',
        country: countrySelect?.value || ''
    };
    
    localStorage.setItem('buyer_info', JSON.stringify(info));
}

// ============================================
// 显示订单摘要
// ============================================

function displayOrderSummary(cart) {
    const summaryContainer = document.querySelector('.order-summary') ||
                              document.getElementById('order-summary');
    
    if (!summaryContainer) return;
    
    const items = cart.lines.edges;
    const subtotal = cart.cost.subtotalAmount;
    const tax = cart.cost.totalTaxAmount;
    const total = cart.cost.totalAmount;
    
    summaryContainer.innerHTML = `
        <h3>订单摘要</h3>
        <div class="summary-items">
            ${items.map(edge => {
                const item = edge.node;
                const variant = item.merchandise;
                return `
                    <div class="summary-item">
                        <img src="${variant.image?.url || 'images/placeholder.jpg'}" alt="${variant.product.title}">
                        <div class="item-info">
                            <p class="item-name">${variant.product.title}</p>
                            ${variant.title !== 'Default Title' ? `<p class="item-variant">${variant.title}</p>` : ''}
                            <p class="item-qty">x ${item.quantity}</p>
                        </div>
                        <p class="item-price">${formatPrice(variant.price.amount * item.quantity, variant.price.currencyCode)}</p>
                    </div>
                `;
            }).join('')}
        </div>
        <div class="summary-totals">
            <div class="summary-row">
                <span>小计</span>
                <span>${formatPrice(subtotal.amount, subtotal.currencyCode)}</span>
            </div>
            ${tax ? `
                <div class="summary-row">
                    <span>税费</span>
                    <span>${formatPrice(tax.amount, tax.currencyCode)}</span>
                </div>
            ` : ''}
            <div class="summary-row total">
                <span>总计</span>
                <span>${formatPrice(total.amount, total.currencyCode)}</span>
            </div>
        </div>
    `;
}

// ============================================
// UI 辅助函数
// ============================================

function showCheckoutLoading() {
    const checkoutBtn = document.querySelector('.checkout-btn') ||
                        document.getElementById('checkout-btn');
    
    if (checkoutBtn) {
        checkoutBtn.disabled = true;
        checkoutBtn.dataset.originalText = checkoutBtn.textContent;
        checkoutBtn.textContent = '处理中...';
    }
    
    // 显示全屏加载
    const overlay = document.createElement('div');
    overlay.className = 'checkout-loading-overlay';
    overlay.innerHTML = `
        <div class="checkout-loading-content">
            <div class="spinner"></div>
            <p>正在跳转到安全支付页面...</p>
        </div>
    `;
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    document.body.appendChild(overlay);
}

function hideCheckoutLoading() {
    const overlay = document.querySelector('.checkout-loading-overlay');
    if (overlay) overlay.remove();
    
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = checkoutBtn.dataset.originalText || '去结账';
    }
}

function showEmptyCartWarning() {
    const container = document.querySelector('.checkout-container') ||
                      document.querySelector('main');
    
    if (container) {
        container.innerHTML = `
            <div class="empty-cart-warning">
                <h2>购物车是空的</h2>
                <p>请先添加商品到购物车</p>
                <a href="shop.html" class="continue-shopping-btn">去购物</a>
            </div>
        `;
    }
}

function showError(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'checkout-error';
    errorEl.textContent = message;
    errorEl.style.cssText = `
        background: #fee;
        color: #c00;
        padding: 15px;
        border-radius: 4px;
        margin-bottom: 20px;
        text-align: center;
    `;
    
    const container = document.querySelector('.checkout-container') ||
                      document.querySelector('main');
    
    if (container) {
        container.insertBefore(errorEl, container.firstChild);
        setTimeout(() => errorEl.remove(), 5000);
    }
}

// ============================================
// 样式
// ============================================

const checkoutStyles = document.createElement('style');
checkoutStyles.textContent = `
    .checkout-loading-content {
        text-align: center;
    }
    
    .checkout-loading-content .spinner {
        width: 50px;
        height: 50px;
        margin: 0 auto 20px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .order-summary {
        background: #f9f9f9;
        padding: 20px;
        border-radius: 8px;
    }
    
    .summary-items {
        max-height: 300px;
        overflow-y: auto;
        margin-bottom: 20px;
    }
    
    .summary-item {
        display: flex;
        gap: 15px;
        padding: 10px 0;
        border-bottom: 1px solid #eee;
    }
    
    .summary-item img {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 4px;
    }
    
    .summary-item .item-info {
        flex: 1;
    }
    
    .summary-item .item-name {
        font-weight: 500;
        margin-bottom: 5px;
    }
    
    .summary-item .item-variant,
    .summary-item .item-qty {
        font-size: 14px;
        color: #666;
    }
    
    .summary-item .item-price {
        font-weight: 500;
    }
    
    .summary-totals {
        border-top: 2px solid #ddd;
        padding-top: 15px;
    }
    
    .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
    }
    
    .summary-row.total {
        font-size: 18px;
        font-weight: 600;
        border-top: 1px solid #ddd;
        padding-top: 15px;
        margin-top: 15px;
    }
    
    .empty-cart-warning {
        text-align: center;
        padding: 80px 20px;
    }
    
    .empty-cart-warning h2 {
        margin-bottom: 10px;
    }
    
    .empty-cart-warning p {
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
    }
`;
document.head.appendChild(checkoutStyles);
