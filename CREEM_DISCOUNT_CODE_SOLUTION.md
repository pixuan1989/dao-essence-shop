# Creem 折扣支付集成 - 简化方案（使用折扣码）

## 🎉 更好消息！

你已经创建了 Creem 折扣码，这是**更简单的方案**！

## 📋 折扣码信息

从截图确认：
- **折扣码**: `XJCX520`
- **折扣**: 一次九折（10% OFF）
- **状态**: 活跃
- **产品**: `prod_7i2asEAuHFHl5hJMeCEsfB`

## 🔄 新方案优势

相比之前的多产品 ID 方案，折扣码方案更优：

✅ **更简单**：只需要一个产品 + 一个折扣码
✅ **更灵活**：可以在 Creem 后台随时修改折扣
✅ **更强大**：支持有效期、使用次数限制
✅ **无需修改产品价格**：产品保持原价 $200，折扣码自动应用 9 折

## 📦 已修改的文件

### 1. `api/create-checkout.js` ✅ 已更新

**修改内容**：
- 接收 `discountCode` 参数
- 优先使用请求中的折扣码
- 如果没有请求折扣码，检查环境变量 `CREEM_DISCOUNT_CODE`
- 如果都没有，检查商品是否有 `hasDiscount` 标记，如果有则使用默认折扣码 `XJCX520`

**关键代码**：
```javascript
const { items, shipping, customerName, customerEmail, shippingAddress, shippingMethod, discountCode } = req.body;

// 判断是否使用折扣码
const useDiscountCode = discountCode || creemDiscountCode || (items.some(item => item.hasDiscount) ? 'XJCX520' : null);

// 准备 Creem API 请求数据
const creemCheckoutData = {
    product_id: productId
};

// 如果有折扣码，添加到请求中
if (useDiscountCode) {
    creemCheckoutData.discount_code = useDiscountCode;
}
```

### 2. `js/creem-checkout-integration.js` ✅ 已更新

**修改内容**：
- 在 API 请求中添加 `discountCode` 参数
- 如果检测到有折扣商品，自动传递折扣码 `XJCX520`

**关键代码**：
```javascript
// 判断是否使用折扣码
const useDiscountCode = discountApplied ? 'XJCX520' : null;
if (useDiscountCode) {
    requestData.discountCode = useDiscountCode;
}
```

## 🚀 部署步骤（大幅简化）

### 步骤 1：配置 Vercel 环境变量（可选）

如果你想在环境变量中预设折扣码，可以添加：

**Vercel Dashboard** → **项目设置** → **Environment Variables**：

```
变量名: CREEM_DISCOUNT_CODE
变量值: XJCX520
```

**说明**：这不是必须的，因为代码会自动判断并传递折扣码。

### 步骤 2：重新部署 Vercel 项目

**重要**：API 代码修改后需要重新部署才能生效。

1. 访问：https://vercel.com/dashboard
2. 找到你的项目
3. 点击 "Deployments"（部署）
4. 找到最新部署，点击右侧三个点 `...`
5. 选择 "Redeploy"（重新部署）
6. 等待部署完成（约 1-2 分钟）

### 步骤 3：测试功能

#### 测试 1：带折扣的支付

1. 打开 `shop.html`
2. 查看商品是否显示折扣价和 "15% OFF" 标签
3. 添加商品到购物车
4. 进入 `checkout.html`
5. 检查是否有 "🎉 折扣优惠已应用！" 提示
6. 点击 "去支付"
7. 跳转到 Creem 支付页面
8. **验证**：Creem 应该显示原价 $200，折扣 -$20（10%），最终价 $180

#### 测试 2：查看 API 日志

在 Vercel Dashboard 查看函数日志：

1. 进入项目 → **Functions**（函数）
2. 找到 `api/create-checkout` 函数
3. 点击查看最新日志
4. 查找以下内容：

