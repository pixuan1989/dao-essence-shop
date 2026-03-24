# Netlify Functions 部署指南

## 📋 概述

本文档指导如何将 DAO Essence 的 Stripe 支付后端从本地服务器迁移到 Netlify Functions。

## 🎯 改造完成的内容

### ✅ 已完成

1. **Netlify Functions 创建**
   - `netlify/functions/create-payment-intent.js` - 创建支付意图
   - `netlify/functions/get-payment-intent.js` - 查询支付状态
   - `netlify/functions/webhook.js` - 处理 Stripe Webhook
   - `netlify/functions/get-order.js` - 获取订单信息
   - `netlify/functions/get-orders.js` - 获取订单历史

2. **前端集成**
   - 创建 `stripe-payment.js` - 完整的支付流程处理
   - 更新 `checkout.html` - 集成新的支付系统
   - 创建 `order-confirm.html` - 订单确认页面

3. **配置文件**
   - `netlify.toml` - Netlify 部署配置（已存在）

## 🚀 部署步骤

### 步骤 1: 配置 Netlify 环境变量

在 Netlify Dashboard 中配置以下环境变量：

1. 登录 Netlify Dashboard
2. 选择你的 DAO Essence 项目
3. 进入 **Site settings** → **Environment variables**

添加以下环境变量：

```bash
# Stripe Secret Key (从 Stripe Dashboard 获取)
STRIPE_SECRET_KEY=sk_test_...

# Stripe Webhook Secret (配置 Webhook 后生成)
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Publishable Key (前端使用)
STRIPE_PUBLIC_KEY=pk_test_...
```

**注意**：请从你的 Stripe Dashboard 复制实际的密钥，不要使用上面的占位符。

### 步骤 2: 更新 netlify.toml

确认 `netlify.toml` 包含以下配置：

```toml
[build]
  command = "echo 'DAO Essence shop ready for deployment'"
  publish = "."
  functions = "netlify/functions"
```

### 步骤 3: 提交并推送代码

```bash
git add .
git commit -m "Add Netlify Functions for Stripe payment"
git push origin main
```

Netlify 会自动部署更新。

### 步骤 4: 测试本地开发（可选）

如果想先在本地测试，需要安装 Netlify CLI：

```bash
npm install -g netlify-cli
netlify login
netlify dev
```

这会在本地启动 Netlify Functions 服务器。

### 步骤 5: 配置 Stripe Webhook

#### 获取 Webhook 端点 URL

部署成功后，你的 Webhook URL 将是：

```
https://你的域名.netlify.app/.netlify/functions/webhook
```

例如：
```
https://dao-essence.netlify.app/.netlify/functions/webhook
```

#### 在 Stripe Dashboard 配置 Webhook

