@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo    NEXCARE Backend Configuration
echo ===================================================
echo.
echo This tool configures the Flask backend server URL
echo for sensor data (Arduino integration).
echo.
pause

powershell.exe -ExecutionPolicy Bypass -File "%~dp0configure-backend.ps1"

pause
