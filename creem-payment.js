/**
 * ============================================
 * DAO Essence - Creem 支付集成
 * ============================================
 */

// API 路径 - 部署时用相对路径
const API_BASE_URL = '/api';

/**
 * 太极过渡动画遮罩
 */
function showTaijituOverlay(onDone) {
    // 防止重复创建
    const existing = document.getElementById('taijitu-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'taijitu-overlay';
    overlay.style.cssText = `
        position: fixed; inset: 0;
        background: rgba(0, 0, 0, 0.45);
        display: flex; align-items: center; justify-content: center;
        z-index: 99999;
        opacity: 0;
        transition: opacity 0.4s ease;
    `;

    overlay.innerHTML = `
        <style>
            @keyframes taiji-spin {
                from { transform: rotate(0deg); }
                to   { transform: rotate(360deg); }
            }
            @keyframes taiji-fade-in {
                from { opacity: 0; transform: scale(0.85); }
                to   { opacity: 1; transform: scale(1); }
            }
            #taijitu-card {
                background: #fff;
                border-radius: 16px;
                padding: 48px 56px;
                display: flex;
                flex-direction: column;
                align-items: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.25);
                animation: taiji-fade-in 0.4s ease forwards;
            }
            #taijitu-svg {
                animation: taiji-spin 6s linear infinite;
                filter: drop-shadow(0 0 8px rgba(0,0,0,0.08));
            }
            #taijitu-text {
                margin-top: 24px;
                color: #222;
                font-size: 15px;
                letter-spacing: 0.15em;
                font-family: 'Georgia', serif;
            }
            #taijitu-sub {
                margin-top: 8px;
                color: #999;
                font-size: 12px;
                letter-spacing: 0.12em;
            }
        </style>

        <div id="taijitu-card">
            <svg id="taijitu-svg" width="80" height="80" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path d="M209.834667 814.122667A427.050667 427.050667 0 0 1 511.573333 85.333333h0.938667a427.050667 427.050667 0 0 1 300.8 728.789334 425.813333 425.813333 0 0 1-603.434667 0z m301.952-110.122667a64 64 0 1 0 64-64 64 64 0 0 0-64 64zM270.165333 271.061333a341.76 341.76 0 0 0 0 482.688c2.090667 2.090667 4.266667 4.266667 6.528 5.973334l4.266667 3.626666a1.365333 1.365333 0 0 0 0-0.341333 3.370667 3.370667 0 0 1 0-0.554667c-14.378667-60.928-5.888-179.498667 212.266667-288.512 124.586667-62.250667 187.050667-135.893333 171.434666-202.112A156.373333 156.373333 0 0 0 512.682667 170.666667h-1.109334a339.413333 339.413333 0 0 0-241.408 100.394666zM383.786667 320a64 64 0 1 1 64 64 64 64 0 0 1-64-64z" fill="#212B36"/>
            </svg>
            <div id="taijitu-text">正在跳转支付</div>
            <div id="taijitu-sub">Redirecting to secure payment...</div>
        </div>
    `;

    document.body.appendChild(overlay);

    // 淡入
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
    });

    // 1.5 秒后执行回调（打开支付），再淡出
    setTimeout(() => {
        if (typeof onDone === 'function') onDone();
        // 淡出并移除
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 400);
        }, 600);
    }, 1500);
}

/**
 * 创建 Creem Checkout 并在新标签页打开（带过渡动画）
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

        // 展示太极动画，动画结束后在新标签页打开支付（不离开当前页面）
        showTaijituOverlay(() => {
            window.open(data.checkoutUrl, '_blank');
        });

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
    const tax = subtotal * 0.10; // 税费 10%
    const total = subtotal + shipping + tax;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax-cost').textContent = `$${tax.toFixed(2)}`;
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
