# AI Agent Quick Start Script
# Run this on laptops running AI agents (NeoCare/GeriCare)

param(
    [Parameter(Mandatory=$false)]
    [string]$ServerIP = "",
    
    [Parameter(Mandatory=$false)]
    [string]$RoomID = "R2",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("NeoCare", "GeriCare")]
    [string]$AgentType = "NeoCare"
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  NEXCARE-5G AI Agent Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Get server IP
if ($ServerIP -eq "") {
    Write-Host "Enter Central Server IP Address:" -ForegroundColor Yellow
    Write-Host "(Example: 192.168.43.10)" -ForegroundColor Gray
    $ServerIP = Read-Host "Server IP"
}

# Step 2: Test connectivity to server
Write-Host ""
Write-Host "[1/4] Testing connection to server..." -ForegroundColor Yellow
Write-Host "    Server: $ServerIP" -ForegroundColor Gray

try {
    $pingResult = Test-Connection -ComputerName $ServerIP -Count 2 -Quiet
    if ($pingResult) {
        Write-Host "    ✓ Server is reachable" -ForegroundColor Green
    } else {
        Write-Host "    ✗ Cannot ping server!" -ForegroundColor Red
        Write-Host "    Make sure you're connected to the same hotspot" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "    ✗ Network error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test HTTP connection
try {
    $response = Invoke-WebRequest -Uri "http://${ServerIP}:3000/api/health" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "    ✓ Server API is responding" -ForegroundColor Green
    }
} catch {
    Write-Host "    ✗ Cannot reach server API!" -ForegroundColor Red
    Write-Host "    Make sure the server is running (npm start)" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 3: Configure agent
Write-Host "[2/4] Configuring AI agent..." -ForegroundColor Yellow
Write-Host "    Agent Type: $AgentType" -ForegroundColor Gray
Write-Host "    Room ID: $RoomID" -ForegroundColor Gray

$envContent = @"
# AI Agent Configuration
# Auto-generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Server Configuration
EDGE_SERVER_URL=http://${ServerIP}:3000

# Agent Configuration
ROOM_ID=$RoomID
MODULE=${AgentType}-AI
CONFIDENCE_THRESHOLD=0.75
ALERT_THRESHOLD=3
CHECK_INTERVAL=2
MAX_RETRIES=5

# Logging
LOG_LEVEL=INFO
"@

Set-Content -Path ".env" -Value $envContent
Write-Host "    ✓ Created .env configuration" -ForegroundColor Green
Write-Host ""

# Step 4: Check Python
Write-Host "[3/4] Checking Python environment..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "    ✓ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "    ✗ Python not found!" -ForegroundColor Red
    Write-Host "    Please install Python 3.9+ from https://python.org" -ForegroundColor Red
    exit 1
}

# Check virtual environment
if (Test-Path "venv") {
    Write-Host "    ✓ Virtual environment exists" -ForegroundColor Green
} else {
    Write-Host "    ⚠  Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "    ✓ Virtual environment created" -ForegroundColor Green
}

# Check if activated
$venvPython = ".\venv\Scripts\python.exe"
if (Test-Path $venvPython) {
    Write-Host "    ✓ Virtual environment ready" -ForegroundColor Green
} else {
    Write-Host "    ⚠  Virtual environment setup incomplete" -ForegroundColor Yellow
}

Write-Host ""

# Step 5: Display instructions
Write-Host "[4/4] Setup complete!" -ForegroundColor Yellow
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Next Steps:" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣  Activate virtual environment:" -ForegroundColor White
Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor Yellow
Write-Host ""

Write-Host "2️⃣  Install dependencies (first time only):" -ForegroundColor White
Write-Host "   pip install -r requirements.txt" -ForegroundColor Yellow
Write-Host ""

Write-Host "3️⃣  Run the AI agent:" -ForegroundColor White
if ($AgentType -eq "NeoCare") {
    Write-Host "   python neocare_agent.py --room $RoomID --server http://${ServerIP}:3000" -ForegroundColor Yellow
} else {
    Write-Host "   python gericare_agent.py --room $RoomID --server http://${ServerIP}:3000" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "📊 Monitor on server dashboard:" -ForegroundColor White
Write-Host "   http://${ServerIP}:3000" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚡ Quick Start Command:" -ForegroundColor White
Write-Host "   .\venv\Scripts\Activate.ps1; " -NoNewline -ForegroundColor Yellow
if ($AgentType -eq "NeoCare") {
    Write-Host "python neocare_agent.py --room $RoomID" -ForegroundColor Yellow
} else {
    Write-Host "python gericare_agent.py --room $RoomID" -ForegroundColor Yellow
}
Write-Host ""

# Save configuration
$configInfo = @"
Server IP: $ServerIP
Server URL: http://${ServerIP}:3000
Agent Type: $AgentType
Room ID: $RoomID
Configured: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@

Set-Content -Path "AGENT_CONFIG.txt" -Value $configInfo
Write-Host "💾 Configuration saved to AGENT_CONFIG.txt" -ForegroundColor Green
Write-Host ""

# Offer to activate and run
$autoRun = Read-Host "Activate venv and start agent now? (y/n)"
if ($autoRun -eq "y" -or $autoRun -eq "Y") {
    Write-Host ""
    Write-Host "Activating virtual environment and starting agent..." -ForegroundColor Green
    Write-Host ""
    
    # Activate venv and run agent
    & .\venv\Scripts\Activate.ps1
    
    if ($AgentType -eq "NeoCare") {
        python neocare_agent.py --room $RoomID --server "http://${ServerIP}:3000"
    } else {
        python gericare_agent.py --room $RoomID --server "http://${ServerIP}:3000"
    }
}
