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
  },
  // 每个产品关联的折扣码（用于查询折扣信息）
  productDiscountCodes: {
    'prod_7i2asEAuHFHl5hJMeCEsfB': 'XJCX520',    // 传统沉香有折扣
    'prod_1YuuAVysoYK6AOmQVab2uR': null           // 五行能量水晶无折扣
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
 * 从 Creem API 获取所有产品列表（使用官方推荐的端点）
 * API 端点：GET /v1/products/search
 * 认证方式：x-api-key header
 */
async function fetchCreemProducts() {
  const url = `${CREEM_CONFIG.apiBase}/products/search`;
  
  console.log(`📥 调用 Creem API 产品列表: ${url}`);
  
  if (!CREEM_CONFIG.apiKey) {
    console.error('❌ CREEM_API_KEY 环境变量未设置！');
    return null;
  }

  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'x-api-key': CREEM_CONFIG.apiKey,  // ✅ 改为官方推荐的认证方式
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Creem API 返回 ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ 成功拉取产品列表, 共 ${data.items?.length || 0} 个产品`);
    return data.items || [];  // 返回产品数组
  } catch (error) {
    console.error(`❌ 拉取产品列表失败:`, error.message);
    return null;
  }
}

/**
 * 从 Creem API 获取单个产品详情（备用方案）
 */
async function fetchCreemProduct(productId) {
  const url = `${CREEM_CONFIG.apiBase}/products/${productId}`;
  
  console.log(`📥 调用 Creem API (单个产品): ${url}`);
  
  if (!CREEM_CONFIG.apiKey) {
    console.error('❌ CREEM_API_KEY 环境变量未设置！');
    return null;
  }

  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'x-api-key': CREEM_CONFIG.apiKey,  // ✅ 改为官方推荐的认证方式
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
 * 从 Creem API 查询折扣码信息
 * API 端点：GET /v1/discounts?discount_code=XJCX520
 * 返回：{ percentage: 90 } 表示支付原价的 90%（即打九折，优惠 10%）
 */
async function fetchCreemDiscount(discountCode) {
  if (!discountCode) return null;

  const url = `${CREEM_CONFIG.apiBase}/discounts?discount_code=${encodeURIComponent(discountCode)}`;
  
  console.log(`📥 查询折扣码: ${discountCode}`);

  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'x-api-key': CREEM_CONFIG.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn(`⚠️ 折扣码 ${discountCode} 查询失败: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log(`✅ 折扣码 ${discountCode}: percentage=${data.percentage}, type=${data.type}`);
    return data;
  } catch (error) {
    console.warn(`⚠️ 折扣码 ${discountCode} 查询异常:`, error.message);
    return null;
  }
}

/**
 * 预加载所有折扣信息
 * 返回 Map：productId -> { originalPrice, currentPrice, discountRate }
 */
async function fetchAllDiscounts(products) {
  const discountMap = {};

  // 并发查询所有有折扣码的产品
  const discountFetches = products.map(async (product) => {
    const discountCode = CREEM_CONFIG.productDiscountCodes[product.id];
    if (!discountCode) return; // 无折扣码，跳过

    const discount = await fetchCreemDiscount(discountCode);
    if (discount && discount.type === 'percentage' && discount.percentage != null) {
      // Creem 的 percentage 字段：90 表示客户支付 90%（打九折，优惠 10%）
      const payPercent = discount.percentage;          // 实际支付百分比，如 90
      const discountRate = 100 - payPercent;           // 折扣率，如 10
      const originalPrice = product.price / 100;       // 转换 cents -> dollars
      const currentPrice = Math.round(originalPrice * payPercent) / 100; // 折后价，保留2位小数

      discountMap[product.id] = {
        originalPrice,
        currentPrice,
        discountRate,
        discountCode
      };
    }
  });

  await Promise.allSettled(discountFetches);
  return discountMap;
}



/**
 * 转换 Creem 数据格式为网站格式
 * 🔥 关键修复：
 * 1. Creem API 返回的价格单位是"分（cents）"，需要除以 100 转换为美元
 * 2. 折扣信息从 Discounts API 动态获取（discountInfo 参数）
 */
