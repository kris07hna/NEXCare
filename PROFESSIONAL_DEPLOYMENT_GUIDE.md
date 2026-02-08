# 🚀 PROFESSIONAL DEPLOYMENT QUICK REFERENCE

**NEXCARE-5G Central Processing & Laptop Connection Setup**  
**Last Updated:** February 8, 2026

---

## 📋 SETUP OVERVIEW

This system consists of:
1. **Edge Server** (Central Processing Unit) - Runs Next.js frontend + Flask backend
2. **AI Agent Laptops** - Run monitoring agents that send data to server

```
┌─────────────────────────────────────────────────────┐
│  EDGE SERVER (10.107.51.130)                        │
│  ┌──────────────┐         ┌──────────────────┐     │
│  │ Next.js      │◄───────►│ Flask Backend    │     │
│  │ Port 3000    │         │ Port 5000        │     │
│  └──────────────┘         └──────────────────┘     │
└──────────────▲──────────────────▲───────────────────┘
               │                  │
          WebRTC/HTTP        API Calls
               │                  │
    ┌──────────┴─────┐   ┌───────┴─────────┐
    │  Physician     │   │  AI Agents      │
    │  Dashboard     │   │  (Laptops)      │
    │  (Browsers)    │   │  Room R1, R2... │
    └────────────────┘   └─────────────────┘
```

---

## 🖥️ SERVER SETUP (30 minutes)

### Phase 1: Pre-Installation

```powershell
# 1. Check Python
python --version  # Must be 3.8+

# 2. Check Node.js
node --version    # Must be 18.0+

# 3. Get server IP
ipconfig          # Note your IPv4 address
```

### Phase 2: Backend Server Setup

```powershell
# Navigate to backend
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2\backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your settings (see below)

# Configure firewall (Run as Admin!)
.\setup-firewall-server.ps1
```

**Critical .env Settings:**
```env
SERVER_HOST=0.0.0.0
SERVER_PORT=5000
CENTRAL_SERVER_IP=10.107.51.130  # YOUR SERVER IP
ARDUINO_PORT=COM6                 # YOUR COM PORT
SECRET_KEY=<generate-new-key>     # python -c "import secrets; print(secrets.token_hex(32))"
```

### Phase 3: Frontend Setup

```powershell
# Return to project root
cd ..

# Install Node packages
npm install

# Start development server
npm run dev
```

### Phase 4: Verification

```powershell
# Test backend
curl http://localhost:5000/sensor_data

# Test frontend (in browser)
http://localhost:3000

# Check from network
http://YOUR_IP:3000
```

---

## 💻 LAPTOP SETUP (20 minutes per laptop)

### Phase 1: Pre-Installation

```powershell
# 1. Check Python
python --version  # Must be 3.8+

# 2. Test camera
python -c "import cv2; print('OK' if cv2.VideoCapture(0).isOpened() else 'FAIL')"

# 3. Test server connectivity
ping 10.107.51.130
curl http://10.107.51.130:3000
```

### Phase 2: AI Agent Setup

```powershell
# Navigate to ai_agents
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2\ai_agents

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies (takes 5-10 minutes)
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your settings (see below)

# Configure firewall (Run as Admin!)
.\setup-firewall-agent.ps1
```

**Critical .env Settings:**
```env
AGENT_ID=neocare-agent-001          # UNIQUE ID
ROOM_ID=R2                          # ASSIGNED ROOM
PATIENT_ID=P001                     # PATIENT ID
EDGE_SERVER_HOST=10.107.51.130      # SERVER IP
ARDUINO_PORT=COM6                   # IF USING ARDUINO
DEPLOYMENT_LOCATION=Laptop-1        # IDENTIFIER
```

### Phase 3: Run Agent

```powershell
# Start the agent
python neocare_agent.py

# Or use batch file
..\START_AI_AGENT.bat
```

### Phase 4: Verification

✅ Video window opens  
✅ Face detection working  
✅ Terminal shows: `[OK] Report sent`  
✅ Dashboard shows your room data  

---

## 🔥 FIREWALL CONFIGURATION

### Windows Firewall Ports Required

**SERVER (Edge Server):**
| Port | Protocol | Purpose |
|------|----------|---------|
| 3000 | TCP | Next.js Frontend |
| 5000 | TCP | Flask Backend API |
| 8080-8090 | TCP | WebRTC Signaling |
| 3478 | UDP | STUN/TURN |
| 5349 | TCP | TURN TLS |
| 10000-20000 | UDP | RTP Media |

