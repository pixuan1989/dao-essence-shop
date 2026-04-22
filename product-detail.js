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
    
    // 壁纸类关键词
    const wallpaperKeywords = [
        'wallpaper', 'background', 'desktop', 'lock screen', 'homescreen',
        '壁纸', '桌面', '锁屏', '手机壁纸', '电脑壁纸'
    ];
    
    // 检查产品名称
    const name = (card.name || card.product_name || '').toLowerCase();
    const nameCN = (card.nameCN || '').toLowerCase();
    const description = (card.description || '').toLowerCase();
    
    // 计算匹配度
    let novelScore = 0;
    let meditationScore = 0;
    let wallpaperScore = 0;
    
    // 检查显式分类
    if (explicitCategory) {
        const cat = explicitCategory.toLowerCase();
        if (cat.includes('小说') || cat.includes('novel') || cat.includes('book') || cat.includes('读物')) {
            novelScore += 10;
        }
        if (cat.includes('冥想') || cat.includes('meditation') || cat.includes('音频')) {
            meditationScore += 10;
        }
        if (cat.includes('壁纸') || cat.includes('wallpaper') || cat.includes('background')) {
            wallpaperScore += 10;
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
    
    wallpaperKeywords.forEach(keyword => {
        if (name.includes(keyword) || nameCN.includes(keyword)) {
            wallpaperScore += 2;
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
    
    wallpaperKeywords.forEach(keyword => {
        if (description.includes(keyword)) {
            wallpaperScore += 1;
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
    
    
    // 返回判断结果 - 优先使用检测结果，而不是原始分类
    if (wallpaperScore > novelScore && wallpaperScore > meditationScore) {
        return 'Five Elements Wallpaper';
    } else if (novelScore > meditationScore) {
        return 'Xianxia Novels';
    } else if (meditationScore > novelScore) {
        return 'Taoist Meditation';
    }
    
    // 默认返回原始分类或其他
    return card.categoryCN || card.category || '其他';
}

/**
 * 从 window.allProducts 中加载卡数据
 * 由 creem-sync-v2.js 填充 window.allProducts
 */
window.loadCardData = async function() {

    // 获取URL中的卡ID
    const urlParams = new URLSearchParams(window.location.search);
    const cardId = urlParams.get('id');
    
    // 如果没有指定ID，使用默认卡 (传统沉香)
    const defaultCardId = 'prod_7i2asEAuHFHl5hJMeCEsfB';
    const actualCardId = cardId || defaultCardId;
    
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
        
        const card = window.allProducts.find(p => p.id === actualCardId) || window.allProducts.find(p => p.id === defaultCardId);
        if (card) {

            // Creem API 只支持单图（image_url 字段），构建单元素数组供 renderImages 使用
            const cardImages = [{
                id: 1,
                src: card.image_url || card.image || 'images/placeholder.jpg',
                alt: card.nameCN || card.name || 'Card'
            }];


            // 转换 Creem API 数据格式为卡详情页需要的格式
            CARD_DATA = {
                id: card.id,
                title: card.name || card.product_name || (window.DaoI18n ? window.DaoI18n.t('product_detail.unknown_card') : 'Unknown Card'),
                titleZh: card.nameCN || card.name || (window.DaoI18n ? window.DaoI18n.t('product_detail.unknown_card') : 'Unknown Card'),
                handle: (card.name || 'card').toLowerCase().replace(/\s+/g, '-'),
                description: card.description || card.product_description || (window.DaoI18n ? window.DaoI18n.t('product_detail.no_description') : 'No description available'),
                descriptionZh: card.descriptionCN || card.description || card.product_description || (window.DaoI18n ? window.DaoI18n.t('product_detail.no_description') : 'No description available'),
                price: parseFloat(card.price) || 0,
                compareAtPrice: parseFloat(card.originalPrice || card.price) || 0,
                currency: card.currency || 'USD',
                images: cardImages,
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
            return true;
        }
    }
    
    if (!CARD_DATA) {
        console.error('Card not found:', actualCardId);
        // 使用默认数据结构作为 fallback
        CARD_DATA = {
            id: actualCardId,
            title: window.DaoI18n ? window.DaoI18n.t('product_detail.card_not_found') : 'Card Not Found',
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
    }
};

// ============================================
// Canvas 水印渲染 + 图片防护系统
// ============================================

/**
 * 用 Canvas 渲染图片并叠加平铺水印
 * 返回 canvas 元素（替代原始 img，防止右键另存为获取原图）
 */
function renderImageWithWatermark(src, alt, isThumb) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    var img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = function() {
        var w = img.naturalWidth;
        var h = img.naturalHeight;
        canvas.width = w;
        canvas.height = h;

        // 绘制原图
        ctx.drawImage(img, 0, 0, w, h);

        // 叠加水印
        var watermarkText = 'DaoEssence';
        var fontSize = isThumb ? Math.max(12, Math.round(w * 0.06)) : Math.max(16, Math.round(w * 0.04));
        ctx.save();
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold ' + fontSize + 'px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 平铺水印（旋转 -25 度）
        var stepX = isThumb ? w * 0.5 : w * 0.35;
        var stepY = isThumb ? h * 0.5 : h * 0.3;
        var offsetX = w * 0.1;
        var offsetY = h * 0.1;

        for (var y = offsetY; y < h + stepY; y += stepY) {
            for (var x = offsetX; x < w + stepX; x += stepX) {
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(-25 * Math.PI / 180);
                ctx.fillText(watermarkText, 0, 0);
                ctx.restore();
            }
        }
        ctx.restore();

        // 对预览图（非缩略图）额外降低画质提示
        if (!isThumb) {
            ctx.save();
            ctx.globalAlpha = 0.06;
            ctx.fillStyle = '#ffffff';
            var previewFontSize = Math.max(20, Math.round(w * 0.025));
            ctx.font = 'bold ' + previewFontSize + 'px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Preview', w / 2, h - fontSize * 2);
            ctx.restore();
        }
    };

    img.onerror = function() {
        // 加载失败时显示占位图
        canvas.width = 400;
        canvas.height = 400;
        ctx.fillStyle = '#1a1612';
        ctx.fillRect(0, 0, 400, 400);
        ctx.fillStyle = '#d4af37';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Image unavailable', 200, 200);
    };

    img.src = src;
    canvas.alt = alt || 'Product image';
    canvas.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;cursor:zoom-in;';

    return canvas;
}

// ============================================
// Render Images — Swiper Gallery + Lightbox
// ============================================

let mainSwiper = null;
let thumbsSwiper = null;

window.renderImages = function() {
    const mainWrapper = document.getElementById('mainImageWrapper');
    const thumbsWrapper = document.getElementById('thumbsWrapper');

    if (!mainWrapper || !CARD_DATA || !CARD_DATA.images || CARD_DATA.images.length === 0) return;

    // 清空现有内容
    mainWrapper.innerHTML = '';
    if (thumbsWrapper) thumbsWrapper.innerHTML = '';

    // 销毁旧 Swiper 实例
    if (mainSwiper) { mainSwiper.destroy(true, true); mainSwiper = null; }
    if (thumbsSwiper) { thumbsSwiper.destroy(true, true); thumbsSwiper = null; }

    const images = CARD_DATA.images;

    // --- 渲染主图 slides（Canvas + 水印） ---
    images.forEach(function(img, idx) {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.setAttribute('data-index', idx);

        // 使用 Canvas 替代 img 元素，防止右键获取原图
        const canvasEl = renderImageWithWatermark(img.src, img.alt, false);
        canvasEl.addEventListener('click', function() { openImageModal(idx); });

        // 透明遮罩层（防截图工具直接抓 DOM）
        const overlay = document.createElement('div');
        overlay.className = 'image-protection-overlay';

        slide.appendChild(canvasEl);
        slide.appendChild(overlay);
        mainWrapper.appendChild(slide);
    });

    // --- 渲染缩略图 slides（仅多图时显示，Canvas + 水印） ---
    if (thumbsWrapper && images.length > 1) {
        images.forEach(function(img, idx) {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';

            // 缩略图也用水印 Canvas
            const canvasEl = renderImageWithWatermark(img.src, img.alt || ('Thumb ' + (idx + 1)), true);
            slide.appendChild(canvasEl);
            thumbsWrapper.appendChild(slide);
        });
    }

    // --- 初始化主图 Swiper ---
    const swiperConfig = {
        spaceBetween: 0,
        slidesPerView: 1,
        speed: 400,
        loop: images.length > 1,
        pagination: {
            el: '.swiper-pagination-main',
            clickable: true
        },
        navigation: {
            nextEl: '.swiper-button-next-main',
            prevEl: '.swiper-button-prev-main'
        },
        on: {
            slideChangeTransitionEnd: function() {
                if (thumbsSwiper && images.length > 1) {
                    thumbsSwiper.slideTo(this.realIndex);
                }
            }
        }
    };

    mainSwiper = new Swiper('.swiper-main', swiperConfig);

    // --- 初始化缩略图 Swiper ---
    if (thumbsWrapper && images.length > 1) {
        // 显示缩略图区域
        thumbsWrapper.closest('.swiper-thumbs').style.display = 'block';

        thumbsSwiper = new Swiper('.swiper-thumbs', {
            spaceBetween: 10,
            slidesPerView: Math.min(images.length, 4),
            watchSlidesProgress: true,
            slideToClickedSlide: true,
            on: {
                click: function(swiper) {
                    if (mainSwiper) {
                        mainSwiper.slideTo(swiper.clickedIndex);
                    }
                }
            }
        });

        // 双向联动
        if (mainSwiper && thumbsSwiper) {
            mainSwiper.controller = { control: thumbsSwiper };
        }
    } else if (thumbsWrapper) {
        // 单图时隐藏缩略图区域
        const thumbsContainer = thumbsWrapper.closest('.swiper-thumbs');
        if (thumbsContainer) thumbsContainer.style.display = 'none';
    }

    // 显示/隐藏导航箭头和分页器
    const navNext = document.querySelector('.swiper-button-next-main');
    const navPrev = document.querySelector('.swiper-button-prev-main');
    const pagination = document.querySelector('.swiper-pagination-main');
    if (images.length <= 1) {
        if (navNext) navNext.style.display = 'none';
        if (navPrev) navPrev.style.display = 'none';
        if (pagination) pagination.style.display = 'none';
    } else {
        if (navNext) navNext.style.display = '';
        if (navPrev) navPrev.style.display = '';
        if (pagination) pagination.style.display = '';
    }
};

// ============================================
// Image Lightbox Modal
// ============================================

window.openImageModal = function(index) {
    if (!CARD_DATA || !CARD_DATA.images || CARD_DATA.images.length === 0) return;

    const modal = document.getElementById('imageModal');
    if (!modal) return;

    const imgIndex = index || 0;
    const imgData = CARD_DATA.images[imgIndex];

    // 移除旧的 modal 内容
    var oldCanvas = modal.querySelector('canvas');
    var oldOverlay = modal.querySelector('.image-protection-overlay');
    var oldImg = modal.querySelector('img');
    if (oldCanvas) oldCanvas.remove();
    if (oldOverlay) oldOverlay.remove();
    if (oldImg) oldImg.remove();

    // 用 Canvas + 水印渲染放大图
    const canvasEl = renderImageWithWatermark(imgData.src, imgData.alt || 'Zoomed image', false);
    canvasEl.style.cssText = 'max-width:95%;max-height:95%;object-fit:contain;border-radius:var(--radius-lg);cursor:default;';
    canvasEl.id = 'modalImage';

    // 遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'image-protection-overlay';

    modal.appendChild(canvasEl);
    modal.appendChild(overlay);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // ESC 关闭
    document.addEventListener('keydown', handleModalEsc);
};

window.closeImageModal = function() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    document.removeEventListener('keydown', handleModalEsc);
};

function handleModalEsc(e) {
    if (e.key === 'Escape') {
        closeImageModal();
    }
}

// 点击模态框背景（非图片区域）关闭 + 图片防护
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeImageModal();
            }
        });
    }

    // ===== 图片防护系统 =====

    // 1. 禁用右键菜单（图片区域）
    document.addEventListener('contextmenu', function(e) {
        var target = e.target;
        if (target.tagName === 'IMG' || target.tagName === 'CANVAS' ||
            target.closest('.swiper-main') || target.closest('.image-modal') ||
            target.closest('.card-gallery')) {
            e.preventDefault();
            return false;
        }
    });

    // 2. 禁用拖拽保存
    document.addEventListener('dragstart', function(e) {
        var target = e.target;
        if (target.tagName === 'IMG' || target.tagName === 'CANVAS' ||
            target.closest('.swiper-main') || target.closest('.image-modal') ||
            target.closest('.card-gallery')) {
            e.preventDefault();
            return false;
        }
    });

    // 3. 禁用图片区域文字选中（防止拖选后复制）
    document.addEventListener('selectstart', function(e) {
        var target = e.target;
        if (target.closest('.swiper-main') || target.closest('.image-modal') ||
            target.closest('.card-gallery')) {
            e.preventDefault();
            return false;
        }
    });

    // 4. 禁用 Ctrl+S / Cmd+S 保存页面（全页面）
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            return false;
        }
        // 禁用 PrintScreen（仅能降低成功率，无法完全阻止）
        if (e.key === 'PrintScreen') {
            // 用空白图片覆盖剪贴板（只能部分生效）
            document.body.style.display = 'none';
            setTimeout(function() { document.body.style.display = ''; }, 100);
        }
    });
});

