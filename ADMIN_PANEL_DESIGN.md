# DAO Essence - 商品管理后台设计方案

## 📋 概述

本文档描述DAO Essence商品管理后台的设计方案，包括产品数据管理、图片上传、规格配置等功能，并确保与Shopify无缝集成。

---

## 🗄️ 数据结构设计

### 核心产品字段（与Shopify兼容）

```javascript
{
  // ========== 基础信息 ==========
  id: "dao-pixiu-001",                    // 产品唯一ID
  title: "貔貅摆件",                         // 产品标题（中文）
  title_en: "Pixiu Statue",                // 产品标题（英文）
  handle: "pixiu-statue",                 // URL友好标识符
  description: "...",                       // 产品描述
  description_en: "...",                    // 英文描述
  vendor: "DAO Essence",                   // 供应商/品牌
  type: "Ritual Items",                    // 产品类型
  tags: ["pixiu", "wealth", "fengshui"], // 产品标签
  
  // ========== 价格信息 ==========
  price: 299.00,                          // 销售价格
  compare_at_price: 399.00,                // 原价
  currency: "CNY",                         // 货币
  cost_price: 150.00,                      // 成本价（内部使用）
  
  // ========== 库存管理 ==========
  inventory_policy: "deny",                // 库存策略
  inventory_quantity: 8,                   // 总库存
  inventory_tracking: true,                // 是否追踪库存
  requires_shipping: true,                 // 是否需要配送
  
  // ========== SEO信息 ==========
  seo_title: "貔貅摆件 | Pixiu Statue - 招财镇宅",
  seo_description: "正宗道教开光貔貅摆件，手工雕刻...",
  seo_keywords: ["貔貅", "pixiu", "招财", "镇宅"],
  
  // ========== 状态 ==========
  status: "active",                        // active, draft, archived
  published_at: "2024-03-15T10:00:00Z",   // 发布时间
  
  // ========== 图片管理 ==========
  images: [
    {
      id: 1,
      src: "https://cdn.example.com/products/pixiu-1.jpg",
      alt: "貔貅正面视图",
      position: 1,
      width: 1200,
      height: 1200,
      variant_ids: [],                      // 关联的变体ID
      metafields: {
        is_main: true,
        angle: "front",
        detail_level: "full"
      }
    },
    {
      id: 2,
      src: "https://cdn.example.com/products/pixiu-2.jpg",
      alt: "貔貅细节特写",
      position: 2,
      width: 1200,
      height: 1200,
      metafields: {
        is_main: false,
        angle: "detail",
        detail_level: "zoom"
      }
    }
  ],
  
  // ========== 变体管理 ==========
  variants: [
    {
      id: "dao-pixiu-001-wood-small",
      title: "紫檀木 / Small",
      price: 299.00,
      compare_at_price: 399.00,
      sku: "DAO-PX-001-W-S",
      barcode: "1234567890123",
      weight: 350,
      weight_unit: "g",
      available: true,
      inventory_quantity: 8,
      
      // 选项值
      option1: "紫檀木",                     // 材质
      option2: "小号",                        // 尺寸
      option3: null,                         // 颜色（可选）
      
      // 规格信息
      specs: {
        size: "120×80×150mm",
        weight: "约 350g",
        material: "紫檀木"
      },
      
      // 关联图片
      image_id: 1
    },
    {
      id: "dao-pixiu-001-wood-medium",
      title: "紫檀木 / Medium",
      price: 499.00,
      compare_at_price: 699.00,
      sku: "DAO-PX-001-W-M",
      weight: 850,
      weight_unit: "g",
      available: true,
      inventory_quantity: 5,
      option1: "紫檀木",
      option2: "中号",
      option3: null,
      specs: {
        size: "180×120×220mm",
        weight: "约 850g",
        material: "紫檀木"
      }
    }
  ],
  
  // ========== 选项配置 ==========
  options: [
    {
      id: "material",
      name: "材质",
      name_en: "Material",
      position: 1,
      values: [
        {
          value: "wood",
          label: "紫檀木",
          label_en: "Sandalwood",
          color: "#8B7355",
          image: "https://cdn.example.com/materials/sandalwood.jpg"
        },
        {
          value: "brass",
          label: "黄铜",
          label_en: "Brass",
          color: "#B87333",
          image: "https://cdn.example.com/materials/brass.jpg"
        },
        {
          value: "gold",
          label: "镀金",
          label_en: "Gold Plated",
          color: "#FFD700",
          image: "https://cdn.example.com/materials/gold.jpg"
        }
      ]
    },
    {
      id: "size",
      name: "尺寸",
      name_en: "Size",
      position: 2,
      values: [
        {
          value: "small",
          label: "小号",
          label_en: "Small",
          description: "12×8×15cm",
          price_modifier: 0
        },
        {
          value: "medium",
          label: "中号",
          label_en: "Medium",
          description: "18×12×22cm",
          price_modifier: 200
        },
        {
          value: "large",
          label: "大号",
          label_en: "Large",
          description: "25×18×30cm",
          price_modifier: 500
        }
      ]
    }
  ],
  
  // ========== 自定义元字段（Metafields）==========
  // 这些字段可以完全自定义，适合存储特殊业务数据
  metafields: {
    // 能量属性
    energy_attributes: {
      namespace: "energy",
      key: "attributes",
      value: {
        five_element: "金",
        energy_type: "招财守财",
        auspicious_direction: "正西、西北",
        target_audience: "事业心强、追求财富的人士",
        activation_date: "2024-03-15",
        master: "玄真道长"
      },
      value_type: "json_string"
    },
    
    // 开光信息
    consecration: {
      namespace: "consecration",
      key: "info",
      value: {
        is_consecrated: true,
        master_name: "玄真道长",
        consecration_date: "2024-03-15",
        consecration_place: "江西龙虎山天师府",
        certificate_number: "C-2024-0315-001",
        video_url: "https://cdn.example.com/videos/consecration/pixiu-001.mp4",
        certificate_image: "https://cdn.example.com/certificates/pixiu-001.jpg"
      },
      value_type: "json_string"
    },
    
    // 工艺信息
    crafting: {
      namespace: "crafting",
      key: "details",
      value: {
        method: "手工雕刻",
        origin: "江西景德镇",
        craft_time: "15-20天",
        craftsman: "张师傅（高级工艺师）",
        workshop: "景德镇传统工艺坊",
        certification: "国家级非物质文化遗产"
      },
      value_type: "json_string"
    },
    
    // 摆放指南
    placement_guide: {
      namespace: "fengshui",
      key: "placement",
      value: {
        best_directions: ["正西", "西北"],
        avoid_directions: ["正北", "东北"],
        ideal_locations: ["客厅财位", "办公室", "商铺"],
       禁忌位置: ["卫生间", "厨房", "卧室"],
        activation_method: "每月初一、十五供香",
        daily_care: "用软布擦拭，避免阳光直射"
      },
      value_type: "json_string"
    },
    
    // 定制服务
    custom_service: {
      namespace: "customization",
      key: "service",
      value: {
        is_customizable: true,
        customization_options: ["刻字", "开光日期选择", "包装定制"],
        base_custom_price: 100.00,
        customization_lead_time: "7天"
      },
      value_type: "json_string"
    }
  }
}
```

