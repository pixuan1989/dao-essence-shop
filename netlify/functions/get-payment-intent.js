const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // 只允许 GET 请求
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const id = event.queryStringParameters.id;

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Payment Intent ID is required' })
      };
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(id);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        status: paymentIntent.status,
        paymentIntent: paymentIntent
      })
    };

  } catch (error) {
    console.error('Error retrieving Payment Intent:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
