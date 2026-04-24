/**
 * ============================================
 * DAO Essence - 营销邮件 API（自包含版）
 * Vercel Functions
 * ============================================
 * 
 * GET  /api/marketing - 获取订阅者/收件人列表
 * POST /api/marketing - 发送营销邮件（预览/批量）
 * 
 * Header: Authorization: Bearer <ADMIN_KEY>
 */

import crypto from 'crypto';
import { redisGet, redisSet } from '../shared/redis.js';
import nodemailer from 'nodemailer';

// ==================== 阿里云邮件推送签名（联系表单用） ====================

function getAliyunSign(params, secret) {
    const sortedKeys = Object.keys(params).sort();
    const canonicalized = sortedKeys
        .map(k => percentEncode(k) + '=' + percentEncode(params[k]))
        .join('&');
    const stringToSign = 'POST&' + percentEncode('/') + '&' + percentEncode(canonicalized);
    return crypto
        .createHmac('sha1', secret + '&')
        .update(stringToSign)
        .digest('base64');
}

function percentEncode(str) {
    return encodeURIComponent(String(str))
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A')
        .replace(/~/g, '%7E');
}

// 发送单封邮件（阿里云邮件推送，原生 fetch）
async function sendAliyunMail({ to, subject, htmlBody, textBody, fromAlias, tagName, replyToAddress }) {
    const accessKeyId = process.env.ALIYUN_ACCESS_KEY;
    const accessKeySecret = process.env.ALIYUN_ACCESS_SECRET;
    const account = process.env.ALIYUN_EMAIL_ACCOUNT;

    if (!accessKeyId || !accessKeySecret || !account) {
        throw new Error('阿里云配置缺失：ALIYUN_ACCESS_KEY/ALIYUN_ACCESS_SECRET/ALIYUN_EMAIL_ACCOUNT');
    }

    const params = {
        Action: 'SingleSendMail',
        AccountName: account,
        AddressType: 1,
        Format: 'JSON',
        Version: '2015-11-23',
        AccessKeyId: accessKeyId,
        SignatureMethod: 'HMAC-SHA1',
        SignatureVersion: '1.0',
        SignatureNonce: crypto.randomUUID(),
        Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
        ToAddress: to,
        Subject: subject,
        HtmlBody: htmlBody,
        FromAlias: fromAlias || 'DAO Essence Website',
        ReplyToAddress: replyToAddress !== false,
    };

    if (textBody) params.TextBody = textBody;
    if (tagName) params.TagName = tagName;

    params.Signature = getAliyunSign(params, accessKeySecret);

    const response = await fetch('https://dm.aliyuncs.com/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: Object.entries(params)
            .map(([k, v]) => `${percentEncode(k)}=${percentEncode(v)}`)
            .join('&')
    });

    const result = await response.json();
    if (result.Code) {
        throw new Error(`阿里云邮件API错误: ${result.Code} - ${result.Message}`);
    }
    return result;
}

// 主题映射（联系表单）
const SUBJECT_MAP = {
    'bazi-consultation': 'BaZi Consultation',
    'feng-shui': 'Feng Shui',
    'five-elements': 'Five Elements',
    'general': 'General Inquiry'
};

// 简单的垃圾内容过滤
function isSpam(text) {
    const spamPatterns = [
        /(?:http|https):\/\/[^\s]+/i,
        /(?:buy|cheap|viagra|casino|lottery|prize|winner|click\s+here|free\s+money)/i,
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
    ];
    return spamPatterns.some(pattern => pattern.test(text));
}

// ==================== 邮件发送核心（SMTP） ====================

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// 创建 SMTP transporter（懒加载，每次调用复用）
let _smtpTransporter = null;

