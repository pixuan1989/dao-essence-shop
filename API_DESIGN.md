# DAO Essence - 产品管理API设计文档

## 📋 概述

本文档定义DAO Essence产品管理的REST API接口，支持后台管理、图片上传、与Shopify同步等功能。

---

## 🌐 基础信息

- **Base URL**: `https://api.daoessence.com/v1`
- **认证方式**: Bearer Token (JWT)
- **数据格式**: JSON
- **字符编码**: UTF-8

---

## 🔐 认证

### 获取访问令牌

```http
POST /auth/login
```

**请求体：**
```json
{
  "email": "admin@daoessence.com",
  "password": "your-password"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_001",
      "name": "管理员",
      "email": "admin@daoessence.com",
      "role": "admin"
    },
    "expiresIn": 3600
  }
}
```

**请求头：**
```
Authorization: Bearer {token}
```

---

## 📦 产品管理API

### 1. 获取产品列表

```http
GET /products
```

**查询参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 页码，默认1 |
| limit | integer | 否 | 每页数量，默认20 |
| search | string | 否 | 搜索关键词 |
| status | string | 否 | 状态筛选（active/draft/archived） |
| type | string | 否 | 产品类型筛选 |
| sort | string | 否 | 排序（created_at/price/updated_at） |
| order | string | 否 | 排序方向（asc/desc） |

**响应：**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "dao-pixiu-001",
        "title": "貔貅摆件",
        "title_en": "Pixiu Statue",
        "handle": "pixiu-statue",
        "description": "貔貅（Pixiu）是中国古代神话传说中的瑞兽...",
        "vendor": "DAO Essence",
        "type": "Ritual Items",
        "tags": ["pixiu", "wealth", "fengshui"],
        "status": "active",
        "price": 299.00,
        "compare_at_price": 399.00,
        "currency": "CNY",
        "inventory_quantity": 8,
        "images": [
          {
            "id": 1,
            "src": "https://cdn.daoessence.com/products/pixiu-1.jpg",
            "alt": "貔貅正面视图",
            "position": 1,
            "width": 1200,
            "height": 1200
          }
        ],
        "variants": [
          {
            "id": "dao-pixiu-001-wood-small",
            "title": "紫檀木 / Small",
            "price": 299.00,
            "compare_at_price": 399.00,
            "sku": "DAO-PX-001-W-S",
            "inventory_quantity": 8,
            "available": true,
            "option1": "紫檀木",
            "option2": "小号"
          }
        ],
        "metafields": {
          "energy_attributes": {
            "five_element": "金",
            "energy_type": "招财守财"
          }
        },
        "created_at": "2024-03-15T10:00:00Z",
        "updated_at": "2024-03-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 128,
      "totalPages": 7
    }
  }
}
```

---

### 2. 获取单个产品详情

```http
GET /products/{id}
```

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 产品ID |

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "dao-pixiu-001",
    "title": "貔貅摆件",
    "title_en": "Pixiu Statue",
    "handle": "pixiu-statue",
    "description": "...",
    "description_en": "...",
    "vendor": "DAO Essence",
    "type": "Ritual Items",
    "tags": ["pixiu", "wealth", "fengshui"],
    "status": "active",
    "price": 299.00,
    "compare_at_price": 399.00,
    "currency": "CNY",
    "inventory_quantity": 8,
    "requires_shipping": true,
    "images": [
      {
        "id": 1,
        "src": "https://cdn.daoessence.com/products/pixiu-1.jpg",
        "alt": "貔貅正面视图",
        "position": 1,
        "width": 1200,
        "height": 1200,
        "thumbnails": {
          "thumb": "https://cdn.daoessence.com/products/pixiu-1_thumb.jpg",
          "small": "https://cdn.daoessence.com/products/pixiu-1_small.jpg",
          "medium": "https://cdn.daoessence.com/products/pixiu-1_medium.jpg",
          "large": "https://cdn.daoessence.com/products/pixiu-1_large.jpg"
        }
      }
    ],
    "variants": [
      {
        "id": "dao-pixiu-001-wood-small",
        "title": "紫檀木 / Small",
        "price": 299.00,
        "compare_at_price": 399.00,
        "sku": "DAO-PX-001-W-S",
        "barcode": "1234567890123",
        "weight": 350,
        "weight_unit": "g",
        "inventory_quantity": 8,
        "available": true,
        "option1": "紫檀木",
        "option2": "小号",
        "option3": null,
        "specs": {
          "size": "120×80×150mm",
          "weight": "约 350g"
        },
        "image_id": 1
      }
    ],
    "options": [
      {
        "id": "material",
        "name": "材质",
        "name_en": "Material",
        "position": 1,
        "values": [
          {
            "value": "wood",
            "label": "紫檀木",
            "label_en": "Sandalwood",
            "color": "#8B7355"
          }
        ]
      }
    ],
    "metafields": {
      "energy_attributes": {
        "namespace": "energy",
        "key": "attributes",
        "value": {
          "five_element": "金",
          "energy_type": "招财守财",
          "auspicious_direction": "正西、西北",
          "target_audience": "事业心强、追求财富的人士"
        },
        "value_type": "json_string"
      },
      "consecration": {
        "namespace": "consecration",
        "key": "info",
        "value": {
          "is_consecrated": true,
          "master_name": "玄真道长",
          "consecration_date": "2024-03-15",
          "consecration_place": "江西龙虎山天师府",
          "certificate_number": "C-2024-0315-001",
          "video_url": "https://cdn.daoessence.com/videos/consecration/pixiu-001.mp4"
        },
        "value_type": "json_string"
      }
    },
    "seo": {
      "title": "貔貅摆件 | Pixiu Statue - 招财镇宅 | DAO Essence",
      "description": "正宗道教开光貔貅摆件，手工雕刻，招财进宝...",
      "keywords": ["貔貅", "pixiu", "招财", "镇宅", "开光"]
    },
    "shopify": {
      "product_id": "gid://shopify/Product/1234567890",
      "synced_at": "2024-03-15T10:00:00Z"
    },
    "created_at": "2024-03-15T10:00:00Z",
    "updated_at": "2024-03-15T10:00:00Z"
  }
}
```

