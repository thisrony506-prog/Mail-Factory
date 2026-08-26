import { useState, useEffect } from 'react';

/**
 * Hook that checks if the application is running in standalone mode (installed PWA)
 * via window.matchMedia('(display-mode: standalone)').matches and listens for display mode changes
 * to automatically hide install overlays/prompts.
 */
export function useIsStandalone(): boolean {
  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(display-mode: standalone)');

    const handleChange = (e?: MediaQueryListEvent) => {
      const matches = e ? e.matches : mediaQuery.matches;
      const standalone =
        matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');

      setIsStandalone(standalone);
      if (standalone) {
        try {
          localStorage.setItem('mailfactory_pwa_installed', 'true');
          sessionStorage.setItem('mf_pwa_prompt_dismissed', '1');
        } catch {}
      }
    };

    // Initial check
    handleChange();

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if ((mediaQuery as any).addListener) {
      // Legacy browsers
      (mediaQuery as any).addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else if ((mediaQuery as any).removeListener) {
        (mediaQuery as any).removeListener(handleChange);
      }
    };
  }, []);

  return isStandalone;
}
