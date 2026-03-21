/**
 * ============================================
 * DAO Essence - Creem 支付集成
 * 使用 Creem Checkout 处理支付
 * ============================================
 */

// API 基础路径
const API_BASE_URL = '/api';

// Creem 配置
// 注意：API密钥和产品ID在后端API中使用，前端不需要这些配置

/**
 * 创建 Creem Checkout 并跳转到支付页面
 */
async function createCreemCheckout(items, shipping, buyerInfo = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}/create-checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: items,
                shipping: shipping,
                customerName: buyerInfo.customerName || '',
                customerEmail: buyerInfo.customerEmail || '',
                shippingAddress: buyerInfo.shippingAddress || '',
                shippingMethod: buyerInfo.shippingMethod || '标准运输'
            })
        });

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || '创建支付会话失败');
        }

        return data;
    } catch (error) {
        console.error('Creem API 错误:', error);
        throw error;
    }
}

/**
 * 处理支付 - 使用 Creem Checkout 重定向
 */
async function handleCreemPayment() {
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
        const shippingOptions = { '15': '标准运输 (15-25天)', '35': '快速运输 (7-10天)', '55': 'DHL快递 (3-5天)' };
        const shippingMethod = shippingOptions[String(shippingRate)] || '标准运输';

        const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal + shippingRate;

        // 3. 保存买家信息到 localStorage（供订单确认页使用）
        const buyerInfo = {
            name: buyerName,
            email: buyerEmail,
            address: buyerAddress,
            shippingMethod: shippingMethod,
            shippingRate: shippingRate,
            total: total
        };
        localStorage.setItem('daoessence_buyer', JSON.stringify(buyerInfo));

        // 4. 准备商品数据
        const items = cart.items.map(item => ({
            id: item.id,
            name: item.name,
            nameCn: item.nameCN || item.nameCn,
            price: item.price,
            quantity: item.quantity,
            image: item.image
        }));

        // 5. 创建 Creem Checkout
        payButton.textContent = '正在跳转支付...';
        const result = await createCreemCheckout(items, shippingRate, {
            customerName: buyerName,
            customerEmail: buyerEmail,
            shippingAddress: buyerAddress,
            shippingMethod: shippingMethod
        });

        // 6. 跳转到 Creem 支付页面
        window.location.href = result.checkoutUrl;

    } catch (error) {
        console.error('❌ Payment error:', error);
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
        payButton.addEventListener('click', handleCreemPayment);
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
            <img src="${item.image}" alt="${item.nameCN || item.nameCn}">
            <div class="item-info">
                <h4>${item.nameCN || item.nameCn}</h4>
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
window.handleCreemPayment = handleCreemPayment;
window.initCheckoutPage = initCheckoutPage;