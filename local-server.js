﻿#!/usr/bin/env node

/**
 * ========================================
 * 本地测试服务器 - Creem API 后端代理
 * ========================================
 * 
 * 用途：在本地开发环境中测试后端代理功能
 * 
 * 用法：
 *   node local-server.js
 * 
 * 访问：
 *   http://localhost:8000/api/products
 */

import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';
import https from 'https';

// ============================================
// Creem API 配置
// ============================================

const CREEM_CONFIG = {
  apiBase: 'https://api.creem.io/v1',
  apiKey: 'creem_1qa0zx2EuHN9gz9DLcGTAG',
  productIds: {
    agarwood: 'prod_7i2asEAuHFHl5hJMeCEsfB',
    bracelet: 'prod_1YuuAVysoYK6AOmQVab2uR'
  }
};

// ============================================
// 工具函数
// ============================================

/**
 * 从 Creem API 获取单个产品
 */
async function fetchCreemProduct(productId) {
  const url = `${CREEM_CONFIG.apiBase}/products/${productId}`;
  
  console.log(`📥 调用 Creem API: ${url}`);
  console.log(`🔑 API Key: ${CREEM_CONFIG.apiKey.substring(0, 10)}...`);
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.creem.io',
      path: `/v1/products/${productId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CREEM_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    console.log('📋 请求选项:', {
      hostname: options.hostname,
      path: options.path,
      method: options.method,
      headers: {
        'Authorization': `Bearer ${CREEM_CONFIG.apiKey.substring(0, 10)}...`,
        'Content-Type': options.headers['Content-Type']
      }
    });

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`📡 API 响应状态码: ${res.statusCode}`);
        console.log(`📡 API 响应头:`, res.headers);
        console.log(`📡 API 响应体:`, data);
        
        if (res.statusCode === 200) {
          try {
            const parsedData = JSON.parse(data);
            console.log(`✅ 成功解析响应数据:`, parsedData);
            resolve(parsedData);
          } catch (e) {
            console.error(`❌ JSON 解析失败:`, e.message);
            reject(new Error('JSON 解析失败'));
          }
        } else {
          reject(new Error(`API 返回 ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ API 请求失败:`, error.message);
      reject(error);
    });

    req.end();
  });
}

/**
 * 转换数据格式
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
    originalPrice: parseFloat(creemProduct.original_price || creemProduct.price) || 0,
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
 * 提供静态文件
 */
function serveFile(res, filePath) {
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code == 'ENOENT') {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, error: 'File not found' }));
      } else {
        res.writeHead(500);
        res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
}

/**
 * 备用数据
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
      "originalPrice": 250.00,
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
      "originalPrice": 200.00,
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
// 缓存
// ============================================

let productCache = {
  data: null,
  timestamp: 0
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 分钟

// ============================================
// 请求处理
// ============================================

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS 响应头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // 处理 CORS 预检
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 路由：获取所有产品
  if (pathname === '/api/products' && req.method === 'GET') {
    try {
      const now = Date.now();
      let products;

      // 检查缓存
      if (productCache.data && (now - productCache.timestamp) < CACHE_DURATION) {
        console.log('📦 使用缓存数据');
        products = productCache.data;
      } else {
        console.log('🔄 从 Creem API 拉取新数据...');
        products = [];

        for (const [key, productId] of Object.entries(CREEM_CONFIG.productIds)) {
          try {
            const creemProduct = await fetchCreemProduct(productId);
            const transformed = transformCreemProduct(creemProduct);
            if (transformed) {
              products.push(transformed);
              console.log(`✅ 拉取成功: ${transformed.nameCN} ($${transformed.price})`);
            }
          } catch (error) {
            console.warn(`⚠️ 拉取 ${productId} 失败: ${error.message}`);
          }
        }

        // 如果全部失败，使用备用数据
        if (products.length === 0) {
          console.warn('⚠️ 全部拉取失败，使用备用数据');
          products = getFallbackProducts();
        }

        // 更新缓存
        productCache.data = products;
        productCache.timestamp = now;
      }

      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: products,
        count: products.length,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('❌ 错误:', error.message);
      res.writeHead(500);
      res.end(JSON.stringify({
        success: false,
        error: error.message,
        data: getFallbackProducts()
      }));
    }
    return;
  }

  // 路由：获取单个产品
  if (pathname.startsWith('/api/products/') && req.method === 'GET') {
    const productId = pathname.split('/').pop();
    try {
      const creemProduct = await fetchCreemProduct(productId);
      if (!creemProduct) {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, error: '产品不存在' }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: transformCreemProduct(creemProduct)
      }));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({
        success: false,
        error: error.message
      }));
    }
    return;
  }

  // 静态文件服务
  // 处理根路径
  if (pathname === '/' || pathname === '') {
    serveFile(res, './index.html');
    return;
  }

  // 处理其他静态文件
  const filePath = '.' + pathname;
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code == 'ENOENT') {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, error: 'File not found' }));
      } else {
        res.writeHead(500);
        res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// ============================================
// 启动服务器
// ============================================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log('');
  console.log('╔═════════════════════════════════════╗');
  console.log('║  🚀 Creem API 本地代理服务器        ║');
  console.log('╚═════════════════════════════════════╝');
  console.log('');
  console.log(`📍 服务器地址: http://localhost:${PORT}`);
  console.log('');
  console.log('📌 可用端点:');
  console.log(`   GET  /api/products         → 获取所有产品`);
  console.log(`   GET  /api/products/{id}    → 获取单个产品`);
  console.log('');
  console.log('🧪 测试命令:');
  console.log(`   curl http://localhost:${PORT}/api/products`);
  console.log('');
  console.log('💾 缓存时间: 5 分钟');
  console.log('🔑 API Key: creem_1qa0zx2EuHN9gz9DLcGTAG');
  console.log('');
  console.log('⏹️  按 Ctrl+C 停止服务器');
  console.log('');
});

process.on('SIGINT', () => {
  console.log('\n\n👋 服务器已关闭');
  process.exit(0);
});
