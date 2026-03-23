/**
 * Creem API 客户端
 * 用于从 Creem.io 拉取商品数据
 */

const CREEM_API_KEY = 'creem_1qa0zx2EuHN9gz9DLcGTAG';
const CREEM_API_BASE = 'https://api.creem.io/v1';

// 两个 Creem 产品 ID
const CREEM_PRODUCT_IDS = {
  agarwood: 'prod_7i2asEAuHFHl5hJMeCEsfB',
  bracelet: 'prod_1YuuAVysoYK6AOmQVab2uR'
};

/**
 * 从 Creem API 获取产品数据
 * @param {string} productId - Creem 产品 ID
 * @returns {Promise<Object>} 产品数据
 */
async function getCreemProduct(productId) {
  try {
    const response = await fetch(`${CREEM_API_BASE}/products/${productId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CREEM_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Creem API error: ${response.status} ${response.statusText}`);
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
 * 获取所有 Creem 产品
 * @returns {Promise<Object>} 所有产品数据
 */
async function getAllCreemProducts() {
  const products = {};

  for (const [key, id] of Object.entries(CREEM_PRODUCT_IDS)) {
    const product = await getCreemProduct(id);
    if (product) {
      products[id] = product;
    }
  }

  return products;
}

/**
 * 将 Creem 产品数据转换为网站格式
 * @param {Object} creemProduct - Creem 产品对象
 * @returns {Object} 转换后的产品对象
 */
function transformCreemProduct(creemProduct) {
  return {
    id: creemProduct.id,
    creemId: creemProduct.id,
    title: creemProduct.name,
    titleZh: creemProduct.name_zh || creemProduct.name,
    handle: creemProduct.id,
    description: creemProduct.description,
    descriptionZh: creemProduct.description_zh || creemProduct.description,
    vendor: 'DAO Essence',
    type: creemProduct.type || 'Product',
    tags: creemProduct.tags || [],
    price: creemProduct.price / 100, // Creem 以分为单位
    compareAtPrice: creemProduct.original_price ? creemProduct.original_price / 100 : null,
    currency: creemProduct.currency || 'USD',
    images: (creemProduct.images || []).map((img, index) => ({
      id: index + 1,
      src: img.url,
      alt: img.alt || creemProduct.name,
      width: 1200,
      height: 1200,
      position: index + 1
    })),
    variants: [{
      id: creemProduct.id + '-1',
      title: '一次性购买',
      price: creemProduct.price / 100,
      compareAtPrice: creemProduct.original_price ? creemProduct.original_price / 100 : null,
      available: creemProduct.available !== false,
      inventoryQuantity: creemProduct.inventory || 999,
      options: {},
      specs: {}
    }],
    metafields: {
      energy: {
        five_element: creemProduct.five_element || '未指定',
        type: creemProduct.energy_type || '能量产品',
        intensity: creemProduct.intensity || '中',
        direction: creemProduct.direction || '全方位',
        benefits: creemProduct.benefits || [],
        suitable_for: creemProduct.suitable_for || []
      }
    },
    creemUrl: `https://www.creem.io/payment/${creemProduct.id}`
  };
}

/**
 * 同步 Creem 产品到本地
 * 生成可直接替换到 shop-manager.js 和 product-detail.js 的代码
 */
async function syncCreemProducts() {
  console.log('🔄 开始同步 Creem 产品...');

  const products = await getAllCreemProducts();
  
  if (Object.keys(products).length === 0) {
    console.error('❌ 无法从 Creem 获取任何产品');
    return null;
  }

  const transformed = {};
  for (const [id, product] of Object.entries(products)) {
    transformed[id] = transformCreemProduct(product);
  }

  console.log('✅ 产品转换完成:', transformed);

  return transformed;
}

// 如果在 Node.js 环境中运行，导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getCreemProduct,
    getAllCreemProducts,
    transformCreemProduct,
    syncCreemProducts,
    CREEM_API_KEY,
    CREEM_PRODUCT_IDS
  };
}
