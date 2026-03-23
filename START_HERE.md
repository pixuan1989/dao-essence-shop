# 🎬 立即执行 - Vercel 部署 3 步指南

```
⏱️  预计耗时：5-10 分钟
📍 当前时间：2026-03-23 13:22
✅ 状态：所有代码已准备，等待你的执行
```

---

## 🚀 3 步快速部署

### 第 1 步：Vercel 环境变量（2 分钟）

打开：https://vercel.com/dashboard

```
1. Projects → dao-essence
2. Settings → Environment Variables
3. Add New
4. Name: CREEM_API_KEY
   Value: creem_1qa0zx2EuHFHl5hJMeCEsfB
   勾选所有环境（Production, Preview, Development）
5. Save
```

✅ **完成标志**：看到 CREEM_API_KEY 在列表中显示为 Active

---

### 第 2 步：推送代码（1 分钟）

打开 PowerShell：

```powershell
cd "c:/Users/agenew/Desktop/DaoEssence - 副本"
git push origin main
```

✅ **完成标志**：看到 "main -> main" 字样，无 error

---

### 第 3 步：验证部署（2 分钟）

**等待 Vercel 部署**（1-2 分钟）

**在浏览器访问**：
```
https://dao-essence.vercel.app/api/products
```

✅ **完成标志**：看到 JSON 产品数据，success: true

---

## 🎉 成功！

如果你看到了 JSON 数据，恭喜你已经成功！

```json
{
  "success": true,
  "data": [
    {
      "id": "prod_7i2asEAuHFHl5hJMeCEsfB",
      "name": "Traditional Agarwood",
      "price": 200
    },
    {
      "id": "prod_1YuuAVysoYK6AOmQVab2uR",
      "name": "Five Elements Energy Bracelet",
      "price": 168
    }
  ],
  "count": 2
}
```

---

## ⚡ 快速问题排查

| 现象 | 原因 | 解决方案 |
|------|------|---------|
| API 返回 404 | 路由错误 | 检查文件是否在 api/creem-proxy.js |
| API 返回 500 | 环境变量未设置 | 检查 Vercel Settings 中是否有 CREEM_API_KEY |
| 部署卡住 | 部署中 | 等待 2-3 分钟，刷新页面 |
| 看不到部署 | GitHub 未连接 | 确认 git push 成功（查看 git log） |

---

## 📝 记录执行时间

开始时间：_____________  
环变量设置完成：_____________  
代码推送完成：_____________  
部署完成：_____________  
验证完成：_____________  

---

**现在就去执行吧！有问题随时问我。** 🚀
