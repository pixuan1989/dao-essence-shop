/**
 * ============================================
 * Creem Webhook 处理器 (Vercel Functions)
 * 处理 Creem 支付事件通知
 * ============================================
 */

/**
 * 调用邮件发送 Function（Vercel Functions 调用）
 */
async function sendOrderEmails(orderData) {
    try {
        // Vercel Functions 调用 send-order-email
        const baseUrl = process.env.VERCEL_URL || 'https://your-vercel-app.vercel.app';
        const emailApiUrl = `${baseUrl}/api/send-order-email`;

        console.log('📧 触发邮件发送，URL:', emailApiUrl);

        const response = await fetch(emailApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();
        console.log('📧 邮件发送结果:', result);
        return result;
    } catch (error) {
        // 邮件失败不影响 Webhook 主流程
        console.error('⚠️ 邮件发送失败（非致命错误）:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * 验证 Creem Webhook 签名
 */
function verifyCreemWebhookSignature(req, secret) {
    // Creem Webhook 签名验证逻辑
    // 这里需要根据 Creem 文档实现签名验证
    // 暂时返回 true，生产环境需要实现完整验证
    return true;
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
        // 验证签名
        const signature = req.headers['x-creem-signature'];
        const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
        
        if (!verifyCreemWebhookSignature(req, webhookSecret)) {
            console.error('❌ Webhook signature verification failed');
            return res.status(400).send('Webhook Error: Invalid signature');
        }

        const event = req.body;
        console.log(`📨 Creem Webhook received: ${event.type}`);

        switch (event.type) {
            case 'checkout.completed':
                const checkout = event.data;
                console.log('✅ Checkout completed:', checkout.id);
                
                // 解析订单信息
                const metadata = checkout.metadata || {};
                const orderId = metadata.order_id || checkout.id;
                const customerEmail = metadata.customer_email || checkout.customer?.email;
                const customerName = metadata.customer_name || checkout.customer?.name;
                const shippingAddress = metadata.shipping_address || '';
                const shippingMethod = metadata.shipping_method || '标准运输';
                
                // 计算金额
                const amount = checkout.amount / 100; // 转换为美元
                
                // 解析商品信息
                let items = [];
                if (metadata.items) {
                    try {
                        items = JSON.parse(metadata.items);
                    } catch (e) {
                        console.error('解析商品信息失败:', e);
                    }
                }

                // 处理支付成功
                await handlePaymentSucceeded({
                    orderId: orderId,
                    amount: amount,
                    currency: 'USD',
                    customerEmail: customerEmail,
                    paymentId: checkout.id,
                    paymentType: 'creem_checkout',
                    customerName: customerName,
                    shippingAddress: shippingAddress,
                    shippingMethod: shippingMethod,
                    items: items
                });
                break;

            case 'checkout.failed':
                console.log('❌ Checkout failed:', event.data.id);
                break;

            default:
                console.log(`ℹ️ Unhandled event type: ${event.type}`);
        }

        return res.status(200).json({ received: true });

    } catch (error) {
        console.error('❌ Error processing Creem webhook:', error);
        return res.status(500).json({ error: error.message });
    }
}

/**
 * 处理支付成功的逻辑
 * 支付完成后发送订单确认邮件给买家和商家
 */
async function handlePaymentSucceeded(orderData) {
    console.log('========== 订单信息 ==========');
    console.log('订单号:', orderData.orderId);
    console.log('金额:', orderData.amount, orderData.currency?.toUpperCase());
    console.log('客户邮箱:', orderData.customerEmail);
    console.log('支付ID:', orderData.paymentId);
    console.log('支付类型:', orderData.paymentType);
    console.log('客户姓名:', orderData.customerName);
    console.log('时间:', new Date().toISOString());
    console.log('================================');

    // 发送订单确认邮件（买家 + 商家）
    await sendOrderEmails(orderData);

    console.log('✅ 订单处理完成');
}