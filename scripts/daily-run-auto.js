/**
 * 自动化专用入口 (daily-run-auto.js)
 * WorkBuddy 定时任务应调用此脚本（非 daily-run.js）
 * 自动设置 AUTO_DEPLOY=true，确保自动 push 部署
 *
 * 用法: node scripts/daily-run-auto.js [日期 YYYY-MM-DD]
 */
process.env.AUTO_DEPLOY = 'true';

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATE = process.argv[2] || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
const PROJECT_ROOT = path.join(__dirname, '..');

console.log(`[AUTO] AUTO_DEPLOY=true，自动部署模式`);
execSync(`node "${path.join(__dirname, 'daily-run.js')}" ${DATE}`, {
  cwd: PROJECT_ROOT,
  stdio: 'inherit',
});
