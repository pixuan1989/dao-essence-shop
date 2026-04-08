/**
 * ============================================
 * Creem Checkout 创建 API (Vercel Functions)
 * 处理 Creem 支付会话创建
 * 支持多产品动态选择 Creem Product ID
 * ============================================
 */

/**
 * 产品 ID 到 Creem Product ID 的映射（生产环境）
 * 注意：key 是购物车中使用的 ID（即 Creem Product ID），value 也是 Creem Product ID
 * 这样设计是因为前端直接使用 Creem ID 作为产品标识
 */
const CREEM_PRODUCT_MAP = {
    // 沉香冥想音频
    'prod_7i2asEAuHFHl5hJMeCEsfB': 'prod_7i2asEAuHFHl5hJMeCEsfB',
    // 五行能量音频合集
    'prod_1YuuAVysoYK6AOmQVab2uR': 'prod_1YuuAVysoYK6AOmQVab2uR',
    // Lord of Mysteries 小说
    'prod_3btZfL4MwsO2xSr7AB3J8S': 'prod_3btZfL4MwsO2xSr7AB3J8S',
    // 道德经
    'prod_26987QrSoIC3ui76ill96H': 'prod_26987QrSoIC3ui76ill96H',
    // 新增道家冥想产品
    'prod_45v7a05ZjqA9a1LVq0o0g3': 'prod_45v7a05ZjqA9a1LVq0o0g3',
    // 待配置的产品（请在 Creem 后台创建后填入）
    'prod_xxx_taisui': 'prod_xxx_taisui',
    'prod_xxx_obsidian': 'prod_xxx_obsidian'
};

/**
 * 测试模式产品 ID 映射（测试环境）
 * 填入你在 Creem 测试后台创建的测试产品 ID
 * 访问：https://creem.io/dashboard (切换到 Test Mode) → Products
 * 如果没有测试产品，任意产品 ID 均会映射到 CREEM_TEST_PRODUCT_ID 环境变量（如有设置）
 */
const CREEM_TEST_PRODUCT_MAP = {
    // 用环境变量 CREEM_TEST_PRODUCT_ID 覆盖，或在此处填入测试产品 ID
    // 示例：'prod_7i2asEAuHFHl5hJMeCEsfB': 'test_prod_xxxxxxxx'
};


/**
 * 根据购物车 items 获取对应的 Creem Product ID
 * @param {Array} items - 购物车商品列表
 * @param {boolean} isTestMode - 是否为测试模式
 * @returns {string|null} Creem Product ID
 */
function getCreemProductId(items, isTestMode = false) {
    if (!items || items.length === 0) return null;
    
    const firstItem = items[0];
    const localProductId = firstItem.id;
    
    if (isTestMode) {
        // 测试模式：先查测试映射表，没有则用 CREEM_TEST_PRODUCT_ID 环境变量兜底
        const testId = CREEM_TEST_PRODUCT_MAP[localProductId] || process.env.CREEM_TEST_PRODUCT_ID;
        if (testId) {
            console.log(`🧪 测试产品映射: ${localProductId} → ${testId}`);
            return testId;
        }
        // 没有测试产品 ID 配置时，直接用原始 ID（让 Creem 测试 API 返回具体错误）
        console.warn(`⚠️ 测试模式下未配置测试产品 ID，使用原始 ID: ${localProductId}`);
        console.warn(`   请在 Vercel 控制台添加 CREEM_TEST_PRODUCT_ID 环境变量（测试模式产品 ID）`);
        return localProductId;
    }

    // 生产模式
    const creemId = CREEM_PRODUCT_MAP[localProductId];
    if (!creemId || creemId.startsWith('prod_xxx_')) {
        console.warn(`⚠️ 产品 "${localProductId}" 未配置 Creem Product ID，请检查 CREEM_PRODUCT_MAP`);
        return localProductId;
    }
    
    console.log(`✅ 产品映射: ${localProductId} → ${creemId}`);
    return creemId;
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