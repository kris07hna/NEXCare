# Network Connection Troubleshooting Guide

## ✅ Files Already in GitHub

The network setup files ARE in the repository:
- `SETUP-NETWORK.bat` ✅
- `setup-network.ps1` ✅  
- `scripts/setup-network.ps1` ✅

**To get them on another laptop:**
```bash
git pull origin master
```

---

## 🔴 Common Issue: "IP Changing Laptop to Laptop"

### This is NORMAL and EXPECTED behavior!

**How Mobile Hotspots Work:**

```
Mobile Hotspot Network: 10.107.51.x

┌─────────────────────┐
│  Your Phone Hotspot │  Gateway: 10.107.51.1
└──────────┬──────────┘
           │
    ┌──────┴───────┬──────────┬──────────┐
    │              │          │          │
Laptop 1       Laptop 2   Laptop 3   Phone
(Server)       (Agent 1)  (Agent 2)  (Viewer)
10.107.51.130  10.107.51.145  10.107.51.156  10.107.51.200
```

**Each device gets a DIFFERENT IP - this is correct!**

---

## ✅ Correct Configuration

### Laptop 1 - Central Server (Your Main Laptop)

**IP Address:** 10.107.51.130 (this is the server IP)

**Configuration:**
```bash
# Run this on Laptop 1
.\SETUP-NETWORK.bat
# Choose option 1: Central Server
```

**Result:**
- Server runs on: http://10.107.51.130:3000
- Other laptops connect TO this IP

---

### Laptop 2 - AI Agent (NeoCare)

**IP Address:** 10.107.51.145 (DIFFERENT from server - this is normal!)

**Configuration:**
```bash
# Run this on Laptop 2
.\SETUP-NETWORK.bat
# Choose option 2: AI Agent
# Enter SERVER IP: 10.107.51.130  ← Use Laptop 1's IP!
# Choose agent: 1 (NeoCare)
# Room ID: R2
```

**What it creates:**
```env
# ai_agents/.env on Laptop 2
EDGE_SERVER_URL=http://10.107.51.130:3000  ← Points to Laptop 1
ROOM_ID=R2
MODULE=NeoCare-AI
```

---

### Laptop 3 - AI Agent (GeriCare)

**IP Address:** 10.107.51.156 (DIFFERENT from server - this is normal!)

**Configuration:**
```bash
# Run this on Laptop 3  
.\SETUP-NETWORK.bat
# Choose option 2: AI Agent
# Enter SERVER IP: 10.107.51.130  ← Use Laptop 1's IP!
# Choose agent: 2 (GeriCare)
# Room ID: R5
```

**What it creates:**
```env
# ai_agents/.env on Laptop 3
EDGE_SERVER_URL=http://10.107.51.130:3000  ← Points to Laptop 1
ROOM_ID=R5
MODULE=GeriCare-AI
```

---

## 🎯 Key Understanding

### ❌ WRONG Thinking:
"All laptops should have the same IP address"

### ✅ CORRECT Thinking:
"All AI agent laptops point to the SAME server IP (10.107.51.130), but each laptop has its OWN unique IP"

---

## 🔧 Step-by-Step Demo Setup

### Step 1: Find Server IP (Laptop 1)

```bash
# On Laptop 1 (central server)
ipconfig | findstr IPv4

# Output:
IPv4 Address. . . . . . . . . . . : 10.107.51.130
```

**Write this down:** `10.107.51.130` ← This is your server IP

---

### Step 2: Verify All Laptops on Same Network

```bash
# On Laptop 2
ipconfig | findstr IPv4
# Should show: 10.107.51.145 (or similar 10.107.51.x)

# On Laptop 3
ipconfig | findstr IPv4
# Should show: 10.107.51.156 (or similar 10.107.51.x)
```

**All should start with `10.107.51.` ✅**

---

### Step 3: Start Central Server (Laptop 1)

```bash
# On Laptop 1
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2
npm run dev
```

**Verify it's running:**
- Local: http://localhost:3000 ✅
- Network: http://10.107.51.130:3000 ✅

---

### Step 4: Configure AI Agent (Laptop 2)

```bash
# On Laptop 2
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2
.\SETUP-NETWORK.bat

# When asked for Server IP, enter: 10.107.51.130
```

**Start the agent:**
```bash
.\.venv\Scripts\Activate.ps1
cd ai_agents
python neocare_agent.py
```

**Should see:**
```
>> Starting NeoCare-AI for R2
>> Checking server health...
✓ Server is healthy
>> Report sent: SLEEPING (conf: 0.95)
```

---

### Step 5: Test Connection from Laptop 2

**Open browser on Laptop 2:**
```
http://10.107.51.130:3000
```

**Should see:**
- Dashboard loads ✅
- Room R2 appears ✅
- Status updates every 2 seconds ✅

---

## 🚨 Troubleshooting

### Issue 1: "Cannot reach server"

