import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  auth,
  db,
  onAuthStateChanged,
  getRedirectResult,
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
  goOnline,
  goOffline,
  User,
} from './firebase';
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
  TopSellerItem,
  isExcludedSeller,
} from './types';

export const DEFAULT_LOGO = "/app-logo.webp";

export const DEFAULT_LEVELS: LevelConfig[] = [
  { level: 1, approved: 0, rate: 10, old_rate: 8, title: 'Bronze Member', perkDescription: 'Standard exchange rate' },
  { level: 2, approved: 40, rate: 11, old_rate: 9, title: 'Silver Member', perkDescription: '+1৳ per Gmail' },
  { level: 3, approved: 100, rate: 12, old_rate: 10, title: 'Gold VIP', perkDescription: '+2৳ per Gmail + Fast payouts' },
  { level: 4, approved: 250, rate: 13, old_rate: 11, title: 'Platinum Partner', perkDescription: '+3৳ per Gmail + Instant audit' },
  { level: 5, approved: 500, rate: 14, old_rate: 12, title: 'Diamond Boss', perkDescription: 'Maximum rate + VIP 24/7 dedicated review' },
];

export const DEFAULT_TOP_SELLERS: UserProfile[] = [];

export const INITIAL_TOP_SELLERS: TopSellerItem[] = [];

export const DEFAULT_SHIFTS: Record<string, ShiftInfo> = {
  shift1: { title: 'শুভ রাত্রি প্রথম সময়', time: '12:00 AM', active: true, order: 1, icon: 'moon' },
  shift2: { title: 'শুভ দিনের প্রথম সময়', time: '07:00 AM', active: true, order: 2, icon: 'sun' },
};

export const DEFAULT_PAYMENT_METHODS: Record<string, PaymentMethodConfig> = {
  bkash: { name: 'bKash', icon: 'bi-wallet2', color: '#E2136E', active: true, minWithdraw: 150, feePercent: 6 },
  nagad: { name: 'Nagad', icon: 'bi-wallet2', color: '#F6921D', active: true, minWithdraw: 150, feePercent: 6 },
  rocket: { name: 'Rocket', icon: 'bi-send-check', color: '#8C3494', active: true, minWithdraw: 150, feePercent: 6 },
  binance: { name: 'USDT (BEP20)', icon: 'bi-currency-exchange', color: '#F0B90B', active: true, minWithdraw: 240, feePercent: 6 },
};

interface AppContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  emailNotifWithdrawal: boolean;
  setEmailNotifWithdrawal: (val: boolean) => void;
  emailNotifExchange: boolean;
  setEmailNotifExchange: (val: boolean) => void;
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
  topSellers: TopSellerItem[];
  setTopSellers: React.Dispatch<React.SetStateAction<TopSellerItem[]>>;
  syncRealUsersToTopSellers: () => Promise<TopSellerItem[]>;
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
  authModalMode: 'login' | 'register';
  setAuthModalOpen: (open: boolean, mode?: 'login' | 'register') => void;
  setAuthModalMode: (mode: 'login' | 'register') => void;
  isWithdrawModalOpen: boolean;
  setWithdrawModalOpen: (open: boolean) => void;
  isChatDrawerOpen: boolean;
  setChatDrawerOpen: (open: boolean) => void;
  isNotifDrawerOpen: boolean;
  setNotifDrawerOpen: (open: boolean) => void;
  isSettingsDrawerOpen: boolean;
  setSettingsDrawerOpen: (open: boolean) => void;
  isRateModalOpen: boolean;
  setRateModalOpen: (open: boolean) => void;
  claimDailyStreak: () => Promise<{ success: boolean; streakCount: number }>;
  appLogo: string;
  copyText: (text: string, label?: string) => Promise<boolean>;
}

export const TAB_TO_PATH: Record<ActiveTab, string> = {
  home: '/',
  exchange: '/exchange',
  history: '/history',
  sellers: '/sellers',
  reviews: '/reviews',
  withdraw: '/withdraw',
  profile: '/profile',
  about: '/about',
  privacy: '/privacy',
  settings: '/settings',
  referral_leaderboard: '/referral-leaderboard',
  change_password: '/change-password',
  edit_profile: '/edit-profile',
  id_card: '/id-card',
  faq: '/faq',
  contact: '/contact',
};

