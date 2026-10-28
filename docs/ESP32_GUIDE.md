# ESP32 Microcontroller Firmware & Setup Guide

This guide provides full hardware schematics, software setup, C++/Arduino code, authentication options, telemetry format specifications, and troubleshooting for ESP32 classroom sensor nodes in the **EcoSense IoT System**.

---

## 1. Hardware Pinout & Schematics

Each classroom node uses an **ESP32 DevKit V1** connected to occupancy counting sensors (IR beam break pair or PIR sensors) and a light detection sensor (LDR/Photoresistor or Current Relay).

| Component | ESP32 Pin | Function |
| :--- | :--- | :--- |
| **IR Entry Sensor** | GPIO 14 (Digital Input) | Triggers on person entering classroom |
| **IR Exit Sensor** | GPIO 27 (Digital Input) | Triggers on person exiting classroom |
| **LDR Light Sensor / Relay** | GPIO 34 (Analog/Digital Input) | Detects whether classroom lights are ON/OFF |
| **Status LED (Built-in)** | GPIO 2 (Digital Output) | Blinks on WiFi/Firebase telemetry transmission |

---

## 2. Telemetry Data Format Specification (Firebase Realtime Database)

The ESP32 writes directly to the following Firebase endpoint path:
```text
/classrooms/[CLASSROOM_ID]/
```

### JSON Schema Sent by ESP32:
```json
{
  "occupancy": 14,
  "lightStatus": "ON",
  "lastUpdated": { ".sv": "timestamp" }
}
```

### Fields Specification:
- **`occupancy`** *(integer, 0 to 40)*: Number of current occupants inside the classroom.
- **`lightStatus`** *(string, "ON" | "OFF")*: Status of room lighting.
- **`lastUpdated`** *(Firebase Server Timestamp)*: Uses `{.sv: "timestamp"}` (or POSIX Epoch milliseconds) to synchronize server timestamps across nodes.
- **Transmission Frequency**:
  - **Immediate**: Transmitted immediately whenever an occupancy sensor or light status sensor triggers.
  - **Heartbeat**: Transmitted every **5 seconds** if no sensor state change occurs.

---

## 3. ESP32 Authentication Options

### Option A: API Key + Email/Password Auth (Standard)
- **Use Case**: Secure staging & production.
- **Implementation**: Uses Firebase Web API Key and a dedicated sensor email/password created in Firebase Authentication console (e.g. `node101@campus.edu`).

### Option B: Service Account (Recommended for Enterprise/Production)
- **Use Case**: Production deployment without user accounts.
- **Implementation**: Uses Firebase Admin Service Account JSON private key (`client_email` and `private_key`) with JWT signing via standard RSA256.

### Option C: Anonymous Auth (Development & Lab Testing Only)
- **Use Case**: Quick testing without configuring user accounts.
- **Implementation**: Calls `Firebase.signUp(&config, &auth, "", "")` to obtain a temporary anonymous auth token.

---

## 4. Complete ESP32 C++ Arduino Code

Install the following libraries in Arduino IDE before compiling:
1. **`Firebase-ESP-Client`** by Mobizt (v4.4.0+)
2. **`ArduinoJson`** by Benoit Blanchon (v6.x)

