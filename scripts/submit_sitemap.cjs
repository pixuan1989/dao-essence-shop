// GSC sitemap 重提脚本（重建版）
// 作用：PUT /webmasters/v3/sites/{siteUrl}/sitemaps/{feedpath}，204 = 成功触发 Google 重抓
// 坑：feedpath 必须传完整 sitemap URL，传文件名会 400 invalidParameter
// 用法：HTTPS_PROXY=http://127.0.0.1:7897 node scripts/submit_sitemap.cjs
const fs = require('fs');
const path = require('path');
const https = require('https');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { google } = require('googleapis');
const ROOT = path.join(__dirname, '..');
const CREDENTIALS_PATH = path.join(ROOT, 'dist', 'credentials.json');
const GSC_SITE = process.env.GSC_SITE || 'sc-domain:daoessentia.com';
const PROXY_URL = process.env.HTTPS_PROXY || 'http://127.0.0.1:7897';
const SITEMAPS = [
  'https://www.daoessentia.com/sitemap.xml',
  'https://www.daoessentia.com/image-sitemap.xml'
];
const proxyAgent = new HttpsProxyAgent(PROXY_URL, { keepAlive: true, timeout: 30000 });
const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));

async function getToken() {
  const auth = new google.auth.JWT({
    email: creds.client_email, key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/webmasters']
  });
  await auth.authorize();
  return auth.credentials.access_token;
}

function submitSitemap(token, sitemapUrl) {
  return new Promise(resolve => {
    const p = `/webmasters/v3/sites/${encodeURIComponent(GSC_SITE)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;
    const req = https.request({
      hostname: 'www.googleapis.com',
      path: p,
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Length': 0 },
      agent: proxyAgent, timeout: 25000
    }, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => resolve({ url: sitemapUrl, status: r.statusCode, body: d.slice(0, 300) }));
    });
    req.on('error', e => resolve({ url: sitemapUrl, status: 'ERR', body: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ url: sitemapUrl, status: 'TIMEOUT', body: '' }); });
    req.end();
  });
}

(async () => {
  console.log(`[submit_sitemap] site=${GSC_SITE} proxy=${PROXY_URL}`);
  const token = await getToken();
  for (const sm of SITEMAPS) {
    const r = await submitSitemap(token, sm);
    const ok = r.status === 204 || r.status === 200;
    console.log(`${ok ? '[OK]' : '[FAIL]'} ${r.url} -> HTTP ${r.status}${r.body ? ' | ' + r.body : ''}`);
  }
  console.log('[submit_sitemap] done');
})();
