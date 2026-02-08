/**
 * Quick Start Guide for 5G MEC Cloud Setup
 */

# 🚀 Quick Start - 5G MEC Cloud Setup

## Step 1: Create Supabase Project (2 minutes)

1. Go to https://supabase.com (free account)
2. Click "New Project"
3. Name: `nexcare-5g`
4. Wait for database to provision

## Step 2: Setup Database Schema (1 minute)

1. In Supabase dashboard → SQL Editor
2. Copy entire content from `SUPABASE_SCHEMA.sql`
3. Click "Run" to create all tables

## Step 3: Get API Credentials (30 seconds)

1. Supabase dashboard → Settings → API
2. Copy **Project URL**
3. Copy **anon public** key

## Step 4: Configure Environment Variables

Create `.env.local` in project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 5: Install Dependencies

```bash
npm install
```

## Step 6: Start Server

```bash
npm run dev
```

Access at: http://localhost:3000

---

## 🎥 Video Calls (No Setup Required)

Video calls use **Jitsi Meet** - 100% free, works instantly:
- Click "Start Video Call" in any consultation
- Share the Jitsi link with remote participants
- No API keys, no servers, no configuration needed

---

## 🤖 AI Agent Setup (on separate laptop)

On your AI agent laptop:

1. Navigate to `ai_agents/` folder
2. Create `.env`:
   ```
   EDGE_SERVER_HOST=your-server-ip
   EDGE_SERVER_PORT=3000
   ROOM_ID=R1
   CAMERA_INDEX=0
   ```
3. Install: `pip install -r requirements.txt`
4. Run: `python neocare_agent.py`

The agent will send data directly to Supabase cloud (through Next.js API).

---

## ✅ Verification

1. **Database**: Visit Supabase dashboard → Table Editor → see `patients`, `ai_reports` tables
2. **Server**: http://localhost:3000/api/rooms should return `{"rooms":[],"count":0}`
3. **Video**: Click any "Start Video Call" button → Jitsi window opens
4. **Real-time**: When AI agent runs, dashboard shows live updates (2-second refresh)

---

## 🌐 Works on Any Network

- ✅ Mobile hotspot (4G/5G)
- ✅ Home WiFi
- ✅ University network
- ✅ Different cities/countries
- ✅ Dynamic IPs

All communication is **outbound to cloud** → No port forwarding needed!

---

## 📱 4 Edge Nodes (Full Setup)

1. **Control Center** (your laptop) - Dashboard + monitoring
2. **Consultation Station** - Doctor video calls
3. **NeoCare AI** (friend's laptop) - Baby monitoring
4. **GeriCare AI** - Elderly monitoring

Each runs the same code, just different `.env` configuration.

---

## 🔥 Next Steps

1. **Done!** Your 5G MEC cloud system is running
2. Test video calls with Jitsi
3. Add more AI agents (just copy neocare_agent.py)
4. Monitor real-time data in Supabase dashboard

**That's it!** No complex networking, no local databases, pure cloud magic.
