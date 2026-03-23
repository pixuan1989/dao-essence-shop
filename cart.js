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

// 产品数据（可动态扩展）
let products = {
    'jade-pendant': {
        id: 'jade-pendant',
        name: 'Jade Pendant - Harmony',
        nameCn: '玉佩 - 和谐',
        price: 128,
        image: 'images/jade-pendant.jpg',
        category: 'jewelry'
    },
    'incense-burner': {
        id: 'incense-burner',
        name: 'Bronze Incense Burner',
        nameCn: '青铜香炉',
        price: 89,
        image: 'images/incense-burner.jpg',
        category: 'ritual'
    },
    'calligraphy-set': {
        id: 'calligraphy-set',
        name: 'Calligraphy Set',
        nameCn: '书法套装',
        price: 156,
        image: 'images/calligraphy-set.jpg',
        category: 'art'
    },
    'tea-set': {
        id: 'tea-set',
        name: 'Five Elements Tea Set',
        nameCn: '五行茶具',
        price: 198,
        image: 'images/tea-set.jpg',
        category: 'tea'
    },
    'singing-bowl': {
        id: 'singing-bowl',
        name: 'Singing Bowl - Balance',
        nameCn: '颂钵 - 平衡',
        price: 168,
        image: 'images/singing-bowl.jpg',
        category: 'meditation'
    },
    'feng-shui-compass': {
        id: 'feng-shui-compass',
        name: 'Feng Shui Compass',
        nameCn: '风水罗盘',
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

// 添加商品到购物车
function addToCart(productId, quantity = 1) {
    const product = products[productId];
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }

    const existingItem = cart.items.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.items.push({
            id: product.id,
            name: product.name,
            nameCn: product.nameCn,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }

    saveCartToStorage();
    updateCartUI();
    showNotification(`${product.nameCn} 已添加到购物车`);
}

// 从购物车移除商品
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

// 更新商品数量
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
    const badges = document.querySelectorAll('.cart-badge');
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
                <p>探索我们的五行能量产品</p>
                <a href="shop.html" class="btn btn-primary">浏览商品</a>
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

    document.body.appendChild(notification);

    // 动画显示
    setTimeout(() => notification.classList.add('show'), 10);

    // 3秒后自动关闭
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/* ============================================
   Creem 产品动态注册（支持 Creem API 产品）
   ============================================ */

// 注册 Creem 产品到产品库
window.registerCreemProducts = function(creemProducts) {
    console.log('📦 Registering Creem products...');
    
    if (!Array.isArray(creemProducts)) {
        console.error('❌ creemProducts must be an array');
        return;
    }
    
    creemProducts.forEach(p => {
        const productId = p.id || p.product_id;
        const productName = p.name || p.product_name || 'Unknown';
        const productPrice = parseFloat(p.price || 0);
        const productImage = p.img_url || p.image || '';
        
        console.log(`✅ Registering: ${productName} ($${productPrice})`);
        
        products[productId] = {
            id: productId,
            name: productName,
            nameCn: productName,
            price: productPrice,
            image: productImage,
            category: 'creem',
            description: p.description || p.product_description || ''
        };
    });
    
    console.log(`✅ Total products registered: ${Object.keys(products).length}`);
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
window.products = products;
window.shippingRates = shippingRates;
