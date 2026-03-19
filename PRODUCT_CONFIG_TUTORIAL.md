# Shopify产品配置 - 分步教程

## 🎯 本教程目标
教你如何在Shopify后台配置产品和Metafields，确保你的DAO Essence商店完美运行！

---

## 第1步：创建新产品（5分钟）

### 1.1 登录Shopify后台
```
访问: https://your-shop.myshopify.com/admin
使用你的管理员账号登录
```

### 1.2 导航到产品页面
```
左侧菜单 → Products（产品）→ Add product（添加产品）
```

### 1.3 填写基本信息

#### 标题和描述
```
Title（标题）: 貔貅摆件

Description（描述）:
这是一件精心雕琢的貔貅摆件，采用天然玉石制作，由武当山道长王玄机亲自开光。

貔貅是中国传统文化中的瑞兽，寓意招财进宝、辟邪镇宅。此摆件造型威武，雕工精湛，寓意吉祥。

特点：
- 采用天然玉石，质地温润
- 手工雕刻，每个细节都精雕细琢
- 武当山道长亲自开光，能量纯正
- 适合办公室、家庭摆放，招财纳福

包装：高档礼盒包装，附赠开光证书
```

#### 产品类型和供应商
```
Product type（产品类型）: Ritual Items

Vendor（供应商）: DAO Essence

Tags（标签）: 
pixiu, wealth, feng-shui, ritual, jade, consecrated
```

### 1.4 上传产品图片

点击 **Add image（添加图片）**，上传6张图片：
1. 产品正面（主图）
2. 产品侧面
3. 产品背面
4. 产品细节特写
5. 产品与尺子对比（展示尺寸）
6. 产品包装和证书

**图片要求：**
- 尺寸：1200×1200px（正方形）
- 格式：JPG或PNG
- 大小：小于20MB
- 背景干净、光线充足

### 1.5 设置价格
```
Price（价格）: ¥299.00

Compare at price（对比价）: ¥399.00
（这会显示折扣标签和原价划线）

Cost per item（成本价）: ¥150.00
（用于利润计算，不显示给客户）

Charge tax on this product（计税）: ✅ 勾选
```

### 1.6 设置库存
```
SKU: DAO-PIXIU-001

Barcode: （可选）

Quantity（数量）: 50

Inventory policy（库存策略）:
☑️ Shopify tracks this product's inventory（Shopify追踪）
```

点击 **Save（保存）**

---

## 第2步：配置产品变体（10分钟）

### 2.1 添加第一个选项：材质

点击 **Add option（添加选项）**，选择或输入：
```
Option name: 材质
```

添加选项值：
```
✓ 天然玉石
✓ 黄铜
✓ 紫檀木
```

### 2.2 添加第二个选项：尺寸

再次点击 **Add option（添加选项）**：
```
Option name: 尺寸
```

添加选项值：
```
✓ 小号 (8cm)
✓ 中号 (12cm)
✓ 大号 (15cm)
```

### 2.3 配置变体组合

Shopify会自动生成9个变体，逐个配置：

#### 变体1：天然玉石 + 小号
```
SKU: DAO-PIXIU-JADE-S
Price: ¥299.00
Compare at price: ¥399.00
Quantity: 20
Image: 选择天然玉石图片
```

#### 变体2：天然玉石 + 中号
```
SKU: DAO-PIXIU-JADE-M
Price: ¥399.00
Compare at price: ¥499.00
Quantity: 15
Image: 选择天然玉石图片
```

#### 变体3：天然玉石 + 大号
```
SKU: DAO-PIXIU-JADE-L
Price: ¥499.00
Compare at price: ¥599.00
Quantity: 10
Image: 选择天然玉石图片
```

#### 变体4：黄铜 + 小号
```
SKU: DAO-PIXIU-BRASS-S
Price: ¥199.00
Compare at price: ¥259.00
Quantity: 30
Image: 选择黄铜图片
```

#### 变体5：黄铜 + 中号
```
SKU: DAO-PIXIU-BRASS-M
Price: ¥249.00
Compare at price: ¥319.00
Quantity: 25
Image: 选择黄铜图片
```

#### 变体6：黄铜 + 大号
```
SKU: DAO-PIXIU-BRASS-L
Price: ¥299.00
Compare at price: ¥379.00
Quantity: 20
Image: 选择黄铜图片
```

#### 变体7：紫檀木 + 小号
```
SKU: DAO-PIXIU-WOOD-S
Price: ¥259.00
Compare at price: ¥339.00
Quantity: 25
Image: 选择紫檀木图片
```

