/**
 * ============================================
 * DAO Essence - 订单邮件发送服务
 * 支付成功后同时发送：
 *   1. 买家：订单确认邮件
 *   2. 商家：新订单通知邮件
 * 
 * 环境变量配置（在 Netlify Dashboard 中设置）：
 *   EMAIL_USER     - Gmail 邮箱地址（发件人）
 *   EMAIL_PASS     - Gmail 应用专用密码（App Password）
 *   MERCHANT_EMAIL - 商家接收订单通知的邮箱
 * ============================================
 */

const nodemailer = require('nodemailer');

// 创建邮件传输器
function createTransporter() {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
        throw new Error('邮件配置缺失：EMAIL_USER 和 EMAIL_PASS 必须在环境变量中设置');
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser,
            pass: emailPass  // Gmail 应用专用密码（16位）
        }
    });
}

// 格式化商品列表（邮件 HTML）
function formatItemsHtml(items) {
    if (!items || items.length === 0) {
        return '<tr><td colspan="3" style="padding:8px;text-align:center;color:#999;">暂无商品信息</td></tr>';
    }

    return items.map(item => `
        <tr>
            <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;">${item.nameCn || item.name || '未知商品'}</td>
            <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity || 1}</td>
            <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;text-align:right;">$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
        </tr>
    `).join('');
}