**Problem:** Laptop 2 can't connect to http://10.107.51.130:3000

**Solutions:**

1. **Verify same network:**
   ```bash
   # On both laptops
   ipconfig | findstr IPv4
   # Both should show 10.107.51.x
   ```

2. **Check firewall (Laptop 1):**
   ```powershell
   # Run as Administrator on Laptop 1
   Get-NetFirewallRule -DisplayName "NEXCARE Server"
   # Should show: Enabled = True
   ```

3. **Restart server (Laptop 1):**
   ```bash
   Ctrl+C  # Stop server
   npm run dev  # Start again
   ```

---

### Issue 2: "IP keeps changing when reconnecting"

**This is normal!** Dynamic IP assignment.

**Solution A: Static IP (Recommended for Demo)**

**On Windows (each laptop):**
1. Open Settings → Network → WiFi
2. Click on mobile hotspot connection
3. Click "Edit" under IP assignment
4. Set manual IP:
   - Laptop 1: 10.107.51.130
   - Laptop 2: 10.107.51.140
   - Laptop 3: 10.107.51.150
   - Subnet: 255.255.255.0
   - Gateway: 10.107.51.1

**Solution B: Re-run Setup Script**

```bash
# After reconnecting, just run:
.\SETUP-NETWORK.bat

# It will auto-detect new IP and update configs
```

---

### Issue 3: "Dashboard shows 'No rooms online'"

**Check:**

1. **AI agent running?**
   ```bash
   # On Laptop 2/3
   python neocare_agent.py
   # Should show: >> Report sent: ...
   ```

2. **Correct server URL in .env?**
   ```bash
   # On Laptop 2/3
   cat ai_agents\.env
   # Should show: EDGE_SERVER_URL=http://10.107.51.130:3000
   ```

3. **Check server logs:**
   ```bash
   # On Laptop 1 (server terminal)
   # Should show: [API /reports POST] ✓ Report created: NeoCare-AI - R2 - SLEEPING
   ```

---

## 📊 Expected Network Topology

```
┌───────────────────────────────────────────────┐
│        Mobile Hotspot: 10.107.51.0/24         │
│                                               │
│  ┌──────────────┐      ┌──────────────┐      │
│  │  Laptop 1    │      │  Laptop 2    │      │
│  │  (Server)    │◄─────│  (NeoCare)   │      │
│  │ .130:3000    │      │  .145        │      │
│  └──────┬───────┘      └──────────────┘      │
│         │                                     │
│         │              ┌──────────────┐      │
│         └──────────────│  Laptop 3    │      │
│                        │  (GeriCare)  │      │
│                        │  .156        │      │
│                        └──────────────┘      │
└───────────────────────────────────────────────┘

Data Flow:
Laptop 2 → http://10.107.51.130:3000/api/reports (POST)
Laptop 3 → http://10.107.51.130:3000/api/reports (POST)
Browser → http://10.107.51.130:3000 (GET dashboard)
```

---

## ✅ Quick Verification Checklist

**Before Demo:**

- [ ] All laptops connected to same mobile hotspot
- [ ] All laptops have IPs in range 10.107.51.x
- [ ] Server IP written down: `______________`
- [ ] Firewall rule added on Laptop 1
- [ ] `.env` files created with correct server IP
- [ ] Server running: http://10.107.51.130:3000 accessible
- [ ] AI agents sending reports (check server logs)
- [ ] Dashboard shows rooms online

---

## 📞 Quick Commands Reference

**Find your IP:**
```bash
ipconfig | findstr IPv4
```

**Test server connectivity:**
```bash
# From any laptop
Invoke-WebRequest -Uri "http://10.107.51.130:3000/api/health"
```

**View server IP from file:**
```bash
# On Laptop 1
cat SERVER_IP.txt
```

**Re-configure after IP change:**
```bash
.\SETUP-NETWORK.bat
```

---

## 🎓 Why Each Laptop Has Different IP

**Network Basics:**

1. **DHCP Server** (in phone) assigns unique IPs to each device
2. **IP Range:** 10.107.51.1 to 10.107.51.254 (254 possible devices)
3. **Gateway:** 10.107.51.1 (your phone)
4. **Server:** 10.107.51.130 (Laptop 1 - can change if reconnecting)
5. **Clients:** 10.107.51.145, .156, etc. (Laptops 2, 3, etc.)

**This is how ALL networks work - WiFi, Ethernet, Mobile Hotspot**

**The Fix:** All clients point to the server's IP, not their own!

---

## 🚀 Production Tip

For permanent deployment (hospital, clinic):

1. **Use WiFi Router** with static IP assignment
2. **Or use DNS:** Give server a name like `nexcare-server.local`
3. **Or use IP reservation:** Router always gives Laptop 1 the same IP

**For your demo:** Re-run `SETUP-NETWORK.bat` after each reconnection to auto-update IPs ✅
