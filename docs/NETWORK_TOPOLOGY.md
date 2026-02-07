# NEXCARE-5G Hotspot Network Topology

```
                    ╔═══════════════════════════════════════════╗
                    ║      📱 MOBILE PHONE HOTSPOT             ║
                    ║                                           ║
                    ║   SSID: NEXCARE-5G                       ║
                    ║   Password: nexcare2026                  ║
                    ║   Network: 192.168.43.0/24               ║
                    ║   Gateway: 192.168.43.1                  ║
                    ╚═══════════════════════════════════════════╝
                                    │
                                    │ WiFi
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼────────┐  ┌──▼───────────┐  ┌▼───────────────┐
            │  💻 Laptop 1   │  │ 💻 Laptop 2  │  │  💻 Laptop 3   │
            │                │  │              │  │                │
            │ Central Server │  │ NeoCare AI   │  │  GeriCare AI   │
            │ 192.168.43.10  │  │ 192.168.43.20│  │  192.168.43.30 │
            └───────┬────────┘  └──────┬───────┘  └────────┬───────┘
                    │                  │                    │
                    │                  │                    │
         ┌──────────┴──────────────────┴────────────────────┴──────────┐
         │                                                              │
         │              HTTP/WebRTC Communication                       │
         │              All via 192.168.43.10:3000                     │
         │                                                              │
         └──────────────────────┬───────────────────────────────────────┘
                                │
                    ┌───────────┼──────────────┐
                    │           │              │
            ┌───────▼────────┐ ┌▼────────────┐│
            │  💻 Laptop 4   │ │ 💻 Laptop 5 ││
            │                │ │             ││
            │ Doctor Console │ │ Room Monitor││
            │ 192.168.43.40  │ │192.168.43.50││
            └────────────────┘ └─────────────┘│
                    │               │         │
                    │               │         │
            ┌───────▼───────┐ ┌─────▼─────┐  │
            │   Browser     │ │  Browser  │  │
            │               │ │           │  │
            │ Consultations │ │ Dashboard │  │
            │   Page        │ │   Page    │  │
            └───────────────┘ └───────────┘  │
                                              │
                                              │
                                              │
                    ┌─────────────────────────┘
                    │
                    │
            ┌───────▼────────┐
            │  🎥 WebRTC     │
            │  Video/Audio   │
            │                │
            │  Doctor ←──→   │
            │  Room Monitor  │
            └────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          AI REPORTING FLOW                           │
└─────────────────────────────────────────────────────────────────────┘

    Laptop 2 (NeoCare)                    Laptop 1 (Server)
    ┌──────────────────┐                 ┌────────────────────┐
    │                  │                 │                    │
    │  📹 Webcam       │                 │  Next.js Server    │
    │     ↓            │                 │  Port 3000         │
    │  YOLOv8 Model    │    HTTP POST    │     ↓              │
    │     ↓            │  ───────────→   │  /api/reports      │
    │  Detection       │  AI Report JSON │     ↓              │
    │     ↓            │                 │  Validation (Zod)  │
    │  JSON Report     │                 │     ↓              │
    │  - Room: R2      │                 │  SQLite Database   │
    │  - Status: SLEEP │                 │     ↓              │
    │  - Conf: 0.92    │                 │  Room Registry     │
    │                  │                 │     ↓              │
    └──────────────────┘                 │  Response: 200 OK  │
                                         └────────────────────┘
                                                  ↓
                                         ┌────────────────────┐
                                         │  Dashboard Updates │
                                         │  (Polling 2s)      │
                                         └────────────────────┘
                                                  ↓
    Laptop 4/5 (Browsers)               ┌────────────────────┐
    ┌──────────────────┐                │  GET /api/rooms    │
    │                  │  ←─────────────┤  Every 2 seconds   │
    │  Dashboard UI    │  Room Status   │                    │
    │     ↓            │                └────────────────────┘
    │  Room Cards      │
    │  - R2: Sleeping  │
    │  - R5: Active    │
    │  - Confidence    │
    │  - Last Update   │
    └──────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                        WEBRTC VIDEO FLOW                             │
└─────────────────────────────────────────────────────────────────────┘

Laptop 4 (Doctor)                       Laptop 1 (Server)
┌──────────────────┐                   ┌────────────────────┐
│  1. Click Start  │    POST           │  Create Session    │
│     Consultation │ ────────────────→ │  Generate ID       │
│                  │                   │  Store in DB       │
└──────────────────┘                   └────────────────────┘
         ↓                                       ↓
┌──────────────────┐                   ┌────────────────────┐
│  2. Get Media    │                   │  Return Session    │
│     Camera + Mic │                   │  session_id: abc123│
│                  │                   └────────────────────┘
└──────────────────┘                            ↓
         ↓                              Share URL with Room
┌──────────────────┐                            ↓
│  3. Create Peer  │                   Laptop 5 (Room Monitor)
│     Connection   │                   ┌────────────────────┐
│                  │                   │ Open room-call URL │
└──────────────────┘                   │ /room-call/abc123  │
         ↓                              └────────────────────┘
┌──────────────────┐                            ↓
│  4. Create Offer │    POST           ┌────────────────────┐
│     SDP          │ ────────────────→ │  Store Offer       │
│                  │  /api/webrtc/     │  in Signaling      │
└──────────────────┘     signal        └────────────────────┘
         ↓                                       ↓
         │                              ┌────────────────────┐
         │                              │  Poll for Signals  │
         │                              │  GET /api/webrtc/  │
         │                   ←──────────│     signal/:peer   │
         │                              └────────────────────┘
         ↓                                       ↓
┌──────────────────┐                   ┌────────────────────┐
│  Poll for Answer │    GET            │  Receive Offer     │
│                  │ ←─────────────────│  Create Answer     │
│                  │                   │  POST Answer back  │
└──────────────────┘                   └────────────────────┘
         ↓                                       ↓
┌──────────────────┐                   ┌────────────────────┐
│  Set Remote SDP  │                   │  Set Remote SDP    │
│  Exchange ICE    │ ←────────────────→│  Exchange ICE      │
│  Candidates      │   P2P via STUN    │  Candidates        │
└──────────────────┘                   └────────────────────┘
         ↓                                       ↓
┌──────────────────┐                   ┌────────────────────┐
│  🎥 CONNECTED    │                   │  🎥 CONNECTED      │
│                  │ ═══════════════════│                    │
│  Local Video     │  Direct P2P Video │  Local Video       │
│  Remote Video    │  Low Latency (<200│  Remote Video      │
│  Audio Stream    │  Network Only     │  Audio Stream      │
└──────────────────┘                   └────────────────────┘
```

