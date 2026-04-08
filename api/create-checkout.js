/**
 * ============================================
 * Creem Checkout 创建 API (Vercel Functions)
 * 处理 Creem 支付会话创建
 * 支持多产品动态选择 Creem Product ID
 * ============================================
 */

/**
 * 测试模式产品 ID 映射（测试环境）
 * 填入你在 Creem 测试后台创建的测试产品 ID
 * 访问：https://creem.io/dashboard (切换到 Test Mode) → Products
 * Key: 生产环境的产品 ID
 * Value: 测试环境的产品 ID
 */
const CREEM_TEST_PRODUCT_MAP = {
    // Bazi Life Guidance (八字商品)
    'prod_1Qp72f3fXnLkKoLvdyMaLw': 'prod_1Qp72f3fXnLkKoLvdyMaLw',
    // Taoist Music (道家冥想音频)
    'prod_45v7a05ZjqA9a1LVq0o0g3': 'prod_5UZbtblZ9pRGRl0J2oOHPF',
    // Tao Te Ching (道德经)
    'prod_26987QrSoIC3ui76ill96H': 'prod_26987QrSoIC3ui76ill96H', // 待更新
    // Lord of Mysteries (诡秘之主)
    'prod_3btZfL4MwsO2xSr7AB3J8S': 'prod_3btZfL4MwsO2xSr7AB3J8S', // 待更新
    // Agarwood Energy Cleansing (沉香冥想音频)
    'prod_7i2asEAuHFHl5hJMeCEsfB': 'prod_7i2asEAuHFHl5hJMeCEsfB', // 待更新
    // Five Elements Energy (五行能量音频合集)
    'prod_1YuuAVysoYK6AOmQVab2uR': 'prod_1YuuAVysoYK6AOmQVab2uR', // 待更新
};


/**
 * 根据购物车 items 获取对应的 Creem Product ID
 * @param {Array} items - 购物车商品列表
 * @param {boolean} isTestMode - 是否为测试模式
 * @returns {string|null} Creem Product ID
 *
 * 逻辑：
 * - 生产模式：直接使用前端传来的 Creem Product ID
 * - 测试模式：使用 CREEM_TEST_PRODUCT_MAP 映射，映射到测试环境的产品 ID
 */
function getCreemProductId(items, isTestMode = false) {
    if (!items || items.length === 0) return null;

    const firstItem = items[0];
    const creemProductId = firstItem.id;

    // 测试模式：使用测试产品映射
    if (isTestMode) {
        const testProductId = CREEM_TEST_PRODUCT_MAP[creemProductId];
        if (testProductId) {
            console.log(`🧪 测试模式: ${creemProductId} (${firstItem.name}) → ${testProductId}`);
            return testProductId;
        }
        // 如果映射表没有，回退到默认的 CREEM_TEST_PRODUCT_ID
        const fallbackTestId = process.env.CREEM_TEST_PRODUCT_ID;
        if (fallbackTestId) {
            console.warn(`⚠️ 测试模式未找到映射，使用默认: ${creemProductId} → ${fallbackTestId}`);
            return fallbackTestId;
        }
        console.warn(`⚠️ 测试模式未配置该产品: ${creemProductId}`);
        return creemProductId;
    }

    // 生产模式：直接使用前端传来的 Creem Product ID
    console.log(`🚀 生产模式: 使用 Creem Product ID: ${creemProductId} (${firstItem.name})`);
    return creemProductId;
}

/**
 * Vercel Function 主处理函数
 */
export default async function handler(req, res) {
    // 只允许 POST 请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 接受 warmup ping，仅用于预热函数，不创建 checkout
    if (req.body?.__warmup) {
        return res.status(200).json({ warmed: true });
    }

    try {
        const { items, discountCode } = req.body;

        // 🔥 调试日志：打印接收到的完整请求数据
        console.log('📥 收到创建支付请求:', {
            itemCount: items?.length,
            firstItem: items?.[0] ? {
                id: items[0].id,
                name: items[0].name,
                price: items[0].price,
                quantity: items[0].quantity
            } : null,
            discountCode
        });

        // 验证必要参数
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Invalid items' });
        }

        // 测试模式：优先使用 CREEM_TEST_MODE 环境变量，也可由请求传入 test_mode 参数
        const isTestMode = process.env.CREEM_TEST_MODE === 'true' || req.body?.test_mode === true;
        
        const apiKey = isTestMode
            ? (process.env.CREEM_TEST_API_KEY?.trim() || process.env.CREEM_API_KEY?.trim())
            : process.env.CREEM_API_KEY?.trim();
        
        const creemApiBase = isTestMode
            ? 'https://test-api.creem.io/v1'
            : 'https://api.creem.io/v1';

        const creemDiscountCode = process.env.CREEM_DISCOUNT_CODE?.trim();

        if (!apiKey) {
            console.error('环境变量缺失: CREEM_API_KEY');
            return res.status(500).json({ error: '支付系统配置错误' });
        }
        
        console.log(`💳 支付模式: ${isTestMode ? '🧪 测试模式' : '🚀 生产模式'} | API: ${creemApiBase}`);

        // 根据购物车产品动态获取 Creem Product ID
        const productId = getCreemProductId(items, isTestMode);

        // 🔥 调试日志：确认将要使用的 Creem Product ID
        console.log(`🎯 将使用 Creem Product ID: ${productId}`);
        
        if (!productId) {
            return res.status(400).json({ 
                error: '该产品尚未配置支付信息，请联系客服',
                product: items[0]?.name || items[0]?.id
            });
        }

        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const useDiscountCode = discountCode || creemDiscountCode || (items.some(item => item.hasDiscount) ? 'XJCX520' : null);
        const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

        const baseUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : (req.headers.origin || 'https://daoessentia.com');
        // 不传 total 参数，避免前端价格和 Creem 价格不一致
        const successUrl = `${baseUrl}/payment-success.html?order_id=${orderId}`;

        // 准备 Creem API 请求数据（精简，去掉不必要的 metadata）
        const creemCheckoutData = {
            product_id: productId,
            success_url: successUrl,
            request_id: orderId
        };

        if (useDiscountCode) {
            creemCheckoutData.discount_code = useDiscountCode;
        }

        // 调用 Creem API（根据模式使用不同端点）
        const response = await fetch(`${creemApiBase}/checkouts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify(creemCheckoutData)
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Creem API 错误:', result.error || result.message);
            return res.status(500).json({ error: result.error || result.message || '创建支付会话失败' });
        }

        if (!result.checkout_url) {
            console.error('Creem API 响应缺少 checkout_url');
            return res.status(500).json({ error: '支付系统响应错误' });
        }

        return res.status(200).json({
            success: true,
            checkoutUrl: result.checkout_url,
            orderId: orderId
        });

    } catch (error) {
        console.error('创建 Creem Checkout 错误:', error);
        return res.status(500).json({ error: '创建支付会话失败' });
    }
}