---

## 🎨 后台界面设计

### 1. 产品列表页

```
┌─────────────────────────────────────────────────────────────────┐
│ DAO Essence - 商品管理                          [+ 添加产品]   │
├─────────────────────────────────────────────────────────────────┤
│ [搜索框] [筛选] [排序]                                      │
├─────────────────────────────────────────────────────────────────┤
│ □  缩略图  产品名称          SKU      价格      库存  状态  │
│ □  [图]   貔貅摆件        DAO-PX... ¥299     8     ●在售  │
│ □  [图]   金蟾摆件        DAO-JC... ¥259     12    ●在售  │
│ □  [图]   龙龟摆件        DAO-LG... ¥328     5     ●在售  │
│ □  [图]   麒麟摆件        DAO-QL... ¥388     3     ⚠️库存低│
│ □  [图]   五帝钱          DAO-WD... ¥168     0     ⚫缺货  │
├─────────────────────────────────────────────────────────────────┤
│ < 1 2 3 4 5 >  共 128 个产品                                │
└─────────────────────────────────────────────────────────────────┘
```

### 2. 产品编辑页

#### 标签页导航
- [基础信息] [图片管理] [变体配置] [库存定价] [SEO优化] [能量属性] [开光信息] [高级设置]

#### 2.1 基础信息
```
┌─────────────────────────────────────────────────────────────────┐
│ 基础信息                                                      │
├─────────────────────────────────────────────────────────────────┤
│ 产品标题（中文）*                                             │
│ [貔貅摆件                                   ]                │
│                                                                │
│ 产品标题（英文）*                                             │
│ [Pixiu Statue - The Wealth Guardian       ]                   │
│                                                                │
│ URL标识符                                                      │
│ [/products/pixiu-statue                       ]                │
│                                                                │
│ 产品类型 *     [Ritual Items ▼]                                │
│ 品牌 *        [DAO Essence ▼]                                  │
│ 标签          [pixiu] [wealth] [fengshui] [+ 添加]            │
│                                                                │
│ 产品描述（中文）*                                             │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ 貔貅（Pixiu）是中国古代神话传说中的瑞兽...                 │ │
│ │                                                      [富文本编辑器] │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                │
│ 产品描述（英文）*                                             │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ The Pixiu is a legendary Chinese mythical creature...      │ │
│ └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

#### 2.2 图片管理
```
┌─────────────────────────────────────────────────────────────────┐
│ 图片管理                                           [+ 上传图片] │
├─────────────────────────────────────────────────────────────────┤
│                                                                │
│  主图设置: ○ 自动  ● 指定第一张  ○ 无                        │
│                                                                │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │                                                           │ │
│ │   [☑]  ┌────────┐  ┌────────┐  ┌────────┐            │ │
│ │        │  貔貅   │  │  貔貅   │  │  貔貅   │            │ │
│ │        │ 正面   │  │ 侧面   │  │ 细节   │            │ │
│ │        │        │  │        │  │        │            │ │
│ │        └────────┘  └────────┘  └────────┘            │ │
│ │         主图 (1)     缩略图    缩略图                 │ │
│ │                                                           │ │
│ │   [☑]  ┌────────┐  ┌────────┐  ┌────────┐            │ │
│ │        │  貔貅   │  │  貔貅   │  │  貔貅   │            │ │
│ │        │ 背面   │  │ 场景   │  │ 开光   │            │ │
│ │        │        │  │        │  │        │            │ │
│ │        └────────┘  └────────┘  └────────┘            │ │
│ │        缩略图       缩略图    缩略图                 │ │
│ │                                                           │ │
│ │  [+ 选择文件] 或拖拽图片到此处                            │ │
│ │                                                           │ │
│ │  拖拽排序图片                                            │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                │
│ 选中图片编辑:                                                  │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ 图片标题: [貔貅正面视图                   ]                │ │
│ │ Alt文本: [Pixiu statue front view         ]                │ │
│ │ 关联变体: [所有变体 ▼]                                     │ │
│ │ 拍摄角度: [正面 ▼]                                        │ │
│ │ 详情级别: [完整 ▼]                                          │ │
│ └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

