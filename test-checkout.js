/**
 * 测试 Creem 生产 API 对 6 个产品的 checkout 创建
 * 运行: node test-checkout.js
 */

const CREEM_API_KEY = 'creem_1qa0zx2EuHN9gz9DLcGTAG';
const CREEM_API_BASE = 'https://api.creem.io/v1';

const PRODUCT_IDS = [
    { name: 'Bazi (旧)', id: 'prod_28PqAKMEom5WGRH1w9O35n' },
    { name: 'Bazi (新)', id: 'prod_1Qp72f3fXnLkKoLvdyMaLw' },
    { name: 'Taoist Music', id: 'prod_45v7a05ZjqA9a1LVq0o0g3' },
    { name: 'Tao Te Ching', id: 'prod_26987QrSoIC3ui76ill96H' },
    { name: 'Lord of Mysteries', id: 'prod_3btZfL4MwsO2xSr7AB3J8S' },
    { name: 'Agarwood', id: 'prod_7i2asEAuHFHl5hJMeCEsfB' },
    { name: 'Five Elements', id: 'prod_1YuuAVysoYK6AOmQVab2uR' },
];

async function testProduct(product) {
    const checkoutData = {
        product_id: product.id,
        success_url: 'https://www.daoessentia.com/payment-success.html',
        request_id: `TEST_${Date.now()}_${Math.floor(Math.random() * 10000)}`
    };

    console.log(`\n📦 测试: ${product.name} (${product.id})`);
    console.log(`   请求: POST ${CREEM_API_BASE}/checkouts`);

    try {
        const response = await fetch(CREEM_API_BASE + '/checkouts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CREEM_API_KEY
            },
            body: JSON.stringify(checkoutData)
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`   ✅ 成功! Status: ${response.status}`);
            console.log(`   🔗 Checkout URL: ${data.checkout_url || 'N/A'}`);
            console.log(`   💰 Mode: ${data.checkout_url?.includes('/test/') ? 'TEST' : 'LIVE'}`);
        } else {
            console.log(`   ❌ 失败! Status: ${response.status}`);
            console.log(`   错误详情: ${JSON.stringify(data)}`);
        }

        return { ...product, success: response.ok, data };
    } catch (error) {
        console.log(`   ❌ 网络错误: ${error.message}`);
        return { ...product, success: false, error: error.message };
    }
}

async function main() {
    console.log('========================================');
    console.log('Creem 生产 API Checkout 测试');
    console.log(`API Key: ${CREEM_API_KEY.substring(0, 15)}...`);
    console.log(`时间: ${new Date().toISOString()}`);
    console.log('========================================');

    const results = [];
    for (const product of PRODUCT_IDS) {
        const result = await testProduct(product);
        results.push(result);
        // 稍微间隔一下，避免频率限制
        await new Promise(r => setTimeout(r, 500));
    }

    console.log('\n========================================');
    console.log('测试汇总');
    console.log('========================================');
    for (const r of results) {
        const icon = r.success ? '✅' : '❌';
        console.log(`${icon} ${r.name}: ${r.success ? '成功' : (r.data ? JSON.stringify(r.data) : r.error)}`);
    }
}

main();
