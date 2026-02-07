#!/bin/bash
# NEXCARE-5G Mobile Hotspot Setup Script (Linux/Mac)
# Run this script on the CENTRAL SERVER laptop

echo "============================================"
echo "  NEXCARE-5G Mobile Hotspot Setup Script  "
echo "============================================"
echo ""

# Step 1: Detect IP Address
echo "[1/6] Detecting network configuration..."

# Try to detect WiFi interface
WIFI_INTERFACE=$(ip link show | grep -E "wlan|wlp" | awk -F: '{print $2}' | tr -d ' ' | head -n1)

if [ -n "$WIFI_INTERFACE" ]; then
    IP_ADDRESS=$(ip addr show $WIFI_INTERFACE | grep "inet " | awk '{print $2}' | cut -d'/' -f1)
    echo "    ✓ WiFi Interface: $WIFI_INTERFACE"
    echo "    ✓ IP Address: $IP_ADDRESS"
else
    # Fallback to any active interface
    IP_ADDRESS=$(hostname -I | awk '{print $1}')
    echo "    ⚠  Using first available IP: $IP_ADDRESS"
fi

if [ -z "$IP_ADDRESS" ]; then
    echo "    ✗ No network connection detected!"
    echo "    Please connect to mobile hotspot first"
    exit 1
fi

echo ""

# Step 2: Configure firewall (Linux only)
echo "[2/6] Configuring firewall..."

if command -v ufw &> /dev/null; then
    echo "    UFW detected, configuring..."
    sudo ufw allow 3000/tcp
    echo "    ✓ Port 3000 allowed in UFW"
elif command -v firewall-cmd &> /dev/null; then
    echo "    firewalld detected, configuring..."
    sudo firewall-cmd --permanent --add-port=3000/tcp
    sudo firewall-cmd --reload
    echo "    ✓ Port 3000 allowed in firewalld"
else
    echo "    ⚠  No firewall detected (this is OK)"
fi

echo ""

# Step 3: Create .env.local file
echo "[3/6] Creating environment configuration..."

cat > .env.local << EOF
# NEXCARE-5G Server Configuration
# Auto-generated on $(date)

# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Network Configuration (Auto-detected)
NEXT_PUBLIC_SERVER_URL=http://${IP_ADDRESS}:3000
NEXT_PUBLIC_SIGNALING_SERVER_URL=http://${IP_ADDRESS}:3000

# WebRTC Configuration
NEXT_PUBLIC_OFFLINE_MODE=false
NEXT_PUBLIC_ICE_SERVERS=stun:stun.l.google.com:19302

# Database
DATABASE_URL=file:./data/edgecare.db
EOF

echo "    ✓ Created .env.local with IP: $IP_ADDRESS"
echo ""

# Step 4: Check Node.js
echo "[4/6] Checking dependencies..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "    ✓ Node.js: $NODE_VERSION"
    
    if [ -d "node_modules" ]; then
        echo "    ✓ Dependencies already installed"
    else
        echo "    ⚠  Dependencies not installed"
        echo "    Run: npm install"
    fi
else
    echo "    ✗ Node.js not found!"
    echo "    Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo ""

# Step 5: Check database
echo "[5/6] Checking database..."
if [ -f "data/edgecare.db" ]; then
    echo "    ✓ Database already exists"
else
    echo "    ⚠  Database not initialized"
    echo "    Run: npx tsx scripts/seed.ts"
fi

echo ""

# Step 6: Display summary
echo "[6/6] Setup complete!"
echo ""
echo "============================================"
echo "  Summary & Next Steps"
echo "============================================"
echo ""

echo "📋 Your Server Configuration:"
echo "   Server IP:   $IP_ADDRESS"
echo "   Server URL:  http://${IP_ADDRESS}:3000"
echo "   Dashboard:   http://${IP_ADDRESS}:3000"
echo "   Health API:  http://${IP_ADDRESS}:3000/api/health"
echo ""

echo "🚀 To Start the Server:"
echo "   npm run build     # Build the application"
echo "   npm start         # Start the server"
echo ""

echo "📱 On Other Devices (AI Agents, Consoles):"
echo "   1. Connect to the same mobile hotspot"
echo "   2. Open browser: http://${IP_ADDRESS}:3000"
echo "   3. Use in AI agent .env files:"
echo "      EDGE_SERVER_URL=http://${IP_ADDRESS}:3000"
echo ""

echo "🧪 Test Connectivity:"
echo "   # On this laptop:"
echo "   curl http://${IP_ADDRESS}:3000/api/health"
echo ""
echo "   # On other laptops:"
echo "   ping $IP_ADDRESS"
echo "   curl http://${IP_ADDRESS}:3000/api/health"
echo ""

echo "⚠️  Important Notes:"
echo "   - If IP changes, re-run this script"
echo "   - Keep this laptop plugged in"
echo "   - Monitor phone battery/data usage"
echo ""

echo "📚 For detailed guide, see:"
echo "   docs/MOBILE_HOTSPOT_SETUP.md"
echo ""

# Save IP to file
echo $IP_ADDRESS > SERVER_IP.txt
echo "💾 Server IP saved to SERVER_IP.txt"
echo ""

echo "============================================"
echo "  Ready to start! Run: npm start"
echo "============================================"
