/**
 * GuideBuddy Advanced AI Knowledge Engine & NLU Service
 * Smart Classroom Assistant for EcoSense IoT Dashboard.
 */

// Normalize text for flexible matching
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts floor level from room ID or building/room name.
 * Returns '1st', '2nd', '3rd', 'AIDS Block', or null if undetermined.
 */
function detectFloor(room) {
  const id = (room.id || '').toUpperCase();
  const name = (room.roomName || '').toUpperCase();

  if (id.startsWith('FF') || name.includes('FIRST FLOOR') || name.includes('FF')) {
    return '1st';
  }
  if (id.startsWith('SF') || name.includes('SECOND FLOOR') || name.includes('SF')) {
    return '2nd';
  }
  if (id.startsWith('TF') || name.includes('THIRD FLOOR') || name.includes('TF')) {
    return '3rd';
  }
  if (id.startsWith('AI') || (room.building && room.building.toUpperCase().includes('AIDS'))) {
    return 'AIDS Block';
  }
  return null;
}

/**
 * Parses floor query from text.
 */
function parseFloorQuery(text) {
  const norm = normalize(text);
  if (norm.includes('first floor') || norm.includes('1st floor') || norm.includes('ff') || norm.includes('ground floor') || norm.includes('level 1')) {
    return '1st';
  }
  if (norm.includes('second floor') || norm.includes('2nd floor') || norm.includes('sf') || norm.includes('level 2')) {
    return '2nd';
  }
  if (norm.includes('third floor') || norm.includes('3rd floor') || norm.includes('tf') || norm.includes('level 3')) {
    return '3rd';
  }
  if (norm.includes('aids block') || norm.includes('aids building') || norm.includes('aids floor')) {
    return 'AIDS Block';
  }
  return null;
}

/**
 * Parses building query from text.
 */
function parseBuildingQuery(text) {
  const norm = normalize(text);
  if (norm.includes('aids block') || norm.includes('aids building') || norm.includes('aids')) {
    return 'AIDS Block';
  }
  if (norm.includes('main block') || norm.includes('main building') || norm.includes('main block')) {
    return 'Main Block';
  }
  return null;
}

/**
 * Parses department/branch filter from text (ECE, CSE, AIML, IT, LAB, AUDITORIUM).
 */
function parseDepartmentQuery(text) {
  const norm = normalize(text);
  if (norm.includes('ece')) return 'ECE';
  if (norm.includes('cse')) return 'CSE';
  if (norm.includes('aiml') || norm.includes('ai ml') || norm.includes('artificial intelligence')) return 'AIML';
  if (norm.includes('it') || norm.includes('information technology')) return 'IT';
  if (norm.includes('lab') || norm.includes('laboratory')) return 'LAB';
  if (norm.includes('auditorium') || norm.includes('hall')) return 'HALL';
  return null;
}

/**
 * Finds mentioned classroom by ID, room name, or pronoun context.
 */
function findMentionedRoom(query, classrooms, lastRoomId = null) {
  const raw = query.trim();
  const norm = normalize(raw);

  // Direct regex matches for classroom IDs (e.g., FF05, FF-05, FF 05, SF07, TF13, AI101, AI 205)
  const idRegex = /\b(FF|SF|TF|AI)\s*[-_]?\s*(\d+)\b/i;
  const match = raw.match(idRegex);
  if (match) {
    const formattedId = `${match[1].toUpperCase()}${match[2]}`;
    const found = classrooms.find(r => r.id.toUpperCase() === formattedId);
    if (found) return found;
  }

  // Exact ID check
  for (const room of classrooms) {
    if (norm.includes(room.id.toLowerCase())) {
      return room;
    }
  }

  // Room Name search (e.g. "I-ECE-A", "Networking Lab", "Vista Hall", "Auditorium", "Colab Space")
  for (const room of classrooms) {
    if (room.roomName) {
      const roomNorm = normalize(room.roomName);
      if (norm.includes(roomNorm) || roomNorm.includes(norm)) {
        return room;
      }
    }
  }

  // Pronoun references ("that room", "this room", "it", "that", "same room")
  const pronouns = ['that', 'it', 'this room', 'the room', 'same room', 'that classroom', 'this classroom'];
  if (pronouns.some(p => norm.includes(p)) && lastRoomId) {
    return classrooms.find(r => r.id === lastRoomId) || null;
  }

  return null;
}

