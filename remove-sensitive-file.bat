@echo off
echo 正在从 Git 仓库中移除 setup-remote.bat...
cd /d "c:\Users\agenew\Desktop\DaoEssence"
git rm --cached setup-remote.bat
echo.
echo 已将 setup-remote.bat 从 Git 跟踪中移除！
echo 请在 GitHub Desktop 中查看更改并提交。
pause
