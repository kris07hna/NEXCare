# 🚀 START HERE - Multi-Laptop Mobile Hotspot Setup

**Your IP keeps changing?** ✅ This is normal with mobile hotspots!  
**Need to connect 3+ laptops?** ✅ This guide shows you how!

---

## ⚡ FASTEST WAY TO GET STARTED (5 Minutes)

### **Step 1: Enable Mobile Hotspot** (30 seconds)
```
Your Phone Settings → Mobile Hotspot → Turn ON
Write down the password: _________________
```

### **Step 2: Connect All Laptops** (1 minute)
Connect each laptop to your phone's WiFi hotspot you just created.

### **Step 3: Configure Central Server** (2 minutes)

**On the laptop that will run the main server:**

```powershell
# Navigate to project
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2

# Double-click this file (or run in PowerShell):
.\SETUP-NETWORK.bat

# When prompted, choose: 1 (This is the Central Server)
# It will show you the server IP like: 10.107.51.10
# Write it down: _________________
```

The script will:
- ✅ Automatically find your IP address
- ✅ Configure firewall settings
- ✅ Start the server for you

### **Step 4: Configure AI Agent Laptops** (2 minutes each)

**On each laptop that will run AI agents (NeoCare, GeriCare):**

```powershell
# Navigate to project
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2

# Double-click this file:
.\SETUP-NETWORK.bat

# When prompted:
# 1. Choose: 2 (This is an AI Agent Laptop)
# 2. Enter the server IP from Step 3
# 3. Choose: 1 (NeoCare) or 2 (GeriCare)
# 4. Accept default room/patient IDs or customize
```

The script will:
- ✅ Test connection to server
- ✅ Create .env file with correct settings
- ✅ Tell you exactly how to run the agent

---

## ✅ Verify It's Working

### **From Central Server Laptop:**
Open browser and go to:
```
http://localhost:3000
```
✅ You should see the NEXCARE dashboard

### **From Any Other Laptop:**
Open browser and go to:
```
http://10.107.51.10:3000
```
(Replace `10.107.51.10` with your actual server IP)

✅ You should see the same dashboard!

### **Test AI Agents:**
After running AI agents, check the dashboard - you should see room cards appear within 2 seconds.

---

## 📝 Your Setup Information

Fill this out for quick reference:

```
Mobile Hotspot Name: NEXCARE-5G
Password: _________________________

Central Server IP: _________________
(e.g., 10.107.51.10)

Dashboard URL: http://___________:3000

Laptop Configuration:
┌─────────────┬──────────────┬──────────┬────────┐
│ Laptop #    │ Role         │ IP       │ Status │
├─────────────┼──────────────┼──────────┼────────┤
│ 1 (Yours)   │ Server       │ ________ │   ☐    │
│ 2           │ NeoCare/R2   │ ________ │   ☐    │
│ 3           │ GeriCare/R5  │ ________ │   ☐    │
│ 4           │ Viewer       │ ________ │   ☐    │
└─────────────┴──────────────┴──────────┴────────┘
```

---

## 🐛 Quick Troubleshooting

### "I can't find my IP address!"

```powershell
# Run this command:
ipconfig

# Look for a section that says "Wireless LAN adapter Wi-Fi:"
# Under that, find "IPv4 Address"
# It will look like: 10.107.51.10 or 192.168.43.5

# NOT these:
# ❌ 127.0.0.1 (that's localhost)
# ❌ 169.254.x.x (that means no internet)
```

### "Other laptops can't access the server!"

**Quick Fix:**
```powershell
# On your server laptop, turn off firewall temporarily:
Windows Security → Firewall & network protection → Turn off

# Try accessing from other laptop again
```

**Permanent Fix:**
```powershell
# Run PowerShell as Administrator
New-NetFirewallRule -DisplayName "NEXCARE Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# Turn firewall back on
```

### "My IP keeps changing!"

This is normal! Mobile hotspots assign different IPs each time. 

**Quick Solution:**
Every time you reconnect:
1. Run `ipconfig` to get new IP
2. Update the IP in your documentation
3. Run `SETUP-NETWORK.bat` on agent laptops to update their .env files

**Better Solution (Manual IP):**
1. Go to WiFi settings → Properties
2. IP settings → Edit → Manual
3. Set IP: `10.107.51.10` (choose any ending number 2-254)
4. Subnet: `255.255.255.0`
5. Gateway: `10.107.51.1` (usually .1)
6. DNS: `8.8.8.8`
7. Save

Now your server will always have the same IP!

