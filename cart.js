/* ============================================
   DAO Essence - Shopping Cart Module
   购物车功能模块
   ============================================ */

// 购物车数据结构
let cart = {
    items: [],
    currency: 'USD',
    exchangeRate: 7.2 // USD to CNY
};

// 卡数据（可动态扩展）
let cards = {
    'jade-pendant': {
        id: 'jade-pendant',
        name: 'Jade Pendant - Harmony',
        nameCn: '玉佩卡 - 和谐',
        price: 128,
        image: 'images/jade-pendant.jpg',
        category: 'jewelry'
    },
    'incense-burner': {
        id: 'incense-burner',
        name: 'Bronze Incense Burner',
        nameCn: '青铜香炉卡',
        price: 89,
        image: 'images/incense-burner.jpg',
        category: 'ritual'
    },
    'calligraphy-set': {
        id: 'calligraphy-set',
        name: 'Calligraphy Set',
        nameCn: '书法套装卡',
        price: 156,
        image: 'images/calligraphy-set.jpg',
        category: 'art'
    },
    'tea-set': {
        id: 'tea-set',
        name: 'Five Elements Tea Set',
        nameCn: '五行茶具卡',
        price: 198,
        image: 'images/tea-set.jpg',
        category: 'tea'
    },
    'singing-bowl': {
        id: 'singing-bowl',
        name: 'Singing Bowl - Balance',
        nameCn: '颂钵卡 - 平衡',
        price: 168,
        image: 'images/singing-bowl.jpg',
        category: 'meditation'
    },
    'feng-shui-compass': {
        id: 'feng-shui-compass',
        name: 'Feng Shui Compass',
        nameCn: '风水罗盘卡',
        price: 238,
        image: 'images/feng-shui-compass.jpg',
        category: 'tools'
    }
};

// 运费配置
const shippingRates = {
    standard: {
        name: 'Standard Shipping',
        nameCn: '标准运输',
        price: 15,
        days: '15-25',
        description: 'International Standard (15-25 days)'
    },
    express: {
        name: 'Express Shipping',
        nameCn: '快速运输',
        price: 35,
        days: '7-12',
        description: 'International Express (7-12 days)'
    },
    dhl: {
        name: 'DHL Express',
        nameCn: 'DHL 快递',
        price: 55,
        days: '3-5',
        description: 'DHL International (3-5 days)'
    }
};

/* ============================================
   购物车核心功能
   ============================================ */

// 初始化购物车
function initCart() {
    loadCartFromStorage();
    updateCartUI();
    initCartButtons();
}

// 从 localStorage 加载购物车
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('daoessence_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// 保存购物车到 localStorage
function saveCartToStorage() {
    localStorage.setItem('daoessence_cart', JSON.stringify(cart));
}

// 🔥 修复：添加卡到购物车 - 支持 Creem API 卡和静态卡
function addToCart(productId, quantity = 1) {
    let card = null;
    
    // 优先级 1：查 Creem 同步的卡
    if (window.allProducts) {
        card = window.allProducts.find(p => p.id === productId);
        if (card) {
            // 🔥 Creem 卡字段名是 nameCN（大写 N），兼容处理
            console.log('✅ Found card from Creem API:', card.nameCN || card.nameCn || card.name);
        }
    }
    
    // 优先级 2：查静态卡库
    if (!card && cards[productId]) {
        card = cards[productId];
        console.log('✅ Found card from static list:', card.nameCn || card.nameCN || card.name);
    }
    
    if (!card) {
        console.error('❌ Card not found:', productId);
        alert('卡未找到，请刷新页面重试');
        return;
    }

    // 兼容 nameCN（Creem）和 nameCn（静态）两种字段名
    const displayName = card.nameCN || card.nameCn || card.name || card.title || 'Unknown Card';
    const existingItem = cart.items.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
        console.log('✅ Updated quantity for', displayName, '→', existingItem.quantity);
    } else {
        cart.items.push({
            id: card.id,
            name: card.name || card.title || 'Unknown Card',
            nameCn: displayName,
            price: card.price || 0,
            // 🔥 兼容 image_url（Creem）和 image（静态）
            image: card.image_url || card.image || card.thumbnail || '',
            quantity: quantity
        });
        console.log('✅ Added new item to cart:', displayName);
    }

    // 确保 window.cart 和 cart 对象同步
    window.cart = cart;
    
    saveCartToStorage();
    updateCartUI();
    showNotification(`${displayName} 已添加到购物车`);
    console.log('🛒 Cart items count:', cart.items.length, '| Total items:', cart.items.reduce((sum, item) => sum + item.quantity, 0));
}

// 从购物车移除卡
function removeFromCart(productId) {
    const index = cart.items.findIndex(item => item.id === productId);
    if (index > -1) {
        const item = cart.items[index];
        cart.items.splice(index, 1);
        saveCartToStorage();
        updateCartUI();
        showNotification(`${item.nameCn} 已从购物车移除`);
    }
}

// 更新卡数量
function updateQuantity(productId, newQuantity) {
    const item = cart.items.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            saveCartToStorage();
            updateCartUI();
        }
    }
}

// 清空购物车
function clearCart() {
    cart.items = [];
    saveCartToStorage();
    updateCartUI();
    showNotification('购物车已清空');
}

