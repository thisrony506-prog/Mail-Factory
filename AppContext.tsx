import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getClientFingerprint, getUrlParam } from './deviceUtils';
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
  BuyerOrder,
  DepositRequest,
  BuyerProduct,
  LevelConfig,
  ShiftInfo,
  PaymentMethodConfig,
  AppNotification,
  PriceAlertSubscription,
  ChatMessage,
  ActiveTab,
  Language,
  TopSellerItem,
  isExcludedSeller,
  normalizeSubmissionStatus,
  calculateFriendApprovedStats,
} from './types';

export const DEFAULT_LOGO = "/app-logo.png";

export const AUTHORIZED_ADMINS = [
  'gmrony135@gmail.com',
  'mailfactorybd@gmail.com',
  'iamronyofficial1@gmail.com',
  'rmarketing154@gmail.com'
];

export const DEFAULT_BUYER_PRODUCTS: BuyerProduct[] = [];

export const DEFAULT_LEVELS: LevelConfig[] = [
  { level: 1, approved: 0, rate: 15, old_rate: 17, title: 'Bronze Member', perkDescription: 'Standard exchange rate' },
  { level: 2, approved: 40, rate: 16, old_rate: 18, title: 'Silver Member', perkDescription: '+1৳ per Gmail' },
  { level: 3, approved: 100, rate: 17, old_rate: 19, title: 'Gold VIP', perkDescription: '+2৳ per Gmail + Fast payouts' },
  { level: 4, approved: 250, rate: 18, old_rate: 20, title: 'Platinum Partner', perkDescription: '+3৳ per Gmail + Instant audit' },
  { level: 5, approved: 500, rate: 20, old_rate: 22, title: 'Diamond Boss', perkDescription: 'Maximum rate + VIP 24/7 dedicated review' },
];

export const DEFAULT_TOP_SELLERS: UserProfile[] = [];

export const INITIAL_TOP_SELLERS: TopSellerItem[] = [];

export const DEFAULT_SHIFTS: Record<string, ShiftInfo> = {
  shift1: { title: 'শুভ রাত্রি প্রথম সময়', time: '', active: true, order: 1, icon: 'moon', hours: 24, minutes: 0, startTime: 0 },
  shift2: { title: 'শুভ দিনের প্রথম সময়', time: '', active: true, order: 2, icon: 'sun', hours: 8, minutes: 0, startTime: 0 },
};

export const normalizeShiftData = (raw: any): Record<string, ShiftInfo> => {
  if (!raw || typeof raw !== 'object') return {};
  const result: Record<string, ShiftInfo> = {};

  Object.keys(raw).forEach((key) => {
    const item = raw[key];
    if (item && typeof item === 'object') {
      const normalizedKey = key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(); // converts shift_1, shift-1, Shift1 -> shift1
      
      const rawStart = item.startTime ?? item.timer_started_at ?? item.start_time ?? item.startedAt ?? item.started_at;
      let startVal = rawStart !== undefined && rawStart !== null ? Number(rawStart) : 0;
      if (startVal > 0 && startVal < 10000000000) {
        // convert seconds to ms if 10-digit unix timestamp was passed
        startVal = startVal * 1000;
      }

      const hoursVal = item.hours !== undefined ? Number(item.hours) : (item.duration_hours !== undefined ? Number(item.duration_hours) : (item.durationHour !== undefined ? Number(item.durationHour) : 0));
      const minutesVal = item.minutes !== undefined ? Number(item.minutes) : (item.duration_minutes !== undefined ? Number(item.duration_minutes) : (item.durationMin !== undefined ? Number(item.durationMin) : 0));

      result[normalizedKey] = {
        title: item.title || (normalizedKey === 'shift1' ? 'শুভ রাত্রি প্রথম সময়' : 'শুভ দিনের প্রথম সময়'),
        time: item.time !== undefined && item.time !== null ? String(item.time) : '',
        active: item.active === true || item.active === 'true' || (item.active === undefined && startVal > 0),
        order: item.order !== undefined ? Number(item.order) : (normalizedKey === 'shift1' ? 1 : 2),
        icon: item.icon || (normalizedKey === 'shift1' ? 'moon' : 'sun'),
        startTime: startVal,
        start_time: startVal,
        timer_started_at: startVal,
        hours: hoursVal,
        duration_hours: hoursVal,
        minutes: minutesVal,
        duration_minutes: minutesVal,
      };
    }
  });
  return result;
};

export const DEFAULT_PAYMENT_METHODS: Record<string, PaymentMethodConfig> = {
  bkash: { name: 'bKash', icon: 'bi-wallet2', color: '#E2136E', active: true, minWithdraw: 150, feePercent: 6 },
  nagad: { name: 'Nagad', icon: 'bi-wallet2', color: '#F6921D', active: true, minWithdraw: 150, feePercent: 6 },
  rocket: { name: 'Rocket', icon: 'bi-send-check', color: '#8C3494', active: true, minWithdraw: 150, feePercent: 6 },
  binance: { name: 'USDT (BEP20)', icon: 'bi-currency-exchange', color: '#F0B90B', active: true, minWithdraw: 240, feePercent: 6 },
};

