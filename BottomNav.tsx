import React from 'react';
import { useApp } from './AppContext';
import { translations } from './i18n';
import { Home, History, Trophy, User, ArrowLeftRight, ShoppingBag, Wallet, PlusCircle, PackageCheck } from 'lucide-react';
import { ActiveTab } from './types';
import { hapticFeedback } from './haptics';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, language, user, setAuthModalOpen, appMode } = useApp();
  const t = translations[language];

  const handleTabClick = (tab: ActiveTab) => {
    hapticFeedback.light();
    if ((tab === 'profile' || tab === 'history' || tab === 'buyer_orders' || tab === 'buyer_wallet' || tab === 'buyer_deposit') && !user) {
      setAuthModalOpen(true);
      return;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode }> = appMode === 'buying' ? [
    { id: 'buyer_market', label: language === 'bn' ? 'মার্কেট' : 'Market', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'buyer_orders', label: language === 'bn' ? 'অর্ডারস' : 'Orders', icon: <PackageCheck className="w-5 h-5" /> },
    { id: 'buyer_wallet', label: language === 'bn' ? 'ওয়ালেট' : 'Wallet', icon: <Wallet className="w-5 h-5" /> },
    { id: 'buyer_deposit', label: language === 'bn' ? 'ডিপোজিট' : 'Deposit', icon: <PlusCircle className="w-5 h-5" /> },
    { id: 'profile', label: language === 'bn' ? 'প্রোফাইল' : 'Profile', icon: <User className="w-5 h-5" /> },
  ] : [
    { id: 'home', label: t.home, icon: <Home className="w-5 h-5" /> },
    { id: 'exchange', label: t.startSelling, icon: <ArrowLeftRight className="w-5 h-5" /> },
    { id: 'history', label: t.history, icon: <History className="w-5 h-5" /> },
    { id: 'sellers', label: t.sellers, icon: <Trophy className="w-5 h-5" /> },
    { id: 'profile', label: t.profile, icon: <User className="w-5 h-5" /> },
  ];

  const activeColorClass = appMode === 'buying'
    ? 'text-emerald-600 bg-emerald-50 border-emerald-200/80 shadow-sm shadow-emerald-500/10'
    : 'text-indigo-600 bg-indigo-50 border-indigo-200/80 shadow-sm shadow-indigo-500/10';

  const barColorClass = appMode === 'buying'
    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-emerald-400/40'
    : 'bg-gradient-to-r from-indigo-600 to-purple-500 shadow-indigo-400/40';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] py-1.5 px-2">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? `${activeColorClass} font-bold scale-102 border`
                  : 'text-slate-500 hover:text-slate-800 font-medium hover:bg-slate-50'
              }`}
            >
              {isActive && (
                <span className={`absolute -top-1.5 w-7 h-1 rounded-full shadow-sm animate-fade-in ${barColorClass}`} />
              )}
              <div className={`transition-transform duration-200 ${isActive ? '-translate-y-0.5 scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[65px] ${
                isActive ? (appMode === 'buying' ? 'text-emerald-700 font-extrabold' : 'text-indigo-700 font-extrabold') : ''
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

