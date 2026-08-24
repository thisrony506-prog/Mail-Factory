import React, { useEffect } from 'react';
import { useApp } from './AppContext';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { ref, update, set } from 'firebase/database';
import { db, app } from './firebase';

export const FCMSetup: React.FC = () => {
  const { user, addNotification } = useApp();

  useEffect(() => {
    if (!user) return;

    let unsubscribe: any = null;

    const setupMessaging = async () => {
      try {
        const supported = await isSupported();
        if (!supported) {
          console.log('Firebase Messaging is not supported in this browser.');
          return;
        }

        const messaging = getMessaging(app);

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const currentToken = await getToken(messaging, { 
             vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
          }).catch(err => {
            console.log('FCM Token error (likely missing VAPID key or blocked)', err);
            return null;
          });
          
          if (currentToken) {
            await update(ref(db, `users/${user.uid}`), { fcmToken: currentToken });
          }
        }

        unsubscribe = onMessage(messaging, (payload) => {
          console.log("Message received: ", payload);
          const title = payload.notification?.title || 'New Notification';
          const body = payload.notification?.body || '';
          
          addNotification(title, body, 'info');
          alert(`New Notification: ${title}\n${body}`);

          const notifId = payload.data?.id; 
          if (notifId) {
            set(ref(db, `admin_notifications/${notifId}/seenBy/${user.uid}`), true);
          }
        });
      } catch (error) {
        console.log('Error setting up Firebase Messaging:', error);
      }
    };

    setupMessaging();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  return null;
};
