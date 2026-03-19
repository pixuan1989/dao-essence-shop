# Stripe Webhook 部署指南
## DAO Essence Shop

### 📋 概述

本指南说明如何配置和测试 Stripe Webhook 处理系统，实现支付成功后的自动化订单处理。

---

### 🔧 已完成的组件

#### 1. **Server.js** - Stripe 支付服务器
- ✅ Payment Intent 创建 API
- ✅ Payment Intent 状态查询 API
- ✅ Webhook 端点（`/api/webhook`）
- ✅ 订单状态查询 API
- ✅ 订单历史查询 API

#### 2. **Webhook-handler.js** - Webhook 处理器
- ✅ 支付成功处理（`handlePaymentSucceeded`）
- ✅ 支付失败处理（`handlePaymentFailed`）
- ✅ 订单持久化到本地文件
- ✅ 订单历史查询
- ✅ 商品和配送信息解析

#### 3. **Test-webhook.js** - 测试工具
- ✅ 完整支付流程测试
- ✅ 现有 Payment Intent 检查
- ✅ 订单历史查询

---

### 🚀 快速开始

#### 步骤 1：安装依赖
```bash
cd C:\Users\agenew\Desktop\DaoEssence
npm install
```

#### 步骤 2：配置环境变量
创建 `.env` 文件：
```env
STRIPE_SECRET_KEY=sk_test_xxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxx
PORT=3001
NODE_ENV=development
```

#### 步骤 3：启动服务器
```bash
npm start
```

服务器将运行在：`http://localhost:3001`

---

### 📡 配置 Stripe Webhook

#### 1. 登录 Stripe Dashboard
访问：https://dashboard.stripe.com/test/webhooks

#### 2. 创建 Webhook Endpoint
- **Endpoint URL**: `https://your-domain.com/api/webhook`
- **Events to listen to**:
  - ✅ `payment_intent.succeeded`
  - ✅ `payment_intent.payment_failed`
  - ✅ `payment_intent.created`
  - ✅ `payment_intent.canceled`
  - ✅ `checkout.session.completed`

#### 3. 获取 Webhook Secret
创建后，复制 Webhook Secret（以 `whsec_` 开头）并添加到 `.env` 文件。

#### 4. 本地测试（可选）
使用 Stripe CLI 进行本地测试：
```bash
stripe login
stripe listen --forward-to localhost:3001/api/webhook
```

复制输出的 Webhook Secret 并添加到 `.env`。

---

### 🧪 测试支付流程

#### 方式 1：使用测试脚本
```bash
# 运行完整测试
node test-webhook.js test

# 检查现有 Payment Intent
node test-webhook.js check <payment_intent_id>

# 查看订单历史
node test-webhook.js orders
```

#### 方式 2：通过 API 测试

**1. 创建 Payment Intent**
```bash
curl -X POST http://localhost:3001/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 99.99,
    "currency": "usd",
    "metadata": {
      "orderId": "test_order_001",
      "items": "prod001:DAO Essence:1:49.99",
      "shipping": "123 Main St|San Francisco|CA|94102|US",
      "customerName": "Test Customer"
    }
  }'
```

**响应示例：**
```json
{
  "success": true,
  "clientSecret": "pi_xxxx_secret_xxxx",
  "paymentIntentId": "pi_xxxx",
  "amount": 9999
}
```

**2. 使用 Client Secret 在前端完成支付**
（使用 checkout.html 中的 Stripe Elements）

**3. Webhook 将自动触发**
支付成功后，Stripe 会向 `/api/webhook` 发送事件。

**4. 查询订单状态**
```bash
curl http://localhost:3001/api/order/test_order_001
```

**5. 查看订单历史**
```bash
curl http://localhost:3001/api/orders
```

---

### 📦 订单数据结构

