@echo off
REM ============================================================
REM  GymIQ - React Frontend Run Script
REM ============================================================

echo.
echo  ================================================
echo   GymIQ Dashboard (React Frontend)
echo  ================================================
echo.

echo [>>] Starting React dashboard at http://localhost:5173
echo      Press CTRL+C to stop.
echo.

cd /d %~dp0\frontend
"C:\Program Files\nodejs\npm.cmd" run dev

