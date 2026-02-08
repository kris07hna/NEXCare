# NeoCare Setup Instructions - For Server Laptop

## What Changed
- Fixed database logging error
- Agent now connects to port 3000 (Next.js API)
- Improved camera error handling

## Server Setup (Friend's Laptop - 10.107.51.10)

### Step 1: Pull Latest Code
```powershell
cd C:\Users\[YourUsername]\NEXCare
git pull origin master
```

### Step 2: Create backend/.env
```powershell
notepad backend\.env
```

Paste this:
```
SERVER_HOST=0.0.0.0
SERVER_PORT=5000
CENTRAL_SERVER_IP=10.107.51.10
FLASK_ENV=development
CORS_ORIGINS=http://localhost:3000,http://10.107.51.10:3000,http://10.107.51.130:3000
DATABASE_PATH=../data/edgecare.db
ARDUINO_ENABLED=False
```

Save and close.

### Step 3: Start Next.js Server
```powershell
npm run dev
```

Should show: `✓ Ready on http://0.0.0.0:3000`

### Step 4: Configure Firewall (One-time)
Run PowerShell as Administrator:
```powershell
New-NetFirewallRule -DisplayName "NeoCare Next.js" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### Step 5: Create Test Patient
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/patients" -Method POST -ContentType "application/json" -Body '{"full_name":"Test Baby","age":1,"gender":"male","room_id":"R1","blood_type":"O+"}' -UseBasicParsing
```

This will return a patient_id like `P340577` - **share this with your friend!**

### Step 6: Open Dashboard
```
http://10.107.51.10:3000
```

Click "Room Monitoring" - Wait for friend's agent to connect.

---

## Agent Setup (Krishna's Laptop - 10.107.51.130)

### Step 1: Create ai_agents/.env
```powershell
notepad ai_agents\.env
```

Paste this (use the patient_id from server):
```
EDGE_SERVER_HOST=10.107.51.10
EDGE_SERVER_PORT=3000
ROOM_ID=R1
PATIENT_ID=P340577
AGENT_ID=AGENT_NEO_1
CAMERA_INDEX=0
```

Save and close.

### Step 2: Start Agent
```powershell
cd ai_agents
python neocare_agent.py
```

Should see:
```
✓ Report sent: Awake | Temp: 36.5°C | BPM: 120
```

---

## Verification

**On Server Dashboard:**
- Open: http://10.107.51.10:3000
- Click "Room Monitoring"
- See Room R1 with "NeoCare-AI: STABLE"
- Updates every 2 seconds

**Success Indicators:**
- ✓ Green "STABLE" badge
- ✓ Patient name shows
- ✓ Confidence percentage
- ✓ "5G Live" indicator

---

## Troubleshooting

**Agent shows timeout errors:**
```powershell
# On server, check firewall:
Get-NetFirewallRule -DisplayName "NeoCare Next.js"

# Test from agent laptop:
curl http://10.107.51.10:3000/api/rooms
```

**Room not appearing:**
- Verify patient was created
- Check agent is sending to correct PATIENT_ID
- Restart agent with `python neocare_agent.py`

**Database errors:**
- All fixes are in the latest code
- Just run `git pull origin master`
