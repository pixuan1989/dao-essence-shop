# Vercel 部署指南

## 部署步骤

### 1. 登录 Vercel 账户
- 访问 [Vercel 官网](https://vercel.com)
- 使用 GitHub 账号登录（推荐）

### 2. 创建新项目
1. 点击 **Add New** → **Project**
2. 在 **Import Git Repository** 部分，输入仓库地址：
   ```
   https://github.com/pixuan1989/dao-essence-shop
   ```
3. 点击 **Import** 按钮

### 3. 配置项目
- **Project Name**：保持默认或自定义
- **Framework Preset**：选择 **Other**
- **Root Directory**：保持为空（使用根目录）
- **Build Command**：留空
- **Output Directory**：留空
- **Environment Variables**：点击 **Add** 按钮添加环境变量

### 4. 配置环境变量

#### 必需的环境变量

| 环境变量 | 说明 | 获取方式 |
|---------|------|----------|
| `STRIPE_SECRET_KEY` | Stripe 密钥 | Stripe Dashboard → API Keys |
| `STRIPE_PUBLISHABLE_KEY` | Stripe 公钥 | Stripe Dashboard → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook 密钥 | Stripe Dashboard → Webhooks |
| `ALIYUN_ACCESS_KEY` | 阿里云访问密钥 | 阿里云控制台 → AccessKey 管理 |
| `ALIYUN_ACCESS_SECRET` | 阿里云访问密钥密码 | 阿里云控制台 → AccessKey 管理 |
| `ALIYUN_EMAIL_ACCOUNT` | 阿里云邮件发件人地址 | 阿里云邮件推送控制台 |
| `MERCHANT_EMAIL` | 商家接收订单通知的邮箱 | 自定义 |
| `MONGODB_URI` | MongoDB Atlas 连接字符串 | MongoDB Atlas 控制台 |
| `PORT` | 服务器端口 | 建议设置为 3000 |
| `NODE_ENV` | 运行环境 | 生产环境设置为 `production` |

### 5. 部署项目
- 点击 **Deploy** 按钮开始部署
- 等待部署完成（通常需要 1-3 分钟）

### 6. 验证部署
- 部署完成后，Vercel 会提供一个预览 URL
- 访问该 URL 测试网站功能
- 检查以下功能：
  - 网站首页加载
  - 商品列表显示
  - 购物车功能
  - 结账流程
  - 支付集成

### 7. 配置自定义域名（可选）
1. 在 Vercel 项目设置中，点击 **Domains**
2. 添加自定义域名
3. 按照 Vercel 提供的 DNS 配置指南更新域名解析
4. 等待 SSL 证书自动生成

## 环境变量详细配置

### Stripe 配置
1. 登录 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 进入 **Developers** → **API Keys**
3. 复制 **Secret key** 和 **Publishable key**
4. 进入 **Webhooks** → **Add endpoint**
5. 输入 Vercel 部署的 Webhook 地址：
   ```
   https://your-vercel-app.vercel.app/api/webhook
   ```
6. 选择需要监听的事件：
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.failed`
7. 复制 **Signing secret**

### 阿里云邮件配置
1. 登录 [阿里云控制台](https://console.aliyun.com/)
2. 开通 **邮件推送** 服务
3. 配置发信域名和发信地址
4. 创建 AccessKey（建议使用子账户，权限仅限于邮件推送）

### MongoDB Atlas 配置
1. 登录 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 创建免费集群
3. 配置数据库用户和网络访问权限
4. 获取连接字符串（包含用户名和密码）

## 常见问题

### 部署失败
- **检查构建日志**：查看 Vercel 部署日志，了解具体错误原因
- **依赖问题**：确保 `package.json` 中的依赖正确
- **环境变量**：检查是否所有必需的环境变量都已配置

### 功能测试失败
- **支付测试**：使用 Stripe 测试卡号进行测试
- **邮件测试**：检查阿里云邮件发送记录
- **Webhook 测试**：使用 Stripe Dashboard 发送测试事件

### 性能优化
- **图片优化**：压缩图片大小
- **代码压缩**：使用构建工具压缩静态资源
- **缓存策略**：配置合理的缓存策略

## 部署完成后的后续步骤

1. **监控网站**：使用 Vercel Analytics 监控网站访问情况
2. **设置 CI/CD**：配置 GitHub Actions 实现自动部署
3. **备份数据**：定期备份 MongoDB 数据
4. **安全检查**：定期检查网站安全性

---

部署完成后，您的 DAO Essence 网站将在 Vercel 上运行，享受 Vercel 的全球 CDN 加速和自动 HTTPS 支持。