// 直接测试 api/products.js 中的 handler

// 首先设置环境变量
process.env.CREEM_API_KEY = 'creem_1qa0zx2EuHN9gz9DLcGTAG';

// 模拟 fetch（Node.js 18+ 有原生 fetch）
if (!globalThis.fetch) {
  const fetch = require('node-fetch');
  globalThis.fetch = fetch;
}

// 导入 handler
const handler = require('./api/products.js');

// 创建模拟的 req 和 res
const mockReq = {
  method: 'GET',
  url: '/products',  // ⚠️ Vercel Serverless 会自动去掉 /api 前缀
  headers: {},
  query: {}
};

const mockRes = {
  statusCode: 200,
  headers: {},
  body: '',
  
  status(code) {
    this.statusCode = code;
    return this;
  },
  
  json(data) {
    this.body = JSON.stringify(data, null, 2);
    console.log('\n✅ API 响应:');
    console.log(`状态码: ${this.statusCode}`);
    console.log('响应数据:');
    console.log(this.body);
    return this;
  },
  
  setHeader(key, value) {
    this.headers[key] = value;
    return this;
  },
  
  send(data) {
    this.body = data;
    console.log('\n✅ API 响应:');
    console.log(`状态码: ${this.statusCode}`);
    console.log('响应数据:');
    console.log(data);
    return this;
  }
};

// 调用 handler
console.log('🚀 开始测试 handler...\n');

handler(mockReq, mockRes)
  .then(() => {
    console.log('\n✨ 测试完成！');
  })
  .catch(error => {
    console.error('\n❌ 测试出错:');
    console.error(error);
  });
