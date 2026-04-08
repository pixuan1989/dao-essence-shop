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

// 🔥 调试模式：强制清除缓存以获取最新数据
localStorage.removeItem(CACHE_CONFIG.key);
console.log('🧹 调试模式：已清除产品缓存，将从API重新加载');

/**
 * 备用数据（API 失败时使用）
 * 注意：这里的价格是美元单位，与 Creem 后台设置保持一致
 */
const FALLBACK_PRODUCTS = [
  {
    id: 'prod_28PqAKMEom5WGRH1w9O35n',
    name: 'Bazi Life Guidance',
    nameCN: '八字人生指南',
    price: 69.00,
    currency: 'USD',
    description: 'Comprehensive BaZi (八字) life analysis based on your birth date and time.',
    descriptionCN: '根据您的出生日期和时间进行全面的八字（四柱命理）人生分析。',
    image: 'images/bazi-guide.jpg',
    category: 'bazi-analysis'
  },
  {
    id: 'prod_45v7a05ZjqA9a1LVq0o0g3',
    name: 'Taoist Music',
    nameCN: '道家音乐',
    price: 1.00,
    currency: 'USD',
    description: 'Traditional Taoist meditation music for spiritual healing and inner peace.',
    descriptionCN: '传统道家冥想音乐，用于精神疗愈和内心平静。',
    image: 'images/taoist-music.jpg',
    category: 'dao-meditation'
  },
  {
    id: 'prod_26987QrSoIC3ui76ill96H',
    name: 'Tao Te Ching',
    nameCN: '道德经',
    price: 1.99,
    currency: 'USD',
    description: 'Ancient Chinese philosophical text by Lao Tzu. Digital edition with annotations.',
    descriptionCN: '老子创作的中国古代哲学经典。带注释的数字版。',
    image: 'images/tao-te-ching.jpg',
    category: 'dao-readings'
  },
  {
    id: 'prod_3btZfL4MwsO2xSr7AB3J8S',
    name: 'Lord of Mysteries',
    nameCN: '诡秘之主',
    price: 1.99,
    currency: 'USD',
    description: 'Best-selling Chinese cultivation novel. EPUB format with high-quality translation.',
    descriptionCN: '畅销中国修仙小说。高质量翻译的 EPUB 格式。',
    image: 'images/lord-of-mysteries.jpg',
    category: 'cultivation-novels'
  },
  {
    id: 'prod_7i2asEAuHFHl5hJMeCEsfB',
    name: 'Agarwood Energy Cleansing Audio Set',
    nameCN: '沉香能量净化音频套装',
    price: 99.99,
    currency: 'USD',
    description: 'Premium agarwood-based meditation audio for energy cleansing and spiritual healing.',
    descriptionCN: '优质沉香冥想音频，用于能量净化和精神疗愈。',
    image: 'images/agarwood.jpg',
    category: 'dao-meditation'
  },
  {
    id: 'prod_1YuuAVysoYK6AOmQVab2uR',
    name: 'Five Elements Energy Digital Set',
    nameCN: '五行能量数字套装',
    price: 68.00,
    currency: 'USD',
    description: 'Five Elements digital energy guidance program with personalized audio guide and daily practice routines.',
    descriptionCN: '五行能量数字指导计划，包含个性化音频指导和日常练习。',
    image: 'images/fiveelements.jpg',
    category: 'dao-meditation'
  }
];

/**
 * 产品ID到分类的映射表
 * 用于覆盖Creem API返回的分类
 */
const PRODUCT_CATEGORY_MAP = {
  // 八字分析类
  'prod_28PqAKMEom5WGRH1w9O35n': 'bazi-analysis',       // 八字人生指南
  // 道家冥想类
  'prod_45v7a05ZjqA9a1LVq0o0g3': 'dao-meditation',      // 道家音乐
  'prod_7i2asEAuHFHl5hJMeCEsfB': 'dao-meditation',      // 沉香能量净化音频套装
  'prod_1YuuAVysoYK6AOmQVab2uR': 'dao-meditation',      // 五行能量数字套装
  'prod_xxx_taisui': 'dao-meditation',                  // 生肖太岁音频（待配置）
  'prod_xxx_obsidian': 'dao-meditation',                // 黑曜石冥想（待配置）
  // 中国修仙小说类
  'prod_3btZfL4MwsO2xSr7AB3J8S': 'cultivation-novels',  // 诡秘之主
  // 道家读物类（道德经等）
  'prod_26987QrSoIC3ui76ill96H': 'dao-readings'         // 道德经
};

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

  return products.map(product => {
    const productId = product.id || product.productId;
    // 使用映射表覆盖分类，如果没有映射则使用API返回的分类或默认'other'
    const mappedCategory = PRODUCT_CATEGORY_MAP[productId] || product.category || 'other';

    // 调试日志：显示产品ID和映射的分类
    console.log(`🔄 产品映射: ${productId} -> ${mappedCategory} (原始分类: ${product.category || 'none'})`);

    // 价格转换逻辑：如果价格大于 100，说明 API 返回的是分，需要除以 100
    // 如果价格在合理美元范围内（如 0.99 - 999），则不需要除以 100
    const rawPrice = product.price || product.priceAmount || 0;
    const isCents = rawPrice > 100; // 判断是否为分
    const price = isCents ? rawPrice / 100 : rawPrice;

    console.log(`💰 价格转换: ${productId} - 原始值: ${rawPrice} -> 最终价格: $${price.toFixed(2)} (${isCents ? '分转美元' : '已经是美元'})`);

    return {
      id: productId,
      name: product.name || product.title || '未知产品',
      nameCN: product.name || product.title || '未知产品',
      price: price,
      originalPrice: price,
      currency: product.currency || 'USD',
      description: product.description || '暂无描述',
      descriptionCN: product.description || '暂无描述',
      // 🔥 修复：Creem API 返回的图片字段名是 image_url，不是 image
      image: product.image_url || product.image || product.images?.[0] || '',
      image_url: product.image_url || product.image || '',
      category: mappedCategory,
      categoryCN: mappedCategory,
      element: product.element || 'unknown',
      url: product.url,
      stock: product.stock || 999
    };
  });
}

/**
 * 主同步函数
 */
async function syncCreemProducts() {
  console.log('🚀 开始 Creem 产品同步...');
  
  try {
    // 🔥 调试模式：强制重新获取数据（不走缓存）
    const forceRefresh = true; // 设为true强制刷新
    
    // 第1步：检查缓存
    let products = forceRefresh ? null : getFromCache();
    
    // 第2步：如果无缓存或强制刷新，从 API 拉取
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
