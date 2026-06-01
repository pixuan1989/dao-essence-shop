/**
 * GET /api/auth/me
 * 获取当前用户信息（需 JWT）
 * Header: Authorization: Bearer <token>
 */
import { verifyJWT, getUser } from '../../shared/auth.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const token = auth.slice(7);
        const payload = verifyJWT(token);
        if (!payload) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        const user = await getUser(payload.email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({
            email: user.email,
            verified: user.verified,
            downloadCount: user.downloadCount || 0,
            downloadDate: user.downloadDate || null,
            createdAt: user.createdAt
        });
    } catch (err) {
        console.error('Me error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
