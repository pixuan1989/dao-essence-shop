# Solo Coder 快速执行指南

**目标**：在 2-4 小时内完成项目验收  
**前置条件**：有 Vercel Dashboard、GitHub、浏览器 DevTools 的基本使用经验  

---

## 📌 10 分钟快速理解

### 项目是什么？

DAO Essence 是一个在线商城：
- **前端**：展示和销售 Creem 平台上的两个商品
- **API**：从 Creem 实时拉取商品数据
- **部署**：Vercel Serverless + GitHub 自动部署

### 我要做什么？

**验证以下 4 个方面都正常工作**：

1. ✅ **API 层**：`/api/products` 返回正确的商品数据
2. ✅ **前端层**：网页能显示商品、购物车功能正常
3. ✅ **缓存层**：数据缓存和性能优化工作正确
4. ✅ **部署层**：Vercel 部署成功，无错误

### 如何做？

**分 4 个 Phase，按顺序执行**：

```
Phase 1：验证当前部署（1 小时）
    ↓
Phase 2：优化 API 响应（2 小时）
    ↓
Phase 3：前端集成测试（3 小时）
    ↓
Phase 4：生产验收（1 小时）
    ↓
✅ 填写验收报告，提交完成
```

---

## 🚀 Phase 1：验证当前部署（1 小时）

### Step 1.1：检查 Vercel 部署（5 分钟）

**操作**：
```
1. 打开 https://vercel.com/dashboard
2. 找到项目 "dao-essence-shop"
3. 点击进去
4. 看"Deployments"标签
5. 最上面的部署应该是绿色 ✅ "Ready"
```

**记录**：
- 部署 ID：______________
- 状态：Ready ✅ / Error ❌

**如果是红色❌**：
- 点击它看"Build Logs"
- 找出错误信息
- 联系架构团队排查

---

### Step 1.2：检查环境变量（3 分钟）

**操作**：
```
1. Vercel Dashboard → dao-essence-shop
2. Settings → Environment Variables
3. 查看是否有 CREEM_API_KEY
4. 值应该是：creem_1qa0zx2EuHN9gz9DLcGTAG
```

**记录**：
- [ ] CREEM_API_KEY 存在
- [ ] 值正确

---

### Step 1.3：测试 API（5 分钟）

**操作**：
```
在浏览器中打开这个 URL：
https://dao-essence-shop.vercel.app/api/products
```

**看到什么**：
```json
{
  "success": true,
  "products": [
    {
      "id": "prod_7i2asEAuHFHl5hJMeCEsfB",
      "name": "传统沉香",
      "price": 200,
      ...
    },
    {
      "id": "prod_1YuuAVysoYK6AOmQVab2uR",
      "name": "五行能量手串",
      "price": 168,
      ...
    }
  ]
}
```

**检查项**：
- [ ] 返回 JSON（不是 404 或 500 错误）
- [ ] `"success": true`
- [ ] 有 2 个商品
- [ ] 商品名字对

**记录**：✅ 通过 / ❌ 失败

---

### Step 1.4：测试前端页面（5 分钟）

**操作**：
```
打开：https://dao-essence-shop.vercel.app/
```

**检查项**：
- [ ] 页面能加载（没有"Cannot GET /"错误）
- [ ] 按 F12 打开 DevTools
- [ ] 切换到 Console 标签
- [ ] 没有红色 ❌ 错误信息
- [ ] 能看到页面内容（文字、图片等）

**Console 日志应该包含**：
```
"CREEM Sync: ..."
```

**记录**：✅ 通过 / ❌ 失败

**如果失败，问题可能是**：
- API 返回错误 → 检查 Step 1.3
- 前端 JS 错误 → 看 Console 错误信息
- 页面完全空白 → 检查浏览器缓存，Ctrl+Shift+R 硬刷新

---

## ⚙️ Phase 2：优化 API 响应（2 小时）

### Step 2.1：检查 API 响应格式（30 分钟）

**操作**：
```
访问 /api/products，记录完整的 JSON 响应
```