```
Creem API 请求数据: {
    url: 'https://api.creem.io/v1/checkouts',
    product_id: 'prod_7i2asEAuHFHl5hJMeCEsfB',
    discount_code: 'XJCX520'  // ✅ 应该看到这个
}
```

#### 测试 3：关闭折扣测试

1. 修改 `shop-manager.js` 或 `creem-discount-helper.js` 中的 `SHOW_DISCOUNT = false`
2. 刷新页面
3. 添加商品到购物车
4. 进入 checkout
5. 点击支付
6. **验证**：Creem 应该没有折扣，直接支付原价 $200

## 📊 工作流程（简化版）

```
用户浏览商品
    ↓
看到折扣价（$170）vs 原价（$200）
    ↓
添加到购物车（标记 hasDiscount: true）
    ↓
结账页面
    ↓
检测到折扣 → 自动传递折扣码 XJCX520
    ↓
调用 Creem API（product_id + discount_code）
    ↓
Creem 应用折扣：$200 × 0.9 = $180 ✅
    ↓
用户支付 $180
```

## 🎯 价格对照表

| 场景 | 网站显示 | Creem 原价 | 折扣码 | Creem 最终价 |
|------|---------|-----------|-------|-------------|
| 开启折扣（8.5折） | $170 | $200 | XJCX520 (9折) | $180 |
| 关闭折扣 | $200 | $200 | 无 | $200 |

**注意**：你的网站显示是 8.5折（$170），但 Creem 折扣码是 9折（$180）。

有两种处理方式：

**方式 A：修改网站折扣为 9折**
```javascript
// shop-manager.js
SHOW_DISCOUNT = true;
// 所有产品价格改为 $180（9折）
```

**方式 B：在 Creem 后台创建 8.5 折折扣码**
- 折扣码：`XJCX520_85`
- 折扣：15% OFF（一次八五折）
- 修改代码传递这个折扣码

## ⚠️ 重要提示

### 当前折扣不匹配问题

- **网站显示**: 8.5 折（$170）
- **Creem 折扣码**: 9 折（$180）
- **结果**: 用户支付 $180，比网站显示多 $10

### 解决方案

**推荐**：修改网站折扣为 9 折，与 Creem 折扣码一致。

修改 `shop-manager.js` 或相关产品配置：

```javascript
// 将所有产品的折扣价改为 $180（9折）
{
    "id": "tai-sui-talisman",
    "price": 180,  // 改为 180（9折）
    "originalPrice": 200
}
```

或者，你也可以在 Creem 后台创建一个新的 8.5 折折扣码。

## ✅ 完成检查清单

- [ ] ✅ `api/create-checkout.js` 已更新支持折扣码
- [ ] ✅ `js/creem-checkout-integration.js` 已更新传递折扣码
- [ ] ✅ Vercel 项目已重新部署
- [ ] [ ] 测试带折扣的支付（验证 Creem 收 $180）
- [ ] [ ] 测试不带折扣的支付（验证 Creem 收 $200）
- [ ] [ ] 查看 Vercel 日志确认折扣码传递正确
- [ ] [ ] （可选）修改网站折扣为 9 折，与 Creem 一致

## 📝 旧方案说明

之前的"多产品 ID 方案"仍然可以工作，但折扣码方案更简单。你可以选择：

1. **使用折扣码方案**（推荐）✨
   - 只需要修改环境变量（可选）
   - 折扣在 Creem 后台管理
   - 更灵活、更简单

2. **使用多产品 ID 方案**（备选）
   - 需要创建两个产品
   - 需要配置 `CREEM_DISCOUNT_PRODUCT_ID` 环境变量
   - 代码已经支持，但不需要再配置

## 🎉 总结

使用折扣码方案，你只需要：

1. ✅ 重新部署 Vercel 项目（代码已更新）
2. ✅ 测试支付流程
3. [ ] （可选）统一网站和 Creem 的折扣率

就这么简单！🚀
