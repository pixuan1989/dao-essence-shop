# 产品详情页 CSS 隐藏问题 - 完整诊断指南

## 问题现象
- ✅ Console 显示所有 DOM 更新成功
- ✅ Swiper 初始化完成
- ✅ 图片 HTML 被正确插入
- ❌ 页面显示为空白，图片不可见

## 修复已进行的步骤

### 1. CSS 尺寸修复
- **修改文件**: `product-detail.html`
- **修改内容**:
  - `.swiper-main`: 从 `aspect-ratio: 1` 改为显式 `height: 500px; width: 100%`
  - 添加 `display: flex; align-items: center; justify-content: center;`
  - `.swiper-main .swiper-wrapper`: 添加 `!important` 标志确保 Swiper 库不会覆盖样式
  - `.swiper-main .swiper-slide`: 同样添加 `!important` 标志

### 2. Swiper 初始化修复
- **修改文件**: `product-detail.js`
- **修改内容**:
  - 在 Swiper `init` 回调中添加 `minHeight: 500px; height: 500px;` 强制设置
  - 初始化完成后调用 `this.update()` 刷新尺寸计算
  - 添加详细 console.log 用于调试

### 3. 调试日志增强
- **修改文件**: `product-detail.js` 的 `initSwiper()` 函数
- **新增日志内容**:
  - 元素的 `offsetWidth` 和 `offsetHeight` 
  - 计算样式 (computed styles)
  - 可见性、不透明度等属性

## 你现在需要做的

### 步骤 1: 打开浏览器 Console 并记录关键指标

在浏览器中按 **F12** 打开开发者工具，切换到 **Console** 标签，然后**刷新页面** (Ctrl+R 或 Cmd+R)

**查找以下日志内容:**

```
Main swiper computed: {
    display: "block" 或 "flex",
    width: "...",
    height: "...",
    visibility: "visible",
    opacity: "1",
    offsetWidth: 数字,
    offsetHeight: 数字
}

First slide: {
    offsetWidth: 数字,
    offsetHeight: 数字,
    display: "...",
    visibility: "..."
}
```

### 步骤 2: 关键检查点

**如果你看到这些问题之一:**

#### 问题 A: `offsetWidth: 0` 或 `offsetHeight: 0`
- **原因**: 容器尺寸为0，说明 `.product-gallery` 或 `.product-grid` 没有正确分配宽度
- **解决方案**: 添加调试 CSS:
```css
.product-grid {
    background: rgba(212, 175, 55, 0.1) !important;  /* 可视化容器 */
}
.product-gallery {
    background: rgba(212, 175, 55, 0.2) !important;  /* 可视化容器 */
}
```

#### 问题 B: `visibility: "hidden"` 或 `opacity: "0"`
- **原因**: 被 CSS 隐藏了
- **解决方案**: 文件中已使用 `!important` 应该解决，刷新浏览器缓存（Ctrl+Shift+R）

#### 问题 C: `display: "none"` 或其他不正确的 display 值
- **原因**: Swiper 库的 CSS 覆盖了我们的样式
- **解决方案**: 所有相关 CSS 已添加 `!important`，应该已修复

### 步骤 3: 如果问题仍存在

运行以下命令在 Console 中调试:

```javascript
// 检查所有层级的容器
const gallery = document.querySelector('.product-gallery');
const grid = document.querySelector('.product-grid');
const swiper = document.querySelector('.swiper-main');

console.log('Gallery:', gallery?.offsetWidth, gallery?.offsetHeight);
console.log('Grid:', grid?.offsetWidth, grid?.offsetHeight);
console.log('Swiper:', swiper?.offsetWidth, swiper?.offsetHeight);

// 强制显示（临时调试）
if (swiper) {
    swiper.style.display = 'block';
    swiper.style.visibility = 'visible';
    swiper.style.opacity = '1';
    swiper.style.height = '500px';
    swiper.style.width = '100%';
}
```

## 预期结果

修复完成后，你应该看到:
- ✅ 沉香 (Natural Agarwood) 的 3 张产品图片
- ✅ 下方的缩略图条
- ✅ 左右导航按钮（鼠标悬停时显示）
- ✅ 图片可以点击缩放

## 其他功能检查清单

- [ ] Shop 页面商品列表：正常显示
- [ ] Shop 页面跳转到详情页：正常工作
- [ ] 详情页商品信息（标题、价格、SKU）：正常显示
- [ ] 规格选择器：正常工作
- [ ] 加入购物车按钮：正常工作
- [ ] 购物车侧栏：正常工作
- [ ] 响应式设计（在平板/手机上）：正常工作

## 技术细节

### 为什么需要 `!important`?
Swiper 库会在初始化时向容器添加内联样式，优先级很高。使用 `!important` 可以确保我们的样式不会被覆盖。

### 为什么使用固定高度而不是 `aspect-ratio`?
- `aspect-ratio` 依赖于父容器的宽度已知
- 在某些浏览器版本中可能有兼容性问题
- 固定高度更稳定，特别是在 Swiper 这样的动态库中

### 为什么要调用 `this.update()`?
Swiper 需要重新计算和渲染滑块尺寸。如果容器尺寸在初始化后改变，调用 `update()` 可以强制 Swiper 刷新计算。
