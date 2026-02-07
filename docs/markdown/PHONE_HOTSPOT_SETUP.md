# NexCare-5G Setup with Phone Hotspot

## 🔥 Phone Hotspot Network Architecture

This guide shows how to connect 4 laptops using your phone's mobile hotspot as the network hub.

## Why Phone Hotspot is Perfect for NexCare

✅ **Portable** - Works anywhere with mobile signal
✅ **No router needed** - Phone becomes your network
✅ **Easy setup** - All laptops connect to one hotspot
✅ **Secure** - Password-protected network
✅ **Sufficient bandwidth** - More than enough for dashboard + video consultations
✅ **5G capable** - If your phone supports 5G (perfect for NexCare-5G!)

## Network Topology

```
                    ┌──────────────┐
                    │  Your Phone  │
                    │   (Hotspot)  │
                    │ 192.168.43.1 │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
   │Laptop 1 │       │Laptop 2 │       │Laptop 3 │  ...
   │.43.100  │       │.43.101  │       │.43.102  │
   └─────────┘       └─────────┘       └─────────┘
```

## Step-by-Step Setup

### Step 1: Enable Phone Hotspot

#### Android Phone

1. **Open Settings** → **Network & Internet** → **Hotspot & tethering**
2. **Configure hotspot:**
   - **Network name (SSID):** `NexCare-5G-Network`
   - **Security:** WPA2-PSK (recommended)
   - **Password:** `NexCare2026` (or your choice)
   - **AP Band:** 5GHz (if available, faster) or 2.4GHz (better range)
3. **Turn on hotspot**
4. **Note the IP address** (usually 192.168.43.1)

#### iPhone

1. **Open Settings** → **Personal Hotspot**
2. **Configure:**
   - **WiFi Password:** `NexCare2026`
   - Turn on **Allow Others to Join**
3. **Note:** iPhone hotspot typically uses 172.20.10.1

### Step 2: Connect Each Laptop

#### Laptop 1 (Master Control)

**Connect to WiFi:**
- Network: `NexCare-5G-Network`
- Password: `NexCare2026`

**Assign Static IP (Recommended):**

**Windows:**
```
1. Control Panel → Network and Sharing Center
2. Click your WiFi connection
3. Properties → IPv4 → Properties
4. Select "Use the following IP address"

IP address:     192.168.43.100
Subnet mask:    255.255.255.0
Default gateway: 192.168.43.1
Preferred DNS:   8.8.8.8 (Google DNS)
```

**Linux:**
```bash
# Find your WiFi interface name (usually wlan0 or wlp2s0)
ip link

# Configure static IP
sudo nmcli con mod "NexCare-5G-Network" ipv4.addresses 192.168.43.100/24
sudo nmcli con mod "NexCare-5G-Network" ipv4.gateway 192.168.43.1
sudo nmcli con mod "NexCare-5G-Network" ipv4.dns "8.8.8.8"
sudo nmcli con mod "NexCare-5G-Network" ipv4.method manual
sudo nmcli con up "NexCare-5G-Network"
```

**Verify connection:**
```bash
# Ping phone (gateway)
ping 192.168.43.1

# Check your IP
ipconfig   # Windows
ip addr    # Linux
```

#### Laptop 2 (NeoCare Zone A)

Same steps as Laptop 1, but use:
- **IP address:** `192.168.43.101`

#### Laptop 3 (GeriCare Zone B)

Same steps, but use:
- **IP address:** `192.168.43.102`

#### Laptop 4 (GeriCare Zone C)

Same steps, but use:
- **IP address:** `192.168.43.103`

### Step 3: Network Configuration Summary

| Device | IP Address | Role |
|--------|------------|------|
| Phone (Hotspot) | 192.168.43.1 | Gateway |
| Laptop 1 | 192.168.43.100 | Master Control |
| Laptop 2 | 192.168.43.101 | NeoCare Zone A |
| Laptop 3 | 192.168.43.102 | GeriCare Zone B |
| Laptop 4 | 192.168.43.103 | GeriCare Zone C |

### Step 4: Configure NexCare on Each Laptop

#### Laptop 1 - Master Control

