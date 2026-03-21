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
        const { items, shipping, customerName, customerEmail, shippingAddress, shippingMethod } = req.body;

        // 验证必要参数
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Invalid items' });
        }

        if (!customerEmail) {
            return res.status(400).json({ error: 'Customer email is required' });
        }

        // 检查环境变量
        if (!process.env.CREEM_API_KEY || !process.env.CREEM_PRODUCT_ID) {
            console.error('环境变量缺失:', { CREEM_API_KEY: !!process.env.CREEM_API_KEY, CREEM_PRODUCT_ID: !!process.env.CREEM_PRODUCT_ID });
            return res.status(500).json({ error: '支付系统配置错误' });
        }

        // 计算总价
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal + (shipping || 0);

        // 生成订单号
        const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

        // 准备 Creem API 请求数据
        const creemCheckoutData = {
            product_id: process.env.CREEM_PRODUCT_ID,
            amount: Math.round(total * 100), // 转换为分并四舍五入
            currency: 'USD',
            metadata: {
                order_id: orderId,
                customer_name: customerName,
                customer_email: customerEmail,
                shipping_address: shippingAddress,
                shipping_method: shippingMethod,
                items: JSON.stringify(items),
                subtotal: subtotal,
                shipping: shipping
            },
            success_url: `${process.env.VERCEL_URL || 'http://localhost:3000'}/order-confirm.html?order_id=${orderId}`,
            cancel_url: `${process.env.VERCEL_URL || 'http://localhost:3000'}/checkout.html?cancel=true`
        };

        console.log('Creem API 请求数据:', {
            product_id: process.env.CREEM_PRODUCT_ID,
            amount: creemCheckoutData.amount,
            currency: creemCheckoutData.currency,
            success_url: creemCheckoutData.success_url,
            cancel_url: creemCheckoutData.cancel_url
        });

        // 调用 Creem API 创建 checkout
        const creemApiUrl = 'https://api.creem.io/v1/checkouts';
        const response = await fetch(creemApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.CREEM_API_KEY}`
            },
            body: JSON.stringify(creemCheckoutData)
        });

        const result = await response.json();

        console.log('Creem API 响应:', { status: response.status, result: result });

        if (!response.ok) {
            console.error('Creem API 错误:', result);
            return res.status(500).json({ error: result.error || result.message || '创建支付会话失败' });
        }

        // 验证响应数据
        if (!result.checkout_url) {
            console.error('Creem API 响应缺少 checkout_url:', result);
            return res.status(500).json({ error: '支付系统响应错误' });
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