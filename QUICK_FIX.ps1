#Requires -RunAsAdministrator

# ===================================================================
# NEXCARE-5G QUICK FIX SCRIPT
# ===================================================================
# Automatically fixes common connection issues
# Run as Administrator
# ===================================================================

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " NEXCARE-5G QUICK FIX - Auto Configuration" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Get server IP
$ServerIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "10.*" -and $_.InterfaceAlias -notlike "*Loopback*"}).IPAddress

if (-not $ServerIP) {
    $ServerIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*" -and $_.InterfaceAlias -notlike "*Loopback*"}).IPAddress | Select-Object -First 1
}

Write-Host "[INFO] Your Server IP: $ServerIP" -ForegroundColor Yellow
Write-Host ""

# Fix 1: Configure Firewall
Write-Host "[FIX 1] Configuring Firewall Rules..." -ForegroundColor Yellow

$rules = Get-NetFirewallRule -DisplayName "*NeoCare*" -ErrorAction SilentlyContinue

if (-not $rules) {
    Write-Host "[ACTION] Creating firewall rules..." -ForegroundColor Green
    
    # Server ports
    New-NetFirewallRule -DisplayName "NeoCare-Server-3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -Profile Domain,Private,Public -ErrorAction SilentlyContinue | Out-Null
    New-NetFirewallRule -DisplayName "NeoCare-Server-5000" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow -Profile Domain,Private,Public -ErrorAction SilentlyContinue | Out-Null
    New-NetFirewallRule -DisplayName "NeoCare-Server-8080-8090" -Direction Inbound -Protocol TCP -LocalPort 8080-8090 -Action Allow -Profile Domain,Private,Public -ErrorAction SilentlyContinue | Out-Null
    
    Write-Host "[OK] Firewall rules created" -ForegroundColor Green
} else {
    Write-Host "[OK] Firewall rules already exist" -ForegroundColor Green
}

# Fix 2: Enable Network Discovery
Write-Host ""
Write-Host "[FIX 2] Enabling Network Discovery..." -ForegroundColor Yellow
Set-NetFirewallRule -DisplayGroup "Network Discovery" -Enabled True -Profile Private -ErrorAction SilentlyContinue
Set-NetFirewallRule -DisplayGroup "File and Printer Sharing" -Enabled True -Profile Private -ErrorAction SilentlyContinue
Write-Host "[OK] Network Discovery enabled" -ForegroundColor Green

# Fix 3: Check if servers are running
Write-Host ""
Write-Host "[FIX 3] Checking Server Status..." -ForegroundColor Yellow

$Port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$Port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue

if ($Port3000) {
    Write-Host "[OK] Next.js server running on port 3000" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Next.js NOT running - Start with: npm run dev" -ForegroundColor Red
}

if ($Port5000) {
    Write-Host "[OK] Flask backend running on port 5000" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Flask NOT running - Start with: python backend/app.py" -ForegroundColor Red
}

# Fix 4: Update Next.js configuration
Write-Host ""
Write-Host "[FIX 4] Checking Next.js Configuration..." -ForegroundColor Yellow

$packageJson = Get-Content "package.json" -Raw -ErrorAction SilentlyContinue

if ($packageJson -and $packageJson -notmatch "0\.0\.0\.0") {
    Write-Host "[ACTION] Updating package.json to listen on all interfaces..." -ForegroundColor Yellow
    
    $packageJson = $packageJson -replace '"dev":\s*"next dev"', '"dev": "next dev -H 0.0.0.0"'
    $packageJson | Set-Content "package.json"
    
    Write-Host "[OK] package.json updated - Restart Next.js server!" -ForegroundColor Green
} else {
    Write-Host "[OK] Next.js configuration looks good" -ForegroundColor Green
}

# Fix 5: Test connectivity
Write-Host ""
Write-Host "[FIX 5] Testing Network Connectivity..." -ForegroundColor Yellow

$test3000 = Test-NetConnection -ComputerName $ServerIP -Port 3000 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
$test5000 = Test-NetConnection -ComputerName $ServerIP -Port 5000 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue

if ($test3000.TcpTestSucceeded) {
    Write-Host "[OK] Port 3000 is accessible from network" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Port 3000 NOT accessible - Check if Next.js is running" -ForegroundColor Red
}

if ($test5000.TcpTestSucceeded) {
    Write-Host "[OK] Port 5000 is accessible from network" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Port 5000 NOT accessible - Check if Flask is running" -ForegroundColor Red
}

# Summary
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " CONFIGURATION COMPLETE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your Server IP: " -NoNewline
Write-Host "$ServerIP" -ForegroundColor Yellow
Write-Host ""
Write-Host "Friends must configure their .env with:" -ForegroundColor Cyan
Write-Host "  EDGE_SERVER_HOST=$ServerIP" -ForegroundColor White
Write-Host "  EDGE_SERVER_URL=http://$ServerIP:3000" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Ensure servers are running (npm run dev + python backend/app.py)" -ForegroundColor White
Write-Host "  2. Share this IP with friends: $ServerIP" -ForegroundColor White
Write-Host "  3. Friends run: setup-firewall-agent.ps1 on their laptops" -ForegroundColor White
Write-Host "  4. Friends test: python network_tester.py --server $ServerIP" -ForegroundColor White
Write-Host ""
