/**
 * ============================================
 * 八字订单查询 API (Vercel Functions)
 * 从 Creem Transactions + Checkout 详情获取八字订单
 * ============================================
 */

export default async function handler(req, res) {
    // 只允许 GET 请求
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

        const apiKey = process.env.CREEM_API_KEY?.trim();
        if (!apiKey) {
            console.error('❌ 未配置 CREEM_API_KEY 环境变量');
            return res.status(500).json({ error: '支付系统配置错误' });
        }

        // 判断测试/生产模式
        const isTestMode = ['true', '1'].includes(String(process.env.CREEM_TEST_MODE).toLowerCase());
        const creemApiBase = isTestMode ? 'https://test-api.creem.io/v1' : 'https://api.creem.io/v1';

        console.log(`========== 八字订单查询 (${isTestMode ? '测试' : '生产'}模式) ==========`);

        // 第一步：获取所有交易记录
        let allTransactions = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            const url = `${creemApiBase}/transactions/search?page_number=${page}&page_size=50`;
            console.log(`📤 请求交易列表: ${url}`);

            const response = await fetch(url, {
                method: 'GET',
                headers: { 'x-api-key': apiKey }
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error(`❌ 获取交易列表失败: ${response.status} - ${errText}`);
                return res.status(500).json({ error: '获取订单列表失败', detail: errText });
            }

            const result = await response.json();

            // 第一页打印响应结构
            if (page === 1) {
                console.log('📥 响应 keys:', Object.keys(result));
                if (result.items && result.items.length > 0) {
                    console.log('📥 第一条交易 keys:', Object.keys(result.items[0]));
                    console.log('📥 第一条交易:', JSON.stringify(result.items[0], null, 2));
                }
                if (result.pagination) {
                    console.log('📊 分页信息:', JSON.stringify(result.pagination));
                }
            }

            const items = result.items || [];
            allTransactions = allTransactions.concat(items);

            // 检查分页
            if (result.pagination && result.pagination.next_page) {
                page = result.pagination.next_page;
            } else {
                hasMore = false;
            }

            // 安全限制
            if (page > 100) hasMore = false;
        }

        console.log(`📊 共获取 ${allTransactions.length} 笔交易`);

        // 第二步：过滤已支付成功的交易
        const paidTransactions = allTransactions.filter(t =>
            t.status === 'succeeded' || t.status === 'completed'
        );
        console.log(`✅ 其中已支付: ${paidTransactions.length} 笔`);

        // 第三步：逐个获取 checkout 详情（包含 metadata）
        const baziOrders = [];

        for (const tx of paidTransactions) {
            // 交易里可能有 order 字段就是 checkout_id
            const checkoutId = tx.order || tx.checkout_id || tx.checkout;
            if (!checkoutId) {
                console.log(`⚠️ 交易 ${tx.id} 没有 checkout_id，跳过`);
                continue;
            }

            try {
                const detailUrl = `${creemApiBase}/checkouts/${checkoutId}`;
                const detailRes = await fetch(detailUrl, {
                    method: 'GET',
                    headers: { 'x-api-key': apiKey }
                });

                if (!detailRes.ok) {
                    console.error(`❌ 获取 checkout ${checkoutId} 详情失败: ${detailRes.status}`);
                    continue;
                }

                const checkout = await detailRes.json();
                const metadata = checkout.metadata || {};

                // 只保留八字订单（metadata 中有 product_type: bazi_analysis）
                if (metadata.product_type !== 'bazi_analysis') {
                    continue;
                }

                // 构建订单数据
                const amount = checkout.amount ? (checkout.amount / 100) : (tx.amount ? (tx.amount / 100) : 0);

                baziOrders.push({
                    id: checkout.id,
                    orderId: metadata.order_id || checkout.id,
                    // 客户信息
                    name: metadata.name || checkout.customer?.name || '',
                    email: metadata.email || checkout.customer?.email || '',
                    // 八字数据
                    birthYear: metadata.birth_year || '',
                    birthMonth: metadata.birth_month || '',
                    birthDay: metadata.birth_day || '',
                    birthHour: metadata.birth_hour || '',
                    gender: metadata.gender || '',
                    birthPlace: metadata.birth_place || '',
                    notes: metadata.notes || '',
                    language: metadata.language || 'zh',
                    // 支付信息
                    amount: amount,
                    currency: checkout.currency || tx.currency || 'USD',
                    status: tx.status || checkout.status || 'succeeded',
                    createdAt: checkout.created_at || tx.created_at || '',
                    paidAt: tx.created_at || '',
                    // 原始数据
                    mode: tx.mode || checkout.mode || 'live'
                });

                console.log(`✅ 八字订单: ${metadata.name} | ${metadata.birth_year}/${metadata.birth_month}/${metadata.birth_day} | $${amount}`);

            } catch (err) {
                console.error(`❌ 处理 checkout ${checkoutId} 出错:`, err.message);
            }
        }

        // 按时间倒序排列
        baziOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        console.log(`🎯 最终结果: ${baziOrders.length} 笔八字订单`);

        return res.status(200).json({
            success: true,
            orders: baziOrders,
            total: baziOrders.length,
            totalTransactions: allTransactions.length,
            paidTransactions: paidTransactions.length
        });

    } catch (error) {
        console.error('❌ 获取八字订单错误:', error);
        return res.status(500).json({ error: '获取订单失败', detail: error.message });
    }
}
