import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

declare global {
  interface Window {
    __mf_deferred_prompt?: any;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    getPWATrackingStats?: () => any;
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

  // 1. Google Analytics (gtag) if present
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventPayload);
  }

  // 2. Google Tag Manager / dataLayer if present
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...eventPayload,
  });

  // 3. Local persistent counter for standalone / debug tracking
  try {
    const rawStats = localStorage.getItem('mf_pwa_analytics_stats') || '{}';
    const stats = JSON.parse(rawStats);
    stats[eventName] = (stats[eventName] || 0) + 1;
    stats[`last_${eventName}`] = new Date().toISOString();
    localStorage.setItem('mf_pwa_analytics_stats', JSON.stringify(stats));
  } catch (err) {
    // Storage quota or privacy sandbox exception
  }

  console.log(`[PWA Analytics] 📊 Tracked Event: ${eventName}`, eventPayload);
};

// Helper function attached to window for easy stats retrieval in console
if (typeof window !== 'undefined') {
  window.getPWATrackingStats = () => {
    try {
      return JSON.parse(localStorage.getItem('mf_pwa_analytics_stats') || '{}');
    } catch {
      return {};
    }
  };
}

export const PWAInstallPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if user previously dismissed prompt
    const isDismissed = () => {
      try {
        return (
          localStorage.getItem('mf_pwa_prompt_dismissed') === '1' ||
          localStorage.getItem('pwaBannerDismissed') === 'true'
        );
      } catch {
        return false;
      }
    };

    // Check if running in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isDismissed() || isStandalone) {
      return;
    }

    // Handler when 'mf_pwa_ready' custom event is triggered
    const handlePWAReady = () => {
      if (!isDismissed() && !isStandalone && window.__mf_deferred_prompt) {
        setIsVisible(true);
        trackPWAEvent('pwa_prompt_shown', { label: 'PWA Install Banner Displayed' });
      }
    };

    // Check if event was already fired before component mounted
    if (window.__mf_deferred_prompt) {
      handlePWAReady();
    }

    // Listen strictly for 'mf_pwa_ready' event
    window.addEventListener('mf_pwa_ready', handlePWAReady);

    // Listen for appinstalled event to auto-hide UI & track success
    const handleAppInstalled = () => {
      setIsVisible(false);
      window.__mf_deferred_prompt = null;
      trackPWAEvent('pwa_installed_success', { label: 'PWA App Installation Completed' });
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('mf_pwa_ready', handlePWAReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    const promptEvent = window.__mf_deferred_prompt;
    if (!promptEvent) return;

    // Track user click on the Install button
    trackPWAEvent('pwa_install_click', { action: 'user_clicked_install' });

    try {
      setIsInstalling(true);
      // Trigger native install prompt stored in window.__mf_deferred_prompt
      await promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      if (choiceResult && choiceResult.outcome === 'accepted') {
        trackPWAEvent('pwa_install_accepted', { outcome: 'accepted' });
        console.log('[PWA] User accepted the install prompt');
      } else {
        trackPWAEvent('pwa_install_dismissed_native', { outcome: 'dismissed' });
        console.log('[PWA] User dismissed the native install prompt');
      }
    } catch (err) {
      console.error('[PWA] Error executing install prompt:', err);
      trackPWAEvent('pwa_install_error', { error: String(err) });
    } finally {
      setIsInstalling(false);
      setIsVisible(false);
      window.__mf_deferred_prompt = null;
    }
  };

  const handleClose = () => {
    // Track user click on the Close/Dismiss button
    trackPWAEvent('pwa_dismiss_click', { action: 'user_clicked_close' });

    setIsVisible(false);
    // Persist dismissal in localStorage
    try {
      localStorage.setItem('mf_pwa_prompt_dismissed', '1');
      localStorage.setItem('pwaBannerDismissed', 'true');
    } catch (err) {
      console.warn('[PWA] Unable to persist dismissal to localStorage:', err);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-300">
      <div className="rounded-2xl bg-slate-900/95 border border-indigo-500/40 p-4 shadow-2xl backdrop-blur-md text-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-white truncate">Install Mail Factory App</h4>
              <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded">
                Official
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-normal truncate mt-0.5">
              ফাস্ট অ্যাক্সেস পেতে অফিশিয়াল অ্যাপ ইনস্টল করুন
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
            <span>{isInstalling ? 'Installing...' : 'Install'}</span>
          </button>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
