# NEXCARE-5G Mobile Hotspot Setup Guide
## Connecting Multiple Systems to Central Server via Mobile Hotspot

---

## 🎯 Overview

This guide explains how to connect multiple laptops/devices (AI agents, doctor stations, room monitors) to your central NEXCARE-5G edge server using a **mobile phone hotspot** as the network.

### Setup Architecture

```
📱 Mobile Phone Hotspot (192.168.43.0/24)
    │
    ├── 💻 Laptop 1: Central Edge Server (192.168.43.10)
    │   └── Next.js Server (Port 3000)
    │
    ├── 💻 Laptop 2: NeoCare AI Agent (192.168.43.20)
    │   └── Python Agent → Room R2
    │
    ├── 💻 Laptop 3: GeriCare AI Agent (192.168.43.30)
    │   └── Python Agent → Room R5
    │
    ├── 💻 Laptop 4: Doctor Console (192.168.43.40)
    │   └── Browser → WebRTC Consultation
    │
    └── 💻 Laptop 5: Room Monitor (192.168.43.50)
        └── Browser → Room Monitoring Dashboard
```

---

## 📋 Prerequisites

### Hardware Needed
- ✅ 1 smartphone with mobile data (4G/5G)
- ✅ 2-5 laptops/computers with WiFi
- ✅ Power supply for all devices

### Software Needed
- ✅ Node.js 18+ (on central server laptop)
- ✅ Python 3.9+ (on AI agent laptops)
- ✅ Modern browser (Chrome/Edge recommended)

---

## 🚀 Step-by-Step Setup

### **Step 1: Configure Mobile Hotspot**

#### Android Phone:
1. Go to **Settings** → **Network & Internet** → **Hotspot & Tethering**
2. Tap **WiFi hotspot**
3. Configure:
   - **Network name**: `NEXCARE-5G`
   - **Security**: WPA2-PSK
   - **Password**: `nexcare2026` (or your choice)
   - **AP Band**: 5GHz (if available, faster)
   - **Max connections**: Set to 10 (or maximum available)
4. Toggle **ON**

#### iPhone:
1. Go to **Settings** → **Personal Hotspot**
2. Configure:
   - **WiFi Password**: `nexcare2026`
   - **Allow Others to Join**: ON
   - **Maximize Compatibility**: ON (for older devices)
3. Toggle **Personal Hotspot** ON

---

### **Step 2: Connect All Devices to Hotspot**

On **each laptop**:

#### Windows:
1. Click WiFi icon in taskbar
2. Select `NEXCARE-5G`
3. Click **Connect**
4. Enter password: `nexcare2026`
5. Check "Connect automatically"

#### macOS:
1. Click WiFi icon in menu bar
2. Select `NEXCARE-5G`
3. Enter password
4. Click **Join**

#### Linux:
```bash
nmcli device wifi connect NEXCARE-5G password nexcare2026
```

**✅ Verify Connection:**
```powershell
# On each laptop, run:
ping 8.8.8.8

# Should see replies like:
# Reply from 8.8.8.8: bytes=32 time=45ms TTL=116
```

---

### **Step 3: Find IP Addresses**

You need to know each laptop's IP address on the hotspot network.

#### Windows PowerShell:
```powershell
# Run on each laptop
ipconfig | findstr /i "IPv4"

# Output example:
# IPv4 Address. . . . . . . . . . . : 192.168.43.10
```

#### macOS/Linux:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1

# Or
ip addr show | grep "inet " | grep -v 127.0.0.1
```

**📝 Document IP addresses:**
```
Laptop 1 (Central Server):  192.168.43.10
Laptop 2 (NeoCare Agent):   192.168.43.20
Laptop 3 (GeriCare Agent):  192.168.43.30
Laptop 4 (Doctor Console):  192.168.43.40
Laptop 5 (Room Monitor):    192.168.43.50
```

> **Note:** The IP address range depends on your phone's hotspot configuration. Common ranges:
> - Android: `192.168.43.x`
> - iPhone: `172.20.10.x`
> - Some phones: `192.168.137.x`

---

### **Step 4: Configure Central Edge Server (Laptop 1)**

#### A. Update Environment Variables

Create/edit `.env.local` in your edge-server2 folder:

```bash
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2
```

**Edit `.env.local`:**
```env
# Server Configuration
NODE_ENV=production
PORT=3000

