@echo off
REM ===================================================================
REM NEXCARE-5G AI Agent Startup Script
REM ===================================================================
REM This script starts the AI agent with proper configuration
REM Last Updated: 2026-02-08
REM ===================================================================

SETLOCAL EnableDelayedExpansion

COLOR 0A
CLS
echo ========================================
echo  NEXCARE-5G AI Agent Startup
echo ========================================
echo.

REM Check if running in correct directory
if not exist "ai_agents\neocare_agent.py" (
    echo [ERROR] Please run this from the edge-server2 directory!
    echo Current directory: %CD%
    pause
    exit /b 1
)

REM Navigate to ai_agents directory
cd ai_agents

echo [STEP 1] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found!
    echo Please install Python 3.8+ from https://www.python.org
    pause
    exit /b 1
)
python --version
echo [OK] Python found
echo.

echo [STEP 2] Checking virtual environment...
if exist "venv\Scripts\activate.bat" (
    echo [OK] Virtual environment found
    call venv\Scripts\activate.bat
) else (
    echo [WARNING] Virtual environment not found
    echo [INFO] Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
    echo [OK] Virtual environment created
)
echo.

echo [STEP 3] Checking dependencies...
pip show opencv-python >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Dependencies not installed
    echo [INFO] Installing dependencies (this may take 5-10 minutes)...
    pip install -r requirements.txt
    echo [OK] Dependencies installed
) else (
    echo [OK] Dependencies already installed
)
echo.

echo [STEP 4] Checking configuration...
if not exist ".env" (
    echo [WARNING] .env file not found!
    echo [INFO] Creating from .env.example...
    copy .env.example .env
    echo.
    echo ========================================
    echo  IMPORTANT CONFIGURATION REQUIRED!
    echo ========================================
    echo.
    echo Please edit .env file with:
    echo   - EDGE_SERVER_HOST (your server IP)
    echo   - ROOM_ID (assigned room)
    echo   - PATIENT_ID (patient ID)
    echo   - ARDUINO_PORT (if using Arduino)
    echo.
    echo Press any key to continue or Ctrl+C to exit and configure...
    pause >nul
)
echo [OK] Configuration file exists
echo.

echo [STEP 5] Creating directories...
if not exist "logs" mkdir logs
if not exist "data" mkdir data
if not exist "data\offline_reports" mkdir data\offline_reports
if not exist "models" mkdir models
echo [OK] Directories ready
echo.

echo [STEP 6] Checking camera...
python -c "import cv2; cap = cv2.VideoCapture(0); print('[OK] Camera accessible' if cap.isOpened() else '[WARNING] Camera not detected'); cap.release()" 2>nul
if errorlevel 1 (
    echo [WARNING] Cannot test camera (OpenCV not fully installed)
)
echo.

echo [STEP 7] Testing server connection...
python -c "from agent_config import AgentConfig; import requests; r = requests.get(f'{AgentConfig.EDGE_SERVER_URL}/api/health', timeout=2); print('[OK] Server reachable')" 2>nul
if errorlevel 1 (
    echo [WARNING] Cannot reach Edge Server
    echo [INFO] Agent will run in offline mode
)
echo.

echo ========================================
echo  Starting AI Agent
echo ========================================
echo.
echo Press 'q' in the video window to quit
echo Or press Ctrl+C in this terminal
echo.

REM Start the agent
python neocare_agent.py

REM If agent stops
echo.
echo ========================================
echo  AI Agent Stopped
echo ========================================
echo.
pause
