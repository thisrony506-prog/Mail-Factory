import React, { useState } from 'react';
import { useApp } from './AppContext';
import { AppLogo3D } from './AppLogo3D';
import { Share, PlusSquare, X, Check, MoreVertical, Download, Sparkles, ExternalLink, Smartphone } from 'lucide-react';
import { hapticFeedback } from './haptics';
import { usePWAInstall } from './usePWAInstall';

interface IOSInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IOSInstallGuideModal: React.FC<IOSInstallGuideModalProps> = ({ isOpen, onClose }) => {
  const { language } = useApp();
  const { isIOS, hasNativePrompt, promptInstall } = usePWAInstall();
  const [installing, setInstalling] = useState(false);

  if (!isOpen) return null;

  const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;

  const handleClose = () => {
    hapticFeedback.light();
    onClose();
  };

  const handleDirectInstall = async () => {
    hapticFeedback.heavy();
    setInstalling(true);

    try {
      if (hasNativePrompt) {
        handleClose();
        await promptInstall();
      } else if (isInsideIframe) {
        // When inside an iframe preview, open in dedicated tab so browser native install triggers instantly
        window.open(window.location.href, '_blank');
      } else {
        await promptInstall();
      }
    } catch (err) {
      console.warn('[PWA] Install trigger notice:', err);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl border border-slate-100 space-y-4 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with App Logo & Name */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <AppLogo3D size={48} glow animated className="shrink-0" />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-slate-900">
                  Mail Factory
                </h3>
                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-md flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  Official
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold">
                {isIOS
                  ? (language === 'bn' ? 'iOS / iPhone-এ হোমস্ক্রিনে যুক্ত করুন' : 'Add to Home Screen on iOS')
                  : (language === 'bn' ? 'অ্যান্ড্রয়েড / ফোনে ইনস্টল করুন' : 'Install on Android / Phone')}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Direct Action Button */}
        <button
          onClick={handleDirectInstall}
          disabled={installing}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-black text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
        >
          <Download className="w-5 h-5 text-amber-200 animate-bounce" />
          <span>
            {language === 'bn'
              ? (isInsideIframe ? 'সরাসরি ইনস্টল করুন (Install Now)' : 'অ্যাপ ইনস্টল করুন (Install App)')
              : (isInsideIframe ? 'Install App Now' : 'Install Official App')}
          </span>
        </button>

        {isInsideIframe && (
          <div className="px-3 py-2 bg-indigo-50/80 rounded-xl border border-indigo-100 flex items-center justify-between text-[11px] text-indigo-900">
            <span className="font-medium flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              {language === 'bn' ? 'প্রিভিউ থেকে ইনস্টল করতে:' : 'To install from preview:'}
            </span>
            <button
              onClick={() => window.open(window.location.href, '_blank')}
              className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 underline"
            >
              <span>{language === 'bn' ? 'নতুন ট্যাবে খুলুন' : 'Open Tab'}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Steps Guide */}
        <div className="space-y-2.5 pt-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            {language === 'bn' ? 'সহজ ৩-ধাপের নির্দেশিকা:' : 'Quick 3-step guide:'}
          </div>

          {isIOS ? (
            <>
              {/* Step 1 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black flex-shrink-0 shadow-sm">
                  1
                </div>
                <div>
                  <p className="font-extrabold text-indigo-950">
                    {language === 'bn' ? 'Safari-র শেয়ার বোতামে ট্যাপ করুন' : 'Tap the Share button'}
                  </p>
                  <p className="text-indigo-700/80 text-[11px] mt-0.5 flex items-center gap-1">
                    {language === 'bn' ? 'নিচের বারে থাকা' : 'Located in bottom bar'} 
                    <Share className="w-3.5 h-3.5 inline text-indigo-600" />
                    {language === 'bn' ? 'আইকনে চাপুন' : 'icon'}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50/70 border border-amber-100 text-xs">
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
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black flex-shrink-0 shadow-sm">
                  3
                </div>
                <div>
                  <p className="font-extrabold text-emerald-950">
                    {language === 'bn' ? 'উপরে "Add" বোতামে চাপ দিন' : 'Tap "Add" in Top Right'}
                  </p>
                  <p className="text-emerald-700/80 text-[11px] mt-0.5">
                    {language === 'bn' ? 'Mail Factory অ্যাপটি এই লোগো সহ আপনার হোম স্ক্রিনে তৈরি হয়ে যাবে!' : 'Mail Factory with this official logo will be added to your home screen!'}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Step 1 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black flex-shrink-0 shadow-sm">
                  1
                </div>
                <div>
                  <p className="font-extrabold text-indigo-950">
                    {language === 'bn' ? 'ব্রাউজারের ৩-ডট মেনুতে ট্যাপ করুন' : 'Tap the 3-dot browser menu'}
                  </p>
                  <p className="text-indigo-700/80 text-[11px] mt-0.5 flex items-center gap-1">
                    {language === 'bn' ? 'উপরে বা নিচে থাকা' : 'Located at top/bottom corner'} 
                    <MoreVertical className="w-3.5 h-3.5 inline text-indigo-600" />
                    {language === 'bn' ? 'আইকনে চাপ দিন' : 'icon'}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50/70 border border-amber-100 text-xs">
                <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black flex-shrink-0 shadow-sm">
                  2
                </div>
                <div>
                  <p className="font-extrabold text-amber-950">
                    {language === 'bn' ? '"Install app" বা "Add to Home screen" চাপুন' : 'Select "Install app" or "Add to Home screen"'}
                  </p>
                  <p className="text-amber-800/80 text-[11px] mt-0.5 flex items-center gap-1">
                    <Download className="w-3.5 h-3.5 inline text-amber-600" />
                    {language === 'bn' ? 'লিস্ট থেকে অপশনটি নির্বাচন করুন' : 'Choose option from the list'}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black flex-shrink-0 shadow-sm">
                  3
                </div>
                <div>
                  <p className="font-extrabold text-emerald-950">
                    {language === 'bn' ? '"Install" বা "Add" বাটনে ক্লিক করুন' : 'Confirm "Install" or "Add"'}
                  </p>
                  <p className="text-emerald-700/80 text-[11px] mt-0.5">
                    {language === 'bn' ? 'Mail Factory অ্যাপটি এই লোগো সহ ফোনের হোম স্ক্রিনে সেট হয়ে যাবে!' : 'Mail Factory with this official logo will be added to your home screen!'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleClose}
          className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{language === 'bn' ? 'ঠিক আছে / বুঝেছি' : 'Got it'}</span>
        </button>
      </div>
    </div>
  );
};

