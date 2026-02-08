# 🔴 HOW TO ENABLE REAL-TIME IN SUPABASE

## ⚠️ IMPORTANT: This is REQUIRED for real-time updates to work!

Without enabling real-time, your dashboard will only use polling (5-second delays). With real-time enabled, updates appear **instantly** (~100ms).

---

## 📋 Prerequisites

Before you start, make sure you have:
- ✅ Created a Supabase account at https://supabase.com
- ✅ Created a project (e.g., "nexcare-5g-mec")
- ✅ Run the SQL schema from `SUPABASE_SCHEMA.sql`
- ✅ Added Supabase credentials to `.env.local`

---

## 🎯 Step-by-Step Guide (Takes 2 Minutes)

### **Step 1: Go to Supabase Dashboard**

1. Open your browser
2. Go to: **https://supabase.com/dashboard**
3. You should see your projects list
4. Click on your project (e.g., "nexcare-5g-mec")

**What you'll see:**
- Project name at the top
- Left sidebar with menu items (Database, Authentication, Storage, etc.)

---

### **Step 2: Navigate to Database Replication**

1. Look at the **left sidebar**
2. Find and click on **"Database"** (icon looks like a database/cylinder)
3. A submenu will appear
4. Click on **"Replication"**

**Navigation path:** 
```
Dashboard → Database → Replication
```

