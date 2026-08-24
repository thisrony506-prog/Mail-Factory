import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import {
  initializeAuth,
  getAuth,
  browserPopupRedirectResolver,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  push,
  onValue,
  increment,
  query,
  orderByChild,
  equalTo,
  remove,
  onChildAdded,
  goOnline,
  goOffline,
  Database
} from 'firebase/database';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAbsa0uvBYhkEYoLxuHwD4TQi5GDdAzQpg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "exchanger-pro.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://exchanger-pro-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "exchanger-pro",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "exchanger-pro.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "889959520630",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:889959520630:web:f4cbf82f236b616e1f8257"
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: browserLocalPersistence,
    popupRedirectResolver: browserPopupRedirectResolver,
  });
} catch (e: any) {
  authInstance = getAuth(app);
}
export const auth = authInstance;
export const db: Database = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
  ref,
  set,
  get,
  update,
  push,
  onValue,
  increment,
  query,
  orderByChild,
  equalTo,
  remove,
  onChildAdded,
  goOnline,
  goOffline,
  getToken,
  onMessage
};

export type { User };

// ইউজারের ব্যালেন্স আপডেট বা এডিট করার ফাংশন (অ্যাডমিন প্যানেলের জন্য)
export const updateAdminUserBalance = async (userId: string, amountChange: number, type: 'add' | 'subtract' | 'set', newBalance?: number) => {
  try {
    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      let currentBalance = Number(userData.balance || 0);
      let updatedBalance = currentBalance;

      if (type === 'add') {
        updatedBalance = currentBalance + Number(amountChange);
      } else if (type === 'subtract') {
        updatedBalance = Math.max(0, currentBalance - Number(amountChange));
      } else if (type === 'set' && newBalance !== undefined) {
        updatedBalance = Number(newBalance);
      }

      // ফায়ারবেসে ইউজারের ব্যালেন্স আপডেট করা
      await update(userRef, {
        balance: updatedBalance,
        lastBalanceUpdate: Date.now()
      });

      console.log(`Balance successfully updated for user ${userId}. New Balance: ${updatedBalance}`);
      return true;
    }
  } catch (error) {
    console.error("Error updating user balance:", error);
    return false;
  }
};
