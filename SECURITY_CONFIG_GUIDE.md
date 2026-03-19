# 🔐 安全配置指南

## ⚠️ 重要提示

**不要将 API 密钥提交到 GitHub！**

即使测试密钥相对安全，也应该遵循最佳实践。

---

## ✅ 当前状态

### 已正确配置

- ✅ `.gitignore` 包含 `.env` 和 `.env.local`
- ✅ 创建了 `.env.local` 用于本地开发
- ✅ 代码已更新为优先使用环境变量

### 需要配置

- ⏳ Netlify Dashboard 环境变量
- ⏳ Stripe Webhook Secret

---

## 🔧 环境变量配置

### 本地开发环境

已创建 `.env.local` 文件，包含：
```
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

这个文件已在 `.gitignore` 中，不会提交到 GitHub。

### Netlify 生产环境

#### 步骤 1：进入 Netlify Dashboard

访问：https://app.netlify.com/

#### 步骤 2：选择项目

#### 步骤 3：配置环境变量

进入 **Site settings** → **Environment variables**

添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `STRIPE_PUBLIC_KEY` | `pk_test_51TCXN018te51GWieGBFm9rFjcfiZoLq8HEopzrq9gKHOnCi7afzcdUGuptRdlDrLMs6QiFl7bvHfOmIOPKstjPGk00zANzAQjV` | Stripe 公钥（前端使用） |
| `STRIPE_SECRET_KEY` | `sk_test_51TCXN018te51GWiewKqP8Rp8reBZP8oL4WCxngJPliUJKjHbRbRIgpqeEnZ67XylRnLfNvC09I0FXSYhDZo5hsDx00ofI4i5z6` | Stripe 私钥（后端使用） |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Webhook 密钥（从 Stripe Dashboard 获取） |

#### 步骤 4：获取 Webhook Secret

1. 进入 [Stripe Dashboard - Webhooks](https://dashboard.stripe.com/test/webhooks)
2. 配置 Webhook 端点：`https://你的域名.netlify.app/.netlify/functions/webhook`
3. 选择事件后，Stripe 会生成一个 Webhook Secret
4. 复制这个密钥（以 `whsec_` 开头）
5. 在 Netlify Dashboard 添加到 `STRIPE_WEBHOOK_SECRET`

---

## 🔒 安全最佳实践

### ✅ 正确做法

1. **使用环境变量** - 所有密钥都通过环境变量注入
2. **使用 .gitignore** - 确保 `.env` 文件不被提交
3. **分离配置** - 测试环境和生产环境使用不同的密钥
4. **定期轮换** - 定期更新密钥
5. **最小权限** - 只给 API 密钥必要的权限

### ❌ 错误做法

1. ❌ 在代码中硬编码密钥
2. ❌ 提交密钥到版本控制
3. ❌ 使用相同的测试和生产密钥
4. ❌ 在公开渠道分享密钥
5. ❌ 将密钥存储在客户端可访问的文件中

---

## 📋 检查清单

在提交代码前，确认：

- [ ] `.env` 和 `.env.local` 在 `.gitignore` 中
- [ ] 没有在 JavaScript 文件中硬编码密钥
- [ ] 已在 Netlify Dashboard 配置环境变量
- [ ] 测试环境密钥和生产环境密钥分开
- [ ] Webhook Secret 已配置

---

## 🆘 如果已经提交了密钥

### 立即步骤

1. **删除远程仓库中的密钥**：
   ```bash
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch .env' \
     --prune-empty --tag-name-filter cat -- --all
   ```

2. **在 Stripe Dashboard 重新生成密钥**：
   - 进入 [Stripe Dashboard - API Keys](https://dashboard.stripe.com/test/apikeys)
   - 滚动到底部，点击 "Roll key" 重新生成密钥
   - 更新本地和 Netlify 的环境变量

3. **提交并推送**：
   ```bash
   git add .
   git commit -m "Remove sensitive keys and use environment variables"
   git push origin main --force
   ```

---

## 📞 获取帮助

如需帮助，请联系：
- Stripe 安全文档：https://stripe.com/docs/security
- Netlify 环境变量文档：https://docs.netlify.com/site-deploys/environment-variables/

---

**最后更新**: 2026-03-19
