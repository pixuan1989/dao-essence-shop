/**
 * ============================================
 * Creem Checkout 创建 API (Vercel Functions)
 * 处理 Creem 支付会话创建
 * 支持多产品动态选择 Creem Product ID
 * ============================================
 */

/**
 * 根据购物车 items 获取对应的 Creem Product ID
 * @param {Array} items - 购物车商品列表
 * @returns {string|null} Creem Product ID
 */
function getCreemProductId(items) {
    if (!items || items.length === 0) return null;
    const firstItem = items[0];
    const creemProductId = firstItem.id;
    console.log(`🚀 生产模式: 使用 Creem Product ID: ${creemProductId} (${firstItem.name})`);
    return creemProductId;
}

/**
 * Vercel Function 主处理函数
 */
export default async function handler(req, res) {
    // 🔥 GET 请求：返回当前配置状态（用于调试）
    if (req.method === 'GET') {
        const apiKey = process.env.CREEM_API_KEY?.trim() || '';
        return res.status(200).json({
            codeVersion: 'v3-production-only',
            creemApiBase: 'https://api.creem.io/v1',
            apiKeyPrefix: apiKey.substring(0, 15) + '...',
            hasApiKey: !!apiKey,
            discountCode: process.env.CREEM_DISCOUNT_CODE?.trim() || null,
            timestamp: new Date().toISOString()
        });
    }

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

        // 🚀 强制生产模式（测试模式已彻底移除）
        const apiKey = process.env.CREEM_API_KEY?.trim();
        const creemApiBase = 'https://api.creem.io/v1';

        const creemDiscountCode = process.env.CREEM_DISCOUNT_CODE?.trim();

        if (!apiKey) {
            console.error('环境变量缺失: CREEM_API_KEY');
            return res.status(500).json({ error: '支付系统配置错误' });
        }

        console.log('========== 支付配置 ==========');
        console.log('API 端点:', creemApiBase);
        console.log('API Key (前15位):', apiKey.substring(0, 15) + '...');
        console.log('模式: 🚀 生产模式');
        console.log('======================================');

        // 根据购物车产品获取 Creem Product ID
        const productId = getCreemProductId(items);

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

        // 🔥 折扣码策略：先不带折扣码创建 checkout，如果 Creem 返回折扣相关错误再重试
        // 这样避免无效折扣码导致整个支付失败
        const shouldTryDiscount = !!useDiscountCode;
        console.log(`🏷️ 折扣码状态: ${shouldTryDiscount ? '有折扣码 ' + useDiscountCode + '（将先不带折扣码尝试）' : '无折扣码'}`);

        // 第一阶段：不带折扣码创建 checkout
        let response, result;
        try {
            response = await fetch(`${creemApiBase}/checkouts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify(creemCheckoutData)
            });
            result = await response.json();
        } catch (fetchError) {
            console.error('❌ Creem API 网络错误:', fetchError.message);
            return res.status(500).json({ error: '支付服务网络错误，请稍后再试' });
        }

        // 🔥 如果第一阶段成功，尝试带折扣码（如果有折扣码的话）
        if (response.ok && shouldTryDiscount) {
            console.log('✅ 不带折扣码创建成功，尝试带折扣码:', useDiscountCode);
            const discountCheckoutData = { ...creemCheckoutData, discount_code: useDiscountCode };
            try {
                const discountResponse = await fetch(`${creemApiBase}/checkouts`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': apiKey
                    },
                    body: JSON.stringify(discountCheckoutData)
                });
                const discountResult = await discountResponse.json();

                if (discountResponse.ok && discountResult.checkout_url) {
                    console.log('✅ 带折扣码创建成功，使用折扣价');
                    console.log('========== Creem API 响应详情（含折扣）==========');
                    console.log(`📥 Status: ${discountResponse.status}`);
                    console.log(`📥 响应 (JSON):`);
                    console.log(JSON.stringify(discountResult, null, 2));
                    console.log('======================================');
                    return res.status(200).json({
                        success: true,
                        checkoutUrl: discountResult.checkout_url,
                        orderId: orderId
                    });
                } else {
                    console.warn('⚠️ 折扣码无效，使用原价:', discountResult.error || discountResult.message);
                }
            } catch (discountFetchError) {
                console.warn('⚠️ 折扣码请求失败，使用原价:', discountFetchError.message);
            }
        }

        // 使用第一阶段（不带折扣码）的结果
        console.log('========== Creem API 响应详情 ==========');
        console.log(`📥 Status: ${response.status}`);
        console.log(`📥 响应 (JSON):`);
        console.log(JSON.stringify(result, null, 2));
        console.log('======================================');

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