// 发送买家确认邮件
async function sendBuyerConfirmationEmail(transporter, orderData) {
    const {
        customerEmail,
        customerName,
        orderId,
        amount,
        currency,
        items,
        shippingMethod,
        shippingAddress
    } = orderData;

    if (!customerEmail) {
        console.log('⚠️ 买家邮箱不存在，跳过买家确认邮件');
        return;
    }

    const itemsHtml = formatItemsHtml(items);
    const shippingInfo = shippingAddress
        ? `<p style="margin:5px 0;color:#555;">${shippingAddress}</p>`
        : '';

    const mailOptions = {
        from: `"DAO Essence 道本精酿" <${process.env.EMAIL_USER}>`,
        to: customerEmail,
        subject: `✅ 订单确认 - DAO Essence | Order #${orderId}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
    <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
        
        <!-- 头部 -->
        <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);padding:40px 30px;text-align:center;">
            <h1 style="color:#d4af37;margin:0;font-size:28px;letter-spacing:3px;">DAO ESSENCE</h1>
            <p style="color:#c9b99a;margin:8px 0 0;font-size:14px;letter-spacing:1px;">道本精酿 · 古道能量</p>
        </div>

        <!-- 成功标识 -->
        <div style="background:#f0fdf4;padding:25px 30px;text-align:center;border-bottom:2px solid #bbf7d0;">
            <div style="font-size:48px;margin-bottom:10px;">✅</div>
            <h2 style="color:#16a34a;margin:0;font-size:22px;">订单已确认！Order Confirmed!</h2>
            <p style="color:#555;margin:8px 0 0;font-size:15px;">感谢您的购买，${customerName || '尊贵客户'}！</p>
        </div>

        <!-- 订单信息 -->
        <div style="padding:30px;">
            <div style="background:#fafafa;border-radius:8px;padding:20px;margin-bottom:25px;">
                <h3 style="margin:0 0 15px;color:#1a1a1a;font-size:16px;border-bottom:1px solid #eee;padding-bottom:10px;">📋 订单信息 Order Details</h3>
                <table style="width:100%;border-collapse:collapse;font-size:14px;">
                    <tr>
                        <td style="padding:6px 0;color:#888;width:40%;">订单号 Order #</td>
                        <td style="padding:6px 0;color:#1a1a1a;font-weight:bold;">${orderId}</td>
                    </tr>
                    <tr>
                        <td style="padding:6px 0;color:#888;">支付金额 Amount</td>
                        <td style="padding:6px 0;color:#d4af37;font-weight:bold;font-size:18px;">$${parseFloat(amount || 0).toFixed(2)} ${(currency || 'USD').toUpperCase()}</td>
                    </tr>
                    <tr>
                        <td style="padding:6px 0;color:#888;">运输方式 Shipping</td>
                        <td style="padding:6px 0;color:#1a1a1a;">${shippingMethod || '标准运输 (15-25天)'}</td>
                    </tr>
                    <tr>
                        <td style="padding:6px 0;color:#888;">下单时间 Date</td>
                        <td style="padding:6px 0;color:#1a1a1a;">${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}</td>
                    </tr>
                </table>
            </div>

            <!-- 商品列表 -->
            <h3 style="margin:0 0 15px;color:#1a1a1a;font-size:16px;">🛍️ 订购商品 Items</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:25px;">
                <thead>
                    <tr style="background:#f5f5f5;">
                        <th style="padding:10px 8px;text-align:left;color:#555;font-weight:600;">商品</th>
                        <th style="padding:10px 8px;text-align:center;color:#555;font-weight:600;">数量</th>
                        <th style="padding:10px 8px;text-align:right;color:#555;font-weight:600;">小计</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" style="padding:12px 8px;text-align:right;font-weight:bold;color:#555;font-size:15px;">总计 Total:</td>
                        <td style="padding:12px 8px;text-align:right;font-weight:bold;color:#d4af37;font-size:18px;">$${parseFloat(amount || 0).toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>

            ${shippingAddress ? `
            <!-- 收货地址 -->
            <div style="background:#fafafa;border-radius:8px;padding:20px;margin-bottom:25px;">
                <h3 style="margin:0 0 10px;color:#1a1a1a;font-size:15px;">📦 收货信息 Shipping Address</h3>
                ${shippingInfo}
            </div>
            ` : ''}

            <!-- 预计时间 -->
            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:20px;margin-bottom:25px;">
                <h3 style="margin:0 0 10px;color:#92400e;font-size:15px;">⏰ 发货时间 Estimated Dispatch</h3>
                <p style="margin:0;color:#78350f;font-size:14px;line-height:1.6;">
                    我们将在 <strong>3-5个工作日</strong> 内完成备货并发货。<br>
                    We will process and ship your order within <strong>3-5 business days</strong>.
                </p>
            </div>

            <!-- 联系信息 -->
            <div style="background:#eff6ff;border-radius:8px;padding:20px;">
                <h3 style="margin:0 0 10px;color:#1e40af;font-size:15px;">💬 需要帮助？Need Help?</h3>
                <p style="margin:0;color:#1e3a8a;font-size:14px;line-height:1.8;">
                    📧 Email: <a href="mailto:support@daoessence.com" style="color:#2563eb;">support@daoessence.com</a><br>
                    📱 WhatsApp: +86 181 1575 5283<br>
                    🌐 Website: <a href="https://amazing-quokka-7e84ea.netlify.app" style="color:#2563eb;">DAO Essence Shop</a>
                </p>
            </div>
        </div>

        <!-- 底部 -->
        <div style="background:#1a1a2e;padding:25px 30px;text-align:center;">
            <p style="color:#c9b99a;margin:0;font-size:13px;line-height:1.8;">
                © 2026 DAO Essence & Five Elements. All rights reserved.<br>
                Ancient Wisdom · Modern Harmony · Authentic Energy
            </p>
        </div>
    </div>
</body>
</html>
        `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ 买家确认邮件已发送至: ${customerEmail}`);
}

// 发送商家新订单通知邮件
async function sendMerchantNotificationEmail(transporter, orderData) {
    const merchantEmail = process.env.MERCHANT_EMAIL || process.env.EMAIL_USER;

    if (!merchantEmail) {
        console.log('⚠️ 商家邮箱未配置，跳过商家通知邮件');
        return;
    }

    const {
        customerEmail,
        customerName,
        orderId,
        amount,
        currency,
        items,
        shippingMethod,
        shippingAddress,
        paymentType
    } = orderData;

    const itemsHtml = formatItemsHtml(items);

    const mailOptions = {
        from: `"DAO Essence 订单系统" <${process.env.EMAIL_USER}>`,
        to: merchantEmail,
        subject: `🛍️ 新订单到账！$${parseFloat(amount || 0).toFixed(2)} - Order #${orderId}`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
    <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
        
        <!-- 头部 -->
        <div style="background:linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 100%);padding:30px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">🎉 新订单通知</h1>
            <p style="color:#bfdbfe;margin:8px 0 0;font-size:14px;">DAO Essence 后台系统</p>
        </div>

        <div style="padding:30px;">
            <!-- 金额高亮 -->
            <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:2px solid #86efac;border-radius:10px;padding:20px;margin-bottom:25px;text-align:center;">
                <p style="margin:0 0 5px;color:#16a34a;font-size:14px;font-weight:600;">💰 到账金额</p>
                <p style="margin:0;color:#15803d;font-size:36px;font-weight:bold;">$${parseFloat(amount || 0).toFixed(2)} ${(currency || 'USD').toUpperCase()}</p>
            </div>

            <!-- 客户信息 -->
            <div style="background:#fafafa;border-radius:8px;padding:20px;margin-bottom:20px;">
                <h3 style="margin:0 0 15px;color:#1a1a1a;font-size:15px;border-bottom:1px solid #eee;padding-bottom:8px;">👤 客户信息</h3>
                <table style="width:100%;font-size:14px;">
                    <tr><td style="padding:5px 0;color:#888;width:35%;">订单号</td><td style="color:#1a1a1a;font-weight:bold;">${orderId}</td></tr>
                    <tr><td style="padding:5px 0;color:#888;">客户姓名</td><td style="color:#1a1a1a;">${customerName || '未提供'}</td></tr>
                    <tr><td style="padding:5px 0;color:#888;">客户邮箱</td><td style="color:#1a1a1a;">${customerEmail || '未提供'}</td></tr>
                    <tr><td style="padding:5px 0;color:#888;">支付方式</td><td style="color:#1a1a1a;">${paymentType === 'checkout_session' ? 'Stripe Checkout' : 'Payment Intent'}</td></tr>
                    <tr><td style="padding:5px 0;color:#888;">运输方式</td><td style="color:#1a1a1a;">${shippingMethod || '未选择'}</td></tr>
                    <tr><td style="padding:5px 0;color:#888;">下单时间</td><td style="color:#1a1a1a;">${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}</td></tr>
                    ${shippingAddress ? `<tr><td style="padding:5px 0;color:#888;">收货地址</td><td style="color:#1a1a1a;">${shippingAddress}</td></tr>` : ''}
                </table>
            </div>

            <!-- 商品列表 -->
            <h3 style="margin:0 0 15px;color:#1a1a1a;font-size:15px;">📦 购买商品</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
                <thead>
                    <tr style="background:#f0f4ff;">
                        <th style="padding:10px 8px;text-align:left;color:#555;">商品名称</th>
                        <th style="padding:10px 8px;text-align:center;color:#555;">数量</th>
                        <th style="padding:10px 8px;text-align:right;color:#555;">金额</th>
                    </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" style="padding:12px 8px;text-align:right;font-weight:bold;color:#555;">总计:</td>
                        <td style="padding:12px 8px;text-align:right;font-weight:bold;color:#16a34a;font-size:16px;">$${parseFloat(amount || 0).toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>

            <!-- 操作提醒 -->
            <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:15px;">
                <p style="margin:0;color:#c2410c;font-size:14px;font-weight:600;">⚡ 待办提醒</p>
                <ul style="margin:8px 0 0;padding-left:18px;color:#9a3412;font-size:13px;line-height:1.8;">
                    <li>请在 3-5 个工作日内完成备货发货</li>
                    <li>发货后请告知客户快递单号</li>
                    <li>如商品缺货请及时联系客户</li>
                </ul>
            </div>
        </div>

        <div style="background:#1e3a8a;padding:20px;text-align:center;">
            <p style="color:#93c5fd;margin:0;font-size:12px;">DAO Essence 自动化订单系统 · ${new Date().toISOString()}</p>
        </div>
    </div>
</body>
</html>
        `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ 商家通知邮件已发送至: ${merchantEmail}`);
}

// Netlify Function 主处理函数
exports.handler = async (event, context) => {
    // 只接受 POST 请求
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const orderData = JSON.parse(event.body);

        console.log('📧 开始发送订单邮件，订单号:', orderData.orderId);

        // 创建邮件传输器
        const transporter = createTransporter();

        // 并行发送两封邮件
        const results = await Promise.allSettled([
            sendBuyerConfirmationEmail(transporter, orderData),
            sendMerchantNotificationEmail(transporter, orderData)
        ]);

        const buyerResult = results[0];
        const merchantResult = results[1];

        const response = {
            success: true,
            buyer: buyerResult.status === 'fulfilled' ? 'sent' : `failed: ${buyerResult.reason?.message}`,
            merchant: merchantResult.status === 'fulfilled' ? 'sent' : `failed: ${merchantResult.reason?.message}`
        };

        console.log('📧 邮件发送结果:', response);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
        };

    } catch (error) {
        console.error('❌ 邮件发送失败:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};
