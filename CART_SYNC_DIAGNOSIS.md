# 购物车系统诊断报告

## 问题总结

### 症状
1. 购物车显示 0.00 美元（应该显示 200.00 或其他价格）
2. 购物车图片未加载（应该显示产品图片）
3. 购物车数据为 0（应该显示产品数量）

### 根本原因

**有两个完全独立的购物车系统互相冲突：**

**系统 1：cart.js 中的全局购物车**
- 位置：cart.js 第 7-11 行
- 数据结构：let cart = { items: [], ... }
- 产品来源：只能处理 cart.js 中硬编码的产品（第 14-63 行）
- 支持的产品：6 个硬编码产品（jade-pendant, incense-burner 等）
- Creem 产品无法添加到这个购物车

**系统 2：product-detail.js 中的本地购物车**
- 位置：product-detail.js 第 285-294 行  
- 数据结构：window.cart = { items: [] }（与 cart.js 冲突！）
- 产品来源：Creem API 动态获取的产品
- 初始化时机：product-detail.js 执行时创建
- 这个购物车的数据不会保存到 localStorage

### 为什么显示 0.00？

Creem 产品被添加到 window.cart（product-detail.js），但购物车界面显示的是 cart.js 中的 cart.items。因为 cart.items 中没有 Creem 产品，所以显示 0.00 美元。

### 为什么图片未加载？

Creem API 返回的数据字段是 img_url，而不是 image。cart.js 中的 updateCartUI 尝试显示 item.image，结果为 undefined，图片加载失败。

---

## 修复方案

### 方案 A：统一为一个购物车系统（推荐）

**修复步骤：**

1. **修改 cart.js - 支持动态产品注册**
2. **修改 creem-sync-v2.js - 注册 Creem 产品**
3. **修改 product-detail.js - 使用全局购物车**

### 文件修改清单

| 文件 | 修改内容 | 优先级 |
|------|--------|--------|
| cart.js | 支持动态产品注册 | P0 |
| creem-sync-v2.js | 调用注册函数 | P0 |
| product-detail.js | 使用全局购物车 | P0 |

### 预期结果

- 购物车显示正确的价格（200、168 等）
- 购物车显示正确的图片  
- 购物车数据会保存到 localStorage
- 刷新页面后购物车数据不丢失
- 详情页和购物车页面的数据同步