export const PATH_TO_TAB: Record<string, ActiveTab> = {
  '/': 'home',
  '/home': 'home',
  '/exchange': 'exchange',
  '/sell': 'exchange',
  '/submit': 'exchange',
  '/history': 'history',
  '/submissions': 'history',
  '/transactions': 'history',
  '/sellers': 'sellers',
  '/top-sellers': 'sellers',
  '/leaderboard': 'sellers',
  '/reviews': 'reviews',
  '/feedback': 'reviews',
  '/withdraw': 'withdraw',
  '/payout': 'withdraw',
  '/cashout': 'withdraw',
  '/profile': 'profile',
  '/account': 'profile',
  '/me': 'profile',
  '/about': 'about',
  '/about-us': 'about',
  '/privacy': 'privacy',
  '/privacy-policy': 'privacy',
  '/settings': 'settings',
  '/referral-leaderboard': 'referral_leaderboard',
  '/referral': 'referral_leaderboard',
  '/invite': 'referral_leaderboard',
  '/change-password': 'change_password',
  '/edit-profile': 'edit_profile',
  '/id-card': 'id_card',
  '/idcard': 'id_card',
  '/verify': 'id_card',
  '/card': 'id_card',
  '/faq': 'faq',
  '/help': 'faq',
  '/contact': 'contact',
  '/contact-us': 'contact',
  '/support': 'contact',
};

