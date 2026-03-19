/* ============================================
   Stripe Webhook Handler
   处理支付成功后的业务逻辑
   ============================================ */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// 支付成功处理函数
async function handlePaymentSucceeded(paymentIntent) {
    console.log('========================================');
    console.log('Payment Succeeded');
    console.log('========================================');
    console.log('Payment Intent ID:', paymentIntent.id);
    console.log('Amount:', paymentIntent.amount / 100, paymentIntent.currency);
    console.log('Customer:', paymentIntent.metadata);
    console.log('Status:', paymentIntent.status);
    console.log('========================================');

    // TODO: 在这里添加你的业务逻辑
    // 1. 保存订单到数据库
    // 2. 发送确认邮件
    // 3. 更新库存
    // 4. 触发发货流程

    const orderData = {
        orderId: paymentIntent.metadata.orderId,
        stripePaymentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: 'paid',
        items: parseItems(paymentIntent.metadata.items),
        shipping: paymentIntent.metadata.shipping,
        createdAt: new Date(paymentIntent.created * 1000)
    };

    console.log('Order created:', orderData);

    return orderData;
}

// 支付失败处理函数
async function handlePaymentFailed(paymentIntent) {
    console.log('========================================');
    console.log('Payment Failed');
    console.log('========================================');
    console.log('Payment Intent ID:', paymentIntent.id);
    console.log('Error:', paymentIntent.last_payment_error);
    console.log('========================================');

    // TODO: 处理支付失败
    // 1. 记录失败原因
    // 2. 通知客户
    // 3. 保留购物车内容

    return {
        success: false,
        paymentIntentId: paymentIntent.id,
        error: paymentIntent.last_payment_error?.message || 'Unknown error'
    };
}

// 解析商品信息
function parseItems(itemsString) {
    if (!itemsString) return [];

    try {
        return itemsString.split(',').map(item => {
            const [id, name, quantity] = item.split(':');
            return { id, name, quantity: parseInt(quantity) || 1 };
        });
    } catch (error) {
        console.error('Error parsing items:', error);
        return [];
    }
}

// 导出处理函数
module.exports = {
    handlePaymentSucceeded,
    handlePaymentFailed
};
