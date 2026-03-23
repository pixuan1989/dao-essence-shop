// ============================================// 从 Creem API 拉取产品数据// ============================================// 从 window.allProducts 中获取产品数据，由 creem-sync-v2.js 填充

// ============================================// 根据URL参数加载产品数据// ============================================let PRODUCT_DATA = null;let currentVariant = null;let selectedOptions = {};let totalCartQuantity = 0;function loadProductData() {    // 从URL获取产品ID    const urlParams = new URLSearchParams(window.location.search);    const productId = urlParams.get('id');    console.log('URL Product ID:', productId);    console.log('Available products from Creem API:', window.allProducts ? window.allProducts.length : 0);    // 如果没有指定ID，使用默认产品 (传统沉香)    const defaultProductId = 'prod_7i2asEAuHFHl5hJMeCEsfB';    const actualProductId = productId || defaultProductId;    console.log('Loading product:', actualProductId);    // 从 window.allProducts 中获取产品数据    if (typeof window.allProducts !== 'undefined' && window.allProducts.length > 0) {        PRODUCT_DATA = window.allProducts.find(p => p.id === actualProductId) || window.allProducts.find(p => p.id === defaultProductId);    }    if (!PRODUCT_DATA) {        console.error('Product not found:', actualProductId);        // 使用默认数据结构作为 fallback        PRODUCT_DATA = {            id: actualProductId,            title: 'Product Not Found',            titleZh: '产品未找到',            handle: 'product-not-found',            description: 'Product not available',            descriptionZh: '产品不可用',            price: 0,            compareAtPrice: null,            currency: 'USD',            images: [                {                    id: 1,                    src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=1200&fit=crop',                    alt: 'Product Image',                    width: 1200,                    height: 1200,                    position: 1                }            ],            variants: [                {                    id: `${actualProductId}-1`,                    title: 'Default',                    price: 0,                    compareAtPrice: null,                    available: false,                    inventoryQuantity: 0,                    options: {                        type: 'default'                    }                }            ],            metafields: {                energy: {                    five_element: 'Unknown',                    type: 'Unknown',                    intensity: 'Unknown',                    direction: 'Unknown',                    benefits: [],                    suitable_for: []                }            }        };    } else {        // 转换 Creem API 数据格式为页面所需格式        PRODUCT_DATA = {            ...PRODUCT_DATA,            title: PRODUCT_DATA.name,            titleZh: PRODUCT_DATA.nameCN,            handle: PRODUCT_DATA.name.toLowerCase().replace(/\s+/g, '-'),            type: PRODUCT_DATA.category,            images: (PRODUCT_DATA.images || [PRODUCT_DATA.image]).map((img, index) => ({                id: index + 1,                src: typeof img === 'string' ? img : img,                alt: PRODUCT_DATA.nameCN,                width: 1200,                height: 1200,                position: index + 1            })),            variants: [                {                    id: `${PRODUCT_DATA.id}-1`,                    title: '一次性购买',                    price: PRODUCT_DATA.price,                    compareAtPrice: PRODUCT_DATA.originalPrice || null,                    available: true,                    inventoryQuantity: PRODUCT_DATA.stock || 999,                    options: {                        type: 'single'                    },                    specs: {                        quantity: '单次购买'                    }                }            ],            metafields: {                energy: {                    five_element: PRODUCT_DATA.element || 'Unknown',                    type: '能量产品',                    intensity: PRODUCT_DATA.energyLevel || 'Medium',                    direction: '全方位',                    benefits: PRODUCT_DATA.benefits || [],                    suitable_for: PRODUCT_DATA.suitable_for || []                }            }        };    }    console.log('Loaded product:', PRODUCT_DATA.id, PRODUCT_DATA.title);    return true;}

// ============================================
// 初始化购物车
// ============================================

// 初始化第一个变体和选项
function initState() {
    if (PRODUCT_DATA && PRODUCT_DATA.variants && PRODUCT_DATA.variants.length > 0) {
        currentVariant = PRODUCT_DATA.variants[0];

        // 根据第一个变体初始化选项
        if (currentVariant.options) {
            Object.keys(currentVariant.options).forEach(key => {
                selectedOptions[key] = currentVariant.options[key];
            });
        }

        // 初始化UI
        updateUIForVariant(currentVariant);

        // 初始化总价
        updateTotalPrice();
    }
}

// ============================================
// 图片渲染函数
// ============================================

