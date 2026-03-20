# 📧 订单邮件系统 - 激活指南

## 功能说明

用户下单支付成功后，系统会自动：
1. **买家** 收到精美的订单确认邮件（包含商品明细、金额、运输方式）
2. **商家** 收到新订单通知邮件（包含客户信息、商品详情、操作提醒）

---

## 快速激活（3步）

### 第一步：开启 Gmail 应用专用密码

1. 访问 [Google 账户安全设置](https://myaccount.google.com/security)
2. 确保已开启 **两步验证（2-Step Verification）**
3. 搜索"应用专用密码" → 选择"其他(自定义名称)" → 输入 "DAO Essence"
4. 点击生成 → 复制那个 **16位密码**（格式：`xxxx xxxx xxxx xxxx`）

### 第二步：在 Netlify Dashboard 配置环境变量

访问 [Netlify Dashboard](https://app.netlify.com/) → 你的项目 → **Site settings → Environment variables**

添加以下三个变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `EMAIL_USER` | `your-gmail@gmail.com` | 用于发送邮件的 Gmail 地址 |
| `EMAIL_PASS` | `xxxx xxxx xxxx xxxx` | 上一步生成的应用专用密码 |
| `MERCHANT_EMAIL` | `18115755283@163.com` | 商家接收订单通知的邮箱 |

> ⚠️ **注意**：`EMAIL_PASS` 填应用专用密码，不是 Gmail 登录密码！

### 第三步：重新部署

在 Netlify Dashboard → Deploys → 点击 **Trigger deploy** 重新部署即可。

---

## 邮件示例

### 买家确认邮件
- 主题：`✅ 订单确认 - DAO Essence | Order #xxx`
- 内容：订单号、支付金额、商品列表、运输方式、预计发货时间、客服联系方式

### 商家通知邮件
- 主题：`🛍️ 新订单到账！$xx.xx - Order #xxx`
- 内容：金额高亮展示、客户信息、商品列表、待办提醒（备货/发货）

---

## 技术实现

```
用户付款
  └── Stripe Webhook → webhook.js
        └── handlePaymentSucceeded()
              └── 调用 send-order-email.js
                    ├── sendBuyerConfirmationEmail()  → 发给买家
                    └── sendMerchantNotificationEmail() → 发给商家
```

**相关文件：**
- `netlify/functions/send-order-email.js` — 邮件发送核心逻辑
- `netlify/functions/webhook.js` — Stripe 事件处理
- `netlify/functions/create-checkout-session/index.js` — 创建支付会话（含买家信息）
- `checkout.html` — 结账页（新增买家信息表单）
- `order-confirm.html` — 订单确认页（展示邮件发送状态）

---

## 测试邮件是否正常

部署后，在结账页填写真实邮箱地址，用测试卡号完成支付：
- 测试卡号：`4242 4242 4242 4242`
- 过期日期：任意未来日期
- CVC：任意3位

支付完成约 30 秒内，买家和商家应各收到一封邮件。

---

## 常见问题

**Q: 收不到邮件？**
- 检查 Netlify 环境变量是否正确配置
- 检查 Gmail 是否已开启两步验证和应用专用密码
- 查看 Netlify Functions 日志：Dashboard → Functions → send-order-email

**Q: Gmail 被 Google 拦截？**
- 确保使用的是应用专用密码，不是普通密码
- 检查 Gmail 账号没有被锁定

**Q: 想换用其他邮件服务？**
- 修改 `send-order-email.js` 中的 `createTransporter()` 函数
- Outlook/Hotmail：`service: 'hotmail'`
- 163邮箱：`service: '163'`，需要开启 SMTP 授权码
