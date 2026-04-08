/**
 * Creem API 测试脚本
 * 直接调用 Creem API，测试八字产品创建 checkout
 */

const API_KEY = 'creem_test_2niz3TDaFS828vk5XfPB1G';
const API_BASE = 'https://test-api.creem.io/v1';
const PRODUCT_ID = 'prod_1Qp72f3fXnLkKoLvdyMaLw';

async function testCreemAPI() {
    const payload = {
        product_id: PRODUCT_ID,
        success_url: 'https://daoessentia.com/payment-success.html?test=true',
        request_id: 'TEST_' + Date.now(),
        metadata: {
            order_id: 'TEST_ORDER',
            product_type: 'bazi_analysis',
            birth_year: '1990',
            birth_month: '12',
            birth_day: '25',
            birth_hour: '10',
            gender: 'male',
            birth_place: '北京',
            notes: '测试购买',
            name: '测试用户',
            email: 'test@example.com'
        }
    };

    console.log('========== Creem API 测试 ==========');
    console.log('URL:', `${API_BASE}/checkouts`);
    console.log('API Key (前15位):', API_KEY.substring(0, 15) + '...');
    console.log('请求体:', JSON.stringify(payload, null, 2));
    console.log('======================================');

    try {
        const response = await fetch(`${API_BASE}/checkouts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify(payload)
        });

        const resultText = await response.text();

        console.log('========== 响应详情 ==========');
        console.log('状态码:', response.status, response.statusText);
        console.log('响应内容:', resultText);
        console.log('======================================');

        if (!response.ok) {
            console.error('❌ 错误!');
            console.error('完整响应:', resultText);
        }
    } catch (error) {
        console.error('❌ 网络错误:', error);
    }
}

testCreemAPI();
