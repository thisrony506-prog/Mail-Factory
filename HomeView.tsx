import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../lib/i18n';
import { ReviewShifts } from '../ReviewShifts';
import { PWAInstallBanner } from '../PWAInstallBanner';
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  Award,
  Headphones,
  Lock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { GmailType } from '../../types';

export const HomeView: React.FC = () => {
  const {
    language,
    setActiveTab,
    currentLevel,
    levels,
    maintenanceMode,
    appLogo,
    user,
    setAuthModalOpen,
  } = useApp();

  const t = translations[language];
  const [selectedType, setSelectedType] = useState<GmailType>('new');

  const handleStartExchange = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setActiveTab('exchange');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 space-y-4">
      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {/* 100% Safe Trust Banner */}
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold shadow-sm">
        <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <p className="leading-snug">{t.trustedSafe}</p>
      </div>

      {/* Exchange Rate Card */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-50 to-indigo-50/50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <span className="font-extrabold text-sm text-slate-800">
              {currentLevel.title} {t.levelRateTitle}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {t.activeBadge}
          </span>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3">
          {/* New Gmail Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 text-center relative overflow-hidden group">
            <div className="absolute -right-2 -bottom-2 opacity-5 text-indigo-900 pointer-events-none font-black text-6xl">
              N
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
              {t.newGmail}
            </span>
            <div className="text-3xl font-black text-indigo-700 font-mono">
              ৳{currentLevel.rate}
            </div>
            <span className="text-[10px] font-semibold text-indigo-500 mt-1 inline-block">
              Per Verified Account
            </span>
          </div>

          {/* Old Gmail Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50 to-white border border-purple-100 text-center relative overflow-hidden group">
            <div className="absolute -right-2 -bottom-2 opacity-5 text-purple-900 pointer-events-none font-black text-6xl">
              O
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
              {t.oldGmail}
            </span>
            <div className="text-3xl font-black text-purple-700 font-mono">
              ৳{currentLevel.old_rate}
            </div>
            <span className="text-[10px] font-semibold text-purple-500 mt-1 inline-block">
              Per Aged Account
            </span>
          </div>
        </div>
      </div>

      {/* Start Exchange Quick Card */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm space-y-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">
              {language === 'bn' ? 'লেনদেন শুরু করুন' : 'Start Exchange'}
            </h3>
            <span className="text-[11px] font-medium text-slate-400">
              {language === 'bn' ? 'সরাসরি জিমেইল বিক্রি করে টাকা নিন' : 'Sell Gmail instantly for cash'}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide">
            {t.chooseGmailType}
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as GmailType)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="new">
              {t.newGmail} — ৳{currentLevel.rate} ({currentLevel.title})
            </option>
            <option value="old">
              {t.oldGmail} — ৳{currentLevel.old_rate} ({currentLevel.title})
            </option>
          </select>
        </div>

        <button
          onClick={handleStartExchange}
          disabled={maintenanceMode}
          className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm text-white shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 ${
            maintenanceMode
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 hover:opacity-95 shadow-indigo-200'
          }`}
        >
          <span>{maintenanceMode ? 'Maintenance Mode' : t.startSelling}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Live Review Shifts */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t.liveReviewShifts}</span>
          </h3>
        </div>
        <ReviewShifts />
      </div>

      {/* Level Perks Quick Carousel */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-4 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black tracking-wide uppercase text-amber-300">
              {language === 'bn' ? 'ভিআইপি লেভেল রিওয়ার্ড' : 'VIP Level Perks'}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400">Level 1 - 5</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {levels.map((lvl) => {
            const isCurrent = currentLevel.level === lvl.level;
            return (
              <div
                key={lvl.level}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'bg-white/20 border-amber-400 text-white shadow-inner'
                    : 'bg-white/5 border-white/10 text-white/70'
                }`}
              >
                <div className="text-[10px] font-extrabold uppercase">
                  {lvl.title} {isCurrent && '👑'}
                </div>
                <div className="text-base font-black text-amber-300 my-0.5">
                  ৳{lvl.rate} <span className="text-[10px] font-normal text-white/70">/mail</span>
                </div>
                <div className="text-[9px] text-white/60 truncate">
                  {lvl.approved === 0 ? 'Start' : `${lvl.approved}+ approved`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm text-center">
        <h3 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>{t.whyChooseUs}</span>
        </h3>

        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-2 shadow-sm">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">{t.fastPayment}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center mb-2 shadow-sm">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">{t.safeData}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center mb-2 shadow-sm">
              <Headphones className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">{t.support247}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