---

### 3. 创建产品

```http
POST /products
```

**请求体：**
```json
{
  "title": "貔貅摆件",
  "title_en": "Pixiu Statue",
  "handle": "pixiu-statue",
  "description": "貔貅（Pixiu）是中国古代神话传说中的瑞兽...",
  "description_en": "The Pixiu is a legendary Chinese mythical creature...",
  "vendor": "DAO Essence",
  "type": "Ritual Items",
  "tags": ["pixiu", "wealth", "fengshui"],
  "status": "draft",
  "price": 299.00,
  "compare_at_price": 399.00,
  "currency": "CNY",
  "requires_shipping": true,
  "options": [
    {
      "id": "material",
      "name": "材质",
      "name_en": "Material",
      "position": 1,
      "values": [
        {
          "value": "wood",
          "label": "紫檀木",
          "label_en": "Sandalwood",
          "color": "#8B7355"
        },
        {
          "value": "brass",
          "label": "黄铜",
          "label_en": "Brass",
          "color": "#B87333"
        }
      ]
    },
    {
      "id": "size",
      "name": "尺寸",
      "name_en": "Size",
      "position": 2,
      "values": [
        {
          "value": "small",
          "label": "小号",
          "label_en": "Small",
          "description": "12×8×15cm"
        },
        {
          "value": "medium",
          "label": "中号",
          "label_en": "Medium",
          "description": "18×12×22cm"
        }
      ]
    }
  ],
  "variants": [
    {
      "title": "紫檀木 / Small",
      "price": 299.00,
      "compare_at_price": 399.00,
      "sku": "DAO-PX-001-W-S",
      "barcode": "1234567890123",
      "weight": 350,
      "weight_unit": "g",
      "inventory_quantity": 8,
      "available": true,
      "option1": "紫檀木",
      "option2": "小号",
      "option3": null,
      "specs": {
        "size": "120×80×150mm",
        "weight": "约 350g"
      }
    }
  ],
  "metafields": {
    "energy_attributes": {
      "namespace": "energy",
      "key": "attributes",
      "value": {
        "five_element": "金",
        "energy_type": "招财守财",
        "auspicious_direction": "正西、西北",
        "target_audience": "事业心强、追求财富的人士"
      },
      "value_type": "json_string"
    },
    "consecration": {
      "namespace": "consecration",
      "key": "info",
      "value": {
        "is_consecrated": true,
        "master_name": "玄真道长",
        "consecration_date": "2024-03-15",
        "consecration_place": "江西龙虎山天师府",
        "certificate_number": "C-2024-0315-001"
      },
      "value_type": "json_string"
    }
  },
  "seo": {
    "title": "貔貅摆件 | Pixiu Statue - 招财镇宅 | DAO Essence",
    "description": "正宗道教开光貔貅摆件，手工雕刻，招财进宝...",
    "keywords": ["貔貅", "pixiu", "招财", "镇宅", "开光"]
  }
}
```

