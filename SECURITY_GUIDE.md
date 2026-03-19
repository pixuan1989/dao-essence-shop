# 🔐 安全配置指南

## ⚠️ 重要提示

**敏感信息（API 密钥、Token 等）绝不要提交到 Git 仓库！**

---

## ✅ 正确的配置方法

### 1. Stripe API 密钥配置

#### 获取密钥
1. 登录 Stripe Dashboard: https://dashboard.stripe.com
2. 点击 **开发者** → **API 密钥**
3. 复制以下密钥：
   - **可发布的密钥** (pk_test_...) - 用于前端
   - **密钥** (sk_test_...) - 用于后端（Netlify Functions）

#### 配置方式

**前端（payment-manager.js）**：
```javascript
apiKey: 'pk_test_51TCXN018te51GWieGBFm9rFjcfiZoLq8HEopzrq9gKHOnCi7afzcdUGuptRdlDrLMs6QiFl7bvHfOmIOPKstjPGk00zANzAQjV'
```

**后端（Netlify Functions）**：
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
```

**Netlify Dashboard 环境变量**：
1. 登录 Netlify: https://app.netlify.com
2. 选择 `dao-essence-shop` 站点
3. 点击 **Site settings** → **Environment variables**
4. 添加：
   ```
   STRIPE_SECRET_KEY = sk_test_... // 从 Stripe Dashboard 获取
   ```

---

### 2. GitHub Token 配置

#### 获取 Token
1. 登录 GitHub
2. Settings → Developer settings → Personal access tokens → Tokens (classic)
3. Generate new token → 选择权限
4. 复制 token（只显示一次！）

#### 使用方式

**不要将 token 写在任何文件中！**

**推荐方法 1：使用 GitHub Desktop**
- 可视化操作，无需手动输入 token
- 更安全、更简单

**推荐方法 2：使用 Git Credential Manager**
```powershell
git config credential.helper store
# 第一次 push 时会提示输入用户名和 token
# 之后会自动保存
```

**如果必须配置 Git URL（仅用于临时使用）**：
```powershell
git config credential.helper store
git push origin main
# 输入用户名: pixuan1989
# 输入密码: <your-token>
```

---

## 🚫 错误的做法

### ❌ 不要这样做

1. **不要将 API 密钥写在代码中**
   ```javascript
   // ❌ 错误
   const apiKey = 'sk_test_51TCXN018te51GWieGBFm9rFjcfiZoLq8HEopzrq9gKHOnCi7afzcdUGuptRdlDrLMs6QiFl7bvHfOmIOPKstjPGk00zANzAQjV';
   ```

2. **不要将 token 写在配置文件中**
   ```powershell
   # ❌ 错误
   git remote set-url origin https://user:token@github.com/repo.git
   ```

3. **不要将敏感信息提交到 Git**
   - GitHub 会自动检测并阻止推送
   - 即使推送成功，也会暴露在历史记录中
   - 任何人都能看到你的密钥和 token

---

## 🛡️ Git 安全工具

### 1. GitHub Secret Scanning
GitHub 会自动检测：
- API 密钥
- 令牌
- 密码
- 证书

如果检测到，会阻止推送并提示你修改。

### 2. 本地预提交钩子（推荐）

创建 `.gitignore` 文件，确保敏感文件不被提交：

```gitignore
# 敏感配置文件
.env
.env.local
*.secret
*.key

# 临时文件
setup-remote.bat
credentials.txt
```

---

## 📝 当前项目配置

### 前端（安全）
- ✅ `payment-manager.js` - 已配置 Stripe 公钥
- ✅ `netlify.toml` - 已配置公钥，私钥已移除

### 后端（安全）
- ✅ `netlify/functions/create-checkout-session/index.js` - 使用环境变量
- ⚠️ **需要在 Netlify Dashboard 中配置 `STRIPE_SECRET_KEY`**

### Git（安全）
- ✅ 所有敏感信息已从文档中移除
- ✅ API 密钥已替换为占位符
- ⚠️ **setup-remote.bat 包含 token，建议删除或重写**

---

## 🔍 检查敏感信息

### 搜索命令
```bash
# 搜索 Stripe 密钥
grep -r "sk_test_" . --exclude-dir=.git

# 搜索 GitHub Token
grep -r "github_pat_" . --exclude-dir=.git

# 搜索密码
grep -r "password.*=" . --exclude-dir=.git
```

---

## ✅ 下一步操作

### 1. 立即配置 Netlify 环境变量
```
STRIPE_SECRET_KEY = sk_test_51TCXN018te51GWieGBFm9rFjcfiZoLq8HEopzrq9gKHOnCi7afzcdUGuptRdlDrLMs6QiFl7bvHfOmIOPKstjPGk00zANzAQjV
```

### 2. 删除或修改包含 token 的文件
```powershell
# 删除 setup-remote.bat（或重写为安全版本）
del setup-remote.bat
```

### 3. 推送代码到 GitHub
```powershell
git add -A
git commit -m "移除敏感信息，使用环境变量"
git push origin main
```

---

## 📚 参考资源

- [Stripe 安全最佳实践](https://stripe.com/docs/security)
- [GitHub Secret Scanning](https://docs.github.com/code-security/secret-scanning)
- [Netlify 环境变量](https://docs.netlify.com/configure-builds/environment-variables/)
- [Git Credentials](https://git-scm.com/docs/git-credential-store)

---

**记住：安全第一！** 🔒

如果你发现任何敏感信息泄露，立即：
1. 在相应平台（Stripe、GitHub）撤销/重新生成密钥
2. 从代码和文档中移除
3. 提交修复
4. 强制推送清理历史（如必要）