function transformCreemProduct(creemProduct, discountInfo) {
  if (!creemProduct) return null;

  // 🔥 修复单位转换：Creem API 返回的是 cents，需要转换为 dollars
  const originalPrice = (parseFloat(creemProduct.price) || 0) / 100;

  // 使用从 Discounts API 获取的折扣信息
  const currentPrice = discountInfo ? discountInfo.currentPrice : originalPrice;
  const discountRate = discountInfo ? discountInfo.discountRate : 0;
  const discountCode = discountInfo ? discountInfo.discountCode : null;

  return {
    id: creemProduct.id,
    creemId: creemProduct.id,
    name: creemProduct.name,
    nameCN: creemProduct.name,              // Creem 后台直接用中文名
    category: creemProduct.category || 'other',
    categoryCN: creemProduct.category || 'other',
    element: creemProduct.element || 'unknown',
    price: currentPrice,                    // 🔥 折后价格
    originalPrice: originalPrice,           // 🔥 原价
    discount: originalPrice - currentPrice, // 🔥 折扣金额
    discountRate: discountRate,             // 🔥 折扣率（百分比）
    discountCode: discountCode,             // 🔥 折扣码（展示用）
    currency: creemProduct.currency || 'USD',
    description: creemProduct.description || '',
    descriptionCN: creemProduct.description || '',
    image: creemProduct.image_url || creemProduct.image || '',
    image_url: creemProduct.image_url || creemProduct.image || '',
    images: [creemProduct.image_url || creemProduct.image || ''],
    stock: 999,
    benefits: [],
    energyLevel: 'Medium',
    creemUrl: `https://www.creem.io/payment/${creemProduct.id}`
  };
}

/**
 * 从 Creem API 拉取所有产品（含折扣信息）
 * 流程：拉取产品列表 → 并发查询折扣 → 合并数据
 */
async function getAllProducts() {
  console.log('🔄 从 Creem API 拉取新数据...');

  // 第1步：拉取产品列表
  let creemProducts = await fetchCreemProducts();

  // ✅ 过滤掉归档产品（只保留 active）
  if (creemProducts) {
    const before = creemProducts.length;
    creemProducts = creemProducts.filter(p => p.status === 'active');
    console.log(`🔍 过滤归档产品: ${before} → ${creemProducts.length}（移除 ${before - creemProducts.length} 个归档）`);
  }

  if (!creemProducts || creemProducts.length === 0) {
    console.warn('⚠️ 产品列表 API 失败，尝试逐个拉取...');
    const results = await Promise.allSettled(
      Object.values(CREEM_CONFIG.productIds).map(id => fetchCreemProduct(id))
    );
    creemProducts = results
      .filter(r => r.status === 'fulfilled' && r.value)
      .map(r => r.value)
      // ✅ 逐个拉取的也要过滤归档
      .filter(p => p.status === 'active' || !p.status);
  }

  if (!creemProducts || creemProducts.length === 0) {
    console.warn('⚠️ 全部 API 失败，返回备用数据');
    return getFallbackProducts();
  }

  // 第2步：查询折扣信息（并发）
  console.log('🔍 查询折扣信息...');
  const discountMap = await fetchAllDiscounts(creemProducts);

  // 第3步：合并产品 + 折扣信息
  const products = creemProducts.map(p => {
    const discountInfo = discountMap[p.id] || null;
    return transformCreemProduct(p, discountInfo);
  }).filter(Boolean);

  console.log(`✅ 成功处理 ${products.length} 个产品`);
  return products;
}

/**
 * 备用产品数据（当 API 失败时使用）
 * 价格已经是美元格式（不是 cents）
 */
function getFallbackProducts() {
  return [
    {
      id: "prod_7i2asEAuHFHl5hJMeCEsfB",
      creemId: "prod_7i2asEAuHFHl5hJMeCEsfB",
      name: "传统沉香能量券",
      nameCN: "传统沉香能量券",
      category: "other",
      categoryCN: "other",
      element: "wood",
      price: 180,            // 折后价
      originalPrice: 200,    // 原价
      discount: 20,
      discountRate: 10,
      discountCode: 'XJCX520',
      currency: "USD",
      description: "Fosters tranquility and restful sleep, clears away negativity, and enhances a positive, balanced state of being.",
      descriptionCN: "传统沉香能量券，促进平静安眠，驱散负能量。",
      image: "images/agarwood.jpg",
      image_url: "images/agarwood.jpg",
      images: ["images/agarwood.jpg"],
      stock: 999,
      benefits: ["Tranquility", "Sleep", "Positivity"],
      energyLevel: "High",
      creemUrl: "https://www.creem.io/payment/prod_7i2asEAuHFHl5hJMeCEsfB"
    },
    {
      id: "prod_1YuuAVysoYK6AOmQVab2uR",
      creemId: "prod_1YuuAVysoYK6AOmQVab2uR",
      name: "五行能量水晶券",
      nameCN: "五行能量水晶券",
      category: "other",
      categoryCN: "other",
      element: "water",
      price: 168,            // 无折扣
      originalPrice: 168,
      discount: 0,
      discountRate: 0,
      discountCode: null,
      currency: "USD",
      description: "Five elements energy bracelet with natural crystal beads.",
      descriptionCN: "五行能量水晶券，平衡身体能量，促进和谐。",
      image: "images/bracelet.jpg",
      image_url: "images/bracelet.jpg",
      images: ["images/bracelet.jpg"],
      stock: 999,
      benefits: ["Balance", "Harmony", "Energy"],
      energyLevel: "Medium",
      creemUrl: "https://www.creem.io/payment/prod_1YuuAVysoYK6AOmQVab2uR"
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
 * 处理 Serverless 请求 - 使用 Vercel 官方推荐的 fetch Web Standard API
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
