/*
NeoCare System - Baby Monitor Logic
For: Arduino Uno

Features:
1. Temperature Check: 
   - < 16°C: "Low"
   - 16-20°C: "Moderate" (Safe Zone)
   - > 20°C: "High"
2. Light Status: "ON" or "OFF"
3. Heart Rate: BPM

Connections:
- DHT11 -> Pin 2
- Heart Rate -> A0
- LDR -> A1
*/

#include <DHT.h>

#define DHTPIN 2
#define DHTTYPE DHT11
#define PULSE_PIN A0
#define LDR_PIN A1

DHT dht(DHTPIN, DHTTYPE);

// Heart Rate Logic
int threshold = 550;
unsigned long lastBeatTime = 0;
int bpm = 0;
bool beatDetected = false;

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  // 1. Temperature Logic
  float temp = dht.readTemperature();
  String tempStatus = "Normal"; // Default
  
  if (isnan(temp)) {
    temp = 0;
    tempStatus = "Error";
  } else if (temp < 16.0) {
    tempStatus = "Low";
  } else if (temp >= 16.0 && temp <= 20.0) {
    tempStatus = "Moderate";
  } else {
    tempStatus = "High";
  }

  // 2. Light Logic
  int ldrValue = analogRead(LDR_PIN);
  String lightStatus = (ldrValue < 500) ? "ON" : "OFF"; 
  // Note: Adjust 500 based on your LDR module (some are HIGH when dark, some LOW)
  // If logic is reversed, swap "ON" and "OFF" above.

  // 3. Heart Rate Logic
  int pulseSignal = analogRead(PULSE_PIN);
  if (pulseSignal > threshold && !beatDetected) {
     unsigned long currentTime = millis();
     if (currentTime - lastBeatTime > 300) { 
        unsigned long beatDuration = currentTime - lastBeatTime;
        bpm = 60000 / beatDuration;
        lastBeatTime = currentTime;
        beatDetected = true;
     }
  }
  if (pulseSignal < threshold) { beatDetected = false; }
  if (millis() - lastBeatTime > 2000) { bpm = 0; }

  // Send JSON package to Website
  Serial.print("{\"temperature\": ");
  Serial.print(temp);
  Serial.print(", \"tempStatus\": \"");
  Serial.print(tempStatus);
  Serial.print("\", \"lightStatus\": \"");
  Serial.print(lightStatus);
  Serial.print("\", \"bpm\": ");
  Serial.print(bpm);
  Serial.println("}");
  
  delay(100);
}
