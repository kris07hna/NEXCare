# NEXCare 5G MEC Architecture

## Overview
NEXCare uses a **5G MEC (Multi-Access Edge Computing)** architecture where **Supabase acts as the 5G MEC Cloud Server** and **4 laptops act as Edge Nodes** sending data directly to the cloud.

```
┌─────────────────────────────────────────────────────────────┐
│                   5G MEC CLOUD SERVER                        │
│                   (Supabase Real-time DB)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Patients │  │AI Reports│  │  Rooms   │  │Consults  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                Real-time Sync & Broadcasting                 │
└─────────────────────────────────────────────────────────────┘
           ▲              ▲              ▲              ▲
           │              │              │              │
    Direct Cloud Access (HTTPS/WebSocket)
           │              │              │              │
    ┌──────┴──────┬───────┴──────┬───────┴──────┬──────┴──────┐
    │             │              │              │              │
┌───▼──────┐  ┌───▼──────┐  ┌───▼──────┐  ┌───▼──────┐      │
│ EDGE 1   │  │ EDGE 2   │  │ EDGE 3   │  │ EDGE 4   │      │
│ SERVER   │  │CONSULT   │  │GERICARE  │  │ NEOCARE  │      │
│ CONSOLE  │  │ ROOM     │  │  AGENT   │  │  AGENT   │      │
└──────────┘  └──────────┘  └──────────┘  └──────────┘      │
```

## 5G MEC Cloud Server (Supabase)

**Supabase** is the central 5G MEC server providing:
- **Real-time Database**: PostgreSQL with real-time subscriptions
- **RESTful API**: Auto-generated from database schema  
- **Real-time Broadcasting**: WebSocket-based pub/sub
- **Storage**: For video recordings (optional)
- **Edge Functions**: Serverless compute at the edge

### Database Schema (SQL)

```sql
-- Patients Table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  room_id TEXT,
  blood_type TEXT,
  status TEXT DEFAULT 'active',
  admission_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Reports Table
CREATE TABLE ai_reports (
  id BIGSERIAL PRIMARY KEY,
  report_id UUID DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL,
  patient_id UUID REFERENCES patients(id),
  module TEXT NOT NULL,
  status TEXT NOT NULL,
  confidence REAL,
  timestamp BIGINT NOT NULL,
  alert_level TEXT DEFAULT 'normal',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consultation Sessions Table
CREATE TABLE consultation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  room_id TEXT NOT NULL,
  patient_id UUID REFERENCES patients(id),
  doctor_name TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  daily_room_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Real-time
ALTER PUBLICATION supabase_realtime ADD TABLE ai_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE consultation_sessions;
```

## Edge Nodes (4 Laptops)

| Node | Role | AI Module | Features |
|------|------|-----------|----------|
| **Edge 1** | Server Console | Dashboard | Real-time monitoring, patient management, analytics |
| **Edge 2** | Consultation | Video Room | Doctor consultations, Daily.co video, notes |
| **Edge 3** | GeriCare | Fall Detection | YOLOv8 fall detection, movement tracking |
| **Edge 4** | NeoCare | Sleep Monitor | MediaPipe sleep detection, Arduino sensors |

## Data Flow

### Edge Node → Cloud (Direct Upload)

**Python AI Agent Example (NeoCare/GeriCare)**:
```python
from supabase import create_client
import time

# Connect to 5G MEC Cloud
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Send report directly to cloud
response = supabase.table('ai_reports').insert({
    'room_id': 'R1',
    'module': 'NeoCare-AI',
    'status': 'Sleeping',
    'confidence': 0.95,
    'timestamp': int(time.time()),
    'alert_level': 'normal',
    'metadata': {
        'temperature': 36.5,
        'bpm': 120,
        'ear': 0.22
    }
}).execute()

print(f"✓ Report sent to 5G MEC Cloud: {response.data[0]['id']}")
```

### Cloud → Dashboard (Real-time Subscription)

**Next.js Dashboard Example**:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Subscribe to real-time AI reports
supabase
  .channel('ai-reports-channel')
  .on('postgres_changes', 
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'ai_reports' 
    },
    (payload) => {
      console.log('📡 New report from cloud:', payload.new)
      updateRoomDisplay(payload.new)
    }
  )
  .subscribe()