1. 进入 [Stripe Dashboard - Webhooks](https://dashboard.stripe.com/test/webhooks)
2. 点击 **Add endpoint** 按钮
3. 输入 Webhook URL：`https://你的域名.netlify.app/.netlify/functions/webhook`
4. 选择事件：
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `payment_intent.created`
   - ✅ `payment_intent.canceled`
5. 点击 **Add endpoint**
6. 复制 **Webhook Secret**（以 `whsec_` 开头）
7. 回到 Netlify Dashboard，更新 `STRIPE_WEBHOOK_SECRET` 环境变量

## 📁 项目结构

```
dao-essence/
├── netlify/
│   └── functions/
│       ├── create-payment-intent.js  ← 创建支付意图
│       ├── get-payment-intent.js    ← 查询支付状态
│       ├── webhook.js               ← 处理 Stripe Webhook
│       ├── get-order.js             ← 获取订单信息
│       └── get-orders.js            ← 获取订单历史
├── stripe-payment.js                ← 前端支付处理
├── checkout.html                    ← 结账页面（已更新）
├── order-confirm.html               ← 订单确认页面（新建）
├── cart.js                          ← 购物车模块
├── netlify.toml                     ← Netlify 配置
└── ... (其他文件)
```

## 🔧 API 端点

部署后的 API 端点：

```
POST   /.netlify/functions/create-payment-intent  创建支付意图
GET    /.netlify/functions/get-payment-intent    查询支付状态
GET    /.netlify/functions/get-order             获取订单信息
GET    /.netlify/functions/get-orders            获取订单历史
POST   /.netlify/functions/webhook               Stripe Webhook
```

## 💡 优势

### ✅ 使用 Netlify Functions 的好处

1. **无需管理服务器**
   - 不需要购买和配置服务器
   - 自动扩缩容
   - 免运维

2. **免费套餐充足**
   - 125,000 次函数调用/月
   - 100GB 带宽/月
   - 对小型电商完全够用

3. **部署简单**
   - git push 自动部署
   - 无需配置 CI/CD
   - 全球 CDN 加速

4. **安全性高**
   - HTTPS 自动启用
   - 环境变量隔离
   - 不会暴露密钥

## ⚠️ 注意事项

### 数据存储限制

**当前限制**：
- Netlify Functions **无法**访问文件系统（fs）
- 无法使用 `localStorage` 或 `fs.writeFile()` 存储订单

**解决方案**：
有三种方案可以选择：

#### 方案 A：使用 Stripe 作为数据源（推荐，最简单）
- 订单数据存储在 Stripe 的 Payment Intent 中
- 通过 Stripe API 查询订单历史
- 优点：无需额外配置，稳定可靠
- 缺点：查询稍慢，需要使用 Stripe API

#### 方案 B：集成外部数据库（推荐，功能完整）
- 使用 Supabase、FaunaDB、MongoDB Atlas 等
- 在 `webhook.js` 中将订单保存到数据库
- 优点：功能完整，可扩展性强
- 缺点：需要配置数据库

#### 方案 C：使用 Netlify Database（推荐，最集成）
- Netlify 自带的数据库服务
- 完全集成，无需额外配置
- 优点：无缝集成，管理方便
- 缺点：需要额外订阅

## 🔄 从本地服务器迁移

### 之前（本地服务器）

```javascript
// API 调用
fetch('http://localhost:3001/api/create-payment-intent', {
    method: 'POST',
    body: JSON.stringify({ amount: 100 })
});
```

### 现在（Netlify Functions）

```javascript
// API 调用
fetch('/.netlify/functions/create-payment-intent', {
    method: 'POST',
    body: JSON.stringify({ amount: 100 })
});
```

## 🧪 测试

### 本地测试

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 启动本地开发服务器
netlify dev

# 访问
http://localhost:8888
```

### 生产环境测试

1. 部署到 Netlify
2. 访问你的域名
3. 测试完整的购买流程
4. 检查 Stripe Dashboard 的支付记录

## 📊 监控和日志

### 查看 Function 日志

1. 进入 Netlify Dashboard
2. 选择项目
3. 点击 **Functions** 标签
4. 查看函数调用日志和错误

### Stripe Dashboard

1. 进入 [Stripe Dashboard](https://dashboard.stripe.com/test/dashboard)
2. 查看 **Payments** 标签
3. 检查支付状态和 Webhook 事件

## 🎉 完成

恭喜！你的 DAO Essence 网站现在已经：
- ✅ 前后端都部署在 Netlify
- ✅ 支持完整的 Stripe 支付流程
- ✅ Webhook 自动接收支付状态
- ✅ 无需管理服务器

## 🆘 故障排除

### 问题 1: 函数调用失败

**症状**：支付时显示 500 错误

**解决方案**：
1. 检查 Netlify Dashboard 的 Function 日志
2. 确认环境变量已正确配置
3. 检查 Stripe API 密钥是否有效

### 问题 2: Webhook 不工作

**症状**：支付成功后没有收到通知

**解决方案**：
1. 检查 Webhook URL 是否正确
2. 在 Stripe Dashboard 查看 Webhook 发送日志
3. 确认 `STRIPE_WEBHOOK_SECRET` 已配置

### 问题 3: 本地开发失败

**症状**：`netlify dev` 命令报错

**解决方案**：
1. 确保已安装最新版 Netlify CLI：`npm update -g netlify-cli`
2. 检查 `netlify.toml` 配置是否正确
3. 查看错误日志获取详细信息

## 📞 支持

如有问题，请联系：
- Netlify 文档：https://docs.netlify.com/
- Stripe 文档：https://stripe.com/docs/
- DAO Essence 支持：support@daoessentia.com

---

**文档版本**: 1.0
**更新日期**: 2026-03-19
**作者**: WorkBuddy AI Assistant
