const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // 只允许 POST 请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { amount, currency = 'usd', metadata = {} } = JSON.parse(event.body);

    console.log('Creating Payment Intent:', { amount, currency, metadata });

    // 验证金额
    if (!amount || amount <= 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid amount. Must be greater than 0.'
        })
      };
    }

    // 创建 Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // 转换为美分
      currency: currency.toLowerCase(),
      metadata: {
        ...metadata,
        shop: 'dao-essence',
        timestamp: new Date().toISOString()
      },
      automatic_payment_methods: {
        enabled: true
      },
      description: 'DAO Essence Shop Order'
    });

    console.log('Payment Intent created:', paymentIntent.id);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount
      })
    };

  } catch (error) {
    console.error('Error creating Payment Intent:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