function renderImages() {
    const mainWrapper = document.getElementById('mainImageWrapper');
    const thumbsWrapper = document.getElementById('thumbsWrapper');
    
    console.log('renderImages called');
    console.log('mainImageWrapper element:', mainWrapper);
    console.log('thumbsWrapper element:', thumbsWrapper);

    if (!PRODUCT_DATA || !PRODUCT_DATA.images) {
        console.warn('No product images found');
        return;
    }
    
    console.log('Product images:', PRODUCT_DATA.images);

    // 渲染主图
    if (mainWrapper) {
        console.log('mainImageWrapper innerHTML before:', mainWrapper.innerHTML);
        mainWrapper.innerHTML = PRODUCT_DATA.images.map(img => `
            <div class="swiper-slide">
                <img src="${img.src}" alt="${img.alt}" data-full="${img.src}">
            </div>
        `).join('');
        console.log('mainImageWrapper innerHTML after:', mainWrapper.innerHTML);
    } else {
        console.error('mainImageWrapper not found');
    }

    // 渲染缩略图
    if (thumbsWrapper) {
        console.log('thumbsWrapper innerHTML before:', thumbsWrapper.innerHTML);
        thumbsWrapper.innerHTML = PRODUCT_DATA.images.map(img => `
            <div class="swiper-slide">
                <img src="${img.src}" alt="${img.alt}">
            </div>
        `).join('');
        console.log('thumbsWrapper innerHTML after:', thumbsWrapper.innerHTML);
    } else {
        console.error('thumbsWrapper not found');
    }
}

// ============================================
// Swiper 初始化
// ============================================

let thumbsSwiper, mainSwiper;

function initSwiper() {
    console.log('initSwiper called');
    
    // 检查元素是否存在
    const swiperThumbs = document.querySelector('.swiper-thumbs');
    const swiperMain = document.querySelector('.swiper-main');
    
    console.log('swiper-thumbs element:', swiperThumbs);
    console.log('swiper-main element:', swiperMain);
    
    // 检查swiper-wrapper内容
    const mainWrapper = document.getElementById('mainImageWrapper');
    const thumbsWrapper = document.getElementById('thumbsWrapper');
    
    if (mainWrapper) {
        console.log('mainImageWrapper content before Swiper init:', mainWrapper.innerHTML);
        console.log('mainImageWrapper computed styles:', {
            display: getComputedStyle(mainWrapper).display,
            width: getComputedStyle(mainWrapper).width,
            height: getComputedStyle(mainWrapper).height,
            visibility: getComputedStyle(mainWrapper).visibility
        });
    }
    if (thumbsWrapper) {
        console.log('thumbsWrapper content before Swiper init:', thumbsWrapper.innerHTML);
    }
    
    // 如果Swiper实例已存在，先销毁
    if (thumbsSwiper) {
        thumbsSwiper.destroy();
    }
    if (mainSwiper) {
        mainSwiper.destroy();
    }
    
    // 初始化缩略图Swiper
    thumbsSwiper = new Swiper('.swiper-thumbs', {
        spaceBetween: 12,
        slidesPerView: 4,
        freeMode: true,
        watchSlidesProgress: true,
        breakpoints: {
            640: {
                slidesPerView: 5
            }
        },
        autoHeight: false,
        on: {
            init: function() {
                console.log('Thumbs Swiper initialized');
                const thumbsEl = document.querySelector('.swiper-thumbs');
                if (thumbsEl) {
                    const styles = getComputedStyle(thumbsEl);
                    console.log('Thumbs computed:', {
                        width: styles.width,
                        height: styles.height,
                        overflow: styles.overflow
                    });
                }
            }
        }
    });

    // 初始化主Swiper
    mainSwiper = new Swiper('.swiper-main', {
        spaceBetween: 10,
        slidesPerView: 1,
        centeredSlides: true,
        thumbs: {
            swiper: thumbsSwiper
        },
        pagination: {
            el: '.swiper-pagination-main',
            clickable: true
        },
        navigation: {
            nextEl: '.swiper-button-next-main',
            prevEl: '.swiper-button-prev-main'
        },
        zoom: {
            maxRatio: 3,
            toggle: true
        },
        autoHeight: false,
        on: {
            init: function() {
                console.log('Main Swiper initialized');
                const mainEl = document.querySelector('.swiper-main');
                const wrapper = document.getElementById('mainImageWrapper');
                if (mainEl) {
                    const computed = getComputedStyle(mainEl);
                    console.log('Main swiper computed:', {
                        display: computed.display,
                        width: computed.width,
                        height: computed.height,
                        visibility: computed.visibility,
                        opacity: computed.opacity,
                        offsetWidth: mainEl.offsetWidth,
                        offsetHeight: mainEl.offsetHeight
                    });
                    mainEl.style.minHeight = '500px';
                    mainEl.style.height = '500px';
                }
                if (wrapper) {
                    console.log('Wrapper after init:', {
                        offsetWidth: wrapper.offsetWidth,
                        offsetHeight: wrapper.offsetHeight,
                        childCount: wrapper.children.length
                    });
                    // 检查第一个 slide
                    if (wrapper.children.length > 0) {
                        const firstSlide = wrapper.children[0];
                        const slideComputed = getComputedStyle(firstSlide);
                        console.log('First slide:', {
                            offsetWidth: firstSlide.offsetWidth,
                            offsetHeight: firstSlide.offsetHeight,
                            display: slideComputed.display,
                            visibility: slideComputed.visibility
                        });
                    }
                }
                // 强制刷新
                this.update();
            }
        }
    });
    
    // 检查初始化后内容
    if (mainWrapper) {
        console.log('mainImageWrapper content after Swiper init:', mainWrapper.innerHTML);
    }
    if (thumbsWrapper) {
        console.log('thumbsWrapper content after Swiper init:', thumbsWrapper.innerHTML);
    }
    
    console.log('Swiper initialization completed');
}