#### 2.3 变体配置
```
┌─────────────────────────────────────────────────────────────────┐
│ 变体配置                                              [+ 添加变体] │
├─────────────────────────────────────────────────────────────────┤
│                                                                │
│ 选项组:                                                        │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ 选项1: 材质 Material                                      │ │
│ │ ┌────────────────────────────────────────────────────┐     │ │
│ │ │ 紫檀木 Sandalwood    [编辑] [删除]               │     │ │
│ │ │ 黄铜 Brass          [编辑] [删除]               │     │ │
│ │ │ 镀金 Gold Plated    [编辑] [删除]               │     │ │
│ │ │ [+ 添加选项值]                                      │     │ │
│ │ └────────────────────────────────────────────────────┘     │ │
│ │                                                           │ │
│ │ 选项2: 尺寸 Size                                          │ │
│ │ ┌────────────────────────────────────────────────────┐     │ │
│ │ │ 小号 Small (12×8×15cm)    [编辑] [删除]          │     │ │
│ │ │ 中号 Medium (18×12×22cm)  [编辑] [删除]          │     │
│ │ │ 大号 Large (25×18×30cm)   [编辑] [删除]          │     │ │
│ │ │ [+ 添加选项值]                                      │     │ │
│ │ └────────────────────────────────────────────────────┘     │ │
│ │                                                           │ │
│ │ [+ 添加选项组]                                            │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                │
│ 变体列表:                                                      │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ 变体名称                价格      原价      库存    状态  │ │
│ ├────────────────────────────────────────────────────────────┤ │
│ │ 紫檀木 / Small         ¥299     ¥399     8      ●在售 │ │
│ │ 紫檀木 / Medium        ¥499     ¥699     5      ●在售 │ │
│ │ 紫檀木 / Large         ¥799     ¥1099    3      ●在售 │ │
│ │ 黄铜 / Small           ¥459     ¥599     6      ●在售 │ │
│ │ 黄铜 / Medium          ¥699     ¥899     4      ●在售 │ │
│ │ 镀金 / Small           ¥1288    ¥1688    2      ●在售 │ │
│ │ [批量编辑] [删除选中] [+ 添加变体]                        │ │
│ └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

#### 2.4 能量属性（自定义Metafield）
```
┌─────────────────────────────────────────────────────────────────┐
│ 能量属性 - 可与Shopify Metafields同步                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                │
│ 五行属性 *                                                     │
│ [金 ▼] (木、火、土、金、水)                                  │
│                                                                │
│ 能量类型 *                                                     │
│ [招财守财                                      ]              │
│                                                                │
│ 适用方位 *                                                     │
│ [正西、西北                                    ]              │
│                                                                │
│ 适用人群 *                                                     │
│ [事业心强、追求财富的人士                        ]              │
│                                                                │
│ 开光状态 *                                                     │
│ ● 已开光  ○ 未开光                                            │
│                                                                │
│ 开光道长                                                       │
│ [玄真道长                                      ]              │
│                                                                │
│ 开光日期 *                                                     │
│ [2024-03-15                                    📅]           │
│                                                                │
│ 开光地点                                                       │
│ [江西龙虎山天师府                              ]              │
│                                                                │
│ 证书编号 *                                                     │
│ [C-2024-0315-001                             ]              │
│                                                                │
│ 开光视频                                                       │
│ [https://cdn.example.com/video.mp4          ] [上传视频]       │
│                                                                │
│ 开光证书图片                                                    │
│ [上传证书图片] [查看当前证书]                                  │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔌 Shopify集成方案

### 方案A：使用Shopify作为主平台

**架构：**
```
前端 (自定义主题)
    ↓
Shopify Storefront API (GraphQL)
    ↓
Shopify 后台 (管理产品)
    ↓
Shopify Admin API (自定义后台同步)
```

**实现步骤：**

1. **使用Shopify的变体系统**
   - 创建产品时，设置选项1、选项2、选项3
   - 每个变体对应一个SKU
   - 使用Shopify的Metafields存储自定义字段

2. **Metafields映射**
```javascript
// Shopify Metafield定义
const SHOPIFY_METAFIELDS = {
  // 能量属性
  energy_attributes: {
    namespace: "energy",
    key: "attributes",
    type: "json"
  },
  
  // 开光信息
  consecration: {
    namespace: "consecration",
    key: "info",
    type: "json"
  },
  
  // 工艺信息
  crafting: {
    namespace: "crafting",
    key: "details",
    type: "json"
  },
  
  // 摆放指南
  placement_guide: {
    namespace: "fengshui",
    key: "placement",
    type: "json"
  }
};
```

3. **通过Shopify Admin API操作**
```javascript
// 创建/更新产品
async function createShopifyProduct(productData) {
  const mutation = `
    mutation productCreate($input: ProductInput!) {
      productCreate(input: $input) {
        product {
          id
          title
          handle
          variants(first: 10) {
            edges {
              node {
                id
                price
                sku
                metafields(first: 10) {
                  edges {
                    node {
                      namespace
                      key
                      value
                    }
                  }
                }
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  
  const response = await fetch('/admin/api/2024-01/graphql.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        input: {
          title: productData.title,
          descriptionHtml: productData.description,
          variants: productData.variants,
          metafields: Object.entries(productData.metafields).map(([key, value]) => ({
            namespace: value.namespace,
            key: value.key,
            value: JSON.stringify(value.value),
            type: "json_string"
          }))
        }
      }
    })
  });
  
  return response.json();
}
```

### 方案B：使用自建后台 + Shopify同步

**架构：**
```
自建后台 (管理界面)
    ↓
自建数据库 (MySQL/PostgreSQL)
    ↓
同步服务 → Shopify API
    ↓
前端 ← Shopify Storefront API
```

**优势：**
- 完全自定义的后台界面
- 更灵活的业务逻辑
- 可以先上线，后期再接入Shopify

**实现步骤：**

1. **数据库设计**
```sql
CREATE TABLE products (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  title_en VARCHAR(255),
  handle VARCHAR(255) UNIQUE,
  description TEXT,
  description_en TEXT,
  vendor VARCHAR(100),
  type VARCHAR(100),
  status ENUM('active', 'draft', 'archived') DEFAULT 'draft',
  price DECIMAL(10, 2),
  compare_at_price DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'CNY',
  inventory_quantity INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  shopify_product_id VARCHAR(50),  -- Shopify产品ID
  synced_at TIMESTAMP NULL,            -- 同步时间
  INDEX (handle),
  INDEX (shopify_product_id)
);

CREATE TABLE product_variants (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  price DECIMAL(10, 2),
  compare_at_price DECIMAL(10, 2),
  weight DECIMAL(10, 2),
  weight_unit VARCHAR(10),
  inventory_quantity INT DEFAULT 0,
  available BOOLEAN DEFAULT TRUE,
  option1 VARCHAR(100),
  option2 VARCHAR(100),
  option3 VARCHAR(100),
  shopify_variant_id VARCHAR(50),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  src VARCHAR(500) NOT NULL,
  alt VARCHAR(255),
  position INT,
  width INT,
  height INT,
  shopify_image_id VARCHAR(50),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE product_metafields (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  namespace VARCHAR(50) NOT NULL,
  key VARCHAR(100) NOT NULL,
  value TEXT NOT NULL,
  value_type VARCHAR(50) DEFAULT 'string',
  UNIQUE KEY unique_metafield (product_id, namespace, key),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

2. **同步服务（Node.js示例）**
```javascript
const ShopifyService = {
  // 同步产品到Shopify
  async syncProductToShopify(productId) {
    const product = await db.getProduct(productId);
    const variants = await db.getVariants(productId);
    const images = await db.getImages(productId);
    const metafields = await db.getMetafields(productId);
    
    let shopifyProductId = product.shopify_product_id;
    
    if (shopifyProductId) {
      // 更新现有产品
      await this.updateShopifyProduct(shopifyProductId, product, variants, images, metafields);
    } else {
      // 创建新产品
      const result = await this.createShopifyProduct(product, variants, images, metafields);
      shopifyProductId = result.id;
      await db.updateProduct(productId, { shopify_product_id: shopifyProductId });
    }
    
    // 更新同步时间
    await db.updateProduct(productId, { synced_at: new Date() });
    
    return { success: true, shopify_product_id: shopifyProductId };
  },
  
  // 创建Shopify产品
  async createShopifyProduct(product, variants, images, metafields) {
    const mutation = `
      mutation productCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            handle
            variants(first: 10) {
              edges {
                node {
                  id
                  sku
                }
              }
            }
            images(first: 10) {
              edges {
                node {
                  id
                  url
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    
    const response = await fetch('/admin/api/2024-01/graphql.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          input: {
            title: product.title,
            descriptionHtml: product.description,
            productType: product.type,
            vendor: product.vendor,
            status: product.status === 'active' ? 'ACTIVE' : 'DRAFT',
            variants: variants.map(v => ({
              option1: v.option1,
              option2: v.option2,
              option3: v.option3,
              price: v.price.toString(),
              compareAtPrice: v.compare_at_price ? v.compare_at_price.toString() : undefined,
              sku: v.sku,
              weight: v.weight,
              weightUnit: v.weight_unit,
              inventoryQuantities: [{ availableQuantity: v.inventory_quantity }]
            })),
            images: images.map(img => ({
              src: img.src,
              altText: img.alt,
              position: img.position
            })),
            metafields: metafields.map(mf => ({
              namespace: mf.namespace,
              key: mf.key,
              value: mf.value,
              type: this.getShopifyMetafieldType(mf.value_type)
            }))
          }
        }
      })
    });
    
    const data = await response.json();
    
    if (data.errors) {
      throw new Error(data.errors[0].message);
    }
    
    if (data.data.productCreate.userErrors.length > 0) {
      throw new Error(data.data.productCreate.userErrors[0].message);
    }
    
    return data.data.productCreate.product;
  },
  
  // 获取Shopify Metafield类型
  getShopifyMetafieldType(type) {
    const typeMap = {
      'string': 'single_line_text_field',
      'json_string': 'json_string',
      'integer': 'number_integer',
      'boolean': 'boolean'
    };
    return typeMap[type] || 'single_line_text_field';
  }
};