#### 支付成功订单
```json
{
  "orderId": "test_order_001",
  "stripePaymentId": "pi_xxxx",
  "amount": 99.99,
  "currency": "USD",
  "status": "paid",
  "paymentStatus": "succeeded",
  "items": [
    {
      "id": "prod001",
      "name": "DAO Essence",
      "quantity": 1,
      "price": 49.99
    }
  ],
  "shipping": {
    "address": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "country": "US"
  },
  "customer": {
    "email": "customer@example.com",
    "name": "Test Customer",
    "phone": "+1234567890"
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### 支付失败订单
```json
{
  "orderId": "failed_1234567890",
  "stripePaymentId": "pi_xxxx",
  "amount": 99.99,
  "currency": "USD",
  "status": "failed",
  "paymentStatus": "requires_payment_method",
  "error": "Your card was declined.",
  "errorCode": "card_declined",
  "items": [...],
  "customer": {...},
  "createdAt": "2024-01-15T10:30:00.000Z",
  "failedAt": "2024-01-15T10:30:05.000Z"
}
```

---

### 📁 文件结构

```
DaoEssence/
├── server.js                 # Stripe 支付服务器
├── webhook-handler.js        # Webhook 处理器
├── test-webhook.js          # 测试工具
├── orders/                  # 订单存储目录（自动创建）
│   ├── order_001.json
│   └── order_002.json
├── .env                    # 环境变量
├── checkout.html           # 支付页面
└── order-confirm.html      # 订单确认页面
```

---

### 🔍 监控和调试

#### 1. 服务器日志
```bash
npm start
```

**日志示例：**
```
========================================
Stripe Payment Server Running
========================================
Server URL: http://localhost:3001
Health Check: http://localhost:3001/api/health
========================================

📨 Webhook received: payment_intent.succeeded
✅ Payment succeeded: pi_xxxx
========================================
Payment Succeeded
========================================
Payment Intent ID: pi_xxxx
Amount: 99.99 USD
Customer Email: customer@example.com
Status: succeeded
========================================
💾 Order saved to file: orders/order_001.json
✅ Order processed successfully
```

#### 2. Stripe Dashboard
- 查看所有 Payments: https://dashboard.stripe.com/test/payments
- 查看 Webhook 事件: https://dashboard.stripe.com/test/webhooks
- 实时日志: https://dashboard.stripe.com/test/logs

#### 3. 测试 Webhook 端点
```bash
# 健康检查
curl http://localhost:3001/api/health

# 响应
{"status":"ok","message":"Stripe server is running"}
```

---

### 🚀 生产环境部署

#### 选项 1：部署到 Vercel
```bash
npm i -g vercel
vercel
```

#### 选项 2：部署到 Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```

#### 选项 3：部署到 Railway
```bash
npm i -g railway
railway up
```

#### 生产环境配置
```env
NODE_ENV=production
PORT=80
STRIPE_SECRET_KEY=sk_live_xxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxx
```

---

### 📧 下一步扩展（TODO）

目前系统支持基本的订单处理，以下是可以添加的功能：

#### 1. **数据库集成**
- 连接 MongoDB/PostgreSQL 存储订单
- 实现订单搜索和过滤
- 添加订单状态追踪

#### 2. **邮件通知**
- 支付成功确认邮件
- 发货通知邮件
- 支付失败重试提醒

#### 3. **库存管理**
- 自动扣减库存
- 低库存预警
- 缺货通知

#### 4. **发货流程**
- 生成发货标签
- 跟踪订单状态
- 退款处理

#### 5. **数据分析**
- 销售报表
- 客户行为分析
- 支付成功率统计

#### 6. **客户服务**
- 客户订单查询页面
- 退款申请流程
- 客户反馈收集

---

### ❓ 常见问题

#### Q: Webhook 没有被触发？
**A:** 检查以下几点：
1. Webhook URL 是否正确
2. Stripe Secret 是否配置
3. 服务器是否运行
4. 查看 Stripe Dashboard 的 Webhook 日志

#### Q: 支付成功但订单没有保存？
**A:** 检查：
1. `orders/` 目录是否有写入权限
2. 检查服务器错误日志
3. 确认 Webhook 签名验证通过

#### Q: 如何测试 Webhook 本地？
**A:** 使用 Stripe CLI：
```bash
stripe listen --forward-to localhost:3001/api/webhook
```

#### Q: 如何重试失败的 Webhook？
**A:** 在 Stripe Dashboard 的 Webhook 页面，可以：
1. 查看失败的 Webhook
2. 重试单个事件
3. 重试所有失败事件

---

### 📞 支持

如有问题，请查看：
- Stripe API 文档: https://stripe.com/docs/api
- Stripe Webhook 指南: https://stripe.com/docs/webhooks
- Stripe 测试卡: https://stripe.com/docs/testing

---

**部署状态：** ✅ Webhook 处理已完成并测试通过

**最后更新：** 2024-03-19
