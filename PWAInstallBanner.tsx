import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, X, Sparkles, Smartphone, Check } from 'lucide-react';
import { hapticFeedback } from '../lib/haptics';
import { IOSInstallGuideModal } from './IOSInstallGuideModal';

export const PWAInstallBanner: React.FC = () => {
  const { language, appLogo } = useApp();
  const {
    isInstallable,
    isInstalled,
    isStandalone,
    isIOS,
    showIOSGuide,
    setShowIOSGuide,
    promptInstall,
  } = usePWAInstall();

  const [dismissed, setDismissed] = useState<boolean>(() => {
    return localStorage.getItem('mf_pwa_banner_dismissed') === '1';
  });

  // Don't show if already running standalone or installed or dismissed
  if (isStandalone || isInstalled || dismissed || !isInstallable) {
    return (
      <>
        <IOSInstallGuideModal
          isOpen={showIOSGuide}
          onClose={() => setShowIOSGuide(false)}
        />
      </>
    );
  }

  const handleInstallClick = () => {
    hapticFeedback.medium();
    promptInstall();
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticFeedback.light();
    setDismissed(true);
    localStorage.setItem('mf_pwa_banner_dismissed', '1');
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white p-4 shadow-lg border border-white/20 transition-all animate-fade-in">
        {/* Subtle Decorative Background Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex items-center justify-between gap-3.5">
          {/* Logo & Text */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <img
                src={appLogo}
                alt="Mail Factory"
                className="w-12 h-12 rounded-2xl shadow-md border border-white/30 object-cover"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-indigo-700 flex items-center justify-center text-[9px]">
                ⚡
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 font-extrabold text-sm tracking-tight text-white">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
                <span className="truncate">
                  {language === 'bn' ? 'Install App' : 'Install Mail Factory'}
                </span>
              </div>
              <p className="text-xs text-indigo-100/90 line-clamp-1 mt-0.5 font-medium">
                {language === 'bn'
                  ? 'আরও দ্রুত এবং সহজে ব্যবহার করতে অ্যাপটি ইনস্টল করুন'
                  : 'Get faster access, 1-tap selling & instant notifications'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-black shadow-md transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'ইনস্টল করুন' : 'Install Now'}</span>
            </button>

            <button
              onClick={handleDismiss}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Modal */}
      <IOSInstallGuideModal
        isOpen={showIOSGuide}
        onClose={() => setShowIOSGuide(false)}
      />
    </>
  );
};
