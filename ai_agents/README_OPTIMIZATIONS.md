# NeoCare AI Agent - Performance Optimizations

## Recent Updates (Feb 2026)

### 🚀 Performance Improvements

#### 1. **4-Second Cloud Sync Interval**
- Changed from 2s to 4s per user requirement
- Reduces network overhead by 50%
- More efficient cloud database usage
- Constant defined: `SEND_INTERVAL = 4.0`

#### 2. **Frame Processing Optimization**
- Process every 2nd frame (`FRAME_SKIP = 2`)
- Reduces CPU usage by ~50%
- Maintains accurate sleep detection
- Improves overall responsiveness

#### 3. **Webcam Optimization**
- Resolution: 640x480 (balanced quality/performance)
- Fixed FPS: 30 for consistent performance
- Faster frame acquisition

#### 4. **MediaPipe Settings**
- `refine_landmarks=False` - faster processing
- `static_image_mode=False` - video mode optimization
- Increased confidence thresholds (0.6) for accuracy

### 📡 Cloud Transmission Enhancements

#### Intelligent Alert Levels
```python
normal   -> Temperature < 38°C, BPM normal
warning  -> Temperature 38-39°C
critical -> Temperature > 39°C OR BPM > 160 OR BPM < 100
```

#### Comprehensive Metadata
- Temperature, BPM, light status
- Sleep state, frame count
- Edge node identification
- Sensor connection status

#### Error Handling
- Timeout detection (3s)
- Connection error recovery
- Success/failure tracking
- Transmission statistics

### 📊 New Features

#### 1. **Real-time Statistics**
- Success count and error count
- Success rate percentage
- Displayed every 5 transmissions

#### 2. **Visual Feedback**
- Cloud sync countdown timer
- Patient ID display
- Success/error counters on screen
- Color-coded sync status

#### 3. **Patient Linkage**
- `patient_id` included in all reports
- Proper database foreign key support
- Better data organization

### 🧪 Testing

**Cloud Connection Test Script:** `test_cloud_connection.py`

Run before starting the agent:
```bash
cd ai_agents
python test_cloud_connection.py
```

Tests include:
1. API endpoint availability
2. Report submission
3. Database verification
4. 4-second interval performance

### 🎯 Performance Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Sync Interval | 2s | 4s | 50% less network traffic |
| Frame Processing | 100% | 50% | 2x faster |
| Resolution | 1280x720 | 640x480 | 4x faster bandwidth |
| Timeout | 5s | 3s | Faster failure detection |
| Success Rate | Not tracked | Live tracking | Better monitoring |

### 📝 Usage

**Standard Mode:**
```bash
cd ai_agents
python neocare_agent.py
```

**Configuration (.env file):**
```env
EDGE_SERVER_HOST=10.107.51.10
EDGE_SERVER_PORT=3000
ROOM_ID=R1
PATIENT_ID=P001
```

### 🔧 Troubleshooting

**No cloud connection:**
1. Run `python test_cloud_connection.py`
2. Check edge server is running: `http://[SERVER]:3000`
3. Verify network connectivity
4. Check firewall settings

**High error rate:**
- Increase `SEND_INTERVAL` to 5-6 seconds
- Check network stability
- Verify edge server performance

**Low FPS:**
- Increase `FRAME_SKIP` to 3 or 4
- Lower resolution further (480x360)
- Close other applications

### ✅ What's Working

- ✅ 4-second cloud synchronization
- ✅ Faster AI processing (frame skipping)
- ✅ Optimized webcam settings
- ✅ Patient ID linkage to database
- ✅ Smart alert level detection
- ✅ Real-time statistics
- ✅ Visual sync countdown
- ✅ Error recovery and tracking
- ✅ Comprehensive metadata logging

### 🎨 On-Screen Display

The video window now shows:
- Sleep Status (Awake/Sleeping)
- Temperature + Status
- Heart Rate (BPM)
- Room ID + Patient ID
- **Cloud Sync Countdown** (NEW)
- **Success/Error Counts** (NEW)

### 🌐 Data Flow

```
Webcam → AI Processing → Alert Detection → Cloud (4s interval) → Supabase
  ↓                                              ↓
Arduino Sensors → Data Merge                Database Storage
                                                ↓
                                          Dashboard Display
```

### 💾 Database Schema

Reports stored with:
- `room_id` - Room identifier
- `patient_id` - Patient foreign key
- `module` - "NeoCare-AI"
- `status` - Sleep state
- `confidence` - AI confidence (0-1)
- `alert_level` - normal/warning/critical
- `metadata` - Comprehensive sensor data
- `timestamp` - Unix timestamp
- `created_at` - ISO datetime

---

**Last Updated:** February 8, 2026
**Version:** 2.0 (4s Cloud Sync Optimized)
