import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../lib/i18n';
import {
  X,
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Check,
  Smartphone,
} from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const {
    isNotifDrawerOpen,
    setNotifDrawerOpen,
    language,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    appLogo,
  } = useApp();

  const t = translations[language];

  if (!isNotifDrawerOpen) return null;

  const handleEnablePush = () => {
    if (!('Notification' in window)) {
      alert('Notifications are not supported in this browser.');
      return;
    }
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification('Mail Factory', {
          body: 'Push notifications successfully enabled!',
          icon: appLogo,
        });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Bell className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h4 className="text-sm font-black">{t.notifications}</h4>
              <span className="text-[10px] text-indigo-200">
                {notifications.filter((n) => !n.read).length} Unread
              </span>
            </div>
          </div>
          <button
            onClick={() => setNotifDrawerOpen(false)}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Tools */}
        <div className="bg-slate-50 p-2.5 border-b border-slate-200 flex gap-2">
          <button
            onClick={markAllNotificationsRead}
            className="flex-1 py-1.5 px-3 rounded-xl bg-white border border-slate-200 text-indigo-700 text-xs font-bold shadow-xs hover:bg-slate-100 flex items-center justify-center gap-1 transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>

          <button
            onClick={handleEnablePush}
            className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 flex items-center justify-center gap-1 transition-all"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Enable Push</span>
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/50">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-bold">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-indigo-600" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isUnread = !notif.read;
              return (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isUnread
                      ? 'bg-indigo-50/70 border-indigo-200 shadow-sm'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex-shrink-0">
                      {notif.type === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : notif.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Info className="w-4 h-4 text-indigo-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-extrabold text-slate-800 truncate">
                          {notif.title}
                        </h5>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 ml-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{notif.desc}</p>
                      <span className="text-[9px] text-slate-400 font-medium block mt-1">
                        {notif.time}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
