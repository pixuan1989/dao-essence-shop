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
        console.log('API Key (前15位):', apiKey?.substring(0, 15) + '...');
        console.log('======================================');

        if (!apiKey) {
            return res.status(500).json({ error: '支付系统配置错误' });
        }

        // 第一步：获取所有 checkouts 列表
        let allCheckouts = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            const url = `${creemApiBase}/checkouts?limit=100&page=${page}`;
            console.log(`📤 请求 checkout 列表: ${url}`);

            const response = await fetch(url, {
                method: 'GET',
                headers: { 'x-api-key': apiKey }
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error(`❌ 获取 checkouts 失败: ${response.status} - ${errText}`);
                break;
            }

            const result = await response.json();

            // 🔥 调试：打印第一页的完整响应结构
            if (page === 1) {
                console.log('📥 第一页响应 keys:', Object.keys(result));
                if (result.data && Array.isArray(result.data) && result.data.length > 0) {
                    console.log('📥 第一条 checkout keys:', Object.keys(result.data[0]));
                    console.log('📥 第一条 checkout (完整):', JSON.stringify(result.data[0], null, 2));
                } else if (result.checkouts && Array.isArray(result.checkouts) && result.checkouts.length > 0) {
                    console.log('📥 第一条 checkout keys:', Object.keys(result.checkouts[0]));
                    console.log('📥 第一条 checkout (完整):', JSON.stringify(result.checkouts[0], null, 2));
                } else {
                    console.log('📥 完整响应:', JSON.stringify(result, null, 2));
                }
            }

            const checkouts = result.data || result.checkouts || result.items || [];

            if (checkouts.length === 0) {
                hasMore = false;
            } else {
                allCheckouts = allCheckouts.concat(checkouts);
                page++;

                if (page > 50) hasMore = false;
            }
        }

        console.log(`📊 共获取 ${allCheckouts.length} 笔 checkout`);

        // 第二步：对有 metadata 的 checkout，尝试获取详情（可能列表不返回 metadata）
        const baziOrders = [];

        for (const checkout of allCheckouts) {
            const metadata = checkout.metadata || {};
            const hasMetadata = metadata.product_type === 'bazi_analysis' ||
                                metadata.birth_year || metadata.birth_month;

            if (hasMetadata) {
                // 列表接口已经有 metadata，直接用
                baziOrders.push(parseBaziOrder(checkout, metadata));
            } else {
                // 列表接口可能没有 metadata，尝试用 retrieve 获取详情
                // 检查产品名是否包含"八字"
                const productName = checkout.product_name || checkout.product?.name || checkout.description || '';
                if (productName.includes('八字') || productName.includes('bazi') || productName.includes('命理')) {
                    console.log(`🔍 可能的八字订单（无 metadata）: ${checkout.id} - ${productName}`);
                    try {
                        const detailUrl = `${creemApiBase}/checkouts/${checkout.id}`;
                        const detailRes = await fetch(detailUrl, {
                            headers: { 'x-api-key': apiKey }
                        });
                        if (detailRes.ok) {
                            const detail = await detailRes.json();
                            const detailData = detail.data || detail.checkout || detail;
                            const detailMeta = detailData.metadata || {};
                            console.log(`📥 详情 metadata:`, JSON.stringify(detailMeta));

                            if (detailMeta.birth_year || detailMeta.birth_month || detailMeta.product_type === 'bazi_analysis') {
                                baziOrders.push(parseBaziOrder(detailData, detailMeta));
                                continue;
                            }
                        }
                    } catch (e) {
                        console.error(`获取 checkout ${checkout.id} 详情失败:`, e.message);
                    }
                }
            }
        }

        console.log(`📊 最终结果: ${allCheckouts.length} 笔 checkout 中找到 ${baziOrders.length} 笔八字订单`);
        console.log('======================================');

        return res.status(200).json({
            success: true,
            total: baziOrders.length,
            totalCheckouts: allCheckouts.length,
            orders: baziOrders,
            isTestMode: isTestMode
        });

    } catch (error) {
        console.error('查询八字订单错误:', error);
        return res.status(500).json({ error: '查询失败: ' + error.message });
    }
}

function parseBaziOrder(checkout, metadata) {
    // 金额处理：Creem 金额通常是分为单位
    let amount = checkout.amount || checkout.total || checkout.total_amount || 0;
    if (amount > 10000) amount = amount / 100; // 如果大于10000，可能是分为单位

    return {
        orderId: metadata.order_id || checkout.order_id || checkout.id,
        checkoutId: checkout.id,
        name: metadata.name || checkout.customer?.name || checkout.customer_name || '匿名用户',
        email: metadata.email || checkout.customer?.email || checkout.customer_email || '',
        birthYear: metadata.birth_year || '',
        birthMonth: metadata.birth_month || '',
        birthDay: metadata.birth_day || '',
        birthHour: metadata.birth_hour || '',
        gender: metadata.gender || '',
        birthPlace: metadata.birth_place || '',
        notes: metadata.notes || '',
        language: metadata.language || 'zh',
        amount: typeof amount === 'number' ? amount.toFixed(2) : amount,
        status: checkout.status === 'completed' || checkout.payment_status === 'paid' ? 'paid' : (checkout.status || 'pending'),
        createdAt: checkout.created_at || checkout.created || checkout.created_at
    };
}
