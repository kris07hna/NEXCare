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

EDGE_SERVER_URL = os.getenv('EDGE_SERVER_URL', 'http://10.107.51.130:3000')
ROOM_ID = os.getenv('ROOM_ID', 'R2')
PATIENT_ID = os.getenv('PATIENT_ID', 'P001')
MODULE = os.getenv('MODULE', 'NeoCare-AI')

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
    "temperature": 0,
    "tempStatus": "Checking",
    "lightStatus": "Wait",
    "bpm": 0,
    "status": "Disconnected"
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
        except serial.SerialException:
            pass
    print("[WARNING] Arduino not found. Using simulated sensor data.")

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
                    except json.JSONDecodeError:
                        pass
            except Exception as e:
                print(f"Serial error: {e}")
                time.sleep(2)
                setup_serial()
        else:
            time.sleep(2)
            setup_serial()
        time.sleep(0.01)

# Start serial thread
serial_thread = threading.Thread(target=read_serial_loop, daemon=True)
serial_thread.start()

# --- MEDIAPIPE SETUP ---
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
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
    confidence = 0.0
    
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
                confidence = 1.0 - avg_ear
            else:
                status = "Awake"
                confidence = avg_ear
    
    return status, confidence

def send_to_server(data):
    """Send data to central server"""
    try:
        response = requests.post(
            f"{EDGE_SERVER_URL}/api/reports",
            json=data,
            timeout=5
        )
        if response.status_code == 201:
            print(f"[OK] Report sent: {data['status']} (conf: {data['confidence']:.2f})")
            return True
        else:
            print(f"[WARNING] Server returned {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Cannot reach server: {e}")
        return False

# --- MAIN LOOP ---
print("\nStarting webcam...")
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("[ERROR] Cannot open webcam!")
    exit(1)

print("[OK] Webcam ready!")
print("==================================================")
print("  NeoCare AI Agent - RUNNING                      ")
print("  Press 'q' to quit                               ")
print("==================================================\n")

frame_count = 0
last_send_time = time.time()

while True:
    ret, frame = cap.read()
    if not ret:
        print("[WARNING] Failed to grab frame")
        break
    
    frame_count += 1
    
    # Analyze every frame for display, but send to server every 2 seconds
    sleep_status, confidence = analyze_frame(frame)
    
    # Display status on frame
    color = (0, 255, 0) if sleep_status == "Awake" else (0, 0, 255) if sleep_status == "Sleeping" else (128, 128, 128)
    cv2.putText(frame, f"Status: {sleep_status}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
    cv2.putText(frame, f"Temp: {sensor_data['temperature']}C ({sensor_data['tempStatus']})", (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
    cv2.putText(frame, f"Light: {sensor_data['lightStatus']}", (10, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
    cv2.putText(frame, f"BPM: {sensor_data['bpm']}", (10, 130), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
    
    cv2.imshow('NeoCare AI Agent', frame)
    
    # Send to server every 2 seconds
    current_time = time.time()
    if current_time - last_send_time >= 2:
        payload = {
            "room_id": ROOM_ID,
            "patient_id": PATIENT_ID,
            "module": MODULE,
            "timestamp": int(datetime.now().timestamp()),
            "status": sleep_status,
            "confidence": confidence,
            "alert_level": "normal",
            "metadata": {
                "temperature": sensor_data['temperature'],
                "tempStatus": sensor_data['tempStatus'],
                "lightStatus": sensor_data['lightStatus'],
                "bpm": sensor_data['bpm'],
                "sensorStatus": sensor_data['status']
            }
        }
        
        if send_to_server(payload):
            print(f"[OK] [{datetime.now().strftime('%H:%M:%S')}] Sent: {sleep_status} | Temp: {sensor_data['temperature']}C | BPM: {sensor_data['bpm']}")
        
        last_send_time = current_time
    
    # Quit on 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
print("\n[OK] NeoCare AI Agent stopped.")
