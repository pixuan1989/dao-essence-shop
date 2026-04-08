/**
 * ============================================
 * BaZi Checkout 创建 API (Vercel Functions)
 * 八字分析专用支付通道
 * 将八字数据写入 Creem checkout metadata
 * 支付成功后 webhook 可直接读取
 * ============================================
 */

/**
 * 测试模式产品 ID 映射（八字产品）
 */
const BAZI_TEST_PRODUCT_MAP = {
    // Bazi Life Guidance (八字分析)
    'prod_1Qp72f3fXnLkKoLvdyMaLw': 'prod_1Qp72f3fXnLkKoLvdyMaLw',
    // 旧版本产品 ID（前端可能还在使用）
    'prod_28PqAKMEom5WGRH1w9O35n': 'prod_1Qp72f3fXnLkKoLvdyMaLw',
};

/**
 * 根据产品 ID 和测试模式获取正确的 Creem Product ID
 * @param {string} productId - 产品 ID
 * @param {boolean} isTestMode - 是否测试模式
 * @returns {string} 正确的产品 ID
 */
function getBaziProductId(productId, isTestMode = false) {
    if (isTestMode) {
        // 测试模式：使用映射表
        const testProductId = BAZI_TEST_PRODUCT_MAP[productId];
        if (testProductId) {
            console.log(`🧪 测试模式八字产品映射: ${productId} → ${testProductId}`);
            return testProductId;
        }
        // 如果映射表没有，尝试使用环境变量
        const fallbackTestId = process.env.CREEM_TEST_PRODUCT_ID;
        if (fallbackTestId) {
            console.warn(`⚠️ 测试模式未找到映射，使用默认: ${productId} → ${fallbackTestId}`);
            return fallbackTestId;
        }
        console.warn(`⚠️ 测试模式未配置该产品: ${productId}`);
        return productId;
    }

    // 生产模式：直接使用产品 ID
    console.log(`🚀 生产模式八字产品: ${productId}`);
    return productId;
}