// 批量同步
async function syncAllProducts() {
  const products = await db.getAllProducts();
  const results = [];
  
  for (const product of products) {
    try {
      const result = await ShopifyService.syncProductToShopify(product.id);
      results.push({ success: true, product: product.id, ...result });
    } catch (error) {
      results.push({ success: false, product: product.id, error: error.message });
    }
  }
  
  return results;
}
```

---

## 📤 图片上传服务

### 1. CDN存储方案

```javascript
// 使用阿里云OSS或AWS S3
const ImageUploadService = {
  async uploadImage(file, options = {}) {
    const { 
      folder = 'products',
      quality = 85,
      compress = true 
    } = options;
    
    // 生成唯一文件名
    const fileName = `${folder}/${Date.now()}_${file.name}`;
    
    // 图片压缩（如果需要）
    if (compress && file.type.startsWith('image/')) {
      file = await this.compressImage(file, quality);
    }
    
    // 上传到CDN
    const url = await this.uploadToCDN(file, fileName);
    
    // 生成多种尺寸
    const sizes = [
      { suffix: '_thumb', width: 200, height: 200 },
      { suffix: '_small', width: 400, height: 400 },
      { suffix: '_medium', width: 800, height: 800 },
      { suffix: '_large', width: 1200, height: 1200 },
      { suffix: '_full', width: 2000, height: 2000 }
    ];
    
    const resizedImages = await Promise.all(
      sizes.map(size => this.resizeAndUpload(file, fileName, size))
    );
    
    return {
      original: url,
      thumbnails: resizedImages
    };
  },
  
  async compressImage(file, quality) {
    // 使用 sharp 或 canvas 进行压缩
    // 实现略
    return file;
  },
  
  async uploadToCDN(file, fileName) {
    // 使用 OSS SDK 或 S3 SDK 上传
    // 实现略
    return `https://cdn.daoessence.com/${fileName}`;
  }
};
```

### 2. 后台图片上传界面

```javascript
// React组件示例
function ImageUploadPanel({ productId, images, onUpload, onDelete }) {
  const [uploading, setUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState(images);
  
  const handleFileSelect = async (files) => {
    setUploading(true);
    
    try {
      for (const file of files) {
        const result = await ImageUploadService.uploadImage(file, {
          folder: `products/${productId}`,
          quality: 85,
          compress: true
        });
        
        const newImage = {
          id: Date.now(),
          src: result.original,
          thumbnails: result.thumbnails,
          alt: file.name,
          position: previewImages.length + 1
        };
        
        setPreviewImages([...previewImages, newImage]);
        onUpload(newImage);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('图片上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="image-upload-panel">
      <div className="upload-area">
        <div 
          className="upload-zone"
          onClick={() => document.getElementById('fileInput').click()}
        >
          <input
            id="fileInput"
            type="file"
            multiple
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          <UploadIcon />
          <p>点击或拖拽图片到此处</p>
          <small>支持 JPG、PNG、WebP 格式，单张最大 10MB</small>
        </div>
      </div>
      
      <div className="image-grid">
        {previewImages.map((image, index) => (
          <ImageThumbnail
            key={image.id}
            image={image}
            position={index + 1}
            onMove={handleMove}
            onDelete={handleDelete}
          />
        ))}
      </div>
      
      {uploading && <LoadingSpinner />}
    </div>
  );
}
```

---

## 🔄 数据同步流程

### 实时同步
```javascript
// 监听数据库变更，自动同步到Shopify
const DatabaseSync = {
  init() {
    this.setupProductListener();
    this.setupVariantListener();
    this.setupImageListener();
  },
  
  setupProductListener() {
    db.on('product.created', (product) => {
      this.syncToShopify(product.id);
    });
    
    db.on('product.updated', (product) => {
      this.syncToShopify(product.id);
    });
    
    db.on('product.deleted', (product) => {
      this.deleteFromShopify(product.shopify_product_id);
    });
  },
  
  async syncToShopify(productId) {
    try {
      await ShopifyService.syncProductToShopify(productId);
      console.log(`Product ${productId} synced to Shopify`);
    } catch (error) {
      console.error('Sync failed:', error);
      // 加入重试队列
      RetryQueue.add({ type: 'product', id: productId });
    }
  }
};
```

---

## 📊 数据迁移计划

### 从自建数据库迁移到Shopify

```javascript
const MigrationService = {
  async migrateToShopify() {
    console.log('Starting migration...');
    
    const products = await db.getAllProducts();
    const stats = {
      total: products.length,
      success: 0,
      failed: 0,
      errors: []
    };
    
    for (const product of products) {
      try {
        await ShopifyService.syncProductToShopify(product.id);
        stats.success++;
        console.log(`✓ Migrated: ${product.title}`);
      } catch (error) {
        stats.failed++;
        stats.errors.push({
          product: product.id,
          error: error.message
        });
        console.error(`✗ Failed: ${product.title}`, error.message);
      }
    }
    
    console.log('Migration complete:', stats);
    return stats;
  }
};
```

---

## 🎯 实施建议

### 阶段1：开发自建后台（1-2个月）
1. 搭建后端API（Node.js + Express）
2. 设计数据库结构
3. 开发管理界面（React/Vue）
4. 实现基础的CRUD功能

### 阶段2：完善功能（1个月）
1. 实现图片上传和管理
2. 开发变体配置
3. 添加自定义Metafield管理
4. 实现批量操作

### 阶段3：Shopify集成（1-2周）
1. 配置Shopify Store
2. 开发同步服务
3. 测试数据同步
4. 迁移现有数据

### 阶段4：前端对接（1周）
1. 前端集成Shopify Storefront API
2. 测试购买流程
3. 性能优化
4. 上线部署

---

## 📝 总结

这个方案提供了：
- ✅ 完整的产品数据结构
- ✅ 灵活的变体配置
- ✅ 自定义Metafield支持
- ✅ 图片管理系统
- ✅ Shopify无缝集成
- ✅ 数据同步机制
- ✅ 可扩展的架构

可以立即开始开发自建后台，后期通过同步服务无缝接入Shopify。