#### 变体8：紫檀木 + 中号
```
SKU: DAO-PIXIU-WOOD-M
Price: ¥329.00
Compare at price: ¥429.00
Quantity: 20
Image: 选择紫檀木图片
```

#### 变体9：紫檀木 + 大号
```
SKU: DAO-PIXIU-WOOD-L
Price: ¥399.00
Compare at price: ¥519.00
Quantity: 15
Image: 选择紫檀木图片
```

点击 **Save（保存）**

---

## 第3步：创建Metafields定义（5分钟）

### 3.1 导航到Metafields设置
```
Settings（设置）→ Custom data（自定义数据）→ Products（产品）
```

### 3.2 创建能量属性定义

点击 **Add definition（添加定义）**，填写：
```
Namespace: energy
Key: attributes
Name: 能量属性
Description: 产品的能量属性和五行信息
Type: JSON object（选择这个类型）
```

点击 **Save（保存）**

### 3.3 创建开光信息定义

再次点击 **Add definition（添加定义）**：
```
Namespace: consecration
Key: info
Name: 开光信息
Description: 产品开光仪式的详细信息
Type: JSON object（选择这个类型）
```

点击 **Save（保存）**

### 3.4 创建工艺信息定义

再次点击 **Add definition（添加定义）**：
```
Namespace: crafting
Key: details
Name: 工艺信息
Description: 产品制作工艺的详细信息
Type: JSON object（选择这个类型）
```

点击 **Save（保存）**

---

## 第4步：填充Metafields值（10分钟）

### 4.1 回到产品编辑页面

导航到：
```
Products（产品）→ 选择"貔貅摆件"产品
```

### 4.2 填写能量属性

滚动到页面底部，找到 **Metafields（自定义字段）** 部分。

找到 **energy.attributes** 输入框，点击并粘贴以下内容：

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

### 4.3 填写开光信息

找到 **consecration.info** 输入框，粘贴：

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

### 4.4 填写工艺信息

找到 **crafting.details** 输入框，粘贴：

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

点击 **Save（保存）**

---

## 第5步：发布产品（2分钟）

### 5.1 检查产品信息

在发布前，检查以下内容：
- [ ] 产品标题和描述完整
- [ ] 6张图片全部上传
- [ ] 价格设置正确
- [ ] 变体配置完整
- [ ] Metafields已填写
- [ ] SKU和库存正确

### 5.2 预览产品

点击右上角的 **View（预览）** 按钮，在新窗口中查看产品在网站上的显示效果。

检查：
- [ ] 图片显示正常
- [ ] 变体选择器工作正常
- [ ] 价格显示正确
- [ ] 能量属性显示正确
- [ ] 开光信息显示正确
- [ ] 工艺信息显示正确

### 5.3 发布产品

确认无误后，点击右上角的 **Publish（发布）** 按钮。

产品成功发布！🎉

---

## 第6步：创建产品集合（5分钟）

### 6.1 创建"精选产品"集合

```
Products（产品）→ Collections（集合）→ Create collection（创建集合）
```

填写：
```
Title（标题）: Featured Products（精选产品）

Description（描述）: 
Our most popular ritual items, carefully selected for their spiritual significance and craftsmanship.
```

选择 **Manually（手动）**

点击 **Add products（添加产品）**，勾选：
- [ ] 貔貅摆件
- [ ] 玉佩
- [ ] 铜香炉
- [ ] 檀香炉

点击 **Save（保存）**

### 6.2 创建"仪式用品"集合

```
Create collection（创建集合）
```

填写：
```
Title: Ritual Items（仪式用品）

Description: 
Traditional ritual items for spiritual practices and ceremonies.
```

选择 **Automated（自动）**

设置条件：
```
Product tag equals 'ritual'
```

点击 **Save（保存）**

### 6.3 创建"玉石系列"集合

```
Create collection（创建集合）
```

填写：
```
Title: Jade Collection（玉石系列）

Description: 
Beautiful jade items crafted with traditional techniques.
```

选择 **Automated（自动）**

设置条件：
```
Product tag equals 'jade'
```

点击 **Save（保存）**

---

## 第7步：配置导航菜单（3分钟）

### 7.1 创建Main Menu

```
Online Store（在线商店）→ Navigation（导航）→ Main Menu（主菜单）
```

确保包含以下菜单项：
```
Home → 首页（链接到主页）
Shop → 商店（链接到 /collections/all）
Featured → 精选（链接到 /collections/featured）
Ritual Items → 仪式用品（链接到 /collections/ritual-items）
About Us → 关于我们（链接到 /pages/about-us）
Contact → 联系我们（链接到 /pages/contact）
```

### 7.2 创建Footer Menu

```
Footer Menu（页脚菜单）
```