### "AI agent says 'Server not reachable'"

**Check Connection:**
```powershell
# From the AI agent laptop:
ping 10.107.51.10

# If you see "Reply from 10.107.51.10":
# ✅ Connection works! Issue is elsewhere

# If you see "Request timed out":
# ❌ Connection problem
```

**Solutions:**
1. Make sure both laptops are on same WiFi
2. Check server is running (`npm run dev`)
3. Check firewall is off or has rule for port 3000
4. Verify the server IP is correct

### "Dashboard shows 'No rooms online'"

This means AI agents aren't sending data. Check:

1. **Are AI agents running?** Look for terminals with Python agent running
2. **Check .env file:**
   ```powershell
   cat ai_agents\.env
   # Should show: EDGE_SERVER_URL=http://YOUR-SERVER-IP:3000
   ```
3. **Test API:**
   ```powershell
   curl http://YOUR-SERVER-IP:3000/api/health
   # Should return: {"status":"ok",...}
   ```

---

## 📚 More Help

**Detailed Guides:**
- [Mobile Hotspot Connection Guide](docs/MOBILE_HOTSPOT_CONNECTION_GUIDE.md) - Complete step-by-step
- [Quick Reference Card](docs/QUICK-REFERENCE.md) - Print this for demo day
- [Architecture Analysis](docs/ARCHITECTURE_ANALYSIS.md) - System design details

**Still Stuck?**
Check the terminal output for error messages - they usually tell you exactly what's wrong!

---

## 🎬 Demo Day Checklist

**1 Hour Before:**
- [ ] Phone charged to 100%
- [ ] Mobile hotspot turned ON
- [ ] All laptops charged
- [ ] All laptops connected to hotspot (same WiFi name)

**30 Minutes Before:**
- [ ] Run `SETUP-NETWORK.bat` on server laptop
- [ ] Note the server IP: ___________
- [ ] Server shows "Network: http://0.0.0.0:3000" ✅
- [ ] Dashboard accessible at http://localhost:3000 ✅

**15 Minutes Before:**
- [ ] Run `SETUP-NETWORK.bat` on each AI agent laptop
- [ ] All .env files have correct server IP ✅
- [ ] AI agents started and showing "✓ Report sent" ✅
- [ ] Dashboard shows room cards for all agents ✅
- [ ] Test from another device: http://[SERVER-IP]:3000 works ✅

**5 Minutes Before:**
- [ ] All systems running smoothly
- [ ] Take a screenshot of working dashboard (proof!)
- [ ] Keep terminals open and visible
- [ ] Have backup plan ready (WiFi router credentials)

---

## 🎯 Expected Results

**When everything is working:**

1. ✅ Central server shows:
   ```
   ▲ Next.js 16.1.6 (Turbopack)
   - Local:         http://localhost:3000
   - Network:       http://0.0.0.0:3000
   ```

2. ✅ AI agents show (every few seconds):
   ```
   [NeoCare-AI] ✓ Report sent: SLEEPING (confidence: 0.92)
   ```

3. ✅ Dashboard displays:
   - Room cards for each active agent
   - "Online" status (green)
   - Live vital signs updating
   - No error messages

4. ✅ From any laptop on the hotspot:
   - Can access http://[SERVER-IP]:3000
   - Can see the same dashboard
   - Can click through different pages

---

## 🚀 You're Ready!

Your multi-laptop NEXCARE-5G system should now be connected and working!

**What You Achieved:**
- ✅ Central server accessible from all laptops
- ✅ Each laptop can run different AI agents
- ✅ All data flows to one central dashboard
- ✅ Anyone on the network can view the dashboard
- ✅ Complete integrated hospital monitoring system!

**Next Steps:**
1. Try the demo flow (monitor patients, test fall detection)
2. Practice starting/stopping agents
3. Test video consultations between laptops
4. Prepare your presentation!

Good luck with your demo! 🎉

---

**Quick Commands Summary:**

```powershell
# Find IP
ipconfig | findstr IPv4

# Start everything
# Server: cd edge-server2 && npm run dev
# Agent:  cd edge-server2 && .\.venv\Scripts\Activate.ps1 && cd ai_agents && python neocare_agent.py

# Access
# Browser: http://[YOUR-SERVER-IP]:3000
```

**Problems? Re-run:** `SETUP-NETWORK.bat`  
**Still stuck? Read:** [MOBILE_HOTSPOT_CONNECTION_GUIDE.md](docs/MOBILE_HOTSPOT_CONNECTION_GUIDE.md)
