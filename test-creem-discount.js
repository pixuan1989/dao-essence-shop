/**
 * Creem 折扣功能测试脚本
 *
 * 使用方法：
 * 1. 在浏览器控制台运行此脚本
 * 2. 或者将此脚本加载到测试页面
 */

// ============================================
// 测试 1：检查折扣标记助手
// ============================================

function testDiscountHelper() {
    console.log('🧪 测试 1：折扣标记助手');

    if (!window.CreemDiscountHelper) {
        console.error('❌ CreemDiscountHelper 未加载');
        return false;
    }

    console.log('✅ CreemDiscountHelper 已加载');
    console.log('   折扣开关:', window.CreemDiscountHelper.SHOW_DISCOUNT);

    const cart = window.CreemDiscountHelper.getCartWithDiscountMarks();
    console.log('   购物车商品数量:', cart.length);
    console.log('   购物车商品:', cart);

    return true;
}

// ============================================
// 测试 2：检查购物车折扣标记
// ============================================

function testCartDiscountMarks() {
    console.log('🧪 测试 2：购物车折扣标记');

    const cart = window.CreemDiscountHelper ? 
        window.CreemDiscountHelper.getCartWithDiscountMarks() : [];

    if (cart.length === 0) {
        console.warn('⚠️ 购物车为空，请先添加商品');
        return false;
    }

    const hasDiscountItems = cart.some(item => item.hasDiscount === true);
    console.log('   购物车是否有折扣商品:', hasDiscountItems);
    console.log('   应该使用折扣产品 ID:', hasDiscountItems);

    cart.forEach((item, index) => {
        console.log(`   商品 ${index + 1}: ${item.nameCN || item.name}`);
        console.log(`     - hasDiscount: ${item.hasDiscount}`);
        console.log(`     - 显示价格: $${item.price}`);
        console.log(`     - 原价: $${item.originalPrice || 'N/A'}`);
    });

    return hasDiscountItems;
}

// ============================================
// 测试 3：模拟 API 请求
// ============================================

function testCreemApiRequest() {
    console.log('🧪 测试 3：模拟 Creem API 请求');

    const cart = window.CreemDiscountHelper ? 
        window.CreemDiscountHelper.getCartWithDiscountMarks() : [];

    if (cart.length === 0) {
        console.warn('⚠️ 购物车为空');
        return false;
    }

    // 准备 API 请求数据
    const requestData = {
        items: cart.map(item => ({
            id: item.id,
            name: item.name || item.nameCN,
            price: item.price,
            quantity: item.quantity,
            hasDiscount: item.hasDiscount || false
        })),
        shipping: 15,
        customerName: 'Test Customer',
        customerEmail: 'test@example.com'
    };

    const useDiscountProduct = cart.some(item => item.hasDiscount === true);

    console.log('   API 请求数据:', JSON.stringify(requestData, null, 2));
    console.log('   使用折扣产品 ID:', useDiscountProduct);
    console.log('   预期产品 ID:', useDiscountProduct ? 'prod_discount_price' : 'prod_normal_price');

    return true;
}

// ============================================
// 测试 4：价格计算验证
// ============================================

function testPriceCalculation() {
    console.log('🧪 测试 4：价格计算验证');

    const cart = window.CreemDiscountHelper ? 
        window.CreemDiscountHelper.getCartWithDiscountMarks() : [];

    if (cart.length === 0) {
        console.warn('⚠️ 购物车为空');
        return false;
    }

    let websiteTotal = 0;
    let creemExpected = 0;

    cart.forEach(item => {
        const displayPrice = item.price;
        const qty = item.quantity;

        websiteTotal += displayPrice * qty;

        if (item.hasDiscount) {
            // 如果有折扣，Creem 应该收折扣价
            creemExpected += displayPrice * qty;
        } else {
            // 如果没有折扣，Creem 应该收原价
            creemExpected += (item.originalPrice || displayPrice) * qty;
        }
    });

    const shipping = 15;
    websiteTotal += shipping;
    creemExpected += shipping;

    console.log('   网站显示总价:', `$${websiteTotal.toFixed(2)}`);
    console.log('   Creem 预期总价:', `$${creemExpected.toFixed(2)}`);
    console.log('   价格是否一致:', websiteTotal === creemExpected ? '✅ 一致' : '❌ 不一致');

    return websiteTotal === creemExpected;
}

// ============================================
// 测试 5：完整流程测试
// ============================================

function runAllTests() {
    console.log('========================================');
    console.log('🚀 开始 Creem 折扣功能完整测试');
    console.log('========================================\n');

    const results = {
        test1: testDiscountHelper(),
        test2: testCartDiscountMarks(),
        test3: testCreemApiRequest(),
        test4: testPriceCalculation()
    };

    console.log('\n========================================');
    console.log('📊 测试结果汇总');
    console.log('========================================');
    console.log('   折扣标记助手:', results.test1 ? '✅ 通过' : '❌ 失败');
    console.log('   购物车折扣标记:', results.test2 ? '✅ 通过' : '❌ 失败');
    console.log('   API 请求模拟:', results.test3 ? '✅ 通过' : '❌ 失败');
    console.log('   价格计算验证:', results.test4 ? '✅ 通过' : '❌ 失败');

    const allPassed = Object.values(results).every(r => r === true);
    console.log('\n   总体结果:', allPassed ? '✅ 所有测试通过' : '❌ 部分测试失败');
    console.log('========================================\n');

    return allPassed;
}

// ============================================
// 导出测试函数
// ============================================

if (typeof window !== 'undefined') {
    window.CreemDiscountTests = {
        testDiscountHelper,
        testCartDiscountMarks,
        testCreemApiRequest,
        testPriceCalculation,
        runAllTests
    };

    console.log('✅ Creem 折扣测试工具已加载');
    console.log('   运行 CreemDiscountTests.runAllTests() 开始测试');
}
