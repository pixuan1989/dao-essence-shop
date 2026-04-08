/**
 * ============================================
 * Creem Webhook 处理器 (Vercel Functions)
 * 处理 Creem 支付事件通知
 * ============================================
 */

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
 * 验证 Creem Webhook 签名
 */
function verifyCreemWebhookSignature(req, secret) {
    // Creem Webhook 签名验证逻辑
    // 这里需要根据 Creem 文档实现签名验证
    // 暂时返回 true，生产环境需要实现完整验证
    return true;
}

/**
 * Vercel Function 主处理函数
 */
export default async function handler(req, res) {
    // 只允许 POST 请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 验证签名
        const signature = req.headers['x-creem-signature'];
        const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
        
        if (!verifyCreemWebhookSignature(req, webhookSecret)) {
            console.error('❌ Webhook signature verification failed');
            return res.status(400).send('Webhook Error: Invalid signature');
        }

        const event = req.body;
        console.log(`📨 Creem Webhook received: ${event.type}`);

        switch (event.type) {
            case 'checkout.completed':
                const checkout = event.data;
                console.log('✅ Checkout completed:', checkout.id);
                console.log('📦 Webhook 原始数据:', JSON.stringify(event.data, null, 2));
                console.log('📋 Metadata 完整内容:', JSON.stringify(checkout.metadata, null, 2));

                // 解析订单信息
                const metadata = checkout.metadata || {};
                const orderId = metadata.order_id || checkout.id;
                const customerEmail = metadata.customer_email || checkout.customer?.email;
                const customerName = metadata.customer_name || checkout.customer?.name;

                // 【核心】提取八字数据
                const baziData = {
                    birthYear: metadata.birth_year || null,
                    birthMonth: metadata.birth_month || null,
                    birthDay: metadata.birth_day || null,
                    birthHour: metadata.birth_hour || null,
                    gender: metadata.gender || null,
                    language: metadata.language || 'zh',
                    productType: metadata.product_type || null
                };

                console.log('🎯 八字数据提取结果:', baziData);
                console.log('   年:', baziData.birthYear, '月:', baziData.birthMonth,
                    '日:', baziData.birthDay, '时:', baziData.birthHour,
                    '性:', baziData.gender);
                const shippingAddress = metadata.shipping_address || '';
                const shippingMethod = metadata.shipping_method || '标准运输';

                // 解析自定义字段（Creem Custom Fields）
                const fullName = metadata.full_name || metadata['Full Name'] || '';
                const phoneNumber = metadata.phone_number || metadata['Phone Number'] || '';
                const postalCode = metadata.postal_code || metadata['Postal Code'] || '';

                // 从metadata获取金额（Creem不支持动态金额，价格在产品创建时固定）
                const amount = metadata.total || 0;

                // 解析商品信息
                let items = [];
                if (metadata.items) {
                    try {
                        items = JSON.parse(metadata.items);
                    } catch (e) {
                        console.error('解析商品信息失败:', e);
                    }
                }

                // 处理支付成功
                await handlePaymentSucceeded({
                    orderId: orderId,
                    amount: amount,
                    currency: 'USD',
                    customerEmail: customerEmail,
                    paymentId: checkout.id,
                    paymentType: 'creem_checkout',
                    customerName: customerName,
                    shippingAddress: shippingAddress,
                    shippingMethod: shippingMethod,
                    items: items,
                    // 自定义字段
                    fullName: fullName,
                    phoneNumber: phoneNumber,
                    postalCode: postalCode,
                    // 八字数据（从 bazi checkout 传入）
                    baziData: baziData
                });
                break;

            case 'checkout.failed':
                console.log('❌ Checkout failed:', event.data.id);
                break;

            default:
                console.log(`ℹ️ Unhandled event type: ${event.type}`);
        }

        return res.status(200).json({ received: true });

    } catch (error) {
        console.error('❌ Error processing Creem webhook:', error);
        return res.status(500).json({ error: error.message });
    }
}

/**
 * 发送企业微信机器人通知
 */
async function sendWechatNotification(orderData) {
    const webhookUrl = process.env.WECHAT_WEBHOOK_URL;
    
    if (!webhookUrl) {
        console.log('⚠️ 未配置 WECHAT_WEBHOOK_URL，跳过微信通知');
        return;
    }

    try {
        const itemsText = orderData.items?.map(item => 
            `• ${item.nameCn || item.name} x${item.quantity} ($${item.price})`
        ).join('\n') || '未知商品';

        const message = {
            msgtype: 'markdown',
            markdown: {
                content: `🎉 **新订单到账！**\n\n` +
                    `**订单号：** ${orderData.orderId}\n` +
                    `**金额：** $${parseFloat(orderData.amount || 0).toFixed(2)} USD\n` +
                    `**客户邮箱：** ${orderData.customerEmail || '未提供'}\n` +
                    `**客户姓名：** ${orderData.customerName || '未提供'}\n` +
                    `**下单时间：** ${new Date().toLocaleString('zh-CN')}\n\n` +
                    `**购买商品：**\n${itemsText}\n\n` +
                    `---\n` +
                    `💡 客户将收到 Creem 的下载邮件，无需手动处理`
            }
        };

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        });

        if (response.ok) {
            console.log('✅ 企业微信通知已发送');
        } else {
            console.error('⚠️ 微信通知发送失败:', await response.text());
        }
    } catch (error) {
        console.error('⚠️ 微信通知发送失败:', error.message);
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

    // 八字分析订单专属信息
    if (orderData.baziData && orderData.baziData.birthYear) {
        console.log('-------- 八字信息 --------');
        console.log('出生年:', orderData.baziData.birthYear);
        console.log('出生月:', orderData.baziData.birthMonth);
        console.log('出生日:', orderData.baziData.birthDay);
        console.log('出生时:', orderData.baziData.birthHour);
        console.log('性别:', orderData.baziData.gender);
        console.log('语言:', orderData.baziData.language);
        console.log('--------------------------');
    }

    console.log('================================');

    // 发送企业微信通知
    await sendWechatNotification(orderData);
}