// ============================================
// 变体渲染逻辑
// ============================================

function renderVariants() {
    if (!PRODUCT_DATA || !PRODUCT_DATA.variants) {
        console.warn('No product variants found');
        return;
    }

    // 分析变体选项
    const variantOptions = {};
    PRODUCT_DATA.variants.forEach(variant => {
        if (variant.options) {
            Object.keys(variant.options).forEach(key => {
                if (!variantOptions[key]) {
                    variantOptions[key] = new Set();
                }
                variantOptions[key].add(variant.options[key]);
            });
        }
    });

    // 渲染选项
    const variantSelector = document.querySelector('.variant-selector');
    if (!variantSelector) return;

    let html = '';

    Object.keys(variantOptions).forEach((optionKey, index) => {
        const values = Array.from(variantOptions[optionKey]);
        const label = optionKey.charAt(0).toUpperCase() + optionKey.slice(1);

        html += `
            <div class="variant-group">
                <div class="variant-label">${label}</div>
                <div class="size-options" data-option="${optionKey}">
                    ${values.map(value => `
                        <div class="size-option ${index === 0 && value === values[0] ? 'selected' : ''}" data-variant="${value}">
                            ${value.charAt(0).toUpperCase() + value.slice(1)}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });

    variantSelector.innerHTML = html;

    // 绑定事件
    document.querySelectorAll('.size-option').forEach(option => {
        option.addEventListener('click', function() {
            const optionType = this.parentElement.dataset.option;
            const value = this.dataset.variant;

            // 移除其他选中状态
            this.parentElement.querySelectorAll('.size-option').forEach(o => o.classList.remove('selected'));

            // 添加选中状态
            this.classList.add('selected');

            // 更新选择
            updateSelectedOptions(optionType, value);
        });
    });
}

// ============================================
// 变体选择逻辑
// ============================================

function updateSelectedOptions(type, value) {
    selectedOptions[type] = value;

    // 查找匹配的变体
    const matchingVariant = PRODUCT_DATA.variants.find(variant => {
        return Object.keys(selectedOptions).every(key => {
            return variant.options && variant.options[key] === selectedOptions[key];
        });
    });

    if (matchingVariant) {
        currentVariant = matchingVariant;
        updateUIForVariant(matchingVariant);
    }
}

