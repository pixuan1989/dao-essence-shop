# Shopify主题迁移完成指南

## ✅ 已完成的工作

### 1. Shopify主题文件结构
```
DaoEssence/
├── layout/
│   └── theme.liquid          # 主布局文件
├── sections/
│   ├── header.liquid         # 头部导航
│   ├── footer.liquid         # 页脚
│   ├── cart-drawer.liquid    # 购物车抽屉
│   ├── hero-section.liquid    # 首页英雄区域
│   ├── featured-products.liquid    # 精选产品
│   ├── energy-attributes.liquid    # 五行属性
│   ├── crafting-process.liquid     # 工艺流程
│   ├── testimonials.liquid         # 客户评价
│   └── newsletter.liquid          # 邮件订阅
├── templates/
│   ├── index.liquid          # 首页模板
│   ├── product.liquid        # 产品详情页
│   ├── collection.liquid     # 产品列表页
│   └── page.liquid          # 通用页面模板
├── config/
│   ├── settings_schema.json  # 主题设置
│   └── settings_data.json   # 默认配置
└── snippets/
    └── meta-tags.liquid     # SEO元标签
```

### 2. 核心功能实现

#### ✅ 产品详情页 (product.liquid)
- Swiper.js图片画廊（主图+缩略图）
- 图片放大功能
- 完整的变体选择（材质、尺寸、颜色）
- 价格显示（现价、原价、折扣）
- 库存状态显示
- Shopify Cart API集成
- 能量属性Metafield展示

#### ✅ 产品列表页 (collection.liquid)
- 产品网格布局
- 产品筛选（按分类和标签）
- 产品排序功能
- 分页功能
- 快速添加到购物车
- 产品卡片悬停效果

#### ✅ 首页 (index.liquid)
- 英雄区域
- 精选产品展示
- 五行属性介绍
- 工艺流程说明
- 客户评价
- 邮件订阅

#### ✅ 购物车功能
- Ajax Cart Drawer
- 数量调整
- 商品移除
- 实时价格更新
- 通知提示

#### ✅ 响应式设计
- 桌面端（1200px+）
- 平板端（768px-1199px）
- 移动端（<768px）

## 📦 如何安装到Shopify

### 方法1: 上传主题文件

1. **打包主题**
   ```bash
   # 将所有文件压缩为ZIP格式
   # 确保包含所有文件和目录
   ```

2. **上传到Shopify**
   - 登录Shopify后台
   - 进入 Online Store → Themes
   - 点击 "Upload theme"
   - 选择ZIP文件上传

3. **激活主题**
   - 上传完成后，点击 "Publish" 激活

### 方法2: Shopify CLI（推荐）

```bash
# 安装Shopify CLI
npm install -g @shopify/cli

# 登录Shopify
shopify login

# 创建新主题
shopify theme init --name "DAO Essence"

# 复制文件到主题目录
# 将所有Shopify模板文件复制到主题目录

# 推送到Shopify
shopify theme push

# 预览主题
shopify theme serve
```

## ⚙️ 主题配置

### 1. 基础设置

**Shopify后台 → Online Store → Customize → Theme Settings**

- Primary Background: `#F5F0E6`
- Primary Text: `#1A1612`
- Accent Color: `#D4AF37`

### 2. 导航菜单

**Shopify后台 → Online Store → Navigation**

创建以下菜单：
- **Main Menu**: Home, Energy Shop, Crafting Process, About Us
- **Footer Menu**: Privacy Policy, Terms of Service, Shipping Policy, Return Policy

### 3. 产品设置

#### 创建产品变体

1. **基本设置**
   - 产品名称：中英双语
   - 产品类型：Ritual Items, Jewelry, Incense等
   - 产品标签：pixiu, wealth, fengshui, consecrated

2. **变体配置**
   - 选项1：Material（材质）- Wood, Brass, Gold
   - 选项2：Size（尺寸）- Small, Medium, Large
   - 为每个变体设置价格和库存

3. **上传图片**
   - 支持多张产品图片
   - Shopify会自动生成不同尺寸

#### 配置Metafields

**Shopify后台 → Settings → Custom data → Products**

创建以下Metafields：

**1. Energy Attributes**
- Namespace: `energy`
- Key: `attributes`
- Type: `JSON`
- Content:
  ```json
  {
    "five_element": "金",
    "energy_type": "招财守财",
    "auspicious_direction": "正西、西北",
    "target_audience": "事业心强、追求财富的人士"
  }
  ```

**2. Consecration Info**
- Namespace: `consecration`
- Key: `is_consecrated`
- Type: `Boolean`

- Namespace: `consecration`
- Key: `master`
- Type: `Single line text`

**3. Specifications**
- Namespace: `specifications`
- Key: `craftsmanship`
- Type: `Multi-line text`

**4. Global**
- Namespace: `global`
- Key: `subtitle`
- Type: `Single line text`

### 4. 创建产品集合

**Shopify后台 → Products → Collections**

1. **Featured Collection**
   - Handle: `featured`
   - 手动选择精选产品

2. **其他集合**
   - Ritual Items
   - Jewelry
   - Incense
   - Tea Set

## 🎨 自定义样式

### CSS变量

主题使用CSS自定义属性，可以在主题设置中修改：

