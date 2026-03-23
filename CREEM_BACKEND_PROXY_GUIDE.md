# 🚀 Creem API 后端代理方案 - 完整部署指南

## 📋 概述

这是一个**一站式解决方案**，用于解决浏览器 CORS 问题，实现网页与 Creem API 的实时数据同步。

```
前端页面 → 后端代理 API → Creem API → 返回数据 → 前端显示
```

---

## 🎯 最终效果

✅ **你在 Creem 后台更新商品** → **网页自动同步显示最新数据**

- 商品名称、价格、图片、描述都实时更新
- 自动缓存，提升加载速度
- 失败时自动降级到备用数据（不会白屏）

---

## 📁 文件结构

```
DaoEssence - 副本/
├── api/
│   └── creem-proxy.js          ← 后端代理 API（新建）
├── js/
│   ├── creem-sync.js           ← 旧版本（删除）
│   └── creem-sync-v2.js        ← 新版本（使用）
├── index.html                  ← 需要加载 creem-sync-v2.js
├── shop.html                   ← 需要加载 creem-sync-v2.js
├── product-detail.html         ← 需要加载 creem-sync-v2.js
└── wrangler.toml               ← CloudFlare Workers 配置（新建）
```

---

## 🔧 部署步骤

### 方案 A：使用 CloudFlare Workers（推荐 ⭐⭐⭐⭐⭐）

**为什么推荐？**
- ✅ 零服务器维护
- ✅ 全球 CDN 加速
- ✅ 免费额度充足
- ✅ 部署超简单

#### 第 1 步：安装 Wrangler CLI

```bash
npm install -g wrangler
```

#### 第 2 步：登录 CloudFlare

```bash
wrangler login
```

#### 第 3 步：创建 Worker 项目

```bash
# 在项目根目录下
wrangler init dao-essence-sync --type javascript
```

#### 第 4 步：配置 wrangler.toml

```toml
name = "dao-essence-sync"
main = "src/index.js"
compatibility_date = "2024-01-01"

[env.production]
routes = [
  { pattern = "api.dao-essence.com/*", zone_name = "dao-essence.com" }
]
```

#### 第 5 步：配置 API 密钥

```bash
wrangler secret put CREEM_API_KEY
# 输入：creem_1qa0zx2EuHN9gz9DLcGTAG
```

#### 第 6 步：修改 src/index.js

复制 `api/creem-proxy.js` 中的代码到 `src/index.js`，修改配置：

```javascript
const CREEM_CONFIG = {
  apiBase: 'https://api.creem.io/v1',
  apiKey: env.CREEM_API_KEY, // 从环境变量读取
  productIds: {
    agarwood: 'prod_7i2asEAuHFHl5hJMeCEsfB',
    bracelet: 'prod_1YuuAVysoYK6AOmQVab2uR'
  }
};

export default {
  async fetch(request, env) {
    return handleRequest(request, env);
  }
};
```

#### 第 7 步：部署

```bash
wrangler deploy
```

✅ 完成！你会得到一个 URL，比如 `https://dao-essence-sync.workers.dev`

#### 第 8 步：更新前端代码

在 `index.html`, `shop.html`, `product-detail.html` 中：

```html
<!-- 删除旧的 creem-sync.js -->
<!-- <script src="js/creem-sync.js"></script> -->

<!-- 加载新的同步脚本 -->
<script src="js/creem-sync-v2.js"></script>

<!-- 可选：如果用了 CloudFlare Workers，修改 creem-sync-v2.js 中的 apiEndpoint -->
<script>
  // 放在 creem-sync-v2.js 加载之前
  CREEM_SYNC_CONFIG.apiEndpoint = 'https://dao-essence-sync.workers.dev/api/products';
</script>
```

---

### 方案 B：使用本地 Node.js 服务器（开发环境）

#### 第 1 步：创建服务器

```bash
npm install express cors
```

#### 第 2 步：创建 server.js

```javascript
const express = require('express');
const cors = require('cors');
const { handleRequest } = require('./api/creem-proxy.js');

const app = express();
app.use(cors());

app.get('/api/products', async (req, res) => {
  const response = await handleRequest(new Request('http://localhost:8000/api/products'));
  res.send(await response.json());
});

app.listen(8000, () => {
  console.log('🚀 Server running on http://localhost:8000');
});
```

#### 第 3 步：运行

```bash
node server.js
```

#### 第 4 步：前端配置

```javascript
// creem-sync-v2.js 中
CREEM_SYNC_CONFIG.apiEndpoint = 'http://localhost:8000/api/products';
```

---

### 方案 C：使用 Vercel（仅 Python/Node.js）

编辑 `vercel.json`:

```json
{
  "functions": {
    "api/creem-proxy.js": {
      "runtime": "python3.9"
    }
  }
}
```

---

## 🧪 测试

### 在浏览器中测试 API

1. 打开 DevTools（F12）
2. 在 Console 中输入：

```javascript
// 测试后端 API
fetch('/api/products')
  .then(r => r.json())
  .then(data => {
    console.log('✅ 产品数据:', data);
  })
  .catch(e => console.error('❌ 错误:', e));
```

### 测试页面

1. 打开 `http://127.0.0.1:8888/shop.html`
2. 打开 DevTools（F12）
3. 检查 Console 日志，应该看到：

```
🚀 开始 Creem 产品同步...
✅ 使用缓存的产品数据...
✅ 全局 window.allProducts 已更新
✅ 页面已重新渲染
```

4. 检查是否显示 2 个产品（传统沉香 $200 + 五行能量手串 $168）