# Network Configuration
# IMPORTANT: Use 0.0.0.0 to listen on all network interfaces
HOST=0.0.0.0

# Your actual IP on hotspot (find using ipconfig)
NEXT_PUBLIC_SERVER_URL=http://192.168.43.10:3000
NEXT_PUBLIC_SIGNALING_SERVER_URL=http://192.168.43.10:3000

# WebRTC Configuration
NEXT_PUBLIC_OFFLINE_MODE=false
NEXT_PUBLIC_ICE_SERVERS=stun:stun.l.google.com:19302

# Database
DATABASE_URL=file:./data/edgecare.db
```

#### B. Update Next.js Config

**Edit `next.config.ts`:**
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable access from other devices on network
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  
  // Allow external access
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

#### C. Update package.json Scripts

**Edit `package.json`:**
```json
{
  "scripts": {
    "dev": "next dev -H 0.0.0.0",
    "build": "next build",
    "start": "next start -H 0.0.0.0 -p 3000",
    "lint": "eslint"
  }
}
```

#### D. Configure Windows Firewall

```powershell
# Run PowerShell as Administrator

# Allow inbound connections on port 3000
New-NetFirewallRule -DisplayName "NEXCARE Server" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow

# Verify rule created
Get-NetFirewallRule -DisplayName "NEXCARE Server"
```

#### E. Start the Server

```powershell
# In edge-server2 directory
npm run build
npm start

# You should see:
# > nexcare@0.1.0 start
# > next start -H 0.0.0.0 -p 3000
# 
# ▲ Next.js 16.1.6
# - Local:        http://localhost:3000
# - Network:      http://192.168.43.10:3000
```

**✅ Test from Central Server:**
```powershell
# Open browser on Laptop 1
Start-Process "http://192.168.43.10:3000"
```

---

### **Step 5: Test Connection from Other Laptops**

On **Laptop 2, 3, 4, 5**:

#### Test 1: Ping Central Server
```powershell
ping 192.168.43.10

# Should see replies:
# Reply from 192.168.43.10: bytes=32 time=5ms TTL=128
```

#### Test 2: Access Health API
```powershell
curl http://192.168.43.10:3000/api/health

# Expected response:
# {"status":"ok","timestamp":1707408000000}
```

#### Test 3: Open Dashboard in Browser
```
http://192.168.43.10:3000
```

You should see the NEXCARE-5G dashboard load!

---

### **Step 6: Configure AI Agents**

#### On Laptop 2 (NeoCare AI Agent)

Navigate to your AI agent folder:
```powershell
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2\ai_agents
```

**Create/Edit `.env`:**
```env
# Point to central server IP
EDGE_SERVER_URL=http://192.168.43.10:3000
ROOM_ID=R2
PATIENT_ID=P001
MODULE=NeoCare-AI
CONFIDENCE_THRESHOLD=0.75
CHECK_INTERVAL=2
```

**Activate Python environment:**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Run NeoCare Agent:**
```powershell
python neocare_agent.py --room R2 --server http://192.168.43.10:3000 --interval 2
```

Expected output:
```
============================================================
  NeoCare-AI Agent Starting
============================================================
  Room ID:      R2
  Server:       http://192.168.43.10:3000
  Mock Mode:    True
  Interval:     2s
  Log Level:    INFO
============================================================

[INFO] Initialized NeoCare-AI for R2
[INFO] >> Starting NeoCare-AI for R2
[INFO] Server is reachable
[INFO] >> Model initialized successfully
[INFO] >> Report sent: SLEEPING (conf: 0.87)
```

#### On Laptop 3 (GeriCare AI Agent)

Same process, different room:
```powershell
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2\ai_agents

# Edit .env
EDGE_SERVER_URL=http://192.168.43.10:3000
ROOM_ID=R5
MODULE=GeriCare-AI

