import React from 'react';
import { useApp } from './AppContext';
import { translations, LANGUAGES } from './i18n';
import { auth, signOut } from './firebase';
import { SEO } from './SEO';
import { hapticFeedback } from './haptics';
import { usePWAInstall } from './usePWAInstall';
import { AppLogo3D } from './AppLogo3D';
import {
  Settings,
  User,
  Key,
  Bell,
  Globe,
  Shield,
  HelpCircle,
  Mail,
  FileText,
  Info,
  Award,
  ChevronRight,
  LogOut,
  Star,
  Download,
  Check,
  Wallet,
  History,
  Gift,
  Trophy,
  ArrowLeft,
  Lock,
} from 'lucide-react';

interface SettingsViewProps {
  onOpenEditProfile: () => void;
  onOpenChangePass: () => void;
  onOpenFAQ: () => void;
  onOpenContact: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenEditProfile,
  onOpenChangePass,
  onOpenFAQ,
  onOpenContact,
}) => {
  const {
    user,
    profile,
    appLogo,
    language,
    setLanguage,
    setActiveTab,
    setChatDrawerOpen,
    setNotifDrawerOpen,
    currentLevel,
    addNotification,
  } = useApp();
  
  const t = translations[language];
  const { isInstallable, promptInstall } = usePWAInstall();
  const isAdmin = user && user.email && ['gmrony135@gmail.com', 'mailfactorybd@gmail.com', 'iamronyofficial1@gmail.com'].includes(user.email);

  const handleLogout = async () => {
    try {
      hapticFeedback.heavy();
      await signOut(auth);
      addNotification('Signed Out', 'You have been logged out successfully.', 'info');
      setActiveTab('home');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const mainBalance = (profile?.balance || 0).toFixed(2);
  const holdBalance = (profile?.hold || 0).toFixed(2);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-28 space-y-4">
      <SEO
        title="Settings - Account & App Options | Mail Factory"
        description="Manage profile, security, notifications, language, support and account settings."
      />

      {/* Top Banner & Header */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-5 shadow-lg border border-indigo-700/50 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                hapticFeedback.light();
                setActiveTab('profile');
              }}
              className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              title="Go back to profile"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-300 animate-spin-slow" />
                <h1 className="text-lg font-black tracking-tight text-white">
                  {language === 'bn' ? 'অ্যাকাউন্ট সেটিংস' : 'Account Settings'}
                </h1>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5 font-medium">
                {language === 'bn'
                  ? 'প্রোফাইল, সিকিউরিটি, ভাষা ও সাপোর্ট পরিচালনা করুন'
                  : 'Manage profile, security, language & support'}
              </p>
            </div>
          </div>

          <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-mono font-extrabold text-amber-300">
            v3.2.0
          </div>
        </div>
      </div>

      {/* User Mini Profile Overview */}
      {profile && (
        <div className="rounded-3xl bg-slate-900 text-white p-4 shadow-md border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-0.5 shrink-0 shadow-md">
                {profile.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={profile.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-indigo-950 text-amber-300 font-black text-base flex items-center justify-center">
                    {(profile.username || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black text-white truncate">{profile.username || 'User'}</h2>
                  <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {currentLevel.title}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate font-mono mt-0.5">{profile.email || user?.email}</p>
              </div>
            </div>

            <button
              onClick={() => {
                hapticFeedback.light();
                onOpenEditProfile();
              }}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 transition-all active:scale-95 cursor-pointer shadow-md"
            >
              {language === 'bn' ? 'এডিট প্রোফাইল' : 'Edit Profile'}
            </button>
          </div>

          {/* Quick Wallet balance summary */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
            <div className="bg-slate-800/80 rounded-2xl p-2.5 flex items-center justify-between border border-slate-700/60">
              <span className="text-xs text-slate-400 font-medium">Main Balance:</span>
              <span className="text-sm font-black text-emerald-400 font-mono">৳{mainBalance}</span>
            </div>
            <div className="bg-slate-800/80 rounded-2xl p-2.5 flex items-center justify-between border border-slate-700/60">
              <span className="text-xs text-slate-400 font-medium">Hold Balance:</span>
              <span className="text-sm font-black text-amber-400 font-mono">৳{holdBalance}</span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: ACCOUNT & SECURITY */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-4 shadow-sm space-y-3">
        <div className="px-1 text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-indigo-600" />
          <span>{language === 'bn' ? 'অ্যাকাউন্ট ও নিরাপত্তা' : 'Account & Security'}</span>
        </div>

        <div className="divide-y divide-slate-100">
          <button
            onClick={() => {
              hapticFeedback.light();
              onOpenEditProfile();
            }}
            className="w-full flex items-center justify-between py-3 px-2 text-left hover:bg-slate-50 rounded-2xl transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-800">{t.editProfile}</h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  {language === 'bn' ? 'নাম, ছবি, ফোন ও পেমেন্ট নম্বর আপডেট করুন' : 'Update name, photo, phone & wallet number'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => {
              hapticFeedback.light();
              onOpenChangePass();
            }}
            className="w-full flex items-center justify-between py-3 px-2 text-left hover:bg-slate-50 rounded-2xl transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-800">{t.changePassword}</h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  {language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন করে সুরক্ষিত থাকুন' : 'Secure your account credentials'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => {
              hapticFeedback.light();
              setNotifDrawerOpen(true);
            }}
            className="w-full flex items-center justify-between py-3 px-2 text-left hover:bg-slate-50 rounded-2xl transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-800">{t.notifications}</h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  {language === 'bn' ? 'পুশ অ্যালার্ট ও কাজের আপডেট নোটিফিকেশন' : 'Push and audit status alerts'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Language Selection Bar */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 mt-2 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-800">{t.languageTitle}</h4>
              <p className="text-[10px] text-slate-400 font-medium">
                {language === 'bn' ? 'আপনার পছন্দের ভাষা নির্বাচন করুন' : 'Select your preferred app language'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
            {LANGUAGES.map((item) => (
              <button
                key={item.code}
                onClick={() => {
                  hapticFeedback.medium();
                  setLanguage(item.code);
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  language === item.code
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{item.flag}</span>
                  <span className="text-[11px]">{item.nativeName}</span>
                </div>
                {language === item.code && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: WALLET, PAYOUTS & REFERRALS */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-4 shadow-sm space-y-2">
        <div className="px-1 pb-1 text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5 text-emerald-600" />
          <span>{language === 'bn' ? 'অর্থ ও পেমেন্ট অপশন' : 'Earnings & Payouts'}</span>
        </div>

        <div className="divide-y divide-slate-100">
          <button
            onClick={() => {
              hapticFeedback.light();
              setActiveTab('withdraw');
            }}
            className="w-full flex items-center justify-between py-3 px-2 text-left hover:bg-slate-50 rounded-2xl transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-800">{t.withdraw}</h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  {language === 'bn' ? 'বিকাশ, নগদ বা রকেটে টাকা ক্যাশআউট করুন' : 'Request payout to bKash, Nagad or Rocket'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => {
              hapticFeedback.light();
              setActiveTab('history');
            }}
            className="w-full flex items-center justify-between py-3 px-2 text-left hover:bg-slate-50 rounded-2xl transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-800">
                  {language === 'bn' ? 'পে-আউট ও ট্রানজেকশন হিস্ট্রি' : 'Payout & Transaction Reports'}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  {language === 'bn' ? 'পূর্বের সকল উত্তোলন ও কাজের রেকর্ড দেখুন' : 'View past withdrawals & work audit history'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => {
              hapticFeedback.light();
              setActiveTab('profile');
            }}
            className="w-full flex items-center justify-between py-3 px-2 text-left hover:bg-slate-50 rounded-2xl transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-800">
                  {language === 'bn' ? 'রেফারেল হাব ও ইনভাইট লিংক' : 'Referral Hub & Invites'}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  {language === 'bn' ? 'বন্ধুদের ইনভাইট করে ১০% লাইফটাইম কমিশন অর্জন করুন' : 'Invite friends & earn lifetime commission'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => {
              hapticFeedback.light();
              setActiveTab('sellers');
            }}
            className="w-full flex items-center justify-between py-3 px-2 text-left hover:bg-slate-50 rounded-2xl transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-800">
                  {language === 'bn' ? 'টপ ১০ সেলার লিডারবোর্ড' : 'Top Sellers Leaderboard'}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  {language === 'bn' ? 'সেরা সেলারদের তালিকা ও র‍্যাংকিং দেখুন' : 'View top performing sellers ranking'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

        </div>
      </div>

      {/* SECTION 3: SUPPORT & HELP */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-4 shadow-sm space-y-2">
        <div className="px-1 pb-1 text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t.support} & Help</span>
        </div>

        <div className="divide-y divide-slate-100">
          <button
            onClick={() => {
              hapticFeedback.light();
              setChatDrawerOpen(true);
            }}
            className="w-full flex items-center justify-between py-3 px-2 text-left hover:bg-slate-50 rounded-2xl transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-800">{t.liveChat}</h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  {language === 'bn' ? 'অ্যাডমিন টিমের সাথে সরাসরি লাইভ চ্যাট' : 'Chat directly with admin support team'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => {
              hapticFeedback.light();
              onOpenFAQ();
            }}
            className="w-full flex items-center justify-between py-3 px-2 text-left hover:bg-slate-50 rounded-2xl transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-800">{t.faq}</h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  {language === 'bn' ? 'সাধারণ প্রশ্নাবলী ও সমস্যা সমাধান' : 'Frequently asked questions'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => {
              hapticFeedback.light();
              onOpenContact();
            }}
            className="w-full flex items-center justify-between py-3 px-2 text-left hover:bg-slate-50 rounded-2xl transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-800">{t.contactUs}</h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  {language === 'bn' ? 'টেলিগ্রাম, হোয়াটসঅ্যাপ ও অফিশিয়াল মেইল' : 'Telegram, WhatsApp & Official Email'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* SECTION 4: INFORMATION & COMMUNITY */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-4 shadow-sm space-y-2">
        <div className="px-1 pb-1 text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span>{t.info} & Community</span>
        </div>

        <div className="divide-y divide-slate-100">
          <button
            onClick={() => {
              hapticFeedback.light();
              setActiveTab('reviews');
            }}
            className="w-full flex items-center justify-between py-3 px-2 text-left hover:bg-slate-50 rounded-2xl transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-800">
                  {language === 'bn' ? 'কাস্টমার রিভিউ ও রেটিং' : 'User Reviews & Ratings'}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  {language === 'bn' ? 'রিভিউ দেখুন অথবা আপনার মতামত দিন' : 'Read community reviews or submit yours'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => {
              hapticFeedback.light();
              setActiveTab('privacy');
            }}
            className="w-full flex items-center justify-between py-3 px-2 text-left hover:bg-slate-50 rounded-2xl transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-800">{t.privacyPolicy}</h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  {language === 'bn' ? 'ডাটা প্রোটেকশন ও সিকিউরিটি শর্তাবলী' : 'Data protection & security terms'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => {
              hapticFeedback.light();
              setActiveTab('about');
            }}
            className="w-full flex items-center justify-between py-3 px-2 text-left hover:bg-slate-50 rounded-2xl transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-800">{t.aboutUs}</h3>
                <p className="text-[10px] text-slate-400 font-medium">Mail Factory Version 3.2.0</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {isInstallable && (
            <button
              onClick={() => {
                hapticFeedback.medium();
                promptInstall();
              }}
              className="w-full flex items-center justify-between p-3 text-left bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 rounded-2xl transition-all cursor-pointer border border-indigo-200 shadow-xs mt-1"
            >
              <div className="flex items-center gap-3">
                <AppLogo3D size={40} glow animated className="shrink-0" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-black text-indigo-950">Mail Factory App</h3>
                  </div>
                  <p className="text-[10px] text-indigo-700 font-semibold">
                    {language === 'bn' ? 'হোমস্ক্রিনে যোগ করুন • এক ক্লিকে ওপেন' : 'Install to Home Screen for instant access'}
                  </p>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                <Download className="w-4 h-4" />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* SECTION: ACCOUNT ACTIONS (LOGOUT) */}
      <div className="pt-2">
        <button
          onClick={handleLogout}
          className="w-full py-3.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
        >
          <LogOut className="w-4 h-4 text-rose-600" />
          <span>{t.logout}</span>
        </button>
      </div>
    </div>
  );
};
