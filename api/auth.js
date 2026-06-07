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
        // Clerk session token 是 JWT 格式 (base64url 编码)
        if (!token || token.length < 100) return null;
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        // 必须用 base64url（JWT 标准），不能用 base64
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
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
    // 使用北京时间（Asia/Shanghai）的自然日作为计数周期
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
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

    // Check Login Status
    const auth = req.headers.authorization;
    const payload = auth?.startsWith('Bearer ') ? await verifyClerkToken(auth.slice(7)) : null;
    const isLoggedIn = !!payload;

    // Determine Key and Limit based on status
    // 彻底抛弃 IP 限制，只认账号
    // 游客：按 IP 限制，每天 2 次
    // 登录用户：按账号限制，每天 5 次
    let trackingKey, limit;

    if (isLoggedIn) {
        // 已登录：Key = dl_user:{Email}:{Date}, Limit = 5
        const email = payload.email || payload.sub;
        trackingKey = `dl_user:${email.toLowerCase()}:${today}`;
        limit = 5;
    } else {
        // 游客：Key = dl:{IP}:{Date}, Limit = 2
        trackingKey = `dl:${ip}:${today}`;
        limit = 2;
    }

    try {
        // Get current count
        let currentCount = 0;
        if (useMemory) {
            currentCount = memoryCounts.get(trackingKey) || 0;
        } else {
            currentCount = parseInt(await client.get(trackingKey) || '0');
        }

        // Check Limit
        if (currentCount >= limit) {
            return res.status(429).json({
                error: isLoggedIn
                    ? '每日下载次数已达上限（5 次/天）'
                    : '每日下载次数已达上限（游客 2 次/天，登录后 5 次/天）',
                allowed: false,
                used: currentCount,
                limit: limit
            });
        }

        // Increment Count
        const nextCount = currentCount + 1;
        if (useMemory) {
            memoryCounts.set(trackingKey, nextCount);
        } else {
            await client.set(trackingKey, String(nextCount), { ex: 172800 });
        }

        // Record wallpaper download count (analytics)
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

        return res.status(200).json({ allowed: true, used: nextCount, limit: limit, isLoggedIn: isLoggedIn });

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
