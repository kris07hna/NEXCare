# 🏥 NEXCARE-5G PROFESSIONAL SETUP DOCUMENTATION

## Complete Guide for Central Processing Server & AI Agent Laptop Connection

---

## 📚 DOCUMENTATION INDEX

This professional deployment package contains everything you need to set up the NEXCARE-5G central processing server and connect AI agent laptops for baby monitoring.

### 🎯 START HERE

**New to the system?** Read in this order:
1. This file (MASTER_INDEX.md) - Overview
2. [PROFESSIONAL_DEPLOYMENT_GUIDE.md](PROFESSIONAL_DEPLOYMENT_GUIDE.md) - Quick reference
3. Server setup OR Laptop setup (based on your role)

---

## 📋 COMPLETE FILE LISTING

### 📖 Documentation (Read These)

| File | Purpose | Audience |
|------|---------|----------|
| **MASTER_INDEX.md** | This file - Complete overview | Everyone |
| **PROFESSIONAL_DEPLOYMENT_GUIDE.md** | Quick reference guide | Everyone |
| **backend/SERVER_SETUP_GUIDE.md** | Complete server setup (30 min) | Server Admin |
| **ai_agents/AI_AGENT_SETUP_GUIDE.md** | Complete laptop setup (20 min) | Laptop Users |

### ⚙️ Configuration Files (Edit These)

| File | Purpose | When to Edit |
|------|---------|--------------|
| **backend/.env.example** | Server config template | →Create .env from this |
| **ai_agents/.env.example** | Agent config template | →Create .env from this |
| **backend/config.py** | Server config loader | Auto-loaded, no edit |
| **ai_agents/agent_config.py** | Agent config loader | Auto-loaded, no edit |

### 🔥 Firewall Scripts (Run These as Admin)

| File | Purpose | When to Run |
|------|---------|-------------|
| **backend/setup-firewall-server.ps1** | Configure server firewall | After server install |
| **ai_agents/setup-firewall-agent.ps1** | Configure laptop firewall | After agent install |

### 🚀 Startup Scripts (Run These Daily)

| File | Purpose | When to Run |
|------|---------|-------------|
| **START_COMPLETE_SYSTEM.bat** | Start server (backend+frontend) | Server startup |
| **backend/START_BACKEND_SERVER.bat** | Start backend only | Server startup |
| **ai_agents/START_AI_AGENT.bat** | Start AI agent on laptop | Laptop startup |

### 🔧 Monitoring & Diagnostics (Use When Needed)

| File | Purpose | Command |
|------|---------|---------|
| **backend/health_monitor.py** | Monitor server health | `python health_monitor.py` |
| **ai_agents/network_tester.py** | Test network connectivity | `python network_tester.py --server <IP>` |

### 💻 Main Application Files (Don't Modify Unless Developing)

| File | Purpose |
|------|---------|
| **backend/app.py** | Flask backend server |
| **ai_agents/neocare_agent.py** | AI monitoring agent |
| **ai_agents/gericare_agent.py** | Elderly care agent |

---

## 🏗️ SYSTEM ARCHITECTURE

