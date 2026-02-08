"""
NeoCare AI Agent - Connects to Central Server
Monitors baby sleep state and vital signs, sends data to edge server
"""

import cv2
import mediapipe as mp
import numpy as np
import requests
import json
import time
import serial
import threading
from datetime import datetime
from dotenv import load_dotenv
import os

# Load configuration
load_dotenv()

EDGE_SERVER_HOST = os.getenv('EDGE_SERVER_HOST', '10.107.51.10')
EDGE_SERVER_PORT = os.getenv('EDGE_SERVER_PORT', '3000')
EDGE_SERVER_URL = f"http://{EDGE_SERVER_HOST}:{EDGE_SERVER_PORT}"
ROOM_ID = os.getenv('ROOM_ID', 'R1')
PATIENT_ID = os.getenv('PATIENT_ID', 'P001')
MODULE = 'NeoCare-AI'

print(f"==================================================")
print(f"         NeoCare AI Agent - Starting              ")
print(f"==================================================")
print(f"Server:     {EDGE_SERVER_URL}")
print(f"Room:       {ROOM_ID}")
print(f"Patient:    {PATIENT_ID}")
print(f"Module:     {MODULE}")
print()

# --- ARDUINO SERIAL SETUP ---
serial_port = None
sensor_data = {
    "temperature": 36.5,
    "tempStatus": "Normal",
    "lightStatus": "Dim",
    "bpm": 120,
    "status": "Simulated"
}

def setup_serial():
    global serial_port
    ports = ['COM6', 'COM7', 'COM3', 'COM4', 'COM5']
    for port in ports:
        try:
            print(f"Trying Arduino on {port}...")
            serial_port = serial.Serial(port, 9600, timeout=1)
            print(f"[OK] Connected to Arduino on {port}!")
            return
        except:
            pass
    print("[INFO] Arduino not found. Using simulated sensor data.")

def read_serial_loop():
    global sensor_data
    setup_serial()
    while True:
        if serial_port and serial_port.is_open:
            try:
                line = serial_port.readline().decode('utf-8', errors='ignore').strip()
                if line and line.startswith('{'):
                    try:
                        data = json.loads(line)
                        sensor_data.update(data)
                        sensor_data["status"] = "Connected"
                    except:
                        pass
            except:
                time.sleep(2)
                setup_serial()
        else:
            time.sleep(2)
        time.sleep(0.01)

# Start serial thread
serial_thread = threading.Thread(target=read_serial_loop, daemon=True)
serial_thread.start()

# --- MEDIAPIPE SETUP (Optimized) ---
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=False,  # Faster processing
    min_detection_confidence=0.6,
    min_tracking_confidence=0.6,
    static_image_mode=False  # Video mode for better performance
)

def calculate_ear(eye_landmarks):
    """Calculate Eye Aspect Ratio"""
    A = np.linalg.norm(eye_landmarks[1] - eye_landmarks[5])
    B = np.linalg.norm(eye_landmarks[2] - eye_landmarks[4])
    C = np.linalg.norm(eye_landmarks[0] - eye_landmarks[3])
    ear = (A + B) / (2.0 * C)
    return ear

def analyze_frame(frame):
    """Analyze frame for sleep detection"""
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb_frame)
    
    status = "No Face Detected"
    confidence = 0.5
    
    if results.multi_face_landmarks:
        for face_landmarks in results.multi_face_landmarks:
            landmarks = face_landmarks.landmark
            h, w, _ = frame.shape
            
            left_eye_indices = [33, 160, 158, 133, 153, 144]
            right_eye_indices = [362, 385, 387, 263, 373, 380]
            
            left_eye_coords = np.array([(landmarks[i].x * w, landmarks[i].y * h) for i in left_eye_indices])
            right_eye_coords = np.array([(landmarks[i].x * w, landmarks[i].y * h) for i in right_eye_indices])
            
            left_ear = calculate_ear(left_eye_coords)
            right_ear = calculate_ear(right_eye_coords)
            avg_ear = (left_ear + right_ear) / 2.0
            
            if avg_ear < 0.25:
                status = "Sleeping"
                confidence = 0.95
            else:
                status = "Awake"
                confidence = 0.90
    
    return status, confidence

