import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { translations } from './i18n';
import { MoonStar, Sun } from 'lucide-react';
import { ShiftInfo } from './types';

export const ReviewShifts: React.FC = () => {
  const { reviewShifts, language } = useApp();
  const t = translations[language];

  const [countdowns, setCountdowns] = useState<Record<string, { timeString: string; isClose: boolean }>>({});

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const newCountdowns: Record<string, { timeString: string; isClose: boolean }> = {};

      (Object.entries(reviewShifts) as [string, ShiftInfo][]).forEach(([key, shift]) => {
        if (!shift || shift.active === false) {
          newCountdowns[key] = { timeString: '00 : 00 : 00', isClose: false };
          return;
        }

        // 1. Total duration converted to milliseconds from admin configured hours and minutes
        const hours = Number(shift.hours ?? shift.duration_hours ?? 0);
        const minutes = Number(shift.minutes ?? shift.duration_minutes ?? 0);
        const totalDurationMs = (hours * 3600 + minutes * 60) * 1000;
        
        let startTime = Number(shift.startTime ?? shift.timer_started_at ?? shift.start_time ?? shift.startedAt ?? shift.started_at ?? 0);
        if (startTime > 0 && startTime < 10000000000) {
          startTime = startTime * 1000;
        }

        // If admin has started the timer and duration is set
        if (startTime > 0 && totalDurationMs > 0) {
          // 2. Calculate remaining time
          const elapsedMs = now - startTime;
          const remainingMs = totalDurationMs - elapsedMs;

          // 3. If timer is stopped (active == false) or time is up
          if (!shift.active || remainingMs <= 0) {
            newCountdowns[key] = { timeString: '00 : 00 : 00', isClose: false };
          } else {
            // 4. Convert to hours, minutes and seconds
            const totalSecs = Math.floor(remainingMs / 1000);
            const h = Math.floor(totalSecs / 3600);
            const m = Math.floor((totalSecs % 3600) / 60);
            const s = totalSecs % 60;

            const formatted = `${String(h).padStart(2, '0')} : ${String(m).padStart(2, '0')} : ${String(s).padStart(2, '0')}`;
            newCountdowns[key] = {
              timeString: formatted,
              isClose: remainingMs < 3600000, // less than 1 hr
            };
          }
        } else {
          newCountdowns[key] = { timeString: '00 : 00 : 00', isClose: false };
        }
      });

      setCountdowns(newCountdowns);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [reviewShifts]);

  const shiftsArray = (Object.entries(reviewShifts) as [string, ShiftInfo][])
    .filter(([_, s]) => s && s.active !== false)
    .sort((a, b) => (a[1].order || 0) - (b[1].order || 0));

  if (shiftsArray.length === 0) return null;

  const todayDateStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 my-4">
      {shiftsArray.slice(0, 2).map(([key], idx) => {
        const isFirst = idx === 0;
        const countdownInfo = countdowns[key] || { timeString: '00 : 00 : 00', isClose: false };

        return (
          <div
            key={key}
            className="relative bg-white rounded-[24px] border border-slate-100 p-4 pt-6 pb-6 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center overflow-hidden"
          >
            {/* Top Accent Strip */}
            <div
              className={`absolute top-0 left-6 right-6 h-[5px] rounded-b-md ${
                isFirst ? 'bg-[#7064f5]' : 'bg-[#2ac883]'
              }`}
            />

            {/* Icon */}
            <div
              className={`w-[52px] h-[52px] sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white mb-4 shadow-sm ${
                isFirst ? 'bg-[#7064f5]' : 'bg-[#2ac883]'
              }`}
            >
              {isFirst ? <MoonStar className="w-6 h-6 sm:w-7 sm:h-7" /> : <Sun className="w-6 h-6 sm:w-7 sm:h-7" />}
            </div>

            {/* Title */}
            <h4 className="text-[13px] sm:text-[15px] font-extrabold text-slate-800 mb-0.5 whitespace-nowrap">
              {isFirst ? t.shiftReceive : t.shiftReport}
            </h4>
            
            {/* Date */}
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium mb-5">
              ({todayDateStr})
            </span>

            {/* Countdown Container */}
            <div className="w-full border-2 border-slate-100 rounded-2xl py-3.5 sm:py-4 px-1 flex flex-col items-center bg-slate-50/30">
              <div 
                className={`text-[15px] sm:text-2xl font-mono font-bold tracking-widest sm:tracking-[0.2em] whitespace-nowrap ${
                  countdownInfo.isClose ? 'text-rose-500 animate-pulse' : 'text-[#1d9a62]'
                }`}
              >
                {countdownInfo.timeString}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

