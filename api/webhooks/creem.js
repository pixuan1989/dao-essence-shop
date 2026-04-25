/**
 * ============================================
 * Creem Webhook 处理器 (Vercel Functions)
 * 处理 Creem 支付事件通知
 * 八字订单自动保存到 Redis
 * ============================================
 * 
 * Creem Webhook 数据结构：
 * {
 *   "id": "evt_xxx",
 *   "eventType": "checkout.completed",
 *   "created_at": 1728734325927,
 *   "object": {
 *     "id": "ch_xxx",
 *     "order": { "id": "ord_xxx", "amount": 1000, ... },
 *     "customer": { "id": "cust_xxx", "email": "...", "name": "..." },
 *     "product": { "id": "prod_xxx", "name": "..." },
 *     "metadata": { ... },
 *     "custom_fields": [ ... ],
 *     "status": "completed",
 *     "mode": "local"
 *   }
 * }
 */

import { getRedis, redisGet, redisSet, redisDel } from '../../shared/redis.js';

// 黄历解锁产品 ID
const ALMANAC_PRODUCT_ID = 'prod_3fJInBNekM9UVJwtClgUtx';

/**
 * Vercel Function 主处理函数
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const event = req.body;
        const eventType = event.eventType || event.type; // 兼容两种格式
        console.log(`📨 Creem Webhook received: ${eventType}`);
        console.log('📦 Raw event keys:', JSON.stringify(Object.keys(event)));

        switch (eventType) {
            case 'checkout.completed': {
                // Creem 的数据在 object 字段里
                const checkout = event.object || event.data;
                console.log('✅ Checkout completed:', checkout?.id);
                console.log('📦 Checkout data:', JSON.stringify(checkout, null, 2));

                if (!checkout) {
                    console.error('❌ No checkout data in webhook');
                    break;
                }

                const order = checkout.order || {};
                const customer = checkout.customer || {};
                const product = checkout.product || {};
                const metadata = checkout.metadata || {};

                console.log('📋 Metadata:', JSON.stringify(metadata));
                console.log('📋 Custom fields:', JSON.stringify(checkout.custom_fields));
                console.log('💰 Order amount:', order.amount, order.currency);

                const orderId = metadata.order_id || order.id || checkout.id;

                // 支付完成 → 清除对应的付费意向记录
                try {
                    await redisDel(`checkout_intent:${orderId}`);
                    let intentIds = await redisGet('checkout_intent_ids') || [];
                    intentIds = intentIds.filter(id => id !== orderId);
                    await redisSet('checkout_intent_ids', intentIds);
                    console.log(`🗑️ 已清除付费意向: ${orderId}`);
                } catch (intentErr) {
                    console.error('⚠️ 清除付费意向失败（非致命）:', intentErr.message);
                }

                // 计算金额（Creem 以分为单位）
                const amountInCents = order.amount || checkout.amount || 0;
                const amount = amountInCents / 100;

                // metadata 和 custom_fields 都检查
                const allData = { ...metadata };
                if (checkout.custom_fields && Array.isArray(checkout.custom_fields)) {
                    checkout.custom_fields.forEach(field => {
                        if (field.name && field.value) {
                            allData[field.name] = field.value;
                        }
                    });
                }

                // 判断是否为八字订单
                const isBaziOrder = allData.product_type === 'bazi_analysis' ||
                                    product.name?.toLowerCase().includes('bazi') ||
                                    product.name?.includes('八字') ||
                                    product.name?.toLowerCase().includes('destiny');
                console.log(`🎯 订单类型: ${allData.product_type} | 产品名: ${product.name} | 是否八字: ${isBaziOrder}`);

                if (isBaziOrder) {
                    // 保存八字订单到 Redis
                    const orderData = {
                        id: checkout.id,
                        orderId: orderId,
                        checkoutId: checkout.id,
                        name: allData.name || customer.name || '',
                        email: allData.email || customer.email || '',
                        birthYear: allData.birth_year || '',
                        birthMonth: allData.birth_month || '',
                        birthDay: allData.birth_day || '',
                        birthHour: allData.birth_hour || '',
                        gender: allData.gender || '',
                        birthPlace: allData.birth_place || '',
                        notes: allData.notes || '',
                        language: allData.language || 'zh',
                        amount: amount,
                        currency: order.currency || checkout.currency || 'USD',
                        status: order.status || 'paid',
                        createdAt: order.created_at || checkout.created_at || new Date().toISOString(),
                        paidAt: new Date().toISOString(),
                        mode: checkout.mode || 'live',
                        productName: product.name || '',
                        customerName: customer.name || '',
                        customerEmail: customer.email || '',
                        customerCountry: customer.country || ''
                    };

                    console.log('💾 保存八字订单到 Redis:', JSON.stringify(orderData, null, 2));

                    try {
                        await redisSet(`bazi_order:${checkout.id}`, orderData);
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

                    // 追加营销池
                    await addToMarketingPool(orderData.email, orderData.name || customer.name);

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
                    // 非八字订单：判断商城/黄历，分别写入 Redis
                    const isAlmanac = product.id === ALMANAC_PRODUCT_ID ||
                                      product.name?.toLowerCase().includes('almanac') ||
                                      product.name?.toLowerCase().includes('auspicious date') ||
                                      product.name?.includes('黄历') ||
                                      product.name?.includes('择日');

                    const orderType = isAlmanac ? 'almanac' : 'shop';
                    const orderKey = `${orderType}_order:${checkout.id}`;
                    const idsKey = `${orderType}_order_ids`;

                    const genericOrderData = {
                        id: checkout.id,
                        orderId: orderId,
                        checkoutId: checkout.id,
                        email: allData.email || customer.email || '',
                        name: allData.name || customer.name || '',
                        amount: amount,
                        currency: order.currency || checkout.currency || 'USD',
                        status: order.status || 'paid',
                        productName: product.name || '',
                        productId: product.id || '',
                        createdAt: order.created_at || checkout.created_at || new Date().toISOString(),
                        paidAt: new Date().toISOString(),
                        mode: checkout.mode || 'live',
                        customerName: customer.name || '',
                        customerEmail: customer.email || '',
                        customerCountry: customer.country || ''
                    };

                    console.log(`💾 保存${isAlmanac ? '黄历' : '商城'}订单到 Redis:`, orderKey);

                    try {
                        await redisSet(orderKey, genericOrderData);
                        let existingIds = await redisGet(idsKey) || [];
                        if (!existingIds.includes(checkout.id)) {
                            existingIds.unshift(checkout.id);
                            await redisSet(idsKey, existingIds);
                            console.log(`💾 ${orderType} 订单列表已更新，共 ${existingIds.length} 笔`);
                        }
                        console.log(`✅ ${isAlmanac ? '黄历' : '商城'}订单保存成功!`);
                    } catch (redisError) {
                        console.error('❌ Redis 保存失败（非致命）:', redisError.message);
                    }

                    // 追加营销池
                    await addToMarketingPool(genericOrderData.email, genericOrderData.name || customer.name);

                    // 发企业微信通知
                    await sendWechatNotification({
                        orderId: orderId,
                        amount: amount,
                        currency: order.currency || checkout.currency || 'USD',
                        customerEmail: customer.email || '',
                        customerName: customer.name || '',
                        productName: product.name || ''
                    });
                }

                break;
            }

            case 'checkout.failed':
                console.log('❌ Checkout failed');
                break;

            default:
                console.log(`ℹ️ Unhandled event type: ${eventType}`);
        }

        return res.status(200).json({ received: true, eventType: eventType });

    } catch (error) {
        console.error('❌ Error processing Creem webhook:', error);
        return res.status(500).json({ error: error.message });
    }
}

/**
 * 追加邮箱到营销池（去重）
 */
async function addToMarketingPool(email, name) {
    if (!email) return;
    try {
        const normalizedEmail = email.toLowerCase().trim();
        let subscribers = await redisGet('marketing_subscribers') || [];
        const exists = subscribers.some(s => s.email && s.email.toLowerCase() === normalizedEmail);
        if (!exists) {
            subscribers.unshift({
                email: normalizedEmail,
                name: (name || '').trim(),
                source: 'purchase',
                subscribedAt: new Date().toISOString()
            });
            await redisSet('marketing_subscribers', subscribers);
            console.log(`📬 Added ${normalizedEmail} to marketing pool (purchase), total: ${subscribers.length}`);
        }
    } catch (err) {
        console.error('❌ Marketing pool update failed (non-fatal):', err.message);
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
            `**金额：** $${parseFloat(orderData.amount || 0).toFixed(2)} ${orderData.currency || 'USD'}\n` +
            `**产品：** ${orderData.productName || '未指定'}\n` +
            `**客户邮箱：** ${orderData.customerEmail || orderData.email || '未提供'}\n` +
            `**客户姓名：** ${orderData.customerName || orderData.name || '未提供'}\n` +
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
