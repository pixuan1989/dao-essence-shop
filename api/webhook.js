/**
 * ============================================
 * Stripe Webhook 处理器 (Vercel Functions 版本)
 * 处理两种支付模式的事件：
 * 1. Payment Intent (payment_intent.succeeded)
 * 2. Checkout Session (checkout.session.completed)
 * ============================================
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

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
 * Vercel Function 主处理函数
 */
export default async function handler(req, res) {
    // 只允许 POST 请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const sig = req.headers['stripe-signature'];

    let stripeEvent;
    try {
        stripeEvent = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('❌ Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`📨 Webhook received: ${stripeEvent.type}`);

    try {
        switch (stripeEvent.type) {
            // ========== Payment Intent 模式 ==========
            case 'payment_intent.succeeded':
                const paymentIntent = stripeEvent.data.object;
                console.log('✅ Payment Intent succeeded:', paymentIntent.id);
                
                await handlePaymentSucceeded({
                    orderId: paymentIntent.metadata?.orderId || paymentIntent.id,
                    amount: paymentIntent.amount / 100,
                    currency: paymentIntent.currency,
                    customerEmail: paymentIntent.receipt_email,
                    paymentId: paymentIntent.id,
                    paymentType: 'payment_intent'
                });
                break;

            case 'payment_intent.payment_failed':
                const failedPayment = stripeEvent.data.object;
                console.log('❌ Payment Intent failed:', failedPayment.id);
                console.log('Error:', failedPayment.last_payment_error?.message || 'Unknown error');
                break;

            // ========== Checkout Session 模式 ==========
            case 'checkout.session.completed':
                const session = stripeEvent.data.object;
                console.log('✅ Checkout session completed:', session.id);
                
                // 获取 session 详情中的客户信息
                const sessionDetails = await stripe.checkout.sessions.retrieve(session.id);
                
                await handlePaymentSucceeded({
                    orderId: session.metadata?.orderId || session.id,
                    amount: session.amount_total / 100,
                    currency: session.currency,
                    customerEmail: session.metadata?.customerEmail || sessionDetails.customer_details?.email,
                    paymentId: session.payment_intent,
                    paymentType: 'checkout_session',
                    customerName: session.metadata?.customerName || sessionDetails.customer_details?.name,
                    shippingAddress: session.metadata?.shippingAddress || '',
                    shippingMethod: session.metadata?.shippingMethod || '标准运输',
                    items: session.metadata?.items_summary ? [{ nameCn: session.metadata.items_summary, name: session.metadata.items_summary, quantity: 1, price: session.amount_total / 100 }] : []
                });
                break;

            // ========== 其他事件 ==========
            case 'invoice.paid':
                console.log('📄 Invoice paid:', stripeEvent.data.object.id);
                break;

            case 'invoice.payment_failed':
                console.log('📄 Invoice payment failed:', stripeEvent.data.object.id);
                break;

            default:
                console.log(`ℹ️ Unhandled event type: ${stripeEvent.type}`);
        }

        return res.status(200).json({ received: true });

    } catch (error) {
        console.error('❌ Error processing webhook:', error);
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