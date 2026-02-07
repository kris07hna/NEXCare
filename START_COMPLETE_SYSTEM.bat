@echo off
REM NeoCare Complete System Startup
REM Runs AI Agent + Local Dashboard connected to Edge Server

echo ==================================================
echo    NeoCare Complete System - Starting
echo ==================================================
echo.
echo This will start:
echo  1. AI Agent (sends data to edge server)
echo  2. Local Dashboard (connects to edge server for WebRTC)
echo.
echo Edge Server: http://10.107.51.130:3000
echo Local Dashboard will be at: http://localhost:3000
echo.
echo Make sure:
echo  - Arduino is connected to COM6
echo  - Webcam is available
echo  - Central edge server is running
echo.
pause

echo.
echo [1/2] Starting AI Agent in background...
start "NeoCare AI Agent" cmd /k "cd ai_agents && python -u neocare_agent.py"

timeout /t 3 /nobreak

echo [2/2] Starting Local Dashboard...
echo.
echo Dashboard will open at: http://localhost:3000
echo.

REM Set execution policy for this session
PowerShell.exe -NoProfile -ExecutionPolicy Bypass -Command "npm run dev"

pause
