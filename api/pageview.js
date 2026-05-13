/**
 * Pageview API - 阅读量统计
 * GET  /api/pageview?slugs=slug1,slug2  → 批量查询阅读量
 * POST /api/pageview + body { slug }      → 该文章阅读量 +1
 *
 * 使用 Vercel KV (Upstash Redis) 存储
 * 环境变量: KV_REST_API_URL, KV_REST_API_TOKEN
 */

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

  // ── GET：批量查询 ──
  if (req.method === 'GET') {
    const { slugs } = req.query;
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

  // ── POST：反馈提交 或 阅读量 +1 ──
  if (req.method === 'POST') {
    const { action } = req.body || {};

    // 反馈提交
    if (action === 'feedback') {
      return handleFeedback(req, res);
    }

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

// ── 反馈提交 ──
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

  // IP 频率限制：同一 IP 60 秒内只能提交 1 次
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
    ip: ip === 'unknown' ? '' : ip,
    createdAt: new Date().toISOString()
  };

  // 存入 KV
  await kvSetJSON(`feedback:${id}`, feedbackData);

  // 更新索引列表
  const idsJson = await kvGet('feedback_ids');
  const ids = idsJson ? JSON.parse(idsJson) : [];
  ids.unshift(id);
  // 最多保留 500 条
  if (ids.length > 500) ids.length = 500;
  await kvSet('feedback_ids', JSON.stringify(ids));

  // 设置频率限制（60 秒）
  await kvSetNX(rateLimitKey, 60);

  return res.status(200).json({ success: true, id });
}

// ── KV GET (返回原始字符串) ──
async function kvGetRaw(key) {
  const res = await fetch(KV_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(['GET', key]),
  });
  const data = await res.json();
  return data.result || null;
}

// ── KV SET JSON ──
async function kvSetJSON(key, value) {
  await fetch(KV_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(['SET', key, JSON.stringify(value)]),
  });
}
