# 📱 Mobile Hotspot Multi-Laptop Setup Guide

## 🎯 Problem Solved
Your Next.js server shows `0.0.0.0:3000` which means it's ready to accept connections from other devices. The real IP addresses change depending on the network (like `10.107.51.10` on your mobile hotspot). This guide helps you connect all laptops correctly.

---

## ⚡ Quick Start (5 Minutes)

### **Step 1: Setup Mobile Hotspot**

**On Your Phone:**
1. Go to Settings → Mobile Hotspot/Tethering
2. Enable Mobile Hotspot
3. Set a Network Name (e.g., "NEXCARE-5G")
4. Set a Password (write it down!)
5. **IMPORTANT:** Keep phone charged and hotspot ON during the entire demo

---

### **Step 2: Find Your Central Server IP**

**On the Central Server Laptop (where you run `npm run dev`):**

```powershell
# Method 1: Quick way (Windows)
ipconfig | findstr /C:"IPv4"

# You'll see output like:
#   IPv4 Address. . . . . . . . . . . : 192.168.43.1      (ignore this - it's another network)
#   IPv4 Address. . . . . . . . . . . : 10.107.51.10     ✅ THIS IS YOUR SERVER IP
```

**Look for an IP starting with:**
- `192.168.x.x` (most common)
- `10.x.x.x` (like your `10.107.51.10`)
- `172.16.x.x` to `172.31.x.x`

**Write down this IP!** Example: `10.107.51.10`

---

### **Step 3: Start the Server**

**On Central Server Laptop:**

```powershell
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2

# Start the server (it will bind to 0.0.0.0 which is correct)
npm run dev
```

**You should see:**
```
▲ Next.js 16.1.6 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://0.0.0.0:3000          ← This is correct!
- Environments: .env.local
```

**Test from the same laptop:**
```powershell
# Open your browser and go to:
http://10.107.51.10:3000
# (Replace 10.107.51.10 with YOUR IP from Step 2)
```

✅ If the dashboard loads, your server is working!

---

### **Step 4: Connect Other Laptops**

#### **Laptop 2, 3, 4, etc. (AI Agent Laptops or Other Users)**

**A. Connect to Mobile Hotspot:**
1. Open WiFi settings
2. Find "NEXCARE-5G" (or your hotspot name)
3. Enter the password
4. Wait for "Connected" status

**B. Test Connection to Server:**

```powershell
# Ping the central server
ping 10.107.51.10
# (Replace with your server IP from Step 2)

# Expected output:
# Reply from 10.107.51.10: bytes=32 time=5ms TTL=64
# Reply from 10.107.51.10: bytes=32 time=3ms TTL=64
```

✅ If you see "Reply from", the connection works!

**C. Open Dashboard in Browser:**
```
http://10.107.51.10:3000
```

✅ If you see the NEXCARE dashboard, you're connected!

---

### **Step 5: Configure AI Agents on Other Laptops**

**On Each AI Agent Laptop:**

**Option A: Use Environment Variable (Quick)**

```powershell
# Windows PowerShell
$env:EDGE_SERVER_URL = "http://10.107.51.10:3000"

# Verify it's set
echo $env:EDGE_SERVER_URL

# Now run your AI agent
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2\ai_agents
python neocare_agent.py --server http://10.107.51.10:3000 --room R2
```

**Option B: Create .env File (Permanent)**

```powershell
# Navigate to ai_agents folder
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2\ai_agents

# Create/edit .env file
notepad .env
```

**Add this to .env:**
```env
EDGE_SERVER_URL=http://10.107.51.10:3000
ROOM_ID=R2
PATIENT_ID=P001
MODEL_PATH=yolov8n.pt
```

**Then run:**
```powershell
# Activate Python environment
& ..\.venv\Scripts\Activate.ps1

# Run NeoCare agent
python neocare_agent.py
```

**Expected Output:**
```
[NeoCare-AI] Room R2 - Starting...
[NeoCare-AI] Server: http://10.107.51.10:3000
[NeoCare-AI] ✓ Server health check passed
[NeoCare-AI] ✓ Report sent: AWAKE (confidence: 0.87)
```

---

## 🏥 Complete 3-Laptop Demo Setup

### **Network Topology**

```
         📱 Mobile Phone Hotspot
         Network: NEXCARE-5G
         ┌─────────────────────┐
         │   10.107.51.x       │
         └─────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
    Laptop 1   Laptop 2   Laptop 3
  (Server)    (NeoCare)  (GeriCare)
  10.107.51.10  10.107.51.11  10.107.51.12
  :3000        Python Agent  Python Agent
```

### **Laptop 1: Central Server**

**Purpose:** Main Next.js application
**IP:** `10.107.51.10` (example - yours may differ)
**Location:** Doctor's station

