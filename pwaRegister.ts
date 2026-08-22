/**
 * PWA Service Worker Registration Helper
 * Safely registers sw.js in production/supported environments with error handling
 */
import { registerSW } from 'virtual:pwa-register';

export function registerServiceWorker() {
  if (typeof window === 'undefined') return;
  
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isSecure = window.location.protocol === 'https:' || isLocalhost;
  
  if (!isSecure) return;
  
  window.addEventListener('load', () => {
    try {
      const updateSW = registerSW({
        onNeedRefresh() {
          console.log('[PWA] New content is available; will update on next session.');
        },
        onOfflineReady() {
          console.log('[PWA] Content is cached for offline use.');
        },
      });
    } catch (err) {
      console.warn('[PWA] Service worker registration failed:', err);
    }
  });
}
