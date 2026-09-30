import React, { useState, useEffect } from 'react';
import { Download, X, CheckCircle, Share, MoreVertical, Smartphone } from 'lucide-react';
import { AppLogo3D } from './AppLogo3D';

declare global {
  interface Window {
    __mf_deferred_prompt?: any;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    getPWATrackingStats?: () => any;
    triggerPwaInstall?: () => void;
  }
}

/**
 * Tracks PWA events via Google Analytics (gtag), dataLayer, console, and local metrics storage.
 */
export const trackPWAEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (typeof window === 'undefined') return;

  const eventPayload = {
    event_category: 'pwa_install_prompt',
    timestamp: new Date().toISOString(),
    ...params,
  };

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventPayload);
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...eventPayload,
  });

  try {
    const rawStats = localStorage.getItem('mf_pwa_analytics_stats') || '{}';
    const stats = JSON.parse(rawStats);
    stats[eventName] = (stats[eventName] || 0) + 1;
    stats[`last_${eventName}`] = new Date().toISOString();
    localStorage.setItem('mf_pwa_analytics_stats', JSON.stringify(stats));
  } catch {}

  console.log(`[PWA Analytics] 📊 Tracked Event: ${eventName}`, eventPayload);
};

export const PWAInstallPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  // Helper: check if already installed on phone/device
  const checkIsInstalled = (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      if (localStorage.getItem('mailfactory_pwa_installed') === 'true') {
        return true;
      }
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');

      if (isStandalone) {
        localStorage.setItem('mailfactory_pwa_installed', 'true');
        return true;
      }
    } catch {}
    return false;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    setIsIOS(isIosDevice);

    // Clean legacy permanent dismissal keys so users are prompted on entry until installed
    try {
      localStorage.removeItem('mf_pwa_prompt_dismissed');
      localStorage.removeItem('pwaBannerDismissed');
    } catch {}

    // Check if already installed
    if (checkIsInstalled()) {
      setIsVisible(false);
      return;
    }

    // Modern browser installed check via getInstalledRelatedApps
    if ('getInstalledRelatedApps' in navigator) {
      (navigator as any).getInstalledRelatedApps().then((relatedApps: any[]) => {
        if (relatedApps && relatedApps.length > 0) {
          try {
            localStorage.setItem('mailfactory_pwa_installed', 'true');
          } catch {}
          setIsVisible(false);
        }
      }).catch(() => {});
    }

    // Check if user dismissed it during the CURRENT session tab only
    const sessionDismissed = () => {
      try {
        return sessionStorage.getItem('mf_pwa_session_dismissed') === '1';
      } catch {
        return false;
      }
    };

    if (sessionDismissed()) {
      return;
    }

    // Website entry trigger: show prompt 500ms after landing if not installed
    const timer = setTimeout(() => {
      if (!checkIsInstalled() && !sessionDismissed()) {
        setIsVisible(true);
        trackPWAEvent('pwa_prompt_shown', { label: 'Install Banner Displayed' });
      }
    }, 500);

    // Handler when 'mf_pwa_ready' custom event is triggered
    const handlePWAReady = () => {
      if (!checkIsInstalled() && !sessionDismissed()) {
        setIsVisible(true);
      }
    };

    window.addEventListener('mf_pwa_ready', handlePWAReady);

    // When app is installed, immediately hide and permanently mark installed
    const handleAppInstalled = () => {
      try {
        localStorage.setItem('mailfactory_pwa_installed', 'true');
      } catch {}
      setIsVisible(false);
      setShowGuideModal(false);
      window.__mf_deferred_prompt = null;
      trackPWAEvent('pwa_installed_success', { label: 'PWA App Installation Completed' });
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('mf_pwa_installed', handleAppInstalled);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mf_pwa_ready', handlePWAReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('mf_pwa_installed', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    trackPWAEvent('pwa_install_click', { action: 'user_clicked_install' });
    const promptEvent = window.__mf_deferred_prompt;

    if (promptEvent) {
      try {
        setIsInstalling(true);
        await promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult && choiceResult.outcome === 'accepted') {
          trackPWAEvent('pwa_install_accepted', { outcome: 'accepted' });
          try {
            localStorage.setItem('mailfactory_pwa_installed', 'true');
          } catch {}
          setIsVisible(false);
        } else {
          trackPWAEvent('pwa_install_dismissed_native', { outcome: 'dismissed' });
        }
      } catch (err) {
        console.error('[PWA] Error executing install prompt:', err);
        setShowGuideModal(true);
      } finally {
        setIsInstalling(false);
        window.__mf_deferred_prompt = null;
      }
    } else {
      // If browser doesn't offer native beforeinstallprompt (e.g. iOS Safari, or in-app browser)
      setShowGuideModal(true);
    }
  };

  const handleClose = () => {
    trackPWAEvent('pwa_dismiss_click', { action: 'user_clicked_close' });
    setIsVisible(false);
    try {
      // Dismiss for current browser session only; will reappear on new visits until installed
      sessionStorage.setItem('mf_pwa_session_dismissed', '1');
    } catch {}
  };

  const handleMarkInstalledManually = () => {
    try {
      localStorage.setItem('mailfactory_pwa_installed', 'true');
    } catch {}
    setShowGuideModal(false);
    setIsVisible(false);
  };

  // If already installed, never render anything
  if (checkIsInstalled()) {
    return null;
  }

  return (
    <>
      {/* 1. Main Bottom Install Banner (Floats cleanly above BottomNav on mobile) */}
      {isVisible && (
        <div className="fixed bottom-20 md:bottom-6 left-3 right-3 md:left-auto md:right-6 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-300">
          <div className="rounded-2xl bg-slate-900/95 border border-indigo-500/40 p-3.5 shadow-2xl backdrop-blur-md text-white flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-slate-800/90 border border-white/15 flex items-center justify-center shrink-0 shadow-md p-1">
                <AppLogo3D size={34} animated glow={false} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white truncate">Mail Factory App</h4>
                  <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded">
                    Official
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-normal truncate mt-0.5">
                  ফোনে ইনস্টল করুন • ফাস্ট অ্যাক্সেস
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isInstalling ? 'ইনস্টল হচ্ছে...' : 'ইনস্টল করুন'}</span>
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close"
                title="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Step-by-Step Installation Modal Guide for iOS or non-native browsers */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-indigo-500/40 rounded-3xl p-5 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center p-0.5">
                  <AppLogo3D size={28} glow={false} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">অ্যাপ ইনস্টল গাইড</h3>
                  <p className="text-[10px] text-slate-400">Mail Factory Mobile App</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs text-slate-300">
                <p className="text-[11px] text-indigo-300 font-medium">
                  iPhone / Safari ব্রাউজারে নিচের ২টি ধাপে সহজে ইনস্টল করুন:
                </p>
                <div className="flex items-start gap-3 p-2.5 bg-slate-800/60 rounded-xl border border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    ১
                  </div>
                  <div>
                    <p className="font-semibold text-white flex items-center gap-1.5">
                      Share বাটনে ট্যাপ করুন <Share className="w-3.5 h-3.5 text-sky-400 inline" />
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">সাফারি ব্রাউজারের নিচে শেয়ার আইকনে চাপুন</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2.5 bg-slate-800/60 rounded-xl border border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    ২
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      'Add to Home Screen' সিলেক্ট করুন
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">মেনু থেকে হোম স্ক্রিনে যোগ করুন বাটন চাপুন</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-300">
                <p className="text-[11px] text-indigo-300 font-medium">
                  অ্যান্ড্রয়েড বা ক্রোম ব্রাউজারে নিচের ২টি ধাপে সহজে ইনস্টল করুন:
                </p>
                <div className="flex items-start gap-3 p-2.5 bg-slate-800/60 rounded-xl border border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    ১
                  </div>
                  <div>
                    <p className="font-semibold text-white flex items-center gap-1.5">
                      ব্রাউজার মেনু <MoreVertical className="w-3.5 h-3.5 text-indigo-400 inline" /> চাপুন
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">ব্রাউজারের উপরের ডানপাশের ৩টি ডটে ট্যাপ করুন</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2.5 bg-slate-800/60 rounded-xl border border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    ২
                  </div>
                  <div>
                    <p className="font-semibold text-white flex items-center gap-1.5">
                      'Install app' অথবা 'Add to Home screen' চাপুন
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">ক্লিক করলেই ফোনে অ্যাপ হিসেবে সেভ হয়ে যাবে</p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleMarkInstalledManually}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>ইনস্টল সম্পন্ন করেছি</span>
              </button>
              <button
                onClick={() => setShowGuideModal(false)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                পরে করবো
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallPrompt;
