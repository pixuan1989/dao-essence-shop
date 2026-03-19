# Stripe 配置指南 - 分步操作

## 🎯 目标

完成 Stripe 环境变量配置，启动服务器并测试支付流程。

---

## 📋 检查清单

在开始之前，确保您已：
- [ ] 注册了 Stripe 账户
- [ ] 登录了 Stripe Dashboard
- [ ] 准备好编辑 .env 文件

---

## 🚀 第 1 步：获取 API 密钥

### 1.1 访问 Stripe Dashboard（测试环境）

打开浏览器，访问：
```
https://dashboard.stripe.com/test
```

### 1.2 找到 API Keys

1. 登录后，点击左侧菜单 **"Developers"**
2. 点击 **"API keys"**
3. 滚动到 **"Secret key"** 部分

### 1.3 复制密钥

找到以 `sk_test_` 开头的密钥，点击 **"Reveal"** 按钮，然后复制。

**示例：**
```
sk_test_51PxxxxxYyyyyZzzzz...
```

### 1.4 同时获取 Publishable Key

在同一页面，找到以 `pk_test_` 开头的密钥，也复制下来。

**示例：**
```
pk_test_51PxxxxxYyyyyZzzzz...
```

---

## 🎯 第 2 步：创建 Webhook 端点

### 2.1 进入 Webhooks 设置

1. 在左侧菜单点击 **"Developers"**
2. 点击 **"Webhooks"**
3. 点击右上角 **"Add endpoint"** 按钮

### 2.2 配置 Webhook 端点

在弹出的对话框中填写：

**Endpoint URL:**
```
http://localhost:3001/api/webhook
```

> **注意：** 这是本地测试地址。如果您的服务器已部署到生产环境，使用实际的域名，例如：
> ```
> https://yourdomain.com/api/webhook
> ```

### 2.3 选择要监听的事件

点击 **"Listen to events"** 下的 **"Select events"**，勾选以下事件：

- ✅ `payment_intent.succeeded`
- ✅ `payment_intent.payment_failed`
- ✅ `payment_intent.created`
- ✅ `payment_intent.canceled`
- ✅ `checkout.session.completed`（如果使用 Checkout Session）

### 2.4 创建端点

点击 **"Add endpoint"** 按钮完成创建。

### 2.5 复制 Webhook Secret

1. 创建成功后，点击刚才创建的端点名称
2. 找到 **"Signing secret"** 部分
3. 点击 **"Reveal"** 按钮
4. 复制以 `whsec_` 开头的密钥

**示例：**
```
whsec_xxxxx...
```

---

## 📝 第 3 步：创建 .env 文件

### 3.1 复制模板

打开终端/命令行，进入项目目录：
```bash
cd C:\Users\agenew\Desktop\DaoEssence
```

执行以下命令：
```bash
copy .env.example .env
```

或者在资源管理器中：
1. 找到 `.env.example` 文件
2. 复制它
3. 重命名为 `.env`

### 3.2 编辑 .env 文件

使用记事本或其他编辑器打开 `.env` 文件，替换为实际的密钥：

**修改前：**
```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
PORT=3001
NODE_ENV=development
WEBHOOK_ENDPOINT_URL=http://localhost:3001/api/webhook
```

**修改后（示例）：**
```env
STRIPE_SECRET_KEY=sk_test_51PxxxxxYyyyyZzzzz
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_51PxxxxxYyyyyZzzzz
PORT=3001
NODE_ENV=development
WEBHOOK_ENDPOINT_URL=http://localhost:3001/api/webhook
```

> **⚠️ 重要：**
> - 不要删除引号或添加额外空格
> - 确保密钥完整复制，没有遗漏
> - 保存文件时使用 UTF-8 编码

---

## ✅ 第 4 步：验证配置

### 4.1 检查文件是否存在

在项目目录中，应该有以下文件：
- ✅ `.env`（您刚刚创建的）
- ✅ `.env.example`（模板文件）

### 4.2 验证密钥格式

确保密钥前缀正确：
- Secret Key 以 `sk_test_` 开头
- Publishable Key 以 `pk_test_` 开头
- Webhook Secret 以 `whsec_` 开头

---

## 🚀 第 5 步：启动服务器

### 5.1 打开终端/命令行

在项目目录中打开新的终端窗口：
```bash
cd C:\Users\agenew\Desktop\DaoEssence
```

### 5.2 启动服务器

执行：
```bash
npm start
```

**期望输出：**
```
========================================
Stripe Payment Server Running
========================================
Server URL: http://localhost:3001
Health Check: http://localhost:3001/api/health
Payment Intent API: http://localhost:3001/api/create-payment-intent
========================================
Environment: development
========================================
```

如果看到这个输出，说明服务器启动成功！✅

---

## 🧪 第 6 步：测试服务器

### 6.1 测试健康检查

打开新的终端窗口（不要关闭服务器），执行：
```bash
curl http://localhost:3001/api/health
```

**期望输出：**
```json
{"status":"ok","message":"Stripe server is running"}
```

