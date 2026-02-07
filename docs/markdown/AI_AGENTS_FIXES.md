# AI Agents - Bug Fixes Summary

## Issues Fixed

### 1. ✅ Argument Parsing Bug
**Problem:** Agents were using simple `sys.argv` indexing instead of proper argument parsing, causing `--room` flag name to be interpreted as the room ID.

**Error:**
```
Invalid URL 'R2/api/health': No scheme supplied
```

**Solution:** Implemented proper `argparse` with named arguments in both agents:
- `neocare_agent.py` - Now uses argparse
- `gericare_agent.py` - Now uses argparse

### 2. ✅ Unicode Encoding Error on Windows
**Problem:** Emoji characters (🚀, ✅) in log messages caused crashes on Windows console (cp1252 encoding).

**Error:**
```
UnicodeEncodeError: 'charmap' codec can't encode character '\U0001f680'
```

**Solution:**
- Configured console handler with UTF-8 encoding
- Replaced emoji characters with ASCII equivalents (`>>`)
- Added UTF-8 file encoding for log files

## Changes Made

### Files Modified

1. **ai_agents/neocare_agent.py**
   - Added argparse for command-line arguments
   - Added helpful startup banner
   - Replaced emoji in log message

2. **ai_agents/gericare_agent.py**
   - Added argparse for command-line arguments
   - Added helpful startup banner
   - Replaced emoji in log message

3. **ai_agents/base_agent.py**
   - Fixed console handler encoding for Windows
   - Replaced emoji characters in log messages
   - Added UTF-8 encoding for file handler

### Files Created

1. **ai_agents/test_agents.py**
   - Test script to verify agent initialization
   - Validates configuration without running full agent

2. **ai_agents/README.md**
   - Comprehensive guide for running AI agents
   - Examples for all use cases
   - Troubleshooting section

## Correct Usage

### Before (Broken)
```bash
# This was broken - positional arguments
python neocare_agent.py R2 http://localhost:3000
```

### After (Fixed)
```bash
# Correct - named arguments with flags
python neocare_agent.py --room R2 --server http://localhost:3000 --mock
```

## Command-Line Arguments

Both agents now support these arguments:

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `--room` | string | R2/R5 | Room ID |
| `--server` | string | http://localhost:3000 | Server URL |
| `--camera` | string | None | Camera URL (optional) |
| `--mock` | flag | False | Use mock detection mode |
| `--interval` | int | 2/1 | Check interval in seconds |
| `--log-level` | string | INFO | Logging level (DEBUG/INFO/WARNING/ERROR) |

## Testing

### Quick Test
```bash
cd ai_agents
python test_agents.py
```

**Expected Output:**
```
============================================================
  NexCare-5G AI Agents - Configuration Test
============================================================
...
  NeoCare Agent:  ✓ PASS
  GeriCare Agent: ✓ PASS
============================================================

All agents configured correctly!
```

### Run NeoCare Agent
```bash
cd ai_agents
python neocare_agent.py --room R2 --server http://localhost:3000 --mock
```

**Expected Output:**
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
...
```

### Run GeriCare Agent
```bash
cd ai_agents
python gericare_agent.py --room R5 --server http://localhost:3000 --mock
```

## Verification

To verify everything works:

1. **Start the Next.js server:**
   ```bash
   npm run dev
   ```

2. **In a new terminal, start NeoCare agent:**
   ```bash
   cd ai_agents
   python neocare_agent.py --room R2 --server http://localhost:3000 --mock
   ```

3. **In another terminal, start GeriCare agent:**
   ```bash
   cd ai_agents
   python gericare_agent.py --room R5 --server http://localhost:3000 --mock
   ```

4. **Open browser:**
   ```
   http://localhost:3000
   ```

5. **Login:**
   - Email: admin@edgecare.local
   - Password: admin123

6. **Watch real-time updates** on the dashboard as agents send detection reports!

## Benefits of Fixes

### Better User Experience
- Clear, descriptive argument names (`--room` instead of positional)
- Help text with `-h` or `--help` flag
- Startup banner showing configuration
- No encoding errors on Windows

### More Flexible
- Arguments can be in any order
- Easy to add new arguments
- Default values for all arguments
- Optional arguments with flags

### Production Ready
- Proper error handling
- UTF-8 support across platforms
- Comprehensive logging
- Graceful failure modes

## Next Steps

The agents are now ready for:
1. ✅ Testing with mock data
2. ✅ Integration with Next.js dashboard
3. ✅ Deployment on Windows, macOS, or Linux
4. 🔄 Integration with real cameras (optional)
5. 🔄 Production deployment with systemd/PM2

## Support

For detailed usage instructions, see:
- `ai_agents/README.md` - Complete agent documentation
- `QUICKSTART.md` - Full system quick start guide
- `COMPLETION_SUMMARY.md` - MVP completion status
