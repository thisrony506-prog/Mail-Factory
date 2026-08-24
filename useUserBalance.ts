import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from './firebase';

export function useUserBalance(currentUser: any) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      setLoading(false);
      return;
    }

    // ইউজারের নিজস্ব ডেটা পাথ থেকে রিয়েল-টাইম ব্যালেন্স শোনা
    const userRef = ref(db, `users/${currentUser.uid}`);
    
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setBalance(Number(userData.balance || 0));
      } else {
        setBalance(0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return { balance, loading };
}
