# Backend Configuration Quick Guide

## Problem

The NeoCare page needs to fetch sensor data from the Flask backend, but the backend might be running on a different laptop.

**Scenario from your image:**
- **Laptop 1** (Central Server): Running Next.js at `http://10.107.51.130:3000`
- **Laptop 2** (Arduino + Flask): Running Flask at `http://10.107.51.42:5000`

**Issue:** NeoCare page tries to fetch from `localhost:5000`, but Flask is on a different laptop!

---

## ✅ Solution: Configure Backend URL

### Method 1: Automatic Configuration (Recommended)

**Double-click:** `CONFIGURE-BACKEND.bat`

```
1. Choose option 2 (Different laptop)
2. Enter: 10.107.51.42
3. Tool will test connection and update .env.local
4. Restart Next.js server
```

### Method 2: Manual Configuration

**Edit `.env.local`:**
```env
# Change this line:
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# To this (use your Arduino laptop's IP):
NEXT_PUBLIC_BACKEND_URL=http://10.107.51.42:5000
```

**Restart server:**
```bash
Ctrl+C  # Stop Next.js
npm run dev  # Start again
```

---

## 📊 Network Setup

### Single Laptop Setup (Default)
```
┌─────────────────────────┐
│    Laptop 1             │
│  ┌─────────┐            │
│  │ Next.js │            │
│  │ :3000   │───┐        │
│  └─────────┘   │        │
│                │        │
│  ┌─────────┐   │        │
│  │  Flask  │   │        │
│  │  :5000  │◄──┘        │
│  └────┬────┘            │
│       │                 │
│    Arduino              │
│    (COM6)               │
└─────────────────────────┘

Backend URL: http://localhost:5000
```

### Multi-Laptop Setup (Your Case)
```
┌─────────────────────┐         ┌─────────────────────┐
│    Laptop 1         │         │    Laptop 2         │
│    (Server)         │         │    (Arduino)        │
│  ┌─────────┐        │         │  ┌─────────┐        │
│  │ Next.js │        │         │  │  Flask  │        │
│  │ :3000   │────────┼─────────┼─►│  :5000  │        │
│  └─────────┘        │         │  └────┬────┘        │
│ .130                │         │       │             │
└─────────────────────┘         │    Arduino          │
                                │    (COM6)           │
                                │ .42                 │
                                └─────────────────────┘

Backend URL: http://10.107.51.42:5000
```

---

## 🎯 Quick Fix Steps

**For your specific setup:**

1. **On Laptop 1 (Central Server):**
   ```bash
   cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2
   .\CONFIGURE-BACKEND.bat
   
   # Choose: 2 (Different laptop)
   # Enter IP: 10.107.51.42
   
   # Restart server
   Ctrl+C
   npm run dev
   ```

2. **Verify it works:**
   - Open: http://10.107.51.130:3000/neocare
   - Check "Live Monitoring" tab
   - Sensor values should update
   - Should see Arduino data (temperature, BPM, etc.)

---

## 🔍 Verification

### Check Backend Connection
```bash
# From Laptop 1, test if backend is reachable:
Invoke-WebRequest -Uri "http://10.107.51.42:5000/sensor_data"

# Should return JSON with sensor data
```

### Check Browser Console
```
F12 → Console tab

# Should see successful fetch:
✅ GET http://10.107.51.42:5000/sensor_data 200 OK

# NOT errors like:
❌ GET http://localhost:5000/sensor_data ERR_CONNECTION_REFUSED
```

---

## 🛠️ Troubleshooting

### "Cannot reach backend"

1. **Verify Flask is running on Laptop 2:**
   ```bash
   # On Laptop 2, should see:
   Running on http://10.107.51.42:5000
   ✅ Connected to Arduino on COM6
   ✅ Already receiving requests (GET /sensor_data)
   ```

2. **Check both laptops on same network:**
   ```bash
   # On Laptop 1:
   ipconfig | findstr IPv4
   # Should show: 10.107.51.x

   # On Laptop 2:
   ipconfig | findstr IPv4  
   # Should show: 10.107.51.x (same range)
   ```

3. **Test connectivity:**
   ```bash
   # From Laptop 1:
   ping 10.107.51.42
   # Should get replies
   ```

4. **Check CORS on Flask backend:**
   - Flask app.py already has `CORS(app)` enabled ✅
   - No changes needed

---

## 📝 Environment Variables

**`.env.local` after configuration:**
```env
# Central Server URLs
NEXT_PUBLIC_API_URL=http://10.107.51.130:3000
NEXT_PUBLIC_SIGNALING_SERVER_URL=http://10.107.51.130:3000

# Backend Flask Server (Laptop 2)
NEXT_PUBLIC_BACKEND_URL=http://10.107.51.42:5000  ← This line!

# Database
DATABASE_URL=file:./data/edgecare.db
```

---

## ⚡ Quick Commands

**Configure backend:**
```bash
.\CONFIGURE-BACKEND.bat
```

**Check current configuration:**
```bash
cat .env.local | Select-String "BACKEND"
```

**Reset to localhost:**
```bash
# Edit .env.local:
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

---

## 🎬 Demo Day Workflow

**Before demo:**

1. Connect both laptops to mobile hotspot
2. Find IPs:
   ```bash
   # Laptop 1: ipconfig | findstr IPv4  → 10.107.51.130
   # Laptop 2: ipconfig | findstr IPv4  → 10.107.51.42
   ```

3. Configure backend (Laptop 1):
   ```bash
   .\CONFIGURE-BACKEND.bat
   # Enter Laptop 2's IP: 10.107.51.42
   ```

4. Start services:
   ```bash
   # Laptop 2:
   cd backend
   python app.py
   
   # Laptop 1:
   npm run dev
   ```

5. Verify:
   - Open: http://10.107.51.130:3000/neocare
   - See live sensor data updating ✅

---

**Now your NeoCare page will fetch sensor data from the correct laptop!** 🎉