**LAPTOP (AI Agents):**
- Outbound TCP: 3000, 5000, 8080
- Outbound HTTP/HTTPS
- Inbound UDP 10000-20000 (optional, for WebRTC)

### Quick Firewall Setup

**Server:**
```powershell
# Run as Administrator
cd backend
.\setup-firewall-server.ps1
```

**Laptop:**
```powershell
# Run as Administrator
cd ai_agents
.\setup-firewall-agent.ps1
```

---

## 🚀 STARTUP PROCEDURES

### Daily Server Startup

```powershell
# Option 1: Full system startup (Recommended)
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2
.\START_COMPLETE_SYSTEM.bat

# Option 2: Backend only
cd backend
.\START_BACKEND_SERVER.bat

# Option 3: Manual
cd backend
python app.py
# In new terminal:
cd ..
npm run dev
```

### Daily Laptop Startup

```powershell
# Option 1: Using batch file (Recommended)
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2
.\START_AI_AGENT.bat

# Option 2: Manual
cd ai_agents
python neocare_agent.py
```

---

## 🔧 TROUBLESHOOTING COMMANDS

### Network Diagnostics

```powershell
# Test full connectivity
cd ai_agents
python network_tester.py --server 10.107.51.130

# Ping server
ping 10.107.51.130

# Test specific port
Test-NetConnection -ComputerName 10.107.51.130 -Port 3000
Test-NetConnection -ComputerName 10.107.51.130 -Port 5000
```

### Health Monitoring

```powershell
# Check server health
cd backend
python health_monitor.py --once

# Continuous monitoring
python health_monitor.py --interval 30
```

### Process Management

```powershell
# Find processes using ports
netstat -ano | findstr ":5000"
netstat -ano | findstr ":3000"

# Kill process (replace PID)
taskkill /F /PID <PID>

# List Python processes
Get-Process | Where-Object {$_.ProcessName -like '*python*'}
```

### Log Analysis

```powershell
# View server logs
Get-Content backend\logs\backend.log -Tail 50 -Wait

# View agent logs
Get-Content ai_agents\logs\neocare_agent.log -Tail 50 -Wait

# Find errors
Select-String -Path "backend\logs\*.log" -Pattern "ERROR"
```

---

## 📊 MONITORING CHECKLIST

### Server Health Checks (Every Hour)

- [ ] Backend responding: `curl http://localhost:5000/sensor_data`
- [ ] Frontend accessible: `http://localhost:3000`
- [ ] CPU usage < 80%
- [ ] Memory usage < 80%
- [ ] Disk space > 10GB
- [ ] No errors in logs

### AI Agent Health Checks (Every 30 minutes)

- [ ] Video window active
- [ ] Face detection working
- [ ] Sending data to server
- [ ] No connection errors
- [ ] Camera working
- [ ] Arduino connected (if applicable)

---

## 🔑 CONFIGURATION FILES REFERENCE

### Server Configuration: `backend/.env`
```env
SERVER_HOST=0.0.0.0
SERVER_PORT=5000
CENTRAL_SERVER_IP=<YOUR_IP>
ARDUINO_PORT=<YOUR_COM_PORT>
SECRET_KEY=<GENERATED_KEY>
LOG_LEVEL=INFO
```

### AI Agent Configuration: `ai_agents/.env`
```env
AGENT_ID=<UNIQUE_ID>
ROOM_ID=<ASSIGNED_ROOM>
PATIENT_ID=<PATIENT_ID>
EDGE_SERVER_HOST=<SERVER_IP>
ARDUINO_PORT=<COM_PORT>
REPORT_INTERVAL=2
```

---

## 🚨 EMERGENCY PROCEDURES

### Server Not Responding

1. Check if process running: `netstat -ano | findstr ":5000"`
2. Kill and restart: `taskkill /F /PID <PID>` then restart
3. Check firewall: `Get-NetFirewallRule -DisplayName "*NeoCare*"`
4. Check logs: `backend\logs\backend.log`
5. Verify .env configuration

### Agent Cannot Connect

