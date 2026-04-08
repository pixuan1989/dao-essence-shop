/**
 * ============================================
 * 八字订单查询 API (Vercel Functions)
 * 从 Creem Transactions API 获取所有支付记录
 * ============================================
 */

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 验证管理员访问
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

        console.log('========== 八字订单查询调试 ==========');
        console.log('isTestMode:', isTestMode);
        console.log('API Base:', creemApiBase);

        if (!apiKey) {
            return res.status(500).json({ error: '支付系统配置错误' });
        }

        // 使用 GET /v1/transactions 获取所有交易记录
        const url = `${creemApiBase}/transactions`;
        console.log(`📤 请求交易列表: ${url}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'x-api-key': apiKey }
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`❌ 获取交易列表失败: ${response.status} - ${errText}`);
            return res.status(500).json({ error: '获取交易列表失败' });
        }

        const result = await response.json();
        console.log('📥 响应 keys:', Object.keys(result));

        // 解析交易列表
        let transactions = result.data || result.transactions || result.items || result || [];
        if (!Array.isArray(transactions)) {
            console.log('📥 完整响应:', JSON.stringify(result, null, 2));
            transactions = [];
        }

        console.log(`📊 共获取 ${transactions.length} 笔交易`);

        if (transactions.length > 0) {
            console.log('📥 第一条交易 keys:', Object.keys(transactions[0]));
            console.log('📥 第一条交易 (完整):', JSON.stringify(transactions[0], null, 2));
        }

        // 从交易记录中提取 checkout_id，然后用 GET /v1/checkouts/:id 获取 metadata
        const baziOrders = [];

        for (const tx of transactions) {
            const checkoutId = tx.checkout_id || tx.checkout?.id || tx.metadata?.checkout_id || tx.id;
            console.log(`🔍 处理交易: ${tx.id}, checkout_id: ${checkoutId}`);

            // 先检查交易记录本身有没有 metadata
            const txMeta = tx.metadata || {};

            if (txMeta.birth_year || txMeta.birth_month || txMeta.product_type === 'bazi_analysis') {
                baziOrders.push(parseBaziOrder(tx, txMeta));
                continue;
            }

            // 如果没有 metadata，尝试从 checkout 详情获取
            if (checkoutId) {
                try {
                    const detailUrl = `${creemApiBase}/checkouts/${checkoutId}`;
                    const detailRes = await fetch(detailUrl, {
                        headers: { 'x-api-key': apiKey }
                    });

                    if (detailRes.ok) {
                        const detail = await detailRes.json();
                        const detailData = detail.data || detail.checkout || detail;
                        const detailMeta = detailData.metadata || {};

                        console.log(`📥 Checkout ${checkoutId} metadata:`, JSON.stringify(detailMeta));

                        if (detailMeta.birth_year || detailMeta.birth_month || detailMeta.product_type === 'bazi_analysis') {
                            baziOrders.push(parseBaziOrder(detailData, detailMeta));
                        }
                    } else {
                        console.log(`⚠️ 获取 checkout ${checkoutId} 详情失败: ${detailRes.status}`);
                    }
                } catch (e) {
                    console.error(`获取 checkout ${checkoutId} 详情异常:`, e.message);
                }
            }
        }

        console.log(`📊 最终结果: ${baziOrders.length} 笔八字订单`);
        console.log('======================================');

        return res.status(200).json({
            success: true,
            total: baziOrders.length,
            totalTransactions: transactions.length,
            orders: baziOrders,
            isTestMode: isTestMode
        });

    } catch (error) {
        console.error('查询八字订单错误:', error);
        return res.status(500).json({ error: '查询失败: ' + error.message });
    }
}

function parseBaziOrder(data, metadata) {
    let amount = data.amount || data.total || data.total_amount || 0;
    if (amount > 10000) amount = amount / 100;

    return {
        orderId: metadata.order_id || data.order_id || data.id,
        checkoutId: data.id || data.checkout_id,
        name: metadata.name || data.customer?.name || data.customer_name || '匿名用户',
        email: metadata.email || data.customer?.email || data.customer_email || '',
        birthYear: metadata.birth_year || '',
        birthMonth: metadata.birth_month || '',
        birthDay: metadata.birth_day || '',
        birthHour: metadata.birth_hour || '',
        gender: metadata.gender || '',
        birthPlace: metadata.birth_place || '',
        notes: metadata.notes || '',
        language: metadata.language || 'zh',
        amount: typeof amount === 'number' ? amount.toFixed(2) : amount,
        status: data.status === 'completed' || data.payment_status === 'paid' ? 'paid' : (data.status || 'pending'),
        createdAt: data.created_at || data.created || data.paid_at
    };
}
