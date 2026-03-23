/**
 * 测试 API 端点
 * 运行：node test-api.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// 模拟 Vercel Serverless 环境
const handler = require('./api/products.js');

// 创建测试服务器
const server = http.createServer((req, res) => {
  // 模拟 Vercel 请求对象
  // 在 Vercel Serverless 中，req.url 不包含 /api 前缀
  let url = req.url;
  if (url.startsWith('/api')) {
    url = url.substring(4); // 移除 /api 前缀
  }
  
  const vercelReq = {
    method: req.method,
    url: url,
    headers: req.headers
  };

  // 模拟 Vercel 响应对象
  const vercelRes = {
    status: (code) => {
      res.statusCode = code;
      return vercelRes;
    },
    json: (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data, null, 2));
    },
    end: (data) => {
      res.end(data);
    },
    setHeader: (key, value) => {
      res.setHeader(key, value);
    }
  };

  // 调用 handler
  handler(vercelReq, vercelRes);
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`测试服务器运行在 http://localhost:${PORT}`);
  console.log(`测试 API 端点: http://localhost:${PORT}/api/products`);
  console.log(`按 Ctrl+C 停止服务器`);
});
