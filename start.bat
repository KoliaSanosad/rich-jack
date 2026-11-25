@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Nebesny Kush - server
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Node.js ne ustanovlen. Seichas otkroetsya sait nodejs.org.
  echo  Skachai versiyu LTS, ustanovi, PEREZAGRUZI kompyuter i snova zapusti etot fail.
  start https://nodejs.org
  pause
  exit /b
)
echo  Proveryayu nuzhnye fajly (pri pervom zapuske 1-2 minuty)...
call npm install
echo.
echo  Igra zapuskaetsya. NE ZAKRYVAI eto okno, poka igraesh.
echo  Brauzer otkroetsya sam: http://localhost:5173
echo.
call npx vite --open
pause