interface AppContextType {
  appMode: 'selling' | 'buying';
  setAppMode: (mode: 'selling' | 'buying') => void;
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
  allSubmissions: Submission[];
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
  buyerProducts: BuyerProduct[];
  buyerOrders: BuyerOrder[];
  depositRequests: DepositRequest[];
  isAdmin: boolean;
  deleteBuyerProduct: (productId: string) => Promise<{ success: boolean; message?: string }>;
  createBuyerOrder: (productId: string, quantity: number) => Promise<{ success: boolean; orderId?: string; reason?: string; shortfall?: number; message?: string }>;
  approveBuyerOrder: (orderId: string, gmails: Array<{ gmail: string; password: string; recoveryEmail?: string }>, adminNote?: string) => Promise<{ success: boolean; message?: string }>;
  rejectBuyerOrder: (orderId: string, adminNote?: string) => Promise<{ success: boolean; message?: string }>;
  requestDeposit: (data: { amount: number; method: string; paymentNumber: string; trxId: string }) => Promise<{ success: boolean; message?: string }>;
  sandboxVerifyDeposit: (depositId: string) => Promise<{ success: boolean; message?: string }>;
  verifyBuyerDeposit: (depositId: string, approve: boolean, adminSecret?: string) => Promise<{ success: boolean; message?: string }>;
  claimDailyStreak: () => Promise<{ success: boolean; streakCount: number; bonusAmount?: number }>;
  claimReferralEarnings: () => Promise<{ success: boolean; addedAmount: number; message: string }>;
  appLogo: string;
  copyText: (text: string, label?: string) => Promise<boolean>;
  priceAlerts: PriceAlertSubscription[];
  isPriceAlertModalOpen: boolean;
  setPriceAlertModalOpen: (open: boolean) => void;
  subscribePriceAlert: (data: { accountType: 'fresh' | 'aged' | 'all'; targetPrice?: number; direction?: 'any_change' | 'price_drop' | 'target_or_below' }) => Promise<{ success: boolean; message?: string }>;
  unsubscribePriceAlert: (id: string) => Promise<{ success: boolean; message?: string }>;
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
  buyer_market: '/buyer/market',
  buyer_orders: '/buyer/orders',
  buyer_wallet: '/buyer/wallet',
  buyer_deposit: '/buyer/deposit',
  buyer_transactions: '/buyer/transactions',
  buyer_policies: '/buyer/policies',
  'buy-gmail-accounts': '/buy-gmail-accounts',
  'sell-old-gmail-accounts': '/sell-gmail-accounts',
  login: '/login',
  register: '/register',
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
  '/buyer': 'buyer_market',
  '/buyer/market': 'buyer_market',
  '/buyer-market': 'buyer_market',
  '/buying-gmails': 'buyer_market',
  '/buy': 'buyer_market',
  '/shop': 'buyer_market',
  '/marketplace': 'buyer_market',
  '/buyer/orders': 'buyer_orders',
  '/buyer-orders': 'buyer_orders',
  '/my-orders': 'buyer_orders',
  '/orders': 'buyer_orders',
  '/buyer/wallet': 'buyer_wallet',
  '/buyer-wallet': 'buyer_wallet',
  '/my-wallet': 'buyer_wallet',
  '/wallet': 'buyer_wallet',
  '/buyer/deposit': 'buyer_deposit',
  '/buyer-deposit': 'buyer_deposit',
  '/deposit': 'buyer_deposit',
  '/add-funds': 'buyer_deposit',
  '/buyer/transactions': 'buyer_transactions',
  '/buyer-transactions': 'buyer_transactions',
  '/buyer/policies': 'buyer_policies',
  '/buyer-policies': 'buyer_policies',
  '/buy-gmail-accounts': 'buy-gmail-accounts',
  '/buy-gmail-accounts/': 'buy-gmail-accounts',
  '/sell-old-gmail-accounts': 'sell-old-gmail-accounts',
  '/sell-old-gmail-accounts/': 'sell-old-gmail-accounts',
  '/sell-gmail-accounts': 'sell-old-gmail-accounts',
  '/sell-gmail-accounts/': 'sell-old-gmail-accounts',
  '/register': 'register',
  '/signup': 'register',
  '/login': 'login',
  '/admin': 'home',
  '/admin-panel': 'home',
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
    const hash = window.location.hash.replace(/^#/, '').toLowerCase();
    if (hash) {
      const [hashPath] = hash.split('?');
      const formatted = `/${hashPath.replace(/^\//, '')}`;
      if (PATH_TO_TAB[formatted]) {
        return PATH_TO_TAB[formatted];
      }
    }
  } catch (e) {
    console.warn('URL parsing error:', e);
    return 'home';
  }
  return 'home';
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appMode, setAppMode] = useState<'selling' | 'buying'>('selling');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem('mf_last_user_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  // Local state caching layer for profile and wallet data
  useEffect(() => {
    if (profile && profile.uid) {
      try {
        localStorage.setItem('mf_last_user_profile', JSON.stringify(profile));
        localStorage.setItem(`mf_wallet_cache_${profile.uid}`, JSON.stringify({
          balance: profile.balance || 0,
          deposit_balance: profile.deposit_balance || 0,
          hold: profile.hold || 0,
          totalEarnings: profile.totalEarnings || 0,
          referralEarnings: profile.referralEarnings || 0,
          updatedAt: Date.now()
        }));
      } catch (e) {
        console.warn('Failed to cache profile/wallet data:', e);
      }
    }
  }, [profile]);
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
      const hash = window.location.hash.toLowerCase();
      const hasRef = getUrlParam('ref') !== null;
      return path === '/login' || path === '/register' || path === '/signup' ||
             hash.includes('register') || hash.includes('signup') || hash.includes('login') || hasRef;
    } catch {
      return false;
    }
  });

  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>(() => {
    try {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const hasRef = getUrlParam('ref') !== null;
      if (path === '/register' || path === '/signup' || hash.includes('register') || hash.includes('signup') || hasRef) {
        return 'register';
      }
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
  const [isPriceAlertModalOpen, setPriceAlertModalOpen] = useState<boolean>(false);

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
    if (open) {
      markAllNotificationsRead();
    }
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
      if (cached) {
        const parsed = normalizeShiftData(JSON.parse(cached));
        if (Object.keys(parsed).length > 0) return { ...DEFAULT_SHIFTS, ...parsed };
      }
      return DEFAULT_SHIFTS;
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
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>([]);
  const [buyerProducts, setBuyerProducts] = useState<BuyerProduct[]>(() => {
    try {
      const cached = localStorage.getItem('mf_buyer_products');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter(
            (p: any) => p && !p.isDeleted && !p.deleted && p.status !== 'deleted' && p.active !== false && p.id !== 'pva-phone-verified-gmail' && p.id !== 'bulk-enterprise-pack-50' && (p.category === 'fresh' || p.category === 'aged')
          );
          if (filtered.length > 0) return filtered;
        }
      }
    } catch {}
    return DEFAULT_BUYER_PRODUCTS;
  });
  const [buyerOrders, setBuyerOrders] = useState<BuyerOrder[]>(() => {
    try {
      const cached = localStorage.getItem('mf_buyer_orders');
      if (cached) return JSON.parse(cached);
    } catch {}
    return [];
  });
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>(() => {
    try {
      const cached = localStorage.getItem('mf_deposit_requests');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed.filter((d: any) => typeof d.amount === 'number' && !isNaN(d.amount) && d.amount > 0 && typeof d.trxId === 'string' && d.trxId.trim() !== '');
        }
      }
    } catch {}
    return [];
  });
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

  const [priceAlerts, setPriceAlerts] = useState<PriceAlertSubscription[]>(() => {
    try {
      const saved = localStorage.getItem('mf_price_alerts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const prevProductsRef = useRef<BuyerProduct[] | null>(null);

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
      const updated = [newNotif, ...(prev || []).slice(0, 49)];
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

  // Firebase connection persistence monitoring (.info/connected)
  useEffect(() => {
    try {
      const connectedRef = ref(db, '.info/connected');
      const unsubscribeConnected = onValue(connectedRef, (snap) => {
        const isConnected = snap.val() === true;
        console.log('[Firebase Connection Status] RTDB Connected:', isConnected);
        if (isConnected) {
          try {
            goOnline(db);
          } catch {}
        }
      });
      return () => unsubscribeConnected();
    } catch (e) {
      console.warn('Connection listener error:', e);
    }
  }, []);

  // Database operation retry and logging helpers
  const logDbOp = (opName: string, path: string, details?: any) => {
    console.log(`[Firebase DB Operation] ${opName} at path: "${path}"`, details || '');
  };

  const getWithRetry = async (dbRef: any, maxRetries = 3, delayMs = 1000): Promise<any> => {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        attempt++;
        logDbOp('GET', dbRef.toString(), { attempt });
        const snap = await get(dbRef);
        return snap;
      } catch (error) {
        console.warn(`[Firebase DB Operation] GET failed at "${dbRef.toString()}" (attempt ${attempt}/${maxRetries}):`, error);
        if (attempt >= maxRetries) throw error;
        await new Promise(res => setTimeout(res, delayMs * attempt));
      }
    }
  };

  const updateWithRetry = async (dbRefOrPath: any, values: any, maxRetries = 3, delayMs = 1000): Promise<any> => {
    let attempt = 0;
    const targetRef = typeof dbRefOrPath === 'string' ? ref(db, dbRefOrPath) : dbRefOrPath;
    while (attempt < maxRetries) {
      try {
        attempt++;
        logDbOp('UPDATE', targetRef.toString(), { keys: Object.keys(values), attempt });
        await update(targetRef, values);
        return true;
      } catch (error) {
        console.warn(`[Firebase DB Operation] UPDATE failed at "${targetRef.toString()}" (attempt ${attempt}/${maxRetries}):`, error);
        if (attempt >= maxRetries) throw error;
        await new Promise(res => setTimeout(res, delayMs * attempt));
      }
    }
  };

  // Sync Global Settings
  useEffect(() => {
    try {
      const settingsRef = ref(db, 'settings');
      const unsubscribe = onValue(
        settingsRef,
        (snap) => {
          if (snap.exists()) {
            const val = snap.val();
            if (val.review_shifts || val.shifts) {
              const parsed = normalizeShiftData(val.review_shifts || val.shifts);
              if (Object.keys(parsed).length > 0) {
                setReviewShifts((prev) => {
                  const updated = { ...prev, ...parsed };
                  try { localStorage.setItem('mf_shifts_cache', JSON.stringify(updated)); } catch {}
                  return updated;
                });
              }
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

  // Sync Shifts directly (from RTDB paths 'shifts', 'review_shifts', etc.)
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    const handleShiftsSnap = (snap: any) => {
      if (snap.exists()) {
        const val = snap.val();
        if (val && typeof val === 'object') {
          const parsed = normalizeShiftData(val);
          if (Object.keys(parsed).length > 0) {
            setReviewShifts((prev) => {
              const updated = { ...prev, ...parsed };
              try { localStorage.setItem('mf_shifts_cache', JSON.stringify(updated)); } catch {}
              return updated;
            });
          }
        }
      }
    };

    try {
      unsubs.push(onValue(ref(db, 'shifts'), handleShiftsSnap, (err) => console.warn('Shifts listener notice:', err)));
    } catch (e) {
      console.warn('Shifts listener error:', e);
    }

    try {
      unsubs.push(onValue(ref(db, 'review_shifts'), handleShiftsSnap, (err) => console.warn('Review shifts listener notice:', err)));
    } catch (e) {
      console.warn('Review shifts listener error:', e);
    }

    return () => {
      unsubs.forEach((u) => {
        try { u(); } catch {}
      });
    };
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
                manual_approved_count: s.manual_approved_count !== undefined ? Number(s.manual_approved_count) : (Number(s.total_submitted) || 0),
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

  // Sync Buyer Products from Firebase RTDB (Real-time Deletion & Update Sync)
  useEffect(() => {
    try {
      const prodRef = ref(db, 'buyer_products');
      const unsubscribe = onValue(
        prodRef,
        (snap) => {
          if (snap.exists()) {
            const val = snap.val();
            let list: BuyerProduct[] = [];
            if (Array.isArray(val)) {
              list = val
                .filter((p: any) => p && !p.isDeleted && !p.deleted && p.deleted !== 'true' && p.status !== 'deleted' && p.active !== false)
                .map((p: any, idx) => {
                  const prodId = p.id || `product_${idx}`;
                  const autoCode = p.code || p.sku || `PKG-GM${(idx + 1).toString().padStart(2, '0')}`;
                  return {
                    id: prodId,
                    code: autoCode,
                    sku: autoCode,
                    title: p.title || 'Gmail Package',
                    titleBn: p.titleBn,
                    category: p.category || 'fresh',
                    price: Number(p.price) || 0,
                    oldPrice: p.oldPrice ? Number(p.oldPrice) : undefined,
                    stock: Number(p.stock) || 0,
                    rating: Number(p.rating) || 5,
                    reviewsCount: Number(p.reviewsCount) || 50,
                    deliveryTime: p.deliveryTime || '1 - 24 Hours',
                    deliveryTimeBn: p.deliveryTimeBn,
                    description: p.description || '',
                    descriptionBn: p.descriptionBn,
                    features: Array.isArray(p.features) ? p.features : typeof p.features === 'string' ? p.features.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
                    featuresBn: Array.isArray(p.featuresBn) ? p.featuresBn : typeof p.featuresBn === 'string' ? p.featuresBn.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
                    badge: p.badge,
                    badgeBn: p.badgeBn,
                    minQty: Number(p.minQty) || 1,
                    maxQty: p.maxQty ? Number(p.maxQty) : undefined,
                  };
                });
            } else if (val && typeof val === 'object') {
              list = Object.keys(val)
                .filter((k) => {
                  const p = val[k];
                  return p && !p.isDeleted && !p.deleted && p.deleted !== 'true' && p.status !== 'deleted' && p.active !== false;
                })
                .map((k, idx) => {
                  const p = val[k] || {};
                  const prodId = p.id || k;
                  const autoCode = p.code || p.sku || `PKG-GM${(idx + 1).toString().padStart(2, '0')}`;
                  return {
                    ...p,
                    id: prodId,
                    code: autoCode,
                    sku: autoCode,
                    title: p.title || 'Gmail Package',
                    titleBn: p.titleBn,
                    category: p.category || 'fresh',
                    price: Number(p.price) || 0,
                    oldPrice: p.oldPrice ? Number(p.oldPrice) : undefined,
                    stock: Number(p.stock) || 0,
                    rating: Number(p.rating) || 5,
                    reviewsCount: Number(p.reviewsCount) || 50,
                    deliveryTime: p.deliveryTime || '1 - 24 Hours',
                    deliveryTimeBn: p.deliveryTimeBn,
                    description: p.description || '',
                    descriptionBn: p.descriptionBn,
                    features: Array.isArray(p.features) ? p.features : typeof p.features === 'string' ? p.features.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
                    featuresBn: Array.isArray(p.featuresBn) ? p.featuresBn : typeof p.featuresBn === 'string' ? p.featuresBn.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
                    badge: p.badge,
                    badgeBn: p.badgeBn,
                    minQty: Number(p.minQty) || 1,
                    maxQty: p.maxQty ? Number(p.maxQty) : undefined,
                  };
                });
            }
            // Check price changes for subscribed alerts
            if (prevProductsRef.current && prevProductsRef.current.length > 0) {
              const oldProds = prevProductsRef.current;
              list.forEach((newProd) => {
                const oldProd = oldProds.find((o) => o.id === newProd.id);
                if (oldProd && oldProd.price !== newProd.price) {
                  const isDrop = newProd.price < oldProd.price;
                  const diff = Math.abs(oldProd.price - newProd.price);

                  // Check if current user has an active alert subscription
                  const matchingAlerts = priceAlerts.filter(
                    (a) => a.active && (a.accountType === 'all' || a.accountType === newProd.category)
                  );

                  matchingAlerts.forEach((alert) => {
                    let shouldTrigger = false;
                    if (alert.direction === 'any_change') {
                      shouldTrigger = true;
                    } else if (alert.direction === 'price_drop' && isDrop) {
                      shouldTrigger = true;
                    } else if (alert.direction === 'target_or_below' && alert.targetPrice) {
                      if (newProd.price <= alert.targetPrice && oldProd.price > alert.targetPrice) {
                        shouldTrigger = true;
                      }
                    }

                    if (shouldTrigger) {
                      const prodTitle = language === 'bn' && newProd.titleBn ? newProd.titleBn : newProd.title;
                      const title = isDrop
                        ? (language === 'bn' ? `🔔 প্রাইস ড্রপ অ্যালার্ট: ৳${newProd.price}!` : `🔔 Price Drop: ৳${newProd.price}!`)
                        : (language === 'bn' ? `🔔 দাম পরিবর্তন হয়েছে: ${prodTitle}` : `🔔 Price Updated: ${prodTitle}`);
                      
                      const desc = isDrop
                        ? (language === 'bn'
                            ? `${prodTitle}-এর দাম ৳${oldProd.price} থেকে কমে ৳${newProd.price} হয়েছে (৳${diff.toFixed(0)} ছাড়)! এখনই অর্ডার করুন।`
                            : `Price for ${prodTitle} dropped from ৳${oldProd.price} to ৳${newProd.price}! Place your order now.`)
                        : (language === 'bn'
                            ? `${prodTitle}-এর নতুন দাম ৳${newProd.price} নির্ধারণ করা হয়েছে।`
                            : `Price for ${prodTitle} has updated to ৳${newProd.price}.`);

                      addNotification(title, desc, isDrop ? 'success' : 'info');
                    }
                  });
                }
              });
            }
            prevProductsRef.current = list;

            setBuyerProducts(list);
            try { localStorage.setItem('mf_buyer_products', JSON.stringify(list)); } catch {}
          } else {
            // When all products are deleted in DB or node removed
            setBuyerProducts([]);
            prevProductsRef.current = [];
            try { localStorage.setItem('mf_buyer_products', JSON.stringify([])); } catch {}
          }
        },
        (err) => {
          console.warn('buyer_products listener notice:', err);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('buyer_products listener error:', e);
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
          try {
            const cached = localStorage.getItem('mf_real_top_sellers');
            if (cached) {
              setAllUsers(JSON.parse(cached));
            }
          } catch {}
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
    let unsubOrdersRef: (() => void) | null = null;
    let unsubUserOrdersRef: (() => void) | null = null;
    let unsubDepsRef: (() => void) | null = null;
    let unsubUserDepsRef: (() => void) | null = null;
    let unsubAlertsRef: (() => void) | null = null;
    let unsubChatRef: (() => void) | null = null;
    let unsubAuth: (() => void) | null = null;

    const cleanupInnerListeners = () => {
      if (unsubNotifs) { try { unsubNotifs(); } catch {} unsubNotifs = null; }
      if (unsubUserRef) { try { unsubUserRef(); } catch {} unsubUserRef = null; }
      if (unsubSubRef) { try { unsubSubRef(); } catch {} unsubSubRef = null; }
      if (unsubWdRef) { try { unsubWdRef(); } catch {} unsubWdRef = null; }
      if (unsubOrdersRef) { try { unsubOrdersRef(); } catch {} unsubOrdersRef = null; }
      if (unsubUserOrdersRef) { try { unsubUserOrdersRef(); } catch {} unsubUserOrdersRef = null; }
      if (unsubDepsRef) { try { unsubDepsRef(); } catch {} unsubDepsRef = null; }
      if (unsubUserDepsRef) { try { unsubUserDepsRef(); } catch {} unsubUserDepsRef = null; }
      if (unsubAlertsRef) { try { unsubAlertsRef(); } catch {} unsubAlertsRef = null; }
      if (unsubChatRef) { try { unsubChatRef(); } catch {} unsubChatRef = null; }
    };

    const initializeAuth = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const googleUser = result.user;
          const userSnap = await get(ref(db, `users/${googleUser.uid}`));
          if (!userSnap.exists()) {
            const refParam = (getUrlParam('ref') || '').toUpperCase();
            let refId: string | null = null;
            if (refParam) {
              try {
                const q = query(ref(db, 'users'), orderByChild('referralCode'), equalTo(refParam));
                const sn = await get(q);
                if (sn.exists()) {
                  sn.forEach((c) => { refId = c.key; });
                } else {
                  const directSnap = await get(ref(db, `users/${refParam}`));
                  if (directSnap.exists()) {
                    refId = refParam;
                  }
                }
              } catch { }
            }
            let userBonus = 5;
            let referrerBonus = 5;
            try {
              const settingsSnap = await get(ref(db, 'settings'));
              if (settingsSnap.exists()) {
                const sVal = settingsSnap.val();
                if (sVal.signup_bonus_user !== undefined) userBonus = Number(sVal.signup_bonus_user) || 5;
                if (sVal.signup_bonus_referrer !== undefined) referrerBonus = Number(sVal.signup_bonus_referrer) || 5;
              }
            } catch {}

            const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            if (refId === googleUser.uid) {
              refId = null;
            }

            const { deviceId, ipAddress } = await getClientFingerprint();

            await set(ref(db, `users/${googleUser.uid}`), {
              username: googleUser.displayName || 'Google User',
              email: googleUser.email,
              photoURL: googleUser.photoURL || '',
              balance: userBonus,
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
              deviceId,
              ipAddress,
            });
            if (refId && referrerBonus > 0) {
              try {
                await update(ref(db, `users/${refId}`), {
                  referralEarnings: increment(referrerBonus),
                  creditedReferralEarnings: increment(referrerBonus),
                  lastProcessedRefEarnings: increment(referrerBonus),
                  balance: increment(referrerBonus),
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
            currUser.email && (
              currUser.email === 'gmrony135@gmail.com' ||
              currUser.email === 'mailfactorybd@gmail.com' ||
              currUser.email === 'iamronyofficial1@gmail.com'
            )
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
                    
                    // Trigger web push for real-time notifications
                    try {
                      if ('Notification' in window && (window as any).Notification.permission === 'granted') {
                        if ('serviceWorker' in navigator) {
                          navigator.serviceWorker.ready.then((registration) => {
                            if (registration && registration.showNotification) {
                              newNotifs.forEach(n => {
                                // Only show push for recent notifications (last 2 minutes)
                                if (Date.now() - (n.timestamp || 0) < 120000) {
                                  registration.showNotification('Mail Factory', { body: `${n.title}: ${n.desc}`, icon: appLogo }).catch(console.error);
                                }
                              });
                            }
                          }).catch(console.error);
                        }
                      }
                    } catch (e) { console.error('Push err', e); }
                    
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

          // Fetch user submissions (master submissions for all users so referrals and commissions work accurately)
          const subRef = ref(db, 'submissions');
          unsubSubRef = onValue(
            subRef,
            (snap) => {
              const allSubs: Submission[] = [];
              const mySubs: Submission[] = [];
              if (snap.exists()) {
                snap.forEach((c) => {
                  const sub = c.val() as Submission;
                  sub.key = c.key;
                  allSubs.push(sub);
                  if (isAdminUser || sub.userId === currUser.uid || sub.userEmail === currUser.email) {
                    mySubs.push(sub);
                  }
                });
                allSubs.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
                mySubs.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
              }
              setAllSubmissions(allSubs);
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

          // Fetch Buyer Orders (Global / Query & User-scoped fallback)
          try {
            const userOrdersRef = ref(db, `users/${currUser.uid}/buyer_orders`);
            unsubUserOrdersRef = onValue(
              userOrdersRef,
              (snap) => {
                if (snap.exists()) {
                  const userOrds: BuyerOrder[] = [];
                  snap.forEach((c) => {
                    const ord = c.val() as BuyerOrder;
                    ord.id = c.key || ord.id;
                    userOrds.push(ord);
                  });
                  setBuyerOrders((prev) => {
                    const map = new Map<string, BuyerOrder>();
                    userOrds.forEach((o) => map.set(o.id || o.key || '', o));
                    prev.forEach((o) => {
                      const k = o.id || o.key || '';
                      if (k && !map.has(k)) map.set(k, o);
                    });
                    const merged = Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                    try { localStorage.setItem('mf_buyer_orders', JSON.stringify(merged)); } catch {}
                    return merged;
                  });
                }
              },
              (err) => {
                console.warn('User buyer orders notice:', err);
              }
            );
          } catch (e) {
            console.warn('User orders ref error:', e);
          }

          try {
            const ordRef = isAdminUser ? ref(db, 'buyer_orders') : query(ref(db, 'buyer_orders'), orderByChild('userId'), equalTo(currUser.uid));
            unsubOrdersRef = onValue(
              ordRef,
              (snap) => {
                const myOrds: BuyerOrder[] = [];
                if (snap.exists()) {
                  snap.forEach((c) => {
                    const ord = c.val() as BuyerOrder;
                    ord.id = c.key || ord.id;
                    if (isAdminUser || ord.userId === currUser.uid) {
                      myOrds.push(ord);
                    }
                  });
                }
                if (myOrds.length > 0) {
                  setBuyerOrders((prev) => {
                    const map = new Map<string, BuyerOrder>();
                    myOrds.forEach((o) => map.set(o.id || o.key || '', o));
                    prev.forEach((o) => {
                      const k = o.id || o.key || '';
                      if (k && !map.has(k)) map.set(k, o);
                    });
                    const merged = Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                    try { localStorage.setItem('mf_buyer_orders', JSON.stringify(merged)); } catch {}
                    return merged;
                  });
                }
              },
              (err) => {
                console.warn('Buyer orders connection notice:', err);
              }
            );
          } catch (e) {
            console.warn('Global orders query error:', e);
          }

          // Fetch Deposit Requests (Global / Query & User-scoped fallback)
          try {
            const userDepsRef = ref(db, `users/${currUser.uid}/deposit_requests`);
            unsubUserDepsRef = onValue(
              userDepsRef,
              (snap) => {
                if (snap.exists()) {
                  const userDeps: DepositRequest[] = [];
                  snap.forEach((c) => {
                    const dep = c.val() as DepositRequest;
                    dep.id = c.key || dep.id;
                    userDeps.push(dep);
                  });
                  setDepositRequests((prev) => {
                    const map = new Map<string, DepositRequest>();
                    userDeps.forEach((d) => map.set(d.id || d.key || '', d));
                    prev.forEach((d) => {
                      const k = d.id || d.key || '';
                      if (k && !map.has(k)) map.set(k, d);
                    });
                    const merged = Array.from(map.values())
                      .filter((d) => typeof d.amount === 'number' && !isNaN(d.amount) && d.amount > 0 && typeof d.trxId === 'string' && d.trxId.trim() !== '')
                      .sort((a, b) => (b.requestedAt || b.createdAt || 0) - (a.requestedAt || a.createdAt || 0));
                    try { localStorage.setItem('mf_deposit_requests', JSON.stringify(merged)); } catch {}
                    return merged;
                  });
                }
              },
              (err) => {
                console.warn('User deposits notice:', err);
              }
            );
          } catch (e) {
            console.warn('User deposits ref error:', e);
          }

          try {
            const depRef = isAdminUser ? ref(db, 'buyer_deposits') : query(ref(db, 'buyer_deposits'), orderByChild('userId'), equalTo(currUser.uid));
            unsubDepsRef = onValue(
              depRef,
              (snap) => {
                const myDeps: DepositRequest[] = [];
                if (snap.exists()) {
                  snap.forEach((c) => {
                    const dep = c.val() as DepositRequest;
                    dep.id = c.key || dep.id;
                    if (isAdminUser || dep.userId === currUser.uid) {
                      myDeps.push(dep);
                    }
                  });
                }
                if (myDeps.length > 0) {
                  setDepositRequests((prev) => {
                    const map = new Map<string, DepositRequest>();
                    myDeps.forEach((d) => map.set(d.id || d.key || '', d));
                    prev.forEach((d) => {
                      const k = d.id || d.key || '';
                      if (k && !map.has(k)) map.set(k, d);
                    });
                    const merged = Array.from(map.values())
                      .filter((d) => typeof d.amount === 'number' && !isNaN(d.amount) && d.amount > 0 && typeof d.trxId === 'string' && d.trxId.trim() !== '')
                      .sort((a, b) => (b.requestedAt || b.createdAt || 0) - (a.requestedAt || a.createdAt || 0));
                    try { localStorage.setItem('mf_deposit_requests', JSON.stringify(merged)); } catch {}
                    return merged;
                  });
                }
              },
              (err) => {
                console.warn('Buyer deposits connection notice:', err);
              }
            );
          } catch (e) {
            console.warn('Global buyer_deposits query error:', e);
          }

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

          // Listen for user price alerts
          try {
            const alertsRef = ref(db, `users/${currUser.uid}/price_alerts`);
            unsubAlertsRef = onValue(
              alertsRef,
              (snap) => {
                if (snap.exists()) {
                  const alertsList: PriceAlertSubscription[] = [];
                  snap.forEach((c) => {
                    const alert = c.val() as PriceAlertSubscription;
                    if (alert && alert.active !== false) {
                      alert.id = c.key || alert.id;
                      alertsList.push(alert);
                    }
                  });
                  setPriceAlerts(alertsList);
                  try { localStorage.setItem('mf_price_alerts', JSON.stringify(alertsList)); } catch {}
                }
              },
              (err) => {
                console.warn('Price alerts listener error:', err);
              }
            );
          } catch (e) {
            console.warn('Price alerts listener init error:', e);
          }
        } catch (e) {
          console.warn('Profile sync error:', e);
          clearTimeout(safetyTimer);
          markLoaded();
        }
      } else {
        setProfile(null);
        setSubmissions([]);
        setWithdrawRequests([]);
        setBuyerOrders([]);
        setDepositRequests([]);
        setPriceAlerts([]);
        setNotifications([]);
        localStorage.removeItem('mf_price_alerts');
        localStorage.removeItem('mf_notifications_v2');
        localStorage.removeItem('mf_buyer_orders');
        localStorage.removeItem('mf_deposit_requests');
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

  // Claim Daily Streak & Bonus
  const claimDailyStreak = async (): Promise<{ success: boolean; streakCount: number; bonusAmount?: number }> => {
    if (!user || !profile) return { success: false, streakCount: 0 };
    const today = new Date().toDateString();
    const lastLogin = profile.last_login_date || '';

    // Check if already claimed today
    const isBonusDateToday = profile.lastBonusDate
      ? new Date(profile.lastBonusDate).toDateString() === today
      : false;

    if (profile.dailyBonusClaimedToday && isBonusDateToday) {
      return { success: false, streakCount: profile.login_streak || 1 };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const newStreak = lastLogin === yesterday.toDateString() ? (profile.login_streak || 0) + 1 : 1;

    // Standard bonus amount 1.50৳ as configured for daily check-in
    const bonusAmount = 1.50;
    const now = Date.now();

    try {
      // 1. Update User Node in Firebase Database with exact required keys
      await update(ref(db, `users/${user.uid}`), {
        dailyBonusClaimedToday: true,
        dailyBonusToday: bonusAmount,
        lastBonusDate: now,
        login_streak: newStreak,
        last_login_date: today,
        balance: increment(bonusAmount),
        totalEarnings: increment(bonusAmount),
      });

      // 2. Add transaction record to transactions node
      try {
        await push(ref(db, 'transactions'), {
          userId: user.uid,
          username: profile.username || (user.email ? user.email.split('@')[0] : 'User'),
          userEmail: user.email || '',
          type: 'daily_bonus',
          category: 'Daily Bonus',
          title: 'Daily Check-in Bonus',
          amount: bonusAmount,
          timestamp: now,
          date: new Date().toISOString()
        });
      } catch (txErr) {
        console.warn('Failed to push daily_bonus transaction record:', txErr);
      }

      // 3. Optimistic local state update
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              dailyBonusClaimedToday: true,
              dailyBonusToday: bonusAmount,
              lastBonusDate: now,
              login_streak: newStreak,
              last_login_date: today,
            }
          : null
      );
    } catch (e) {
      console.error('Failed to claim daily streak:', e);
    }

    addNotification(
      'Daily Check-in Bonus 🔥',
      language === 'bn'
        ? `অভিনন্দন! আপনি আজকের ডেইলি চেক-ইন বোনাস ৳${bonusAmount.toFixed(2)} পেয়েছেন! ব্যালেন্সে যোগ হয়েছে। (Streak Day ${newStreak})`
        : `Congratulations! You received ৳${bonusAmount.toFixed(2)} daily check-in bonus! Added to balance. (Streak Day ${newStreak})`,
      'success'
    );
    return { success: true, streakCount: newStreak, bonusAmount };
  };

  // Helper to compute user's exact referral earnings (Signup bonuses + 10% commission on all approved gmails)
  const computeUserReferralBreakdown = useCallback((targetProfile: UserProfile | null) => {
    if (!targetProfile) {
      return { totalRefEarnings: 0, signupBonusTotal: 0, salesCommissionTotal: 0, referredCount: 0, friendsList: [] };
    }

    const userRefCode = (targetProfile.referralCode || '').trim().toUpperCase();
    const profileUid = (targetProfile.uid || '').trim();
    const shortUid = profileUid.slice(0, 8).toUpperCase();

    const myReferred = (allUsers || []).filter((u) => {
      if (!u || u.uid === targetProfile.uid || !u.referredBy) return false;
      const refBy = (u.referredBy || '').trim().toUpperCase();
      return (
        (userRefCode && refBy === userRefCode) ||
        (profileUid && u.referredBy === profileUid) ||
        (shortUid && refBy === shortUid)
      );
    });

    let salesCommissionTotal = 0;
    const bonusPerUser = signupBonusReferrer || signupBonusUser || 5;
    const signupBonusTotal = myReferred.length * bonusPerUser;

    const friendsList = myReferred.map((friend) => {
      const { approvedCount, approvedEarnings } = calculateFriendApprovedStats(
        friend,
        allSubmissions || [],
        Number(friend.manual_approved_count) || 0,
        levels[0]?.rate || 15
      );

      const commRate = Number(commissionPercent) || 10;
      const friendCommission = Number(((approvedEarnings * commRate) / 100).toFixed(2));
      salesCommissionTotal += friendCommission;

      return {
        friend,
        signupBonus: bonusPerUser,
        salesCommission: friendCommission,
        totalIncome: Number((bonusPerUser + friendCommission).toFixed(2)),
        gmailsSold: approvedCount,
      };
    });

    const totalRefEarnings = Number((signupBonusTotal + salesCommissionTotal).toFixed(2));

    return {
      totalRefEarnings,
      signupBonusTotal,
      salesCommissionTotal: Number(salesCommissionTotal.toFixed(2)),
      referredCount: myReferred.length,
      friendsList,
    };
  }, [allUsers, allSubmissions, commissionPercent, signupBonusUser, signupBonusReferrer]);

  // Real-time Auto Sync Referral Earnings to Main Wallet Balance
  useEffect(() => {
    if (!user || !profile) return;

    const { totalRefEarnings } = computeUserReferralBreakdown(profile);
    if (totalRefEarnings <= 0) return;

    // Check how much has already been credited to the wallet
    const alreadyCredited = Math.max(
      Number(profile.creditedReferralEarnings || 0),
      Number(profile.lastProcessedRefEarnings || 0),
      Number(profile.referralEarnings || 0)
    );
    const uncreditedDelta = Number((totalRefEarnings - alreadyCredited).toFixed(2));

    if (uncreditedDelta > 0) {
      const currentBalance = Number(profile.balance || 0);
      const currentTotalEarnings = Number(profile.totalEarnings || 0);
      const newBalance = Number((currentBalance + uncreditedDelta).toFixed(2));
      const newTotalEarnings = Number((currentTotalEarnings + uncreditedDelta).toFixed(2));

      const updates: any = {};
      updates[`users/${user.uid}/balance`] = newBalance;
      updates[`users/${user.uid}/totalEarnings`] = newTotalEarnings;
      updates[`users/${user.uid}/referralEarnings`] = totalRefEarnings;
      updates[`users/${user.uid}/creditedReferralEarnings`] = totalRefEarnings;
      updates[`users/${user.uid}/lastProcessedRefEarnings`] = totalRefEarnings;
      updates[`users/${user.uid}/referralBalanceSynced`] = true;

      update(ref(db), updates).catch((e) => console.warn('Auto referral sync error:', e));

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              balance: newBalance,
              totalEarnings: newTotalEarnings,
              referralEarnings: totalRefEarnings,
              creditedReferralEarnings: totalRefEarnings,
              lastProcessedRefEarnings: totalRefEarnings,
              referralBalanceSynced: true,
            }
          : null
      );
    }
  }, [user, profile, allUsers, allSubmissions, computeUserReferralBreakdown]);

  // Claim Referral Earnings to Main Balance (Manual Trigger / On-Demand Claim)
  const claimReferralEarnings = async (): Promise<{ success: boolean; addedAmount: number; message: string }> => {
    if (!user || !profile) return { success: false, addedAmount: 0, message: 'Please login first.' };

    const { totalRefEarnings } = computeUserReferralBreakdown(profile);

    const alreadyCredited = Math.max(
      Number(profile.creditedReferralEarnings || 0),
      Number(profile.lastProcessedRefEarnings || 0),
      Number(profile.referralEarnings || 0)
    );
    const uncreditedDelta = Number((totalRefEarnings - alreadyCredited).toFixed(2));

    if (uncreditedDelta <= 0) {
      if (totalRefEarnings > 0) {
        return {
          success: true,
          addedAmount: 0,
          message: language === 'bn'
            ? `আপনার মোট ৳${totalRefEarnings} রেফারেল ইনকাম (সাইন আপ ও ১০% কমিশন) ইতিমধ্যে মেইন ব্যালেন্সে যোগ করা আছে!`
            : `Your total ৳${totalRefEarnings} referral earnings (signup bonus & 10% commission) are already in your main balance!`,
        };
      }
      return {
        success: false,
        addedAmount: 0,
        message: language === 'bn' ? 'ক্লেম করার মতো নতুন রেফারেল ইনকাম নেই।' : 'No new referral earnings to claim.',
      };
    }

    try {
      const currentBalance = Number(profile.balance || 0);
      const currentTotalEarnings = Number(profile.totalEarnings || 0);
      const newBalance = Number((currentBalance + uncreditedDelta).toFixed(2));
      const newTotalEarnings = Number((currentTotalEarnings + uncreditedDelta).toFixed(2));

      const updates: any = {};
      updates[`users/${user.uid}/balance`] = newBalance;
      updates[`users/${user.uid}/totalEarnings`] = newTotalEarnings;
      updates[`users/${user.uid}/referralEarnings`] = totalRefEarnings;
      updates[`users/${user.uid}/creditedReferralEarnings`] = totalRefEarnings;
      updates[`users/${user.uid}/lastProcessedRefEarnings`] = totalRefEarnings;
      updates[`users/${user.uid}/referralBalanceSynced`] = true;

      await update(ref(db), updates);

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              balance: newBalance,
              totalEarnings: newTotalEarnings,
              referralEarnings: totalRefEarnings,
              creditedReferralEarnings: totalRefEarnings,
              lastProcessedRefEarnings: totalRefEarnings,
              referralBalanceSynced: true,
            }
          : null
      );

      const successMsg = language === 'bn'
        ? `সফলভাবে ৳${uncreditedDelta} রেফারেল ইনকাম (সাইন আপ ও ১০% কমিশন) মেইন ব্যালেন্সে যোগ হয়েছে!`
        : `Successfully added ৳${uncreditedDelta} referral earnings to your main balance!`;

      return { success: true, addedAmount: uncreditedDelta, message: successMsg };
    } catch (e) {
      console.error('Failed to claim referral earnings:', e);
      return { success: false, addedAmount: 0, message: 'Failed to claim referral earnings.' };
    }
  };

  // Submit Gmail Exchange
  
  // --- Client-Side Real-Time Syncing (Self-Healing Balances) ---
  useEffect(() => {
    if (!user || !profile || (submissions.length === 0 && withdrawRequests.length === 0 && depositRequests.length === 0)) return;

    let balanceDelta = 0;
    let holdDelta = 0;
    const updates: Record<string, any> = {};

    submissions.forEach(sub => {
        if (sub.userId !== user.uid) return;
        const sStatus = normalizeSubmissionStatus(sub.status);
        
        // Generate checking notification
        if (sStatus === 'checking' && !sub.notifiedChecking) {
            updates[`submissions/${sub.key}/notifiedChecking`] = true;
            const nKey = push(ref(db, `users/${user.uid}/notifications`)).key;
            updates[`users/${user.uid}/notifications/${nKey}`] = {
                title: 'Review Started 🔍',
                desc: `Your submission of ${sub.count || sub.quantity || (sub.gmails ? sub.gmails.length : 1)} Gmails is now being checked.`,
                type: 'info',
                read: false,
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                timestamp: Date.now()
            };
        }

        if ((sStatus === 'approved' || sStatus === 'rejected') && !sub.processedForBalance) {
            updates[`submissions/${sub.key}/processedForBalance`] = true;
            
            let totalSubmitted = sub.count || sub.quantity || (sub.gmails ? sub.gmails.length : 1);
            let approvedCount = 0;
            let rejectedCount = 0;
            
            if (sub.gmails && sub.gmails.length > 0) {
                sub.gmails.forEach((g) => {
                    const iStatus = g.status && g.status !== 'pending' ? normalizeSubmissionStatus(g.status) : sStatus;
                    if (iStatus === 'approved') approvedCount++;
                    if (iStatus === 'rejected') rejectedCount++;
                });
            } else {
                if (sStatus === 'approved') approvedCount = totalSubmitted;
                if (sStatus === 'rejected') rejectedCount = totalSubmitted;
            }

            const ratePerGmail = totalSubmitted > 0 ? (sub.totalAmount / totalSubmitted) : sub.totalAmount;
            const approvedAmount = approvedCount * ratePerGmail;

            // Release full sub.totalAmount from hold balance
            holdDelta -= sub.totalAmount;

            // Credit approved amount to main balance
            if (approvedAmount > 0) {
                balanceDelta += approvedAmount;
            }
            
            const nKey = push(ref(db, `users/${user.uid}/notifications`)).key;
            const reason = sub.rejectReason || sub.rejectionReason || sub.reason || sub.adminNote || sub.note || 'Not specified';
            
            if (approvedCount > 0 && rejectedCount > 0) {
                updates[`users/${user.uid}/notifications/${nKey}`] = {
                    title: 'Submission Processed 📝',
                    desc: `${totalSubmitted} Gmails processed: ${approvedCount} Approved (৳${approvedAmount.toFixed(2)} added), ${rejectedCount} Rejected.`,
                    type: 'success',
                    read: false,
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    timestamp: Date.now()
                };
            } else if (sStatus === 'approved') {
                updates[`users/${user.uid}/notifications/${nKey}`] = {
                    title: 'Submission Approved 🎉',
                    desc: `${totalSubmitted} Gmails approved! ৳${approvedAmount.toFixed(2)} added to your balance.`,
                    type: 'success',
                    read: false,
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    timestamp: Date.now()
                };
            } else if (sStatus === 'rejected') {
                updates[`users/${user.uid}/notifications/${nKey}`] = {
                    title: 'Submission Rejected ❌',
                    desc: `${totalSubmitted} Gmails rejected. Reason: ${reason}.`,
                    type: 'danger',
                    read: false,
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    timestamp: Date.now()
                };
            }
        }
    });

    withdrawRequests.forEach(wd => {
        if (wd.userId !== user.uid) return;
        const wStatus = (wd.status || '').toLowerCase();
        
        if ((wStatus === 'approved' || wStatus === 'rejected') && !wd.processedForBalance) {
            updates[`withdraw_requests/${wd.key}/processedForBalance`] = true;
            const nKey = push(ref(db, `users/${user.uid}/notifications`)).key;
            if (wStatus === 'approved') {
                updates[`users/${user.uid}/notifications/${nKey}`] = {
                    title: 'Withdrawal Approved 💸',
                    desc: `Your withdrawal of ৳${wd.amount} via ${wd.paymentMethod || wd.method || 'System'} has been successfully paid out!`,
                    type: 'success',
                    read: false,
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    timestamp: Date.now()
                };
            } else if (wStatus === 'rejected') {
                const reason = wd.rejectReason || wd.rejectionReason || wd.reason || wd.adminNote || wd.transactionNote || 'Not specified';
                updates[`users/${user.uid}/notifications/${nKey}`] = {
                    title: 'Withdrawal Rejected ❌',
                    desc: `Your withdrawal of ৳${wd.amount} was rejected. Reason: ${reason}. The funds have been refunded to your balance.`,
                    type: 'danger',
                    read: false,
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    timestamp: Date.now()
                };
            }
        }
    });

    if (Object.keys(updates).length > 0) {
        const applyReconciliation = async () => {
            try {
                if (balanceDelta !== 0) {
                    updates[`users/${user.uid}/balance`] = Number(((profile.balance || 0) + balanceDelta).toFixed(2));
                }
                if (holdDelta !== 0) {
                    updates[`users/${user.uid}/hold`] = Number((Math.max(0, (profile.hold || 0) + holdDelta)).toFixed(2));
                }
                if (balanceDelta > 0) {
                    updates[`users/${user.uid}/totalEarnings`] = Number(((profile.totalEarnings || 0) + balanceDelta).toFixed(2));
                }
                await update(ref(db), updates);
            } catch (e) {
                console.error('Failed to sync real-time balance', e);
            }
        };
        applyReconciliation();
    }
  }, [submissions, withdrawRequests, depositRequests, profile?.balance, profile?.deposit_balance, profile?.hold, profile?.totalEarnings, user]);
  // -----------------------------------------------------------

  // Referral Commissions are now exclusively handled automatically via Firebase Cloud Functions.\n  // -----------------------------------------------------------

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
        userEmail: user.email || '',
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
    } else {
      const userMsg: ChatMessage = {
        id: `local_${Date.now()}`,
        from: 'user',
        message: text.trim(),
        timestamp: Date.now(),
        username: profile?.username || 'User',
      };
      setChatMessages((prev) => [...prev, userMsg]);
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

      const top10: TopSellerItem[] = (realFiltered || []).slice(0, 10).map((u, idx) => ({
        uid: u.uid || `user_${idx + 1}`,
        username: u.username || (u.email ? u.email.split('@')[0] : `Seller ${idx + 1}`),
        email: u.email || '',
        photoURL: u.photoURL || '',
        totalEarnings: Number(u.totalEarnings) || (Number(u.balance || 0) + Number(u.total_withdrawn || 0)) || Number(u.balance || 0),
        balance: Number(u.balance) || 0,
        manual_approved_count: u.manual_approved_count !== undefined ? Number(u.manual_approved_count) : (Number(u.total_submitted) || 0),
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

  // Helper to generate realistic delivered Gmail credentials
  const generateDeliveredGmails = (category: string, count: number) => {
    const results: Array<{ email: string; password: string; recoveryEmail?: string }> = [];
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const passChars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

    for (let i = 0; i < count; i++) {
      let userPart = 'mf.';
      for (let j = 0; j < 6; j++) userPart += chars.charAt(Math.floor(Math.random() * chars.length));
      const email = `${userPart}${Math.floor(100 + Math.random() * 900)}@gmail.com`;

      let pass = '';
      for (let k = 0; k < 10; k++) pass += passChars.charAt(Math.floor(Math.random() * passChars.length));
      pass += '@9#';

      const recEmail = `rec.${userPart}@mailfactory.org`;
      results.push({
        email,
        password: pass,
        recoveryEmail: recEmail,
      });
    }
    return results;
  };

  const isAdmin = Boolean(
    user?.email && (
      AUTHORIZED_ADMINS.includes(user.email) ||
      (profile as any)?.is_admin === true
    )
  );

  // Request Deposit (Buyer) - Enforces strict validation & prevents duplicate TrxIDs
  const requestDeposit = async (data: {
    amount: number;
    method: string;
    paymentNumber: string;
    trxId: string;
  }): Promise<{ success: boolean; message?: string }> => {
    if (!user) return { success: false, message: 'লগইন করুন অথবা একটি অ্যাকাউন্ট তৈরি করুন।' };
    
    const cleanTrx = String(data.trxId || '').trim().toUpperCase().replace(/\s+/g, '');
    let cleanSender = String(data.paymentNumber || '').trim().replace(/[\s\-\+]/g, '');
    if (cleanSender.startsWith('880')) {
      cleanSender = '0' + cleanSender.substring(3);
    }

    // Client-side quick check against existing loaded deposit requests
    const isLocalDuplicate = depositRequests.some(
      (d) => d.trxId && d.trxId.trim().toUpperCase() === cleanTrx
    );
    if (isLocalDuplicate) {
      return {
        success: false,
        message: 'এই Transaction ID (TrxID) টি ইতিমধ্যে জমা দেওয়া হয়েছে! দয়া করে আপনার আসল পেমেন্টের সঠিক TrxID দিন।',
      };
    }

    // Check pending count limit
    const pendingCount = depositRequests.filter((d) => d.userId === user.uid && d.status === 'pending').length;
    if (pendingCount >= 3) {
      return {
        success: false,
        message: 'আপনার ইতিমধ্যে ৩টি ডিপোজিট রিকোয়েস্ট পেন্ডিং আছে। অ্যাডমিন অনুমোদন দেওয়া পর্যন্ত অপেক্ষা করুন।',
      };
    }

    try {
      // 1. Send to Server-side API endpoint for backend validation & anti-replay
      try {
        const response = await fetch('/api/buyer/deposit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.uid,
          },
          body: JSON.stringify({
            userId: user.uid,
            username: profile?.username || user.displayName || 'Buyer',
            userEmail: user.email || '',
            amount: data.amount,
            method: data.method,
            senderNumber: cleanSender,
            trxId: cleanTrx,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.deposit) {
            const depRecord = result.deposit;
            setDepositRequests((prev) => {
              const updated = [depRecord, ...prev.filter((d) => d.id !== depRecord.id && d.key !== depRecord.id)];
              try { localStorage.setItem('mf_deposit_requests', JSON.stringify(updated)); } catch {}
              return updated;
            });
            addNotification(
              'ডিপোজিট রিকোয়েস্ট গৃহীত 💳',
              `৳${data.amount.toFixed(2)} (${cleanTrx}) ডিপোজিট রিকোয়েস্ট সফলভাবে সাবমিট হয়েছে। শীঘ্রই ভেরিফাই করা হবে।`,
              'info'
            );
            return { success: true };
          }
        } else {
          const errData = await response.json().catch(() => ({}));
          if (errData.message) {
            return { success: false, message: errData.message };
          }
        }
      } catch (apiErr) {
        console.warn('Backend deposit API notice (using fallback):', apiErr);
      }

      // Fallback Direct Client Store (Only if server route is unreachable)
      // Check RTDB for duplicate TrxId
      try {
        const checkSnap = await get(query(ref(db, 'deposit_requests'), orderByChild('trxId'), equalTo(cleanTrx)));
        if (checkSnap.exists()) {
          return {
            success: false,
            message: 'এই Transaction ID (TrxID) টি ইতিমধ্যে ডাটাবেসে বিদ্যমান! একই TrxID দেওয়া যাবে না।',
          };
        }
      } catch (checkErr) {
        console.warn('TrxID index check notice:', checkErr);
      }

      const depKey = push(ref(db, 'deposit_requests')).key || `dep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const payload: DepositRequest = {
        id: depKey,
        key: depKey,
        userId: user.uid,
        userName: profile?.username || user.displayName || 'Buyer',
        username: profile?.username || user.displayName || 'Buyer',
        userEmail: user.email || '',
        amount: data.amount,
        paymentMethod: data.method,
        method: data.method,
        senderNumber: cleanSender,
        paymentNumber: cleanSender,
        trxId: cleanTrx,
        status: 'pending',
        createdAt: Date.now(),
        requestedAt: Date.now(),
      };

      // Store under user's dedicated nodes
      try {
        await set(ref(db, `users/${user.uid}/deposits/${depKey}`), payload);
        await set(ref(db, `users/${user.uid}/deposit_requests/${depKey}`), payload);
      } catch (e) {
        console.warn('User deposit store error:', e);
      }

      // Save to global buyer_deposits and deposit_requests
      try {
        await set(ref(db, `buyer_deposits/${depKey}`), payload);
        await set(ref(db, `deposit_requests/${depKey}`), payload);
      } catch (rootErr) {
        console.warn('Global deposit store notice:', rootErr);
      }

      // Record transaction
      const txKey = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const txData = {
        id: txKey,
        userId: user.uid,
        username: profile?.username || user.displayName || 'Buyer',
        userEmail: user.email || '',
        type: 'deposit',
        category: 'Deposit',
        title: `Deposit via ${data.method}`,
        amount: data.amount,
        trxId: cleanTrx,
        status: 'pending',
        timestamp: Date.now(),
        date: new Date().toISOString(),
      };

      try {
        await set(ref(db, `users/${user.uid}/transactions/${txKey}`), txData);
      } catch {}
      try {
        await set(ref(db, `transactions/${txKey}`), txData);
      } catch {}

      addNotification(
        'ডিপোজিট রিকোয়েস্ট গৃহীত 💳',
        `৳${data.amount.toFixed(2)} (${cleanTrx}) ডিপোজিট রিকোয়েস্ট সফলভাবে সাবমিট হয়েছে। শীঘ্রই ভেরিফাই করা হবে।`,
        'info'
      );

      setDepositRequests((prev) => {
        const updated = [payload, ...prev.filter((d) => d.id !== depKey && d.key !== depKey)];
        try { localStorage.setItem('mf_deposit_requests', JSON.stringify(updated)); } catch {}
        return updated;
      });

      return { success: true };
    } catch (err: any) {
      console.error('Error submitting deposit:', err);
      return { success: false, message: err.message || 'Deposit submission failed' };
    }
  };

  const sandboxVerifyDeposit = async (depositId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch('/api/buyer/sandbox-verify-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDepositRequests((prev) =>
            prev.map((d) => (d.id === depositId || d.key === depositId ? { ...d, status: 'approved' as const, processedForBalance: true } : d))
          );
          if (typeof result.newBalance === 'number') {
            setProfile((prev) => prev ? { ...prev, deposit_balance: result.newBalance } : null);
          }
          return { success: true, message: result.message };
        }
      }
      return { success: false, message: 'Auto-verify failed' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Auto-verify error' };
    }
  };

  const verifyBuyerDeposit = async (
    depositId: string,
    approve: boolean,
    adminSecret: string = 'mailfactory_admin_2026'
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch('/api/buyer/verify-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId, approve, adminSecret }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDepositRequests((prev) =>
            prev.map((d) => (d.id === depositId || d.key === depositId ? { ...d, status: approve ? 'approved' as const : 'rejected' as const, processedForBalance: true } : d))
          );
          if (approve && typeof result.newBalance === 'number') {
            setProfile((prev) => prev ? { ...prev, deposit_balance: result.newBalance } : null);
          }
          addNotification(
            approve ? 'Deposit Approved! 💳' : 'Deposit Rejected ❌',
            result.message || (approve ? 'Deposit approved & deposit balance credited.' : 'Deposit rejected.'),
            approve ? 'success' : 'error'
          );
          return { success: true, message: result.message };
        }
      }
      const errData = await response.json().catch(() => ({}));
      return { success: false, message: errData.message || 'Deposit verification failed' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Deposit verification error' };
    }
  };

  // Create Buyer Order (Rule: Status = 'pending', Stock Reduced, NO Instant Balance Deduction until Admin Approves)
  const createBuyerOrder = async (
    productId: string,
    quantity: number
  ): Promise<{ success: boolean; orderId?: string; reason?: string; shortfall?: number; message?: string }> => {
    if (!user) return { success: false, reason: 'unauthorized', message: 'Please login first' };

    const prod = buyerProducts.find((p) => p.id === productId);
    if (!prod) return { success: false, reason: 'not_found', message: 'Product not found' };

    if (prod.stock < quantity) {
      return {
        success: false,
        reason: 'out_of_stock',
        message: language === 'bn' ? `দুঃখিত, পর্যাপ্ত স্টক নেই! বর্তমান স্টক: ${prod.stock} টি` : `Insufficient stock! Only ${prod.stock} available.`,
      };
    }

    const totalCost = Number((prod.price * quantity).toFixed(2));

    // Reduce product stock in state
    setBuyerProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, p.stock - quantity) } : p))
    );

    // 1. Try Server API Endpoint
    try {
      const response = await fetch('/api/buyer/order/place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify({
          userId: user.uid,
          username: profile?.username || user.displayName || 'Buyer',
          userEmail: user.email || '',
          productId: prod.id,
          quantity,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.order) {
          const newOrder = result.order as BuyerOrder;

          setBuyerOrders((prev) => {
            const updated = [newOrder, ...prev.filter((o) => o.id !== newOrder.id && o.key !== newOrder.id)];
            try { localStorage.setItem('mf_buyer_orders', JSON.stringify(updated)); } catch {}
            return updated;
          });

          // Optimistically update profile balance and reserved_balance immediately
          setProfile((prev) => prev ? {
            ...prev,
            deposit_balance: typeof result.buyerNewDepositBalance === 'number' ? result.buyerNewDepositBalance : Math.max(0, (prev.deposit_balance || 0) - totalCost),
            buyerWalletBalance: typeof result.buyerNewDepositBalance === 'number' ? result.buyerNewDepositBalance : Math.max(0, (prev.deposit_balance || 0) - totalCost),
            reserved_balance: typeof result.buyerNewReservedBalance === 'number' ? result.buyerNewReservedBalance : (prev.reserved_balance || 0) + totalCost,
          } : null);

          try {
            const depBal = typeof result.buyerNewDepositBalance === 'number' ? result.buyerNewDepositBalance : Math.max(0, (profile?.deposit_balance || 0) - totalCost);
            const resBal = typeof result.buyerNewReservedBalance === 'number' ? result.buyerNewReservedBalance : (profile?.reserved_balance || 0) + totalCost;
            localStorage.setItem(`mf_wallet_cache_${user.uid}`, JSON.stringify({
              deposit_balance: depBal,
              buyerWalletBalance: depBal,
              reserved_balance: resBal,
              timestamp: Date.now()
            }));
          } catch {}

          addNotification(
            'অর্ডার জমা হয়েছে ⏳',
            `আপনার #${(newOrder.id || "").slice(-6).toUpperCase()} অর্ডারটি সফলভাবে পেন্ডিং তালিকায় জমা হয়েছে। অ্যাডমিন অনুমোদন দিলে ডেলিভারি পেয়ে যাবেন।`,
            'info'
          );

          return { success: true, orderId: newOrder.id };
        }
      }
    } catch (apiErr) {
      console.warn('Backend order place API notice (using fallback):', apiErr);
    }

    // Direct RTDB Fallback
    try {
      // 1. Check if user has enough deposit balance
      const currentDepositBalance = profile?.deposit_balance || 0;
      if (currentDepositBalance < totalCost) {
        return {
          success: false,
          reason: 'insufficient_balance',
          message: language === 'bn' ? `দুঃখিত, আপনার পর্যাপ্ত ডিপোজিট ব্যালেন্স নেই! প্রয়োজন: ৳${totalCost}, আছে: ৳${currentDepositBalance}` : `Insufficient deposit balance! Needed: ৳${totalCost}, Available: ৳${currentDepositBalance}`,
          shortfall: totalCost - currentDepositBalance
        };
      }

      // 2. Lock funds in deposit_balance -> reserved_balance
      try {
        const userRef = ref(db, `users/${user.uid}`);
        const snap = await get(userRef);
        const userData = snap.val() || {};
        const freshDepositBalance = Number(userData.deposit_balance !== undefined ? userData.deposit_balance : (userData.buyerWalletBalance || 0));

        if (freshDepositBalance < totalCost) {
          return {
            success: false,
            reason: 'insufficient_balance',
            message: language === 'bn' ? `দুঃখিত, আপনার পর্যাপ্ত ডিপোজিট ব্যালেন্স নেই! প্রয়োজন: ৳${totalCost}, আছে: ৳${freshDepositBalance}` : `Insufficient deposit balance! Needed: ৳${totalCost}, Available: ৳${freshDepositBalance}`,
            shortfall: totalCost - freshDepositBalance
          };
        }

        const remainingPendingSum = [
          ...buyerOrders.filter(o => o.userId === user.uid && o.status === 'pending'),
          { amount: totalCost }
        ].reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

        await update(userRef, {
          deposit_balance: increment(-totalCost),
          buyerWalletBalance: increment(-totalCost),
          reserved_balance: Number(remainingPendingSum.toFixed(2))
        });

        // Update local profile state immediately
        setProfile(prev => prev ? { 
          ...prev, 
          deposit_balance: Number(((prev.deposit_balance || 0) - totalCost).toFixed(2)),
          buyerWalletBalance: Number(((prev.deposit_balance || 0) - totalCost).toFixed(2)),
          reserved_balance: Number(remainingPendingSum.toFixed(2))
        } : null);

        try {
          localStorage.setItem(`mf_wallet_cache_${user.uid}`, JSON.stringify({
            deposit_balance: Number(((profile?.deposit_balance || 0) - totalCost).toFixed(2)),
            buyerWalletBalance: Number(((profile?.deposit_balance || 0) - totalCost).toFixed(2)),
            reserved_balance: Number(remainingPendingSum.toFixed(2)),
            timestamp: Date.now()
          }));
        } catch {}
      } catch (lockErr: any) {
        console.error('Fund locking error:', lockErr);
        return { success: false, message: 'Failed to reserve balance. Please try again.' };
      }

      const orderKey = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const orderData: BuyerOrder = {
        id: orderKey,
        key: orderKey,
        userId: user.uid,
        username: profile?.username || user.displayName || 'Buyer',
        userEmail: user.email || '',
        productId: prod.id,
        productTitle: prod.title,
        quantity,
        unitPrice: prod.price,
        amount: totalCost,
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Store in user dedicated node
      try {
        await set(ref(db, `users/${user.uid}/buyer_orders/${orderKey}`), orderData);
      } catch (subErr) {
        console.warn('User order store error:', subErr);
      }

      // Store in global buyer_orders
      try {
        await set(ref(db, `buyer_orders/${orderKey}`), orderData);
      } catch (rootErr) {
        console.warn('Global buyer_orders notice:', rootErr);
      }

      addNotification(
        'অর্ডার জমা হয়েছে ⏳',
        `আপনার #${(orderKey || "").slice(-6).toUpperCase()} অর্ডারটি জমা হয়েছে। অ্যাডমিন ভেরিফাই করে জিমেইল ডেলিভারি দিবেন।`,
        'info'
      );

      setBuyerOrders((prev) => {
        const updated = [orderData, ...prev.filter((o) => o.id !== orderKey && o.key !== orderKey)];
        try { localStorage.setItem('mf_buyer_orders', JSON.stringify(updated)); } catch {}
        return updated;
      });

      return { success: true, orderId: orderKey };
    } catch (err: any) {
      console.error('Order placement error:', err);
      return { success: false, message: err.message || 'Failed to place order' };
    }
  };

  // Admin Approve Order: Checks buyer balance >= total_amount, instantly deducts balance, saves gmails, sets status='delivered'
  const approveBuyerOrder = async (
    orderId: string,
    gmails: Array<{ gmail: string; password: string; recoveryEmail?: string }>,
    adminNote?: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      // 1. Send to server-side endpoint for atomic approval & ledger recording
      const response = await fetch('/api/admin/orders/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          gmails,
          adminNote: adminNote || 'Approved & Delivered by Admin',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.order) {
          const deliveredOrder = result.order as BuyerOrder;
          const orderTarget = buyerOrders.find((o) => o.id === orderId || o.key === orderId) || deliveredOrder;

          // Calculate remaining pending orders sum
          const remainingPendingSum = buyerOrders
            .filter((o) => (o.id !== orderId && o.key !== orderId) && (o.userId === orderTarget.userId) && (o.status === 'pending' || o.status === 'processing'))
            .reduce((sum, o) => sum + (Number(o.amount || (Number(o.unitPrice || 0) * Number(o.quantity || 1))) || 0), 0);

          const safeReserved = typeof result.buyerNewReservedBalance === 'number' && result.buyerNewReservedBalance >= 0
            ? result.buyerNewReservedBalance
            : Number(remainingPendingSum.toFixed(2));

          // Directly sync to RTDB user node to ensure real-time consistency
          if (orderTarget.userId) {
            try {
              await update(ref(db, `users/${orderTarget.userId}`), {
                reserved_balance: safeReserved,
                total_spent: increment(orderTarget.amount || 0)
              });
            } catch (e) {
              console.warn('Direct RTDB sync on approve:', e);
            }
          }

          // Update local state
          setBuyerOrders((prev) =>
            prev.map((o) => (o.id === orderId || o.key === orderId ? deliveredOrder : o))
          );

          // If current logged in user is the buyer, update local balance
          if (user && deliveredOrder.userId === user.uid) {
            setProfile((p) => (p ? { 
              ...p, 
              deposit_balance: typeof result.buyerNewDepositBalance === 'number' ? result.buyerNewDepositBalance : p.deposit_balance,
              buyerWalletBalance: typeof result.buyerNewDepositBalance === 'number' ? result.buyerNewDepositBalance : p.deposit_balance,
              reserved_balance: safeReserved
            } : null));

            try {
              localStorage.setItem(`mf_wallet_cache_${user.uid}`, JSON.stringify({
                deposit_balance: typeof result.buyerNewDepositBalance === 'number' ? result.buyerNewDepositBalance : (profile?.deposit_balance || 0),
                buyerWalletBalance: typeof result.buyerNewDepositBalance === 'number' ? result.buyerNewDepositBalance : (profile?.deposit_balance || 0),
                reserved_balance: safeReserved,
                timestamp: Date.now()
              }));
            } catch {}
          }

          addNotification(
            'অর্ডার অনুমোদিত ✓',
            `অর্ডার #${(orderId || "").slice(-6).toUpperCase()} সফলভাবে অনুমোদন করা হয়েছে।`,
            'success'
          );

          return { success: true, message: result.message };
        }
      } else {
        const errJson = await response.json().catch(() => ({}));
        return { success: false, message: errJson.message || 'অর্ডার অনুমোদন ব্যর্থ হয়েছে।' };
      }
    } catch (e: any) {
      console.warn('Server approve API notice (using fallback):', e);
    }

    // Direct fallback
    try {
      const order = buyerOrders.find((o) => o.id === orderId || o.key === orderId);
      if (!order) return { success: false, message: 'Order not found' };

      // Calculate remaining pending orders sum
      const remainingPendingSum = buyerOrders
        .filter((o) => (o.id !== orderId && o.key !== orderId) && o.userId === order.userId && (o.status === 'pending' || o.status === 'processing'))
        .reduce((sum, o) => sum + (Number(o.amount || (Number(o.unitPrice || 0) * Number(o.quantity || 1))) || 0), 0);

      await update(ref(db, `users/${order.userId}`), {
        reserved_balance: Number(remainingPendingSum.toFixed(2)),
        total_spent: increment(order.amount || 0)
      });

      const formattedGmails = gmails.map((g) => ({
        email: g.gmail || (g as any).email,
        gmail: g.gmail || (g as any).email,
        password: g.password,
        recoveryEmail: g.recoveryEmail,
      }));

      const updatePayload = {
        status: 'delivered',
        deliveredAt: Date.now(),
        deliveryData: formattedGmails,
        delivered_gmails: formattedGmails,
        adminNote: adminNote || 'Approved & Delivered by Admin',
      };

      await update(ref(db, `buyer_orders/${orderId}`), updatePayload);
      await update(ref(db, `users/${order.userId}/buyer_orders/${orderId}`), updatePayload);

      // Record Debit Transaction
      const txKey = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const txData = {
        id: txKey,
        userId: order.userId,
        username: order.username,
        userEmail: order.userEmail || '',
        type: 'debit',
        category: 'Purchase',
        title: `অর্ডার #${(orderId || "").slice(-6).toUpperCase()} (${order.quantity} টি জিমেইল)`,
        amount: -order.amount,
        orderId,
        status: 'completed',
        timestamp: Date.now(),
        date: new Date().toISOString(),
      };

      try {
        await set(ref(db, `users/${order.userId}/transactions/${txKey}`), txData);
        await set(ref(db, `transactions/${txKey}`), txData);
      } catch {}

      // Notify Buyer
      const notifKey = `notif_${Date.now()}`;
      try {
        await set(ref(db, `users/${order.userId}/notifications/${notifKey}`), {
          id: notifKey,
          title: 'Order Delivered 🎉',
          desc: `আপনার অর্ডার #${(orderId || "").slice(-6).toUpperCase()} অনুমোদন হয়েছে।`,
          type: 'success',
          read: false,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
        });
      } catch {}

      setBuyerOrders((prev) =>
        prev.map((o) => (o.id === orderId || o.key === orderId ? { ...o, ...updatePayload } : o))
      );

      return { success: true, message: 'অর্ডার সফলভাবে অনুমোদন করা হয়েছে।' };
    } catch (err: any) {
      console.error('Approve order error:', err);
      return { success: false, message: err.message || 'Error approving order' };
    }
  };

  // Admin Reject Order: Sets status='cancelled', restores product stock
  const rejectBuyerOrder = async (orderId: string, adminNote?: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch('/api/admin/orders/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, adminNote: adminNote || 'Order cancelled by Admin. Stock restored.' }),
      });

      if (response.ok) {
        const result = await response.json();
        const order = buyerOrders.find((o) => o.id === orderId || o.key === orderId);
        if (order) {
          // Calculate remaining pending orders sum excluding this rejected order
          const remainingPendingSum = buyerOrders
            .filter((o) => (o.id !== orderId && o.key !== orderId) && (o.userId === order.userId) && (o.status === 'pending' || o.status === 'processing'))
            .reduce((sum, o) => sum + (Number(o.amount || (Number(o.unitPrice || 0) * Number(o.quantity || 1))) || 0), 0);

          const safeReserved = typeof result.buyerNewReservedBalance === 'number' && result.buyerNewReservedBalance >= 0
            ? result.buyerNewReservedBalance
            : Number(remainingPendingSum.toFixed(2));

          // Ensure RTDB user node has the synchronized reserved_balance
          if (order.userId) {
            try {
              await update(ref(db, `users/${order.userId}`), {
                reserved_balance: safeReserved
              });
            } catch (e) {
              console.warn('Direct RTDB sync on reject:', e);
            }
          }

          setBuyerProducts((prev) =>
            prev.map((p) => (p.id === order.productId ? { ...p, stock: p.stock + order.quantity } : p))
          );

          // Update local profile immediately if the current user is the buyer
          if (user && user.uid === order.userId) {
            setProfile((prev) => prev ? {
              ...prev,
              deposit_balance: typeof result.buyerNewDepositBalance === 'number' ? result.buyerNewDepositBalance : prev.deposit_balance,
              buyerWalletBalance: typeof result.buyerNewDepositBalance === 'number' ? result.buyerNewDepositBalance : prev.deposit_balance,
              reserved_balance: safeReserved
            } : null);

            try {
              if (typeof result.buyerNewDepositBalance === 'number') {
                localStorage.setItem(`mf_wallet_cache_${user.uid}`, JSON.stringify({
                  deposit_balance: result.buyerNewDepositBalance,
                  buyerWalletBalance: result.buyerNewDepositBalance,
                  reserved_balance: safeReserved,
                  timestamp: Date.now()
                }));
              }
            } catch {}
          }
        }

        setBuyerOrders((prev) => {
          const updated = prev.map((o) => (o.id === orderId || o.key === orderId ? { ...o, status: 'cancelled' as const, adminNote, refundProcessed: true } : o));
          try { localStorage.setItem('mf_buyer_orders', JSON.stringify(updated)); } catch {}
          return updated;
        });

        return { success: true };
      }
    } catch (e) {
      console.warn('Reject API error:', e);
    }

    try {
      const order = buyerOrders.find((o) => o.id === orderId || o.key === orderId);
      if (order) {
        // Calculate remaining pending orders sum
        const remainingPendingSum = buyerOrders
          .filter((o) => (o.id !== orderId && o.key !== orderId) && o.userId === order.userId && (o.status === 'pending' || o.status === 'processing'))
          .reduce((sum, o) => sum + (Number(o.amount || (Number(o.unitPrice || 0) * Number(o.quantity || 1))) || 0), 0);

        // Refund reserved_balance back to deposit_balance
        try {
          await update(ref(db, `users/${order.userId}`), {
            deposit_balance: increment(order.amount || 0),
            buyerWalletBalance: increment(order.amount || 0),
            reserved_balance: Number(remainingPendingSum.toFixed(2))
          });

          // Push exact refund notification
          const nKey = push(ref(db, `users/${order.userId}/notifications`)).key;
          const reasonText = adminNote ? ` (কারণ: ${adminNote})` : '';
          await update(ref(db, `users/${order.userId}/notifications/${nKey}`), {
            id: nKey,
            title: 'Order Cancelled & Refunded 💳',
            desc: `আপনার #${order.id || orderId} অর্ডারটি বাতিল করা হয়েছে এবং অর্ডারের সম্পূর্ণ ৳${Number(order.amount).toFixed(2)} টাকা সরাসরি আপনার ডিপোজিট ব্যালেন্সে ফেরত দেওয়া হয়েছে।${reasonText}`,
            type: 'info',
            read: false,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now()
          });
          
          // Update local profile if the logged in user is the buyer
          if (user && user.uid === order.userId) {
            const newDep = Number(((profile?.deposit_balance || 0) + order.amount).toFixed(2));
            setProfile(prev => prev ? {
              ...prev,
              deposit_balance: newDep,
              buyerWalletBalance: newDep,
              reserved_balance: Number(remainingPendingSum.toFixed(2))
            } : null);

            try {
              localStorage.setItem(`mf_wallet_cache_${user.uid}`, JSON.stringify({
                deposit_balance: newDep,
                buyerWalletBalance: newDep,
                reserved_balance: Number(remainingPendingSum.toFixed(2)),
                timestamp: Date.now()
              }));
            } catch {}
          }
        } catch (refundErr) {
          console.warn('Fund refund error:', refundErr);
        }

        await update(ref(db, `buyer_orders/${orderId}`), {
          status: 'cancelled',
          refundProcessed: true,
          adminNote: adminNote || 'Order cancelled by Admin.',
        });
        await update(ref(db, `users/${order.userId}/buyer_orders/${orderId}`), {
          status: 'cancelled',
          refundProcessed: true,
          adminNote: adminNote || 'Order cancelled by Admin.',
        });

        setBuyerProducts((prev) =>
          prev.map((p) => (p.id === order.productId ? { ...p, stock: p.stock + order.quantity } : p))
        );

        setBuyerOrders((prev) => {
          const updated = prev.map((o) => (o.id === orderId || o.key === orderId ? { ...o, status: 'cancelled' as const, adminNote, refundProcessed: true } : o));
          try { localStorage.setItem('mf_buyer_orders', JSON.stringify(updated)); } catch {}
          return updated;
        });
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  // Delete Buyer Product (Deletes from Firebase RTDB and propagates real-time)
  const deleteBuyerProduct = async (productId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      // 1. Delete node in Firebase RTDB
      await set(ref(db, `buyer_products/${productId}`), null);

      // 2. Call backend endpoint if available
      try {
        await fetch(`/api/admin/products/${productId}`, {
          method: 'DELETE',
        });
      } catch (e) {
        console.warn('Server delete product API notice:', e);
      }

      // 3. Optimistic local state & cache update
      setBuyerProducts((prev) => {
        const updated = prev.filter((p) => p.id !== productId);
        try { localStorage.setItem('mf_buyer_products', JSON.stringify(updated)); } catch {}
        return updated;
      });

      return { success: true, message: 'প্রোডাক্টটি সফলভাবে ডিলিট করা হয়েছে।' };
    } catch (err: any) {
      console.error('Delete product error:', err);
      return { success: false, message: err?.message || 'Failed to delete product' };
    }
  };

  // Price Alert Subscription Management
  const subscribePriceAlert = async (data: {
    accountType: 'fresh' | 'aged' | 'all';
    targetPrice?: number;
    direction?: 'any_change' | 'price_drop' | 'target_or_below';
  }): Promise<{ success: boolean; message?: string }> => {
    if (!user) {
      return { success: false, message: 'Please login first' };
    }

    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newAlert: PriceAlertSubscription = {
      id: alertId,
      userId: user.uid,
      userEmail: user.email || '',
      accountType: data.accountType,
      targetPrice: data.targetPrice,
      direction: data.direction || 'price_drop',
      createdAt: Date.now(),
      active: true,
    };

    try {
      await set(ref(db, `users/${user.uid}/price_alerts/${alertId}`), newAlert);
      await set(ref(db, `price_alerts/${alertId}`), newAlert);
    } catch (e) {
      console.warn('Price alert DB write error:', e);
    }

    setPriceAlerts((prev) => {
      const updated = [newAlert, ...prev.filter((a) => a.id !== alertId)];
      try { localStorage.setItem('mf_price_alerts', JSON.stringify(updated)); } catch {}
      return updated;
    });

    const categoryLabel = data.accountType === 'all'
      ? (language === 'bn' ? 'সকল প্যাকেজ' : 'All Accounts')
      : data.accountType === 'fresh'
      ? (language === 'bn' ? 'ফ্রেশ জিমেইল' : 'Fresh Gmail')
      : (language === 'bn' ? 'ওল্ড জিমেইল' : 'Aged Gmail');

    addNotification(
      language === 'bn' ? 'প্রাইস অ্যালার্ট সেট করা হয়েছে 🔔' : 'Price Alert Subscribed 🔔',
      language === 'bn'
        ? `${categoryLabel}-এর জন্য আপনার প্রাইস অ্যালার্ট সক্রিয় হয়েছে। দাম পরিবর্তন হলে সাথে সাথে নোটিফিকেশন পাবেন।`
        : `Your price alert for ${categoryLabel} is now active. You will be notified instantly on price drops.`,
      'success'
    );

    return { success: true };
  };

  const unsubscribePriceAlert = async (id: string): Promise<{ success: boolean; message?: string }> => {
    if (user) {
      try {
        await set(ref(db, `users/${user.uid}/price_alerts/${id}`), null);
        await set(ref(db, `price_alerts/${id}`), null);
      } catch (e) {
        console.warn('Unsubscribe alert DB write error:', e);
      }
    }

    setPriceAlerts((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      try { localStorage.setItem('mf_price_alerts', JSON.stringify(updated)); } catch {}
      return updated;
    });

    addNotification(
      language === 'bn' ? 'প্রাইস অ্যালার্ট সরানো হয়েছে' : 'Price Alert Removed',
      language === 'bn' ? 'অ্যালার্টটি নিষ্ক্রিয় করা হয়েছে।' : 'The price alert subscription has been removed.',
      'info'
    );

    return { success: true };
  };

  const contextValue = useMemo<AppContextType>(() => ({
    appMode,
    setAppMode,
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
    submissions: submissions || [],
    allSubmissions: allSubmissions || [],
    withdrawRequests: withdrawRequests || [],
    buyerProducts: buyerProducts || [],
    buyerOrders: buyerOrders || [],
    depositRequests: depositRequests || [],
    isAdmin,
    deleteBuyerProduct,
    createBuyerOrder,
    approveBuyerOrder,
    rejectBuyerOrder,
    requestDeposit,
    sandboxVerifyDeposit,
    verifyBuyerDeposit,
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
    claimReferralEarnings,
    appLogo,
    copyText,
    priceAlerts,
    isPriceAlertModalOpen,
    setPriceAlertModalOpen,
    subscribePriceAlert,
    unsubscribePriceAlert,
  }), [
    appMode,
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
    allSubmissions,
    withdrawRequests,
    buyerProducts,
    buyerOrders,
    depositRequests,
    isAdmin,
    deleteBuyerProduct,
    createBuyerOrder,
    approveBuyerOrder,
    rejectBuyerOrder,
    requestDeposit,
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
    isPriceAlertModalOpen,
    setPriceAlertModalOpen,
    priceAlerts,
    subscribePriceAlert,
    unsubscribePriceAlert,
    claimDailyStreak,
    claimReferralEarnings,
    sandboxVerifyDeposit,
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
