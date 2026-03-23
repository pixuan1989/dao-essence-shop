/**
 * ========================================
 * Creem 产品同步脚本 - 前端版本
 * ========================================
 * 
 * 功能：从后端 API 拉取 Creem 商品数据
 * 用处：取代直接调用 Creem API（解决 CORS 问题）
 * 
 * 如何工作：
 * 1. 页面加载时自动执行
 * 2. 优先使用 localStorage 缓存（5分钟有效）
 * 3. 如果无缓存，从后端 API 拉取
 * 4. 更新全局 window.allProducts
 * 5. 刷新页面显示
 */

// ============================================
// 配置
// ============================================

const CREEM_SYNC_CONFIG = {
  // 后端 API 端点
  // 本地开发：'http://localhost:8000/api/products'
  // 生产环境：'https://your-domain.com/api/products'
  // CloudFlare Workers：'https://your-worker.workers.dev/api/products'
  apiEndpoint: window.location.origin + '/api/products',
  
  // 或者直接用 CloudFlare Workers URL（如果已部署）
  // apiEndpoint: 'https://dao-essence-sync.workers.dev/api/products',
  
  // 缓存配置
  cacheName: 'creem_products_cache',
  cacheExpiry: 5 * 60 * 1000, // 5分钟
  
  // 重试配置
  maxRetries: 3,
  retryDelay: 1000 // 毫秒
};

// ============================================
// 缓存管理
// ============================================

/**
 * 从 localStorage 读取缓存
 */
function getProductsFromCache() {
  try {
    const cached = localStorage.getItem(CREEM_SYNC_CONFIG.cacheName);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    const now = Date.now();
    
    // 检查缓存是否过期
    if (now - parsed.timestamp > CREEM_SYNC_CONFIG.cacheExpiry) {
      console.log('⏰ 缓存已过期，将重新拉取');
      localStorage.removeItem(CREEM_SYNC_CONFIG.cacheName);
      return null;
    }

    console.log('✅ 使用缓存的产品数据（剩余时间: ' + 
      Math.round((CREEM_SYNC_CONFIG.cacheExpiry - (now - parsed.timestamp)) / 1000) + '秒)');
    return parsed.data;
  } catch (error) {
    console.warn('❌ 读取缓存失败:', error);
    return null;
  }
}

/**
 * 保存产品数据到 localStorage
 */
function saveProductsToCache(products) {
  try {
    localStorage.setItem(CREEM_SYNC_CONFIG.cacheName, JSON.stringify({
      data: products,
      timestamp: Date.now()
    }));
    console.log('💾 产品数据已缓存');
  } catch (error) {
    console.warn('⚠️ 缓存保存失败:', error);
  }
}

// ============================================
// API 调用
// ============================================

/**
 * 从后端 API 拉取产品数据（带重试机制）
 */
async function fetchProductsFromAPI(retryCount = 0) {
  try {
    console.log(`🔄 从后端 API 拉取产品数据... (尝试 ${retryCount + 1}/${CREEM_SYNC_CONFIG.maxRetries})`);
    
    const response = await fetch(CREEM_SYNC_CONFIG.apiEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // 防止浏览器缓存
      cache: 'no-cache'
    });

    if (!response.ok) {
      throw new Error(`API 返回 ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('API 返回数据格式错误');
    }

    console.log(`✅ 成功拉取 ${result.data.length} 个产品`);
    return result.data;

  } catch (error) {
    console.error(`❌ 第 ${retryCount + 1} 次尝试失败:`, error.message);

    // 如果还有重试次数，等待后重试
    if (retryCount < CREEM_SYNC_CONFIG.maxRetries - 1) {
      console.log(`⏳ ${CREEM_SYNC_CONFIG.retryDelay}ms 后重试...`);
      await new Promise(resolve => setTimeout(resolve, CREEM_SYNC_CONFIG.retryDelay));
      return fetchProductsFromAPI(retryCount + 1);
    }

    throw error;
  }
}

// ============================================
// 主同步函数
// ============================================

/**
 * 主函数：同步 Creem 产品
 */
async function syncCreemProducts() {
  console.log('🚀 开始 Creem 产品同步...');
  
  try {
    // 第一步：尝试从缓存获取
    let products = getProductsFromCache();
    
    // 第二步：如果缓存为空，从 API 拉取
    if (!products) {
      products = await fetchProductsFromAPI();
      
      // 第三步：保存到缓存
      saveProductsToCache(products);
    }

    // 第四步：更新全局变量
    if (typeof window !== 'undefined') {
      window.allProducts = products;
      console.log('✅ 全局 window.allProducts 已更新');
    }

    // 第五步：触发页面重新渲染（如果定义了）
    if (typeof renderShop === 'function') {
      renderShop();
      console.log('✅ 页面已重新渲染');
    }

    return {
      success: true,
      products,
      count: products.length,
      source: 'cache' // 或 'api'
    };

  } catch (error) {
    console.error('❌ Creem 产品同步失败:', error.message);
    
    // 降级方案：使用本地备用数据
    console.log('📌 切换到备用数据...');
    const fallbackProducts = getFallbackProducts();
    
    if (typeof window !== 'undefined') {
      window.allProducts = fallbackProducts;
      console.log('✅ 已设置备用数据到 window.allProducts:', fallbackProducts.length, 'items');
    }

    if (typeof renderShop === 'function') {
      renderShop();
      console.log('✅ 已调用 renderShop()');
    }

    // 触发首页产品渲染
    if (typeof renderFeaturedProducts === 'function') {
      renderFeaturedProducts();
      console.log('✅ 已调用 renderFeaturedProducts()');
    }

    return {
      success: false,
      error: error.message,
      products: fallbackProducts,
      source: 'fallback'
    };
  }
}

// ============================================
// 备用数据（如果 API 全部失败）
// ============================================

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

// ============================================
// 页面加载时自动执行
// ============================================

// 确保在 DOM 完全加载后执行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', syncCreemProducts);
} else {
  // 如果脚本加载较晚，可能 DOM 已加载
  syncCreemProducts();
}

// ============================================
// 导出（用于模块化）
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    syncCreemProducts,
    getProductsFromCache,
    saveProductsToCache,
    fetchProductsFromAPI,
    CREEM_SYNC_CONFIG
  };
}