**响应：**
```json
{
  "success": true,
  "message": "产品创建成功",
  "data": {
    "id": "dao-pixiu-001",
    "title": "貔貅摆件",
    "handle": "pixiu-statue",
    "status": "draft",
    "created_at": "2024-03-15T10:00:00Z",
    "updated_at": "2024-03-15T10:00:00Z"
  }
}
```

---

### 4. 更新产品

```http
PUT /products/{id}
```

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 产品ID |

**请求体：**
（同创建产品，只需提供需要更新的字段）

**响应：**
```json
{
  "success": true,
  "message": "产品更新成功",
  "data": {
    "id": "dao-pixiu-001",
    "updated_at": "2024-03-15T11:00:00Z"
  }
}
```

---

### 5. 删除产品

```http
DELETE /products/{id}
```

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 产品ID |

**响应：**
```json
{
  "success": true,
  "message": "产品删除成功"
}
```

---

## 🖼️ 图片管理API

### 1. 上传产品图片

```http
POST /products/{productId}/images
```

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| productId | string | 是 | 产品ID |

**请求类型：** `multipart/form-data`

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | file | 是 | 图片文件 |
| alt | string | 否 | Alt文本 |
| position | integer | 否 | 位置，默认最后 |
| is_main | boolean | 否 | 是否为主图，默认false |

**响应：**
```json
{
  "success": true,
  "message": "图片上传成功",
  "data": {
    "id": 7,
    "product_id": "dao-pixiu-001",
    "src": "https://cdn.daoessence.com/products/pixiu-new.jpg",
    "alt": "貔貅新增视图",
    "position": 7,
    "width": 1200,
    "height": 1200,
    "size": 512000,
    "thumbnails": {
      "thumb": "https://cdn.daoessence.com/products/pixiu-new_thumb.jpg",
      "small": "https://cdn.daoessence.com/products/pixiu-new_small.jpg",
      "medium": "https://cdn.daoessence.com/products/pixiu-new_medium.jpg",
      "large": "https://cdn.daoessence.com/products/pixiu-new_large.jpg"
    },
    "created_at": "2024-03-15T12:00:00Z"
  }
}
```

---

### 2. 批量上传图片

```http
POST /products/{productId}/images/batch
```

**请求类型：** `multipart/form-data`

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| files[] | file[] | 是 | 图片文件数组 |

**响应：**
```json
{
  "success": true,
  "message": "批量上传成功",
  "data": {
    "uploaded": [
      {
        "id": 8,
        "src": "https://cdn.daoessence.com/products/pixiu-8.jpg"
      },
      {
        "id": 9,
        "src": "https://cdn.daoessence.com/products/pixiu-9.jpg"
      }
    ],
    "failed": [
      {
        "filename": "invalid.exe",
        "error": "不支持的文件类型"
      }
    ]
  }
}
```

---

### 3. 更新图片信息

```http
PUT /products/{productId}/images/{imageId}
```

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| productId | string | 是 | 产品ID |
| imageId | integer | 是 | 图片ID |

**请求体：**
```json
{
  "alt": "更新的Alt文本",
  "position": 1,
  "is_main": true
}
```

**响应：**
```json
{
  "success": true,
  "message": "图片更新成功",
  "data": {
    "id": 1,
    "updated_at": "2024-03-15T12:30:00Z"
  }
}
```

---

### 4. 删除图片

```http
DELETE /products/{productId}/images/{imageId}
```

**响应：**
```json
{
  "success": true,
  "message": "图片删除成功"
}
```

---

### 5. 调整图片顺序

```http
PUT /products/{productId}/images/reorder
```

**请求体：**
```json
{
  "imageIds": [5, 2, 3, 4, 1]
}
```

**响应：**
```json
{
  "success": true,
  "message": "图片顺序更新成功"
}
```

---

## 🔀 变体管理API

### 1. 创建变体

```http
POST /products/{productId}/variants
```

