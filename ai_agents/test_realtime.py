"""
Real-Time Test Script
Send test data to Supabase to verify real-time subscriptions
"""

import requests
import time
import random
from datetime import datetime

# Configuration
EDGE_SERVER_URL = "http://localhost:3000"
ROOM_ID = "R1"
MODULE = "NeoCare-AI"

def send_test_report():
    """Send a test AI report to the server"""
    
    # Simulate sensor data
    temp = round(36.0 + random.uniform(-0.5, 1.0), 1)
    bpm = random.randint(110, 140)
    light_status = random.choice(["Bright", "Dim", "Dark"])
    
    # Simulate AI prediction
    statuses = ["Sleeping", "Awake", "Restless", "Crying"]
    status = random.choice(statuses)
    confidence = round(random.uniform(0.75, 0.99), 2)
    
    # Determine alert level
    if status == "Crying" or temp > 37.5:
        alert_level = "critical"
    elif status == "Restless" or temp > 37.0:
        alert_level = "warning"
    else:
        alert_level = "normal"
    
    # Create payload
    payload = {
        "room_id": ROOM_ID,
        "module": MODULE,
        "status": status,
        "confidence": confidence,
        "timestamp": int(time.time()),
        "alert_level": alert_level,
        "metadata": {
            "temperature": temp,
            "temp_status": "Normal" if temp < 37.5 else "High",
            "light_status": light_status,
            "bpm": bpm,
            "sensor_status": "Simulated"
        }
    }
    
    try:
        response = requests.post(
            f"{EDGE_SERVER_URL}/api/reports",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 201:
            print(f"✅ [{datetime.now().strftime('%H:%M:%S')}] Report sent successfully")
            print(f"   Status: {status} | Temp: {temp}°C | BPM: {bpm} | Alert: {alert_level}")
            return True
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

def main():
    print("=" * 60)
    print("  🧪 REAL-TIME TEST - Sending Live Data to Dashboard")
    print("=" * 60)
    print(f"Target: {EDGE_SERVER_URL}/api/reports")
    print(f"Room: {ROOM_ID} | Module: {MODULE}")
    print()
    print("📡 Watch your dashboard at http://localhost:3000")
    print("   You should see updates appear INSTANTLY!")
    print()
    print("Press Ctrl+C to stop")
    print("=" * 60)
    print()
    
    count = 0
    while True:
        try:
            count += 1
            print(f"\n[Report #{count}]")
            send_test_report()
            
            # Wait 3 seconds between reports
            time.sleep(3)
            
        except KeyboardInterrupt:
            print("\n\n✋ Test stopped by user")
            print(f"Total reports sent: {count}")
            break
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()
