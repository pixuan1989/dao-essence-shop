# ✅ 推送前最终检查清单

> **这是推送前的最后一道防线！请逐一检查。**

---

## 🔍 第一步：浏览器调试检查

**打开浏览器开发者工具** (F12)，依次检查：

### 1.1 Console 标签（控制台日志）

查看是否有以下关键日志（绿色 ✅）：

- [ ] `✅ Creem 实时同步脚本 v2.0 已加载`
- [ ] `✅ window.allProducts 已更新，共 X 个产品`
- [ ] `✅ Creem 产品已准备好，调用 renderShop()`
- [ ] `✅ shop-manager.js 加载完成`
- [ ] `✅ window.allProducts 已有数据`

**如果没有看到这些日志，说明脚本未正确加载。**

---

### 1.2 Network 标签（网络请求）

查看 API 调用情况：

1. **找到 `/api/products` 请求**
   - [ ] 状态码是 **200**（绿色）？
   - [ ] 如果是 **404** 或 **500**（红色），说明 API 有问题

2. **检查响应头（Response Headers）**
   - [ ] `Access-Control-Allow-Origin: *` 存在？
   - [ ] `Content-Type: application/json` 存在？
   - [ ] `Cache-Control: public, max-age=300` 存在？

3. **检查响应内容（Response Body）**
   - [ ] 是否包含 `"success": true`？
   - [ ] 是否包含 `"data": [...]`？
   - [ ] `data` 数组中是否有 **2 个产品**？
   - [ ] 每个产品是否包含 `id`、`name`、`price`、`image` 等字段？

**示例正确的响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_7i2asEAuHFHl5hJMeCEsfB",
      "name": "Traditional Agarwood",
      "nameCN": "传统沉香",
      "price": 200,
      "image": "https://..."
    },
    {
      "id": "prod_1YuuAVysoYK6AOmQVab2uR",
      "name": "Five Elements Energy Bracelet",
      "nameCN": "五行能量手串",
      "price": 168,
      "image": "https://..."
    }
  ],
  "count": 2,
  "timestamp": "2026-03-23T16:50:00.000Z"
}
```

---

### 1.3 Application 标签（本地存储）

检查 localStorage 缓存：

1. **点击 LocalStorage → https://dao-essence-shop.vercel.app**
2. **查找 `creem_products_cache` 键**
   - [ ] 值是否是 JSON 格式？
   - [ ] 是否包含 `timestamp` 和 `products` 字段？
   - [ ] `products` 数组中是否有 2 个产品？

---

### 1.4 Elements 标签（页面 HTML）

检查页面结构：

1. **查找 `<div id="productGrid">`**
   - [ ] 容器存在？
   - [ ] 内部是否有商品卡片（`<a class="shop-product-card">` 元素）？

2. **查找 `<div id="productCount">`**
   - [ ] 显示的数字是 2 还是 0？

---

## 🐛 第二步：常见问题排查

### 问题 1：显示"0 个产品"

**可能原因：**
1. `window.renderShop()` 没有被调用
2. `window.allProducts` 是空数组
3. 页面缓存导致旧代码执行

**解决方案：**
```javascript
// 在浏览器控制台手动测试
console.log('window.allProducts:', window.allProducts);
console.log('window.renderShop:', typeof window.renderShop);
window.renderShop();  // 手动调用
```

---

### 问题 2：Console 出现"allProducts is not defined"

**可能原因：**
- shop-manager.js 中的变量定义方式不对
- 脚本加载顺序混乱

**解决方案：**
- 确保所有变量都用 `window.` 前缀定义
- 检查脚本加载顺序

---

### 问题 3：API 返回 404

**可能原因：**
- API 文件路径不对
- Vercel 部署失败
- 环境变量未设置

**解决方案：**
1. 检查 Vercel 部署日志
2. 检查 `CREEM_API_KEY` 环境变量是否已设置
3. 测试 API：直接访问 `https://dao-essence-shop.vercel.app/api/products`

---

### 问题 4：浏览器缓存问题

**表现：**
- 本地修改代码后，网站仍显示旧内容

**解决方案：**
```bash
# 方法 1：硬刷新（清除浏览器缓存）
Ctrl + Shift + Delete  # Windows/Linux
Cmd + Shift + Delete   # macOS

# 方法 2：清除特定域的缓存
# 浏览器开发者工具 → Application → Clear site data
```

---

## 📋 第三步：Vercel 部署检查

1. **访问 Vercel Dashboard**
   - https://vercel.com/dashboard

2. **选择项目 `dao-essence-shop`**

3. **检查最新部署**
   - [ ] 状态是 **Ready**（绿色）？
   - [ ] 如果是 **Error**（红色），点击查看部署日志

4. **检查部署日志**
   - [ ] 是否有 build 错误？
   - [ ] 是否有部署错误？

---

## 🎯 第四步：完整功能测试

### 测试场景 1：首次访问首页

1. 打开 https://dao-essence-shop.vercel.app/
2. 等待 3-5 秒
3. 检查：
   - [ ] "Featured Products" 区域是否显示 2 个商品？
   - [ ] 每个商品卡片是否显示图片、名称、价格？

---

### 测试场景 2：访问商店页面

1. 打开 https://dao-essence-shop.vercel.app/shop.html
2. 等待 3-5 秒
3. 检查：
   - [ ] "Showing X products" 是否显示 "Showing 2 products"？
   - [ ] 商品网格中是否显示 2 个商品卡片？

---

### 测试场景 3：缓存测试

1. 第一次访问商店页面（从 API 拉取）
   - [ ] 消耗时间是否 > 1 秒？
2. 5 分钟内再次访问
   - [ ] 消耗时间是否 < 100ms（使用缓存）？
3. 5 分钟后再次访问
   - [ ] 消耗时间是否 > 1 秒（重新从 API 拉取）？

---

## 🚀 第五步：最终确认

推送前，请确保：

- [ ] 所有本地修改已 commit
- [ ] 没有 uncommitted changes
- [ ] 最新的 commits 包括：
  - `a2f6594 - 🔥 关键修复：shop-manager.js 全局作用域问题`
  - `efec28d - 🎯 改进页面产品加载逻辑`

验证命令：
```bash
cd "C:\Users\agenew\Desktop\DaoEssence - 副本"
git log --oneline -5
```

---

## 📝 如果还有问题...

1. **截图问题画面**（包括控制台日志和 Network 标签）
2. **记录问题描述**（什么地方显示什么内容）
3. **提供完整错误信息**（红色 console 错误）

---

## ✨ 推送命令

所有检查通过后，执行：

```bash
cd "C:\Users\agenew\Desktop\DaoEssence - 副本"
git push
```

Vercel 会自动部署，2-3 分钟后访问网站查看效果。

---

**祝推送顺利！🎉**
