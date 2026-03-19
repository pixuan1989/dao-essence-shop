/* ============================================
   DAO Essence - Stripe Payment Integration
   使用 Netlify Functions 处理支付
   ============================================ */

// API 基础路径（自动检测环境）
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? '/.netlify/functions'  // 本地开发使用 Netlify CLI
    : '/.netlify/functions'; // 生产环境使用 Netlify

// Stripe 实例
let stripe;

// 初始化 Stripe
function initStripe() {
    // 从 window 对象获取公钥（由 Netlify 在构建时注入）
    // 格式：window.stripeConfig = { publicKey: 'pk_test_...' }
    const publicKey = window.stripeConfig?.publicKey ||
                     window.STRIPE_PUBLIC_KEY ||
                     '';

    if (!publicKey) {
        console.error('❌ Stripe public key not configured. Please check Netlify environment variables.');
        alert('支付系统配置错误，请联系客服');
        return;
    }

    stripe = Stripe(publicKey);
    console.log('✅ Stripe initialized');
}

// 创建 Payment Intent
async function createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
        const response = await fetch(`${API_BASE}/create-payment-intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: amount,
                currency: currency,
                metadata: metadata
            })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to create payment intent');
        }

        return data;
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
    }
}

// 使用 Stripe Checkout 重定向用户
async function redirectToCheckout(lineItems, successUrl, cancelUrl) {
    try {
        const response = await fetch(`${API_BASE}/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                lineItems: lineItems,
                successUrl: successUrl,
                cancelUrl: cancelUrl
            })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to create checkout session');
        }

        // 重定向到 Stripe Checkout
        const result = await stripe.redirectToCheckout({
            sessionId: data.sessionId
        });

        if (result.error) {
            throw new Error(result.error.message);
        }

    } catch (error) {
        console.error('Error redirecting to checkout:', error);
        alert('支付初始化失败，请稍后重试');
        throw error;
    }
}

// 使用 Payment Elements（更灵活的支付体验）
async function processPaymentWithElements(clientSecret, paymentMethodId) {
    try {
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: paymentMethodId
        });

        if (error) {
            console.error('Payment error:', error);
            return {
                success: false,
                error: error.message
            };
        }

        return {
            success: true,
            paymentIntent: paymentIntent
        };

    } catch (error) {
        console.error('Error processing payment:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// 检查支付状态
async function checkPaymentStatus(paymentIntentId) {
    try {
        const response = await fetch(`${API_BASE}/get-payment-intent?id=${paymentIntentId}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to check payment status');
        }

        return data;
    } catch (error) {
        console.error('Error checking payment status:', error);
        throw error;
    }
}

// 获取订单信息
async function getOrder(orderId) {
    try {
        const response = await fetch(`${API_BASE}/get-order?orderId=${orderId}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to get order');
        }

        return data.order;
    } catch (error) {
        console.error('Error getting order:', error);
        throw error;
    }
}

// ========================================
// 结账流程
// ========================================

// 初始化结账页面
async function initCheckout() {
    initStripe();

    // 加载购物车数据
    const cartData = localStorage.getItem('daoessence_cart');
    if (!cartData) {
        alert('购物车是空的');
        window.location.href = 'shop.html';
        return;
    }

    const cart = JSON.parse(cartData);
    if (cart.items.length === 0) {
        alert('购物车是空的');
        window.location.href = 'shop.html';
        return;
    }

    // 显示购物车商品
    displayCartItems(cart);

    // 初始化运费选择
    initShippingSelect(cart);

    // 绑定支付按钮
    const payButton = document.getElementById('pay-button');
    if (payButton) {
        payButton.addEventListener('click', handlePayment);
    }
}

// 显示购物车商品
function displayCartItems(cart) {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = cart.items.map(item => `
        <div class="checkout-cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="item-info">
                <h4>${item.nameCn}</h4>
                <p class="item-name-en">${item.name}</p>
                <p class="item-price">$${item.price.toFixed(2)} × ${item.quantity}</p>
            </div>
            <p class="item-subtotal">$${(item.price * item.quantity).toFixed(2)}</p>
        </div>
    `).join('');

    updateTotals(cart);
}

// 初始化运费选择
function initShippingSelect(cart) {
    const shippingSelect = document.getElementById('shipping-select');
    if (!shippingSelect) return;

    shippingSelect.addEventListener('change', () => {
        updateTotals(cart);
    });
}

// 更新总价
function updateTotals(cart) {
    const shippingSelect = document.getElementById('shipping-select');
    const shippingRate = shippingSelect
        ? (shippingRates[shippingSelect.value]?.price || 15)
        : 15;

    const subtotal = getCartTotal();
    const grandTotal = subtotal + shippingRate;

    // 更新显示
    const subtotalEl = document.getElementById('subtotal');
    const grandTotalEl = document.getElementById('grand-total');

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (grandTotalEl) grandTotalEl.textContent = `$${grandTotal.toFixed(2)}`;

    return {
        subtotal,
        shipping: shippingRate,
        total: grandTotal
    };
}

// 处理支付
async function handlePayment() {
    const payButton = document.getElementById('pay-button');
    if (!payButton) return;

    // 禁用按钮，显示加载状态
    payButton.disabled = true;
    payButton.textContent = '处理中...';

    try {
        // 获取购物车数据
        const cartData = localStorage.getItem('daoessence_cart');
        const cart = JSON.parse(cartData);

        // 计算总价
        const { total } = updateTotals(cart);

        // 生成订单 ID
        const orderId = `order_${Date.now()}`;

        // 准备元数据
        const metadata = {
            orderId: orderId,
            items: cart.items.map(item =>
                `${item.id}:${item.name}:${item.quantity}:${item.price}`
            ).join('|'),
            itemCount: cart.items.length,
            createdAt: new Date().toISOString()
        };

        // 创建 Payment Intent
        const paymentIntentResult = await createPaymentIntent(
            total,
            'usd',
            metadata
        );

        // 使用 Stripe Checkout（简化流程）
        const lineItems = cart.items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    description: item.nameCn
                },
                unit_amount: Math.round(item.price * 100)
            },
            quantity: item.quantity
        }));

        const successUrl = `${window.location.origin}/order-confirm.html?payment_intent=${paymentIntentResult.paymentIntentId}&order_id=${orderId}`;
        const cancelUrl = `${window.location.origin}/checkout.html?canceled=true`;

        await redirectToCheckout(lineItems, successUrl, cancelUrl);

    } catch (error) {
        console.error('Payment error:', error);
        alert('支付失败：' + error.message);

        // 恢复按钮状态
        payButton.disabled = false;
        payButton.textContent = '去支付';
    }
}

