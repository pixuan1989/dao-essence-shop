@echo off
chcp 65001 >nul
echo [%date% %time%] DaoEssence Daily Horoscope Start
cd /d "C:\Users\agenew\Desktop\DaoEssence1.0"
node scripts/daily-run-auto.js
echo [%date% %time%] DaoEssence Daily Horoscope End
