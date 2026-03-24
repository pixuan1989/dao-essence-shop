/**
 * ============================================
 * Creem Checkout 创建 API (Vercel Functions)
 * 处理 Creem 支付会话创建
 * ============================================
 */

/**
 * Vercel Function 主处理函数
 */
export default async function handler(req, res) {
    // 只允许 POST 请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { items, shipping, customerName, customerEmail, customerPhone, shippingAddress, shippingMethod, discountCode } = req.body;

        // 验证必要参数
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Invalid items' });
        }

        if (!customerEmail) {
            return res.status(400).json({ error: 'Customer email is required' });
        }

        // 检查环境变量
        const apiKey = process.env.CREEM_API_KEY?.trim();
        const productId = process.env.CREEM_PRODUCT_ID?.trim();
        const creemDiscountCode = process.env.CREEM_DISCOUNT_CODE?.trim();

        console.log('环境变量检查:', {
            CREEM_API_KEY: apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING',
            CREEM_PRODUCT_ID: productId,
            CREEM_DISCOUNT_CODE: creemDiscountCode,
            apiKeyLength: apiKey?.length,
            productIdLength: productId?.length
        });

        if (!apiKey || !productId) {
            console.error('环境变量缺失:', { CREEM_API_KEY: !!process.env.CREEM_API_KEY, CREEM_PRODUCT_ID: !!process.env.CREEM_PRODUCT_ID });
            return res.status(500).json({ error: '支付系统配置错误' });
        }

        // 计算总价（用于记录和邮件通知）
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal + (shipping || 0);

        // 判断是否使用折扣码
        // 优先使用请求中的折扣码，如果没有则检查环境变量，最后检查商品是否有折扣标记
        const useDiscountCode = discountCode || creemDiscountCode || (items.some(item => item.hasDiscount) ? 'XJCX520' : null);

        // 生成订单号
        const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

        // 准备 Creem API 请求数据
        const creemCheckoutData = {
            product_id: productId
        };

        // 如果有折扣码，添加到请求中
        if (useDiscountCode) {
            creemCheckoutData.discount_code = useDiscountCode;
        }

        console.log('Creem API 请求数据:', {
            url: 'https://api.creem.io/v1/checkouts',
            product_id: productId,
            discount_code: useDiscountCode
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

        // 保存订单信息到本地文件（用于记录）
        const orderData = {
            orderId: orderId,
            customerName: customerName || '',
            customerEmail: customerEmail || '',
            customerPhone: customerPhone || '',
            shippingAddress: shippingAddress || '',
            shippingMethod: shippingMethod || '',
            items: items,
            subtotal: subtotal,
            shipping: shipping || 0,
            total: total,
            discountCode: useDiscountCode || '',
            status: 'pending_payment',
            createdAt: new Date().toISOString(),
            creemCheckoutUrl: result.checkout_url
        };

        // 尝试发送订单通知邮件（异步，不阻塞响应）
        try {
            await fetch(`${req.headers.origin || 'https://' + req.headers.host}/api/send-order-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...orderData,
                    fullName: customerName,
                    phoneNumber: customerPhone
                })
            });
            console.log('📧 订单通知邮件已发送');
        } catch (emailError) {
            console.error('⚠️ 发送订单邮件失败:', emailError);
            // 邮件发送失败不影响主流程
        }

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