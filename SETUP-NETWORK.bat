@echo off
REM NEXCARE-5G Quick Network Setup
REM Double-click this file to configure your laptop for the network

echo.
echo ===================================================
echo    NEXCARE-5G Network Setup
echo ===================================================
echo.
echo This will help you connect your laptop to the 
echo NEXCARE-5G system through mobile hotspot.
echo.
pause

PowerShell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-network.ps1"

pause
