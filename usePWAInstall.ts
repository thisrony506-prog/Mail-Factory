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
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
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
      setDeferredPrompt(e);
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;

      if (!isStandaloneMode) {
        setIsInstallable(true);
      }
    };

    // 4. Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log('[PWA] Mail Factory was successfully installed.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    // If iOS Safari, trigger the instruction modal
    if (isIOS && !isStandalone) {
      setGlobalIOSGuide(true);
      return;
    }

    if (!deferredPrompt) {
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn('[PWA] Error during install prompt:', err);
    }
  };

  const closeIOSGuide = () => {
    setGlobalIOSGuide(false);
  };

  return {
    isInstallable: isInstallable || (isIOS && !isStandalone && !isInstalled),
    hasNativePrompt: !!deferredPrompt,
    isInstalled,
    isStandalone,
    isIOS,
    showIOSGuide,
    setShowIOSGuide: setGlobalIOSGuide,
    closeIOSGuide,
    promptInstall,
  };
}
