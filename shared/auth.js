/**
 * 共享认证工具
 * - 密码哈希（scrypt）
 * - JWT 签发/验证
 * - 验证邮件发送
 */

import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { getRedis } from './redis.js';

// ==================== 密码哈希 ====================

const SALT_LEN = 32;
const KEY_LEN = 64;
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1 };

export function hashPassword(password) {
    const salt = crypto.randomBytes(SALT_LEN).toString('hex');
    const hash = crypto.scryptSync(password, salt, KEY_LEN, SCRYPT_OPTIONS);
    return salt + ':' + hash.toString('hex');
}

export function verifyPassword(password, stored) {
    const [salt, hash] = stored.split(':');
    const computed = crypto.scryptSync(password, salt, KEY_LEN, SCRYPT_OPTIONS).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
}

// ==================== JWT ====================

const JWT_SECRET = process.env.JWT_SECRET || 'daoessence-jwt-dev-secret-change-in-production';

function base64url(str) {
    return Buffer.from(str).toString('base64url');
}

export function signJWT(payload, expiresIn = '7d') {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const exp = expiresIn === '7d' ? now + 7 * 24 * 3600
        : expiresIn === '1h' ? now + 3600
        : now + parseInt(expiresIn);

    const body = { ...payload, iat: now, exp };
    const headerB64 = base64url(JSON.stringify(header));
    const bodyB64 = base64url(JSON.stringify(body));
    const signature = crypto.createHmac('sha256', JWT_SECRET)
        .update(headerB64 + '.' + bodyB64)
        .digest('base64url');

    return headerB64 + '.' + bodyB64 + '.' + signature;
}

export function verifyJWT(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const signature = crypto.createHmac('sha256', JWT_SECRET)
            .update(parts[0] + '.' + parts[1])
            .digest('base64url');
        if (signature !== parts[2]) return null;

        const body = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
        if (body.exp && body.exp < Math.floor(Date.now() / 1000)) return null;

        return body;
    } catch (e) {
        return null;
    }
}

// ==================== 邮件发送 ====================

let _smtpTransporter = null;

function getSmtpTransporter() {
    if (_smtpTransporter) return _smtpTransporter;
    const user = process.env.ALIYUN_EMAIL_ACCOUNT;
    const pass = process.env.ALIYUN_SMTP_PASSWORD;
    if (!user || !pass) throw new Error('SMTP配置缺失');
    _smtpTransporter = nodemailer.createTransport({
        host: 'smtpdm.aliyun.com',
        port: 465,
        secure: true,
        auth: { user, pass },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 15000
    });
    return _smtpTransporter;
}

export async function sendVerificationEmail(to, token) {
    const baseUrl = process.env.SITE_URL || 'https://www.daoessentia.com';
    const verifyUrl = `${baseUrl}/api/auth/verify?token=${token}&email=${encodeURIComponent(to)}`;

    const html = `
        <div style="max-width:560px;margin:0 auto;font-family:'Segoe UI',Arial,sans-serif;">
            <div style="background:linear-gradient(135deg,#D4AF37,#AA8A26);padding:28px 32px;text-align:center;">
                <h1 style="margin:0;color:#0A0A0A;font-size:22px;font-family:Georgia,serif;">DAO ESSENCE</h1>
            </div>
            <div style="padding:32px;background:#fff;color:#333;font-size:15px;line-height:1.7;">
                <p>Hi,</p>
                <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
                <div style="text-align:center;margin:28px 0;">
                    <a href="${verifyUrl}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#D4AF37,#AA8A26);color:#0A0A0A;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Verify Email</a>
                </div>
                <p style="color:#888;font-size:13px;">Or copy this link: <br><a href="${verifyUrl}" style="color:#D4AF37;">${verifyUrl}</a></p>
                <p style="color:#888;font-size:13px;">This link expires in 24 hours.</p>
                <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
                <p style="color:#888;font-size:12px;">If you didn't create this account, please ignore this email.</p>
            </div>
        </div>`;

    const transporter = getSmtpTransporter();
    const account = process.env.ALIYUN_EMAIL_ACCOUNT;

    await transporter.sendMail({
        from: `"DAO Essence" <${account}>`,
        to,
        subject: 'Verify your email - DAO Essence',
        html
    });
}

// ==================== 用户 Redis 操作 ====================

const USER_PREFIX = 'user:';
const VERIFY_PREFIX = 'verify:';

export async function saveUser(email, passwordHash) {
    const client = getRedis();
    if (!client) return false;
    const key = USER_PREFIX + email.toLowerCase();
    await client.set(key, JSON.stringify({
        email: email.toLowerCase(),
        passwordHash,
        verified: false,
        createdAt: new Date().toISOString(),
        downloadCount: 0,
        downloadDate: null
    }));
    return true;
}

export async function getUser(email) {
    const client = getRedis();
    if (!client) return null;
    const key = USER_PREFIX + email.toLowerCase();
    const val = await client.get(key);
    return val ? JSON.parse(val) : null;
}

export async function updateUser(email, updates) {
    const user = await getUser(email);
    if (!user) return false;
    const updated = { ...user, ...updates };
    const client = getRedis();
    if (!client) return false;
    const key = USER_PREFIX + email.toLowerCase();
    await client.set(key, JSON.stringify(updated));
    return true;
}

export async function setVerifyToken(email, token) {
    const client = getRedis();
    if (!client) return false;
    await client.set(VERIFY_PREFIX + token, email.toLowerCase(), 'EX', 86400); // 24h TTL
    return true;
}

export async function getVerifyEmail(token) {
    const client = getRedis();
    if (!client) return null;
    return await client.get(VERIFY_PREFIX + token);
}

export async function deleteVerifyToken(token) {
    const client = getRedis();
    if (!client) return;
    await client.del(VERIFY_PREFIX + token);
}
