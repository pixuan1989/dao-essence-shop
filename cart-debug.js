/**
 * 购物车调试脚本 - cart-debug.js
 * 用于诊断购物车按钮点击问题
 */

console.log('========== CART DEBUG SCRIPT LOADED ==========');

// 检查 toggleCart 是否存在
window.addEventListener('load', function() {
    console.log('\n=== STEP 1: 检查函数定义 ===');
    console.log('typeof toggleCart:', typeof toggleCart);
    
    if (typeof toggleCart !== 'function') {
        console.error('❌ CRITICAL: toggleCart 函数未定义!');
        return;
    }
    console.log('✅ toggleCart 函数已加载');
    
    console.log('\n=== STEP 2: 检查DOM元素 ===');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    const floatingBtn = document.querySelector('.floating-cart-btn');
    
    console.log('cartSidebar:', cartSidebar ? '✅ 存在' : '❌ 不存在');
    console.log('cartOverlay:', cartOverlay ? '✅ 存在' : '❌ 不存在');
    console.log('floatingBtn:', floatingBtn ? '✅ 存在' : '❌ 不存在');
    
    console.log('\n=== STEP 3: 检查CSS样式 ===');
    if (cartOverlay) {
        const styles = window.getComputedStyle(cartOverlay);
        console.log('cartOverlay opacity:', styles.opacity);
        console.log('cartOverlay visibility:', styles.visibility);
        console.log('cartOverlay display:', styles.display);
    }
    
    if (cartSidebar) {
        const styles = window.getComputedStyle(cartSidebar);
        console.log('cartSidebar right:', styles.right);
        console.log('cartSidebar display:', styles.display);
    }
    
    console.log('\n=== STEP 4: 手动测试toggleCart ===');
    console.log('即将执行: toggleCart()');
    console.log('请观察是否看到 "=== toggleCart() CALLED ===" 的日志');
    
    // 创建测试函数
    window.TEST_TOGGLE_CART = function() {
        console.log('\n>>> 用户手动调用 TEST_TOGGLE_CART()');
        toggleCart();
    };
    
    console.log('✅ 测试函数已创建: window.TEST_TOGGLE_CART()');
    console.log('💡 提示: 在控制台中输入 TEST_TOGGLE_CART() 来测试购物车功能');
    
    console.log('\n=== STEP 5: 检查事件监听 ===');
    if (floatingBtn) {
        console.log('浮动按钮 onclick 属性:', floatingBtn.getAttribute('onclick'));
        console.log('💡 尝试: 在浮动按钮上右键 > 检查元素，观察元素属性');
    }
    
    console.log('\n========== DEBUG READY ==========\n');
});

// 添加全局错误处理
window.addEventListener('error', function(e) {
    console.error('🔴 GLOBAL ERROR:', e.message);
    console.error('File:', e.filename);
    console.error('Line:', e.lineno);
});
