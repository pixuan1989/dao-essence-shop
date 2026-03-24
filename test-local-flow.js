/**
 * 本地完整流程测试
 * 验证：API 能否被调用，数据格式是否正确
 */

console.log('🧪 开始本地完整流程测试\n');

// ========================================
// 第1步：检查环境变量
// ========================================
console.log('📝 第1步：检查环境变量');
const apiKey = process.env.CREEM_API_KEY;
if (apiKey) {
  console.log('✅ CREEM_API_KEY 已设置: ' + apiKey.substring(0, 15) + '...');
} else {
  console.warn('⚠️  CREEM_API_KEY 未设置（本地需要设置或使用备用数据）');
}
console.log('');

// ========================================
// 第2步：加载 API handler
// ========================================
console.log('📝 第2步：加载 API handler');
let handler;
try {
  handler = require('./api/products.js');
  console.log('✅ API handler 加载成功');
} catch (error) {
  console.error('❌ API handler 加载失败:', error.message);
  process.exit(1);
}
console.log('');

// ========================================
// 第3步：模拟 API 请求
// ========================================
console.log('📝 第3步：模拟 API 请求');

// 模拟请求对象
const mockReq = {
  method: 'GET',
  url: '/products',
  headers: {
    'content-type': 'application/json'
  }
};

// 模拟响应对象
let responseData = null;
let responseStatus = 200;
const mockRes = {
  status: function(code) {
    responseStatus = code;
    return this;
  },
  json: function(data) {
    responseData = data;
    console.log('📦 API 返回的数据:');
    console.log(JSON.stringify(data, null, 2));
  },
  setHeader: function(key, value) {
    // 忽略 header 日志以简化输出
  }
};

// 调用 handler
(async () => {
  try {
    await handler(mockReq, mockRes);
    
    console.log('\n✅ API 请求完成');
    console.log('\n📊 响应状态:', responseStatus);
    
    // API 返回的是 { data: [...], success: true, ... }
    const products = responseData && (responseData.data || responseData.products);
    
    if (products && Array.isArray(products)) {
      console.log('\n✅ 产品数据格式正确');
      console.log('📊 返回产品数:', products.length);
      console.log('📊 产品列表:');
      products.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name || product.nameCN} - $${product.price}`);
      });
    } else {
      console.log('\n⚠️  没有返回产品数据或格式不正确');
    }
    
    console.log('\n✨ 测试完成！');
  } catch (error) {
    console.error('❌ API 调用出错:', error);
    process.exit(1);
  }
})();