```powershell
# 1. Connect to NEXCARE-5G WiFi
# 2. Find IP address
ipconfig | findstr IPv4

# 3. Start server
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2
npm run dev

# 4. Keep this terminal open!
```

**Access from any device:**
- Dashboard: `http://10.107.51.10:3000`
- API Health: `http://10.107.51.10:3000/api/health`
- Room Monitoring: `http://10.107.51.10:3000/room-monitoring`

---

### **Laptop 2: NeoCare AI Agent**

**Purpose:** Baby monitoring (Room R2)
**IP:** `10.107.51.11` (auto-assigned)
**Location:** NICU room

```powershell
# 1. Connect to NEXCARE-5G WiFi

# 2. Verify connection to server
ping 10.107.51.10

# 3. Navigate to project
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2

# 4. Activate Python environment
& .venv\Scripts\Activate.ps1

# 5. Create .env file
cd ai_agents
notepad .env
```

**Add to .env:**
```env
EDGE_SERVER_URL=http://10.107.51.10:3000
ROOM_ID=R2
PATIENT_ID=P001
```

**Run agent:**
```powershell
python neocare_agent.py --mode webcam
```

---

### **Laptop 3: GeriCare AI Agent**

**Purpose:** Elderly fall detection (Room R5)
**IP:** `10.107.51.12` (auto-assigned)
**Location:** Geriatric ward

```powershell
# 1. Connect to NEXCARE-5G WiFi

# 2. Verify connection
ping 10.107.51.10

# 3. Setup
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2
& .venv\Scripts\Activate.ps1
cd ai_agents

# 4. Create .env
notepad .env
```

**Add to .env:**
```env
EDGE_SERVER_URL=http://10.107.51.10:3000
ROOM_ID=R5
PATIENT_ID=P002
```

**Run:**
```powershell
python gericare_agent.py --mode webcam
```

---

## 🔍 Troubleshooting

### ❌ Problem: "Can't find server IP" or IP keeps changing

**Solution:**
```powershell
# On Central Server Laptop, run this to see ALL network adapters:
ipconfig

# Look for "Wireless LAN adapter Wi-Fi:" section
# Find the IPv4 Address under that section
# That's your server IP on the mobile hotspot network
```

**Example Output:**
```
Wireless LAN adapter Wi-Fi:

   Connection-specific DNS Suffix  . : 
   Link-local IPv6 Address . . . . . : fe80::a123:4567:89ab:cdef%12
   IPv4 Address. . . . . . . . . . . : 10.107.51.10    ✅ THIS ONE!
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 10.107.51.1
```

---

### ❌ Problem: "Other laptops can't access server"

**Check 1: Firewall**
```powershell
# On Central Server Laptop, temporarily disable firewall for testing:
# Windows Security → Firewall & network protection → Turn off (Private network)
```

**Check 2: Ping Test**
```powershell
# From other laptop:
ping 10.107.51.10

# If "Request timed out" → firewall blocking
# If "Reply from..." → connection works, issue is elsewhere
```

**Check 3: Add Firewall Rule (Permanent Solution)**
```powershell
# On Central Server Laptop (PowerShell as Administrator):
New-NetFirewallRule -DisplayName "NEXCARE Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

---

### ❌ Problem: "IP address changes every time"

**Why:** Mobile hotspots often assign different IPs each time you connect.

**Solution A: Manual IP (Quick Fix)**

Every time you start:
1. Check server IP: `ipconfig`
2. Update all .env files on AI agent laptops
3. Restart agents

**Solution B: Static IP (Better)**

**On Central Server Laptop:**
1. Right-click WiFi icon → Network settings
2. Click your WiFi connection → Properties
3. IP settings → Edit → Manual
4. Set:
   - IP address: `10.107.51.10` (choose one in range)
   - Subnet: `255.255.255.0`
   - Gateway: `10.107.51.1` (usually .1)
   - DNS: `8.8.8.8`
5. Save

Now your server will always be `10.107.51.10`!

---

### ❌ Problem: "AI agent can't send reports"

**Check API endpoint is accessible:**
```powershell
# From AI agent laptop:
curl http://10.107.51.10:3000/api/health

# Expected response:
# {"status":"ok","timestamp":1707408000000}
```

**If that works, test report endpoint:**
```powershell
curl -X POST http://10.107.51.10:3000/api/reports `
  -H "Content-Type: application/json" `
  -d '{\"room_id\":\"R2\",\"module\":\"NeoCare-AI\",\"status\":\"TEST\",\"confidence\":0.95,\"timestamp\":1707408000}'
```

**Check AI agent logs:**
```powershell
# Look for errors in the Python agent terminal
# Common issues:
# - Wrong server URL
# - Server not running
# - Firewall blocking
```

---

### ❌ Problem: "Dashboard doesn't update in real-time"

**Current System Uses Polling (2 seconds)**