添加：
```
Shipping Policy → /policies/shipping-policy
Refund Policy → /policies/refund-policy
Privacy Policy → /policies/privacy-policy
Terms of Service → /policies/terms-of-service
```

点击 **Save（保存）**

---

## 第8步：测试网站（5分钟）

### 8.1 访问你的网站

```
Online Store（在线商店）→ Themes（主题）→ Actions（操作）→ Customize（自定义）→ Preview（预览）
```

### 8.2 测试产品页面

1. 在首页点击"Featured Products"中的产品卡片
2. 检查产品详情页：
   - [ ] 图片轮播正常工作
   - [ ] 缩略图点击切换主图
   - [ ] 图片放大功能正常
   - [ ] 变体选择器工作正常
   - [ ] 价格随变体选择更新
   - [ ] "Add to Cart"按钮点击后添加到购物车
   - [ ] 能量属性正确显示
   - [ ] 开光信息正确显示
   - [ ] 工艺信息正确显示

### 8.3 测试购物车

1. 点击"Add to Cart"按钮
2. 点击购物车图标打开购物车抽屉
3. 检查：
   - [ ] 产品正确添加到购物车
   - [ ] 数量调整工作正常
   - [ ] 移除产品工作正常
   - [ ] "Checkout"按钮链接到Shopify结账页面

### 8.4 测试商店页面

1. 导航到 /collections/all
2. 检查：
   - [ ] 所有产品正确显示
   - [ ] 产品筛选工作正常
   - [ ] 产品排序工作正常
   - [ ] 点击产品卡片跳转到产品详情页

---

## ✅ 完成检查清单

完成以上所有步骤后，你应该：

### 已完成的项目
- [ ] 创建了第一个产品（貔貅摆件）
- [ ] 配置了3个变体选项（材质+尺寸）
- [ ] 创建了9个产品变体
- [ ] 配置了价格和库存
- [ ] 创建了3个Metafields定义
- [ ] 填写了能量属性JSON
- [ ] 填写了开光信息JSON
- [ ] 填写了工艺信息JSON
- [ ] 产品已发布
- [ ] 创建了3个产品集合
- [ ] 配置了导航菜单
- [ ] 测试了网站功能

### 下一步
1. **添加更多产品**: 按照相同流程添加其他产品
2. **批量导入**: 如果有大量产品，使用CSV批量导入
3. **优化SEO**: 完善产品标题和描述的SEO
4. **设置支付**: 配置支付方式（Shopify Payments、支付宝、微信支付等）
5. **设置物流**: 配置运费和发货方式
6. **营销推广**: 设置折扣码、邮件营销等

---

## 🎓 学习资源

### Shopify官方教程
- **产品管理**: https://help.shopify.com/en/manual/products
- **Metafields**: https://help.shopify.com/en/manual/products/metafields
- **变体**: https://help.shopify.com/en/manual/products/add-product

### 推荐阅读
1. **Shopify产品管理完整指南**
2. **Metafields高级用法**
3. **Shopify SEO优化指南**

---

## 💡 提示和技巧

### 效率提升
1. **使用快捷键**: Shopify支持键盘快捷键，提高操作效率
2. **批量编辑**: 可以同时编辑多个产品的价格、库存等
3. **导出数据**: 定期导出产品数据备份

### 常见错误
1. **JSON格式错误**: 使用在线工具验证JSON格式
2. **图片过大**: 压缩图片到合适大小
3. **SKU重复**: 确保每个变体的SKU唯一

### 最佳实践
1. **高质量图片**: 使用专业摄影或高质量产品图
2. **详细描述**: 提供详尽的产品描述，帮助客户了解产品
3. **合理定价**: 根据成本和市场定价
4. **及时更新**: 库存不足时及时补货或标记缺货

---

## 🆘 遇到问题？

### 常见问题
1. **Metafields不显示**: 检查定义是否创建，值是否填写
2. **变体错误**: 删除变体重新创建
3. **图片不显示**: 重新上传图片，检查格式和大小
4. **价格错误**: 刷新页面，清除缓存

### 获取帮助
- **Shopify帮助中心**: https://help.shopify.com/
- **Shopify社区**: https://community.shopify.com/
- **联系Shopify支持**: 在后台点击Help（帮助）

---

## 🎉 恭喜！

你已经成功配置了第一个产品！按照同样的流程，你可以添加更多产品，完善你的DAO Essence商店。

**接下来的步骤：**
1. 继续添加更多产品（建议至少10个产品）
2. 创建更多的产品集合
3. 设置支付和物流
4. 优化网站SEO
5. 开始营销推广

**你的DAO Essence商店已经准备好迎接第一批客户了！** 🚀
