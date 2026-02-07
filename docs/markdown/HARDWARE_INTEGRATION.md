# Hardware Integration Guide - PySerial Sensors

## Overview
This guide shows how to integrate real hardware sensors (heart rate, SpO2, temperature, etc.) into NexCare-5G using PySerial to read data from serial-connected medical devices.

## Architecture

```
┌─────────────────┐
│ Medical Sensors │ (Heart Rate, SpO2, Temp sensors)
│   (Arduino/ESP) │
└────────┬────────┘
         │ USB/Serial
         │
┌────────▼────────┐
│ Sensor Reader   │ (Python script with PySerial)
│    Service      │
└────────┬────────┘
         │ HTTP POST
         │
┌────────▼────────┐
│  Edge Server    │ (Next.js)
│  API Endpoint   │
└────────┬────────┘
         │
┌────────▼────────┐
│   Dashboard     │ (Real-time display)
└─────────────────┘
```

## Step 1: Install PySerial

```bash
pip install pyserial
```

## Step 2: Create Hardware Sensor Reader

Create `ai_agents/hardware_sensor.py`:

```python
"""
Hardware Sensor Reader for NexCare-5G
Reads vital signs from serial-connected medical devices
"""

import serial
import time
import json
import requests
import logging
from typing import Dict, Optional
from dataclasses import dataclass
import argparse

@dataclass
class SensorConfig:
    """Sensor configuration"""
    port: str              # COM port (e.g., 'COM3' on Windows, '/dev/ttyUSB0' on Linux)
    baudrate: int = 9600
    room_id: str = 'R2'
    server_url: str = 'http://localhost:3000'
    check_interval: int = 1  # Read every second

class HardwareSensorReader:
    """Read vital signs from serial-connected sensors"""

    def __init__(self, config: SensorConfig):
        self.config = config
        self.serial_port = None
        self.running = False

        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)

    def connect(self) -> bool:
        """Connect to serial port"""
        try:
            self.serial_port = serial.Serial(
                port=self.config.port,
                baudrate=self.config.baudrate,
                timeout=1,
                bytesize=serial.EIGHTBITS,
                parity=serial.PARITY_NONE,
                stopbits=serial.STOPBITS_ONE
            )

            # Wait for connection to stabilize
            time.sleep(2)

            self.logger.info(f"Connected to {self.config.port} at {self.config.baudrate} baud")
            return True

        except Exception as e:
            self.logger.error(f"Failed to connect to serial port: {e}")
            return False

    def read_sensor_data(self) -> Optional[Dict]:
        """Read data from serial port"""
        try:
            if not self.serial_port or not self.serial_port.is_open:
                return None

            # Clear any buffered data
            self.serial_port.reset_input_buffer()

            # Read line from serial port
            line = self.serial_port.readline().decode('utf-8').strip()

            if not line:
                return None

            # Expected format: "HR:75,SPO2:98,TEMP:36.5"
            # Or JSON format: {"hr": 75, "spo2": 98, "temp": 36.5}

            # Try to parse as JSON first
            try:
                data = json.loads(line)
                return {
                    'heart_rate': data.get('hr', data.get('heart_rate')),
                    'spo2': data.get('spo2', data.get('oxygen')),
                    'temperature': data.get('temp', data.get('temperature')),
                    'raw_data': line
                }
            except json.JSONDecodeError:
                # Parse as comma-separated values
                values = {}
                for pair in line.split(','):
                    if ':' in pair:
                        key, value = pair.split(':', 1)
                        key = key.strip().lower()
                        try:
                            values[key] = float(value.strip())
                        except ValueError:
                            values[key] = value.strip()

                return {
                    'heart_rate': values.get('hr', values.get('heart_rate')),
                    'spo2': values.get('spo2', values.get('oxygen')),
                    'temperature': values.get('temp', values.get('temperature')),
                    'raw_data': line
                }

        except Exception as e:
            self.logger.error(f"Error reading sensor data: {e}")
            return None

    def send_vitals_to_server(self, vitals: Dict) -> bool:
        """Send vital signs to edge server"""
        try:
            endpoint = f"{self.config.server_url}/api/vitals"

            payload = {
                "room_id": self.config.room_id,
                "timestamp": time.time(),
                "vitals": {
                    "heart_rate": vitals.get('heart_rate'),
                    "spo2": vitals.get('spo2'),
                    "temperature": vitals.get('temperature'),
                },
                "raw_data": vitals.get('raw_data')
            }

            response = requests.post(
                endpoint,
                json=payload,
                timeout=5
            )

            if response.status_code in [200, 201]:
                self.logger.info(f"Vitals sent: HR={vitals.get('heart_rate')}, SpO2={vitals.get('spo2')}%")
                return True
            else:
                self.logger.error(f"Failed to send vitals: {response.status_code}")
                return False

        except Exception as e:
            self.logger.error(f"Error sending vitals: {e}")
            return False

    def run(self):
        """Main sensor reading loop"""
        self.logger.info("Starting hardware sensor reader...")

        # Connect to serial port
        if not self.connect():
            self.logger.error("Cannot start - serial connection failed")
            return

        self.running = True
        read_count = 0

        try:
            while self.running:
                # Read sensor data
                vitals = self.read_sensor_data()

                if vitals:
                    # Validate data
                    hr = vitals.get('heart_rate')
                    spo2 = vitals.get('spo2')

                    if hr and 30 <= hr <= 220:  # Valid heart rate range
                        if spo2 and 70 <= spo2 <= 100:  # Valid SpO2 range
                            # Send to server
                            self.send_vitals_to_server(vitals)
                            read_count += 1

                            if read_count % 60 == 0:
                                self.logger.info(f"Processed {read_count} readings")

                # Wait before next reading
                time.sleep(self.config.check_interval)

        except KeyboardInterrupt:
            self.logger.info("Received keyboard interrupt")
        finally:
            self.cleanup()

    def cleanup(self):
        """Cleanup resources"""
        self.logger.info("Shutting down sensor reader...")
        self.running = False

        if self.serial_port and self.serial_port.is_open:
            self.serial_port.close()
            self.logger.info("Serial port closed")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Hardware Sensor Reader for NexCare-5G')
    parser.add_argument('--port', type=str, required=True, help='Serial port (e.g., COM3, /dev/ttyUSB0)')
    parser.add_argument('--baudrate', type=int, default=9600, help='Baud rate (default: 9600)')
    parser.add_argument('--room', type=str, default='R2', help='Room ID')
    parser.add_argument('--server', type=str, default='http://localhost:3000', help='Server URL')
    parser.add_argument('--interval', type=int, default=1, help='Read interval in seconds')

    args = parser.parse_args()

    config = SensorConfig(
        port=args.port,
        baudrate=args.baudrate,
        room_id=args.room,
        server_url=args.server,
        check_interval=args.interval
    )

    print(f"\n{'='*60}")
    print(f"  Hardware Sensor Reader Starting")
    print(f"{'='*60}")
    print(f"  Port:         {args.port}")
    print(f"  Baud Rate:    {args.baudrate}")
    print(f"  Room ID:      {args.room}")
    print(f"  Server:       {args.server}")
    print(f"  Interval:     {args.interval}s")
    print(f"{'='*60}\n")

    reader = HardwareSensorReader(config)
    reader.run()
```