# Run agent
python gericare_agent.py --room R5 --server http://192.168.43.10:3000
```

---

### **Step 7: Access from Doctor/Monitor Consoles**

#### On Laptop 4 (Doctor Console)

1. Open **Chrome/Edge** browser
2. Navigate to: `http://192.168.43.10:3000/login`
3. Login as **Doctor**:
   - Username: `doctor`
   - Password: `doctor123`
4. You'll be redirected to: `http://192.168.43.10:3000/consultations`

**Start a Video Consultation:**
1. Click "Start Consultation" on any room (e.g., R2)
2. Grant camera/microphone permissions
3. Note the **Room Call URL** shown
4. Share with room laptop

#### On Laptop 5 (Room Monitor)

1. Open browser: `http://192.168.43.10:3000/login`
2. Login as **Monitor**:
   - Username: `monitor`
   - Password: `monitor123`
3. Join the video call using the URL from doctor console:
   ```
   http://192.168.43.10:3000/room-call/<session-id>
   ```

---

## 🔧 Troubleshooting

### Problem 1: Cannot Connect to Server

**Symptoms:**
- Browser shows "This site can't be reached"
- `curl` returns "Connection refused"

**Solutions:**

1. **Verify server is running:**
   ```powershell
   # On central server laptop
   netstat -an | findstr :3000
   
   # Should show:
   # TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING
   ```

2. **Check IP address:**
   ```powershell
   ipconfig | findstr IPv4
   # Make sure you're using the correct IP
   ```

3. **Disable Windows Firewall temporarily:**
   ```powershell
   # Run as Administrator
   Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
   
   # Test connection, then re-enable:
   Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
   ```

4. **Check if using correct network interface:**
   ```powershell
   # Server should bind to WiFi interface
   ipconfig /all
   # Look for "Wireless LAN adapter WiFi"
   ```

### Problem 2: AI Agents Can't Send Reports

**Symptoms:**
- Agent shows "Failed to send report"
- "Server is not reachable"

**Solutions:**

1. **Test connectivity:**
   ```powershell
   # On AI agent laptop
   curl http://192.168.43.10:3000/api/health
   ```

2. **Check server URL in agent:**
   ```python
   # In neocare_agent.py or gericare_agent.py
   # Verify --server parameter or .env file
   ```

3. **Enable debug logging:**
   ```powershell
   python neocare_agent.py --room R2 --server http://192.168.43.10:3000 --log-level DEBUG
   ```

### Problem 3: WebRTC Video Call Fails

**Symptoms:**
- "Connection failed" error
- Can't see remote video
- One-way video only

**Solutions:**

1. **Check signaling server URL:**
   ```typescript
   // In .env.local on central server
   NEXT_PUBLIC_SIGNALING_SERVER_URL=http://192.168.43.10:3000
   ```

2. **Verify both clients can reach server:**
   ```powershell
   # On both doctor and room laptops
   curl http://192.168.43.10:3000/api/health
   ```

3. **Grant permissions:**
   - Click padlock icon in browser address bar
   - Allow Camera and Microphone
   - Refresh page

4. **Check browser console:**
   - Press `F12`
   - Look for errors in Console tab
   - Check Network tab for failed requests

### Problem 4: Slow Performance / High Latency

**Symptoms:**
- Dashboard updates slowly
- Video is choppy
- Delays in alerts

**Solutions:**

1. **Move closer to phone hotspot:**
   - WiFi signal strength matters
   - Keep laptops within 3-5 meters

2. **Use 5GHz band if available:**
   - In phone hotspot settings
   - Select "5GHz preferred" or "5GHz only"

3. **Reduce video quality:**
   ```typescript
   // In lib/webrtc.ts
   video: {
     width: { ideal: 640, max: 1280 },  // Lower from 1920
     height: { ideal: 480, max: 720 },  // Lower from 1080
     frameRate: { ideal: 15 }            // Lower from 30
   }
   ```

4. **Check data usage:**
   - Monitor phone data consumption
   - Video calls use ~2-5 MB/minute
   - AI reports use ~10-50 KB/update

### Problem 5: Hotspot Keeps Disconnecting

