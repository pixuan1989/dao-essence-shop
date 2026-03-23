/**
 * ⚠️ Creem API 同步脚本
 * 
 * 注意：浏览器无法直接调用 Creem API（CORS 限制）
 * 本脚本保留以供将来使用后端代理时激活
 * 
 * 当前方案：使用 shop-manager.js 中的硬编码商品数据
 */

console.log('✅ Creem 实时同步脚本已加载（待后端代理激活）');

// 预留的 API 配置
const CREEM_CONFIG = {
  apiKey: 'creem_1qa0zx2EuHN9gz9DLcGTAG',
  apiBase: 'https://api.creem.io/v1',
  productIds: {
    agarwood: 'prod_7i2asEAuHFHl5hJMeCEsfB',
    bracelet: 'prod_1YuuAVysoYK6AOmQVab2uR'
  }
};

console.warn('💡 提示：前端无法直接调用 Creem API（浏览器 CORS 限制）');
console.warn('💡 解决方案：');
console.warn('  1. 创建后端代理接口');
console.warn('  2. 或使用 Creem Webhooks 推送数据');
console.warn('  3. 当前使用本地硬编码商品数据');
