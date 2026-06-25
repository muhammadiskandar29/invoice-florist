@echo off
title Invoice Toko Bunga - Server
color 0A
echo.
echo  ================================================
echo   🌹 INVOICE TOKO BUNGA - Starting Server...
echo  ================================================
echo.
echo  Buka browser di: http://localhost:3000
echo  Tekan CTRL+C untuk stop server.
echo.
"C:\Program Files\nodejs\node.exe" "%~dp0node_modules\next\dist\bin\next" dev --port 3000
pause
