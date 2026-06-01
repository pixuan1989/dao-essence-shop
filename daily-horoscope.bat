@echo off
chcp 65001 >nul
set LOG=C:\Users\agenew\Desktop\DaoEssence1.0\logs\daily-horoscope.log
if not exist "C:\Users\agenew\Desktop\DaoEssence1.0\logs" mkdir "C:\Users\agenew\Desktop\DaoEssence1.0\logs"

echo [%date% %time%] DaoEssence Daily Horoscope Start >> "%LOG%"
cd /d "C:\Users\agenew\Desktop\DaoEssence1.0"

node scripts/daily-run-auto.js >> "%LOG%" 2>&1
set ERR=%ERRORLEVEL%

if %ERR% NEQ 0 (
  echo [%date% %time%] ERROR: exit code %ERR% >> "%LOG%"
) else (
  echo [%date% %time%] SUCCESS >> "%LOG%"
)
echo [%date% %time%] DaoEssence Daily Horoscope End >> "%LOG%"