## Network Ports & Protocols

| Protocol | Port | Purpose | Direction |
|----------|------|---------|-----------|
| HTTP | 3000 | API + Web Server | All → Server |
| WebRTC | Dynamic | Video/Audio P2P | Doctor ↔ Room |
| STUN | 19302 | NAT Traversal | All → Google |
| SQLite | - | Local Database | Server only |

## Security Considerations

```
Current Setup (Demo Mode):
┌─────────────────────────────────────┐
│  ⚠️  NO ENCRYPTION (HTTP)           │
│  ⚠️  NO AUTHENTICATION              │
│  ⚠️  OPEN CORS (Allow *)            │
│  ⚠️  HOTSPOT WPA2-PSK ONLY          │
└─────────────────────────────────────┘
         │
         │ Acceptable for:
         │ - Local demo
         │ - Trusted network
         │ - Non-production
         │
         ▼
Production Upgrade:
┌─────────────────────────────────────┐
│  ✅  HTTPS with SSL Certificate     │
│  ✅  JWT Authentication              │
│  ✅  Restricted CORS                 │
│  ✅  VPN or WPA3-Enterprise          │
│  ✅  End-to-End Encryption (E2EE)    │
└─────────────────────────────────────┘
```

## Bandwidth Usage Estimates

```
Activity                  Bandwidth       Data per Hour
─────────────────────────────────────────────────────────
Dashboard (polling)       ~10 Kbps        5 MB
AI Report Updates         ~5 Kbps         2 MB
Video Call (720p)         ~2 Mbps         900 MB
Video Call (480p)         ~1 Mbps         450 MB
API Health Checks         ~1 Kbps         <1 MB

─────────────────────────────────────────────────────────
Typical Demo (2 hours):
  - 3 Dashboards:           30 MB
  - 2 AI Agents:            8 MB
  - 1 Video Call (30 min):  450 MB
  ─────────────────────────
  Total:                    ~500 MB
```

## Latency Expectations

```
Network Hop Analysis:
┌─────────────────────────────────────────────────┐
│ Laptop → Phone Hotspot     │  2-5ms  │  Good   │
│ Phone Hotspot → Server     │  2-5ms  │  Good   │
│ Total Round Trip (RTT)     │  8-20ms │  Excellent│
├─────────────────────────────────────────────────┤
│ API Request (Local)        │  10-50ms│  Fast   │
│ WebRTC Connection Setup    │  1-3s   │  Normal │
│ WebRTC Video Latency       │ 50-200ms│  Good   │
└─────────────────────────────────────────────────┘

Degradation Factors:
❌ Distance from phone      (+10-50ms)
❌ Multiple walls           (+20-100ms)
❌ Network congestion       (+50-500ms)
❌ Low signal strength      (+100-1000ms)
```

## IP Address Assignment

### Typical Ranges by Device:

**Android Hotspot:**
- Gateway: `192.168.43.1`
- DHCP Range: `192.168.43.2` - `192.168.43.254`
- Example: `192.168.43.10`

**iPhone Hotspot:**
- Gateway: `172.20.10.1`
- DHCP Range: `172.20.10.2` - `172.20.10.254`
- Example: `172.20.10.5`

**Windows Hotspot:**
- Gateway: `192.168.137.1`
- DHCP Range: `192.168.137.2` - `192.168.137.254`
- Example: `192.168.137.50`

### Static IP Configuration (Optional):

For production, consider static IPs:
```
Server:     192.168.43.10
NeoCare:    192.168.43.20
GeriCare:   192.168.43.30
Doctor:     192.168.43.40
Monitor:    192.168.43.50
```

## Troubleshooting Flowchart

```
                    Start Here
                        │
                        ▼
          Can you ping the server?
                Yes │     │ No
        ┌───────────┘     └──────────┐
        ▼                             ▼
   Is port 3000             Are you on same
   open/listening?          hotspot network?
   Yes │    │ No             Yes │    │ No
   ┌───┘    └───┐           ┌────┘    └────┐
   ▼            ▼           ▼               ▼
Server      Firewall    Check IP      Connect to
works!      blocking    matches       NEXCARE-5G
            │                        hotspot
            ▼
    Run setup-hotspot.ps1
    or manually allow
    port 3000
```

## Network Topology Legend

```
╔══╗  Phone/Hotspot (WiFi Access Point)
║  ║
╚══╝

┌──┐  Laptop/Computer (Client Device)
│  │
└──┘

───►  HTTP/WebSocket Communication
═══►  WebRTC P2P Connection (Direct)
····►  Polling/Status Updates
```

---

**For detailed setup instructions, see:**
- `QUICK_START.md` - Fast setup guide
- `docs/MOBILE_HOTSPOT_SETUP.md` - Comprehensive manual
- `setup-hotspot.ps1` - Automated setup script