**请求体：**
```json
{
  "title": "紫檀木 / Small",
  "price": 299.00,
  "compare_at_price": 399.00,
  "sku": "DAO-PX-001-W-S",
  "barcode": "1234567890123",
  "weight": 350,
  "weight_unit": "g",
  "inventory_quantity": 8,
  "available": true,
  "option1": "紫檀木",
  "option2": "小号",
  "option3": null,
  "specs": {
    "size": "120×80×150mm",
    "weight": "约 350g"
  },
  "image_id": 1
}
```

**响应：**
```json
{
  "success": true,
  "message": "变体创建成功",
  "data": {
    "id": "dao-pixiu-001-wood-small",
    "created_at": "2024-03-15T10:00:00Z"
  }
}
```

---

### 2. 批量更新变体价格

```http
PATCH /products/{productId}/variants/price
```

**请求体：**
```json
{
  "variants": [
    {
      "id": "dao-pixiu-001-wood-small",
      "price": 329.00
    },
    {
      "id": "dao-pixiu-001-wood-medium",
      "price": 529.00
    }
  ]
}
```

**响应：**
```json
{
  "success": true,
  "message": "价格批量更新成功",
  "data": {
    "updated": 2
  }
}
```

---

### 3. 批量更新库存

```http
PATCH /products/{productId}/variants/inventory
```

**请求体：**
```json
{
  "variants": [
    {
      "id": "dao-pixiu-001-wood-small",
      "inventory_quantity": 10,
      "adjustment": "set"  // set/add/subtract
    },
    {
      "id": "dao-pixiu-001-wood-medium",
      "inventory_quantity": -5,
      "adjustment": "add"
    }
  ]
}
```

**响应：**
```json
{
  "success": true,
  "message": "库存批量更新成功",
  "data": {
    "updated": 2
  }
}
```

---

## 📝 Metafield管理API

### 1. 设置产品Metafield

```http
POST /products/{productId}/metafields
```

**请求体：**
```json
{
  "namespace": "energy",
  "key": "attributes",
  "value": {
    "five_element": "金",
    "energy_type": "招财守财",
    "auspicious_direction": "正西、西北",
    "target_audience": "事业心强、追求财富的人士"
  },
  "value_type": "json_string"
}
```

**响应：**
```json
{
  "success": true,
  "message": "Metafield设置成功",
  "data": {
    "id": 1,
    "namespace": "energy",
    "key": "attributes",
    "value": "{\"five_element\":\"金\",\"energy_type\":\"招财守财\"}",
    "value_type": "json_string",
    "created_at": "2024-03-15T10:00:00Z"
  }
}
```

---

### 2. 批量设置Metafield

```http
POST /products/{productId}/metafields/batch
```

**请求体：**
```json
{
  "metafields": [
    {
      "namespace": "energy",
      "key": "attributes",
      "value": {...},
      "value_type": "json_string"
    },
    {
      "namespace": "consecration",
      "key": "info",
      "value": {...},
      "value_type": "json_string"
    },
    {
      "namespace": "crafting",
      "key": "details",
      "value": {...},
      "value_type": "json_string"
    }
  ]
}
```

---

## 🔄 Shopify同步API

### 1. 同步单个产品到Shopify

```http
POST /products/{productId}/sync/shopify
```

**查询参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| force | boolean | 否 | 强制重新同步，默认false |

**响应：**
```json
{
  "success": true,
  "message": "产品同步到Shopify成功",
  "data": {
    "product_id": "dao-pixiu-001",
    "shopify_product_id": "gid://shopify/Product/1234567890",
    "shopify_handle": "pixiu-statue",
    "synced_at": "2024-03-15T10:00:00Z",
    "variants_synced": 6,
    "images_synced": 6,
    "metafields_synced": 3
  }
}
```

---

### 2. 批量同步产品到Shopify

```http
POST /products/sync/batch
```

**请求体：**
```json
{
  "productIds": [
    "dao-pixiu-001",
    "dao-jinchan-001",
    "dao-longgui-001"
  ],
  "force": false
}
```

**响应：**
```json
{
  "success": true,
  "message": "批量同步任务已创建",
  "data": {
    "task_id": "sync_task_123456",
    "total": 3,
    "status": "processing",
    "estimated_completion": "2024-03-15T10:05:00Z"
  }
}
```

---

### 3. 查询同步状态

