# Shopify Metafields 配置指南

## 概述

Metafields 是 Shopify 的自定义字段功能，用于存储商品的额外信息（如材质、能量属性、适用场景等）。这些字段可以：

1. **在 Shopify 后台管理** - 无需开发后台系统
2. **通过 Storefront API 读取** - 前端直接获取
3. **与现有静态网站无缝对接** - 数据结构完全兼容

---

## 一、在 Shopify 后台配置 Metafields

### 步骤 1：进入 Metafields 设置

```
Shopify 后台 → 设置 → 自定义数据 → 商品 → 添加定义
```

### 步骤 2：添加自定义字段

根据你的商品特性，添加以下字段：

| 字段名称 | Namespace | Key | 类型 | 说明 |
|---------|-----------|-----|------|------|
| 材质 | custom | material | 单行文本 | 如：天然水晶、檀木、黄铜 |
| 能量属性 | custom | energy_type | 单行文本 | 如：招财、辟邪、健康、智慧 |
| 适用场景 | custom | usage_scenario | 单行文本 | 如：冥想、居家、办公、送礼 |
| 护理说明 | custom | care_instructions | 多行文本 | 如何保养、清洁方法 |
| 产地 | custom | origin | 单行文本 | 如：巴西、印度、中国 |
| 重量 | custom | weight | 单行文本 | 如：50g、100g |
| 尺寸 | custom | dimensions | 单行文本 | 如：高 5cm × 宽 3cm |
| 尺码表图片 | custom | size_chart | URL | 尺码对照图链接 |
| 特点列表 | custom | features | 多行文本 | 多个特点，用换行分隔 |
| 视频链接 | custom | video_url | URL | 产品演示视频 |
| 使用方法 | custom | usage_method | 多行文本 | 详细使用说明 |

### 步骤 3：字段类型说明

| 类型 | 用途 | 示例 |
|------|------|------|
| 单行文本 | 短文本信息 | 材质、产地 |
| 多行文本 | 长文本内容 | 护理说明、特点列表 |
| 数字 | 数值数据 | 重量（克） |
| 布尔值 | 是/否选项 | 是否有礼盒包装 |
| URL | 链接地址 | 视频、图片链接 |
| JSON | 复杂数据结构 | 规格参数表 |
| 颜色 | 颜色选择器 | 商品主色调 |

---

## 二、在前端读取 Metafields

### API 查询语法

```javascript
// 在 GraphQL 查询中添加 metafields
const query = `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      title
      metafields(identifiers: [
        { namespace: "custom", key: "material" },
        { namespace: "custom", key: "energy_type" },
        { namespace: "custom", key: "usage_scenario" }
      ]) {
        namespace
        key
        value
        type
      }
    }
  }
`;
```

### 使用辅助函数

```javascript
// 已在 shopify-api.js 中提供
const material = getMetafieldValue(product, 'material');
const energyType = getMetafieldValue(product, 'energy_type');
const usageScenario = getMetafieldValue(product, 'usage_scenario');
```

---

## 三、商品规格（Variants）配置

规格是 Shopify 原生支持的功能，用于管理商品的不同变体（颜色、尺寸等）。

### 在 Shopify 后台配置

1. 进入商品编辑页面
2. 在「变体」部分点击「添加变体」
3. 设置选项名称和值：
   - 选项 1：颜色（金、银、玫瑰金）
   - 选项 2：尺寸（S、M、L）
   - 选项 3：材质（天然水晶、檀木）

### 前端获取规格

```javascript
// 获取商品所有规格选项
const options = getProductOptions(product);
// 输出: [{ name: '颜色', values: ['金', '银', '玫瑰金'] }]

// 根据选中的选项查找对应 variant
const variant = findVariantByOptions(product, {
  '颜色': '金',
  '尺寸': 'M'
});
```

---

## 四、图片管理

### Shopify 原生图片功能

1. **商品主图** - 第一张图片自动作为主图
2. **变体图片** - 每个规格可以有对应图片
3. **多图展示** - 支持上传多张商品图片

### 图片最佳实践

| 图片类型 | 尺寸 | 用途 |
|---------|------|------|
| 主图 | 1000×1000px | 商品列表、详情页主图 |
| 细节图 | 800×800px | 材质细节、工艺展示 |
| 场景图 | 1200×800px | 使用场景、搭配建议 |
| 对比图 | 1000×500px | 规格对比、尺寸参考 |

### 前端获取图片

```javascript
// 获取主图
const mainImage = getMainImage(product);

// 获取所有图片
const allImages = getAllImages(product);

// 渲染图片画廊
allImages.forEach(img => {
  console.log(img.url, img.altText);
});
```

---

## 五、完整数据结构示例

### Shopify 商品数据结构

