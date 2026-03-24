/* ============================================
   Webhook Test Script
   测试 Stripe Webhook 处理
   DAO Essence Shop
   ============================================ */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// 测试用的支付数据
const testPaymentData = {
    amount: 99.99,
    currency: 'usd',
    metadata: {
        orderId: `test_order_${Date.now()}`,
        items: 'prod001:DAO Essence:1:49.99|prod002:Incense Set:2:25.00',
        shipping: '123 Main St|San Francisco|CA|94102|US',
        customerName: 'Test Customer',
        customerPhone: '+1234567890'
    },
    receipt_email: 'test@example.com'
};

async function testPaymentFlow() {
    console.log('========================================');
    console.log('🧪 Stripe Payment Flow Test');
    console.log('========================================');

    try {
        // 1. Create Payment Intent
        console.log('\n1️⃣ Creating Payment Intent...');
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(testPaymentData.amount * 100),
            currency: testPaymentData.currency,
            metadata: testPaymentData.metadata,
            receipt_email: testPaymentData.receipt_email,
            automatic_payment_methods: {
                enabled: true
            },
            description: 'Test Payment - DAO Essence Shop'
        });

        console.log('✅ Payment Intent created:');
        console.log('   ID:', paymentIntent.id);
        console.log('   Amount:', paymentIntent.amount / 100, paymentIntent.currency);
        console.log('   Status:', paymentIntent.status);
        console.log('   Client Secret:', paymentIntent.client_secret?.substring(0, 20) + '...');

        // 2. Retrieve Payment Intent (simulate webhook)
        console.log('\n2️⃣ Retrieving Payment Intent...');
        const retrievedPayment = await stripe.paymentIntents.retrieve(paymentIntent.id);
        console.log('✅ Payment Intent retrieved:');
        console.log('   Status:', retrievedPayment.status);

        // 3. Test webhook handler directly
        console.log('\n3️⃣ Testing webhook handler...');
        const { handlePaymentSucceeded } = require('./webhook-handler.js');

        // 模拟支付成功事件
        const simulatedPayment = {
            ...retrievedPayment,
            status: 'succeeded',
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            last_payment_error: null
        };

        const orderData = await handlePaymentSucceeded(simulatedPayment);
        console.log('✅ Webhook handler processed:');
        console.log('   Order ID:', orderData.orderId);
        console.log('   Order Status:', orderData.status);

        // 4. Test order retrieval
        console.log('\n4️⃣ Testing order retrieval...');
        const { getOrderStatus } = require('./webhook-handler.js');
        const savedOrder = await getOrderStatus(orderData.orderId);

        if (savedOrder) {
            console.log('✅ Order retrieved successfully:');
            console.log('   Order ID:', savedOrder.orderId);
            console.log('   Amount:', savedOrder.amount, savedOrder.currency);
            console.log('   Items:', savedOrder.items.length);
        } else {
            console.log('❌ Order not found');
        }

        // 5. Test order history
        console.log('\n5️⃣ Testing order history...');
        const { getOrderHistory } = require('./webhook-handler.js');
        const orderHistory = await getOrderHistory();
        console.log('✅ Order history retrieved:');
        console.log('   Total Orders:', orderHistory.length);
        console.log('   Recent Orders:', orderHistory.slice(0, 3).map(o => o.orderId));

        console.log('\n========================================');
        console.log('✅ All tests passed!');
        console.log('========================================');

        return paymentIntent;

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error);
        return null;
    }
}

// Test with manual payment intent ID
async function testExistingPaymentIntent(paymentIntentId) {
    console.log('========================================');
    console.log('🧪 Testing Existing Payment Intent');
    console.log('========================================');

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        console.log('Payment Intent found:');
        console.log('   ID:', paymentIntent.id);
        console.log('   Status:', paymentIntent.status);
        console.log('   Amount:', paymentIntent.amount / 100, paymentIntent.currency);
        console.log('   Metadata:', JSON.stringify(paymentIntent.metadata, null, 2));

        if (paymentIntent.status === 'succeeded') {
            console.log('\n✅ Payment succeeded. Testing webhook handler...');
            const { handlePaymentSucceeded } = require('./webhook-handler.js');
            await handlePaymentSucceeded(paymentIntent);
        } else if (paymentIntent.status === 'requires_payment_method') {
            console.log('\n⚠️ Payment requires payment method. Waiting...');
            console.log('   Use the client secret to complete payment on frontend.');
            console.log('   Client Secret:', paymentIntent.client_secret);
        } else {
            console.log('\nℹ️ Payment status:', paymentIntent.status);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Get order history
async function listOrders() {
    console.log('========================================');
    console.log('📋 Order History');
    console.log('========================================');

    try {
        const { getOrderHistory } = require('./webhook-handler.js');
        const orders = await getOrderHistory();

        console.log(`\n📦 Total Orders: ${orders.length}\n`);

        orders.forEach((order, index) => {
            console.log(`${index + 1}. ${order.orderId}`);
            console.log('   Amount:', order.amount, order.currency);
            console.log('   Status:', order.status);
            console.log('   Created:', new Date(order.createdAt).toLocaleString());
            console.log('   Items:', order.items.length);
            console.log('');
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run tests based on command line arguments
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    console.log('🚀 Webhook Test Tool\n');

    switch (command) {
        case 'test':
            await testPaymentFlow();
            break;
        case 'check':
            if (args[1]) {
                await testExistingPaymentIntent(args[1]);
            } else {
                console.log('❌ Please provide a Payment Intent ID:');
                console.log('   node test-webhook.js check <payment_intent_id>');
            }
            break;
        case 'orders':
            await listOrders();
            break;
        case 'help':
        default:
            console.log('Usage:');
            console.log('  node test-webhook.js test       - Run full payment flow test');
            console.log('  node test-webhook.js check <id> - Check existing Payment Intent');
            console.log('  node test-webhook.js orders     - List all orders');
            console.log('  node test-webhook.js help       - Show this help');
            break;
    }
}

main();
