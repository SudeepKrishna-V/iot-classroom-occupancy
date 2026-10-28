import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  DoorOpen, 
  BarChart3, 
  Settings, 
  Zap, 
  Wifi, 
  Database, 
  Menu, 
  X,
  AlertTriangle
} from 'lucide-react';

export default function Navigation({ 
  activeTab, 
  setActiveTab, 
  useMock, 
  setUseMock, 
  isFirebaseConfigured,
  wastedEnergyCount 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { 
      id: 'vacant', 
      label: 'Vacant Rooms', 
      icon: DoorOpen, 
      badge: wastedEnergyCount > 0 ? wastedEnergyCount : null,
      badgeColor: 'bg-rose-100 text-rose-700 border-rose-200'
    },
    { id: 'statistics', label: 'Analytics & History', icon: BarChart3 },
    { id: 'management', label: 'Management', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center shadow-md shadow-sky-200">
              <Zap className="w-6 h-6 text-white font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 font-outfit">
                  EcoSense <span className="text-sky-500">IoT</span>
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                  ESP32 Live
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Classroom Occupancy & Energy Hub</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-sky-100/80 text-sky-700 border border-sky-200 shadow-sm'
                      : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Status & Toggle Controls */}
          <div className="hidden lg:flex items-center space-x-4">
            
            {/* Live Data Mode Indicator */}
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              useMock 
                ? 'bg-amber-50 text-amber-800 border-amber-200' 
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              <div className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  useMock ? 'bg-amber-400' : 'bg-emerald-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  useMock ? 'bg-amber-500' : 'bg-emerald-600'
                }`}></span>
              </div>
              <span className="flex items-center space-x-1">
                {useMock ? <Database className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
                <span>{useMock ? 'Mock Sensor Mode' : 'Firebase RTDB Connected'}</span>
              </span>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-600 font-medium pl-2">Mock Data:</span>
              <button
                onClick={() => setUseMock(!useMock)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  useMock ? 'bg-amber-500' : 'bg-slate-300'
                }`}
                title={!isFirebaseConfigured ? "Firebase credentials not set in .env. Operating in Mock Data mode." : "Toggle between live Firebase DB and Mock simulator"}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    useMock ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-sky-600 border border-slate-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-sky-100 px-4 pt-2 pb-4 space-y-3 shadow-lg">
          <div className="space-y-1 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium ${
                    isActive
                      ? 'bg-sky-100 text-sky-700 border border-sky-200'
                      : 'text-slate-700 hover:bg-sky-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-sky-600" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">Mock Sensor Mode</span>
            <button
              onClick={() => setUseMock(!useMock)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                useMock ? 'bg-amber-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  useMock ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
