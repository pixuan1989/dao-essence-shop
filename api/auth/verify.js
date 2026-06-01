/**
 * GET /api/auth/verify?token=xxx&email=xxx
 * 验证邮箱
 */
import { getVerifyEmail, deleteVerifyToken, updateUser, getUser } from '../../shared/auth.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { token, email } = req.query;

    if (!token || !email) {
        return res.status(400).send('Missing token or email parameter.');
    }

    try {
        const storedEmail = await getVerifyEmail(token);

        if (!storedEmail) {
            return res.status(400).send('Invalid or expired verification link. Please register again.');
        }

        if (storedEmail.toLowerCase() !== email.toLowerCase()) {
            return res.status(400).send('Email mismatch. Please use the link from your verification email.');
        }

        // 验证用户
        const user = await getUser(storedEmail);
        if (!user) {
            return res.status(400).send('User not found. Please register again.');
        }

        await updateUser(storedEmail, { verified: true });
        await deleteVerifyToken(token);

        // 返回 HTML 页面告知验证成功
        const lang = req.query.lang || 'en';
        const title = lang === 'zh' ? '邮箱验证成功' : 'Email Verified';
        const message = lang === 'zh'
            ? '你的邮箱已成功验证！你现在可以登录了。'
            : 'Your email has been verified! You can now sign in.';
        const loginText = lang === 'zh' ? '前往登录' : 'Go to Sign In';

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.status(200).send(`<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} - DAO Essence</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0A0A0A;color:#fff;font-family:'Segoe UI',Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center}
.card{background:#1A1A1A;border:1px solid rgba(212,175,55,0.2);border-radius:12px;padding:48px 32px;max-width:400px;width:90%}
.icon{font-size:48px;margin-bottom:16px}
h1{font-family:Georgia,serif;color:#D4AF37;font-size:24px;margin-bottom:8px}
p{color:rgba(255,255,255,0.7);font-size:15px;margin-bottom:24px}
.btn{display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#D4AF37,#AA8A26);color:#0A0A0A;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;transition:opacity 0.2s}
.btn:hover{opacity:0.9}
</style>
</head>
<body>
<div class="card">
    <div class="icon">✅</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/wallpaper" class="btn">${loginText}</a>
</div>
</body>
</html>`);
    } catch (err) {
        console.error('Verify error:', err);
        res.status(500).send('Internal server error. Please try again later.');
    }
}
