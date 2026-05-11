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

async function kvFetch(command) {
  // Upstash REST API: POST / with body = Redis command
  const res = await fetch(KV_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'text/plain',
    },
    body: command,
  });
  return res.json();
}

async function kvGet(key) {
  const res = await fetch(`${KV_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
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

  // ── POST：阅读量 +1 ──
  if (req.method === 'POST') {
    const { slug } = req.body || {};
    if (!slug) return res.status(400).json({ error: 'Missing slug' });

    // INCR pv:<slug>
    const incrRes = await kvFetch(`INCR pv:${slug}`);
    const count = incrRes.result || 0;

    return res.status(200).json({ slug, count });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
