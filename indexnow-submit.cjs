/**
 * IndexNow 自动提交脚本
 * 从 wallpapers.json 提取新 URL，通过 IndexNow 协议提交到 Bing + Yandex
 * 
 * 用法：node indexnow-submit.cjs [--test]
 * 
 * IndexNow 协议支持引擎：Bing, Yandex, Naver, Seznam
 * 每日限额：10,000 条（远超需求）
 * 无需所有权验证，无需 Service Account
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// 配置
const WALLPAPERS_JSON = path.join(__dirname, 'wallpapers.json');
const STATE_FILE = path.join(__dirname, '.indexnow-state.json'); // 记录已提交的 URL
const SITE_URL = 'https://www.daoessentia.com';
const DAILY_LIMIT = 100; // IndexNow 实际限制 10,000/天

// IndexNow 提交端点（Bing 是主节点，会自动转发给其他参与引擎）
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
// 备选：Yandex（Bing 不可用时自动切换）
const BACKUP_ENDPOINTS = [
  'https://yandex.com/indexnow',
];

// 代理配置（QuickQ 端口）
const PROXY_URL = process.env.HTTPS_PROXY || process.env.https_proxy || 'http://127.0.0.1:8800';

let HttpsProxyAgent;
try {
  HttpsProxyAgent = require('https-proxy-agent').HttpsProxyAgent;
} catch (e) {
  console.log('⚠️ 未安装 https-proxy-agent，将尝试直连');
}

// 读取 wallpapers.json
const wallpapers = JSON.parse(fs.readFileSync(WALLPAPERS_JSON, 'utf8'));

// 读取/初始化状态文件
function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  }
  return { submitted: [], lastRun: null };
}

function saveState(state) {
  state.lastRun = new Date().toISOString();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// 提取所有 URL（EN + ZH）
function extractUrls() {
  const urls = [];
  // 壁纸页
  wallpapers.forEach(wp => {
    if (wp.slug) {
      urls.push({ url: `${SITE_URL}/wallpaper/${wp.slug}`, type: 'wallpaper' });
      urls.push({ url: `${SITE_URL}/zh/wallpaper/${wp.slug}`, type: 'wallpaper' });
    }
  });
  
  // 首页
  urls.push({ url: SITE_URL + '/', type: 'page' });
  urls.push({ url: SITE_URL + '/zh/', type: 'page' });

  return urls;
}

// 过滤：只返回未提交过的 URL
function filterNewUrls(allUrls, state) {
  const submittedSet = new Set(state.submitted);
  return allUrls.filter(item => !submittedSet.has(item.url));
}

// 提交 URL 到 IndexNow（批量，最多 100 条/次）
async function submitBatch(urls, endpoint) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      host: 'www.daoessentia.com',
      key: 'd41d8cd98f00b204e9800998ecf8427e', // MD5 of empty string (simple unique key)
      keyLocation: `${SITE_URL}/d41d8cd98f00b204e9800998ecf8427e.txt`,
      urlList: urls.map(u => u.url)
    });

    const options = {
      hostname: endpoint.replace('https://', '').replace('http://', '').split('/')[0],
      path: '/' + (endpoint.split('/').slice(3).join('/') || ''),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload),
        'User-Agent': 'DaoEssence-IndexNow/1.0'
      },
      timeout: 15000
    };

    // 加代理
    if (HttpsProxyAgent && PROXY_URL) {
      options.agent = new HttpsProxyAgent(PROXY_URL);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
      if (res.statusCode === 200 || res.statusCode === 202) {
        console.log(`   ✅ ${endpoint.replace('https://', '').split('/')[0]}: ${urls.length} 个 URL 已接受`);
          resolve({ success: true, endpoint });
        } else {
          console.log(`   ❌ ${endpoint.replace('https://', '').split('/')[0]}: HTTP ${res.statusCode}`);
          if (data.length < 500) console.log(`   响应：${data}`);
          resolve({ success: false, error: `HTTP ${res.statusCode}` });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ 连接失败：${error.message}`);
      resolve({ success: false, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'timeout' });
    });

    req.write(payload);
    req.end();
  });
}

// 主函数
async function main() {
  const isTest = process.argv.includes('--test');
  console.log('\n🚀 IndexNow 自动提交脚本启动\n');
  console.log(`   站点：${SITE_URL}`);
  console.log(`   代理：${PROXY_URL}\n`);

  // 提取所有 URL
  const allUrls = extractUrls();
  const state = loadState();
  const newUrls = isTest ? allUrls.slice(0, 3) : filterNewUrls(allUrls, state);

  console.log(`📊 总 URL 数量：${allUrls.length}`);
  console.log(`📋 已提交数量：${state.submitted.length}`);
  console.log(`🆕 待提交数量：${newUrls.length}\n`);

  if (newUrls.length === 0) {
    console.log('✅ 所有 URL 已提交过，无需重复操作。');
    console.log(`   上次运行：${state.lastRun}`);
    return;
  }

  // 分批提交（每批最多 100 条）
  const batches = [];
  for (let i = 0; i < newUrls.length; i += DAILY_LIMIT) {
    batches.push(newUrls.slice(i, i + DAILY_LIMIT));
  }

  let totalSuccess = 0;

  for (let bi = 0; bi < batches.length; bi++) {
    const batch = batches[bi];
    console.log(`\n📤 批次 ${bi + 1}/${batches.length}（${batch.length} 个 URL）：`);

    // 先试主端点
    const result = await submitBatch(batch, INDEXNOW_ENDPOINT);

    if (result.success) {
      totalSuccess += batch.length;
      // 记录已提交
      batch.forEach(item => state.submitted.push(item.url));
      saveState(state);
    } else {
      // 主端点失败，试备选
      console.log('   ⚠️ 主端点失败，尝试备选...');
      for (const backup of BACKUP_ENDPOINTS) {
        const backupResult = await submitBatch(batch, backup);
        if (backupResult.success) {
          totalSuccess += batch.length;
          batch.forEach(item => state.submitted.push(item.url));
          saveState(state);
          break;
        }
      }

      // 如果全部失败也记录（避免下次重复尝试导致限流）
      if (!result.success && batch.every(b => state.submitted.includes(b.url))) {
        // already recorded above
      }
    }

    // 批次间隔 2 秒
    if (bi < batches.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\n🎉 提交完成！成功 ${totalSuccess}/${newUrls.length} 个 URL`);
  console.log(`\n📝 已提交的 URL 会记录在 .indexnow-state.json 中`);
  console.log(`   下次运行时只提交新 URL\n`);

  // 输出本次提交的 URL 列表
  if (totalSuccess > 0) {
    console.log('📄 本次提交的 URL：');
    const newlySubmitted = newUrls.slice(0, totalSuccess);
    newlySubmitted.forEach((item, idx) => {
      console.log(`   ${idx + 1}. [${item.type}] ${item.url}`);
    });
  }
}

main().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});
