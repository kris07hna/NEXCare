import serial
import json
import time

# --- CONFIGURATION ---
SERIAL_PORT = 'COM6'  # Your Arduino port
BAUD_RATE = 9600
TIMEOUT = 1

def start_extractor():
    print(f"Connecting to Arduino on {SERIAL_PORT}...")
    
    try:
        # Initialize Serial Connection
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=TIMEOUT)
        time.sleep(2) # Wait for Arduino to reset/stabilize
        print("Connected! Waiting for data...\n")

        while True:
            if ser.in_waiting > 0:
                # 1. Read the line from Serial
                line = ser.readline().decode('utf-8').strip()
                
                if line:
                    try:
                        # 2. Parse the JSON data
                        data = json.loads(line)
                        
                        # 3. Extract and display values
                        temp = data.get("temperature", 0)
                        temp_status = data.get("tempStatus", "N/A")
                        light = data.get("lightStatus", "N/A")
                        bpm = data.get("bpm", 0)

                        print(f"[LIVE STATUS] Temp: {temp}C ({temp_status}) | Light: {light} | BPM: {bpm}")
                        
                        # Here you could save this to a file or database
                        # with open("status.json", "w") as f:
                        #    json.dump(data, f)

                    except json.JSONDecodeError:
                        # Skip if the line is incomplete/corrupted
                        continue

            time.sleep(0.1) # Small delay to be CPU friendly

    except serial.SerialException as e:
        print(f"Error: Could not open {SERIAL_PORT}.")
        print("Reason: Is the Arduino Serial Monitor still open? If so, close it!")
        print(f"Full Error: {e}")
    except KeyboardInterrupt:
        print("\nStopping extractor...")
        if 'ser' in locals() and ser.is_open:
            ser.close()

if __name__ == "__main__":
    start_extractor()
