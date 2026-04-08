/**
 * ============================================
 * BaZi Checkout 创建 API (Vercel Functions)
 * 八字分析专用支付通道
 * 将八字数据写入 Creem checkout metadata
 * 支付成功后 webhook 可直接读取
 * ============================================
 */

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

        // 测试模式判断
        const isTestMode = process.env.CREEM_TEST_MODE === 'true' || req.body?.test_mode === true;

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

        // 支付成功回调页面
        const successUrl = `${baseUrl}/payment-success.html?order_id=${orderId}&type=bazi&lang=${language || 'zh'}`;

        // ============================================
        // 核心：将八字数据写入 metadata
        // Creem webhook 会原封不动地返回这些字段
        // ============================================
        const creemCheckoutData = {
            product_id: product_id,
            success_url: successUrl,
            request_id: orderId,

            // 【关键】八字数据写入 metadata —— webhook 会收到
            // 注意：先测试不加 customer 对象，避免字段冲突
            metadata: {
                order_id: orderId,
                product_type: 'bazi_analysis',
                language: language || 'en',

                // 八字核心数据
                birth_year: String(birth_year),
                birth_month: String(birth_month),
                birth_day: String(birth_day),
                birth_hour: String(birth_hour),
                gender: gender,

                // 出生地和备注
                birth_place: birth_place || '',
                notes: notes || '',

                // 客户姓名和邮箱（双重保险）
                customer_name: name || '',
                customer_email: email || '',

                // 时间戳
                created_at: new Date().toISOString()
            }
        };

        // 折扣码
        if (discount_code) {
            creemCheckoutData.discount_code = discount_code;
        }

        console.log('📤 请求 Creem API:', JSON.stringify({
            url: `${creemApiBase}/checkouts`,
            method: 'POST',
            body: creemCheckoutData
        }, null, 2));

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
        console.log('📥 Creem API 响应状态:', response.status, response.statusText);
        console.log('📥 Creem API 响应原始内容:', resultText);

        let result;
        try {
            result = JSON.parse(resultText);
        } catch (e) {
            result = { raw_response: resultText };
        }

        if (!response.ok) {
            console.error('❌ Creem API 错误:', JSON.stringify(result, null, 2));
            return res.status(500).json({
                error: result.error || result.message || result.raw_response || '创建支付会话失败',
                details: result
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
