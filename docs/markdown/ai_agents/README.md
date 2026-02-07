# AI Agents Quick Start Guide

## Overview
The NexCare-5G system includes Python-based AI agents that monitor rooms and send detection reports to the edge server.

## Prerequisites

Install Python dependencies:
```bash
cd ai_agents
pip install -r requirements.txt
```

**Note:** For testing, you don't need to install YOLOv8 or PyTorch. The agents support mock mode.

## Running the Agents

### NeoCare Agent (Infant Monitoring)

**Basic usage with mock data:**
```bash
python neocare_agent.py --room R2 --server http://localhost:3000 --mock
```

**Full command options:**
```bash
python neocare_agent.py \
  --room R2 \
  --server http://localhost:3000 \
  --mock \
  --interval 2 \
  --log-level INFO
```

### GeriCare Agent (Fall Detection)

**Basic usage with mock data:**
```bash
python gericare_agent.py --room R5 --server http://localhost:3000 --mock
```

**Full command options:**
```bash
python gericare_agent.py \
  --room R5 \
  --server http://localhost:3000 \
  --mock \
  --interval 1 \
  --log-level INFO
```

## Command-Line Arguments

| Argument | Description | Default | Required |
|----------|-------------|---------|----------|
| `--room` | Room ID (e.g., R2, R5) | R2/R5 | No |
| `--server` | Edge server URL | http://localhost:3000 | No |
| `--camera` | Camera URL (RTSP, USB, etc.) | None | No |
| `--mock` | Use mock detection (no camera) | False | No |
| `--interval` | Check interval in seconds | 2/1 | No |
| `--log-level` | Logging level | INFO | No |

## Mock Mode

Mock mode allows you to test the agents without a camera. The agents will generate realistic simulated detections:

### NeoCare Mock Detections
- SLEEPING (70% of the time)
- AWAKE (15%)
- RESTLESS (10%)
- CRYING (3%)
- FEEDING (1%)
- FACE_COVERED (0.5%)
- ABNORMAL_POSITION (0.5%)

### GeriCare Mock Detections
- NORMAL (80% of the time)
- STANDING (10%)
- SITTING (5%)
- WALKING (3%)
- FALL_DETECTED (1%)
- Other states (1%)

## Examples

### Example 1: Monitor Multiple Rooms

**Terminal 1 - NeoCare for Room R2:**
```bash
python neocare_agent.py --room R2 --server http://localhost:3000 --mock
```

**Terminal 2 - GeriCare for Room R5:**
```bash
python gericare_agent.py --room R5 --server http://localhost:3000 --mock
```

**Terminal 3 - GeriCare for Room R7:**
```bash
python gericare_agent.py --room R7 --server http://localhost:3000 --mock
```

### Example 2: Custom Check Intervals

**Fast monitoring (1-second intervals):**
```bash
python gericare_agent.py --room R5 --server http://localhost:3000 --mock --interval 1
```

**Slow monitoring (5-second intervals):**
```bash
python neocare_agent.py --room R2 --server http://localhost:3000 --mock --interval 5
```

### Example 3: Debug Mode

```bash
python neocare_agent.py --room R2 --server http://localhost:3000 --mock --log-level DEBUG
```

## With Real Cameras

### USB Camera
```bash
python neocare_agent.py --room R2 --server http://localhost:3000 --camera 0
```

### RTSP Stream
```bash
python neocare_agent.py --room R2 --server http://localhost:3000 --camera "rtsp://camera-ip:554/stream"
```

### IP Camera
```bash
python gericare_agent.py --room R5 --server http://localhost:3000 --camera "http://camera-ip:8080/video"
```

## Expected Output

When you start an agent, you should see:

