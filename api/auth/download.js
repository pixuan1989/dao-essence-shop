/**
 * POST /api/auth/download
 * 下载计数 — 验证登录状态 + 配额检查
 * Header: Authorization: Bearer <token>
 * Body: { wallpaperId }
 * 
 * 游客: 1次/天, 登录: 3次/天, 订阅: 10次/天
 */
import { verifyJWT, getUser, updateUser } from '../../shared/auth.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const today = new Date().toISOString().slice(0, 10);

    // 提取 token
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        // 游客模式：检查 Redis 中的游客计数（IP 去重）
        const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
        const guestKey = 'guest_dl:' + ip + ':' + today;
        const { getRedis } = await import('../../shared/redis.js');
        const client = getRedis();
        if (!client) {
            return res.status(200).json({ allowed: true, used: 0, limit: 1 });
        }
        const count = parseInt(await client.get(guestKey) || '0');
        if (count >= 1) {
            return res.status(429).json({ error: 'Daily download limit reached (1/day for guests). Sign in for 3/day.', allowed: false, used: 1, limit: 1 });
        }
        // 允许下载
        await client.set(guestKey, String(count + 1), 'EX', 86400);
        return res.status(200).json({ allowed: true, used: count + 1, limit: 1 });
    }

    // 登录用户
    try {
        const token = auth.slice(7);
        const payload = verifyJWT(token);
        if (!payload) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        const user = await getUser(payload.email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const limit = 3; // 默认 3 次/天（后续可改为根据订阅等级）
        const isToday = user.downloadDate === today;
        const count = isToday ? (user.downloadCount || 0) : 0;

        if (count >= limit) {
            return res.status(429).json({
                error: 'Daily download limit reached (3/day).',
                allowed: false,
                used: limit,
                limit
            });
        }

        // 更新计数
        await updateUser(payload.email, {
            downloadCount: count + 1,
            downloadDate: today
        });

        return res.status(200).json({
            allowed: true,
            used: count + 1,
            limit,
            user: { email: user.email }
        });
    } catch (err) {
        console.error('Download check error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
