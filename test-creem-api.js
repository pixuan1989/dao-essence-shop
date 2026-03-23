/**
 * 诊断脚本：检查 Creem API 返回的真实数据结构
 */

const CREEM_CONFIG = {
  apiBase: 'https://api.creem.io/v1',
  apiKey: 'creem_1qa0zx2EuHN9gz9DLcGTAG',
  productIds: {
    agarwood: 'prod_7i2asEAuHFHl5hJMeCEsfB',      // 传统沉香 - $200
    bracelet: 'prod_1YuuAVysoYK6AOmQVab2uR'      // 五行能量手串 - $168
  }
};

async function fetchCreemProduct(productId) {
  const url = `${CREEM_CONFIG.apiBase}/products/${productId}`;
  
  console.log(`📥 调用 Creem API: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CREEM_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Creem API 返回 ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ 成功拉取产品: ${productId}`);
    
    // 打印完整的 API 响应
    console.log('\n========== 完整 API 响应 ==========');
    console.log(JSON.stringify(data, null, 2));
    
    // 打印关键字段
    console.log('\n========== 关键字段 ==========');
    console.log('id:', data.id);
    console.log('name:', data.name);
    console.log('name_en:', data.name_en);
    console.log('name_cn:', data.name_cn);
    console.log('price:', data.price);
    console.log('original_price:', data.original_price);
    console.log('currency:', data.currency);
    console.log('image_url:', data.image_url);
    console.log('primary_image:', data.primary_image);
    console.log('image_urls:', data.image_urls);
    
    return data;
  } catch (error) {
    console.error(`❌ 拉取产品 ${productId} 失败:`, error.message);
    return null;
  }
}

// 主测试
(async () => {
  console.log('🚀 开始诊断 Creem API 数据...\n');
  
  // 测试传统沉香
  console.log('\n==== 测试产品 1: 传统沉香 ====');
  await fetchCreemProduct(CREEM_CONFIG.productIds.agarwood);
  
  // 测试五行能量手串
  console.log('\n\n==== 测试产品 2: 五行能量手串 ====');
  await fetchCreemProduct(CREEM_CONFIG.productIds.bracelet);
  
  console.log('\n✅ 诊断完成！');
})();
