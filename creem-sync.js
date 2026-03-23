/**
 * Creem 商品实时同步脚本
 * 页面加载时自动从 Creem API 拉取最新商品数据
 */

const CREEM_CONFIG = {
  apiKey: 'creem_1qa0zx2EuHN9gz9DLcGTAG',
  apiBase: 'https://api.creem.io/v1',
  productIds: {
    agarwood: 'prod_7i2asEAuHFHl5hJMeCEsfB',
    bracelet: 'prod_1YuuAVysoYK6AOmQVab2uR'
  },
  cacheDuration: 5 * 60 * 1000, // 5分钟缓存
  cacheKey: 'creem_products_cache'
};

/**
 * 从 localStorage 获取缓存的产品数据
 */
function getProductsFromCache() {
  try {
    const cached = localStorage.getItem(CREEM_CONFIG.cacheKey);
    if (!cached) return null;

    const data = JSON.parse(cached);
    const now = Date.now();

    // 检查缓存是否过期
    if (now - data.timestamp > CREEM_CONFIG.cacheDuration) {
      console.log('🔄 缓存已过期，需要重新拉取');
      localStorage.removeItem(CREEM_CONFIG.cacheKey);
      return null;
    }

    console.log('✅ 使用缓存的 Creem 商品数据');
    return data.products;
  } catch (error) {
    console.error('❌ 读取缓存出错:', error);
    return null;
  }
}

/**
 * 保存产品数据到缓存
 */
function saveProductsToCache(products) {
  try {
    const data = {
      timestamp: Date.now(),
      products: products
    };
    localStorage.setItem(CREEM_CONFIG.cacheKey, JSON.stringify(data));
    console.log('💾 产品数据已缓存');
  } catch (error) {
    console.error('❌ 保存缓存出错:', error);
  }
}

/**
 * 从 Creem API 拉取单个产品
 */
async function fetchCreemProduct(productId) {
  try {
    const response = await fetch(`${CREEM_CONFIG.apiBase}/products/${productId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CREEM_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ 从 Creem 获取产品: ${productId}`, data);
    return data;

  } catch (error) {
    console.error(`❌ 获取 Creem 产品失败 (${productId}):`, error);
    return null;
  }
}

/**
 * 从 Creem API 拉取所有产品
 */
async function fetchAllCreemProducts() {
  console.log('🔄 开始从 Creem API 拉取商品数据...');

  const products = {};
  
  for (const [key, id] of Object.entries(CREEM_CONFIG.productIds)) {
    const product = await fetchCreemProduct(id);
    if (product) {
      products[id] = product;
    }
  }

  return products;
}

/**
 * 转换 Creem 产品数据为网站格式
 */
function transformProduct(creemProduct) {
  return {
    id: creemProduct.id,
    creemId: creemProduct.id,
    name: creemProduct.name,
    nameCN: creemProduct.name_zh || creemProduct.name,
    category: creemProduct.category || 'product',
    element: creemProduct.element || 'wood',
    price: typeof creemProduct.price === 'number' ? creemProduct.price / 100 : parseFloat(creemProduct.price),
    currency: creemProduct.currency || 'USD',
    description: creemProduct.description || '',
    descriptionCN: creemProduct.description_zh || creemProduct.description || '',
    image: creemProduct.image_url || creemProduct.images?.[0]?.url || 'images/placeholder.png',
    stock: creemProduct.inventory_count || 999,
    benefits: creemProduct.benefits || [],
    energyLevel: creemProduct.energy_level || 'Medium',
    creemUrl: `https://www.creem.io/payment/${creemProduct.id}`
  };
}

/**
 * 同步商品数据到全局 allProducts
 */
function syncProductsToGlobal(products) {
  try {
    if (!window.allProducts) {
      console.warn('⚠️ window.allProducts 不存在，无法同步');
      return false;
    }

    const transformed = Object.values(products).map(p => transformProduct(p));
    
    // 替换全局产品数组
    window.allProducts = transformed;
    console.log(`✅ 已同步 ${transformed.length} 个商品到全局变量`);
    
    // 重新渲染商店
    if (typeof renderShop === 'function') {
      renderShop();
      console.log('✅ 商店已重新渲染');
    }

    return true;
  } catch (error) {
    console.error('❌ 同步产品到全局变量出错:', error);
    return false;
  }
}

/**
 * 主同步函数 - 先查缓存，如果无缓存则从 API 拉取
 */
async function syncCreemProducts() {
  console.log('🔄 Creem 商品同步开始...');

  // 先检查缓存
  let products = getProductsFromCache();

  // 如果无缓存，从 API 拉取
  if (!products) {
    products = await fetchAllCreemProducts();
    if (!products || Object.keys(products).length === 0) {
      console.warn('⚠️ 无法从 Creem 获取商品，使用本地默认数据');
      return false;
    }
    saveProductsToCache(products);
  }

  // 同步到全局变量
  return syncProductsToGlobal(products);
}

/**
 * 页面加载时自动同步
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', syncCreemProducts);
} else {
  // 如果 DOM 已加载，直接同步
  syncCreemProducts();
}

// 将同步函数暴露到全局作用域，允许手动调用
window.syncCreemProducts = syncCreemProducts;

console.log('✅ Creem 实时同步脚本已加载');
