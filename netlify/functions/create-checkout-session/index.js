const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// 测试模式配置
const TEST_MODE = process.env.TEST_MODE === 'true';

exports.handler = async (event, context) => {
    // 只接受 POST 请求
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // ========== 测试模式 ==========
    if (TEST_MODE) {
        console.log('🧪 测试模式已开启 - 模拟支付成功');
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                success: true,
                testMode: true,
                // 直接返回成功，跳过 Stripe Checkout
                message: '测试模式：支付成功',
                sessionId: 'test_session_' + Date.now()
            })
        };
    }
    // ========== 测试模式结束 ==========

    try {
        const { items, shipping, customerName, customerEmail, shippingAddress, shippingMethod } = JSON.parse(event.body);

        // 创建 Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: customerEmail || undefined,  // 预填邮箱
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
                        display_name: shippingMethod || '标准运输',
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
                customerName: customerName || '',
                customerEmail: customerEmail || '',
                shippingAddress: shippingAddress || '',
                shippingMethod: shippingMethod || '标准运输',
                total_items: items.reduce((sum, item) => sum + item.quantity, 0),
                // 存储商品信息（简化版）
                items_summary: items.map(i => `${i.nameCn || i.name}×${i.quantity}`).join(', ')
            }
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                success: true,
                sessionId: session.id 
            })
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