```css
:root {
  --bg-primary: {{ settings.color_bg_primary }};
  --text-primary: {{ settings.color_text_primary }};
  --accent-color: {{ settings.color_accent }};

  --wood-primary: #2D5A3D;
  --fire-primary: #C41E3A;
  --water-primary: #1A3A4A;
  --metal-primary: #D4AF37;
  --earth-primary: #8B6F47;
}
```

### 修改配色

1. 进入主题编辑器
2. 选择 "Theme Settings"
3. 修改颜色选项
4. 保存更改

## 🚀 功能使用指南

### 1. 添加产品

```liquid
<!-- 在产品详情页 -->
{% for image in product.images %}
  <img src="{{ image | img_url: '600x' }}" alt="{{ image.alt }}">
{% endfor %}

<!-- 价格显示 -->
{{ product.price | money }}

<!-- 变体选择 -->
{% for option in product.options_with_values %}
  <div class="variant-group">
    <label>{{ option.name }}</label>
    {% for value in option.values %}
      <button data-value="{{ value }}">{{ value }}</button>
    {% endfor %}
  </div>
{% endfor %}
```

### 2. 添加到购物车

```javascript
// JavaScript
async function addToCart(variantId, quantity = 1) {
  const response = await fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{
        id: variantId,
        quantity: quantity
      }]
    })
  });

  const data = await response.json();
  console.log('Added to cart:', data);
}
```

### 3. 购物车抽屉

主题已集成购物车抽屉功能，点击购物车图标即可打开。

### 4. Metafield使用

```liquid
<!-- 能量属性 -->
{% if product.metafields.energy.attributes %}
  <div class="energy-attributes">
    <p>五行属性: {{ product.metafields.energy.attributes.five_element }}</p>
    <p>能量类型: {{ product.metafields.energy.attributes.energy_type }}</p>
  </div>
{% endif %}

<!-- 开光状态 -->
{% if product.metafields.consecration.is_consecrated %}
  <p>已开光 - 开光大师: {{ product.metafields.consecration.master }}</p>
{% endif %}
```

## 🔧 故障排除

### 问题1: 产品图片不显示

**解决方案:**
- 确保产品已上传图片
- 检查图片格式（推荐JPG、PNG）
- 清除浏览器缓存

### 问题2: 变体选择不工作

**解决方案:**
- 确保产品有正确的变体配置
- 检查JavaScript控制台是否有错误
- 验证Metafields是否正确设置

### 问题3: 购物车不更新

**解决方案:**
- 检查Shopify AJAX API是否启用
- 查看浏览器控制台错误
- 确保使用正确的变体ID

### 问题4: Metafield不显示

**解决方案:**
- 确认Metafield已创建
- 检查Namespace和Key是否正确
- 验证数据类型是否匹配

## 📚 推荐应用

### 必装应用

1. **Metafields Guru**
   - 管理产品Metafields
   - 批量编辑

2. **Product Reviews**
   - 客户评价功能
   - SEO优化

3. **Klaviyo**
   - 邮件营销
   - 弃单挽回

### 可选应用

1. **Google Shopping**
   - 谷歌购物广告
   - 产品feed

2. **Facebook Pixel**
   - Facebook广告追踪
   - 再营销

3. **Currency Converter**
   - 多货币支持
   - 自动转换

## 🎯 SEO优化

### 元标签

主题已包含完整的SEO元标签：

```liquid
<title>{{ page_title }} | {{ shop.name }}</title>
<meta name="description" content="{{ page_description }}">
<meta property="og:title" content="{{ page_title }}">
<meta property="og:image" content="{{ page_image }}">
```

### 结构化数据

考虑添加以下结构化数据：

```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "{{ product.title }}",
  "image": "{{ product.featured_image }}",
  "description": "{{ product.description }}",
  "brand": {
    "@type": "Brand",
    "name": "{{ shop.name }}"
  },
  "offers": {
    "@type": "Offer",
    "price": "{{ product.price }}",
    "priceCurrency": "{{ shop.currency }}"
  }
}
```

## 📞 技术支持

### 联系方式

- Email: support@daoessence.com
- Shopify社区: [Shopify Theme Support](https://community.shopify.com/c/shopify-design-and-ux)
- 文档: [Shopify Liquid](https://shopify.dev/docs/api/liquid)

### 常用资源

- [Shopify Liquid文档](https://shopify.dev/docs/api/liquid)
- [Shopify Sections](https://shopify.dev/docs/themes/architecture/sections)
- [Shopify Metafields](https://help.shopify.com/en/manual/products/product-metafields)
- [Shopify AJAX API](https://shopify.dev/docs/themes/ajax-api)

## 🎉 迁移完成

恭喜！你的DAO Essence网站已成功迁移到Shopify平台。

### 下一步

1. ✅ 测试所有页面
2. ✅ 配置支付和物流
3. ✅ 设置税收
4. ✅ 测试结账流程
5. ✅ 配置域名
6. ✅ 设置SSL证书
7. ✅ 提交搜索引擎

### 维护建议

1. 定期更新主题
2. 监控性能指标
3. 备份数据
4. 优化图片大小
5. 测试新功能

---

**迁移日期**: {{ 'now' | date: '%Y-%m-%d' }}
**主题版本**: 1.0.0
**Shopify版本**: 2.0+
