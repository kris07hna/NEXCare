# Quick Setup Script for Mobile Hotspot Deployment
# Run this script on the CENTRAL SERVER laptop

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  NEXCARE-5G Mobile Hotspot Setup Script  " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if running as Administrator
Write-Host "[1/7] Checking administrator privileges..." -ForegroundColor Yellow
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "    ⚠  Not running as Administrator" -ForegroundColor Red
    Write-Host "    Some firewall operations may fail" -ForegroundColor Red
    Write-Host "    Consider running: Right-click PowerShell → Run as Administrator" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "    ✓ Running as Administrator" -ForegroundColor Green
    Write-Host ""
}

# Step 2: Get WiFi IP Address
Write-Host "[2/7] Detecting network configuration..." -ForegroundColor Yellow
$wifiAdapter = Get-NetAdapter | Where-Object { $_.Status -eq "Up" -and $_.InterfaceDescription -like "*Wireless*" } | Select-Object -First 1

if ($wifiAdapter) {
    $ipAddress = (Get-NetIPAddress -InterfaceAlias $wifiAdapter.Name -AddressFamily IPv4).IPAddress
    Write-Host "    ✓ WiFi Adapter: $($wifiAdapter.Name)" -ForegroundColor Green
    Write-Host "    ✓ IP Address: $ipAddress" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "    ⚠  No WiFi adapter found. Checking all adapters..." -ForegroundColor Yellow
    $activeAdapter = Get-NetAdapter | Where-Object { $_.Status -eq "Up" } | Select-Object -First 1
    if ($activeAdapter) {
        $ipAddress = (Get-NetIPAddress -InterfaceAlias $activeAdapter.Name -AddressFamily IPv4).IPAddress
        Write-Host "    ✓ Active Adapter: $($activeAdapter.Name)" -ForegroundColor Green
        Write-Host "    ✓ IP Address: $ipAddress" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "    ✗ No active network connection!" -ForegroundColor Red
        Write-Host "    Please connect to mobile hotspot first" -ForegroundColor Red
        exit 1
    }
}

# Step 3: Configure Firewall
Write-Host "[3/7] Configuring Windows Firewall..." -ForegroundColor Yellow
if ($isAdmin) {
    try {
        $existingRule = Get-NetFirewallRule -DisplayName "NEXCARE Server" -ErrorAction SilentlyContinue
        if ($existingRule) {
            Write-Host "    Removing existing firewall rule..." -ForegroundColor Gray
            Remove-NetFirewallRule -DisplayName "NEXCARE Server"
        }
        
        New-NetFirewallRule -DisplayName "NEXCARE Server" `
                           -Direction Inbound `
                           -Protocol TCP `
                           -LocalPort 3000 `
                           -Action Allow `
                           -Profile Any `
                           -ErrorAction Stop | Out-Null
        
        Write-Host "    ✓ Firewall rule created for port 3000" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "    ⚠  Failed to configure firewall: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "    You may need to manually allow port 3000" -ForegroundColor Yellow
        Write-Host ""
    }
} else {
    Write-Host "    ⚠  Skipped (requires administrator privileges)" -ForegroundColor Yellow
    Write-Host "    Run: New-NetFirewallRule -DisplayName 'NEXCARE Server' -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow" -ForegroundColor Gray
    Write-Host ""
}

# Step 4: Create .env.local file
Write-Host "[4/7] Creating environment configuration..." -ForegroundColor Yellow
$envContent = @"
# NEXCARE-5G Server Configuration
# Auto-generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Network Configuration (Auto-detected)
NEXT_PUBLIC_SERVER_URL=http://${ipAddress}:3000
NEXT_PUBLIC_SIGNALING_SERVER_URL=http://${ipAddress}:3000

# WebRTC Configuration
NEXT_PUBLIC_OFFLINE_MODE=false
NEXT_PUBLIC_ICE_SERVERS=stun:stun.l.google.com:19302

# Database
DATABASE_URL=file:./data/edgecare.db
"@