```http
GET /sync/status/{taskId}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "task_id": "sync_task_123456",
    "status": "completed",
    "progress": {
      "completed": 3,
      "total": 3,
      "percentage": 100
    },
    "results": [
      {
        "product_id": "dao-pixiu-001",
        "status": "success",
        "shopify_product_id": "gid://shopify/Product/1234567890"
      },
      {
        "product_id": "dao-jinchan-001",
        "status": "success",
        "shopify_product_id": "gid://shopify/Product/1234567891"
      },
      {
        "product_id": "dao-longgui-001",
        "status": "success",
        "shopify_product_id": "gid://shopify/Product/1234567892"
      }
    ],
    "started_at": "2024-03-15T10:00:00Z",
    "completed_at": "2024-03-15T10:03:00Z"
  }
}
```

---

### 4. 从Shopify同步产品到本地

```http
POST /sync/shopify/import
```

**请求体：**
```json
{
  "shopify_product_id": "gid://shopify/Product/1234567890",
  "force": false
}
```

**响应：**
```json
{
  "success": true,
  "message": "从Shopify导入产品成功",
  "data": {
    "product_id": "dao-pixiu-001",
    "shopify_product_id": "gid://shopify/Product/1234567890",
    "imported_at": "2024-03-15T10:00:00Z"
  }
}
```

---

## 📊 统计分析API

### 1. 获取产品统计

```http
GET /products/stats
```

**查询参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| period | string | 否 | 时间周期（day/week/month/year） |

**响应：**
```json
{
  "success": true,
  "data": {
    "total_products": 128,
    "active_products": 115,
    "draft_products": 10,
    "archived_products": 3,
    "low_stock_products": 8,
    "out_of_stock_products": 2,
    "average_price": 456.78,
    "total_inventory": 1523,
    "products_by_type": {
      "Ritual Items": 45,
      "Crystals": 38,
      "Incense": 25,
      "Talismans": 20
    },
    "trend": {
      "added_this_week": 5,
      "updated_this_week": 12,
      "sold_this_week": 23
    }
  }
}
```

---

## ❌ 错误响应

所有API在错误时返回统一格式：

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "验证失败",
    "details": [
      {
        "field": "title",
        "message": "产品标题不能为空"
      }
    ]
  }
}
```

### 错误代码

| 代码 | HTTP状态 | 说明 |
|------|----------|------|
| UNAUTHORIZED | 401 | 未授权，token无效或过期 |
| FORBIDDEN | 403 | 无权限访问 |
| NOT_FOUND | 404 | 资源不存在 |
| VALIDATION_ERROR | 400 | 验证失败 |
| DUPLICATE_ERROR | 409 | 资源已存在（如handle重复） |
| INTERNAL_ERROR | 500 | 服务器内部错误 |
| SHOPIFY_SYNC_ERROR | 502 | Shopify同步失败 |
| UPLOAD_ERROR | 413 | 文件上传失败 |

---

## 🔒 权限控制

### 角色权限矩阵

| 操作 | 超级管理员 | 产品经理 | 普通编辑者 | 只读用户 |
|------|-----------|---------|-----------|---------|
| 查看产品列表 | ✅ | ✅ | ✅ | ✅ |
| 查看产品详情 | ✅ | ✅ | ✅ | ✅ |
| 创建产品 | ✅ | ✅ | ✅ | ❌ |
| 编辑产品 | ✅ | ✅ | ✅ | ❌ |
| 删除产品 | ✅ | ❌ | ❌ | ❌ |
| 上传图片 | ✅ | ✅ | ✅ | ❌ |
| 管理变体 | ✅ | ✅ | ✅ | ❌ |
| 设置价格 | ✅ | ✅ | ❌ | ❌ |
| 调整库存 | ✅ | ✅ | ✅ | ❌ |
| Shopify同步 | ✅ | ✅ | ❌ | ❌ |
| 管理Metafield | ✅ | ✅ | ✅ | ❌ |

---

## 📝 总结

本API设计提供了：

- ✅ 完整的CRUD操作
- ✅ 图片上传和管理
- ✅ 变体配置和批量操作
- ✅ 自定义Metafield支持
- ✅ Shopify无缝集成
- ✅ 统计分析功能
- ✅ 权限控制
- ✅ 完善的错误处理

可以作为后台管理系统和前端的接口规范。