function getSmtpTransporter() {
    if (_smtpTransporter) return _smtpTransporter;

    const smtpUser = process.env.ALIYUN_EMAIL_ACCOUNT;
    const smtpPass = process.env.ALIYUN_SMTP_PASSWORD;

    if (!smtpUser || !smtpPass) {
        throw new Error('SMTP配置缺失（ALIYUN_EMAIL_ACCOUNT/ALIYUN_SMTP_PASSWORD）');
    }

    _smtpTransporter = nodemailer.createTransport({
        host: 'smtpdm.aliyun.com',
        port: 465,
        secure: true,
        auth: {
            user: smtpUser,
            pass: smtpPass
        },
        // 超时设置
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 15000
    });

    return _smtpTransporter;
}

async function sendSingleMail({ to, subject, htmlBody, textBody, fromAlias, images }) {
    const transporter = getSmtpTransporter();
    const account = process.env.ALIYUN_EMAIL_ACCOUNT;

    const mailOptions = {
        from: `"${fromAlias || 'DAO Essence'}" <${account}>`,
        to: to,
        subject: subject,
        html: htmlBody,
        text: textBody || htmlBody.replace(/<[^>]*>/g, ''),
        attachments: (images || []).map(img => ({
            filename: img.filename,
            content: img.content,
            encoding: img.encoding || 'base64',
            cid: `<${img.cid}>`  // nodemailer CID 引用
        }))
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ 邮件发送成功: ${to} ( messageId: ${result.messageId}, 附件: ${(images||[]).length}张 )`);
    return result;
}

function getEmailWrapper(title, contentHtml) {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title || 'DAO Essence')}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#667eea,#764ba2);padding:30px 40px;text-align:center;">
<h1 style="margin:0;color:#fff;font-size:24px;font-weight:600;">${escapeHtml(title || 'DAO Essence')}</h1>
</td></tr>
<tr><td style="padding:30px 40px;line-height:1.7;color:#333;font-size:15px;">
${contentHtml}
</td></tr>
<tr><td style="padding:20px 40px;text-align:center;border-top:1px solid #eee;">
<p style="margin:0;color:#999;font-size:12px;">
© ${new Date().getFullYear()} DAO Essence · <a href="https://www.daoessentia.com" style="color:#667eea;text-decoration:none;">www.daoessentia.com</a>
</p>
</td></tr>
</table>
</body>
</html>`;
}

async function sendBulkMail(recipients, options, renderFn, onProgress) {
    let sent = 0, failed = 0;
    const errors = [];

    for (let i = 0; i < recipients.length; i++) {
        const r = recipients[i];
        try {
            const rendered = renderFn(r);
            await sendSingleMail({
                to: r.email,
                subject: rendered.subject,
                htmlBody: rendered.htmlBody,
                textBody: rendered.textBody,
                fromAlias: options.fromAlias,
                images: options.images
            });
            sent++;
            if (onProgress) onProgress(i + 1, recipients.length, r.email, 'sent');
        } catch (err) {
            failed++;
            const errMsg = err.message || err.code || JSON.stringify(err);
            errors.push({ email: r.email, error: errMsg, fullError: err.toString() });
            console.error(`❌ 发送失败 ${r.email}:`, err);
            if (onProgress) onProgress(i + 1, recipients.length, r.email, `failed: ${errMsg}`);
        }
    }

    return { sent, failed, errors };
}

// ==================== POST: 联系表单邮件发送（无需认证） ====================

async function handleContactForm(req, res) {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Name is required' });
        }
        if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Valid email is required' });
        }
        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }
        if (message.length > 5000) {
            return res.status(400).json({ error: 'Message is too long (max 5000 characters)' });
        }

        // 垃圾内容过滤
        if (isSpam(message) || isSpam(name)) {
            console.log('Spam detected, rejecting silently');
            return res.status(200).json({ success: true, message: 'Thank you for your message!' });
        }

        const subjectLabel = SUBJECT_MAP[subject] || subject || 'General Inquiry';
        const timestamp = new Date().toLocaleString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
        });

        // Send via Aliyun
        await sendAliyunMail({
            to: 'support@daoessentia.com',
            subject: `[Contact Form] ${subjectLabel} - from ${name.trim()}`,
            tagName: 'contact',
            replyToAddress: true,
            htmlBody: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f0e6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
        <div style="text-align:center;margin-bottom:30px;">
            <h1 style="margin:0;font-size:24px;color:#1a1a1a;">DAO Essence</h1>
            <p style="margin:5px 0 0;font-size:14px;color:#888;">New Contact Form Submission</p>
        </div>
        <div style="background:white;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);overflow:hidden;">
            <div style="height:4px;background:linear-gradient(90deg,#D4AF37,#1a1a1a);"></div>
            <div style="padding:25px 30px;">
                <table style="width:100%;font-size:14px;border-collapse:collapse;">
                    <tr><td style="padding:10px 0;color:#888;width:30%;vertical-align:top;">Name</td><td style="padding:10px 0;color:#1a1a1a;font-weight:500;">${escapeHtml(name)}</td></tr>
                    <tr><td colspan="2" style="padding:0;border-bottom:1px solid #f0f0f0;"></td></tr>
                    <tr><td style="padding:10px 0;color:#888;vertical-align:top;">Email</td><td style="padding:10px 0;color:#1a1a1a;"><a href="mailto:${escapeHtml(email)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(email)}</a></td></tr>
                    <tr><td colspan="2" style="padding:0;border-bottom:1px solid #f0f0f0;"></td></tr>
                    <tr><td style="padding:10px 0;color:#888;vertical-align:top;">Subject</td><td style="padding:10px 0;color:#1a1a1a;font-weight:500;">${escapeHtml(subjectLabel)}</td></tr>
                    <tr><td colspan="2" style="padding:0;border-bottom:1px solid #f0f0f0;"></td></tr>
                    <tr><td style="padding:10px 0;color:#888;vertical-align:top;">Message</td><td style="padding:10px 0;color:#333;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</td></tr>
                </table>
            </div>
        </div>
        <p style="text-align:center;font-size:12px;color:#aaa;margin-top:20px;">Submitted on ${timestamp}</p>
    </div>
</body>
</html>`,
            textBody: `DAO Essence - New Contact Form Submission\n\nName: ${name}\nEmail: ${email}\nSubject: ${subjectLabel}\n\nMessage:\n${message}\n\nSubmitted on ${timestamp}`
        });

        console.log(`Contact email sent from ${email}`);

        // Write Redis: contact_subscribers
        try {
            const contactData = {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                subject: subject || 'general',
                subjectLabel: subjectLabel,
                message: message.trim(),
                date: new Date().toISOString()
            };
            let contacts = await redisGet('contact_subscribers') || [];
            contacts.unshift(contactData);
            if (contacts.length > 500) contacts = contacts.slice(0, 500);
            await redisSet('contact_subscribers', contacts);
        } catch (redisErr) {
            console.error('Redis save failed (non-fatal):', redisErr.message);
        }

        // Add to marketing pool
        try {
            const normalizedEmail = email.trim().toLowerCase();
            let subscribers = await redisGet('marketing_subscribers') || [];
            const exists = subscribers.some(s => s.email && s.email.toLowerCase() === normalizedEmail);
            if (!exists) {
                subscribers.unshift({
                    email: normalizedEmail,
                    name: name.trim(),
                    source: 'contact_form',
                    subscribedAt: new Date().toISOString()
                });
                await redisSet('marketing_subscribers', subscribers);
            }
        } catch (redisErr) {
            console.error('Marketing pool update failed (non-fatal):', redisErr.message);
        }

        return res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending contact email:', error);
        return res.status(500).json({ error: 'Failed to send message. Please try again later.', debug: error.message });
    }
}

// ==================== 主处理器 ====================

export default async function handler(req, res) {
    // 联系表单无需认证（公开 API）
    if (req.method === 'POST' && req.body?.contactForm) {
        return handleContactForm(req, res);
    }
    // Quiz lead 收集无需认证（公开 API）
    if (req.method === 'POST' && req.body?.quizLead) {
        return handleQuizLead(req, res);
    }

    const authHeader = req.headers['authorization'];
    const adminKey = process.env.ADMIN_KEY;

    if (!adminKey || !authHeader || authHeader !== `Bearer ${adminKey}`) {
        return res.status(401).json({ error: '未授权' });
    }

    if (req.method === 'GET') {
        return handleGetSubscribers(req, res);
    } else if (req.method === 'POST') {
        // 检查是否是添加订阅者请求
        if (req.body?.addSubscriber) {
            return handleAddSubscriber(req, res);
        }
        return handleSendMarketing(req, res);
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}

// ==================== POST: 五行测试 Lead 收集（无需认证） ====================

async function handleQuizLead(req, res) {
    try {
        const lead = req.body.quizLead;
        const {
            email,
            birth_year,
            birth_month,
            birth_day,
            birth_hour,
            gender,
            quiz_answers,
            wuxing_result,
            name
        } = lead;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        if (!birth_year || !birth_month || !birth_day) {
            return res.status(400).json({ error: 'Birth date is required' });
        }

        console.log('🎯 Five Elements Quiz Lead:', email);

        const leadId = `WX_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        const leadData = {
            id: leadId,
            type: 'wuxing_quiz',
            email: email.toLowerCase().trim(),
            name: name || '',
            birthYear: String(birth_year),
            birthMonth: String(birth_month),
            birthDay: String(birth_day),
            birthHour: String(birth_hour || -1),
            gender: gender || '',
            quizAnswers: quiz_answers || {},
            wuxingResult: wuxing_result || {},
            createdAt: new Date().toISOString()
        };

        try {
            await redisSet(`wuxing_lead:${leadId}`, leadData);
            let leadIds = await redisGet('wuxing_lead_ids') || [];
            leadIds.unshift(leadId);
            if (leadIds.length > 1000) leadIds = leadIds.slice(0, 1000);
            await redisSet('wuxing_lead_ids', leadIds);

            // 同时写入营销订阅者列表
            let subscribers = await redisGet('marketing_subscribers') || [];
            const exists = subscribers.some(s =>
                s.email && s.email.toLowerCase() === email.toLowerCase()
            );
            if (!exists) {
                subscribers.unshift({
                    email: email.toLowerCase().trim(),
                    name: name || '',
                    source: 'wuxing_quiz',
                    subscribedAt: new Date().toISOString(),
                    birthInfo: {
                        year: String(birth_year),
                        month: String(birth_month),
                        day: String(birth_day),
                        hour: String(birth_hour || -1),
                        gender: gender || ''
                    },
                    dominantElement: wuxing_result?.dominant || ''
                });
                await redisSet('marketing_subscribers', subscribers);
            }

            console.log(`✅ Quiz lead saved: ${leadId}`);
        } catch (redisErr) {
            console.error('❌ Redis save failed:', redisErr.message);
            // 降级：仍然返回成功
        }

        return res.status(200).json({ success: true, leadId });

    } catch (error) {
        console.error('❌ Quiz lead error:', error);
        return res.status(500).json({ error: 'Failed to save lead' });
    }
}

