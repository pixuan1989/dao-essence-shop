/**
 * ============================================
 * DAO Essence - Stripe 支付集成
 * 使用 Stripe Checkout 处理支付
 * ============================================
 */

// API 基础路径
const API_BASE_URL = 'http://localhost:3001/api';

/**
 * 创建 Stripe Checkout Session 并跳转
 */
async function createStripeCheckout(items, shippingCost, buyerInfo) {
    try {
        const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: items,
                customerName: buyerInfo.name || '',
                customerEmail: buyerInfo.email || '',
                shippingMethod: buyerInfo.shippingMethod || '标准运输',
                shippingCost: shippingCost
            })
        });

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || '创建支付会话失败');
        }

        // 跳转到 Stripe Checkout 页面
        window.location.href = data.url;
        
        return data;
    } catch (error) {
        console.error('Stripe API 错误:', error);
        throw error;
    }
}

/**
 * 获取 Stripe Session 信息（验证支付状态）
 */
async function getStripeSession(sessionId) {
    try {
        const response = await fetch(`${API_BASE_URL}/get-session?session_id=${sessionId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取 Session 失败:', error);
        throw error;
    }
}

/**
 * 处理支付 - 使用 Stripe Checkout
 */
async function handleStripePayment() {
    const payButton = document.getElementById('pay-button');
    if (!payButton) return;

    // 验证买家信息
    const buyerName = document.getElementById('buyer-name')?.value?.trim();
    const buyerEmail = document.getElementById('buyer-email')?.value?.trim();
    const buyerAddress = document.getElementById('buyer-address')?.value?.trim();

    // 必填项验证
    if (!buyerName) {
        document.getElementById('buyer-name')?.classList.add('error');
        document.getElementById('buyer-name')?.focus();
        alert('请填写收件人姓名');
        return;
    }
    if (!buyerEmail || !buyerEmail.includes('@')) {
        document.getElementById('buyer-email')?.classList.add('error');
        document.getElementById('buyer-email')?.focus();
        alert('请填写有效的邮箱地址');
        return;
    }

    // 清除错误状态
    document.getElementById('buyer-name')?.classList.remove('error');
    document.getElementById('buyer-email')?.classList.remove('error');

    // 禁用按钮，显示加载状态
    payButton.disabled = true;
    payButton.textContent = '正在跳转支付...';

    try {
        // 1. 获取购物车数据
        const cartData = localStorage.getItem('daoessence_cart');
        if (!cartData) {
            throw new Error('购物车是空的');
        }

        const parsed = JSON.parse(cartData);
        let cart;
        if (Array.isArray(parsed)) {
            cart = { items: parsed };
        } else {
            cart = parsed;
        }

        if (!cart.items || cart.items.length === 0) {
            throw new Error('购物车是空的');
        }

        // 2. 获取运费
        const shippingSelect = document.getElementById('shipping-select');
        const shippingRate = shippingSelect ? parseFloat(shippingSelect.value) || 15 : 15;
        const shippingOptions = { 
            '15': '标准运输 Standard (15-25天)', 
            '35': '快速运输 Express (7-10天)', 
            '55': 'DHL快递 DHL (3-5天)' 
        };
        const shippingMethod = shippingOptions[String(shippingRate)] || '标准运输 Standard';

        // 3. 准备买家信息
        const buyerInfo = {
            name: buyerName,
            email: buyerEmail,
            address: buyerAddress,
            shippingMethod: shippingMethod,
            shippingRate: shippingRate
        };

        // 保存买家信息到 localStorage
        localStorage.setItem('daoessence_buyer', JSON.stringify(buyerInfo));

        // 4. 准备商品数据
        const items = cart.items.map(item => ({
            id: item.id,
            name: item.name,
            nameCn: item.nameCn || item.nameCN,
            price: item.price,
            quantity: item.quantity,
            image: item.image
        }));

        // 5. 创建 Stripe Checkout Session
        await createStripeCheckout(items, shippingRate, buyerInfo);

    } catch (error) {
        console.error('Payment error:', error);
        alert('支付失败：' + error.message);
        
        // 恢复按钮
        payButton.disabled = false;
        payButton.textContent = '去支付 →';
    }
}

/**
 * 初始化结账页面
 */
function initCheckoutPage() {
    loadCartItems();
    initShippingSelect();
    
    // 绑定支付按钮
    const payButton = document.getElementById('pay-button');
    if (payButton) {
        payButton.addEventListener('click', handleStripePayment);
    }
}

/**
 * 加载购物车商品
 */
function loadCartItems() {
    const cartData = localStorage.getItem('daoessence_cart');
    if (!cartData) {
        showEmptyCart();
        return;
    }

    let cart;
    try {
        const parsed = JSON.parse(cartData);
        if (Array.isArray(parsed)) {
            cart = { items: parsed };
        } else {
            cart = parsed;
        }
    } catch (e) {
        console.error('Cart data parse error:', e);
        showEmptyCart();
        return;
    }

    if (!cart.items || cart.items.length === 0) {
        showEmptyCart();
        return;
    }

    displayCartItems(cart);
    updateTotals(cart);
}

/**
 * 显示空购物车
 */
function showEmptyCart() {
    const container = document.getElementById('cart-items');
    if (container) {
        container.innerHTML = '<p class="empty-cart">购物车是空的</p>';
    }
    const payButton = document.getElementById('pay-button');
    if (payButton) {
        payButton.disabled = true;
    }
}

/**
 * 显示购物车商品
 */
function displayCartItems(cart) {
    const container = document.getElementById('cart-items');
    if (!container) return;

    container.innerHTML = cart.items.map(item => `
        <div class="checkout-cart-item">
            <img src="${item.image}" alt="${item.nameCn || item.nameCN}" onerror="this.style.display='none'">
            <div class="item-info">
                <h4>${item.nameCn || item.nameCN}</h4>
                <p class="item-name-en">${item.name}</p>
                <p class="item-price">$${item.price.toFixed(2)} × ${item.quantity}</p>
            </div>
            <p class="item-subtotal">$${(item.price * item.quantity).toFixed(2)}</p>
        </div>
    `).join('');
}

/**
 * 初始化运费选择
 */
function initShippingSelect() {
    const select = document.getElementById('shipping-select');
    if (!select) return;

    select.addEventListener('change', () => {
        const cartData = localStorage.getItem('daoessence_cart');
        if (cartData) {
            updateTotals(JSON.parse(cartData));
        }
    });
}

/**
 * 更新总价显示
 */
function updateTotals(cart) {
    const select = document.getElementById('shipping-select');
    const shipping = select ? parseFloat(select.value) || 15 : 15;
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + shipping;

    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('grand-total');

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.checkout-page')) {
        initCheckoutPage();
    }
});

// 导出到全局
window.handleStripePayment = handleStripePayment;
window.initCheckoutPage = initCheckoutPage;
window.getStripeSession = getStripeSession;
