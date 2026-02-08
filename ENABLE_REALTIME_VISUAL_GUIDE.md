# 🎯 QUICK VISUAL GUIDE - Enable Real-Time in 60 Seconds

## Step 1: Login to Supabase
```
🌐 Go to: https://supabase.com/dashboard
👤 Login with your account
📂 Select project: "nexcare-5g-mec"
```

---

## Step 2: Navigate to Realtime Settings
```
Click in sidebar:
📊 Database ──┐
             ├─> 🔄 Replication (click this!)
             ├─> 📝 Tables
             └─> 🔍 SQL Editor
```

---

## Step 3: Enable Real-Time (scroll down on Replication page)

Look for this section:

```
┌──────────────────────────────────────────┐
│ 📡 Realtime                              │
│ Enable realtime for tables below         │
├──────────────────────────────────────────┤
│                                          │
│  ☐ ai_reports        👈 CLICK THIS!     │
│  ☐ consultations     👈 CLICK THIS!     │
│  ☐ edge_nodes        👈 CLICK THIS!     │
│  ☐ patients                              │
│  ☐ room_status       👈 CLICK THIS!     │
│  ☐ system_logs                           │
│                                          │
│          [💾 Save Changes]               │
└──────────────────────────────────────────┘
```

**Enable these 4 tables:**
- ✅ `ai_reports` ← **Most important!**
- ✅ `room_status`
- ✅ `consultations`
- ✅ `edge_nodes`

---

## Step 4: Save & Verify

```
1. Click [💾 Save Changes] button
2. Wait for ✅ "Success" message
3. Checkmarks should appear next to enabled tables
```

---

## Step 5: Test It!

**Open 2 terminals:**

**Terminal 1 - Start Server:**
```powershell
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2
npm run dev
```

**Terminal 2 - Send Test Data:**
```powershell
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2\ai_agents
python test_realtime.py
```

---

## ✅ Success Indicators

### In Browser (http://localhost:3000):

```
┌──────────────────────────────────────┐
│ Main Dashboard                       │
│ 🟢 Real-Time Active  👈 YOU SEE THIS!│
└──────────────────────────────────────┘
```

### In Browser Console (F12):

```
[5G MEC Real-Time] ✓ Connected to room-updates
[5G MEC Real-Time] ✓ Room updates subscription active
[5G MEC Real-Time] 📡 New report from R1: Sleeping
```

### In Dashboard:

```
┌─────────────────────────────────────────┐
│ 🔵 LIVE UPDATE                          │
│ Just now from NeoCare-AI                │
│                                         │
│ Status: Sleeping                        │
│ Confidence: 95.8%                       │
│ Room: R1                                │
│                                         │
│ 🌡️ Sensor Data:                        │
│ Temperature: 36.5°C                     │
│ BPM: 125                                │
│ Light: Dim                              │
└─────────────────────────────────────────┘
```

Data updates **INSTANTLY** (no 5-second delay!)

---

## ❌ Troubleshooting (If Not Working)

### Still see "Polling Mode"?

**Quick fixes (try in order):**

1. **Hard refresh browser:**
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Restart dev server:**
   ```powershell
   # Stop server (Ctrl+C)
   npm run dev
   ```

3. **Check credentials:**
   ```powershell
   # Should see your Supabase URL and key
   cat .env.local
   ```

4. **Verify in Supabase:**
   - Go back to Database → Replication
   - Confirm checkmarks next to tables
   - Click Save again if needed

5. **Check project status:**
   - Supabase dashboard home
   - Make sure project not "Paused"
   - Click "Restore" if paused

---

## 🎬 What Should Happen

### Before Real-Time:
```
Dashboard → Wait 5 seconds → Check for data → Update
          → Wait 5 seconds → Check for data → Update
          → Wait 5 seconds → Check for data → Update
⏱️ SLOW (5-10 second delays)
```

### After Real-Time:
```
AI Agent → Sends data → Supabase → WebSocket → Dashboard
                                                   ↓
                                            INSTANT UPDATE! ⚡
⏱️ FAST (~100ms total)
```

---

## 🚀 That's It!

**Total time:** 60 seconds
**Difficulty:** Easy
**Result:** Professional real-time monitoring system

**Now your dashboard updates instantly when AI agents send data!** 🎉

---

## 📞 Need Help?

Read detailed guide: [ENABLE_REALTIME.md](ENABLE_REALTIME.md)

Common issues:
- **Can't find Realtime section?** → Try Database → Realtime (new UI)
- **Tables not listed?** → Run SUPABASE_SCHEMA.sql first
- **WebSocket fails?** → Check firewall/network settings
- **Still polling?** → Verify .env.local credentials
