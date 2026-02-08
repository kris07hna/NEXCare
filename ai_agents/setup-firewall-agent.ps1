# ===================================================================
# NEXCARE-5G AI AGENT (LAPTOP) - FIREWALL CONFIGURATION
# ===================================================================
# This script configures Windows Firewall for AI Agent Laptops
# Run as Administrator
# Last Updated: 2026-02-08
# ===================================================================

#Requires -RunAsAdministrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " NEXCARE-5G AI Agent Firewall Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$APP_NAME = "NeoCare-AI-Agent"
$PYTHON_PATH = (Get-Command python -ErrorAction SilentlyContinue).Source

if (-not $PYTHON_PATH) {
    Write-Host "[ERROR] Python not found in PATH!" -ForegroundColor Red
    Write-Host "Please install Python or ensure it's in your PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host "[INFO] Python found at: $PYTHON_PATH" -ForegroundColor Green
Write-Host ""

# ===== REMOVE EXISTING RULES =====
Write-Host "[STEP 1] Removing existing firewall rules..." -ForegroundColor Yellow

$existingRules = Get-NetFirewallRule -DisplayName "*NeoCare-AI*" -ErrorAction SilentlyContinue
if ($existingRules) {
    Remove-NetFirewallRule -DisplayName "*NeoCare-AI*" -ErrorAction SilentlyContinue
    Write-Host "[OK] Removed existing rules" -ForegroundColor Green
} else {
    Write-Host "[OK] No existing rules to remove" -ForegroundColor Green
}

Write-Host ""

# ===== CREATE NEW FIREWALL RULES =====
Write-Host "[STEP 2] Creating firewall rules for AI Agent..." -ForegroundColor Yellow

# Rule 1: Python.exe Outbound (for sending data to server)
New-NetFirewallRule -DisplayName "$APP_NAME - Python Outbound" `
    -Direction Outbound `
    -Program $PYTHON_PATH `
    -Action Allow `
    -Profile Domain,Private,Public `
    -Description "Allow Python Outbound for NeoCare AI Agent" `
    -Enabled True

Write-Host "[OK] Created rule for Python Outbound" -ForegroundColor Green

# Rule 2: Python.exe Inbound (for receiving commands if needed)
New-NetFirewallRule -DisplayName "$APP_NAME - Python Inbound" `
    -Direction Inbound `
    -Program $PYTHON_PATH `
    -Action Allow `
    -Profile Domain,Private `
    -Description "Allow Python Inbound for NeoCare AI Agent" `
    -Enabled True

Write-Host "[OK] Created rule for Python Inbound" -ForegroundColor Green

# Rule 3: HTTP/HTTPS Outbound (for API calls)
New-NetFirewallRule -DisplayName "$APP_NAME - HTTP/HTTPS Outbound" `
    -Direction Outbound `
    -Protocol TCP `
    -RemotePort 80,443,3000,5000,8080 `
    -Action Allow `
    -Profile Domain,Private,Public `
    -Description "Allow HTTP/HTTPS for NeoCare AI Agent API calls" `
    -Enabled True

Write-Host "[OK] Created rule for HTTP/HTTPS Outbound" -ForegroundColor Green

# Rule 4: WebRTC Communication (if agent receives video)
New-NetFirewallRule -DisplayName "$APP_NAME - WebRTC UDP" `
    -Direction Inbound `
    -Protocol UDP `
    -LocalPort 10000-20000 `
    -Action Allow `
    -Profile Domain,Private `
    -Description "Allow WebRTC for NeoCare AI Agent" `
    -Enabled True

Write-Host "[OK] Created rule for WebRTC UDP" -ForegroundColor Green

Write-Host ""

# ===== NETWORK DISCOVERY =====
Write-Host "[STEP 3] Enabling Network Discovery..." -ForegroundColor Yellow

# Enable Network Discovery for Private networks
Set-NetFirewallRule -DisplayGroup "Network Discovery" -Enabled True -Profile Private
Write-Host "[OK] Network Discovery enabled for Private networks" -ForegroundColor Green

Write-Host ""

# ===== VERIFY FIREWALL RULES =====
Write-Host "[STEP 4] Verifying firewall rules..." -ForegroundColor Yellow

$rules = Get-NetFirewallRule -DisplayName "*NeoCare-AI*" | Select-Object DisplayName, Enabled, Direction
Write-Host ""
Write-Host "Created Firewall Rules:" -ForegroundColor Cyan
$rules | Format-Table -AutoSize

Write-Host ""

# ===== DISPLAY NETWORK INFORMATION =====
Write-Host "[STEP 5] Network Configuration:" -ForegroundColor Yellow

$adapters = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*"} | Select-Object InterfaceAlias, IPAddress

Write-Host ""
Write-Host "Available Network Interfaces:" -ForegroundColor Cyan
$adapters | Format-Table -AutoSize

Write-Host ""

# ===== CHECK SERVER CONNECTIVITY =====
Write-Host "[STEP 6] Testing Server Connectivity..." -ForegroundColor Yellow

# Prompt for server IP
$serverIP = Read-Host "Enter Edge Server IP (default: 10.107.51.130)"
if ([string]::IsNullOrWhiteSpace($serverIP)) {
    $serverIP = "10.107.51.130"
}

Write-Host ""
Write-Host "Testing connection to $serverIP..." -ForegroundColor Yellow

# Test Port 3000 (Next.js)
$port3000 = Test-NetConnection -ComputerName $serverIP -Port 3000 -WarningAction SilentlyContinue
if ($port3000.TcpTestSucceeded) {
    Write-Host "[OK] Port 3000 (Next.js) is reachable" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Port 3000 (Next.js) is not reachable" -ForegroundColor Yellow
}

# Test Port 5000 (Flask)
$port5000 = Test-NetConnection -ComputerName $serverIP -Port 5000 -WarningAction SilentlyContinue
if ($port5000.TcpTestSucceeded) {
    Write-Host "[OK] Port 5000 (Flask Backend) is reachable" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Port 5000 (Flask Backend) is not reachable" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " AI Agent Firewall Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "CONFIGURATION SUMMARY:" -ForegroundColor Cyan
Write-Host "  Python Path: $PYTHON_PATH" -ForegroundColor White
Write-Host "  Server IP: $serverIP" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Create .env file with server configuration" -ForegroundColor White
Write-Host "  2. Copy ai_agents/.env.example to .env" -ForegroundColor White
Write-Host "  3. Update EDGE_SERVER_URL in .env" -ForegroundColor White
Write-Host "  4. Start AI Agent: python neocare_agent.py" -ForegroundColor White
Write-Host ""
