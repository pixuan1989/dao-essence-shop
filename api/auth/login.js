/**
 * POST /api/auth/login
 * 登录 — 返回 JWT token
 * Body: { email, password }
 */
import { getUser, verifyPassword, signJWT } from '../../shared/auth.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        let body = req.body;
        if (!body || typeof body !== 'object') {
            body = JSON.parse(req.body || '{}');
        }

        const { email, password } = body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await getUser(normalizedEmail);

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (!user.verified) {
            return res.status(403).json({ error: 'Please verify your email before logging in. Check your inbox.', notVerified: true });
        }

        if (!verifyPassword(password, user.passwordHash)) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = signJWT({ email: normalizedEmail }, '7d');

        return res.status(200).json({
            success: true,
            token,
            user: {
                email: normalizedEmail,
                verified: user.verified,
                downloadCount: user.downloadCount || 0,
                downloadDate: user.downloadDate || null
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
