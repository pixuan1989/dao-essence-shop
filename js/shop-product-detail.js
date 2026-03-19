/**
 * 商品详情页 - Shopify 数据对接
 * 
 * 功能：
 * - 从 Shopify 拉取商品详情
 * - 大图展示（图片放大、多角度）
 * - 规格筛选（颜色、尺寸等）
 * - 添加到购物车
 */

// ============================================
// 全局变量
// ============================================

let currentProduct = null;
let selectedVariant = null;
let selectedOptions = {};

// ============================================
// 初始化
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    // 获取 URL 参数中的商品 handle
    const urlParams = new URLSearchParams(window.location.search);
    const productHandle = urlParams.get('product') || urlParams.get('handle');
    
    if (!productHandle) {
        showError('未找到商品');
        return;
    }
    
    // 加载商品详情
    await loadProductDetail(productHandle);
});

// ============================================
// 加载商品详情
// ============================================

async function loadProductDetail(handle) {
    try {
        showLoading();
        
        currentProduct = await getProductByHandle(handle);
        
        if (!currentProduct) {
            showError('商品不存在');
            return;
        }
        
        console.log('商品详情:', currentProduct);
        
        // 渲染页面
        renderProductDetail();
        
        // 初始化图片画廊
        initImageGallery();
        
        // 初始化规格选择器
        initVariantSelector();
        
        // 初始化数量选择器
        initQuantitySelector();
        
        // 更新页面标题
        document.title = `${currentProduct.title} - DaoEssence`;
        
        hideLoading();
        
    } catch (error) {
        console.error('加载商品详情失败:', error);
        showError('无法加载商品详情');
        hideLoading();
    }
}

// ============================================
// 渲染商品详情
// ============================================

function renderProductDetail() {
    // 渲染面包屑
    renderBreadcrumbs();
    
    // 渲染图片画廊
    renderImageGallery();
    
    // 渲染商品信息
    renderProductInfo();
    
    // 渲染规格选择器
    renderVariantSelector();
    
    // 渲染自定义字段
    renderMetafields();
    
    // 渲染详细描述
    renderDescription();
    
    // 渲染相关商品推荐
    renderRelatedProducts();
}

function renderBreadcrumbs() {
    const breadcrumbContainer = document.querySelector('.breadcrumb') || 
                                 document.getElementById('breadcrumb');
    if (!breadcrumbContainer) return;
    
    breadcrumbContainer.innerHTML = `
        <a href="index.html">首页</a>
        <span>/</span>
        <a href="shop.html">商品</a>
        <span>/</span>
        <span>${currentProduct.title}</span>
    `;
}

// ============================================
// 图片画廊（大图展示）
// ============================================

function renderImageGallery() {
    const galleryContainer = document.querySelector('.product-gallery') ||
                              document.getElementById('product-gallery') ||
                              document.querySelector('.product-images');
    if (!galleryContainer) return;
    
    const images = getAllImages(currentProduct);
    
    if (images.length === 0) {
        galleryContainer.innerHTML = `
            <div class="no-image">
                <img src="images/placeholder.jpg" alt="暂无图片">
            </div>
        `;
        return;
    }
    
    galleryContainer.innerHTML = `
        <div class="gallery-main">
            <img id="main-product-image" src="${images[0].url}" alt="${images[0].altText || currentProduct.title}">
            <button class="zoom-btn" onclick="openImageZoom()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="M21 21l-4.35-4.35"></path>
                    <path d="M11 8v6M8 11h6"></path>
                </svg>
            </button>
        </div>
        <div class="gallery-thumbnails">
            ${images.map((img, index) => `
                <div class="thumbnail ${index === 0 ? 'active' : ''}" 
                     data-image-url="${img.url}" 
                     data-image-alt="${img.altText || ''}"
                     onclick="changeMainImage(this, ${index})">
                    <img src="${img.url}" alt="${img.altText || ''}">
                </div>
            `).join('')}
        </div>
    `;
}

function initImageGallery() {
    // 图片懒加载
    const images = document.querySelectorAll('.gallery-thumbnails img');
    images.forEach(img => {
        img.loading = 'lazy';
    });
}

function changeMainImage(thumbnail, index) {
    const mainImage = document.getElementById('main-product-image');
    const imageUrl = thumbnail.getAttribute('data-image-url');
    const imageAlt = thumbnail.getAttribute('data-image-alt');
    
    mainImage.src = imageUrl;
    mainImage.alt = imageAlt;
    
    // 更新缩略图状态
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    thumbnail.classList.add('active');
}

