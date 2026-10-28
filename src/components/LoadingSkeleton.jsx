import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Top Metrics Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-white border border-sky-100 p-5 space-y-3 shadow-sm">
            <div className="h-4 w-24 bg-slate-100 rounded"></div>
            <div className="h-8 w-16 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* Classroom Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 rounded-2xl bg-white border border-sky-100 p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="h-6 w-36 bg-slate-200 rounded"></div>
              <div className="h-5 w-20 bg-slate-100 rounded-full"></div>
            </div>
            <div className="h-4 w-48 bg-slate-100 rounded"></div>
            <div className="h-16 w-full bg-slate-100 rounded-xl"></div>
            <div className="flex justify-between items-center pt-4">
              <div className="h-8 w-28 bg-slate-200 rounded-xl"></div>
              <div className="h-4 w-20 bg-slate-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
