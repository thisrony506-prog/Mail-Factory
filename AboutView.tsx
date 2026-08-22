import React from 'react';
import { useApp } from './AppContext';
import { Info, ArrowLeft } from 'lucide-react';
import { AppLogo3D } from './AppLogo3D';

export const AboutView: React.FC = () => {
  const { language, appLogo, setActiveTab } = useApp();

  return (
    <div className="max-w-xl mx-auto pb-24 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-b-3xl shadow-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('profile')}
            className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight">
              {language === 'bn' ? 'আমাদের সম্পর্কে' : 'About Mail Factory'}
            </h1>
            <p className="text-teal-100 text-xs font-medium">
              {language === 'bn' ? 'অ্যাপ্লিকেশনের বিস্তারিত' : 'Application details'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 mt-2">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center space-y-6">
          <div className="flex justify-center mt-2">
            <AppLogo3D size={72} glow animated />
          </div>
          
          <div className="space-y-4 text-sm text-slate-700 leading-relaxed font-medium">
            <div className="font-black text-lg text-emerald-700">Mail Factory v3.2.0</div>
            <p>
              The premier trusted Gmail exchange and monetization network in Bangladesh. Designed for high throughput, automated batch verification, multi-tiered level rewards, and instant mobile payouts.
            </p>
            <div className="pt-4 text-xs text-slate-400 font-mono font-bold">
              © {new Date().getFullYear()} Mail Factory Team.<br/>All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
