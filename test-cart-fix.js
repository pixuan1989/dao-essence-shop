/**
 * 购物车功能完整测试脚本
 * 用于诊断和验证购物车功能是否正确工作
 */

console.log('========== CART FIX TEST SCRIPT LOADED ==========\n');

// 在页面完全加载后进行测试
window.addEventListener('load', function() {
    console.log('=== COMPREHENSIVE CART FIX TEST ===\n');
    
    // ========== STEP 1: 检查函数定义 ==========
    console.log('STEP 1: Checking function definitions');
    console.log('  - typeof toggleCart:', typeof toggleCart);
    console.log('  - typeof closeCart:', typeof closeCart);
    console.log('  - typeof openCart:', typeof openCart);
    
    if (typeof toggleCart !== 'function') {
        console.error('❌ CRITICAL: toggleCart is NOT a function!');
        return;
    }
    console.log('✅ All functions defined correctly\n');
    
    // ========== STEP 2: 检查DOM元素 ==========
    console.log('STEP 2: Checking DOM elements');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    const floatingCartBtn = document.querySelector('.floating-cart-btn');
    const floatingCartBadge = document.getElementById('floatingCartBadge');
    
    console.log('  - cartSidebar:', cartSidebar ? '✅ FOUND' : '❌ NOT FOUND');
    console.log('  - cartOverlay:', cartOverlay ? '✅ FOUND' : '❌ NOT FOUND');
    console.log('  - floatingCartBtn:', floatingCartBtn ? '✅ FOUND' : '❌ NOT FOUND');
    console.log('  - floatingCartBadge:', floatingCartBadge ? '✅ FOUND' : '❌ NOT FOUND');
    
    if (!cartSidebar || !cartOverlay || !floatingCartBtn) {
        console.error('❌ CRITICAL: Required DOM elements missing!');
        return;
    }
    console.log('✅ All DOM elements found\n');
    
    // ========== STEP 3: 检查CSS类名 ==========
    console.log('STEP 3: Checking CSS styles');
    const sidebarClasses = Array.from(cartSidebar.classList);
    const overlayClasses = Array.from(cartOverlay.classList);
    
    console.log('  - cartSidebar classes:', sidebarClasses.length > 0 ? sidebarClasses : '[]');
    console.log('  - cartOverlay classes:', overlayClasses.length > 0 ? overlayClasses : '[]');
    
    // 检查初始状态
    console.log('  - Initial sidebar state (should NOT have "open"):', 
        cartSidebar.classList.contains('open') ? '⚠️ HAS "open"' : '✅ No "open"');
    console.log('  - Initial overlay state (should NOT have "show"):', 
        cartOverlay.classList.contains('show') ? '⚠️ HAS "show"' : '✅ No "show"\n');
    
    // ========== STEP 4: 检查按钮元素属性 ==========
    console.log('STEP 4: Checking button element properties');
    console.log('  - Button ID:', floatingCartBtn.id || '(no id)');
    console.log('  - Button class:', floatingCartBtn.className);
    console.log('  - Button onclick attr:', floatingCartBtn.getAttribute('onclick') || '(none)');
    
    // 检查是否有事件监听器（不能直接访问，但可以尝试）
    console.log('  - Button element:', floatingCartBtn.tagName);
    console.log('  - Button visibility:', window.getComputedStyle(floatingCartBtn).display);
    console.log('');
    
    // ========== STEP 5: 测试toggleCart函数 ==========
    console.log('STEP 5: Testing toggleCart() function');
    console.log('Before toggleCart():');
    console.log('  - cartSidebar.classList:', Array.from(cartSidebar.classList));
    console.log('  - cartOverlay.classList:', Array.from(cartOverlay.classList));
    
    try {
        console.log('\n📌 Calling toggleCart()...');
        toggleCart();
        
        console.log('\nAfter toggleCart():');
        console.log('  - cartSidebar.classList:', Array.from(cartSidebar.classList));
        console.log('  - cartOverlay.classList:', Array.from(cartOverlay.classList));
        
        // 检查是否添加了正确的类
        if (cartSidebar.classList.contains('open') && cartOverlay.classList.contains('show')) {
            console.log('✅ SUCCESS: Cart opened with correct classes!');
        } else {
            console.error('❌ ERROR: Classes not added correctly');
        }
    } catch (error) {
        console.error('❌ EXCEPTION during toggleCart():', error.message);
        console.error('Stack:', error.stack);
    }
    console.log('');
    
    // ========== STEP 6: 检查按钮点击 ==========
    console.log('STEP 6: Manual button click test');
    console.log('About to simulate a click on the floating cart button...\n');
    
    // 模拟点击
    const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    });
    
    console.log('Before simulated click:');
    console.log('  - cartSidebar has "open":', cartSidebar.classList.contains('open'));
    
    floatingCartBtn.dispatchEvent(clickEvent);
    
    console.log('After simulated click:');
    console.log('  - cartSidebar has "open":', cartSidebar.classList.contains('open'));
    console.log('');
    
    // ========== STEP 7: 创建手动测试函数 ==========
    console.log('STEP 7: Test utilities created');
    console.log('You can now use these commands in console:\n');
    
    // 创建全局测试函数
    window.TEST_CART = {
        toggle: function() {
            console.log('>>> Manual TEST_CART.toggle() called');
            toggleCart();
        },
        open: function() {
            console.log('>>> Manual TEST_CART.open() called');
            openCart();
        },
        close: function() {
            console.log('>>> Manual TEST_CART.close() called');
            closeCart();
        },
        clickButton: function() {
            console.log('>>> Simulating button click');
            floatingCartBtn.click();
        },
        status: function() {
            console.log('Current cart state:');
            console.log('  - sidebar open:', cartSidebar.classList.contains('open'));
            console.log('  - overlay show:', cartOverlay.classList.contains('show'));
        }
    };
    
    console.log('  ✨ TEST_CART.toggle()   - Toggle cart');
    console.log('  ✨ TEST_CART.open()     - Open cart');
    console.log('  ✨ TEST_CART.close()    - Close cart');
    console.log('  ✨ TEST_CART.clickButton() - Simulate button click');
    console.log('  ✨ TEST_CART.status()   - Check current state\n');
    
    // ========== SUMMARY ==========
    console.log('========== TEST COMPLETE ==========');
    console.log('✅ All diagnostics finished. Check above for any errors.');
    console.log('📝 If cart still doesn\'t work, check the error messages above.\n');
});

// 全局错误捕获
window.addEventListener('error', function(e) {
    console.error('🔴 GLOBAL ERROR CAUGHT:', e.message);
    console.error('  File:', e.filename);
    console.error('  Line:', e.lineno);
});