```
┌───────────────────────────────────────────────────────────────┐
│                    NEXCARE-5G SYSTEM                           │
└───────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  EDGE SERVER (Central Processing Unit)                      │
│  IP: 10.107.51.130 (configurable)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐    ┌───────────────────────┐    │
│  │  Next.js Frontend    │◄──►│  Flask Backend        │    │
│  │  Port: 3000          │    │  Port: 5000           │    │
│  │  - Dashboard         │    │  - API Server         │    │
│  │  - WebRTC Client     │    │  - MediaPipe AI       │    │
│  │  - Room Monitoring   │    │  - Arduino Interface  │    │
│  └──────────────────────┘    └───────────────────────┘    │
│                                                              │
│  Components:                                                 │
│  ✓ config.py              - Configuration loader            │
│  ✓ app.py                 - Main backend server            │
│  ✓ .env                   - Environment config             │
│  ✓ health_monitor.py      - Health monitoring              │
│  ✓ requirements.txt       - Python dependencies            │
│                                                              │
└──────────────┬──────────────────────┬────────────────────────┘
               │                      │
          HTTP/WebRTC            API Calls
               │                      │
    ┌──────────┴─────────┐    ┌──────┴──────────────────┐
    │  Physician Access  │    │  AI Agent Laptops        │
    │  (Web Browsers)    │    │  (1-10 laptops)          │
    │                    │    │                          │
    │  - Any device      │    │  Room assignments:       │
    │  - Same network    │    │  • Laptop 1 → Room R1   │
    │  - Web browser     │    │  • Laptop 2 → Room R2   │
    │                    │    │  • Laptop N → Room RN   │
    └────────────────────┘    └──────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  AI AGENT LAPTOP (Example: Room R2)                         │
│  IP: Dynamic/DHCP                                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────┐    │
│  │  Webcam     │──►│  MediaPipe   │──►│  NeoCare     │    │
│  │  (Camera 0) │   │  Face Mesh   │   │  Agent       │    │
│  └─────────────┘   │  Sleep Detect│   │              │    │
│                     └──────────────┘   │  - Config    │    │
│  ┌─────────────┐                      │  - Logging   │    │
│  │  Arduino    │──────────────────────►│  - Network   │    │
│  │  (COM6)     │   Sensor Data        │  - Display   │    │
│  │  - Temp     │                      └──────┬───────┘    │
│  │  - BPM      │                             │            │
│  │  - Light    │                             │ POST       │
│  └─────────────┘                             ▼            │
│                                      Edge Server           │
│  Components:                         (Reports every 2s)    │
│  ✓ neocare_agent.py    - Main agent                       │
│  ✓ agent_config.py     - Config loader                    │
│  ✓ .env                - Environment config               │
│  ✓ network_tester.py   - Network diagnostics              │
│  ✓ requirements.txt    - Python dependencies              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎬 QUICK START GUIDE

### For Server Administrator (30 minutes)

1. **Read Documentation**
   - [backend/SERVER_SETUP_GUIDE.md](backend/SERVER_SETUP_GUIDE.md)

2. **Install Prerequisites**
   ```powershell
   python --version  # Need 3.8+
   node --version    # Need 18.0+
   ```

3. **Setup Backend**
   ```powershell
   cd backend
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   copy .env.example .env
   # Edit .env with your settings
   ```

4. **Configure Firewall**
   ```powershell
   # Run as Administrator!
   .\setup-firewall-server.ps1
   ```

5. **Start Server**
   ```powershell
   cd ..
   .\START_COMPLETE_SYSTEM.bat
   ```

6. **Verify**
   - Backend: http://localhost:5000/sensor_data
   - Frontend: http://localhost:3000

### For Laptop/Agent Users (20 minutes)

1. **Read Documentation**
   - [ai_agents/AI_AGENT_SETUP_GUIDE.md](ai_agents/AI_AGENT_SETUP_GUIDE.md)

2. **Get Server IP**
   - Ask server admin for Edge Server IP
   - Default: 10.107.51.130

3. **Install Prerequisites**
   ```powershell
   python --version  # Need 3.8+
   ```

4. **Setup Agent**
   ```powershell
   cd ai_agents
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   copy .env.example .env
   # Edit .env with server IP and room assignment
   ```

5. **Configure Firewall**
   ```powershell
   # Run as Administrator!
   .\setup-firewall-agent.ps1
   ```

6. **Start Agent**
   ```powershell
   python neocare_agent.py
   # Or use: ..\START_AI_AGENT.bat
   ```

7. **Verify**
   - Video window opens
   - Face detection works
   - Data sends to server
   - Room appears on dashboard

---

## 🔐 SECURITY & CONFIGURATION

### Critical Configuration Items

#### Server (.env)
```env
# Network
CENTRAL_SERVER_IP=10.107.51.130    # CHANGE to your IP

# Security
SECRET_KEY=<generated-key>         # MUST generate unique key

# Hardware
ARDUINO_PORT=COM6                  # Check Device Manager

# CORS
CORS_ORIGINS=http://localhost:3000,http://YOUR_IP:3000
```

#### Laptop (.env)
```env
# Connection
EDGE_SERVER_HOST=10.107.51.130     # Server IP from admin

# Assignment
ROOM_ID=R2                         # Your assigned room
PATIENT_ID=P001                    # Patient ID
AGENT_ID=neocare-agent-001         # Unique agent ID

