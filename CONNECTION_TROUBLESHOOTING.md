# 🔴 CONNECTION PROBLEM DIAGNOSIS & SOLUTION

## ❌ **ROOT CAUSES IDENTIFIED:**

### **1. FIREWALL NOT CONFIGURED** ⚠️ **CRITICAL**
- **Problem:** Windows Firewall is blocking all incoming connections
- **Impact:** Friends' laptops cannot reach your server
- **Fix:** Run firewall setup scripts

### **2. NETWORK DISCOVERY DISABLED** ⚠️
- **Problem:** Windows network discovery is off
- **Impact:** Devices can't find each other on network
- **Fix:** Enable network discovery

### **3. FRIENDS USING WRONG IP ADDRESS** ⚠️
- **Problem:** Friends' `.env` files have incorrect `EDGE_SERVER_HOST`
- **Your IP:** `10.107.51.130`
- **Impact:** Their agents are connecting to wrong address
- **Fix:** Update their `.env` files

### **4. SAME NETWORK REQUIREMENT** ⚠️
- **Problem:** Friends must be on the SAME Wi-Fi network
- **Impact:** Cannot connect across different networks
- **Fix:** All laptops connect to same Wi-Fi

### **5. SERVERS NOT RUNNING** ⚠️
- **Problem:** Next.js or Flask backend might not be running
- **Impact:** No service to connect to
- **Fix:** Start both servers

---

## ✅ **COMPLETE FIX PROCEDURE**

### **ON YOUR LAPTOP (Server):**

#### **Step 1: Run Quick Fix Script**
```powershell
# Right-click PowerShell -> Run as Administrator
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2
.\QUICK_FIX.ps1
```

Or run the diagnostic:
```powershell
.\DIAGNOSE_AND_FIX_CONNECTION.bat
```

#### **Step 2: Manually Configure Firewall (if script fails)**
```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "NeoCare-Server-3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -Profile Domain,Private,Public
New-NetFirewallRule -DisplayName "NeoCare-Server-5000" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow -Profile Domain,Private,Public
New-NetFirewallRule -DisplayName "NeoCare-WebRTC" -Direction Inbound -Protocol TCP -LocalPort 8080-8090 -Action Allow -Profile Domain,Private,Public
Set-NetFirewallRule -DisplayGroup "Network Discovery" -Enabled True -Profile Private
```

#### **Step 3: Start Servers**

**Terminal 1 - Next.js Frontend:**
```powershell
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2
npm run dev
```

**Terminal 2 - Flask Backend:**
```powershell
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2\backend
python app.py
```

#### **Step 4: Verify Servers Running**
Check output shows:
- Next.js: `Network: http://10.107.51.130:3000`
- Flask: `Running on http://0.0.0.0:5000`

#### **Step 5: Test from Your Laptop**
```powershell
# Test locally
curl http://localhost:3000
curl http://localhost:5000/sensor_data

# Test from network IP
curl http://10.107.51.130:3000
curl http://10.107.51.130:5000/sensor_data
```

All should respond successfully!

---

### **ON FRIENDS' LAPTOPS (AI Agents):**

#### **Step 1: Ensure Same Network**
```powershell
# Check you're on same Wi-Fi
ipconfig | findstr "IPv4"
# Should show 10.107.51.xxx (same subnet as server)
```

#### **Step 2: Test Basic Connectivity**
```powershell
# Ping the server
ping 10.107.51.130

# Should get replies, not timeout
```

#### **Step 3: Configure AI Agent**
```powershell
cd C:\path\to\NEXCARE-5G\edge-server2\ai_agents

# Copy environment file
copy .env.example .env

# Edit .env file
notepad .env
```

**Required Settings in `.env`:**
```env
# CRITICAL: Use your server IP!
EDGE_SERVER_HOST=10.107.51.130
EDGE_SERVER_PORT=3000
EDGE_SERVER_URL=http://10.107.51.130:3000

BACKEND_SERVER_HOST=10.107.51.130
BACKEND_SERVER_PORT=5000
BACKEND_SERVER_URL=http://10.107.51.130:5000

# UNIQUE for each friend
ROOM_ID=R3              # R3, R4, R5, etc.
PATIENT_ID=P003         # P003, P004, P005, etc.
AGENT_ID=neocare-agent-003   # Unique ID

# Other settings
ARDUINO_PORT=COM6       # Change if different
CAMERA_INDEX=0
DEPLOYMENT_LOCATION=Laptop-Friend-1
```

#### **Step 4: Configure Firewall on Friend's Laptop**
```powershell
# Right-click PowerShell -> Run as Administrator
cd ai_agents
.\setup-firewall-agent.ps1
```

#### **Step 5: Test Connection**
```powershell
# Test network connectivity
python network_tester.py --server 10.107.51.130
```

