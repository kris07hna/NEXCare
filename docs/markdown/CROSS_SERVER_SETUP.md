# Cross-Server WebRTC Setup Guide

## Mobile Hotspot Network Setup for Multi-Server Consultations

This guide explains how to set up video consultations between different Edge servers connected via mobile hotspot (without internet).

---

## 🎯 Use Case

**Scenario:** Hospital with 4 different wings/departments, each with their own Edge server:
- **Server 1 (Neonatal Unit):** 192.168.43.1:3000
- **Server 2 (Geriatric Ward):** 192.168.43.2:3000
- **Server 3 (ICU):** 192.168.43.3:3000
- **Server 4 (Doctor Station):** 192.168.43.4:3000

A doctor at Server 4 wants to do a video consultation with a patient in Server 1 (neonatal) or Server 2 (geriatric).

---

## 🔧 Network Setup

### Step 1: Enable Mobile Hotspot

1. **On your mobile device:**
   - Enable mobile hotspot
   - Set hotspot name (e.g., "EdgeCare-5G-Network")
   - Set password
   - **Note the hotspot IP range** (usually 192.168.43.x for Android)

2. **Connect all laptops/servers to the hotspot:**
   - Laptop 1 (Neonatal) → Gets IP: 192.168.43.100
   - Laptop 2 (Geriatric) → Gets IP: 192.168.43.101
   - Laptop 3 (ICU) → Gets IP: 192.168.43.102
   - Laptop 4 (Doctor Station) → Gets IP: 192.168.43.103

### Step 2: Find Each Server's IP Address

On each laptop, run:

**Windows:**
```cmd
ipconfig
```
Look for "Wireless LAN adapter Wi-Fi" → "IPv4 Address"

**Linux/Mac:**
```bash
ifconfig
# or
ip addr show
```

**Note down all IPs:**
- Server 1: `192.168.43.100`
- Server 2: `192.168.43.101`
- Server 3: `192.168.43.102`
- Server 4: `192.168.43.103`

---

## ⚙️ Server Configuration

### Step 3: Configure Each Edge Server

On **each server**, edit `.env.local`:

```env
# Server Identity
SERVER_ID="Server1-Neonatal"
SERVER_IP="192.168.43.100"  # This server's IP
SERVER_PORT=3000

# Offline Mode (no internet required)
OFFLINE_MODE=true

# WebRTC Configuration for Mobile Hotspot
WEBRTC_HOST_ONLY=true  # Only use direct connections (no STUN/TURN)
WEBRTC_LOCAL_SERVER_URL=http://192.168.43.100:3000  # This server's URL

# Known Remote Servers (for cross-server consultations)
REMOTE_SERVER_1_URL=http://192.168.43.100:3000
REMOTE_SERVER_1_NAME="Neonatal Unit"

REMOTE_SERVER_2_URL=http://192.168.43.101:3000
REMOTE_SERVER_2_NAME="Geriatric Ward"

REMOTE_SERVER_3_URL=http://192.168.43.102:3000
REMOTE_SERVER_3_NAME="ICU"

REMOTE_SERVER_4_URL=http://192.168.43.103:3000
REMOTE_SERVER_4_NAME="Doctor Station"

# Database
DATABASE_PATH=./data/edgecare.db
```

**Important:** Each server must have:
- Its own unique `SERVER_IP`
- Its own unique `WEBRTC_LOCAL_SERVER_URL`
- The same list of all remote servers

### Step 4: Start Each Server

On each laptop:

```bash
# Start the Edge server
npm run dev

# The server will be accessible at:
# http://192.168.43.100:3000 (for Server 1)
# http://192.168.43.101:3000 (for Server 2)
# etc.
```

---

## 📱 Starting Cross-Server Consultations

### From the Doctor Station (Server 4):

1. **Open the Consultations tab:**
   ```
   http://192.168.43.103:3000/consultations
   ```

2. **You can now see rooms from ALL servers:**
   - Rooms from Server 1 (Neonatal)
   - Rooms from Server 2 (Geriatric)
   - Rooms from Server 3 (ICU)

3. **Click "Start Call" on any room**

4. **The WebRTC connection will establish:**
   - Signaling goes through both servers
   - Video/audio flows directly peer-to-peer
   - No internet required

---

## 🔍 How It Works

### Network Flow:

```
Doctor Laptop (192.168.43.103)
    ↓
[Mobile Hotspot Network - 192.168.43.x]
    ↓
Patient Laptop (192.168.43.100)
```

### Signaling Flow:

```
Doctor (Server 4)                    Patient (Server 1)
       |                                    |
       | POST /api/webrtc/signal            |
       |   (to 192.168.43.100:3000)         |
       |------------------------------------>|
       |                                    |
       | Poll /api/webrtc/signal/:peerId    |
       |   (from 192.168.43.103:3000)       |
       |<------------------------------------|
       |                                    |
       [WebRTC Connection Established]
```

