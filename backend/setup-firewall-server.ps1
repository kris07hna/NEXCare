# ===================================================================
# NEXCARE-5G BACKEND SERVER - FIREWALL CONFIGURATION
# ===================================================================
# This script configures Windows Firewall for the Backend Server
# Run as Administrator
# Last Updated: 2026-02-08
# ===================================================================

#Requires -RunAsAdministrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " NEXCARE-5G Backend Server Firewall Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$APP_NAME = "NeoCare-Backend-Server"
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

$existingRules = Get-NetFirewallRule -DisplayName "*NeoCare*" -ErrorAction SilentlyContinue
if ($existingRules) {
    Remove-NetFirewallRule -DisplayName "*NeoCare*" -ErrorAction SilentlyContinue
    Write-Host "[OK] Removed existing rules" -ForegroundColor Green
} else {
    Write-Host "[OK] No existing rules to remove" -ForegroundColor Green
}

Write-Host ""

# ===== CREATE NEW FIREWALL RULES =====
Write-Host "[STEP 2] Creating firewall rules for Backend Server..." -ForegroundColor Yellow

# Rule 1: Flask Backend API Server (Port 5000)
New-NetFirewallRule -DisplayName "$APP_NAME - Backend API (TCP 5000)" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 5000 `
    -Action Allow `
    -Profile Domain,Private,Public `
    -Description "NeoCare Backend API Server - Flask Application" `
    -Enabled True

Write-Host "[OK] Created rule for Backend API (Port 5000)" -ForegroundColor Green

# Rule 2: Python.exe Inbound
New-NetFirewallRule -DisplayName "$APP_NAME - Python Inbound" `
    -Direction Inbound `
    -Program $PYTHON_PATH `
    -Action Allow `
    -Profile Domain,Private,Public `
    -Description "Allow Python for NeoCare Backend Server" `
    -Enabled True

Write-Host "[OK] Created rule for Python Inbound" -ForegroundColor Green

# Rule 3: Python.exe Outbound
New-NetFirewallRule -DisplayName "$APP_NAME - Python Outbound" `
    -Direction Outbound `
    -Program $PYTHON_PATH `
    -Action Allow `
    -Profile Domain,Private,Public `
    -Description "Allow Python Outbound for NeoCare Backend Server" `
    -Enabled True

Write-Host "[OK] Created rule for Python Outbound" -ForegroundColor Green

# Rule 4: Metrics Endpoint (Port 9090 - Optional)
New-NetFirewallRule -DisplayName "$APP_NAME - Metrics (TCP 9090)" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 9090 `
    -Action Allow `
    -Profile Domain,Private `
    -Description "NeoCare Backend Metrics Endpoint" `
    -Enabled True

Write-Host "[OK] Created rule for Metrics (Port 9090)" -ForegroundColor Green

Write-Host ""

# ===== ADDITIONAL PORTS FOR CENTRAL SERVER =====
Write-Host "[STEP 3] Creating firewall rules for Central Server integration..." -ForegroundColor Yellow

# Rule 5: Next.js Development Server (Port 3000)
New-NetFirewallRule -DisplayName "$APP_NAME - Next.js Frontend (TCP 3000)" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 3000 `
    -Action Allow `
    -Profile Domain,Private,Public `
    -Description "NeoCare Next.js Frontend Server" `
    -Enabled True

Write-Host "[OK] Created rule for Next.js (Port 3000)" -ForegroundColor Green

# Rule 6: WebRTC Signaling (Port 8080-8090)
New-NetFirewallRule -DisplayName "$APP_NAME - WebRTC Signaling (TCP 8080-8090)" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 8080-8090 `
    -Action Allow `
    -Profile Domain,Private,Public `
    -Description "NeoCare WebRTC Signaling Ports" `
    -Enabled True

Write-Host "[OK] Created rule for WebRTC Signaling (Ports 8080-8090)" -ForegroundColor Green

# Rule 7: STUN/TURN for WebRTC (UDP 3478)
New-NetFirewallRule -DisplayName "$APP_NAME - STUN/TURN (UDP 3478)" `
    -Direction Inbound `
    -Protocol UDP `
    -LocalPort 3478 `
    -Action Allow `
    -Profile Domain,Private,Public `
    -Description "NeoCare STUN/TURN for WebRTC" `
    -Enabled True

Write-Host "[OK] Created rule for STUN/TURN (Port 3478)" -ForegroundColor Green

# Rule 8: TURN over TLS (TCP 5349)
New-NetFirewallRule -DisplayName "$APP_NAME - TURN TLS (TCP 5349)" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 5349 `
    -Action Allow `
    -Profile Domain,Private,Public `
    -Description "NeoCare TURN over TLS" `
    -Enabled True

Write-Host "[OK] Created rule for TURN TLS (Port 5349)" -ForegroundColor Green

# Rule 9: RTP/RTCP Media Streams (UDP 10000-20000)
New-NetFirewallRule -DisplayName "$APP_NAME - RTP Media (UDP 10000-20000)" `
    -Direction Inbound `
    -Protocol UDP `
    -LocalPort 10000-20000 `
    -Action Allow `
    -Profile Domain,Private,Public `
    -Description "NeoCare RTP/RTCP Media Streams" `
    -Enabled True

Write-Host "[OK] Created rule for RTP Media (Ports 10000-20000)" -ForegroundColor Green

Write-Host ""

# ===== VERIFY FIREWALL RULES =====
Write-Host "[STEP 4] Verifying firewall rules..." -ForegroundColor Yellow

$rules = Get-NetFirewallRule -DisplayName "*NeoCare*" | Select-Object DisplayName, Enabled, Direction
Write-Host ""
Write-Host "Created Firewall Rules:" -ForegroundColor Cyan
$rules | Format-Table -AutoSize

Write-Host ""

# ===== NETWORK DISCOVERY =====
Write-Host "[STEP 5] Enabling Network Discovery..." -ForegroundColor Yellow

# Enable Network Discovery
Set-NetFirewallRule -DisplayGroup "Network Discovery" -Enabled True -Profile Private
Write-Host "[OK] Network Discovery enabled for Private networks" -ForegroundColor Green

# Enable File and Printer Sharing (if needed)
# Set-NetFirewallRule -DisplayGroup "File and Printer Sharing" -Enabled True -Profile Private

Write-Host ""

# ===== DISPLAY NETWORK INFORMATION =====
Write-Host "[STEP 6] Network Configuration:" -ForegroundColor Yellow

$adapters = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*"} | Select-Object InterfaceAlias, IPAddress

Write-Host ""
Write-Host "Available Network Interfaces:" -ForegroundColor Cyan
$adapters | Format-Table -AutoSize

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " Backend Server Firewall Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT PORTS CONFIGURED:" -ForegroundColor Cyan
Write-Host "  Port 5000  - Flask Backend API" -ForegroundColor White
Write-Host "  Port 3000  - Next.js Frontend" -ForegroundColor White
Write-Host "  Port 8080-8090 - WebRTC Signaling" -ForegroundColor White
Write-Host "  Port 3478  - STUN/TURN (UDP)" -ForegroundColor White
Write-Host "  Port 5349  - TURN TLS (TCP)" -ForegroundColor White
Write-Host "  Port 10000-20000 - RTP Media (UDP)" -ForegroundColor White
Write-Host "  Port 9090  - Metrics (Optional)" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Start Backend Server: python backend/app.py" -ForegroundColor White
Write-Host "  2. Start Next.js Server: npm run dev" -ForegroundColor White
Write-Host "  3. Connect AI Agents from laptops" -ForegroundColor White
Write-Host ""
