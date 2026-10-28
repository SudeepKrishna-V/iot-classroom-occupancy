import React, { useState, useMemo } from 'react';
import ClassroomCard from './ClassroomCard';
import { 
  Building2, 
  Users, 
  DoorOpen, 
  ZapOff, 
  Search, 
  Filter, 
  AlertCircle, 
  Database,
  PlusCircle
} from 'lucide-react';

export default function Dashboard({ 
  classrooms, 
  toggleLight, 
  changeOccupancy, 
  error, 
  useMock, 
  setUseMock,
  isFirebaseConfigured,
  onNavigateToManagement
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL'); // ALL, VACANT, MODERATE, HIGH, WASTED

  // Calculate high-level metric summaries
  const metrics = useMemo(() => {
    let totalRooms = classrooms.length;
    let totalOccupants = 0;
    let vacantCount = 0;
    let energyWastedCount = 0;

    classrooms.forEach((room) => {
      const occ = room.occupancy || 0;
      totalOccupants += occ;
      if (occ === 0) {
        vacantCount++;
        if (room.lightStatus === "ON") {
          energyWastedCount++;
        }
      }
    });

    return { totalRooms, totalOccupants, vacantCount, energyWastedCount };
  }, [classrooms]);

  // Filter classrooms based on search and category
  const filteredClassrooms = useMemo(() => {
    return classrooms.filter((room) => {
      const matchSearch = 
        (room.roomName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (room.building || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (room.id || '').toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      const occ = room.occupancy || 0;
      const capacity = room.capacity || 40;
      const percent = (occ / capacity) * 100;

      if (filterCategory === 'VACANT') return occ === 0;
      if (filterCategory === 'MODERATE') return percent > 0 && percent <= 80;
      if (filterCategory === 'HIGH') return percent > 80;
      if (filterCategory === 'WASTED') return occ === 0 && room.lightStatus === "ON";

      return true;
    });
  }, [classrooms, searchTerm, filterCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Firebase Error Warning Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start justify-between text-rose-900">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-sm font-outfit">Database Connection Notice</h4>
              <p className="text-xs text-rose-700">{error}</p>
            </div>
          </div>
          <button 
            onClick={() => setUseMock(true)}
            className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-xs font-semibold text-rose-800 transition-colors border border-rose-300"
          >
            Switch to Mock Data
          </button>
        </div>
      )}

      {/* Mock Data Information Banner */}
      {useMock && !error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3 text-amber-900 text-xs">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-amber-600" />
            <span>
              <strong>Mock Data Mode Active:</strong> Simulating live telemetry updates from ESP32 sensors every few seconds.
            </span>
          </div>
          {!isFirebaseConfigured && (
            <span className="text-amber-800">
              (Add your credentials to <code className="bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">.env</code> to connect live Firebase DB)
            </span>
          )}
        </div>
      )}

      {/* Metric Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Classrooms */}
        <div className="glass-card rounded-2xl p-5 border-sky-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Classrooms</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1 font-outfit">{metrics.totalRooms}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Monitored via IoT nodes</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Total Occupants */}
        <div className="glass-card rounded-2xl p-5 border-sky-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Campus Occupancy</p>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1 font-outfit">{metrics.totalOccupants}</h3>
            <p className="text-[11px] text-emerald-600 mt-1">People inside rooms</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Vacant Rooms */}
        <div className="glass-card rounded-2xl p-5 border-sky-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vacant Classrooms</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1 font-outfit">{metrics.vacantCount}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Ready for study/classes</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center">
            <DoorOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Energy Wasted Alerts */}
        <div className={`glass-card rounded-2xl p-5 border-sky-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow ${
          metrics.energyWastedCount > 0 ? 'bg-rose-50/60 border-rose-200' : ''
        }`}>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Energy Waste Alerts</p>
            <h3 className={`text-3xl font-extrabold mt-1 font-outfit ${
              metrics.energyWastedCount > 0 ? 'text-rose-600' : 'text-slate-600'
            }`}>
              {metrics.energyWastedCount}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Vacant rooms with lights ON</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            metrics.energyWastedCount > 0 
              ? 'bg-rose-100 text-rose-600 border border-rose-300 animate-pulse' 
              : 'bg-slate-100 text-slate-400 border border-slate-200'
          }`}>
            <ZapOff className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Filter & Search Bar Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 glass-card p-4 rounded-2xl border-sky-100 shadow-sm">
        
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by room name, ID, or building..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 text-sm rounded-xl pl-10 pr-4 py-2.5 border border-slate-200 focus:outline-none focus:border-sky-400 focus:bg-white transition-colors"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'VACANT', label: 'Vacant' },
            { id: 'MODERATE', label: 'Moderate' },
            { id: 'HIGH', label: 'High' },
            { id: 'WASTED', label: 'Energy Waste' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterCategory === tab.id
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-200'
                  : 'bg-slate-100 text-slate-600 hover:text-sky-700 hover:bg-sky-50 border border-slate-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* Classroom Cards Grid */}
      {filteredClassrooms.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center space-y-4 border-sky-100">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 font-outfit">No Classrooms Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            No classrooms match your search term or selected status filter.
          </p>
          <button
            onClick={onNavigateToManagement}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Classroom</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClassrooms.map((room) => (
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
