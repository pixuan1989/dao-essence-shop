# DAO Essence 完整架构方案

**文档版本**：v1.0  
**创建时间**：2026-03-23  
**目标受众**：Solo Coder（实施执行）  
**决策者**：项目管理层

---

## 📋 目录

1. [项目概览](#项目概览)
2. [核心决策](#核心决策)
3. [技术架构](#技术架构)
4. [实施任务清单](#实施任务清单)
5. [验收标准](#验收标准)
6. [风险评估](#风险评估)

---

## 项目概览

### 当前状态（2026-03-23）

**✅ 已完成**：
- 前端页面框架（index.html, shop.html, product-detail.html 等）
- 购物车功能
- Creem API 集成基础（creem-sync.js）
- Vercel 部署（Serverless API）

**⏳ 进行中/待优化**：
- Creem API 实时同步（部分工作）
- 静态文件服务配置
- API 路由优化

**❌ 未开始**：
- 支付系统完整集成
- 订单管理后台
- 用户认证系统
- 数据分析和监控

---

## 核心决策

### 决策 1：部署平台选择

**选择**：Vercel Serverless + GitHub

**理由**：
- ✅ 完全一体化（前端 + 后端在同一平台）
- ✅ 自动化部署（git push 自动触发）
- ✅ 150万请求/月免费额度
- ✅ 环境变量管理简单
- ✅ 与现有架构无缝集成

**替代方案对比**：

| 方案 | 一体化 | 维护 | 成本 | 推荐度 |
|------|--------|------|------|--------|
| **Vercel** | ✅ 完全 | 简单 | 免费 | ⭐⭐⭐⭐⭐ |
| CloudFlare | ⚠️ 分离 | 复杂 | 免费 | ⭐⭐ |
| AWS Lambda | ❌ 分离 | 复杂 | 付费 | ⭐ |

---

### 决策 2：API 代理架构

**选择**：Vercel Serverless Functions（api/ 目录）

**原因**：
- 浏览器 CORS 限制无法直接调用 Creem API
- Serverless 函数作为代理层，解决跨域问题
- 环境变量存储 API Key（安全）
- HTTP 缓存头 + 浏览器 localStorage（性能）

**架构图**：
```
前端 (fetch)
   ↓
Vercel Serverless API (/api/products)
   ↓
Creem API (https://api.creem.io/v1)
   ↓
返回 JSON → 前端显示
```

---

### 决策 3：数据同步策略

**选择**：三层缓存 + 自动降级

1. **浏览器缓存**（localStorage）：5分钟有效期
2. **HTTP CDN 缓存**：Cache-Control: max-age=300
3. **后端备用数据**：API 失败时使用本地商品数据

**优势**：
- 用户快速访问（本地缓存秒级加载）
- 减少 API 调用（降低成本）
- API 故障时仍可用（自动降级）

---

## 技术架构

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层（SPA）                          │
│  ┌────────────┬──────────────┬──────────────────────────┐  │
│  │ index.html │ shop.html    │ product-detail.html      │  │
│  │ (首页)     │ (商品列表)   │ (商品详情)               │  │
│  └────────────┴──────────────┴──────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ creem-sync.js（客户端：数据同步、缓存、路由）        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                         ↓ (fetch)
┌─────────────────────────────────────────────────────────────┐
│                   API 层（Serverless）                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ /api/products.js - Creem 代理                        │  │
│  │ • 环境变量：CREEM_API_KEY                           │  │
│  │ • 超时控制：8秒                                     │  │
│  │ • 缓存头：Cache-Control: max-age=300               │  │
│  │ • 错误处理：自动降级                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         ↓ (HTTP)
┌─────────────────────────────────────────────────────────────┐
│                  第三方 API（Creem）                        │
│  https://api.creem.io/v1                                   │
│  • 获取商品数据                                            │
│  • 获取实时价格                                            │
│  • 支付集成                                                │
└─────────────────────────────────────────────────────────────┘
```

---

### 文件结构

```
dao-essence-shop/
├── api/
│   ├── products.js              ← Creem API 代理
│   ├── creem-proxy.js           ← 备用代理
│   └── send-order-email.js
├── js/
│   ├── creem-sync.js            ← 客户端同步脚本（关键）
│   ├── main.js                  ← 全局 JS
│   ├── shop-manager.js          ← 商品管理
│   └── product-detail.js        ← 详情页逻辑
├── index.html                   ← 首页
├── shop.html                    ← 商品列表
├── product-detail.html          ← 商品详情
├── vercel.json                  ← Vercel 配置（最小化）
└── products.json                ← 本地备用商品数据
```

---

### 关键文件说明

#### 1. `api/products.js`（Serverless Function）

**职责**：
- 接收前端请求 `/api/products`
- 从 Creem API 拉取最新商品数据
- 处理错误和超时
- 返回 JSON 格式数据

**关键代码片段**：
```javascript
// 环境变量读取 API Key（安全）
const CREEM_API_KEY = process.env.CREEM_API_KEY;

// 超时控制
const API_TIMEOUT = 8000;

// HTTP 缓存头（CDN + 浏览器）
res.setHeader('Cache-Control', 'public, max-age=300');

// 错误降级（返回本地数据）
if (error) {
  return res.json(FALLBACK_PRODUCTS);
}
```

**部署**：Vercel 自动识别 `/api/*.js` 文件

---

#### 2. `js/creem-sync.js`（客户端同步）

**职责**：
- 页面加载时自动执行
- 检查本地缓存（localStorage）
- 如果缓存有效，使用缓存
- 如果缓存过期，从 API 拉取新数据
- 更新全局 `window.allProducts`
- 重新渲染 UI

**执行流程**：
```
页面加载
  ↓
DOMContentLoaded 触发 creem-sync.js
  ↓
检查 localStorage 缓存
  ↓
├─ 缓存有效（< 5分钟）→ 使用缓存 → 渲染
└─ 缓存过期或无缓存 → 调用 /api/products
  ↓
获取最新数据
  ↓
保存到 localStorage（5分钟有效期）
  ↓
更新 window.allProducts
  ↓
重新渲染 UI
```

**代码特点**：
- 自动执行，用户无需操作
- 异常处理完善
- 降级策略（API 失败使用本地数据）

---

#### 3. `vercel.json`（部署配置）

**最小化配置**：
```json
{
  "buildCommand": "",
  "outputDirectory": "public"
}
```

**说明**：
- Vercel 自动识别 `api/` 目录中的 `.js` 文件
- 其他文件（`.html`, `.css`, `.js`）由默认静态文件服务器处理
- 不需要复杂的路由规则

---

## 实施任务清单

### Phase 1：验证当前部署（1 小时）

**Task 1.1：检查 Vercel 部署状态**
```
□ 打开 Vercel Dashboard
□ 确认最新部署状态（Ready）
□ 查看部署日志，无错误
□ 记录部署 ID
```

**Task 1.2：验证环境变量**
```
□ Vercel Settings → Environment Variables
□ 确认 CREEM_API_KEY 已设置
□ 检查 value 正确无误
□ 确认已应用到 main 分支
```

**Task 1.3：测试 API 端点**
```
□ 打开浏览器，访问 /api/products
□ 检查返回 JSON 格式数据
□ 包含两个商品：
  - prod_7i2asEAuHFHl5hJMeCEsfB（传统沉香，$200）
  - prod_1YuuAVysoYK6AOmQVab2uR（五行能量手串，$168）
□ 检查 HTTP 缓存头（Cache-Control: public, max-age=300）
```

**Task 1.4：测试前端页面**
```
□ 打开主页 https://dao-essence-shop.vercel.app/
□ 页面能正常加载（无 404）
□ 检查浏览器 Console（无错误）
□ 打开 DevTools → Storage → Local Storage
□ 查看 creem_products_cache（应有缓存数据）
```

---

### Phase 2：优化 API 响应（2 小时）

**Task 2.1：检查 API 响应格式**

期望返回格式：
```json
{
  "success": true,
  "products": [
    {
      "id": "prod_7i2asEAuHFHl5hJMeCEsfB",
      "name": "传统沉香",
      "price": 200,
      "currency": "USD",
      "image": "https://...",
      "description": "...",
      "stock": 100
    },
    {
      "id": "prod_1YuuAVysoYK6AOmQVab2uR",
      "name": "五行能量手串",
      "price": 168,
      "currency": "USD",
      "image": "https://...",
      "description": "...",
      "stock": 50
    }
  ],
  "timestamp": "2026-03-23T13:55:00Z",
  "cacheAge": 0
}
```

**Task 2.2：测试缓存机制**
```
□ 第一次访问 /api/products（无缓存）
  → 记录响应时间 T1
□ 立即第二次访问（应有缓存）
  → 记录响应时间 T2
□ 验证 T2 << T1（缓存应该快得多）
□ 检查 response header: X-Cache: HIT/MISS
```

**Task 2.3：测试错误降级**
```
□ 临时关闭 CREEM_API_KEY（模拟 API 失败）
□ 访问 /api/products
□ 应返回本地备用商品数据
□ 恢复 CREEM_API_KEY
```

---

### Phase 3：前端集成测试（3 小时）

**Task 3.1：检查 creem-sync.js 加载**
```
□ 打开主页
□ 打开 DevTools → Console
□ 查看日志：
  "CREEM Sync: Checking cache..."
  "CREEM Sync: Cache hit, using local data"
  或
  "CREEM Sync: Fetching from API..."
□ 无 JavaScript 错误
```

**Task 3.2：验证商品显示**

首页（index.html）：
```
□ 能量宇宙区域显示 2 个商品卡片
□ 卡片显示正确的商品名称和价格
□ 点击"查看详情"能跳转到详情页
```

商品列表（shop.html）：
```
□ 显示 2 个商品
□ 能正确排序/筛选
□ 点击商品进入详情页
□ 加入购物车功能正常
```

商品详情（product-detail.html）：
```
□ URL 包含 ?id=prod_xxx
□ 正确加载对应的商品数据
□ 图片、价格、描述都显示正确
□ 加入购物车功能正常
□ 购物车侧边栏打开/关闭功能正常
```

---

### Phase 4：生产环境验收（1 小时）

**Task 4.1：性能检查**
```
□ 首页加载时间 < 2 秒
□ API 响应时间 < 500ms（缓存命中）
□ 无网络错误或 4xx/5xx 响应
□ Lighthouse 分数 > 80
```

**Task 4.2：浏览器兼容性**
```
□ Chrome（最新版）
□ Firefox（最新版）
□ Safari（最新版）
□ Edge（最新版）
□ 移动浏览器（iOS Safari + Chrome）
```

**Task 4.3：安全检查**
```
□ API Key 不在客户端代码中暴露
□ HTTPS 连接（Vercel 默认）
□ 无 CORS 错误
□ 无敏感信息在 localStorage 中
```

**Task 4.4：监控设置**
```
□ Vercel Analytics 已启用
□ 检查 Serverless Functions 日志
□ 记录基准性能数据
□ 设置告警规则（如 error rate > 5%）
```

---

## 验收标准

### 成功标准（必须全部满足）

#### ✅ 功能验收

| 功能模块 | 验收标准 | 优先级 |
|---------|--------|--------|
| API 端点 | `/api/products` 返回有效 JSON，包含 2 个商品 | P0 |
| 首页显示 | 能量宇宙区域显示 2 个商品卡片 | P0 |
| 商品列表 | shop.html 显示所有商品，能点击进入详情 | P0 |
| 商品详情 | 显示正确的商品信息，加入购物车功能正常 | P0 |
| 购物车 | 侧边栏能打开/关闭，显示购物车数量 | P0 |
| 缓存机制 | localStorage 有效期 5 分钟，API 缓存有效 | P1 |
| 错误降级 | API 失败时返回本地备用数据 | P1 |

#### ✅ 性能验收

| 指标 | 目标值 | 当前值 |
|------|--------|--------|
| 首页加载时间 | < 2 秒 | __ |
| API 响应时间（缓存命中） | < 500ms | __ |
| API 响应时间（无缓存） | < 2 秒 | __ |
| 首屏 LCP | < 2.5 秒 | __ |
| Lighthouse 总分 | > 80 | __ |

#### ✅ 安全验收

| 检查项 | 状态 | 说明 |
|--------|------|------|
| API Key 安全 | ✅ | 存储在 Vercel 环境变量，不在代码中 |
| HTTPS | ✅ | Vercel 默认启用 |
| CORS | ✅ | 无 CORS 错误 |
| 敏感数据 | ✅ | localStorage 中无敏感信息 |

---

## 风险评估

### 已知风险

| 风险 | 严重性 | 缓解方案 |
|------|--------|---------|
| Vercel 部署失败 | 🔴 P0 | 立即查看构建日志，检查 vercel.json |
| Creem API 超时 | 🟡 P1 | 自动降级到本地数据，设置 8 秒超时 |
| 缓存策略不当 | 🟡 P1 | localStorage 5 分钟 + HTTP 300 秒 |
| 浏览器缓存干扰 | 🟡 P1 | 使用 Ctrl+Shift+R 硬刷新测试 |
| 网络问题 | 🟢 P2 | 使用备用商品数据，用户可继续浏览 |

---

### 故障排查指南

**问题：API 返回 404**
```
1. 检查 Vercel 部署状态（Dashboard → Deployments）
2. 查看构建日志中是否有错误
3. 确认 api/products.js 文件存在
4. 检查 vercel.json 配置
5. 如不行，删除 vercel.json 使用默认配置
```

**问题：API 返回 {"success": false}**
```
1. 检查 CREEM_API_KEY 环境变量是否正确
2. 检查 API Key 是否过期
3. 查看 Vercel Function 日志（Deployments → Function Logs）
4. 检查网络连接是否正常
```

**问题：前端无法显示商品**
```
1. 打开 DevTools → Console，查看是否有 JS 错误
2. 检查 Network 标签，/api/products 是否返回 200
3. 检查 localStorage 中是否有缓存数据
4. 检查 window.allProducts 全局变量是否有数据
5. 刷新页面（Ctrl+Shift+R）
```

**问题：购物车无法打开**
```
1. 打开 DevTools → Console
2. 手动执行 toggleCart() 测试
3. 检查是否有 CSS 错误（z-index, display 等）
4. 查看 product-detail.js 中的购物车事件绑定代码
5. 检查 HTML 中购物车 ID 是否正确
```

---

## Solo Coder 执行清单

### 📝 执行前准备

- [ ] 克隆仓库到本地
- [ ] 切换到 main 分支
- [ ] 安装依赖：`npm install`（如需要）
- [ ] 查看本文档和关键代码文件

### 🔍 Phase 1：验证（1 小时）

- [ ] Task 1.1：Vercel 部署状态检查
- [ ] Task 1.2：环境变量验证
- [ ] Task 1.3：API 端点测试
- [ ] Task 1.4：前端页面测试

### ⚙️ Phase 2：优化（2 小时）

- [ ] Task 2.1：API 响应格式检查
- [ ] Task 2.2：缓存机制测试
- [ ] Task 2.3：错误降级测试

### 🧪 Phase 3：集成测试（3 小时）

- [ ] Task 3.1：creem-sync.js 加载检查
- [ ] Task 3.2：首页商品显示验证
- [ ] Task 3.3：商品列表页面验证
- [ ] Task 3.4：商品详情页面验证
- [ ] Task 3.5：购物车功能验证

### ✅ Phase 4：生产验收（1 小时）

- [ ] Task 4.1：性能检查
- [ ] Task 4.2：浏览器兼容性
- [ ] Task 4.3：安全检查
- [ ] Task 4.4：监控设置

### 📊 完成后

- [ ] 生成验收报告
- [ ] 填写所有验收表格
- [ ] 上报任何发现的 bug
- [ ] 提出优化建议

---

## 关键联系方式

- **Creem API Key**：`creem_1qa0zx2EuHN9gz9DLcGTAG`
- **Creem 商品 ID**：
  - 传统沉香：`prod_7i2asEAuHFHl5hJMeCEsfB`
  - 五行能量手串：`prod_1YuuAVysoYK6AOmQVab2uR`
- **Vercel Project**：dao-essence-shop
- **GitHub Repo**：pixuan1989/dao-essence-shop

---

## 附录：常用命令

```bash
# 本地开发测试
npm run dev

# 构建
npm run build

# 部署到 Vercel（已配置自动部署）
git push origin main

# 查看 Vercel 部署日志
vercel logs

# 测试 API（本地）
curl http://localhost:3000/api/products

# 测试 API（生产）
curl https://dao-essence-shop.vercel.app/api/products
```

---

**文档完成日期**：2026-03-23  
**版本**：1.0  
**维护者**：架构团队