/**
 * 每日运势自动化入口 (daily-run.js)
 * 由 WorkBuddy 定时任务每日 08:00 调用
 * 用法: node scripts/daily-run.js [日期 YYYY-MM-DD]
 *
 * 工作流:
 *   1. 读取 .env.local 加载 DASHSCOPE_API_KEY
 *   2. 运行 generate-daily.js 生成运势
 *   3. git add + git commit (不 push，用户手动 push)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── 加载 .env.local ───────────────────────────────────────
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
console.log(`\n⏰ [${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}] 启动每日运势生成`);
console.log(`📅 生成日期: ${DATE}\n`);

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

// ─── 2. Git 提交 (不 push) ─────────────────────────────────
const SEO_FILE = path.join(PROJECT_ROOT, 'zodiac', 'seo-content', `${DATE}.json`);
const DATA_FILE = path.join(PROJECT_ROOT, 'zodiac', 'js', 'zodiac-data.js');

if (fs.existsSync(SEO_FILE) && fs.existsSync(DATA_FILE)) {
  console.log('\n--- Git 提交 ---');
  try {
    // 检查是否有变更
    const status = execSync('git status --porcelain', { cwd: PROJECT_ROOT, encoding: 'utf8' });
    if (!status.trim()) {
      console.log('⚠️  没有检测到文件变更，跳过提交');
    } else {
      console.log(`变更文件:\n${status}`);
      execSync(`git add zodiac/js/zodiac-data.js zodiac/seo-content/${DATE}.json`, { cwd: PROJECT_ROOT });
      execSync(`git commit -m "chore: ${DATE} daily horoscope update"`, { cwd: PROJECT_ROOT });
      console.log(`✅ 已提交本地: git commit -m "chore: ${DATE} daily horoscope update"`);
      console.log('📌 请手动执行 git push 推送到 Vercel');
    }
  } catch (err) {
    console.warn(`⚠️  Git 操作失败: ${err.message}`);
    console.warn('   可能原因: 无变更 / Git 未初始化 / 无提交权限');
  }
} else {
  console.warn(`\n⚠️  关键文件不存在，跳过 Git 提交`);
  if (!fs.existsSync(SEO_FILE)) console.warn(`   缺失: ${SEO_FILE}`);
  if (!fs.existsSync(DATA_FILE)) console.warn(`   缺失: ${DATA_FILE}`);
}

console.log(`\n✅ [${DATE}] 每日运势生成完成！\n`);
