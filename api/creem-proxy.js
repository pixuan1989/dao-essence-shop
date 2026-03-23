/**
 * ========================================
 * Creem API 代理 - Vercel Serverless 版本
 * ========================================
 * 
 * 安全性：API Key 从环境变量读取
 * 性能：HTTP 缓存头 + 浏览器端 localStorage
 * 稳定性：自动降级 + 完善的错误处理 + 超时控制
 * 
 * 部署：Vercel Serverless Functions
 * 调用方式：前端 fetch('/api/products')
 */

// ============================================
// 配置信息（从环境变量读取）
// ============================================

const CREEM_CONFIG = {
  apiBase: 'https://api.creem.io/v1',
  apiKey: process.env.CREEM_API_KEY || '', // ✅ 从环境变量读取，不硬编码
  productIds: {
    agarwood: 'prod_7i2asEAuHFHl5hJMeCEsfB',      // 传统沉香 - $200
    bracelet: 'prod_1YuuAVysoYK6AOmQVab2uR'      // 五行能量手串 - $168
  }
};

// API 请求超时时间（Vercel 默认 10 秒，我们用 8 秒）
const API_TIMEOUT = 8000; // 毫秒

// ============================================
// 工具函数
// ============================================

/**
 * 设置超时的 fetch（解决无限等待问题）
 */
