/**
 * Unified Auth API
 * Routes: ?action=register|verify|login|me|download
 */
import {
    hashPassword, verifyPassword, signJWT, verifyJWT,
    saveUser, getUser, updateUser, setVerifyToken, getVerifyEmail, deleteVerifyToken,
    sendVerificationEmail
} from '../shared/auth.js';
import crypto from 'crypto';

// CORS headers
const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// POST /api/auth?action=register
async function register(req, res) {
    let body = req.body;
    if (!body || typeof body !== 'object') {
        try { body = JSON.parse(req.body || '{}'); } catch { body = {}; }
    }
    const { email, password } = body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await getUser(normalizedEmail);
    if (existing && existing.verified) {
        return res.status(409).json({ error: 'This email is already registered. Please log in.' });
    }

    const passwordHash = hashPassword(password);
    await saveUser(normalizedEmail, passwordHash);

    const verifyToken = crypto.randomBytes(32).toString('hex');
    await setVerifyToken(normalizedEmail, verifyToken);

    try {
        await sendVerificationEmail(normalizedEmail, verifyToken);
    } catch (mailErr) {
        console.error('Failed to send verification email:', mailErr.message);
        const baseUrl = process.env.SITE_URL || 'https://www.daoessentia.com';
        const fallbackUrl = `${baseUrl}/api/auth?action=verify&token=${verifyToken}&email=${encodeURIComponent(normalizedEmail)}`;
        return res.status(201).json({
            success: true,
            message: 'Registration successful, but verification email could not be sent. Use the link below to verify.',
            emailSent: false,
            verifyUrl: fallbackUrl
        });
    }

    const baseUrl = process.env.SITE_URL || 'https://www.daoessentia.com';
    const verifyUrl = `${baseUrl}/api/auth?action=verify&token=${verifyToken}&email=${encodeURIComponent(normalizedEmail)}`;
    return res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        emailSent: true,
        verifyUrl: verifyUrl
    });
}

// GET /api/auth?action=verify&token=xxx&email=xxx
async function verify(req, res) {
    const { token, email, lang } = req.query;
    if (!token || !email) {
        return res.status(400).send('Missing token or email parameter.');
    }

    const storedEmail = await getVerifyEmail(token);
    if (!storedEmail) {
        return res.status(400).send('Invalid or expired verification link. Please register again.');
    }
    if (storedEmail.toLowerCase() !== email.toLowerCase()) {
        return res.status(400).send('Email mismatch. Please use the link from your verification email.');
    }

    const user = await getUser(storedEmail);
    if (!user) {
        return res.status(400).send('User not found. Please register again.');
    }

    await updateUser(storedEmail, { verified: true });
    await deleteVerifyToken(token);

    const title = lang === 'zh' ? '邮箱验证成功' : 'Email Verified';
    const message = lang === 'zh'
        ? '你的邮箱已成功验证！你现在可以登录了。'
        : 'Your email has been verified! You can now sign in.';
    const loginText = lang === 'zh' ? '前往登录' : 'Go to Sign In';

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(`<!DOCTYPE html>
<html lang="${lang || 'en'}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} - DAO Essence</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0A0A0A;color:#fff;font-family:'Segoe UI',Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center}
.card{background:#1A1A1A;border:1px solid rgba(212,175,55,0.2);border-radius:12px;padding:48px 32px;max-width:400px;width:90%}
.icon{font-size:48px;margin-bottom:16px}
h1{font-family:Georgia,serif;color:#D4AF37;font-size:24px;margin-bottom:8px}
p{color:rgba(255,255,255,0.7);font-size:15px;margin-bottom:24px}
.btn{display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#D4AF37,#AA8A26);color:#0A0A0A;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px}
</style>
</head>
<body>
<div class="card"><div class="icon">✅</div><h1>${title}</h1><p>${message}</p><a href="/wallpaper" class="btn">${loginText}</a></div>
</body>
</html>`);
}

