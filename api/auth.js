/**
 * Auth API — Clerk 集成版
 * 仅保留下载配额检查，认证由 Clerk 前端处理
 */

import { getRedis } from '../shared/redis.js';

// In-memory fallback when Redis is unavailable (persists within same Lambda instance)
const memoryCounts = new Map();

// CORS headers
const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Verify Clerk Session Token (简化版，实际生产环境建议用 Clerk Node SDK)
async function verifyClerkToken(token) {
    try {
        // Clerk session token 是 JWT 格式
        // 这里简化处理：如果 token 存在且格式正确，认为已登录
        // 生产环境应调用 Clerk API 验证
        if (!token || token.length < 100) return null;
        // 从 token 中解析用户ID (简化处理)
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        return payload;
    } catch (e) {
        return null;
    }
}

// GET /api/auth?action=me
async function me(req, res) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    const token = auth.slice(7);
    const payload = await verifyClerkToken(token);
    if (!payload) return res.status(401).json({ error: 'Invalid or expired token' });

    // 返回用户信息（从 Clerk token 解析）
    return res.status(200).json({
        email: payload.email || payload.sub || 'user@example.com',
        verified: true,
        downloadCount: 0,
        downloadDate: null
    });
}

// GET /api/auth?action=stats  — return download counts for sorting
async function getStats(req, res) {
    try {
        const client = getRedis();
        const stats = {};
        const keys = await client.keys('wallpaper:downloads:*');
        if (keys && keys.length > 0) {
            const counts = await client.mget(...keys);
            keys.forEach((key, i) => {
                const wpId = key.replace('wallpaper:downloads:', '');
                stats[wpId] = parseInt(counts[i]) || 0;
            });
        }
        return res.status(200).json({ stats });
    } catch (e) {
        console.error('[auth] getStats error:', e.message);
        return res.status(200).json({ stats: {} });
    }
}

// POST /api/auth?action=download
async function downloadCheck(req, res) {
    const today = new Date().toISOString().slice(0, 10);
    const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();

    // Try Redis (no ping, @upstash/redis is HTTP-based)
    let client = null;
    let useMemory = false;
    try {
        client = getRedis();
    } catch (e) {
        client = null;
    }
    if (!client) useMemory = true;

    const auth = req.headers.authorization;
    const payload = auth?.startsWith('Bearer ') ? await verifyClerkToken(auth.slice(7)) : null;

    try {
        // Guest mode — 每天最多 1 次
        if (!payload) {
            const dlKey = 'dl:' + ip + ':' + today;
            let used;
            if (useMemory) {
                used = memoryCounts.get(dlKey) || 0;
            } else {
                used = parseInt(await client.get(dlKey) || '0');
            }
            if (used >= 1) {
                return res.status(429).json({
                    error: 'Daily download limit reached (1/day for guests). Sign in for 3/day.',
                    allowed: false, used, limit: 1
                });
            }
            if (useMemory) {
                memoryCounts.set(dlKey, used + 1);
            } else {
                await client.set(dlKey, String(used + 1), { ex: 86400 });
            }
            // Record download count (best-effort, never block download)
            try {
                const wpId = req.body?.wallpaperId || req.query.wallpaperId || '';
                if (wpId) {
                    const key = 'wallpaper:downloads:' + wpId;
                    if (useMemory) {
                        memoryCounts.set(key, (memoryCounts.get(key) || 0) + 1);
                    } else {
                        await client.incr(key);
                        await client.expire(key, 86400 * 365); // persist ~1 year
                    }
                }
            } catch (e) { console.error('[auth] download count error:', e.message); }
            // --- end count ---

            return res.status(200).json({ allowed: true, used: used + 1, limit: 1 });
        }

        // Logged in user — 每天最多 3 次
        const email = payload.email || payload.sub || 'unknown';
        const ipKey = 'dl:' + ip + ':' + today;
        const userKey = 'dl_user:' + email.toLowerCase() + ':' + today;

        let ipUsed, userUsed;
        if (useMemory) {
            ipUsed = memoryCounts.get(ipKey) || 0;
            userUsed = memoryCounts.get(userKey) || 0;
        } else {
            ipUsed = parseInt(await client.get(ipKey) || '0');
            userUsed = parseInt(await client.get(userKey) || '0');
        }
        const totalUsed = Math.max(ipUsed, userUsed);
        const limit = 3;

        if (totalUsed >= limit) {
            return res.status(429).json({
                error: 'Daily download limit reached (3/day).',
                allowed: false, used: totalUsed, limit
            });
        }

        const nextCount = totalUsed + 1;
        if (useMemory) {
            memoryCounts.set(ipKey, nextCount);
            memoryCounts.set(userKey, nextCount);
        } else {
            await client.set(ipKey, String(nextCount), { ex: 86400 });
            await client.set(userKey, String(nextCount), { ex: 86400 });
        }

        // Record download count (best-effort, never block download)
        try {
            const wpId = req.body?.wallpaperId || req.query.wallpaperId || '';
            if (wpId) {
                const key = 'wallpaper:downloads:' + wpId;
                if (useMemory) {
                    memoryCounts.set(key, (memoryCounts.get(key) || 0) + 1);
                } else {
                    await client.incr(key);
                    await client.expire(key, 86400 * 365);
                }
            }
        } catch (e) { console.error('[auth] download count error:', e.message); }
        // --- end count ---

        return res.status(200).json({ allowed: true, used: nextCount, limit, user: { email } });
    } catch (err) {
        console.error('[auth] downloadCheck error:', err.message);
        return res.status(503).json({
            error: 'Download service temporarily unavailable. Please try again.',
            allowed: false
        });
    }
}

// Main handler
export default async function handler(req, res) {
    // Set CORS headers
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));

    if (req.method === 'OPTIONS') return res.status(200).end();

    const action = req.query.action;

    try {
        switch (action) {
            case 'me':
                if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
                return await me(req, res);
            case 'download':
                if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
                return await downloadCheck(req, res);
            case 'stats':
                if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
                return await getStats(req, res);
            default:
                return res.status(400).json({ error: 'Unknown action' });
        }
    } catch (err) {
        console.error('[auth]', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
