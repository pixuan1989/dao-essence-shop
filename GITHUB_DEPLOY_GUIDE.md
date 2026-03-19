# 🚀 GitHub 部署指南 - DaoEssence 店铺

## 快速部署步骤（5分钟完成）

### 步骤 1：打开 Git Bash 或 PowerShell
在 DaoEssence 文件夹中，右键选择 "Open Git Bash here" 或 "在此处打开 PowerShell"

### 步骤 2：配置 Git 用户信息（首次只需做一次）
```bash
git config --global user.name "pixuan1989"
git config --global user.email "your-email@example.com"
```

### 步骤 3：初始化 Git 仓库（如果还没有）
```bash
git init
git add .
git commit -m "Initial commit: DaoEssence shop"
```

### 步骤 4：添加远程仓库
```bash
git remote add origin https://github.com/pixuan1989/道本.git
```

### 步骤 5：推送到 GitHub
```bash
git branch -M main
git push -u origin main
```

**完成！** 你的代码现在已在 GitHub 上了。

---

## 下一步：部署到 Netlify

1. 访问 https://app.netlify.com
2. 用 GitHub 登录
3. 选择 "道本" 仓库
4. 配置构建设置：
   - **基目录**: `shop`
   - **发布目录**: `shop`
5. 点击 "Deploy site"

**部署完成！** 你会获得一个 Netlify 域名。

---

## 常见问题

### Q: 如何更新代码？
```bash
git add .
git commit -m "更新商品信息"
git push
```

### Q: 如何查看部署状态？
访问 GitHub 仓库 → Settings → Pages

### Q: 如何绑定自定义域名？
在 Netlify 中：Site settings → Domain management

---

## 🎯 当前状态

✅ DaoEssence 项目已准备好上传
✅ 所有文件已就位
⏳ 等待你执行部署命令
⏳ 等待 GitHub 推送
⏳ 等待 Netlify 部署
