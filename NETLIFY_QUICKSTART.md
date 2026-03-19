# 🚀 Netlify Functions 快速部署指南

## ⚡ 5 分钟部署步骤

### 1️⃣ 提交代码

```bash
git add .
git commit -m "Add Netlify Functions for Stripe payment"
git push origin main
```

Netlify 会自动部署。

### 2️⃣ 配置环境变量

进入 [Netlify Dashboard](https://app.netlify.com/)：

1. 选择你的项目
2. **Site settings** → **Environment variables**
3. 添加：

```bash
# 从 Stripe Dashboard - API Keys 复制
STRIPE_SECRET_KEY=sk_test_...

# 从 Stripe Dashboard - Webhooks 复制（配置 Webhook 后生成）
STRIPE_WEBHOOK_SECRET=whsec_...

# 从 Stripe Dashboard - API Keys 复制
STRIPE_PUBLIC_KEY=pk_test_...
```

### 3️⃣ 配置 Stripe Webhook

#### 获取你的 Webhook URL

格式：`https://你的域名.netlify.app/.netlify/functions/webhook`

示例：`https://dao-essence.netlify.app/.netlify/functions/webhook`

#### 在 Stripe Dashboard 配置

1. 进入 [Stripe Dashboard - Webhooks](https://dashboard.stripe.com/test/webhooks)
2. **Add endpoint**
3. 输入 Webhook URL（上面的 URL）
4. 选择事件：
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `payment_intent.created`
   - ✅ `payment_intent.canceled`
5. **Add endpoint**
6. 复制 **Webhook Secret**（`whsec_...`）
7. 回到 Netlify，添加环境变量：
   ```
   STRIPE_WEBHOOK_SECRET=whsec_你复制的密钥
   ```

### 4️⃣ 测试

1. 访问你的网站
2. 添加商品到购物车
3. 进入结账页面
4. 点击"去支付"
5. 完成测试支付（使用 Stripe 测试卡号：`4242 4242 4242 4242`）

## ✅ 完成！

你的 DAO Essence 网站现在支持完整的 Stripe 支付流程了！

---

**详细文档**: 查看 `NETLIFY_DEPLOYMENT_GUIDE.md`

**测试卡号**: `4242 4242 4242 4242` (CVC: 任意, 过期日期: 未来任意日期)