This is normal! The dashboard refreshes every 2 seconds. When an AI agent sends a report:
- Wait up to 2 seconds
- Dashboard will update automatically

**To verify it's working:**
1. Open dashboard: `http://10.107.51.10:3000`
2. Run AI agent on another laptop
3. Watch the dashboard - you should see room cards appear within 2 seconds

---

### ❌ Problem: "Mobile hotspot disconnects"

**Solutions:**
1. **Keep phone plugged in** - charging prevents auto-sleep
2. **Disable battery optimization** for hotspot
3. **Keep screen on** or disable auto-lock
4. **Use a dedicated hotspot device** if available
5. **Backup plan:** Have a WiFi router available

---

## 📋 Pre-Demo Checklist

**30 Minutes Before Demo:**

- [ ] **Phone:** Charged to 100%, hotspot enabled, password ready
- [ ] **All Laptops:** Charged, connected to mobile hotspot
- [ ] **Central Server:**
  - [ ] IP address written down: `_____________`
  - [ ] `npm run dev` running successfully
  - [ ] Dashboard accessible in browser
  - [ ] API health check returns OK
- [ ] **AI Agent Laptops:**
  - [ ] .env files updated with correct server IP
  - [ ] Python environments activated
  - [ ] Webcams working, pointed at test subjects
  - [ ] Test run completed (agents send reports successfully)
- [ ] **Network:**
  - [ ] All laptops can ping central server
  - [ ] Firewall rule added for port 3000
  - [ ] Backup WiFi available (if hotspot fails)

**Test Run (5 minutes before):**
```powershell
# Laptop 1: Server running
# Laptop 2: Start NeoCare agent
# Laptop 3: Start GeriCare agent
# Open dashboard - verify 2 room cards appear
# ✅ If yes, you're ready!
```

---

## 🚀 Quick Commands Reference

### Central Server Laptop

```powershell
# Find IP
ipconfig | findstr IPv4

# Start server
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2
npm run dev

# Test locally
start http://localhost:3000

# Add firewall rule (once)
New-NetFirewallRule -DisplayName "NEXCARE" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### AI Agent Laptops

```powershell
# Test connection
ping 10.107.51.10
curl http://10.107.51.10:3000/api/health

# Setup
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2
& .venv\Scripts\Activate.ps1
cd ai_agents

# Create .env
echo EDGE_SERVER_URL=http://10.107.51.10:3000 > .env
echo ROOM_ID=R2 >> .env

# Run agent
python neocare_agent.py
```

### Any Device (Access Dashboard)

```
# In browser:
http://10.107.51.10:3000              # Dashboard
http://10.107.51.10:3000/neocare      # NeoCare monitoring
http://10.107.51.10:3000/gericare     # GeriCare monitoring
http://10.107.51.10:3000/room-monitoring  # All rooms
```

---

## 🎯 Success Criteria

**You know it's working when:**

1. ✅ All laptops show "Connected" to mobile hotspot
2. ✅ Central server shows "Network: http://0.0.0.0:3000"
3. ✅ Other laptops can access `http://10.107.51.10:3000` in browser
4. ✅ AI agents show "✓ Report sent" in terminal
5. ✅ Dashboard displays room cards with live data
6. ✅ Room status updates within 2 seconds of AI agent activity

---

## 🎬 Demo Day Script

**5 Minutes Before:**
1. Enable mobile hotspot
2. Connect all laptops
3. Start central server
4. Verify dashboard accessible
5. Start AI agents
6. Confirm all rooms show "Online" on dashboard

**During Demo:**
1. Show dashboard with live data from all rooms
2. Demonstrate fall detection (lie down in front of GeriCare laptop)
3. Show alert appears on dashboard within 2 seconds
4. Start a video consultation from any laptop
5. Show patient records and AI reports

**If Something Breaks:**
- **AI agent stops:** Restart it (takes 10 seconds)
- **Hotspot fails:** Switch to WiFi router (prepare SSID + password)
- **Server crashes:** `npm run dev` again
- **IP changes:** Quick `ipconfig`, update agents, restart

---

## ✅ Summary

**What You Learned:**
1. How to find your server's IP address on mobile hotspot
2. How to configure multiple laptops to connect to one central server
3. How to set up AI agents to send data to the server
4. How to troubleshoot common connection issues

**Key Takeaway:**
- Server IP (e.g., `10.107.51.10`) changes with network
- Always check `ipconfig` to find current IP
- Update all .env files with the new IP
- Add firewall rule for port 3000
- Keep phone charged during demo!

**Your Setup:**
```
Mobile Hotspot → All Laptops Connected
Server: http://10.107.51.10:3000
Agent configs: .env files point to server
Result: Integrated multi-laptop system! ✅
```

---

Need help? Check the terminal output for error messages and refer to the troubleshooting section above!
