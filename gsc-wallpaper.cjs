/**
 * GSC 壁纸提交追踪脚本
 * 
 * 功能：
 *   1. 每天自动提交 10 个未检查过的壁纸 URL 给 Google（inspect 触发抓取）
 *   2. 每天复查 10 个已提交但尚未收录的 URL
 *   3. 状态持久化到 .gsc-wallpaper-state.json，永不重复提交
 *   4. 输出每日报告
 * 
 * 用法：node gsc-wallpaper.cjs
 * 环境变量：HTTPS_PROXY=http://127.0.0.1:8800（默认 8800）
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { HttpsProxyAgent } = require('https-proxy-agent');

// ─── 配置 ───
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const WALLPAPERS_JSON = path.join(__dirname, 'wallpapers.json');
const STATE_FILE = path.join(__dirname, '.gsc-wallpaper-state.json');
const SITE_URL = 'https://www.daoessentia.com';
const GSC_SITE = process.env.GSC_SITE || 'sc-domain:daoessentia.com';
const PROXY_URL = process.env.HTTPS_PROXY || process.env.https_proxy || 'http://127.0.0.1:8800';
const BATCH_SIZE = 25;  // 每天提交 25 个新 URL
const RETRY_BATCH = 25; // 每天复查 25 个之前的未收录

// ─── 代理（keepAlive） ───
const proxyAgent = new HttpsProxyAgent(PROXY_URL, { keepAlive: true, timeout: 30000 });
process.env.HTTPS_PROXY = PROXY_URL;
process.env.HTTP_PROXY = PROXY_URL;

// ─── 凭证 ───
const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));

// ─── 状态管理 ───
function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  }
  return {
    submitted: [],    // { url, submittedAt, coverageState, lastCheckedAt }
    indexed: [],      // { url, indexedAt } — 已确认收录的，不再检查
    lastRun: null
  };
}

function saveState(state) {
  state.lastRun = new Date().toISOString();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ─── 获取 access_token（每次执行一次性授权） ───
let _tokenCache = null;
async function getToken() {
  if (_tokenCache) return _tokenCache;
  const { google } = require('googleapis');
  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/webmasters']
  });
  await auth.authorize();
  _tokenCache = auth.credentials.access_token;
  return _tokenCache;
}

// ─── GSC URL Inspection API ───
function inspectUrl(token, url) {
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
          try {
            const result = JSON.parse(data);
            const coverage = result.inspectionResult?.indexStatusResult?.coverageState || '未知';
            const verdict = result.inspectionResult?.indexStatusResult?.verdict;
            resolve({ ok: true, coverage, verdict, data: result.inspectionResult });
          } catch (e) {
            resolve({ ok: true, coverage: '解析失败', verdict: null });
          }
        } else {
          resolve({ ok: false, coverage: `HTTP ${res.statusCode}` });
        }
      });
    });
    req.on('error', (e) => resolve({ ok: false, coverage: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, coverage: 'timeout' }); });
    req.write(postData);
    req.end();
  });
}

// ─── 从 wallpapers.json 提取所有 URL ───
function getAllWallpaperUrls() {
  const wallpapers = JSON.parse(fs.readFileSync(WALLPAPERS_JSON, 'utf8'));
  const urls = [];
  wallpapers.forEach(wp => {
    if (wp.slug) {
      urls.push(`${SITE_URL}/wallpaper/${wp.slug}`);
      urls.push(`${SITE_URL}/zh/wallpaper/${wp.slug}`);
    }
  });
  return urls;
}

// ─── 主流程 ───
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('  🏔  GSC 壁纸提交追踪器');
  console.log('='.repeat(60) + '\n');
  console.log(`  代理：${PROXY_URL}`);
  console.log(`  站点：${GSC_SITE}\n`);

  // 1. 授权
  const token = await getToken();
  console.log('✅ 授权成功\n');

  // 1b. 重新提交 sitemap，告诉 Google sitemap 有更新
  //    （上次提交是6月6日，不重新提交 Google 不会重新抓取）
  try {
    const { google } = require('googleapis');
    const auth2 = new google.auth.JWT({
      email: credentials.client_email, key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/webmasters']
    });
    const wm = google.webmasters({ version: 'v3', auth: auth2 });
    await wm.sitemaps.submit({
      siteUrl: GSC_SITE,
      feedpath: 'https://www.daoessentia.com/sitemap.xml'
    });
    console.log('📄 sitemap 已重新提交 → Google 将重新抓取\n');
  } catch (e) {
    console.log(`⚠️  sitemap 提交失败：${e.message?.substring(0, 80)}\n`);
  }

  // 2. 加载状态
  const state = loadState();
  const allUrls = getAllWallpaperUrls();
  console.log(`📊 壁纸 URL 总数：${allUrls.length}`);
  console.log(`📋 已提交检查：${state.submitted.length}`);
  console.log(`✅ 已确认收录：${state.indexed.length}`);
  console.log(`🆕 待检查：${allUrls.length - state.submitted.length}\n`);

  // 已收录 URL 的 set（用于快速判断）
  const indexedSet = new Set(state.indexed.map(i => i.url));
  const submittedSet = new Set(state.submitted.map(s => s.url));

  // 3. 找出还没检查过的 URL
  const pendingUrls = allUrls.filter(url => !submittedSet.has(url) && !indexedSet.has(url));

  // 4. 找出已检查但未收录的（用于复查）
  const unindexed = state.submitted.filter(s => {
    const cov = s.coverageState;
    // "Submitted and indexed" 或含 "indexed" = 已收录，跳过
    if (cov && (cov.includes('indexed') || cov.includes('Submitted'))) return false;
    return true;
  });

  console.log(`🔍 待首次检查：${pendingUrls.length}`);
  console.log(`🔄 待复查（之前未收录）：${unindexed.length}\n`);

  // ─── 阶段 1：提交新 URL ───
  const newBatch = pendingUrls.slice(0, BATCH_SIZE);
  let newSubmitted = 0;

  if (newBatch.length > 0) {
    console.log(`📤 [提交] 检查 ${newBatch.length} 个新 URL：`);
    for (let i = 0; i < newBatch.length; i++) {
      const url = newBatch[i];
      const label = url.split('/').pop().substring(0, 35);
      process.stdout.write(`  [${i + 1}/${newBatch.length}] ${label}... `);
      
      const result = await inspectUrl(token, url);
      const isIndexed = result.coverage && (result.coverage.includes('indexed') || result.coverage.includes('Submitted'));
      
      if (isIndexed) {
        console.log(`✅ 已收录`);
        state.indexed.push({ url, indexedAt: new Date().toISOString() });
      } else {
        console.log(`📝 ${result.coverage}`);
        state.submitted.push({
          url,
          submittedAt: new Date().toISOString(),
          coverageState: result.coverage,
          lastCheckedAt: new Date().toISOString()
        });
      }
      newSubmitted++;

      // 防限流
      if (i < newBatch.length - 1) await new Promise(r => setTimeout(r, 1500));
    }
    saveState(state);
    console.log();
  } else {
    console.log('✅ 所有 URL 都检查过了！\n');
  }

  // ─── 阶段 2：复查未收录的 ───
  const retryBatch = unindexed.slice(0, RETRY_BATCH);
  let newlyIndexed = 0;

  if (retryBatch.length > 0) {
    console.log(`🔄 [复查] 检查 ${retryBatch.length} 个之前未收录的 URL：`);
    for (let i = 0; i < retryBatch.length; i++) {
      const entry = retryBatch[i];
      const label = entry.url.split('/').pop().substring(0, 35);
      process.stdout.write(`  [${i + 1}/${retryBatch.length}] ${label}... `);
      
      const result = await inspectUrl(token, entry.url);
      const isNowIndexed = result.coverage && (result.coverage.includes('indexed') || result.coverage.includes('Submitted'));
      
      if (isNowIndexed) {
        console.log(`✅ 变为已收录！`);
        // 从 submitted 移到 indexed
        const idx = state.submitted.findIndex(s => s.url === entry.url);
        if (idx >= 0) state.submitted.splice(idx, 1);
        state.indexed.push({ url: entry.url, indexedAt: new Date().toISOString() });
        newlyIndexed++;
      } else {
        console.log(`📝 ${result.coverage}`);
        // 更新时间戳
        const idx = state.submitted.findIndex(s => s.url === entry.url);
        if (idx >= 0) state.submitted[idx].lastCheckedAt = new Date().toISOString();
      }

      if (i < retryBatch.length - 1) await new Promise(r => setTimeout(r, 1500));
    }
    saveState(state);
    console.log();
  } else {
    console.log('✅ 没有需要复查的 URL\n');
  }

  // ─── 报告 ───
  console.log('='.repeat(60));
  console.log('  📋 每日报告');
  console.log('='.repeat(60) + '\n');
  console.log(`  新提交：${newSubmitted} 个 URL`);
  console.log(`  新收录：${newlyIndexed} 个 URL`);
  console.log(`  累计提交：${state.submitted.length} 个`);
  console.log(`  累计收录：${state.indexed.length} 个`);
  console.log(`  覆盖率：${allUrls.length > 0 ? (state.indexed.length / allUrls.length * 100).toFixed(1) : 0}%`);
  console.log(`  剩余待收录：${allUrls.length - state.indexed.length} 个\n`);

  if (newlyIndexed > 0) {
    console.log('  🎉 新收录的 URL：');
    state.indexed.slice(-newlyIndexed).forEach(item => {
      console.log(`    ✅ ${item.url}`);
    });
    console.log();
  }

  proxyAgent.destroy();
  console.log('✅ 完成\n');
}

main().catch(error => {
  console.error('\n❌ 脚本执行失败:', error?.message || error);
  if (error?.stack) console.error(error.stack?.substring(0, 300));
  proxyAgent?.destroy();
  process.exit(1);
});
