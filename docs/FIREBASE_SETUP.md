# Firebase Realtime Database Architecture & Deployment Guide

This guide details the database layout, security rules configuration, and cloud deployment steps (Vercel, Firebase Hosting, Netlify) for the EcoSense IoT System.

---

## 1. Database Structure (`/classrooms`)

The Firebase Realtime Database is structured around classroom node IDs:

```text
root/
  └── classrooms/
       ├── CS101/
       │    ├── id: "CS101"
       │    ├── roomName: "Computer Lab 101"
       │    ├── building: "Engineering Block A"
       │    ├── occupancy: 12
       │    ├── capacity: 40
       │    ├── lightStatus: "ON"
       │    └── lastUpdated: 1725426000000
       │
       ├── CS102/
       │    ├── id: "CS102"
       │    ├── roomName: "Lecture Hall 102"
       │    ├── building: "Engineering Block A"
       │    ├── occupancy: 0
       │    ├── capacity: 40
       │    ├── lightStatus: "OFF"
       │    └── lastUpdated: 1725425980000
       ...
```

---

## 2. Setting Up Firebase Console

1. Navigate to the [Firebase Console](https://console.firebase.google.com/) and click **Create Project**.
2. Name the project `ecosense-iot-classroom`.
3. Enable **Realtime Database** under *Build -> Realtime Database*.
4. Select database location (e.g. `us-central1` or `asia-southeast1`).
5. Choose **Start in Test Mode** for development.
6. Copy the database URL (e.g., `https://ecosense-iot-default-rtdb.firebaseio.com/`).
7. Paste database keys into `.env` file in the web app root.

---

## 3. Web App Deployment Instructions

### Option A: Vercel Deployment (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project root directory.
3. Add environment variables in Vercel Dashboard (*Project Settings -> Environment Variables*):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
4. Redeploy: `vercel --prod`

### Option B: Firebase Hosting
1. Install Firebase CLI: `npm i -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
   - Public directory: `dist`
   - Single-page app rewrite: `Yes`
4. Build web app: `npm run build`
5. Deploy: `firebase deploy --only hosting`

### Option C: Netlify Deployment
1. Connect project GitHub repo to Netlify.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Configure environment variables in Netlify site settings.
