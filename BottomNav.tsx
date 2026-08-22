import React from 'react';
import { useApp } from './AppContext';
import { translations } from './i18n';
import { Home, History, Trophy, User, ArrowLeftRight } from 'lucide-react';
import { ActiveTab } from './types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, language, user, setAuthModalOpen } = useApp();
  const t = translations[language];

  const handleTabClick = (tab: ActiveTab) => {
    if ((tab === 'profile' || tab === 'history') && !user) {
      setAuthModalOpen(true);
      return;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: t.home, icon: <Home className="w-5 h-5" /> },
    { id: 'exchange', label: t.startSelling, icon: <ArrowLeftRight className="w-5 h-5" /> },
    { id: 'history', label: t.history, icon: <History className="w-5 h-5" /> },
    { id: 'sellers', label: t.sellers, icon: <Trophy className="w-5 h-5" /> },
    { id: 'profile', label: t.profile, icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-2xl py-1.5 px-2">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-indigo-600 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              {isActive && (
                <span className="absolute -top-1.5 w-6 h-1 bg-indigo-600 rounded-full shadow-sm shadow-indigo-300 animate-fade-in" />
              )}
              <div className={`transition-transform duration-200 ${isActive ? '-translate-y-0.5' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[65px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

