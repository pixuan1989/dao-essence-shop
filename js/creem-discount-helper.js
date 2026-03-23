/**
 * Creem 折扣标记助手
 *
 * 用于在购物车商品中标记折扣状态，让支付 API 能够选择正确的产品 ID
 */

// ============================================
// 配置
// ============================================

// 全局折扣开关（与 shop-manager.js 中的 SHOW_DISCOUNT 同步）
const SHOW_DISCOUNT = true; // true 显示折扣价，false 显示原价

// ============================================
// 添加折扣标记到商品
// ============================================

/**
 * 为商品添加折扣标记
 * @param {Object} product - 商品对象
 * @returns {Object} 带有折扣标记的商品
 */
function addDiscountMark(product) {
    return {
        ...product,
        hasDiscount: SHOW_DISCOUNT && product.originalPrice ? true : false
    };
}

/**
 * 为商品列表添加折扣标记
 * @param {Array} products - 商品数组
 * @returns {Array} 带有折扣标记的商品数组
 */
function addDiscountMarks(products) {
    return products.map(product => addDiscountMark(product));
}

// ============================================
// 折扣价格计算
// ============================================

/**
 * 获取显示价格（根据折扣开关）
 * @param {Object} product - 商品对象
 * @returns {number} 显示的价格
 */
function getDisplayPrice(product) {
    return SHOW_DISCOUNT && product.price ? product.price : (product.originalPrice || product.price);
}

/**
 * 计算折扣百分比
 * @param {Object} product - 商品对象
 * @returns {string} 折扣百分比，如 "15% OFF"
 */
function getDiscountPercentage(product) {
    if (!SHOW_DISCOUNT || !product.originalPrice || !product.price) {
        return '';
    }

    const discount = ((product.originalPrice - product.price) / product.originalPrice) * 100;
    return `${Math.round(discount)}% OFF`;
}

// ============================================
// Creem 产品 ID 选择逻辑
// ============================================

/**
 * 判断购物车是否应该使用折扣产品 ID
 * @param {Array} items - 购物车商品数组
 * @returns {boolean} 是否应该使用折扣产品
 */
function shouldUseDiscountProduct(items) {
    return items.some(item => item.hasDiscount === true);
}

// ============================================
// 购物车集成
// ============================================

/**
 * 从 localStorage 读取购物车并添加折扣标记
 * @returns {Array} 带有折扣标记的购物车商品
 */
function getCartWithDiscountMarks() {
    try {
        const cartData = localStorage.getItem('cart');
        if (!cartData) return [];

        let cart = JSON.parse(cartData);

        // 为每个商品添加折扣标记
        if (Array.isArray(cart)) {
            cart = cart.map(item => ({
                ...item,
                hasDiscount: SHOW_DISCOUNT && item.originalPrice ? true : false
            }));
        }

        return cart;
    } catch (error) {
        console.error('读取购物车失败:', error);
        return [];
    }
}

/**
 * 保存购物车到 localStorage（自动添加折扣标记）
 * @param {Array} items - 购物车商品数组
 */
function saveCartWithDiscountMarks(items) {
    try {
        // 为每个商品添加折扣标记
        const itemsWithMarks = addDiscountMarks(items);
        localStorage.setItem('cart', JSON.stringify(itemsWithMarks));
        return true;
    } catch (error) {
        console.error('保存购物车失败:', error);
        return false;
    }
}

/**
 * 添加商品到购物车（自动添加折扣标记）
 * @param {Object} product - 商品对象
 * @param {number} quantity - 数量（默认 1）
 */
function addToCartWithDiscountMark(product, quantity = 1) {
    try {
        const cart = getCartWithDiscountMarks();
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                ...product,
                quantity: quantity,
                hasDiscount: SHOW_DISCOUNT && product.originalPrice ? true : false
            });
        }

        return saveCartWithDiscountMarks(cart);
    } catch (error) {
        console.error('添加商品到购物车失败:', error);
        return false;
    }
}

// ============================================
// 初始化
// ============================================

// 将折扣标记同步到 localStorage 中的现有购物车
function syncDiscountMarks() {
    const cart = getCartWithDiscountMarks();
    if (cart.length > 0) {
        saveCartWithDiscountMarks(cart);
        console.log('✅ 购物车折扣标记已同步');
    }
}

// 页面加载时自动同步折扣标记
document.addEventListener('DOMContentLoaded', syncDiscountMarks);

// ============================================
// 导出到全局
// ============================================

window.CreemDiscountHelper = {
    addDiscountMark,
    addDiscountMarks,
    getDisplayPrice,
    getDiscountPercentage,
    shouldUseDiscountProduct,
    getCartWithDiscountMarks,
    saveCartWithDiscountMarks,
    addToCartWithDiscountMark,
    SHOW_DISCOUNT
};

console.log('✅ Creem 折扣标记助手已加载');
