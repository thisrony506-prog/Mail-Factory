import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  auth,
  db,
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
  onChildAdded,
  User,
} from '../lib/firebase';
import {
  UserProfile,
  Submission,
  WithdrawRequest,
  LevelConfig,
  ShiftInfo,
  PaymentMethodConfig,
  AppNotification,
  ChatMessage,
  ActiveTab,
  Language,
} from '../types';

export const DEFAULT_LOGO = "https://z-cdn-media.chatglm.cn/files/254f7f82-610d-4700-abc8-2e10435c149a.png?auth_key=1874890147-5ce8a86650d0488299a25b07660a73f8-0-b25e70b5ad3109adec869d78d8584440";

export const DEFAULT_LEVELS: LevelConfig[] = [
  { level: 1, approved: 0, rate: 10, old_rate: 8, title: 'Bronze Member', perkDescription: 'Standard exchange rate' },
  { level: 2, approved: 40, rate: 11, old_rate: 9, title: 'Silver Member', perkDescription: '+1৳ per Gmail' },
  { level: 3, approved: 100, rate: 12, old_rate: 10, title: 'Gold VIP', perkDescription: '+2৳ per Gmail + Fast payouts' },
  { level: 4, approved: 250, rate: 13, old_rate: 11, title: 'Platinum Partner', perkDescription: '+3৳ per Gmail + Instant audit' },
  { level: 5, approved: 500, rate: 14, old_rate: 12, title: 'Diamond Boss', perkDescription: 'Maximum rate + VIP 24/7 dedicated review' },
];

export const DEFAULT_SHIFTS: Record<string, ShiftInfo> = {
  shift1: { title: 'শুভ রাত্রি প্রথম সময়', time: '12:00 AM', active: true, order: 1, icon: 'moon' },
  shift2: { title: 'শুভ দিনের প্রথম সময়', time: '07:00 AM', active: true, order: 2, icon: 'sun' },
};

export const DEFAULT_PAYMENT_METHODS: Record<string, PaymentMethodConfig> = {
  bkash: { name: 'bKash', icon: 'bi-wallet2', color: '#E2136E', active: true, minWithdraw: 100, feePercent: 0 },
  nagad: { name: 'Nagad', icon: 'bi-wallet2', color: '#F6921D', active: true, minWithdraw: 100, feePercent: 0 },
  rocket: { name: 'Rocket', icon: 'bi-send-check', color: '#8C3494', active: true, minWithdraw: 100, feePercent: 0 },
  binance: { name: 'USDT (Binance Pay)', icon: 'bi-currency-exchange', color: '#F0B90B', active: true, minWithdraw: 200, feePercent: 0 },
};

