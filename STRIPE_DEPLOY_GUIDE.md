# Stripe 支付集成部署指南

## ✅ 已完成的配置

### 1. Stripe API 密钥配置
- **公钥 (Public Key)**: `pk_test_...` (从 Stripe Dashboard 获取)
- **私钥 (Secret Key)**: `sk_test_...` (从 Stripe Dashboard 获取，用于 Netlify Functions)

### 2. 已更新的文件
- ✅ `payment-manager.js` - 已更新 Stripe 公钥
- ✅ `netlify.toml` - 已配置环境变量
- ✅ `checkout.html` - 新增 Stripe Checkout 页面
- ✅ `netlify/functions/create-checkout-session/index.js` - 新增 Checkout Session 创建函数
- ✅ `package.json` - 新增 Stripe SDK 依赖

### 3. 新增功能
- ✅ 结账页面（checkout.html）
- ✅ Stripe Checkout 集成
- ✅ 安全支付处理
- ✅ 订单确认页面

---

## 📝 部署步骤

### 步骤 1: 提交代码到 GitHub

在 PowerShell 中执行：

```powershell
cd C:\Users\agenew\Desktop\DaoEssence
git add -A
git commit -m "集成 Stripe 支付系统"
git push origin main
```

### 步骤 2: Netlify 自动部署

1. Netlify 会自动检测到新的提交
2. 自动构建并部署更新
3. 部署完成后，访问：https://amazing-quokka-7e84ea.netlify.app/checkout.html

### 步骤 3: 配置 Netlify 环境变量

1. 登录 Netlify Dashboard: https://app.netlify.com
2. 选择 `dao-essence-shop` 站点
3. 点击 **Site settings** → **Environment variables**
4. 添加以下环境变量：

```
STRIPE_SECRET_KEY = sk_test_... (从 Stripe Dashboard 获取)
```

---

## 🧪 测试支付流程

### 1. 测试环境准备

Stripe 提供测试卡号，用于测试支付流程：

**测试卡号**: `4242 4242 4242 4242`
**过期日期**: 任意未来日期（如 `12/34`）
**CVC**: 任意三位数（如 `123`）
**邮编**: 任意 5 位数（如 `12345`）

### 2. 测试步骤

1. 打开网站：https://amazing-quokka-7e84ea.netlify.app
2. 添加商品到购物车
3. 点击购物车图标
4. 点击"去结账"按钮
5. 在结账页面确认订单
6. 点击"去支付"按钮
7. 进入 Stripe Checkout 页面
8. 填写测试卡信息：
   - 邮箱：test@example.com
   - 卡号：`4242 4242 4242 4242`
   - 过期日期：`12/34`
   - CVC：`123`
   - 邮编：`12345`
9. 点击"Pay"
10. 支付成功，重定向到订单确认页面

### 3. 验证支付

1. 登录 Stripe Dashboard: https://dashboard.stripe.com
2. 点击 **Payments** 标签
3. 查看测试支付记录

---

## 🚀 切换到生产环境

### 获取生产环境密钥

1. 在 Stripe Dashboard 顶部，点击 **"测试"** 切换到 **"实时"**
2. 在 **"开发者"** → **"API 密钥"** 获取实时密钥
3. 更新以下文件：

```javascript
// payment-manager.js
apiKey: 'pk_live_YOUR_LIVE_PUBLIC_KEY'

// netlify.toml
STRIPE_PUBLIC_KEY = "pk_live_YOUR_LIVE_PUBLIC_KEY"
STRIPE_SECRET_KEY = "sk_live_YOUR_LIVE_SECRET_KEY"

// netlify/functions/create-checkout-session/index.js
const stripe = require('stripe')('sk_live_YOUR_LIVE_SECRET_KEY');
```

4. 重新部署

### 重要提醒

- ⚠️ **不要将私钥 (sk_live_...) 提交到 GitHub**
- ⚠️ **私钥应该只存储在环境变量中**
- ✅ 生产环境使用前务必测试完整流程

---

## 📧 订单通知系统

当前使用 Stripe Webhook 自动发送确认邮件。需要配置 Webhook：

1. 在 Stripe Dashboard 点击 **"开发者"** → **"Webhooks"**
2. 添加新的 Webhook
3. Webhook URL: `https://amazing-quokka-7e84ea.netlify.app/.netlify/functions/webhook`
4. 选择事件：
   - `checkout.session.completed` - 支付完成
   - `payment_intent.succeeded` - 支付成功
5. 获取 Webhook Secret
6. 在 Netlify 环境变量中添加：
   ```
   STRIPE_WEBHOOK_SECRET = whsec_YOUR_WEBHOOK_SECRET
   ```

---

## 🐛 常见问题

### Q: 支付失败，显示 "Error creating checkout session"
A: 检查 Netlify Functions 是否正确部署，环境变量是否配置

### Q: 支付成功但没有收到订单确认
A: 检查 Webhook 配置，确认事件是否正确触发

### Q: 测试卡支付被拒绝
A: 确保使用 Stripe 提供的测试卡号：`4242 4242 4242 4242`

### Q: 切换到生产环境后支付失败
A: 确保使用的是实时 API 密钥（pk_live_ 和 sk_live_），而不是测试密钥

---

## 📞 技术支持

- Stripe 文档: https://stripe.com/docs
- Netlify Functions 文档: https://docs.netlify.com/functions/
- Stripe Webhooks 文档: https://stripe.com/docs/webhooks

---

**准备好部署了吗？** 🎉
1. 执行上述 Git 命令
2. 等待 Netlify 自动部署
3. 配置环境变量
4. 测试支付流程
5. 收到第一笔订单！