**Edit `.env.local`:**
```env
DATABASE_PATH=./data/edgecare-master.db
OFFLINE_MODE=true
NEXT_PUBLIC_APP_URL=http://192.168.43.100:3000
NODE_ENV=production
PORT=3000
SERVER_ID=master-control
WEBRTC_ICE_SERVERS=[]

# Other edge servers
EDGE_SERVERS=http://192.168.43.101:3001,http://192.168.43.102:3002,http://192.168.43.103:3003
```

#### Laptop 2 - NeoCare Zone A

**Edit `.env.local`:**
```env
DATABASE_PATH=./data/edgecare-neocare-a.db
OFFLINE_MODE=true
NEXT_PUBLIC_APP_URL=http://192.168.43.101:3001
NODE_ENV=production
PORT=3001
SERVER_ID=neocare-zone-a
WEBRTC_ICE_SERVERS=[]

# Master server
MASTER_SERVER=http://192.168.43.100:3000
```

#### Laptop 3 - GeriCare Zone B

**Edit `.env.local`:**
```env
DATABASE_PATH=./data/edgecare-gericare-b.db
OFFLINE_MODE=true
NEXT_PUBLIC_APP_URL=http://192.168.43.102:3002
NODE_ENV=production
PORT=3002
SERVER_ID=gericare-zone-b
WEBRTC_ICE_SERVERS=[]

MASTER_SERVER=http://192.168.43.100:3000
```

#### Laptop 4 - GeriCare Zone C

**Edit `.env.local`:**
```env
DATABASE_PATH=./data/edgecare-gericare-c.db
OFFLINE_MODE=true
NEXT_PUBLIC_APP_URL=http://192.168.43.103:3003
NODE_ENV=production
PORT=3003
SERVER_ID=gericare-zone-c
WEBRTC_ICE_SERVERS=[]

MASTER_SERVER=http://192.168.43.100:3000
```

### Step 5: Start Services on Each Laptop

Run these commands on **each laptop**:

```bash
# 1. Navigate to project
cd <path-to-nexcare>/edge-server2

# 2. Install dependencies (first time only)
npm install

# 3. Seed database (first time only)
npm run seed

# 4. Build for production
npm run build

# 5. Start the server
npm start
```

The server will start on the configured port (3000-3003).

### Step 6: Test Network Connectivity

From **any laptop**, test all servers:

```bash
# Test phone gateway
ping 192.168.43.1

# Test all servers
curl http://192.168.43.100:3000/api/health
curl http://192.168.43.101:3001/api/health
curl http://192.168.43.102:3002/api/health
curl http://192.168.43.103:3003/api/health
```

**Expected response from each:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "server_ip": "192.168.43.xxx",
  "port": 3xxx
}
```

### Step 7: Start AI Agents

#### On Laptop 2 (NeoCare - Rooms R1, R2, R3)

```bash
cd ai_agents

# Room R1
python neocare_agent.py --room R1 --server http://192.168.43.101:3001 --mock

# Open new terminal for Room R2
python neocare_agent.py --room R2 --server http://192.168.43.101:3001 --mock

# Open new terminal for Room R3
python neocare_agent.py --room R3 --server http://192.168.43.101:3001 --mock
```

#### On Laptop 3 (GeriCare - Rooms R5, R6)

```bash
cd ai_agents

# Room R5
python gericare_agent.py --room R5 --server http://192.168.43.102:3002 --mock

# Room R6
python gericare_agent.py --room R6 --server http://192.168.43.102:3002 --mock
```

#### On Laptop 4 (GeriCare - Rooms R7, R8, R9)

```bash
cd ai_agents

# Room R7
python gericare_agent.py --room R7 --server http://192.168.43.103:3003 --mock

# Room R8
python gericare_agent.py --room R8 --server http://192.168.43.103:3003 --mock

# Room R9
python gericare_agent.py --room R9 --server http://192.168.43.103:3003 --mock
```

### Step 8: Access Dashboards

From **any device connected to the hotspot** (including your phone!):

**Master Dashboard (All Zones):**
- URL: `http://192.168.43.100:3000`
- Login: `admin@edgecare.local` / `admin123`

**NeoCare Zone A:**
- URL: `http://192.168.43.101:3001`
- Shows: Rooms R1, R2, R3 (infant monitoring)

