/**
 * ============================================
 * 八字订单查询 API (Vercel Functions)
 * 从 Creem API 获取所有八字命理订单
 * ============================================
 */

export default async function handler(req, res) {
    // 只允许 GET 请求
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 验证管理员访问（简单密钥验证）
        const adminKey = req.headers['x-admin-key'];
        if (adminKey !== process.env.ADMIN_KEY) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // 测试模式判断
        const isTestMode = ['true', '1'].includes(String(process.env.CREEM_TEST_MODE).toLowerCase());

        const apiKey = isTestMode
            ? process.env.CREEM_TEST_API_KEY?.trim()
            : process.env.CREEM_API_KEY?.trim();

        const creemApiBase = isTestMode
            ? 'https://test-api.creem.io/v1'
            : 'https://api.creem.io/v1';

        if (!apiKey) {
            return res.status(500).json({ error: '支付系统配置错误' });
        }

        // 获取所有 checkouts
        let allCheckouts = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            const response = await fetch(`${creemApiBase}/checkouts?limit=100&page=${page}`, {
                method: 'GET',
                headers: {
                    'x-api-key': apiKey
                }
            });

            if (!response.ok) {
                console.error(`获取 checkouts 失败: ${response.status}`);
                break;
            }

            const result = await response.json();
            const checkouts = result.data || result.checkouts || result.items || [];

            if (checkouts.length === 0) {
                hasMore = false;
            } else {
                allCheckouts = allCheckouts.concat(checkouts);
                page++;

                // 安全限制：最多查询 50 页
                if (page > 50) hasMore = false;
            }
        }

        // 过滤出八字订单（metadata 中包含 product_type: 'bazi_analysis'）
        const baziOrders = allCheckouts
            .filter(checkout => {
                const metadata = checkout.metadata || {};
                return metadata.product_type === 'bazi_analysis' ||
                       metadata.birth_year || metadata.birth_month;
            })
            .map(checkout => {
                const metadata = checkout.metadata || {};
                const amount = (checkout.amount || checkout.total || 0) / 100;
                return {
                    orderId: metadata.order_id || checkout.id,
                    checkoutId: checkout.id,
                    name: metadata.name || checkout.customer?.name || '匿名用户',
                    email: metadata.email || checkout.customer?.email || '',
                    birthYear: metadata.birth_year || '',
                    birthMonth: metadata.birth_month || '',
                    birthDay: metadata.birth_day || '',
                    birthHour: metadata.birth_hour || '',
                    gender: metadata.gender || '',
                    birthPlace: metadata.birth_place || '',
                    notes: metadata.notes || '',
                    language: metadata.language || 'zh',
                    amount: amount.toFixed(2),
                    status: checkout.status === 'completed' ? 'paid' : checkout.status,
                    createdAt: checkout.created_at || checkout.created
                };
            });

        console.log(`📊 八字订单查询: 共 ${allCheckouts.length} 笔 checkout，其中 ${baziOrders.length} 笔八字订单`);

        return res.status(200).json({
            success: true,
            total: baziOrders.length,
            orders: baziOrders,
            isTestMode: isTestMode
        });

    } catch (error) {
        console.error('查询八字订单错误:', error);
        return res.status(500).json({ error: '查询失败: ' + error.message });
    }
}