Expected output:
```
✅ Basic Connectivity (Ping) - PASS
✅ Next.js Frontend (Port 3000) - PASS
✅ Flask Backend (Port 5000) - PASS
✅ Next.js HTTP Endpoint - PASS
✅ Backend API Endpoint - PASS
```

#### **Step 6: Start AI Agent**
```powershell
python neocare_agent.py
```

Expected output:
```
==================================================
         NeoCare AI Agent - Starting              
==================================================
Server:     http://10.107.51.130:3000
Room:       R3
Patient:    P003

[OK] Connected to Arduino on COM6!
[OK] Webcam ready!

[OK] [14:30:15] Sent: Awake | Temp: 36.5C | BPM: 130
```

---

## 🔍 **TROUBLESHOOTING**

### **Issue: "Cannot reach server"**

**Check:**
1. Are both on same Wi-Fi?
   ```powershell
   ipconfig | findstr "IPv4"
   # Both should show 10.107.51.xxx
   ```

2. Can you ping the server?
   ```powershell
   ping 10.107.51.130
   # Should get replies
   ```

3. Is server firewall off?
   ```powershell
   # Temporarily disable to test
   netsh advfirewall set allprofiles state off
   # Test connection
   # Then re-enable:
   netsh advfirewall set allprofiles state on
   ```

4. Are servers running on server laptop?
   ```powershell
   netstat -ano | findstr ":3000"
   netstat -ano | findstr ":5000"
   # Should show LISTENING
   ```

### **Issue: "Port not accessible"**

**Check:**
1. Firewall rules exist:
   ```powershell
   Get-NetFirewallRule -DisplayName "*NeoCare*"
   ```

2. Ports are open:
   ```powershell
   Test-NetConnection -ComputerName 10.107.51.130 -Port 3000
   Test-NetConnection -ComputerName 10.107.51.130 -Port 5000
   ```

3. Try from browser:
   ```
   http://10.107.51.130:3000
   http://10.107.51.130:5000/sensor_data
   ```

### **Issue: "Different network"**

If friends are on different Wi-Fi:
1. Connect to same Wi-Fi network
2. Or use Mobile Hotspot from server laptop
3. Or configure router port forwarding (advanced)

### **Issue: Router blocking**

Some routers have "AP Isolation" or "Client Isolation":
1. Log into router admin (usually 192.168.1.1)
2. Find "AP Isolation" setting
3. Disable it
4. Restart router

---

## 📊 **VERIFICATION CHECKLIST**

### **Server Laptop:**
- [x] Firewall rules created
- [x] Network discovery enabled
- [x] Next.js running on port 3000
- [x] Flask running on port 5000
- [x] Ports accessible from network
- [x] IP address is 10.107.51.130

### **Friend's Laptop:**
- [ ] On same Wi-Fi network
- [ ] Can ping server (ping 10.107.51.130)
- [ ] .env configured with server IP
- [ ] Firewall configured
- [ ] network_tester.py passes all tests
- [ ] AI agent starts and connects

---

## 🚀 **QUICK COMMAND REFERENCE**

### **Server Commands:**
```powershell
# Start servers
npm run dev                    # Terminal 1
python backend/app.py          # Terminal 2

# Check if running
netstat -ano | findstr ":3000 :5000"

# Check firewall
Get-NetFirewallRule -DisplayName "*NeoCare*"

# Get your IP
ipconfig | findstr "IPv4"
```

### **Friend Commands:**
```powershell
# Test connection
ping 10.107.51.130
python network_tester.py --server 10.107.51.130

# Start agent
python neocare_agent.py

# Check logs
Get-Content logs\neocare_agent.log -Tail 20 -Wait
```

---

## 💡 **COMMON MISTAKES**

1. ❌ **Using localhost instead of network IP**
   - Wrong: `EDGE_SERVER_HOST=localhost`
   - Right: `EDGE_SERVER_HOST=10.107.51.130`

2. ❌ **Different Wi-Fi networks**
   - Server on "Home-WiFi", Friend on "Home-WiFi-5G" → Won't work
   - Both must be on exact same network

3. ❌ **Firewall not configured**
   - Must run setup-firewall scripts as Administrator

4. ❌ **Server not running**
   - Must have both Next.js AND Flask running

5. ❌ **Using same ROOM_ID**
   - Each friend needs unique ROOM_ID: R3, R4, R5...

---

## 📞 **STILL NOT WORKING?**

Run full diagnostic:
```powershell
# On server laptop (as Administrator)
.\DIAGNOSE_AND_FIX_CONNECTION.bat
```

This will:
- Check all firewall rules
- Test all ports
- Verify servers running
- Create friend setup instructions
- Test connectivity

---

**Last Updated:** February 8, 2026  
**Your Server IP:** 10.107.51.130