**预期内容**：
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
  "timestamp": "2026-03-23T...",
  "cacheAge": 0
}
```

**检查项**：
- [ ] 两个商品都有 `id`, `name`, `price` 字段
- [ ] 有 `currency` 字段（应为 "USD"）
- [ ] 有 `image` URL
- [ ] 有 `description` 文本
- [ ] 有 `stock` 数字

**记录**：✅ 通过 / ❌ 失败

**如果缺字段**：
- 编辑 `api/products.js`
- 添加缺失的字段
- 推送到 GitHub
- 等 2 分钟重新测试

---

### Step 2.2：测试缓存机制（45 分钟）

**目标**：验证第二次访问更快

**操作**：

1. **打开 DevTools → Application → Clear site data**
   ```
   清空所有本地存储和缓存
   ```

2. **访问 /api/products（第一次）**
   ```
   记录时间：____________ ms
   观察 Console 日志
   应该看到 "CREEM Sync: Fetching from API..."
   ```

3. **立即再访问一次（不清空缓存）**
   ```
   记录时间：____________ ms
   观察 Console 日志
   应该看到 "CREEM Sync: Cache hit..."
   ```

4. **比较时间**
   ```
   第一次：____ ms
   第二次：____ ms
   
   如果第二次 < 第一次 * 0.5，说明缓存工作了 ✅
   否则缓存可能有问题 ❌
   ```

**检查项**：
- [ ] 第二次明显快于第一次
- [ ] Console 显示缓存命中
- [ ] 响应数据一致

**记录**：✅ 通过 / ❌ 失败

---

### Step 2.3：测试错误降级（45 分钟）

**目标**：验证 API 失败时有备用数据

**操作**：

1. **方案 A：临时修改 API Key（推荐）**
   ```
   在 Vercel Dashboard 中：
   Settings → Environment Variables
   找到 CREEM_API_KEY
   改值为：creem_invalid_key_test
   Save
   等 1 分钟重新部署
   ```

2. **访问 /api/products**
   ```
   应该返回本地备用数据（不是 error）
   响应状态码应该是 200
   ```

3. **恢复正确的 API Key**
   ```
   改回：creem_1qa0zx2EuHN9gz9DLcGTAG
   Save
   等 1 分钟
   ```

4. **重新测试确认恢复**
   ```
   访问 /api/products
   应该正常返回 Creem 数据
   ```

**检查项**：
- [ ] 修改 API Key 后仍返回 200
- [ ] 返回的是有效的商品数据
- [ ] 恢复后能继续正常工作

**记录**：✅ 通过 / ❌ 失败

---

## 🧪 Phase 3：前端集成测试（3 小时）

### Step 3.1：检查 creem-sync.js（15 分钟）

**操作**：
```
1. 打开 https://dao-essence-shop.vercel.app/
2. F12 打开 DevTools
3. Console 标签
4. 观察日志
```

**应该看到**：
```
CREEM Sync: Checking cache...
CREEM Sync: Cache hit, using local data
或
CREEM Sync: Fetching from API...
```

**检查项**：
- [ ] 没有红色 ❌ 错误
- [ ] 没有 "Uncaught" 字样
- [ ] 能看到 CREEM Sync 日志

**记录**：✅ 通过 / ❌ 失败

---

### Step 3.2：首页测试（45 分钟）

**打开**：`/index.html`

**检查**：

```
□ 页面能加载
□ 能看到"能量宇宙"区域
□ 显示 2 个商品卡片
  □ 卡片 1："传统沉香"，$200
  □ 卡片 2："五行能量手串"，$168
□ 每个卡片有"查看详情"按钮
□ 点击"查看详情"→ 跳转到 /product-detail.html?id=prod_xxx
```

**如果某个地方有问题**：
- 检查 Console 是否有错误
- 检查网络标签（Network tab）是否有 404
- 可能需要编辑 index.html 或 js 文件

**记录**：✅ 通过 / ❌ 失败

---

### Step 3.3：商品列表测试（45 分钟）

**打开**：`/shop.html`

**检查**：

```
□ 页面能加载
□ 显示至少 2 个商品
□ 每个商品显示：
  □ 图片
  □ 名称
  □ 价格
  □ "查看详情"或"购买"按钮
