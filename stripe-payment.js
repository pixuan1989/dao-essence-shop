/**
 * ============================================
 * DAO Essence - Stripe 支付修复版
 * 使用 Stripe Checkout（更简单可靠）
 * ============================================
 */

// API 基础路径
const API_BASE_URL = '/.netlify/functions';

// Stripe 配置 - 生产环境公钥
const STRIPE_PUBLIC_KEY = 'pk_test_51TCXN018te51GWiewKqP8Rp8reBZP8oL4WCxngJPliUJKjHbRbRIgpqeEnZ67XylRnLfNvC09I0FXSYhDZo5hsDx00ofI4i5z6';

let stripe;

/**
 * 初始化 Stripe
 */
function initStripe() {
    if (!stripe) {
        stripe = Stripe(STRIPE_PUBLIC_KEY);
        console.log('✅ Stripe initialized');
    }
    return stripe;
}

/**
 * 创建 Checkout Session 并跳转到 Stripe
 */
async function createCheckoutSession(items, shipping) {
    const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            items: items,
            shipping: shipping
        })
    });

    const data = await response.json();
    
    if (!data.success) {
        throw new Error(data.error || '创建支付会话失败');
    }

    return data;
}

/**
 * 处理支付 - 使用 Stripe Checkout 重定向
 */
async function handleStripePayment() {
    const payButton = document.getElementById('pay-button');
    if (!payButton) return;

    // 禁用按钮，显示加载状态
    payButton.disabled = true;
    payButton.textContent = '正在处理...';

    try {
        // 1. 获取购物车数据
        const cartData = localStorage.getItem('daoessence_cart');
        if (!cartData) {
            throw new Error('购物车是空的');
        }

        // 支持两种格式：数组 或 { items: [...] }
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

        // 2. 计算总价
        const shippingSelect = document.getElementById('shipping-select');
        const shippingRate = shippingSelect ? parseFloat(shippingSelect.value) || 15 : 15;
        const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal + shippingRate;

        // 3. 准备商品数据
        const items = cart.items.map(item => ({
            id: item.id,
            name: item.name,
            nameCn: item.nameCn,
            price: item.price,
            quantity: item.quantity,
            image: item.image
        }));

        // 4. 创建 Stripe Checkout Session
        payButton.textContent = '正在跳转支付...';
        const result = await createCheckoutSession(items, shippingRate);

        // 5. 跳转到 Stripe Checkout
        const stripeInstance = initStripe();
        const { error } = await stripeInstance.redirectToCheckout({
            sessionId: result.sessionId
        });

        if (error) {
            throw new Error(error.message);
        }

    } catch (error) {
        console.error('❌ Payment error:', error);
        alert('支付失败：' + error.message);
        
        // 恢复按钮
        payButton.disabled = false;
        payButton.textContent = '去支付';
    }
}

/**
 * 初始化结账页面
 */
function initCheckoutPage() {
    initStripe();
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

    // 支持两种格式：数组 或 { items: [...] }
    let cart;
    try {
        const parsed = JSON.parse(cartData);
        if (Array.isArray(parsed)) {
            // 旧格式：直接是数组
            cart = { items: parsed };
        } else {
            // 新格式：对象
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
            <img src="${item.image}" alt="${item.nameCn}">
            <div class="item-info">
                <h4>${item.nameCn}</h4>
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

// 运费配置
const shippingRates = {
    '15': { price: 15, name: '标准运输', days: '15-25' },
    '35': { price: 35, name: '快速运输', days: '7-10' },
    '55': { price: 55, name: 'DHL快递', days: '3-5' }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.checkout-page')) {
        initCheckoutPage();
    }
});

// 导出到全局
window.handleStripePayment = handleStripePayment;
window.initCheckoutPage = initCheckoutPage;
