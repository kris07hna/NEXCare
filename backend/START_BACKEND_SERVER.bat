@echo off
REM ===================================================================
REM NEXCARE-5G Backend Server Startup Script
REM ===================================================================
REM This script starts the professional backend server with proper
REM configuration and monitoring
REM Last Updated: 2026-02-08
REM ===================================================================

SETLOCAL EnableDelayedExpansion

COLOR 0B
CLS
echo ========================================
echo  NEXCARE-5G Backend Server Startup
echo ========================================
echo.

REM Check if running in correct directory
if not exist "backend\app.py" (
    echo [ERROR] Please run this from the edge-server2 directory!
    echo Current directory: %CD%
    pause
    exit /b 1
)

REM Navigate to backend directory
cd backend

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
pip show flask >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Dependencies not installed
    echo [INFO] Installing dependencies...
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
    echo [IMPORTANT] Please edit .env file with your settings!
    echo Press any key to continue or Ctrl+C to exit and configure...
    pause >nul
)
echo [OK] Configuration file exists
echo.

echo [STEP 5] Creating directories...
if not exist "logs" mkdir logs
if not exist "data" mkdir data
if not exist "uploads" mkdir uploads
echo [OK] Directories ready
echo.

echo [STEP 6] Checking firewall rules...
powershell -Command "Get-NetFirewallRule -DisplayName '*NeoCare*' -ErrorAction SilentlyContinue" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Firewall rules may not be configured
    echo [INFO] Run: setup-firewall-server.ps1 as Administrator
) else (
    echo [OK] Firewall rules exist
)
echo.

echo ========================================
echo  Starting Backend Server
echo ========================================
echo.
echo Server will start on: http://0.0.0.0:5000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
python app.py

REM If server stops
echo.
echo ========================================
echo  Server Stopped
echo ========================================
echo.
pause
