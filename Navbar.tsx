import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../lib/i18n';
import { Bell, MessageSquare, Wallet, Globe, Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { hapticFeedback } from '../lib/haptics';

export const Navbar: React.FC = () => {
  const {
    appLogo,
    language,
    setLanguage,
    setActiveTab,
    unreadNotifsCount,
    setNotifDrawerOpen,
    setChatDrawerOpen,
    setAuthModalOpen,
    setWithdrawModalOpen,
    user,
    profile,
  } = useApp();

  const t = translations[language];
  const { isInstallable, promptInstall } = usePWAInstall();

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white shadow-lg backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand & Logo */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
        >
          <img 
            src={appLogo} 
            alt="Mail Factory" 
            className="w-10 h-10 rounded-xl shadow-sm border border-white/20 object-cover" 
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1 leading-none">
              <span className="text-xl font-extrabold tracking-tight text-white">Mail</span>
              <span className="text-xl font-black text-amber-300">Factory</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-semibold tracking-wider text-indigo-200 uppercase">
                {t.slogan}
              </span>
              <div className="hidden sm:flex items-center gap-1 bg-black/20 px-1.5 py-0.5 rounded-full border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[8px] font-mono text-emerald-300">SERVER ONLINE (45ms)</span>
              </div>
            </div>
          </div>
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Install App Button (PWA) */}
          {isInstallable && (
            <button
              onClick={() => {
                hapticFeedback.medium();
                promptInstall();
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-amber-900 text-xs font-black shadow-sm transition-all"
              title="Install Mail Factory App"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}

          {/* Quick Balance Pill */}
          {user && profile ? (
            <button
              onClick={() => setWithdrawModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-bold text-white transition-all shadow-inner"
              title="Click to withdraw"
            >
              <Wallet className="w-3.5 h-3.5 text-amber-300" />
              <span>৳{(Number(profile.balance) || 0).toFixed(2)}</span>
            </button>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-3 py-1.5 rounded-full bg-white text-indigo-700 text-xs font-bold shadow hover:bg-indigo-50 active:scale-95 transition-all"
            >
              {t.login}
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold flex items-center gap-1 transition-all"
            title="Toggle language (বাংলা / English)"
          >
            <Globe className="w-4 h-4 text-indigo-200" />
            <span className="uppercase text-[11px]">{language === 'bn' ? 'EN' : 'বাং'}</span>
          </button>

          {/* Support Chat Trigger */}
          <button
            onClick={() => setChatDrawerOpen(true)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 relative transition-all"
            title="Live Support Chat"
          >
            <MessageSquare className="w-4 h-4 text-indigo-100" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400"></span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => setNotifDrawerOpen(true)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 relative transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-indigo-100" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-indigo-700 animate-pulse">
                {unreadNotifsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