## Step 3: Create API Endpoint for Vitals

Create `app/api/vitals/route.ts`:

```typescript
/**
 * Vitals API Route
 * POST /api/vitals - Receive vital signs from hardware sensors
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { roomRegistry } from '@/lib/room-registry';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { room_id, timestamp, vitals, raw_data } = body;

    // Validate required fields
    if (!room_id || !vitals) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update room registry with latest vitals
    roomRegistry.updateRoomVitals(room_id, {
      heart_rate: vitals.heart_rate,
      spo2: vitals.spo2,
      temperature: vitals.temperature,
      timestamp: timestamp || Date.now() / 1000,
    });

    // Log vitals to database (optional)
    await db.createLog({
      logLevel: 'info',
      component: 'hardware-sensor',
      message: `Vitals received from ${room_id}`,
      details: JSON.stringify(vitals),
      roomId: room_id,
    });

    console.log(
      `[API /vitals] Room ${room_id}: HR=${vitals.heart_rate}, SpO2=${vitals.spo2}%, Temp=${vitals.temperature}°C`
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Vitals received',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API /vitals] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process vitals',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

## Step 4: Update Room Registry

Add to `lib/room-registry.ts`:

```typescript
export interface RoomVitals {
  heart_rate?: number;
  spo2?: number;
  temperature?: number;
  timestamp: number;
}

// Add to RoomRegistry class:
updateRoomVitals(roomId: string, vitals: RoomVitals) {
  const room = this.rooms.get(roomId);

  if (room) {
    room.vitals = vitals;
    room.last_seen = new Date().toISOString();
    this.rooms.set(roomId, room);
  } else {
    // Create new room entry
    this.rooms.set(roomId, {
      room_id: roomId,
      vitals: vitals,
      last_seen: new Date().toISOString(),
      online: true,
    });
  }
}
```

## Arduino/ESP32 Example Code

### For Arduino with Pulse Oximeter Sensor (MAX30102)

```cpp
#include <Wire.h>
#include "MAX30105.h"

MAX30105 particleSensor;

void setup() {
  Serial.begin(9600);

  // Initialize sensor
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("ERROR: Sensor not found");
    while (1);
  }

  particleSensor.setup();
}

