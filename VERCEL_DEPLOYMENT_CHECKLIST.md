# 🚀 Vercel 部署清单 - Creem API 集成

**最优方案**：Vercel Serverless Functions（与现有部署完全一体化）

---

## 📋 快速清单

- [ ] **P0 - 安全**：设置 Creem API Key 环境变量
- [ ] **P1 - 稳定**：验证 API 代理功能
- [ ] **P2 - 优化**：配置 Vercel 缓存策略
- [ ] **P3 - 监控**：查看 Vercel 日志和性能

---

## 🔐 第 1 步：设置环境变量（P0 - 必做）

### 在 Vercel Dashboard 配置

1. **打开 Vercel 控制面板**：
   - 访问 https://vercel.com/dashboard
   - 选择你的 `dao-essence` 项目

2. **进入环境变量设置**：
   ```
   Settings → Environment Variables
   ```

3. **添加以下变量**：

| 变量名 | 值 | 环境 | 说明 |
|-------|-----|------|------|
| `CREEM_API_KEY` | `creem_1qa0zx2EuHN9gz9DLcGTAG` | Production, Preview, Development | Creem API 密钥 |
| `NODE_ENV` | `production` | Production | 生产环境标识 |

**步骤**：
```
1. 点击 "Add New"
2. Name: CREEM_API_KEY
3. Value: creem_1qa0zx2EuHN9gz9DLcGTAG
4. 勾选所有环境（Production, Preview, Development）
5. 点击 "Save"
6. 重新部署（会自动触发）
```

### 验证环境变量生效

部署后，访问 Vercel 日志查看：
```
Functions → api/creem-proxy.js → Logs
```

应该看到：
```
✅ CREEM_API_KEY 已正确设置
📥 调用 Creem API...
✅ 成功拉取产品
```

---

## 🧪 第 2 步：测试 API 代理（P1 - 应做）

### 本地测试（部署前）

1. **创建本地 `.env` 文件**：
```bash
cd "c:/Users/agenew/Desktop/DaoEssence - 副本"
```

2. **创建 `.env.local`**：
```
CREEM_API_KEY=creem_1qa0zx2EuHN9gz9DLcGTAG
```

3. **启动本地服务器**：
```bash
npm install
npm run dev
# 或者
node local-server.js
```

4. **测试 API 端点**：
```bash
# 获取所有产品
curl http://localhost:3000/api/products

# 或在浏览器访问
http://localhost:3000/api/products
```

**预期响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_7i2asEAuHFHl5hJMeCEsfB",
      "name": "Traditional Agarwood",
      "nameCN": "传统沉香",
      "price": 200.00,
      ...
    },
    ...
  ],
  "count": 2,
  "timestamp": "2026-03-23T13:16:00.000Z"
}
```

---

## 🚀 第 3 步：部署到 Vercel（P1 - 应做）

### 自动部署（推荐）

1. **提交代码到 GitHub**：
```bash
git add -A
git commit -m "fix: 优化 Creem API 代理，修复安全性和性能问题

- 将 API Key 移到环境变量（解决安全性问题）
- 改用 HTTP 缓存头（解决 Serverless 无状态问题）
- 添加请求超时控制（解决超时问题）
- 改进 CORS 头配置（提升安全性）"
git push origin main
```

2. **Vercel 自动部署**：
   - Vercel 会自动检测 GitHub 推送
   - 自动部署到 Vercel
   - 检查部署状态：https://vercel.com/dashboard

3. **等待部署完成**：
```
✅ Deployment Complete
🎉 Production: https://dao-essence.vercel.app
```

### 部署后验证

1. **测试生产环境 API**：
```bash
# 在生产环境测试
curl https://dao-essence.vercel.app/api/products

