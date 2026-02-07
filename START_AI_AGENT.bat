@echo off
REM NeoCare AI Agent Startup Script
REM This laptop will send AI data to the central edge server

echo ==================================================
echo    NeoCare AI Agent - Quick Start
echo ==================================================
echo.
echo This will start the AI monitoring system.
echo Data will be sent to: http://10.107.51.130:3000
echo.
echo Make sure:
echo  1. Arduino is connected to COM6
echo  2. Webcam is available
echo  3. Central server is running on the other laptop
echo.
pause

cd ai_agents
python -u neocare_agent.py

pause
