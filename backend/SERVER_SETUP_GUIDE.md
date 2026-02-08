# 🖥️ BACKEND SERVER SETUP GUIDE

## Professional Central Processing Server Configuration

**Last Updated:** February 8, 2026  
**Version:** 1.0  
**Target:** Edge Server (Central Processing Unit)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Pre-Installation Steps](#pre-installation-steps)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Firewall Setup](#firewall-setup)
7. [Starting the Server](#starting-the-server)
8. [Verification](#verification)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance](#maintenance)

---

## 🎯 Overview

The Backend Server is the central processing unit for the NEXCARE-5G system. It:
- Processes baby monitoring data from AI agents
- Handles Arduino sensor integration
- Provides REST API for the Next.js frontend
- Manages WebRTC signaling for video calls
- Serves as the central data hub for all connected devices

### Architecture
```
┌─────────────────────────────────────────────────┐
│         EDGE SERVER (Central Server)             │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐         ┌─────────────────┐  │
│  │  Next.js     │◄───────►│  Flask Backend  │  │
│  │  Frontend    │         │  (Port 5000)    │  │
│  │  (Port 3000) │         └─────────────────┘  │
│  └──────────────┘                               │
│         ▲                        ▲               │
└─────────┼────────────────────────┼───────────────┘
          │                        │
          │ WebRTC/HTTP            │ API Calls
          │                        │
┌─────────▼────────┐      ┌────────▼─────────┐
│   Physician      │      │  AI Agents       │
│   Dashboard      │      │  (Laptops)       │
└──────────────────┘      └──────────────────┘
```

---

## 💻 System Requirements

### Minimum Requirements
- **OS:** Windows 10/11 (64-bit) or Linux
- **CPU:** Intel Core i5 or equivalent
- **RAM:** 8 GB
- **Storage:** 20 GB available space
- **Network:** Gigabit Ethernet or Wi-Fi 5/6
- **Ports:** 3000, 5000, 8080-8090, 3478, 5349, 10000-20000

### Recommended Requirements
- **CPU:** Intel Core i7 or AMD Ryzen 7
- **RAM:** 16 GB or more
- **Storage:** 50 GB SSD
- **Network:** Gigabit Ethernet (preferred) or Wi-Fi 6
- **GPU:** Optional, for future AI processing

### Software Prerequisites
- Python 3.8 or higher
- Node.js 18.0 or higher
- Git (for version control)
- Administrator/sudo access for firewall configuration

---

## 🚀 Pre-Installation Steps

### 1. Check Python Installation
```powershell
python --version
# Should show Python 3.8 or higher
```

If not installed, download from: https://www.python.org/downloads/

### 2. Check Node.js Installation
```powershell
node --version
npm --version
# Node should be 18.0+, npm 9.0+
```

If not installed, download from: https://nodejs.org/

### 3. Network Configuration

#### Get Your Server IP Address
```powershell
ipconfig
# Look for IPv4 Address under your active network adapter
# Example: 10.107.51.130
```

**Important:** Note this IP address - you'll need it for configuration!

#### Set Static IP (Recommended for Production)
1. Open Network Settings
2. Change adapter options
3. Right-click your network adapter → Properties
4. Select "Internet Protocol Version 4 (TCP/IPv4)"
5. Set static IP (e.g., 10.107.51.130)
6. Subnet mask: 255.255.255.0
7. Default gateway: (your router IP)
8. DNS: 8.8.8.8, 8.8.4.4

---

## 📦 Installation

### Step 1: Navigate to Backend Directory
```powershell
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2\backend
```

### Step 2: Create Python Virtual Environment (Recommended)
```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# If you get execution policy error:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Step 3: Install Python Dependencies
```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

**Expected packages:**
- flask
- flask-cors
- opencv-python
- mediapipe
- numpy
- pyserial
- python-dotenv

### Step 4: Install Next.js Dependencies
```powershell
# Return to project root
cd ..

# Install Node.js packages
npm install
```

---

## ⚙️ Configuration

### Step 1: Create Environment File
```powershell
cd backend
copy .env.example .env
```

### Step 2: Edit Configuration
Open `.env` in a text editor and configure:

```env
# ===== ESSENTIAL SETTINGS =====

# Server IP (Your Edge Server IP)
SERVER_HOST=0.0.0.0
SERVER_PORT=5000

# Production mode
FLASK_ENV=production
DEBUG=False

# Central Server Configuration
CENTRAL_SERVER_IP=10.107.51.130  # CHANGE THIS to your server IP
CENTRAL_SERVER_PORT=3000
CENTRAL_SERVER_URL=http://10.107.51.130:3000

# Arduino Configuration
ARDUINO_PORT=COM6  # CHANGE if using different port
ARDUINO_FALLBACK_PORTS=COM7,COM6,COM3,COM4,COM5

# Camera
CAMERA_INDEX=0  # 0 for default webcam

# Security
SECRET_KEY=your-secret-key-change-this-in-production  # CHANGE THIS

# CORS (allowed origins)
CORS_ORIGINS=http://localhost:3000,http://10.107.51.130:3000

# Logging
LOG_LEVEL=INFO
```

### Step 3: Generate Secret Key
```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```
Copy the output and paste it as `SECRET_KEY` in your `.env` file.

---

## 🔥 Firewall Setup

### Automatic Firewall Configuration (Windows)

**⚠️ Run as Administrator!**

```powershell
# Right-click PowerShell → Run as Administrator
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2\backend
.\setup-firewall-server.ps1
```

This script will:
- ✅ Configure all required ports
- ✅ Create firewall rules for Python
- ✅ Enable network discovery
- ✅ Configure WebRTC ports
- ✅ Verify network connectivity

### Manual Firewall Configuration

If you prefer manual setup or the script fails:

#### Required Ports

| Port(s) | Protocol | Purpose |
|---------|----------|---------|
| 5000 | TCP | Flask Backend API |
| 3000 | TCP | Next.js Frontend |
| 8080-8090 | TCP | WebRTC Signaling |
| 3478 | UDP | STUN/TURN |
| 5349 | TCP | TURN over TLS |
| 10000-20000 | UDP | RTP/RTCP Media |
| 9090 | TCP | Metrics (Optional) |

#### Windows Firewall (Manual)
1. Open Windows Defender Firewall
2. Advanced Settings
3. Inbound Rules → New Rule
4. Port → TCP → Specific local ports: 5000
5. Allow the connection
6. Apply to Domain, Private, Public
7. Name: "NeoCare Backend API"
8. Repeat for all other ports

---

## 🚦 Starting the Server

### Method 1: Using Batch File (Recommended)
```powershell
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2
.\START_COMPLETE_SYSTEM.bat
```

This starts both Backend and Next.js servers.

### Method 2: Manual Start

#### Start Backend Server
```powershell
cd backend
python app.py
```

You should see:
```
 * Running on http://0.0.0.0:5000
 * Trying to connect to Arduino...
 * [OK] Connected to Arduino on COM6!
```

#### Start Next.js Server (New Terminal)
```powershell
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2
npm run dev
```

You should see:
```
▲ Next.js 14.x
- Local:   http://localhost:3000
- Network: http://10.107.51.130:3000
```

### Method 3: Background Service (Production)

For production deployment, use PM2 or create a Windows Service.

#### Using PM2
```powershell
npm install -g pm2
pm2 start backend/app.py --name neocare-backend --interpreter python
pm2 start npm --name neocare-frontend -- run dev
pm2 save
pm2 startup
```

---

## ✅ Verification

### 1. Check Backend API
```powershell
# Test health endpoint
curl http://localhost:5000/sensor_data

# Should return:
# {"temperature": 0, "tempStatus": "Checking", ...}
```

### 2. Check Next.js Frontend
Open browser: `http://localhost:3000`

You should see the NEXCARE dashboard.

### 3. Test Arduino Connection
Check the backend terminal - you should see:
```
[OK] Connected to Arduino on COM6!
Latest Sensor Data: {'temperature': 36.5, ...}
```

### 4. Network Accessibility

From another device on the network:
```
http://YOUR_SERVER_IP:3000  # Frontend
http://YOUR_SERVER_IP:5000/sensor_data  # Backend API
```

### 5. Firewall Verification
```powershell
# List NeoCare firewall rules
Get-NetFirewallRule -DisplayName "*NeoCare*" | Select-Object DisplayName, Enabled
```

All rules should show `Enabled: True`.

---

## 🔧 Troubleshooting

### Issue: Cannot connect to Arduino

**Symptoms:** "Could not find Arduino. Using simulated data."

**Solutions:**
1. Check Arduino is plugged in
2. Verify COM port in Device Manager
3. Update `ARDUINO_PORT` in `.env`
4. Try different USB port
5. Install Arduino drivers

### Issue: Backend server won't start

**Error:** "Address already in use"

**Solution:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /F /PID <PID>
```

### Issue: Cannot access from other devices

**Solutions:**
1. Check firewall rules are enabled
2. Verify server IP is correct
3. Ensure devices are on same network
4. Disable Windows Firewall temporarily to test
5. Check router settings (no AP isolation)

### Issue: CORS errors in frontend

**Solution:**
Update `CORS_ORIGINS` in `.env`:
```env
CORS_ORIGINS=http://localhost:3000,http://YOUR_IP:3000,*
```

### Issue: High CPU usage

**Solutions:**
1. Reduce `CAMERA_FPS` in `.env`
2. Use `PROCESS_EVERY_NTH_FRAME=2`
3. Close unnecessary applications
4. Check for memory leaks

---

## 🔄 Maintenance

### Daily Checks
- Monitor log files: `backend/logs/backend.log`
- Check disk space
- Verify Arduino connection
- Review error logs

### Weekly Tasks
- Restart server to clear memory
- Update dependencies
- Backup configuration files
- Review security logs

### Monthly Tasks
- Update Python packages: `pip install --upgrade -r requirements.txt`
- Update Node.js packages: `npm update`
- Review and rotate logs
- Test backup restoration

### Log Management
```powershell
# View recent logs
Get-Content backend/logs/backend.log -Tail 50

# Clear old logs (backup first!)
Remove-Item backend/logs/*.log.* -Force
```

### Backup Configuration
```powershell
# Create backup
$date = Get-Date -Format "yyyyMMdd"
Copy-Item backend/.env -Destination "backend/.env.backup.$date"
```

---

## 📞 Support

### Log Files
- Backend: `backend/logs/backend.log`
- Next.js: Terminal output
- System: Windows Event Viewer

### Key Configuration Files
- Backend: `backend/.env`
- Next.js: `.env.local`
- Firewall: Run `setup-firewall-server.ps1`

### Network Diagnostics
```powershell
# Test connectivity
Test-NetConnection -ComputerName localhost -Port 5000
Test-NetConnection -ComputerName localhost -Port 3000

# View active connections
netstat -ano | findstr "5000\|3000"
```

---

## 🎉 Success Checklist

- [ ] Python installed and working
- [ ] Node.js installed and working
- [ ] Virtual environment activated
- [ ] Dependencies installed (Python & Node)
- [ ] `.env` file configured with correct IP
- [ ] Secret key generated and set
- [ ] Firewall rules created and enabled
- [ ] Backend server starts without errors
- [ ] Next.js server starts without errors
- [ ] Arduino connected (if applicable)
- [ ] Can access frontend from browser
- [ ] Can access backend API
- [ ] Other devices can connect on network
- [ ] Logs are being written

---

**© 2026 NEXCARE-5G | Edge Server Documentation**