export default async function handler(req, res) {
    // 只允许 POST 请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            product_id,          // Creem 产品 ID（八字分析）
            name,                // 客户姓名
            email,               // 客户邮箱
            birth_year,          // 出生年
            birth_month,         // 出生月
            birth_day,           // 出生日
            birth_hour,          // 出生时（24小时制，-1表示未知）
            gender,              // 性别：male/female
            birth_place,         // 出生地
            notes,               // 备注
            language,            // 语言：zh/en
            discount_code        // 折扣码（可选）
        } = req.body;

        // 基础验证
        if (!product_id) {
            return res.status(400).json({ error: 'Missing product_id' });
        }
        if (!birth_year || !birth_month || !birth_day || !gender) {
            return res.status(400).json({ error: 'Missing birth info' });
        }

        // 测试模式判断（支持多种格式：'true'、true、'1'、1）
        const isTestMode = ['true', '1'].includes(String(process.env.CREEM_TEST_MODE).toLowerCase()) || req.body?.test_mode === true;

        // 🔥 调试：打印环境变量值
        console.log('========== 环境变量调试 ==========');
        console.log('CREEM_TEST_MODE:', process.env.CREEM_TEST_MODE);
        console.log('CREEM_TEST_MODE (类型):', typeof process.env.CREEM_TEST_MODE);
        console.log('CREEM_TEST_MODE (String):', String(process.env.CREEM_TEST_MODE));
        console.log('isTestMode (判断结果):', isTestMode);
        console.log('======================================');

        // 🔥 获取正确的产品 ID（考虑测试模式映射）
        const mappedProductId = getBaziProductId(product_id, isTestMode);
        console.log(`🎯 八字产品 ID (映射后): ${mappedProductId}`);

        // API Key 优先使用环境变量，否则回退到 creem-api-client.js 的 key（本地开发兼容）
        const apiKey = isTestMode
            ? (process.env.CREEM_TEST_API_KEY?.trim() || process.env.CREEM_API_KEY?.trim() || 'creem_1qa0zx2EuHN9gz9DLcGTAG')
            : (process.env.CREEM_API_KEY?.trim() || 'creem_1qa0zx2EuHN9gz9DLcGTAG');

        const creemApiBase = isTestMode
            ? 'https://test-api.creem.io/v1'
            : 'https://api.creem.io/v1';

        if (!apiKey) {
            console.error('环境变量缺失: CREEM_API_KEY');
            return res.status(500).json({ error: '支付系统配置错误' });
        }

        console.log(`💳 八字Checkout | 模式: ${isTestMode ? '🧪 测试' : '🚀 生产'} | 产品: ${product_id}`);
        console.log(`📋 八字数据: ${birth_year}/${birth_month}/${birth_day} ${birth_hour}时 | ${gender} | ${name} <${email}>`);

        const orderId = `BAZI_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

        const baseUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : (req.headers.origin || 'https://daoessentia.com');

        // 支付成功回调页面（不传 total，避免价格不一致）
        const successUrl = `${baseUrl}/payment-success.html?order_id=${orderId}&type=bazi&lang=${language || 'zh'}`;

        // ============================================
        // 核心：将八字数据写入 metadata
        // Creem webhook 会原封不动地返回这些字段
        // ============================================
        const creemCheckoutData = {
            product_id: mappedProductId,
            success_url: successUrl,
            request_id: orderId,

            // 【关键】八字数据写入 metadata —— webhook 会收到
            metadata: {
                order_id: orderId,
                product_type: 'bazi_analysis',

                // 八字核心数据（必须字段）
                birth_year: String(birth_year),
                birth_month: String(birth_month),
                birth_day: String(birth_day),
                birth_hour: String(birth_hour),
                gender: gender,

                // 可选字段
                birth_place: birth_place || '',
                notes: notes || '',
                name: name || '',
                email: email || ''
            }
        };

        // 折扣码
        if (discount_code) {
            creemCheckoutData.discount_code = discount_code;
        }

        console.log('========== Creem API 请求详情 ==========');
        console.log(`📤 URL: ${creemApiBase}/checkouts`);
        console.log(`📤 Method: POST`);
        console.log(`📤 API Key (前15位): ${apiKey.substring(0, 15)}...`);
        console.log(`📤 请求体 (JSON):`);
        console.log(JSON.stringify(creemCheckoutData, null, 2));
        console.log('======================================');

        // 调用 Creem API
        const response = await fetch(`${creemApiBase}/checkouts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify(creemCheckoutData)
        });

        const resultText = await response.text();
        console.log('========== Creem API 响应详情 ==========');
        console.log(`📥 状态码: ${response.status} ${response.statusText}`);
        console.log(`📥 响应头: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
        console.log(`📥 响应内容 (原始):`);
        console.log(resultText);
        console.log('======================================');

        let result;
        try {
            result = JSON.parse(resultText);
        } catch (e) {
            result = { raw_response: resultText };
        }

        if (!response.ok) {
            console.error('========== Creem API 错误分析 ==========');
            console.error(`❌ 错误状态: ${response.status} ${response.statusText}`);
            console.error(`❌ 错误信息: ${result.error || result.message || 'Unknown error'}`);
            if (result.details) {
                console.error(`❌ 错误详情:`);
                console.error(JSON.stringify(result.details, null, 2));
            }
            console.error('======================================');
            return res.status(500).json({
                error: result.error || result.message || result.raw_response || '创建支付会话失败',
                details: result,
                full_response: result
            });
        }

        if (!result.checkout_url) {
            console.error('Creem API 响应缺少 checkout_url');
            return res.status(500).json({ error: '支付系统响应错误' });
        }

        console.log(`✅ Checkout 创建成功: ${result.id}`);
        console.log(`   回调URL: ${result.checkout_url}`);

        return res.status(200).json({
            success: true,
            checkoutUrl: result.checkout_url,
            checkoutId: result.id,
            orderId: orderId
        });

    } catch (error) {
        console.error('创建八字Checkout错误:', error);
        return res.status(500).json({ error: '创建支付会话失败' });
    }
}