### 6.2 测试订单历史

执行：
```bash
node test-webhook.js orders
```

**期望输出：**
```
========================================
📋 Order History
========================================
✅ Orders directory created

📦 Total Orders: 0
```

---

## 💳 第 7 步：创建测试支付

### 7.1 创建 Payment Intent

在浏览器中打开 API 测试工具（如 Postman），或者使用 curl：

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
      "customerName": "Test Customer",
      "customerPhone": "+1234567890"
    }
  }'
```

**期望输出：**
```json
{
  "success": true,
  "clientSecret": "pi_3Pxxxx_secret_xxxx",
  "paymentIntentId": "pi_3Pxxxx",
  "amount": 9999
}
```

### 7.2 保存 clientSecret

复制返回的 `clientSecret`，下一步将使用它完成支付。

---

## 🎨 第 8 步：使用测试卡完成支付

### 8.1 打开 checkout.html

在浏览器中打开：
```
C:\Users\agenew\Desktop\DaoEssence\checkout.html
```

### 8.2 使用 Stripe 测试卡

在支付表单中填写以下测试信息：

**信用卡号：**
```
4242 4242 4242 4242
```

**过期日期：**
```
任意未来日期（如 12/34）
```

**CVC：**
```
任意 3 位数字（如 123）
```

**邮编：**
```
任意 5 位数字（如 12345）
```

### 8.3 完成支付

点击 **"Pay Now"** 或类似按钮。

**期望结果：**
- ✅ 支付成功
- ✅ 显示确认消息
- ✅ 跳转到订单确认页面（如果配置了）

---

## 📊 第 9 步：验证 Webhook 处理

### 9.1 查看服务器日志

在运行服务器的终端窗口中，应该看到类似的输出：

```
📨 Webhook received: payment_intent.succeeded
✅ Payment succeeded: pi_3Pxxxx
========================================
Payment Succeeded
========================================
Payment Intent ID: pi_3Pxxxx
Amount: 99.99 USD
Customer Email: customer@example.com
Status: succeeded
========================================
💾 Order saved to file: orders/test_order_001.json
✅ Order processed successfully
```

### 9.2 查看订单文件

检查 `orders/` 目录，应该有新的订单文件：
```bash
cd C:\Users\agenew\Desktop\DaoEssence\orders
dir
```

应该看到类似：
```
test_order_001.json
```

### 9.3 查询订单状态

执行：
```bash
curl http://localhost:3001/api/order/test_order_001
```

**期望输出：**
```json
{
  "success": true,
  "order": {
    "orderId": "test_order_001",
    "stripePaymentId": "pi_3Pxxxx",
    "amount": 99.99,
    "currency": "USD",
    "status": "paid",
    ...
  }
}
```

### 9.4 查看订单历史

执行：
```bash
node test-webhook.js orders
```

**期望输出：**
```
========================================
📋 Order History
========================================

📦 Total Orders: 1

1. test_order_001
   Amount: 99.99 USD
   Status: paid
   Created: 2024-03-19 10:30:00
   Items: 1
```

---

## ✅ 第 10 步：在 Stripe Dashboard 验证

### 10.1 查看支付记录

访问 Stripe Dashboard：
```
https://dashboard.stripe.com/test/payments
```

应该能看到您刚才创建的测试支付。

### 10.2 查看 Webhook 事件

访问：
```
https://dashboard.stripe.com/test/webhooks
```

点击您创建的 Webhook 端点，应该能看到事件列表，包括 `payment_intent.succeeded`。

---

## 🎉 完成！

如果以上所有步骤都成功，恭喜您！🎉

您的 Stripe 支付系统已完全配置完成并测试通过！

---

## 📚 常见问题

### Q1: Webhook 没有触发？

**解决方案：**
1. 检查 Webhook URL 是否正确
2. 确认服务器正在运行
3. 检查 Stripe Dashboard 的 Webhook 日志
4. 确认 Webhook Secret 是否正确配置

### Q2: 支付失败？

**解决方案：**
1. 检查 Stripe Secret Key 是否正确
2. 确认使用的测试卡信息正确
3. 查看 Stripe Dashboard 的支付记录
4. 检查服务器错误日志

### Q3: 订单没有保存？

**解决方案：**
1. 检查 `orders/` 目录的写入权限
2. 查看服务器日志中的错误信息
3. 确认 Webhook 签名验证通过

---

## 📞 需要帮助？

如果在配置过程中遇到问题：

1. **查看文档**
   - `WEBHOOK_DEPLOYMENT_GUIDE.md`
   - `API_USAGE_EXAMPLES.md`

2. **检查日志**
   - 服务器终端输出
   - Stripe Dashboard 日志

3. **联系支持**
   - Stripe 官方文档：https://stripe.com/docs
   - Stripe 社区：https://stackoverflow.com/questions/tagged/stripe

---

**下一步：**
- ✅ 配置完成
- ⏳ 部署到生产环境
- ⏳ 集成数据库
- ⏳ 添加邮件通知

祝您配置顺利！🚀