// 图片放大弹窗
function openImageZoom() {
    const mainImage = document.getElementById('main-product-image');
    const currentSrc = mainImage.src;
    
    // 创建放大弹窗
    const zoomModal = document.createElement('div');
    zoomModal.className = 'image-zoom-modal';
    zoomModal.innerHTML = `
        <div class="zoom-overlay" onclick="closeImageZoom()"></div>
        <div class="zoom-content">
            <button class="zoom-close" onclick="closeImageZoom()">×</button>
            <img src="${currentSrc}" alt="放大图片">
        </div>
    `;
    
    zoomModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    const overlay = zoomModal.querySelector('.zoom-overlay');
    overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
    `;
    
    const content = zoomModal.querySelector('.zoom-content');
    content.style.cssText = `
        position: relative;
        max-width: 90%;
        max-height: 90%;
    `;
    
    const closeBtn = zoomModal.querySelector('.zoom-close');
    closeBtn.style.cssText = `
        position: absolute;
        top: -40px;
        right: 0;
        background: none;
        border: none;
        color: white;
        font-size: 40px;
        cursor: pointer;
    `;
    
    const zoomImg = zoomModal.querySelector('.zoom-content img');
    zoomImg.style.cssText = `
        max-width: 100%;
        max-height: 80vh;
        cursor: zoom-in;
    `;
    
    document.body.appendChild(zoomModal);
    document.body.style.overflow = 'hidden';
    
    // 鼠标滚轮放大
    let scale = 1;
    zoomImg.addEventListener('wheel', (e) => {
        e.preventDefault();
        scale += e.deltaY > 0 ? -0.1 : 0.1;
        scale = Math.max(1, Math.min(3, scale));
        zoomImg.style.transform = `scale(${scale})`;
    });
}

function closeImageZoom() {
    const modal = document.querySelector('.image-zoom-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

// ============================================
// 商品信息
// ============================================

function renderProductInfo() {
    const infoContainer = document.querySelector('.product-info') ||
                          document.getElementById('product-info') ||
                          document.querySelector('.product-details');
    if (!infoContainer) return;
    
    const minPrice = currentProduct.priceRange.minVariantPrice.amount;
    const maxPrice = currentProduct.priceRange.maxVariantPrice.amount;
    const currency = currentProduct.priceRange.minVariantPrice.currencyCode;
    
    infoContainer.innerHTML = `
        <h1 class="product-title">${currentProduct.title}</h1>
        <div class="product-price-container">
            <span class="product-price" id="product-price">
                ${minPrice === maxPrice 
                    ? formatPrice(minPrice, currency) 
                    : `${formatPrice(minPrice, currency)} - ${formatPrice(maxPrice, currency)}`}
            </span>
            ${selectedVariant?.compareAtPrice ? `
                <span class="compare-price">${formatPrice(selectedVariant.compareAtPrice.amount, currency)}</span>
            ` : ''}
        </div>
        <p class="product-vendor">品牌: ${currentProduct.vendor || 'DaoEssence'}</p>
        <p class="product-availability ${currentProduct.availableForSale ? 'in-stock' : 'out-of-stock'}">
            ${currentProduct.availableForSale ? '✓ 现货' : '× 暂时缺货'}
        </p>
    `;
}

// ============================================
// 规格选择器
// ============================================

function renderVariantSelector() {
    const selectorContainer = document.querySelector('.variant-selector') ||
                               document.getElementById('variant-selector') ||
                               document.querySelector('.product-options');
    if (!selectorContainer || !currentProduct.options) return;
    
    // 过滤掉只有一个值的选项（如 "Title: Default Title"）
    const options = currentProduct.options.filter(opt => opt.values.length > 1);
    
    if (options.length === 0) {
        // 没有可选规格，直接选中第一个 variant
        selectedVariant = currentProduct.variants.edges[0]?.node;
        return;
    }
    
    selectorContainer.innerHTML = options.map(option => `
        <div class="option-group">
            <label class="option-label">${option.name}:</label>
            <div class="option-values" data-option-name="${option.name}">
                ${option.values.map((value, index) => `
                    <button type="button" 
                            class="option-value ${index === 0 ? 'active' : ''}" 
                            data-value="${value}"
                            onclick="selectOption('${option.name}', '${value}')">
                        ${value}
                    </button>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    // 初始化选中第一个选项
    options.forEach(option => {
        selectedOptions[option.name] = option.values[0];
    });
    
    // 更新选中的 variant
    updateSelectedVariant();
}

function initVariantSelector() {
    // 已在 renderVariantSelector 中处理
}

function selectOption(optionName, value) {
    // 更新选中状态
    const optionGroup = document.querySelector(`[data-option-name="${optionName}"]`);
    if (optionGroup) {
        optionGroup.querySelectorAll('.option-value').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-value') === value);
        });
    }
    
    // 更新选中选项
    selectedOptions[optionName] = value;
    
    // 更新选中的 variant
    updateSelectedVariant();
    
    // 更新价格显示
    updatePriceDisplay();
    
    // 更新图片
    updateVariantImage();
}

function updateSelectedVariant() {
    selectedVariant = findVariantByOptions(currentProduct, selectedOptions);
    
    if (!selectedVariant) {
        console.warn('未找到匹配的 variant');
        return;
    }
    
    console.log('选中的 variant:', selectedVariant);
    
    // 更新添加到购物车按钮状态
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
        if (selectedVariant.availableForSale) {
            addToCartBtn.disabled = false;
            addToCartBtn.textContent = '加入购物车';
            addToCartBtn.classList.remove('disabled');
        } else {
            addToCartBtn.disabled = true;
            addToCartBtn.textContent = '已售罄';
            addToCartBtn.classList.add('disabled');
        }
    }
}

function updatePriceDisplay() {
    const priceElement = document.getElementById('product-price');
    if (!priceElement || !selectedVariant) return;
    
    const currency = selectedVariant.price.currencyCode;
    priceElement.textContent = formatPrice(selectedVariant.price.amount, currency);
    
    // 显示原价（如果有折扣）
    const container = priceElement.parentElement;
    const existingComparePrice = container.querySelector('.compare-price');
    
    if (selectedVariant.compareAtPrice) {
        if (existingComparePrice) {
            existingComparePrice.textContent = formatPrice(selectedVariant.compareAtPrice.amount, currency);
        } else {
            const comparePriceSpan = document.createElement('span');
            comparePriceSpan.className = 'compare-price';
            comparePriceSpan.textContent = formatPrice(selectedVariant.compareAtPrice.amount, currency);
            comparePriceSpan.style.cssText = 'text-decoration: line-through; color: #999; margin-left: 10px;';
            container.appendChild(comparePriceSpan);
        }
    } else if (existingComparePrice) {
        existingComparePrice.remove();
    }
}

function updateVariantImage() {
    if (!selectedVariant || !selectedVariant.image) return;
    
    const mainImage = document.getElementById('main-product-image');
    if (mainImage) {
        mainImage.src = selectedVariant.image.url;
        mainImage.alt = selectedVariant.image.altText || currentProduct.title;
    }
}

// ============================================
// 数量选择器
// ============================================

function initQuantitySelector() {
    const quantityInput = document.querySelector('.quantity-input') ||
                          document.getElementById('quantity');
    const minusBtn = document.querySelector('.quantity-minus');
    const plusBtn = document.querySelector('.quantity-plus');
    
    if (minusBtn) {
        minusBtn.addEventListener('click', () => {
            const current = parseInt(quantityInput?.value || 1);
            if (current > 1 && quantityInput) {
                quantityInput.value = current - 1;
            }
        });
    }
    
    if (plusBtn) {
        plusBtn.addEventListener('click', () => {
            const current = parseInt(quantityInput?.value || 1);
            if (quantityInput) {
                quantityInput.value = current + 1;
            }
        });
    }
}

// ============================================
// 自定义字段（Metafields）
// ============================================

function renderMetafields() {
    const metafieldsContainer = document.querySelector('.product-metafields') ||
                                 document.getElementById('product-metafields') ||
                                 document.querySelector('.product-attributes');
    if (!metafieldsContainer) return;
    
    const metafieldsData = {
        'material': { label: '材质', icon: '🧵' },
        'energy_type': { label: '能量属性', icon: '✨' },
        'usage_scenario': { label: '适用场景', icon: '🏠' },
        'care_instructions': { label: '护理说明', icon: '📋' },
        'origin': { label: '产地', icon: '🌍' },
        'weight': { label: '重量', icon: '⚖️' },
        'dimensions': { label: '尺寸', icon: '📏' }
    };
    
    let metafieldsHtml = '<div class="metafields-list">';
    
    for (const [key, config] of Object.entries(metafieldsData)) {
        const value = getMetafieldValue(currentProduct, key);
        if (value) {
            metafieldsHtml += `
                <div class="metafield-item">
                    <span class="metafield-icon">${config.icon}</span>
                    <span class="metafield-label">${config.label}:</span>
                    <span class="metafield-value">${value}</span>
                </div>
            `;
        }
    }
    
    metafieldsHtml += '</div>';
    metafieldsContainer.innerHTML = metafieldsHtml;
}

// ============================================
// 商品描述
// ============================================

function renderDescription() {
    const descContainer = document.querySelector('.product-description') ||
                           document.getElementById('product-description') ||
                           document.querySelector('.description-tab');
    if (!descContainer) return;
    
    descContainer.innerHTML = `
        <h3>商品描述</h3>
        <div class="description-content">
            ${currentProduct.descriptionHtml || `<p>${currentProduct.description || '暂无描述'}</p>`}
        </div>
    `;
}

// ============================================
// 相关商品推荐
// ============================================

async function renderRelatedProducts() {
    const relatedContainer = document.querySelector('.related-products') ||
                              document.getElementById('related-products');
    if (!relatedContainer) return;
    
    // 基于标签或类型获取相关商品
    const relatedTags = currentProduct.tags || [];
    
    try {
        const allProducts = await getAllProducts();
        const related = allProducts
            .filter(p => p.id !== currentProduct.id)
            .filter(p => p.tags?.some(tag => relatedTags.includes(tag)))
            .slice(0, 4);
        
        if (related.length === 0) {
            relatedContainer.style.display = 'none';
            return;
        }
        
        relatedContainer.innerHTML = `
            <h3>相关推荐</h3>
            <div class="related-products-grid">
                ${related.map(product => {
                    const img = getMainImage(product);
                    return `
                        <a href="product-detail.html?product=${product.handle}" class="related-product-card">
                            <img src="${img?.url || 'images/placeholder.jpg'}" alt="${product.title}">
                            <h4>${product.title}</h4>
                            <p>${formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}</p>
                        </a>
                    `;
                }).join('')}
            </div>
        `;
    } catch (error) {
        console.error('加载相关商品失败:', error);
    }
}

// ============================================
// 添加到购物车
// ============================================

async function addToCartFromDetail() {
    if (!selectedVariant) {
        alert('请选择商品规格');
        return;
    }
    
    const quantityInput = document.querySelector('.quantity-input') ||
                          document.getElementById('quantity');
    const quantity = parseInt(quantityInput?.value || 1);
    
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    
    try {
        addToCartBtn.disabled = true;
        addToCartBtn.textContent = '添加中...';
        
        const cartId = await getOrCreateCartId();
        await addToCart(cartId, selectedVariant.id, quantity);
        
        addToCartBtn.textContent = '已添加 ✓';
        updateCartBadge();
        
        showNotification(`${currentProduct.title} x ${quantity} 已添加到购物车`);
        
        setTimeout(() => {
            addToCartBtn.disabled = false;
            addToCartBtn.textContent = '加入购物车';
        }, 2000);
        
    } catch (error) {
        console.error('添加到购物车失败:', error);
        addToCartBtn.textContent = '添加失败';
        
        setTimeout(() => {
            addToCartBtn.disabled = false;
            addToCartBtn.textContent = '加入购物车';
        }, 2000);
    }
}

// ============================================
// UI 辅助函数
// ============================================

function showLoading() {
    const container = document.querySelector('.product-detail-container') ||
                      document.querySelector('main') ||
                      document.body;
    
    const loader = document.createElement('div');
    loader.className = 'page-loading';
    loader.innerHTML = `
        <div class="spinner"></div>
        <p>加载商品详情...</p>
    `;
    loader.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
    `;
    
    container.innerHTML = '';
    container.appendChild(loader);
}

function hideLoading() {
    const loader = document.querySelector('.page-loading');
    if (loader) loader.remove();
}

function showError(message) {
    const container = document.querySelector('.product-detail-container') ||
                      document.querySelector('main') ||
                      document.body;
    
    container.innerHTML = `
        <div class="error-page">
            <p>${message}</p>
            <a href="shop.html" class="back-link">返回商品列表</a>
        </div>
    `;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 25px;
        border-radius: 4px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

async function updateCartBadge() {
    try {
        const cartId = localStorage.getItem('shopify_cart_id');
        if (!cartId) return;
        
        const cart = await getCart(cartId);
        const itemCount = cart.lines.edges.reduce((sum, edge) => sum + edge.node.quantity, 0);
        
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            badge.textContent = itemCount;
            badge.style.display = itemCount > 0 ? 'block' : 'none';
        }
    } catch (error) {
        console.error('更新购物车徽章失败:', error);
    }
}
