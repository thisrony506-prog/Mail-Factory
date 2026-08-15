/**
 * PWA Service Worker Registration Helper
 * Safely registers sw.js in production/supported environments with error handling
 */
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Only register on HTTPS or localhost
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isSecure = window.location.protocol === 'https:' || isLocalhost;

  if (!isSecure) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // Check for updates periodically
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New update available, silent refresh on next launch
                  console.log('[PWA] New content is available; will update on next session.');
                } else {
                  console.log('[PWA] Content is cached for offline use.');
                }
              }
            };
          }
        };
      })
      .catch((error) => {
        // Graceful non-blocking catch - web app continues normal operation
        console.warn('[PWA] Service worker registration failed:', error);
      });
  });
}