// ==================== POST: 添加订阅者 ====================

async function handleAddSubscriber(req, res) {
    try {
        const { name, email } = req.body.addSubscriber;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: '邮箱格式无效' });
        }

        // 获取现有手动订阅者列表
        const existing = await redisGet('manual_subscribers') || [];
        const normalizedEmail = email.toLowerCase().trim();

        // 检查是否已存在
        const alreadyExists = existing.some(s => s.email && s.email.toLowerCase().trim() === normalizedEmail);
        if (alreadyExists) {
            return res.status(409).json({ error: '该邮箱已在订阅列表中' });
        }

        // 添加新订阅者
        existing.push({
            email: normalizedEmail,
            name: (name || '').trim(),
            source: 'manual',
            sourceLabel: '手动添加',
            date: new Date().toISOString()
        });

        await redisSet('manual_subscribers', existing);
        console.log(`✅ 手动添加订阅者: ${normalizedEmail}`);

        return res.status(200).json({
            success: true,
            message: `已添加订阅者: ${normalizedEmail}`
        });

    } catch (error) {
        console.error('❌ 添加订阅者失败:', error);
        return res.status(500).json({
            error: '添加订阅者失败',
            detail: error.message
        });
    }
}

// ==================== GET: 获取订阅者列表 ====================

