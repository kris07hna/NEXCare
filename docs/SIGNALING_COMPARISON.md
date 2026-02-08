# WebRTC Signaling: 3 Approaches for NEXCARE-5G

## Overview

After analyzing [musebe/nextjs-webrtc](https://github.com/musebe/nextjs-webrtc), here are **3 ways** to efficiently connect multiple clients:

---

## 🔥 **Approach 1: Firestore (Reference Repo Pattern)**

### **How It Works:**
- Uses Firebase Firestore as signaling database
- Each call creates a document with offer/answer SDP
- ICE candidates stored in subcollections
- Real-time sync via `onSnapshot()` listeners

### **Architecture:**
```
AI Agent (Laptop 3)           Firestore Cloud           Doctor (Laptop 1)
       │                             │                         │
       ├──── createOffer() ──────────►│                         │
       │       (write SDP)            │                         │
       │                              │◄───── onSnapshot() ─────┤
       │                              │      (listen for offer) │
       │                              │                         │
       │                              │◄──── createAnswer() ────┤
       │◄──────────────────────────────      (write SDP)        │
       │         onSnapshot()                                   │
       │        (listen for answer)                             │
```

### **Code Example:**
```typescript
// AI Agent creates offer
const callDoc = firestore.collection('calls').doc(roomId);
const offerCandidates = callDoc.collection('offerCandidates');

pc.onicecandidate = (event) => {
  event.candidate && offerCandidates.add(event.candidate.toJSON());
};

const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
await callDoc.set({ offer: { type: offer.type, sdp: offer.sdp } });

// Doctor listens for offer
callDoc.onSnapshot(async (snapshot) => {
  const data = snapshot.data();
  if (data?.offer) {
    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await callDoc.update({ answer });
  }
});
```

### **Pros:**
- ✅ **No server setup** - Firebase handles everything
- ✅ **Auto-scaling** - Handles 1000+ concurrent calls
- ✅ **Offline support** - Firestore caches locally
- ✅ **Built-in persistence** - Can replay past calls
- ✅ **Multi-device sync** - Same user on phone + laptop
- ✅ **Security** - Firestore rules for access control

### **Cons:**
- ❌ **Cost** - ~$0.18 per GB egress (free tier: 10 GB/month)
- ❌ **Vendor lock-in** - Tied to Google Cloud
- ❌ **Latency** - 100-300ms (vs <50ms WebSocket)
- ❌ **Read/Write limits** - 1 doc = 1 read (costs add up)
- ❌ **No room presence** - Can't see "who's online" easily

### **Best For:**
- Production apps needing 99.9% uptime
- Teams without DevOps experience
- Apps with offline requirements
- Global user base (Firebase CDN)

### **Setup:**
```bash
npm install firebase
```

```typescript
// utils/firebase.ts
import firebase from 'firebase/app';
import 'firebase/firestore';

const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  projectId: "nexcare-5g",
  // ... other config
};

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}

export const firestore = firebase.firestore();
```

---

## ⚡ **Approach 2: WebSocket Server (Full Control)**

### **How It Works:**
- Custom Node.js WebSocket server
- Clients connect via `ws://` protocol
- Server broadcasts messages to room members
- Full control over logic

### **Architecture:**
```
AI Agent (Laptop 3)            WebSocket Server          Doctor (Laptop 1)
       │                       (Laptop 1:8080)                  │
       ├─ ws.connect() ──────────►│                             │
       │                           │◄────── ws.connect() ───────┤
       ├─ { type: 'offer' } ──────►│                             │
       │                           ├───► { type: 'offer' } ──────►│
       │                           │    ◄──── { type: 'answer' }─┤
       │◄─── { type: 'answer' } ───┤                             │
```

### **Code Example:**
See `server-websocket.ts` and `lib/websocket-signaling.ts` (already created)

### **Usage:**
```typescript
// Connect to room
const signaling = new WebSocketSignaling(
  'ws://10.107.51.130:8080',
  'R2',  // roomId
  'doctor-123'  // clientId
);

await signaling.connect();

// Send offer
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
signaling.sendOffer(offer);

// Receive answer
signaling.on('answer', async (message) => {
  await pc.setRemoteDescription(new RTCSessionDescription(message.data));
});
```

### **Pros:**
- ✅ **Low latency** - <50ms message delivery
- ✅ **No cost** - Run on your own servers
- ✅ **Full control** - Custom logic, logging, analytics
- ✅ **Room presence** - Know exactly who's online
- ✅ **Efficient** - Single connection, instant updates
- ✅ **Privacy** - Data never leaves your network

### **Cons:**
- ❌ **Maintenance** - You manage uptime, scaling
- ❌ **No offline** - Clients must be connected
- ❌ **Scaling complexity** - Need load balancer for 1000+ users
- ❌ **Server required** - Must keep server running

### **Best For:**
- Local network demos (mobile hotspot)
- Privacy-sensitive data (hospitals)
- Learning WebRTC internals
- Cost-sensitive projects

### **Setup:**
```bash
npm install ws @types/ws

# Run server
node server-websocket.ts

# Or with tsx
npx tsx server-websocket.ts
```

---

## 🔄 **Approach 3: HTTP Polling (Current)**

### **How It Works:**
- Client polls `/api/webrtc/signal` every 500ms-2s
- Server stores offers/answers in memory
- Inefficient but simple

### **Architecture:**
```
AI Agent                       HTTP API                   Doctor
   │                        (Laptop 1:3000)                 │
   ├─ POST /api/signal ──────────►│                         │
   │   { offer }                   │                         │
   │                               │◄─── GET /api/signal ───┤
   │                               ├──► { offer } ───────────►│
   │                               │◄─── POST /api/signal ───┤
   │◄────────────────────────────────    { answer }          │
       GET /api/signal
```

### **Pros:**
- ✅ **Simple** - No WebSocket complexity
- ✅ **Works everywhere** - Even behind strict firewalls
- ✅ **Easy debugging** - Use browser DevTools

### **Cons:**
- ❌ **High latency** - 500ms-2s delay
- ❌ **Wasteful** - 90% of requests get "no new messages"
- ❌ **Bandwidth** - HTTP headers every request (1KB+)
- ❌ **Server load** - 2 req/s × 100 clients = 200 req/s

### **Best For:**
- Quick prototypes
- Legacy browser support
- Simple 1-on-1 calls

---

## 📊 **Comparison Table**

| Feature              | Firestore           | WebSocket          | HTTP Polling       |
|---------------------|---------------------|--------------------|-------------------|
| **Latency**         | 100-300ms          | <50ms              | 500-2000ms        |
| **Cost**            | $0.18/GB           | Free               | Free              |
| **Setup Complexity**| Low                | Medium             | Very Low          |
| **Scalability**     | Excellent (auto)   | Good (manual)      | Poor              |
| **Offline Support** | ✅ Yes             | ❌ No              | ❌ No             |
| **Privacy**         | ⚠️ Cloud           | ✅ Self-hosted     | ✅ Self-hosted    |
| **Multi-device**    | ✅ Yes             | ⚠️ Complex         | ⚠️ Complex        |
| **Real-time**       | ⚠️ Good            | ✅ Excellent       | ❌ Poor           |

---

## 🎯 **Recommendation for NEXCARE-5G**

### **For Demo (Mobile Hotspot Setup):**
→ **Use WebSocket** (`server-websocket.ts`)
- Runs on Laptop 1 (central server)
- Perfect for local network
- No internet required
- Low latency for live monitoring

### **For Production (Hospital Deployment):**
→ **Use Firestore**
- Reliable 24/7 uptime
- Handles doctor on phone while away
- Auto-scales during high load
- Google's infrastructure

### **Current State (HTTP Polling):**
→ **Keep for sensor data only**
- `/api/monitoring/update` - AI agent reports (temp, BPM)
- Switch WebRTC signaling to WebSocket/Firestore

---

## 🚀 **Quick Start: WebSocket for Demo**

### **1. Install Dependencies:**
```bash
npm install ws @types/ws
```

### **2. Start WebSocket Server:**
```bash
# In edge-server2 directory
npx tsx server-websocket.ts
```

### **3. Update Client Code:**
```typescript
// In useWebRTC hook
import { WebSocketSignaling } from '@/lib/websocket-signaling';

const signaling = new WebSocketSignaling(
  'ws://10.107.51.130:8080',
  roomId,
  clientId
);

await signaling.connect();
```

### **4. Test:**
- Open `http://10.107.51.130:3000/room-monitoring`
- Should see instant updates (<50ms latency)
- Check browser console: `[WebSocket] Connected`

---

## 📚 **Additional Resources**

- [WebRTC Samples](https://webrtc.github.io/samples/)
- [Firebase Firestore Docs](https://firebase.google.com/docs/firestore)
- [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [ICE Candidate Explained](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/icecandidate_event)

---

## 💡 **Pro Tips**

### **1. Hybrid Approach (Best of Both Worlds):**
```typescript
// Use WebSocket for signaling (fast)
const signaling = new WebSocketSignaling(...);

// Use HTTP for sensor data (simple)
fetch('/api/monitoring/update', {
  method: 'POST',
  body: JSON.stringify(sensorData),
});
```

### **2. ICE Candidate Pooling:**
```typescript
const pc = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,  // Pre-fetch for faster connection
});
```

### **3. Connection State Monitoring:**
```typescript
pc.onconnectionstatechange = () => {
  if (pc.connectionState === 'failed') {
    // Auto-reconnect
    await reconnect();
  }
};
```

### **4. Bandwidth Optimization:**
```typescript
// Lower video quality for multiple rooms
const constraints = {
  video: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    frameRate: { ideal: 15 },  // Reduce from 30fps
  },
  audio: true,
};
```

---

**Questions? Run the WebSocket server and test latency!**