# Hardware
ARDUINO_PORT=COM6                  # Check Device Manager
CAMERA_INDEX=0                     # 0=built-in, 1=USB
```

### Firewall & Network Ports

**Server requires these ports open:**
- 3000 (TCP) - Next.js frontend
- 5000 (TCP) - Flask backend
- 8080-8090 (TCP) - WebRTC signaling
- 3478 (UDP) - STUN/TURN
- 5349 (TCP) - TURN TLS
- 10000-20000 (UDP) - RTP media streams

**Laptops require these ports open:**
- Outbound TCP: 3000, 5000, 8080
- Outbound HTTP/HTTPS
- Inbound UDP 10000-20000 (for WebRTC)

---

## 🛠️ COMMON TASKS

### Daily Operations

**Start Server:**
```powershell
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2
.\START_COMPLETE_SYSTEM.bat
```

**Start Laptop Agent:**
```powershell
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2
.\START_AI_AGENT.bat
```

**Monitor Server Health:**
```powershell
cd backend
python health_monitor.py --once
```

**Test Network Connectivity:**
```powershell
cd ai_agents
python network_tester.py --server 10.107.51.130
```

**View Logs:**
```powershell
# Server logs
Get-Content backend\logs\backend.log -Tail 50 -Wait

# Agent logs
Get-Content ai_agents\logs\neocare_agent.log -Tail 50 -Wait
```

### Troubleshooting

**Server won't start:**
1. Check port availability: `netstat -ano | findstr ":5000"`
2. Kill conflicting process: `taskkill /F /PID <PID>`
3. Check logs: `backend\logs\backend.log`
4. Verify .env configuration

**Agent can't connect:**
1. Ping server: `ping 10.107.51.130`
2. Test connectivity: `python network_tester.py --server <IP>`
3. Check firewall on both ends
4. Verify .env has correct server IP

**Camera not working:**
1. Close Teams/Zoom/Skype
2. Try CAMERA_INDEX=1 in .env
3. Check Device Manager
4. Test: `python -c "import cv2; cv2.VideoCapture(0).read()"`

---

## 📊 MONITORING & MAINTENANCE

### Health Checks

**Server (Hourly):**
- [ ] Backend responding: `curl http://localhost:5000/sensor_data`
- [ ] Frontend accessible: `http://localhost:3000`
- [ ] CPU < 80%, Memory < 80%
- [ ] No errors in logs

**Laptop (Every 30 min):**
- [ ] Video window active
- [ ] Face detection working
- [ ] Sending data (check terminal)
- [ ] No connection errors

### Log Management

**View recent logs:**
```powershell
Get-Content backend\logs\backend.log -Tail 50
Get-Content ai_agents\logs\neocare_agent.log -Tail 50
```

**Search for errors:**
```powershell
Select-String -Path "backend\logs\*.log" -Pattern "ERROR|CRITICAL"
Select-String -Path "ai_agents\logs\*.log" -Pattern "ERROR|CRITICAL"
```

**Archive old logs:**
```powershell
$date = Get-Date -Format "yyyyMMdd"
Compress-Archive -Path logs/*.log -DestinationPath "logs/archive_$date.zip"
```

---

## 🔄 DEPLOYMENT SCENARIOS

### Scenario 1: New Hospital Deployment

1. **Setup Central Server** (1 hour)
   - Follow SERVER_SETUP_GUIDE.md
   - Configure static IP
   - Test from multiple devices
   
2. **Setup First Laptop** (30 min)
   - Follow AI_AGENT_SETUP_GUIDE.md
   - Assign to Room R1
   - Verify dashboard shows data

3. **Setup Additional Laptops** (20 min each)
   - Clone configuration from first laptop
   - Change ROOM_ID and AGENT_ID
   - Test connectivity

### Scenario 2: Laptop Replacement

1. **Unassign Old Laptop**
   - Stop agent: Press 'q' or Ctrl+C
   - Record room assignment

2. **Setup New Laptop**
   - Follow AI_AGENT_SETUP_GUIDE.md
   - Use same ROOM_ID
   - New unique AGENT_ID

3. **Verify**
   - Check dashboard shows correct room
   - Test for 5 minutes

### Scenario 3: Network Change