function updateUIForVariant(variant) {
    // 价格已经是美元，直接使用
    const priceUSD = parseFloat(variant.price).toFixed(2);
    const comparePriceUSD = parseFloat(variant.compareAtPrice || variant.price).toFixed(2);

    // 更新价格显示为美元（添加存在性检查）
    const currentPriceEl = document.getElementById('currentPrice');
    if (currentPriceEl) {
        currentPriceEl.textContent = `$${priceUSD}`;
    }

    const originalPriceEl = document.getElementById('originalPrice');
    if (originalPriceEl) {
        originalPriceEl.textContent = `$${comparePriceUSD}`;
    }

    // 计算折扣
    const discount = Math.round((1 - variant.price / variant.compareAtPrice) * 100);
    const discountBadgeEl = document.getElementById('discountBadge');
    if (discountBadgeEl) {
        discountBadgeEl.textContent = `-${discount}%`;
    }

    // 计算节省金额（美元）
    const savingsUSD = (parseFloat(comparePriceUSD) - parseFloat(priceUSD)).toFixed(2);
    const savingsTextEl = document.getElementById('savingsText');
    if (savingsTextEl) {
        savingsTextEl.textContent = `Save $${savingsUSD}`;
    }

    // 更新总价
    updateTotalPrice();

    // 更新规格表（如果 variant.specs 存在）
    if (variant.specs) {
        if (variant.specs.size) {
            const specSize = document.getElementById('specSize');
            if (specSize) specSize.textContent = variant.specs.size;
        }
        if (variant.specs.weight) {
            const specWeight = document.getElementById('specWeight');
            if (specWeight) specWeight.textContent = variant.specs.weight;
        }
        if (variant.specs.material) {
            const specMaterial = document.getElementById('specMaterial');
            if (specMaterial) specMaterial.textContent = variant.specs.material;
        }
    }

    // 更新库存
    const stockCount = document.querySelector('.stock-count');
    if (stockCount && variant.inventoryQuantity !== undefined) {
        if (variant.inventoryQuantity <= 5) {
            stockCount.textContent = `Only ${variant.inventoryQuantity} left`;
            stockCount.style.background = 'var(--fire-primary)';
        } else {
            stockCount.textContent = `${variant.inventoryQuantity} in stock`;
            stockCount.style.background = 'var(--wood-primary)';
        }
    }
}

// ============================================
// 事件绑定
// ============================================
// 变体选择事件已在 renderVariants() 中处理

// ============================================
// 购物车管理
// ============================================

// 保存购物车到localStorage
function saveCart() {
    // 使用cart.js中的saveCartToStorage函数
    if (typeof saveCartToStorage === 'function') {
        saveCartToStorage();
    } else {
        localStorage.setItem('daoessence_cart', JSON.stringify(cart));
    }
    updateCartDisplay();
    updateCartSidebar();
}

// 计算购物车总数量
function calculateTotalQuantity() {
    // 使用cart.js中的getCartCount函数
    if (typeof getCartCount === 'function') {
        totalCartQuantity = getCartCount();
    } else {
        totalCartQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    }
    return totalCartQuantity;
}

// 更新购物车显示(购物车按钮计数)
function updateCartDisplay() {
    calculateTotalQuantity();
    
    // 更新 .cart-count 元素
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalCartQuantity;
        if (totalCartQuantity > 0) {
            cartCountElement.style.display = 'flex';
        } else {
            cartCountElement.style.display = 'none';
        }
    }
    
    // 更新浮动购物车徽章 (.floating-cart-badge)
    const floatingBadge = document.getElementById('floatingCartBadge');
    if (floatingBadge) {
        floatingBadge.textContent = totalCartQuantity;
        if (totalCartQuantity > 0) {
            floatingBadge.style.display = 'flex';
        } else {
            floatingBadge.style.display = 'none';
        }
    }
    
    console.log('Cart display updated:', totalCartQuantity);
}