const getInitialTabFromUrl = (): ActiveTab => {
  try {
    const pathname = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    if (PATH_TO_TAB[pathname]) {
      return PATH_TO_TAB[pathname];
    }
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') || params.get('page');
    if (tabParam) {
      const formatted = `/${tabParam.toLowerCase().replace(/^\//, '')}`;
      if (PATH_TO_TAB[formatted]) {
        return PATH_TO_TAB[formatted];
      }
    }
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash) {
      const formatted = `/${hash.replace(/^\//, '')}`;
      if (PATH_TO_TAB[formatted]) {
        return PATH_TO_TAB[formatted];
      }
    }
  } catch (e) {
    console.warn('URL parsing error:', e);
  }
  return 'home';
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem('mf_last_user_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('mf_lang');
    if (saved === 'bn' || saved === 'en') return saved;
    return 'en';
  });
  const [activeTab, setActiveTabState] = useState<ActiveTab>(getInitialTabFromUrl);

  const setActiveTab = useCallback((tab: ActiveTab) => {
    setActiveTabState(tab);
    try {
      const targetPath = TAB_TO_PATH[tab] || '/';
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ tab }, '', targetPath);
      }
    } catch (e) {
      console.warn('History pushState error:', e);
    }
  }, []);

  // Check initial modal states from URL
  const [isAuthModalOpen, setIsAuthModalOpenState] = useState<boolean>(() => {
    try {
      const path = window.location.pathname.toLowerCase();
      return path === '/login' || path === '/register' || path === '/signup';
    } catch {
      return false;
    }
  });

  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>(() => {
    try {
      const path = window.location.pathname.toLowerCase();
      if (path === '/register' || path === '/signup') return 'register';
    } catch {}
    return 'login';
  });

  const [isWithdrawModalOpen, setWithdrawModalOpenState] = useState<boolean>(false);
  const [isChatDrawerOpen, setChatDrawerOpenState] = useState<boolean>(() => {
    try {
      const path = window.location.pathname.toLowerCase();
      return path === '/chat' || path === '/support';
    } catch {
      return false;
    }
  });
  const [isNotifDrawerOpen, setNotifDrawerOpenState] = useState<boolean>(() => {
    try {
      const path = window.location.pathname.toLowerCase();
      return path === '/notifications' || path === '/alerts';
    } catch {
      return false;
    }
  });
  const [isSettingsDrawerOpen, setSettingsDrawerOpen] = useState<boolean>(false);
  const [isRateModalOpen, setRateModalOpenState] = useState<boolean>(() => {
    try {
      const path = window.location.pathname.toLowerCase();
      return path === '/rate';
    } catch {
      return false;
    }
  });

  const setAuthModalOpen = useCallback((open: boolean, mode?: 'login' | 'register') => {
    if (mode) setAuthModalMode(mode);
    setIsAuthModalOpenState(open);
    try {
      if (open) {
        const targetPath = (mode || authModalMode) === 'register' ? '/register' : '/login';
        if (window.location.pathname !== targetPath) {
          window.history.pushState({ modal: 'auth', mode: mode || authModalMode }, '', targetPath);
        }
      } else {
        const currentPath = TAB_TO_PATH[activeTab] || '/';
        if (window.location.pathname === '/login' || window.location.pathname === '/register' || window.location.pathname === '/signup') {
          window.history.pushState({ tab: activeTab }, '', currentPath);
        }
      }
    } catch (e) {
      console.warn('URL pushState error:', e);
    }
  }, [activeTab, authModalMode]);

  const setChatDrawerOpen = useCallback((open: boolean) => {
    setChatDrawerOpenState(open);
    try {
      if (open) {
        if (window.location.pathname !== '/chat') {
          window.history.pushState({ modal: 'chat' }, '', '/chat');
        }
      } else {
        const currentPath = TAB_TO_PATH[activeTab] || '/';
        if (window.location.pathname === '/chat') {
          window.history.pushState({ tab: activeTab }, '', currentPath);
        }
      }
    } catch (e) {
      console.warn('URL pushState error:', e);
    }
  }, [activeTab]);

  const setNotifDrawerOpen = useCallback((open: boolean) => {
    setNotifDrawerOpenState(open);
    try {
      if (open) {
        if (window.location.pathname !== '/notifications') {
          window.history.pushState({ modal: 'notifications' }, '', '/notifications');
        }
      } else {
        const currentPath = TAB_TO_PATH[activeTab] || '/';
        if (window.location.pathname === '/notifications') {
          window.history.pushState({ tab: activeTab }, '', currentPath);
        }
      }
    } catch (e) {
      console.warn('URL pushState error:', e);
    }
  }, [activeTab]);

  const setRateModalOpen = useCallback((open: boolean) => {
    setRateModalOpenState(open);
    try {
      if (open) {
        if (window.location.pathname !== '/rate') {
          window.history.pushState({ modal: 'rate' }, '', '/rate');
        }
      } else {
        const currentPath = TAB_TO_PATH[activeTab] || '/';
        if (window.location.pathname === '/rate') {
          window.history.pushState({ tab: activeTab }, '', currentPath);
        }
      }
    } catch (e) {
      console.warn('URL pushState error:', e);
    }
  }, [activeTab]);

  const setWithdrawModalOpen = useCallback((open: boolean) => {
    setWithdrawModalOpenState(open);
    if (open) {
      setActiveTab('withdraw');
    }
  }, [setActiveTab]);

  // Sync activeTab and modal states when user navigates using browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
      
      if (path === '/login' || path === '/register' || path === '/signup') {
        setIsAuthModalOpenState(true);
        setAuthModalMode(path === '/register' || path === '/signup' ? 'register' : 'login');
      } else if (path === '/chat') {
        setChatDrawerOpenState(true);
      } else if (path === '/notifications') {
        setNotifDrawerOpenState(true);
      } else if (path === '/rate') {
        setRateModalOpenState(true);
      } else {
        setIsAuthModalOpenState(false);
        setChatDrawerOpenState(false);
        setNotifDrawerOpenState(false);
        setRateModalOpenState(false);
        const currentTab = getInitialTabFromUrl();
        setActiveTabState(currentTab);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [levels, setLevels] = useState<LevelConfig[]>(() => {
    try {
      const cached = localStorage.getItem('mf_levels_cache');
      return cached ? JSON.parse(cached) : DEFAULT_LEVELS;
    } catch {
      return DEFAULT_LEVELS;
    }
  });
  const [reviewShifts, setReviewShifts] = useState<Record<string, ShiftInfo>>(() => {
    try {
      const cached = localStorage.getItem('mf_shifts_cache');
      return cached ? JSON.parse(cached) : DEFAULT_SHIFTS;
    } catch {
      return DEFAULT_SHIFTS;
    }
  });
  const [paymentMethods, setPaymentMethods] = useState<Record<string, PaymentMethodConfig>>(() => {
    try {
      const cached = localStorage.getItem('mf_payment_methods_cache');
      return cached ? JSON.parse(cached) : DEFAULT_PAYMENT_METHODS;
    } catch {
      return DEFAULT_PAYMENT_METHODS;
    }
  });
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [isWithdrawDisabled, setIsWithdrawDisabled] = useState<boolean>(false);
  const [minWithdraw, setMinWithdraw] = useState<number>(150);
  const [commissionPercent, setCommissionPercent] = useState<number>(10);
  const [signupBonusUser, setSignupBonusUser] = useState<number>(5);
  const [signupBonusReferrer, setSignupBonusReferrer] = useState<number>(5);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    try {
      const cached = localStorage.getItem('mf_real_top_sellers');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_TOP_SELLERS;
  });
  const [topSellers, setTopSellers] = useState<TopSellerItem[]>(() => {
    try {
      const cached = localStorage.getItem('mf_top_sellers_list');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_TOP_SELLERS;
  });
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

  const appLogo = DEFAULT_LOGO;

  const [emailNotifWithdrawal, setEmailNotifWithdrawalState] = useState<boolean>(() => {
    return localStorage.getItem('mf_email_notif_withdrawal') !== 'false';
  });
  const [emailNotifExchange, setEmailNotifExchangeState] = useState<boolean>(() => {
    return localStorage.getItem('mf_email_notif_exchange') !== 'false';
  });

  const setEmailNotifWithdrawal = (val: boolean) => {
    setEmailNotifWithdrawalState(val);
    localStorage.setItem('mf_email_notif_withdrawal', String(val));
  };

  const setEmailNotifExchange = (val: boolean) => {
    setEmailNotifExchangeState(val);
    localStorage.setItem('mf_email_notif_exchange', String(val));
  };

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

    try {
      if ('Notification' in window && (window as any).Notification.permission === 'granted') {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((registration) => {
            if (registration && registration.showNotification) {
              registration.showNotification('Mail Factory', { body: `${title}: ${desc}`, icon: appLogo }).catch(console.error);
            }
          }).catch(console.error);
        }
      }
    } catch (err) {
      // Safely ignore Notification Illegal constructor or permission errors on mobile
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

  // Manage connection gracefully to prevent "Database is closing/hidden" errors
  useEffect(() => {
    const handleVisibility = () => {
      try {
        if (document.visibilityState === 'visible') {
          goOnline(db);
        }
      } catch (e) {
        console.warn('goOnline recovery catch:', e);
      }
    };
    const handleOnline = () => {
      try {
        goOnline(db);
      } catch (e) {
        console.warn('goOnline network catch:', e);
      }
    };

    // Ensure database is online on mount
    try {
      goOnline(db);
    } catch {}

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('online', handleOnline);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Sync Global Settings
  useEffect(() => {
    try {
      const settingsRef = ref(db, 'settings');
      const unsubscribe = onValue(
        settingsRef,
        (snap) => {
          if (snap.exists()) {
            const val = snap.val();
            if (val.review_shifts) {
              setReviewShifts(val.review_shifts);
              try { localStorage.setItem('mf_shifts_cache', JSON.stringify(val.review_shifts)); } catch {}
            }
            const pMethods = val.payment_methods;
            if (pMethods && typeof pMethods === 'object') {
              // Force 6% fee globally on all loaded payment methods
              Object.keys(pMethods).forEach((k) => {
                if (pMethods[k]) {
                  pMethods[k].feePercent = 6;
                }
              });
              setPaymentMethods(pMethods);
              try { localStorage.setItem('mf_payment_methods_cache', JSON.stringify(pMethods)); } catch {}
            } else {
              setPaymentMethods(DEFAULT_PAYMENT_METHODS);
            }
            if (val.maintenance_mode !== undefined) setMaintenanceMode(Boolean(val.maintenance_mode));
            if (val.withdraw_disabled !== undefined) setIsWithdrawDisabled(Boolean(val.withdraw_disabled));
            if (val.min_withdraw !== undefined) setMinWithdraw(Number(val.min_withdraw) || 150);
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
                try { localStorage.setItem('mf_levels_cache', JSON.stringify(parsedLevels)); } catch {}
              }
            }
          }
        },
        (err) => {
          console.warn('Settings listener connection notice:', err);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Settings listener error:', e);
    }
  }, []);

  // Sync Top Sellers Leaderboard (Configured directly in Firebase RTDB)
  useEffect(() => {
    try {
      const topSellersRef = ref(db, 'top_sellers');
      const unsubscribe = onValue(
        topSellersRef,
        (snap) => {
          if (snap.exists()) {
            const val = snap.val();
            let list: TopSellerItem[] = [];
            if (Array.isArray(val)) {
              list = val.filter(Boolean);
            } else if (val && typeof val === 'object') {
              list = Object.keys(val).map((k) => ({ ...val[k], uid: val[k].uid || k }));
            }

            // Filter out any fake demo sellers (such as seller_1, seller_2, etc.) or unwanted test names
            const realList: TopSellerItem[] = list
              .filter((s) => s && !isExcludedSeller(s.username, s.email, s.uid))
              .map((s, idx) => ({
                uid: s.uid || `user_${idx + 1}`,
                username: s.username || (s.email ? s.email.split('@')[0] : `Seller ${idx + 1}`),
                email: s.email || '',
                photoURL: s.photoURL || '',
                totalEarnings: Number(s.totalEarnings) || Number(s.balance) || 0,
                balance: Number(s.balance) || 0,
                manual_approved_count: Number(s.manual_approved_count) || Number(s.total_submitted) || 0,
                total_submitted: Number(s.total_submitted) || 0,
                badge: s.badge || (idx === 0 ? 'VIP Champion' : idx < 3 ? 'Diamond VIP' : 'Gold Partner'),
                rank: s.rank || idx + 1,
              }));

            setTopSellers(realList);
            try {
              localStorage.setItem('mf_top_sellers_list', JSON.stringify(realList));
            } catch {}
          } else {
            setTopSellers([]);
          }
        },
        (err) => {
          console.warn('top_sellers connection notice:', err);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('top_sellers listener error:', e);
      setTopSellers([]);
    }
  }, []);

  // Sync All Real Users from Firebase (for Referral List, Top Sellers & Admin picker)
  useEffect(() => {
    try {
      const usersRef = ref(db, 'users');
      const unsubscribe = onValue(
        usersRef,
        (snap) => {
          if (snap.exists()) {
            const list: UserProfile[] = [];
            snap.forEach((child) => {
              const u = child.val();
              if (u && typeof u === 'object') {
                u.uid = child.key;
                if (!u.username && u.email) {
                  u.username = u.email.split('@')[0];
                }
                list.push(u);
              }
            });
            if (list.length > 0) {
              const sorted = [...list].sort((a, b) => {
                const earnA = Number(a.totalEarnings) || (Number(a.balance || 0) + Number(a.total_withdrawn || 0)) || Number(a.balance || 0);
                const earnB = Number(b.totalEarnings) || (Number(b.balance || 0) + Number(b.total_withdrawn || 0)) || Number(b.balance || 0);
                return earnB - earnA;
              });
              setAllUsers(sorted);
              try {
                localStorage.setItem('mf_real_top_sellers', JSON.stringify(sorted));
              } catch {}
            }
          }
        },
        (err) => {
          console.warn('Users connection notice:', err);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Users listener error:', e);
    }
  }, []);

  // Top-level guaranteed auth loader unlock (prevents hanging in restricted browsers/sandboxes)
  useEffect(() => {
    const globalUnlockTimer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(globalUnlockTimer);
  }, []);

  // Persistent Auth State Listener properly scoped
  useEffect(() => {
    let unsubNotifs: (() => void) | null = null;
    let unsubUserRef: (() => void) | null = null;
    let unsubSubRef: (() => void) | null = null;
    let unsubWdRef: (() => void) | null = null;
    let unsubChatRef: (() => void) | null = null;
    let unsubAuth: (() => void) | null = null;

    const cleanupInnerListeners = () => {
      if (unsubNotifs) { try { unsubNotifs(); } catch {} unsubNotifs = null; }
      if (unsubUserRef) { try { unsubUserRef(); } catch {} unsubUserRef = null; }
      if (unsubSubRef) { try { unsubSubRef(); } catch {} unsubSubRef = null; }
      if (unsubWdRef) { try { unsubWdRef(); } catch {} unsubWdRef = null; }
      if (unsubChatRef) { try { unsubChatRef(); } catch {} unsubChatRef = null; }
    };

    const initializeAuth = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const googleUser = result.user;
          const userSnap = await get(ref(db, `users/${googleUser.uid}`));
          if (!userSnap.exists()) {
            const urlParams = new URLSearchParams(window.location.search);
            const refParam = urlParams.get('ref');
            let refId: string | null = null;
            if (refParam) {
              try {
                const q = query(ref(db, 'users'), orderByChild('referralCode'), equalTo(refParam));
                const sn = await get(q);
                if (sn.exists()) {
                  sn.forEach((c) => { refId = c.key; });
                }
              } catch { }
            }
            const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            await set(ref(db, `users/${googleUser.uid}`), {
              username: googleUser.displayName || 'Google User',
              email: googleUser.email,
              photoURL: googleUser.photoURL || '',
              balance: 100, // Fallback default signupBonusUser
              hold: 0,
              paymentNumber: '',
              paymentMethod: '',
              createdAt: Date.now(),
              referralCode,
              referredBy: refId || '',
              referralEarnings: 0,
              last_login: Date.now(),
              login_streak: 1,
              total_submitted: 0,
              total_withdrawn: 0,
              auth_provider: 'google',
            });
            if (refId) {
              try {
                await update(ref(db, `users/${refId}`), {
                  referralEarnings: increment(50), // Fallback default signupBonusReferrer
                });
              } catch { }
            }
          }
        }
      } catch (err) {
        console.error('Redirect result error', err);
      }

      unsubAuth = onAuthStateChanged(auth, async (currUser) => {
        cleanupInnerListeners();
        setUser(currUser);

        if (currUser) {
        let isResolved = false;
        const markLoaded = () => {
          if (!isResolved) {
            isResolved = true;
            setLoading(false);
          }
        };

        // Safety fallback timer (max 1.5 seconds) so app is never stuck on slow networks
        const safetyTimer = setTimeout(() => {
          markLoaded();
        }, 1500);

        try {
          const userRef = ref(db, `users/${currUser.uid}`);
          const notifsRef = ref(db, `users/${currUser.uid}/notifications`);
          const isAdminUser = Boolean(
            currUser.email && (currUser.email === 'gmrony135@gmail.com' || currUser.email === 'mailfactorybd@gmail.com')
          );
          
          unsubNotifs = onValue(
            notifsRef,
            (snap) => {
              if (snap.exists()) {
                const data = snap.val();
                const fbNotifs = Object.entries(data).map(([key, val]) => ({
                  ...(val as any),
                  id: key,
                }));
                
                setNotifications(prev => {
                  const existingIds = new Set(prev.map(n => n.id));
                  const newNotifs = fbNotifs.filter(n => !existingIds.has(n.id));
                  if (newNotifs.length > 0) {
                    const updated = [...newNotifs, ...prev].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
                    localStorage.setItem('mf_notifications_v2', JSON.stringify(updated));
                    return updated;
                  }
                  return prev;
                });
              }
            },
            (err) => {
              console.warn('Notifs connection notice:', err);
            }
          );

          unsubUserRef = onValue(
            userRef,
            (snap) => {
              if (snap.exists()) {
                const data = snap.val() as UserProfile;
                data.uid = currUser.uid;
                setProfile(data);
                try {
                  localStorage.setItem('mf_last_user_profile', JSON.stringify(data));
                } catch {}
              }
              clearTimeout(safetyTimer);
              markLoaded();
            },
            (err) => {
              console.warn('UserRef connection notice:', err);
              clearTimeout(safetyTimer);
              markLoaded();
            }
          );

          // Fetch user submissions (Admins listen to master submissions; regular users query master submissions by userId)
          const subRef = isAdminUser ? ref(db, 'submissions') : query(ref(db, 'submissions'), orderByChild('userId'), equalTo(currUser.uid));
          unsubSubRef = onValue(
            subRef,
            (snap) => {
              const mySubs: Submission[] = [];
              if (snap.exists()) {
                snap.forEach((c) => {
                  const sub = c.val() as Submission;
                  if (isAdminUser || sub.userId === currUser.uid) {
                    sub.key = c.key;
                    mySubs.push(sub);
                  }
                });
                mySubs.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
              }
              setSubmissions(mySubs);
            },
            (err) => {
              console.warn('Submissions connection notice:', err);
            }
          );

          // Fetch user withdrawals (Admins listen to master requests; regular users query master requests by userId)
          const wdRef = isAdminUser ? ref(db, 'withdraw_requests') : query(ref(db, 'withdraw_requests'), orderByChild('userId'), equalTo(currUser.uid));
          unsubWdRef = onValue(
            wdRef,
            (snap) => {
              const myWds: WithdrawRequest[] = [];
              if (snap.exists()) {
                snap.forEach((c) => {
                  const wd = c.val() as WithdrawRequest;
                  if (isAdminUser || wd.userId === currUser.uid) {
                    wd.key = c.key;
                    myWds.push(wd);
                  }
                });
                myWds.sort((a, b) => (b.requestedAt || 0) - (a.requestedAt || 0));
              }
              setWithdrawRequests(myWds);
            },
            (err) => {
              console.warn('Withdrawals connection notice:', err);
            }
          );

          // Listen for support chat messages
          const chatRef = ref(db, `support_chats/${currUser.uid}`);
          unsubChatRef = onChildAdded(
            chatRef,
            (snapshot) => {
              const msg = snapshot.val();
              if (msg) {
                setChatMessages((prev) => {
                  if (prev.some((m) => m.id === snapshot.key)) return prev;
                  return [...prev, { id: snapshot.key || String(Date.now()), ...msg }];
                });
              }
            },
            (err) => {
              console.warn('Chat connection notice:', err);
            }
          );
        } catch (e) {
          console.warn('Profile sync error:', e);
          clearTimeout(safetyTimer);
          markLoaded();
        }
      } else {
        setProfile(null);
        setSubmissions([]);
        setWithdrawRequests([]);
        setLoading(false);
      }
    });
    }; // Close initializeAuth

    initializeAuth();

    return () => {
      cleanupInnerListeners();
      if (unsubAuth) unsubAuth();
    };
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

    try {
      await update(ref(db, `users/${user.uid}`), {
        login_streak: newStreak,
        last_login_date: today,
      });
    } catch {
      // safe fallback
    }

    addNotification('Daily Streak Bonus 🔥', `Streak Day ${newStreak}! Streak recorded successfully.`, 'success');
    return { success: true, streakCount: newStreak };
  };

  // Submit Gmail Exchange
  
  // --- Client-Side Real-Time Syncing (Self-Healing Balances) ---
  useEffect(() => {
    if (!user || !profile || (submissions.length === 0 && withdrawRequests.length === 0)) return;

    let balanceDelta = 0;
    let holdDelta = 0;
    const updates = {};

    submissions.forEach(sub => {
        if (sub.status === 'approved' && !sub.processedForBalance) {
            balanceDelta += sub.totalAmount;
            holdDelta -= sub.totalAmount;
            updates[`submissions/${sub.key}/processedForBalance`] = true;
        } else if (sub.status === 'rejected' && !sub.processedForBalance) {
            holdDelta -= sub.totalAmount;
            updates[`submissions/${sub.key}/processedForBalance`] = true;
        }
    });

    withdrawRequests.forEach(wd => {
        if (wd.status === 'rejected' && !wd.processedForBalance) {
            balanceDelta += wd.amount;
            updates[`withdraw_requests/${wd.key}/processedForBalance`] = true;
        } else if (wd.status === 'approved' && !wd.processedForBalance) {
            // Already deducted upon request
            updates[`withdraw_requests/${wd.key}/processedForBalance`] = true;
        }
    });

    if (Object.keys(updates).length > 0) {
        const applyReconciliation = async () => {
            try {
                if (balanceDelta !== 0 || holdDelta !== 0) {
                    updates[`users/${user.uid}/balance`] = (profile.balance || 0) + balanceDelta;
                    updates[`users/${user.uid}/hold`] = Math.max(0, (profile.hold || 0) + holdDelta);
                    if (balanceDelta > 0) {
                        updates[`users/${user.uid}/totalEarnings`] = (profile.totalEarnings || 0) + balanceDelta;
                    }
                }
                await update(ref(db), updates);
            } catch (e) {
                console.error('Failed to sync real-time balance', e);
            }
        };
        applyReconciliation();
    }
  }, [submissions, withdrawRequests, profile?.balance, profile?.hold, profile?.totalEarnings, user]);
  // -----------------------------------------------------------

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
        // Normalize gmail to prevent dot trick (t.e.s.t@gmail.com == test@gmail.com)
        const localPart = item.email.split('@')[0].replace(/\./g, '');
        const normalizedEmail = `${localPart}@gmail.com`.toLowerCase();
        
        const q = query(ref(db, 'used_emails'), orderByChild('email'), equalTo(normalizedEmail));
        const snap = await get(q);
        if (snap.exists()) {
          return { success: false, message: `Email "${item.email}" has already been submitted in the past.` };
        }
      }

            // Create submission
      const newSubRef = push(ref(db, 'submissions'));
      const subKey = newSubRef.key || String(Date.now());
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

      const updates: any = {};
      updates[`submissions/${subKey}`] = newSub;
      updates[`users/${user.uid}/hold`] = (profile?.hold || 0) + data.totalAmount;
      updates[`users/${user.uid}/total_submitted`] = (profile?.total_submitted || 0) + data.count;
      
      // Record in used_emails
      for (const g of data.gmails) {
        const localPart = g.email.split('@')[0].replace(/\./g, '');
        const normalizedEmail = `${localPart}@gmail.com`.toLowerCase();
        
        const emailRef = push(ref(db, 'used_emails'));
        updates[`used_emails/${emailRef.key}`] = { email: normalizedEmail, submittedAt: Date.now() };
      }

      await update(ref(db), updates);
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
    feeAmount?: number;
    netAmount?: number;
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
      const wdKey = newWdRef.key || String(Date.now());
      const newWd: WithdrawRequest = {
        userId: user.uid,
        username: profile.username || 'User',
        amount: data.amount,
        feeAmount: data.feeAmount || 0,
        netAmount: data.netAmount || data.amount,
        method: data.method,
        paymentMethod: data.methodName,
        paymentNumber: data.accountNumber,
        status: 'pending',
        requestedAt: Date.now(),
        
      };

      const updates: any = {};
      updates[`withdraw_requests/${wdKey}`] = newWd;
      updates[`users/${user.uid}/balance`] = (profile.balance || 0) - data.amount;
      updates[`users/${user.uid}/total_withdrawn`] = (profile.total_withdrawn || 0) + data.amount;
      updates[`users/${user.uid}/paymentNumber`] = data.accountNumber;
      updates[`users/${user.uid}/paymentMethod`] = data.method;

      await update(ref(db), updates);
    } catch (e: any) {
      return { success: false, message: e.message || 'Withdraw failed' };
    }

    addNotification(
        'Withdrawal Requested 💸',
        `৳${data.amount} requested via ${data.methodName}. Payout will arrive in 24-48 hours.`,
        'warning'
      );

      return { success: true };
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

  // Sync Real Users to Top Sellers
  const syncRealUsersToTopSellers = async (): Promise<TopSellerItem[]> => {
    try {
      let sourceUsers = allUsers;
      if (sourceUsers.length === 0) {
        const snap = await get(ref(db, 'users'));
        if (snap.exists()) {
          const list: UserProfile[] = [];
          snap.forEach((child) => {
            const u = child.val();
            if (u && typeof u === 'object') {
              u.uid = child.key;
              if (!u.username && u.email) {
                u.username = u.email.split('@')[0];
              }
              list.push(u);
            }
          });
          sourceUsers = list;
        }
      }

      // Filter out demo placeholders / unwanted test accounts and sort by real earnings/balance
      const realFiltered = [...sourceUsers]
        .filter((u) => u && !isExcludedSeller(u.username, u.email, u.uid))
        .sort((a, b) => {
          const earnA = Number(a.totalEarnings) || (Number(a.balance || 0) + Number(a.total_withdrawn || 0)) || Number(a.balance || 0);
          const earnB = Number(b.totalEarnings) || (Number(b.balance || 0) + Number(b.total_withdrawn || 0)) || Number(b.balance || 0);
          return earnB - earnA;
        });

      const top10: TopSellerItem[] = realFiltered.slice(0, 10).map((u, idx) => ({
        uid: u.uid || `user_${idx + 1}`,
        username: u.username || (u.email ? u.email.split('@')[0] : `Seller ${idx + 1}`),
        email: u.email || '',
        photoURL: u.photoURL || '',
        totalEarnings: Number(u.totalEarnings) || (Number(u.balance || 0) + Number(u.total_withdrawn || 0)) || Number(u.balance || 0),
        balance: Number(u.balance) || 0,
        manual_approved_count: Number(u.manual_approved_count) || Number(u.total_submitted) || 0,
        total_submitted: Number(u.total_submitted) || 0,
        badge: idx === 0 ? 'VIP Champion' : idx < 3 ? 'Diamond VIP' : 'Gold Partner',
        rank: idx + 1,
      }));

      setTopSellers(top10);
      try {
        await set(ref(db, 'top_sellers'), top10);
        localStorage.setItem('mf_top_sellers_list', JSON.stringify(top10));
      } catch (err) {
        console.warn('Failed to publish to top_sellers:', err);
      }
      return top10;
    } catch (e) {
      console.error('Error syncing real users to top sellers:', e);
      return [];
    }
  };

  const contextValue = useMemo<AppContextType>(() => ({
    user,
    profile,
    loading,
    language,
    setLanguage: handleLanguageChange,
    emailNotifWithdrawal,
    setEmailNotifWithdrawal,
    emailNotifExchange,
    setEmailNotifExchange,
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
    topSellers,
    setTopSellers,
    syncRealUsersToTopSellers,
    chatMessages,
    sendChatMessage,
    submitGmails,
    requestWithdraw,
    updateProfileData,
    isAuthModalOpen,
    authModalMode,
    setAuthModalOpen,
    setAuthModalMode,
    isWithdrawModalOpen,
    setWithdrawModalOpen,
    isChatDrawerOpen,
    setChatDrawerOpen,
    isNotifDrawerOpen,
    setNotifDrawerOpen,
    isSettingsDrawerOpen,
    setSettingsDrawerOpen,
    isRateModalOpen,
    setRateModalOpen,
    claimDailyStreak,
    appLogo,
    copyText,
  }), [
    user,
    profile,
    loading,
    language,
    handleLanguageChange,
    emailNotifWithdrawal,
    emailNotifExchange,
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
    topSellers,
    setTopSellers,
    syncRealUsersToTopSellers,
    chatMessages,
    sendChatMessage,
    submitGmails,
    requestWithdraw,
    updateProfileData,
    isAuthModalOpen,
    authModalMode,
    setAuthModalOpen,
    setAuthModalMode,
    isWithdrawModalOpen,
    setWithdrawModalOpen,
    isChatDrawerOpen,
    setChatDrawerOpen,
    isNotifDrawerOpen,
    setNotifDrawerOpen,
    isSettingsDrawerOpen,
    setSettingsDrawerOpen,
    isRateModalOpen,
    setRateModalOpen,
    claimDailyStreak,
    appLogo,
    copyText,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
