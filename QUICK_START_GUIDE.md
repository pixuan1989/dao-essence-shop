# DAO Essence Shop - 快速启动指南

## 🎯 您现在的位置

您已经完成了 Stripe Webhook 处理系统的开发，现在需要配置 Stripe 密钥并测试支付流程。

---

## 📋 完成状态

**开发工作：** ✅ 100% 完成
**配置工作：** ⏳ 等待 Stripe 密钥
**测试工作：** ⏳ 等待配置完成

---

## 🚀 5 步快速启动

### 第 1 步：获取 Stripe 密钥（5 分钟）

1. **登录 Stripe Dashboard**
   ```
   https://dashboard.stripe.com/test
   ```

2. **获取 Secret Key**
   - 点击左侧 `Developers` → `API keys`
   - 复制 `Secret key`（以 `sk_test_` 开头）

3. **获取 Publishable Key**
   - 在同一页面复制 `Publishable key`（以 `pk_test_` 开头）

4. **创建 Webhook**
   - 点击 `Developers` → `Webhooks`
   - 点击 `Add endpoint`
   - 填写 URL: `http://localhost:3001/api/webhook`
   - 选择事件: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - 点击 `Add endpoint`
   - 复制 `Signing secret`（以 `whsec_` 开头）

---

### 第 2 步：更新配置文件（2 分钟）

打开 `C:\Users\agenew\Desktop\DaoEssence\.env` 文件，替换为实际的密钥：

```env
STRIPE_SECRET_KEY=sk_test_你的密钥
STRIPE_PUBLISHABLE_KEY=pk_test_你的密钥
STRIPE_WEBHOOK_SECRET=whsec_你的密钥
PORT=3001
NODE_ENV=development
```

**⚠️ 重要：**
- 不要删除密钥
- 确保密钥完整
- 保存文件

---

### 第 3 步：验证配置（30 秒）

双击运行：
```
quick-check.js
```

或命令行运行：
```bash
cd C:\Users\agenew\Desktop\DaoEssence
node quick-check.js
```

**期望输出：**
```
✅ STRIPE_SECRET_KEY: 已配置 (sk_test_...)
✅ STRIPE_PUBLISHABLE_KEY: 已配置 (pk_test_...)
✅ STRIPE_WEBHOOK_SECRET: 已配置 (whsec_...)

✅ 配置检查通过！
```

如果看到错误，请重新检查密钥是否正确。

---

### 第 4 步：启动服务器（1 分钟）

**方式 1：双击启动**
```
start.bat
```

**方式 2：命令行启动**
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
========================================
```

---

### 第 5 步：测试支付（2 分钟）

1. **打开支付页面**
   ```
   C:\Users\agenew\Desktop\DaoEssence\checkout.html
   ```

2. **使用测试卡**
   - 卡号: `4242 4242 4242 4242`
   - 过期: 任意未来日期（如 12/34）
   - CVC: 任意 3 位数字（如 123）
   - 邮编: 任意 5 位数字（如 12345）

3. **完成支付**
   - 点击 "Pay Now"
   - 等待支付成功

4. **验证结果**
   - 检查服务器日志是否显示 "Payment succeeded"
   - 查看 `orders/` 目录是否有新订单文件
   - 访问 Stripe Dashboard 查看支付记录

---

## 📁 项目文件说明

### 核心文件

| 文件 | 说明 |
|------|------|
| `start.bat` | 启动脚本（双击运行） |
| `quick-check.js` | 配置检查脚本 |
| `test-webhook.js` | 测试工具 |
| `server.js` | Stripe 服务器 |
| `webhook-handler.js` | Webhook 处理器 |
| `.env` | 环境变量配置（需要填写密钥） |

### 文档

| 文件 | 说明 |
|------|------|
| `QUICK_START_GUIDE.md` | 本文档（快速启动） |
| `CONFIGURE_ENV_GUIDE.md` | 详细配置指南 |
| `WEBHOOK_DEPLOYMENT_GUIDE.md` | Webhook 部署指南 |
| `API_USAGE_EXAMPLES.md` | API 使用示例 |

---

## 🔧 常用命令

### 启动服务器
```bash
npm start
```

### 检查配置
```bash
node quick-check.js
```

### 查看订单历史
```bash
node test-webhook.js orders
```

### 测试支付流程
```bash
node test-webhook.js test
```

---

## ✅ 完成检查

完成所有步骤后，您应该：

- ✅ .env 文件已配置 Stripe 密钥
- ✅ 配置检查通过（运行 quick-check.js）
- ✅ 服务器成功启动（访问 http://localhost:3001/api/health）
- ✅ 支付页面可以打开
- ✅ 测试支付成功
- ✅ 订单自动保存到 orders/ 目录

---

## 🆘 常见问题

### Q: quick-check.js 报错 "密钥未配置"

**A:** 请检查 .env 文件中的密钥是否已正确填写，不是占位符。

### Q: 服务器启动失败

**A:**
1. 确认 .env 文件存在
2. 检查密钥格式是否正确
3. 查看错误信息，按提示修复

### Q: Webhook 没有触发

**A:**
1. 确认服务器正在运行
2. 检查 Webhook URL 是否正确
3. 查看 Stripe Dashboard 的 Webhook 日志

### Q: 支付失败

**A:**
1. 确认使用的是测试卡（4242...）
2. 检查服务器日志
3. 查看 Stripe Dashboard 的支付记录

---

## 📚 详细文档

如果需要更详细的说明，请查看：

1. **配置指南**: `CONFIGURE_ENV_GUIDE.md`
2. **Webhook 指南**: `WEBHOOK_DEPLOYMENT_GUIDE.md`
3. **API 示例**: `API_USAGE_EXAMPLES.md`
4. **完成报告**: `STRIPE_WEBHOOK_COMPLETION_REPORT.md`

---

## 🎉 下一步

配置测试完成后：

### 选项 1：继续开发
- 集成数据库
- 添加邮件通知
- 实现库存管理

### 选项 2：部署上线
- 部署到 Vercel/Netlify
- 配置生产环境 Stripe 密钥
- 创建生产环境 Webhook

### 选项 3：其他功能
- 添加更多支付方式
- 实现退款处理
- 添加订单管理系统

---

## 📞 需要帮助？

- 查看 Stripe 官方文档：https://stripe.com/docs
- 查看 Stripe Dashboard：https://dashboard.stripe.com
- 查看项目文档：所有 .md 文件

---

**祝您配置顺利！** 🚀

**快速命令：**
```
1. node quick-check.js    # 检查配置
2. npm start             # 启动服务器
3. node test-webhook.js   # 测试
```
