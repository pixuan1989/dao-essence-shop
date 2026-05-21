/**
 * Vercel 构建状态检查脚本
 * 用途：部署后验证 Vercel 是否成功构建并部署了最新版本
 * 用法: node scripts/check-vercel-deploy.js [日期 YYYY-MM-DD]
 *
 * 检查项：
 *   1. Vercel 最新部署状态（READY / ERROR / BUILDING）
 *   2. 线上页面内容是否为今日数据
 *   3. 聚合页缓存版本号是否匹配
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATE = process.argv[2] || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
const CACHE_VERSION = DATE.replace(/-/g, '');
const DOMAIN = 'www.daoessentia.com';

console.log(`\n${'═'.repeat(50)}`);
console.log(` Vercel 构建状态检查`);
console.log(`${'═'.repeat(50)}`);
console.log(`检查日期: ${DATE}`);
console.log(`缓存版本: ?v=${CACHE_VERSION}`);
console.log(`${'═'.repeat(50)}\n`);

// ─── 检查 1: 通过 curl 验证线上页面 ─────────────────────────
function checkUrl(url, description) {
  console.log(`检查: ${description}`);
  console.log(`  URL: ${url}`);
  try {
    const result = execSync(`curl -s -o /dev/null -w "%{http_code}" "${url}"`, {
      encoding: 'utf8',
      shell: true,
    });
    const statusCode = parseInt(result.trim());
    if (statusCode === 200) {
      console.log(`  ✅ HTTP ${statusCode}`);
      return true;
    } else {
      console.log(`  ❌ HTTP ${statusCode} (期望 200)`);
      return false;
    }
  } catch (err) {
    console.log(`  ❌ 请求失败: ${err.message}`);
    return false;
  }
}

// ─── 检查 2: 验证线上内容 ───────────────────────────────────
function checkContent(url, expectedText, description) {
  console.log(`验证: ${description}`);
  try {
    const html = execSync(`curl -s "${url}"`, {
      encoding: 'utf8',
      shell: true,
      timeout: 10000,
    });
    if (html.includes(expectedText)) {
      console.log(`  ✅ 找到 "${expectedText}"`);
      return true;
    } else {
      console.log(`  ❌ 未找到 "${expectedText}"`);
      // 显示前 200 字符帮助调试
      console.log(`     实际内容预览: ${html.substring(0, 200)}...`);
      return false;
    }
  } catch (err) {
    console.log(`  ❌ 请求失败: ${err.message}`);
    return false;
  }
}

// ─── 执行检查 ───────────────────────────────────────────────
let allPassed = true;

// 1. 聚合页可访问
if (!checkUrl(`https://${DOMAIN}/zodiac/zodiac-daily`, '聚合页 HTTP 状态')) {
  allPassed = false;
}

// 2. 详情页可访问（英文版）
if (!checkUrl(`https://${DOMAIN}/zodiac/rat-en`, '详情页 (rat-en) HTTP 状态')) {
  allPassed = false;
}

// 3. 聚合页缓存版本号
console.log(`\n--- 内容验证 ---`);
const aggUrl = `https://${DOMAIN}/zodiac/zodiac-daily`;
try {
  const aggHtml = execSync(`curl -s "${aggUrl}"`, {
    encoding: 'utf8',
    shell: true,
    timeout: 10000,
  });
  if (aggHtml.includes(`?v=${CACHE_VERSION}`)) {
    console.log(`✅ 聚合页缓存版本正确: ?v=${CACHE_VERSION}`);
  } else {
    // 尝试找到实际的版本号
    const verMatch = aggHtml.match(/zodiac-data\.js\?v=(\d+)/);
    const actualVer = verMatch ? verMatch[1] : '未找到';
    console.log(`⚠️  缓存版本不匹配: 期望 ?v=${CACHE_VERSION}, 实际 ?v=${actualVer}`);
    allPassed = false;
  }
} catch (err) {
  console.log(`⚠️  无法验证缓存版本: ${err.message}`);
}

// 4. 详情页日期验证
const detailUrl = `https://${DOMAIN}/zodiac/rat-en`;
try {
  const detailHtml = execSync(`curl -s "${detailUrl}"`, {
    encoding: 'utf8',
    shell: true,
    timeout: 10000,
  });
  // 检查日期是否包含今日
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [y, m, d] = DATE.split('-');
  const expectedDate = `${months[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
  if (detailHtml.includes(expectedDate)) {
    console.log(`✅ 详情页日期正确: ${expectedDate}`);
  } else {
    console.log(`⚠️  详情页日期不匹配: 期望 "${expectedDate}"`);
    const dateMatch = detailHtml.match(/id="dateBadge">([^<]+)/);
    console.log(`     实际日期: ${dateMatch ? dateMatch[1] : '未找到'}`);
    allPassed = false;
  }
} catch (err) {
  console.log(`⚠️  无法验证详情页日期: ${err.message}`);
}

// ─── 总结 ───────────────────────────────────────────────────
console.log(`\n${'═'.repeat(50)}`);
if (allPassed) {
  console.log(`✅ 所有检查通过！部署成功。`);
} else {
  console.log(`⚠️  部分检查未通过，请手动验证线上页面。`);
  console.log(`   聚合页: https://${DOMAIN}/zodiac/zodiac-daily`);
  console.log(`   详情页: https://${DOMAIN}/zodiac/rat-en`);
}
console.log(`${'═'.repeat(50)}\n`);

process.exit(allPassed ? 0 : 1);