// ========================================
// 订单确认页面
// ========================================

// 初始化订单确认页面
async function initOrderConfirmation() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntentId = urlParams.get('payment_intent');
    const orderId = urlParams.get('order_id');

    if (!paymentIntentId) {
        document.getElementById('order-status').innerHTML = `
            <div class="error-message">
                <h2>订单信息无效</h2>
                <p>请返回<a href="shop.html">商品页面</a>重新下单</p>
            </div>
        `;
        return;
    }

    // 显示加载状态
    document.getElementById('order-status').innerHTML = `
        <div class="loading">
            <p>正在验证支付状态...</p>
        </div>
    `;

    try {
        // 检查支付状态
        const statusResult = await checkPaymentStatus(paymentIntentId);

        if (statusResult.status === 'succeeded') {
            // 支付成功
            document.getElementById('order-status').innerHTML = `
                <div class="success-message">
                    <div class="success-icon">✓</div>
                    <h2>支付成功！</h2>
                    <p>感谢您的购买，您的订单已确认。</p>
                    <p>订单号：${orderId}</p>
                    <p>支付金额：$${(statusResult.paymentIntent.amount / 100).toFixed(2)}</p>
                </div>
            `;

            // 清空购物车
            localStorage.removeItem('daoessence_cart');

        } else {
            // 支付未完成
            document.getElementById('order-status').innerHTML = `
                <div class="warning-message">
                    <h2>支付未完成</h2>
                    <p>当前状态：${statusResult.status}</p>
                    <p>请<a href="checkout.html">返回结账页面</a>重新尝试</p>
                </div>
            `;
        }

    } catch (error) {
        console.error('Error checking payment status:', error);
        document.getElementById('order-status').innerHTML = `
            <div class="error-message">
                <h2>验证失败</h2>
                <p>无法验证支付状态，请联系客服</p>
                <p>订单号：${orderId}</p>
                <p>支付 ID：${paymentIntentId}</p>
            </div>
        `;
    }
}

// ========================================
// 导出
// ========================================

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    // 根据页面类型初始化
    if (document.querySelector('.checkout-page')) {
        initCheckout();
    } else if (document.querySelector('.order-confirmation-page')) {
        initOrderConfirmation();
    }
});

// 导出函数
window.stripePayment = {
    initStripe,
    createPaymentIntent,
    redirectToCheckout,
    processPaymentWithElements,
    checkPaymentStatus,
    getOrder
};
