const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
    // 只接受 POST 请求
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { items, shipping } = JSON.parse(event.body);

        // 创建 Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: items.map(item => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                        description: item.nameCn,
                        images: [item.image]
                    },
                    unit_amount: Math.round(item.price * 100), // Stripe 使用分为单位
                },
                quantity: item.quantity
            })),
            mode: 'payment',
            success_url: `${process.env.URL || 'https://amazing-quokka-7e84ea.netlify.app'}/order-confirm.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.URL || 'https://amazing-quokka-7e84ea.netlify.app'}/checkout.html`,
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: Math.round(shipping * 100),
                            currency: 'usd',
                        },
                        display_name: '标准运输',
                        delivery_estimate: {
                            minimum: {
                                unit: 'business_day',
                                value: 15,
                            },
                            maximum: {
                                unit: 'business_day',
                                value: 25,
                            },
                        }
                    }
                }
            ],
            metadata: {
                total_items: items.reduce((sum, item) => sum + item.quantity, 0)
            }
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: session.id })
        };

    } catch (error) {
        console.error('Error creating checkout session:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: error.message })
        };
    }
};
