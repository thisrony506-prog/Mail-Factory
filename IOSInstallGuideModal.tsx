import React, { useState } from 'react';
import { useApp } from './AppContext';
import { AppLogo3D } from './AppLogo3D';
import { Share, PlusSquare, X, Check, MoreVertical, Download, ExternalLink, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';
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

  const handleDirectNativeInstall = async () => {
    hapticFeedback.heavy();
    setInstalling(true);

    try {
      if (hasNativePrompt) {
        handleClose();
        await promptInstall();
      } else if (isInsideIframe) {
        window.open(window.location.href, '_blank');
      } else {
        await promptInstall();
      }
    } catch (err) {
      console.warn('[PWA] Direct install trigger:', err);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center sm:items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-sm sm:max-w-md rounded-3xl bg-slate-900 text-slate-100 p-5 sm:p-6 shadow-2xl border border-slate-800 space-y-4 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Logo */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <AppLogo3D size={48} glow animated className="shrink-0" />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-black text-white">
                  Mail Factory App
                </h3>
                <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-black rounded-md flex items-center gap-0.5 border border-emerald-500/30">
                  <Sparkles className="w-2.5 h-2.5" />
                  Official
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                {isIOS
                  ? (language === 'bn' ? 'iOS / iPhone ইনস্টলেশন গাইড' : 'iOS / iPhone Installation Guide')
                  : (language === 'bn' ? 'অ্যান্ড্রয়েড / ক্রোম ইনস্টলেশন গাইড' : 'Android / Chrome Installation Guide')}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice for Iframe Preview */}
        {isInsideIframe && (
          <div className="p-3.5 bg-indigo-950/80 rounded-2xl border border-indigo-500/40 space-y-2 text-xs text-indigo-200">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
              <Smartphone className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{language === 'bn' ? 'প্রিভিউ উইন্ডো নোটিশ:' : 'Preview Window Notice:'}</span>
            </div>
            <p className="text-[11px] text-indigo-200/90 leading-relaxed">
              {language === 'bn' 
                ? 'আইফ্রেম প্রিভিউতে সরাসরি ইনস্টল প্রম্পট কাজ করে না। আপনার মোবাইল ফোনে আসল অ্যাপ ইনস্টল করতে নিচে "নতুন ট্যাবে খুলুন" বাটনে চাপ দিন।'
                : 'Direct PWA install prompt is restricted inside preview iframes. Open in a new browser tab to install directly.'}
            </p>
            <button
              onClick={() => window.open(window.location.href, '_blank')}
              className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs shadow-md active:scale-98 transition-all cursor-pointer"
            >
              <span>{language === 'bn' ? 'নতুন ট্যাবে খুলুন (Open in New Tab)' : 'Open in New Tab'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* If Chrome Has Native Prompt ready, show direct install button */}
        {hasNativePrompt && !isInsideIframe && (
          <button
            onClick={handleDirectNativeInstall}
            disabled={installing}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-black text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <Download className="w-5 h-5 text-amber-200 animate-bounce" />
            <span>{language === 'bn' ? 'সরাসরি ফোনে ইনস্টল করুন (Install Now)' : 'Install App Now'}</span>
          </button>
        )}

        {/* Step-by-Step Honest Guide */}
        <div className="space-y-2.5 pt-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            {language === 'bn' ? 'ইনস্টল করার সহজ ৩টি ধাপ:' : 'Simple 3-Step Guide:'}
          </div>

          {isIOS ? (
            <>
              {/* Step 1 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black flex-shrink-0 shadow-sm">
                  1
                </div>
                <div>
                  <p className="font-bold text-slate-100">
                    {language === 'bn' ? 'Safari-র শেয়ার বোতামে ট্যাপ করুন' : 'Tap the Share button'}
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5 flex items-center gap-1">
                    {language === 'bn' ? 'Safari ব্রাউজারের নিচে থাকা' : 'Located in bottom Safari bar'} 
                    <Share className="w-3.5 h-3.5 inline text-indigo-400" />
                    {language === 'bn' ? 'আইকনে চাপ দিন' : 'icon'}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs">
                <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black flex-shrink-0 shadow-sm">
                  2
                </div>
                <div>
                  <p className="font-bold text-slate-100">
                    {language === 'bn' ? '"Add to Home Screen" নির্বাচন করুন' : 'Select "Add to Home Screen"'}
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5 flex items-center gap-1">
                    <PlusSquare className="w-3.5 h-3.5 inline text-amber-400" />
                    {language === 'bn' ? 'মেনু থেকে স্ক্রোল করে সিলেক্ট করুন' : 'Scroll down in share sheet'}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black flex-shrink-0 shadow-sm">
                  3
                </div>
                <div>
                  <p className="font-bold text-slate-100">
                    {language === 'bn' ? 'উপরে "Add" চাপলে ইনস্টল সম্পন্ন হবে' : 'Tap "Add" in Top Right'}
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {language === 'bn' ? 'Mail Factory অ্যাপের লোগো সহ আপনার ফোনের হোম স্ক্রিনে সেট হয়ে যাবে।' : 'Mail Factory icon will be added to your mobile home screen.'}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Step 1 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black flex-shrink-0 shadow-sm">
                  1
                </div>
                <div>
                  <p className="font-bold text-slate-100">
                    {language === 'bn' ? 'ব্রাউজারের ৩-ডট মেনুতে ট্যাপ করুন' : 'Tap 3-dot browser menu'}
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5 flex items-center gap-1">
                    {language === 'bn' ? 'কোণায় থাকা' : 'Located at top/bottom corner'} 
                    <MoreVertical className="w-3.5 h-3.5 inline text-indigo-400" />
                    {language === 'bn' ? 'মেনু আইকনে চাপ দিন' : 'menu icon'}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs">
                <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black flex-shrink-0 shadow-sm">
                  2
                </div>
                <div>
                  <p className="font-bold text-slate-100">
                    {language === 'bn' ? '"Install app" বা "Add to Home screen" চাপুন' : 'Select "Install app" or "Add to Home screen"'}
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5 flex items-center gap-1">
                    <Download className="w-3.5 h-3.5 inline text-amber-400" />
                    {language === 'bn' ? 'তালিকায় অপশনটি নির্বাচন করুন' : 'Choose option from list'}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black flex-shrink-0 shadow-sm">
                  3
                </div>
                <div>
                  <p className="font-bold text-slate-100">
                    {language === 'bn' ? '"Install" দিয়ে অ্যাপ ইনস্টল সম্পন্ন করুন' : 'Confirm "Install"'}
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {language === 'bn' ? 'অ্যাপটি সরাসরি আপনার মোবাইলে অফিশিয়াল অ্যাপ হিসেবে ইন্সটল হয়ে যাবে।' : 'Mail Factory will be added as an official app on your device.'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Close / Action Button */}
        <button
          onClick={handleClose}
          className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700/60"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{language === 'bn' ? 'ঠিক আছে / বুঝেছি' : 'Got it'}</span>
        </button>
      </div>
    </div>
  );
};