void loop() {
  // Read sensor values
  long irValue = particleSensor.getIR();

  if (irValue > 50000) {  // Finger detected
    int heartRate = calculateHeartRate();  // Your algorithm
    int spo2 = calculateSpO2();            // Your algorithm
    float temp = particleSensor.readTemperature();

    // Send data in JSON format
    Serial.print("{\"hr\":");
    Serial.print(heartRate);
    Serial.print(",\"spo2\":");
    Serial.print(spo2);
    Serial.print(",\"temp\":");
    Serial.print(temp);
    Serial.println("}");
  }

  delay(1000);  // Send every second
}
```

### Alternative: Simple CSV Format

```cpp
void loop() {
  int heartRate = 75;  // From your sensor
  int spo2 = 98;       // From your sensor
  float temp = 36.5;   // From your sensor

  // Format: HR:75,SPO2:98,TEMP:36.5
  Serial.print("HR:");
  Serial.print(heartRate);
  Serial.print(",SPO2:");
  Serial.print(spo2);
  Serial.print(",TEMP:");
  Serial.println(temp);

  delay(1000);
}
```

## Usage

### 1. Find Your Serial Port

**Windows:**
```powershell
# List available COM ports
mode
# Or use Device Manager → Ports (COM & LPT)
```

**Linux/Mac:**
```bash
# List available ports
ls /dev/tty*
# Usually: /dev/ttyUSB0, /dev/ttyACM0, /dev/ttyS0
```

### 2. Test Serial Connection

```bash
# Install pyserial
pip install pyserial

# Test reading from port
python -m serial.tools.miniterm COM3 9600
# or
python -m serial.tools.miniterm /dev/ttyUSB0 9600
```

### 3. Run Hardware Sensor Reader

```bash
cd ai_agents

# Windows
python hardware_sensor.py --port COM3 --room R2 --server http://localhost:3000

# Linux/Mac
python hardware_sensor.py --port /dev/ttyUSB0 --room R2 --server http://localhost:3000
```

## Multi-Room Setup

For multiple rooms with different sensors:

```bash
# Terminal 1 - Room R2 (NeoCare)
python hardware_sensor.py --port COM3 --room R2 --server http://localhost:3000

# Terminal 2 - Room R5 (GeriCare)
python hardware_sensor.py --port COM4 --room R5 --server http://localhost:3000

# Terminal 3 - Room R7 (GeriCare)
python hardware_sensor.py --port COM5 --room R7 --server http://localhost:3000
```

## Troubleshooting

### Issue: "Serial port not found"
```bash
# Check if port exists
python -c "import serial.tools.list_ports; print([p.device for p in serial.tools.list_ports.comports()])"
```

### Issue: "Permission denied" (Linux)
```bash
# Add user to dialout group
sudo usermod -a -G dialout $USER
# Then logout and login again
```

### Issue: "Port already in use"
```bash
# Find process using the port
lsof | grep ttyUSB0
# Kill the process
kill <PID>
```

## Production Deployment

### 1. Run as System Service (Linux)

Create `/etc/systemd/system/nexcare-sensor-r2.service`:

```ini
[Unit]
Description=NexCare Hardware Sensor Reader - Room R2
After=network.target

[Service]
Type=simple
User=nexcare
WorkingDirectory=/opt/nexcare/ai_agents
ExecStart=/usr/bin/python3 hardware_sensor.py --port /dev/ttyUSB0 --room R2 --server http://localhost:3000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable nexcare-sensor-r2
sudo systemctl start nexcare-sensor-r2
sudo systemctl status nexcare-sensor-r2
```

### 2. Run with PM2 (Node.js Process Manager)

```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
pm2 ecosystem
```

Edit `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'sensor-r2',
      script: 'hardware_sensor.py',
      interpreter: 'python3',
      args: '--port /dev/ttyUSB0 --room R2 --server http://localhost:3000',
      cwd: '/opt/nexcare/ai_agents',
      autorestart: true,
      max_restarts: 10,
    },
    {
      name: 'sensor-r5',
      script: 'hardware_sensor.py',
      interpreter: 'python3',
      args: '--port /dev/ttyUSB1 --room R5 --server http://localhost:3000',
      cwd: '/opt/nexcare/ai_agents',
      autorestart: true,
    },
  ],
};
```

Start:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Hardware Recommendations

### Recommended Sensors

1. **Pulse Oximeter:** MAX30102 or MAX30100
   - Measures: Heart rate, SpO2
   - Interface: I2C
   - Price: ~$5-10

2. **Temperature:** DS18B20 or MLX90614
   - Measures: Body temperature
   - Interface: One-Wire or I2C
   - Price: ~$2-5

3. **Complete Module:** All-in-one medical sensor modules
   - Examples: Grove Medical Kit, Analog Devices modules
   - Price: ~$50-200

### Connection Methods

1. **USB Serial** (Easiest)
   - Arduino → USB → Computer
   - No additional hardware needed

2. **ESP32/ESP8266 WiFi** (Wireless)
   - Sensors → ESP → WiFi → Server
   - Send data via HTTP POST

3. **Bluetooth** (Mobile)
   - Sensors → BLE → Computer
   - Use PyBluez library

## Next Steps

1. ✅ Install PySerial
2. ✅ Create hardware sensor reader script
3. ✅ Add vitals API endpoint
4. ✅ Connect your sensors via USB
5. ✅ Test with mock Arduino data first
6. ✅ Integrate real sensors
7. ✅ Deploy as system service

The hardware integration is now ready to receive real sensor data!
