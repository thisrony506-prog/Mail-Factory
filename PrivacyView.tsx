import React from 'react';
import { useApp } from './AppContext';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const PrivacyView: React.FC = () => {
  const { language, setActiveTab } = useApp();

  return (
    <div className="max-w-xl mx-auto pb-24 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6 rounded-b-3xl shadow-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('profile')}
            className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight">
              {language === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy & Security'}
            </h1>
            <p className="text-indigo-100 text-xs font-medium">
              {language === 'bn' ? 'আপনার তথ্যের নিরাপত্তা' : 'Your data security'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 mt-2">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>
          
          <div className="space-y-4 text-sm text-slate-700 leading-relaxed font-medium">
            <p>
              At <strong className="text-indigo-700">Mail Factory</strong>, data confidentiality and account integrity are our highest priorities.
            </p>
            <p>
              • All account credentials submitted through our exchange system are encrypted and securely verified.
            </p>
            <p>
              • We strictly follow zero-data-leak policies. User personal information and payment wallets are never disclosed to third parties.
            </p>
            <p>
              • Users retain full control over their account history and can delete their profile data at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
