import React from 'react';

export const ViewSkeleton: React.FC<{ type?: 'card' | 'list' | 'full' }> = ({ type = 'card' }) => {
  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4 animate-pulse">
      {/* Top Header Placeholder */}
      <div className="h-10 bg-slate-200/70 rounded-2xl w-3/5" />

      {/* Main Banner / Card Skeleton */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-5 space-y-4 shadow-sm">
        <div className="h-6 bg-slate-200/80 rounded-xl w-2/5" />
        <div className="h-12 bg-slate-100 rounded-2xl w-full" />
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="h-16 bg-slate-100 rounded-2xl" />
          <div className="h-16 bg-slate-100 rounded-2xl" />
        </div>
      </div>

      {type === 'list' && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-white border border-slate-200/70 p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200" />
                <div className="space-y-1.5">
                  <div className="h-4 w-28 bg-slate-200 rounded" />
                  <div className="h-3 w-16 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="h-6 w-14 bg-slate-200 rounded-lg" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
