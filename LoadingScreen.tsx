import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, RefreshCw, Sparkles } from 'lucide-react';
import { useApp, DEFAULT_LOGO } from './AppContext';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  let language = 'bn';
  let appLogo = DEFAULT_LOGO;
  try {
    const context = useApp();
    if (context?.language) {
      language = context.language;
    }
    if (context?.appLogo) {
      appLogo = context.appLogo;
    }
  } catch {
    language = (localStorage.getItem('mf_lang') as string) || 'bn';
  }

  const [stepIndex, setStepIndex] = useState(0);
  const [showRetry, setShowRetry] = useState(false);
  const [imgError, setImgError] = useState(false);

  const bnSteps = [
    'সিকিউর সার্ভার কানেকশন তৈরি হচ্ছে...',
    'ইউজার প্রোফাইল ও ব্যালেন্স সিঙ্ক হচ্ছে...',
    'ড্যাশবোর্ড প্রস্তুত করা হচ্ছে...',
  ];

  const enSteps = [
    'Connecting to secure server...',
    'Synchronizing profile & balances...',
    'Preparing your dashboard...',
  ];

  const steps = language === 'bn' ? bnSteps : enSteps;

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 900);

    // If loading takes more than 5 seconds, show a soft refresh hint
    const timer = setTimeout(() => {
      setShowRetry(true);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [steps.length]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-6 select-none overflow-hidden font-sans">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Tag */}
      <div className="pt-6 relative z-10 flex items-center gap-2">
        <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 backdrop-blur-md shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-400 font-bold">Mail Factory</span>
          <span className="text-slate-600">•</span>
          <span>v2.5</span>
        </span>
      </div>

      {/* Center Animated Logo & Loading Progress */}
      <div className="flex flex-col items-center justify-center space-y-7 relative z-10 w-full max-w-xs text-center">
        {/* Glowing Website Logo Container */}
        <div className="relative">
          {/* Outer rotating/pulsing ring */}
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-40 blur-lg animate-pulse" />
          
          <div className="relative w-20 h-20 rounded-2xl bg-slate-900 border border-indigo-500/30 p-1 shadow-2xl flex items-center justify-center overflow-hidden">
            <div className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center bg-slate-800">
              <img
                src={!imgError ? (appLogo || '/app-logo.png') : '/app-logo.png'}
                alt="Mail Factory Logo"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>

        {/* Brand Name & Title */}
        <div className="space-y-1.5">
          <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200">
            Mail Factory
          </h1>
          <p className="text-xs font-semibold text-indigo-300/80 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{language === 'bn' ? 'বিশ্বস্ত এক্সচেঞ্জ প্ল্যাটফর্ম' : 'Trusted Exchange Platform'}</span>
          </p>
        </div>

        {/* Modern Animated Progress Line */}
        <div className="w-full space-y-3 pt-2">
          <div className="w-52 mx-auto h-1.5 bg-slate-800/80 rounded-full overflow-hidden relative border border-slate-700/50">
            <div className="absolute top-0 bottom-0 left-0 w-28 bg-gradient-to-r from-transparent via-indigo-500 to-purple-500 rounded-full animate-loading-bar" />
          </div>

          <p className="text-xs text-slate-300 font-medium min-h-[20px] transition-all duration-300">
            {message || steps[stepIndex]}
          </p>
        </div>

        {/* Retry Button if taking time */}
        {showRetry && (
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-3.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all shadow-md animate-in fade-in cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === 'bn' ? 'রিফ্রেশ করুন' : 'Reload Page'}</span>
          </button>
        )}
      </div>

      {/* Bottom Security Footer */}
      <div className="pb-4 relative z-10 flex flex-col items-center gap-1">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
          <Lock className="w-3 h-3 text-emerald-500" />
          <span>{language === 'bn' ? '২৫৬-বিট সুরক্ষিত ও এনক্রিপ্টেড' : '256-bit Secure & SSL Encrypted'}</span>
        </div>
      </div>
    </div>
  );
};
