/**
 * ============================================
 * 八字订单查询 API (Vercel Functions)
 * 从 Redis 读取订单数据
 * 支持: GET(查询) / DELETE(删除)
 * ============================================
 */

import { redisGet, redisSet, redisDel } from '../shared/redis.js';

export default async function handler(req, res) {
    // 验证管理密钥
    const authHeader = req.headers['authorization'];
    const adminKey = process.env.ADMIN_KEY;

    if (!adminKey) {
        console.error('❌ 未配置 ADMIN_KEY 环境变量');
        return res.status(500).json({ error: '服务器配置错误' });
    }

    if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
        return res.status(401).json({ error: '未授权' });
    }

    try {
        if (req.method === 'DELETE') {
            return handleDelete(req, res);
        }
        if (req.method === 'POST') {
            return handlePost(req, res);
        }
        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const type = req.query.type || '';

        // 未读计数
        if (type === 'unread-count') {
            return handleUnreadCount(res);
        }

        // ===== 通用查询：商城 / 黄历 / 留资 =====
        if (type === 'shop') {
            return handleTypeQuery(res, 'shop_order_ids', 'shop_order:');
        }
        if (type === 'almanac') {
            return handleTypeQuery(res, 'almanac_order_ids', 'almanac_order:');
        }
        if (type === 'leads') {
            return handleLeadsQuery(res);
        }

        // ===== 默认：八字订单 + 付费意向 =====
        return handleBaziOrders(res);

    } catch (error) {
        console.error('❌ 订单操作错误:', error);
        return res.status(500).json({ error: '操作失败', detail: error.message });
    }
}

// ========== 删除订单/留资 ==========
async function handleDelete(req, res) {
    const { type, id, idsKey, keyPrefix } = req.body || {};

    if (!type || !id) {
        return res.status(400).json({ error: '缺少 type 或 id 参数' });
    }

    let keysToDelete = [];
    let indexKey = '';

    switch (type) {
        case 'bazi':
            keysToDelete = [`bazi_order:${id}`];
            indexKey = 'bazi_order_ids';
            break;
        case 'shop':
            keysToDelete = [`shop_order:${id}`];
            indexKey = 'shop_order_ids';
            break;
        case 'almanac':
            keysToDelete = [`almanac_order:${id}`];
            indexKey = 'almanac_order_ids';
            break;
        case 'wuxing_quiz':
            keysToDelete = [`wuxing_lead:${id}`];
            indexKey = 'wuxing_lead_ids';
            break;
        case 'intent':
            keysToDelete = [`checkout_intent:${id}`];
            indexKey = 'checkout_intent_ids';
            break;
        case 'contact':
            // 联系表单是数组存储在 contact_subscribers
            keysToDelete = [];
            indexKey = 'contact_subscribers';
            break;
        default:
            return res.status(400).json({ error: '未知类型: ' + type });
    }

    let success = true;

    // 删除数据 key
    for (const key of keysToDelete) {
        const ok = await redisDel(key);
        if (!ok) success = false;
    }

    // 从索引列表中移除
    if (indexKey) {
        if (type === 'contact') {
            // 联系表单: contact_subscribers 是数组，按 date 匹配删除
            const subscribers = await redisGet(indexKey) || [];
            const idx = subscribers.findIndex(s => s.date === id || s.createdAt === id);
            if (idx !== -1) {
                subscribers.splice(idx, 1);
                const ok = await redisSet(indexKey, subscribers);
                if (!ok) success = false;
            }
        } else {
            const idList = await redisGet(indexKey) || [];
            const newIds = idList.filter(item => item !== id);
            const ok = await redisSet(indexKey, newIds);
            if (!ok) success = false;
        }
    }

    console.log(`🗑️ 删除 ${type}:${id} ${success ? '成功' : '部分失败'}`);
    return res.status(200).json({ success });
}

// ========== POST: 记录最后查看时间（标记已读） ==========
async function handlePost(req, res) {
    const { type } = req.body || {};
    if (type === 'mark-read') {
        await redisSet('admin_last_read', new Date().toISOString());
        return res.status(200).json({ success: true });
    }
    return res.status(400).json({ error: '未知 POST 操作' });
}

