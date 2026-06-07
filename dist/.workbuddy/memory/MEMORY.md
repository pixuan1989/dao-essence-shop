# MEMORY.md - DaoEssence 项目长期记忆

## 壁纸模块 i18n 修复注意事项（2026-06-07）

### ⚠️ 坑：`build-blog.js` 会覆盖 `dist/` 中的手动修改

**问题现象**：
修改 `generate-wallpapers.cjs` 的 `CAT_NAME_ZH` 映射表后，重新生成页面之前，`dist/` 里已有文件。
如果手动修改 `dist/wallpaper/*/index.zh.html` 后跑 `build-blog.js`，修改会被覆盖。

**正确流程**：
1. 修改 `scripts/generate-wallpapers.cjs`（添加/修改 `CAT_NAME_ZH` 映射）
2. 跑 `node scripts/generate-wallpapers.cjs --id=XXX`（重新生成目标页面）
3. 跑 `node build-blog.js`（更新 sitemap）
4. **最后**再手动修 `dist/wallpaper/*/index.zh.html`（如果还有漏网之鱼）
5. `git add -f dist/` + `git commit` + 手动 push

**原因**：
- `build-blog.js` 会重新生成 `dist/wallpaper/*/index.zh/` 目录
- `dist/` 在 `.gitignore` 中，需要用 `git add -f` 强制添加

**教训**：
- 每次 `build-blog.js` 后必须检查 `index.zh/` 目录并删除（已加入流程）
- i18n 修复如果涉及 `CAT_NAME_ZH`，必须重跑 `generate-wallpapers.cjs --id=XXX`，不能只手动改 HTML

---

## 壁纸上线流程（重要 · 已锁定）

> ⚠️ **此流程已锁定，无重大问题不得随意改动。**

**触发词**：用户说"新壁纸上線了" → 自动执行以下流程并 **自动 push**（此为例外，其余功能仍须手动 push）

1. 检查 `wallpapers.json` 里是否有缺少 `slug` 或静态页未生成的新壁纸
   - 用 `python -c "import json; data=json.load(open('wallpapers.json', encoding='utf-8')); [print(w['id'], w.get('slug','MISSING')) for w in data if not w.get('slug')]"` 找缺失 slug 的壁纸
   - 手动给新壁纸设定 slug（参考现有格式：`energy-flower-wallpaper-heart-shaped-bloom-etheric-vibration`）
   - 更新 `wallpapers.json`，给新壁纸加 `slug` 字段
2. 用 `node scripts/generate-wallpapers.cjs --id=XXX` 只生成新壁纸（**永远不用 `--all`**）
3. **验证（必须做）**：检查新生成的页面中无脏内链
   ```
   grep -rPh 'href="/zh/(shop|learn-bazi|favorable-element|five-elements-test|soulmate-calculator|almanac)"' dist/wallpaper/XXX/ 2>/dev/null
   ```
   如果有输出 = 有脏内链，不能 push，先排查
