/**
 * Debug: 查询 Creem 真实产品列表
 */
export default async function handler(req, res) {
    try {
        const apiKey = process.env.CREEM_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'CREEM_API_KEY not configured' });
        }

        console.log('🔍 查询 Creem 生产环境产品列表...');
        console.log('🔑 API Key (前10位):', apiKey.substring(0, 10) + '...');

        // 查询真实环境产品 - 使用正确的搜索端点
        const response = await fetch('https://api.creem.io/v1/products/search?page_size=100', {
            headers: { 'x-api-key': apiKey }
        });

        console.log('📥 响应状态:', response.status, response.statusText);

        if (!response.ok) {
            const text = await response.text();
            console.error('❌ API 错误:', text);
            return res.status(500).json({ 
                error: `API returned ${response.status}`, 
                body: text 
            });
        }

        const data = await response.json();
        const items = data.items || [];
        
        console.log(`✅ 找到 ${items.length} 个产品`);

        // 提取关键信息
        const products = items.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            currency: p.currency || 'USD',
            billing_type: p.billing_type,
            billing_period: p.billing_period || '',
            status: p.status,
            mode: p.mode || 'live',
            description: (p.description || '').substring(0, 100),
            product_url: p.product_url || ''
        }));

        return res.status(200).json({ 
            total: items.length,
            products 
        });
    } catch (error) {
        console.error('❌ Debug error:', error);
        return res.status(500).json({ error: error.message });
    }
}
