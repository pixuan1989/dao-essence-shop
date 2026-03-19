# Shopify产品和Metafields配置指南

## 📋 目录

1. [产品配置基础](#产品配置基础)
2. [Metafields配置](#metafields配置)
3. [产品变体设置](#产品变体设置)
4. [能量属性配置](#能量属性配置)
5. [开光信息配置](#开光信息配置)
6. [批量导入产品](#批量导入产品)
7. [常见问题](#常见问题)

---

## 1. 产品配置基础

### 步骤1: 登录Shopify后台

1. 访问 https://your-shop.myshopify.com/admin
2. 使用你的管理员账号登录

### 步骤2: 添加新产品

1. 导航到 **Products（产品）**
2. 点击 **Add product（添加产品）**

### 步骤3: 填写基本信息

#### 必填字段

| 字段 | 说明 | 示例 |
|------|------|------|
| **Title（标题）** | 产品名称 | 貔貅摆件 |
| **Description（描述）** | 产品详细说明 | 详尽描述产品特性、工艺、能量属性等 |
| **Media（媒体）** | 产品图片 | 上传6张高质量图片（建议1200x1200px） |

#### 可选字段

| 字段 | 说明 | 示例 |
|------|------|------|
| **Product type（产品类型）** | 产品分类 | Ritual Items（仪式用品） |
| **Vendor（供应商）** | 品牌名称 | DAO Essence |
| **Tags（标签）** | 产品标签 | pixiu, wealth, feng-shui, ritual |

### 步骤4: 设置价格

```
Price（价格）: ¥299.00
Compare at price（对比价）: ¥399.00
Cost per item（成本价）: ¥150.00
Charge tax on this product（税）: ✅ Check
```

### 步骤5: 设置库存

```
SKU（库存单位）: DAO-PIXIU-001
Barcode（条形码）: （可选）
Quantity（数量）: 50
Inventory policy（库存策略）: 
  - ☑️ Don't track inventory（不追踪库存）
  - ⭕ Shopify tracks this product's inventory（Shopify追踪）
```

### 步骤6: 配置变体（详见第3节）

### 步骤7: 配置Metafields（详见第2节）

### 步骤8: 保存产品

点击 **Save（保存）** 或 **Save and publish（保存并发布）**

---

## 2. Metafields配置

Metafields用于存储产品的自定义数据，如能量属性、开光信息等。

### 步骤1: 启用Metafields（Shopify 2.0+）

Shopify默认已启用Metafields功能，无需额外配置。

### 步骤2: 创建Metafield定义

#### 2.1 导航到Metafields

1. **Settings（设置）** → **Custom data（自定义数据）**
2. 点击 **Products（产品）**

#### 2.2 创建命名空间（Namespace）

点击 **Add definition（添加定义）**，创建以下命名空间：

##### A. 能量属性（energy）

| 设置 | 值 |
|------|-----|
| **Namespace（命名空间）** | `energy` |
| **Key（键）** | `attributes` |
| **Name（名称）** | 能量属性 |
| **Description（描述）** | 产品的能量属性和五行信息 |
| **Type（类型）** | `JSON object`（JSON对象） |

##### B. 开光信息（consecration）

| 设置 | 值 |
|------|-----|
| **Namespace（命名空间）** | `consecration` |
| **Key（键）** | `info` |
| **Name（名称）** | 开光信息 |
| **Description（描述）** | 产品开光仪式的详细信息 |
| **Type（类型）** | `JSON object`（JSON对象） |

##### C. 工艺信息（crafting）

| 设置 | 值 |
|------|-----|
| **Namespace（命名空间）** | `consecration` |
| **Key（键）** | `info` |
| **Name（名称）** | 开光信息 |
| **Description（描述）** | 产品开光仪式的详细信息 |
| **Type（类型）** | `JSON object`（JSON对象） |

#### 2.3 创建单个键值Metafields（可选）

如果你更喜欢简单的键值对，可以创建以下单个Metafields：

##### 能量属性（单个键值）

| Namespace | Key | Name | Type |
|-----------|-----|------|------|
| `energy` | `five_element` | 五行属性 | Single line text |
| `energy` | `type` | 能量类型 | Single line text |
| `energy` | `intensity` | 能量强度 | Single line text |
| `energy` | `direction` | 最佳朝向 | Single line text |

##### 开光信息（单个键值）

| Namespace | Key | Name | Type |
|-----------|-----|------|------|
| `consecration` | `master` | 开光大师 | Single line text |
| `consecration` | `date` | 开光日期 | Date |
| `consecration` | `location` | 开光地点 | Single line text |
| `consecration` | `ritual_type` | 仪式类型 | Single line text |

##### 工艺信息（单个键值）

| Namespace | Key | Name | Type |
|-----------|-----|------|------|
| `crafting` | `material` | 材质 | Single line text |
| `crafting` | `handmade` | 手工制作 | Boolean (true/false) |
| `crafting` | `craftsman` | 工匠 | Single line text |
| `crafting` | `days_required` | 制作周期 | Number |

---

### 步骤3: 为产品填充Metafields值

#### 方法A: 使用JSON对象（推荐）

1. 打开产品编辑页面
2. 滚动到页面底部的 **Metafields（自定义字段）**
3. 找到 **energy.attributes**
4. 点击输入框，输入以下JSON：

```json
{
  "five_element": "金",
  "type": "招财纳福",
  "intensity": "高",
  "direction": "东南方",
  "color_association": "金色、黄色",
  "season_association": "秋季",
  "benefits": [
    "招财进宝",
    "化煞辟邪",
    "提升事业运势"
  ],
  "suitable_for": [
    "商人",
    "创业者",
    "投资者"
  ],
  "ritual_compatibility": [
    "周一开光",
    "新月能量"
  ]
}
```

5. 找到 **consecration.info**
6. 输入以下JSON：

```json
{
  "master": "道长王玄机",
  "date": "2024-03-15",
  "location": "武当山紫霄宫",
  "ritual_type": "道教祈福开光仪式",
  "duration": "3小时",
  "participants": 12,
  "ceremony_steps": [
    "净化仪式",
    "念经祈福",
    "注入能量",
    "封印加持"
  ],
  "certification": true
}
```

7. 找到 **crafting.details**
8. 输入以下JSON：

```json
{
  "material": "天然玉石",
  "handmade": true,
  "craftsman": "陈大师",
  "days_required": 7,
  "technique": "传统玉雕工艺",
  "details": [
    "选料严格",
    "精雕细琢",
    "打磨光滑",
    "抛光完美"
  ],
  "origin": "中国河南南阳"
}
```

#### 方法B: 使用单个键值

如果你选择单个键值方式，逐个填写：

1. **energy.five_element**: `金`
2. **energy.type**: `招财纳福`
3. **energy.intensity**: `高`
4. **energy.direction**: `东南方`
5. **consecration.master**: `道长王玄机`
6. **consecration.date**: `2024-03-15`
7. **consecration.location**: `武当山紫霄宫`
8. **crafting.material**: `天然玉石`
9. **crafting.handmade**: `true`（勾选复选框）
10. **crafting.days_required**: `7`

---

## 3. 产品变体设置

### 步骤1: 添加变体选项

在产品编辑页面，滚动到 **Variants（变体）** 部分。

#### 选项1: 材质（Material）

点击 **Add option（添加选项）**，选择或创建：
```
Option name（选项名称）: 材质
```

添加选项值：
```
✓ 天然玉石
✓ 黄铜
✓ 紫檀木
```

#### 选项2: 尺寸（Size）

再次点击 **Add option（添加选项）**：
```
Option name（选项名称）: 尺寸
```

添加选项值：
```
✓ 小号 (8cm)
✓ 中号 (12cm)
✓ 大号 (15cm)
```

### 步骤2: 创建变体组合

Shopify会自动生成所有组合（3×3=9个变体）：

| 材质 | 尺寸 | 价格 | SKU | 库存 |
|------|------|------|-----|------|
| 天然玉石 | 小号 (8cm) | ¥299 | DAO-PIXIU-JADE-S | 20 |
| 天然玉石 | 中号 (12cm) | ¥399 | DAO-PIXIU-JADE-M | 15 |
| 天然玉石 | 大号 (15cm) | ¥499 | DAO-PIXIU-JADE-L | 10 |
| 黄铜 | 小号 (8cm) | ¥199 | DAO-PIXIU-BRASS-S | 30 |
| 黄铜 | 中号 (12cm) | ¥249 | DAO-PIXIU-BRASS-M | 25 |
| 黄铜 | 大号 (15cm) | ¥299 | DAO-PIXIU-BRASS-L | 20 |
| 紫檀木 | 小号 (8cm) | ¥259 | DAO-PIXIU-WOOD-S | 25 |
| 紫檀木 | 中号 (12cm) | ¥329 | DAO-PIXIU-WOOD-M | 20 |
| 紫檀木 | 大号 (15cm) | ¥399 | DAO-PIXIU-WOOD-L | 15 |

### 步骤3: 为每个变体上传图片（可选）

如果不同变体有不同外观：

1. 点击变体的 **Add image（添加图片）**
2. 上传对应材质的图片
3. 勾选 "Use this image for all options in this variant"（如果图片只代表材质）

### 步骤4: 保存变体

点击 **Save（保存）**

---

## 4. 能量属性配置

### 完整的能量属性示例

#### 产品: 貔貅摆件（天然玉石）

```json
{
  "five_element": "金",
  "type": "招财纳福",
  "intensity": "高",
  "direction": "东南方",
  "color_association": "金色、黄色",
  "season_association": "秋季",
  "benefits": [
    "招财进宝",
    "化煞辟邪",
    "提升事业运势",
    "增强财运",
    "守护平安"
  ],
  "suitable_for": [
    "商人",
    "创业者",
    "投资者",
    "办公室摆放",
    "店铺招财"
  ],
  "ritual_compatibility": [
    "周一开光",
    "新月能量",
    "财神节仪式"
  ],
  "placement_guide": {
    "living_room": "适合，利于家庭财运",
    "office": "非常适合，增强商业运势",
    "study": "适合，提升学习运势",
    "bedroom": "一般，不建议床头摆放"
  }
}
```

### 不同五行属性参考

| 五行 | 对应产品 | 能量类型 | 最佳朝向 | 颜色 |
|------|----------|----------|----------|------|
| **金** | 貔貅、铜器 | 招财、辟邪 | 东南方 | 金色、白色 |
| **木** | 玉器、木雕 | 生长、健康 | 东方 | 绿色、青色 |
| **水** | 水晶、流水摆件 | 流动、智慧 | 北方 | 黑色、蓝色 |
| **火** | 红玛瑙、朱砂 | 激情、能量 | 南方 | 红色、橙色 |
| **土** | 陶瓷、石雕 | 稳定、财富 | 西南方 | 黄色、褐色 |

---

## 5. 开光信息配置

### 完整的开光信息示例

#### 产品: 貔貅摆件

```json
{
  "master": "道长王玄机",
  "date": "2024-03-15",
  "location": "武当山紫霄宫",
  "ritual_type": "道教祈福开光仪式",
  "duration": "3小时",
  "participants": 12,
  "ceremony_steps": [
    {
      "step": 1,
      "name": "净化仪式",
      "description": "使用檀香和清水净化产品",
      "duration": "30分钟"
    },
    {
      "step": 2,
      "name": "念经祈福",
      "description": "诵读《道德经》和祈福经文",
      "duration": "60分钟"
    },
    {
      "step": 3,
      "name": "注入能量",
      "description": "通过道家符咒注入正能量",
      "duration": "45分钟"
    },
    {
      "step": 4,
      "name": "封印加持",
      "description": "使用道家秘法封印能量",
      "duration": "45分钟"
    }
  ],
  "certification": true,
  "certificate_image": "/certificates/dao-pixiu-cert.jpg",
  "special_notes": [
    "建议在吉日（农历初一、十五）摆放",
    "避免污秽环境",
    "定期用干净软布擦拭"
  ]
}
```

### 开光大师信息参考

| 大师 | 法号 | 道观 | 专长 |
|------|------|------|------|
| 王玄机 | 道长 | 武当山紫霄宫 | 财神信仰、风水开光 |
| 李清虚 | 道长 | 龙虎山天师府 | 符咒、驱邪 |
| 张道灵 | 道长 | 青城山常道观 | 养生、祈福 |

---

## 6. 批量导入产品

### 方法A: 使用CSV导入（推荐）

#### 步骤1: 下载CSV模板

1. **Products（产品）** → **Import（导入）**
2. 点击 **Download CSV template（下载CSV模板）**

#### 步骤2: 准备CSV文件

CSV模板包含以下重要列：

| 列名 | 说明 | 示例 |
|------|------|------|
| `Handle` | 产品唯一标识 | `pixiu-statue` |
| `Title` | 产品标题 | 貔貅摆件 |
| `Body (HTML)` | 产品描述 | `<p>...</p>` |
| `Vendor` | 供应商 | DAO Essence |
| `Type` | 产品类型 | Ritual Items |
| `Tags` | 标签 | `pixiu, wealth, feng-shui` |
| `Published` | 是否发布 | `TRUE` |
| `Option1 Name` | 选项1名称 | Material |
| `Option1 Value` | 选项1值 | 天然玉石 |
| `Option2 Name` | 选项2名称 | Size |
| `Option2 Value` | 选项2值 | 中号 (12cm) |
| `Variant SKU` | 变体SKU | DAO-PIXIU-JADE-M |
| `Variant Grams` | 重量（克） | 500 |
| `Variant Inventory Qty` | 库存数量 | 15 |
| `Variant Price` | 价格 | 399.00 |
| `Variant Compare At Price` | 对比价 | 499.00 |
| `Image Src` | 图片URL | `https://cdn.shopify.com/...` |
| `Image Position` | 图片位置 | 1 |
| `Image Alt Text` | 图片Alt文本 | 天然玉石貔貅摆件 |

#### 步骤3: 添加Metafields到CSV

CSV不支持直接导入Metafields，需要通过以下方式：

1. 先导入基本产品信息
2. 然后在Shopify后台逐个编辑产品添加Metafields

或者使用Shopify Metafields App批量导入（见第7节）。

#### 步骤4: 上传CSV

1. **Products（产品）** → **Import（导入）**
2. 点击 **Upload file（上传文件）**
3. 选择你的CSV文件
4. 点击 **Upload import（上传并导入）**

#### 步骤5: 处理结果

- ✅ 成功导入后，Shopify会显示结果
- ⚠️ 如果有错误，查看错误日志并修正后重新上传

---

### 方法B: 使用Shopify Flow或App

#### 推荐的Metafields管理App

| App名称 | 功能 | 价格 | 评分 |
|---------|------|------|------|
| **Metafields Editor** | 编辑/导入/导出Metafields | 免费 - $9.99/月 | 4.8/5 |
| **Metafields Guru** | 批量编辑、JSON支持 | 免费 - $14.99/月 | 4.7/5 |
| **Smart Metafields** | 可视化编辑器 | $4.99/月起 | 4.6/5 |

#### 使用Metafields Guru批量导入

1. 安装 **Metafields Guru** App
2. 导航到 **Products** → 选择产品
3. 点击 **Edit metafields（编辑Metafields）**
4. 可以批量编辑JSON数据
5. 支持从CSV或Excel导入

---

## 7. 常见问题

### Q1: Metafields字段显示不出来？

**解决方案：**
1. 确认Metafield定义已创建（Settings → Custom data → Products）
2. 确认Metafield值已填写（在产品编辑页面底部）
3. 刷新浏览器缓存
4. 检查Liquid模板是否正确引用Metafields

### Q2: JSON格式错误怎么办？

**解决方案：**
1. 使用在线JSON验证工具检查格式：https://jsonlint.com/
2. 确保所有双引号成对
3. 确保所有逗号使用正确
4. 数组最后一个元素后不要加逗号

**错误示例：**
```json
{
  "five_element": "金",
  "type": "招财纳福",  // ❌ JSON中不能有注释
  "benefits": [
    "招财进宝",
    "化煞辟邪",  // ❌ 数组最后一个元素不能有逗号
  ]
}
```

**正确示例：**
```json
{
  "five_element": "金",
  "type": "招财纳福",
  "benefits": [
    "招财进宝",
    "化煞辟邪"
  ]
}
```

### Q3: 如何删除Metafield值？

**解决方案：**
1. 打开产品编辑页面
2. 滚动到Metafields部分
3. 点击Metafield输入框
4. 删除所有内容（清空输入框）
5. 保存产品

### Q4: 变体图片不显示？

**解决方案：**
1. 确认图片已上传到产品
2. 点击变体的 "Add image（添加图片）" 按钮
3. 选择对应的图片
4. 如果图片代表整个材质/尺寸，勾选 "Use this image for all options in this variant"
5. 保存变体

### Q5: 如何批量编辑产品价格？

**解决方案：**
1. **Products（产品）** → 勾选多个产品
2. 点击 **Edit products（编辑产品）**
3. 选择 **Price（价格）**
4. 选择操作方式：
   - **Set（设置）** - 直接设置价格
   - **Increase by（增加）** - 增加固定金额或百分比
   - **Decrease by（减少）** - 减少固定金额或百分比
5. 输入数值并保存

### Q6: 如何创建产品集合（Collection）？

**解决方案：**
1. **Products（产品）** → **Collections（集合）**
2. 点击 **Create collection（创建集合）**
3. 填写集合信息：
   - **Title（标题）**: Featured Products（精选产品）
   - **Description（描述）**: Our most popular ritual items
4. 选择 **Manually（手动）** 或 **Automated（自动）**
5. 添加产品
6. 保存

**推荐集合：**
- **Featured Products（精选产品）** - 首页展示
- **Ritual Items（仪式用品）** - 所有仪式相关产品
- **Jade Collection（玉石系列）** - 所有玉石产品
- **New Arrivals（新品）** - 最近添加的产品

### Q7: 如何为产品添加视频？

**解决方案：**
1. 上传视频到YouTube或Vimeo
2. 复制视频嵌入代码
3. 在产品描述中粘贴嵌入代码
4. 或者在产品编辑页面的 **Media（媒体）** 部分直接上传视频（支持MP4格式）

### Q8: Metafields数据丢失怎么办？

**解决方案：**
1. 定期导出Metafields数据（使用Metafields Guru等App）
2. Shopify会自动保存产品历史记录
3. 查看产品编辑页面的 "Last modified" 信息
4. 如果严重丢失，联系Shopify支持恢复备份

---

## 8. 快速配置清单

### 第一个产品配置清单（貔貅摆件）

- [ ] 基本信息填写
  - [ ] Title: 貔貅摆件
  - [ ] Description: 详尽描述
  - [ ] Product type: Ritual Items
  - [ ] Vendor: DAO Essence
  - [ ] Tags: pixiu, wealth, feng-shui
- [ ] 图片上传
  - [ ] 上传6张产品图片
  - [ ] 添加Alt文本
- [ ] 价格设置
  - [ ] Price: ¥299
  - [ ] Compare at price: ¥399
- [ ] 变体配置
  - [ ] 添加材质选项（3种）
  - [ ] 添加尺寸选项（3种）
  - [ ] 配置9个变体的价格和SKU
- [ ] Metafields配置
  - [ ] 创建energy.attributes定义
  - [ ] 填写能量属性JSON
  - [ ] 创建consecration.info定义
  - [ ] 填写开光信息JSON
  - [ ] 创建crafting.details定义
  - [ ] 填写工艺信息JSON
- [ ] 保存并发布
  - [ ] 检查预览
  - [ ] 发布产品

---

## 9. 推荐的配置顺序

1. **Day 1**: 配置前10个核心产品
2. **Day 2**: 配置产品变体和价格
3. **Day 3**: 配置所有产品的Metafields
4. **Day 4**: 创建产品集合（Collections）
5. **Day 5**: 测试所有产品在网站上的显示

---

## 10. 获取帮助

### Shopify官方资源
- **Help Center**: https://help.shopify.com/
- **Product Management**: https://help.shopify.com/en/manual/products
- **Metafields**: https://help.shopify.com/en/manual/products/metafields
- **Community Forum**: https://community.shopify.com/

### 推荐App
- **Metafields Guru**: https://apps.shopify.com/metafields-guru
- **Bulk Product Edit**: https://apps.shopify.com/bulk-product-edit
- **Excelify**: https://apps.shopify.com/excelify

---

## 总结

配置产品和Metafields的核心要点：

1. **产品信息**: 完整填写标题、描述、价格、库存
2. **变体系统**: 合理设置材质、尺寸等选项
3. **Metafields**: 使用JSON结构存储能量属性、开光信息等自定义数据
4. **图片质量**: 上传高质量产品图片（1200x1200px）
5. **批量导入**: 使用CSV或App提高效率
6. **测试验证**: 在网站前端验证所有信息正确显示

按照本指南逐步配置，你的DAO Essence商店很快就能完美上线！🚀
