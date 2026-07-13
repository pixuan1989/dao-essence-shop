@echo off
REM DaoEssence 文章选题与发布一键脚本
REM 用法：run_article_pipeline.bat [skip_push]

echo ========================================
echo DaoEssence 文章选题与发布流程
echo ========================================
echo.

REM 步骤 1: 抓取热点
echo [1/4] 抓取国内外热点...
python scripts\topic_scraper.py
if errorlevel 1 (
    echo  热点抓取失败
    pause
    exit /b 1
)
echo.

REM 步骤 2: 生成选题
echo [2/4] 生成候选选题...
python scripts\topic_generator.py
if errorlevel 1 (
    echo ❌ 选题生成失败
    pause
    exit /b 1
)
echo.

REM 步骤 3: 微信推送
if "%1"=="skip_push" (
    echo [3/4] 跳过微信推送（用户选择）
) else (
    echo [3/4] 推送微信通知...
    python scripts\wechat_notify.py
    if errorlevel 1 (
        echo ❌ 微信推送失败
        echo 提示：请检查 scripts\wechat_config.json 配置
        pause
        exit /b 1
    )
)
echo.

REM 步骤 4: 等待用户确认
echo [4/4] 等待用户确认选题...
echo.
echo 请查看微信消息，回复数字确认选题
echo 或直接在此输入选题编号（1-5）:
set /p choice=

if "%choice%"=="" (
    echo  未选择选题，流程取消
    pause
    exit /b 1
)

echo.
echo ✅ 已选择选题 %choice%
echo 接下来 AI 将自动写作...
echo.
echo 请在 Qwen Code 中继续对话，AI 会根据你的选择开始写作

pause
