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
        const val = await kvGet(`pv:${slug}`);
        result[slug] = parseInt(val) || 0;
      })
    );

    return res.status(200).json(result);
  }

  // ── POST：阅读量 +1（同一 IP 24小时内只计一次）──
  if (req.method === 'POST') {
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
