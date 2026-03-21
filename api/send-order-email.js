/**
 * ============================================
 * DAO Essence - 订单邮件发送服务（阿里云邮件推送）
 * Vercel Functions 版本
 * ============================================
 */

const Core = require('@alicloud/pop-core');

// 创建阿里云客户端
function createClient() {
    const accessKeyId = process.env.ALIYUN_ACCESS_KEY;
    const accessKeySecret = process.env.ALIYUN_ACCESS_SECRET;

    if (!accessKeyId || !accessKeySecret) {
        throw new Error('阿里云配置缺失：ALIYUN_ACCESS_KEY 和 ALIYUN_ACCESS_SECRET 必须在环境变量中设置');
    }

    return new Core({
        accessKeyId: accessKeyId,
        accessKeySecret: accessKeySecret,
        endpoint: 'https://dm.aliyuncs.com',
        apiVersion: '2015-11-23'
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
async function sendBuyerConfirmationEmail(client, orderData) {
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

    const params = {
        Action: 'SingleSendMail',
        AccountName: process.env.ALIYUN_EMAIL_ACCOUNT,
        FromAlias: 'DAO Essence',
        AddressType: 1,
        TagName: 'order',
        ReplyToAddress: true,
        ToAddress: customerEmail,
        Subject: `✅ 订单确认 - DAO Essence | Order #${orderId}`,
        HtmlBody: `
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
                    🌐 Website: <a href="${process.env.VERCEL_URL || 'https://amazing-quokka-7e84ea.netlify.app'}" style="color:#2563eb;">DAO Essence Shop</a>
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

    await client.request('SingleSendMail', params);
    console.log(`✅ 买家确认邮件已发送至: ${customerEmail}`);
}

// 发送商家新订单通知邮件
async function sendMerchantNotificationEmail(client, orderData) {
    const merchantEmail = process.env.MERCHANT_EMAIL || process.env.ALIYUN_EMAIL_ACCOUNT;

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

    const params = {
        Action: 'SingleSendMail',
        AccountName: process.env.ALIYUN_EMAIL_ACCOUNT,
        FromAlias: 'DAO Essence 订单系统',
        AddressType: 1,
        TagName: 'merchant',
        ReplyToAddress: true,
        ToAddress: merchantEmail,
        Subject: `🛍️ 新订单到账！$${parseFloat(amount || 0).toFixed(2)} - Order #${orderId}`,
        HtmlBody: `
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
                    <li>发货后请使用发货通知功能告知客户快递单号</li>
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

    await client.request('SingleSendMail', params);
    console.log(`✅ 商家通知邮件已发送至: ${merchantEmail}`);
}

// 发送发货通知邮件
async function sendShippingNotificationEmail(client, orderData) {
    const { customerEmail, customerName, orderId, trackingNumber, shippingCompany, items } = orderData;

    if (!customerEmail) {
        console.log('⚠️ 买家邮箱不存在，跳过发货通知邮件');
        return;
    }

    if (!trackingNumber || !shippingCompany) {
        console.log('⚠️ 物流信息不完整，跳过发货通知邮件');
        return;
    }

    const itemsHtml = formatItemsHtml(items);
    const trackingUrl = getTrackingUrl(shippingCompany, trackingNumber);

    const params = {
        Action: 'SingleSendMail',
        AccountName: process.env.ALIYUN_EMAIL_ACCOUNT,
        FromAlias: 'DAO Essence 物流通知',
        AddressType: 1,
        TagName: 'shipping',
        ReplyToAddress: true,
        ToAddress: customerEmail,
        Subject: `📦 您的订单已发货 - DAO Essence | Order #${orderId}`,
        HtmlBody: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
    <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
        
        <!-- 头部 -->
        <div style="background:linear-gradient(135deg,#059669 0%,#047857 100%);padding:40px 30px;text-align:center;">
            <h1 style="color:#f0fdf4;margin:0;font-size:28px;letter-spacing:3px;">DAO ESSENCE</h1>
            <p style="color:#d1fae5;margin:8px 0 0;font-size:14px;letter-spacing:1px;">道本精酿 · 古道能量</p>
        </div>

        <!-- 发货标识 -->
        <div style="background:#f0fdf4;padding:25px 30px;text-align:center;border-bottom:2px solid #bbf7d0;">
            <div style="font-size:48px;margin-bottom:10px;">📦</div>
            <h2 style="color:#065f46;margin:0;font-size:22px;">您的订单已发货！Your Order Has Shipped!</h2>
            <p style="color:#166534;margin:8px 0 0;font-size:15px;">亲爱的 ${customerName || '客户'}，您的包裹已发出！</p>
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
                        <td style="padding:6px 0;color:#888;">发货时间 Shipped Date</td>
                        <td style="padding:6px 0;color:#1a1a1a;">${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}</td>
                    </tr>
                    <tr>
                        <td style="padding:6px 0;color:#888;">物流公司 Carrier</td>
                        <td style="padding:6px 0;color:#1a1a1a;">${shippingCompany}</td>
                    </tr>
                    <tr>
                        <td style="padding:6px 0;color:#888;">物流单号 Tracking Number</td>
                        <td style="padding:6px 0;color:#065f46;font-weight:bold;">${trackingNumber}</td>
                    </tr>
                </table>
            </div>

            <!-- 物流查询 -->
            <div style="background:#ecfdf5;border:2px solid #d1fae5;border-radius:10px;padding:20px;margin-bottom:25px;text-align:center;">
                <h3 style="margin:0 0 15px;color:#065f46;font-size:16px;">📡 物流查询 Track Your Shipment</h3>
                ${trackingUrl ? `
                <a href="${trackingUrl}" style="display:inline-block;background:#059669;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-bottom:10px;">🔗 查看物流状态</a>
                ` : ''}
                <p style="margin:0;color:#166534;font-size:14px;">或直接访问 ${shippingCompany} 官网查询</p>
            </div>

            <!-- 商品列表 -->
            <h3 style="margin:0 0 15px;color:#1a1a1a;font-size:16px;">🛍️ 商品信息 Items</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:25px;">
                <thead>
                    <tr style="background:#f5f5f5;">
                        <th style="padding:10px 8px;text-align:left;color:#555;font-weight:600;">商品</th>
                        <th style="padding:10px 8px;text-align:center;color:#555;font-weight:600;">数量</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <!-- 预计时间 -->
            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:20px;margin-bottom:25px;">
                <h3 style="margin:0 0 10px;color:#92400e;font-size:15px;">⏰ 预计送达时间 Estimated Delivery</h3>
                <p style="margin:0;color:#78350f;font-size:14px;line-height:1.6;">
                    预计 <strong>15-25个工作日</strong> 内送达。<br>
                    Estimated delivery within <strong>15-25 business days</strong>.
                </p>
            </div>

            <!-- 联系信息 -->
            <div style="background:#eff6ff;border-radius:8px;padding:20px;">
                <h3 style="margin:0 0 10px;color:#1e40af;font-size:15px;">💬 需要帮助？Need Help?</h3>
                <p style="margin:0;color:#1e3a8a;font-size:14px;line-height:1.8;">
                    📧 Email: <a href="mailto:support@daoessence.com" style="color:#2563eb;">support@daoessence.com</a><br>
                    📱 WhatsApp: +86 181 1575 5283<br>
                    🌐 Website: <a href="${process.env.VERCEL_URL || 'https://amazing-quokka-7e84ea.netlify.app'}" style="color:#2563eb;">DAO Essence Shop</a>
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

    await client.request('SingleSendMail', params);
    console.log(`✅ 发货通知邮件已发送至: ${customerEmail}`);
}

// 获取物流查询URL
function getTrackingUrl(shippingCompany, trackingNumber) {
    const companyUrls = {
        'SF Express': `https://www.sf-express.com/cn/sc/dynamic_function/waybill/#search/bill-number/${trackingNumber}`,
        'DHL': `https://www.dhl.com/cn-en/home/tracking/tracking-express.html?submit=1&tracking-id=${trackingNumber}`,
        'FedEx': `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
        'UPS': `https://www.ups.com/track?loc=en_US&requester=ST&tracknum=${trackingNumber}`,
        'USPS': `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
        'China Post': `https://www.17track.net/en-us/track?nums=${trackingNumber}`
    };
    return companyUrls[shippingCompany] || '';
}

// Vercel Function 主处理函数
export default async function handler(req, res) {
    // 只接受 POST 请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const orderData = req.body;

        console.log('📧 开始发送邮件，订单号:', orderData.orderId);

        // 创建阿里云客户端
        const client = createClient();

        let results;
        
        // 根据邮件类型发送不同的邮件
        if (orderData.emailType === 'shipping') {
            // 发送发货通知邮件
            const shippingResult = await sendShippingNotificationEmail(client, orderData);
            results = [shippingResult];
        } else {
            // 发送订单确认邮件（买家 + 商家）
            results = await Promise.allSettled([
                sendBuyerConfirmationEmail(client, orderData),
                sendMerchantNotificationEmail(client, orderData)
            ]);
        }

        const response = {
            success: true
        };

        // 处理不同类型的邮件结果
        if (orderData.emailType === 'shipping') {
            response.shipping = 'sent';
        } else {
            const buyerResult = results[0];
            const merchantResult = results[1];
            response.buyer = buyerResult.status === 'fulfilled' ? 'sent' : `failed: ${buyerResult.reason?.message}`;
            response.merchant = merchantResult.status === 'fulfilled' ? 'sent' : `failed: ${merchantResult.reason?.message}`;
        }

        console.log('📧 邮件发送结果:', response);

        return res.status(200).json(response);

    } catch (error) {
        console.error('❌ 邮件发送失败:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}