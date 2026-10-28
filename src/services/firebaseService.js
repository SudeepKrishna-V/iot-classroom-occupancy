import { ref, onValue, update, set, remove, serverTimestamp } from 'firebase/database';
import { database, isFirebaseConfigured } from './firebaseConfig';
import { INITIAL_CLASSROOMS } from './mockDataService';

/**
 * Real-time Firebase Database service operations
 */

export const subscribeToClassrooms = (onData, onError) => {
  if (!isFirebaseConfigured || !database) {
    if (onError) onError(new Error("Firebase is not configured"));
    return () => {};
  }

  const classroomsRef = ref(database, 'classrooms');
  
  const unsubscribe = onValue(
    classroomsRef,
    (snapshot) => {
      const fbData = snapshot.val() || {};

      // Seed default FF05 in Firebase RTDB if classrooms/FF05 does not exist yet
      if (!fbData["FF05"]) {
        const ff05Default = {
          id: "FF05",
          roomName: "I-ECE-A",
          building: "Main Block",
          occupancy: 0,
          capacity: 65,
          lightStatus: "OFF",
          acStatus: "OFF",
          lastUpdated: serverTimestamp()
        };
        const ff05Ref = ref(database, 'classrooms/FF05');
        set(ff05Ref, ff05Default).catch((err) => {
          console.error("Failed to auto-seed FF05 classroom to Firebase:", err);
        });
      }

      // Merge mock classrooms for prototype with live Firebase classroom data (FF05)
      const mergedData = {
        ...INITIAL_CLASSROOMS,
        ...fbData
      };
      onData(mergedData);
    },
    (error) => {
      console.error("Firebase database read error:", error);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
};

export const updateRoomLightStatus = async (roomId, lightStatus) => {
  if (!isFirebaseConfigured || !database) {
    throw new Error("Firebase RTDB is not connected.");
  }
  const roomRef = ref(database, `classrooms/${roomId}`);
  await update(roomRef, {
    lightStatus: lightStatus,
    lastUpdated: serverTimestamp()
  });
};

export const updateRoomOccupancy = async (roomId, occupancy) => {
  if (!isFirebaseConfigured || !database) {
    throw new Error("Firebase RTDB is not connected.");
  }
  const roomRef = ref(database, `classrooms/${roomId}`);
  await update(roomRef, {
    occupancy: Number(occupancy),
    lastUpdated: serverTimestamp()
  });
};

export const createClassroom = async (roomData) => {
  if (!isFirebaseConfigured || !database) {
    throw new Error("Firebase RTDB is not connected.");
  }
  const id = roomData.id || `ROOM_${Date.now().toString().slice(-4)}`;
  const roomRef = ref(database, `classrooms/${id}`);
  
  await set(roomRef, {
    id,
    roomName: roomData.roomName || `Classroom ${id}`,
    building: roomData.building || "Main Building",
    occupancy: Number(roomData.occupancy) || 0,
    capacity: Number(roomData.capacity) || 40,
    lightStatus: roomData.lightStatus || "OFF",
    acStatus: roomData.acStatus || "OFF",
    lastUpdated: serverTimestamp()
  });
  return id;
};

export const removeClassroom = async (roomId) => {
  if (!isFirebaseConfigured || !database) {
    throw new Error("Firebase RTDB is not connected.");
  }
  const roomRef = ref(database, `classrooms/${roomId}`);
  await remove(roomRef);
};
