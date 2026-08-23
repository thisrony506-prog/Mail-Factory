import React, { useEffect } from 'react';
import { useApp } from './AppContext';
import { getToken, onMessage } from 'firebase/messaging';
import { ref, update, set } from 'firebase/database';
import { db, messaging, auth } from './firebase';

export const FCMSetup: React.FC = () => {
  const { user, addNotification } = useApp();

  useEffect(() => {
    if (!user) return;
    
    // Only run if messaging is supported
    if (!messaging) return;

    const requestNotificationPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Use the provided VAPID key (defaulting to process.env or hardcoded fallback for now, but user should replace it if needed)
          // Since the prompt asks to setup FCM Web, I'll use the prompt's instructions.
          // Wait, the prompt says: 'YOUR_VAPID_KEY_FROM_FIREBASE_CONSOLE'. I should use a dummy one or check env.
          const currentToken = await getToken(messaging, { 
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
          }).catch(err => {
            console.log('FCM Token error (likely missing VAPID key or blocked)', err);
            return null;
          });
          
          if (currentToken) {
            // Save token to DB
            await update(ref(db, `users/${user.uid}`), { fcmToken: currentToken });
          }
        }
      } catch (error) {
        console.log('Notification permission error', error);
      }
    };

    requestNotificationPermission();

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Message received: ", payload);
      const title = payload.notification?.title || 'New Notification';
      const body = payload.notification?.body || '';
      
      // Show inside app
      addNotification(title, body, 'info');
      // Also show native browser alert as requested in prompt: alert(`New Notification...`)
      // But maybe native Notification is better. The prompt explicitly says: alert(`New Notification: ${...}`)
      alert(`New Notification: ${title}\n${body}`);

      // Update tracking
      const notifId = payload.data?.id; 
      if (notifId) {
        set(ref(db, `admin_notifications/${notifId}/seenBy/${user.uid}`), true);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  return null;
};
