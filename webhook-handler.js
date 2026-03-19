/* ============================================
   Stripe Webhook Handler
   处理支付成功后的业务逻辑
   DAO Essence Shop
   ============================================ */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs').promises;
const path = require('path');

// 订单数据存储路径
const ORDERS_DIR = path.join(__dirname, 'orders');

// 确保订单目录存在
async function ensureOrdersDir() {
    try {
        await fs.access(ORDERS_DIR);
    } catch {
        await fs.mkdir(ORDERS_DIR, { recursive: true });
        console.log('✅ Orders directory created');
    }
}

// 保存订单到本地文件
async function saveOrderToFile(orderData) {
    await ensureOrdersDir();

    const orderId = orderData.orderId || orderData.stripePaymentId;
    const orderFile = path.join(ORDERS_DIR, `${orderId}.json`);

    await fs.writeFile(orderFile, JSON.stringify(orderData, null, 2));
    console.log('💾 Order saved to file:', orderFile);

    return orderFile;
}

// 读取订单历史
async function getOrderHistory() {
    await ensureOrdersDir();

    try {
        const files = await fs.readdir(ORDERS_DIR);
        const orders = [];

        for (const file of files) {
            if (file.endsWith('.json')) {
                const content = await fs.readFile(path.join(ORDERS_DIR, file), 'utf-8');
                orders.push(JSON.parse(content));
            }
        }

        // 按时间倒序排列
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return orders;
    } catch (error) {
        console.error('Error reading order history:', error);
        return [];
    }
}

// 支付成功处理函数
async function handlePaymentSucceeded(paymentIntent) {
    console.log('========================================');
    console.log('✅ PAYMENT SUCCEEDED');
    console.log('========================================');
    console.log('Payment Intent ID:', paymentIntent.id);
    console.log('Amount:', paymentIntent.amount / 100, paymentIntent.currency.toUpperCase());
    console.log('Customer Email:', paymentIntent.receipt_email || 'N/A');
    console.log('Metadata:', JSON.stringify(paymentIntent.metadata, null, 2));
    console.log('Status:', paymentIntent.status);
    console.log('========================================');

    // 解析订单数据
    const orderData = {
        orderId: paymentIntent.metadata.orderId || `order_${Date.now()}`,
        stripePaymentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        status: 'paid',
        paymentStatus: paymentIntent.status,
        items: parseItems(paymentIntent.metadata.items),
        shipping: parseShipping(paymentIntent.metadata.shipping),
        customer: {
            email: paymentIntent.receipt_email,
            name: paymentIntent.metadata.customerName,
            phone: paymentIntent.metadata.customerPhone
        },
        createdAt: new Date(paymentIntent.created * 1000).toISOString(),
        updatedAt: new Date().toISOString()
    };

    console.log('📦 Order Data:', JSON.stringify(orderData, null, 2));

    // 1. 保存订单到本地文件
    await saveOrderToFile(orderData);

    // 2. TODO: 保存订单到数据库（如果有数据库）
    // await saveOrderToDatabase(orderData);

    // 3. TODO: 发送确认邮件
    // await sendConfirmationEmail(orderData);

    // 4. TODO: 更新库存
    // await updateInventory(orderData.items);

    // 5. TODO: 触发发货流程
    // await initiateShipping(orderData);

    console.log('✅ Order processed successfully');

    return orderData;
}

// 支付失败处理函数
async function handlePaymentFailed(paymentIntent) {
    console.log('========================================');
    console.log('❌ PAYMENT FAILED');
    console.log('========================================');
    console.log('Payment Intent ID:', paymentIntent.id);
    console.log('Error:', JSON.stringify(paymentIntent.last_payment_error, null, 2));
    console.log('Amount:', paymentIntent.amount / 100, paymentIntent.currency);
    console.log('========================================');

    // 记录失败订单
    const failedOrder = {
        orderId: paymentIntent.metadata.orderId || `failed_${Date.now()}`,
        stripePaymentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        status: 'failed',
        paymentStatus: paymentIntent.status,
        error: paymentIntent.last_payment_error?.message || 'Unknown error',
        errorCode: paymentIntent.last_payment_error?.code || 'unknown',
        items: parseItems(paymentIntent.metadata.items),
        customer: {
            email: paymentIntent.receipt_email,
            name: paymentIntent.metadata.customerName
        },
        createdAt: new Date(paymentIntent.created * 1000).toISOString(),
        failedAt: new Date().toISOString()
    };

    // 保存失败记录
    await saveOrderToFile(failedOrder);

    // TODO: 1. 记录失败原因到数据库
    // TODO: 2. 通知客户重试
    // TODO: 3. 保留购物车内容
    // TODO: 4. 发送失败通知邮件

    console.log('❌ Payment failure recorded');

    return failedOrder;
}

// 解析商品信息
function parseItems(itemsString) {
    if (!itemsString) return [];

    try {
        return itemsString.split('|').map(item => {
            const [id, name, quantity, price] = item.split(':');
            return {
                id: id || '',
                name: name || '',
                quantity: parseInt(quantity) || 1,
                price: price ? parseFloat(price) : 0
            };
        }).filter(item => item.id);
    } catch (error) {
        console.error('Error parsing items:', error);
        return [];
    }
}

// 解析配送信息
function parseShipping(shippingString) {
    if (!shippingString) return {};

    try {
        const parts = shippingString.split('|');
        return {
            address: parts[0] || '',
            city: parts[1] || '',
            state: parts[2] || '',
            zipCode: parts[3] || '',
            country: parts[4] || 'US'
        };
    } catch (error) {
        console.error('Error parsing shipping:', error);
        return {};
    }
}

// 获取订单状态
async function getOrderStatus(orderId) {
    try {
        const orderFile = path.join(ORDERS_DIR, `${orderId}.json`);
        const content = await fs.readFile(orderFile, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error('Error getting order status:', error);
        return null;
    }
}

// 导出处理函数和工具函数
module.exports = {
    handlePaymentSucceeded,
    handlePaymentFailed,
    getOrderHistory,
    getOrderStatus,
    saveOrderToFile,
    parseItems,
    parseShipping
};
