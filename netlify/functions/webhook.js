/**
 * ============================================
 * Stripe Webhook 处理器
 * 处理两种支付模式的事件：
 * 1. Payment Intent (payment_intent.succeeded)
 * 2. Checkout Session (checkout.session.completed)
 * ============================================
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

exports.handler = async (event, context) => {
    // 只允许 POST 请求
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    const sig = event.headers['stripe-signature'];

    let stripeEvent;
    try {
        stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
    } catch (err) {
        console.error('❌ Webhook signature verification failed:', err.message);
        return {
            statusCode: 400,
            body: `Webhook Error: ${err.message}`
        };
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
                    customerEmail: sessionDetails.customer_details?.email,
                    paymentId: session.payment_intent,
                    paymentType: 'checkout_session',
                    customerName: sessionDetails.customer_details?.name
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

        return {
            statusCode: 200,
            body: JSON.stringify({ received: true })
        };

    } catch (error) {
        console.error('❌ Error processing webhook:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

/**
 * 处理支付成功的逻辑
 * TODO: 根据实际需求保存到数据库
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
    
    // TODO: 在这里添加保存到数据库的逻辑
    // 示例：
    // await saveOrderToDatabase(orderData);
    // await sendConfirmationEmail(orderData);
    // await updateInventory(orderData);
}
