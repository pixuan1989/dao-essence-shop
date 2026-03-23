/**
 * ✅ Creem API 实时同步脚本 v2.0
 * 
 * 功能：
 * 1. 从后端 /api/products 拉取 Creem 商品数据
 * 2. 实现 localStorage 缓存（5分钟有效期）
 * 3. 自动重试和错误处理
 * 4. 数据转换为网站标准格式
 * 5. 更新全局 window.allProducts
 * 6. 页面动态渲染
 */

console.log('✅ Creem 实时同步脚本 v2.0 已加载');

/**
 * 缓存配置
 */
const CACHE_CONFIG = {
  key: 'creem_products_cache',
  ttl: 5 * 60 * 1000 // 5分钟缓存
};

/**
 * 备用数据（API 失败时使用）
 */
const FALLBACK_PRODUCTS = [
  {
    id: 'prod_7i2asEAuHFHl5hJMeCEsfB',
    name: '传统沉香',
    price: 200,
    currency: 'USD',
    description: '优质沉香，传统工艺制作',
    image: 'images/agarwood.jpg',
    category: 'agarwood'
  },
  {
    id: 'prod_1YuuAVysoYK6AOmQVab2uR',
    name: '五行能量手串',
    price: 168,
    currency: 'USD',
    description: '五行能量手串，平衡身心',
    image: 'images/bracelet.jpg',
    category: 'bracelet'
  }
];

/**
 * 检查缓存是否有效
 */
function getFromCache() {
  try {
    const cached = localStorage.getItem(CACHE_CONFIG.key);
    if (!cached) return null;

    const data = JSON.parse(cached);
    const now = Date.now();
    
    if (now - data.timestamp < CACHE_CONFIG.ttl) {
      console.log('✅ 使用 localStorage 缓存数据（' + Math.round((CACHE_CONFIG.ttl - (now - data.timestamp)) / 1000) + '秒后过期）');
      return data.products;
    } else {
      console.log('⏰ 缓存已过期，即将重新拉取...');
      localStorage.removeItem(CACHE_CONFIG.key);
      return null;
    }
  } catch (e) {
    console.warn('⚠️ 缓存读取失败:', e.message);
    return null;
  }
}

/**
 * 保存缓存
 */
function saveToCache(products) {
  try {
    localStorage.setItem(CACHE_CONFIG.key, JSON.stringify({
      timestamp: Date.now(),
      products: products
    }));
    console.log('💾 数据已保存到 localStorage 缓存');
  } catch (e) {
    console.warn('⚠️ 缓存保存失败:', e.message);
  }
}

/**
 * 从后端 API 拉取数据
 */
async function fetchFromAPI(retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🌐 第 ${attempt}/${retries} 次尝试从 API 拉取数据...`);
      
      const response = await fetch('/api/products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ API 调用成功，返回 ' + (data.products || []).length + ' 个产品');
      
      return data.products || [];
    } catch (error) {
      console.warn(`❌ 第 ${attempt} 次尝试失败:`, error.message);
      
      if (attempt < retries) {
        const delay = Math.pow(2, attempt - 1) * 1000; // 指数退避
        console.log(`⏳ ${delay / 1000}秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error('API 调用失败，已达最大重试次数');
}

/**
 * 转换 Creem API 返回的数据格式
 */
function transformProducts(products) {
  if (!Array.isArray(products)) {
    console.warn('⚠️ 产品数据不是数组，使用备用数据');
    return FALLBACK_PRODUCTS;
  }

  return products.map(product => ({
    id: product.id || product.productId,
    name: product.name || product.title || '未知产品',
    price: product.price || product.priceAmount || 0,
    currency: product.currency || 'USD',
    description: product.description || '暂无描述',
    image: product.image || product.images?.[0] || 'images/placeholder.jpg',
    category: product.category || 'other',
    url: product.url,
    stock: product.stock || 999
  }));
}

/**
 * 主同步函数
 */
async function syncCreemProducts() {
  console.log('🚀 开始 Creem 产品同步...');
  
  try {
    // 第1步：检查缓存
    let products = getFromCache();
    
    // 第2步：如果无缓存，从 API 拉取
    if (!products) {
      console.log('📡 从 API 拉取新数据...');
      const apiProducts = await fetchFromAPI();
      products = transformProducts(apiProducts);
      saveToCache(products);
    }
    
    // 第3步：更新全局数据
    window.allProducts = products;
    console.log('✅ window.allProducts 已更新，共 ' + products.length + ' 个产品');
    
    // 第4步：触发自定义事件，通知页面脚本更新 DOM
    window.dispatchEvent(new CustomEvent('creemProductsReady', { 
      detail: { products: products } 
    }));
    
    console.log('✨ Creem 产品同步完成！');
    return products;
    
  } catch (error) {
    console.error('❌ 产品同步失败:', error.message);
    console.log('📋 使用备用数据...');
    
    // 使用备用数据
    window.allProducts = FALLBACK_PRODUCTS;
    window.dispatchEvent(new CustomEvent('creemProductsReady', { 
      detail: { products: FALLBACK_PRODUCTS } 
    }));
    
    console.log('⚠️ 已使用备用数据（' + FALLBACK_PRODUCTS.length + ' 个产品）');
    return FALLBACK_PRODUCTS;
  }
}

/**
 * 页面加载完成后执行同步
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', syncCreemProducts);
} else {
  // 如果脚本加载时 DOM 已准备就绪
  syncCreemProducts();
}

/**
 * 导出函数供外部调用
 */
window.syncCreemProducts = syncCreemProducts;
console.log('📌 可通过 window.syncCreemProducts() 手动触发同步');
