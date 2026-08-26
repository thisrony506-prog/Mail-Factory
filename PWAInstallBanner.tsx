import React, { useState } from 'react';
import { useApp } from './AppContext';
import { usePWAInstall, useIsStandalone } from './usePWAInstall';
import { AppLogo3D } from './AppLogo3D';
import { hapticFeedback } from './haptics';
import { Download, X, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface PWAInstallBannerProps {
  variant?: 'card' | 'floating' | 'inline';
  className?: string;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  variant = 'card',
  className = '',
}) => {
  const { language } = useApp();
  const isStandalone = useIsStandalone();
  const { isInstalled, promptInstall } = usePWAInstall();
  
  // Check if banner dismissed by user
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem('pwaBannerDismissed') === 'true' ||
        localStorage.getItem('mf_pwa_dismissed') === '1'
      );
    } catch {
      return false;
    }
  });

  // If already running as standalone PWA or installed or dismissed, don't show
  if (isStandalone || isInstalled || isDismissed) {
    return null;
  }

  const handleInstallClick = (e: React.MouseEvent) => {
    hapticFeedback.heavy();
    promptInstall();
  };

  const dismissInstallBanner = (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticFeedback.light();
    setIsDismissed(true);
    try {
      localStorage.setItem('pwaBannerDismissed', 'true');
      localStorage.setItem('mf_pwa_dismissed', '1');
    } catch {}
  };

  if (variant === 'floating') {
    return (
      <div 
        id="pwa-install-banner"
        onClick={handleInstallClick}
        className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-32px)] max-w-[420px] bg-gradient-to-r from-[#0EA5E9] via-[#4F46E5] to-[#7C3AED] p-3.5 sm:p-4 rounded-[18px] shadow-2xl shadow-indigo-600/40 border border-white/20 text-white flex items-center gap-3 cursor-pointer select-none active:scale-[0.98] transition-transform duration-200 animate-in slide-in-from-bottom-5 ${className}`}
      >
        {/* App Logo / Icon (44x44px, drop-shadow) */}
        <div className="relative shrink-0 w-[44px] h-[44px]">
          <AppLogo3D size={44} glow animated className="drop-shadow-md" />
        </div>

        {/* Text Block */}
        <div className="flex-1 min-w-0 pr-7">
          <h4 className="text-[13px] font-bold text-white truncate leading-tight">
            📱 Install Mail Factory App
          </h4>
          <p className="text-[11px] font-normal text-white/80 truncate leading-tight mt-0.5">
            {language === 'bn' ? 'ফাস্ট অ্যাক্সেস পেতে অ্যাপ ইনস্টল করুন' : 'Fast access with official app'}
          </p>
        </div>

        {/* Absolute-positioned Circular Close Button (X) */}
        <button
          type="button"
          onClick={dismissInstallBanner}
          className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/25 hover:bg-black/45 border border-white/25 text-white flex items-center justify-center transition-colors cursor-pointer outline-none active:scale-90"
          aria-label="Close Install Banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={handleInstallClick}
      className={`rounded-[18px] bg-gradient-to-r from-[#0EA5E9] via-[#4F46E5] to-[#7C3AED] p-4 sm:p-5 shadow-2xl shadow-indigo-600/30 border border-white/20 text-white relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform ${className}`}
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Absolute Circular Close Button */}
      <button
        type="button"
        onClick={dismissInstallBanner}
        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/25 hover:bg-black/45 border border-white/25 text-white flex items-center justify-center transition-colors cursor-pointer z-20 outline-none active:scale-90"
        aria-label="Close Install Banner"
      >
        <X className="w-4.5 h-4.5" />
      </button>

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pr-6">
        {/* Left: App Logo & Details */}
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0 w-12 h-12 sm:w-14 sm:h-14">
            <AppLogo3D size={52} glow animated className="drop-shadow-lg" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center shadow-xs z-20">
              <CheckCircle2 className="w-3 h-3 text-slate-950" />
            </div>
          </div>

          <div className="space-y-0.5">
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>📱 Install Mail Factory App</span>
            </h3>
            <p className="text-xs text-white/80 font-normal">
              {language === 'bn' ? 'ফাস্ট অ্যাক্সেস পেতে অ্যাপ ইনস্টল করুন' : 'Install app for fast access & instant updates'}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-white/70 pt-0.5">
              <span className="flex items-center gap-1 text-emerald-300 font-bold">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified PWA</span>
              </span>
              <span>•</span>
              <span>Fast & Secure</span>
            </div>
          </div>
        </div>

        {/* Right: Install CTA Action */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleInstallClick}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-slate-100 font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>{language === 'bn' ? 'ইনস্টল করুন' : 'Install Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

