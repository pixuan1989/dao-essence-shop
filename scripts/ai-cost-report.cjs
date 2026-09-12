#!/usr/bin/env node
/**
 * AI 花销对账报表
 * ------------------------------------------------------------
 * 读 logs/ai-usage.jsonl，按天 / 按脚本 / 按模型汇总，估算费用（元）。
 *
 *   node scripts/ai-cost-report.cjs            # 最近 7 天
 *   node scripts/ai-cost-report.cjs 30         # 最近 30 天
 *
 * 注意：金额是**估算**（用 lib/ai-usage.cjs 的价目表算的），用来回答
 *      "钱花在哪条链路"，精确账单仍以阿里云为准。
 */
const fs = require('fs');
const path = require('path');

const days = Number(process.argv[2] || 7) || 7;
const LOG = path.join(__dirname, '..', 'logs', 'ai-usage.jsonl');

if (!fs.existsSync(LOG)) {
  console.log('还没有记账数据：' + LOG);
  console.log('（脚本跑一次并真实调用了百炼之后就会出现）');
  process.exit(0);
}

const since = Date.now() - days * 86400000;
const rows = fs.readFileSync(LOG, 'utf8')
  .split('\n')
  .filter(Boolean)
  .map(l => { try { return JSON.parse(l); } catch (_) { return null; } })
  .filter(r => r && r.ts && new Date(r.ts.replace('+08:00', 'Z')).getTime() >= since - 8 * 3600000);

if (!rows.length) {
  console.log(`最近 ${days} 天没有记账数据。`);
  process.exit(0);
}

const add = (m, k, r) => {
  m[k] = m[k] || { cny: 0, calls: 0, in: 0, out: 0, images: 0 };
  m[k].cny += r.est_cny || 0;
  m[k].calls += 1;
  m[k].in += r.in || 0;
  m[k].out += r.out || 0;
  m[k].images += r.images || 0;
};

function print(title, map, keyName) {
  const list = Object.entries(map).sort((a, b) => b[1].cny - a[1].cny);
  console.log('\n=== ' + title + ' ===');
  console.log([keyName.padEnd(34), '次数'.padStart(6), '输入token'.padStart(11), '输出token'.padStart(11), '张数'.padStart(6), '估算¥'.padStart(9)].join(' '));
  for (const [k, v] of list) {
    console.log([String(k).slice(0, 34).padEnd(34), String(v.calls).padStart(6), String(v.in).padStart(11), String(v.out).padStart(11), String(v.images).padStart(6), v.cny.toFixed(3).padStart(9)].join(' '));
  }
}

const byDay = {}, byScript = {}, byModel = {};
let total = 0;
for (const r of rows) {
  const day = String(r.ts).slice(0, 10);
  add(byDay, day, r); add(byScript, r.script || '?', r); add(byModel, r.model || '?', r);
  total += r.est_cny || 0;
}

console.log(`AI 用量对账（最近 ${days} 天，共 ${rows.length} 次调用）`);
print('按天', byDay, '日期');
print('按脚本（钱花在哪条链路）', byScript, '脚本');
print('按模型', byModel, '模型');
console.log('\n估算合计：¥' + total.toFixed(2) + '（估算值，精确账单以阿里云为准）');
console.log('明细文件：' + LOG);
