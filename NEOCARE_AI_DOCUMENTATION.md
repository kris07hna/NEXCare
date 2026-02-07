# NeoCare AI: System Documentation

## 1. Overview
The NeoCare AI Baby Monitor is an intelligent pediatric monitoring system that combines **Computer Vision** for sleep-state detection with an **IoT sensor network** for environment and vital sign tracking.

---

## 2. The AI Model: Sleep Detection
The core intelligence of the system is powered by the **MediaPipe Face Mesh** model and a custom **Eye Aspect Ratio (EAR)** algorithm.

### How it works:
1.  **Facial Landmark Detection**: The system identifies 468 3D facial landmarks in real-time using a lightweight deep learning model.
2.  **Eye Monitoring**: We specifically track 12 coordinate points (6 per eye).
3.  **EAR Calculation**: The system calculates the ratio of the vertical distance between eyelids to the horizontal distance.
    *   **Formula**: `EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)`
4.  **Threshold Logic**:
    *   **EAR < 0.25**: The eyes are closed for a sustained period; the AI classifies the infant as **"Sleeping"**.
    *   **EAR >= 0.25**: The eyes are open; the AI classifies the infant as **"Awake"**.

---

## 3. IoT Integration: Vital Signs & Environment
The system integrates an **Arduino Uno** acting as a sensor node to monitor the infant's surroundings and physiological state.

### Monitored Data:
*   **Temperature (DHT11)**: Categorized as Low (<16°C), Moderate (16-20°C), or High (>20°C).
*   **Light Levels (LDR)**: Detects if the room lighting is ON or OFF to ensure optimal sleep conditions.
*   **Heart Rate (Pulse Sensor)**: Calculates BPM (Beats Per Minute) in real-time through peak-to-peak interval detection.

---

## 4. Technical Architecture
The system uses a **decoupled client-server architecture**:

1.  **Frontend (Next.js/React)**:
    *   Captures webcam frames.
    *   Provides the user dashboard.
    *   Communicates with the backend via REST API.
2.  **Backend (Python/Flask)**:
    *   Runs the MediaPipe AI engine.
    *   Manages the Serial connection to the Arduino hardware.
    *   Processes raw data into actionable insights for the UI.
3.  **Communication**: Uses **JSON** over **Serial (USB)** for hardware data and **Base64 encoded images** over **HTTP** for AI processing.

---

## 5. Privacy & Ethics
*   **Edge Processing**: Image data is processed in real-time. Frames are analyzed in memory and immediately discarded.
*   **No Data Logging**: Visual data is never stored on the hard drive, ensuring maximum privacy for the infant and parents.
