# Metafields快速参考卡

## 📋 常用Metafields模板

### 能量属性（energy.attributes）

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
  ],
  "placement_guide": {
    "living_room": "适合",
    "office": "非常适合",
    "study": "适合",
    "bedroom": "一般"
  }
}
```

### 开光信息（consecration.info）

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

### 工艺信息（crafting.details）

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

---

## 🎨 五行属性参考

| 五行 | 能量类型 | 最佳朝向 | 颜色 | 季节 |
|------|----------|----------|------|------|
| **金** | 招财、辟邪 | 东南方 | 金色、白色 | 秋季 |
| **木** | 生长、健康 | 东方 | 绿色、青色 | 春季 |
| **水** | 流动、智慧 | 北方 | 黑色、蓝色 | 冬季 |
| **火** | 激情、能量 | 南方 | 红色、橙色 | 夏季 |
| **土** | 稳定、财富 | 西南方 | 黄色、褐色 | 季节交替 |

---

## 👨‍🎓 开光大师参考

| 大师 | 法号 | 道观 | 专长 | 开光日期 |
|------|------|------|------|----------|
| 王玄机 | 道长 | 武当山紫霄宫 | 财神信仰、风水开光 | 2024-03-15 |
| 李清虚 | 道长 | 龙虎山天师府 | 符咒、驱邪 | 2024-04-01 |
| 张道灵 | 道长 | 青城山常道观 | 养生、祈福 | 2024-04-15 |
| 陈道明 | 道长 | 崂山太清宫 | 护身、转运 | 2024-05-01 |
| 刘道成 | 道长 | 峨眉山万年寺 | 智慧、学业 | 2024-05-15 |

---

## 🏺 工艺参考

| 材质 | 技艺 | 周期 | 产地 | 特点 |
|------|------|------|------|------|
| 天然玉石 | 传统玉雕 | 7-10天 | 河南南阳 | 温润、保值 |
| 黄铜 | 失蜡铸造 | 5-7天 | 北京 | 厚重、古朴 |
| 紫檀木 | 榫卯工艺 | 10-15天 | 福建莆田 | 精致、耐用 |
| 陶瓷 | 龙泉青瓷 | 15-20天 | 浙江龙泉 | 精美、高雅 |
| 景泰蓝 | 掐丝珐琅 | 20-30天 | 北京 | 华丽、珍贵 |

---

## 📝 Metafields定义清单

### 必需的Metafields定义

| Namespace | Key | Name | Type | 是否必需 |
|-----------|-----|------|------|----------|
| `energy` | `attributes` | 能量属性 | JSON object | ✅ 是 |
| `consecration` | `info` | 开光信息 | JSON object | ✅ 是 |
| `crafting` | `details` | 工艺信息 | JSON object | ✅ 是 |

### 可选的Metafields定义

| Namespace | Key | Name | Type |
|-----------|-----|------|------|
| `product` | `story` | 产品故事 | Multi-line text |
| `product` | `video` | 产品视频 | URL |
| `product` | `gallery` | 产品画廊 | JSON array |

---

## 🔧 JSON格式检查

### ✅ 正确格式

```json
{
  "key": "value",
  "number": 123,
  "boolean": true,
  "array": [
    "item1",
    "item2"
  ],
  "object": {
    "nested_key": "nested_value"
  }
}
```

### ❌ 错误格式

```json
{
  "key": "value",  // ❌ JSON中不能有注释
  "number": 123,
  "boolean": true,
  "array": [
    "item1",
    "item2",  // ❌ 数组最后一个元素不能有逗号
  ]
}
```

---

## 🎯 产品分类建议

### 按类型分类

- **Ritual Items** - 仪式用品（貔貅、香炉、法器等）
- **Jewelry** - 首饰（玉佩、项链、手链等）
- **Home Decor** - 家居装饰（摆件、挂画等）
- **Tea Ceremony** - 茶道用品（茶具、茶宠等）

### 按五行分类

- **Metal** - 金属性产品（铜器、金属摆件等）
- **Wood** - 木属性产品（玉器、木雕等）
- **Water** - 水属性产品（水晶、流水摆件等）
- **Fire** - 火属性产品（红玛瑙、朱砂等）
- **Earth** - 土属性产品（陶瓷、石雕等）

### 按用途分类

- **Wealth** - 招财类（貔貅、金蟾、财神像等）
- **Protection** - 护身类（符咒、护身符、平安扣等）
- **Health** - 健康类（养生壶、香薰、艾灸等）
- **Career** - 事业类（文昌塔、印章、笔筒等）

---

## 🏷️ 标签建议

### 基础标签
```
ritual（仪式）
consecrated（已开光）
handmade（手工）
premium（高端）
```

### 材质标签
```
jade（玉石）
brass（黄铜）
wood（木）
ceramic（陶瓷）
crystal（水晶）
```

### 五行标签
```
five-element-metal（金）
five-element-wood（木）
five-element-water（水）
five-element-fire（火）
five-element-earth（土）
```

### 用途标签
```
wealth（招财）
protection（护身）
health（健康）
career（事业）
love（爱情）
```

### 动物图腾标签
```
pixiu（貔貅）
golden-toad（金蟾）
dragon（龙）
phoenix（凤）
lion（狮子）
```

---

## 📊 价格参考

### 材质价格区间

| 材质 | 小号 | 中号 | 大号 |
|------|------|------|------|
| 天然玉石 | ¥299-399 | ¥399-499 | ¥499-699 |
| 黄铜 | ¥199-299 | ¥249-349 | ¥299-399 |
| 紫檀木 | ¥259-359 | ¥329-429 | ¥399-529 |
| 陶瓷 | ¥159-259 | ¥199-299 | ¥259-399 |
| 景泰蓝 | ¥499-699 | ¥599-799 | ¥699-999 |

### 工艺价格区间

| 工艺 | 价格增幅 |
|------|----------|
| 普通工艺 | 基础价格 |
| 手工雕刻 | +30-50% |
| 大师作品 | +50-100% |
| 珍稀材质 | +100-300% |
| 限量版 | +200-500% |

---

## 🚀 快速配置步骤

### 第1步：创建产品（2分钟）
1. Products → Add product
2. 填写标题、描述、价格
3. 上传图片

### 第2步：配置变体（3分钟）
1. 添加材质选项
2. 添加尺寸选项
3. 配置变体价格和SKU

### 第3步：创建Metafields定义（1分钟）
1. Settings → Custom data → Products
2. 添加energy.attributes
3. 添加consecration.info
4. 添加crafting.details

### 第4步：填充Metafields值（5分钟）
1. 回到产品编辑页面
2. 复制粘贴JSON模板
3. 根据产品调整内容

### 第5步：发布（30秒）
1. 预览产品
2. 点击Publish

**总计：约12分钟完成一个产品配置！**

---

## 💡 提示

1. **复制粘贴**: 使用上面的JSON模板，根据产品内容调整
2. **批量编辑**: 使用Metafields Guru App批量编辑
3. **定期备份**: 导出Metafields数据备份
4. **格式检查**: 使用 https://jsonlint.com/ 验证JSON格式
5. **图片质量**: 使用高质量产品图片（1200×1200px）

---

## 🆘 快速故障排除

| 问题 | 解决方案 |
|------|----------|
| Metafields不显示 | 检查定义是否创建，值是否填写 |
| JSON格式错误 | 使用在线工具验证JSON格式 |
| 变体错误 | 删除变体重新创建 |
| 图片不显示 | 重新上传图片，检查格式和大小 |
| 价格不更新 | 刷新页面，清除浏览器缓存 |
| 找不到Metafields输入框 | 滚动到产品编辑页面底部 |

---

## 📚 相关文档

- **完整配置指南**: `PRODUCT_AND_METAFIELDS_CONFIG_GUIDE.md`
- **分步教程**: `PRODUCT_CONFIG_TUTORIAL.md`
- **Shopify迁移指南**: `SHOPIFY_MIGRATION_GUIDE.md`
- **迁移总结**: `MIGRATION_SUMMARY.md`

---

## 🎉 开始配置吧！

复制上面的JSON模板，按照快速配置步骤，开始配置你的第一个产品吧！

有问题随时查看相关文档或联系Shopify支持。

**祝你配置顺利！** 🚀
