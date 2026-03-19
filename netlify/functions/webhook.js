const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Netlify Functions 使用环境变量中的 webhook secret
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
    console.error('Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`
    };
  }

  console.log(`📨 Webhook received: ${stripeEvent.type}`);

  try {
    // 处理不同类型的 webhook 事件
    switch (stripeEvent.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = stripeEvent.data.object;
        console.log('✅ Payment succeeded:', paymentIntent.id);

        // TODO: 保存到 Netlify Database 或外部数据库
        // 当前只记录日志，稍后集成数据库
        console.log('Order data:', {
          orderId: paymentIntent.metadata.orderId || paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          customerEmail: paymentIntent.receipt_email,
          createdAt: new Date(paymentIntent.created * 1000).toISOString()
        });
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = stripeEvent.data.object;
        console.log('❌ Payment failed:', failedPayment.id);
        console.log('Error:', failedPayment.last_payment_error?.message || 'Unknown error');
        break;

      case 'payment_intent.created':
        console.log('📝 Payment Intent created:', stripeEvent.data.object.id);
        break;

      case 'payment_intent.canceled':
        console.log('⚠️ Payment Intent canceled:', stripeEvent.data.object.id);
        break;

      case 'checkout.session.completed':
        console.log('🛒 Checkout session completed:', stripeEvent.data.object.id);
        break;

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
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
