/**
 * 每日运势自动化入口 (daily-run.js)
 * 由 WorkBuddy 定时任务每日 02:00 调用
 * 用法: node scripts/daily-run.js [日期 YYYY-MM-DD]
 *
 * 工作流:
 *   1. 读取 .env.local 加载 DASHSCOPE_API_KEY
 *   2. 运行 generate-daily.js 生成运势
 *   3. 运行 build-blog.js 重建博客页（可选，失败不阻断）
 *   4. git add + git commit + git push（全自动部署）
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── 加载 .env.local ──────────────────────────────────────
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

// ─── 1. 生成运势 ───────────────────────────────────────────
console.log(`\n [${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}] 启动每日运势生成`);
console.log(` 生成日期: ${DATE}\n`);

try {
  console.log('--- 运行 generate-daily.js ---');
  execSync(`node "${GENERATE_SCRIPT}" ${DATE}`, {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
  });
} catch (err) {
  console.error(`\n❌ 生成脚本执行失败: ${err.message}`);
  process.exit(1);
}

// ─── 2. Build + Git 提交 + Push（全自动部署） ──────────────
const SEO_FILE = path.join(PROJECT_ROOT, 'zodiac', 'seo-content', `${DATE}.json`);
const DATA_FILE = path.join(PROJECT_ROOT, 'zodiac', 'js', 'zodiac-data.js');

if (fs.existsSync(SEO_FILE) && fs.existsSync(DATA_FILE)) {
  console.log('\n--- 构建 + Git 提交 + 推送 ---');

  // ── 2a: 重建博客页（可选，失败不阻断主流程） ──
  try {
    console.log('\n🔨 运行 build-blog.js 重建博客页...');
    execSync('node build-blog.js', {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    });
    console.log('✅ 博客页重建成功');
  } catch (err) {
    console.warn(`️  build-blog.js 失败（非致命）: ${err.message}`);
    console.warn('   继续运势部署流程...');
  }

  // ── 2b: Git 提交 + 推送（独立于 build-blog，不受其失败影响） ──
  try {
    // 1. 检查是否有变更
    const status = execSync('git status --porcelain', { cwd: PROJECT_ROOT, encoding: 'utf8' });
    if (!status.trim()) {
      console.log('⚠️  没有检测到文件变更，跳过提交');
    } else {
      console.log(`变更文件:\n${status}`);

      // 2. Git add 所有变更（含新生成的 HTML）
      execSync('git add zodiac/js/zodiac-data.js zodiac/seo-content/*.json zodiac/*.html', { cwd: PROJECT_ROOT });
      execSync(`git commit -m "chore: ${DATE} daily horoscope update + rebuild"`, { cwd: PROJECT_ROOT });
      console.log(`✅ 已提交本地`);

      // 3. Push 触发 Vercel 部署
      execSync('git push', { cwd: PROJECT_ROOT });
      console.log('✅ 已推送到远程，Vercel 将自动部署');
    }
  } catch (err) {
    console.warn(`⚠️  Git 操作失败: ${err.message}`);
  }
} else {
  console.warn(`\n⚠️  关键文件不存在，跳过构建和提交`);
  if (!fs.existsSync(SEO_FILE)) console.warn(`   缺失: ${SEO_FILE}`);
  if (!fs.existsSync(DATA_FILE)) console.warn(`   缺失: ${DATA_FILE}`);
}

console.log(`\n✅ [${DATE}] 每日运势全自动部署完成！\n`);