/**
 * Main GuideBuddy Response Generator
 */
export function generateGuideBuddyResponse(userQuery, classrooms = [], contextState = {}) {
  const rawQuery = userQuery.trim();
  const qNorm = normalize(rawQuery);
  const { lastRoomId } = contextState;

  if (!rawQuery) {
    return { text: "Please ask me a question about classroom occupancy, vacancies, sensors, or dashboard features!" };
  }

  // ----------------------------------------------------
  // 1. GREETINGS & SMALL TALK
  // ----------------------------------------------------
  if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|hola|yo)\b/i.test(rawQuery)) {
    return {
      text: "Hi! I'm **GuideBuddy** 👋\nI can help you find classrooms, check live occupancy, filter by floors, and explain the Smart Classroom IoT dashboard.",
    };
  }

  if (qNorm.includes("who are you") || qNorm.includes("what can you do") || qNorm.includes("your name") || qNorm.includes("tell me about yourself")) {
    return {
      text: "I'm **GuideBuddy**, your Smart Classroom Assistant! 🏫\n\nI can help you:\n• Find vacant, occupied, or full classrooms dynamically\n• Filter rooms by floor (1st, 2nd, 3rd, AIDS Block) or branch (ECE, CSE, AIML, IT)\n• Check room occupancy, capacity, light status, & AC status\n• Audit wasted energy (lights ON in empty rooms)\n• Explain PIR motion sensors & entry/exit detection logic\n• Guide you on Firebase RTDB & dashboard controls",
    };
  }

  if (qNorm.includes("thank you") || qNorm.includes("thanks") || qNorm.includes("great job") || qNorm.includes("awesome") || qNorm.includes("good bot")) {
    return {
      text: "You're very welcome! 😊 Let me know if you need anything else regarding classrooms or sensor metrics!",
    };
  }

  if (qNorm.includes("bye") || qNorm.includes("goodbye") || qNorm.includes("see you")) {
    return {
      text: "Goodbye! 👋 Have a great day managing smart classrooms!",
    };
  }

  // ----------------------------------------------------
  // 2. SPECIFIC CLASSROOM QUERIES (FF05, SF07, etc.)
  // ----------------------------------------------------
  const targetRoom = findMentionedRoom(userQuery, classrooms, lastRoomId);

  // Check if user is asking about a specific room
  const isRoomQuery = targetRoom && (
    qNorm.includes("occupancy") || 
    qNorm.includes("capacity") || 
    qNorm.includes("vacant") || 
    qNorm.includes("occupied") || 
    qNorm.includes("full") || 
    qNorm.includes("status") || 
    qNorm.includes("students") || 
    qNorm.includes("people") ||
    qNorm.includes("light") ||
    qNorm.includes("ac") ||
    qNorm.includes("is that") ||
    qNorm.includes("how about") ||
    qNorm.includes("what about") ||
    qNorm.includes(targetRoom.id.toLowerCase())
  );

  if (isRoomQuery && targetRoom) {
    const occ = targetRoom.occupancy ?? 0;
    const cap = targetRoom.capacity ?? 65;
    const isVacant = occ === 0;
    const isFull = occ >= cap;
    const light = targetRoom.lightStatus || 'OFF';
    const ac = targetRoom.acStatus || 'OFF';

    // "Is FF05 vacant?" / "Is it empty?"
    if (qNorm.includes("vacant") || qNorm.includes("empty") || qNorm.includes("free")) {
      if (isVacant) {
        return {
          text: `**${targetRoom.id} – ${targetRoom.roomName}** is currently **VACANT** (0 of ${cap} students). Light: **${light}**, AC: **${ac}**.`,
          referencedRoomId: targetRoom.id
        };
      } else {
        return {
          text: `**${targetRoom.id} – ${targetRoom.roomName}** is currently **OCCUPIED** with **${occ} of ${cap}** students.`,
          referencedRoomId: targetRoom.id
        };
      }
    }

    // "Is FF05 full?" / "Is that full?"
    if (qNorm.includes("full") || qNorm.includes("max")) {
      if (isFull) {
        return {
          text: `Yes! **${targetRoom.id} – ${targetRoom.roomName}** is currently at **FULL capacity** (${occ}/${cap} students).`,
          referencedRoomId: targetRoom.id
        };
      } else {
        return {
          text: `No, **${targetRoom.id} – ${targetRoom.roomName}** is not full. It currently has **${occ} of ${cap}** students.`,
          referencedRoomId: targetRoom.id
        };
      }
    }

    // "Is light on in FF05?" / "Light status of FF05"
    if (qNorm.includes("light") || qNorm.includes("lamp") || qNorm.includes("power")) {
      const isWasting = isVacant && light === "ON";
      return {
        text: `**${targetRoom.id} (${targetRoom.roomName})** Light Status: **${light}**${isWasting ? ' ⚠️ (Wasted Energy Alert: Room is vacant but light is ON!)' : ''}.`,
        referencedRoomId: targetRoom.id
      };
    }

    // Direct status overview
    let statusLabel = isVacant ? 'VACANT 🟢' : isFull ? 'FULL 🔴' : 'OCCUPIED 🟡';
    return {
      text: `**${targetRoom.id} – ${targetRoom.roomName}** (${targetRoom.building || 'Main Block'}):\n` +
            `• Status: **${statusLabel}**\n` +
            `• Occupancy: **${occ} / ${cap}** students\n` +
            `• Light Status: **${light}**\n` +
            `• AC Status: **${ac}**`,
      referencedRoomId: targetRoom.id
    };
  }

  // ----------------------------------------------------
  // 3. ENERGY & LIGHT CONTROL QUERIES
  // ----------------------------------------------------
  if (qNorm.includes("waste") || qNorm.includes("wasting") || qNorm.includes("unnecessary light") || qNorm.includes("energy alert")) {
    const wastedRooms = classrooms.filter(r => (r.occupancy ?? 0) === 0 && r.lightStatus === "ON");
    if (wastedRooms.length === 0) {
      return {
        text: "Great news! 🌱 No energy waste detected. All vacant classrooms have their lights turned OFF.",
      };
    }
    const list = wastedRooms.map(r => `• **${r.id}** (${r.roomName})`).join('\n');
    return {
      text: `⚠️ **Energy Waste Alert**: The following **${wastedRooms.length}** vacant classroom(s) currently have lights **ON**:\n${list}\n\nYou can toggle these lights OFF from the Vacant Rooms tab.`,
    };
  }

  if (qNorm.includes("lights on") || qNorm.includes("light on")) {
    const lightsOn = classrooms.filter(r => r.lightStatus === "ON");
    const list = lightsOn.map(r => `• **${r.id}** (${r.roomName}): ${r.occupancy ?? 0} occupants`).join('\n');
    return {
      text: `Lights are currently **ON** in **${lightsOn.length}** classroom(s):\n${list}`,
    };
  }

  if (qNorm.includes("ac on") || qNorm.includes("ac status") || qNorm.includes("air conditioner")) {
    const acOn = classrooms.filter(r => r.acStatus === "ON");
    const list = acOn.map(r => `• **${r.id}** (${r.roomName}): ${r.occupancy ?? 0} occupants`).join('\n');
    return {
      text: `Air Conditioning (AC) is currently **ON** in **${acOn.length}** classroom(s):\n${list}`,
    };
  }

  // ----------------------------------------------------
  // 4. COMPARISON & EXTREME QUERIES (Most/Least Occupied)
  // ----------------------------------------------------
  if (qNorm.includes("most crowded") || qNorm.includes("highest occupancy") || qNorm.includes("busiest room") || qNorm.includes("most students")) {
    if (classrooms.length === 0) return { text: "No classroom data available." };
    const sorted = [...classrooms].sort((a, b) => (b.occupancy ?? 0) - (a.occupancy ?? 0));
    const top = sorted[0];
    return {
      text: `🔥 The most occupied classroom right now is **${top.id} (${top.roomName})** with **${top.occupancy} of ${top.capacity}** students present.`,
      referencedRoomId: top.id
    };
  }

  if (qNorm.includes("least occupied") || qNorm.includes("fewest students") || qNorm.includes("quietest room")) {
    if (classrooms.length === 0) return { text: "No classroom data available." };
    const sorted = [...classrooms].sort((a, b) => (a.occupancy ?? 0) - (b.occupancy ?? 0));
    const lowest = sorted[0];
    return {
      text: `🍃 The classroom with the fewest students right now is **${lowest.id} (${lowest.roomName})** with **${lowest.occupancy} of ${lowest.capacity}** students.`,
      referencedRoomId: lowest.id
    };
  }

  // ----------------------------------------------------
  // 5. DEPARTMENT / BRANCH FILTER (ECE, CSE, AIML, IT)
  // ----------------------------------------------------
  const dept = parseDepartmentQuery(rawQuery);
  if (dept) {
    const deptRooms = classrooms.filter(r => {
      const name = (r.roomName || '').toUpperCase();
      const id = (r.id || '').toUpperCase();
      if (dept === 'ECE') return name.includes('ECE') || id.includes('ECE');
      if (dept === 'CSE') return name.includes('CSE') || id.includes('CSE');
      if (dept === 'AIML') return name.includes('AIML') || name.includes('VISTA') || name.includes('COLAB') || id.includes('AI');
      if (dept === 'IT') return name.includes('IT') || id.includes('IT');
      if (dept === 'LAB') return name.includes('LAB');
      if (dept === 'HALL') return name.includes('HALL') || name.includes('AUDITORIUM');
      return false;
    });

    if (deptRooms.length > 0) {
      if (qNorm.includes("vacant") || qNorm.includes("free") || qNorm.includes("empty")) {
        const vRooms = deptRooms.filter(r => (r.occupancy ?? 0) === 0);
        if (vRooms.length === 0) {
          return { text: `All **${dept}** classrooms are currently occupied.` };
        }
        const list = vRooms.map(r => `• **${r.id}** (${r.roomName})`).join('\n');
        return { text: `Vacant **${dept}** classroom(s):\n${list}` };
      }

      const list = deptRooms.map(r => {
        const occ = r.occupancy ?? 0;
        const status = occ === 0 ? 'VACANT' : `${occ}/${r.capacity} students`;
        return `• **${r.id}** (${r.roomName}): ${status}`;
      }).join('\n');

      return { text: `Here are the **${dept}** classrooms:\n${list}` };
    }
  }

  // ----------------------------------------------------
  // 6. FLOOR & BUILDING FILTERS
  // ----------------------------------------------------
  const reqFloor = parseFloorQuery(rawQuery);
  const reqBuilding = parseBuildingQuery(rawQuery);

  if (reqFloor) {
    const floorRooms = classrooms.filter(r => detectFloor(r) === reqFloor);

    if (qNorm.includes("vacant") || qNorm.includes("free") || qNorm.includes("empty")) {
      const vRooms = floorRooms.filter(r => (r.occupancy ?? 0) === 0);
      if (vRooms.length === 0) {
        return { text: `Currently, there are no vacant classrooms on the **${reqFloor} floor**. All ${floorRooms.length} rooms are occupied.` };
      }
      const list = vRooms.map(r => `• **${r.id}** (${r.roomName})`).join('\n');
      return { text: `I found these currently vacant classrooms on the **${reqFloor} floor**:\n${list}` };
    }

    if (floorRooms.length > 0) {
      const list = floorRooms.map(r => {
        const occ = r.occupancy ?? 0;
        const status = occ === 0 ? 'VACANT' : `${occ}/${r.capacity} students`;
        return `• **${r.id}** (${r.roomName}): ${status}`;
      }).join('\n');
      return { text: `Classroom status for the **${reqFloor} floor**:\n${list}` };
    }
  }

  if (reqBuilding) {
    const bldRooms = classrooms.filter(r => (r.building || '').toLowerCase().includes(reqBuilding.toLowerCase()));
    if (bldRooms.length > 0) {
      const list = bldRooms.map(r => `• **${r.id}** (${r.roomName}): ${r.occupancy ?? 0}/${r.capacity} students`).join('\n');
      return { text: `Classrooms in **${reqBuilding}**:\n${list}` };
    }
  }

  if (qNorm.includes("floor") && !reqFloor) {
    return {
      text: "Floor information is available for 1st Floor (FF), 2nd Floor (SF), 3rd Floor (TF), and AIDS Block. Try asking: *Show vacant rooms on the 1st floor*",
    };
  }

  // ----------------------------------------------------
  // 7. VACANT / OCCUPIED / FULL ROOM GENERAL SEARCH
  // ----------------------------------------------------
  if (qNorm.includes("vacant") || qNorm.includes("available") || qNorm.includes("free room") || qNorm.includes("empty")) {
    const vacantRooms = classrooms.filter(r => (r.occupancy ?? 0) === 0);
    if (vacantRooms.length === 0) {
      return { text: "Currently, all classrooms are occupied! No vacant rooms available right now." };
    }
    const list = vacantRooms.map(r => `• **${r.id}** (${r.roomName})`).join('\n');
    return {
      text: `I found these currently vacant classrooms:\n${list}\n\nYou can open the classroom cards or Vacant Rooms tab for energy options.`,
    };
  }

  if (qNorm.includes("occupied") || qNorm.includes("in use") || qNorm.includes("busy")) {
    const occupiedRooms = classrooms.filter(r => (r.occupancy ?? 0) > 0);
    if (occupiedRooms.length === 0) {
      return { text: "All classrooms are currently vacant." };
    }
    const list = occupiedRooms.map(r => `• **${r.id}** (${r.roomName}): ${r.occupancy}/${r.capacity} students`).join('\n');
    return { text: `These classrooms are currently occupied:\n${list}` };
  }

  if (qNorm.includes("full") || qNorm.includes("max capacity") || qNorm.includes("crowded")) {
    const fullRooms = classrooms.filter(r => (r.occupancy ?? 0) >= (r.capacity ?? 65));
    if (fullRooms.length === 0) {
      return { text: "None of the classrooms are currently at full capacity." };
    }
    const list = fullRooms.map(r => `• **${r.id}** (${r.roomName}): ${r.occupancy}/${r.capacity} (FULL)`).join('\n');
    return { text: `The following classroom(s) are full:\n${list}` };
  }

  // ----------------------------------------------------
  // 8. QUANTITY & STATISTICS QUERIES
  // ----------------------------------------------------
  if (qNorm.includes("how many classrooms") || qNorm.includes("how many rooms") || qNorm.includes("total rooms") || qNorm.includes("number of rooms")) {
    const total = classrooms.length;
    const vacantCount = classrooms.filter(r => (r.occupancy ?? 0) === 0).length;
    const occupiedCount = total - vacantCount;
    return {
      text: `Currently, **${occupiedCount}** out of **${total}** classrooms are occupied (${vacantCount} vacant).`,
    };
  }

  if (qNorm.includes("how many students") || qNorm.includes("total students") || qNorm.includes("total occupancy")) {
    const totalStudents = classrooms.reduce((acc, r) => acc + (r.occupancy ?? 0), 0);
    const totalCapacity = classrooms.reduce((acc, r) => acc + (r.capacity ?? 65), 0);
    const percentage = Math.round((totalStudents / (totalCapacity || 1)) * 100);
    return {
      text: `There are currently **${totalStudents}** students inside all monitored classrooms combined (Overall Occupancy Rate: **${percentage}%**).`,
    };
  }

  // ----------------------------------------------------
  // 9. IOT & PIR SENSOR TECHNICAL EXPLANATIONS
  // ----------------------------------------------------
  if (qNorm.includes("pir") || qNorm.includes("pir1") || qNorm.includes("pir2") || qNorm.includes("sensor")) {
    if (qNorm.includes("pir1 -> pir2") || qNorm.includes("pir1->pir2") || qNorm.includes("entry")) {
      return {
        text: "**PIR1 -> PIR2** means a person is entering the classroom. PIR sensor 1 triggers first, followed by PIR sensor 2 at the doorway, indicating inward movement and incrementing the occupancy count by +1.",
      };
    }
    if (qNorm.includes("pir2 -> pir1") || qNorm.includes("pir2->pir1") || qNorm.includes("exit")) {
      return {
        text: "**PIR2 -> PIR1** means a person is exiting the classroom. PIR sensor 2 triggers first, followed by PIR sensor 1 at the doorway, indicating outward movement and decrementing the occupancy count by -1.",
      };
    }
    return {
      text: "The **PIR (Passive Infrared) Sensor** detects human motion at classroom entryways. By placing two PIR sensors in sequence (PIR1 and PIR2), the system detects movement direction:\n• **PIR1 -> PIR2**: Person entering (+1 count)\n• **PIR2 -> PIR1**: Person exiting (-1 count)",
    };
  }

  if (qNorm.includes("how does entry") || qNorm.includes("exit detection") || qNorm.includes("detect classroom vacancy") || qNorm.includes("detect vacancy")) {
    return {
      text: "This project detects classroom vacancy using dual PIR motion sensors installed at classroom doors:\n1. **Directional Entry/Exit**: PIR1 -> PIR2 counts entering students (+1), while PIR2 -> PIR1 counts exiting students (-1).\n2. **Vacancy Trigger**: When the occupancy reaches **0**, the system automatically flags the classroom as **VACANT** and checks if lights/AC are unnecessarily left ON.",
    };
  }

  if (qNorm.includes("esp32") || qNorm.includes("hardware") || qNorm.includes("microcontroller")) {
    return {
      text: "The **ESP32** is a low-power 32-bit dual-core microcontroller with built-in Wi-Fi & Bluetooth. In this system, ESP32 boards read dual PIR sensors at classroom doorways and publish real-time telemetry to Firebase RTDB.",
    };
  }

  // ----------------------------------------------------
  // 10. FIREBASE & DASHBOARD GUIDANCE
  // ----------------------------------------------------
  if (qNorm.includes("firebase") || qNorm.includes("realtime database") || qNorm.includes("rtdb")) {
    return {
      text: "Firebase Realtime Database connects to the dashboard by listening to real-time database nodes (`/classrooms/{roomId}`). ESP32 microcontrollers upload sensor readings over Wi-Fi directly to Firebase RTDB, and the React frontend updates instantaneously via live subscriptions.",
    };
  }

  if (qNorm.includes("mock") || qNorm.includes("simulation") || qNorm.includes("offline")) {
    return {
      text: "The **Mock Data Simulator** simulates live ESP32 sensor telemetry when Firebase is offline or unconfigured. You can toggle Mock Mode anytime using the toggle switch in the top navigation bar.",
    };
  }

  if (qNorm.includes("help") || qNorm.includes("how does this system work") || qNorm.includes("how to use") || qNorm.includes("dashboard")) {
    return {
      text: "The **Smart Classroom Occupancy & Energy Hub** tracks classroom utilization live:\n• **Dashboard**: Monitors live occupant count, light controls, and energy state.\n• **Vacant Rooms**: Lists empty rooms and flags wasted energy.\n• **Analytics**: Displays occupancy trends over time.\n• **Management**: Allows adding or deleting classrooms.\n• **Mock Mode**: Simulates live ESP32 telemetry when Firebase is offline.",
    };
  }

  // ----------------------------------------------------
  // 11. SMART FALLBACK WITH KEYWORD / SEARCH MATCHING
  // ----------------------------------------------------
  // Search classrooms for any token in user query before generic fallback
  const words = qNorm.split(' ').filter(w => w.length > 2);
  for (const word of words) {
    const matchedRoom = classrooms.find(r => 
      r.id.toLowerCase().includes(word) || 
      (r.roomName && r.roomName.toLowerCase().includes(word)) ||
      (r.building && r.building.toLowerCase().includes(word))
    );

    if (matchedRoom) {
      const occ = matchedRoom.occupancy ?? 0;
      const cap = matchedRoom.capacity ?? 65;
      const isVacant = occ === 0;
      return {
        text: `I found details for **${matchedRoom.id} – ${matchedRoom.roomName}** (${matchedRoom.building || 'Main Block'}):\n` +
              `• Occupancy: **${occ} / ${cap}** students (${isVacant ? 'VACANT 🟢' : 'OCCUPIED 🟡'})\n` +
              `• Light Status: **${matchedRoom.lightStatus || 'OFF'}**`,
        referencedRoomId: matchedRoom.id
      };
    }
  }

  // Universal fallback guidance
  return {
    text: "I'm GuideBuddy, your Smart Classroom Assistant! I can help with:\n" +
          "• *Vacant & occupied classrooms (e.g., 'Find a vacant classroom')*\n" +
          "• *Specific room status (e.g., 'Is FF05 vacant?' or 'What is FF05 occupancy?')*\n" +
          "• *Floor & branch filters (e.g., 'Vacant rooms on 1st floor' or 'Show ECE rooms')*\n" +
          "• *Wasted energy alerts (e.g., 'Which rooms are wasting energy?')*\n" +
          "• *PIR sensor & ESP32 explanations (e.g., 'How does the PIR sensor work?')*",
  };
}

/**
 * Async wrapper for processing messages.
 */
export async function processUserMessage(userQuery, classrooms = [], contextState = {}) {
  await new Promise(resolve => setTimeout(resolve, 250));
  return generateGuideBuddyResponse(userQuery, classrooms, contextState);
}