**Symptoms:**
- Devices lose connection periodically
- Hotspot turns off automatically

**Solutions:**

1. **Keep phone plugged in:**
   - Many phones disable hotspot on low battery
   - Use wall charger, not laptop USB

2. **Disable battery optimization:**
   - Android: Settings → Apps → Hotspot → Battery → Unrestricted
   - iPhone: Settings → Battery → Low Power Mode → OFF

3. **Set hotspot timeout to "Never":**
   - Android: Settings → Hotspot → Turn off hotspot automatically → Never
   - iPhone: Stays on as long as devices connected

4. **Use static IP (Android only):**
   - Settings → Hotspot → Advanced → DHCP → Manual IP assignment

---

## 📊 Network Performance Monitoring

### Monitor Network Quality

**On Central Server:**
```powershell
# Check active connections
netstat -an | findstr :3000

# Monitor bandwidth
Get-NetAdapterStatistics -Name "Wi-Fi"

# Check latency to phone
ping 192.168.43.1 -t
# (Phone hotspot is usually .1 or .254)
```

**Expected Performance:**
- ✅ Ping latency: 5-20ms (excellent)
- ⚠️ Ping latency: 20-50ms (good)
- ❌ Ping latency: >100ms (poor, move closer)

### Bandwidth Usage Estimates

| Activity | Bandwidth | Data/Hour |
|----------|-----------|-----------|
| Dashboard (polling) | ~10 Kbps | ~5 MB |
| AI Reports | ~5 Kbps | ~2 MB |
| Video Call (720p) | ~2 Mbps | ~900 MB |
| Video Call (480p) | ~1 Mbps | ~450 MB |

**Total for 2-hour demo:**
- 3 Dashboards: 30 MB
- 2 AI Agents: 8 MB
- 1 Video Call (30 min): 450 MB
- **Total: ~500 MB**

---

## 🎬 Demo Day Checklist

### 1 Day Before:

- [ ] Charge phone to 100%
- [ ] Test hotspot with all laptops
- [ ] Verify sufficient mobile data (1-2 GB)
- [ ] Note down all IP addresses
- [ ] Test full system end-to-end
- [ ] Backup phone (tethering plan)

### 2 Hours Before:

- [ ] Enable hotspot
- [ ] Connect all laptops
- [ ] Start central server
- [ ] Verify firewall rules
- [ ] Test API endpoints
- [ ] Check browser access

### 30 Minutes Before:

- [ ] Start AI agents
- [ ] Verify dashboard shows rooms
- [ ] Test video call between 2 laptops
- [ ] Check latency and quality
- [ ] Open all browser tabs
- [ ] Have backup ready

### During Demo:

- Monitor phone battery (keep plugged in)
- Watch for disconnections
- Check data usage
- Have terminal windows visible
- Keep browser DevTools closed (unless debugging)

---

## 🔐 Security Considerations

### Current Setup (Demo Mode):
- ❌ No encryption (HTTP, not HTTPS)
- ❌ Open CORS policy
- ❌ No authentication tokens
- ⚠️ Anyone on hotspot can access

### For Production Deployment:

1. **Enable HTTPS:**
   ```bash
   # Use self-signed certificate for local network
   openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
   
   # Update Next.js to use HTTPS
   npm install https
   ```

2. **Add Hotspot Password Protection:**
   - Use strong WPA2 password
   - Change default hotspot name
   - Enable MAC address filtering (if supported)

3. **Implement API Authentication:**
   - Add JWT tokens
   - Require authentication header
   - Implement rate limiting

---

## 📱 Alternative Network Options

### If Mobile Hotspot Doesn't Work:

#### Option 1: WiFi Router (No Internet)
```
Create a local WiFi network without internet:
- Use travel router (TP-Link, GL.iNet)
- Set up SSID and password
- All devices connect to router
- Server IP will be from router's DHCP (usually 192.168.0.x or 192.168.1.x)
```

#### Option 2: Direct Ethernet Connection
```
Connect 2 laptops via Ethernet:
- Use crossover cable or regular cable (modern NICs auto-detect)
- Set static IPs:
  - Laptop 1: 192.168.2.1
  - Laptop 2: 192.168.2.2
- Subnet mask: 255.255.255.0
```