1. Ping server: `ping <SERVER_IP>`
2. Test port: `Test-NetConnection -ComputerName <SERVER_IP> -Port 3000`
3. Run network test: `python network_tester.py --server <SERVER_IP>`
4. Check laptop firewall
5. Verify .env has correct server IP
6. Try browser: `http://<SERVER_IP>:3000`

### Camera Not Working

1. Close other apps (Teams, Zoom, Skype)
2. Check Device Manager
3. Try `CAMERA_INDEX=1` in .env
4. Restart laptop
5. Test: `python -c "import cv2; cv2.VideoCapture(0).read()"`

### Arduino Not Detected

1. Check USB connection
2. Verify COM port in Device Manager
3. Try different USB port
4. Update ARDUINO_PORT in .env
5. Install Arduino drivers
6. Test with Arduino IDE

---

## 📚 DOCUMENTATION FILES

| File | Purpose | Location |
|------|---------|----------|
| SERVER_SETUP_GUIDE.md | Complete server setup | backend/ |
| AI_AGENT_SETUP_GUIDE.md | Complete laptop setup | ai_agents/ |
| .env.example | Server config template | backend/ |
| .env.example | Agent config template | ai_agents/ |
| setup-firewall-server.ps1 | Server firewall script | backend/ |
| setup-firewall-agent.ps1 | Agent firewall script | ai_agents/ |
| config.py | Server config loader | backend/ |
| agent_config.py | Agent config loader | ai_agents/ |
| health_monitor.py | Server health monitor | backend/ |
| network_tester.py | Network diagnostics | ai_agents/ |

---

## 🎯 QUICK COMMANDS CHEAT SHEET

```powershell
# === SERVER COMMANDS ===

# Start full system
.\START_COMPLETE_SYSTEM.bat

# Start backend only
cd backend; python app.py

# Start frontend only
npm run dev

# Check health
cd backend; python health_monitor.py --once

# View logs
Get-Content backend\logs\backend.log -Tail 20

# === LAPTOP/AGENT COMMANDS ===

# Start agent
cd ai_agents; python neocare_agent.py

# Test connectivity
cd ai_agents; python network_tester.py --server <IP>

# View logs
Get-Content ai_agents\logs\neocare_agent.log -Tail 20

# === NETWORK COMMANDS ===

# Get local IP
ipconfig

# Ping server
ping 10.107.51.130

# Test port
Test-NetConnection -ComputerName <IP> -Port <PORT>

# List firewall rules
Get-NetFirewallRule -DisplayName "*NeoCare*"

# === PROCESS COMMANDS ===

# Find port usage
netstat -ano | findstr ":<PORT>"

# Kill process
taskkill /F /PID <PID>

# List Python processes
Get-Process python*
```

---

## ✅ DEPLOYMENT CHECKLIST

### Server Deployment

- [ ] Python 3.8+ installed
- [ ] Node.js 18+ installed
- [ ] Git installed (optional)
- [ ] Static IP configured
- [ ] Dependencies installed (pip + npm)
- [ ] .env configured with correct settings
- [ ] Secret key generated
- [ ] Firewall rules created
- [ ] Ports tested and accessible
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Accessible from network
- [ ] Health monitor running
- [ ] Logs directory created
- [ ] Arduino connected (if applicable)

### Laptop Deployment

- [ ] Python 3.8+ installed
- [ ] Camera working
- [ ] Arduino drivers installed (if applicable)
- [ ] Dependencies installed
- [ ] .env configured
- [ ] Server IP correct
- [ ] Room/Patient IDs assigned
- [ ] Firewall configured
- [ ] Can reach server
- [ ] Agent starts without errors
- [ ] Video window displays
- [ ] Face detection working
- [ ] Data sending successfully
- [ ] Appears on dashboard

---

## 📞 SUPPORT RESOURCES

### Log Locations
- Server Backend: `backend/logs/backend.log`
- AI Agent: `ai_agents/logs/neocare_agent.log`
- Health Monitor: `backend/logs/health_monitor.log`

### Configuration Files
- Server: `backend/.env`
- Agent: `ai_agents/.env`
- Server Config: `backend/config.py`
- Agent Config: `ai_agents/agent_config.py`

### Network Information
- Default Server IP: `10.107.51.130`
- Frontend Port: `3000`
- Backend Port: `5000`
- WebRTC Ports: `8080-8090`
- Media Ports: `10000-20000`

---

**© 2026 NEXCARE-5G | Professional Deployment Guide**
