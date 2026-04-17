/**
 * ============================================
 * DAO Essence - 联系表单邮件发送服务（阿里云邮件推送）
 * Vercel Functions 版本
 * ============================================
 * 
 * POST /api/send-contact-email
 * Body: { name, email, subject, message }
 * 接收联系表单提交，通过阿里云邮件推送发送到 support@daoessentia.com
 * 通过 ImprovMX 自动转发到 QQ 邮箱
 */

import crypto from 'crypto';

// ==================== 阿里云邮件推送签名 ====================

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

// 发送单封邮件（原生 fetch，不依赖 @alicloud/pop-core）
async function sendMail({ to, subject, htmlBody, textBody, fromAlias, tagName, replyToAddress }) {
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

// 主题映射
const SUBJECT_MAP = {
    'bazi-consultation': 'BaZi Consultation',
    'feng-shui': 'Feng Shui',
    'five-elements': 'Five Elements',
    'general': 'General Inquiry'
};

// 简单的垃圾内容过滤
function isSpam(text) {
    const spamPatterns = [
        /(?:http|https):\/\/[^\s]+/i,  // 链接
        /(?:buy|cheap|viagra|casino|lottery|prize|winner|click\s+here|free\s+money)/i,
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi  // script 标签
    ];
    return spamPatterns.some(pattern => pattern.test(text));
}

// 发送联系表单邮件
async function sendContactEmail(data) {
    const { name, email, subject, message } = data;

    const subjectLabel = SUBJECT_MAP[subject] || subject || 'General Inquiry';
    const timestamp = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    });

    return sendMail({
        to: 'support@daoessentia.com',
        subject: `[Contact Form] ${subjectLabel} - from ${name}`,
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
        <!-- Header -->
        <div style="text-align:center;margin-bottom:30px;">
            <h1 style="margin:0;font-size:24px;color:#1a1a1a;">DAO Essence</h1>
            <p style="margin:5px 0 0;font-size:14px;color:#888;">New Contact Form Submission</p>
        </div>

        <!-- Content Card -->
        <div style="background:white;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);overflow:hidden;">
            <!-- Top Accent -->
            <div style="height:4px;background:linear-gradient(90deg,#D4AF37,#1a1a1a);"></div>

            <!-- Info -->
            <div style="padding:25px 30px;">
                <table style="width:100%;font-size:14px;border-collapse:collapse;">
                    <tr>
                        <td style="padding:10px 0;color:#888;width:30%;vertical-align:top;">Name</td>
                        <td style="padding:10px 0;color:#1a1a1a;font-weight:500;">${escapeHtml(name)}</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="padding:0;border-bottom:1px solid #f0f0f0;"></td>
                    </tr>
                    <tr>
                        <td style="padding:10px 0;color:#888;vertical-align:top;">Email</td>
                        <td style="padding:10px 0;color:#1a1a1a;"><a href="mailto:${escapeHtml(email)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(email)}</a></td>
                    </tr>
                    <tr>
                        <td colspan="2" style="padding:0;border-bottom:1px solid #f0f0f0;"></td>
                    </tr>
                    <tr>
                        <td style="padding:10px 0;color:#888;vertical-align:top;">Subject</td>
                        <td style="padding:10px 0;color:#1a1a1a;font-weight:500;">${escapeHtml(subjectLabel)}</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="padding:0;border-bottom:1px solid #f0f0f0;"></td>
                    </tr>
                    <tr>
                        <td style="padding:10px 0;color:#888;vertical-align:top;">Message</td>
                        <td style="padding:10px 0;color:#333;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- Timestamp -->
        <p style="text-align:center;font-size:12px;color:#aaa;margin-top:20px;">
            Submitted on ${timestamp}
        </p>

        <!-- Footer -->
        <div style="text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #e0d8c8;">
            <p style="margin:0;font-size:12px;color:#aaa;">This email was sent from the DAO Essence contact form.</p>
            <p style="margin:5px 0 0;font-size:12px;color:#aaa;">Reply directly to this email to respond to the customer.</p>
        </div>
    </div>
</body>
</html>`,
        textBody: `DAO Essence - New Contact Form Submission\n\n` +
                   `Name: ${name}\n` +
                   `Email: ${email}\n` +
                   `Subject: ${subjectLabel}\n\n` +
                   `Message:\n${message}\n\n` +
                   `Submitted on ${timestamp}`
    });
}

// HTML 转义防 XSS
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Vercel Function 主处理函数
export default async function handler(req, res) {
    // 只接受 POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, subject, message } = req.body;

        // 字段校验
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
            console.log('🚫 Spam detected, rejecting silently');
            // 对垃圾内容返回成功，不打草惊蛇
            return res.status(200).json({ success: true, message: 'Thank you for your message!' });
        }

        // 发送邮件
        await sendContactEmail({
            name: name.trim(),
            email: email.trim(),
            subject: subject || 'general',
            message: message.trim()
        });

        console.log(`✅ Contact email sent from ${email}`);
        return res.status(200).json({ success: true, message: 'Message sent successfully!' });

    } catch (error) {
        console.error('❌ Error sending contact email:', error);
        return res.status(500).json({ error: 'Failed to send message. Please try again later.', debug: error.message });
    }
}