# 或在浏览器访问
https://dao-essence.vercel.app/api/products
```

2. **检查缓存头**：
```bash
curl -i https://dao-essence.vercel.app/api/products | grep -i cache
# 应该看到
# Cache-Control: public, max-age=300, s-maxage=300
```

3. **查看 Vercel 日志**：
```
Functions → api/creem-proxy.js → Logs
```

---

## ⚙️ 第 4 步：优化配置（P2 - 可做）

### 优化 vercel.json

当前配置：
```json
{
  "framework": null,
  "buildCommand": null,
  "outputDirectory": ".",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

**推荐优化**：
```json
{
  "framework": null,
  "buildCommand": "npm install",
  "outputDirectory": ".",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ],
  "functions": {
    "api/creem-proxy.js": {
      "memory": 512,
      "maxDuration": 10
    }
  },
  "env": {
    "CREEM_API_KEY": "@creem_api_key"
  }
}
```

💡 **说明**：
- `memory`: 512 MB 内存（足够）
- `maxDuration`: 10 秒超时（Vercel 最大限制）

### 添加 headers 策略

在 `vercel.json` 添加自定义 headers：

```json
{
  "headers": [
    {
      "source": "/api/products(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=300, s-maxage=300"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

---

## 📊 第 5 步：监控和调试（P3 - 可做）

### 监控 API 性能

1. **在 Vercel Dashboard 查看日志**：
```
Project Settings → Functions → api/creem-proxy.js → Logs
```

2. **查看关键指标**：
   - **Response Time**: 应该在 500-1000ms
   - **Error Rate**: 应该接近 0%
   - **Cold Start**: 首次启动 ~300-500ms

3. **添加自定义监控**：

在 `api/creem-proxy.js` 添加性能日志：
```javascript
async function handler(req, res) {
  const startTime = Date.now();
  
  try {
    // ... 处理请求 ...
    
    const duration = Date.now() - startTime;
    console.log(`⏱️  API 响应时间: ${duration}ms`);
  } catch (error) {
    console.error(`❌ 错误: ${error.message}`);
  }
}
```

### 调试常见问题

#### 问题 1：`404 Not Found` 错误

**原因**：API 路由没有正确映射

**解决方案**：
```bash
# 检查文件位置
ls api/creem-proxy.js

# 确保文件名正确（区分大小写）
# 路径应该是：api/creem-proxy.js
```

#### 问题 2：`CREEM_API_KEY 未定义` 错误

**原因**：环境变量未设置

**解决方案**：
1. 检查 Vercel Dashboard 的环境变量
2. 确保变量名完全相同：`CREEM_API_KEY`
3. 重新部署（`git push` 或在 Dashboard 手动部署）

#### 问题 3：CORS 跨域错误

**原因**：浏览器拦截了请求

**解决方案**：
1. 检查响应头中是否有 `Access-Control-Allow-Origin`
2. 确保 `api/creem-proxy.js` 中设置了正确的 CORS 头
3. 在浏览器 DevTools (F12) → Network 标签查看响应头

#### 问题 4：API 响应超时

**原因**：Creem API 太慢或网络问题

**解决方案**：
1. 增加超时时间（当前 8 秒）
2. 添加重试机制（前端已有）
3. 使用备用数据自动降级（已实现）

---

## 📈 第 6 步：成本监控（P3 - 可做）

### Vercel 免费额度

| 项目 | 免费额度 | 说明 |
|------|---------|------|
| Serverless Functions | 150万请求/月 | 足够小网站 |
| 存储 | 100 GB | 静态资源 |
| 带宽 | 1000 GB | 足够 |

**计算**：
- 假设每日 1000 访问 × 5 次 API 调用 = 5000 请求/天
- 月度 = 5000 × 30 = 150,000 请求 ✅（在免费额度内）

### 超出额度的费用

```
超过部分：$0.50 per 1M requests

示例：
- 假设月度 500万请求（超出 350万）
- 费用 = 350万 × $0.50 / 100万 = $1.75/月
```

---

## ✅ 完整检查清单

### 部署前
- [ ] 修改了 `api/creem-proxy.js`（使用环境变量）
- [ ] 测试了本地 API（`http://localhost:3000/api/products`）
- [ ] 前端已更新（调用 `/api/products`）

### 部署时
- [ ] 设置 Vercel 环境变量 `CREEM_API_KEY`
- [ ] 推送代码到 GitHub
- [ ] Vercel 自动部署完成

### 部署后
- [ ] 测试生产环境 API（`https://dao-essence.vercel.app/api/products`）
- [ ] 验证缓存头生效
- [ ] 检查 Vercel 日志无错误
- [ ] 前端商品正常显示

### 持续监控
- [ ] 定期检查 API 性能
- [ ] 监控错误率
- [ ] 监控成本（确保在免费额度内）

---

## 🎉 最终结果

完成所有步骤后，你将拥有：

✅ **安全**：API Key 不会暴露  
✅ **高效**：5分钟缓存 + CDN + Serverless  
✅ **稳定**：自动降级 + 错误重试  
✅ **易维护**：所有配置在 Vercel Dashboard  
✅ **免费**：150万请求/月免费额度  

---

## 📞 如需帮助

遇到问题？检查：

1. **环境变量是否设置**：Vercel Dashboard → Settings → Environment Variables
2. **代码是否提交**：`git log --oneline -3` 查看最近提交
3. **部署是否完成**：Vercel Dashboard → Deployments 查看部署状态
4. **日志是否有错**：Vercel Dashboard → Functions → api/creem-proxy.js → Logs

---

**部署顺序**：环境变量 → 代码提交 → 自动部署 → 测试验证 ✨
