﻿// ============================================
// Card Detail Page System
// ============================================

let CARD_DATA = null;
let currentVariant = null;
let selectedOptions = {};
let totalCartQuantity = 0;

/**
 * 智能检测产品类型
 * 根据产品名称、描述、分类等信息判断是小说类还是冥想类
 */
function detectProductType(card) {
    // 优先使用明确的分类字段
    const explicitCategory = card.categoryCN || card.category || '';
    
    // 小说类关键词（中英文）
    const novelKeywords = [
        'novel', 'book', 'fiction', 'story', 'cultivation', 'wuxia', 'xianxia',
        '小说', '书籍', '故事', '读物', '修仙', '武侠', '玄幻', '神话',
        'mysteries', 'lord', '卷', '章', 'author', 'writer'
    ];
    
    // 冥想/音频类关键词
    const meditationKeywords = [
        'meditation', 'audio', 'music', 'sound', 'therapy', 'healing',
        '冥想', '音频', '音乐', '疗愈', '能量', '五行'
    ];
    
    // 检查产品名称
    const name = (card.name || card.product_name || '').toLowerCase();
    const nameCN = (card.nameCN || '').toLowerCase();
    const description = (card.description || '').toLowerCase();
    
    // 计算匹配度
    let novelScore = 0;
    let meditationScore = 0;
    
    // 检查显式分类
    if (explicitCategory) {
        const cat = explicitCategory.toLowerCase();
        if (cat.includes('小说') || cat.includes('novel') || cat.includes('book') || cat.includes('读物')) {
            novelScore += 10;
        }
        if (cat.includes('冥想') || cat.includes('meditation') || cat.includes('音频')) {
            meditationScore += 10;
        }
    }
    
    // 检查名称关键词
    novelKeywords.forEach(keyword => {
        if (name.includes(keyword) || nameCN.includes(keyword)) {
            novelScore += 2;
        }
    });
    
    meditationKeywords.forEach(keyword => {
        if (name.includes(keyword) || nameCN.includes(keyword)) {
            meditationScore += 2;
        }
    });
    
    // 检查描述关键词
    novelKeywords.forEach(keyword => {
        if (description.includes(keyword)) {
            novelScore += 1;
        }
    });
    
    meditationKeywords.forEach(keyword => {
        if (description.includes(keyword)) {
            meditationScore += 1;
        }
    });
    
    // 特殊规则：知名小说作品
    const knownNovels = [
        'mysteries', 'cuttlefish', '诡秘', '之主', 'lord',
        'perfect world', '遮天', '斗破', '苍穹', '凡人', '修仙'
    ];
    knownNovels.forEach(keyword => {
        if (name.includes(keyword) || nameCN.includes(keyword) || description.includes(keyword)) {
            novelScore += 5;
        }
    });
    
    console.log('Product type detection:', { name, novelScore, meditationScore, explicitCategory });
    
    // 返回判断结果 - 优先使用检测结果，而不是原始分类
    if (novelScore > meditationScore) {
        return '中国修仙小说';
    } else if (meditationScore > novelScore) {
        return '道家冥想';
    }
    
    // 默认返回原始分类或其他
    return card.categoryCN || card.category || '其他';
}

/**
 * 从 window.allProducts 中加载卡数据
 * 由 creem-sync-v2.js 填充 window.allProducts
 */
