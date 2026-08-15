import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../lib/i18n';
import {
  X,
  Send,
  Headphones,
  Bot,
  User,
  Shield,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';

export const LiveChatDrawer: React.FC = () => {
  const { isChatDrawerOpen, setChatDrawerOpen, language, chatMessages, sendChatMessage } = useApp();
  const t = translations[language];

  const [inputVal, setInputVal] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isChatDrawerOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatDrawerOpen]);

  if (!isChatDrawerOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const msg = inputVal;
    setInputVal('');
    await sendChatMessage(msg);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Headphones className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h4 className="text-sm font-black flex items-center gap-1.5">
                <span>{t.liveChat}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h4>
              <span className="text-[10px] text-indigo-200 font-medium">Admin & Support Online</span>
            </div>
          </div>
          <button
            onClick={() => setChatDrawerOpen(false)}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Official Channels Banner */}
        <div className="bg-slate-50 p-2.5 border-b border-slate-200 flex items-center justify-around gap-2 text-xs">
          <a
            href="https://t.me/gmail_marketing02"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sky-600 font-extrabold hover:underline"
          >
            <span>Telegram @gmail_marketing02</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <div className="w-px h-3 bg-slate-300" />
          <a
            href="https://wa.me/8801964182265"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-600 font-extrabold hover:underline"
          >
            <span>WhatsApp</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {chatMessages.map((msg, index) => {
            const isUser = msg.from === 'user';
            const isAdmin = msg.from === 'admin';
            const timeStr = msg.timestamp
              ? new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              : '';

            return (
              <div
                key={msg.id || index}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : isAdmin
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-bl-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                  }`}
                >
                  {!isUser && (
                    <div className="flex items-center gap-1 text-[10px] font-black opacity-80 mb-1">
                      {isAdmin ? <Shield className="w-3 h-3" /> : <MessageCircle className="w-3 h-3" />}
                      <span>{isAdmin ? 'Admin Manager' : 'Support'}</span>
                    </div>
                  )}
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">{timeStr}</span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        <div className="bg-slate-50 border-t border-slate-200 p-2 flex gap-2 overflow-x-auto hide-scrollbar whitespace-nowrap">
          {[
            language === 'bn' ? 'আমার পেমেন্ট কখন পাবো?' : 'When will I get my payment?',
            language === 'bn' ? 'জিমেইল রিজেক্ট কেন হয়েছে?' : 'Why was my Gmail rejected?',
            language === 'bn' ? 'রেট কি আরও বাড়বে?' : 'Will the rate increase?',
            language === 'bn' ? 'কিভাবে কাজ করবো?' : 'How do I work here?',
          ].map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputVal(suggestion);
              }}
              className="inline-block px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 transition-colors whitespace-nowrap"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={language === 'bn' ? 'বার্তা লিখুন...' : 'Type a message...'}
            className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow transition-all active:scale-95 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
