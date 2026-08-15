import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../lib/i18n';
import { MoonStar, Sun } from 'lucide-react';
import { ShiftInfo } from '../types';

export const ReviewShifts: React.FC = () => {
  const { reviewShifts, language } = useApp();
  const t = translations[language];

  const [countdowns, setCountdowns] = useState<Record<string, { timeString: string; isClose: boolean }>>({});

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const newCountdowns: Record<string, { timeString: string; isClose: boolean }> = {};

      (Object.entries(reviewShifts) as [string, ShiftInfo][]).forEach(([key, shift]) => {
        if (!shift.active) {
          newCountdowns[key] = { timeString: '00 : 00 : 00', isClose: false };
          return;
        }

        const timeMatch = (shift.time || '12:00 AM').match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!timeMatch) {
          newCountdowns[key] = { timeString: '00 : 00 : 00', isClose: false };
          return;
        }

        let hours = parseInt(timeMatch[1], 10);
        const mins = parseInt(timeMatch[2], 10);
        const ampm = timeMatch[3].toUpperCase();

        if (ampm === 'PM' && hours !== 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;

        const target = new Date();
        target.setHours(hours, mins, 0, 0);

        if (target.getTime() <= now.getTime()) {
          target.setDate(target.getDate() + 1);
        }

        const diff = target.getTime() - now.getTime();
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        // Format like: "22 : 14 : 00" with spaces
        const formatted = `${String(h).padStart(2, '0')} : ${String(m).padStart(2, '0')} : ${String(s).padStart(2, '0')}`;
        newCountdowns[key] = {
          timeString: formatted,
          isClose: diff < 3600000, // less than 1 hr
        };
      });

      setCountdowns(newCountdowns);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [reviewShifts]);

  const shiftsArray = (Object.entries(reviewShifts) as [string, ShiftInfo][])
    .filter(([_, s]) => s.active !== false)
    .sort((a, b) => (a[1].order || 0) - (b[1].order || 0));

  if (shiftsArray.length === 0) return null;

  const todayDateStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 my-4">
      {shiftsArray.slice(0, 2).map(([key, shift], idx) => {
        const isFirst = idx === 0;
        const countdownInfo = countdowns[key] || { timeString: '-- : -- : --', isClose: false };

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
              {isFirst ? 'রিসিভ করা হবে' : 'রিপোর্ট দেওয়া হবে'}
            </h4>
            
            {/* Date */}
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium mb-5">
              ({todayDateStr})
            </span>

            {/* Countdown Container */}
            <div className="relative w-full border-2 border-slate-100 rounded-2xl pt-4 pb-6 px-1 flex flex-col items-center bg-slate-50/30">
              <div 
                className={`text-[15px] sm:text-2xl font-mono font-bold tracking-widest sm:tracking-[0.2em] whitespace-nowrap ${
                  countdownInfo.isClose ? 'text-rose-500 animate-pulse' : 'text-[#1d9a62]'
                }`}
              >
                {countdownInfo.timeString}
              </div>
              
              {/* Time Pill */}
              <div className="absolute -bottom-3.5 bg-[#2ac883] text-white px-4 py-1 rounded-full text-[11px] sm:text-xs font-black shadow-sm tracking-wide">
                {shift.time}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

