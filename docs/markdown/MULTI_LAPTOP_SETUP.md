# Multi-Laptop Distributed System Setup

## Overview
This guide explains how to connect four laptops to create a distributed NexCare-5G edge computing network for hospital room monitoring.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Hospital Network                        │
│                   (WiFi/LAN 192.168.1.x)                    │
└─────────────────────────────────────────────────────────────┘
         │              │              │              │
    ┌────▼────┐    ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
    │ Laptop 1│    │ Laptop 2│   │ Laptop 3│   │ Laptop 4│
    │ Master  │    │ NeoCare │   │ GeriCare│   │ GeriCare│
    │ Control │    │ Zone A  │   │ Zone B  │   │ Zone C  │
    └────┬────┘    └────┬────┘   └────┬────┘   └────┬────┘
         │              │              │              │
    ┌────▼────┐    ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
    │ Rooms:  │    │ Rooms:  │   │ Rooms:  │   │ Rooms:  │
    │ All     │    │ R1, R2  │   │ R5, R6  │   │ R7, R8  │
    │ Monitor │    │ (Babies)│   │ (Elderly│   │ (Elderly│
    └─────────┘    └─────────┘   └─────────┘   └─────────┘
```

## Network Configuration

### Laptop Roles and IPs

| Laptop | Role | IP Address | Port | Rooms | Module |
|--------|------|------------|------|-------|--------|
| Laptop 1 | Master Control | 192.168.1.100 | 3000 | All | Dashboard |
| Laptop 2 | NeoCare Zone A | 192.168.1.101 | 3001 | R1, R2, R3 | NeoCare-AI |
| Laptop 3 | GeriCare Zone B | 192.168.1.102 | 3002 | R5, R6 | GeriCare-AI |
| Laptop 4 | GeriCare Zone C | 192.168.1.103 | 3003 | R7, R8, R9 | GeriCare-AI |

## Step 1: Network Setup

### Option A: WiFi Hotspot (Mobile Network)

**Create hotspot on one laptop:**

**Windows:**
```powershell
# Settings → Network & Internet → Mobile hotspot
# Turn on "Share my Internet connection"
# SSID: NexCare-Network
# Password: NexCare2026
```

**Linux:**
```bash
# Create hotspot
nmcli dev wifi hotspot ssid NexCare-Network password NexCare2026
```

**Connect other laptops:**
- Connect to "NexCare-Network"
- Static IP assignment (see below)

### Option B: LAN Network (Ethernet)

All laptops connected to same router/switch.

**Router Configuration:**
- DHCP range: 192.168.1.100-199
- Or assign static IPs manually

### Assign Static IPs

**Windows (Each laptop):**
```powershell
# Control Panel → Network and Sharing Center → Change adapter settings
# Right-click adapter → Properties → IPv4 → Use the following IP

Laptop 1: IP: 192.168.1.100, Subnet: 255.255.255.0, Gateway: 192.168.1.1
Laptop 2: IP: 192.168.1.101, Subnet: 255.255.255.0, Gateway: 192.168.1.1
Laptop 3: IP: 192.168.1.102, Subnet: 255.255.255.0, Gateway: 192.168.1.1
Laptop 4: IP: 192.168.1.103, Subnet: 255.255.255.0, Gateway: 192.168.1.1
```

**Linux:**
```bash
# Edit /etc/network/interfaces or use NetworkManager
sudo nmcli con mod "Wired connection 1" ipv4.addresses 192.168.1.100/24
sudo nmcli con mod "Wired connection 1" ipv4.gateway 192.168.1.1
sudo nmcli con mod "Wired connection 1" ipv4.method manual
sudo nmcli con up "Wired connection 1"
```

### Test Network Connectivity

From each laptop:
```bash
# Ping master server
ping 192.168.1.100

# Ping all other laptops
ping 192.168.1.101
ping 192.168.1.102
ping 192.168.1.103
```

## Step 2: Configure Each Laptop

### Laptop 1 - Master Control (192.168.1.100:3000)

**1. Clone/Setup NexCare:**
```bash
cd C:\Projects  # or ~/projects on Linux
git clone <repository-url> nexcare-master
cd nexcare-master/edge-server2
npm install
```

**2. Configure `.env.local`:**
```env
DATABASE_PATH=./data/edgecare-master.db
OFFLINE_MODE=true
NEXT_PUBLIC_APP_URL=http://192.168.1.100:3000
NODE_ENV=production
PORT=3000
SERVER_ID=master-control
WEBRTC_ICE_SERVERS=[]

# Cross-server endpoints
EDGE_SERVERS=http://192.168.1.101:3001,http://192.168.1.102:3002,http://192.168.1.103:3003
```

**3. Initialize database:**
```bash
npm run seed
```

**4. Start server:**
```bash
npm run build
npm start
```

**5. Access:**
- Local: http://localhost:3000
- Network: http://192.168.1.100:3000

### Laptop 2 - NeoCare Zone A (192.168.1.101:3001)

**1. Setup:**
```bash
cd C:\Projects
git clone <repository-url> nexcare-neocare-a
cd nexcare-neocare-a/edge-server2
npm install
```

**2. Configure `.env.local`:**
```env
DATABASE_PATH=./data/edgecare-neocare-a.db
OFFLINE_MODE=true
NEXT_PUBLIC_APP_URL=http://192.168.1.101:3001
NODE_ENV=production
PORT=3001
SERVER_ID=neocare-zone-a
WEBRTC_ICE_SERVERS=[]

# Master server
MASTER_SERVER=http://192.168.1.100:3000
```

**3. Create room-specific patient data:**
```bash
npm run seed
```

**4. Start server:**
```bash
npm run build
npm start
```

**5. Start AI Agent:**
```bash
cd ai_agents
python neocare_agent.py --room R1 --server http://192.168.1.101:3001 --mock &
python neocare_agent.py --room R2 --server http://192.168.1.101:3001 --mock &
python neocare_agent.py --room R3 --server http://192.168.1.101:3001 --mock &
```

### Laptop 3 - GeriCare Zone B (192.168.1.102:3002)

**1. Setup:**
```bash
cd C:\Projects
git clone <repository-url> nexcare-gericare-b
cd nexcare-gericare-b/edge-server2
npm install
```

**2. Configure `.env.local`:**
```env
DATABASE_PATH=./data/edgecare-gericare-b.db
OFFLINE_MODE=true
NEXT_PUBLIC_APP_URL=http://192.168.1.102:3002
NODE_ENV=production
PORT=3002
SERVER_ID=gericare-zone-b
WEBRTC_ICE_SERVERS=[]

MASTER_SERVER=http://192.168.1.100:3000
```

**3. Initialize:**
```bash
npm run seed
npm run build
npm start
```

**4. Start AI Agents:**
```bash
cd ai_agents
python gericare_agent.py --room R5 --server http://192.168.1.102:3002 --mock &
python gericare_agent.py --room R6 --server http://192.168.1.102:3002 --mock &
```

### Laptop 4 - GeriCare Zone C (192.168.1.103:3003)

**1. Setup:**
```bash
cd C:\Projects
git clone <repository-url> nexcare-gericare-c
cd nexcare-gericare-c/edge-server2
npm install
```

**2. Configure `.env.local`:**
```env
DATABASE_PATH=./data/edgecare-gericare-c.db
OFFLINE_MODE=true
NEXT_PUBLIC_APP_URL=http://192.168.1.103:3003
NODE_ENV=production
PORT=3003
SERVER_ID=gericare-zone-c
WEBRTC_ICE_SERVERS=[]

MASTER_SERVER=http://192.168.1.100:3000
```

**3. Initialize:**
```bash
npm run seed
npm run build
npm start
```

**4. Start AI Agents:**
```bash
cd ai_agents
python gericare_agent.py --room R7 --server http://192.168.1.103:3003 --mock &
python gericare_agent.py --room R8 --server http://192.168.1.103:3003 --mock &
python gericare_agent.py --room R9 --server http://192.168.1.103:3003 --mock &
```

## Step 3: Cross-Server Communication

### Create Server Registry API

Create `app/api/servers/route.ts` on Master server:

```typescript
/**
 * Servers Registry API
 * GET /api/servers - Get all edge servers
 */

import { NextRequest, NextResponse } from 'next/server';

const edgeServers = [
  {
    id: 'master-control',
    name: 'Master Control',
    url: 'http://192.168.1.100:3000',
    zone: 'All Zones',
    status: 'online',
  },
  {
    id: 'neocare-zone-a',
    name: 'NeoCare Zone A',
    url: 'http://192.168.1.101:3001',
    zone: 'NeoCare A',
    rooms: ['R1', 'R2', 'R3'],
    status: 'online',
  },
  {
    id: 'gericare-zone-b',
    name: 'GeriCare Zone B',
    url: 'http://192.168.1.102:3002',
    zone: 'GeriCare B',
    rooms: ['R5', 'R6'],
    status: 'online',
  },
  {
    id: 'gericare-zone-c',
    name: 'GeriCare Zone C',
    url: 'http://192.168.1.103:3003',
    zone: 'GeriCare C',
    rooms: ['R7', 'R8', 'R9'],
    status: 'online',
  },
];

export async function GET(request: NextRequest) {
  return NextResponse.json({
    servers: edgeServers,
    count: edgeServers.length,
  });
}
```

### Create Data Aggregation Service

Create `lib/server-aggregator.ts` on Master server:

```typescript
/**
 * Server Data Aggregator
 * Collects data from all edge servers
 */

export async function aggregateAllRooms() {
  const servers = [
    'http://192.168.1.101:3001',
    'http://192.168.1.102:3002',
    'http://192.168.1.103:3003',
  ];

  const allRooms = [];

  for (const serverUrl of servers) {
    try {
      const response = await fetch(`${serverUrl}/api/rooms`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        allRooms.push(...(data.rooms || []));
      }
    } catch (error) {
      console.error(`Failed to fetch from ${serverUrl}:`, error);
    }
  }

  return allRooms;
}
```

## Step 4: Firewall Configuration

### Windows Firewall

On **each laptop**, allow inbound connections:

```powershell
# Allow Node.js
netsh advfirewall firewall add rule name="NexCare Node.js" dir=in action=allow program="C:\Program Files\nodejs\node.exe" enable=yes

# Allow specific ports
netsh advfirewall firewall add rule name="NexCare Port 3000" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="NexCare Port 3001" dir=in action=allow protocol=TCP localport=3001
netsh advfirewall firewall add rule name="NexCare Port 3002" dir=in action=allow protocol=TCP localport=3002
netsh advfirewall firewall add rule name="NexCare Port 3003" dir=in action=allow protocol=TCP localport=3003
```

### Linux Firewall (UFW)

```bash
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
sudo ufw allow 3002/tcp
sudo ufw allow 3003/tcp
sudo ufw enable
```

## Step 5: Testing the Setup

### Test 1: Server Connectivity

From **any laptop**:
```bash
# Test Master server
curl http://192.168.1.100:3000/api/health

# Test NeoCare Zone A
curl http://192.168.1.101:3001/api/health

# Test GeriCare Zone B
curl http://192.168.1.102:3002/api/health

# Test GeriCare Zone C
curl http://192.168.1.103:3003/api/health
```

Expected response (each):
```json
{
  "status": "healthy",
  "server_ip": "192.168.1.xxx",
  "port": 3xxx
}
```

### Test 2: AI Agents Running

Check if agents are sending data:
```bash
# On each laptop
curl http://192.168.1.101:3001/api/rooms
curl http://192.168.1.102:3002/api/rooms
curl http://192.168.1.103:3003/api/rooms
```

### Test 3: Cross-Server Communication

From Master server:
```bash
curl http://192.168.1.100:3000/api/servers
```

## Step 6: Access Dashboard

### From Each Laptop

**Laptop 1 (Master):**
- Open browser: http://192.168.1.100:3000
- View: All zones, all rooms

**Laptop 2 (NeoCare):**
- Open browser: http://192.168.1.101:3001
- View: NeoCare rooms (R1, R2, R3)

**Laptop 3 (GeriCare B):**
- Open browser: http://192.168.1.102:3002
- View: GeriCare rooms (R5, R6)

**Laptop 4 (GeriCare C):**
- Open browser: http://192.168.1.103:3003
- View: GeriCare rooms (R7, R8, R9)

### From Mobile Devices

Connect mobile to same network and access:
- Master Dashboard: http://192.168.1.100:3000
- NeoCare Zone A: http://192.168.1.101:3001
- etc.

## Step 7: Video Consultation Across Servers

### WebRTC Configuration for LAN

Update `.env.local` on all laptops:
```env
WEBRTC_ICE_SERVERS=[{"urls":"stun:stun.l.google.com:19302"}]
```

### Cross-Server Consultation

Doctor on Laptop 1 can consult with:
- Patients on Laptop 2 (R1, R2, R3)
- Patients on Laptop 3 (R5, R6)
- Patients on Laptop 4 (R7, R8, R9)

The WebRTC connection works peer-to-peer within the LAN.

## Production Deployment Checklist

### On Each Laptop

- [ ] Static IP assigned
- [ ] Firewall rules configured
- [ ] Node.js installed
- [ ] Project cloned and built
- [ ] Database initialized
- [ ] Environment variables configured
- [ ] Server starts on boot (autostart)
- [ ] AI agents running
- [ ] Hardware sensors connected (if applicable)

### Network Requirements

- [ ] All laptops on same network
- [ ] Can ping each other
- [ ] Ports 3000-3003 open
- [ ] Network stable (low latency <50ms)

### Monitoring

- [ ] Server health checks working
- [ ] Cross-server communication tested
- [ ] AI agents sending data
- [ ] Dashboard accessible from all devices

## Auto-Start on Boot

### Windows

Create batch file `start-nexcare.bat`:
```batch
@echo off
cd C:\Projects\nexcare-master\edge-server2
start npm start
cd ai_agents
start python neocare_agent.py --room R1 --server http://localhost:3000 --mock
```

Add to Startup folder:
```
Win+R → shell:startup
Copy start-nexcare.bat to this folder
```

### Linux (systemd)

Create `/etc/systemd/system/nexcare-server.service`:
```ini
[Unit]
Description=NexCare Edge Server
After=network.target

[Service]
Type=simple
User=nexcare
WorkingDirectory=/opt/nexcare/edge-server2
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable nexcare-server
sudo systemctl start nexcare-server
```

## Scaling to More Laptops

To add more laptops:

1. Assign new static IP (e.g., 192.168.1.104)
2. Clone repository
3. Configure unique PORT and SERVER_ID
4. Add to EDGE_SERVERS list on master
5. Start services
6. Update firewall rules

## Troubleshooting

### Can't connect to other laptops
```bash
# Check network
ping 192.168.1.100

# Check port
telnet 192.168.1.100 3000

# Check firewall
netstat -an | findstr 3000
```

### AI agents not sending data
```bash
# Check if agent is running
ps aux | grep python  # Linux
tasklist | findstr python  # Windows

# Check logs
tail -f ai_agents/logs/*.log
```

### High latency between servers
```bash
# Measure latency
ping -t 192.168.1.100  # Windows
ping 192.168.1.100     # Linux
```

## Summary

You now have a fully distributed NexCare-5G system running across 4 laptops:

1. **Laptop 1**: Master control dashboard (all zones)
2. **Laptop 2**: NeoCare monitoring (infant care)
3. **Laptop 3**: GeriCare monitoring (elderly care - Zone B)
4. **Laptop 4**: GeriCare monitoring (elderly care - Zone C)

Each laptop can operate independently (offline-first) and communicate when online. The system is scalable, fault-tolerant, and ready for production hospital deployment!
