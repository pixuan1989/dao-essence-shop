# 每日生肖运势生成 - 执行记忆

## 配置（2026-05-21 修正）

- **脚本路径**: `C:/Users/agenew/Desktop/DaoEssence1.0/scripts/daily-run-auto.js`
  - ⚠️ **必须调用 daily-run-auto.js（不是 daily-run.js）**
  - daily-run-auto.js 会自动设置 `AUTO_DEPLOY=true`，确保自动 push 部署
  - 如果调用 daily-run.js，则不会自动 push，需要手动执行
- **执行时间**: 每日 02:00（东八区 / Asia/Shanghai）
- **日期参数**: 留空则自动使用当日日期（脚本内部用 Asia/Shanghai 时区计算）
- **提交消息格式**: `chore: YYYY-MM-DD daily horoscope update + rebuild`

## 最近执行记录

### 2026-05-19 07:00 (自动化执行)
- **生成日期**: 2026-05-18
- **生成状态**: ✅ 成功
- **生肖运势**: 12生肖全部生成（中英文）
- **黄历信息**: 干支壬午（水），冲子，六合未
- **文件变更**:
  - `zodiac/js/zodiac-data.js` (已更新)
  - `zodiac/seo-content/2026-05-18.json` (已创建)
- **Git 提交**: ✅ 成功 (commit: "chore: 2026-05-18 daily horoscope update")
- **Push 状态**: ⏸️ 等待用户手动 push（因为调用了 daily-run.js 而非 daily-run-auto.js）
- **执行方式**: 自动化任务 (automation-7)

## 注意事项

- **关键**：必须调用 `daily-run-auto.js`，不是 `daily-run.js`
- 如果调用错误的脚本，commit 会成功但 push 不会执行，线上永远是旧版本
- 脚本会发送失败通知（push 失败/文件缺失/generate 失败）
- GitHub Actions 有 fallback 机制（每日 02:00 UTC = 10:00 北京时间），如果 WorkBuddy 失败会自动补上
