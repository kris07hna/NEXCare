# 📋 NEXCARE-5G Quick Reference Card

Print this or keep it on your phone during setup!

---

## 🔧 Setup Steps (First Time)

### 1️⃣ Mobile Hotspot
```
Phone Settings → Hotspot → Enable
Name: NEXCARE-5G
Password: _____________ (write here)
```

### 2️⃣ Central Server Laptop
```powershell
# Find IP
ipconfig | findstr IPv4
# Your IP: _____________ (write here)

# Start server
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2
npm run dev
```

### 3️⃣ Other Laptops
```
1. Connect to NEXCARE-5G WiFi
2. Double-click: SETUP-NETWORK.bat
3. Choose option 2 (AI Agent)
4. Enter server IP from step 2
5. Run AI agent
```

---

## ⚡ Quick Commands

### Find Your IP (any laptop)
```powershell
ipconfig | findstr IPv4
```

### Test Connection (from other laptops)
```powershell
ping [SERVER-IP]
curl http://[SERVER-IP]:3000/api/health
```

### Start Central Server
```powershell
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2
npm run dev
```

### Start NeoCare Agent
```powershell
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2
.\.venv\Scripts\Activate.ps1
cd ai_agents
python neocare_agent.py
```

### Start GeriCare Agent
```powershell
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2
.\.venv\Scripts\Activate.ps1
cd ai_agents
python gericare_agent.py
```

---

## 🌐 Access URLs (replace [IP] with server IP)

```
Dashboard:       http://[IP]:3000
API Health:      http://[IP]:3000/api/health
Room Monitor:    http://[IP]:3000/room-monitoring
NeoCare:         http://[IP]:3000/neocare
GeriCare:        http://[IP]:3000/gericare
```

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| Can't find IP | Run: `ipconfig` (look for 192.168.x.x or 10.x.x.x) |
| Can't ping server | Check: Same WiFi? Firewall off? |
| Agent won't connect | Check: `.env` has correct IP? |
| Dashboard won't load | Check: Server running? http://localhost:3000 works? |
| IP keeps changing | Set static IP in WiFi settings |

---

## 🚨 Emergency Troubleshooting

### Server won't start
```powershell
# Kill any process on port 3000
npx kill-port 3000
# Try again
npm run dev
```

### Firewall blocking
```powershell
# Temporarily disable (Windows Security → Firewall → Turn off)
# Or add rule (as Admin):
New-NetFirewallRule -DisplayName "NEXCARE" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### AI Agent errors
```powershell
# Check .env file
cat ai_agents\.env

# Verify server URL is correct
# Should be: EDGE_SERVER_URL=http://[IP]:3000
```

### Reset everything
```powershell
# Close all terminals
# Disconnect and reconnect to WiFi
# Check IP again: ipconfig
# Update all .env files with new IP
# Restart server and agents
```

---

## ✅ Pre-Demo Checklist

**30 min before:**
- [ ] Phone charged (90%+)
- [ ] Hotspot enabled and stable
- [ ] All laptops connected to hotspot
- [ ] Server IP confirmed: _________
- [ ] Server running (`npm run dev`)
- [ ] Dashboard loads in browser
- [ ] All .env files updated
- [ ] AI agents tested (send 1 report each)
- [ ] Room cards visible on dashboard
- [ ] Firewall rule added

**Backup:**
- [ ] WiFi router available (SSID: _____ Password: _____)
- [ ] Power adapters for all devices
- [ ] Mobile data for phone (if hotspot fails)

---

## 📞 Quick Help

**Server not accessible?**
1. Check server is running (`npm run dev`)
2. Check firewall (disable temporarily)
3. Ping test from other laptop
4. Verify same WiFi network

**AI Agent not sending data?**
1. Check `.env` has correct `EDGE_SERVER_URL`
2. Test: `curl http://[IP]:3000/api/health`
3. Check agent terminal for errors
4. Verify webcam is accessible

**IP Address confusion?**
- **Windows:** `ipconfig | findstr IPv4`
- Look for IP starting with: 192.168.x.x, 10.x.x.x, or 172.16-31.x.x
- **NOT** 127.0.0.1 (localhost) or 169.254.x.x (link-local)

---

## 🎯 Success Indicators

✅ **Working correctly when:**
- All laptops connected to same WiFi
- `ipconfig` shows similar IPs (e.g., 10.107.51.x)
- Other laptops can open http://[SERVER-IP]:3000
- AI agents show "✓ Report sent"
- Dashboard updates within 2 seconds
- Room cards show "Online" status

---

## 📱 Your Network Information

**Fill this out during setup:**

```
Mobile Hotspot:
  Network Name: NEXCARE-5G
  Password: _________________________

Central Server:
  IP Address: _______________________
  Dashboard: http://____________:3000

Laptop 2 (NeoCare):
  Room ID: R2
  IP: _______________________________

Laptop 3 (GeriCare):
  Room ID: R5
  IP: _______________________________
```

---

## 🎬 Demo Day Quick Start

```powershell
# === LAPTOP 1 (Server) ===
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2
npm run dev
# Write down IP shown in terminal

# === LAPTOP 2 (NeoCare) ===
# Update .env with server IP
.\.venv\Scripts\Activate.ps1
cd ai_agents
python neocare_agent.py

# === LAPTOP 3 (GeriCare) ===
# Update .env with server IP
.\.venv\Scripts\Activate.ps1
cd ai_agents
python gericare_agent.py

# === ANY LAPTOP (Access) ===
# Open browser: http://[SERVER-IP]:3000
```

---

**Keep this card accessible during your demo!**

Last updated: February 8, 2026
