@echo off
REM ===================================================================
REM NEXCARE-5G CONNECTION DIAGNOSTIC AND FIX TOOL
REM ===================================================================
REM This script diagnoses and fixes connection issues
REM Run as Administrator
REM ===================================================================

SETLOCAL EnableDelayedExpansion

COLOR 0E
cls

echo ============================================================
echo  NEXCARE-5G CONNECTION DIAGNOSTIC ^& FIX TOOL
echo ============================================================
echo.
echo This will:
echo   1. Check firewall configuration
echo   2. Test network connectivity
echo   3. Verify server is running
echo   4. Configure missing settings
echo   5. Test connections from friends' laptops
echo.
pause

REM Check admin rights
net session >nul 2>&1
if %errorLevel% NEQ 0 (
    COLOR 0C
    echo.
    echo [ERROR] This script requires Administrator privileges!
    echo.
    echo Right-click this file and select "Run as Administrator"
    echo.
    pause
    exit /b 1
)

COLOR 0B

echo.
echo ============================================================
echo  STEP 1: CHECKING FIREWALL RULES
echo ============================================================
echo.

powershell -Command "Get-NetFirewallRule -DisplayName '*NeoCare*' -ErrorAction SilentlyContinue" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Firewall rules NOT found!
    echo [ACTION] Creating firewall rules...
    echo.
    
    REM Run firewall setup scripts
    if exist "backend\setup-firewall-server.ps1" (
        powershell -ExecutionPolicy Bypass -File backend\setup-firewall-server.ps1
        echo [OK] Server firewall configured
    ) else (
        echo [WARNING] Server firewall script not found
    )
    
    echo.
) else (
    echo [OK] Firewall rules exist
    powershell -Command "Get-NetFirewallRule -DisplayName '*NeoCare*' | Select-Object DisplayName, Enabled | Format-Table -AutoSize"
)

echo.
echo ============================================================
echo  STEP 2: CHECKING YOUR IP ADDRESS
echo ============================================================
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4 Address" ^| findstr "10\."') do (
    set SERVER_IP=%%a
    set SERVER_IP=!SERVER_IP:~1!
)

if defined SERVER_IP (
    echo [OK] Your Server IP: !SERVER_IP!
) else (
    echo [WARNING] Could not detect IP on 10.x.x.x network
    for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4 Address" ^| findstr /V "127\.0\.0\.1"') do (
        set SERVER_IP=%%a
        set SERVER_IP=!SERVER_IP:~1!
        echo [INFO] Found IP: !SERVER_IP!
    )
)

echo.
echo IMPORTANT: Friends must use this IP in their .env file:
echo   EDGE_SERVER_HOST=!SERVER_IP!
echo.

echo.
echo ============================================================
echo  STEP 3: CHECKING IF SERVERS ARE RUNNING
echo ============================================================
echo.

REM Check if Next.js is running
netstat -ano | findstr ":3000 " >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Next.js server NOT running on port 3000
    echo [ACTION] You need to start: npm run dev
) else (
    echo [OK] Next.js server is running on port 3000
)

REM Check if Flask backend is running
netstat -ano | findstr ":5000 " >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Flask backend NOT running on port 5000
    echo [ACTION] You need to start: python backend/app.py
) else (
    echo [OK] Flask backend is running on port 5000
)

echo.
echo ============================================================
echo  STEP 4: TESTING PORT ACCESSIBILITY
echo ============================================================
echo.

echo Testing if ports are accessible from network...
echo.

REM Test port 3000
powershell -Command "Test-NetConnection -ComputerName !SERVER_IP! -Port 3000 -WarningAction SilentlyContinue" | findstr "TcpTestSucceeded" >nul 2>&1
if errorlevel 1 (
    echo [FAIL] Port 3000 is NOT accessible
) else (
    echo [OK] Port 3000 is accessible
)

REM Test port 5000
powershell -Command "Test-NetConnection -ComputerName !SERVER_IP! -Port 5000 -WarningAction SilentlyContinue" | findstr "TcpTestSucceeded" >nul 2>&1
if errorlevel 1 (
    echo [FAIL] Port 5000 is NOT accessible
) else (
    echo [OK] Port 5000 is accessible
)

echo.
echo ============================================================
echo  STEP 5: ENABLING NETWORK DISCOVERY
echo ============================================================
echo.

powershell -Command "Set-NetFirewallRule -DisplayGroup 'Network Discovery' -Enabled True -Profile Private"
echo [OK] Network Discovery enabled for Private networks

powershell -Command "Set-NetFirewallRule -DisplayGroup 'File and Printer Sharing' -Enabled True -Profile Private"
echo [OK] File and Printer Sharing enabled

echo.
echo ============================================================
echo  STEP 6: CHECKING NEXT.JS CONFIGURATION
echo ============================================================
echo.