---

## 🔄 工作流程

### 用户流程

```
1. 你在 Creem 后台更新商品信息
   ↓
2. 用户访问你的网站 / 刷新页面
   ↓
3. 前端自动执行 creem-sync-v2.js
   ↓
4. 检查 localStorage 缓存（有效期 5 分钟）
   ↓
   如果缓存有效 → 使用缓存 → 立即显示
   如果缓存过期 → 调用后端 API
   ↓
5. 后端 API 调用 Creem API 拉取最新数据
   ↓
6. 转换数据格式 → 返回给前端
   ↓
7. 前端显示最新商品 → 存入缓存
   ↓
8. 完成！网页显示的就是 Creem 后台的最新商品
```

### 缓存机制

- **缓存时间**：5 分钟
- **缓存位置**：localStorage
- **过期后**：自动重新拉取 API
- **API 失败**：使用备用数据

---

## 🚨 常见问题

### Q：API 返回 CORS 错误怎么办？

**答**：确保后端配置了 CORS 响应头：

```javascript
'Access-Control-Allow-Origin': '*',
'Access-Control-Allow-Methods': 'GET, OPTIONS',
'Access-Control-Allow-Headers': 'Content-Type'
```

### Q：为什么 5 分钟后数据还是旧的？

**答**：这是缓存设计。如果想立即看到新数据，可以：

```javascript
// 清空缓存
localStorage.removeItem('creem_products_cache');
// 然后刷新页面
location.reload();
```

### Q：如果 Creem API 宕机怎么办？

**答**：自动降级到备用数据（`getFallbackProducts()`），网站不会崩溃。

### Q：可以改变缓存时间吗？

**答**：可以，编辑 `creem-sync-v2.js`：

```javascript
cacheExpiry: 10 * 60 * 1000, // 改为 10 分钟
```

---

## 📊 数据流示意图

```
╔═════════════════════╗
║   你的网站用户       ║
└──────────┬──────────┘
           │
           ↓ 访问/刷新页面
╔═════════════════════╗
║   浏览器             ║
║ - index.html        ║
║ - creem-sync-v2.js  ║
└──────────┬──────────┘
           │
           ↓ fetch('/api/products')
╔═════════════════════╗
║ 你的后端 API         ║
║ (CloudFlare Worker) ║
│ /api/products      ║
└──────────┬──────────┘
           │
           ↓ Authorization: Bearer API_KEY
╔═════════════════════╗
║   Creem API         ║
│ https://api.creem  ║
│ .io/v1/products    ║
└──────────┬──────────┘
           │
           ↓ 返回产品数据
╔═════════════════════╗
║  后端API            ║
│ 转换格式、缓存      ║
└──────────┬──────────┘
           │
           ↓ JSON
╔═════════════════════╗
║   浏览器             ║
│ 更新 allProducts   ║
│ 保存到 localStorage ║
│ 刷新页面显示       ║
└─────────────────────┘
```

---

## ✅ 检查清单

在推送到 GitHub 前，确保完成以下步骤：

- [ ] ✅ 创建 `api/creem-proxy.js`
- [ ] ✅ 创建 `js/creem-sync-v2.js`
- [ ] ✅ 更新 HTML 文件，加载新的同步脚本
- [ ] ✅ 删除或禁用旧的 `creem-sync.js`
- [ ] ✅ 测试页面是否能加载商品
- [ ] ✅ 使用 CloudFlare Workers 或本地服务器部署 API
- [ ] ✅ 在浏览器中测试 `/api/products` 端点
- [ ] ✅ 清空缓存，刷新多次，确保缓存机制正常
- [ ] ✅ git add -A && git commit && git push

---

## 🎯 下一步

1. **立即部署**：选择方案 A（CloudFlare）或方案 B（本地）
2. **测试同步**：在 Creem 后台更新一个商品，看网页是否自动更新
3. **优化性能**：根据需要调整缓存时间或添加预加载
4. **监控日志**：定期检查浏览器 Console 和后端日志

---

## 💡 技术细节

### API 响应格式

```json
{
  "success": true,
  "data": [
    {
      "id": "prod_7i2asEAuHFHl5hJMeCEsfB",
      "creemId": "prod_7i2asEAuHFHl5hJMeCEsfB",
      "name": "Traditional Agarwood",
      "nameCN": "传统沉香",
      "price": 200.00,
      "currency": "USD",
      "image": "...",
      "stock": 999,
      ...
    },
    ...
  ],
  "count": 2,
  "timestamp": "2024-03-23T13:00:00Z"
}
```

### 缓存数据格式

```json
{
  "data": [...],
  "timestamp": 1711267200000
}
```

---

## 🔐 安全性

- ✅ API Key 存储在后端环境变量（不暴露给前端）
- ✅ 支持 CORS 白名单配置
- ✅ 所有请求都通过 HTTPS（CloudFlare 强制）
- ✅ 实现了重试机制，防止瞬间故障

---

## 📞 支持

如有问题，检查以下几点：

1. **Creem API Key 是否正确**？
   - 检查：`creem_1qa0zx2EuHN9gz9DLcGTAG`

2. **产品 ID 是否正确**？
   - 传统沉香：`prod_7i2asEAuHFHl5hJMeCEsfB`
   - 五行能量手串：`prod_1YuuAVysoYK6AOmQVab2uR`

3. **后端 API 是否运行**？
   - 测试：`curl https://api.dao-essence.com/api/products`

4. **前端脚本是否加载**？
   - 检查：DevTools → Network → creem-sync-v2.js

---

**祝部署顺利！🎉**
