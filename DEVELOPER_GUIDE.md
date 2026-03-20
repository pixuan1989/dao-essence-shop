# DAO Essence 开发人员指南

## 项目概述

DAO Essence 是一个垂直精细化的电商网站，专注于道家文化相关产品的销售。本指南提供了项目的功能说明、技术架构和开发指南，帮助开发人员快速理解和维护项目。

## 核心功能

### 1. 产品管理
- **产品展示**：响应式产品列表和详情页
- **产品分类**：支持按类别浏览产品
- **产品详情**：包含产品描述、价格、库存等信息
- **产品数据**：通过 `products.json` 文件管理产品数据

### 2. 购物车功能
- **添加商品**：支持将商品添加到购物车
- **购物车管理**：修改商品数量、移除商品
- **购物车持久化**：使用 localStorage 保存购物车数据
- **购物车计算**：自动计算总价和数量

### 3. 支付系统
- **Stripe集成**：支持两种支付模式
  - Payment Intent 模式
  - Checkout Session 模式
- **测试模式**：支持使用测试卡号进行测试
- **生产模式**：支持真实支付
- **支付验证**：通过 Stripe Webhook 验证支付状态

### 4. 订单管理
- **订单创建**：支付成功后自动创建订单
- **订单通知**：发送邮件通知给买家和商家（作为主要订单管理方式）
- **订单状态**：通过邮件记录跟踪订单状态
- **订单历史**：通过邮件历史记录查看订单历史

### 5. 邮件通知
- **阿里云邮件集成**：使用阿里云邮件推送服务
- **买家确认邮件**：包含订单详情、支付信息和预计发货时间
- **商家通知邮件**：包含订单详情和客户信息
- **发货通知邮件**：包含订单号、发货时间、物流单号和查询方式
- **邮件模板**：美观的 HTML 邮件模板

### 6. 网站管理
- **管理面板**：后台管理功能
- **配置管理**：通过环境变量配置系统
- **日志管理**：系统运行日志和错误记录

## 技术架构

### 前端技术
- **HTML5/CSS3**：响应式网站布局
- **JavaScript**：客户端交互逻辑
- **Bootstrap**：前端框架（如果使用）
- **LocalStorage**：客户端数据存储

### 后端技术
- **Netlify Functions**：无服务器后端
- **Node.js**：运行环境
- **Stripe API**：支付处理
- **阿里云邮件 API**：邮件发送

### 部署架构
- **Netlify**：网站托管和 CI/CD
- **GitHub**：代码版本控制
- **Stripe**：支付处理
- **阿里云**：邮件服务

## 项目结构

```
├── netlify/            # Netlify 配置和函数
│   └── functions/      # 无服务器函数
│       ├── send-order-email.js  # 邮件发送函数
│       ├── webhook.js           # Stripe Webhook 处理
│       └── create-checkout-session/  # 结账会话创建
├── js/                 # 前端 JavaScript
│   ├── shop-cart.js            # 购物车功能
│   ├── shop-checkout.js        # 结账流程
│   ├── shop-products.js        # 产品展示
│   └── stripe-payment.js       # Stripe 支付集成
├── images/             # 图片资源
├── products.json       # 产品数据
├── netlify.toml        # Netlify 配置
├── package.json        # 项目依赖
└── index.html          # 网站首页
```

## 关键文件说明

### 1. 支付相关
- **stripe-payment.js**：Stripe 支付集成，处理支付流程
- **netlify/functions/webhook.js**：处理 Stripe Webhook 事件
- **netlify/functions/create-checkout-session/**：创建 Stripe Checkout 会话

### 2. 邮件相关
- **netlify/functions/send-order-email.js**：使用阿里云邮件服务发送订单邮件

### 3. 购物车相关
- **js/shop-cart.js**：购物车管理功能
- **js/shop-checkout.js**：结账流程处理

### 4. 产品相关
- **js/shop-products.js**：产品展示和管理
- **products.json**：产品数据存储

## 环境变量配置

### 必需环境变量

#### Stripe 相关
- `STRIPE_PUBLIC_KEY`：Stripe 公钥
- `STRIPE_SECRET_KEY`：Stripe 密钥
- `STRIPE_WEBHOOK_SECRET`：Stripe Webhook 密钥

#### 阿里云邮件相关
- `ALIYUN_ACCESS_KEY`：阿里云访问密钥
- `ALIYUN_ACCESS_SECRET`：阿里云访问密钥密码
- `ALIYUN_EMAIL_ACCOUNT`：阿里云邮件发件人地址

#### 其他
- `MERCHANT_EMAIL`：商家接收订单通知的邮箱
- `URL`：网站基础 URL

### 配置方法

在 Netlify Dashboard 中设置环境变量：
1. 登录 Netlify 账户
2. 选择项目
3. 进入 "Site settings" > "Environment variables"
4. 添加上述环境变量

## 开发流程

### 本地开发
1. **克隆代码**：`git clone <repository-url>`
2. **安装依赖**：`npm install`
3. **启动本地服务器**：`npm start`
4. **测试支付**：使用 Stripe 测试卡号

### 部署流程
1. **推送代码**：`git push` 到 GitHub
2. **Netlify 自动部署**：Netlify 会自动构建和部署
3. **验证部署**：访问部署后的网站
4. **配置环境变量**：在 Netlify Dashboard 中设置

## 测试指南

### 支付测试
- **测试卡号**：`4242 4242 4242 4242`
- **过期日期**：任意未来日期
- **CVC**：任意3位数字

### 邮件测试
1. 完成支付流程
2. 检查阿里云邮件控制台的发送记录
3. 验证邮件是否收到
4. 检查邮件内容是否正确

### Webhook 测试
1. 使用 Stripe CLI 或 Dashboard 发送测试事件
2. 检查 Netlify 函数日志
3. 验证事件是否正确处理

## 常见问题

### 支付问题
- **支付失败**：检查 Stripe 密钥配置和网络连接
- **Webhook 未触发**：检查 Webhook 端点配置和密钥
- **订单未创建**：检查支付状态和 Webhook 处理

### 邮件问题
- **邮件未发送**：检查阿里云配置和环境变量
- **邮件被拦截**：检查发件人信誉和邮件内容
- **邮件模板问题**：检查邮件 HTML 模板

### 部署问题
- **构建失败**：检查依赖和构建命令
- **环境变量缺失**：检查 Netlify 环境变量配置
- **函数执行失败**：检查函数代码和日志

## 维护指南

### 产品管理
- **更新产品**：编辑 `products.json` 文件
- **添加产品**：在 `products.json` 中添加新条目
- **库存管理**：定期更新产品库存状态

### 系统维护
- **监控**：定期检查 Netlify 函数日志
- **备份**：定期备份产品数据和配置
- **更新依赖**：定期更新项目依赖

### 安全维护
- **密钥管理**：确保环境变量安全存储
- **SSL证书**：确保 SSL 证书有效
- **安全扫描**：定期进行安全扫描

## 技术支持

### 相关文档
- [Stripe 文档](https://stripe.com/docs)
- [Netlify 文档](https://docs.netlify.com/)
- [阿里云邮件推送文档](https://help.aliyun.com/product/29412.html)

### 联系方式
- **技术支持**：support@daoessence.com
- **Stripe 支持**：[Stripe 支持中心](https://support.stripe.com/)
- **Netlify 支持**：[Netlify 支持中心](https://www.netlify.com/support/)

## 版本历史

### v1.0.0
- 初始版本
- 核心功能实现
- Stripe 支付集成
- 阿里云邮件集成

---

本指南将随着项目的发展不断更新和完善。如有任何问题或建议，请联系技术支持。