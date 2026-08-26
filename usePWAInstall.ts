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

    // Provide a global function for raw HTML buttons to trigger install directly
    (window as any).triggerPwaInstall = async () => {
       const promptEvent = (window as any).__mf_deferred_prompt;
       if (promptEvent) {
         try {
           await promptEvent.prompt();
           const choice = await promptEvent.userChoice;
           if (choice && choice.outcome === 'accepted') {
             setIsInstalled(true);
             localStorage.setItem('mailfactory_pwa_installed', 'true');
           }
         } catch (e) {
           console.warn('Install prompt error:', e);
         }
       }
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).__mf_deferred_prompt = e;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleCustomPWAReady = (e: any) => {
      const promptEvent = e.detail || (window as any).__mf_deferred_prompt;
      if (promptEvent) {
        setDeferredPrompt(promptEvent);
      }
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
    window.addEventListener('mf_pwa_ready', handleCustomPWAReady);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('mf_pwa_ready', handleCustomPWAReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    const promptEvent = deferredPrompt || (typeof window !== 'undefined' && (window as any).__mf_deferred_prompt);

    if (promptEvent) {
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
        console.warn('[PWA] Error during install prompt execution:', err);
      }
    }
  };

  const isInstallable = !isInstalled && !isStandalone;

  return {
    isInstallable,
    hasNativePrompt: !!deferredPrompt,
    isInstalled,
    isStandalone,
    promptInstall,
  };
}