// 更新购物车侧边栏内容
function updateCartSidebar() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotalElement = document.querySelector('.cart-total span:last-child');

    if (cart.items.length === 0) {
        cartItemsContainer.innerHTML = `<p style="text-align: center; color: rgba(245, 240, 230, 0.6); padding: 2rem;">Your cart is empty</p>`;
        cartTotalElement.textContent = '$0.00';
    } else {
        let total = 0;
        cartItemsContainer.innerHTML = cart.items.map((item, index) => {
            total += item.price * item.quantity;
            // 兼容新旧数据结构（支持 name/titleEn/title）
            const title = item.name || item.titleEn || item.title || 'Unknown Product';
            return `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${title}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-title">${title}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                        <div class="cart-item-quantity">
                            <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                            <span class="qty-value">${item.quantity}</span>
                            <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        cartTotalElement.textContent = `$${total.toFixed(2)}`;
    }
}

// 修改商品数量
window.changeQty = function(index, delta) {
    cart.items[index].quantity += delta;
    if (cart.items[index].quantity <= 0) {
        cart.items.splice(index, 1);
    }
    saveCart();
};

// ============================================
// 购物车侧边栏事件管理
// ============================================

// 切换购物车显示/隐藏
function toggleCart() {
    console.log('=== toggleCart() CALLED ===');
    
    try {
        const cartSidebar = document.querySelector('.cart-sidebar');
        const cartOverlay = document.querySelector('.cart-overlay');
        
        console.log('Cart sidebar element:', cartSidebar);
        console.log('Cart overlay element:', cartOverlay);
        
        if (!cartSidebar) {
            console.error('ERROR: .cart-sidebar not found in DOM');
            console.log('All elements with "cart" in class:', document.querySelectorAll('[class*="cart"]'));
            return false;
        }
        
        if (!cartOverlay) {
            console.error('ERROR: .cart-overlay not found in DOM');
            return false;
        }
        
        console.log('Current sidebar classes:', cartSidebar.className);
        console.log('Current overlay classes:', cartOverlay.className);
        
        // 如果购物车已打开，则关闭
        if (cartSidebar.classList.contains('open')) {
            console.log('ACTION: Closing cart...');
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('show');
            console.log('SUCCESS: Cart closed');
        } else {
            // 打开购物车
            console.log('ACTION: Opening cart...');
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('show');
            console.log('SUCCESS: Cart opened');
            console.log('New sidebar classes:', cartSidebar.className);
            console.log('New overlay classes:', cartOverlay.className);
        }
        
        return true;
    } catch (error) {
        console.error('EXCEPTION in toggleCart():', error);
        console.error('Stack:', error.stack);
        return false;
    }
}

// 关闭购物车
function closeCart() {
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('show');
    }
}

// 打开购物车
function openCart() {
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('show');
    }
}

// 页面加载完成后，绑定购物车事件
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOMContentLoaded Event Fired ===');
    
    // 查询购物车元素
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    const cartHeader = document.querySelector('.cart-header');
    
    // 浮动购物车按钮
    const floatingCartBtn = document.querySelector('.floating-cart-btn');
    
    console.log('Cart elements found:');
    console.log('  - cartSidebar:', cartSidebar ? '✅' : '❌');
    console.log('  - cartOverlay:', cartOverlay ? '✅' : '❌');
    console.log('  - floatingCartBtn:', floatingCartBtn ? '✅' : '❌');
    console.log('  - toggleCart function type:', typeof toggleCart);
    
    // 绑定浮动购物车按钮
    if (floatingCartBtn) {
        console.log('Binding click event to floating cart button...');
        floatingCartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('✅ Floating cart button clicked via addEventListener');
            
            // 确保 toggleCart 是函数
            if (typeof toggleCart === 'function') {
                console.log('Calling toggleCart()...');
                toggleCart();
            } else {
                console.error('❌ ERROR: toggleCart is not a function! Type:', typeof toggleCart);
            }
        });
        console.log('✅ Click event listener attached successfully');
    } else {
        console.error('❌ ERROR: floatingCartBtn not found!');
    }
    
    // 绑定覆盖层点击事件（点击覆盖层关闭购物车）
    if (cartOverlay) {
        cartOverlay.addEventListener('click', function(e) {
            // 只在点击覆盖层本身时关闭，不在sidebar上点击时关闭
            if (e.target === cartOverlay) {
                closeCart();
            }
        });
    }
    
    // 查找并绑定关闭按钮
    // 在cart-header内查找第一个button（关闭按钮）
    if (cartHeader) {
        const closeBtn = cartHeader.querySelector('button');
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                closeCart();
            });
        }
    }
    
    console.log('=== DOMContentLoaded Binding Complete ===\n');
});

// 添加到购物车
function addToCart() {
    if (!currentVariant) {
        alert('Please select a variant');
        return;
    }

    const quantity = parseInt(document.getElementById('quantity').value);
    // 价格已经是美元，不需要转换
    const priceUSD = currentVariant.price;

    // 生成统一的商品标识（用于匹配相同商品）
    const productKey = PRODUCT_DATA.handle || PRODUCT_DATA.id;

    // 检查购物车中是否已有该商品
    const existingItem = cart.items.find(item => {
        return item.id === productKey;
    });

    if (existingItem) {
        // 已存在该商品，增加数量
        existingItem.quantity += quantity;
        existingItem.price = priceUSD;  // 更新价格
        const totalPriceUSD = (existingItem.quantity * priceUSD).toFixed(2);
        showNotification(`Updated: ${quantity} more added - Total: ${existingItem.quantity} items`);
    } else {
        // 新商品，添加到购物车
        cart.items.push({
            id: productKey,  // 商品ID
            name: PRODUCT_DATA.title,  // 英文名
            nameCn: PRODUCT_DATA.titleZh || PRODUCT_DATA.title.split(' ')[0], // 中文名
            price: priceUSD,  // 美元价格（不转换）
            quantity: quantity,
            image: PRODUCT_DATA.images[0]?.src || ''
        });
        const totalPriceUSD = (quantity * priceUSD).toFixed(2);
        showNotification(`Added ${quantity} item(s) to cart - Total: $${totalPriceUSD}`);
    }

    // 更新库存显示（模拟库存减少）
    updateStockDisplay(quantity);
    saveCart();
    updateCartDisplay();
    updateCartSidebar();
}

// 更新库存显示
function updateStockDisplay(quantitySold) {
    if (currentVariant && currentVariant.inventoryQuantity !== undefined) {
        const newStock = currentVariant.inventoryQuantity - quantitySold;
        const stockCount = document.querySelector('.stock-count');

        if (stockCount && newStock > 0) {
            if (newStock <= 5) {
                stockCount.textContent = `Only ${newStock} left`;
                stockCount.style.background = 'var(--fire-primary)';
            } else {
                stockCount.textContent = `${newStock} in stock`;
                stockCount.style.background = 'var(--wood-primary)';
            }
            // 更新库存数据
            currentVariant.inventoryQuantity = newStock;
        } else {
            stockCount.textContent = 'Out of Stock';
            stockCount.style.background = '#999';
            // 禁用添加到购物车按钮
            document.querySelector('.btn-add-cart').disabled = true;
            document.querySelector('.btn-add-cart').style.opacity = '0.5';
            document.querySelector('.btn-add-cart').style.cursor = 'not-allowed';
        }
    }
}

// ============================================
// 购买功能
// ============================================

// 人民币转美元汇率
const CNY_TO_USD_RATE = 0.14;

function convertToUSD(priceCNY) {
    return (priceCNY * CNY_TO_USD_RATE).toFixed(2);
}

function updateQuantity(change) {
    const input = document.getElementById('quantity');
    let value = parseInt(input.value) + change;
    if (value < 1) value = 1;
    if (value > 99) value = 99;
    input.value = value;

    // 更新总价
    updateTotalPrice();
}

function updateTotalPrice() {
    const quantity = parseInt(document.getElementById('quantity').value);
    if (currentVariant) {
        // 价格已经是美元，不需要转换
        const priceUSD = currentVariant.price;
        const totalUSD = (priceUSD * quantity).toFixed(2);

        document.getElementById('totalPrice').textContent = `$${totalUSD}`;
    }
}


function buyNow() {
    // 立即购买：直接打开购物车侧边栏，显示"即将进入结算"提示
    const quantity = parseInt(document.getElementById('quantity').value);

    if (!currentVariant) {
        showNotification('Please select a variant');
        return;
    }

    const priceUSD = parseFloat(currentVariant.price);

    // 使用商品的基本 id 作为标识（与 addToCart 保持一致）
    const productKey = PRODUCT_DATA.handle || PRODUCT_DATA.id;

    // 检查购物车中是否已有该商品
    const existingItem = cart.items.find(item => {
        return item.id === productKey;
    });

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.items.push({
            id: productKey,
            name: PRODUCT_DATA.title,
            nameCn: PRODUCT_DATA.titleZh || PRODUCT_DATA.title.split(' ')[0],
            price: priceUSD,
            quantity: quantity,
            image: PRODUCT_DATA.images[0]?.src || ''
        });
    }

    // 更新库存显示
    updateStockDisplay(quantity);
    saveCart();

    // 显示准备结算提示
    showNotification('Cart updated - Ready to checkout');

    // 打开购物车侧边栏
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    if (cartSidebar && cartOverlay) {
        cartOverlay.classList.add('show');
        cartSidebar.classList.add('open');
    }
}

function toggleWishlist() {
    showNotification('已添加到愿望清单');
}

// 显示通知
function showNotification(message, duration = 3000) {
    // 检查是否已存在通知容器
    let notification = document.querySelector('.notification-toast');
    
    // 如果不存在，创建一个
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification-toast';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--accent-color);
            color: var(--bg-dark);
            padding: 16px 24px;
            border-radius: var(--radius-md);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 9999;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s ease;
            font-weight: 600;
        `;
        document.body.appendChild(notification);
    }
    
    // 设置消息
    notification.textContent = message;
    
    // 显示通知
    setTimeout(() => {
        notification.style.transform = 'translateY(0)';
        notification.style.opacity = '1';
    }, 10);
    
    // 隐藏并移除通知
    setTimeout(() => {
        notification.style.transform = 'translateY(100px)';
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
}

// ============================================
// 图片放大功能
// ============================================

function openImageModal() {
    if (!mainSwiper) {
        console.warn('Swiper not initialized');
        return;
    }
    const currentSlide = mainSwiper.slides[mainSwiper.activeIndex];
    const img = currentSlide.querySelector('img');
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');

    modalImage.src = img.dataset.full || img.src;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// 点击主图放大
setTimeout(() => {
    document.querySelector('.swiper-main')?.addEventListener('click', function(e) {
        if (e.target.tagName === 'IMG') {
            openImageModal();
        }
    });
}, 200);

// 点击模态框背景关闭
document.getElementById('imageModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeImageModal();
    }
});

// ESC键关闭模态框
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeImageModal();
    }
});