interface AppContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  levels: LevelConfig[];
  currentLevel: LevelConfig;
  nextLevel: LevelConfig | null;
  reviewShifts: Record<string, ShiftInfo>;
  paymentMethods: Record<string, PaymentMethodConfig>;
  maintenanceMode: boolean;
  isWithdrawDisabled: boolean;
  minWithdraw: number;
  commissionPercent: number;
  signupBonusUser: number;
  signupBonusReferrer: number;
  submissions: Submission[];
  withdrawRequests: WithdrawRequest[];
  notifications: AppNotification[];
  unreadNotifsCount: number;
  addNotification: (title: string, desc: string, type?: 'info' | 'success' | 'warning' | 'danger') => void;
  markNotificationRead: (id: string | number) => void;
  markAllNotificationsRead: () => void;
  allUsers: UserProfile[];
  chatMessages: ChatMessage[];
  sendChatMessage: (msg: string) => Promise<void>;
  submitGmails: (data: {
    gmails: Array<{ email: string; password: string; recoveryEmail?: string }>;
    type: 'new' | 'old';
    rate: number;
    totalAmount: number;
    count: number;
  }) => Promise<{ success: boolean; message?: string }>;
  requestWithdraw: (data: {
    amount: number;
    method: string;
    methodName: string;
    accountNumber: string;
  }) => Promise<{ success: boolean; message?: string }>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  isWithdrawModalOpen: boolean;
  setWithdrawModalOpen: (open: boolean) => void;
  isChatDrawerOpen: boolean;
  setChatDrawerOpen: (open: boolean) => void;
  isNotifDrawerOpen: boolean;
  setNotifDrawerOpen: (open: boolean) => void;
  claimDailyStreak: () => Promise<{ success: boolean; streakCount: number }>;
  appLogo: string;
  copyText: (text: string, label?: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('mf_lang') as Language) || 'bn';
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [levels, setLevels] = useState<LevelConfig[]>(DEFAULT_LEVELS);
  const [reviewShifts, setReviewShifts] = useState<Record<string, ShiftInfo>>(DEFAULT_SHIFTS);
  const [paymentMethods, setPaymentMethods] = useState<Record<string, PaymentMethodConfig>>(DEFAULT_PAYMENT_METHODS);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [isWithdrawDisabled, setIsWithdrawDisabled] = useState<boolean>(false);
  const [minWithdraw, setMinWithdraw] = useState<number>(100);
  const [commissionPercent, setCommissionPercent] = useState<number>(10);
  const [signupBonusUser, setSignupBonusUser] = useState<number>(5);
  const [signupBonusReferrer, setSignupBonusReferrer] = useState<number>(5);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      from: 'bot',
      message: 'Welcome to Mail Factory! 👋 Our support team is online to assist with any verification or payout queries.',
      timestamp: Date.now(),
    },
  ]);

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('mf_notifications_v2');
      return saved ? JSON.parse(saved) : [
        {
          id: 1,
          title: 'Welcome to Mail Factory 🎉',
          desc: 'Get fast cash by exchanging fresh and aged Gmail accounts. Check out your Level perks!',
          type: 'success',
          read: false,
          time: 'Just now',
          timestamp: Date.now(),
        }
      ];
    } catch {
      return [];
    }
  });

  const [isAuthModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [isWithdrawModalOpen, setWithdrawModalOpen] = useState<boolean>(false);
  const [isChatDrawerOpen, setChatDrawerOpen] = useState<boolean>(false);
  const [isNotifDrawerOpen, setNotifDrawerOpen] = useState<boolean>(false);
  const appLogo = DEFAULT_LOGO;

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('mf_lang', lang);
  };

  const addNotification = useCallback((title: string, desc: string, type: 'info' | 'success' | 'warning' | 'danger' = 'info') => {
    const newNotif: AppNotification = {
      id: Date.now() + Math.random(),
      title,
      desc,
      type,
      read: false,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
    };
    setNotifications((prev) => {
      const updated = [newNotif, ...prev.slice(0, 49)];
      localStorage.setItem('mf_notifications_v2', JSON.stringify(updated));
      return updated;
    });

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('Mail Factory', { body: `${title}: ${desc}`, icon: appLogo });
      } catch {
        // Safe ignore
      }
    }
  }, [appLogo]);

  const markNotificationRead = useCallback((id: string | number) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      localStorage.setItem('mf_notifications_v2', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      localStorage.setItem('mf_notifications_v2', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const copyText = async (text: string, label: string = 'Copied'): Promise<boolean> => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        addNotification(label, text, 'success');
        return true;
      }
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      addNotification(label, text, 'success');
      return true;
    } catch {
      return false;
    }
  };

  // Sync Global Settings
  useEffect(() => {
    try {
      const settingsRef = ref(db, 'settings');
      const unsubscribe = onValue(settingsRef, (snap) => {
        if (snap.exists()) {
          const val = snap.val();
          if (val.review_shifts) setReviewShifts(val.review_shifts);
          if (val.payment_methods) setPaymentMethods(val.payment_methods);
          if (val.maintenance_mode !== undefined) setMaintenanceMode(Boolean(val.maintenance_mode));
          if (val.withdraw_disabled !== undefined) setIsWithdrawDisabled(Boolean(val.withdraw_disabled));
          if (val.min_withdraw !== undefined) setMinWithdraw(Number(val.min_withdraw) || 100);
          if (val.commission_percent !== undefined) setCommissionPercent(Number(val.commission_percent) || 10);
          if (val.signup_bonus_user !== undefined) setSignupBonusUser(Number(val.signup_bonus_user) || 5);
          if (val.signup_bonus_referrer !== undefined) setSignupBonusReferrer(Number(val.signup_bonus_referrer) || 5);
          if (val.levels) {
            const parsedLevels: LevelConfig[] = [];
            Object.keys(val.levels).forEach((k) => {
              const item = val.levels[k];
              parsedLevels.push({
                level: Number(k),
                approved: Number(item.req) || 0,
                rate: Number(item.new_rate) || 10,
                old_rate: Number(item.old_rate) || 8,
                title: item.title || `Level ${k} VIP`,
                perkDescription: item.desc || `Rate: ৳${item.new_rate || 10}/Gmail`,
              });
            });
            if (parsedLevels.length > 0) {
              parsedLevels.sort((a, b) => a.approved - b.approved);
              setLevels(parsedLevels);
            }
          }
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Settings listener error:', e);
    }
  }, []);

  // Sync All Users (for Leaderboard & Referral Friend list)
  useEffect(() => {
    try {
      const usersRef = ref(db, 'users');
      const unsubscribe = onValue(usersRef, (snap) => {
        if (snap.exists()) {
          const list: UserProfile[] = [];
          snap.forEach((child) => {
            const u = child.val();
            u.uid = child.key;
            list.push(u);
          });
          setAllUsers(list);
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Users listener error:', e);
    }
  }, []);

  // Auth & Profile Listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currUser) => {
      setUser(currUser);
      if (currUser) {
        try {
          const userRef = ref(db, `users/${currUser.uid}`);
          onValue(userRef, (snap) => {
            if (snap.exists()) {
              const data = snap.val() as UserProfile;
              data.uid = currUser.uid;
              setProfile(data);
            }
          });

          // Fetch user submissions
          const subRef = ref(db, 'submissions');
          onValue(subRef, (snap) => {
            const mySubs: Submission[] = [];
            if (snap.exists()) {
              snap.forEach((c) => {
                const sub = c.val() as Submission;
                if (sub.userId === currUser.uid) {
                  sub.key = c.key;
                  mySubs.push(sub);
                }
              });
              mySubs.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
            }
            setSubmissions(mySubs);
          });

          // Fetch user withdrawals
          const wdRef = ref(db, 'withdraw_requests');
          onValue(wdRef, (snap) => {
            const myWds: WithdrawRequest[] = [];
            if (snap.exists()) {
              snap.forEach((c) => {
                const wd = c.val() as WithdrawRequest;
                if (wd.userId === currUser.uid) {
                  wd.key = c.key;
                  myWds.push(wd);
                }
              });
              myWds.sort((a, b) => (b.requestedAt || 0) - (a.requestedAt || 0));
            }
            setWithdrawRequests(myWds);
          });

          // Listen for support chat messages
          const chatRef = ref(db, `support_chats/${currUser.uid}`);
          onChildAdded(chatRef, (snapshot) => {
            const msg = snapshot.val();
            if (msg) {
              setChatMessages((prev) => {
                if (prev.some((m) => m.id === snapshot.key)) return prev;
                return [...prev, { id: snapshot.key || String(Date.now()), ...msg }];
              });
            }
          });
        } catch (e) {
          console.warn('Profile sync error:', e);
        }
      } else {
        setProfile(null);
        setSubmissions([]);
        setWithdrawRequests([]);
      }
      setLoading(false);
    });

    return () => unsubAuth();
  }, []);

  // Compute Current & Next Level
  const totalApproved = profile?.manual_approved_count || 0;
  const sortedLevels = [...levels].sort((a, b) => a.approved - b.approved);
  let currentLevel = sortedLevels[0] || DEFAULT_LEVELS[0];
  let nextLevel: LevelConfig | null = sortedLevels[1] || null;

  for (let i = 0; i < sortedLevels.length; i++) {
    if (totalApproved >= sortedLevels[i].approved) {
      currentLevel = sortedLevels[i];
      nextLevel = sortedLevels[i + 1] || null;
    } else {
      break;
    }
  }

  // Update profile data in Firebase
  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      await update(ref(db, `users/${user.uid}`), data);
      setProfile((prev) => (prev ? { ...prev, ...data } : null));
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update profile');
    }
  };

  // Claim Daily Streak
  const claimDailyStreak = async (): Promise<{ success: boolean; streakCount: number }> => {
    if (!user || !profile) return { success: false, streakCount: 0 };
    const today = new Date().toDateString();
    const lastLogin = profile.last_login_date || '';
    if (lastLogin === today) {
      return { success: false, streakCount: profile.login_streak || 1 };
    }
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const newStreak = lastLogin === yesterday.toDateString() ? (profile.login_streak || 0) + 1 : 1;
    const streakBonus = Math.min(newStreak * 0.5, 5); // 0.5৳ to 5৳ streak bonus

    await update(ref(db, `users/${user.uid}`), {
      login_streak: newStreak,
      last_login_date: today,
      balance: increment(streakBonus),
    });

    addNotification('Daily Streak Bonus 🔥', `Streak Day ${newStreak}! +৳${streakBonus.toFixed(2)} added to your balance.`, 'success');
    return { success: true, streakCount: newStreak };
  };

  // Submit Gmail Exchange
  const submitGmails = async (data: {
    gmails: Array<{ email: string; password: string; recoveryEmail?: string }>;
    type: 'new' | 'old';
    rate: number;
    totalAmount: number;
    count: number;
  }): Promise<{ success: boolean; message?: string }> => {
    if (!user) {
      setAuthModalOpen(true);
      return { success: false, message: 'Please login to submit.' };
    }
    if (maintenanceMode) {
      return { success: false, message: 'Exchange is temporarily paused for maintenance.' };
    }

    try {
      // Check for duplicate emails already used
      for (const item of data.gmails) {
        const q = query(ref(db, 'used_emails'), orderByChild('email'), equalTo(item.email.toLowerCase().trim()));
        const snap = await get(q);
        if (snap.exists()) {
          return { success: false, message: `Email "${item.email}" has already been submitted in the past.` };
        }
      }

      // Create submission
      const newSubRef = push(ref(db, 'submissions'));
      const newSub: Submission = {
        userId: user.uid,
        username: profile?.username || user.displayName || 'User',
        submittedAt: Date.now(),
        status: 'pending',
        gmailsType: data.type,
        gmails: data.gmails.map((g) => ({
          email: g.email.toLowerCase().trim(),
          password: g.password.trim(),
          recoveryEmail: g.recoveryEmail?.trim() || '',
          status: 'pending',
        })),
        totalAmount: data.totalAmount,
        rate: data.rate,
        count: data.count,
        commission_percent: commissionPercent,
      };

      await set(newSubRef, newSub);

      // Record in used_emails
      for (const g of data.gmails) {
        await push(ref(db, 'used_emails'), { email: g.email.toLowerCase().trim(), submittedAt: Date.now() });
      }

      // Add to user's Hold balance
      await update(ref(db, `users/${user.uid}`), {
        hold: (Number(profile?.hold) || 0) + data.totalAmount,
        total_submitted: increment(data.count),
      });

      addNotification(
        'Submission Received 📩',
        `${data.count} ${data.type.toUpperCase()} Gmail(s) submitted for ৳${data.totalAmount}. Review is in progress!`,
        'success'
      );

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Submission failed. Please check internet connection.' };
    }
  };

  // Withdraw Request
  const requestWithdraw = async (data: {
    amount: number;
    method: string;
    methodName: string;
    accountNumber: string;
  }): Promise<{ success: boolean; message?: string }> => {
    if (!user || !profile) {
      setAuthModalOpen(true);
      return { success: false, message: 'Please login to withdraw.' };
    }
    if (isWithdrawDisabled) {
      return { success: false, message: 'Withdrawals are currently disabled by administrator.' };
    }
    if (data.amount < minWithdraw) {
      return { success: false, message: `Minimum withdrawal amount is ৳${minWithdraw}.` };
    }
    if (data.amount > (profile.balance || 0)) {
      return { success: false, message: `Insufficient balance. Available: ৳${(profile.balance || 0).toFixed(2)}` };
    }

    try {
      const newWdRef = push(ref(db, 'withdraw_requests'));
      const newWd: WithdrawRequest = {
        userId: user.uid,
        username: profile.username || 'User',
        amount: data.amount,
        method: data.method,
        paymentMethod: data.methodName,
        paymentNumber: data.accountNumber,
        status: 'pending',
        requestedAt: Date.now(),
      };

      await set(newWdRef, newWd);

      // Deduct from Main Balance
      await update(ref(db, `users/${user.uid}`), {
        balance: (profile.balance || 0) - data.amount,
        paymentNumber: data.accountNumber,
        paymentMethod: data.method,
        total_withdrawn: increment(data.amount),
      });

      addNotification(
        'Withdrawal Requested 💸',
        `৳${data.amount} requested via ${data.methodName}. Payout will arrive in 24-48 hours.`,
        'warning'
      );

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Withdrawal failed.' };
    }
  };

  // Send Chat message
  const sendChatMessage = async (text: string) => {
    if (!text.trim()) return;
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `local_${Date.now()}`,
      from: 'user',
      message: text.trim(),
      timestamp: Date.now(),
      username: profile?.username || 'User',
    };
    setChatMessages((prev) => [...prev, userMsg]);

    if (user) {
      try {
        await push(ref(db, `support_chats/${user.uid}`), {
          uid: user.uid,
          username: profile?.username || 'User',
          message: text.trim(),
          timestamp: Date.now(),
          from: 'user',
          read: false,
        });
      } catch (e) {
        console.warn('Chat sync error:', e);
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        profile,
        loading,
        language,
        setLanguage: handleLanguageChange,
        activeTab,
        setActiveTab,
        levels,
        currentLevel,
        nextLevel,
        reviewShifts,
        paymentMethods,
        maintenanceMode,
        isWithdrawDisabled,
        minWithdraw,
        commissionPercent,
        signupBonusUser,
        signupBonusReferrer,
        submissions,
        withdrawRequests,
        notifications,
        unreadNotifsCount,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        allUsers,
        chatMessages,
        sendChatMessage,
        submitGmails,
        requestWithdraw,
        updateProfileData,
        isAuthModalOpen,
        setAuthModalOpen,
        isWithdrawModalOpen,
        setWithdrawModalOpen,
        isChatDrawerOpen,
        setChatDrawerOpen,
        isNotifDrawerOpen,
        setNotifDrawerOpen,
        claimDailyStreak,
        appLogo,
        copyText,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
