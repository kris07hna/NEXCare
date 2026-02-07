# NEXCARE-5G Quick Start Card
## Mobile Hotspot Multi-Device Setup

---

## 📱 **1. ENABLE MOBILE HOTSPOT**

### Android:
```
Settings → Network & Internet → Hotspot & Tethering
Network Name: NEXCARE-5G
Password: nexcare2026
Toggle: ON
```

### iPhone:
```
Settings → Personal Hotspot
Password: nexcare2026
Toggle: ON
```

---

## 💻 **2. SETUP CENTRAL SERVER (Laptop 1)**

### Windows (PowerShell):
```powershell
# Navigate to project
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2

# Run automated setup (RECOMMENDED)
.\setup-hotspot.ps1

# OR Manual setup:
# 1. Find IP: ipconfig | findstr IPv4
# 2. Create .env.local with your IP
# 3. Allow firewall port 3000
# 4. Build and start:
npm run build
npm start
```

### Mac/Linux:
```bash
cd /path/to/edge-server2
chmod +x setup-hotspot.sh
./setup-hotspot.sh
npm run build
npm start
```

**Expected output:**
```
▲ Next.js 16.1.6
- Local:    http://localhost:3000
- Network:  http://192.168.43.10:3000  ← Use this IP!
```

---

## 🤖 **3. SETUP AI AGENTS (Laptops 2-3)**

### Option A: Automated (PowerShell):
```powershell
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2\ai_agents

# Run setup script
.\setup-agent.ps1

# Follow prompts:
# - Enter server IP: 192.168.43.10
# - Choose room ID: R2 (or R5)
# - Choose agent: NeoCare (or GeriCare)
```

### Option B: Manual:
```powershell
# 1. Create .env file
EDGE_SERVER_URL=http://192.168.43.10:3000
ROOM_ID=R2
MODULE=NeoCare-AI

# 2. Activate venv and run
.\venv\Scripts\Activate.ps1
python neocare_agent.py --room R2 --server http://192.168.43.10:3000
```

---

## 🖥️ **4. ACCESS FROM OTHER DEVICES (Laptops 4-5)**

### Doctor Console / Room Monitor:
```
1. Connect to NEXCARE-5G hotspot
2. Open browser: http://192.168.43.10:3000
3. Login with credentials:
   - Doctor: doctor / doctor123
   - Monitor: monitor / monitor123
```

---

## 🧪 **5. VERIFY CONNECTIVITY**

### On each laptop, test:
```powershell
# Test 1: Ping server
ping 192.168.43.10

# Test 2: Check API
curl http://192.168.43.10:3000/api/health

# Test 3: Open dashboard
# Open browser: http://192.168.43.10:3000
```

**Expected:** All tests should succeed!

---

## 🔧 **QUICK TROUBLESHOOTING**

### ❌ "Cannot reach server"
```powershell
# On server laptop:
netstat -an | findstr :3000
# Should show: TCP 0.0.0.0:3000 ... LISTENING

# Check firewall:
Get-NetFirewallRule -DisplayName "NEXCARE*"

# Temporarily disable to test:
Set-NetFirewallProfile -Profile Private -Enabled False
```

### ❌ "Connection refused"
```powershell
# Restart server:
# Press Ctrl+C to stop
npm start

# Check correct IP:
ipconfig | findstr IPv4
```

### ❌ "AI agent can't connect"
```powershell
# Verify server URL in .env:
cat .env | findstr SERVER

# Should match server IP exactly
```

### ❌ "WebRTC video fails"
```
1. Check both devices on same network
2. Grant camera/microphone permissions
3. Use Chrome/Edge (best WebRTC support)
4. Check NEXT_PUBLIC_SIGNALING_SERVER_URL in .env.local
```

---

## 📊 **IP ADDRESS REFERENCE**

**Quick lookup - Update these with your actual IPs:**

