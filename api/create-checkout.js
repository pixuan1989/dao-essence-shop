/**
 * ============================================
 * Creem Checkout 创建 API (Vercel Functions)
 * 处理 Creem 支付会话创建
 * 支持多产品动态选择 Creem Product ID
 * ============================================
 */

import { redisGet, redisSet, redisDel } from '../shared/redis.js';

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
        const { items, discountCode, successUrl } = req.body;

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

        // 提取产品名称用于支付成功页面展示
        const productName = items[0]?.name || 'Digital Service';
        const encodedName = encodeURIComponent(productName);

        const baseUrl = 'https://www.daoessentia.com';
        // 不传 total 参数，避免前端价格和 Creem 价格不一致
        // 支持 almanac 等页面传入自定义 successUrl
        const finalSuccessUrl = successUrl || `${baseUrl}/payment-success.html?order_id=${orderId}&product=${encodedName}`;

        // 准备 Creem API 请求数据（精简，去掉不必要的 metadata）
        const creemCheckoutData = {
            product_id: productId,
            success_url: finalSuccessUrl,
            request_id: orderId
        };

        // 🔥 折扣码策略：并行请求（带折扣码 + 不带折扣码），优先使用折扣价
        const shouldTryDiscount = !!useDiscountCode;
        console.log(`🏷️ 折扣码状态: ${shouldTryDiscount ? '有折扣码 ' + useDiscountCode + '（并行请求）' : '无折扣码'}`);

        // 构建请求列表
        const fetches = [];
        fetches.push(
            fetch(`${creemApiBase}/checkouts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
                body: JSON.stringify(creemCheckoutData)
            }).then(r => r.json()).then(data => ({ data, type: 'normal' })).catch(e => ({ error: e.message, type: 'normal' }))
        );
        if (shouldTryDiscount) {
            const discountData = { ...creemCheckoutData, discount_code: useDiscountCode, request_id: orderId + '_disc' };
            fetches.push(
                fetch(`${creemApiBase}/checkouts`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
                    body: JSON.stringify(discountData)
                }).then(r => r.json()).then(data => ({ data, type: 'discount' })).catch(e => ({ error: e.message, type: 'discount' }))
            );
        }

        const results = await Promise.all(fetches);

        // 优先选折扣结果，其次选正常结果
        let finalResult = null;
        let usedDiscount = false;
        for (const r of results) {
            if (r.error) {
                console.warn(`⚠️ ${r.type === 'discount' ? '折扣码' : '正常'}请求失败:`, r.error);
                continue;
            }
            if (r.data && r.data.checkout_url) {
                finalResult = r.data;
                if (r.type === 'discount') usedDiscount = true;
                break;
            }
        }

        if (!finalResult) {
            console.error('❌ 所有 Creem 请求均失败');
            // 尝试从结果中提取错误信息
            const errResult = results.find(r => r.data && !r.data.checkout_url);
            return res.status(500).json({ error: errResult?.data?.error || errResult?.data?.message || '创建支付会话失败' });
        }

        console.log(`✅ Checkout 创建成功（${usedDiscount ? '折扣价' : '原价'}）: ${finalResult.id}`);

        // 先写入 Redis（确保数据不丢失），再返回响应
        try {
            const intentData = {
                id: orderId, orderId, checkoutId: finalResult.id || '',
                productName, productId, amount: subtotal,
                createdAt: new Date().toISOString(), status: 'pending',
                discount: usedDiscount ? useDiscountCode : null
            };
            await redisSet(`checkout_intent:${orderId}`, intentData);
            let intentIds = await redisGet('checkout_intent_ids') || [];
            intentIds.unshift(orderId);
            if (intentIds.length > 500) intentIds = intentIds.slice(0, 500);
            await redisSet('checkout_intent_ids', intentIds);
            console.log(`📝 付费意向已记录: ${orderId}`);
        } catch (intentErr) {
            console.error('⚠️ 记录付费意向失败（非致命）:', intentErr.message);
        }

        const responseData = {
            success: true,
            checkoutUrl: finalResult.checkout_url,
            orderId: orderId
        };

        return res.status(200).json(responseData);

    } catch (error) {
        console.error('创建 Creem Checkout 错误:', error);
        return res.status(500).json({ error: '创建支付会话失败' });
    }
}