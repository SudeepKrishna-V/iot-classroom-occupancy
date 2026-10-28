/**
 * Mock Data Service for IoT Classroom Occupancy & Energy Management System
 * Simulates real-time sensor updates from ESP32 microcontrollers.
 */

export const INITIAL_CLASSROOMS = {
  "FF05": {
    id: "FF05",
    roomName: "I-ECE-A",
    building: "Main Block",
    occupancy: 0,
    capacity: 65,
    lightStatus: "OFF",
    acStatus: "OFF",
    lastUpdated: Date.now() - 15000
  },
  "FF06": {
    id: "FF06",
    roomName: "I-ECE-B",
    building: "Main Block",
    occupancy: 58,
    capacity: 65,
    lightStatus: "ON",
    lastUpdated: Date.now() - 5000,
    acStatus: "ON"
  },
  "FF07": {
    id: "FF07",
    roomName: "I-ECE-C",
    building: "Main Block",
    occupancy: 0,
    capacity: 65,
    lightStatus: "ON", // Energy waste alert example
    lastUpdated: Date.now() - 20000,
    acStatus: "OFF"
  },
  "FF01": {
    id: "FF01",
    roomName: "First Floor Auditorium",
    building: "Main Block",
    occupancy: 180,
    capacity: 250,
    lightStatus: "ON",
    lastUpdated: Date.now() - 2000,
    acStatus: "ON"
  },
  "SF06": {
    id: "SF06",
    roomName: "II-IT",
    building: "Main Block",
    occupancy: 52,
    capacity: 70,
    lightStatus: "ON",
    lastUpdated: Date.now() - 10000,
    acStatus: "ON"
  },
  "AI101": {
    id: "AI101",
    roomName: "I-AIML-A",
    building: "AIDS Block",
    occupancy: 0,
    capacity: 70,
    lightStatus: "OFF",
    lastUpdated: Date.now() - 45000,
    acStatus: "OFF"
  },
  "AI102": {
    id: "AI102",
    roomName: "I-AIML-B",
    building: "AIDS Block",
    occupancy: 61,
    capacity: 70,
    lightStatus: "ON",
    lastUpdated: Date.now() - 8000,
    acStatus: "ON"
  },
  "AI205": {
    id: "AI205",
    roomName: "VISTA HALL",
    building: "AIDS Block",
    occupancy: 120,
    capacity: 150,
    lightStatus: "ON",
    lastUpdated: Date.now() - 3000,
    acStatus: "ON"
  },
  "AI206": {
    id: "AI206",
    roomName: "COLAB SPACE",
    building: "AIDS Block",
    occupancy: 0,
    capacity: 100,
    lightStatus: "ON", // Energy waste alert example
    lastUpdated: Date.now() - 12000,
    acStatus: "OFF"
  },
  "SF07": {
    id: "SF07",
    roomName: "I-CSE-A",
    building: "Main Block",
    occupancy: 48,
    capacity: 65,
    lightStatus: "ON",
    lastUpdated: Date.now() - 6000,
    acStatus: "ON"
  },
  "SF08": {
    id: "SF08",
    roomName: "I-CSE-B",
    building: "Main Block",
    occupancy: 0,
    capacity: 65,
    lightStatus: "OFF",
    lastUpdated: Date.now() - 30000,
    acStatus: "OFF"
  },
  "SF09": {
    id: "SF09",
    roomName: "I-CSE-C",
    building: "Main Block",
    occupancy: 35,
    capacity: 65,
    lightStatus: "ON",
    lastUpdated: Date.now() - 18000,
    acStatus: "ON"
  },
  "SF10": {
    id: "SF10",
    roomName: "I-CSE-D",
    building: "Main Block",
    occupancy: 60,
    capacity: 65,
    lightStatus: "ON",
    lastUpdated: Date.now() - 14000,
    acStatus: "ON"
  },
  "TF13": {
    id: "TF13",
    roomName: "III-ECE-A",
    building: "Main Block",
    occupancy: 0,
    capacity: 65,
    lightStatus: "OFF",
    lastUpdated: Date.now() - 60000,
    acStatus: "OFF"
  },
  "TF12": {
    id: "TF12",
    roomName: "II-ECE-C",
    building: "Main Block",
    occupancy: 45,
    capacity: 65,
    lightStatus: "ON",
    lastUpdated: Date.now() - 9000,
    acStatus: "ON"
  },
  "TF11": {
    id: "TF11",
    roomName: "CCE LAB",
    building: "Main Block",
    occupancy: 65,
    capacity: 80,
    lightStatus: "ON",
    lastUpdated: Date.now() - 7000,
    acStatus: "ON"
  },
  "TF10": {
    id: "TF10",
    roomName: "Networking Lab",
    building: "Main Block",
    occupancy: 95,
    capacity: 120,
    lightStatus: "ON",
    lastUpdated: Date.now() - 11000,
    acStatus: "ON"
  },
  "TF14": {
    id: "TF14",
    roomName: "III-ECE-B",
    building: "Main Block",
    occupancy: 0,
    capacity: 65,
    lightStatus: "OFF",
    lastUpdated: Date.now() - 40000,
    acStatus: "OFF"
  },
  "TF15": {
    id: "TF15",
    roomName: "III-ECE-C",
    building: "Main Block",
    occupancy: 40,
    capacity: 65,
    lightStatus: "ON",
    lastUpdated: Date.now() - 16000,
    acStatus: "ON"
  }
};