| Device | Purpose | IP Address | Port |
|--------|---------|------------|------|
| Phone | Hotspot Gateway | 192.168.43.1 | - |
| Laptop 1 | Central Server | 192.168.43.10 | 3000 |
| Laptop 2 | NeoCare Agent (R2) | 192.168.43.20 | - |
| Laptop 3 | GeriCare Agent (R5) | 192.168.43.30 | - |
| Laptop 4 | Doctor Console | 192.168.43.40 | - |
| Laptop 5 | Room Monitor | 192.168.43.50 | - |

**To find your IP:**
- Windows: `ipconfig | findstr IPv4`
- Mac/Linux: `ifconfig | grep inet`

---

## 🎬 **DEMO DAY CHECKLIST**

### 2 Hours Before:
- [ ] Phone charged to 100%
- [ ] Enable hotspot
- [ ] Connect all laptops
- [ ] Run setup-hotspot.ps1 on server
- [ ] Note server IP address
- [ ] Test API: `curl http://<IP>:3000/api/health`

### 30 Minutes Before:
- [ ] Start central server: `npm start`
- [ ] Run AI agents on laptops 2-3
- [ ] Open dashboards on laptops 4-5
- [ ] Test video call
- [ ] Verify all rooms showing online

### During Demo:
- [ ] Keep phone plugged in
- [ ] Monitor server terminal
- [ ] Watch for disconnections
- [ ] Check data usage

---

## 📞 **COMMON COMMANDS**

### Server Management:
```powershell
# Start server
npm start

# Stop server
Ctrl + C

# Restart server
Ctrl + C, then npm start

# Check if running
netstat -an | findstr :3000

# View logs
# Check terminal output
```

### Network Diagnostics:
```powershell
# Find your IP
ipconfig | findstr IPv4

# Test connectivity
ping <server-ip>
Test-NetConnection -ComputerName <server-ip> -Port 3000

# Check firewall
Get-NetFirewallRule -DisplayName "NEXCARE*"

# Monitor connections
netstat -an | findstr :3000
```

### Database:
```powershell
# Initialize/reset database
npx tsx scripts/seed.ts

# Open database browser
npm run db:studio
```

---

## 🆘 **EMERGENCY RECOVERY**

### If Everything Breaks:

1. **Restart Hotspot:**
   - Turn off phone hotspot
   - Wait 10 seconds
   - Turn back on
   - Reconnect all laptops

2. **Restart Server:**
   ```powershell
   Ctrl + C  # Stop server
   npm start # Restart
   ```

3. **Reset Configuration:**
   ```powershell
   del .env.local
   .\setup-hotspot.ps1  # Re-run setup
   ```

4. **Fallback to Localhost:**
   - Run everything on one laptop
   - Use `npm run dev:local`
   - Demo from single device

---

## 📚 **DOCUMENTATION**

- **Full Setup Guide:** `docs/MOBILE_HOTSPOT_SETUP.md`
- **Architecture Analysis:** See GitHub Copilot chat history
- **Deployment Guide:** `docs/markdown/DEPLOYMENT.md`
- **API Reference:** Test at `http://<IP>:3000/api/health`

---

## 🎯 **SUCCESS INDICATORS**

You're ready when:
- ✅ Server shows: `- Network: http://192.168.43.10:3000`
- ✅ AI agents print: `✓ Report sent: SLEEPING (conf: 0.87)`
- ✅ Dashboard shows: "Total Rooms: 2" with green status
- ✅ Video call works between 2 laptops
- ✅ All laptops can ping server
- ✅ curl returns `{"status":"ok"}`

---

## 💡 **PRO TIPS**

1. **Save Server IP:** Write it on a sticky note, put near laptop
2. **Test Early:** Run full setup 1 day before demo
3. **Backup Plan:** Have second phone ready as hotspot
4. **Monitor Data:** Video uses ~2-5 MB/minute
5. **Stay Close:** Keep laptops within 5m of phone
6. **Use 5GHz:** If phone supports, better speed
7. **Disable Sleep:** Prevent laptops from sleeping during demo
8. **Close Apps:** Close unnecessary apps to save bandwidth

---

**FOR HELP:** Check `docs/MOBILE_HOTSPOT_SETUP.md` or terminal output

**Generated:** February 2026 | **NEXCARE-5G v0.1.0**