def send_to_server(data):
    """Send data to cloud via edge server API"""
    try:
        # Add patient_id to ensure proper database linkage
        data['patient_id'] = PATIENT_ID
        
        response = requests.post(
            f"{EDGE_SERVER_URL}/api/reports",
            json=data,
            timeout=3,  # Faster timeout for quicker retries
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            result = response.json()
            print(f"✓ Cloud sync: {data['status']} | Temp: {data['metadata']['temperature']}°C | BPM: {data['metadata']['bpm']} | Report ID: {result.get('report_id', 'N/A')}")
            return True
        else:
            print(f"✗ Server error {response.status_code}: {response.text[:100]}")
            return False
    except requests.exceptions.Timeout:
        print(f"✗ Timeout - Check network connection to {EDGE_SERVER_URL}")
        return False
    except requests.exceptions.ConnectionError:
        print(f"✗ Cannot connect to edge server at {EDGE_SERVER_URL}")
        return False
    except Exception as e:
        print(f"✗ Unexpected error: {type(e).__name__}: {e}")
        return False

# --- MAIN LOOP ---
print("\nStarting webcam...")
cap = cv2.VideoCapture(0)

# Optimize webcam settings for better performance
if not cap.isOpened():
    print("[ERROR] Cannot open webcam!")
    exit(1)

cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)  # Lower resolution for faster processing
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
cap.set(cv2.CAP_PROP_FPS, 30)  # Consistent frame rate

print("[OK] Webcam ready!")
print("==================================================")
print("  NeoCare AI Agent - RUNNING (4s cloud sync)     ")
print("  Press 'q' to quit                               ")
print("==================================================\n")

# Performance tracking
frame_count = 0
last_send_time = time.time()
SEND_INTERVAL = 4.0  # Send to cloud every 4 seconds (user requirement)
FRAME_SKIP = 2  # Process every 2nd frame for better performance
success_count = 0
error_count = 0

while True:
    ret, frame = cap.read()
    if not ret:
        print("[WARNING] Failed to grab frame")
        time.sleep(0.1)
        continue
    
    frame_count += 1
    
    # Skip frames for better performance (process every Nth frame)
    if frame_count % FRAME_SKIP != 0:
        cv2.imshow('NeoCare AI Agent', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
        continue
    
    # Analyze frame for sleep detection
    sleep_status, confidence = analyze_frame(frame)
    
    # Display status on frame
    color = (0, 255, 0) if sleep_status == "Awake" else (0, 0, 255) if sleep_status == "Sleeping" else (128, 128, 128)
    cv2.putText(frame, f"Status: {sleep_status}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
    cv2.putText(frame, f"Temp: {sensor_data['temperature']}C ({sensor_data['tempStatus']})", (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
    cv2.putText(frame, f"BPM: {sensor_data['bpm']}", (10, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
    cv2.putText(frame, f"Room: {ROOM_ID} | Patient: {PATIENT_ID}", (10, 130), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)
    
    # Show next sync countdown
    time_until_sync = SEND_INTERVAL - (time.time() - last_send_time)
    sync_color = (0, 255, 255) if time_until_sync > 1 else (0, 255, 0)
    cv2.putText(frame, f"Cloud Sync: {time_until_sync:.1f}s", (10, 160), cv2.FONT_HERSHEY_SIMPLEX, 0.6, sync_color, 2)
    cv2.putText(frame, f"Success: {success_count} | Errors: {error_count}", (10, 190), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
    
    cv2.imshow('NeoCare AI Agent', frame)
    
    # Send to cloud every 4 seconds (optimized interval)
    current_time = time.time()
    if current_time - last_send_time >= SEND_INTERVAL:
        # Determine alert level based on conditions
        alert_level = "normal"
        if sensor_data['temperature'] > 38.0:
            alert_level = "warning"
        if sensor_data['temperature'] > 39.0 or sensor_data['bpm'] > 160 or sensor_data['bpm'] < 100:
            alert_level = "critical"
        
        payload = {
            "room_id": ROOM_ID,
            "patient_id": PATIENT_ID,  # Include patient_id for database linkage
            "module": MODULE,
            "timestamp": int(datetime.now().timestamp()),
            "status": sleep_status,
            "confidence": round(confidence, 2),
            "alert_level": alert_level,
            "metadata": {
                "temperature": round(sensor_data['temperature'], 1),
                "tempStatus": sensor_data['tempStatus'],
                "lightStatus": sensor_data['lightStatus'],
                "bpm": sensor_data['bpm'],
                "sensorStatus": sensor_data['status'],
                "sleepState": sleep_status,
                "frameCount": frame_count,
                "edgeNode": "NeoCare-Edge-1"
            }
        }
        
        if send_to_server(payload):
            success_count += 1
        else:
            error_count += 1
        
        # Show transmission stats
        if (success_count + error_count) % 5 == 0:
            print(f"[Stats] Success: {success_count} | Errors: {error_count} | Success Rate: {success_count/(success_count+error_count)*100:.1f}%")
        
        last_send_time = current_time
    
    # Quit on 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
print("\n[OK] NeoCare AI Agent stopped.")
