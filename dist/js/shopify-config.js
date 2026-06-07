/**
 * Shopify 配置文件
 * 
 * 使用方法：
 * 1. 在 Shopify 后台创建 Headless 应用
 * 2. 获取 Storefront API Access Token
 * 3. 将下面的配置项填入
 */

const SHOPIFY_CONFIG = {
    // 你的 Shopify 店铺域名
    // 格式: your-store-name.myshopify.com
    storeDomain: 'dao-7594.myshopify.com',
    
    // Storefront API Access Token
    // 在 Shopify 后台 → 设置 → 应用和销售渠道 → 开发应用 → 创建应用 → Storefront API 集成 → 获取
    storefrontAccessToken: 'YOUR_STOREFRONT_ACCESS_TOKEN_HERE',
    
    // Storefront API 版本
    apiVersion: '2024-01',
    
    // 语言设置（可选，用于多语言店铺）
    language: 'ZH-CN',
    
    // 货币设置（可选，用于多货币店铺）
    currency: 'USD'
};

// 不要修改下面的代码
const STOREFRONT_API_URL = `https://${SHOPIFY_CONFIG.storeDomain}/api/${SHOPIFY_CONFIG.apiVersion}/graphql.json`;

// 导出配置（如果使用模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SHOPIFY_CONFIG, STOREFRONT_API_URL };
}