async function handleGetSubscribers(req, res) {
    try {
        console.log('========== 获取订阅者列表 ==========');

        const allEmails = new Map();

        // 1. 从八字订单获取邮箱
        try {
            const orderIds = await redisGet('bazi_order_ids') || [];
            for (const id of orderIds) {
                const order = await redisGet(`bazi_order:${id}`);
                if (order && order.email) {
                    const email = order.email.toLowerCase().trim();
                    if (!allEmails.has(email)) {
                        allEmails.set(email, {
                            email: order.email,
                            name: order.name || '',
                            source: 'bazi_order',
                            sourceLabel: '八字订单',
                            orderId: order.orderId || id,
                            amount: order.amount || 0,
                            date: order.createdAt || ''
                        });
                    }
                }
            }
            console.log(`📦 八字订单邮箱: ${allEmails.size} 个`);
        } catch (err) {
            console.error('❌ 获取八字订单邮箱失败:', err.message);
        }

        // 如果 Redis 里没有八字订单，尝试从 Creem 回填
        if (allEmails.size === 0) {
            console.log('⚠️ Redis 无八字订单数据，尝试从 Creem 获取...');
            try {
                const creemOrders = await fetchCreemOrders();
                for (const order of creemOrders) {
                    if (order.email) {
                        const email = order.email.toLowerCase().trim();
                        if (!allEmails.has(email)) {
                            allEmails.set(email, {
                                email: order.email,
                                name: order.name || '',
                                source: 'bazi_order',
                                sourceLabel: '八字订单',
                                orderId: order.orderId || '',
                                amount: order.amount || 0,
                                date: order.createdAt || ''
                            });
                        }
                    }
                }
                console.log(`📦 Creem 回填邮箱: ${allEmails.size} 个`);
            } catch (err) {
                console.error('❌ Creem 回填失败:', err.message);
            }
        }

        // 2. 从联系表单获取邮箱
        try {
            const contactEmails = await redisGet('contact_subscribers') || [];
            for (const item of contactEmails) {
                const email = (item.email || '').toLowerCase().trim();
                if (email && !allEmails.has(email)) {
                    allEmails.set(email, {
                        email: item.email,
                        name: item.name || '',
                        source: 'contact_form',
                        sourceLabel: '联系表单',
                        date: item.date || item.createdAt || ''
                    });
                }
            }
            console.log(`📬 联系表单邮箱: ${contactEmails.length} 个`);
        } catch (err) {
            console.error('❌ 获取联系表单邮箱失败:', err.message);
        }

        // 3. 从商城订单获取邮箱
        try {
            const shopOrderIds = await redisGet('shop_order_ids') || [];
            for (const id of shopOrderIds) {
                const order = await redisGet(`shop_order:${id}`);
                if (order && order.email) {
                    const email = (order.email || '').toLowerCase().trim();
                    if (!allEmails.has(email)) {
                        allEmails.set(email, {
                            email: order.email,
                            name: order.name || '',
                            source: 'shop_order',
                            sourceLabel: '商城订单',
                            orderId: order.orderId || id,
                            amount: order.amount || 0,
                            date: order.createdAt || ''
                        });
                    }
                }
            }
            console.log(`🛒 商城订单邮箱: ${shopOrderIds.length} 个`);
        } catch (err) {
            console.error('❌ 获取商城订单邮箱失败:', err.message);
        }

        // 4. 从黄历订单获取邮箱
        try {
            const almanacOrderIds = await redisGet('almanac_order_ids') || [];
            for (const id of almanacOrderIds) {
                const order = await redisGet(`almanac_order:${id}`);
                if (order && order.email) {
                    const email = (order.email || '').toLowerCase().trim();
                    if (!allEmails.has(email)) {
                        allEmails.set(email, {
                            email: order.email,
                            name: order.name || '',
                            source: 'almanac_order',
                            sourceLabel: '黄历解锁',
                            orderId: order.orderId || id,
                            amount: order.amount || 0,
                            date: order.createdAt || ''
                        });
                    }
                }
            }
            console.log(`📅 黄历订单邮箱: ${almanacOrderIds.length} 个`);
        } catch (err) {
            console.error('❌ 获取黄历订单邮箱失败:', err.message);
        }

        // 5. 从付费意向（未支付）获取邮箱
        try {
            const intentIds = await redisGet('checkout_intent_ids') || [];
            for (const id of intentIds) {
                const intent = await redisGet(`checkout_intent:${id}`);
                if (intent && intent.email) {
                    const email = (intent.email || '').toLowerCase().trim();
                    if (!allEmails.has(email)) {
                        allEmails.set(email, {
                            email: intent.email,
                            name: intent.name || '',
                            source: 'bazi_intent',
                            sourceLabel: '八字未支付',
                            orderId: intent.orderId || id,
                            date: intent.createdAt || ''
                        });
                    }
                }
            }
            console.log(`📋 付费意向邮箱: ${intentIds.length} 个`);
        } catch (err) {
            console.error('❌ 获取付费意向邮箱失败:', err.message);
        }

        // 6. 手动添加的订阅者
        try {
            const manualSubscribers = await redisGet('manual_subscribers') || [];
            for (const item of manualSubscribers) {
                const email = (item.email || '').toLowerCase().trim();
                if (email && !allEmails.has(email)) {
                    allEmails.set(email, {
                        email: item.email,
                        name: item.name || '',
                        source: 'manual',
                        sourceLabel: '手动添加',
                        date: item.date || item.createdAt || ''
                    });
                }
            }
            console.log(`✏️ 手动订阅者: ${manualSubscribers.length} 个`);
        } catch (err) {
            console.error('❌ 获取手动订阅者失败:', err.message);
        }

        const subscribers = Array.from(allEmails.values());

        const stats = {
            total: subscribers.length,
            baziOrders: subscribers.filter(s => s.source === 'bazi_order').length,
            shopOrders: subscribers.filter(s => s.source === 'shop_order').length,
            almanacOrders: subscribers.filter(s => s.source === 'almanac_order').length,
            contactForm: subscribers.filter(s => s.source === 'contact_form').length,
            manual: subscribers.filter(s => s.source === 'manual').length
        };

        console.log(`✅ 共 ${stats.total} 个订阅者（去重后）`);

        return res.status(200).json({
            success: true,
            subscribers: subscribers,
            stats: stats
        });

    } catch (error) {
        console.error('❌ 获取订阅者列表失败:', error);
        return res.status(500).json({
            error: '获取订阅者列表失败',
            detail: error.message
        });
    }
}

