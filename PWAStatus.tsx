import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { useApp } from './AppContext';
import { AppLogo3D } from './AppLogo3D';
import { hapticFeedback } from './haptics';
import { PWAInstallGuideModal } from './PWAInstallGuideModal';
import {
  CheckCircle2,
  Download,
  Smartphone,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface PWAStatusProps {
  className?: string;
  variant?: 'card' | 'row';
}

export const PWAStatus: React.FC<PWAStatusProps> = ({
  className = '',
  variant = 'card',
}) => {
  const { isInstalled, isStandalone, isInstallable, promptInstall } = usePWAInstall();
  const { language } = useApp();
  const isBn = language === 'bn';
  const [isInstalling, setIsInstalling] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const isActuallyInstalled = isInstalled || isStandalone;

  const handleInstallClick = async () => {
    hapticFeedback.medium();
    setIsInstalling(true);
    try {
      if (typeof (window as any).triggerPwaInstall === 'function') {
        await (window as any).triggerPwaInstall();
      } else {
        await promptInstall();
      }
    } finally {
      setIsInstalling(false);
    }
  };

  if (variant === 'row') {
    return (
      <>
        <div className={`p-3 rounded-2xl border transition-all ${
          isActuallyInstalled
            ? 'bg-emerald-500/5 border-emerald-500/30'
            : 'bg-slate-50 border-slate-200/80'
        } ${className}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <AppLogo3D size={36} glow={isActuallyInstalled} animated={false} />
                {isActuallyInstalled && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm">
                    <CheckCircle2 className="w-3 h-3 fill-emerald-500 text-white" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {isBn ? 'PWA অ্যাপ স্ট্যাটাস' : 'PWA App Status'}
                  </span>
                  {isActuallyInstalled ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 fill-emerald-500/20" />
                      <span>{isBn ? 'ইনস্টল করা হয়েছে' : 'Installed'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-600 text-[10px] font-semibold">
                      <Smartphone className="w-3 h-3" />
                      <span>{isBn ? 'ইনস্টল নেই' : 'Not Installed'}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[10px] text-slate-400 truncate">
                    {isActuallyInstalled
                      ? (isBn ? 'ডিভাইসে অফিশিয়াল অ্যাপ সক্রিয়' : 'Official app active')
                      : (isBn ? 'হোমস্ক্রিনে যুক্ত করে ফাস্ট অ্যাক্সেস নিন' : 'Add to home screen for 1-click access')}
                  </p>
                  <button
                    onClick={() => {
                      hapticFeedback.light();
                      setIsGuideOpen(true);
                    }}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-0.5 shrink-0 cursor-pointer"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>{isBn ? 'গাইড' : 'Guide'}</span>
                  </button>
                </div>
              </div>
            </div>

            {!isActuallyInstalled && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleInstallClick}
                  disabled={isInstalling}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isInstalling ? '...' : (isBn ? 'ইনস্টল' : 'Install')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <PWAInstallGuideModal
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className={`rounded-2xl border p-4 transition-all duration-300 ${
        isActuallyInstalled
          ? 'bg-gradient-to-br from-emerald-500/10 via-slate-900/40 to-slate-900/60 border-emerald-500/40 shadow-sm'
          : 'bg-gradient-to-br from-indigo-500/5 via-slate-50 to-slate-100 border-slate-200 shadow-xs'
      } ${className}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`p-1 rounded-2xl ${
                isActuallyInstalled
                  ? 'bg-slate-900 border border-emerald-500/40 shadow-md shadow-emerald-500/10'
                  : 'bg-white border border-slate-200 shadow-xs'
              }`}>
                <AppLogo3D size={42} glow={isActuallyInstalled} animated={false} />
              </div>
              {isActuallyInstalled && (
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </span>
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black tracking-wide uppercase text-slate-700 dark:text-slate-200">
                  {isBn ? 'PWA অ্যাপ স্ট্যাটাস' : 'PWA Status'}
                </h4>
              </div>

              {isActuallyInstalled ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                    <span>{isBn ? 'ইনস্টল করা হয়েছে (Installed)' : 'Installed'}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200/80 text-slate-700 font-bold text-xs">
                    <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{isBn ? 'ইনস্টল করা নেই' : 'Not Installed'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isActuallyInstalled ? (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20 shrink-0">
                <ShieldCheck className="w-3 h-3" />
                <span>{isStandalone ? (isBn ? 'অ্যাপ মোড' : 'App Mode') : (isBn ? 'ভেরিফাইড' : 'Verified')}</span>
              </div>
            ) : (
              <button
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isInstalling ? '...' : (isBn ? 'ইনস্টল করুন' : 'Install App')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Subtext and Guide Link */}
        <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
            {isActuallyInstalled ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>
                  {isBn
                    ? 'আপনার ডিভাইসে অফিশিয়াল অ্যাপ হিসেবে সম্পূর্ণ সক্রিয়।'
                    : 'Official PWA installed on this device with full standalone support.'}
                </span>
              </>
            ) : (
              <span>
                {isBn
                  ? 'হোম স্ক্রিনে ইনস্টল করে ব্রাউজার ছাড়াই সরাসরি অ্যাপ উপভোগ করুন।'
                  : 'Install to home screen for faster loading and direct app access.'}
              </span>
            )}
          </p>

          <button
            onClick={() => {
              hapticFeedback.light();
              setIsGuideOpen(true);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 font-bold transition-colors cursor-pointer text-[10px]"
          >
            <HelpCircle className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            <span>{isBn ? 'কীভাবে ইনস্টল করবেন? (গাইড)' : 'How to Install? (Guide)'}</span>
          </button>
        </div>
      </div>

      <PWAInstallGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </>
  );
};

export default PWAStatus;
