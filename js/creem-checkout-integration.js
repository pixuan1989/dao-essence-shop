/**
 * Creem 支付集成 - checkout.html
 * 
 * 用于 checkout.html 页面，调用 Creem API 创建支付会话
 * 支持折扣功能：根据购物车商品是否有折扣标记选择不同的产品 ID
 */

// ============================================
// 全局变量
// ============================================

let cartItems = [];
let totalAmount = 0;
let discountApplied = false;

// ============================================
// 初始化
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    await loadCartItems();
    setupEventListeners();
    checkDiscountStatus();
});

// ============================================
// 加载购物车
// ============================================

async function loadCartItems() {
    try {
        // 使用 CreemDiscountHelper 获取带折扣标记的购物车
        if (window.CreemDiscountHelper) {
            cartItems = window.CreemDiscountHelper.getCartWithDiscountMarks();
        } else {
            // 降级方案：直接读取 localStorage
            const cartData = localStorage.getItem('cart');
            cartItems = cartData ? JSON.parse(cartData) : [];
        }

        if (!cartItems || cartItems.length === 0) {
            showEmptyCart();
            return;
        }

        console.log('购物车商品:', cartItems);

        // 渲染购物车
        renderCartItems();
        calculateTotals();

    } catch (error) {
        console.error('加载购物车失败:', error);
        showError('无法加载购物车');
    }
}

// ============================================
// 渲染购物车
// ============================================