// ==================== POST: 发送营销邮件 ====================

async function handleSendMarketing(req, res) {
    try {
        const {
            recipients,
            subject,
            htmlContent,
            title,
            fromAlias,
            replyTo = true,
            previewEmail,
            images
        } = req.body;

        if (!subject || !subject.trim()) {
            return res.status(400).json({ error: '邮件主题不能为空' });
        }
        if (!htmlContent || !htmlContent.trim()) {
            return res.status(400).json({ error: '邮件内容不能为空' });
        }

        // 预览模式：只发一封
        if (previewEmail) {
            const fullHtml = getEmailWrapper(title || '', htmlContent);
            await sendSingleMail({
                to: previewEmail,
                subject: `[Preview] ${subject}`,
                htmlBody: fullHtml,
                fromAlias: fromAlias || 'DAO Essence',
                images
            });

            return res.status(200).json({
                success: true,
                message: '预览邮件已发送',
                previewTo: previewEmail
            });
        }

        // 批量发送
        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({ error: '收件人列表不能为空' });
        }

        const validRecipients = recipients.filter(r => {
            return r.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email);
        });

        if (validRecipients.length === 0) {
            return res.status(400).json({ error: '没有有效的收件人邮箱' });
        }

        const renderFn = (recipient) => {
            const personalContent = htmlContent
                .replace(/\{\{name\}\}/g, escapeHtml(recipient.name || 'Friend'))
                .replace(/\{\{email\}\}/g, escapeHtml(recipient.email));

            const fullHtml = getEmailWrapper(title || '', personalContent);
            const textContent = `DAO Essence\n\n${subject}\n\n${personalContent.replace(/<[^>]*>/g, '')}\n\n---\nwww.daoessentia.com`;

            return {
                htmlBody: fullHtml,
                subject: subject,
                textBody: textContent
            };
        };

        const MAX_RECIPIENTS = 50;
        const toSend = validRecipients.slice(0, MAX_RECIPIENTS);

        if (validRecipients.length > MAX_RECIPIENTS) {
            console.log(`⚠️ 收件人超过 ${MAX_RECIPIENTS}，仅发送前 ${MAX_RECIPIENTS} 封`);
        }

        const results = await sendBulkMail(
            toSend,
            {
                fromAlias: fromAlias || 'DAO Essence',
                images
            },
            renderFn,
            (index, total, email, status) => {
                console.log(`📧 [${index}/${total}] ${email}: ${status}`);
            }
        );

        return res.status(200).json({
            success: true,
            total: toSend.length,
            sent: results.sent,
            failed: results.failed,
            errors: results.errors,
            truncated: validRecipients.length > MAX_RECIPIENTS,
            totalRecipients: validRecipients.length
        });

    } catch (error) {
        console.error('❌ 营销邮件发送失败:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// ==================== Creem 订单获取 ====================

async function fetchCreemOrders() {
    const prodApiKey = process.env.CREEM_API_KEY?.trim();
    const testApiKey = process.env.CREEM_TEST_API_KEY?.trim() || prodApiKey;

    if (!prodApiKey) return [];

    const allOrders = [];
    const envs = [
        { name: '生产', baseUrl: 'https://api.creem.io/v1', apiKey: prodApiKey },
        { name: '测试', baseUrl: 'https://test-api.creem.io/v1', apiKey: testApiKey }
    ];

    for (const env of envs) {
        try {
            let page = 1;
            let hasMore = true;

            while (hasMore) {
                const url = `${env.baseUrl}/transactions/search?page_number=${page}&page_size=50`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: { 'x-api-key': env.apiKey }
                });

                if (!response.ok) break;

                const result = await response.json();
                const items = result.items || [];
                const paid = items.filter(t => t.status === 'succeeded' || t.status === 'completed');

                for (const tx of paid) {
                    const checkoutId = tx.order || tx.checkout_id || tx.checkout;
                    if (!checkoutId) continue;

                    try {
                        const detailUrl = `${env.baseUrl}/checkouts/${checkoutId}`;
                        const detailRes = await fetch(detailUrl, {
                            method: 'GET',
                            headers: { 'x-api-key': env.apiKey }
                        });

                        if (!detailRes.ok) continue;

                        const checkout = await detailRes.json();
                        const metadata = checkout.metadata || {};

                        if (metadata.product_type !== 'bazi_analysis') continue;

                        allOrders.push({
                            email: metadata.email || checkout.customer?.email || '',
                            name: metadata.name || checkout.customer?.name || '',
                            orderId: metadata.order_id || checkout.id,
                            amount: checkout.amount ? (checkout.amount / 100) : 0,
                            createdAt: checkout.created_at || tx.created_at || ''
                        });
                    } catch (err) {
                        // skip
                    }
                }

                if (result.pagination && result.pagination.next_page) {
                    page = result.pagination.next_page;
                } else {
                    hasMore = false;
                }

                if (page > 10) hasMore = false;
            }
        } catch (err) {
            // skip
        }
    }

    return allOrders;
}