// ========== 未读计数 ==========
async function handleUnreadCount(res) {
    const lastReadStr = await redisGet('admin_last_read');
    const lastRead = lastReadStr ? new Date(lastReadStr).getTime() : 0;

    let newOrders = 0;
    let newLeads = 0;

    // 八字订单
    const baziIds = await redisGet('bazi_order_ids') || [];
    for (const id of baziIds) {
        const order = await redisGet(`bazi_order:${id}`);
        if (order && new Date(order.createdAt).getTime() > lastRead) newOrders++;
    }

    // 商城订单
    const shopIds = await redisGet('shop_order_ids') || [];
    for (const id of shopIds) {
        const order = await redisGet(`shop_order:${id}`);
        if (order && new Date(order.createdAt).getTime() > lastRead) newOrders++;
    }

    // 黄历订单
    const almanacIds = await redisGet('almanac_order_ids') || [];
    for (const id of almanacIds) {
        const order = await redisGet(`almanac_order:${id}`);
        if (order && new Date(order.createdAt).getTime() > lastRead) newOrders++;
    }

    // 五行测试留资
    const quizIds = await redisGet('wuxing_lead_ids') || [];
    for (const id of quizIds) {
        const lead = await redisGet(`wuxing_lead:${id}`);
        if (lead && new Date(lead.createdAt).getTime() > lastRead) newLeads++;
    }

    // 联系表单留资
    const contacts = await redisGet('contact_subscribers') || [];
    for (const c of contacts) {
        const t = new Date(c.createdAt || c.date || 0).getTime();
        if (t > lastRead) newLeads++;
    }

    // 付费意向（未支付）
    const intentIds = await redisGet('checkout_intent_ids') || [];
    for (const id of intentIds) {
        const intent = await redisGet(`checkout_intent:${id}`);
        if (intent && new Date(intent.createdAt).getTime() > lastRead) newOrders++;
    }

    return res.status(200).json({
        success: true,
        newOrders,
        newLeads,
        total: newOrders + newLeads
    });
}

// ========== 八字订单 + 付费意向（未支付） ==========
async function handleBaziOrders(res) {
    try {
        const orderIds = await redisGet('bazi_order_ids') || [];
        console.log(`📊 订单 ID 列表: ${JSON.stringify(orderIds)}`);

        if (orderIds.length === 0) {
            console.log('📭 Redis 中暂无订单数据');
            // 尝试从 Creem API 回填
            const backfilled = await backfillFromCreem();
            // 同时读取付费意向
            const intents = await getPendingIntents();
            const allItems = [...intents, ...backfilled];
            return res.status(200).json({
                success: true,
                orders: allItems,
                total: allItems.length,
                pendingIntents: intents.length,
                source: 'creem_api_backfill'
            });
        }

        // 逐个获取订单详情
        const orders = [];
        for (const id of orderIds) {
            try {
                const order = await redisGet(`bazi_order:${id}`);
                if (order) {
                    orders.push(order);
                }
            } catch (err) {
                console.error(`❌ 读取订单 ${id} 失败:`, err.message);
            }
        }

        console.log(`✅ 从 Redis 读取 ${orders.length} 笔八字订单`);

        // 获取付费意向（未支付的）
        const intents = await getPendingIntents();
        console.log(`📝 付费意向（未支付）: ${intents.length} 条`);

        // 合并：intents 在前（未支付优先显示）
        const allItems = [...intents, ...orders];

        return res.status(200).json({
            success: true,
            orders: allItems,
            total: allItems.length,
            pendingIntents: intents.length,
            source: 'redis'
        });

    } catch (error) {
        console.error('❌ 获取八字订单错误:', error);
        try {
            const backfilled = await backfillFromCreem();
            const intents = await getPendingIntents();
            const allItems = [...intents, ...backfilled];
            return res.status(200).json({ success: true, orders: allItems, total: allItems.length, pendingIntents: intents.length, source: 'creem_api_fallback' });
        } catch (fallbackError) {
            return res.status(500).json({ error: '获取订单失败', detail: error.message });
        }
    }
}

// ========== 获取待处理的付费意向 ==========
async function getPendingIntents() {
    try {
        const intentIds = await redisGet('checkout_intent_ids') || [];
        const intents = [];
        for (const id of intentIds) {
            try {
                const intent = await redisGet(`checkout_intent:${id}`);
                if (intent) {
                    intent._isPending = true;
                    intents.push(intent);
                }
            } catch (err) { /* skip */ }
        }
        return intents;
    } catch (err) {
        return [];
    }
}

// ========== 通用订单查询（商城/黄历） ==========
async function handleTypeQuery(res, idsKey, prefix) {
    try {
        const ids = await redisGet(idsKey) || [];
        const orders = [];
        for (const id of ids) {
            const order = await redisGet(prefix + id);
            if (order) orders.push(order);
        }
        console.log(`📦 ${prefix}* 读取 ${orders.length} 条`);
        return res.status(200).json({ success: true, orders: orders, total: orders.length });
    } catch (err) {
        console.error(`❌ 查询 ${idsKey} 失败:`, err.message);
        return res.status(500).json({ error: '查询失败', detail: err.message });
    }
}

