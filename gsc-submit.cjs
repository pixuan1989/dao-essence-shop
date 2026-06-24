/**
 * GSC 自动提交脚本
 * 从 wallpapers.json 提取新 URL，调用 Google Search Console API 提交索引
 * 
 * 用法：HTTPS_PROXY=http://127.0.0.1:8800 node gsc-submit.cjs
 * 
 * 注意：需要有代理运行（googleapis 内部 gaxios 读 HTTPS_PROXY 环境变量）
 *       API 调用直接走代理 keepAlive 连接，不掉连接坑
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { google } = require('googleapis');

// ─── 配置 ───
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const WALLPAPERS_JSON = path.join(__dirname, 'wallpapers.json');
const SITE_URL = 'https://www.daoessentia.com';
const GSC_SITE = process.env.GSC_SITE || 'sc-domain:daoessentia.com';
const DAILY_LIMIT = 10;
const PROXY_URL = process.env.HTTPS_PROXY || process.env.https_proxy || 'http://127.0.0.1:8800';

// ─── 代理初始化（keepAlive 复用连接，避免单次执行多请求掉链子） ───
const proxyAgent = new HttpsProxyAgent(PROXY_URL, { keepAlive: true, timeout: 30000 });

// ─── 读取凭证 ＋ 授权 ───
process.env.HTTPS_PROXY = PROXY_URL;  // 确保 googleapis/gaxios 也用代理
process.env.HTTP_PROXY = PROXY_URL;

const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
const auth = new google.auth.JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: ['https://www.googleapis.com/auth/webmasters']
});

const wallpapers = JSON.parse(fs.readFileSync(WALLPAPERS_JSON, 'utf8'));

// ─── 工具函数 ───
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

// 提交单个 URL（keepAlive 代理连接）
function submitUrl(token, url) {
  const postData = JSON.stringify({ inspectionUrl: url, siteUrl: GSC_SITE });
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'searchconsole.googleapis.com',
      path: '/v1/urlInspection/index:inspect',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Connection': 'keep-alive'
      },
      agent: proxyAgent,
      timeout: 20000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const status = JSON.parse(data).inspectionResult?.indexStatusResult?.coverageState || '未知';
          console.log(`✅ ${url}`);
          console.log(`   状态：${status}`);
          resolve(true);
        } else {
          console.error(`❌ ${url}`);
          console.error(`   HTTP ${res.statusCode}: ${data.substring(0, 120)}`);
          resolve(false);
        }
      });
    });
    req.on('error', (e) => {
      console.error(`❌ ${url}`);
      console.error(`   网络错误：${e.message}`);
      resolve(false);
    });
    req.on('timeout', () => {
      console.error(`❌ ${url}`);
      console.error(`   超时`);
      req.destroy();
      resolve(false);
    });
    req.write(postData);
    req.end();
  });
}

// ─── 主函数 ───
async function main() {
  console.log('\n🚀 GSC 自动提交脚本启动\n');
  console.log(`   代理：${PROXY_URL}`);
  console.log(`   站点：${GSC_SITE}\n`);

  // 授权（走代理）
  await auth.authorize();
  const token = auth.credentials.access_token;
  console.log('✅ Google API 授权成功\n');

  const allUrls = extractUrls();
  console.log(`📊 总 URL 数量：${allUrls.length}\n`);

  const urlsToSubmit = allUrls.slice(0, DAILY_LIMIT);
  console.log(` 今日提交 ${urlsToSubmit.length} 个 URL：\n`);

  let successCount = 0;
  for (let i = 0; i < urlsToSubmit.length; i++) {
    console.log(`  [${i + 1}/${urlsToSubmit.length}]`);
    const ok = await submitUrl(token, urlsToSubmit[i]);
    if (ok) successCount++;
    if (i < urlsToSubmit.length - 1) await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\n🎉 提交完成！成功 ${successCount}/${urlsToSubmit.length}`);
  proxyAgent.destroy();
}

main().catch(error => {
  console.error('❌ 脚本执行失败:', error?.message || error);
  if (error?.stack) console.error(error.stack?.substring(0, 500));
  process.exit(1);
});
