import { useState, useEffect } from 'react';
import { useIsStandalone } from './useIsStandalone';

export { useIsStandalone };

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWAInstall() {
  const isStandalone = useIsStandalone();

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && (window as any).__mf_deferred_prompt) {
      return (window as any).__mf_deferred_prompt;
    }
    return null;
  });

  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      if (localStorage.getItem('mailfactory_pwa_installed') === 'true') {
        return true;
      }
      if (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://')
      ) {
        localStorage.setItem('mailfactory_pwa_installed', 'true');
        return true;
      }
    } catch {}
    return false;
  });

  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    if (isStandalone) {
      setIsInstalled(true);
      try {
        localStorage.setItem('mailfactory_pwa_installed', 'true');
      } catch {}
    }
  }, [isStandalone]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ((window as any).__mf_deferred_prompt) {
      setDeferredPrompt((window as any).__mf_deferred_prompt);
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafariBrowser =
      /safari/.test(userAgent) && !/crios|fxios|edgios|chrome|android/.test(userAgent);
    setIsIOS(isAppleDevice && isSafariBrowser);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).__mf_deferred_prompt = e;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      if (typeof window !== 'undefined') {
        (window as any).__mf_deferred_prompt = null;
      }
      try {
        localStorage.setItem('mailfactory_pwa_installed', 'true');
      } catch {}
      console.log('[PWA] App successfully installed.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    const promptEvent = deferredPrompt || (typeof window !== 'undefined' && (window as any).__mf_deferred_prompt);

    if (!promptEvent) {
      if (isIOS) {
        alert('iOS-এ অ্যাপ ইনস্টল করতে Safari ব্রাউজারের Share (শেয়ার) আইকনে চাপ দিন এবং "Add to Home Screen" নির্বাচন করুন।');
      } else {
        alert('আপনার ব্রাউজারের ৩-ডট (⋮) মেনু থেকে "Install app" বা "Add to Home screen" চাপুন।');
      }
      return;
    }

    try {
      await promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      if (choiceResult && choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        try {
          localStorage.setItem('mailfactory_pwa_installed', 'true');
        } catch {}
      }
      setDeferredPrompt(null);
      if (typeof window !== 'undefined') {
        (window as any).__mf_deferred_prompt = null;
      }
    } catch (err) {
      console.warn('[PWA] Error during install prompt:', err);
    }
  };

  const isInstallable = !isInstalled && !isStandalone;

  return {
    isInstallable,
    hasNativePrompt: !!deferredPrompt,
    isInstalled,
    isStandalone,
    isIOS,
    promptInstall,
  };
}


