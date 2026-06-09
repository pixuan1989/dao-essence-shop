/**
 * Pageview API - 阅读量统计 + 壁纸下载计数
 * GET  /api/pageview?slugs=slug1,slug2              → 批量查询阅读量
 * GET  /api/pageview?action=download&ids=id1,id2    → 批量查询下载次数
 * POST /api/pageview + body { slug }                 → 文章阅读量 +1
 * POST /api/pageview + body { action: 'download', id } → 壁纸下载次数 +1
 * POST /api/pageview + body { action: 'feedback', email, message, page } → 提交反馈
 *
 * 阅读量使用 Vercel KV (Upstash Redis) 存储 (KV_REST_API_URL)
 * 反馈使用 shared/redis.js (REDIS_URL) 存储，与管理后台同库
 */

import { redisGet, redisSet } from '../shared/redis.js';

const KV_URL  = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

async function kvIncr(key) {
  const res = await fetch(KV_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(['INCR', key]),
  });
  const data = await res.json();
  return data.result || 0;
}

async function kvSetNX(key, ttl) {
  const res = await fetch(KV_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(['SET', key, '1', 'EX', ttl, 'NX']),
  });
  const data = await res.json();
  return data.result === 'OK';
}

async function kvGet(key) {
  const res = await fetch(KV_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(['GET', key]),
  });
  const data = await res.json();
  return data.result || 0;
}

async function kvSet(key, value) {
  await fetch(KV_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(['SET', key, String(value)]),
  });
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── GET：批量查询阅读量 或 下载次数 ──
  if (req.method === 'GET') {
    const { slugs, ids, action } = req.query;

    // 下载计数查询
    if (action === 'download' && ids) {
      const idList = ids.split(',').map(s => s.trim()).filter(Boolean);
      const result = {};
      await Promise.all(
        idList.map(async (id) => {
          // 兼容两种前缀：dl:（新）和 wallpaper:downloads:（旧）
          const val1 = await kvGet(`dl:${id}`);
          const val2 = await kvGet(`wallpaper:downloads:${id}`);
          // 取最大值，确保不丢失历史数据
          result[id] = Math.max(parseInt(val1) || 0, parseInt(val2) || 0);
        })
      );
      return res.status(200).json(result);
    }

    // 阅读量查询
    if (!slugs) return res.status(400).json({ error: 'Missing slugs param' });

    const slugList = slugs.split(',').map(s => s.trim()).filter(Boolean);
    const result = {};

    await Promise.all(
      slugList.map(async (slug) => {
        // 查新 key
        let val = await kvGet(`pv:${slug}`);
        // 兼容旧 key（带前导 / 或 zh/ 的历史数据）
        let oldVal1 = await kvGet(`pv:/${slug}`);
        let oldVal2 = await kvGet(`pv:zh/${slug}`);
        // 取最大值，确保不丢失历史数据
        val = Math.max(parseInt(val) || 0, parseInt(oldVal1) || 0, parseInt(oldVal2) || 0);
        result[slug] = val;
      })
    );

    return res.status(200).json(result);
  }

  // ── POST：反馈提交 或 阅读量 +1 或 下载次数 +1 ──
  if (req.method === 'POST') {
    const { action } = req.body || {};

    // 反馈提交
    if (action === 'feedback') {
      return handleFeedback(req, res);
    }

    // 下载计数 +1
    if (action === 'download') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Missing id' });

      const ip = (
        req.headers['cf-connecting-ip'] ||
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.socket?.remoteAddress ||
        'unknown'
      );

      const dedupKey = `dl_visited:${id}:${ip}`;
      const isNew = await kvSetNX(dedupKey, 86400);
      if (!isNew) {
        const count = await kvGet(`dl:${id}`);
        return res.status(200).json({ id, count: parseInt(count) || 0, newDownload: false });
      }

      const count = await kvIncr(`dl:${id}`);
      return res.status(200).json({ id, count, newDownload: true });
    }

    // 阅读量 +1
    const { slug } = req.body || {};
    if (!slug) return res.status(400).json({ error: 'Missing slug' });

    // 获取真实 IP（Vercel 部署时从 CF-Connecting-IP / X-Forwarded-For 取）
    const ip = (
      req.headers['cf-connecting-ip'] ||
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'unknown'
    );

    // 去重 key，24小时过期
    const dedupKey = `visited:${slug}:${ip}`;
    const isNew = await kvSetNX(dedupKey, 86400);
    if (!isNew) {
      // 24小时内已访问，只返回当前计数，不 +1
      const count = await kvGet(`pv:${slug}`);
      return res.status(200).json({ slug, count: parseInt(count) || 0, newVisit: false });
    }

    // 首次访问 → INCR pv:<slug>
    const count = await kvIncr(`pv:${slug}`);

    return res.status(200).json({ slug, count, newVisit: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// ── 反馈提交（写入 shared/redis，与管理后台同库） ──
async function handleFeedback(req, res) {
  const { email, message, page } = req.body || {};

  // 基础验证
  if (!email || !message) {
    return res.status(400).json({ error: 'Email and message are required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  if (message.length > 2000) {
    return res.status(400).json({ error: 'Message too long (max 2000 characters)' });
  }

  // IP 频率限制：同一 IP 60 秒内只能提交 1 次（用 KV REST API 做限流）
  const ip = (
    req.headers['cf-connecting-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
  const rateLimitKey = `feedback_rate:${ip}`;
  const existing = await kvGet(rateLimitKey);
  if (existing) {
    return res.status(429).json({ error: 'Please wait a moment before submitting again' });
  }

  // 生成唯一 ID
  const id = `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const feedbackData = {
    id,
    email,
    message: message.trim(),
    page: page || '',
    createdAt: new Date().toISOString()
  };

  // 存入 shared/redis（与管理后台同库）
  await redisSet(`feedback:${id}`, feedbackData);

  // 更新索引列表
  const ids = await redisGet('feedback_ids') || [];
  ids.unshift(id);
  // 最多保留 500 条
  if (ids.length > 500) ids.length = 500;
  await redisSet('feedback_ids', ids);

  // 设置频率限制（60 秒，用 KV REST API）
  await kvSetNX(rateLimitKey, 60);

  return res.status(200).json({ success: true, id });
}
