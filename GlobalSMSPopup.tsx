import React, { useEffect, useState } from 'react';
import { useApp } from './AppContext';
import { translations } from './i18n';
import { X, Bell, AlertTriangle } from 'lucide-react';
import { ref, onValue, set } from 'firebase/database';
import { db } from './firebase';

interface GlobalAnnounce {
  title?: string;
  message: string;
  timer: number;
  updatedAt: number;
  active?: boolean;
}

export const GlobalSMSPopup: React.FC = () => {
  const { user, language } = useApp();
  const t = translations[language];

  const [activeAnnounce, setActiveAnnounce] = useState<GlobalAnnounce | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);

  const [customData, setCustomData] = useState<GlobalAnnounce | null>(null);
  const [globalData, setGlobalData] = useState<GlobalAnnounce | null>(null);

  // 1. Fetch both Custom & Global popups
  useEffect(() => {
    if (!user) return;
    
    const unsubCustom = onValue(ref(db, `users/${user.uid}/custom_popup`), (snap) => {
      setCustomData(snap.exists() ? snap.val() as GlobalAnnounce : null);
    });
    
    const unsubGlobal = onValue(ref(db, `settings/global_popup`), (snap) => {
      setGlobalData(snap.exists() ? snap.val() as GlobalAnnounce : null);
    });
    
    return () => {
      unsubCustom();
      unsubGlobal();
    };
  }, [user]);

  // 2. Filter & Priority Logic
  useEffect(() => {
    if (!user) return;
    
    // Check Custom popup first, then fallback to Global
    let targetData: GlobalAnnounce | null = null;
    
    if (customData && customData.active) {
      targetData = customData;
    } else if (globalData && globalData.active) {
      targetData = globalData;
    }
    
    if (targetData) {
      const lastSeen = localStorage.getItem(`last_seen_popup_${user.uid}`);
      
      if (String(targetData.updatedAt) !== lastSeen) {
        setActiveAnnounce(targetData);
        setTimeLeft(targetData.timer || 0);
        setIsOpen(true);
        
        // 3. View Tracking - as requested by admin logic
        set(ref(db, `settings/global_popup_views/${user.uid}`), true);
      }
    }
  }, [user, customData, globalData]);

  // 4. Timer Logic
  useEffect(() => {
    if (isOpen && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, timeLeft]);

  if (!isOpen || !activeAnnounce) return null;

  const handleClose = () => {
    if (timeLeft > 0) return; // Prevent closing if timer isn't zero
    
    if (user && activeAnnounce) {
      // Save last seen updated time in local storage
      localStorage.setItem(`last_seen_popup_${user.uid}`, String(activeAnnounce.updatedAt));
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in relative flex flex-col max-h-[90vh]">
        
        {/* Only show close button if timer has finished */}
        {timeLeft === 0 && (
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition-all z-10"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 p-4 pt-6 text-white flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-amber-300" />
          </div>
          <div className="flex-1 pr-6">
            <h3 className="font-black text-sm">
              {activeAnnounce.title || (language === 'bn' ? 'অ্যাডমিন মেসেজ' : 'Admin Message')}
            </h3>
            <span className="text-[10px] text-indigo-200">
              {language === 'bn' ? 'জরুরী বিজ্ঞপ্তি' : 'Important Notice'}
            </span>
          </div>
        </div>
        
        <div className="p-5 flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 min-h-[50px] mb-6">
            {/* Render Custom HTML safely */}
            {/(<html|<body|<style|<iframe|<\!DOCTYPE)/i.test(activeAnnounce.message) ? (
              <iframe 
                srcDoc={activeAnnounce.message} 
                title="Popup Content" 
                style={{ width: '100%', height: '350px', border: 'none' }} 
                sandbox="allow-same-origin allow-scripts"
              />
            ) : (
              <div 
                className="text-sm font-medium text-slate-700 leading-relaxed text-left break-words"
                dangerouslySetInnerHTML={{ __html: activeAnnounce.message }}
              />
            )}
          </div>
          
          <button
            onClick={handleClose}
            disabled={timeLeft > 0}
            className={`w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 shrink-0 ${
              timeLeft > 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
            }`}
          >
            {timeLeft > 0 ? (
              <>
                <AlertTriangle className="w-4 h-4" />
                {language === 'bn' ? `অপেক্ষা করুন (${timeLeft}s)` : `Wait (${timeLeft}s)`}
              </>
            ) : (
              <>
                {language === 'bn' ? 'ঠিক আছে' : 'OK'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
