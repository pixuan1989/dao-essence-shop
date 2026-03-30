/**
 * ============================================
 * Creem Checkout 创建 API (Vercel Functions)
 * 处理 Creem 支付会话创建
 * 支持多产品动态选择 Creem Product ID
 * ============================================
 */

/**
 * 产品 ID 到 Creem Product ID 的映射
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
    // 待配置的产品（请在 Creem 后台创建后填入）
    'prod_xxx_taisui': 'prod_xxx_taisui',
    'prod_xxx_obsidian': 'prod_xxx_obsidian'
};

/**
 * 根据购物车 items 获取对应的 Creem Product ID
 * 规则：单产品订单直接用对应 ID，多产品订单使用第一个产品的 ID
 * @param {Array} items - 购物车商品列表
 * @returns {string|null} Creem Product ID
 */
function getCreemProductId(items) {
    if (!items || items.length === 0) return null;
    
    // 取第一个产品的 ID（目前 Creem 不支持购物车多产品，每个订单一个产品）
    const firstItem = items[0];
    const localProductId = firstItem.id;
    
    const creemId = CREEM_PRODUCT_MAP[localProductId];
    
        if (!creemId || creemId.startsWith('prod_xxx_')) {
            console.warn(`⚠️ 产品 "${localProductId}" 未配置 Creem Product ID，请检查 CREEM_PRODUCT_MAP`);
            // 返回原始 ID，让 Creem API 自己报错（更清晰的错误信息）
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

    try {
        const { items, discountCode } = req.body;

        // 验证必要参数
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Invalid items' });
        }

        // 检查环境变量
        const apiKey = process.env.CREEM_API_KEY?.trim();
        const creemDiscountCode = process.env.CREEM_DISCOUNT_CODE?.trim();

        console.log('环境变量检查:', {
            CREEM_API_KEY: apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING',
            CREEM_DISCOUNT_CODE: creemDiscountCode,
            apiKeyLength: apiKey?.length
        });

        if (!apiKey) {
            console.error('环境变量缺失: CREEM_API_KEY');
            return res.status(500).json({ error: '支付系统配置错误：缺少 API Key' });
        }

        // 根据购物车产品动态获取 Creem Product ID
        const productId = getCreemProductId(items);
        
        if (!productId) {
            return res.status(400).json({ 
                error: '该产品尚未配置支付信息，请联系客服',
                product: items[0]?.name || items[0]?.id
            });
        }

        // 计算总价
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // 判断是否使用折扣码
        // 优先使用请求中的折扣码，如果没有则检查环境变量，最后检查商品是否有折扣标记
        const useDiscountCode = discountCode || creemDiscountCode || (items.some(item => item.hasDiscount) ? 'XJCX520' : null);

        // 生成订单号
        const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

        // 构建支付成功后的跳转URL（带订单信息）
        const baseUrl = process.env.VERCEL_URL 
            ? `https://${process.env.VERCEL_URL}` 
            : (req.headers.origin || 'https://daoessentia.com');
        const successUrl = `${baseUrl}/payment-success.html?order_id=${orderId}&total=${subtotal.toFixed(2)}`;

        // 准备 Creem API 请求数据
        const creemCheckoutData = {
            product_id: productId,
            success_url: successUrl,
            request_id: orderId,  // 用于跟踪订单
            metadata: {
                order_items: JSON.stringify(items.map(i => ({ 
                    id: i.id, 
                    name: i.name, 
                    quantity: i.quantity,
                    price: i.price
                }))),
                item_count: items.length.toString()
            }
        };

        // 如果有折扣码，添加到请求中
        if (useDiscountCode) {
            creemCheckoutData.discount_code = useDiscountCode;
        }

        console.log('Creem API 请求数据:', {
            url: 'https://api.creem.io/v1/checkouts',
            product_id: productId,
            discount_code: useDiscountCode,
            items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity }))
        });

        // 调用 Creem API 创建 checkout（生产环境）
        const creemApiUrl = 'https://api.creem.io/v1/checkouts';
        const response = await fetch(creemApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify(creemCheckoutData)
        });

        const result = await response.json();

        console.log('Creem API 响应:', {
            status: response.status,
            statusText: response.statusText,
            result: result,
            headers: {
                'content-type': response.headers.get('content-type')
            }
        });

        if (!response.ok) {
            console.error('Creem API 错误:', result);
            return res.status(500).json({ error: result.error || result.message || '创建支付会话失败' });
        }

        // 验证响应数据
        if (!result.checkout_url) {
            console.error('Creem API 响应缺少 checkout_url:', result);
            return res.status(500).json({ error: '支付系统响应错误' });
        }

        // 记录订单创建日志
        console.log('📦 订单创建:', {
            orderId: orderId,
            items: items.map(i => i.name),
            total: subtotal,
            discountCode: useDiscountCode || 'none'
        });

        // 返回 checkout URL
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