import React from 'react';
import { 
  Users, 
  Lightbulb, 
  Clock, 
  AlertTriangle, 
  Building2, 
  Plus, 
  Minus,
  CheckCircle2
} from 'lucide-react';

export default function ClassroomCard({ 
  room, 
  onToggleLight, 
  onChangeOccupancy 
}) {
  const capacity = room.capacity || 40;
  const occupancy = room.occupancy ?? 0;
  const occupancyPercent = Math.min(100, Math.round((occupancy / capacity) * 100));
  const isLightOn = room.lightStatus === "ON";
  const isWastingEnergy = occupancy === 0 && isLightOn;

  // Determine occupancy badge color
  let badgeStyle = "badge-vacant";
  let badgeText = "Vacant";

  if (occupancy === 0) {
    badgeStyle = "badge-vacant";
    badgeText = "Vacant";
  } else if (occupancyPercent < 40) {
    badgeStyle = "badge-vacant";
    badgeText = `Low (${occupancyPercent}%)`;
  } else if (occupancyPercent <= 80) {
    badgeStyle = "badge-moderate";
    badgeText = `Moderate (${occupancyPercent}%)`;
  } else {
    badgeStyle = "badge-high";
    badgeText = `High (${occupancyPercent}%)`;
  }

  // Format last updated timestamp
  const formatTime = (ts) => {
    if (!ts) return "Just now";
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className={`glass-card rounded-2xl p-5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between border-sky-100 shadow-sm hover:shadow-md ${
      isWastingEnergy ? 'ring-2 ring-rose-300 shadow-md shadow-rose-100' : ''
    }`}>
      
      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold text-slate-900 font-outfit tracking-wide">{room.roomName || room.id}</h3>
            </div>
            <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{room.building || "Main Campus"}</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-slate-500">ID: {room.id}</span>
            </p>
          </div>

          {/* Occupancy Status Badge */}
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border shadow-sm ${badgeStyle}`}>
            {badgeText}
          </span>
        </div>

        {/* Wasted Energy Alert Banner */}
        {isWastingEnergy && (
          <div className="mb-4 p-2.5 rounded-xl badge-waste flex items-center space-x-2 text-xs font-semibold animate-pulse-slow">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>Energy Wasted! Room is empty but lights are ON.</span>
          </div>
        )}

        {/* Occupancy Progress & Controls */}
        <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-bold text-slate-700">Occupancy</span>
            </div>
            
            {/* Counts & Interactive Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onChangeOccupancy(room.id, Math.max(0, occupancy - 1))}
                className="w-6 h-6 rounded bg-white hover:bg-sky-50 text-slate-700 border border-slate-200 flex items-center justify-center transition-colors shadow-sm"
                title="Decrease occupancy"
              >
                <Minus className="w-3 h-3" />
              </button>
              
              <span className="text-sm font-bold font-mono text-slate-900 px-1">
                {occupancy} <span className="text-slate-400 font-normal">/ {capacity}</span>
              </span>

              <button
                onClick={() => onChangeOccupancy(room.id, Math.min(capacity, occupancy + 1))}
                className="w-6 h-6 rounded bg-white hover:bg-sky-50 text-slate-700 border border-slate-200 flex items-center justify-center transition-colors shadow-sm"
                title="Increase occupancy"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-300/50">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                occupancyPercent > 80 
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
                  : occupancyPercent > 40 
                  ? 'bg-gradient-to-r from-sky-400 to-amber-400' 
                  : 'bg-gradient-to-r from-emerald-400 to-sky-400'
              }`}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Controls: Light Toggle & Timestamp */}
      <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
        
        {/* Light status badge & button */}
        <button
          onClick={() => onToggleLight(room.id, room.lightStatus)}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all duration-200 ${
            isLightOn
              ? 'bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100 shadow-sm'
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Lightbulb className={`w-4 h-4 ${isLightOn ? 'text-sky-500 light-glow' : 'text-slate-400'}`} />
          <span>Light: {isLightOn ? 'ON' : 'OFF'}</span>
        </button>

        {/* Timestamp */}
        <div className="text-right">
          <span className="text-[10px] text-slate-500 flex items-center justify-end space-x-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Updated:</span>
          </span>
          <span className="text-xs font-mono text-slate-600 font-semibold">{formatTime(room.lastUpdated)}</span>
        </div>

      </div>

    </div>
  );
}