window.loadCardData = async function() {
    console.log('📦 Loading card data for detail page...');

    // 获取URL中的卡ID
    const urlParams = new URLSearchParams(window.location.search);
    const cardId = urlParams.get('id');
    console.log('URL Card ID:', cardId);
    console.log('Available cards from Creem API:', window.allProducts ? window.allProducts.length : 0);
    
    // 如果没有指定ID，使用默认卡 (传统沉香)
    const defaultCardId = 'prod_7i2asEAuHFHl5hJMeCEsfB';
    const actualCardId = cardId || defaultCardId;
    console.log('Loading card:', actualCardId);
    
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
        console.warn('⚠️ Creem cards still not ready, trying anyway...');
    }
    
    // 从 window.allProducts 中获取卡数据
    if (typeof window.allProducts !== 'undefined' && window.allProducts.length > 0) {
        console.log('Available cards:', window.allProducts.map(p => ({ id: p.id, name: p.name, price: p.price })));
        
        const card = window.allProducts.find(p => p.id === actualCardId) || window.allProducts.find(p => p.id === defaultCardId);
        if (card) {
            console.log('🔍 Found card:', card);
            console.log('📊 Card fields:', { name: card.name, nameCN: card.nameCN, price: card.price, image: card.image, image_url: card.image_url, img_url: card.img_url });
            
            // 🔥 支持多种图片字段名
            const cardImage = card.image || card.image_url || card.img_url || 'images/placeholder.jpg';
            console.log('📷 Using image:', cardImage);
            
            // 转换 Creem API 数据格式为卡详情页需要的格式
            CARD_DATA = {
                id: card.id,
                title: card.name || card.product_name || 'Unknown Card',
                titleZh: card.nameCN || card.name || 'Unknown Card',
                handle: (card.name || 'card').toLowerCase().replace(/\s+/g, '-'),
                description: card.description || card.product_description || 'No description available',
                descriptionZh: card.descriptionCN || card.description || card.product_description || 'No description available',
                price: parseFloat(card.price) || 0,
                compareAtPrice: parseFloat(card.originalPrice || card.price) || 0,
                currency: card.currency || 'USD',
                images: [
                    {
                        id: 1,
                        src: cardImage,
                        alt: card.nameCN || card.name || 'Card',
                        width: 1200,
                        height: 1200,
                        position: 1
                    }
                ],
                variants: [
                    {
                        id: `${card.id}-1`,
                        title: 'Default',
                        price: parseFloat(card.price) || 0,
                        compareAtPrice: parseFloat(card.originalPrice || card.price) || 0,
                        available: true,
                        inventoryQuantity: card.stock || 999,
                        options: {}
                    }
                ],
                type: detectProductType(card),
                metafields: {
                    energy: {
                        five_element: card.element,
                        type: card.energyLevel,
                        direction: '适合所有方位',
                        suitable_for: card.benefits || []
                    }
                }
            };
            console.log('✅ Card data loaded and converted:', CARD_DATA);
            return true;
        }
    }
    
    if (!CARD_DATA) {
        console.error('Card not found:', actualCardId);
        // 使用默认数据结构作为 fallback
        CARD_DATA = {
            id: actualCardId,
            title: 'Card Not Found',
            titleZh: '卡未找到',
            handle: 'card-not-found',
            description: 'Card not available',
            descriptionZh: '卡不可用',
            price: 0,
            compareAtPrice: null,
            currency: 'USD',
            images: [
                {
                    id: 1,
                    src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=1200&fit=crop',
                    alt: 'Card Image',
                    width: 1200,
                    height: 1200,
                    position: 1
                }
            ],
            variants: [
                {
                    id: `${actualCardId}-1`,
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
    
    console.log('Loaded card:', CARD_DATA.id, CARD_DATA.title);
    return true;
};

// ============================================
// Initialize Cart State
// ============================================

window.initState = function() {
    if (CARD_DATA && CARD_DATA.variants && CARD_DATA.variants.length > 0) {
        currentVariant = CARD_DATA.variants[0];

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
    
    if (!mainWrapper || !CARD_DATA || !CARD_DATA.images) return;

    // 清空现有内容
    mainWrapper.innerHTML = '';
    if (thumbsWrapper) thumbsWrapper.innerHTML = '';

    // 渲染主图像
    const mainImage = document.createElement('img');
    mainImage.src = CARD_DATA.images[0].src;
    mainImage.alt = CARD_DATA.images[0].alt;
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
    if (!CARD_DATA) return;
    
    const variant = CARD_DATA.variants.find(v => v.id === variantId);
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
        const compareAt = parseFloat(variant.compareAtPrice);
        const current = parseFloat(variant.price);
        const savings = compareAt - current;
        const discount = Math.round((savings / compareAt) * 100);

        const discountElement = document.getElementById('discountBadge');
        if (discountElement) {
            discountElement.textContent = `-${discount}%`;
            discountElement.style.display = 'inline-block';
        }
        
        const originalPriceElement = document.getElementById('originalPrice');
        if (originalPriceElement) {
            originalPriceElement.textContent = `$${compareAt.toFixed(2)}`;
            originalPriceElement.style.display = 'inline';
        }

        // 🔥 修复：更新"节省xxx美元"文字
        const savingsTextElement = document.getElementById('savingsText');
        if (savingsTextElement) {
            savingsTextElement.textContent = `节省${savings.toFixed(2)}美元`;
            savingsTextElement.style.display = 'block';
        }
    } else {
        // 无折扣时隐藏节省文字
        const savingsTextElement = document.getElementById('savingsText');
        if (savingsTextElement) {
            savingsTextElement.style.display = 'none';
        }
        const discountElement = document.getElementById('discountBadge');
        if (discountElement) discountElement.style.display = 'none';
        const originalPriceElement = document.getElementById('originalPrice');
        if (originalPriceElement) originalPriceElement.style.display = 'none';
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

// 卡详情页添加到购物车函数
window.addToCartFromDetail = function() {
    if (!CARD_DATA) {
        console.error('❌ Cannot add to cart: CARD_DATA not loaded');
        return;
    }

    // 读取数量
    const quantityInput = document.getElementById('quantity');
    const quantity = Math.max(1, parseInt(quantityInput?.value) || 1);

    const cardId = CARD_DATA.id;
    console.log('📦 addToCartFromDetail: cardId=' + cardId + ', quantity=' + quantity);

    // 调用 cart.js 中的 addToCart 函数
    if (typeof window.addToCart === 'function') {
        window.addToCart(cardId, quantity);
        // 注意：不自动打开侧边栏，保持"加入购物车"按钮的单一职责
    } else {
        console.error('❌ addToCart function not available');
    }
};

// 立即购买函数
window.buyNow = function() {
    if (!CARD_DATA) {
        console.error('❌ Cannot buy now: CARD_DATA not loaded');
        return;
    }

    // 读取数量
    const quantityInput = document.getElementById('quantity');
    const quantity = Math.max(1, parseInt(quantityInput?.value) || 1);

    const cardId = CARD_DATA.id;
    console.log('⚡ buyNow: cardId=' + cardId + ', quantity=' + quantity);

    // 先加入购物车（静默，不显示通知），然后跳转结算页
    if (typeof window.addToCartSilent === 'function') {
        window.addToCartSilent(cardId, quantity);
    } else if (typeof window.addToCart === 'function') {
        // 降级：用普通 addToCart（会显示通知）
        window.addToCart(cardId, quantity);
    } else {
        console.error('❌ addToCart function not available');
        return;
    }

    // 跳转到结算页（checkout.html）
    setTimeout(() => {
        window.location.href = 'checkout.html';
    }, 300);
};

// ============================================
// Initialize Page
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 product-detail.js: DOMContentLoaded fired');
    
    // 1. 加载卡数据（必须在其他操作之前）
    const cardLoaded = await window.loadCardData();

    if (!cardLoaded) {
        console.warn('⚠️ Failed to load card data, but continuing...');
    }

    // 2. 初始化购物车数据
    if (typeof window.cart === 'undefined') {
        const savedCart = JSON.parse(localStorage.getItem('daoessence_cart') || '{"items":[]}');
        window.cart = savedCart;
    }

    console.log('✅ Card detail page initialized');
    console.log('Card data:', CARD_DATA);

    // 3. 初始化页面UI
    window.initState();
    window.renderImages();
    
    // 3.5 更新所有卡信息到 HTML
    if (CARD_DATA) {
        console.log('Updating all card info to HTML...');
        const cardNameCn = document.getElementById('cardNameCn');
        if (cardNameCn) {
            cardNameCn.textContent = CARD_DATA.titleZh || CARD_DATA.title || 'Card Name';
            console.log('✅ Updated cardNameCn to:', cardNameCn.textContent);
        }
        
        const cardNameEn = document.getElementById('cardNameEn');
        if (cardNameEn) {
            cardNameEn.textContent = CARD_DATA.title || 'Card Name';
            console.log('✅ Updated cardNameEn to:', cardNameEn.textContent);
        }
        
        // 更新页面头部标题
        const pageTitleLarge = document.getElementById('pageTitleLarge');
        if (pageTitleLarge) {
            pageTitleLarge.textContent = CARD_DATA.titleZh || CARD_DATA.title || 'Card';
            console.log('✅ Updated pageTitleLarge to:', pageTitleLarge.textContent);
        }
        
        const pageTitleEn = document.getElementById('pageTitleEn');
        if (pageTitleEn) {
            pageTitleEn.textContent = CARD_DATA.title || 'Card Title';
            console.log('✅ Updated pageTitleEn to:', pageTitleEn.textContent);
        }
        
        // 更新面包屑
        const breadcrumbCard = document.getElementById('breadcrumbCard');
        if (breadcrumbCard) {
            breadcrumbCard.textContent = CARD_DATA.titleZh || CARD_DATA.title || 'Card';
            console.log('✅ Updated breadcrumbCard to:', breadcrumbCard.textContent);
        }
        
        const breadcrumbCategory = document.getElementById('breadcrumbCategory');
        if (breadcrumbCategory) {
            breadcrumbCategory.textContent = CARD_DATA.type || 'Category';
            console.log('✅ Updated breadcrumbCategory to:', breadcrumbCategory.textContent);
        }
        
        // 更新卡描述
        const cardDescription = document.getElementById('cardDescription');
        if (cardDescription) {
            cardDescription.innerHTML = '<p>' + (CARD_DATA.descriptionZh || CARD_DATA.description || 'No description available') + '</p>';
            console.log('✅ Updated cardDescription');
        }
        
        const cardCategoryTag = document.getElementById('cardCategoryTag');
        if (cardCategoryTag) {
            cardCategoryTag.textContent = CARD_DATA.type || 'Category';
            console.log('✅ Updated cardCategoryTag to:', cardCategoryTag.textContent);
            
            // 🔥 主动触发区块切换
            if (typeof toggleAttributeBlocks === 'function') {
                console.log('🔄 Triggering toggleAttributeBlocks with:', CARD_DATA.type);
                toggleAttributeBlocks(CARD_DATA.type);
            }

            // 🔥 Format 行：小说类产品显示 EPUB 专属说明
            const cat = (CARD_DATA.type || '').toLowerCase();
            const isNovel = cat.includes('小说') || cat.includes('novel') || cat.includes('xianxia') || cat.includes('cultivation');
            const formatDefault = document.getElementById('formatDefault');
            const formatEpub   = document.getElementById('formatEpub');
            if (formatDefault && formatEpub) {
                if (isNovel) {
                    formatDefault.style.display = 'none';
                    formatEpub.style.display     = 'inline';
                    console.log('✅ Format: EPUB mode');
                } else {
                    formatDefault.style.display = 'inline';
                    formatEpub.style.display     = 'none';
                    console.log('✅ Format: default mode');
                }
            }
        }
        
        // 🔥 动态更新 SEO 标签
        const productTitle = CARD_DATA.title || 'Taoist Digital Resource';
        const productDesc = (CARD_DATA.description || '').substring(0, 120) + '...';
        const productImage = CARD_DATA.images?.[0]?.src || 'https://daoessence.com/images/og-default.jpg';
        const productUrl = window.location.href;
        
        // 更新 <title>
        document.title = `${productTitle} | DAO Essence`;
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) pageTitle.textContent = `${productTitle} | DAO Essence`;
        
        // 更新 meta description
        const metaDesc = document.getElementById('metaDescription') || document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', `${productTitle} — ${productDesc} Instant digital download. | DAO Essence`);
        
        // 更新 OG 标签
        const ogTitle = document.getElementById('ogTitle');
        if (ogTitle) ogTitle.setAttribute('content', `${productTitle} | DAO Essence`);
        const ogDesc = document.getElementById('ogDescription');
        if (ogDesc) ogDesc.setAttribute('content', productDesc);
        const ogImg = document.getElementById('ogImage');
        if (ogImg) ogImg.setAttribute('content', productImage);
        const ogUrl = document.getElementById('ogUrl');
        if (ogUrl) ogUrl.setAttribute('content', productUrl);
        
        // 更新 Twitter Card 标签
        const twTitle = document.getElementById('twitterTitle');
        if (twTitle) twTitle.setAttribute('content', `${productTitle} | DAO Essence`);
        const twDesc = document.getElementById('twitterDescription');
        if (twDesc) twDesc.setAttribute('content', productDesc);
        const twImg = document.getElementById('twitterImage');
        if (twImg) twImg.setAttribute('content', productImage);
        
        // 🔥 注入 Product Schema (JSON-LD)
        const existingSchema = document.getElementById('productSchema');
        if (existingSchema) existingSchema.remove();
        const schemaScript = document.createElement('script');
        schemaScript.type = 'application/ld+json';
        schemaScript.id = 'productSchema';
        schemaScript.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": productTitle,
            "description": CARD_DATA.description || '',
            "image": productImage,
            "brand": { "@type": "Brand", "name": "DAO Essence" },
            "offers": {
                "@type": "Offer",
                "price": (CARD_DATA.price || 0).toFixed(2),
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock",
                "url": productUrl,
                "seller": { "@type": "Organization", "name": "DAO Essence" }
            },
            "category": CARD_DATA.type || "Digital Resource"
        });
        document.head.appendChild(schemaScript);
        console.log('✅ Product Schema injected');
        
        const cardSku = document.getElementById('cardSku');
        if (cardSku) {
            cardSku.textContent = 'SKU: ' + CARD_DATA.id;
            console.log('✅ Updated cardSku');
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