**GeriCare Zone B:**
- URL: `http://192.168.43.102:3002`
- Shows: Rooms R5, R6 (elderly care)

**GeriCare Zone C:**
- URL: `http://192.168.43.103:3003`
- Shows: Rooms R7, R8, R9 (elderly care)

### Step 9: Access from Your Phone

On the **same phone providing the hotspot**:

1. Open Chrome/Safari
2. Go to: `http://192.168.43.100:3000`
3. You'll see the full Master Control dashboard!

**Alternative:** Use any other phone/tablet connected to the hotspot.

## Performance Optimization for Phone Hotspot

### Recommended Settings

1. **Use 5GHz band** (if available)
   - Faster speeds
   - Less interference
   - Better for video consultations

2. **Limit connected devices**
   - Only the 4 laptops + monitoring devices
   - Disconnect other devices

3. **Keep phone plugged in**
   - Hotspot drains battery quickly
   - Phone may throttle when battery is low

4. **Position phone centrally**
   - Equal distance to all laptops
   - Better signal strength

5. **Monitor data usage**
   - Use unlimited data plan if available
   - Local network traffic (laptop to laptop) doesn't use mobile data
   - Only internet requests use mobile data

### Expected Bandwidth Usage

**Local Communication (doesn't use mobile data):**
- Dashboard updates: ~10 KB/s per laptop
- AI reports: ~1 KB every 2 seconds
- Video consultations: ~500 KB/s (peer-to-peer, doesn't use internet)

**Internet Usage (uses mobile data):**
- Initial page loads: ~2-5 MB
- Cloud sync (if enabled): ~100 KB/hour
- **Total:** Very minimal with OFFLINE_MODE=true

## Firewall Configuration

### Windows Firewall (Each Laptop)

Since you're on a "Public Network" (hotspot), Windows may block connections.

**Option 1: Allow Node.js through firewall**
```powershell
# Run as Administrator
netsh advfirewall firewall add rule name="NexCare Node.js" dir=in action=allow program="C:\Program Files\nodejs\node.exe" enable=yes profile=public
```

**Option 2: Allow specific ports**
```powershell
# Laptop 1
netsh advfirewall firewall add rule name="NexCare Port 3000" dir=in action=allow protocol=TCP localport=3000 profile=public

# Laptop 2
netsh advfirewall firewall add rule name="NexCare Port 3001" dir=in action=allow protocol=TCP localport=3001 profile=public

# Laptop 3
netsh advfirewall firewall add rule name="NexCare Port 3002" dir=in action=allow protocol=TCP localport=3002 profile=public

# Laptop 4
netsh advfirewall firewall add rule name="NexCare Port 3003" dir=in action=allow protocol=TCP localport=3003 profile=public
```

**Option 3: Change network to Private** (Easier but less secure)
```powershell
# Run as Administrator
Set-NetConnectionProfile -InterfaceAlias "Wi-Fi" -NetworkCategory Private
```

### Linux Firewall (UFW)

```bash
sudo ufw allow 3000:3003/tcp
sudo ufw enable
```

## Troubleshooting

### Issue 1: Laptops can't connect to hotspot

**Solution:**
- Restart phone hotspot
- Forget and reconnect to WiFi on laptop
- Check password is correct
- Try 2.4GHz band instead of 5GHz

### Issue 2: Can ping phone but not other laptops

**Solution:**
- Check firewall settings (see above)
- Verify static IPs are set correctly
- Some phones have "AP Isolation" - disable it in hotspot settings

### Issue 3: "AP Isolation" is enabled (Android)

**Problem:** Laptops can reach phone but not each other.

**Solution:**
```
Settings → Hotspot → Advanced → Disable "AP Isolation"
```

**Alternative:** Use USB tethering for one laptop as master, then share connection.

### Issue 4: Slow performance

**Check:**
- Signal strength on all laptops (should be 3+ bars)
- Phone isn't in battery saver mode
- Not too many devices connected
- Phone has good mobile signal

### Issue 5: Connection drops frequently

**Solution:**
- Keep phone plugged in (prevents sleep/battery saver)
- Disable "Turn off hotspot when no devices connected"
- Set screen timeout to "Never" while running
- Use Keep Awake app

## Production Deployment Tips

### 1. Battery Management

**Get a power bank:**
- Capacity: 20,000+ mAh
- Fast charging support
- Can power phone all day

### 2. Data Management

**Use unlimited data plan** OR **track usage:**
```bash
# On phone, check data usage
Settings → Network & Internet → Data Usage
```

**Minimize internet usage:**
- Set `OFFLINE_MODE=true` (already done)
- Disable automatic updates on laptops
- Only use internet for initial setup

### 3. Reliability

**Auto-restart hotspot:**
- Some phones support scheduled hotspot
- Use Tasker app (Android) to auto-restart

**Monitor connection:**
Create `monitor-network.bat` on each laptop:
```batch
@echo off
:loop
ping -n 1 192.168.43.1 > nul
if errorlevel 1 (
    echo Connection lost! Attempting reconnect...
    netsh wlan disconnect
    timeout /t 5
    netsh wlan connect name="NexCare-5G-Network"
)
timeout /t 30
goto loop
```

### 4. Security

**Strong password:** Use minimum 12 characters
**Hide SSID:** Enable "Hidden Network" in hotspot settings
**MAC filtering:** Only allow known laptop MAC addresses

## Bandwidth Requirements

### Per Laptop

**Minimum:**
- Dashboard: 50 Kbps
- AI reports: 10 Kbps
- Total: ~100 Kbps

**Recommended:**
- With video: 1 Mbps
- With camera streams: 2 Mbps

### For 4 Laptops

**Total bandwidth needed:** ~5 Mbps
**Typical 4G hotspot:** 10-50 Mbps ✓
**Typical 5G hotspot:** 100-500 Mbps ✓✓✓

**Conclusion:** Phone hotspot has MORE than enough bandwidth!

## Alternative: USB Tethering

For even better stability, use USB tethering for Laptop 1:

1. **Connect phone to Laptop 1 via USB**
2. **Enable USB tethering on phone**
3. **Laptop 1 gets internet directly via USB** (more stable)
4. **Other laptops connect via WiFi hotspot**

This gives you best of both worlds!

## Complete Startup Sequence

When starting your system:

1. **Turn on phone hotspot** (keep phone plugged in)
2. **Connect all laptops to hotspot**
3. **On each laptop, start server:**
   ```bash
   cd <nexcare-path>/edge-server2
   npm start
   ```
4. **On laptops 2-4, start AI agents**
5. **Access master dashboard:** `http://192.168.43.100:3000`
6. **Done!**

## What You Can Now Do

✅ **Portable hospital monitoring** - Works anywhere with mobile signal
✅ **4 independent zones** - Each laptop monitors different rooms
✅ **Real-time data** - All laptops communicate via phone hotspot
✅ **Video consultations** - Works peer-to-peer over hotspot
✅ **Mobile access** - Check dashboard from your phone
✅ **Offline capable** - If mobile signal drops, local network continues
✅ **Easy setup** - No router or IT infrastructure needed

## Demo Scenario

**Hospital Ward Setup:**
- **Phone:** In central location, plugged in
- **Laptop 1:** Nurse station (Master Control)
- **Laptop 2:** Neonatal ward (NeoCare)
- **Laptop 3:** Elderly ward - Wing A (GeriCare)
- **Laptop 4:** Elderly ward - Wing B (GeriCare)
- **Staff phones/tablets:** Access dashboards for monitoring

**Perfect for:**
- Hospital demonstrations
- Temporary clinics
- Mobile health units
- Areas without WiFi infrastructure
- Disaster response healthcare

---

## 📱 Quick Reference

**Phone Hotspot Settings:**
- SSID: `NexCare-5G-Network`
- Password: `NexCare2026`
- Band: 5GHz (preferred) or 2.4GHz
- AP Isolation: **Disabled**

**Laptop IPs:**
- Laptop 1: `192.168.43.100:3000` (Master)
- Laptop 2: `192.168.43.101:3001` (NeoCare)
- Laptop 3: `192.168.43.102:3002` (GeriCare B)
- Laptop 4: `192.168.43.103:3003` (GeriCare C)

**Access URLs:**
- Master: `http://192.168.43.100:3000`
- From phone: Same URL in browser!

**Your NexCare-5G system is now ready to run on a phone hotspot! 📱🏥**
