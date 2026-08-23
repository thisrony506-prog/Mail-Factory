import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from './AppContext';
import { translations, LANGUAGES } from './i18n';
import { auth, signOut } from './firebase';
import { usePWAInstall } from './usePWAInstall';
import { hapticFeedback } from './haptics';
import {
  X,
  Settings,
  User,
  Key,
  Bell,
  Globe,
  MessageSquare,
  HelpCircle,
  Mail,
  Award,
  Shield,
  Star,
  Download,
  FileText,
  Info,
  LogOut,
  ChevronRight,
  Check,
  Trash2,
  Lock,
  UserCheck,
  Wallet,
  History,
  Gift,
  Trophy,
  Menu,
  SlidersHorizontal,
  QrCode,
} from 'lucide-react';

interface SettingsDrawerProps {
  onOpenEditProfile: () => void;
  onOpenChangePass: () => void;
  onOpenFAQ: () => void;
  onOpenContact: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  onOpenEditProfile,
  onOpenChangePass,
  onOpenFAQ,
  onOpenContact,
}) => {
  const {
    isSettingsDrawerOpen,
    setSettingsDrawerOpen,
    profile,
    user,
    language,
    setLanguage,
    currentLevel,
    setActiveTab,
    setChatDrawerOpen,
    setNotifDrawerOpen,
    mainBalance,
    holdBalance,
  } = useApp();

  const t = translations[language];
  const { isInstallable, promptInstall } = usePWAInstall();
  const isAdmin = user && user.email && ['gmrony135@gmail.com', 'mailfactorybd@gmail.com', 'iamronyofficial1@gmail.com'].includes(user.email);

  const handleLogout = async () => {
    if (window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত যে লগআউট করতে চান?' : 'Are you sure you want to log out?')) {
      setSettingsDrawerOpen(false);
      await signOut(auth);
      setActiveTab('home');
    }
  };

  const closeAndExecute = (action: () => void) => {
    hapticFeedback.light();
    setSettingsDrawerOpen(false);
    action();
  };

  return (
    <AnimatePresence>
      {isSettingsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => {
              hapticFeedback.light();
              setSettingsDrawerOpen(false);
            }}
          />

          {/* Slide-out Menu Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative z-10 w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white p-4 flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Menu className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-sm font-black flex items-center gap-1.5">
                    <span>{language === 'bn' ? 'মেইন মেনু' : 'Main Menu'}</span>
                  </h4>
                  <span className="text-[10px] text-indigo-200">
                    {language === 'bn' ? 'অ্যাকাউন্ট ও সকল সার্ভিস নেভিগেশন' : 'Navigation & quick settings'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  hapticFeedback.light();
                  setSettingsDrawerOpen(false);
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Card Mini Overview */}
            {profile && (
              <div className="p-3.5 bg-slate-900 text-white border-b border-slate-800 space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => closeAndExecute(() => setActiveTab('profile'))}
                    className="flex items-center gap-3 text-left hover:opacity-90 transition-opacity cursor-pointer min-w-0"
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
                        <h5 className="text-xs font-black text-white truncate">{profile.username || 'User'}</h5>
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          {currentLevel.title}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate font-mono mt-0.5">{profile.email || user?.email}</p>
                    </div>
                  </button>

                  <button
                    onClick={() => closeAndExecute(onOpenEditProfile)}
                    className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold shrink-0 transition-all cursor-pointer shadow-xs"
                  >
                    {language === 'bn' ? 'এডিট' : 'Edit'}
                  </button>
                </div>

                {/* Wallet quick balance bar */}
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
              </div>
            )}

        {/* Settings List Options */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-slate-50/60 divide-y divide-slate-100">
          
          {/* SECTION 1: ACCOUNT & SECURITY */}
          <div className="space-y-1">
            <div className="px-2 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-indigo-500" />
              <span>{language === 'bn' ? 'অ্যাকাউন্ট ও নিরাপত্তা' : 'Account & Security'}</span>
            </div>

            <button
              onClick={() => closeAndExecute(() => setActiveTab('id_card'))}
              className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100/80 hover:to-purple-100/80 border border-indigo-200/80 rounded-2xl transition-all cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <QrCode className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <h5 className="text-xs font-black text-indigo-950">{t.memberIdCard}</h5>
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[9px] font-black">
                      Badge
                    </span>
                  </div>
                  <span className="text-[10px] text-indigo-700 font-medium">Digital ID & QR Verification</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-indigo-500" />
            </button>

            <button
              onClick={() => closeAndExecute(onOpenEditProfile)}
              className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h5 className="text-xs font-extrabold text-slate-800">{t.editProfile}</h5>
                  <span className="text-[10px] text-slate-400 font-medium">Name, photo, phone & wallet</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => closeAndExecute(onOpenChangePass)}
              className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h5 className="text-xs font-extrabold text-slate-800">{t.changePassword}</h5>
                  <span className="text-[10px] text-slate-400 font-medium">Update account password</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => closeAndExecute(() => setNotifDrawerOpen(true))}
              className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h5 className="text-xs font-extrabold text-slate-800">{t.notifications}</h5>
                  <span className="text-[10px] text-slate-400 font-medium">Push & audit alerts</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Language Selection inside Settings */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-extrabold text-slate-800">{t.languageTitle}</h5>
                  <span className="text-[10px] text-slate-400 font-medium">Choose preferred language</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {LANGUAGES.map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      hapticFeedback.medium();
                      setLanguage(item.code);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      language === item.code
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{item.flag}</span>
                      <span className="text-[11px]">{item.nativeName}</span>
                    </div>
                    {language === item.code && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: WALLET, PAYOUTS & REFERRALS */}
          <div className="pt-3 space-y-1">
            <div className="px-2 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Wallet className="w-3 h-3 text-indigo-500" />
              <span>{language === 'bn' ? 'অর্থ ও লেনদেন অপশন' : 'Earnings & Payouts'}</span>
            </div>

            <button
              onClick={() => closeAndExecute(() => setActiveTab('withdraw'))}
              className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h5 className="text-xs font-extrabold text-slate-800">{t.withdraw}</h5>
                  <span className="text-[10px] text-slate-400 font-medium">Request payout to bKash / Nagad</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => closeAndExecute(() => setActiveTab('history'))}
              className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h5 className="text-xs font-extrabold text-slate-800">
                    {language === 'bn' ? 'পে-আউট ও ট্রানজেকশন হিস্ট্রি' : 'Payout History'}
                  </h5>
                  <span className="text-[10px] text-slate-400 font-medium">View past withdrawals & work audit</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => closeAndExecute(() => setActiveTab('profile'))}
              className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Gift className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h5 className="text-xs font-extrabold text-slate-800">
                    {language === 'bn' ? 'রেফারেল হাব ও ইনভাইট বোনাস' : 'Referral Hub & Invites'}
                  </h5>
                  <span className="text-[10px] text-slate-400 font-medium">Invite friends & earn commission</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => closeAndExecute(() => setActiveTab('sellers'))}
              className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h5 className="text-xs font-extrabold text-slate-800">
                    {language === 'bn' ? 'টপ ১০ সেলার লিডারবোর্ড' : 'Top Sellers Leaderboard'}
                  </h5>
                  <span className="text-[10px] text-slate-400 font-medium">Top earning sellers ranking</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* SECTION 2: HELP & SUPPORT */}
          <div className="pt-3 space-y-1">
            <div className="px-2 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-indigo-500" />
              <span>{language === 'bn' ? 'সাহায্য ও সাপোর্ট' : 'Support & Assistance'}</span>
            </div>

            <button
              onClick={() => closeAndExecute(() => setChatDrawerOpen(true))}
              className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h5 className="text-xs font-extrabold text-slate-800">{t.liveChat}</h5>
                  <span className="text-[10px] text-slate-400 font-medium">Chat with admin team</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => closeAndExecute(onOpenFAQ)}
              className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h5 className="text-xs font-extrabold text-slate-800">{t.faq}</h5>
                  <span className="text-[10px] text-slate-400 font-medium">Frequently asked questions</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => closeAndExecute(onOpenContact)}
              className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h5 className="text-xs font-extrabold text-slate-800">{t.contactUs}</h5>
                  <span className="text-[10px] text-slate-400 font-medium">Telegram, WhatsApp & Email</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* SECTION 4: APP INFORMATION & POLICIES */}
          <div className="pt-3 space-y-1">
            <div className="px-2 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Info className="w-3 h-3 text-indigo-500" />
              <span>{language === 'bn' ? 'তথ্য ও পলিসি' : 'App Info & Legal'}</span>
            </div>

            <button
              onClick={() => closeAndExecute(() => setActiveTab('reviews'))}
              className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                </div>
                <div className="text-left">
                  <h5 className="text-xs font-extrabold text-slate-800">
                    {language === 'bn' ? 'কাস্টমার রিভিউ' : 'User Reviews'}
                  </h5>
                  <span className="text-[10px] text-slate-400 font-medium">Read ratings and feedback</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => closeAndExecute(() => setActiveTab('privacy'))}
              className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h5 className="text-xs font-extrabold text-slate-800">{t.privacyPolicy}</h5>
                  <span className="text-[10px] text-slate-400 font-medium">Data protection terms</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => closeAndExecute(() => setActiveTab('about'))}
              className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Info className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h5 className="text-xs font-extrabold text-slate-800">{t.aboutUs}</h5>
                  <span className="text-[10px] text-slate-400 font-medium">Mail Factory v3.2.0</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {isInstallable && (
              <button
                onClick={() => closeAndExecute(() => promptInstall())}
                className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 rounded-2xl font-black text-xs shadow-sm transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-4 h-4" />
                  <span>{language === 'bn' ? 'অফিসিয়াল অ্যাপ ইনস্টল করুন' : 'Install Official App'}</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-extrabold flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logout}</span>
          </button>

          <button
            onClick={() => {
              alert(
                language === 'bn'
                  ? 'অ্যাকাউন্ট ডিলিট করতে লাইভ চ্যাটে অ্যাডমিনের সাথে যোগাযোগ করুন।'
                  : 'Please contact admin via Live Chat to delete your account.'
              );
            }}
            className="w-full py-1 text-slate-400 text-[10px] font-bold flex items-center justify-center gap-1 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>{language === 'bn' ? 'অ্যাকাউন্ট ডিলিট অনুরোধ' : 'Request Account Deletion'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
);
};
