import React, { useMemo } from 'react';
import ClassroomCard from './ClassroomCard';
import { 
  DoorOpen, 
  AlertTriangle, 
  ZapOff, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function VacantRoomsPage({ 
  classrooms, 
  toggleLight, 
  changeOccupancy 
}) {
  // Filter for vacant rooms only (occupancy === 0)
  const vacantRooms = useMemo(() => {
    return classrooms.filter((room) => (room.occupancy ?? 0) === 0);
  }, [classrooms]);

  // Rooms wasting energy (vacant & lights ON)
  const wastedEnergyRooms = useMemo(() => {
    return vacantRooms.filter((room) => room.lightStatus === "ON");
  }, [vacantRooms]);

  // Bulk action to turn off lights in all vacant rooms
  const handleTurnOffAllWastedLights = () => {
    wastedEnergyRooms.forEach((room) => {
      toggleLight(room.id, "ON"); // Toggles from ON -> OFF
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border-sky-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-2">
            <DoorOpen className="w-4 h-4" />
            <span>Available Study Spaces</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-outfit">Vacant Classrooms Directory</h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            Quickly identify empty classrooms available for study groups, makeup lectures, or maintenance, and audit background energy consumption.
          </p>
        </div>

        {/* Quick Action: Bulk Turn Off Wasted Lights */}
        {wastedEnergyRooms.length > 0 ? (
          <button
            onClick={handleTurnOffAllWastedLights}
            className="w-full md:w-auto px-5 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-md shadow-sky-200 transition-colors"
          >
            <ZapOff className="w-5 h-5 text-white" />
            <span>Turn Off All Wasted Lights ({wastedEnergyRooms.length})</span>
          </button>
        ) : (
          <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Zero Wasted Energy Detected!</span>
          </div>
        )}
      </div>

      {/* Energy Audit Alert Box if any wasted energy */}
      {wastedEnergyRooms.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-900">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 animate-bounce" />
            <div>
              <h4 className="font-bold text-sm font-outfit">Energy Audit Alert</h4>
              <p className="text-xs text-rose-700">
                {wastedEnergyRooms.length} vacant classroom(s) currently have lights powered ON without occupants.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Vacant Rooms Grid */}
      {vacantRooms.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center space-y-4 border-sky-100">
          <Sparkles className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-xl font-bold text-slate-800 font-outfit">All Classrooms Are Occupied</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Every classroom currently has students or faculty inside. Check back later when sessions wrap up.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vacantRooms.map((room) => (
            <ClassroomCard
              key={room.id}
              room={room}
              onToggleLight={toggleLight}
              onChangeOccupancy={changeOccupancy}
            />
          ))}
        </div>
      )}

    </div>
  );
}
