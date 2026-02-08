# 💻 AI AGENT SETUP GUIDE (LAPTOP)

## Professional AI Agent Configuration for Remote Monitoring

**Last Updated:** February 8, 2026  
**Version:** 1.0  
**Target:** Laptop/Workstation running AI monitoring agents

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Pre-Installation Steps](#pre-installation-steps)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Firewall Setup](#firewall-setup)
7. [Running the Agent](#running-the-agent)
8. [Verification](#verification)
9. [Troubleshooting](#troubleshooting)
10. [Offline Mode](#offline-mode)

---

## 🎯 Overview

The AI Agent software runs on laptops/workstations to:
- Monitor baby sleep patterns using webcam + MediaPipe AI
- Collect vital signs from Arduino sensors
- Send real-time data to the central Edge Server
- Display monitoring status locally
- Operate in offline mode when server unavailable

### Architecture
```
┌──────────────────────────────────────────┐
│       LAPTOP (AI Agent)                   │
├──────────────────────────────────────────┤
│                                           │
│  ┌─────────────┐      ┌──────────────┐  │
│  │  Webcam     │─────►│ MediaPipe AI │  │
│  │  (Camera 0) │      │ Sleep Detect │  │
│  └─────────────┘      └──────────────┘  │
│                                           │
│  ┌─────────────┐      ┌──────────────┐  │
│  │  Arduino    │─────►│ Sensor Data  │  │
│  │  (COM6)     │      │ Temp/BPM/Lux │  │
│  └─────────────┘      └──────────────┘  │
│                             │             │
│                             ▼             │
│                  ┌──────────────────┐    │
│                  │  NeoCare Agent   │    │
│                  │  (Python)        │    │
│                  └──────────────────┘    │
│                             │             │
└─────────────────────────────┼─────────────┘
                              │
                              │ HTTP POST
                              ▼
                    ┌──────────────────┐
                    │  Edge Server     │
                    │  10.107.51.130   │
                    └──────────────────┘
```

---

## 💻 System Requirements

### Minimum Requirements
- **OS:** Windows 10/11 (64-bit), Linux, or macOS
- **CPU:** Intel Core i3 or equivalent
- **RAM:** 4 GB
- **Storage:** 5 GB available space
- **Camera:** Built-in or USB webcam (720p minimum)
- **Network:** Wi-Fi or Ethernet connection to Edge Server
- **Arduino:** Optional (for sensor data)

### Recommended Requirements
- **CPU:** Intel Core i5 or better
- **RAM:** 8 GB
- **Camera:** 1080p webcam
- **Network:** Gigabit Ethernet or Wi-Fi 5/6

### Software Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- webcam drivers
- Arduino drivers (if using sensors)

---

## 🚀 Pre-Installation Steps

### 1. Verify Python Installation
```powershell
python --version
# Should show Python 3.8 or higher
```

If not installed: https://www.python.org/downloads/  
**Important:** During installation, check "Add Python to PATH"

### 2. Test Camera Access
```powershell
# Quick camera test
python -c "import cv2; cap = cv2.VideoCapture(0); print('Camera OK' if cap.isOpened() else 'Camera FAIL'); cap.release()"
```

Should print: `Camera OK`

### 3. Find Arduino COM Port (if using)
```powershell
# Windows Device Manager
devmgmt.msc

# Or use mode command
mode
```

Look for "Arduino" under Ports (COM & LPT) - note the COM number (e.g., COM6)

### 4. Get Edge Server IP Address

**CRITICAL:** You need the IP address of your Edge Server!

Ask the server administrator or check the server documentation.  
Default in this guide: `10.107.51.130`

### 5. Test Network Connectivity to Server
```powershell
# Ping the server
ping 10.107.51.130

# Test HTTP connection
curl http://10.107.51.130:3000

# Test Backend API
curl http://10.107.51.130:5000/sensor_data
```

All should respond successfully.

---

## 📦 Installation

### Step 1: Navigate to AI Agents Directory
```powershell
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2\ai_agents
```

### Step 2: Create Virtual Environment (Recommended)
```powershell
# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1

# If execution policy error:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

You should see `(venv)` in your terminal prompt.

### Step 3: Install Dependencies
```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

**Expected packages:**
- numpy
- opencv-python
- mediapipe
- requests
- python-dotenv
- pyserial
- ultralytics (for YOLO)

**Installation may take 5-10 minutes** (downloads ~500MB)

### Step 4: Verify Installation
```powershell
python -c "import cv2, mediapipe, numpy, requests, serial; print('All packages OK!')"
```

Should print: `All packages OK!`

---

## ⚙️ Configuration

### Step 1: Create Environment File
```powershell
copy .env.example .env
```

### Step 2: Edit Configuration

Open `.env` in Notepad or VS Code:

```env
# ===== ESSENTIAL SETTINGS =====

# Agent Identification
AGENT_ID=neocare-agent-001  # CHANGE: Unique ID for this laptop
AGENT_NAME=NeoCare-AI-Agent-1
MODULE=NeoCare-AI

# Room Assignment
ROOM_ID=R2  # CHANGE: Assigned room (R1, R2, etc.)
PATIENT_ID=P001  # CHANGE: Patient ID

# ===== SERVER CONNECTION =====

# Edge Server IP - CHANGE THIS!
EDGE_SERVER_HOST=10.107.51.130  # Your Edge Server IP
EDGE_SERVER_PORT=3000
EDGE_SERVER_URL=http://10.107.51.130:3000

# Backend Server - CHANGE THIS!
BACKEND_SERVER_HOST=10.107.51.130  # Same as Edge Server usually
BACKEND_SERVER_PORT=5000
BACKEND_SERVER_URL=http://10.107.51.130:5000

# Connection Settings
CONNECTION_TIMEOUT=5
RETRY_ATTEMPTS=3
RETRY_DELAY=5

# ===== ARDUINO CONFIGURATION =====

ARDUINO_PORT=COM6  # CHANGE: Your Arduino COM port
ARDUINO_FALLBACK_PORTS=COM6,COM7,COM3,COM4,COM5

# ===== CAMERA CONFIGURATION =====

CAMERA_INDEX=0  # 0 = default webcam, 1 = external USB camera

# ===== DATA TRANSMISSION =====

REPORT_INTERVAL=2  # Seconds between reports to server

# ===== LOGGING =====

LOG_LEVEL=INFO  # DEBUG for more details, WARNING for less
LOG_TO_CONSOLE=True

# ===== DEPLOYMENT INFO =====

DEPLOYMENT_LOCATION=Laptop-1  # CHANGE: Laptop identifier
DEPLOYMENT_DATE=2026-02-08
ASSIGNED_WARD=NICU  # CHANGE: Ward assignment
```

### Step 3: Validate Configuration

Run the configuration validator:
```powershell
python -c "from agent_config import AgentConfig; logger = AgentConfig.init_agent(); print('Config OK!')"
```

This will create directories and verify your settings.

---

## 🔥 Firewall Setup

### Automatic Firewall Configuration (Windows)

**⚠️ Run as Administrator!**

```powershell
# Right-click PowerShell → Run as Administrator
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2\ai_agents
.\setup-firewall-agent.ps1
```

The script will:
- ✅ Configure outbound rules for Python
- ✅ Allow HTTP/HTTPS to server
- ✅ Configure WebRTC ports (if needed)
- ✅ Test server connectivity
- ✅ Enable network discovery

### Manual Firewall Configuration

#### Windows Defender Firewall
1. Open Windows Defender Firewall
2. Advanced Settings
3. Outbound Rules → New Rule
4. Program → Browse to `python.exe`
5. Allow the connection
6. Apply to all profiles
7. Name: "NeoCare AI Agent - Python"

#### Allow Specific Ports (Optional)
Only needed if receiving commands from server:
- Outbound: TCP 3000, 5000, 8080
- Inbound: UDP 10000-20000 (for WebRTC)

---

## 🚦 Running the Agent

### Method 1: Direct Execution
```powershell
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2\ai_agents
python neocare_agent.py
```

### Method 2: Using Batch File
```powershell
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2
.\START_AI_AGENT.bat
```

### Expected Output
```
==================================================
         NeoCare AI Agent - Starting              
==================================================
Server:     http://10.107.51.130:3000
Room:       R2
Patient:    P001
Module:     NeoCare-AI

Trying Arduino on COM6...
[OK] Connected to Arduino on COM6!

Starting webcam...
[OK] Webcam ready!
==================================================
  NeoCare AI Agent - RUNNING                      
  Press 'q' to quit                               
==================================================

[OK] [14:30:15] Sent: Awake | Temp: 36.5C | BPM: 130
[OK] [14:30:17] Sent: Sleeping | Temp: 36.4C | BPM: 128
```

### Video Window

You'll see a window showing:
- Live webcam feed
- Sleep status (Awake/Sleeping)
- Temperature and status
- Light level
- BPM (heart rate)

### Stopping the Agent

Press `q` in the video window or `Ctrl+C` in terminal.

---

## ✅ Verification

### 1. Local Display Check
✅ Video window opens  
✅ Face detection working (status shows Awake/Sleeping)  
✅ Sensor data displayed (Temp, BPM, Light)  
✅ FPS stable (20-30 fps)

### 2. Server Connection Check
✅ Terminal shows: `[OK] Report sent`  
✅ No repeated connection errors  
✅ HTTP 201 response codes

### 3. Edge Server Dashboard Check
1. Open browser: `http://10.107.51.130:3000`
2. Navigate to Room Monitoring
3. Find your room (e.g., R2)
4. Verify data is updating every 2 seconds

### 4. Log File Check
```powershell
Get-Content logs/neocare_agent.log -Tail 20
```

Should show successful reports with no errors.

---

## 🔧 Troubleshooting

### Issue: Camera not opening

**Error:** "Cannot open webcam!"

**Solutions:**
1. Close other apps using camera (Teams, Zoom, Skype)
2. Check camera in Device Manager
3. Try different camera: `CAMERA_INDEX=1` in `.env`
4. Reinstall camera drivers
5. Test camera: `python -c "import cv2; cv2.VideoCapture(0).read()"`

### Issue: Cannot connect to server

**Error:** "[ERROR] Cannot reach server"

**Solutions:**
1. Verify server IP: `ping 10.107.51.130`
2. Check server is running: `curl http://10.107.51.130:3000`
3. Verify firewall rules on both laptop and server
4. Ensure on same network
5. Check router settings (no client isolation)
6. Try server URL in browser

### Issue: Arduino not detected

**Warning:** "Arduino not found. Using simulated data."

**Solutions:**
1. Check Arduino USB connection
2. Verify COM port in Device Manager
3. Update `ARDUINO_PORT` in `.env`
4. Install Arduino drivers: https://www.arduino.cc/en/software
5. Try different USB port
6. Upload firmware: `arduino/neocare_sensors.ino`

### Issue: "No Face Detected" always

**Solutions:**
1. Ensure good lighting
2. Position face in camera view
3. Camera focused correctly
4. Lower `MEDIAPIPE_MIN_DETECTION_CONFIDENCE` in `.env`
5. Check camera quality (minimum 720p)

### Issue: High CPU usage / lag

**Solutions:**
1. Reduce report interval: `REPORT_INTERVAL=5` in `.env`
2. Process fewer frames: `PROCESS_EVERY_NTH_FRAME=2`
3. Lower camera resolution
4. Close unnecessary programs
5. Use better CPU (if possible)

### Issue: Permission denied errors

**Solutions:**
```powershell
# Run as administrator
# Or fix permissions
icacls "C:\Users\krishna\Music\NEXCARE-5G\edge-server2\ai_agents" /grant Users:F /T
```

---

## 💾 Offline Mode

The agent can operate without server connection!

### How It Works
When server is unreachable:
1. Agent continues monitoring locally
2. Data saved to: `data/offline_reports/`
3. Display shows: "[WARNING] Server offline - saving locally"
4. When server returns, manually upload data

### Enable Offline Mode
```env
FAILSAFE_MODE=True
OFFLINE_STORAGE=True
OFFLINE_STORAGE_PATH=data/offline_reports
```

### Upload Offline Data
```powershell
# After server is back online
python -c "
import offline_sync
offline_sync.upload_reports('data/offline_reports')
"
```

---

## 🔄 Daily Operations

### Starting Your Shift
1. Connect Arduino (if using)
2. Ensure laptop connected to network
3. Run: `.\START_AI_AGENT.bat`
4. Verify video window opens
5. Check room assignment on dashboard
6. Monitor for 1 minute to ensure stable operation

### During Operation
- Leave video window visible (minimized OK)
- Check terminal occasionally for errors
- Ensure power connected (not on battery)
- Keep laptop awake (disable sleep mode)

### Ending Your Shift
1. Press `q` in video window
2. Or `Ctrl+C` in terminal
3. Verify agent stopped cleanly
4. Disconnect Arduino
5. Review logs for any issues

### Windows Power Settings
```powershell
# Prevent sleep when plugged in
powercfg /change monitor-timeout-ac 0
powercfg /change standby-timeout-ac 0
```

---

## 📊 Monitoring & Logs

### View Live Logs
```powershell
Get-Content logs/neocare_agent.log -Wait -Tail 10
```

### Log Levels
- **DEBUG:** Detailed diagnostic information
- **INFO:** Normal operation messages (default)
- **WARNING:** Issues that don't stop operation
- **ERROR:** Errors requiring attention
- **CRITICAL:** Severe errors, agent may stop

### Change Log Level
Edit `.env`:
```env
LOG_LEVEL=DEBUG  # For troubleshooting
LOG_LEVEL=INFO   # For normal operation
LOG_LEVEL=WARNING  # For minimal logging
```

### Disk Space Management
```powershell
# Check log size
Get-ChildItem logs/ -Recurse | Measure-Object -Property Length -Sum

# Archive old logs (manual)
Compress-Archive -Path logs/*.log -DestinationPath "logs/archive_$(Get-Date -F yyyyMMdd).zip"
Remove-Item logs/*.log.* -Force
```

---

## 🎉 Success Checklist

- [ ] Python 3.8+ installed
- [ ] Virtual environment activated
- [ ] All dependencies installed
- [ ] `.env` file configured
- [ ] Edge Server IP correct
- [ ] Room and Patient IDs set
- [ ] Camera detected and working
- [ ] Arduino connected (if using)
- [ ] Firewall configured
- [ ] Agent starts without errors
- [ ] Video window displays correctly
- [ ] Face detection working
- [ ] Data sending to server successfully
- [ ] Dashboard shows your room data
- [ ] Logs being written

---

## 📞 Support

### Quick Diagnostics
```powershell
# All-in-one diagnostics
python -c "
import cv2, mediapipe, requests, serial
print('CV2:', cv2.__version__)
print('MediaPipe:', mediapipe.__version__)
print('Camera:', cv2.VideoCapture(0).isOpened())
print('Serial:', serial.VERSION)
try:
    r = requests.get('http://10.107.51.130:3000', timeout=2)
    print('Server:', r.status_code)
except:
    print('Server: OFFLINE')
"
```

### Log Files to Check
- Agent: `ai_agents/logs/neocare_agent.log`
- Python errors: Terminal output
- System: Windows Event Viewer

### Common Support Questions

**Q: Which camera index to use?**  
A: 0 for built-in, 1 for external USB. Test with: `ls /dev/video*` (Linux) or try both.

**Q: How often does it send data?**  
A: Every 2 seconds by default (`REPORT_INTERVAL=2`)

**Q: Can I run multiple agents on one laptop?**  
A: Not recommended. One agent per laptop/camera.

**Q: Does it work without Arduino?**  
A: Yes! Simulated sensor data will be used.

---

**© 2026 NEXCARE-5G | AI Agent Documentation**
