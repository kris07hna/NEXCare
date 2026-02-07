# NeoCare System - Quick Start Guide

## System Architecture

### Laptop 1 (Central Edge Server)
- **IP Address**: `10.107.51.130`
- **Running**: Next.js Edge Server
- **Access**: `http://10.107.51.130:3000`
- **Purpose**: Central hub for all AI agents and WebRTC signaling

### Laptop 2 (AI Agent + Local Dashboard) - THIS LAPTOP
- **IP Address**: `10.107.51.42`
- **Running**: 
  1. NeoCare AI Agent (sends data to edge server)
  2. Local Dashboard (connects to edge server)
- **Access**: `http://localhost:3000` (local) or `http://10.107.51.42:3000` (network)

---

## How to Start the System

### Quick Start (Recommended)
1. **Double-click**: `START_COMPLETE_SYSTEM.bat`
2. Wait for both windows to open:
   - Window 1: AI Agent (with webcam preview)
   - Window 2: Next.js Dashboard
3. Open browser: `http://localhost:3000`

### Manual Start
If you need to start components separately:

#### Start AI Agent Only
```bash
cd ai_agents
python neocare_agent.py
```

#### Start Dashboard Only
```bash
npm run dev
```

---

## What Each Component Does

### AI Agent (`ai_agents/neocare_agent.py`)
- ✅ Connects to Arduino (COM6) for sensors
- ✅ Captures webcam for sleep detection
- ✅ Sends data to edge server every 2 seconds
- ✅ Shows live preview window

**Data Sent**:
- Sleep Status (Awake/Sleeping)
- Temperature + Status (Low/Moderate/High)
- Light Status (ON/OFF)
- Heart Rate (BPM)

### Local Dashboard
- ✅ Displays data from edge server
- ✅ WebRTC video calling (connects to edge server for signaling)
- ✅ Real-time monitoring
- ✅ Can be accessed from this laptop or network

---

## Network Configuration

### URLs
- **Central Server**: `http://10.107.51.130:3000`
- **Local Dashboard**: `http://localhost:3000`
- **Local Dashboard (Network)**: `http://10.107.51.42:3000`
- **AI Backend**: `http://10.107.51.42:5000` (if running separately)

### WebRTC
- **Signaling Server**: `http://10.107.51.130:3000` (Central Edge Server)
- Both laptops connect to the same signaling server for video calls

---

## Troubleshooting

### AI Agent Issues
- **Arduino not detected**: Check COM port, close Arduino IDE Serial Monitor
- **Webcam not working**: Check if another app is using it
- **Cannot reach server**: Verify edge server is running on Laptop 1

### Dashboard Issues
- **npm command not found**: Run in PowerShell with execution policy bypass
- **Port 3000 already in use**: Stop other Next.js instances
- **WebRTC not connecting**: Check firewall, verify signaling server URL

### Network Issues
- **Cannot access from other laptop**: Check Windows Firewall
- **Different IP addresses**: Update `.env.local` with correct edge server IP

---

## Configuration Files

### `.env.local` (Dashboard Configuration)
```env
NEXT_PUBLIC_API_URL=http://10.107.51.130:3000
NEXT_PUBLIC_SIGNALING_SERVER_URL=http://10.107.51.130:3000
NEXT_PUBLIC_OFFLINE_MODE=true
DATABASE_URL=file:./data/edgecare.db
NEXT_PUBLIC_ENABLE_WEBRTC=true
```

### `ai_agents/.env` (AI Agent Configuration)
```env
EDGE_SERVER_URL=http://10.107.51.130:3000
ROOM_ID=R2
PATIENT_ID=P001
MODULE=NeoCare-AI
```

---

## Stopping the System

1. **AI Agent**: Press 'q' in the webcam window or Ctrl+C in terminal
2. **Dashboard**: Press Ctrl+C in the terminal running npm

---

## System Status Indicators

### AI Agent
- `[OK] Connected to Arduino on COM6!` - Sensors working
- `[OK] Webcam ready!` - Camera working
- `[OK] [HH:MM:SS] Sent: ...` - Data being sent to server

### Dashboard
- `✓ Ready in Xs` - Dashboard is running
- `Local: http://localhost:3000` - Access URL
- `Network: http://10.107.51.42:3000` - Network access URL
