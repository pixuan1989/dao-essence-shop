/**
 * AI 用量记账（Node 版）
 * ------------------------------------------------------------
 * 目的：把每一次调用百炼（DashScope）的消耗记到一行 JSONL，方便和阿里云账单对账。
 * 用法（在拿到响应后调用，绝不抛错、绝不影响主流程）：
 *
 *   const { recordUsage } = require('./ai-usage.cjs');           // lib/ 内部
 *   const { recordUsage } = require('../lib/ai-usage.cjs');      // scripts/ 内部
 *
 *   recordUsage({ script: 'lib/generate-bazi-report.cjs', model: 'qwen3.7-max',
 *                 purpose: 'bazi-report', usage: data.usage, ref: jobId });
 *
 * 落盘位置：<项目根>/logs/ai-usage.jsonl（追加写）
 * 关闭记账：环境变量 AI_USAGE_LOG=0
 * 查账：node scripts/ai-cost-report.cjs [天数]
 */
const fs = require('fs');
const path = require('path');

const LOG_PATH = process.env.AI_USAGE_LOG && process.env.AI_USAGE_LOG !== '0' && process.env.AI_USAGE_LOG !== '1'
  ? process.env.AI_USAGE_LOG
  : path.join(__dirname, '..', 'logs', 'ai-usage.jsonl');

/**
 * 单价表（元 / 百万 token；图片按张）。
 * 注：这是**估算**用的参考价，仅为判断"钱花在哪条链路"，不等于账单金额。
 * 若官方调价，改这里即可；也可用 AI_PRICE_<MODEL> 环境变量覆盖。
 */
const PRICE = {
  'qwen-plus': { in: 0.8, out: 2.0 },
  'qwen-turbo': { in: 0.3, out: 0.6 },
  'qwen3.5-plus': { in: 0.8, out: 2.0 },
  'qwen-max': { in: 2.4, out: 9.6 },
  'qwen3.7-max': { in: 2.4, out: 9.6 },
  'qwen3.6-flash': { in: 0.3, out: 1.2 },
  'qwen-vl-max': { in: 3.0, out: 9.0 },
  'qwen-vl-plus': { in: 1.5, out: 4.5 },
};

/** 文生图按张计价（元/张） */
const IMAGE_PRICE = {
  'wanx-v1': 0.16,
  'wanx2.1-t2i-turbo': 0.14,
  'wanx2.1-t2i-plus': 0.20,
};

function priceOf(model) {
  const m = String(model || '').trim();
  const envIn = process.env['AI_PRICE_' + m.replace(/[^A-Za-z0-9]/g, '_').toUpperCase() + '_IN'];
  const envOut = process.env['AI_PRICE_' + m.replace(/[^A-Za-z0-9]/g, '_').toUpperCase() + '_OUT'];
  const base = PRICE[m] || PRICE[m.replace(/-latest$/, '')] || { in: 1.0, out: 3.0 };
  return {
    in: envIn !== undefined ? Number(envIn) : base.in,
    out: envOut !== undefined ? Number(envOut) : base.out,
  };
}

function estimate(model, inputTokens, outputTokens, images) {
  const p = priceOf(model);
  let cny = (inputTokens / 1e6) * p.in + (outputTokens / 1e6) * p.out;
  if (images > 0) cny += images * (IMAGE_PRICE[model] || 0.16);
  return Math.round(cny * 100000) / 100000;
}

function nowIso() {
  // 记账用北京时间，方便和账单按天对齐
  const d = new Date(Date.now() + 8 * 3600 * 1000);
  return d.toISOString().replace('Z', '+08:00');
}

/**
 * @param {object} o
 * @param {string} o.script   调用方标识，如 'lib/generate-bazi-report.cjs'
 * @param {string} o.model    模型名，如 'qwen3.7-max'
 * @param {string} [o.purpose] 用途，如 'bazi-report' / 'blog-translate' / 'cover-image'
 * @param {object} [o.usage]  百炼返回的 usage 对象（prompt_tokens / completion_tokens）
 * @param {number} [o.images] 出图张数（文生图用）
 * @param {string} [o.ref]    关联标识（订单号、slug 等）
 * @param {string} [o.note]   备注
 */
function recordUsage(o) {
  try {
    if (process.env.AI_USAGE_LOG === '0') return null;
    const u = (o && o.usage) || {};
    const inputTokens = Number(u.prompt_tokens ?? u.input_tokens ?? 0) || 0;
    const outputTokens = Number(u.completion_tokens ?? u.output_tokens ?? 0) || 0;
    const images = Number((o && o.images) || 0) || 0;
    const model = (o && o.model) || 'unknown';
    const row = {
      ts: nowIso(),
      script: (o && o.script) || 'unknown',
      model,
      purpose: (o && o.purpose) || '',
      in: inputTokens,
      out: outputTokens,
      images,
      est_cny: estimate(model, inputTokens, outputTokens, images),
    };
    if (o && o.ref) row.ref = String(o.ref).slice(0, 120);
    if (o && o.note) row.note = String(o.note).slice(0, 200);

    fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
    fs.appendFileSync(LOG_PATH, JSON.stringify(row) + '\n', 'utf8');
    return row;
  } catch (e) {
    // 记账失败绝不影响主流程（例如 Vercel 只读文件系统）；需要排查时设 AI_USAGE_DEBUG=1
    if (process.env.AI_USAGE_DEBUG === '1') {
      try { console.warn('[ai-usage] 记账失败: ' + (e && e.message)); } catch (_) {}
    }
    return null;
  }
}

/** 文生图专用简写 */
function recordImage(o) {
  return recordUsage(Object.assign({}, o, { images: (o && o.images) || 1 }));
}

module.exports = { recordUsage, recordImage, LOG_PATH, PRICE, IMAGE_PRICE };
