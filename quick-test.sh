@echo off
echo ========================================
echo Stripe Webhook Quick Test
echo DAO Essence Shop
echo ========================================
echo.

echo [1/4] Checking dependencies...
call npm list stripe express cors dotenv >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing dependencies...
    call npm install stripe express cors dotenv
) else (
    echo Dependencies installed.
)

echo.
echo [2/4] Checking environment variables...
if not exist .env (
    echo Creating .env file...
    echo STRIPE_SECRET_KEY=sk_test_xxxxxx > .env
    echo STRIPE_WEBHOOK_SECRET=whsec_xxxxxx >> .env
    echo PORT=3001 >> .env
    echo NODE_ENV=development >> .env
    echo WARNING: Please update STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in .env
) else (
    echo .env file found.
)

echo.
echo [3/4] Testing server startup...
timeout /t 2 >nul
start /min cmd /c "node server.js"
timeout /t 3 >nul
echo Server started in background.

echo.
echo [4/4] Testing health check...
curl http://localhost:3001/api/health
if %errorlevel% equ 0 (
    echo.
    echo Server is running!
) else (
    echo Server might not be running. Please check the logs.
)

echo.
echo ========================================
echo Quick Test Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Update .env with your Stripe keys
echo 2. Run: node test-webhook.js test
echo 3. Or run: npm start (to start server)
echo.
echo For more information, see WEBHOOK_DEPLOYMENT_GUIDE.md
echo.
