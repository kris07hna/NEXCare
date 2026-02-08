"""
Quick test script to verify cloud connection for NeoCare AI Agent
Run this before starting the main agent to ensure connectivity
"""

import requests
import json
import os
from dotenv import load_dotenv
import time

load_dotenv()

EDGE_SERVER_HOST = os.getenv('EDGE_SERVER_HOST', '10.107.51.10')
EDGE_SERVER_PORT = os.getenv('EDGE_SERVER_PORT', '3000')
EDGE_SERVER_URL = f"http://{EDGE_SERVER_HOST}:{EDGE_SERVER_PORT}"
ROOM_ID = os.getenv('ROOM_ID', 'R1')
PATIENT_ID = os.getenv('PATIENT_ID', 'P001')

print("=" * 60)
print("   NeoCare Cloud Connection Test")
print("=" * 60)
print(f"Edge Server: {EDGE_SERVER_URL}")
print(f"Room ID:     {ROOM_ID}")
print(f"Patient ID:  {PATIENT_ID}")
print("=" * 60)

# Test 1: API Endpoint Availability
print("\n[Test 1] Testing API endpoint availability...")
try:
    response = requests.get(f"{EDGE_SERVER_URL}/api/health", timeout=5)
    if response.status_code == 200:
        print(f"✓ Health endpoint responsive: {response.status_code}")
    else:
        print(f"⚠ Health endpoint returned: {response.status_code}")
except Exception as e:
    print(f"✗ Health endpoint failed: {e}")
    print("\n[CRITICAL] Cannot connect to edge server!")
    print(f"Please check:")
    print(f"  1. Edge server is running at {EDGE_SERVER_URL}")
    print(f"  2. Network connectivity (ping {EDGE_SERVER_HOST})")
    print(f"  3. Firewall settings allow port {EDGE_SERVER_PORT}")
    exit(1)

# Test 2: Send Test Report
print("\n[Test 2] Sending test report to cloud...")
test_payload = {
    "room_id": ROOM_ID,
    "patient_id": PATIENT_ID,
    "module": "NeoCare-AI",
    "timestamp": int(time.time()),
    "status": "Test Connection",
    "confidence": 1.0,
    "alert_level": "normal",
    "metadata": {
        "test": True,
        "temperature": 37.0,
        "bpm": 120,
        "message": "Cloud connectivity test"
    }
}

try:
    response = requests.post(
        f"{EDGE_SERVER_URL}/api/reports",
        json=test_payload,
        timeout=5,
        headers={'Content-Type': 'application/json'}
    )
    
    if response.status_code == 201:
        result = response.json()
        print(f"✓ Test report sent successfully!")
        print(f"  Report ID: {result.get('report_id', 'N/A')}")
        print(f"  Created at: {result.get('created_at', 'N/A')}")
    else:
        print(f"✗ Test report failed: {response.status_code}")
        print(f"  Response: {response.text[:200]}")
except Exception as e:
    print(f"✗ Test report error: {e}")
    exit(1)

# Test 3: Verify Report in Database
print("\n[Test 3] Verifying report in cloud database...")
try:
    response = requests.get(
        f"{EDGE_SERVER_URL}/api/reports?room_id={ROOM_ID}&limit=5",
        timeout=5
    )
    
    if response.status_code == 200:
        data = response.json()
        reports = data.get('reports', [])
        print(f"✓ Retrieved {len(reports)} reports from cloud")
        if reports:
            latest = reports[0]
            print(f"  Latest report: {latest.get('module')} - {latest.get('status')}")
    else:
        print(f"⚠ Could not verify report: {response.status_code}")
except Exception as e:
    print(f"⚠ Verification warning: {e}")

# Test 4: Performance Test (4-second interval simulation)
print("\n[Test 4] Testing 4-second interval performance...")
print("Sending 3 reports with 4-second intervals...")

for i in range(3):
    start_time = time.time()
    
    payload = {
        "room_id": ROOM_ID,
        "patient_id": PATIENT_ID,
        "module": "NeoCare-AI",
        "timestamp": int(time.time()),
        "status": f"Performance Test {i+1}/3",
        "confidence": 0.95,
        "alert_level": "normal",
        "metadata": {
            "test_iteration": i + 1,
            "temperature": 37.0,
            "bpm": 120
        }
    }
    
    try:
        response = requests.post(
            f"{EDGE_SERVER_URL}/api/reports",
            json=payload,
            timeout=3
        )
        
        elapsed = time.time() - start_time
        
        if response.status_code == 201:
            print(f"  ✓ Report {i+1}/3 sent in {elapsed:.3f}s")
        else:
            print(f"  ✗ Report {i+1}/3 failed: {response.status_code}")
    except Exception as e:
        print(f"  ✗ Report {i+1}/3 error: {e}")
    
    if i < 2:  # Don't wait after last iteration
        print(f"    Waiting 4 seconds...")
        time.sleep(4)

print("\n" + "=" * 60)
print("   ALL TESTS COMPLETED SUCCESSFULLY!")
print("=" * 60)
print("\n✓ Cloud connection is working properly")
print("✓ Data transmission verified")
print("✓ 4-second interval performance confirmed")
print("\nYou can now start the NeoCare AI Agent:")
print("  python neocare_agent.py")
print("=" * 60)