async function fetchWithTimeout(url, options = {}, timeout = API_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * 从 Creem API 获取单个产品详情
 */
async function fetchCreemProduct(productId) {
  const url = `${CREEM_CONFIG.apiBase}/products/${productId}`;
  
  console.log(`📥 调用 Creem API: ${url}`);
  
  if (!CREEM_CONFIG.apiKey) {
    console.error('❌ CREEM_API_KEY 环境变量未设置！');
    return null;
  }

  try {
    const response = await fetchWithTimeout(url, {
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
    return data;
  } catch (error) {
    console.error(`❌ 拉取产品 ${productId} 失败:`, error.message);
    return null;
  }
}

/**
 * 转换 Creem 数据格式为网站格式
 */
function transformCreemProduct(creemProduct) {
  if (!creemProduct) return null;

  // 🔥 关键修复：Creem API 返回的价格是以分为单位的，需要除以 100
  // 例如：20000 = $200.00，16800 = $168.00
  const priceInCents = parseInt(creemProduct.price || 0);
  const priceInDollars = priceInCents / 100;

  return {
    id: creemProduct.id,
    creemId: creemProduct.id,
    name: creemProduct.name || 'Unknown Product',
    nameCN: creemProduct.name || 'Unknown Product',
    category: 'spiritual',
    categoryCN: '精神修行',
    element: 'energy',
    price: priceInDollars, // ✅ 已转换为美元
    originalPrice: priceInDollars,
    currency: creemProduct.currency || 'USD',
    description: creemProduct.description || 'Premium spiritual product from Creem',
    descriptionCN: creemProduct.description || '来自 Creem 的高级精神产品',
    image_url: creemProduct.image_url || 'images/placeholder.jpg', // ✅ 使用 Creem API 的正确字段名
    img_url: creemProduct.image_url || 'images/placeholder.jpg', // 备用字段
    product_id: creemProduct.id,
    product_name: creemProduct.name,
    product_description: creemProduct.description,
    creemUrl: `https://www.creem.io/payment/${creemProduct.id}`
  };
}

/**
 * 从 Creem API 拉取所有产品
 * ✅ 注意：后端不再缓存（Serverless 无状态）
 *    缓存由浏览器端 localStorage + HTTP 缓存头完成
 */
async function getAllProducts() {
  console.log('🔄 从 Creem API 拉取新数据...');
  
  const products = [];

  // 并发拉取所有产品（更快）
  const productFetches = Object.entries(CREEM_CONFIG.productIds).map(
    ([key, productId]) => fetchCreemProduct(productId)
  );

  const creemProducts = await Promise.allSettled(productFetches);

  // 处理拉取结果
  for (const result of creemProducts) {
    if (result.status === 'fulfilled' && result.value) {
      const transformed = transformCreemProduct(result.value);
      if (transformed) {
        products.push(transformed);
      }
    }
  }

  if (products.length === 0) {
    console.warn('⚠️ 没有拉到任何产品！返回备用数据');
    return getFallbackProducts();
  }

  console.log(`✅ 成功拉取 ${products.length} 个产品`);
  return products;
}

/**
 * 备用产品数据（当 API 失败时使用）
 */
function getFallbackProducts() {
  return [
    {
      "id": "prod_7i2asEAuHFHl5hJMeCEsfB",
      "creemId": "prod_7i2asEAuHFHl5hJMeCEsfB",
      "name": "Traditional Agarwood",
      "nameCN": "传统沉香",
      "category": "incense",
      "categoryCN": "香",
      "element": "wood",
      "price": 200.00,
      "currency": "USD",
      "description": "Premium natural agarwood for meditation and academic success.",
      "descriptionCN": "用于冥想和学业的优质天然沉香。支持专注力和思维清晰。",
      "image": "https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=600&h=600&fit=crop",
      "stock": 999,
      "benefits": ["Tranquility", "Sleep", "Positivity"],
      "energyLevel": "High",
      "creemUrl": "https://www.creem.io/payment/prod_7i2asEAuHFHl5hJMeCEsfB"
    },
    {
      "id": "prod_1YuuAVysoYK6AOmQVab2uR",
      "creemId": "prod_1YuuAVysoYK6AOmQVab2uR",
      "name": "Five Elements Energy Bracelet",
      "nameCN": "五行能量手串",
      "category": "crystals",
      "categoryCN": "晶体",
      "element": "water",
      "price": 168.00,
      "currency": "USD",
      "description": "Five elements energy bracelet with natural amber beads.",
      "descriptionCN": "天然琥珀珠五行能量手串。平衡身体能量，促进和谐。",
      "image": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop",
      "stock": 999,
      "benefits": ["Balance", "Harmony", "Energy"],
      "energyLevel": "Medium",
      "creemUrl": "https://www.creem.io/payment/prod_1YuuAVysoYK6AOmQVab2uR"
    }
  ];
}

/**
 * 获取 CORS 和缓存响应头
 * ✅ 改进：HTTP 缓存头确保浏览器和 CDN 缓存 5 分钟
 */
function getCorsHeaders(allowedOrigin = '*') {
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
    // ✅ HTTP 缓存头：5 分钟浏览器 + CDN 缓存
    'Cache-Control': 'public, max-age=300, s-maxage=300',
    // ✅ 防止缓存问题的额外头
    'ETag': generateETag(),
    'Vary': 'Accept-Encoding'
  };
}

/**
 * 生成简单的 ETag（用于缓存验证）
 */
function generateETag() {
  // 这里可以用产品数据的 hash，简单起见用时间戳
  const now = new Date();
  const minute = Math.floor(now.getTime() / (5 * 60 * 1000)); // 5分钟为单位
  return `"product-${minute}"`;
}

/**
 * 处理 Serverless 请求
 */
async function handleRequest(request) {
  // 设置 CORS 头
  const headers = getCorsHeaders();

  // 处理 CORS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers
    });
  }

  // 处理 GET 请求
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({
      success: false,
      error: 'Method Not Allowed'
    }), {
      status: 405,
      headers
    });
  }

  // 路由：获取所有产品
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  if (pathname === '' || pathname === '/' || pathname === '/products' || pathname === '/products/' || pathname === '/api/products') {
    try {
      const products = await getAllProducts();
      return new Response(JSON.stringify({
        success: true,
        data: products,
        count: products.length,
        timestamp: new Date().toISOString(),
        cacheStrategy: 'HTTP Cache Headers (5 min browser + CDN)'
      }), {
        status: 200,
        headers
      });
    } catch (error) {
      console.error('❌ 获取产品列表失败:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message || 'Internal Server Error',
        data: getFallbackProducts()
      }), {
        status: 500,
        headers
      });
    }
  }

  // 路由：获取单个产品
  if (pathname.startsWith('/products/') || pathname.startsWith('/api/products/')) {
    const productId = pathname.split('/').pop();
    
    try {
      if (!productId) {
        return new Response(JSON.stringify({
          success: false,
          error: '缺少产品 ID'
        }), {
          status: 400,
          headers
        });
      }

      const creemProduct = await fetchCreemProduct(productId);
      if (!creemProduct) {
        return new Response(JSON.stringify({
          success: false,
          error: '产品不存在'
        }), {
          status: 404,
          headers
        });
      }
      
      const transformed = transformCreemProduct(creemProduct);
      return new Response(JSON.stringify({
        success: true,
        data: transformed
      }), {
        status: 200,
        headers
      });
    } catch (error) {
      console.error(`❌ 获取产品 ${productId} 失败:`, error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message || 'Internal Server Error'
      }), {
        status: 500,
        headers
      });
    }
  }

  // 404 处理
  return new Response(JSON.stringify({
    success: false,
    error: 'Not found'
  }), {
    status: 404,
    headers
  });
}

// ============================================
// 导出（Vercel Serverless - fetch Web Standard API）
// ============================================

export default {
  async fetch(request) {
    return await handleRequest(request);
  }
};
