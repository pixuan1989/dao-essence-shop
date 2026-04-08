/**
 * Debug: 查询 Creem 真实产品列表
 */
export default async function handler(req, res) {
    try {
        const apiKey = process.env.CREEM_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'CREEM_API_KEY not configured' });
        }

        // 查询真实环境产品
        const response = await fetch('https://api.creem.io/v1/products', {
            headers: { 'x-api-key': apiKey }
        });

        if (!response.ok) {
            const text = await response.text();
            return res.status(500).json({ 
                error: `API returned ${response.status}`, 
                body: text 
            });
        }

        const data = await response.json();
        
        // 提取关键信息
        const products = (data.data || data).map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            currency: p.currency || 'USD',
            billing_type: p.billing_type,
            status: p.status,
            description: p.description?.substring(0, 80) || ''
        }));

        return res.status(200).json({ products });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