function renderCartItems() {
    const container = document.getElementById('cart-items');
    if (!container) return;

    container.innerHTML = cartItems.map(item => {
        const displayPrice = window.CreemDiscountHelper ? 
            window.CreemDiscountHelper.getDisplayPrice(item) : item.price;
        const discountBadge = window.CreemDiscountHelper ? 
            window.CreemDiscountHelper.getDiscountPercentage(item) : '';

        return `
            <div class="checkout-cart-item" data-item-id="${item.id}">
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name || item.nameCN}" 
                         onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="item-details">
                    <h4 class="item-name">${item.nameCN || item.name}</h4>
                    <p class="item-price">${discountBadge ? `
                        <span class="original-price">$${item.originalPrice || item.price}</span>
                        <span class="discount-price">$${displayPrice.toFixed(2)}</span>
                        <span class="discount-badge">${discountBadge}</span>
                    ` : `
                        $${displayPrice.toFixed(2)}
                    `}</p>
                </div>
                <div class="item-quantity">
                    <input type="number" 
                           class="qty-input" 
                           value="${item.quantity}" 
                           min="1" 
                           onchange="updateItemQuantity('${item.id}', this.value)">
                </div>
                <div class="item-total">
                    $${(displayPrice * item.quantity).toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// 价格计算
// ============================================

function calculateTotals() {
    const shipping = parseFloat(document.getElementById('shipping-select')?.value || 15);

    // 计算小计（使用显示价格）
    const subtotal = cartItems.reduce((sum, item) => {
        const price = window.CreemDiscountHelper ? 
            window.CreemDiscountHelper.getDisplayPrice(item) : item.price;
        return sum + (price * item.quantity);
    }, 0);

    totalAmount = subtotal + shipping;

    // 更新显示
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping-cost');
    const totalEl = document.getElementById('grand-total');

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = `$${shipping.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${totalAmount.toFixed(2)}`;
}

// ============================================
// 检查折扣状态
// ============================================

function checkDiscountStatus() {
    // 判断是否应该使用折扣产品 ID
    if (window.CreemDiscountHelper) {
        discountApplied = window.CreemDiscountHelper.shouldUseDiscountProduct(cartItems);
        console.log('🎯 折扣状态:', discountApplied ? '使用折扣产品' : '使用原价产品');
    }

    // 可以在 UI 上显示折扣状态
    const discountNotice = document.getElementById('discount-notice');
    if (discountNotice && discountApplied) {
        discountNotice.style.display = 'block';
        discountNotice.innerHTML = '🎉 折扣优惠已应用！';
    }
}

// ============================================
// 更新商品数量
// ============================================

function updateItemQuantity(itemId, newQuantity) {
    const item = cartItems.find(i => i.id === itemId);
    if (item) {
        item.quantity = Math.max(1, parseInt(newQuantity));
        
        // 保存更新后的购物车
        if (window.CreemDiscountHelper) {
            window.CreemDiscountHelper.saveCartWithDiscountMarks(cartItems);
        } else {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        }

        renderCartItems();
        calculateTotals();
        checkDiscountStatus();
    }
}

// ============================================
// 创建 Creem 支付会话
// ============================================

async function createCreemCheckout() {
    try {
        // 验证表单
        const buyerName = document.getElementById('buyer-name')?.value;
        const buyerEmail = document.getElementById('buyer-email')?.value;
        const shipping = parseFloat(document.getElementById('shipping-select')?.value || 15);

        if (!buyerName || !buyerEmail) {
            alert('请填写收件人姓名和邮箱');
            return;
        }

        // 准备 API 请求数据
        const requestData = {
            items: cartItems.map(item => ({
                id: item.id,
                name: item.name || item.nameCN,
                price: window.CreemDiscountHelper ? 
                    window.CreemDiscountHelper.getDisplayPrice(item) : item.price,
                quantity: item.quantity,
                hasDiscount: item.hasDiscount || false  // 关键：标记是否有折扣
            })),
            shipping: shipping,
            customerName: buyerName,
            customerEmail: buyerEmail,
            shippingAddress: document.getElementById('buyer-address')?.value || ''
        };

        // 判断是否使用折扣码
        const useDiscountCode = discountApplied ? 'XJCX520' : null;
        if (useDiscountCode) {
            requestData.discountCode = useDiscountCode;
        }

        console.log('📦 发送到 Creem API 的数据:', requestData);

        // 显示加载状态
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.textContent = '创建支付会话中...';
        }

        // 调用 Creem API
        const response = await fetch('/api/create-checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();

        console.log('Creem API 响应:', result);

        if (!response.ok) {
            throw new Error(result.error || '创建支付会话失败');
        }

        if (!result.checkoutUrl) {
            throw new Error('未收到支付链接');
        }

        // 跳转到 Creem 支付页面
        window.location.href = result.checkoutUrl;

    } catch (error) {
        console.error('❌ 创建支付会话失败:', error);
        alert(`支付失败: ${error.message}\n请稍后重试或联系客服`);

        // 恢复按钮状态
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = '去支付';
        }
    }
}

// ============================================
// 事件监听
// ============================================

function setupEventListeners() {
    // 运输方式改变
    const shippingSelect = document.getElementById('shipping-select');
    if (shippingSelect) {
        shippingSelect.addEventListener('change', calculateTotals);
    }

    // 结账按钮
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', createCreemCheckout);
    }
}

// ============================================
// UI 辅助函数
// ============================================

function showEmptyCart() {
    const container = document.querySelector('.checkout-page .container');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <h2>购物车是空的</h2>
                <p>请先添加商品到购物车</p>
                <a href="shop.html" class="btn btn-primary">去购物</a>
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

    const container = document.querySelector('.checkout-page .container');
    if (container) {
        container.insertBefore(errorEl, container.firstChild);
        setTimeout(() => errorEl.remove(), 5000);
    }
}

// 添加样式
const checkoutStyles = document.createElement('style');
checkoutStyles.textContent = `
    .checkout-cart-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px 0;
        border-bottom: 1px solid #eee;
    }

    .checkout-cart-item .item-image {
        width: 60px;
        height: 60px;
        flex-shrink: 0;
    }

    .checkout-cart-item .item-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
    }

    .checkout-cart-item .item-details {
        flex: 1;
    }

    .checkout-cart-item .item-name {
        margin: 0 0 5px;
        font-size: 14px;
        font-weight: 500;
    }

    .checkout-cart-item .item-price {
        margin: 0;
        font-size: 14px;
    }

    .checkout-cart-item .original-price {
        text-decoration: line-through;
        color: #999;
        margin-right: 8px;
    }

    .checkout-cart-item .discount-price {
        color: var(--fire-primary, #D4AF37);
        font-weight: 600;
        font-size: 16px;
    }

    .checkout-cart-item .discount-badge {
        background: #e74c3c;
        color: white;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        margin-left: 8px;
    }

    .checkout-cart-item .item-quantity {
        flex-shrink: 0;
    }

    .checkout-cart-item .qty-input {
        width: 50px;
        height: 32px;
        text-align: center;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .checkout-cart-item .item-total {
        min-width: 80px;
        text-align: right;
        font-weight: 600;
    }

    #discount-notice {
        display: none;
        background: #d4edda;
        color: #155724;
        padding: 10px 15px;
        border-radius: 4px;
        margin-bottom: 20px;
        text-align: center;
        font-weight: 500;
    }

    .btn-primary {
        display: inline-block;
        padding: 12px 40px;
        background: var(--primary-color, #D4AF37);
        color: white;
        text-decoration: none;
        border-radius: 4px;
        font-weight: 600;
    }
`;
document.head.appendChild(checkoutStyles);

// ============================================
// 导出到全局
// ============================================

window.CreemCheckout = {
    createCreemCheckout,
    loadCartItems,
    renderCartItems,
    calculateTotals
};

console.log('✅ Creem 支付集成已加载');