**What you'll see:**
- Page title: "Replication"
- Two main sections:
  - **Publications** (we'll use this)
  - **Tables** (list of your database tables)

---

### **Step 3: Find Realtime Section**

1. On the Replication page, scroll down slightly
2. Look for a section titled **"Realtime"** or **"Realtime Broadcast"**
3. You'll see a toggle switch or checkbox for each table

**What it looks like:**
```
┌─────────────────────────────────────┐
│  Realtime                           │
│  Enable realtime for tables         │
│                                     │
│  ☐ ai_reports                       │
│  ☐ consultations                    │
│  ☐ edge_nodes                       │
│  ☐ patients                         │
│  ☐ room_status                      │
│  ☐ system_logs                      │
└─────────────────────────────────────┘
```

---

### **Step 4: Enable Realtime for Required Tables**

**Click the checkbox/toggle to enable realtime for these 4 tables:**

#### ✅ **Table 1: ai_reports** (MOST IMPORTANT!)
- **Why:** This is where AI predictions and sensor data are stored
- **Impact:** Dashboard shows live AI status updates, sensor readings
- **Toggle:** Click to enable (should turn blue/green)

#### ✅ **Table 2: room_status**
- **Why:** Tracks overall room status and vital signs
- **Impact:** Room cards update instantly when status changes
- **Toggle:** Click to enable

#### ✅ **Table 3: consultations**
- **Why:** Video consultation sessions
- **Impact:** See when doctors join/leave video calls
- **Toggle:** Click to enable

#### ✅ **Table 4: edge_nodes**
- **Why:** Tracks which edge nodes (AI agents) are online/offline
- **Impact:** Dashboard shows which AI agents are connected
- **Toggle:** Click to enable

**What each toggle looks like when enabled:**
```
✓ ai_reports         [ENABLED] 🟢
✓ room_status        [ENABLED] 🟢
✓ consultations      [ENABLED] 🟢
✓ edge_nodes         [ENABLED] 🟢
```

---

### **Step 5: Save Changes**

1. Look for a **"Save"** or **"Apply"** button
   - Usually at the bottom of the Realtime section
   - Or at the top right of the page
2. Click **"Save"**
3. Wait for confirmation message (usually green popup saying "Success")

**Confirmation message you'll see:**
```
✅ Realtime settings updated successfully
```

---

### **Step 6: Verify Realtime is Enabled**

**Option A: Check in Supabase Dashboard**
1. Stay on the **Database → Replication** page
2. Scroll to the Realtime section
3. Confirm all 4 tables show as enabled (checkmarks visible)

**Option B: Check in Table Editor** (Alternative)
1. Go to **Database → Tables**
2. Click on `ai_reports` table
3. Look for a small icon/badge that says "Realtime" or shows a broadcast symbol
4. Repeat for other tables

---

### **Step 7: Test the Connection**

Now test if real-time is working in your app:

**Terminal 1 - Start Server:**
```bash
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2
npm run dev
```

**Terminal 2 - Send Test Data:**
```bash
cd C:\Users\krishna\Music\NEXCARE-5G\edge-server2\ai_agents
python test_realtime.py
```

**What to look for:**

1. **Browser Console** (F12 → Console tab):
   ```
   [5G MEC Real-Time] ✓ Connected to room-updates
   [5G MEC Real-Time] ✓ Room updates subscription active
   [5G MEC Real-Time] 📡 New NeoCare-AI report from R1: Sleeping
   ```

2. **Dashboard Header** (http://localhost:3000):
   ```
   Main Dashboard
   🟢 Real-Time Active   ← You should see this!
   ```

3. **Network Tab** (F12 → Network tab):
   - Look for WebSocket connections (ws:// or wss://)
   - Filter by "WS" to see WebSocket connections
   - Should see connection to Supabase realtime server

---

## 🔍 Detailed Troubleshooting

### ❌ Problem: Can't find "Realtime" section

**Solution:**
1. Make sure you're on **Database → Replication** page (not Publications)
2. Scroll down - Realtime section is below Publications
3. If still not visible, your Supabase version might be old:
   - Try **Database → Realtime** in the sidebar (newer UI)
   - Or look for **"Broadcast"** instead of "Realtime"

---

### ❌ Problem: Tables don't appear in Realtime section

**Possible causes:**

**A) Tables not created yet**
- Go to **Database → SQL Editor**
- Run the SQL from `SUPABASE_SCHEMA.sql`
- Check **Database → Tables** to confirm tables exist

**B) Wrong publication**
- Supabase uses "publications" for replication
- Default publication is `supabase_realtime`
- Tables must be part of this publication

**Fix:**
1. Go to **Database → Replication**
2. Find **Publications** section
3. Click on `supabase_realtime` publication
4. Make sure your tables are listed:
   - ai_reports
   - room_status
   - consultations
   - edge_nodes
5. If missing, click **"Add table"** and select them

---

### ❌ Problem: Dashboard still shows "Polling Mode"

**Check these in order:**

**1. Verify Supabase credentials**
```bash
# Check .env.local file
cat .env.local
```
Should see:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**2. Restart Next.js server**
```bash
# Stop current server (Ctrl+C)
npm run dev
```

**3. Hard refresh browser**
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`
- Or clear browser cache

**4. Check browser console for errors**
- Press F12
- Go to Console tab
- Look for red error messages
- Common errors:
  - "WebSocket connection failed" → Check Supabase URL
  - "Invalid API key" → Check anon key
  - "CORS error" → Make sure Supabase project is active (not paused)

**5. Verify project is not paused**
- Supabase free tier pauses projects after 7 days of inactivity
- Go to Supabase dashboard home
- If paused, you'll see "Project paused" banner
- Click "Restore" to unpause

---

### ❌ Problem: Real-time works but data not updating

**Check data is being sent:**

**1. Run test script**
```bash
cd ai_agents
python test_realtime.py
```
Should see:
```
✅ [04:25:30] Report sent successfully
   Status: Sleeping | Temp: 36.5°C | BPM: 125 | Alert: normal
```

**2. Check Supabase Table Editor**
- Go to **Database → Tables → ai_reports**
- Click **"Refresh"** button
- New rows should appear
- Check timestamps are recent

**3. Verify report format**
- In Table Editor, click on a recent row
- Make sure all required fields are populated:
  - `room_id` (e.g., "R1")
  - `module` (e.g., "NeoCare-AI")
  - `status` (e.g., "Sleeping")
  - `confidence` (0.0 - 1.0)
  - `alert_level` (normal/warning/critical)

---

### ❌ Problem: WebSocket connection fails

**Check network connectivity:**

**1. Test Supabase connection**
```bash
curl https://YOUR_PROJECT.supabase.co/rest/v1/
```
Should return: `{"message": "..."}` (not an error)

**2. Check firewall settings**
- Corporate/university networks might block WebSockets
- Try from different network (mobile hotspot)
- Check if port 443 (HTTPS) is open

**3. Browser compatibility**
- WebSockets work in all modern browsers
- If using old browser, update to latest version
- Test in Chrome/Edge (best support)

---

## 📊 Understanding Realtime Settings

### **What does enabling realtime do?**

When you enable realtime for a table:
1. **Database Change Detection:** Supabase monitors INSERT, UPDATE, DELETE operations
2. **Change Data Capture (CDC):** Captures row data that changed
3. **WebSocket Broadcast:** Sends changes to all subscribed clients
4. **Client Notification:** Dashboard receives notification and updates UI

### **Performance Impact**

- **Latency:** ~50-100ms from database INSERT to client notification
- **Resource Usage:** Minimal (Supabase handles this efficiently)
- **Scalability:** Up to 500 concurrent connections per project (free tier)
- **Cost:** $0 on free tier (included)

### **Which events are broadcast?**

By default, these events trigger broadcasts:
- ✅ **INSERT** - New row added (e.g., new AI report)
- ✅ **UPDATE** - Existing row modified (e.g., room status changed)
- ✅ **DELETE** - Row removed (less common in our app)

---

## 🎯 Advanced Configuration (Optional)

### **Filter broadcasts by column**

If you only want to broadcast specific changes:

1. Go to **Database → Replication → Realtime**
2. Click on table name (e.g., `ai_reports`)
3. Select **"Filters"** or **"Column-level replication"**
4. Choose which columns trigger broadcasts

**Example:** Only broadcast when `alert_level` changes to "critical":
```sql
-- Advanced filter (requires SQL)
WHERE alert_level = 'critical'
```

### **Row Level Security (RLS) with Realtime**

Realtime respects your RLS policies:
- Clients only receive broadcasts for rows they have access to
- Our schema allows anonymous reads (anon key)
- This is why we use `anon` key in `.env.local`

To verify policies:
1. Go to **Database → Policies**
2. Check `ai_reports` table
3. Should see policy: "Allow read for anon"

---

## ✅ Success Checklist

After enabling realtime, verify these:

- [ ] **1. Supabase Dashboard**
  - [ ] Realtime enabled for `ai_reports`
  - [ ] Realtime enabled for `room_status`
  - [ ] Realtime enabled for `consultations`
  - [ ] Realtime enabled for `edge_nodes`
  - [ ] "Save" button clicked
  - [ ] Success message appeared

- [ ] **2. Local Development**
  - [ ] `.env.local` has correct Supabase URL
  - [ ] `.env.local` has correct anon key
  - [ ] Next.js server restarted (`npm run dev`)
  - [ ] Browser hard-refreshed (Ctrl+Shift+R)

- [ ] **3. Dashboard Verification**
  - [ ] Dashboard shows "Real-Time Active" 🟢
  - [ ] Browser console shows connection messages
  - [ ] Network tab shows WebSocket connection

- [ ] **4. Data Flow Test**
  - [ ] `python test_realtime.py` runs successfully
  - [ ] Dashboard updates appear instantly
  - [ ] No 5-second delay between updates
  - [ ] Sensor data displays correctly (temp, BPM)

---

## 📞 Still Having Issues?

### **Check these common mistakes:**

1. ❌ **Forgot to click Save** in Supabase dashboard
2. ❌ **Wrong table names** (must match exactly: `ai_reports` not `ai-reports`)
3. ❌ **Anon key instead of service role key** (use anon for public access)
4. ❌ **Project paused** (free tier pauses after 7 days)
5. ❌ **Firewall blocking WebSockets** (test on different network)

### **Debugging commands:**

**Check what's in the database:**
```bash
# Using curl to query Supabase
curl -X GET 'https://YOUR_PROJECT.supabase.co/rest/v1/ai_reports?select=*&order=created_at.desc&limit=5' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Test WebSocket connection:**
- Open browser DevTools (F12)
- Go to Console tab
- Paste this code:
```javascript
const ws = new WebSocket('wss://YOUR_PROJECT.supabase.co/realtime/v1/websocket?apikey=YOUR_ANON_KEY&vsn=1.0.0');
ws.onopen = () => console.log('✅ WebSocket connected!');
ws.onerror = (err) => console.error('❌ WebSocket error:', err);
```

---

## 🎉 What Happens When It Works

### **Visual indicators:**

**In Dashboard Header:**
```
Main Dashboard
🟢 Real-Time Active  ← Green pulsing dot
```

**In Browser Console (F12):**
```
[5G MEC] ✓ Connected to cloud database
[5G MEC Real-Time] ✓ Connected to room-updates
[5G MEC Real-Time] ✓ Room updates subscription active
[5G MEC Real-Time] 📡 New NeoCare-AI report from R1: Sleeping
```

**On Dashboard:**
- Room cards update **instantly** when AI agent sends data
- Temperature, BPM, status appear **immediately**
- No waiting, no loading spinners
- Smooth, professional UX

---

## 📚 Additional Resources

**Supabase Docs:**
- Real-time Overview: https://supabase.com/docs/guides/realtime
- Real-time Broadcast: https://supabase.com/docs/guides/realtime/broadcast
- Troubleshooting: https://supabase.com/docs/guides/realtime/troubleshooting

**Our Documentation:**
- [REALTIME_SETUP_COMPLETE.md](REALTIME_SETUP_COMPLETE.md) - Complete real-time guide
- [CLOUD_QUICK_START.md](CLOUD_QUICK_START.md) - Overall setup
- [SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md) - Detailed Supabase setup

---

## 🚀 You're Done!

Once you see "Real-Time Active" in your dashboard:
- ✅ Real-time is working
- ✅ WebSocket connected
- ✅ Dashboard will update instantly
- ✅ Professional monitoring system ready!

**Now run your AI agent and watch the magic happen!** 🎉
