# WebRTC File Transfer - User Guide

## 🚀 Overview

NEXCARE now supports **unlimited file transfers** between devices using **WebRTC Data Channels**. This enables:

- ✅ **P2P file sharing** (direct laptop-to-laptop)
- ✅ **Unlimited file size** (no server limits)
- ✅ **Encrypted transfers** (DTLS built into WebRTC)
- ✅ **No server storage** (files never touch the server)
- ✅ **Fast speeds** (optimized 16KB chunks)

## 📋 Use Cases

### Medical Records Sharing
```
Doctor Laptop → Patient Records (PDF, images) → Nurse Laptop
```

### Baby Photos/Videos
```
NeoCare AI Laptop → Baby photos → Parent's Phone/Laptop
```

### X-rays & Ultrasounds
```
Diagnostic Station → Medical images (DICOM, PNG) → Physician Hub
```

### Backup & Sync
```
Central Server → Database backup (SQLite) → Backup Laptop
```

## 🎯 How to Use

### Step 1: Access File Transfer Page

From any laptop on the mobile hotspot, open:
```
http://10.107.51.130:3000/file-transfer
```

### Step 2: Share Peer IDs

**Laptop A (Sender):**
1. Note your Peer ID (shown on screen): `peer-abc123xyz`
2. Share this ID with Laptop B via text/email/verbally

**Laptop B (Receiver):**
1. Note your Peer ID: `peer-def456uvw`
2. Share this ID with Laptop A

### Step 3: Enter Remote Peer ID

**On both laptops:**
- Enter the OTHER laptop's Peer ID in "Remote Peer ID" field

### Step 4: Choose Mode

**Laptop A (Sender):**
- Click **"Send Files"** button

**Laptop B (Receiver):**
- Click **"Receive Files"** button

### Step 5: Wait for Connection

You'll see:
```
Connection Status: Connected ✅
Data Channel: Ready
```

### Step 6: Transfer Files

**Laptop A:**
1. Click "Click to select files" or drag-and-drop
2. Choose one or multiple files
3. Watch progress bar (real-time)

**Laptop B:**
1. Files appear automatically in "Received Files" section
2. Click download icon to save to disk

## 🔧 Technical Details

### Connection Architecture

```
Laptop A                    Central Server                    Laptop B
  │                              │                              │
  ├─── 1. WebRTC Offer ─────────►│───── 2. Relay Offer ────────►│
  │                              │                              │
  │◄──── 4. Relay Answer ────────│◄─── 3. WebRTC Answer ────────┤
  │                              │                              │
  ├─────────── 5. ICE Candidates exchanged ─────────────────────┤
  │                              │                              │
  │                              │                              │
  ╰═══════════ 6. Direct P2P Data Channel ══════════════════════╯
                    (Server not involved in file data)
```

### What Goes Through Server?
- ✅ WebRTC signaling (SDP offer/answer) ~2-5 KB
- ✅ ICE candidates ~500 bytes each
- ❌ **File data does NOT go through server!**

### Data Channel Configuration
```typescript
{
  ordered: true,           // Preserve chunk order
  maxRetransmits: 3,       // Retry failed packets
  binaryType: 'arraybuffer', // Binary data mode
  chunkSize: 16384         // 16KB chunks (optimal)
}
```

### Supported File Types

**✅ All file types supported:**
- Documents: PDF, DOCX, TXT, CSV
- Images: JPG, PNG, GIF, SVG, DICOM
- Videos: MP4, AVI, MOV, MKV
- Archives: ZIP, RAR, 7Z
- Databases: SQLite, JSON
- **Any file type!**

## 📊 Performance

### Transfer Speeds

| Network | Expected Speed | 1GB File Transfer |
|---------|---------------|-------------------|
| Mobile Hotspot (4G) | 10-30 Mbps | ~5-10 minutes |
| Mobile Hotspot (5G) | 50-200 Mbps | ~1-3 minutes |
| WiFi (2.4GHz) | 20-50 Mbps | ~3-7 minutes |
| WiFi (5GHz) | 100-400 Mbps | ~30-120 seconds |

**Actual speed depends on:**
- Network quality
- Distance between devices
- Network congestion
- Device processing power

### File Size Limits

| Method | Max File Size |
|--------|---------------|
| WebRTC Data Channel | **Unlimited** |
| Server API Upload | 4 MB (Next.js default) |
| Email Attachment | 25 MB (Gmail limit) |
| WhatsApp | 2 GB (requires app) |

## 🛠️ Troubleshooting

### "Not Connected" Status

**Possible Causes:**
1. Both devices not on same mobile hotspot
2. Firewall blocking WebRTC ports
3. Incorrect Peer IDs

**Solutions:**
```bash
# Check network connection
ipconfig | findstr IPv4

# Verify both IPs are in same range:
10.107.51.130  ✅ Same network
10.107.51.145  ✅ Same network

192.168.1.50   ❌ Different network
10.107.51.130  ❌ Different network
```

### "Data Channel Not Ready"