// POST /api/auth?action=login
async function login(req, res) {
    let body = req.body;
    if (!body || typeof body !== 'object') {
        try { body = JSON.parse(req.body || '{}'); } catch { body = {}; }
    }
    const { email, password } = body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await getUser(normalizedEmail);

    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    if (!user.verified) {
        // 邮件未验证 — 允许登录但标记状态
        const token = signJWT({ email: normalizedEmail }, '7d');
        return res.status(200).json({
            success: true, token, emailNotVerified: true,
            message: 'Logged in, but email not verified. Please check your inbox or spam folder.',
            user: { email: normalizedEmail, verified: false, downloadCount: 0, downloadDate: null }
        });
    }
    if (!verifyPassword(password, user.passwordHash)) return res.status(401).json({ error: 'Invalid email or password' });

    const token = signJWT({ email: normalizedEmail }, '7d');
    return res.status(200).json({
        success: true, token,
        user: { email: normalizedEmail, verified: user.verified, downloadCount: user.downloadCount || 0, downloadDate: user.downloadDate || null }
    });
}

// GET /api/auth?action=me
async function me(req, res) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    const token = auth.slice(7);
    const payload = verifyJWT(token);
    if (!payload) return res.status(401).json({ error: 'Invalid or expired token' });

    const user = await getUser(payload.email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.status(200).json({
        email: user.email, verified: user.verified,
        downloadCount: user.downloadCount || 0, downloadDate: user.downloadDate || null, createdAt: user.createdAt
    });
}

// POST /api/auth?action=download
async function downloadCheck(req, res) {
    const today = new Date().toISOString().slice(0, 10);
    const auth = req.headers.authorization;

    // Guest mode
    if (!auth || !auth.startsWith('Bearer ')) {
        const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
        const guestKey = 'guest_dl:' + ip + ':' + today;
        const { getRedis } = await import('../shared/redis.js');
        const client = getRedis();
        if (!client) return res.status(200).json({ allowed: true, used: 0, limit: 1 });

        const count = parseInt(await client.get(guestKey) || '0');
        if (count >= 1) {
            return res.status(429).json({ error: 'Daily download limit reached (1/day for guests). Sign in for 3/day.', allowed: false, used: 1, limit: 1 });
        }
        await client.set(guestKey, String(count + 1), 'EX', 86400);
        return res.status(200).json({ allowed: true, used: count + 1, limit: 1 });
    }

    // Logged in user
    const token = auth.slice(7);
    const payload = verifyJWT(token);
    if (!payload) return res.status(401).json({ error: 'Invalid or expired token' });

    const user = await getUser(payload.email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const limit = 3;
    const isToday = user.downloadDate === today;
    const count = isToday ? (user.downloadCount || 0) : 0;

    if (count >= limit) {
        return res.status(429).json({ error: 'Daily download limit reached (3/day).', allowed: false, used: limit, limit });
    }

    await updateUser(payload.email, { downloadCount: count + 1, downloadDate: today });
    return res.status(200).json({ allowed: true, used: count + 1, limit, user: { email: user.email } });
}

// Main handler — routes: GitHub OAuth (no action) or user auth (?action=xxx)
export default async function handler(req, res) {
    const action = req.query.action;

    // ── GitHub OAuth (DecapCMS admin login, no action param) ──
    if (!action) {
        const GITHUB_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID;
        if (!GITHUB_CLIENT_ID) {
            return res.status(500).send('Missing GITHUB_OAUTH_CLIENT_ID env var');
        }
        const origin = 'https://www.daoessentia.com';
        const callbackUrl = `${origin}/callback`;
        const state = Math.random().toString(36).substring(7);
        const githubAuthUrl =
            `https://github.com/login/oauth/authorize` +
            `?client_id=${encodeURIComponent(GITHUB_CLIENT_ID)}` +
            `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
            `&scope=repo` +
            `&state=${encodeURIComponent(state)}`;
        return res.redirect(302, githubAuthUrl);
    }

    // ── User Auth API ──
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        switch (action) {
            case 'register':
                if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
                return await register(req, res);
            case 'verify':
                if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
                return await verify(req, res);
            case 'login':
                if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
                return await login(req, res);
            case 'me':
                if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
                return await me(req, res);
            case 'download':
                if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
                return await downloadCheck(req, res);
            default:
                return res.status(400).json({ error: 'Unknown action. Use: register, verify, login, me, download' });
        }
    } catch (err) {
        console.error('Auth error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