Set-Content -Path ".env.local" -Value $envContent
Write-Host "    ✓ Created .env.local with IP: $ipAddress" -ForegroundColor Green
Write-Host ""

# Step 5: Check Node.js and dependencies
Write-Host "[5/7] Checking dependencies..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "    ✓ Node.js: $nodeVersion" -ForegroundColor Green
    
    if (Test-Path "node_modules") {
        Write-Host "    ✓ Dependencies already installed" -ForegroundColor Green
    } else {
        Write-Host "    ⚠  Dependencies not installed" -ForegroundColor Yellow
        Write-Host "    Run: npm install" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "    ✗ Node.js not found!" -ForegroundColor Red
    Write-Host "    Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Step 6: Initialize database
Write-Host "[6/7] Checking database..." -ForegroundColor Yellow
if (Test-Path "data/edgecare.db") {
    Write-Host "    ✓ Database already exists" -ForegroundColor Green
} else {
    Write-Host "    ⚠  Database not initialized" -ForegroundColor Yellow
    Write-Host "    Run: npx tsx scripts/seed.ts" -ForegroundColor Gray
}
Write-Host ""

# Step 7: Display summary and next steps
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Setup Complete! Next Steps:" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Your Server Configuration:" -ForegroundColor White
Write-Host "   Server IP:   $ipAddress" -ForegroundColor Yellow
Write-Host "   Server URL:  http://${ipAddress}:3000" -ForegroundColor Yellow
Write-Host "   Dashboard:   http://${ipAddress}:3000" -ForegroundColor Yellow
Write-Host "   Health API:  http://${ipAddress}:3000/api/health" -ForegroundColor Yellow
Write-Host ""

Write-Host "🚀 To Start the Server:" -ForegroundColor White
Write-Host "   npm run build     # Build the application" -ForegroundColor Gray
Write-Host "   npm start         # Start the server" -ForegroundColor Gray
Write-Host ""

Write-Host "📱 On Other Devices (AI Agents, Consoles):" -ForegroundColor White
Write-Host "   1. Connect to the same mobile hotspot" -ForegroundColor Gray
Write-Host "   2. Open browser: http://${ipAddress}:3000" -ForegroundColor Gray
Write-Host "   3. Use this in AI agent .env files:" -ForegroundColor Gray
Write-Host "      EDGE_SERVER_URL=http://${ipAddress}:3000" -ForegroundColor Yellow
Write-Host ""

Write-Host "🧪 Test Connectivity:" -ForegroundColor White
Write-Host "   # On this laptop:" -ForegroundColor Gray
Write-Host "   curl http://${ipAddress}:3000/api/health" -ForegroundColor Gray
Write-Host ""
Write-Host "   # On other laptops:" -ForegroundColor Gray
Write-Host "   ping $ipAddress" -ForegroundColor Gray
Write-Host "   curl http://${ipAddress}:3000/api/health" -ForegroundColor Gray
Write-Host ""

Write-Host "⚠️  Important Notes:" -ForegroundColor White
Write-Host "   - If IP changes, re-run this script" -ForegroundColor Yellow
Write-Host "   - Keep this laptop plugged in" -ForegroundColor Yellow
Write-Host "   - Don't disable firewall during demo" -ForegroundColor Yellow
Write-Host "   - Monitor phone battery/data usage" -ForegroundColor Yellow
Write-Host ""

Write-Host "📚 For detailed guide, see:" -ForegroundColor White
Write-Host "   docs/MOBILE_HOTSPOT_SETUP.md" -ForegroundColor Cyan
Write-Host ""

# Save IP address to a file for easy reference
$ipAddress | Out-File -FilePath "SERVER_IP.txt"
Write-Host "💾 Server IP saved to SERVER_IP.txt" -ForegroundColor Green
Write-Host ""

# Optional: Open browser to test
$openBrowser = Read-Host "Open browser to test? (y/n)"
if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
    Write-Host "Opening browser..." -ForegroundColor Gray
    Start-Process "http://${ipAddress}:3000"
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Ready to start! Run: npm start" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
