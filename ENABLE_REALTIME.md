# 🔴 ENABLE REAL-TIME IN SUPABASE

**IMPORTANT:** You need to enable real-time subscriptions in your Supabase project for live updates to work.

## Step 1: Go to Supabase Dashboard

1. Visit https://supabase.com/dashboard
2. Select your project: `nexcare-5g-mec`

## Step 2: Enable Real-Time for Tables

1. Click **Database** → **Replication** in the left sidebar
2. Scroll to "**Realtime**" section
3. Enable real-time for these tables:

   ✅ **ai_reports** (for live AI predictions and sensor data)
   ✅ **room_status** (for room status changes)
   ✅ **consultations** (for video call notifications)
   ✅ **edge_nodes** (for edge node connectivity)

4. Click **Save** after selecting each table

## Step 3: Verify Real-Time is Active

After enabling:
1. Restart your Next.js dev server: `npm run dev`
2. Open dashboard at http://localhost:3000
3. Look for **"Real-Time Active"** with green pulsing dot in the header
4. Run AI agent: `python ai_agents/neocare_agent.py`
5. Dashboard should update **instantly** when agent sends data

## How Real-Time Works

```
Edge Node (AI Agent) → Supabase (INSERT to ai_reports)
                              ↓
                    WebSocket Notification
                              ↓
              Dashboard (Instant UI Update) 🚀
```

**Before:** Dashboard polls every 5 seconds (slow, wastes bandwidth)
**After:** Dashboard receives updates in ~100ms (instant, efficient)

## Troubleshooting

**Still seeing "Polling Mode"?**
1. Check browser console for errors
2. Verify `.env.local` has correct Supabase credentials
3. Make sure real-time is enabled in Supabase dashboard
4. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

**Real-time not working?**
- Check Supabase project is not paused (free tier pauses after inactivity)
- Verify API key is correct (anon public key, not service role)
- Check browser network tab - should see WebSocket connection to Supabase

## Performance

- **Latency:** ~50-100ms from edge node to dashboard
- **Simultaneous connections:** Up to 500 per project (free tier)
- **Messages per second:** Unlimited for INSERT events
- **Cost:** $0 (included in Supabase free tier)

---

**That's it!** Once enabled, your dashboard becomes a true real-time monitoring system. 📡✨
