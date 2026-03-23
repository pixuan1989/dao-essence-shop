/**
 * ========================================
 * Creem API 代理 - 后端服务
 * ========================================
 * 
 * 用途：解决浏览器 CORS 限制
 * 功能：从 Creem API 拉取商品数据，转发给前端
 * 
 * 部署方式：CloudFlare Workers（无需服务器）
 * 调用方式：前端 fetch('/api/products')
 */

// ============================================
// 配置信息
// ============================================

const CREEM_CONFIG = {
  apiBase: 'https://api.creem.io/v1',
  apiKey: 'creem_1qa0zx2EuHN9gz9DLcGTAG',
  productIds: {
    agarwood: 'prod_7i2asEAuHFHl5hJMeCEsfB',      // 传统沉香 - $200
    bracelet: 'prod_1YuuAVysoYK6AOmQVab2uR'      // 五行能量手串 - $168
  }
};

// ============================================
// 缓存配置（可选，提升性能）
// ============================================

const CACHE_DURATION = 5 * 60 * 1000; // 5 分钟缓存
let productCache = {
  data: null,
  timestamp: 0
};

// ============================================
// 工具函数
// ============================================

/**
 * 从 Creem API 获取单个产品详情
 */
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
    console.log(`✅ 成功拉取产品:`, productId);
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

  // 从 Creem API 响应中提取字段
  // Creem API 返回的数据结构因产品而异，这里做通用处理
  
  return {
    id: creemProduct.id || creemProduct.identifier,
    creemId: creemProduct.id,
    name: creemProduct.name_en || creemProduct.name,
    nameCN: creemProduct.name_cn || creemProduct.name,
    category: creemProduct.category || 'other',
    categoryCN: creemProduct.category_cn || creemProduct.category,
    element: creemProduct.element || 'unknown',
    price: parseFloat(creemProduct.price) || 0,
    originalPrice: parseFloat(creemProduct.original_price || creemProduct.price),
    currency: creemProduct.currency || 'USD',
    description: creemProduct.description_en || creemProduct.description || '',
    descriptionCN: creemProduct.description_cn || creemProduct.description || '',
    image: creemProduct.image_url || creemProduct.primary_image || '',
    images: creemProduct.image_urls || [creemProduct.image_url] || [],
    stock: creemProduct.stock || 999,
    benefits: creemProduct.benefits || [],
    energyLevel: creemProduct.energy_level || 'Medium',
    creemUrl: `https://www.creem.io/payment/${creemProduct.id}`
  };
}

/**
 * 从缓存或 API 拉取所有产品
 */
async function getAllProducts() {
  const now = Date.now();
  
  // 检查缓存是否有效
  if (productCache.data && (now - productCache.timestamp) < CACHE_DURATION) {
    console.log('📦 使用缓存的产品数据');
    return productCache.data;
  }

  console.log('🔄 从 Creem API 拉取新数据...');
  
  const products = [];

  // 拉取所有产品
  for (const [key, productId] of Object.entries(CREEM_CONFIG.productIds)) {
    const creemProduct = await fetchCreemProduct(productId);
    if (creemProduct) {
      const transformed = transformCreemProduct(creemProduct);
      if (transformed) {
        products.push(transformed);
      }
    }
  }

  if (products.length === 0) {
    console.warn('⚠️ 没有拉到任何产品！');
    // 返回备用数据（防止网站崩溃）
    return getFallbackProducts();
  }

  // 更新缓存
  productCache.data = products;
  productCache.timestamp = now;

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
 * CORS 响应头
 */
function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300' // 浏览器缓存 5 分钟
  };
}

/**
 * 处理请求
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  
  // 处理 CORS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: getCorsHeaders()
    });
  }

  // 路由：获取所有产品
  if (url.pathname === '/api/products' && request.method === 'GET') {
    try {
      const products = await getAllProducts();
      return new Response(JSON.stringify({
        success: true,
        data: products,
        count: products.length,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: getCorsHeaders()
      });
    } catch (error) {
      console.error('❌ 获取产品列表失败:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message,
        data: getFallbackProducts() // 返回备用数据
      }), {
        status: 500,
        headers: getCorsHeaders()
      });
    }
  }

  // 路由：获取单个产品
  if (url.pathname.startsWith('/api/products/') && request.method === 'GET') {
    const productId = url.pathname.split('/').pop();
    try {
      const creemProduct = await fetchCreemProduct(productId);
      if (!creemProduct) {
        return new Response(JSON.stringify({
          success: false,
          error: '产品不存在'
        }), {
          status: 404,
          headers: getCorsHeaders()
        });
      }
      
      const transformed = transformCreemProduct(creemProduct);
      return new Response(JSON.stringify({
        success: true,
        data: transformed
      }), {
        status: 200,
        headers: getCorsHeaders()
      });
    } catch (error) {
      console.error(`❌ 获取产品 ${productId} 失败:`, error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: getCorsHeaders()
      });
    }
  }

  // 404 处理
  return new Response(JSON.stringify({
    success: false,
    error: 'Not found'
  }), {
    status: 404,
    headers: getCorsHeaders()
  });
}

// ============================================
// 导出（用于 Node.js 或 CloudFlare Workers）
// ============================================

module.exports = {
  handleRequest,
  getAllProducts,
  fetchCreemProduct,
  transformCreemProduct,
  CREEM_CONFIG
};

// CloudFlare Workers 入口
if (typeof addEventListener !== 'undefined') {
  addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
  });
}