```cpp
#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/RTDBHelper.h"

// -------------------------------------------------------------------
// 1. CONFIGURATION PARAMETERS
// -------------------------------------------------------------------
#define WIFI_SSID       "YOUR_WIFI_SSID"
#define WIFI_PASSWORD   "YOUR_WIFI_PASSWORD"

#define API_KEY         "AIzaSyYOUR_FIREBASE_API_KEY"
#define DATABASE_URL    "https://your-project-id-default-rtdb.firebaseio.com"

// Classroom Identifier
#define CLASSROOM_ID    "CS101"

// -------------------------------------------------------------------
// 2. HARDWARE PINS
// -------------------------------------------------------------------
#define ENTRY_SENSOR_PIN  14
#define EXIT_SENSOR_PIN   27
#define LIGHT_SENSOR_PIN  34
#define STATUS_LED        2

// -------------------------------------------------------------------
// 3. GLOBAL VARIABLES & STATE
// -------------------------------------------------------------------
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

int currentOccupancy = 0;
String currentLightStatus = "OFF";
unsigned long lastHeartbeatTime = 0;
const unsigned long HEARTBEAT_INTERVAL = 5000; // 5 Seconds

// Debounce timing
volatile unsigned long lastEntryTrigger = 0;
volatile unsigned long lastExitTrigger = 0;
const unsigned long DEBOUNCE_DELAY = 300; // 300ms software debounce

// -------------------------------------------------------------------
// 4. DEBOUNCED INTERRUPT SERVICE ROUTINES (ISRs)
// -------------------------------------------------------------------
void IRAM_ATTR handleEntry() {
  unsigned long now = millis();
  if (now - lastEntryTrigger > DEBOUNCE_DELAY) {
    if (currentOccupancy < 40) {
      currentOccupancy++;
    }
    lastEntryTrigger = now;
  }
}

void IRAM_ATTR handleExit() {
  unsigned long now = millis();
  if (now - lastExitTrigger > DEBOUNCE_DELAY) {
    if (currentOccupancy > 0) {
      currentOccupancy--;
    }
    lastExitTrigger = now;
  }
}

// -------------------------------------------------------------------
// 5. FIREBASE TELEMETRY SENDER
// -------------------------------------------------------------------
bool sendTelemetryToFirebase() {
  if (!Firebase.ready()) {
    Serial.println("Firebase not ready. Skipping payload transmission.");
    return false;
  }

  digitalWrite(STATUS_LED, HIGH);
  String nodePath = "/classrooms/" + String(CLASSROOM_ID);

  FirebaseJson json;
  json.set("occupancy", currentOccupancy);
  json.set("lightStatus", currentLightStatus);
  json.set("lastUpdated/.sv", "timestamp");

  Serial.printf("Sending payload to %s -> Occupancy: %d | Light: %s\n", 
                nodePath.c_str(), currentOccupancy, currentLightStatus.c_str());

  if (Firebase.RTDB.updateNode(&fbdo, nodePath, &json)) {
    Serial.println("✓ Telemetry updated successfully in Firebase RTDB!");
    digitalWrite(STATUS_LED, LOW);
    return true;
  } else {
    Serial.printf("✗ Firebase update failed: %s\n", fbdo.errorReason().c_str());
    digitalWrite(STATUS_LED, LOW);
    return false;
  }
}

// -------------------------------------------------------------------
// 6. SETUP & INITIALIZATION
// -------------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  pinMode(STATUS_LED, OUTPUT);
  pinMode(ENTRY_SENSOR_PIN, INPUT_PULLUP);
  pinMode(EXIT_SENSOR_PIN, INPUT_PULLUP);
  pinMode(LIGHT_SENSOR_PIN, INPUT);

  // Attach Interrupts for sensor triggering
  attachInterrupt(digitalPinToInterrupt(ENTRY_SENSOR_PIN), handleEntry, FALLING);
  attachInterrupt(digitalPinToInterrupt(EXIT_SENSOR_PIN), handleExit, FALLING);

  // Connect to WiFi
  Serial.print("Connecting to WiFi ");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected! IP Address: " + WiFi.localIP().toString());

  // Configure Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  // --- AUTHENTICATION OPTION CHOICE ---
  // Option C: Anonymous Auth (Change for Option A or B if needed)
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Firebase Anonymous Auth Successful");
  } else {
    Serial.printf("Firebase Auth Error: %s\n", config.signer.signupError.message.c_str());
  }

  config.token_status_callback = tokenStatusCallback;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // Initial Sync
  sendTelemetryToFirebase();
}

// -------------------------------------------------------------------
// 7. MAIN LOOP
// -------------------------------------------------------------------
void loop() {
  // Read Light Sensor (Analog thresholding or digital read)
  int lightVal = analogRead(LIGHT_SENSOR_PIN);
  String newLightStatus = (lightVal > 1500) ? "ON" : "OFF"; // Adjust threshold per LDR

  bool stateChanged = false;
  if (newLightStatus != currentLightStatus) {
    currentLightStatus = newLightStatus;
    stateChanged = true;
  }

  // Send telemetry if state changed or heartbeat interval (5 seconds) reached
  unsigned long now = millis();
  if (stateChanged || (now - lastHeartbeatTime >= HEARTBEAT_INTERVAL)) {
    sendTelemetryToFirebase();
    lastHeartbeatTime = now;
  }

  delay(50);
}
```

---

## 5. Troubleshooting Section

| Issue | Root Cause | Recommended Solution |
| :--- | :--- | :--- |
| **WiFi Disconnection Loop** | Weak signal or WiFi sleep mode enabled on ESP32 | Call `WiFi.setSleep(false);` in `setup()`. Enable automatic reconnect via `Firebase.reconnectWiFi(true);`. |
| **Firebase Auth 401 / 403 Errors** | Mismatched API key, invalid RTDB URL, or locked security rules | Verify `DATABASE_URL` ends in `.firebaseio.com`. Update Firebase Realtime Database rules to allow read/write. |
| **Sensor Bouncing / False Counting** | Mechanical noise or fast ambient light flicker | Increase hardware pullup resistor or software `DEBOUNCE_DELAY` (e.g. 300ms - 500ms). |
| **Occupancy Stuck Above 40** | Unbalanced entry/exit interrupts | Clamp values with `min(40, currentOccupancy)`. Add periodic auto-zero calibration at midnight. |
