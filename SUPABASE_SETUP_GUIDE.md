# 🚀 Supabase Setup Guide - Complete Instructions

## What is Supabase?

Supabase is a **free cloud database** (PostgreSQL) with real-time capabilities. In our 5G MEC architecture, it acts as the **central cloud server** that all edge nodes connect to.

**Key Benefits:**
- ✅ No local SQLite files needed
- ✅ Works on any network (hotspot, WiFi, university)
- ✅ Real-time updates via WebSocket
- ✅ No firewall/port forwarding required
- ✅ Free tier: 500MB database, unlimited API requests

---

## Step 1: Create Supabase Project (2 minutes)

1. Go to **https://supabase.com**
2. Click **"Start your project"** → Sign up with GitHub/Google/Email
3. Click **"New Project"**
4. Fill in:
   - **Name:** `nexcare-5g-mec`
   - **Database Password:** (create strong password, save it!)
   - **Region:** Choose closest to you (e.g., East US, Singapore, Europe)
   - **Pricing Plan:** Free
5. Click **"Create new project"**
6. Wait 2 minutes for database provisioning...

---

## Step 2: Run Database Schema (1 minute)

1. In Supabase dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"New query"**
3. Open your file: `SUPABASE_SCHEMA.sql` (in project root)
4. **Copy entire content** (all 400+ lines)
5. **Paste** into Supabase SQL Editor
6. Click **"Run"** (bottom right)
7. You should see: **"Success. No rows returned"**

**What this does:**
- Creates 6 tables: `patients`, `ai_reports`, `consultations`, `room_status`, `edge_nodes`, `system_logs`
- Enables real-time subscriptions
- Creates indexes for fast queries
- Adds sample data (2 patients, 1 room)

---

## Step 3: Get API Credentials (30 seconds)

1. In Supabase dashboard, click **"Settings"** (bottom left)
2. Click **"API"** tab
3. Find **"Project URL"** → Click copy icon
   - Looks like: `https://abcdefghijk.supabase.co`
4. Find **anon** **public** key → Click copy icon
   - Looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...` (very long)

---

## Step 4: Configure Environment Variables

### On Server Laptop (Friend's Control Center)

1. In project folder: `c:\Users\krishna\Music\NEXCARE-5G\edge-server2\`
2. Create file: `.env.local` (exact name, note the dot at start)
3. Add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-actual-key...
```

4. **Replace** `your-project.supabase.co` with YOUR actual URL
5. **Replace** the key with YOUR actual anon key
6. Save file

**Important:** 
- File must be named `.env.local` (with dot at start)
- No spaces around `=`
- No quotes needed

---

## Step 5: Verify Setup

### Test 1: Check Tables Created

1. In Supabase dashboard → **"Table Editor"** (left sidebar)
2. You should see:
   - ✅ patients (2 rows)
   - ✅ ai_reports (0 rows)
   - ✅ consultations (0 rows)
   - ✅ room_status (1 row)
   - ✅ edge_nodes (0 rows)
   - ✅ system_logs (0 rows)

### Test 2: Check Real-Time Enabled

1. Click on **`ai_reports`** table
2. Click **"Replication"** tab (top)
3. Ensure **"Enable Replication"** is ON (green toggle)

### Test 3: Test from Server

```bash
# In project folder
npm run dev
```

Open browser: http://localhost:3000

You should see:
- ✅ No database errors in terminal
- ✅ Dashboard loads
- ✅ "0 rooms online" (normal, no AI agents running yet)

In terminal, look for:
```
[5G MEC] ✓ Connected to cloud database
```

---

## Step 6: Test AI Agent Connection

### On AI Agent Laptop

1. Navigate to: `ai_agents/` folder
2. Create `.env` file:

```env
EDGE_SERVER_HOST=your-server-laptop-ip
EDGE_SERVER_PORT=3000
ROOM_ID=R1
CAMERA_INDEX=0
```

3. Replace `your-server-laptop-ip` with **actual IP** (e.g., `10.107.51.10`)
4. Install packages:
   ```bash
   pip install -r requirements.txt
   ```
5. Run agent:
   ```bash
   python neocare_agent.py
   ```

Expected output:
```
==================================================
         NeoCare AI Agent - Starting              
==================================================
Server:     http://10.107.51.10:3000
Room:       R1
Module:     NeoCare-AI

✓ Face Mesh initialized
✓ Camera opened (index 0)
Sending report... Status: Awake
[OK] Report sent successfully!
```

Check **Server Dashboard** → Room R1 should appear as **ONLINE** ✅

Check **Supabase Table Editor** → `ai_reports` should have new rows appearing every 2 seconds!

---

## Step 7: Test Video Calling

1. On dashboard, click **"Consult"** button on any room
2. Jitsi Meet window opens in new tab
3. Share that URL with anyone (doctor, nurse, family)
4. They can join from **any device, any network** - no setup!

Example URL: `https://meet.jit.si/nexcare-5g-R1`

---

## Troubleshooting

### Error: "Missing Supabase config"

**Fix:** Check `.env.local` file exists and has correct format:
```env
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```
Restart server after creating file.

---

### Error: "table patients does not exist"

**Fix:** Run SUPABASE_SCHEMA.sql again in SQL Editor. Make sure you see "Success" message.

---

### Agent error: "Connection refused"

**Possible causes:**
1. Server not running → Run `npm run dev` on server laptop
2. Wrong IP in agent `.env` → Check with `ipconfig` on server
3. Firewall blocking → Both laptops must be on **same mobile hotspot**

---

### Real-time not working (reports not appearing live)

1. Supabase → Table Editor → `ai_reports` → Replication tab
2. Toggle **"Enable Replication"** OFF then ON
3. Refresh browser

---

## Advanced: Multiple Edge Nodes

To add more laptops/edge nodes:

1. **Same Supabase project** - all nodes share one database
2. Each node runs: `npm run dev` (dashboard) OR `python neocare_agent.py` (AI)
3. Each AI agent uses same `.env.local` (same Supabase URL/KEY)
4. Different ROOM_IDs: `R1`, `R2`, `R3`, `R4`

**Architecture:**
```
Laptop 1 (Control) → Supabase Cloud ← Laptop 2 (NeoCare AI)
                         ↑
Laptop 3 (Consultation) ← → Laptop 4 (GeriCare AI)
```

All communicate via **Supabase real-time subscriptions**!

---

## Next Steps

✅ **Database:** Supabase running
✅ **Server:** Next.js connecting to cloud
✅ **AI Agent:** Sending reports to cloud
✅ **Video:** Jitsi calls working

**You're done!** 🎉

Your 5G MEC cloud healthcare system is fully operational.

- No local files
- No network hassles
- Works anywhere with internet
- Professional-grade real-time monitoring

**Want to see data?**
- Supabase Table Editor → Live database
- Dashboard → Real-time room monitoring
- Console logs → See AI reports flowing in

---

## Resources

- **Supabase Docs:** https://supabase.com/docs
- **Jitsi Meet:** https://jitsi.github.io/handbook/
- **Project GitHub:** (your repo)

For help: Check `NETWORK_TROUBLESHOOTING.md` or `CLOUD_QUICK_START.md`
