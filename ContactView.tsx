import React from 'react';
import { useApp } from './AppContext';
import { Mail, ArrowLeft, Send, MessageCircle } from 'lucide-react';

export const ContactView: React.FC = () => {
  const { language, setActiveTab } = useApp();

  return (
    <div className="max-w-xl mx-auto pb-24 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6 rounded-b-3xl shadow-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('profile')}
            className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight">
              {language === 'bn' ? 'যোগাযোগ ও সাপোর্ট' : 'Contact Us & Support'}
            </h1>
            <p className="text-indigo-100 text-xs font-medium">
              {language === 'bn' ? 'আমাদের সাহায্যকারী দল' : 'Official support desk'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 mt-2 space-y-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-3">
            {/* Telegram Channel */}
            <a
              href="https://t.me/gmail_marketing02"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-2xl bg-sky-50 border border-sky-100 hover:bg-sky-100 transition-all text-sky-900 cursor-pointer block"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-black">Telegram Channel & Chat</h5>
                  <span className="text-[11px] font-mono text-sky-700">@gmail_marketing02</span>
                </div>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/8801964182265"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-all text-emerald-900 cursor-pointer block"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-black">WhatsApp Help Desk</h5>
                  <span className="text-[11px] font-mono text-emerald-700">+8801964182265</span>
                </div>
              </div>
            </a>

            {/* Email Support */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-900">
              <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-black">Official Email Support</h5>
                <span className="text-[11px] font-mono text-indigo-700">mailfactorybd@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
