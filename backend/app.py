import cv2
import mediapipe as mp
import numpy as np
from flask import Flask, render_template, Response, request, jsonify
from flask_cors import CORS
import base64
import serial
import threading
import time
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# --- ARDUINO SERIAL SETUP ---
serial_port = None
sensor_data = {"temperature": 0, "tempStatus": "Checking", "lightStatus": "Wait", "bpm": 0, "status": "Simulated"}

def setup_serial():
    global serial_port
    # List possible Windows COM ports to try
    ports = ['COM6', 'COM3', 'COM4', 'COM5'] 
    for port in ports:
        try:
            print(f"Trying to connect to Arduino on {port}...")
            serial_port = serial.Serial(port, 9600, timeout=1)
            print(f"Connected to Arduino on {port}!")
            return
        except serial.SerialException:
            pass
    print("Could not find Arduino. Using simulated data.")

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
                        # Print once per few seconds to avoid clutter but confirm it's working
                        if time.time() % 5 < 0.2:
                            print(f"Latest Sensor Data: {sensor_data}")
                    except json.JSONDecodeError:
                        pass # Partial line
            except Exception as e:
                print(f"Serial connection lost: {e}")
                time.sleep(2)
                setup_serial()
        else:
            time.sleep(2)
            setup_serial()
        time.sleep(0.01)

# Start serial thread immediately
thread = threading.Thread(target=read_serial_loop)
thread.daemon = True
thread.start()

# --- CAMERA / AI SETUP ---
# Initialize MediaPipe Face Mesh
mp_face_mesh = mp.solutions.face_mesh

face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Function to calculate Eye Aspect Ratio (EAR)
def calculate_ear(eye_landmarks):
    # Vertical distances
    A = np.linalg.norm(eye_landmarks[1] - eye_landmarks[5])
    B = np.linalg.norm(eye_landmarks[2] - eye_landmarks[4])
    # Horizontal distance
    C = np.linalg.norm(eye_landmarks[0] - eye_landmarks[3])
    ear = (A + B) / (2.0 * C)
    return ear

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/sensor_data', methods=['GET'])
def get_sensor_data():
    return jsonify(sensor_data)

@app.route('/process_frame', methods=['POST'])
def process_frame():
    try:
        # Get frame data from request
        data = request.json['image']
        header, encoded = data.split(",", 1)
        nparr = np.frombuffer(base64.b64decode(encoded), np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Convert to RGB for MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb_frame)

        status = "No Face Detected"
        color = "gray"

        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks:
                landmarks = face_landmarks.landmark
                h, w, _ = frame.shape

                # Get coordinates for left and right eyes (MediaPipe indices)
                # Left eye: 33, 160, 158, 133, 153, 144
                left_eye_indices = [33, 160, 158, 133, 153, 144]
                right_eye_indices = [362, 385, 387, 263, 373, 380]

                left_eye_coords = np.array([(landmarks[i].x * w, landmarks[i].y * h) for i in left_eye_indices])
                right_eye_coords = np.array([(landmarks[i].x * w, landmarks[i].y * h) for i in right_eye_indices])

                left_ear = calculate_ear(left_eye_coords)
                right_ear = calculate_ear(right_eye_coords)

                avg_ear = (left_ear + right_ear) / 2.0

                # EAR Threshold (adjust based on testing)
                if avg_ear < 0.25:
                    status = "Sleeping"
                    color = "red"
                else:
                    status = "Awake"
                    color = "green"

        return jsonify({'status': status, 'color': color})

    except Exception as e:
        print(e)
        return jsonify({'status': 'Error', 'color': 'black'})

if __name__ == '__main__':
    # use_reloader=False is CRITICAL when using Serial ports
    # to prevent Flask from starting two processes and fighting over the port.
    app.run(debug=True, port=5000, use_reloader=False)