4. **回测 SEO 问题（必须做，已锁定）**：
   ```
   # 4.1 检查新页面脏内链（/zh/ 前缀）
   grep -rl 'href="/zh/' dist/wallpaper/XXX/ 2>/dev/null
   # 4.2 检查新页面脏内链（.html 后缀）
   grep -rl 'href=".*\.html"' dist/wallpaper/XXX/ 2>/dev/null
   # 4.3 检查 vercel.json redirects 是否有重复
   node -e "const v=require('./vercel.json'); const s=new Set(); const d=[]; v.redirects.forEach(r=>{ if(s.has(r.source)) d.push(r.source); else s.add(r.source); }); console.log('Duplicate redirects:', d.length>0?d:'None');"
   # 4.4 检查 dist/ 是否有旧的 index.zh 目录（重复内容）
   find dist/wallpaper -type d -name "index.zh" | wc -l
   # 4.5 检查 sitemap.xml 是否包含新页面 URL
   grep -c '<loc>' dist/sitemap.xml
   grep '新slug' dist/sitemap.xml
   # 4.6 抽查新页面 meta 标签（canonical、og:url、og:image）
   grep -E 'canonical|og:url|og:image' dist/wallpaper/XXX/index.html | head -6
   # 4.7 检查新页面是否有重定向迹象（本地分析，sandbox 无法 curl）
   python -c "
   import re
   filepath='wallpaper/新slug/index.html'
   with open(filepath,'r',encoding='utf-8') as f: content=f.read()
   # Check meta refresh
   if re.search(r'<meta[^>]+http-equiv=[\"']refresh[\"']', content, re.I): print('FAIL: meta refresh redirect')
   # Check JS redirect (exclude search/i18n navigation)
   js = re.findall(r'location\.(replace|href)\s*=\s*([^;]+)', content)
   for m, t in js:
       if 'encodeURIComponent' not in t and 'input.value' not in t and 'lang' not in t and 'i18n' not in t:
           print(f'FAIL: JS redirect: location.{m} = {t.strip()}')
   # Check canonical
   c=re.search(r'<link rel=[\"']canonical[\"'] href=[\"']([^\"']+)[\"']', content)
   if c and c.group(1)!='https://www.daoessentia.com/wallpaper/新slug': print(f'FAIL: canonical mismatch: {c.group(1)}')
   print('4.7 PASS')
   "
   # 4.8 检查 vercel.json 中是否有重定向链（A→B→C）
   python -c "import json; v=json.load(open('vercel.json')); d={r['source']:r['destination'] for r in v['redirects']}; chains=[s for s in d if d[s] in d]; print('Redirect chains found:', chains if chains else 'None')"
   # 4.9 检查新页面内链是否命中 vercel.json redirect（排除 catch-all 和外部重定向）
   python -c "
   import json, re
   with open('vercel.json','r',encoding='utf-8') as f: v=json.load(f)
   patterns=[]
   for r in v['redirects']:
       if r['source']=='/(.*)' or r['destination'].startswith('http'): continue
       src=r['source']; regex='^'+src.replace('/','\/').replace('\/:id','/[^/]+').replace('\/*','/.*')+'$'
       patterns.append((src, re.compile(regex), r['destination']))
   with open('wallpaper/新slug/index.html','r',encoding='utf-8') as f: content=f.read()
   hrefs=re.findall(r'href=\"(/[^\"]+)\"', content)
   dirty=[]
   for href in hrefs[:20]:
       for src,pat,dst in patterns:
           if pat.match(href): dirty.append((href,src,dst)); break
   print(f'Dirty links: {len(dirty)}')
   for h,s,d in dirty[:5]: print(f'  {h} -> {s} -> {d}')
   print('4.9 PASS' if len(dirty)==0 else '4.9 FAIL')
   "
   ```
   所有检查必须通过，不通过不 push
5. 跑 `node build-blog.js` 更新 sitemap（增量，不会重跑旧壁纸）
   - **必须清理**：`build-blog.js` 会重新生成 `dist/wallpaper/*/index.zh/` 目录，造成重复内容，**每次跑完后必须删除**：
     ```bash
     find dist/wallpaper -type d -name "index.zh" -exec rm -rf {} + 2>/dev/null
     ```
6. 验证新壁纸已在 `dist/sitemap.xml` 中
7. `git add` + `git commit` + **`git push`**（自动 push，壁纸模块例外）
8. 去 GSC 手动提交新 URL
9. **部署后自动线上检查（必须做，已锁定）**：
   ```
   # 9.1 等待 Vercel 部署完成（1-2 分钟）
   # 9.2 用 WebFetch 检查新页面是否可访问（canonical URL 是否正确）
   #      如果能访问且 canonical 匹配，说明无重定向问题
   # 9.3 在 Ahrefs 重新跑站点审计（用户手动或提醒用户）
   # 9.4 检查 Google Search Console 是否收录新 URL
   ```
   所有检查必须通过，不通过需排查

**铁律**：
- ✅ 只用 `--id=XXX` 单张生成，永远不用 `--all`
- ✅ 每次必须做 Step 3 脏内链检查，不检查不 push
- ✅ `build-blog.js` Step 7.6 和 Step 9 已改为增量，只处理新增壁纸
- ✅ 如果用户脚本已自动 push，则只跑 SEO 再追加 push
- ❌ 不得随意改动 `generate-wallpapers.cjs` 的链接生成逻辑
- ❌ 不得随意改动 `build-blog.js` 的 zh 页链接处理逻辑

**已知修复记录（不要回退）**：
- `generate-wallpapers.cjs`：已移除 14 处 `(isZh ? 'zh/' : '')` 前缀逻辑（2026-06-04）
- `build-blog.js`：已删除 `zhToolPaths` 块（2026-06-04）；已补 `og:url` 替换（2026-06-06）
- `vercel.json`：所有 redirect 已补全带斜杠版本；重定向链已压平（2026-06-04）
