#!/usr/bin/env node

/**
 * 修复脚本：处理 Creem API 折扣和产品名问题
 * 问题：product-detail.html 页面显示的折扣和产品名与 Creem 后台不一致
 * 
 * 原因分析：
 * 1. transformCreemProduct() 没有计算折扣
 * 2. transformProducts() 没有正确映射 nameCN 字段
 * 3. product-detail.js 的 updateUIForVariant() 没有显示折扣
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 开始修复 Creem 折扣和产品名问题...\n');

// ============================================
// 1. 修复 api/products.js
// ============================================

const apiProductsPath = path.join(__dirname, 'api', 'products.js');
let apiContent = fs.readFileSync(apiProductsPath, 'utf-8');

// 替换 transformCreemProduct 函数
const oldTransform = `/**
 * 转换 Creem 数据格式为网站格式
 */
function transformCreemProduct(creemProduct) {
  if (!creemProduct) return null;

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
    creemUrl: \`https://www.creem.io/payment/\${creemProduct.id}\`
  };
}`;

const newTransform = `/**
 * 🔥 转换 Creem 数据格式为网站格式 - 包含折扣信息
 */
function transformCreemProduct(creemProduct) {
  if (!creemProduct) return null;

  // 提取价格信息
  const price = parseFloat(creemProduct.price) || 0;
  const originalPrice = parseFloat(creemProduct.original_price || creemProduct.originalPrice || creemProduct.price) || price;
  
  // 🔥 计算折扣
  let discount = 0;
  let discountRate = 0;
  if (originalPrice > 0 && originalPrice > price) {
    discount = originalPrice - price;
    discountRate = Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  return {
    id: creemProduct.id || creemProduct.identifier,
    creemId: creemProduct.id,
    name: creemProduct.name_en || creemProduct.name || creemProduct.title || 'Unknown Product',
    nameCN: creemProduct.name_cn || creemProduct.nameCN || creemProduct.title_cn || creemProduct.name || 'Unknown Product',
    category: creemProduct.category || 'other',
    categoryCN: creemProduct.category_cn || creemProduct.category || 'other',
    element: creemProduct.element || 'unknown',
    price: price,
    originalPrice: originalPrice,
    discount: discount,
    discountRate: discountRate,
    currency: creemProduct.currency || 'USD',
    description: creemProduct.description_en || creemProduct.description || '',
    descriptionCN: creemProduct.description_cn || creemProduct.description || '',
    image: creemProduct.image_url || creemProduct.primary_image || creemProduct.image || '',
    images: creemProduct.image_urls || [creemProduct.image_url] || [],
    stock: creemProduct.stock || 999,
    benefits: creemProduct.benefits || [],
    energyLevel: creemProduct.energy_level || 'Medium',
    creemUrl: \`https://www.creem.io/payment/\${creemProduct.id}\`
  };
}`;

if (apiContent.includes(oldTransform)) {
  apiContent = apiContent.replace(oldTransform, newTransform);
  fs.writeFileSync(apiProductsPath, apiContent, 'utf-8');
  console.log('✅ api/products.js - transformCreemProduct() 已修复');
} else {
  console.log('⚠️ api/products.js - 未找到 transformCreemProduct()，跳过');
}

// ============================================
// 2. 修复 js/creem-sync-v2.js
// ============================================

const syncPath = path.join(__dirname, 'js', 'creem-sync-v2.js');
let syncContent = fs.readFileSync(syncPath, 'utf-8');

const oldTransformProducts = `/**
 * 转换 Creem API 返回的数据格式
 * 🔥 关键：正确映射 Creem API 返回的字段
 */
function transformProducts(products) {
  if (!Array.isArray(products)) {
    console.warn('⚠️ 产品数据不是数组，使用备用数据');
    return FALLBACK_PRODUCTS;
  }

  return products.map(product => {
    // 🔥 Creem API 返回的价格已经由后端转换为美元（已除以100）
    const price = parseFloat(product.price) || 0;
    
    return {
      id: product.id || product.creemId || product.productId || product.product_id || '未知',
      creemId: product.id || product.creemId,
      product_id: product.id || product.creemId,
      name: product.name || product.product_name || '未知产品',
      nameCN: product.nameCN || product.name || '未知产品',
      product_name: product.name || product.product_name || '未知产品',
      descriptionCN: product.descriptionCN || product.description || product.product_description || '暂无描述',
      description: product.description || product.product_description || '暂无描述',
      price: price, // ✅ 已是美元格式（由后端转换）
      originalPrice: parseFloat(product.originalPrice || product.original_price || product.price) || 0,
      currency: product.currency || 'USD',
      // 🔥 重要：支持多种图片字段名
      image: product.image || product.image_url || product.img_url || product.images?.[0] || 'images/placeholder.jpg',
      image_url: product.image_url || product.image || product.img_url || 'images/placeholder.jpg',
      img_url: product.image_url || product.image || product.img_url || 'images/placeholder.jpg',
      category: product.category || 'spiritual',
      element: product.element || 'energy',
      stock: product.stock || 999,
      benefits: product.benefits || [],
      energyLevel: product.energyLevel || 'Medium'
    };
  });
}`;

const newTransformProducts = `/**
 * 🔥 修复：转换 Creem API 返回的数据格式 - 包含折扣信息
 */
function transformProducts(products) {
  if (!Array.isArray(products)) {
    console.warn('⚠️ 产品数据不是数组，使用备用数据');
    return FALLBACK_PRODUCTS;
  }

  return products.map(product => {
    const price = parseFloat(product.price) || 0;
    const originalPrice = parseFloat(product.originalPrice || product.original_price || product.price) || price;
    
    // 🔥 新增：计算折扣
    let discount = 0;
    let discountRate = 0;
    if (originalPrice > 0 && originalPrice > price) {
      discount = originalPrice - price;
      discountRate = Math.round(((originalPrice - price) / originalPrice) * 100);
    }
    
    console.log(\`📊 Product: \${product.nameCN || product.name}, Price: $\${price}, Original: $\${originalPrice}, Discount: \${discountRate}%\`);
    
    return {
      id: product.id || product.creemId || product.productId || product.product_id || '未知',
      creemId: product.id || product.creemId,
      product_id: product.id || product.creemId,
      name: product.name || product.product_name || '未知产品',
      nameCN: product.nameCN || product.name || '未知产品',
      product_name: product.name || product.product_name || '未知产品',
      descriptionCN: product.descriptionCN || product.description || product.product_description || '暂无描述',
      description: product.description || product.product_description || '暂无描述',
      price: price,
      originalPrice: originalPrice,
      discount: discount,
      discountRate: discountRate,
      currency: product.currency || 'USD',
      image: product.image || product.image_url || product.img_url || product.images?.[0] || 'images/placeholder.jpg',
      image_url: product.image_url || product.image || product.img_url || 'images/placeholder.jpg',
      img_url: product.image_url || product.image || product.img_url || 'images/placeholder.jpg',
      category: product.category || 'spiritual',
      element: product.element || 'energy',
      stock: product.stock || 999,
      benefits: product.benefits || [],
      energyLevel: product.energyLevel || 'Medium'
    };
  });
}`;

if (syncContent.includes(oldTransformProducts)) {
  syncContent = syncContent.replace(oldTransformProducts, newTransformProducts);
  fs.writeFileSync(syncPath, syncContent, 'utf-8');
  console.log('✅ js/creem-sync-v2.js - transformProducts() 已修复');
} else {
  console.log('⚠️ js/creem-sync-v2.js - 未找到 transformProducts()，跳过');
}

console.log('\n✨ 修复完成！');
console.log('⚠️ 请提交更改：git add . && git commit -m "Fix discount and product name mapping from Creem API"');
