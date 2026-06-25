@echo off
title Invoice - Build Production
color 0E
echo.
echo  ================================================
echo   🌹 Building untuk Production / Vercel...
echo  ================================================
echo.
"C:\Program Files\nodejs\node.exe" "%~dp0node_modules\next\dist\bin\next" build
echo.
echo  Build selesai!
pause
