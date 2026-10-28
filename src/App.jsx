import React, { useState, useMemo } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import VacantRoomsPage from './components/VacantRoomsPage';
import StatisticsPage from './components/StatisticsPage';
import ManagementPage from './components/ManagementPage';
import LoadingSkeleton from './components/LoadingSkeleton';
import ErrorBoundary from './components/ErrorBoundary';
import GuideBuddy from './components/GuideBuddy';
import { useClassrooms } from './hooks/useClassrooms';
import { Zap, Heart, BookOpen, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const {
    classrooms,
    loading,
    error,
    useMock,
    setUseMock,
    isFirebaseConfigured,
    toggleLight,
    changeOccupancy,
    addRoom,
    deleteRoom
  } = useClassrooms();

  // Wasted energy counter for nav badge
  const wastedEnergyCount = useMemo(() => {
    return classrooms.filter(r => (r.occupancy ?? 0) === 0 && r.lightStatus === "ON").length;
  }, [classrooms]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800 selection:bg-sky-200 selection:text-sky-900">

        {/* Main Application Container */}
        <div>
          {/* Top Sticky Navigation */}
          <Navigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            useMock={useMock}
            setUseMock={setUseMock}
            isFirebaseConfigured={isFirebaseConfigured}
            wastedEnergyCount={wastedEnergyCount}
          />

          {/* Body Content */}
          <main className="pb-12">
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <Dashboard
                    classrooms={classrooms}
                    toggleLight={toggleLight}
                    changeOccupancy={changeOccupancy}
                    error={error}
                    useMock={useMock}
                    setUseMock={setUseMock}
                    isFirebaseConfigured={isFirebaseConfigured}
                    onNavigateToManagement={() => setActiveTab('management')}
                  />
                )}

                {activeTab === 'vacant' && (
                  <VacantRoomsPage
                    classrooms={classrooms}
                    toggleLight={toggleLight}
                    changeOccupancy={changeOccupancy}
                  />
                )}

                {activeTab === 'statistics' && (
                  <StatisticsPage classrooms={classrooms} />
                )}

                {activeTab === 'management' && (
                  <ManagementPage
                    classrooms={classrooms}
                    addRoom={addRoom}
                    deleteRoom={deleteRoom}
                    useMock={useMock}
                  />
                )}
              </>
            )}
          </main>
        </div>

        {/* Footer */}
        <footer className="border-t border-sky-100 bg-white py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-sky-500" />
              <span className="font-semibold text-slate-700">EcoSense IoT Dashboard</span>
              <span>•</span>
              <span>ESP32 Telemetry Engine</span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Firebase RTDB Schema v1.0</span>
              </span>
            </div>
          </div>
        </footer>

        {/* GuideBuddy Smart Classroom Assistant */}
        <GuideBuddy classrooms={classrooms} />

      </div>
    </ErrorBoundary>
  );
}