#### Option 3: Create WiFi Hotspot from Laptop
```powershell
# Windows 10/11 - Turn laptop into hotspot
# Settings → Network & Internet → Mobile hotspot
# Share internet from: WiFi (if connected) or Ethernet
# Other devices connect via WiFi
```

---

## 🆘 Emergency Backup Plan

### If Primary Phone Fails:

1. **Backup Phone Hotspot:**
   - Keep second phone ready
   - Pre-configure with same credentials
   - Note: IP addresses may change

2. **Laptop Hotspot:**
   - Use one laptop as WiFi access point
   - Others connect to it
   - Reconfigure server IP

3. **Offline Demo Mode:**
   - Use mock data (already in system)
   - Single laptop demonstration
   - Show pre-recorded video

---

## ✅ Quick Reference Card

**Print This for Demo Day:**

```
╔══════════════════════════════════════════════════════╗
║          NEXCARE-5G HOTSPOT QUICK REFERENCE          ║
╠══════════════════════════════════════════════════════╣
║ Hotspot Name:     NEXCARE-5G                        ║
║ Password:         nexcare2026                        ║
╠══════════════════════════════════════════════════════╣
║ Central Server:   192.168.43.10:3000                ║
║ Dashboard URL:    http://192.168.43.10:3000         ║
║ Health Check:     /api/health                        ║
╠══════════════════════════════════════════════════════╣
║ Laptop 1 (Server):     .10                          ║
║ Laptop 2 (NeoCare):    .20 → Room R2                ║
║ Laptop 3 (GeriCare):   .30 → Room R5                ║
║ Laptop 4 (Doctor):     .40                          ║
║ Laptop 5 (Monitor):    .50                          ║
╠══════════════════════════════════════════════════════╣
║ Login Credentials:                                   ║
║ - Doctor:  doctor / doctor123                       ║
║ - Monitor: monitor / monitor123                     ║
╠══════════════════════════════════════════════════════╣
║ Troubleshooting:                                     ║
║ 1. Ping server: ping 192.168.43.10                 ║
║ 2. Check firewall: Get-NetFirewallRule             ║
║ 3. Restart server: Ctrl+C then npm start           ║
║ 4. Check IP: ipconfig | findstr IPv4               ║
╚══════════════════════════════════════════════════════╝
```

---

## 📞 Support Commands

```powershell
# On Central Server - Monitor Incoming Connections
netstat -an | findstr :3000

# On Any Laptop - Test Server Connectivity
Test-NetConnection -ComputerName 192.168.43.10 -Port 3000

# Check Current IP Address
(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi").IPAddress

# View Firewall Rules
Get-NetFirewallRule -DisplayName "NEXCARE*"

# Monitor Network Traffic
Get-NetAdapterStatistics -Name "Wi-Fi" | Format-List

# Flush DNS Cache (if URLs not resolving)
ipconfig /flushdns

# Check Who's Connected (on phone)
# Android: Settings → Hotspot → Connected devices
# iPhone: Settings → Personal Hotspot → Connected devices
```

---

## 🎓 Summary

**What You've Learned:**
1. ✅ Configure mobile hotspot for multi-device network
2. ✅ Find and use IP addresses on local network
3. ✅ Configure Next.js server for external access
4. ✅ Set up Windows Firewall rules
5. ✅ Connect AI agents to central server
6. ✅ Enable WebRTC across devices
7. ✅ Troubleshoot common network issues

**Your System Can Now:**
- Run on ANY internet connection (mobile, WiFi, ethernet)
- Support 5-10 concurrent devices
- Provide sub-100ms latency on local network
- Work completely offline (no internet needed after initial setup)
- Scale from demo to production

**Next Steps:**
- Test full system with all laptops
- Time the setup process (should be <10 minutes)
- Practice demo flow
- Prepare backup plans
- Document any custom configurations

---

**Good luck with your demo! 🚀**

For issues, check:
1. Server logs in terminal
2. Browser console (F12)
3. AI agent logs
4. Phone hotspot status
