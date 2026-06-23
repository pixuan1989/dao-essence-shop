/**
 * GSC 自动提交脚本
 * 从 wallpapers.json 提取新 URL，调用 Google Search Console API 提交索引
 * 
 * 用法：node gsc-submit.cjs
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { google } = require('googleapis');

// 配置
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const WALLPAPERS_JSON = path.join(__dirname, 'wallpapers.json');
const SITE_URL = 'https://www.daoessentia.com';
const DAILY_LIMIT = 10; // 每天最多提交 10 个 URL

// 代理配置（QuickQ 端口）
const PROXY_URL = process.env.HTTPS_PROXY || 'http://127.0.0.1:7897';

// 读取 credentials
const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));

// 设置环境变量让 Node.js fetch 走代理
process.env.HTTPS_PROXY = PROXY_URL;
process.env.HTTP_PROXY = PROXY_URL;

// 创建 JWT 客户端
const auth = new google.auth.JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: ['https://www.googleapis.com/auth/webmasters']
});

// 读取 wallpapers.json
const wallpapers = JSON.parse(fs.readFileSync(WALLPAPERS_JSON, 'utf8'));

// 提取所有 URL（EN + ZH）
function extractUrls() {
  const urls = [];
  wallpapers.forEach(wp => {
    if (wp.slug) {
      urls.push(`${SITE_URL}/wallpaper/${wp.slug}`);
      urls.push(`${SITE_URL}/zh/wallpaper/${wp.slug}`);
    }
  });
  return urls;
}

// 提交 URL 到 GSC（使用 URL Inspection API）
async function submitUrl(auth, url) {
  return new Promise((resolve) => {
    const accessToken = auth.credentials.access_token;
    const postData = JSON.stringify({
      inspectionUrl: url,
      siteUrl: SITE_URL
    });
    
    const proxyAgent = new HttpsProxyAgent(PROXY_URL);
    
    const options = {
      hostname: 'searchconsole.googleapis.com',
      path: '/v1/urlInspection/index:inspect',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      },
      agent: proxyAgent
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const result = JSON.parse(data);
          const status = result.inspectionResult?.indexStatus?.coverageState || '未知';
          console.log(`✅ ${url}`);
          console.log(`   状态：${status}`);
          resolve(true);
        } else {
          console.error(`❌ ${url}`);
          console.error(`   HTTP ${res.statusCode}: ${data.substring(0, 100)}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`❌ ${url}`);
      console.error(`   错误：${error.message}`);
      resolve(false);
    });
    
    req.write(postData);
    req.end();
  });
}

// 主函数
async function main() {
  console.log('🚀 GSC 自动提交脚本启动\n');
  
  // 授权
  await auth.authorize();
  console.log('✅ Google API 授权成功\n');
  
  // 提取所有 URL
  const allUrls = extractUrls();
  console.log(`📊 总 URL 数量：${allUrls.length}\n`);
  
  // 提交前 10 个
  const urlsToSubmit = allUrls.slice(0, DAILY_LIMIT);
  console.log(` 今日提交 ${urlsToSubmit.length} 个 URL：\n`);
  
  let successCount = 0;
  for (const url of urlsToSubmit) {
    const success = await submitUrl(auth, url);
    if (success) successCount++;
    
    // 避免 API 限流，每次请求间隔 1 秒
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n🎉 提交完成！成功 ${successCount}/${urlsToSubmit.length}`);
  console.log(`\n 提示：明天再运行一次，提交下一批 URL`);
}

main().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});