**Wait for:**
1. WebRTC connection established
2. Data channel opened
3. Green "Connected" badge

**Typical connection time:** 2-5 seconds

### File Transfer Failed

**Check:**
- [ ] Connection still active
- [ ] Enough storage space on receiver
- [ ] Browser didn't sleep/minimize
- [ ] Network didn't disconnect

**Retry:**
1. Disconnect both sides
2. Refresh page
3. Reconnect with correct Peer IDs
4. Try transfer again

### Slow Transfer Speed

**Optimizations:**
1. Move laptops closer to hotspot
2. Use 5GHz WiFi if available
3. Close other network-heavy apps
4. Pause other downloads

## 🔐 Security & Privacy

### Encryption
- **DTLS-SRTP** encryption built into WebRTC
- Same encryption as video calls
- End-to-end encrypted (P2P)

### Privacy
- Files **never** stored on server
- Direct laptop-to-laptop transfer
- No cloud upload required
- Server only relays signaling

### Safety Tips
```
✅ DO:
- Verify Peer ID with recipient verbally
- Use on trusted networks only
- Close connection after transfer
- Delete sensitive files after demo

❌ DON'T:
- Share Peer IDs publicly
- Leave connection open indefinitely
- Transfer over public WiFi
- Keep unnecessary copies
```

## 💡 Advanced Usage

### Programmatic File Transfer

```typescript
import { WebRTCFileTransferService } from '@/lib/webrtc-file-transfer';

// Initialize
const service = new WebRTCFileTransferService(
  'session-123',
  'my-peer-id',
  'remote-peer-id'
);

// Setup callbacks
service.onFileTransferProgress((progress) => {
  console.log(`${progress.fileName}: ${progress.progress}%`);
});

service.onFileReceivedCallback((file) => {
  console.log('Received:', file.name, file.size);
});

// Connect
await service.getLocalMedia();
service.createDataChannel();
await service.createOffer();

// Send file
await service.sendFile(myFile);
```

### Custom Integration

Add file transfer to consultation pages:
```typescript
import { useFileTransfer } from '@/hooks/useFileTransfer';

const { sendFile, receivedFiles } = useFileTransfer({
  sessionId: consultationId,
  peerId: doctorId,
  remotePeerId: patientId,
});

// Send prescription
await sendFile(prescriptionPDF);
```

## 📚 API Reference

### WebRTCFileTransferService

```typescript
class WebRTCFileTransferService extends WebRTCService {
  // Create data channel
  createDataChannel(label?: string): RTCDataChannel;
  
  // Send single file
  async sendFile(file: File): Promise<void>;
  
  // Send multiple files
  async sendFiles(files: File[]): Promise<void>;
  
  // Check if ready
  isDataChannelReady(): boolean;
  
  // Get channel state
  getDataChannelState(): RTCDataChannelState | null;
  
  // Event callbacks
  onFileTransferProgress(callback): void;
  onFileReceivedCallback(callback): void;
  onDataChannelReady(callback): void;
}
```

### useFileTransfer Hook

```typescript
const {
  isConnected,           // Connection status
  isDataChannelReady,    // Data channel ready
  error,                 // Error message
  transferProgress,      // Current transfer progress
  receivedFiles,         // Array of received files
  createOffer,           // Initiate connection (sender)
  waitForOffer,          // Wait for connection (receiver)
  sendFile,              // Send single file
  sendFiles,             // Send multiple files
  downloadFile,          // Download received file
  disconnect,            // Close connection
  getStreams,            // Get video streams
} = useFileTransfer({ sessionId, peerId, remotePeerId });
```

## 🎓 Demo Scenarios

### Scenario 1: Baby Photo Sharing
```
1. NeoCare laptop detects baby movement
2. Capture photo/screenshot
3. Open file transfer page
4. Share with parents' phone on same hotspot
5. Parents receive and download instantly
```

### Scenario 2: Medical Report Distribution
```
1. Central server generates AI report PDF
2. Open file transfer
3. Send to doctor's laptop (R1)
4. Send to nurse's laptop (R2)
5. Each receives their copy
```

### Scenario 3: Database Backup
```
1. Central server: /data/edgecare.db
2. Weekly backup to backup laptop
3. Transfer via WebRTC (faster than USB)
4. Verify file integrity
5. Store offsite
```

## 🚀 Next Steps

1. **Test file transfer** between two laptops
2. **Measure transfer speeds** on your network
3. **Integrate into workflows** (diagnose → share results)
4. **Train staff** on Peer ID exchange process
5. **Document procedures** for your specific use cases

## 📞 Support

**Issues?**
- Check [Troubleshooting](#troubleshooting) section
- Verify firewall rules (port 3000)
- Ensure both devices on same network
- Check browser console for errors

**Feature Requests?**
- Add pause/resume transfer
- Show transfer history
- QR code for Peer ID sharing
- Automatic file organization

---

**Built with WebRTC Data Channel | Unlimited Size | End-to-End Encrypted | Zero Server Storage**
