// ============================================
// Product Detail Page System
// ============================================

let PRODUCT_DATA = null;
let currentVariant = null;
let selectedOptions = {};
let totalCartQuantity = 0;

/**
 * 从 window.allProducts 中加载产品数据
 * 由 creem-sync-v2.js 填充 window.allProducts
 */
window.loadProductData = async function() {
    console.log('📦 Loading product data for detail page...');

    // 获取URL中的产品ID
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    console.log('URL Product ID:', productId);
    console.log('Available products from Creem API:', window.allProducts ? window.allProducts.length : 0);
    
    // 如果没有指定ID，使用默认产品 (传统沉香)
    const defaultProductId = 'prod_7i2asEAuHFHl5hJMeCEsfB';
    const actualProductId = productId || defaultProductId;
    console.log('Loading product:', actualProductId);
    
    // 等待 window.allProducts 数据就绪
    let attempts = 0;
    const maxAttempts = 100; // 最多等待 10 秒
    
    while (attempts < maxAttempts) {
        if (typeof window.allProducts !== 'undefined' && window.allProducts.length > 0) {
            break;
        }
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (attempts >= maxAttempts) {
        console.warn('⚠️ Creem products still not ready, trying anyway...');
    }
    
    // 从 window.allProducts 中获取产品数据
    if (typeof window.allProducts !== 'undefined' && window.allProducts.length > 0) {
        const product = window.allProducts.find(p => p.id === actualProductId) || window.allProducts.find(p => p.id === defaultProductId);
        if (product) {
            // 转换 Creem API 数据格式为产品详情页需要的格式
            PRODUCT_DATA = {
                id: product.id,
                title: product.name,
                titleZh: product.nameCN,
                handle: product.name.toLowerCase().replace(/\s+/g, '-'),
                description: product.description,
                descriptionZh: product.descriptionCN,
                price: parseFloat(product.price) || 0,
                compareAtPrice: parseFloat(product.originalPrice || product.price) || 0,
                currency: product.currency || 'USD',
                images: [
                    {
                        id: 1,
                        src: product.image,
                        alt: product.nameCN,
                        width: 1200,
                        height: 1200,
                        position: 1
                    }
                ],
                variants: [
                    {
                        id: `${product.id}-1`,
                        title: 'Default',
                        price: parseFloat(product.price) || 0,
                        compareAtPrice: parseFloat(product.originalPrice || product.price) || 0,
                        available: true,
                        inventoryQuantity: product.stock || 999,
                        options: {}
                    }
                ],
                type: product.categoryCN || product.category,
                metafields: {
                    energy: {
                        five_element: product.element,
                        type: product.energyLevel,
                        direction: '适合所有方位',
                        suitable_for: product.benefits || []
                    }
                }
            };
            console.log('✅ Product data loaded and converted:', PRODUCT_DATA);
            return true;
        }
    }
    
    if (!PRODUCT_DATA) {
        console.error('Product not found:', actualProductId);
        // 使用默认数据结构作为 fallback
        PRODUCT_DATA = {
            id: actualProductId,
            title: 'Product Not Found',
            titleZh: '产品未找到',
            handle: 'product-not-found',
            description: 'Product not available',
            descriptionZh: '产品不可用',
            price: 0,
            compareAtPrice: null,
            currency: 'USD',
            images: [
                {
                    id: 1,
                    src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=1200&fit=crop',
                    alt: 'Product Image',
                    width: 1200,
                    height: 1200,
                    position: 1
                }
            ],
            variants: [
                {
                    id: `${actualProductId}-1`,
                    title: 'Default',
                    price: 0,
                    compareAtPrice: null,
                    available: false,
                    inventoryQuantity: 0,
                    options: {
                        type: 'default'
                    }
                }
            ],
            metafields: {
                energy: {
                    five_element: 'Unknown',
                    type: 'Unknown',
                    intensity: 'Unknown',
                    direction: 'Unknown',
                    benefits: [],
                    suitable_for: []
                }
            }
        };
        return false;
    }
    
    console.log('Loaded product:', PRODUCT_DATA.id, PRODUCT_DATA.title);
    return true;
};

// ============================================
// Initialize Cart State
// ============================================

window.initState = function() {
    if (PRODUCT_DATA && PRODUCT_DATA.variants && PRODUCT_DATA.variants.length > 0) {
        currentVariant = PRODUCT_DATA.variants[0];

        // 根据第一个变体初始化选项
        if (currentVariant.options) {
            Object.keys(currentVariant.options).forEach(key => {
                selectedOptions[key] = currentVariant.options[key];
            });
        }

        // 初始化UI
        window.updateUIForVariant(currentVariant);

        // 初始化总价
        window.updateTotalPrice();
    }
};

// ============================================
// Render Images
// ============================================

window.renderImages = function() {
    const mainWrapper = document.getElementById('mainImageWrapper');
    const thumbsWrapper = document.getElementById('thumbsWrapper');
    
    console.log('renderImages called');
    
    if (!mainWrapper || !PRODUCT_DATA || !PRODUCT_DATA.images) return;

    // 清空现有内容
    mainWrapper.innerHTML = '';
    if (thumbsWrapper) thumbsWrapper.innerHTML = '';

    // 渲染主图像
    const mainImage = document.createElement('img');
    mainImage.src = PRODUCT_DATA.images[0].src;
    mainImage.alt = PRODUCT_DATA.images[0].alt;
    mainImage.style.width = '100%';
    mainImage.style.height = 'auto';
    mainImage.style.maxHeight = '600px';
    mainImage.style.objectFit = 'contain';
    mainImage.style.borderRadius = '8px';
    mainWrapper.appendChild(mainImage);
};

// ============================================
// Variant Management
// ============================================

window.selectVariant = function(variantId) {
    if (!PRODUCT_DATA) return;
    
    const variant = PRODUCT_DATA.variants.find(v => v.id === variantId);
    if (variant) {
        currentVariant = variant;
        window.updateUIForVariant(variant);
        window.updateTotalPrice();
    }
};

window.updateUIForVariant = function(variant) {
    if (!variant) return;
    
    // 更新价格显示
    const priceElement = document.getElementById('productPrice');
    if (priceElement && variant.price) {
        priceElement.textContent = `$${parseFloat(variant.price).toFixed(2)}`;
    }
    
    // 如果有比较价格，显示折扣
    if (variant.compareAtPrice && variant.compareAtPrice > variant.price) {
        const discountElement = document.getElementById('productDiscount');
        if (discountElement) {
            const discount = Math.round(((variant.compareAtPrice - variant.price) / variant.compareAtPrice) * 100);
            discountElement.textContent = `-${discount}%`;
            discountElement.style.display = 'inline-block';
        }
        
        const originalPriceElement = document.getElementById('productOriginalPrice');
        if (originalPriceElement) {
            originalPriceElement.textContent = `$${parseFloat(variant.compareAtPrice).toFixed(2)}`;
            originalPriceElement.style.display = 'inline';
        }
    }
};

// ============================================
// Price Calculation
// ============================================

window.updateTotalPrice = function() {
    if (!currentVariant) return;
    
    const quantity = parseInt(document.getElementById('productQuantity')?.value) || 1;
    const price = parseFloat(currentVariant.price) || 0;
    const total = (price * quantity).toFixed(2);
    
    const totalElement = document.getElementById('totalPrice');
    if (totalElement) {
        totalElement.textContent = `$${total}`;
    }
    
    console.log('✅ Updated total price:', total);
};

// ============================================
// Add to Cart
// ============================================

window.addToCart = function() {
    if (!PRODUCT_DATA || !currentVariant) {
        console.error('❌ Cannot add to cart: product data not loaded');
        alert('产品数据未加载，请刷新页面重试');
        return;
    }

    const quantityInput = document.getElementById('productQuantity');
    const quantity = parseInt(quantityInput?.value) || 1;

    const productId = currentVariant.id;
    
    console.log('🛒 Adding to cart: productId=' + productId + ', quantity=' + quantity);
    
    // 使用 cart.js 中提供的全局购物车函数
    if (typeof window.addToCart_CartJS === 'function') {
        // 如果有备用名称（为了避免递归）
        window.addToCart_CartJS(productId, quantity);
    } else if (window.products && window.products[productId]) {
        // 方案 B：直接操作全局购物车
        const product = window.products[productId];
        
        if (typeof window.cart === 'undefined') {
            window.cart = { items: [] };
        }
        
        // 检查产品是否已在购物车中
        const existingItem = window.cart.items.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
            console.log('✅ Updated cart item quantity:', existingItem.quantity);
        } else {
            window.cart.items.push({
                id: productId,
                name: product.name,
                nameCn: product.nameCn,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
            console.log('✅ Added new item to cart');
        }
        
        // 保存到 localStorage
        if (typeof window.saveCartToStorage === 'function') {
            window.saveCartToStorage();
        }
        
        // 更新购物车显示
        if (typeof window.updateCartUI === 'function') {
            window.updateCartUI();
        }
        if (typeof window.updateCartBadge === 'function') {
            window.updateCartBadge();
        }
        
        console.log('✅ Added to cart:', product.nameCn, 'x' + quantity);
        
        // 显示成功消息
        alert(`✅ 已添加到购物车！\n${product.nameCn} x${quantity}`);
    } else {
        console.error('❌ Product not found in cart system:', productId);
        alert('购物车系统还未初始化，请稍后重试');
    }
};

// ============================================
// Initialize Page
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 product-detail.js: DOMContentLoaded fired');
    
    // 1. 加载产品数据（必须在其他操作之前）
    const productLoaded = await window.loadProductData();

    if (!productLoaded) {
        console.warn('⚠️ Failed to load product data, but continuing...');
    }

    // 2. 初始化购物车数据
    if (typeof window.cart === 'undefined') {
        window.cart = { items: [] };
    }

    console.log('✅ Product detail page initialized');
    console.log('Product data:', PRODUCT_DATA);

    // 3. 初始化页面UI
    window.initState();
    window.renderImages();
    
    // 4. 更新购物车显示
    if (typeof window.updateCartUI === 'function') {
        window.updateCartUI();
    }
    if (typeof window.updateCartBadge === 'function') {
        window.updateCartBadge();
    }

    // 5. 绑定事件监听器
    const quantityInput = document.getElementById('productQuantity');
    if (quantityInput) {
        quantityInput.addEventListener('change', window.updateTotalPrice);
        quantityInput.addEventListener('input', window.updateTotalPrice);
    }

    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', window.addToCart);
    }

    console.log('✅ Event listeners bound');
});