// ============================================
// 后台管理API接口（为Shopify集成准备）
// ============================================

// 获取产品数据
function getProductData() {
    return PRODUCT_DATA;
}

// 更新变体价格
function updateVariantPrice(variantId, newPrice) {
    const variant = PRODUCT_DATA.variants.find(v => v.id === variantId);
    if (variant) {
        variant.price = newPrice;
        return true;
    }
    return false;
}

// 添加产品图片
function addProductImage(imageData) {
    const newImage = {
        id: Date.now(),
        src: imageData.src,
        alt: imageData.alt || '',
        width: imageData.width || 1200,
        height: imageData.height || 1200,
        position: PRODUCT_DATA.images.length + 1
    };
    
    PRODUCT_DATA.images.push(newImage);
    // 这里会重新渲染图片列表
    renderImages();
    return newImage;
}

// 删除产品图片
function removeProductImage(imageId) {
    const index = PRODUCT_DATA.images.findIndex(img => img.id === imageId);
    if (index > -1) {
        PRODUCT_DATA.images.splice(index, 1);
        // 这里会重新渲染图片列表
        renderImages();
        return true;
    }
    return false;
}

// ============================================
// Shopify API兼容层
// ============================================

const ShopifyAPI = {
    // 获取产品
    getProduct: function(handle) {
        return Promise.resolve(PRODUCT_DATA);
    },
    
    // 添加到购物车
    addToCart: function(variantId, quantity) {
        return Promise.resolve({
            success: true,
            cart: {
                items: [{
                    variant_id: variantId,
                    quantity: quantity
                }]
            }
        });
    },
    
    // 获取变体
    getVariant: function(variantId) {
        return PRODUCT_DATA.variants.find(v => v.id === variantId);
    },
    
    // 获取推荐产品
    getRecommendations: function(productId) {
        return Promise.resolve([]);
    }
};