```
============================================================
  NeoCare-AI Agent Starting
============================================================
  Room ID:      R2
  Server:       http://localhost:3000
  Mock Mode:    True
  Interval:     2s
  Log Level:    INFO
============================================================

2026-02-07 12:55:46 - NeoCare-AI-R2 - INFO - Initialized NeoCare-AI for R2
2026-02-07 12:55:46 - NeoCare-AI-R2 - INFO - >> Starting NeoCare-AI for R2
2026-02-07 12:55:46 - NeoCare-AI-R2 - INFO - Server health check passed
2026-02-07 12:55:46 - NeoCare-AI-R2 - INFO - >> Model initialized successfully
2026-02-07 12:55:46 - NeoCare-AI-R2 - INFO - Processing frame 1...
2026-02-07 12:55:46 - NeoCare-AI-R2 - INFO - Detected: SLEEPING (confidence: 0.92)
2026-02-07 12:55:46 - NeoCare-AI-R2 - INFO - >> Report sent successfully
...
```

## Viewing Results

1. Start the edge server:
   ```bash
   npm run dev
   ```

2. Start one or more AI agents (in separate terminals)

3. Open http://localhost:3000 in your browser

4. Login with:
   - Email: admin@edgecare.local
   - Password: admin123

5. View real-time updates on:
   - Main dashboard (`/`)
   - NeoCare dashboard (`/neocare`)
   - GeriCare dashboard (`/gericare`)

## Logs

Logs are automatically saved to the `logs/` directory:

```
logs/
├── NeoCare-AI_R2_20260207.log
├── GeriCare-AI_R5_20260207.log
└── ...
```

## Troubleshooting

### Issue: "Server is not reachable"
**Solution:** Make sure the Next.js server is running:
```bash
npm run dev
```

### Issue: "Module not found"
**Solution:** Install Python dependencies:
```bash
pip install -r requirements.txt
```

### Issue: Unicode encoding errors on Windows
**Solution:** This has been fixed in the latest version. If you still see issues, try:
```bash
# Set UTF-8 encoding in PowerShell
chcp 65001
python neocare_agent.py --room R2 --server http://localhost:3000 --mock
```

### Issue: Camera not working
**Solution:** Use mock mode for testing:
```bash
python neocare_agent.py --room R2 --server http://localhost:3000 --mock
```

## Stopping Agents

Press `Ctrl+C` in the terminal to gracefully stop an agent.

The agent will:
1. Save final logs
2. Send cleanup notifications
3. Close camera connections
4. Exit cleanly

## Production Deployment

For production with real cameras:

1. Install full dependencies:
   ```bash
   pip install torch torchvision ultralytics opencv-python
   ```

2. Download YOLOv8 models (happens automatically on first run)

3. Configure camera URLs

4. Remove `--mock` flag:
   ```bash
   python neocare_agent.py --room R2 --server http://edge-server:3000 --camera "rtsp://camera-ip:554/stream"
   ```

5. Run as a service (systemd on Linux, PM2, or Docker)

## Testing

Test agent configuration:
```bash
python test_agents.py
```

This will verify both agents can be initialized properly.

## Performance

- **NeoCare Agent:** ~2 seconds per check (default)
- **GeriCare Agent:** ~1 second per check (default, faster for fall detection)
- **Network:** ~1KB per report
- **Memory:** ~100-500MB (depending on camera resolution and model)
- **CPU:** Minimal in mock mode, varies with real inference

## Advanced Usage

### Multiple Instances
You can run multiple agents for the same room (for redundancy):
```bash
# Terminal 1
python gericare_agent.py --room R5 --server http://localhost:3000 --camera "rtsp://camera1:554/stream"

# Terminal 2
python gericare_agent.py --room R5 --server http://localhost:3000 --camera "rtsp://camera2:554/stream"
```

### Load Balancing
Run agents on different edge servers:
```bash
python neocare_agent.py --room R2 --server http://edge-server-1:3000 --mock
python gericare_agent.py --room R5 --server http://edge-server-2:3000 --mock
```

## Status Codes

| Status | Meaning | Action |
|--------|---------|--------|
| Normal | Everything OK | Continue monitoring |
| Warning | Potential issue | Increase monitoring frequency |
| Critical | Immediate attention needed | Send alert, notify staff |

## Support

For issues or questions about AI agents:
1. Check logs in `logs/` directory
2. Run test script: `python test_agents.py`
3. Verify server is running: `curl http://localhost:3000/api/health`
