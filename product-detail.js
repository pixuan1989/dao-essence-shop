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
        console.log('Available products:', window.allProducts.map(p => ({ id: p.id, name: p.name, price: p.price })));
        
        const product = window.allProducts.find(p => p.id === actualProductId) || window.allProducts.find(p => p.id === defaultProductId);
        if (product) {
            console.log('🔍 Found product:', product);
            console.log('📊 Product fields:', { name: product.name, nameCN: product.nameCN, price: product.price, image: product.image, image_url: product.image_url, img_url: product.img_url });
            
            // 🔥 支持多种图片字段名
            const productImage = product.image || product.image_url || product.img_url || 'images/placeholder.jpg';
            console.log('📷 Using image:', productImage);
            
            // 转换 Creem API 数据格式为产品详情页需要的格式
            PRODUCT_DATA = {
                id: product.id,
                title: product.name || product.product_name || 'Unknown Product',
                titleZh: product.nameCN || product.name || 'Unknown Product',
                handle: (product.name || 'product').toLowerCase().replace(/\s+/g, '-'),
                description: product.description || product.product_description || 'No description available',
                descriptionZh: product.descriptionCN || product.description || product.product_description || 'No description available',
                price: parseFloat(product.price) || 0,
                compareAtPrice: parseFloat(product.originalPrice || product.price) || 0,
                currency: product.currency || 'USD',
                images: [
                    {
                        id: 1,
                        src: productImage,
                        alt: product.nameCN || product.name || 'Product',
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
                type: product.categoryCN || product.category || 'Spiritual',
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
    const priceElement = document.getElementById('currentPrice');
    if (priceElement && variant.price) {
        priceElement.textContent = `$${parseFloat(variant.price).toFixed(2)}`;
    }
    
    // 如果有比较价格，显示折扣
    if (variant.compareAtPrice && variant.compareAtPrice > variant.price) {
        const discountElement = document.getElementById('discountBadge');
        if (discountElement) {
            const discount = Math.round(((variant.compareAtPrice - variant.price) / variant.compareAtPrice) * 100);
            discountElement.textContent = `-${discount}%`;
            discountElement.style.display = 'inline-block';
        }
        
        const originalPriceElement = document.getElementById('originalPrice');
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
    
    // 🔥 修复：使用正确的 HTML 元素 ID
    const quantity = parseInt(document.getElementById('quantity')?.value) || 1;
    const price = parseFloat(currentVariant.price) || 0;
    const total = (price * quantity).toFixed(2);
    
    const totalElement = document.getElementById('totalPrice');
    if (totalElement) {
        totalElement.textContent = `$${total}`;
        console.log('✅ Updated total price:', totalElement.textContent);
    }
};

// ============================================
// Add to Cart - 🔥 FIXED VERSION
// ============================================

// 产品详情页添加到购物车函数
window.addToCartFromDetail = function() {
    if (!PRODUCT_DATA || !currentVariant) {
        console.error('❌ Cannot add to cart: product data not loaded');
        alert('产品数据未加载，请刷新页面重试');
        return;
    }

    // 读取数量
    const quantityInput = document.getElementById('quantity');
    const quantity = parseInt(quantityInput?.value) || 1;
    
    if (!quantity || quantity < 1) {
        alert('请输入有效的数量');
        return;
    }

    const productId = PRODUCT_DATA.id;
    
    console.log('📦 product-detail.addToCartFromDetail: productId=' + productId + ', quantity=' + quantity);
    
    // 调用 cart.js 中的 addToCart 函数
    if (typeof window.addToCart === 'function') {
        window.addToCart(productId, quantity);
    } else {
        console.error('❌ addToCart function not available');
        alert('购物车功能未就绪，请刷新页面重试');
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
        const savedCart = JSON.parse(localStorage.getItem('daoessence_cart') || '{"items":[]}');
        window.cart = savedCart;
    }

    console.log('✅ Product detail page initialized');
    console.log('Product data:', PRODUCT_DATA);

    // 3. 初始化页面UI
    window.initState();
    window.renderImages();
    
    // 3.5 更新所有产品信息到 HTML
    if (PRODUCT_DATA) {
        console.log('Updating all product info to HTML...');
        const productNameCn = document.getElementById('productNameCn');
        if (productNameCn) {
            productNameCn.textContent = PRODUCT_DATA.titleZh || PRODUCT_DATA.title || 'Product Name';
            console.log('✅ Updated productNameCn to:', productNameCn.textContent);
        }
        
        const productNameEn = document.getElementById('productNameEn');
        if (productNameEn) {
            productNameEn.textContent = PRODUCT_DATA.title || 'Product Name';
            console.log('✅ Updated productNameEn to:', productNameEn.textContent);
        }
        
        const productDescription = document.getElementById('productDescription');
        if (productDescription) {
            productDescription.innerHTML = '<p>' + (PRODUCT_DATA.descriptionZh || PRODUCT_DATA.description || 'No description available') + '</p>';
            console.log('✅ Updated productDescription');
        }
        
        const productCategoryTag = document.getElementById('productCategoryTag');
        if (productCategoryTag) {
            productCategoryTag.textContent = PRODUCT_DATA.type || 'Category';
            console.log('✅ Updated productCategoryTag');
        }
        
        const productSku = document.getElementById('productSku');
        if (productSku) {
            productSku.textContent = 'SKU: ' + PRODUCT_DATA.id;
            console.log('✅ Updated productSku');
        }
    }
    
    // 4. 更新购物车显示
    if (typeof window.updateCartUI === 'function') {
        window.updateCartUI();
    }
    if (typeof window.updateCartBadge === 'function') {
        window.updateCartBadge();
    }

    // 5. 绑定事件监听器
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        quantityInput.addEventListener('change', window.updateTotalPrice);
        quantityInput.addEventListener('input', window.updateTotalPrice);
    }

    // button onclick 属性已在 HTML 中绑定，无需这里再绑定

    console.log('✅ Event listeners bound');
});
