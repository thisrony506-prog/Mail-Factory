import { useState, useEffect } from 'react';

// Global listener for iOS guide modal
let globalShowIOSGuide = false;
const listeners = new Set<(val: boolean) => void>();

export function setGlobalIOSGuide(val: boolean) {
  globalShowIOSGuide = val;
  listeners.forEach((fn) => fn(val));
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string
  }>;
  prompt(): Promise<void>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  
  // Read persistent install status from localStorage and standalone mode
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

  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  });

  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [hasPromptEvent, setHasPromptEvent] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(globalShowIOSGuide);

  useEffect(() => {
    const handleGuideChange = (val: boolean) => setShowIOSGuide(val);
    listeners.add(handleGuideChange);
    return () => {
      listeners.delete(handleGuideChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Detect Standalone mode (already installed & running as PWA)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');

      setIsStandalone(isStandaloneMode);
      if (isStandaloneMode) {
        setIsInstalled(true);
        try {
          localStorage.setItem('mailfactory_pwa_installed', 'true');
        } catch {}
      }
    };

    checkStandalone();

    // 2. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafariBrowser =
      /safari/.test(userAgent) && !/crios|fxios|edgios|chrome|android/.test(userAgent);
    const isIOSDevice = isAppleDevice && isSafariBrowser;
    setIsIOS(isIOSDevice);

    // 3. Listen for Chrome / Android / Edge install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setHasPromptEvent(true);
    };

    // 4. Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setHasPromptEvent(false);
      try {
        localStorage.setItem('mailfactory_pwa_installed', 'true');
        localStorage.setItem('mf_pwa_dismissed', '1');
        sessionStorage.setItem('mf_pwa_prompt_dismissed', '1');
      } catch {}
      console.log('[PWA] Mail Factory App was successfully installed.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    // If iOS Safari or running without native prompt event, trigger the instruction modal
    if (isIOS && !isStandalone) {
      setGlobalIOSGuide(true);
      return;
    }

    if (!deferredPrompt) {
      // Open the visual in-app guide modal for Android/Chrome/Samsung Internet
      setGlobalIOSGuide(true);
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        try {
          localStorage.setItem('mailfactory_pwa_installed', 'true');
          localStorage.setItem('mf_pwa_dismissed', '1');
          sessionStorage.setItem('mf_pwa_prompt_dismissed', '1');
        } catch {}
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn('[PWA] Error during install prompt:', err);
      setGlobalIOSGuide(true);
    }
  };

  const closeIOSGuide = () => {
    setGlobalIOSGuide(false);
  };

  // If installed or running in standalone mode, installable is strictly false (hidden forever)
  const isInstallable = !isInstalled && !isStandalone;

  return {
    isInstallable,
    hasNativePrompt: hasPromptEvent || !!deferredPrompt,
    isInstalled,
    isStandalone,
    isIOS,
    showIOSGuide,
    setShowIOSGuide: setGlobalIOSGuide,
    closeIOSGuide,
    promptInstall,
  };
}

