# DaoEssence 静态网站 + Shopify 对接指南

## 快速开始

### 1. 文件结构

```
DaoEssence/
├── index.html                 # 首页
├── shop.html                  # 商品列表页
├── product-detail.html        # 商品详情页
├── cart.html                  # 购物车页
├── checkout.html              # 结账页
├── js/
│   ├── shopify-config.js      # Shopify 配置（填入你的 Token）
│   ├── shopify-api.js         # Shopify API 封装
│   ├── shop-products.js       # 商品列表页逻辑
│   ├── shop-product-detail.js # 商品详情页逻辑
│   ├── shop-cart.js           # 购物车页逻辑
│   └── shop-checkout.js       # 结账页逻辑
└── docs/
    └── SHOPIFY-METAFIELDS-GUIDE.md  # Metafields 配置指南
```

---

### 2. 配置步骤

#### 步骤一：获取 Shopify API Token

1. 登录 Shopify 后台：https://admin.shopify.com/store/dao-7594
2. 进入「设置」→「应用和销售渠道」→「开发应用」
3. 点击「创建应用」，命名如 "DaoEssence Storefront"
4. 配置权限：勾选「Storefront API 集成」
5. 安装应用
6. 复制 **Storefront access token**

#### 步骤二：填入配置

打开 `js/shopify-config.js`，将 Token 粘贴到：

```javascript
const SHOPIFY_CONFIG = {
    storeDomain: 'dao-7594.myshopify.com',
    storefrontAccessToken: 'YOUR_TOKEN_HERE', // ← 粘贴在这里
    apiVersion: '2024-01'
};
```

#### 步骤三：在 HTML 中引入脚本

在每个需要 Shopify 数据的页面中，添加以下引用：

```html
<!-- 在 </body> 之前添加 -->

<!-- 基础配置（所有页面都需要） -->
<script src="js/shopify-config.js"></script>
<script src="js/shopify-api.js"></script>

<!-- 页面特定脚本 -->
<!-- 商品列表页 shop.html -->
<script src="js/shop-products.js"></script>

<!-- 商品详情页 product-detail.html -->
<script src="js/shop-product-detail.js"></script>

<!-- 购物车页 cart.html -->
<script src="js/shop-cart.js"></script>

<!-- 结账页 checkout.html -->
<script src="js/shop-checkout.js"></script>
```

---

### 3. 在 Shopify 后台配置商品

#### 配置 Metafields（自定义字段）

1. 进入「设置」→「自定义数据」→「商品」
2. 点击「添加定义」
3. 添加以下字段：

| 名称 | Namespace | Key | 类型 |
|-----|-----------|-----|------|
| 材质 | custom | material | 单行文本 |
| 能量属性 | custom | energy_type | 单行文本 |
| 适用场景 | custom | usage_scenario | 单行文本 |
| 产地 | custom | origin | 单行文本 |
| 护理说明 | custom | care_instructions | 多行文本 |

详细配置请参考：`docs/SHOPIFY-METAFIELDS-GUIDE.md`

#### 创建商品

1. 进入「商品」→「添加商品」
2. 填写标题、描述、价格
3. 上传图片（支持多张）
4. 添加变体（规格：颜色、尺寸等）
5. 填写 Metafields（材质、能量属性等）
6. 保存并发布

---

### 4. 页面改造指南

#### shop.html（商品列表页）

**需要添加的容器元素：**

```html
<!-- 商品筛选按钮 -->
<div class="filter-buttons">
    <button data-filter="all" class="active">全部</button>
    <button data-filter="crystal">水晶</button>
    <button data-filter="bracelet">手串</button>
    <button data-filter="pendant">吊坠</button>
</div>

<!-- 商品列表容器 -->
<div id="products-grid" class="products-grid">
    <!-- 商品会动态加载到这里 -->
</div>
```

#### product-detail.html（商品详情页）

**需要添加的容器元素：**

```html
<!-- 面包屑 -->
<div id="breadcrumb" class="breadcrumb"></div>

<!-- 图片画廊 -->
<div id="product-gallery" class="product-gallery"></div>

<!-- 商品信息 -->
<div id="product-info" class="product-info"></div>

<!-- 规格选择器 -->
<div id="variant-selector" class="variant-selector"></div>

<!-- 自定义属性 -->
<div id="product-metafields" class="product-metafields"></div>

<!-- 商品描述 -->
<div id="product-description" class="product-description"></div>

<!-- 添加购物车按钮 -->
<button class="add-to-cart-btn" onclick="addToCartFromDetail()">加入购物车</button>

<!-- 相关推荐 -->
<div id="related-products" class="related-products"></div>
```

**URL 参数格式：**
```
product-detail.html?product=商品handle
```

#### cart.html（购物车页）

**需要添加的容器元素：**

```html
<!-- 购物车商品列表 -->
<div id="cart-items" class="cart-items"></div>

<!-- 购物车摘要 -->
<div class="cart-summary">
    <div class="summary-row">
        <span>小计：</span>
        <span id="cart-subtotal">$0.00</span>
    </div>
    <div class="summary-row">
        <span>税费：</span>
        <span id="cart-tax">$0.00</span>
    </div>
    <div class="summary-row total">
        <span>总计：</span>
        <span id="cart-total">$0.00</span>
    </div>
</div>

<!-- 操作按钮 -->
<button class="continue-shopping-btn" onclick="continueShopping()">继续购物</button>
<button class="checkout-btn" onclick="proceedToCheckout()">去结账</button>
```

#### checkout.html（结账页）

**需要添加的容器元素：**

```html
<!-- 订单摘要 -->
<div id="order-summary" class="order-summary"></div>

<!-- 结账按钮 -->
<button id="checkout-btn" class="checkout-btn">确认支付</button>
```

**说明：** 实际支付会跳转到 Shopify 托管的结账页面。

---

### 5. 测试清单

- [ ] 配置 API Token
- [ ] 在 Shopify 后台添加至少一个商品
- [ ] 测试商品列表页能否显示商品
- [ ] 测试商品详情页能否显示详情、规格、大图
- [ ] 测试添加到购物车功能
- [ ] 测试购物车页面数量修改、删除功能
- [ ] 测试结账流程跳转

---

### 6. 常见问题

#### Q: 商品列表页显示"无法加载商品数据"
**A:** 检查 API Token 是否正确配置，检查网络请求是否返回错误。

#### Q: 商品详情页不显示
**A:** 确保 URL 参数正确，格式为 `?product=商品handle`。

#### Q: 购物车无法添加商品
**A:** 检查浏览器控制台是否有错误，确保 Shopify API 正常响应。

#### Q: 结账跳转失败
**A:** 确保购物车不为空，检查 Shopify 后台支付配置是否完成。

---

### 7. 技术支持

- Shopify 官方文档：https://shopify.dev/docs/api/storefront
- 项目文件位置：`C:/Users/agenew/Desktop/DaoEssence/`
- Metafields 配置指南：`docs/SHOPIFY-METAFIELDS-GUIDE.md`