// 获取购物车总价
function getCartTotal() {
    return cart.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
}

// 获取购物车总数量
function getCartCount() {
    return cart.items.reduce((count, item) => {
        return count + item.quantity;
    }, 0);
}

/* ============================================
   UI 更新功能
   ============================================ */

// 更新购物车 UI
function updateCartUI() {
    updateCartBadge();
    updateCartDropdown();
    updateCartPage();
}

// 更新购物车徽章
function updateCartBadge() {
    const badges = document.querySelectorAll('.cart-badge, .floating-cart-badge');
    const count = getCartCount();
    
    badges.forEach(badge => {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    });
}

// 更新购物车下拉菜单
function updateCartDropdown() {
    const cartItems = document.querySelector('.cart-items');
    const cartTotal = document.querySelector('.cart-total-amount');
    
    if (!cartItems) return;

    if (cart.items.length === 0) {
        cartItems.innerHTML = '<p class="cart-empty">购物车是空的</p>';
    } else {
        cartItems.innerHTML = cart.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.nameCn}</h4>
                    <p class="cart-item-price">$${item.price} × ${item.quantity}</p>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">
                    <i>×</i>
                </button>
            </div>
        `).join('');
    }

    if (cartTotal) {
        cartTotal.textContent = `$${getCartTotal().toFixed(2)}`;
    }
}

// 更新购物车页面
function updateCartPage() {
    const cartPageItems = document.querySelector('.cart-page-items');
    const cartPageTotal = document.querySelector('.cart-page-total');
    
    if (!cartPageItems) return;

    if (cart.items.length === 0) {
        cartPageItems.innerHTML = `
            <div class="cart-empty-state">
                <i class="cart-empty-icon">🛒</i>
                <h3>购物车是空的</h3>
                <p>探索我们的五行能量卡</p>
                <a href="shop.html" class="btn btn-primary">浏览卡</a>
            </div>
        `;
    } else {
        cartPageItems.innerHTML = cart.items.map(item => `
            <div class="cart-page-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-page-item-image">
                <div class="cart-page-item-info">
                    <h3>${item.nameCn}</h3>
                    <p class="cart-page-item-name-en">${item.name}</p>
                    <p class="cart-page-item-price">$${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-page-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
                <div class="cart-page-item-subtotal">
                    $${(item.price * item.quantity).toFixed(2)}
                </div>
                <button class="cart-page-item-remove" onclick="removeFromCart('${item.id}')">
                    删除
                </button>
            </div>
        `).join('');
    }

    if (cartPageTotal) {
        cartPageTotal.textContent = `$${getCartTotal().toFixed(2)}`;
    }
}

// 初始化购物车按钮
function initCartButtons() {
    // 添加购物车按钮
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.dataset.productId;
            addToCart(productId);
        });
    });

    // 购物车图标点击
    const cartIcon = document.querySelector('.cart-icon');
    const cartDropdown = document.querySelector('.cart-dropdown');
    
    if (cartIcon && cartDropdown) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            cartDropdown.classList.toggle('active');
        });

        // 点击外部关闭
        document.addEventListener('click', function(e) {
            if (!cartIcon.contains(e.target) && !cartDropdown.contains(e.target)) {
                cartDropdown.classList.remove('active');
            }
        });
    }
}

// 显示通知
function showNotification(message) {
    // 移除现有通知
    const existingNotification = document.querySelector('.cart-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // 创建新通知
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <span class="notification-icon">✓</span>
        <span class="notification-message">${message}</span>
    `;

    // 设置样式，确保不被遮挡
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #2D5A3D;
        color: #F5F0E6;
        padding: 15px 25px;
        border-radius: 4px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        border-left: 3px solid #D4AF37;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
    `;

    document.body.appendChild(notification);

    // 动画显示
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);

    // 3秒后自动关闭
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/* ============================================
   Creem 产品动态注册（支持 Creem API 产品）
   ============================================ */

// 注册 Creem 卡到卡库
window.registerCreemProducts = function(creemProducts) {
    console.log('📦 Registering Creem cards...');
    
    if (!Array.isArray(creemProducts)) {
        console.error('❌ creemProducts must be an array');
        return;
    }
    
    creemProducts.forEach(p => {
        const cardId = p.id || p.product_id;
        const cardName = p.name || p.product_name || 'Unknown';
        const cardPrice = parseFloat(p.price || 0);
        const cardImage = p.img_url || p.image || '';
        
        console.log(`✅ Registering: ${cardName} ($${cardPrice})`);
        
        cards[cardId] = {
            id: cardId,
            name: cardName,
            nameCn: cardName,
            price: cardPrice,
            image: cardImage,
            category: 'creem',
            description: p.description || p.product_description || ''
        };
    });
    
    console.log(`✅ Total cards registered: ${Object.keys(cards).length}`);
};

/* ============================================
   导出功能
   ============================================ */

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', initCart);

// 导出函数供全局使用
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.clearCart = clearCart;
window.getCartTotal = getCartTotal;
window.getCartCount = getCartCount;
window.updateCartUI = updateCartUI;
window.updateCartBadge = updateCartBadge;
window.cart = cart;
window.cards = cards;
window.shippingRates = shippingRates;