class MockDataService {
  constructor() {
    this.classrooms = { ...INITIAL_CLASSROOMS };
    this.listeners = new Set();
    this.simulationInterval = null;
  }

  // Start simulating real-time ESP32 updates
  startSimulation() {
    if (this.simulationInterval) return;

    this.simulationInterval = setInterval(() => {
      // Pick a random room to simulate sensor activity
      const keys = Object.keys(this.classrooms);
      if (keys.length === 0) return;

      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const room = this.classrooms[randomKey];

      // Simulate occupancy variation (-2 to +3)
      const delta = Math.floor(Math.random() * 6) - 2;
      const maxCap = room.capacity || 65;
      let newOccupancy = Math.max(0, Math.min(maxCap, room.occupancy + delta));
      
      // Auto light rule logic (if 0 occupants, light might get turned off after delay or stay on if wasted)
      let newLightStatus = room.lightStatus;
      if (newOccupancy > 0 && room.lightStatus === "OFF") {
        newLightStatus = "ON"; // Sensor auto-turns lights on when someone enters
      }

      this.classrooms[randomKey] = {
        ...room,
        occupancy: newOccupancy,
        lightStatus: newLightStatus,
        lastUpdated: Date.now()
      };

      this.notifyListeners();
    }, 4000); // Trigger every 4 seconds
  }

  stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    // Send initial snapshot immediately
    callback({ ...this.classrooms });
    this.startSimulation();

    return () => {
      this.listeners.delete(callback);
      if (this.listeners.size === 0) {
        this.stopSimulation();
      }
    };
  }

  notifyListeners() {
    const snapshot = { ...this.classrooms };
    this.listeners.forEach((callback) => callback(snapshot));
  }

  // Action methods
  updateLightStatus(roomId, status) {
    if (this.classrooms[roomId]) {
      this.classrooms[roomId] = {
        ...this.classrooms[roomId],
        lightStatus: status,
        lastUpdated: Date.now()
      };
      this.notifyListeners();
    }
  }

  updateOccupancy(roomId, occupancy) {
    if (this.classrooms[roomId]) {
      const maxCap = this.classrooms[roomId].capacity || 65;
      this.classrooms[roomId] = {
        ...this.classrooms[roomId],
        occupancy: Math.max(0, Math.min(maxCap, Number(occupancy))),
        lastUpdated: Date.now()
      };
      this.notifyListeners();
    }
  }

  addClassroom(newRoom) {
    const id = newRoom.id || `ROOM_${Date.now().toString().slice(-4)}`;
    this.classrooms[id] = {
      id,
      roomName: newRoom.roomName || `Classroom ${id}`,
      building: newRoom.building || "Main Block",
      occupancy: Number(newRoom.occupancy) || 0,
      capacity: Number(newRoom.capacity) || 65,
      lightStatus: newRoom.lightStatus || "OFF",
      lastUpdated: Date.now()
    };
    this.notifyListeners();
    return id;
  }

  deleteClassroom(roomId) {
    if (this.classrooms[roomId]) {
      delete this.classrooms[roomId];
      this.notifyListeners();
    }
  }

  // Generate historical data for charts
  getHistoricalData() {
    const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    return hours.map((hour) => {
      const avgOccupancy = Math.floor(Math.random() * 25) + 10;
      const energyKw = (avgOccupancy * 0.15 + Math.random() * 2).toFixed(2);
      const wastedEnergy = Math.floor(Math.random() * 4);
      return {
        time: hour,
        avgOccupancy,
        energyKw: parseFloat(energyKw),
        wastedEnergyCount: wastedEnergy
      };
    });
  }
}

export const mockDataService = new MockDataService();
