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

// ⚠️ 防止重复加载
if (window.__CREEM_SYNC_V2_LOADED__) {
  console.warn('⚠️ creem-sync-v2.js 已加载，跳过重复加载');
} else {
  window.__CREEM_SYNC_V2_LOADED__ = true;
  console.log('✅ Creem 实时同步脚本 v2.0 已加载');

/**
 * 缓存配置
 */
const CACHE_CONFIG = {
  key: 'creem_products_cache',
  ttl: 5 * 60 * 1000 // 5分钟缓存
};

/**
 * 不在商城显示的内部产品 ID（工具解锁类）
 * 这些产品通过特定页面直接链接到 checkout，不在 /shop 展示
 */
const HIDDEN_PRODUCT_IDS = [
  'prod_3fJInBNekM9UVJwtClgUtx',  // Almanac Full Access ($2.99)
  'prod_2wj3G9PQp6ZlbD8oFJdr2X',  // Soulmate Timing Unlock ($2.99)
];

/**
 * 产品分类映射表
 * Key: 产品 ID, Value: 商城分类
 */
const PRODUCT_CATEGORY_MAP = {
  // 八字分析类
  'prod_28PqAKMEom5WGRH1w9O35n': 'bazi-analysis',       // 八字分析报告
  // 道家冥想类（如有新增再加）
  // 中国修仙小说类
  'prod_3btZfL4MwsO2xSr7AB3J8S': 'cultivation-novels',  // 诡秘之主
  // 道家读物类（道德经等）
  'prod_26987QrSoIC3ui76ill96H': 'dao-readings',         // 道德经
  // 五行壁纸类
  'prod_2WpWgRkGnuKU9obIP5t0P1': 'five-elements-wallpaper' // 木火壁纸
};

/**
 * 备用数据（API 失败时使用）
 * 🔥 只保留实际在售的商品
 */
const FALLBACK_PRODUCTS = [
  {
    id: 'prod_28PqAKMEom5WGRH1w9O35n',
    name: 'BaZi Life Guidance',
    nameCN: '八字命理解读',
    price: 39.90,
    originalPrice: 39.90,
    discount: 0,
    discountRate: 0,
    currency: 'USD',
    description: 'Personalized BaZi (Four Pillars) analysis by Master Xuanzhen. Receive a comprehensive PDF report within 48 hours.',
    descriptionCN: '由玄真大师提供的个人八字命理解读服务，48小时内交付完整PDF报告。',
    image: 'images/bazi-service.jpg',
    category: 'bazi-analysis'
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
async function fetchFromAPI(retries = 1) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🌐 第 ${attempt}/${retries} 次尝试从 API 拉取数据...`);
      
      // 检查是否在测试模式
      const isTestMode = window.location.hostname === 'localhost' || window.location.hostname.includes('test');
      console.log(`🔧 测试模式: ${isTestMode}`);
      
      // 根据测试模式选择API端点
      const apiUrl = isTestMode ? '/api/test-products' : '/api/products';
      console.log(`🔗 使用 API 端点: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ API 调用成功，返回 ' + (data.data || []).length + ' 个产品');
      
      // 注意：API 返回的是 data.data，不是 data.products
      return data.data || [];
    } catch (error) {
      console.warn(`❌ 第 ${attempt} 次尝试失败:`, error.message);
      
      if (attempt < retries) {
        console.log(`⏳ 1秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  throw new Error('API 调用失败，已达最大重试次数');
}

/**
 * 转换 Creem API 返回的数据格式
 * 🔥 关键：正确映射 Creem API 返回的字段
 */
/**
 * 产品中文名称映射表
 * 当 Creem API 不返回 nameCN/descriptionCN 时使用
 */
const PRODUCT_ZH_MAP = {
  // 商品名映射（key 为商品 ID 或英文名的标准化形式）
  'prod_28PqAKMEom5WGRH1w9O35n': {
    nameCN: '八字命理解读',
    descriptionCN: '由玄真大师提供的個人八字命理解讀服務，48小時內交付完整PDF報告。'
  }
};

/**
 * 获取商品的中文翻译
 */
function getProductZh(productId, fieldName, fallback) {
  const mapping = PRODUCT_ZH_MAP[productId];
  if (mapping && mapping[fieldName]) {
    return mapping[fieldName];
  }
  return fallback;
}

function transformProducts(products) {
  if (!Array.isArray(products)) {
    console.warn('⚠️ 产品数据不是数组，使用备用数据');
    return FALLBACK_PRODUCTS;
  }

  return products
    // Filter out hidden products (tool unlocks that should not appear in /shop)
    .filter(function(product) {
      var pid = product.id || product.creemId || product.productId || product.product_id || '';
      if (HIDDEN_PRODUCT_IDS.indexOf(pid) > -1) {
        console.log('🚫 隐藏商品（不在商城显示）: ' + pid + ' — ' + (product.name || ''));
        return false;
      }
      return true;
    })
    .map(function(product) {
    const productId = product.id || product.creemId || product.productId || product.product_id || '未知';
    // 🔥 使用映射表覆盖分类，如果没有映射则使用API返回的分类
    const mappedCategory = PRODUCT_CATEGORY_MAP[productId] || product.category || 'spiritual';
    
    // 调试日志：显示产品ID和映射的分类
    console.log(`🔄 产品映射: ${productId} -> ${mappedCategory} (原始分类: ${product.category || 'none'})`);
    
    // 🔥 Creem API 返回的价格已经由后端转换为美元（已除以100）
    const price = parseFloat(product.price) || 0;
    
    return {
      id: productId,
      creemId: product.id || product.creemId,
      product_id: product.id || product.creemId,
      name: product.name || product.product_name || '未知产品',
      nameCN: product.nameCN || getProductZh(productId, 'nameCN', product.name || '未知产品'),
      product_name: product.name || product.product_name || '未知产品',
      descriptionCN: product.descriptionCN || getProductZh(productId, 'descriptionCN', product.description || product.product_description || '暫無描述'),
      description: product.description || product.product_description || '暂无描述',
      price: price, // ✅ 已是美元格式（由后端转换）
      originalPrice: parseFloat(product.originalPrice || product.original_price || product.price) || 0,
      discount: Math.max(0, (parseFloat(product.originalPrice || product.original_price || product.price) || 0) - (parseFloat(product.price) || 0)),
      discountRate: (function() {
        const orig = parseFloat(product.originalPrice || product.original_price || product.price) || 0;
        const curr = parseFloat(product.price) || 0;
        return (orig > 0 && orig > curr) ? Math.round(((orig - curr) / orig) * 100) : 0;
      })(),
      currency: product.currency || 'USD',
      // Creem API 只支持单图字段 image_url（官方文档确认）
      image: product.image_url || product.image || 'images/placeholder.jpg',
      image_url: product.image_url || product.image || 'images/placeholder.jpg',
      img_url: product.image_url || product.image || 'images/placeholder.jpg',
      category: mappedCategory,
      element: product.element || 'energy',
      stock: product.stock || 999,
      benefits: product.benefits || [],
      energyLevel: product.energyLevel || 'Medium'
    };
  });
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
    
    // 第5步：注册产品到购物车系统
    if (typeof window.registerCreemProducts === 'function') {
      window.registerCreemProducts(products);
      console.log('🛒 产品已注册到购物车系统');
    }
    
    console.log('✨ Creem 产品同步完成！');
    return products;
    
  } catch (error) {
    console.error('❌ 产品同步失败:', error.message);
    console.log('📋 使用备用数据...');
    
    // 使用备用数据
    window.allProducts = FALLBACK_PRODUCTS;
    window.__CREEM_PRODUCTS_READY__ = true; // 标记完成（即使是降级数据）
    
    // 注册备用产品到购物车系统
    if (typeof window.registerCreemProducts === 'function') {
      window.registerCreemProducts(FALLBACK_PRODUCTS);
      console.log('🛒 备用产品已注册到购物车系统');
    }
    
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

} // 关闭重复加载守卫的 if 块
