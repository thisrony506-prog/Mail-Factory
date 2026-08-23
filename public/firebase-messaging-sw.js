importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAbsa0uvBYhkEYoLxuHwD4TQi5GDdAzQpg",
  authDomain: "exchanger-pro.firebaseapp.com",
  databaseURL: "https://exchanger-pro-default-rtdb.firebaseio.com",
  projectId: "exchanger-pro",
  storageBucket: "exchanger-pro.firebasestorage.app",
  messagingSenderId: "889959520630",
  appId: "1:889959520630:web:f4cbf82f236b616e1f8257"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'Notification';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/app-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
