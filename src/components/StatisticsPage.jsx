import React, { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';
import { mockDataService } from '../services/mockDataService';
import { 
  TrendingUp, 
  Zap, 
  Clock, 
  Activity, 
  ShieldCheck, 
  Award 
} from 'lucide-react';

export default function StatisticsPage({ classrooms }) {
  // Generate analytics dataset
  const chartData = useMemo(() => {
    return mockDataService.getHistoricalData();
  }, []);

  // Compute metrics
  const totalOccupancy = classrooms.reduce((acc, r) => acc + (r.occupancy || 0), 0);
  const totalCapacity = classrooms.reduce((acc, r) => acc + (r.capacity || 40), 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;
  
  const wastedCount = classrooms.filter(r => (r.occupancy || 0) === 0 && r.lightStatus === "ON").length;
  const efficiencyScore = Math.max(60, 100 - (wastedCount * 8));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-sky-600 text-xs font-bold uppercase tracking-wider mb-2">
          <Activity className="w-4 h-4" />
          <span>Telemetry & Sustainability Analytics</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-outfit">Occupancy & Energy Analytics</h1>
        <p className="text-sm text-slate-600 mt-1">
          Historical sensor trends, energy consumption patterns, and eco-efficiency scores aggregated from classroom nodes.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Campus Occupancy Rate */}
        <div className="glass-card rounded-2xl p-5 border-sky-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Occupancy Rate</span>
            <TrendingUp className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-outfit">{occupancyRate}%</div>
          <p className="text-xs text-slate-500 mt-1">{totalOccupancy} of {totalCapacity} seats filled</p>
        </div>

        {/* Energy Efficiency Score */}
        <div className="glass-card rounded-2xl p-5 border-sky-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Eco Efficiency Score</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 font-outfit">{efficiencyScore}/100</div>
          <p className="text-xs text-emerald-600 mt-1">Based on light automated control</p>
        </div>

        {/* Peak Hours */}
        <div className="glass-card rounded-2xl p-5 border-sky-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Peak Occupancy Time</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 font-outfit">11:00 AM</div>
          <p className="text-xs text-slate-500 mt-1">Highest crowd density</p>
        </div>

        {/* Est Daily Energy Consumption */}
        <div className="glass-card rounded-2xl p-5 border-sky-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Est. Energy Usage</span>
            <Zap className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-3xl font-extrabold text-sky-600 font-outfit">18.4 kWh</div>
          <p className="text-xs text-slate-500 mt-1">Today's power consumption</p>
        </div>

      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Hourly Occupancy Area Chart */}
        <div className="glass-card rounded-3xl p-6 border-sky-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-outfit">Hourly Occupancy Trend</h3>
              <p className="text-xs text-slate-500">Average student count throughout peak hours</p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
              Live Sensor Feed
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#bae6fd', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  labelStyle={{ color: '#0284c7', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="avgOccupancy" 
                  name="Avg Occupants" 
                  stroke="#0284c7" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorOccupancy)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Energy Consumption Bar Chart */}
        <div className="glass-card rounded-3xl p-6 border-sky-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-outfit">Energy & Waste Breakdown</h3>
              <p className="text-xs text-slate-500">Power consumption (kWh) vs Energy Waste Incidents</p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              ESP32 Data
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#bae6fd', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="energyKw" name="Energy (kWh)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="wastedEnergyCount" name="Waste Events" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