```json
{
  "id": "gid://shopify/Product/123456",
  "title": "天然紫水晶手串",
  "handle": "natural-amethyst-bracelet",
  "description": "天然紫水晶制作，具有招财辟邪功效...",
  "productType": "水晶饰品",
  "vendor": "DaoEssence",
  "tags": ["水晶", "招财", "新品"],
  "availableForSale": true,
  "priceRange": {
    "minVariantPrice": { "amount": "199.00", "currencyCode": "USD" },
    "maxVariantPrice": { "amount": "299.00", "currencyCode": "USD" }
  },
  "images": {
    "edges": [
      { "node": { "id": "...", "url": "https://...", "altText": "主图" } },
      { "node": { "id": "...", "url": "https://...", "altText": "细节图" } }
    ]
  },
  "variants": {
    "edges": [
      {
        "node": {
          "id": "gid://shopify/ProductVariant/789",
          "title": "8mm / 天然紫水晶",
          "price": { "amount": "199.00", "currencyCode": "USD" },
          "availableForSale": true,
          "selectedOptions": [
            { "name": "尺寸", "value": "8mm" },
            { "name": "材质", "value": "天然紫水晶" }
          ]
        }
      }
    ]
  },
  "options": [
    { "name": "尺寸", "values": ["8mm", "10mm", "12mm"] },
    { "name": "材质", "values": ["天然紫水晶", "巴西紫水晶"] }
  ],
  "metafields": [
    { "namespace": "custom", "key": "material", "value": "天然紫水晶" },
    { "namespace": "custom", "key": "energy_type", "value": "招财、智慧" },
    { "namespace": "custom", "key": "usage_scenario", "value": "冥想、日常佩戴" },
    { "namespace": "custom", "key": "origin", "value": "巴西" },
    { "namespace": "custom", "key": "care_instructions", "value": "避免接触化学品，定期用软布擦拭" }
  ]
}
```

---

## 六、前端渲染示例

### 商品详情页展示 Metafields

```html
<div class="product-metafields">
  <h3>商品属性</h3>
  <div class="metafield-item">
    <span class="label">材质：</span>
    <span class="value" id="meta-material"></span>
  </div>
  <div class="metafield-item">
    <span class="label">能量属性：</span>
    <span class="value" id="meta-energy"></span>
  </div>
  <div class="metafield-item">
    <span class="label">适用场景：</span>
    <span class="value" id="meta-usage"></span>
  </div>
  <div class="metafield-item">
    <span class="label">产地：</span>
    <span class="value" id="meta-origin"></span>
  </div>
  <div class="metafield-item">
    <span class="label">护理说明：</span>
    <span class="value" id="meta-care"></span>
  </div>
</div>
```

```javascript
// 渲染 Metafields
function renderMetafields(product) {
  document.getElementById('meta-material').textContent = 
    getMetafieldValue(product, 'material') || '-';
  document.getElementById('meta-energy').textContent = 
    getMetafieldValue(product, 'energy_type') || '-';
  document.getElementById('meta-usage').textContent = 
    getMetafieldValue(product, 'usage_scenario') || '-';
  document.getElementById('meta-origin').textContent = 
    getMetafieldValue(product, 'origin') || '-';
  document.getElementById('meta-care').textContent = 
    getMetafieldValue(product, 'care_instructions') || '-';
}
```

---

## 七、快速配置清单

### 第一次使用时需要做的事：

1. ✅ 在 Shopify 后台创建店铺
2. ✅ 配置支付方式（Settings → Payments）
3. ✅ 配置配送方式（Settings → Shipping）
4. ✅ 添加 Metafields 定义（Settings → Custom Data → Products）
5. ✅ 创建商品并填写 Metafields
6. ✅ 创建 Headless 应用获取 API Token
7. ✅ 在前端 `shopify-config.js` 填入 Token
8. ✅ 测试商品列表、详情、购物车、结账流程

### 后续日常操作：

- 在 Shopify 后台上传/编辑商品图片
- 在 Shopify 后台修改商品价格、库存
- 在 Shopify 后台更新 Metafields（材质、能量属性等）
- 在 Shopify 后台处理订单、发货

---

## 八、API Token 获取步骤

1. Shopify 后台 → 设置 → 应用和销售渠道
2. 点击「开发应用」
3. 点击「创建应用」
4. 命名：DaoEssence Storefront
5. 配置权限：勾选「Storefront API 集成」
6. 安装应用
7. 复制 **Storefront access token**
8. 粘贴到 `js/shopify-config.js` 的 `storefrontAccessToken` 字段

---

## 九、注意事项

### 数据安全

- API Token 是公开的（前端可见），只能读取商品数据
- 所有写操作（下单、支付）都通过 Shopify 托管页面完成
- 不要将 Admin API Token 暴露在前端代码中

### 数据同步

- Shopify 后台的数据修改会实时生效
- 前端无需任何改动
- 商品下架后，前端会自动显示「已售罄」

### 价格显示

- Shopify 返回的价格不包含税费
- 最终价格在结账页面由 Shopify 计算
- 支持多币种、多语言

---

## 十、技术支持

如有问题，请参考：

- [Shopify Storefront API 文档](https://shopify.dev/docs/api/storefront)
- [Shopify Metafields 文档](https://shopify.dev/docs/apps/build/custom-data/metafields)
- 项目代码位置：`C:/Users/agenew/Desktop/DaoEssence/js/`