1. **Update Server IP**
   - Change CENTRAL_SERVER_IP in server .env
   - Restart server

2. **Update All Laptops**
   - Change EDGE_SERVER_HOST in each laptop .env
   - Restart agents

3. **Test Connectivity**
   - Run network_tester.py on each laptop
   - Verify all agents connect

---

## 📞 SUPPORT & TROUBLESHOOTING

### Diagnostic Tools

**Health Monitor** (Server):
```powershell
cd backend
python health_monitor.py --once          # Single check
python health_monitor.py --interval 30   # Continuous
```

**Network Tester** (Laptop):
```powershell
cd ai_agents
python network_tester.py --server <IP>   # Single test
python network_tester.py --continuous    # Continuous
```

### Common Issues & Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| Port in use | "Address already in use" | Kill process: `netstat -ano \| findstr :<port>` |
| No camera | "Cannot open webcam" | Close Teams/Zoom, try CAMERA_INDEX=1 |
| Network error | "Cannot reach server" | Check IP, firewall, network |
| Arduino error | "Arduino not found" | Check COM port, drivers, USB |
| CORS error | Console shows CORS | Update CORS_ORIGINS in .env |
| High CPU | Slow performance | Reduce FPS, process fewer frames |

### Log Locations

- Server Backend: `backend/logs/backend.log`
- AI Agent: `ai_agents/logs/neocare_agent.log`
- Health Monitor: `backend/logs/health_monitor.log`
- Windows Events: Event Viewer → Application

---

## ✅ DEPLOYMENT CHECKLISTS

### Server Deployment Checklist

- [ ] Python 3.8+ installed
- [ ] Node.js 18+ installed
- [ ] Static IP configured
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] backend/.env created and configured
- [ ] Secret key generated
- [ ] Firewall rules created (setup-firewall-server.ps1)
- [ ] All ports accessible
- [ ] Backend starts successfully
- [ ] Frontend starts successfully
- [ ] Accessible from other devices
- [ ] health_monitor.py works
- [ ] Arduino connected (if applicable)

### Laptop Deployment Checklist

- [ ] Python 3.8+ installed
- [ ] Camera working
- [ ] Agent dependencies installed
- [ ] ai_agents/.env created and configured
- [ ] Server IP correct
- [ ] ROOM_ID assigned
- [ ] PATIENT_ID assigned
- [ ] AGENT_ID unique
- [ ] Firewall configured (setup-firewall-agent.ps1)
- [ ] Can ping server
- [ ] Network test passes
- [ ] Agent starts successfully
- [ ] Video window displays
- [ ] Face detection working
- [ ] Data sending to server
- [ ] Room appears on dashboard
- [ ] Arduino connected (if applicable)

---

## 🎓 TRAINING RESOURCES

### For Server Administrators

1. **Read:** server/SERVER_SETUP_GUIDE.md (30 min)
2. **Practice:** Setup on test machine
3. **Verify:** Run health_monitor.py
4. **Deploy:** Production server

### For Laptop Operators

1. **Read:** ai_agents/AI_AGENT_SETUP_GUIDE.md (20 min)
2. **Practice:** Setup and test
3. **Understand:** .env configuration
4. **Operate:** Daily startup/shutdown procedures

### For IT Support

1. **Understand:** Complete architecture
2. **Master:** Firewall configuration
3. **Practice:** Troubleshooting scenarios
4. **Document:** Site-specific configurations

---

## 📝 VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-08 | Initial professional deployment package |

---

## 📄 LICENSE & COPYRIGHT

**© 2026 NEXCARE-5G Project**  
Professional Healthcare Monitoring System

---

## 🆘 EMERGENCY CONTACTS

**For Critical Issues:**
1. Check logs immediately
2. Run diagnostic tools
3. Review troubleshooting guide
4. Document error messages
5. Contact system administrator

**Remember:**
- Always backup .env files before changes
- Test on single laptop before deploying to all
- Monitor logs for first hour after deployment
- Keep documentation updated with site-specific info

---

**END OF MASTER INDEX**

👉 **Next Step:** Read [PROFESSIONAL_DEPLOYMENT_GUIDE.md](PROFESSIONAL_DEPLOYMENT_GUIDE.md) for quick reference or jump to specific setup guides above.