// ============================================
// 初始化
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');
    
    // 1. 首先加载产品数据（必须在其他操作之前）
    const productLoaded = loadProductData();

    if (!productLoaded) {
        console.error('Failed to load product data');
        return;
    }

    // 2. 初始化购物车数据
    // 购物车数据已经由cart.js初始化
    // 这里只需要确保cart对象存在
    if (typeof cart === 'undefined') {
        cart = { items: [] };
    }

    console.log('Product detail page initialized');
    console.log('Product data:', PRODUCT_DATA);

    // 初始化购物车显示
    updateCartDisplay();
    updateCartSidebar();

    // 等待DOM完全渲染后再执行UI更新
    setTimeout(() => {
        console.log('Starting UI updates...');
        
        // 初始化状态
        initState();

        // 渲染图片
        renderImages();
        console.log('Images rendered');

        // 渲染变体
        renderVariants();
        console.log('Variants rendered');

        // 初始化 Swiper（在图片渲染后）
        setTimeout(() => {
            initSwiper();
            console.log('Swiper initialized');
        }, 100);

        // 更新页面标题
        if (PRODUCT_DATA && PRODUCT_DATA.title) {
            document.title = PRODUCT_DATA.title + ' - DAO Essence';
            console.log('Page title updated:', document.title);
        }

        // 更新头部背景文字
        const header = document.getElementById('productDetailHeader');
        if (header && PRODUCT_DATA.title) {
            const productName = PRODUCT_DATA.title.split(' ')[0] || PRODUCT_DATA.title;
            header.setAttribute('data-product-name', productName);
            console.log('Header background text updated:', productName);
        }

        // 更新面包屑导航
        const breadcrumbCategory = document.getElementById('breadcrumbCategory');
        const breadcrumbProduct = document.getElementById('breadcrumbProduct');
        if (breadcrumbCategory && PRODUCT_DATA.type) {
            breadcrumbCategory.textContent = PRODUCT_DATA.type;
            console.log('Breadcrumb category updated:', PRODUCT_DATA.type);
        }
        if (breadcrumbProduct && PRODUCT_DATA.title) {
            breadcrumbProduct.textContent = PRODUCT_DATA.title.split(' ')[0] || PRODUCT_DATA.title;
            console.log('Breadcrumb product updated:', PRODUCT_DATA.title.split(' ')[0]);
        }

        // 更新页面大标题
        const titleLarge = document.getElementById('pageTitleLarge');
        const titleEn = document.getElementById('pageTitleEn');
        if (titleLarge && PRODUCT_DATA.title) {
            titleLarge.textContent = PRODUCT_DATA.title;
            console.log('Page title large updated:', PRODUCT_DATA.title);
        }
        if (titleEn && PRODUCT_DATA.handle) {
            titleEn.textContent = PRODUCT_DATA.handle.replace(/-/g, ' ').toUpperCase();
            console.log('Page title en updated:', PRODUCT_DATA.handle.replace(/-/g, ' ').toUpperCase());
        }

        // 更新产品名称
        const nameCn = document.querySelector('.product-name-cn');
        const nameEn = document.querySelector('.product-name-en');
        if (nameCn && PRODUCT_DATA.titleZh) {
            nameCn.textContent = PRODUCT_DATA.titleZh;
            console.log('Product name CN updated:', PRODUCT_DATA.titleZh);
        }
        if (nameEn && PRODUCT_DATA.title) {
            nameEn.textContent = PRODUCT_DATA.title;
            console.log('Product name EN updated:', PRODUCT_DATA.title);
        }

        // 更新产品分类标签
        const categoryTag = document.querySelector('.product-category-tag');
        if (categoryTag && PRODUCT_DATA.type) {
            categoryTag.textContent = PRODUCT_DATA.type;
            console.log('Category tag updated:', PRODUCT_DATA.type);
        }

        // 价格已通过 initState() 函数更新（美元），这里不需要重复更新

        // 更新SKU
        const skuCode = document.querySelector('.sku-code');
        if (skuCode && PRODUCT_DATA.id) {
            skuCode.textContent = `SKU: ${PRODUCT_DATA.id.toUpperCase()}`;
            console.log('SKU updated:', PRODUCT_DATA.id.toUpperCase());
        }

        // 更新描述
        const descText = document.querySelector('.description-text');
        if (descText && PRODUCT_DATA.description) {
            descText.innerHTML = `<p>${PRODUCT_DATA.description}</p>`;
            console.log('Description updated');
        }

        // 更新能量属性
        if (PRODUCT_DATA.metafields && PRODUCT_DATA.metafields.energy) {
            const energy = PRODUCT_DATA.metafields.energy;
            const fiveElement = document.querySelector('.attribute-item:nth-child(1) h4 + p');
            const energyType = document.querySelector('.attribute-item:nth-child(2) h4 + p');
            const direction = document.querySelector('.attribute-item:nth-child(3) h4 + p');
            const suitable = document.querySelector('.attribute-item:nth-child(4) h4 + p');

            if (fiveElement && energy.five_element) {
                fiveElement.textContent = `${energy.five_element}元素`;
                console.log('Five element updated:', energy.five_element);
            }
            if (energyType && energy.type) {
                energyType.textContent = energy.type;
                console.log('Energy type updated:', energy.type);
            }
            if (direction && energy.direction) {
                direction.textContent = energy.direction;
                console.log('Direction updated:', energy.direction);
            }
            if (suitable && energy.suitable_for && energy.suitable_for.length > 0) {
                suitable.textContent = energy.suitable_for.join('、');
                console.log('Suitable for updated:', energy.suitable_for.join('、'));
            }
        }

        console.log('Product ID:', PRODUCT_DATA.id);

        // 初始化库存显示
        if (currentVariant && currentVariant.inventoryQuantity !== undefined) {
            const stockCount = document.querySelector('.stock-count');
            if (stockCount) {
                if (currentVariant.inventoryQuantity <= 5) {
                    stockCount.textContent = `Only ${currentVariant.inventoryQuantity} left`;
                    stockCount.style.background = 'var(--fire-primary)';
                } else {
                    stockCount.textContent = `${currentVariant.inventoryQuantity} in stock`;
                    stockCount.style.background = 'var(--wood-primary)';
                }
                console.log('Stock count updated:', stockCount.textContent);
            }
        }
        
        console.log('All UI updates completed');
    }, 100);
});