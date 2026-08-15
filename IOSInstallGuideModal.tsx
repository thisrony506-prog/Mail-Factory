import React from 'react';
import { useApp } from '../context/AppContext';
import { Share, PlusSquare, X, Check, Smartphone } from 'lucide-react';
import { hapticFeedback } from '../lib/haptics';

interface IOSInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IOSInstallGuideModal: React.FC<IOSInstallGuideModalProps> = ({ isOpen, onClose }) => {
  const { language, appLogo } = useApp();

  if (!isOpen) return null;

  const handleClose = () => {
    hapticFeedback.light();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl border border-slate-100 space-y-4 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <img 
              src={appLogo} 
              alt="Mail Factory" 
              className="w-10 h-10 rounded-xl shadow-sm border border-slate-200 object-cover" 
            />
            <div>
              <h3 className="text-sm font-black text-slate-800">
                {language === 'bn' ? 'iPhone-এ অ্যাপ ইনস্টল করুন' : 'Install on iPhone / iPad'}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {language === 'bn' ? 'Safari ব্রাউজার দিয়ে সহজে যুক্ত করুন' : 'Add directly from Safari'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {/* Step 1 */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs">
            <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black flex-shrink-0 shadow-sm">
              1
            </div>
            <div>
              <p className="font-extrabold text-indigo-950">
                {language === 'bn' ? 'শেয়ার বোতামে ট্যাপ করুন' : 'Tap the Share button'}
              </p>
              <p className="text-indigo-700/80 text-[11px] mt-0.5 flex items-center gap-1">
                {language === 'bn' ? 'Safari-র নিচে থাকা' : 'Located in bottom bar'} 
                <Share className="w-3.5 h-3.5 inline text-indigo-600" />
                {language === 'bn' ? 'আইকনে চাপুন' : 'icon'}
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50/60 border border-amber-100 text-xs">
            <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black flex-shrink-0 shadow-sm">
              2
            </div>
            <div>
              <p className="font-extrabold text-amber-950">
                {language === 'bn' ? 'Add to Home Screen চাপুন' : 'Select "Add to Home Screen"'}
              </p>
              <p className="text-amber-800/80 text-[11px] mt-0.5 flex items-center gap-1">
                <PlusSquare className="w-3.5 h-3.5 inline text-amber-600" />
                {language === 'bn' ? 'মেনু স্ক্রোল করে নির্বাচন করুন' : 'Scroll down in the share sheet'}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black flex-shrink-0 shadow-sm">
              3
            </div>
            <div>
              <p className="font-extrabold text-emerald-950">
                {language === 'bn' ? 'উপরে "Add" বোতামে চাপ দিন' : 'Tap "Add" in Top Right'}
              </p>
              <p className="text-emerald-700/80 text-[11px] mt-0.5">
                {language === 'bn' ? 'অ্যাপটি আপনার হোম স্ক্রিনে তৈরি হয়ে যাবে!' : 'The app is instantly installed on your home screen!'}
              </p>
            </div>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-extrabold text-xs shadow-md hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4 text-amber-300" />
          <span>{language === 'bn' ? 'বুঝেছি' : 'Got it'}</span>
        </button>
      </div>
    </div>
  );
};
