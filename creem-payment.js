/**
 * ============================================
 * DAO Essence - Creem 支付集成
 * ============================================
 */

// API 路径 - 部署时用相对路径
const API_BASE_URL = '/api';

/**
 * 创建 Creem Checkout 并跳转
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

        // 跳转到 Creem 支付页面
        window.location.href = data.checkoutUrl;

        return data;
    } catch (error) {
        console.error('Creem API 错误:', error);
        throw error;
    }
}

/**
 * 获取 Checkout 详情
 */
async function getCreemCheckout(checkoutId) {
    try {
        const response = await fetch(`${API_BASE_URL}/get-checkout?checkout_id=${checkoutId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取 Checkout 失败:', error);
        throw error;
    }
}

/**
 * 处理支付
 */
async function handleCreemPayment() {
    const payButton = document.getElementById('pay-button');
    if (!payButton) return;

    // 验证买家信息
    const buyerName = document.getElementById('buyer-name')?.value?.trim();
    const buyerEmail = document.getElementById('buyer-email')?.value?.trim();
    const buyerAddress = document.getElementById('buyer-address')?.value?.trim();

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

    document.getElementById('buyer-name')?.classList.remove('error');
    document.getElementById('buyer-email')?.classList.remove('error');

    payButton.disabled = true;
    payButton.textContent = '正在跳转支付...';

    try {
        const cartData = localStorage.getItem('daoessence_cart');
        if (!cartData) throw new Error('购物车是空的');

        const parsed = JSON.parse(cartData);
        const cart = Array.isArray(parsed) ? { items: parsed } : parsed;

        if (!cart.items || cart.items.length === 0) throw new Error('购物车是空的');

        const shippingSelect = document.getElementById('shipping-select');
        const shippingRate = shippingSelect ? parseFloat(shippingSelect.value) || 15 : 15;
        const shippingOptions = {
            '15': '标准运输 (15-25天)',
            '35': '快速运输 (7-10天)',
            '55': 'DHL快递 (3-5天)'
        };
        const shippingMethod = shippingOptions[String(shippingRate)] || '标准运输';

        // 保存买家信息
        const buyerInfo = {
            name: buyerName,
            email: buyerEmail,
            address: buyerAddress,
            shippingMethod: shippingMethod,
            shippingRate: shippingRate
        };
        localStorage.setItem('daoessence_buyer', JSON.stringify(buyerInfo));

        const items = cart.items.map(item => ({
            id: item.id,
            name: item.name,
            nameCn: item.nameCn || item.nameCN,
            price: item.price,
            quantity: item.quantity,
            image: item.image
        }));

        await createCreemCheckout(items, shippingRate, {
            customerName: buyerName,
            customerEmail: buyerEmail,
            shippingAddress: buyerAddress,
            shippingMethod: shippingMethod
        });

    } catch (error) {
        console.error('Payment error:', error);
        alert('支付失败：' + error.message);
        payButton.disabled = false;
        payButton.textContent = '去支付 →';
    }
}

/**
 * 初始化结账页面
 */
function initCheckoutPage() {
    loadCartItems();

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

    let cart;
    try {
        const parsed = JSON.parse(cartData);
        cart = Array.isArray(parsed) ? { items: parsed } : parsed;
    } catch (e) {
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

function showEmptyCart() {
    const container = document.getElementById('cart-items');
    if (container) container.innerHTML = '<p class="empty-cart">购物车是空的</p>';
    const payButton = document.getElementById('pay-button');
    if (payButton) payButton.disabled = true;
}

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

function updateTotals(cart) {
    const select = document.getElementById('shipping-select');
    const shipping = select ? parseFloat(select.value) || 15 : 15;
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + shipping;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('grand-total').textContent = `$${total.toFixed(2)}`;
}

// 页面加载初始化
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.checkout-page')) {
        initCheckoutPage();
    }
});

window.handleCreemPayment = handleCreemPayment;
window.initCheckoutPage = initCheckoutPage;
