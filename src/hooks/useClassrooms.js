import { useState, useEffect, useCallback } from 'react';
import { isFirebaseConfigured } from '../services/firebaseConfig';
import { 
  subscribeToClassrooms, 
  updateRoomLightStatus as fbUpdateLight,
  updateRoomOccupancy as fbUpdateOccupancy,
  createClassroom as fbCreateClassroom,
  removeClassroom as fbRemoveClassroom
} from '../services/firebaseService';
import { mockDataService } from '../services/mockDataService';

export function useClassrooms() {
  // Default to mock data if Firebase credentials are missing/placeholder
  const [useMock, setUseMock] = useState(() => !isFirebaseConfigured);
  const [classrooms, setClassrooms] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    let unsubscribe = () => {};

    if (useMock) {
      // Subscribe to mock data simulator
      unsubscribe = mockDataService.subscribe((data) => {
        setClassrooms(data);
        setLoading(false);
      });
    } else {
      // Subscribe to Firebase RTDB live updates
      try {
        unsubscribe = subscribeToClassrooms(
          (data) => {
            setClassrooms(data || {});
            setLoading(false);
            setError(null);
          },
          (err) => {
            console.error("Firebase subscription error:", err);
            setError(`Firebase Error: ${err.message}. Consider switching to Mock Data.`);
            setLoading(false);
          }
        );
      } catch (err) {
        setError(`Failed to connect to Firebase: ${err.message}`);
        setLoading(false);
      }
    }

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [useMock]);

  // Actions
  const toggleLight = useCallback(async (roomId, currentStatus) => {
    const newStatus = currentStatus === 'ON' ? 'OFF' : 'ON';
    if (useMock) {
      mockDataService.updateLightStatus(roomId, newStatus);
    } else {
      try {
        await fbUpdateLight(roomId, newStatus);
      } catch (err) {
        setError(`Light toggle failed: ${err.message}`);
      }
    }
  }, [useMock]);

  const changeOccupancy = useCallback(async (roomId, newCount) => {
    if (useMock) {
      mockDataService.updateOccupancy(roomId, newCount);
    } else {
      try {
        await fbUpdateOccupancy(roomId, newCount);
      } catch (err) {
        setError(`Occupancy update failed: ${err.message}`);
      }
    }
  }, [useMock]);

  const addRoom = useCallback(async (roomData) => {
    if (useMock) {
      return mockDataService.addClassroom(roomData);
    } else {
      try {
        return await fbCreateClassroom(roomData);
      } catch (err) {
        setError(`Failed to add room: ${err.message}`);
        throw err;
      }
    }
  }, [useMock]);

  const deleteRoom = useCallback(async (roomId) => {
    if (useMock) {
      mockDataService.deleteClassroom(roomId);
    } else {
      try {
        await fbRemoveClassroom(roomId);
      } catch (err) {
        setError(`Failed to delete room: ${err.message}`);
      }
    }
  }, [useMock]);

  // Convert object to array for UI consumption
  const classroomArray = Object.keys(classrooms).map(id => ({
    id,
    ...classrooms[id]
  }));

  return {
    classrooms: classroomArray,
    rawClassrooms: classrooms,
    loading,
    error,
    useMock,
    setUseMock,
    isFirebaseConfigured,
    toggleLight,
    changeOccupancy,
    addRoom,
    deleteRoom
  };
}
