import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { usePWAInstall, useIsStandalone } from './usePWAInstall';
import { AppLogo3D } from './AppLogo3D';
import { hapticFeedback } from './haptics';
import { Download, X, Sparkles, ShieldCheck, Zap, BellRing } from 'lucide-react';

export const PWAInstallPromptOverlay: React.FC = () => {
  const { language } = useApp();
  const isStandalone = useIsStandalone();
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem('mailfactory_pwa_installed') === 'true' ||
        sessionStorage.getItem('mf_pwa_prompt_dismissed') === '1'
      );
    } catch {
      return false;
    }
  });

  const [isVisible, setIsVisible] = useState<boolean>(false);

  // Slight delay before showing prompt overlay so it doesn't jarringly jump on initial paint
  useEffect(() => {
    if (isInstallable && !isInstalled && !isStandalone && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isInstallable, isInstalled, isStandalone, isDismissed]);

  // If already running standalone or installed or not installable, do not render
  if (!isVisible || isStandalone || isInstalled || isDismissed) {
    return null;
  }

  const handleInstall = () => {
    hapticFeedback.heavy();
    promptInstall();
  };

  const handleDismiss = () => {
    hapticFeedback.light();
    setIsDismissed(true);
    try {
      sessionStorage.setItem('mf_pwa_prompt_dismissed', '1');
    } catch {}
  };

  return (
    <div 
      id="pwa-install-overlay"
      className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-md mx-auto sm:w-[380px] animate-in slide-in-from-bottom-8 fade-in duration-300 pointer-events-auto"
      role="dialog"
      aria-label="Install App"
    >
      <div className="relative rounded-3xl bg-slate-900/95 backdrop-blur-xl border-2 border-indigo-500/40 p-4 sm:p-4.5 shadow-2xl shadow-indigo-950/80 text-white overflow-hidden">
        {/* Glow effects */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/25 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top bar with Close button */}
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* App Logo */}
            <div className="relative shrink-0">
              <AppLogo3D size={50} glow animated />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900 items-center justify-center text-[8px] font-black text-slate-950">✓</span>
              </span>
            </div>

            {/* App Title & Badge */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-sm font-black text-white tracking-tight">Mail Factory App</h4>
                <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/30 text-indigo-300 text-[9px] font-extrabold border border-indigo-400/30">
                  Official App
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium leading-tight mt-0.5">
                {language === 'bn' 
                  ? 'দ্রুত ও নিরবচ্ছিন্ন ব্যবহারের জন্য অ্যাপটি ইনস্টল করুন' 
                  : 'Install for instant exchange & live alerts'}
              </p>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="p-1.5 -mr-1 -mt-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer shrink-0"
            title="Dismiss"
            aria-label="Dismiss install prompt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Highlights */}
        <div className="relative z-10 grid grid-cols-3 gap-1.5 my-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1 text-[10px] text-slate-300 font-semibold bg-slate-800/60 px-2 py-1 rounded-lg">
            <Zap className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate">{language === 'bn' ? 'ফাস্ট স্পিড' : 'Ultra Fast'}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-300 font-semibold bg-slate-800/60 px-2 py-1 rounded-lg">
            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">{language === 'bn' ? '১০০% নিরাপদ' : '100% Safe'}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-300 font-semibold bg-slate-800/60 px-2 py-1 rounded-lg">
            <BellRing className="w-3 h-3 text-indigo-400 shrink-0" />
            <span className="truncate">{language === 'bn' ? 'নোটিফিকেশন' : 'Live Alerts'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex items-center gap-2 pt-1">
          <button
            onClick={handleInstall}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-[0.98] text-white text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-300 animate-bounce" />
            <span>{language === 'bn' ? 'ইনস্টল করুন (Install App)' : 'Install App'}</span>
          </button>
          
          <button
            onClick={handleDismiss}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 active:scale-95 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            {language === 'bn' ? 'পরে' : 'Later'}
          </button>
        </div>
      </div>
    </div>
  );
};
