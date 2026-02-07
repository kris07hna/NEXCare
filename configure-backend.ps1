# NEXCARE Backend Configuration Script
# Configure Flask backend URL for sensor data

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   Backend Server Configuration" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Function to get WiFi IP address
function Get-WiFiIP {
    $adapters = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' -and $_.Name -like '*Wi-Fi*' }
    
    foreach ($adapter in $adapters) {
        $ip = Get-NetIPAddress -AddressFamily IPv4 -InterfaceIndex $adapter.ifIndex -ErrorAction SilentlyContinue
        if ($ip) {
            return $ip.IPAddress
        }
    }
    
    # Fallback: try any active adapter
    $activeAdapters = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' }
    foreach ($adapter in $activeAdapters) {
        $ip = Get-NetIPAddress -AddressFamily IPv4 -InterfaceIndex $adapter.ifIndex -ErrorAction SilentlyContinue
        if ($ip -and $ip.IPAddress -notlike '169.254.*' -and $ip.IPAddress -ne '127.0.0.1') {
            return $ip.IPAddress
        }
    }
    
    return $null
}

# Get current IP
$currentIP = Get-WiFiIP

Write-Host "Current laptop IP: " -NoNewline -ForegroundColor Yellow
Write-Host $currentIP -ForegroundColor Green
Write-Host ""

Write-Host "Where is the Flask backend running?" -ForegroundColor Yellow
Write-Host ""
Write-Host "   1. This laptop (localhost)" -ForegroundColor White
Write-Host "   2. Different laptop (enter IP)" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Enter choice (1/2)"

$backendUrl = ""

switch ($choice) {
    "1" {
        $backendUrl = "http://localhost:5000"
        Write-Host ""
        Write-Host "✅ Backend configured for localhost" -ForegroundColor Green
    }
    
    "2" {
        Write-Host ""
        Write-Host "Enter the IP of the laptop running Flask backend" -ForegroundColor Yellow
        Write-Host "(Example: 10.107.51.42)" -ForegroundColor Gray
        Write-Host ""
        $backendIP = Read-Host "Backend IP"
        
        if ($backendIP) {
            $backendUrl = "http://${backendIP}:5000"
            
            # Test connection
            Write-Host ""
            Write-Host "Testing connection to backend..." -ForegroundColor Yellow
            try {
                $response = Invoke-WebRequest -Uri "$backendUrl/sensor_data" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
                Write-Host "✅ Backend is reachable!" -ForegroundColor Green
            } catch {
                Write-Host "⚠️  Cannot reach backend at $backendUrl" -ForegroundColor Yellow
                Write-Host "   Make sure:" -ForegroundColor Yellow
                Write-Host "   1. Flask is running (python app.py)" -ForegroundColor White
                Write-Host "   2. Both laptops on same network" -ForegroundColor White
                Write-Host ""
                $continue = Read-Host "Continue anyway? [y/N]"
                if ($continue -ne "y" -and $continue -ne "Y") {
                    exit 1
                }
            }
        } else {
            Write-Host "❌ No IP provided" -ForegroundColor Red
            Read-Host "Press Enter to exit"
            exit 1
        }
    }
    
    default {
        Write-Host "❌ Invalid choice" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Update .env.local
Write-Host ""
Write-Host "Updating .env.local..." -ForegroundColor Yellow

$envPath = ".env.local"

if (Test-Path $envPath) {
    # Read existing file
    $envContent = Get-Content $envPath -Raw
    
    # Replace backend URL line
    if ($envContent -match 'NEXT_PUBLIC_BACKEND_URL=.*') {
        $envContent = $envContent -replace 'NEXT_PUBLIC_BACKEND_URL=.*', "NEXT_PUBLIC_BACKEND_URL=$backendUrl"
    } else {
        # Add backend URL if not exists
        $envContent += "`nNEXT_PUBLIC_BACKEND_URL=$backendUrl`n"
    }
    
    # Write back
    $envContent | Out-File -FilePath $envPath -Encoding UTF8 -NoNewline
    
    Write-Host "✅ Configuration updated!" -ForegroundColor Green
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "   Summary" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Backend URL: " -NoNewline
    Write-Host $backendUrl -ForegroundColor Green
    Write-Host ""
    Write-Host "NeoCare page will now fetch sensor data from:" -ForegroundColor Yellow
    Write-Host "  - $backendUrl/sensor_data" -ForegroundColor White
    Write-Host "  - $backendUrl/process_frame" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Restart the Next.js server for changes to take effect:" -ForegroundColor Yellow
    Write-Host "   Ctrl+C (stop server)" -ForegroundColor White
    Write-Host "   npm run dev (start again)" -ForegroundColor White
    Write-Host ""
    
} else {
    Write-Host "❌ .env.local not found!" -ForegroundColor Red
    Write-Host "   Please run from: C:\Users\krishna\Music\NEXCARE-5G\edge-server2" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
