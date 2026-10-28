# EcoSense IoT - Classroom Occupancy & Energy Management System

A real-time IoT campus monitoring dashboard and hardware telemetry system built with **React**, **Vite**, **Firebase Realtime Database**, and **ESP32 microcontrollers**. 

The system tracks physical classroom occupancy (0-40 capacity) and lighting status in real-time, helping university administration reduce wasted electricity, monitor crowd density, and find available study spaces.

---

## System Architecture

```text
  [ ESP32 Sensor Nodes ] ──────> ( HTTPS / Firebase API ) 
   - PIR / IR Motion Counter                 │
   - LDR Light Sensor                        ▼
                                 [ Firebase Realtime DB ]
                                  Path: /classrooms/[ID]
                                             │
                                             ▼  (WebSockets / onValue)
                                 [ React + Vite Dashboard ]
                                  - Live Room Grid & Cards
                                  - Energy Audit & Vacant Filter
                                  - Analytics & Recharts Trends
                                  - Node Management
```

---

## Features

- **Live Classroom Grid**: Glassmorphic UI displaying real-time occupancy, light status ("ON"/"OFF"), and color-coded status badges (Green <40%, Yellow 40-80%, Red >80%).
- **Energy Waste Detection**: Automatically alerts when a classroom is vacant (0 occupants) but lights remain ON, featuring a 1-click bulk shutdown action.
- **Mock Data Engine**: Integrated offline simulator generating real-time ESP32 sensor triggers every few seconds when Firebase credentials are not provided or Mock toggle is ON.
- **Analytics & History**: Interactive Recharts area and bar charts tracking hourly campus occupancy and power consumption.
- **Classroom Management**: Add, update, or decommission classroom nodes dynamically in Firebase.
- **Responsive & Modern Design**: Dark mode aesthetic built with modern typography, glassmorphism, micro-animations, and full mobile support.

---

## Implementation Checklist

### Frontend
- [x] Dashboard page with classroom cards (3+ sample rooms minimum)
- [x] Real-time updates without page refresh
- [x] Vacant rooms filter page with wasted energy highlights
- [x] Statistics/occupancy history page with charts
- [x] Responsive design (mobile + desktop)
- [x] Navigation menu with all pages
- [x] Loading skeleton while data loads
- [x] Error message display for Firebase failures
- [x] Settings toggle: Mock Data ON/OFF
- [x] Color-coded status badges (green/yellow/red)

### Firebase
- [x] `firebaseConfig.js` with placeholder credentials & safe fallback
- [x] Real-time listeners on `/classrooms` path
- [x] History data queries & mock fallback for statistics
- [x] Error handling and retry logic

### Documentation
- [x] README explaining project setup & architecture
- [x] ESP32 Arduino sketch C++ code & setup guide (`docs/ESP32_GUIDE.md`)
- [x] Firebase database structure & security rules (`database.rules.json` & `docs/FIREBASE_SETUP.md`)
- [x] Deployment instructions (Vercel, Firebase Hosting, Netlify)
- [x] Auth options & troubleshooting matrix

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn
- ESP32 Board + Arduino IDE (for hardware deployment)

### 2. Environment Setup
Copy `.env.example` to `.env` and fill in your Firebase credentials:
```bash
cp .env.example .env
```

Set your Firebase RTDB values:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

*Note: If `.env` is omitted, the web dashboard automatically starts in **Mock Data Simulator Mode** so you can test all features immediately.*

### 3. Install & Run
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## Documentation Links

- [ESP32 Hardware & Arduino Sketch Guide](file:///c:/Users/Sudeep%20Krishna%20V/OneDrive/Documents/Desktop/iot/docs/ESP32_GUIDE.md)
- [Firebase Database Structure & Security Rules](file:///c:/Users/Sudeep%20Krishna%20V/OneDrive/Documents/Desktop/iot/docs/FIREBASE_SETUP.md)
- [Database Security Rules Template](file:///c:/Users/Sudeep%20Krishna%20V/OneDrive/Documents/Desktop/iot/database.rules.json)
