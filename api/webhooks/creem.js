/**
 * ============================================
 * Creem Webhook 处理器 (Vercel Functions)
 * 处理 Creem 支付事件通知
 * 八字订单自动保存到 Redis
 * ============================================
 */

import { getRedis, redisSet } from './redis.js';

/**
 * Vercel Function 主处理函数
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const event = req.body;
        console.log(`📨 Creem Webhook received: ${event.type}`);

        switch (event.type) {
            case 'checkout.completed': {
                const checkout = event.data;
                console.log('✅ Checkout completed:', checkout.id);
                console.log('📦 Webhook 原始数据:', JSON.stringify(event.data, null, 2));
                console.log('📋 Metadata 完整内容:', JSON.stringify(checkout.metadata, null, 2));

                const metadata = checkout.metadata || {};
                const orderId = metadata.order_id || checkout.id;

                // 计算金额（Creem 以分为单位）
                const amountInCents = checkout.amount || checkout.total || checkout.price || 0;
                const amount = amountInCents / 100;

                // 判断是否为八字订单
                const isBaziOrder = metadata.product_type === 'bazi_analysis';
                console.log(`🎯 订单类型: ${metadata.product_type} | 是否八字: ${isBaziOrder}`);

                if (isBaziOrder) {
                    // 保存八字订单到 Redis
                    const orderData = {
                        id: checkout.id,
                        orderId: orderId,
                        checkoutId: checkout.id,
                        name: metadata.name || checkout.customer?.name || '',
                        email: metadata.email || checkout.customer?.email || '',
                        birthYear: metadata.birth_year || '',
                        birthMonth: metadata.birth_month || '',
                        birthDay: metadata.birth_day || '',
                        birthHour: metadata.birth_hour || '',
                        gender: metadata.gender || '',
                        birthPlace: metadata.birth_place || '',
                        notes: metadata.notes || '',
                        language: metadata.language || 'zh',
                        amount: amount,
                        currency: checkout.currency || 'USD',
                        status: 'paid',
                        createdAt: checkout.created_at || new Date().toISOString(),
                        paidAt: new Date().toISOString(),
                        mode: checkout.mode || 'live'
                    };

                    console.log('💾 保存八字订单到 Redis:', JSON.stringify(orderData, null, 2));

                    try {
                        const { redisGet, redisSet } = await import('./redis.js');

                        // 用 checkout ID 作为 key，防止重复
                        await redisSet(`bazi_order:${checkout.id}`, orderData);

                        // 同时维护一个订单 ID 列表
                        let existingIds = await redisGet('bazi_order_ids') || [];
                        if (!existingIds.includes(checkout.id)) {
                            existingIds.unshift(checkout.id);
                            await redisSet('bazi_order_ids', existingIds);
                            console.log(`💾 订单列表已更新，共 ${existingIds.length} 笔`);
                        }

                        console.log('✅ 八字订单保存成功!');
                    } catch (redisError) {
                        console.error('❌ Redis 保存失败（非致命）:', redisError.message);
                    }

                    // 发送企业微信通知
                    await sendWechatNotification({
                        ...orderData,
                        baziData: {
                            birthYear: orderData.birthYear,
                            birthMonth: orderData.birthMonth,
                            birthDay: orderData.birthDay,
                            birthHour: orderData.birthHour,
                            gender: orderData.gender
                        }
                    });
                } else {
                    // 非八字订单，也发微信通知
                    await sendWechatNotification({
                        orderId: orderId,
                        amount: amount,
                        currency: checkout.currency || 'USD',
                        customerEmail: metadata.email || checkout.customer?.email || '',
                        customerName: metadata.name || checkout.customer?.name || ''
                    });
                }

                break;
            }

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
        let content = `🎉 **新订单到账！**\n\n` +
            `**订单号：** ${orderData.orderId}\n` +
            `**金额：** $${parseFloat(orderData.amount || 0).toFixed(2)} USD\n` +
            `**客户邮箱：** ${orderData.customerEmail || '未提供'}\n` +
            `**客户姓名：** ${orderData.customerName || '未提供'}\n` +
            `**下单时间：** ${new Date().toLocaleString('zh-CN')}`;

        // 八字订单额外信息
        if (orderData.baziData && orderData.baziData.birthYear) {
            content += `\n\n**生辰八字：**\n` +
                `📅 ${orderData.baziData.birthYear}年${orderData.baziData.birthMonth}月${orderData.baziData.birthDay}日` +
                `${orderData.baziData.birthHour !== '-1' ? ' ' + orderData.baziData.birthHour + '时' : '（未知时辰）'}\n` +
                `👤 ${orderData.baziData.gender === 'male' ? '男' : '女'}`;
        }

        const message = {
            msgtype: 'markdown',
            markdown: { content }
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
