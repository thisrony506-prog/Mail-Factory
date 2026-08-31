import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from './firebase';

export function useUserBalance(currentUser: any) {
  const [balance, setBalance] = useState<number>(() => {
    if (!currentUser?.uid) return 0;
    try {
      const cached = localStorage.getItem(`mf_wallet_cache_${currentUser.uid}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        return Number(parsed.balance || 0);
      }
    } catch {}
    return 0;
  });
  const [depositBalance, setDepositBalance] = useState<number>(() => {
    if (!currentUser?.uid) return 0;
    try {
      const cached = localStorage.getItem(`mf_wallet_cache_${currentUser.uid}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        return Number(parsed.deposit_balance !== undefined ? parsed.deposit_balance : (parsed.buyerWalletBalance || 0));
      }
    } catch {}
    return 0;
  });
  const [reservedBalance, setReservedBalance] = useState<number>(() => {
    if (!currentUser?.uid) return 0;
    try {
      const cached = localStorage.getItem(`mf_wallet_cache_${currentUser.uid}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        return Number(parsed.reserved_balance || 0);
      }
    } catch {}
    return 0;
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      setLoading(false);
      return;
    }

    // Load from cache immediately on user change
    try {
      const cached = localStorage.getItem(`mf_wallet_cache_${currentUser.uid}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        setBalance(Number(parsed.balance || 0));
        setDepositBalance(Number(parsed.deposit_balance !== undefined ? parsed.deposit_balance : (parsed.buyerWalletBalance || 0)));
        setReservedBalance(Number(parsed.reserved_balance || 0));
      }
    } catch {}

    const userRef = ref(db, `users/${currentUser.uid}`);
    
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const newBalance = Number(userData.balance || 0);
        const newDepositBalance = Number(
          userData.deposit_balance !== undefined 
            ? userData.deposit_balance 
            : (userData.buyerWalletBalance !== undefined ? userData.buyerWalletBalance : 0)
        );
        const newReservedBalance = Number(userData.reserved_balance || 0);
        setBalance(newBalance);
        setDepositBalance(newDepositBalance);
        setReservedBalance(newReservedBalance);
        try {
          localStorage.setItem(`mf_wallet_cache_${currentUser.uid}`, JSON.stringify({
            balance: newBalance,
            deposit_balance: newDepositBalance,
            buyerWalletBalance: newDepositBalance,
            reserved_balance: newReservedBalance,
            hold: userData.hold || 0,
            totalEarnings: userData.totalEarnings || 0,
            referralEarnings: userData.referralEarnings || 0,
            updatedAt: Date.now()
          }));
        } catch {}
      } else {
        setBalance(0);
        setDepositBalance(0);
        setReservedBalance(0);
      }
      setLoading(false);
    }, (err) => {
      console.warn('[useUserBalance] error:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return { balance, depositBalance, reservedBalance, loading };
}
