/**
 * 每日运势自动化入口 (daily-run.js)
 * 由 WorkBuddy 定时任务每日 02:00 调用
 * 用法: node scripts/daily-run.js [日期 YYYY-MM-DD]
 *
 * 环境变量 AUTO_DEPLOY=true 时自动完成 git push 部署
 * （自动化任务通过 daily-run-auto.js 设置此变量触发自动部署；
 *  手动运行时不设置该变量，由用户手动 push）
 *
 * 工作流:
 *   1. 读取 .env.local 加载 DASHSCOPE_API_KEY
 *   2. 运行 generate-daily.js 生成运势
 *   3. 更新聚合页版本号（缓存防刷）
 *   4. 运行 build-blog.js 重建博客页（可选，失败不阻断）
 *   5. git add + git commit + [AUTO_DEPLOY=true] git push
 *   6. 失败时发送通知
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── 加载 .env.local ──────────────────────────────────────
const ENV_FILE = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(ENV_FILE)) {
  const envContent = fs.readFileSync(ENV_FILE, 'utf8');
  for (const line of envContent.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim();
    }
  }
}

// ─── 参数解析 ─────────────────────────────────────────────
// 使用东八区日期，避免 UTC 跨天问题
const DATE = process.argv[2] || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
const PROJECT_ROOT = path.join(__dirname, '..');
const GENERATE_SCRIPT = path.join(__dirname, 'generate-daily.js');

// 缓存 bust 版本：YYYYMMDD 格式
const CACHE_VERSION = DATE.replace(/-/g, '');

// ─── 通知函数（失败时调用） ─────────────────────────────────
function sendFailureNotification(reason, detail) {
  const msg = `[部署失败] ${DATE}\n原因: ${reason}\n详情: ${detail}`;
  console.error(`\n${'═'.repeat(50)}`);
  console.error(`❌ 部署失败通知`);
  console.error(`${'═'.repeat(50)}`);
  console.error(msg);
  console.error(`${'═'.repeat(50)}\n`);
  // TODO: 可在此处添加 webhook/邮件/钉钉通知
  // 示例: fetch('https://hooks.slack.com/services/xxx', { method: 'POST', body: JSON.stringify({ text: msg }) });
}

// ─── 1. 生成运势 ───────────────────────────────────────────
console.log(`\n[${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}] 启动每日运势生成`);
console.log(`生成日期: ${DATE}  缓存版本: ${CACHE_VERSION}\n`);

// ─── 1a. 预清理：删除旧详情页，防止生成失败后验证误判 ─────────
console.log('--- 预清理旧详情页 ---');
const DETAIL_PAGE_SLUGS = [
  'rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake',
  'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig',
];
const ZODIAC_DIR = path.join(PROJECT_ROOT, 'zodiac');
let cleaned = 0;
for (const slug of DETAIL_PAGE_SLUGS) {
  for (const suffix of ['-en', '-zh']) {
    const p = path.join(ZODIAC_DIR, `${slug}${suffix}.html`);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      cleaned++;
    }
  }
}
console.log(`✅ 已删除 ${cleaned} 个旧详情页`);

try {
  console.log('--- 运行 generate-daily.js ---');
  execSync(`node "${GENERATE_SCRIPT}" ${DATE}`, {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
  });
} catch (err) {
  console.error(`\n❌ 生成脚本执行失败: ${err.message}`);
  sendFailureNotification('generate-daily.js 执行失败', err.message);
  process.exit(1);
}

// ─── 1b. 生成后验证：检查关键输出文件 ────────────────────────
console.log('\n--- 验证生成结果 ---');
const DETAIL_PAGES = [
  'rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake',
  'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig',
];
const ZODIAC_DIR = path.join(PROJECT_ROOT, 'zodiac');
const requiredFiles = [
  path.join(ZODIAC_DIR, 'js', 'zodiac-data.js'),
  path.join(ZODIAC_DIR, 'seo-content', `${DATE}.json`),
];
const missingFiles = requiredFiles.filter(f => !fs.existsSync(f));
if (missingFiles.length > 0) {
  const msg = `关键文件缺失: ${missingFiles.join(', ')}`;
  console.error(`\n❌ ${msg}`);
  sendFailureNotification('生成后验证失败', msg);
  process.exit(1);
}
// 检查详情页（中+英，预清理后不存在=未生成，必须终止）
let missingDetailPages = [];
for (const slug of DETAIL_PAGES) {
  for (const suffix of ['-en', '-zh']) {
    const p = path.join(ZODIAC_DIR, `${slug}${suffix}.html`);
    if (!fs.existsSync(p)) missingDetailPages.push(`${slug}${suffix}.html`);
  }
}
if (missingDetailPages.length > 0) {
  const msg = `详情页未生成: ${missingDetailPages.join(', ')}`;
  console.error(`\n❌ ${msg}`);
  sendFailureNotification('详情页生成不完整', msg);
  process.exit(1);
}
console.log(`✅ 12生肖详情页（中+英）全部生成`);
console.log('✅ 生成后验证通过');

// ─── 2. 缓存防刷：更新聚合页版本号 ─────────────────────────
const AGG_PAGE = path.join(PROJECT_ROOT, 'zodiac', 'zodiac-daily.html');
if (fs.existsSync(AGG_PAGE)) {
  let html = fs.readFileSync(AGG_PAGE, 'utf8');
  const updated = html.replace(
    /(<script src="js\/zodiac-data\.js)(\?v=\d+)?(">)/,
    `$1?v=${CACHE_VERSION}$3`
  );
  if (updated !== html) {
    fs.writeFileSync(AGG_PAGE, updated, 'utf8');
    console.log(`✅ 聚合页缓存版本已更新: ?v=${CACHE_VERSION}`);
  } else {
    console.log(`⚠️  聚合页无变化，跳过写入`);
  }
} else {
  console.warn(`️  聚合页不存在: ${AGG_PAGE}`);
}

// ─── 3. 强制切换到 main 分支（防止在其他分支上 commit）─────────────
console.log('\n--- 切换 to main 分支 ---');
try {
  // 1. 先查看当前分支
  const currentBranch = execSync('git branch --show-current', { cwd: PROJECT_ROOT, encoding: 'utf8' }).trim();
  if (currentBranch !== 'main') {
    console.log(`  当前分支: ${currentBranch}，切换到 main...`);
    execSync('git checkout main', { cwd: PROJECT_ROOT, stdio: 'inherit' });
  }
  // 2. pull 最新代码，避免冲突
  console.log('  pulling latest main...');
  execSync('git pull origin main', { cwd: PROJECT_ROOT, stdio: 'inherit' });
  console.log('✅ 已切换到 main 分支并拉取最新代码');
} catch (err) {
  console.error(`❌ 切换分支失败: ${err.message}`);
  sendFailureNotification('切换 main 分支失败', err.message);
  process.exit(1);
}

// ─── 4. Build + Git 提交 + Push（全自动部署） ─────────────
const SEO_FILE = path.join(PROJECT_ROOT, 'zodiac', 'seo-content', `${DATE}.json`);
const DATA_FILE = path.join(PROJECT_ROOT, 'zodiac', 'js', 'zodiac-data.js');

if (fs.existsSync(SEO_FILE) && fs.existsSync(DATA_FILE)) {
  console.log('\n--- 构建 + Git 提交 + 推送 ---');

  // ── 3a: 重建博客页（可选，失败不阻断主流程） ──
  let buildSuccess = false;
  try {
    console.log('\n 运行 build-blog.js 重建博客页...');
    execSync('node build-blog.js', {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    });
    console.log('✅ 博客页重建成功');
    buildSuccess = true;
  } catch (err) {
    console.warn(`️  build-blog.js 失败（非致命）: ${err.message}`);
    console.warn('   继续运势部署流程...');
  }

  // ── 3b: Git 提交 + 推送（独立于 build-blog，不受其失败影响） ──
  try {
    // 1. 检查是否有变更
    const status = execSync('git status --porcelain', { cwd: PROJECT_ROOT, encoding: 'utf8' });
    if (!status.trim()) {
      console.log('️  没有检测到文件变更，跳过提交');
    } else {
      console.log(`变更文件:\n${status}`);

      // 2. Git add 所有变更（含聚合页 + 详情页 + SEO 内容 + 数据文件）
      execSync('git add zodiac/zodiac-daily.html zodiac/js/zodiac-data.js zodiac/seo-content/*.json zodiac/*.html', { cwd: PROJECT_ROOT });
      execSync(`git commit -m "chore: ${DATE} daily horoscope update + rebuild"`, { cwd: PROJECT_ROOT });
      console.log(`✅ 已提交本地`);

      // 3. AUTO_DEPLOY=true 时自动 push（自动化任务设置此变量；手动运行不设置，由用户手动 push）
      if (process.env.AUTO_DEPLOY === 'true') {
        const MAX_RETRIES = 3;
        let pushed = false;
        let lastError = '';
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            execSync('git push', { cwd: PROJECT_ROOT, stdio: 'inherit' });
            pushed = true;
            break;
          } catch (pushErr) {
            lastError = pushErr.message;
            if (attempt < MAX_RETRIES) {
              console.warn(`⚠️  Push 第${attempt}次失败，5秒后重试...`);
              execSync('timeout /t 5 /nobreak > nul', { cwd: PROJECT_ROOT, stdio: 'ignore', shell: true });
            } else {
              console.error(`\n❌ Push 全部失败（已重试${MAX_RETRIES}次）: ${pushErr.message}`);
            }
          }
        }
        if (pushed) {
          console.log('✅ 已推送到远程，Vercel 将自动部署');
        } else {
          sendFailureNotification('Git Push 失败（重试 3 次均失败）', lastError);
        }
      } else {
        console.log('\n⚠️  本地commit已完成，请手动执行 git push 以触发Vercel部署');
        console.log(`   cd ${PROJECT_ROOT} && git push`);
      }
    }
  } catch (err) {
    console.warn(`⚠️  Git 操作失败: ${err.message}`);
    sendFailureNotification('Git 操作异常', err.message);
  }
} else {
  console.warn(`\n⚠️  关键文件不存在，跳过构建和提交`);
  if (!fs.existsSync(SEO_FILE)) console.warn(`   缺失: ${SEO_FILE}`);
  if (!fs.existsSync(DATA_FILE)) console.warn(`   缺失: ${DATA_FILE}`);
  sendFailureNotification('关键文件缺失', `SEO: ${fs.existsSync(SEO_FILE)}, DATA: ${fs.existsSync(DATA_FILE)}`);
}

// ─── 5. 部署后验证提示 ────────────────────────────────────
console.log(`\n${'═'.repeat(45)}`);
console.log(`📋 部署验证清单（上线后请检查）`);
console.log(`${'═'.repeat(45)}`);
console.log(`   聚合页: https://www.daoessentia.com/zodiac/zodiac-daily`);
console.log(`     → 12张卡片是否全部显示插图（无emoji占位符）？`);
console.log(`     → 标题上方是否显示今日日期？`);
console.log(`     → 每张卡片是否有星星评分？`);
console.log(`   详情页: https://www.daoessentia.com/zodiac/rat-en`);
console.log(`     → 日期是否为今日（${DATE}）？`);
console.log(`     → 分数是否为当日运势分数？`);
console.log(`   聚合页和详情页数据是否一致？`);
console.log(`${'═'.repeat(45)}\n`);

console.log(`\n✅ [${DATE}] 每日运势全自动部署完成！\n`);