□ 能点击进入商品详情页
□ 能点击"加入购物车"
□ 购物车数字更新
```

**如果购物车不工作**：
- 检查 Console 错误
- 可能需要修复 shop-manager.js 或 product-detail.js 中的购物车事件

**记录**：✅ 通过 / ❌ 失败

---

### Step 3.4：商品详情测试（45 分钟）

**操作**：
```
1. 从商品列表点击任一商品进入详情页
2. URL 应该是 /product-detail.html?id=prod_xxx
```

**检查**：

```
□ URL 包含 id 参数
□ 显示正确的商品名称
□ 显示正确的价格
□ 显示商品描述
□ 显示商品图片
□ 可选项（颜色、尺寸等）能选择
□ "加入购物车"按钮可点击
□ 点击后购物车数字增加
```

**如果详情页空白**：
- 检查 URL 中是否有 ?id= 参数
- 检查 Console 错误
- 可能需要修复 product-detail.js 中的数据加载逻辑

**记录**：✅ 通过 / ❌ 失败

---

### Step 3.5：购物车测试（30 分钟）

**操作**：
```
1. 在任何页面找到浮动购物车按钮
2. 点击它
```

**检查**：

```
□ 购物车侧边栏从右侧滑出
□ 显示购物车中的商品
□ 显示商品数量
□ 显示总价
□ 能增加/减少商品数量
□ 能删除商品
□ 点击"关闭"或空白区域，侧边栏关闭
□ 购物车徽章（数字）显示正确的商品数
```

**常见问题**：
- 购物车打不开 → 检查 z-index 和 display CSS
- 点击无反应 → 检查 DevTools 中的点击事件是否触发
- 数字不更新 → 检查 updateCartDisplay() 函数是否调用

**记录**：✅ 通过 / ❌ 失败

---

## ✅ Phase 4：生产验收（1 小时）

### Step 4.1：性能测试（20 分钟）

**操作**：
```
1. 打开首页
2. F12 → Lighthouse
3. 选择 Performance
4. 点击"Analyze page load"
5. 等待完成
```

**记录指标**：
- Lighthouse 总分：______ / 100
- FCP（首次内容绘制）：______ 秒
- LCP（最大内容绘制）：______ 秒
- CLS（累积布局偏移）：______

**目标**：
- 总分 > 80 ✅
- LCP < 2.5s ✅
- CLS < 0.1 ✅

**记录**：✅ 通过 / ❌ 失败

---

### Step 4.2：浏览器兼容性（20 分钟）

**用不同浏览器测试**：

```
Chrome：打开首页 → ✅ 能用 / ❌ 有问题
Firefox：打开首页 → ✅ 能用 / ❌ 有问题
Safari：打开首页 → ✅ 能用 / ❌ 有问题
Edge：打开首页 → ✅ 能用 / ❌ 有问题
手机浏览器：打开首页 → ✅ 能用 / ❌ 有问题
```

**记录**：✅ 通过 / ❌ 失败

---

### Step 4.3：安全检查（10 分钟）

**检查项**：

```
□ 打开 DevTools → Sources
□ 搜索 "creem_1qa0zx2EuHN9gz9DLcGTAG" (API Key)
□ 不应该在任何 .js 或 .html 文件中出现
  （应该在服务器端 /api/products.js，不在客户端）

□ 所有请求都是 https://（不是 http://）

□ Console 没有"Mixed Content"警告

□ Application → Local Storage
  creem_products_cache 中只有商品数据
  不应该有密钥、令牌等敏感信息
```

**记录**：✅ 通过 / ❌ 失败

---

### Step 4.4：监控设置（10 分钟）

**操作**：
```
Vercel Dashboard → dao-essence-shop → Analytics
查看是否有数据（可能需要几分钟才出现）
```

**记录**：✅ 监控已启用 / ❌ 需要启用

---

## 📝 最后一步：填写验收报告

**打开文件**：`ACCEPTANCE_REPORT.md`

**按照 Phase 1-4 的顺序**：
1. 填写每个 Task 的检查项结果
2. 记录任何发现的问题
3. 在最后签字

**提交**：
```
git add ACCEPTANCE_REPORT.md
git commit -m "docs: 完成项目验收报告"
git push
```

---

## 🆘 遇到问题怎么办？

### 常见问题速查表

| 问题 | 解决方案 |
|------|---------|
| API 返回 404 | 检查 Vercel 部署是否成功，查看构建日志 |
| API 返回 500 | 检查 CREEM_API_KEY 环境变量是否正确 |
| 页面空白 | Ctrl+Shift+R 硬刷新，清空浏览器缓存 |
| 购物车不工作 | F12 Console 查看错误，检查 product-detail.js |
| 商品不显示 | 检查 /api/products 是否返回数据 |
| 性能很慢 | 检查是否有大文件下载，检查网络标签 |

### 联系架构团队

如果上面的解决方案都不行，收集以下信息后联系架构团队：
1. 错误的完整截图
2. Console 中的完整错误信息
3. 你尝试过的解决方案
4. 你的浏览器版本和操作系统

---

## ⏱️ 时间估计

```
Phase 1（验证）：1 小时
Phase 2（优化）：2 小时
Phase 3（测试）：3 小时
Phase 4（验收）：1 小时
报告填写：30 分钟
—————————
总计：7.5 小时（或分多天完成）
```

---

**祝你顺利完成验收！** 🚀

如有任何问题，查看 `ARCHITECTURE_PLAN.md` 中的详细文档。