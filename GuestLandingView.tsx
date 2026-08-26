import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from './AppContext';
import { translations, LANGUAGES } from './i18n';
import { hapticFeedback } from './haptics';
import { AuthPageView } from './AuthPageView';
import { db } from './firebase';
import { ref, onValue } from 'firebase/database';
import { Review, TopSellerItem, isExcludedSeller } from './types';
import { AppLogo3D } from './AppLogo3D';
import { DEFAULT_BENCHMARK_SELLERS } from './SellersView';
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  TrendingUp,
  Award,
  Users,
  ArrowRight,
  UserPlus,
  LogIn,
  Star,
  Globe,
  DollarSign,
  Lock,
  MessageSquare,
  HelpCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Flame,
  Check,
  Shield,
  Layers,
  X,
  Trophy,
  Crown,
  User as UserIcon,
} from 'lucide-react';

export const GuestLandingView: React.FC = () => {
  const {
    language,
    setLanguage,
    isAuthModalOpen,
    authModalMode,
    setAuthModalOpen,
    topSellers,
    allUsers,
    levels,
    reviewShifts,
    appLogo,
    commissionPercent,
    signupBonusUser,
  } = useApp();

  const t = translations[language] || translations['bn'];
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Live real Firebase reviews state
  const [liveReviews, setLiveReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number>(5.0);
  const [totalReviewsCount, setTotalReviewsCount] = useState<number>(0);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const reviewsRef = ref(db, 'reviews');
      const unsubscribe = onValue(reviewsRef, (snapshot) => {
        const data = snapshot.val();
        if (data && typeof data === 'object') {
          const allList: Review[] = Object.keys(data).map((k) => ({
            ...data[k],
            id: k,
          }));

          const published = allList.filter((r) => r.status !== 'rejected');
          let sum = 0;
          published.forEach((r) => {
            sum += Number(r.rating) || 5;
          });

          setTotalReviewsCount(published.length);
          setAvgRating(published.length > 0 ? sum / published.length : 5.0);

          const sorted = [...published].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setLiveReviews(sorted);
        } else {
          setLiveReviews([]);
          setTotalReviewsCount(0);
          setAvgRating(5.0);
        }
      });

      return () => unsubscribe();
    } catch {
      // safe fallback
    }
  }, []);

  const [authMode, setAuthModeState] = useState<'none' | 'register' | 'login'>(() => {
    try {
      const path = window.location.pathname.toLowerCase();
      if (path === '/register' || path === '/signup') return 'register';
      if (path === '/login') return 'login';
      const search = new URLSearchParams(window.location.search);
      if (search.get('mode') === 'register') return 'register';
      if (search.get('mode') === 'login') return 'login';
    } catch {
      // Safe ignore
    }
    return 'none';
  });

  const setAuthMode = useCallback((mode: 'none' | 'register' | 'login') => {
    setAuthModeState(mode);
    try {
      const targetPath = mode === 'register' ? '/register' : mode === 'login' ? '/login' : '/';
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ authMode: mode }, '', targetPath);
      }
    } catch (e) {
      console.warn('URL sync error in GuestLanding:', e);
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/register' || path === '/signup') {
        setAuthModeState('register');
      } else if (path === '/login') {
        setAuthModeState('login');
      } else {
        setAuthModeState('none');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync with triggers from AppContext if any component calls setAuthModalOpen
  useEffect(() => {
    if (isAuthModalOpen && authModalMode) {
      setAuthModeState(authModalMode);
      setAuthModalOpen(false); // Render full page AuthPageView instead of popup modal
    }
  }, [isAuthModalOpen, authModalMode, setAuthModalOpen]);

  // Combine real Firebase users, admin configured topSellers & benchmark performers in real-time
  const sellersList = React.useMemo(() => {
    // 1. Valid sellers configured in topSellers
    const validConfigured = (topSellers || []).filter(
      (s) => s && !isExcludedSeller(s.username, s.email, s.uid)
    );

    // 2. Real registered users from Firebase
    const realUsersMapped: TopSellerItem[] = (allUsers || [])
      .filter((u) => u && !isExcludedSeller(u.username, u.email, u.uid))
      .map((u, idx) => {
        const approved = u.manual_approved_count !== undefined ? Number(u.manual_approved_count) : (Number(u.total_submitted) || 0);
        const earnings = Number(u.totalEarnings) || (Number(u.balance || 0) + Number(u.total_withdrawn || 0)) || Number(u.balance || 0);
        return {
          uid: u.uid || `user_${idx}`,
          username: u.username || (u.email ? u.email.split('@')[0] : `Seller`),
          email: u.email || '',
          photoURL: u.photoURL || '',
          totalEarnings: earnings,
          balance: Number(u.balance) || 0,
          manual_approved_count: approved,
          total_submitted: Number(u.total_submitted) || 0,
          badge: approved >= 100 ? 'VIP Champion' : approved >= 30 ? 'Diamond VIP' : 'Gold Partner',
          rank: 0,
        };
      });

    const listMap = new Map<string, TopSellerItem>();

    // Seed default top benchmark performers
    DEFAULT_BENCHMARK_SELLERS.forEach((item) => {
      if (!isExcludedSeller(item.username, item.email, item.uid)) {
        listMap.set(item.username.toLowerCase(), item);
      }
    });

    // Merge active real users who have activity/earnings
    realUsersMapped.forEach((item) => {
      if (item.totalEarnings > 0 || item.manual_approved_count > 0 || item.balance > 0) {
        listMap.set(item.username.toLowerCase(), item);
      }
    });

    // Merge valid admin configured top sellers
    validConfigured.forEach((item) => {
      listMap.set(item.username.toLowerCase(), {
        ...item,
        totalEarnings: Number(item.totalEarnings) || 0,
        manual_approved_count: item.manual_approved_count !== undefined ? Number(item.manual_approved_count) : (Number(item.total_submitted) || 0),
      });
    });

    const combinedList = Array.from(listMap.values());
    combinedList.sort((a, b) => (Number(b.totalEarnings) || 0) - (Number(a.totalEarnings) || 0));

    return combinedList.slice(0, 8).map((seller, idx) => ({
      ...seller,
      rank: idx + 1,
      badge: idx === 0 ? 'VIP Champion' : idx < 3 ? 'Diamond VIP' : 'Gold Partner',
    }));
  }, [allUsers, topSellers]);

  if (authMode !== 'none') {
    return (
      <AuthPageView
        initialMode={authMode}
        onBackToLanding={() => {
          setAuthMode('none');
          try {
            if (window.location.pathname !== '/') {
              window.history.pushState({}, '', '/');
            }
          } catch {}
        }}
      />
    );
  }

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const fallbackReviews: Review[] = [
    {
      id: 'def_1',
      userId: 'u1',
      userName: 'আজিমুল ইসলাম',
      rating: 5,
      text: 'Mail Factory-তে জিমেইল দিলে ১০ থেকে ২০ মিনিটের মধ্যে পেআউট পাওয়া যায়। বিকাশ এবং নগদে পেমেন্ট নিয়ে কখনোই কোন সমস্যা হয়নি!',
      isVerified: true,
      createdAt: Date.now() - 86400000,
      status: 'approved',
      updatedAt: Date.now() - 86400000,
    },
    {
      id: 'def_2',
      userId: 'u2',
      userName: 'Tanvir Rahman',
      rating: 5,
      text: 'The level system is amazing! I started at Level 1 and now I am getting ৳14 per Gmail at Level 5. Highly recommended!',
      isVerified: true,
      createdAt: Date.now() - 172800000,
      status: 'approved',
      updatedAt: Date.now() - 172800000,
    },
    {
      id: 'def_3',
      userId: 'u3',
      userName: 'রাসেল আহমেদ',
      rating: 5,
      text: 'রেফারেল সিস্টেম থেকে বন্ধুক সেল করলেই ১০% কমিশন পাচ্ছি। সত্যি বলতে খুবই লাভজনক ও বিশ্বস্ত প্ল্যাটফর্ম।',
      isVerified: true,
      createdAt: Date.now() - 259200000,
      status: 'approved',
      updatedAt: Date.now() - 259200000,
    },
  ];

  const displayedReviews = liveReviews.length > 0 ? liveReviews : fallbackReviews;
  const effectiveCount = liveReviews.length > 0 ? totalReviewsCount : fallbackReviews.length;
  const effectiveRating = liveReviews.length > 0 ? avgRating : 5.0;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white pb-12">
      {/* Landing Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <AppLogo3D size={38} glow animated className="shrink-0" />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white whitespace-nowrap">
                Mail Factory
              </h1>
              <p className="text-[9px] sm:text-[10px] font-semibold text-slate-400 whitespace-nowrap truncate max-w-[140px] xs:max-w-[200px] sm:max-w-none">
                {t.slogan || '★ বিশ্বস্ত ও দ্রুত এক্সচেঞ্জ ★'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Multi-language Selector */}
            <div className="relative shrink-0">
              <button
                onClick={() => {
                  hapticFeedback.light();
                  setIsLangDropdownOpen(!isLangDropdownOpen);
                }}
                className="px-2 py-1.5 sm:px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1 sm:gap-1.5 transition-all shrink-0"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>{currentLangObj.flag}</span>
                <span className="uppercase text-[11px] hidden sm:inline">{currentLangObj.code}</span>
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-1.5 z-50 text-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-slate-700 mb-1">
                    {t.selectLanguage || 'ভাষা নির্বাচন করুন'}
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        hapticFeedback.medium();
                        setLanguage(lang.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        language === lang.code
                          ? 'bg-indigo-600 text-white'
                          : 'hover:bg-slate-700/70 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </div>
                      {language === lang.code && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Login & Register Buttons */}
            <button
              onClick={() => {
                hapticFeedback.medium();
                setAuthMode('login');
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white flex items-center gap-1 transition-all cursor-pointer shrink-0 whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t.login || 'লগইন'}</span>
            </button>

            <button
              onClick={() => {
                hapticFeedback.medium();
                setAuthMode('register');
              }}
              className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-extrabold shadow-md shadow-indigo-500/25 flex items-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{t.register || 'সাইন আপ'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-10 flex-1 w-full">
        {/* HERO SECTION */}
        <section className="relative rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/20 p-6 sm:p-10 overflow-hidden shadow-2xl">
          {/* Background Ambient Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>
                {language === 'bn'
                  ? 'বাংলাদেশের #১ নির্ভরযোগ্য ও দ্রুত জিমেইল বায়িং প্ল্যাটফর্ম'
                  : 'Bangladesh #1 Fast & Trusted Gmail Exchange'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight">
              {language === 'bn' ? (
                <>
                  আপনার জিমেইল বিক্রি করে <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                    প্রতিদিন নিশ্চিত পেমেন্ট ইনকাম করুন
                  </span>
                </>
              ) : (
                <>
                  Sell Your Gmail Accounts & <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                    Get Instant Cash Daily
                  </span>
                </>
              )}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              {language === 'bn'
                ? 'Mail Factory-তে আপনার নতুন বা পুরাতন জিমেইল সাবমিট করুন। আমাদের এক্সপ্রেস ভেরিফিকেশন শেষে সরাসরি বিকাশ, নগদ বা রকেটে ইন্সট্যান্ট টাকা বুঝে নিন।'
                : 'Submit your fresh or aged Gmail accounts on Mail Factory. Receive instant payouts directly to your bKash, Nagad, Rocket or USDT wallet upon quick audit.'}
            </p>

            {/* Main Action Banner */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => {
                  hapticFeedback.heavy();
                  setAuthMode('register');
                }}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-600 hover:to-pink-700 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 group cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{language === 'bn' ? 'ফ্রি অ্যাকাউন্ট তৈরি করুন (৳৫ বোনাস)' : 'Create Free Account (৳5 Bonus)'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  hapticFeedback.light();
                  setAuthMode('login');
                }}
                className="px-6 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-indigo-400" />
                <span>{language === 'bn' ? 'আগে থেকেই অ্যাকাউন্ট আছে? লগইন' : 'Already have an account? Login'}</span>
              </button>
            </div>

            {/* Quick Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-slate-800/80">
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'bn' ? '৳১৫-৳২৫ / Gmail' : '৳15-৳25 / Gmail'}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'bn' ? 'বিকাশ / নগদ ইনস্ট্যান্ট' : 'bKash / Nagad Instant'}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'bn' ? '১০% রেফারেল ইনকাম' : '10% Referral Earnings'}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'bn' ? '২৪/৭ সাপোর্ট ডেস্ক' : '24/7 Support Desk'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* APP SITUATION & LIVE STATS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <span>{language === 'bn' ? 'প্ল্যাটফর্ম ওভারভিউ ও পরিসংখ্যান' : 'Platform Situation & Overview'}</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {language === 'bn' ? 'বর্তমান সক্রিয় স্ট্যাটাস ও প্ল্যাটফর্ম তথ্য' : 'Current active stats & platform status'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 relative overflow-hidden group hover:border-indigo-500/50 transition-all">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                <Users className="w-4 h-4" />
                <span>{language === 'bn' ? 'নিবন্ধিত সেলার' : 'Registered Sellers'}</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {language === 'bn' ? '৫০,০০০+' : '50,000+'}
              </p>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {language === 'bn' ? 'সক্রিয় সেলার নেটওয়ার্ক' : 'Active Seller Network'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 relative overflow-hidden group hover:border-purple-500/50 transition-all">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
                <Award className="w-4 h-4" />
                <span>{language === 'bn' ? 'প্রসেসকৃত জিমেইল' : 'Processed Gmails'}</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {language === 'bn' ? '৬০,০০০+' : '60,000+'}
              </p>
              <span className="text-[10px] text-indigo-400 font-bold block">
                {language === 'bn' ? '✓ ৯৯.৮% ভেরিফাইড' : '✓ 99.8% Verified'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <DollarSign className="w-4 h-4" />
                <span>{language === 'bn' ? 'মোট পেমেন্ট পরিশোধ' : 'Total Paid Out'}</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                {language === 'bn' ? '৳৬,৫০,০০০+' : '৳6,50,000+'}
              </p>
              <span className="text-[10px] text-slate-400 font-bold block">
                {language === 'bn' ? 'বিকাশ, নগদ, রকেট' : 'bKash, Nagad, Rocket'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 relative overflow-hidden group hover:border-amber-500/50 transition-all">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <Zap className="w-4 h-4" />
                <span>{language === 'bn' ? 'গড় রিভিউ সময়' : 'Avg Review Time'}</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
                {language === 'bn' ? '৬ - ১২ ঘণ্টা' : '6 - 12 Hours'}
              </p>
              <span className="text-[10px] text-amber-400 font-bold block">
                {language === 'bn' ? '⚡ দ্রুততম ভেরিফিকেশন' : '⚡ Fastest Verification'}
              </span>
            </div>
          </div>
        </section>

        {/* TOP SELLERS SHOWCASE */}
        <section className="p-5 sm:p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>{language === 'bn' ? 'আমাদের সেরা সেলারবৃন্দ (Top Sellers)' : 'Top Sellers Leaderboard'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold sm:hidden flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {language === 'bn' ? 'যারা প্রতিদিন নিয়মিত জিমেইল বিক্রি করে সর্বোচ্চ ইনকাম করছেন' : 'Highest earning verified sellers on Mail Factory'}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-extrabold hidden sm:inline-flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {language === 'bn' ? 'রিয়েল টাইম লাইভ আপডেট' : 'Live Real-Time Ranking'}
            </span>
          </div>

          {sellersList && sellersList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {sellersList.map((seller, idx) => {
                const approvedCount = seller.manual_approved_count !== undefined ? Number(seller.manual_approved_count) : (Number(seller.total_submitted) || 0);
                const totalEarnings = Number(seller.totalEarnings) || Number(seller.balance) || 0;
                const rank = seller.rank || idx + 1;

                return (
                  <div
                    key={seller.uid || idx}
                    className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/70 flex items-center justify-between text-xs hover:border-indigo-500/50 hover:bg-slate-800 transition-all duration-200 shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center shrink-0 shadow-md ${
                          rank === 1
                            ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-amber-500/30'
                            : rank === 2
                            ? 'bg-gradient-to-tr from-slate-200 to-slate-400 text-slate-900 shadow-slate-300/20'
                            : rank === 3
                            ? 'bg-gradient-to-tr from-amber-700 to-orange-500 text-white shadow-amber-700/20'
                            : 'bg-slate-700/80 text-slate-300 border border-slate-600'
                        }`}
                      >
                        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-white truncate max-w-[130px] sm:max-w-[160px]">
                            {seller.username || seller.email?.split('@')[0] || 'Top Seller'}
                          </span>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                            <span>{seller.badge || (rank === 1 ? 'VIP Champion' : rank < 3 ? 'Diamond VIP' : 'Verified Partner')}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">
                        {language === 'bn' ? 'মোট আর্ন' : 'Total Earned'}
                      </span>
                      <span className="text-sm font-black text-emerald-400">
                        ৳{totalEarnings.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center text-xs text-slate-400 font-medium">
              {language === 'bn'
                ? 'বর্তমানে কোনো সক্রিয় সেলার রেকর্ড নেই। এখনই অ্যাকাউন্ট তৈরি করে আপনার পজিশন অর্জন করুন!'
                : 'No leaderboard records found yet. Create an account now to claim your spot!'}
            </div>
          )}

          <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-slate-900 border border-indigo-500/30 flex items-center justify-between text-xs text-indigo-200">
            <span className="font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {language === 'bn'
                ? 'আপনিও হতে পারেন আমাদের পরবর্তী সেরা সেলার!'
                : 'Become our next top seller today!'}
            </span>
            <button
              onClick={() => {
                hapticFeedback.medium();
                setAuthMode('register');
              }}
              className="text-amber-400 font-black hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'bn' ? 'সাইন আপ করুন' : 'Sign Up Now'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* LEVEL RATE STRUCTURE - Mobile Optimized Aesthetic Redesign */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Layers className="w-5 h-5" />
                </div>
                <span>{language === 'bn' ? 'লেভেল রেট এবং প্রাইজ চার্ট' : 'Level Rate Structure'}</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {language === 'bn'
                  ? 'যত বেশি জিমেইল সাবমিট করবেন, আপনার প্রতি জিমেইলে বোনাস রেট তত বৃদ্ধি পাবে'
                  : 'Submit more Gmails to automatically unlock higher bonus rate perks'}
              </p>
            </div>
          </div>

          {/* Responsive Level Rate Grid: 2-col on mobile, 5-col on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {levels.map((lvl, index) => {
              const isMaster = lvl.level === 5;
              const isLevel4 = lvl.level === 4;

              const perkTags: Record<number, string> = {
                1: language === 'bn' ? 'স্ট্যান্ডার্ড রেট' : 'Standard Rate',
                2: language === 'bn' ? '+৳১ বোনাস রেট' : '+৳1 Bonus Rate',
                3: language === 'bn' ? '+৳২ ফাস্ট অডিট' : '+৳2 Fast Audit',
                4: language === 'bn' ? '+৳৩ প্রাইওরিটি' : '+৳3 Priority Audit',
                5: language === 'bn' ? '★ সর্বোচ্চ রেট ★' : '★ Max VIP Rate ★',
              };

              return (
                <div
                  key={lvl.level}
                  className={`relative p-3.5 sm:p-4 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] shadow-sm ${
                    isMaster
                      ? 'col-span-2 sm:col-span-1 bg-gradient-to-b from-amber-500/15 via-slate-800/90 to-purple-950/40 border-2 border-amber-400/50 shadow-amber-500/10'
                      : isLevel4
                      ? 'bg-gradient-to-b from-purple-900/30 to-slate-800/80 border border-purple-500/40'
                      : 'bg-slate-800/80 border border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        isMaster
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      Level {lvl.level}
                    </span>
                    {isMaster && (
                      <span className="text-xs text-amber-400 animate-pulse">👑</span>
                    )}
                  </div>

                  {/* Level Title */}
                  <h4 className="text-xs font-black text-white truncate">
                    {lvl.title}
                  </h4>

                  {/* Price Rate Highlight */}
                  <div className="my-2 py-1.5 px-2 rounded-xl bg-slate-900/60 border border-slate-700/50 text-center">
                    <span className="text-2xl font-black text-emerald-400 tracking-tight">
                      ৳{lvl.rate}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium ml-1">/Pcs</span>
                  </div>

                  {/* Criteria / Gmail Target */}
                  <div className="space-y-1 text-center">
                    <span className="text-[11px] font-bold text-slate-300 block">
                      {lvl.approved === 0 ? (language === 'bn' ? '০ - ৩৯ টি' : '0 - 39 Pcs') : `${lvl.approved}+ ${language === 'bn' ? 'টি' : 'Pcs'}`}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md inline-block ${
                        isMaster
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-700/50 text-indigo-300'
                      }`}
                    >
                      {perkTags[lvl.level] || 'বোনাস সুবিধা'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80 space-y-4">
          <h3 className="text-base font-black text-white text-center">
            {language === 'bn' ? '৩টি সহজ ধাপে কাজ শুরু করুন' : 'Start Selling in 3 Simple Steps'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700/80 space-y-2 text-center">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 font-black flex items-center justify-center mx-auto text-sm border border-indigo-500/30">
                1
              </div>
              <h4 className="text-xs font-extrabold text-white">
                {language === 'bn' ? '১. ফ্রি অ্যাকাউন্ট খুলুন' : '1. Sign Up Free'}
              </h4>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                {language === 'bn'
                  ? 'আপনার নাম ও ইমেইল দিয়ে মাত্র ৩০ সেকেন্ডে রেজিস্ট্রেশন সম্পন্ন করুন এবং ৳৫ জয়েনিং বোনাস নিন।'
                  : 'Register with your email in 30 seconds and instantly get your welcome cash bonus.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700/80 space-y-2 text-center">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 font-black flex items-center justify-center mx-auto text-sm border border-purple-500/30">
                2
              </div>
              <h4 className="text-xs font-extrabold text-white">
                {language === 'bn' ? '২. জিমেইল সাবমিট করুন' : '2. Submit Gmails'}
              </h4>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                {language === 'bn'
                  ? 'আপনার কাছে থাকা নতুন বা পুরাতন জিমেইল অ্যাড্রেস এবং পাসওয়ার্ড বাল্ক পেস্ট করে সাবমিট করুন।'
                  : 'Bulk paste or enter your fresh or aged Gmail credentials safely onto our submission forms.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700/80 space-y-2 text-center">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center mx-auto text-sm border border-emerald-500/30">
                3
              </div>
              <h4 className="text-xs font-extrabold text-white">
                {language === 'bn' ? '৩. সরাসরি ক্যাশ আউট' : '3. Instant Payout'}
              </h4>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                {language === 'bn'
                  ? 'রিভিও সম্পন্ন হলে সাথে সাথে আপনার ব্যালেন্স যুক্ত হবে এবং বিকাশ, নগদ বা রকেটে উইথড্র দিন।'
                  : 'Once audited, earnings hit your main wallet. Withdraw to bKash, Nagad or Rocket anytime.'}
              </p>
            </div>
          </div>
        </section>

        {/* CUSTOMER REVIEWS (REAL PERSISTED USER REVIEWS) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{language === 'bn' ? 'সেলারদের মতামত ও লাইভ রিভিউ' : 'Live Seller Reviews & Feedback'}</span>
              </h3>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400 font-medium">
                <div className="flex items-center text-amber-400">
                  <span className="font-extrabold text-amber-300 mr-1 text-sm">{effectiveRating.toFixed(1)}</span>
                  {'★'.repeat(Math.round(effectiveRating))}
                </div>
                <span>•</span>
                <span>{effectiveCount}+ {language === 'bn' ? 'সন্তুষ্ট সেলার রিভিউ' : 'Verified Reviews'}</span>
              </div>
            </div>

            {displayedReviews.length > 3 && (
              <button
                onClick={() => {
                  hapticFeedback.light();
                  setIsReviewsModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-indigo-300 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>{language === 'bn' ? 'সবগুলো দেখুন' : 'View All'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {displayedReviews.slice(0, 3).map((rev) => {
              const dateStr = rev.createdAt 
                ? new Date(rev.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                    day: 'numeric',
                    month: 'short',
                  })
                : (language === 'bn' ? 'সম্প্রতি' : 'Recent');

              return (
                <div key={rev.id} className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5 hover:border-slate-600 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black flex items-center justify-center text-xs overflow-hidden border border-slate-700 shadow-sm shrink-0">
                          {rev.userPhoto ? (
                            <img src={rev.userPhoto} alt={rev.userName} width={32} height={32} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                          ) : (
                            rev.userName?.charAt(0).toUpperCase() || 'U'
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-extrabold text-white truncate">{rev.userName}</span>
                            {rev.isVerified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" title="Verified Seller" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium block">
                            {dateStr}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center text-amber-400 text-xs shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${s <= (rev.rating || 5) ? 'fill-amber-400 text-amber-400' : 'fill-slate-700 text-slate-600'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium leading-relaxed italic line-clamp-3">
                      "{rev.text}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-emerald-400 font-bold">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {language === 'bn' ? 'ভেরিফাইড পেআউট সম্পন্ন' : 'Verified Payout Done'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* BOTTOM CTA BANNER */}
        <section className="p-8 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-center space-y-4 shadow-2xl shadow-indigo-500/30">
          <h3 className="text-xl sm:text-2xl font-black">
            {language === 'bn'
              ? 'আজই যুক্ত হন Mail Factory পরিবারে এবং আপনার ইনকাম শুরু করুন!'
              : 'Join Mail Factory Today & Start Earning Online!'}
          </h3>
          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl mx-auto font-medium">
            {language === 'bn'
              ? 'হাজার হাজার সফল সেলারদের সাথে যুক্ত হয়ে নিশ্চিন্তে নিজের সময় কাজে লাগিয়ে অর্থ উপার্জন করুন।'
              : 'Join thousands of trusted sellers exchanging Gmail accounts daily with instant local payouts.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                hapticFeedback.heavy();
                setAuthModalOpen(true, 'register');
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-slate-900 font-black text-sm hover:bg-slate-100 transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              {language === 'bn' ? '🚀 ফ্রিতে রেজিস্ট্রেশন করুন' : '🚀 Register For Free'}
            </button>
            <button
              onClick={() => {
                hapticFeedback.light();
                setAuthModalOpen(true, 'login');
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-900/60 hover:bg-indigo-900 border border-white/20 text-white font-bold text-sm transition-all cursor-pointer"
            >
              {language === 'bn' ? '🔑 লগইন করুন' : '🔑 Account Login'}
            </button>
          </div>
        </section>
      </main>

      {/* Landing Footer */}
      <footer className="mt-12 text-center text-[11px] text-slate-500 border-t border-slate-800 pt-6">
        <p>© {new Date().getFullYear()} Mail Factory. All rights reserved. Bangladesh #1 Trusted Exchange Platform.</p>
      </footer>

      {/* View All Reviews Modal for Guests */}
      {isReviewsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    {language === 'bn' ? 'সেলারদের সকল রিভিউ' : 'All Seller Reviews'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {effectiveRating.toFixed(1)} ★ • {effectiveCount} {language === 'bn' ? 'টি মোট রিভিউ' : 'Total Reviews'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReviewsModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
              {displayedReviews.map((rev) => (
                <div key={rev.id} className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center overflow-hidden">
                        {rev.userPhoto ? (
                          <img src={rev.userPhoto} alt={rev.userName} width={28} height={28} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                        ) : (
                          rev.userName?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-extrabold text-white">{rev.userName}</span>
                          {rev.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center text-amber-400 text-xs">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${s <= (rev.rating || 5) ? 'fill-amber-400 text-amber-400' : 'fill-slate-700 text-slate-600'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 font-normal leading-relaxed">
                    "{rev.text}"
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setIsReviewsModalOpen(false);
                  setAuthMode('register');
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs transition-all shadow-md active:scale-98"
              >
                {language === 'bn' ? 'এখনই যুক্ত হয়ে কাজ শুরু করুন' : 'Join Now & Start Earning'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
