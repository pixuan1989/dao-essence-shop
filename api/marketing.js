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

import { redisGet, redisSet } from '../shared/redis.js';
import nodemailer from 'nodemailer';

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

async function sendSingleMail({ to, subject, htmlBody, textBody, fromAlias }) {
    const transporter = getSmtpTransporter();
    const account = process.env.ALIYUN_EMAIL_ACCOUNT;

    const mailOptions = {
        from: `"${fromAlias || 'DAO Essence'}" <${account}>`,
        to: to,
        subject: subject,
        html: htmlBody,
        text: textBody || htmlBody.replace(/<[^>]*>/g, '')
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ 邮件发送成功: ${to} ( messageId: ${result.messageId} )`);
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
                fromAlias: options.fromAlias
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

// ==================== 主处理器 ====================

export default async function handler(req, res) {
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

        // 3. 手动添加的订阅者
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
            previewEmail
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
                fromAlias: fromAlias || 'DAO Essence'
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
                fromAlias: fromAlias || 'DAO Essence'
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
