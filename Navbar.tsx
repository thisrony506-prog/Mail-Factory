import React, { useState, useRef, useEffect } from 'react';
import { useApp } from './AppContext';
import { useUserBalance } from './useUserBalance';
import { translations, LANGUAGES } from './i18n';
import { auth, signOut } from './firebase';
import { AppLogo3D } from './AppLogo3D';
import {
  Bell,
  MessageSquare,
  Wallet,
  Globe,
  Download,
  Check,
  X,
  Menu,
  Home,
  ArrowLeftRight,
  History,
  Trophy,
  User,
  ChevronRight,
  KeyRound,
  HelpCircle,
  PhoneCall,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  LogOut,
  Trash2,
  Star,
  Gift,
  Info,
  Lock,
} from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';
import { hapticFeedback } from './haptics';
import { ActiveTab } from './types';

interface NavbarProps {
  onOpenEditProfile?: () => void;
  onOpenChangePass?: () => void;
  onOpenFAQ?: () => void;
  onOpenContact?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenEditProfile,
  onOpenChangePass,
  onOpenFAQ,
  onOpenContact,
}) => {
  const {
    appLogo,
    language,
    setLanguage,
    activeTab,
    setActiveTab,
    unreadNotifsCount,
    setNotifDrawerOpen,
    setChatDrawerOpen,
    isSettingsDrawerOpen,
    setSettingsDrawerOpen,
    setAuthModalOpen,
    user,
    profile,
    currentLevel,
    withdrawRequests,
  } = useApp();

  const hasWithdrawn = Boolean(
    (Number(profile?.total_withdrawn) > 0) ||
    (withdrawRequests && withdrawRequests.some((w) => w.status === 'approved' || w.status === 'pending'))
  );

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const t = translations[language];
  const { isInstallable, promptInstall } = usePWAInstall();

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeAndExecute = (action?: () => void) => {
    hapticFeedback.light();
    setSettingsDrawerOpen(false);
    if (action) action();
  };

  const handleLogout = async () => {
    if (window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত যে লগআউট করতে চান?' : 'Are you sure you want to log out?')) {
      setSettingsDrawerOpen(false);
      await signOut(auth);
      setActiveTab('home');
    }
  };

  const { balance: realTimeBalance, loading: balanceLoading } = useUserBalance(user);
  const mainBalance = balanceLoading ? "..." : (Number(realTimeBalance) || 0).toFixed(2);
  const holdBalance = (Number(profile?.hold) || 0).toFixed(2);

  return (
    <>
      <header className="sticky top-0 z-40 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white shadow-lg backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-2.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-3">
          {/* Left Area: 3-Line Menu Button + Brand & Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
            {/* Modern High-End Menu Button */}
            <button
              onClick={() => {
                hapticFeedback.medium();
                setSettingsDrawerOpen(true);
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-gradient-to-b from-white/15 to-white/5 hover:from-amber-400/20 hover:to-white/15 border border-white/20 hover:border-amber-300/50 shadow-md hover:shadow-amber-500/20 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shrink-0 flex flex-col items-center justify-center gap-1 p-1.5 group relative overflow-hidden"
              title="Menu / মেনু"
              aria-label="Open side menu"
            >
              {/* Subtle hover gradient glow ring */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/0 via-amber-300/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Modern 3-bar precision tiered menu lines */}
              <span className="w-4 sm:w-5 h-[2px] sm:h-[2.5px] rounded-full bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400 shadow-2xs group-hover:w-5 transition-all duration-300" />
              <span className="w-3 sm:w-3.5 h-[2px] sm:h-[2.5px] rounded-full bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400 shadow-2xs group-hover:w-5 group-hover:from-amber-300 group-hover:to-amber-500 transition-all duration-300 self-start ml-0.5 group-hover:ml-0 group-hover:self-center" />
              <span className="w-4 sm:w-5 h-[2px] sm:h-[2.5px] rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 shadow-2xs group-hover:w-4 transition-all duration-300" />
            </button>

            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-1.5 sm:gap-2.5 text-left group transition-transform active:scale-95 min-w-0"
            >
              <AppLogo3D size={36} animated glow={false} className="shrink-0" />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1 leading-none">
                  <span className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-white whitespace-nowrap">Mail</span>
                  <span className="text-base sm:text-lg md:text-xl font-black text-amber-300 whitespace-nowrap">Factory</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 min-w-0">
                  <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold tracking-wider text-amber-300 uppercase truncate max-w-[120px] xs:max-w-[150px] sm:max-w-none">
                    ★ FAST & TRUSTED ★
                  </span>
                  <div className="hidden md:flex items-center gap-1 bg-black/20 px-1.5 py-0.5 rounded-full border border-white/10 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[8px] font-mono text-emerald-300">SERVER ONLINE (45ms)</span>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Install App Button (PWA) */}
            {isInstallable && (
              <button
                onClick={() => {
                  hapticFeedback.medium();
                  promptInstall();
                }}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-amber-900 text-xs font-black shadow-sm transition-all shrink-0"
                title="Install Mail Factory App"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            )}

            {/* Quick Balance Pill */}
            {user && profile ? (
              <button
                onClick={() => setActiveTab('withdraw')}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-bold text-white transition-all shadow-inner shrink-0"
                title="Click to withdraw"
              >
                <Wallet className="w-3.5 h-3.5 text-amber-300" />
                <span>৳{mainBalance}</span>
              </button>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white text-indigo-700 text-xs font-bold shadow hover:bg-indigo-50 active:scale-95 transition-all shrink-0"
              >
                {t.login}
              </button>
            )}

            {/* Multi-Language Dropdown */}
            <div className="relative shrink-0" ref={langRef}>
              <button
                onClick={() => {
                  hapticFeedback.light();
                  setIsLangMenuOpen(!isLangMenuOpen);
                }}
                className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-all shrink-0"
                title="Select Language"
                aria-label="Select Language"
                aria-expanded={isLangMenuOpen}
                aria-haspopup="true"
              >
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-200" />
                <span className="text-xs">{currentLangObj.flag}</span>
                <span className="uppercase text-[10px] sm:text-[11px] font-extrabold hidden md:inline">{currentLangObj.code}</span>
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 text-slate-800 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 mb-1">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      {t.selectLanguage}
                    </span>
                    <button aria-label="Close language menu" onClick={() => setIsLangMenuOpen(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {LANGUAGES.map((item) => (
                      <button
                        key={item.code}
                        onClick={() => {
                          hapticFeedback.medium();
                          setLanguage(item.code);
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                          language === item.code
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{item.flag}</span>
                          <span>{item.nativeName}</span>
                        </div>
                        {language === item.code && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Support Chat Trigger */}
            <button
              onClick={() => setChatDrawerOpen(true)}
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 relative transition-all cursor-pointer shrink-0"
              title="Live Support Chat"
              aria-label="Open live support chat"
            >
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-100" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400"></span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setNotifDrawerOpen(true)}
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 relative transition-all cursor-pointer shrink-0"
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-100" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-indigo-700 animate-pulse">
                  {unreadNotifsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Comprehensive 3-Line Slide-out Menu Drawer */}
      
        {isSettingsDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-start">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
              onClick={() => {
                hapticFeedback.light();
                setSettingsDrawerOpen(false);
              }}
            />

            {/* Side Drawer Panel */}
            <div className="relative z-10 w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between border-r border-slate-200 overflow-hidden text-slate-800 animate-slide-in-right"
            >
              {/* Drawer Header */}
              <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white p-4 flex items-center justify-between shadow-md shrink-0">
                <div className="flex items-center gap-2.5">
                  <AppLogo3D size={36} animated glow={false} />
                  <div>
                    <h4 className="text-sm font-black flex items-center gap-1">
                      <span>Mail</span>
                      <span className="text-amber-300">Factory</span>
                    </h4>
                    <span className="text-[10px] text-indigo-200">
                      {language === 'bn' ? 'সকল নেভিগেশন ও অ্যাপ সেটিংস' : 'All Navigation & Settings'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    hapticFeedback.light();
                    setSettingsDrawerOpen(false);
                  }}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Overview Card */}
              <div className="p-3.5 bg-slate-900 text-white border-b border-slate-800 shrink-0 space-y-3">
                {user && profile ? (
                  <>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => closeAndExecute(() => setActiveTab('profile'))}
                        className="flex items-center gap-2.5 text-left hover:opacity-90 transition-opacity cursor-pointer min-w-0"
                      >
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 p-0.5 shrink-0 shadow-md">
                          {profile.photoURL ? (
                            <img
                              src={profile.photoURL}
                              alt={profile.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-indigo-900 text-amber-300 font-black text-sm flex items-center justify-center">
                              {(profile.username || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-xs font-black text-white truncate flex items-center gap-1">
                              <span>{profile.username || 'User'}</span>
                              {hasWithdrawn && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20 shrink-0 inline" title="Verified Payout User" />
                              )}
                            </h5>
                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                              {currentLevel?.title || 'Member'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate font-mono mt-0.5">{profile.email || user.email}</p>
                        </div>
                      </button>

                      {onOpenEditProfile && (
                        <button
                          onClick={() => closeAndExecute(onOpenEditProfile)}
                          className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold shrink-0 transition-all cursor-pointer shadow-xs"
                        >
                          {language === 'bn' ? 'এডিট' : 'Edit'}
                        </button>
                      )}
                    </div>

                    {/* Quick Balance Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                      <button
                        onClick={() => closeAndExecute(() => setActiveTab('withdraw'))}
                        className="bg-slate-800/80 hover:bg-slate-800 rounded-xl p-2 flex items-center justify-between border border-slate-700/60 transition-colors cursor-pointer"
                      >
                        <span className="text-[10px] text-slate-400 font-medium">Main:</span>
                        <span className="text-xs font-black text-emerald-400 font-mono">৳{mainBalance}</span>
                      </button>
                      <div className="bg-slate-800/80 rounded-xl p-2 flex items-center justify-between border border-slate-700/60">
                        <span className="text-[10px] text-slate-400 font-medium">Hold:</span>
                        <span className="text-xs font-black text-amber-400 font-mono">৳{holdBalance}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-200">
                        {language === 'bn' ? 'স্বাগতম গেস্ট ইউজার' : 'Welcome Guest'}
                      </h5>
                      <p className="text-[10px] text-slate-400">
                        {language === 'bn' ? 'ইনকাম শুরু করতে লগইন করুন' : 'Log in to start selling'}
                      </p>
                    </div>
                    <button
                      onClick={() => closeAndExecute(() => setAuthModalOpen(true))}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-amber-950 text-xs font-black hover:bg-amber-300 transition-all shadow-xs cursor-pointer"
                    >
                      {t.login}
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Language Switcher Bar in Drawer */}
              <div className="px-3 pt-3 pb-1 bg-slate-50 border-b border-slate-200/80">
                <div className="flex items-center justify-between bg-slate-200/80 p-1 rounded-xl">
                  <button
                    onClick={() => {
                      hapticFeedback.medium();
                      setLanguage('en');
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      language === 'en'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>🇺🇸</span>
                    <span>English</span>
                  </button>
                  <button
                    onClick={() => {
                      hapticFeedback.medium();
                      setLanguage('bn');
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      language === 'bn'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>🇧🇩</span>
                    <span>বাংলা</span>
                  </button>
                </div>
              </div>

              {/* Categorized Drawer Navigation */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-slate-50/50">
                {/* Group 1: Main Pages */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 py-0.5">
                    {language === 'bn' ? 'প্রধান নেভিগেশন' : 'Main Pages'}
                  </div>

                  {[
                    {
                      id: 'home' as ActiveTab,
                      label: language === 'bn' ? 'হোম পেজ' : 'Home Page',
                      sub: language === 'bn' ? 'মূল পাতা ও ড্যাশবোর্ড' : 'Main page & dashboard',
                      icon: <Home className="w-4 h-4" />,
                      requiresAuth: false,
                    },
                    {
                      id: 'exchange' as ActiveTab,
                      label: t.startSelling,
                      sub: language === 'bn' ? 'জিমেইল সাবমিট ও আয়ের পথ' : 'Submit Gmails & earn',
                      icon: <ArrowLeftRight className="w-4 h-4" />,
                      requiresAuth: false,
                    },
                    {
                      id: 'history' as ActiveTab,
                      label: language === 'bn' ? 'কাজের হিস্ট্রি' : 'Submission History',
                      sub: language === 'bn' ? 'জমাকৃত কাজের সকল রিপোর্ট' : 'View all submission logs',
                      icon: <History className="w-4 h-4" />,
                      requiresAuth: true,
                    },
                    {
                      id: 'sellers' as ActiveTab,
                      label: language === 'bn' ? 'টপ সেলার' : 'Top Sellers',
                      sub: language === 'bn' ? 'সেরা ১০ সেলারদের তালিকা' : 'Top 10 sellers ranking',
                      icon: <Trophy className="w-4 h-4" />,
                      requiresAuth: false,
                    },
                    {
                      id: 'profile' as ActiveTab,
                      label: language === 'bn' ? 'মাই প্রোফাইল' : 'My Profile',
                      sub: language === 'bn' ? 'মাই অ্যাকাউন্ট ও হিস্ট্রি' : 'My account & statistics',
                      icon: <User className="w-4 h-4" />,
                      requiresAuth: true,
                    },
                  ].map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (item.requiresAuth && !user) {
                            closeAndExecute(() => setAuthModalOpen(true));
                            return;
                          }
                          closeAndExecute(() => {
                            setActiveTab(item.id);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          });
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-md font-bold'
                            : 'bg-white hover:bg-indigo-50/60 border border-slate-200/80 text-slate-700 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`p-1.5 rounded-lg ${
                              isActive ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
                            }`}
                          >
                            {item.icon}
                          </div>
                          <div className="text-left">
                            <span className="text-xs font-bold block leading-tight">{item.label}</span>
                            <span
                              className={`text-[9px] block mt-0.5 ${
                                isActive ? 'text-indigo-100' : 'text-slate-400'
                              }`}
                            >
                              {item.sub}
                            </span>
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-300'}`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Group 2: Wallet & Earnings */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 py-0.5">
                    {language === 'bn' ? 'আয় ও ওয়ালেট' : 'Earnings & Wallet'}
                  </div>

                  {[
                    {
                      id: 'withdraw' as ActiveTab,
                      label: t.withdraw,
                      sub: language === 'bn' ? 'বিকাশ, নগদ, রকেট ও বাইন্যান্স' : 'bKash, Nagad, USDT',
                      icon: <Wallet className="w-4 h-4" />,
                      requiresAuth: true,
                    },
                    {
                      id: 'referral_leaderboard' as ActiveTab,
                      label: language === 'bn' ? 'রেফারেল বোনাস প্রোগ্রাম' : 'Referral Program',
                      sub: language === 'bn' ? 'বন্ধু রেফার করে বাড়তি ইনকাম' : 'Invite friends & earn extra',
                      icon: <Gift className="w-4 h-4" />,
                      requiresAuth: false,
                    },
                    {
                      id: 'reviews' as ActiveTab,
                      label: language === 'bn' ? 'কাস্টমার রিভিউ' : 'Customer Reviews',
                      sub: language === 'bn' ? 'অন্যান্য সেলারদের মতামত' : 'See user feedback',
                      icon: <Star className="w-4 h-4" />,
                      requiresAuth: false,
                    },
                  ].map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (item.requiresAuth && !user) {
                            closeAndExecute(() => setAuthModalOpen(true));
                            return;
                          }
                          closeAndExecute(() => {
                            setActiveTab(item.id);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          });
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-md font-bold'
                            : 'bg-white hover:bg-indigo-50/60 border border-slate-200/80 text-slate-700 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`p-1.5 rounded-lg ${
                              isActive ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
                            }`}
                          >
                            {item.icon}
                          </div>
                          <div className="text-left">
                            <span className="text-xs font-bold block leading-tight">{item.label}</span>
                            <span
                              className={`text-[9px] block mt-0.5 ${
                                isActive ? 'text-indigo-100' : 'text-slate-400'
                              }`}
                            >
                              {item.sub}
                            </span>
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-300'}`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Group 3: Help & Preferences */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 py-0.5">
                    {language === 'bn' ? 'অ্যাপ সেটিংস ও সাহায্য' : 'Settings & Support'}
                  </div>

                  {user && onOpenChangePass && (
                    <button
                      onClick={() => closeAndExecute(onOpenChangePass)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-indigo-50/60 border border-slate-200/80 text-slate-700 font-medium transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                          <KeyRound className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </button>
                  )}

                  {onOpenFAQ && (
                    <button
                      onClick={() => closeAndExecute(onOpenFAQ)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-indigo-50/60 border border-slate-200/80 text-slate-700 font-medium transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                          <HelpCircle className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {t.faq}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </button>
                  )}

                  {onOpenContact && (
                    <button
                      onClick={() => closeAndExecute(onOpenContact)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-indigo-50/60 border border-slate-200/80 text-slate-700 font-medium transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                          <PhoneCall className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {language === 'bn' ? 'সাপোর্ট কন্টাক্ট' : 'Contact Support'}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </button>
                  )}

                  <button
                    onClick={() => closeAndExecute(() => setChatDrawerOpen(true))}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-indigo-50/60 border border-slate-200/80 text-slate-700 font-medium transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        {language === 'bn' ? 'লাইভ চ্যাট সাপোর্ট' : 'Live Chat Support'}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </button>

                  <button
                    onClick={() => closeAndExecute(() => setNotifDrawerOpen(true))}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-indigo-50/60 border border-slate-200/80 text-slate-700 font-medium transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                        <Bell className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        {language === 'bn' ? 'নোটিফিকেশন সেন্টার' : 'Notifications'}
                      </span>
                    </div>
                    {unreadNotifsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black">
                        {unreadNotifsCount}
                      </span>
                    )}
                  </button>

                  {isInstallable && (
                    <button
                      onClick={() => closeAndExecute(promptInstall)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200 text-indigo-950 font-bold transition-all cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <AppLogo3D size={32} glow={false} />
                        <div className="text-left">
                          <span className="text-xs font-black block text-indigo-950">Mail Factory App</span>
                          <span className="text-[10px] text-indigo-600 font-semibold block">
                            {language === 'bn' ? 'হোমস্ক্রিনে ইনস্টল করুন' : 'Install to Home Screen'}
                          </span>
                        </div>
                      </div>
                      <div className="p-1 rounded-lg bg-indigo-600 text-white">
                        <Download className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  )}

                  <button
                    onClick={() => closeAndExecute(() => setActiveTab('privacy'))}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-700 font-medium transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                        <Lock className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        {language === 'bn' ? 'প্রাইভেসি পলিসি' : 'Privacy Policy'}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </button>

                  <button
                    onClick={() => closeAndExecute(() => setActiveTab('about'))}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-700 font-medium transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                        <Info className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        {language === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </button>
                </div>

                {/* Group 4: Account Actions & Logout */}
                {user && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-rose-200 text-rose-800">
                          <LogOut className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold">
                          {language === 'bn' ? 'লগআউট করুন' : 'Log Out'}
                        </span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-3 bg-slate-100 border-t border-slate-200 text-center text-[10px] font-bold text-slate-500 shrink-0">
                <span>Mail Factory • v2.4.0 • All Rights Reserved</span>
              </div>
            </div>
          </div>
        )}
      
    </>
  );
};