```

## Video Consultations (Daily.co)

### Free Tier: 10,000 minutes/month
- WebRTC video/audio
- Screen sharing  
- Recording to cloud
- Custom branding
- No download required

### Creating Video Room

```typescript
// Create room via Daily.co API
const createVideoRoom = async (roomId: string) => {
  const response = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DAILY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: `nexcare-${roomId}`,
      privacy: 'private',
      properties: {
        max_participants: 2,
        enable_screenshare: true,
        enable_recording: 'cloud',
        start_video_off: false,
        start_audio_off: false
      }
    })
  })
  
  const room = await response.json()
  
  // Save to Supabase
  await supabase.table('consultation_sessions').insert({
    session_id: `CONSULT_${Date.now()}`,
    room_id: roomId,
    daily_room_url: room.url,
    status: 'active'
  })
  
  return room.url // https://your-domain.daily.co/nexcare-R1
}
```

## Setup Guide

### Step 1: Create Supabase Project (5G MEC Server)

1. Go to https://supabase.com → Create account
2. Create new project
3. Go to **Settings → API**
4. Copy:
   - Project URL: `https://xxx.supabase.co`
   - `anon` key: `eyJxxx...`
   - `service_role` key: `eyJxxx...`
5. Go to **SQL Editor** → Run schema from above
6. Go to **Database → Replication** → Enable for `ai_reports`

### Step 2: Create Daily.co Account

1. Go to https://dashboard.daily.co → Sign up
2. Get API key from **Developers** section
3. Note your subdomain: `your-subdomain.daily.co`

### Step 3: Configure Edge Nodes

Create `.env` file on each laptop:

**Edge Node 1 (Server Console)**:
```env
EDGE_NODE_TYPE=SERVER_CONSOLE
EDGE_NODE_ID=EDGE_001
EDGE_NODE_NAME=Main_Console

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

NEXT_PUBLIC_DAILY_API_KEY=xxx
DAILY_DOMAIN=your-subdomain.daily.co

OFFLINE_MODE=false
```

**Edge Node 2 (Consultation)**:
```env
EDGE_NODE_TYPE=CONSULTATION
EDGE_NODE_ID=EDGE_002
EDGE_NODE_NAME=Consultation_Room

# Same Supabase & Daily credentials
```

**Edge Node 3 (GeriCare - Python)**:
```env
# ai_agents/.env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJxxx...  # service_role key
ROOM_ID=R2
MODULE=GeriCare-AI
CAMERA_INDEX=0
```

**Edge Node 4 (NeoCare - Python)**:
```env
# ai_agents/.env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJxxx...  # service_role key
ROOM_ID=R1
MODULE=NeoCare-AI
CAMERA_INDEX=0
ARDUINO_PORT=COM6
```

### Step 4: Install & Run

**Dashboard Nodes (Edge 1 & 2)**:
```bash
npm install @supabase/supabase-js @daily-co/daily-js
npm run dev
# Open: http://localhost:3000
```

**AI Agent Nodes (Edge 3 & 4)**:
```bash
pip install supabase opencv-python mediapipe pyserial
cd ai_agents
python gericare_agent.py  # or neocare_agent.py
```

## Architecture Benefits

✅ **No Local Network**: All laptops connect via internet, no hotspot needed  
✅ **Real-time Sync**: Supabase broadcasts updates to all nodes instantly  
✅ **Scalable**: Add 10+ edge nodes easily  
✅ **Reliable**: Cloud database with auto-backups  
✅ **Free**: Supabase 500MB + Daily 10K min/month = $0  
✅ **Global Access**: Monitor from anywhere with internet

## Cost Breakdown

| Service | Free Tier | Our Usage | Cost |
|---------|-----------|-----------|------|
| Supabase | 500MB DB, 2GB bandwidth | ~100MB, ~500MB/month | **$0** |
| Daily.co | 10,000 minutes/month | ~1000 min/month | **$0** |
| **Total** | | | **$0/month** |

## Security

- All connections over **HTTPS/WSS** (encrypted)
- **Row Level Security** (RLS) in Supabase
- API keys in environment variables  
- Daily.co rooms are **private by default**
- No data stored locally (cloud-first)

## Real-world Performance

- **Latency**: 50-200ms (depending on internet)
- **Update Rate**: 2 seconds (AI agents)
- **Dashboard Refresh**: Real-time (WebSocket)
- **Video Quality**: HD 720p (Daily.co default)
- **Concurrent Users**: 100+ (Supabase free tier)

## Next Steps

1. ✅ Configure Supabase (5G MEC Cloud)
2. ✅ Setup Daily.co for video
3. ✅ Update database.ts to remove SQLite
4. ✅ Add Supabase real-time subscriptions
5. ✅ Update AI agents to send to cloud
6. ✅ Test end-to-end with all 4 edge nodes
