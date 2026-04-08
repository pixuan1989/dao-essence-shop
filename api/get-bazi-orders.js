/**
 * ============================================
 * 八字订单查询 API (Vercel Functions)
 * 同时查询测试和生产环境，确保不遗漏订单
 * ============================================
 */

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
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

        // 获取 API Key（测试和生产可能不同）
        const prodApiKey = process.env.CREEM_API_KEY?.trim();
        const testApiKey = process.env.CREEM_TEST_API_KEY?.trim() || prodApiKey;

        if (!prodApiKey) {
            console.error('❌ 未配置 CREEM_API_KEY 环境变量');
            return res.status(500).json({ error: '支付系统配置错误' });
        }

        console.log('========== 八字订单查询（全环境） ==========');
        console.log(`🔑 生产 API Key: ${prodApiKey.substring(0, 15)}...`);
        console.log(`🔑 测试 API Key: ${testApiKey.substring(0, 15)}...`);

        const allBaziOrders = [];

        // 查询两个环境：生产 + 测试
        const environments = [
            { name: '生产', baseUrl: 'https://api.creem.io/v1', apiKey: prodApiKey },
            { name: '测试', baseUrl: 'https://test-api.creem.io/v1', apiKey: testApiKey }
        ];

        for (const env of environments) {
            console.log(`\n--- 查询${env.name}环境: ${env.baseUrl} ---`);
            try {
                const orders = await fetchOrdersFromEnv(env.baseUrl, env.apiKey);
                allBaziOrders.push(...orders);
                console.log(`✅ ${env.name}环境获取 ${orders.length} 笔八字订单`);
            } catch (err) {
                console.log(`⚠️ ${env.name}环境查询失败: ${err.message}（跳过）`);
            }
        }

        // 按时间倒序
        allBaziOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        console.log(`\n🎯 最终结果: ${allBaziOrders.length} 笔八字订单`);
        console.log('==========================================');

        return res.status(200).json({
            success: true,
            orders: allBaziOrders,
            total: allBaziOrders.length
        });

    } catch (error) {
        console.error('❌ 获取八字订单错误:', error);
        return res.status(500).json({ error: '获取订单失败', detail: error.message });
    }
}

/**
 * 从指定环境获取八字订单
 */
async function fetchOrdersFromEnv(baseUrl, apiKey) {
    // 第一步：获取所有交易
    let allTransactions = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        const url = `${baseUrl}/transactions/search?page_number=${page}&page_size=50`;
        console.log(`📤 请求: ${url}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'x-api-key': apiKey }
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`❌ 请求失败 ${response.status}: ${errText}`);
            throw new Error(`${response.status} ${errText}`);
        }

        const result = await response.json();

        // 第一页打印结构
        if (page === 1) {
            console.log('📥 响应 keys:', Object.keys(result));
            if (result.pagination) {
                console.log('📊 分页:', JSON.stringify(result.pagination));
            }
            if (result.items && result.items.length > 0) {
                console.log('📥 第一条交易 keys:', Object.keys(result.items[0]));
                console.log('📥 第一条交易:', JSON.stringify(result.items[0], null, 2));
            }
        }

        const items = result.items || [];
        allTransactions = allTransactions.concat(items);

        if (result.pagination && result.pagination.next_page) {
            page = result.pagination.next_page;
        } else {
            hasMore = false;
        }

        if (page > 100) hasMore = false;
    }

    console.log(`📊 共 ${allTransactions.length} 笔交易`);

    // 第二步：过滤已支付
    const paid = allTransactions.filter(t =>
        t.status === 'succeeded' || t.status === 'completed'
    );
    console.log(`✅ 已支付: ${paid.length} 笔`);

    // 第三步：逐个获取 checkout 详情
    const baziOrders = [];

    for (const tx of paid) {
        const checkoutId = tx.order || tx.checkout_id || tx.checkout;
        if (!checkoutId) {
            continue;
        }

        try {
            const detailUrl = `${baseUrl}/checkouts/${checkoutId}`;
            const detailRes = await fetch(detailUrl, {
                method: 'GET',
                headers: { 'x-api-key': apiKey }
            });

            if (!detailRes.ok) {
                console.error(`❌ checkout ${checkoutId} 详情失败: ${detailRes.status}`);
                continue;
            }

            const checkout = await detailRes.json();
            const metadata = checkout.metadata || {};

            // 只保留八字订单
            if (metadata.product_type !== 'bazi_analysis') {
                continue;
            }

            const amount = checkout.amount ? (checkout.amount / 100) : (tx.amount ? (tx.amount / 100) : 0);

            baziOrders.push({
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
            });

            console.log(`✅ 八字: ${metadata.name} | ${metadata.birth_year}/${metadata.birth_month}/${metadata.birth_day} | $${amount}`);

        } catch (err) {
            console.error(`❌ 处理 checkout ${checkoutId} 出错:`, err.message);
        }
    }

    return baziOrders;
}
