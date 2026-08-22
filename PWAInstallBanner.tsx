import React, { useState } from 'react';
import { useApp } from './AppContext';
import { usePWAInstall } from './usePWAInstall';
import { AppLogo3D } from './AppLogo3D';
import { hapticFeedback } from './haptics';
import { Download, X, Sparkles, CheckCircle2, Smartphone, ShieldCheck } from 'lucide-react';

interface PWAInstallBannerProps {
  variant?: 'card' | 'floating' | 'inline';
  className?: string;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  variant = 'card',
  className = '',
}) => {
  const { language } = useApp();
  const { isInstallable, isInstalled, isStandalone, promptInstall } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return localStorage.getItem('mf_pwa_dismissed') === '1';
  });

  // If already running as standalone PWA or installed, don't show
  if (isStandalone || isInstalled || isDismissed) {
    return null;
  }

  const handleInstall = () => {
    hapticFeedback.heavy();
    promptInstall();
  };

  const handleDismiss = () => {
    hapticFeedback.light();
    setIsDismissed(true);
    localStorage.setItem('mf_pwa_dismissed', '1');
  };

  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto animate-in slide-in-from-bottom-5 duration-300 ${className}`}>
        <div className="rounded-2xl bg-slate-900/95 border border-indigo-500/40 p-3.5 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3 min-w-0">
            <AppLogo3D size={44} glow animated className="shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white truncate">Mail Factory</span>
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[9px] font-extrabold rounded">
                  Official
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-medium truncate">
                {language === 'bn' ? 'হোমস্ক্রিনে অ্যাপ যোগ করুন' : 'Add to Home Screen'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstall}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-extrabold shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'ইনস্টল' : 'Install'}</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close"
              aria-label="Close install banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 p-4 sm:p-5 shadow-xl text-white relative overflow-hidden ${className}`}
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: App Logo & Details */}
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <AppLogo3D size={56} glow animated />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center shadow-xs z-20">
              <CheckCircle2 className="w-3 h-3 text-slate-950" />
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white tracking-tight">Mail Factory</h3>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              {language === 'bn'
                ? 'অফিশিয়াল অ্যাপটি ইনস্টল করে দ্রুত জিমেইল সেল ও ক্যাশআউট করুন'
                : 'Install the official app for instant Gmail exchange & fast payouts'}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <ShieldCheck className="w-3 h-3" />
                <span>100% Secure</span>
              </span>
              <span>•</span>
              <span>50k+ user's</span>
              <span>•</span>
              <span>Fast & Verified</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleInstall}
            className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-black shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-300 animate-bounce" />
            <span>{language === 'bn' ? 'অ্যাপ ইনস্টল করুন' : 'Install Official App'}</span>
          </button>

          <button
            onClick={handleDismiss}
            className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Dismiss"
            aria-label="Dismiss install banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
