# Creem 折扣支付集成指南

## 方案说明

由于 Creem API 的限制，无法直接传递价格金额，价格必须通过产品 ID 预设。因此采用**多产品 ID 方案**来实现折扣功能。

## 核心实现

### 1. 在 Creem 后台创建产品

需要在 Creem Dashboard 创建两个产品：

#### 产品 A（原价产品）
- 产品 ID: `prod_normal_price`
- 价格: $200
- 描述: 所有商品的原价

#### 产品 B（折扣产品）
- 产品 ID: `prod_discount_price`
- 价格: $170（8.5折）
- 描述: 所有商品的折扣价

### 2. 配置环境变量

在 Vercel 环境变量中添加：

```env
CREEM_API_KEY=creem_1qa0zx2EuHN9gz9DLcGTAG
CREEM_PRODUCT_ID=prod_normal_price           # 原价产品 ID
CREEM_DISCOUNT_PRODUCT_ID=prod_discount_price # 折扣产品 ID
```

### 3. 修改后的 API 逻辑

`api/create-checkout.js` 已经修改为：

```javascript
// 判断是否使用折扣产品
const useDiscountProduct = discountProductId && items.some(item => item.hasDiscount);

// 选择产品ID
const selectedProductId = useDiscountProduct ? discountProductId : productId;

// 准备 Creem API 请求数据
const creemCheckoutData = {
    product_id: selectedProductId
};
```

### 4. 前端修改需求

#### 4.1 添加到购物车时标记折扣

在 `shop-manager.js` 或相关文件中，添加商品时需要标记是否有折扣：

```javascript
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    const cartItem = {
        ...product,
        hasDiscount: product.originalPrice ? true : false, // 标记是否有折扣
        quantity: 1
    };
    // 添加到 localStorage 或购物车
}
```

#### 4.2 结账时传递折扣信息

在调用 Creem API 时，确保购物车 items 包含 `hasDiscount` 标记：

```javascript
async function createCreemCheckout() {
    const cartItems = getCartItems(); // 从购物车获取

    const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            items: cartItems,  // 每个item需要有 hasDiscount 属性
            shipping: 15,
            customerEmail: email,
            // ...其他参数
        })
    });
}
```

## 工作流程

1. **用户浏览商品**
   - 网站显示原价 ($200) 和折扣价 ($170)
   - 折扣标签显示 "15% OFF"

2. **添加到购物车**
   - 商品数据中包含 `hasDiscount: true`
   - 购物车显示折扣价

3. **结账**
   - 前端收集购物车所有商品
   - 检查是否有任意商品带有折扣标记 (`hasDiscount: true`)
   - 如果有折扣商品，使用 `CREEM_DISCOUNT_PRODUCT_ID`
   - 如果没有折扣商品，使用 `CREEM_PRODUCT_ID`

4. **Creem 支付**
   - API 根据商品是否有折扣选择不同的产品 ID
   - Creem 收款价格为该产品的预设价格（$200 或 $170）
   - 用户实际支付金额与网站显示一致

## 注意事项

### 1. 单产品限制

⚠️ **重要**：当前方案假设所有商品要么全部原价，要么全部折扣。

**原因**：Creem API 一次只能传一个 `product_id`，不能为不同商品传不同价格。

**未来改进**（如果需要）：
- 如果需要支持混合购物车（部分商品折扣，部分原价），需要：
  - 为每个产品创建多个变体（原价变体、折扣变体）
  - 或者为每个折扣组合创建独立产品
  - 或使用 Creem 的折扣码功能（需要在后台管理折扣码）

### 2. 价格一致性

- ✅ 网站显示价格 = Creem 收款价格
- ✅ 折扣开关完全由前端控制（`SHOW_DISCOUNT` 变量）
- ✅ 不需要修改 Creem 后台价格

### 3. 用户体验

- 用户看到的折扣价就是实际支付价
- 支付页面显示价格与购物车一致
- 避免价格不一致导致的用户困惑

## 快速检查清单

- [ ] 在 Creem 后台创建两个产品（原价 $200，折扣 $170）
- [ ] 在 Vercel 配置 `CREEM_DISCOUNT_PRODUCT_ID` 环境变量
- [ ] 测试：开启折扣，添加商品，结账，验证 Creem 收到 $170
- [ ] 测试：关闭折扣，添加商品，结账，验证 Creem 收到 $200
- [ ] 确认购物车中商品的 `hasDiscount` 属性正确设置

## 故障排查

### 问题：Creem 仍然收原价 $200

**检查**：
1. 环境变量 `CREEM_DISCOUNT_PRODUCT_ID` 是否配置？
2. 购物车商品的 `hasDiscount` 是否为 `true`？
3. API 日志中 `useDiscountProduct` 是否为 `true`？

### 问题：价格显示与 Creem 不一致

**检查**：
1. 网站显示价格使用的是 `price` 字段
2. Creem 收款价格由 `product_id` 决定
3. 确保两者设置正确

## 下一步

1. 根据本指南配置 Creem 后台产品
2. 设置 Vercel 环境变量
3. 测试完整支付流程
4. 验证折扣功能正常工作