if exist "package.json" (
    findstr "0.0.0.0" package.json >nul 2>&1
    if errorlevel 1 (
        echo [WARNING] Next.js might not be listening on all interfaces
        echo [INFO] Check that your dev script uses: next dev -H 0.0.0.0
    ) else (
        echo [OK] Next.js configured to listen on all interfaces
    )
) else (
    echo [WARNING] package.json not found
)

echo.
echo ============================================================
echo  STEP 7: CREATING FRIEND LAPTOP SETUP INSTRUCTIONS
echo ============================================================
echo.

echo Creating instructions for friends...

(
echo ============================================================
echo  SETUP INSTRUCTIONS FOR FRIEND'S LAPTOP
echo ============================================================
echo.
echo Your friend needs to do this on THEIR laptop:
echo.
echo 1. Navigate to ai_agents folder
echo    cd ai_agents
echo.
echo 2. Copy environment file
echo    copy .env.example .env
echo.
echo 3. Edit .env file with these settings:
echo    EDGE_SERVER_HOST=!SERVER_IP!
echo    EDGE_SERVER_PORT=3000
echo    EDGE_SERVER_URL=http://!SERVER_IP!:3000
echo.
echo    BACKEND_SERVER_HOST=!SERVER_IP!
echo    BACKEND_SERVER_PORT=5000
echo    BACKEND_SERVER_URL=http://!SERVER_IP!:5000
echo.
echo    ROOM_ID=R3 ^(or R4, R5... unique for each friend^)
echo    PATIENT_ID=P003 ^(or P004, P005...^)
echo    AGENT_ID=neocare-agent-003 ^(unique ID^)
echo.
echo 4. Run firewall setup AS ADMINISTRATOR
echo    .\setup-firewall-agent.ps1
echo.
echo 5. Test connection
echo    python network_tester.py --server !SERVER_IP!
echo.
echo 6. Start the agent
echo    python neocare_agent.py
echo.
echo ============================================================
) > FRIEND_SETUP_INSTRUCTIONS.txt

echo [OK] Instructions saved to: FRIEND_SETUP_INSTRUCTIONS.txt

echo.
echo ============================================================
echo  DIAGNOSTIC SUMMARY
echo ============================================================
echo.
echo Server IP: !SERVER_IP!
echo.
echo CHECKLIST FOR THIS COMPUTER ^(Server^):
echo [ ] Firewall rules created
echo [ ] Next.js running: npm run dev
echo [ ] Flask backend running: python backend/app.py
echo [ ] Ports 3000 and 5000 accessible
echo.
echo CHECKLIST FOR FRIEND'S LAPTOP:
echo [ ] .env file configured with SERVER_IP: !SERVER_IP!
echo [ ] Firewall configured: setup-firewall-agent.ps1
echo [ ] Network connection tested: network_tester.py
echo [ ] Can ping your server: ping !SERVER_IP!
echo.
echo QUICK TEST COMMAND FOR FRIEND:
echo   curl http://!SERVER_IP!:3000
echo   curl http://!SERVER_IP!:5000/sensor_data
echo.
echo ============================================================
echo.

pause

echo.
echo Do you want to test server accessibility now? ^(Y/N^)
set /p TEST_NOW=

if /i "%TEST_NOW%"=="Y" (
    echo.
    echo Testing HTTP endpoints...
    echo.
    
    curl -s http://localhost:3000 >nul 2>&1
    if errorlevel 1 (
        echo [FAIL] Cannot reach Next.js on localhost:3000
    ) else (
        echo [OK] Next.js responds on localhost:3000
    )
    
    curl -s http://localhost:5000/sensor_data >nul 2>&1
    if errorlevel 1 (
        echo [FAIL] Cannot reach Flask on localhost:5000
    ) else (
        echo [OK] Flask responds on localhost:5000
    )
    
    curl -s http://!SERVER_IP!:3000 >nul 2>&1
    if errorlevel 1 (
        echo [FAIL] Cannot reach Next.js on network IP
    ) else (
        echo [OK] Next.js accessible from network
    )
)

echo.
echo ============================================================
echo  NEXT STEPS
echo ============================================================
echo.
echo 1. Make sure both servers are running:
echo    - Terminal 1: npm run dev
echo    - Terminal 2: python backend/app.py
echo.
echo 2. Share FRIEND_SETUP_INSTRUCTIONS.txt with your friends
echo.
echo 3. Friends must be on the SAME NETWORK ^(same Wi-Fi^)
echo.
echo 4. If still not working:
echo    - Turn off Windows Firewall temporarily to test
echo    - Check router settings ^(no AP isolation^)
echo    - Ensure antivirus isn't blocking
echo.
pause