// ========== 留资线索查询（联系表单 + 五行测试） ==========
async function handleLeadsQuery(res) {
    try {
        const leads = [];

        // 联系表单留资
        const contacts = await redisGet('contact_subscribers') || [];
        for (const c of contacts) {
            leads.push({ ...c, source: 'contact_form', id: 'CT_' + (c.date || '') });
        }

        // 五行测试留资
        const quizIds = await redisGet('wuxing_lead_ids') || [];
        for (const id of quizIds) {
            const lead = await redisGet('wuxing_lead:' + id);
            if (lead) leads.push({ ...lead, source: 'wuxing_quiz' });
        }

        // 按时间倒序
        leads.sort((a, b) => {
            const ta = new Date(a.createdAt || a.date || 0).getTime();
            const tb = new Date(b.createdAt || b.date || 0).getTime();
            return tb - ta;
        });

        console.log(`💬 留资线索: 联系表单 ${contacts.length} + 五行测试 ${quizIds.length} = ${leads.length}`);
        return res.status(200).json({ success: true, leads: leads, total: leads.length });
    } catch (err) {
        console.error('❌ 查询留资线索失败:', err.message);
        return res.status(500).json({ error: '查询失败', detail: err.message });
    }
}

/**
 * 从 Creem API 回填订单（首次使用或 Redis 不可用时的备选方案）
 */
async function backfillFromCreem() {
    const prodApiKey = process.env.CREEM_API_KEY?.trim();
    const testApiKey = process.env.CREEM_TEST_API_KEY?.trim() || prodApiKey;

    if (!prodApiKey) {
        console.error('❌ CREEM_API_KEY 未配置');
        return [];
    }

    const allOrders = [];
    const envs = [
        { name: '生产', baseUrl: 'https://api.creem.io/v1', apiKey: prodApiKey },
        { name: '测试', baseUrl: 'https://test-api.creem.io/v1', apiKey: testApiKey }
    ];

    for (const env of envs) {
        try {
            let page = 1;
            let hasMore = true;

            while (hasMore) {
                const url = `${env.baseUrl}/transactions/search?page_number=${page}&page_size=50`;
                console.log(`📤 回填 - 请求 ${env.name}: ${url}`);

                const response = await fetch(url, {
                    method: 'GET',
                    headers: { 'x-api-key': env.apiKey }
                });

                if (!response.ok) {
                    console.log(`⚠️ ${env.name}请求失败: ${response.status}`);
                    break;
                }

                const result = await response.json();
                const items = result.items || [];

                // 过滤已支付的交易
                const paid = items.filter(t => t.status === 'succeeded' || t.status === 'completed');

                for (const tx of paid) {
                    // 打印第一笔交易的所有字段
                    if (page === 1 && allOrders.length === 0 && items.length > 0) {
                        console.log('📥 第一笔交易完整数据:', JSON.stringify(items[0], null, 2));
                    }

                    const checkoutId = tx.order || tx.checkout_id || tx.checkout;
                    if (!checkoutId) {
                        console.log(`⚠️ 交易 ${tx.id} 没有关联的 checkout ID`);
                        continue;
                    }

                    try {
                        const detailUrl = `${env.baseUrl}/checkouts/${checkoutId}`;
                        const detailRes = await fetch(detailUrl, {
                            method: 'GET',
                            headers: { 'x-api-key': env.apiKey }
                        });

                        if (!detailRes.ok) {
                            console.error(`❌ 获取 checkout ${checkoutId} 详情失败: ${detailRes.status}`);
                            continue;
                        }

                        const checkout = await detailRes.json();
                        const metadata = checkout.metadata || {};

                        if (metadata.product_type !== 'bazi_analysis') continue;

                        const amount = checkout.amount
                            ? (checkout.amount / 100)
                            : (tx.amount ? (tx.amount / 100) : 0);

                        const orderData = {
                            id: checkout.id,
                            orderId: metadata.order_id || checkout.id,
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
                            currency: checkout.currency || tx.currency || 'USD',
                            status: 'paid',
                            createdAt: checkout.created_at || tx.created_at || '',
                            paidAt: tx.created_at || '',
                            mode: tx.mode || checkout.mode || 'live'
                        };

                        allOrders.push(orderData);

                        // 尝试缓存到 Redis
                        try {
                            await redisSet(`bazi_order:${checkout.id}`, orderData);
                            let existingIds = await redisGet('bazi_order_ids') || [];
                            if (!existingIds.includes(checkout.id)) {
                                existingIds.unshift(checkout.id);
                                await redisSet('bazi_order_ids', existingIds);
                            }
                        } catch (redisErr) {
                            // Redis 保存失败不影响
                        }

                    } catch (err) {
                        console.error(`❌ 处理 checkout ${checkoutId} 出错:`, err.message);
                    }
                }

                if (result.pagination && result.pagination.next_page) {
                    page = result.pagination.next_page;
                } else {
                    hasMore = false;
                }

                if (page > 100) hasMore = false;
            }
        } catch (err) {
            console.log(`⚠️ ${env.name}环境回填失败: ${err.message}`);
        }
    }

    console.log(`📦 回填完成: ${allOrders.length} 笔八字订单`);
    return allOrders;
}