### WebRTC Configuration:

```javascript
{
  iceServers: [],  // No STUN needed on local network
  iceTransportPolicy: 'all',  // Allow all candidate types
  // BUT we filter out non-host candidates in code
}
```

---

## 🧪 Testing Cross-Server Setup

### Test 1: Verify Network Connectivity

From **any server**,
 ping all other servers:

```bash
# From Server 4 (Doctor Station)
ping 192.168.43.100  # Server 1
ping 192.168.43.101  # Server 2
ping 192.168.43.102  # Server 3
```

All pings should succeed with < 10ms latency.

### Test 2: Verify HTTP Connectivity

From **any browser**, try accessing other servers:

```
http://192.168.43.100:3000  ← Should show Server 1 dashboard
http://192.168.43.101:3000  ← Should show Server 2 dashboard
http://192.168.43.102:3000  ← Should show Server 3 dashboard
http://192.168.43.103:3000  ← Should show Server 4 dashboard
```

### Test 3: Start a Cross-Server Consultation

1. On Server 1, start the NeoCare AI agent:
   ```bash
   cd ai_agents
   python neocare_agent.py R2 http://192.168.43.100:3000
   ```

2. On Server 4 (Doctor Station), open browser:
   ```
   http://192.168.43.103:3000/consultations
   ```

3. You should see Room R2 from Server 1

4. Click "Start Call"

5. WebRTC connection should establish in < 5 seconds

---

## 🛠️ Troubleshooting

### Problem: "Cannot connect to remote server"

**Solution:**
- Verify all laptops connected to same hotspot
- Check firewall settings (Windows Firewall may block port 3000)
- Disable firewalls temporarily for testing

**Windows Firewall:**
```powershell
# Allow port 3000
netsh advfirewall firewall add rule name="EdgeCare Port 3000" dir=in action=allow protocol=TCP localport=3000
```

### Problem: "WebRTC connection fails"

**Solution:**
- Check browser console for ICE candidate errors
- Verify `WEBRTC_HOST_ONLY=true` in .env
- Ensure no VPN is active
- Try using Chrome/Edge (better WebRTC support than Firefox)

### Problem: "Can see rooms but video doesn't start"

**Solution:**
- Check camera/microphone permissions in browser
- Verify getUserMedia() works by testing camera access
- Look for CORS errors in console

---

## 📊 Performance Expectations

On mobile hotspot (4G/5G):
- **Latency:** 5-30ms (local network)
- **Bandwidth:** 5-50 Mbps (depends on hotspot speed)
- **Video Quality:** 720p @ 30fps (excellent)
- **Connection Time:** 2-5 seconds

---

## 🔐 Security Considerations

### Current Setup (Demo/Local):
- ✅ No internet required
- ✅ All data stays on local network
- ✅ HTTPS not required (local network)
- ❌ No authentication yet
- ❌ No encryption (WebRTC uses DTLS but signaling is HTTP)

### Production Recommendations:
1. Add HTTPS with self-signed certificates
2. Add authentication (JWT tokens)
3. Add role-based access control
4. Encrypt signaling data
5. Implement session timeouts

---

## 📝 Example .env.local Files

### Server 1 (Neonatal - 192.168.43.100)
```env
SERVER_ID="Server1-Neonatal"
SERVER_IP="192.168.43.100"
SERVER_PORT=3000
OFFLINE_MODE=true
WEBRTC_HOST_ONLY=true
WEBRTC_LOCAL_SERVER_URL=http://192.168.43.100:3000
REMOTE_SERVER_2_URL=http://192.168.43.101:3000
REMOTE_SERVER_3_URL=http://192.168.43.102:3000
REMOTE_SERVER_4_URL=http://192.168.43.103:3000
```

### Server 4 (Doctor Station - 192.168.43.103)
```env
SERVER_ID="Server4-DoctorStation"
SERVER_IP="192.168.43.103"
SERVER_PORT=3000
OFFLINE_MODE=true
WEBRTC_HOST_ONLY=true
WEBRTC_LOCAL_SERVER_URL=http://192.168.43.103:3000
REMOTE_SERVER_1_URL=http://192.168.43.100:3000
REMOTE_SERVER_2_URL=http://192.168.43.101:3000
REMOTE_SERVER_3_URL=http://192.168.43.102:3000
```

---

## ✅ Quick Start Checklist

- [ ] Enable mobile hotspot on phone
- [ ] Connect all 4 laptops to hotspot
- [ ] Note down each laptop's IP address
- [ ] Configure `.env.local` on each server
- [ ] Start each server with `npm run dev`
- [ ] Verify each server accessible from browser
- [ ] Start AI agents on patient servers
- [ ] Open Consultations tab on doctor station
- [ ] Start cross-server video call
- [ ] Verify video/audio working

---

**Built for offline-first healthcare at the edge 🏥**
