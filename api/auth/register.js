/**
 * POST /api/auth/register
 * 邮箱注册 — 发验证邮件
 * Body: { email, password }
 */
import { hashPassword, saveUser, setVerifyToken, sendVerificationEmail } from '../../shared/auth.js';
import crypto from 'crypto';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        let body = req.body;
        if (!body || typeof body !== 'object') {
            body = JSON.parse(req.body || '{}');
        }

        const { email, password } = body;

        // 校验
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

        // 检查是否已注册
        const { getUser } = await import('../../shared/auth.js');
        const existing = await getUser(normalizedEmail);
        if (existing && existing.verified) {
            return res.status(409).json({ error: 'This email is already registered. Please log in.' });
        }

        // 保存用户
        const passwordHash = hashPassword(password);
        await saveUser(normalizedEmail, passwordHash);

        // 生成验证 token
        const verifyToken = crypto.randomBytes(32).toString('hex');
        await setVerifyToken(normalizedEmail, verifyToken);

        // 发送验证邮件
        try {
            await sendVerificationEmail(normalizedEmail, verifyToken);
        } catch (mailErr) {
            console.error('Failed to send verification email:', mailErr.message);
            // 注册成功但邮件发送失败 — 仍然返回成功，提示用户
            return res.status(201).json({
                success: true,
                message: 'Registration successful, but verification email could not be sent. Please contact support.',
                emailSent: false
            });
        }

        return res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email to verify your account.',
            emailSent: true
        });
    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