// ============================================
// Variant Management
// ============================================

window.selectVariant = function(variantId) {
    if (!CARD_DATA) return;
    
    const variant = CARD_DATA.variants.find(v => v.id === variantId);
    if (variant) {
        currentVariant = variant;
        window.updateUIForVariant(variant);
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
            savingsTextElement.textContent = (window.DaoI18n ? window.DaoI18n.t('product_detail.save_text') : 'Save $') + savings.toFixed(2);
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

    // 调用 cart.js 中的 addToCart 函数
    if (typeof window.addToCart === 'function') {
        window.addToCart(cardId, quantity);
        // 注意：不自动打开侧边栏，保持"加入购物车"按钮的单一职责
    } else {
        console.error('❌ addToCart function not available');
    }
};

// ============================================
// Checkout URL 预创建 & 预加载系统
// 目标：用户点击 Buy Now 时 0 等待，瞬间跳转
// ============================================

// 🔥 页面加载时立即预热 Vercel Function（消除冷启动）
fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ __warmup: true })
}).catch(() => {}); // 静默失败，不影响任何东西


// 立即购买函数 - 每次实时创建 checkout（保证 URL 新鲜不过期）
window.buyNow = async function() {
    if (!CARD_DATA) {
        alert(window.DaoI18n ? window.DaoI18n.t('product_detail.alert_no_data') : 'Product data not loaded. Please refresh the page.');
        return;
    }

    // 防止重复点击
    if (window._buying) return;
    window._buying = true;

    // 立即显示 loading
    const buyBtn = document.querySelector('.btn-buy-now');
    const btnText = buyBtn?.querySelector('.btn-text');
    if (buyBtn) buyBtn.classList.add('loading');
    if (btnText) btnText.textContent = window.DaoI18n ? window.DaoI18n.t('product_detail.redirecting') : 'Redirecting...';

    try {
        const quantity = Math.max(1, parseInt(document.getElementById('quantity')?.value) || 1);
        const price = currentVariant?.price || CARD_DATA.variants?.[0]?.price || 0;
        const image = (CARD_DATA.images?.length > 0) ? CARD_DATA.images[0] : (CARD_DATA.image || '');

        const orderData = {
            items: [{ id: CARD_DATA.id, name: CARD_DATA.title || CARD_DATA.titleZh || 'Product', price, quantity, image }],
            total: price * quantity
        };

        const response = await fetch('/api/create-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();
        const checkoutUrl = data.checkoutUrl || data.checkout_url || data.url;

        if (checkoutUrl) {
            window.location.replace(checkoutUrl);
        } else {
            throw new Error('Failed to create checkout');
        }
    } catch (error) {
        console.error('❌ Buy now error:', error);
        alert(window.DaoI18n ? window.DaoI18n.t('product_detail.alert_payment_fail') : 'Unable to connect to payment service. Please try again.');
        window._buying = false;
        if (buyBtn) buyBtn.classList.remove('loading');
        if (btnText) btnText.textContent = window.DaoI18n ? window.DaoI18n.t('product_detail.buy_now') : 'Buy Now';
    }
};

// ============================================
// Initialize Page
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    
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


    // 3. 初始化页面UI
    window.initState();
    window.renderImages();
    
    // 3.5 更新所有卡信息到 HTML
    if (CARD_DATA) {
        const cardNameCn = document.getElementById('cardNameCn');
        if (cardNameCn) {
            cardNameCn.textContent = CARD_DATA.titleZh || CARD_DATA.title || 'Card Name';
        }
        
        const cardNameEn = document.getElementById('cardNameEn');
        if (cardNameEn) {
            cardNameEn.textContent = CARD_DATA.title || 'Card Name';
        }
        
        // 更新页面头部标题
        const pageTitleLarge = document.getElementById('pageTitleLarge');
        if (pageTitleLarge) {
            pageTitleLarge.textContent = CARD_DATA.titleZh || CARD_DATA.title || 'Card';
        }
        
        const pageTitleEn = document.getElementById('pageTitleEn');
        if (pageTitleEn) {
            pageTitleEn.textContent = CARD_DATA.title || 'Card Title';
        }
        
        // 更新面包屑
        const breadcrumbCard = document.getElementById('breadcrumbCard');
        if (breadcrumbCard) {
            breadcrumbCard.textContent = CARD_DATA.titleZh || CARD_DATA.title || 'Card';
        }
        
        const breadcrumbCategory = document.getElementById('breadcrumbCategory');
        if (breadcrumbCategory) {
            breadcrumbCategory.textContent = CARD_DATA.type || 'Category';
        }
        
        // 更新卡描述
        const cardDescription = document.getElementById('cardDescription');
        if (cardDescription) {
            cardDescription.innerHTML = '<p>' + (CARD_DATA.descriptionZh || CARD_DATA.description || 'No description available') + '</p>';
        }
        
        const cardCategoryTag = document.getElementById('cardCategoryTag');
        if (cardCategoryTag) {
            cardCategoryTag.textContent = CARD_DATA.type || 'Category';
            
            // 🔥 主动触发区块切换
            if (typeof toggleAttributeBlocks === 'function') {
                toggleAttributeBlocks(CARD_DATA.type);
            }

            // 🔥 Format 行：根据产品类型切换格式说明
            const cat = (CARD_DATA.type || '').toLowerCase();
            const isNovel = cat.includes('小说') || cat.includes('novel') || cat.includes('xianxia') || cat.includes('cultivation');
            const isWallpaper = cat.includes('壁纸') || cat.includes('wallpaper') || cat.includes('background');
            const formatDefault = document.getElementById('formatDefault');
            const formatEpub   = document.getElementById('formatEpub');
            const formatWallpaper = document.getElementById('formatWallpaper');
            if (formatDefault && formatEpub && formatWallpaper) {
                if (isNovel) {
                    formatDefault.style.display = 'none';
                    formatEpub.style.display     = 'inline';
                    formatWallpaper.style.display = 'none';
                } else if (isWallpaper) {
                    formatDefault.style.display = 'none';
                    formatEpub.style.display     = 'none';
                    formatWallpaper.style.display = 'inline';
                } else {
                    formatDefault.style.display = 'inline';
                    formatEpub.style.display     = 'none';
                    formatWallpaper.style.display = 'none';
                }
            }
            
            // 🔥 Type 行：壁纸产品显示更精确的类型
            const specType = document.getElementById('specType');
            if (specType && isWallpaper) {
                specType.textContent = window.DaoI18n ? window.DaoI18n.t('product_detail.spec_wallpaper_type') : 'Digital wallpaper (HD image set — phone, tablet, desktop)';
            }
        }
        
        // 🔥 动态更新 SEO 标签
        const productTitle = CARD_DATA.title || 'Taoist Digital Resource';
        const productDesc = (CARD_DATA.description || '').substring(0, 120) + '...';
        const productImage = CARD_DATA.images?.[0]?.src || 'https://www.daoessentia.com/images/og-default.jpg';
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
        
        const cardSku = document.getElementById('cardSku');
        if (cardSku) {
            cardSku.textContent = 'SKU: ' + CARD_DATA.id; // SKU is universal, no translation needed
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
    // button onclick 属性已在 HTML 中绑定，无需这里再绑定

});
