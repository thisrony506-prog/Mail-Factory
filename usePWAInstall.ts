import { useState, useEffect } from 'react';
import { useIsStandalone } from './useIsStandalone';

export { useIsStandalone };

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
  const isStandalone = useIsStandalone();

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && (window as any).__mf_deferred_prompt) {
      return (window as any).__mf_deferred_prompt;
    }
    return null;
  });
  
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

  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [hasPromptEvent, setHasPromptEvent] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && (window as any).__mf_deferred_prompt) {
      return true;
    }
    return false;
  });
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(globalShowIOSGuide);

  useEffect(() => {
    if (isStandalone) {
      setIsInstalled(true);
      try {
        localStorage.setItem('mailfactory_pwa_installed', 'true');
      } catch {}
    }
  }, [isStandalone]);

  useEffect(() => {
    const handleGuideChange = (val: boolean) => setShowIOSGuide(val);
    listeners.add(handleGuideChange);
    return () => {
      listeners.delete(handleGuideChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Check if early prompt already exists on window
    if ((window as any).__mf_deferred_prompt) {
      setDeferredPrompt((window as any).__mf_deferred_prompt);
      setHasPromptEvent(true);
    }

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafariBrowser =
      /safari/.test(userAgent) && !/crios|fxios|edgios|chrome|android/.test(userAgent);
    const isIOSDevice = isAppleDevice && isSafariBrowser;
    setIsIOS(isIOSDevice);

    // 4. Listen for Chrome / Android / Edge install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).__mf_deferred_prompt = e;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setHasPromptEvent(true);
    };

    const handleCustomPWAReady = (e: any) => {
      if (e.detail) {
        setDeferredPrompt(e.detail);
        setHasPromptEvent(true);
      }
    };

    // 5. Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      (window as any).__mf_deferred_prompt = null;
      setHasPromptEvent(false);
      try {
        localStorage.setItem('mailfactory_pwa_installed', 'true');
        localStorage.setItem('mf_pwa_dismissed', '1');
        sessionStorage.setItem('mf_pwa_prompt_dismissed', '1');
      } catch {}
      console.log('[PWA] Mail Factory App was successfully installed.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('mf_pwa_ready', handleCustomPWAReady);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('mf_pwa_installed', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('mf_pwa_ready', handleCustomPWAReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('mf_pwa_installed', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    // Check current state or window variable
    const promptEvent = deferredPrompt || (typeof window !== 'undefined' && (window as any).__mf_deferred_prompt);

    if (isIOS && !isStandalone) {
      setGlobalIOSGuide(true);
      return;
    }

    if (!promptEvent) {
      // Open the visual in-app guide modal for Android/Chrome/Samsung Internet
      setGlobalIOSGuide(true);
      return;
    }

    try {
      await promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      if (choiceResult && choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        try {
          localStorage.setItem('mailfactory_pwa_installed', 'true');
          localStorage.setItem('mf_pwa_dismissed', '1');
          sessionStorage.setItem('mf_pwa_prompt_dismissed', '1');
        } catch {}
      }
      setDeferredPrompt(null);
      if (typeof window !== 'undefined') {
        (window as any).__mf_deferred_prompt = null;
      }
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

