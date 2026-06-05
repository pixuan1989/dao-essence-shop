/**
 * Download Count API - 壁纸下载计数
 * GET  /api/download?ids=id1,id2  → 批量查询下载次数
 * POST /api/download + body { id } → 下载次数 +1
 * 
 * 复用博客 pageview 的 Vercel KV 存储
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

  // ─ GET：批量查询下载次数 ──
  if (req.method === 'GET') {
    const { ids } = req.query;
    if (!ids) return res.status(400).json({ error: 'Missing ids param' });

    const idList = ids.split(',').map(s => s.trim()).filter(Boolean);
    const result = {};

    await Promise.all(
      idList.map(async (id) => {
        const val = await kvGet(`dl:${id}`);
        result[id] = parseInt(val) || 0;
      })
    );

    return res.status(200).json(result);
  }

  // ── POST：下载次数 +1 ──
  if (req.method === 'POST') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Missing id' });

    // 获取真实 IP
    const ip = (
      req.headers['cf-connecting-ip'] ||
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'unknown'
    );

    // 去重 key，24 小时过期（同一 IP 同一壁纸 24 小时内只计 1 次）
    const dedupKey = `dl_visited:${id}:${ip}`;
    const isNew = await kvSetNX(dedupKey, 86400);
    if (!isNew) {
      const count = await kvGet(`dl:${id}`);
      return res.status(200).json({ id, count: parseInt(count) || 0, newDownload: false });
    }

    // 首次下载 → INCR dl:<id>
    const count = await kvIncr(`dl:${id}`);

    return res.status(200).json({ id, count, newDownload: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
