import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { usePWAInstall } from './usePWAInstall';
import { AppLogo3D } from './AppLogo3D';
import { hapticFeedback } from './haptics';
import {
  X,
  Smartphone,
  Share,
  PlusSquare,
  MoreVertical,
  Download,
  Laptop,
  CheckCircle2,
  Globe,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface PWAInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'android' | 'ios' | 'desktop' | 'samsung';

export const PWAInstallGuideModal: React.FC<PWAInstallGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language } = useApp();
  const isBn = language === 'bn';
  const { isInstalled, isStandalone, promptInstall, hasNativePrompt } = usePWAInstall();

  // Detect current platform to auto-select the most relevant tab
  const [activeTab, setActiveTab] = useState<TabType>('android');
  const [isInstalling, setIsInstalling] = useState(false);
  const [hasConfirmedInstalled, setHasConfirmedInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)) {
      setActiveTab('ios');
    } else if (/samsungbrowser/.test(ua)) {
      setActiveTab('samsung');
    } else if (/android/.test(ua)) {
      setActiveTab('android');
    } else if (/windows|macintosh|linux/.test(ua) && !/mobile/.test(ua)) {
      setActiveTab('desktop');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDirectInstall = async () => {
    hapticFeedback.medium();
    setIsInstalling(true);
    try {
      if (typeof (window as any).triggerPwaInstall === 'function') {
        await (window as any).triggerPwaInstall();
      } else {
        await promptInstall();
      }
    } finally {
      setIsInstalling(false);
    }
  };

  const handleMarkInstalled = () => {
    hapticFeedback.success();
    try {
      localStorage.setItem('mailfactory_pwa_installed', 'true');
      window.dispatchEvent(new CustomEvent('mf_pwa_installed'));
    } catch {}
    setHasConfirmedInstalled(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    {
      id: 'android',
      label: 'Android (Chrome)',
      icon: <Smartphone className="w-4 h-4" />,
    },
    {
      id: 'ios',
      label: 'iPhone (Safari)',
      icon: <Share className="w-4 h-4" />,
    },
    {
      id: 'desktop',
      label: isBn ? 'কম্পিউটার (PC)' : 'Desktop',
      icon: <Laptop className="w-4 h-4" />,
    },
    {
      id: 'samsung',
      label: 'Samsung Internet',
      icon: <Globe className="w-4 h-4" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl text-slate-100 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-xl bg-slate-800/80 border border-white/10 shadow-sm shrink-0">
              <AppLogo3D size={32} animated glow={false} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-extrabold text-white">
                  {isBn ? 'অ্যাপ ইনস্টল করার সহজ নিয়ম' : 'How to Install Mail Factory'}
                </h3>
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-bold border border-indigo-500/30">
                  PWA Guide
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {isBn ? 'ব্রাউজার অনুসারে নিচের নিয়মগুলো অনুসরণ করুন' : 'Step-by-step browser installation instructions'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              hapticFeedback.light();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-800/80 bg-slate-950/40">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    hapticFeedback.light();
                    setActiveTab(tab.id);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {tab.icon}
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5">
          {/* TAB 1: ANDROID CHROME */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              {/* Graphic / Visual Illustration for Chrome */}
              <div className="relative rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-950 border border-slate-700/60 p-4 overflow-hidden">
                <div className="text-[10px] text-slate-400 font-semibold mb-2 flex items-center justify-between">
                  <span>📱 Google Chrome Preview</span>
                  <span className="text-emerald-400 font-mono">Chrome / Android</span>
                </div>

                {/* Mockup Top Address Bar */}
                <div className="rounded-xl bg-slate-900 border border-slate-700 p-2.5 flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-slate-500">🔒</span>
                    <span className="text-xs text-slate-300 font-mono truncate">mailfectory.top</span>
                  </div>
                  <div className="relative flex items-center">
                    <div className="relative p-1 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/40">
                      <MoreVertical className="w-4 h-4 animate-pulse text-indigo-300" />
                      {/* Pulse beacon */}
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mockup Dropdown Menu */}
                <div className="mt-2.5 ml-auto max-w-[200px] rounded-xl bg-slate-900/95 border border-indigo-500/40 p-2 shadow-xl space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                  <div className="text-[10px] text-slate-500 px-2 py-0.5">New tab</div>
                  <div className="text-[10px] text-slate-500 px-2 py-0.5">Bookmarks</div>
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-black shadow-md border border-indigo-400/30">
                    <div className="flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
                      <span>Install App</span>
                    </div>
                    <span className="text-[9px] bg-white/20 px-1 rounded font-mono">1-Tap</span>
                  </div>
                  <div className="text-[10px] text-slate-500 px-2 py-0.5">Settings</div>
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 font-black text-xs flex items-center justify-center shrink-0 border border-indigo-500/30">
                    ১
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs">
                      {isBn ? 'ব্রাউজার মেনুতে চাপুন' : 'Tap the Browser Menu'}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isBn
                        ? 'ক্রোম ব্রাউজারের উপরে ডানপাশের ৩টি ডট (⋮) আইকনে চাপ দিন।'
                        : 'Tap the three vertical dots (⋮) in the top-right corner of Chrome.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 font-black text-xs flex items-center justify-center shrink-0 border border-indigo-500/30">
                    ২
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs">
                      {isBn ? '"Install app" অপশনটি সিলেক্ট করুন' : 'Select "Install app"'}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isBn
                        ? 'মেনু থেকে "Install app" অথবা "Add to Home screen" চাপুন।'
                        : 'Look for "Install app" or "Add to Home screen" in the menu.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 font-black text-xs flex items-center justify-center shrink-0 border border-indigo-500/30">
                    ৩
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs">
                      {isBn ? '"Install" কনফার্ম করুন' : 'Confirm "Install"'}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isBn
                        ? 'পপআপ আসলে "Install" চাপলেই আপনার ফোনের হোমস্ক্রিনে অ্যাপ আইকন সেভ হয়ে যাবে।'
                        : 'Tap "Install" on the confirmation pop-up. The icon appears on your home screen!'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IOS SAFARI */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              {/* Graphic / Visual Illustration for Safari */}
              <div className="relative rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-950 border border-slate-700/60 p-4 overflow-hidden">
                <div className="text-[10px] text-slate-400 font-semibold mb-2 flex items-center justify-between">
                  <span>🍎 Apple Safari Preview</span>
                  <span className="text-sky-400 font-mono">iPhone / iPad</span>
                </div>

                {/* Mockup Action Sheet item */}
                <div className="mb-3 rounded-xl bg-slate-900/95 border border-sky-500/40 p-2.5 flex items-center justify-between shadow-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                      <PlusSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Add to Home Screen</div>
                      <div className="text-[9px] text-slate-400">হোম স্ক্রিনে যোগ করুন</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-mono font-bold">
                    Step 2
                  </span>
                </div>

                {/* Mockup Bottom Safari Toolbar */}
                <div className="rounded-xl bg-slate-900 border border-slate-700 p-2.5 flex items-center justify-around shadow-inner">
                  <span className="text-slate-600 text-xs">◀</span>
                  <span className="text-slate-600 text-xs">▶</span>
                  {/* Highlighted Share Button */}
                  <div className="relative p-1.5 rounded-xl bg-sky-500/30 text-sky-300 border border-sky-400/50 shadow-md">
                    <Share className="w-4 h-4 animate-bounce text-sky-300" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                    </span>
                  </div>
                  <span className="text-slate-600 text-xs">📖</span>
                  <span className="text-slate-600 text-xs">🗂️</span>
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-sky-600/30 text-sky-400 font-black text-xs flex items-center justify-center shrink-0 border border-sky-500/30">
                    ১
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs flex items-center gap-1.5">
                      <span>{isBn ? 'Share বাটনে ট্যাপ করুন' : 'Tap the Share Button'}</span>
                      <Share className="w-3.5 h-3.5 text-sky-400 inline" />
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isBn
                        ? 'আইফোনের সাফারি (Safari) ব্রাউজারের নিচে শেয়ার আইকনে চাপ দিন।'
                        : 'Tap the Share icon at the bottom of Safari (a box with an arrow pointing up).'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-sky-600/30 text-sky-400 font-black text-xs flex items-center justify-center shrink-0 border border-sky-500/30">
                    ২
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs flex items-center gap-1.5">
                      <span>{isBn ? '"Add to Home Screen" চাপুন' : 'Select "Add to Home Screen"'}</span>
                      <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" />
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isBn
                        ? 'মেনুটি কিছুটা নিচে স্ক্রল করে "Add to Home Screen" (হোম স্ক্রিনে যোগ করুন) অপশনটি চাপুন।'
                        : 'Scroll down the share sheet and tap "Add to Home Screen".'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-sky-600/30 text-sky-400 font-black text-xs flex items-center justify-center shrink-0 border border-sky-500/30">
                    ৩
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs">
                      {isBn ? 'উপরে "Add" চাপুন' : 'Tap "Add" at the top right'}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isBn
                        ? 'স্ক্রিনের উপরের ডানকোণায় "Add" বাটনে চাপলেই আপনার আইফোনে অ্যাপ যুক্ত হয়ে যাবে।'
                        : 'Tap "Add" in the top-right corner to complete the installation.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DESKTOP / PC */}
          {activeTab === 'desktop' && (
            <div className="space-y-4">
              <div className="relative rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-950 border border-slate-700/60 p-4 overflow-hidden">
                <div className="text-[10px] text-slate-400 font-semibold mb-2 flex items-center justify-between">
                  <span>💻 Chrome / Edge Desktop Address Bar</span>
                  <span className="text-purple-400 font-mono">Windows / Mac</span>
                </div>

                {/* Mockup Address Bar with Install Icon */}
                <div className="rounded-xl bg-slate-900 border border-slate-700 p-2.5 flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-slate-500">🔒</span>
                    <span className="text-xs text-slate-300 font-mono">https://www.mailfectory.top</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-400/40 animate-pulse">
                      <Download className="w-3.5 h-3.5 text-indigo-300" />
                      <span className="text-[10px] font-bold">Install</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-purple-600/30 text-purple-400 font-black text-xs flex items-center justify-center shrink-0 border border-purple-500/30">
                    ১
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs">
                      {isBn ? 'অ্যাড্রেস বারের Install আইকনে চাপুন' : 'Click the Install Icon in the URL bar'}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isBn
                        ? 'আপনার পিসির ব্রাউজারের অ্যাড্রেস বারের ডানপাশে (কম্পিউটার/ডাউনলোড আইকন) চাপুন।'
                        : 'Click the install icon on the right side of the browser URL address bar.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-purple-600/30 text-purple-400 font-black text-xs flex items-center justify-center shrink-0 border border-purple-500/30">
                    ২
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs">
                      {isBn ? '"Install" চাপুন' : 'Click "Install" to create a desktop app'}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isBn
                        ? 'কনফার্মেশন ডায়ালগে "Install" চাপলে আপনার ডেস্কটপ বা টাস্কবারে মেইল ফ্যাক্টরি সেভ হবে।'
                        : 'Confirm the install prompt to get a standalone desktop window and shortcut.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SAMSUNG INTERNET */}
          {activeTab === 'samsung' && (
            <div className="space-y-4">
              <div className="relative rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-950 border border-slate-700/60 p-4 overflow-hidden">
                <div className="text-[10px] text-slate-400 font-semibold mb-2 flex items-center justify-between">
                  <span>🌐 Samsung Internet Browser</span>
                  <span className="text-teal-400 font-mono">Samsung Galaxy</span>
                </div>

                <div className="rounded-xl bg-slate-900 border border-slate-700 p-2.5 flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">mailfectory.top</span>
                  </div>
                  <div className="p-1 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/40">
                    <Download className="w-4 h-4 animate-bounce" />
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-teal-600/30 text-teal-400 font-black text-xs flex items-center justify-center shrink-0 border border-teal-500/30">
                    ১
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs">
                      {isBn ? 'ডাউনলোড আইকন বা মেনুতে চাপুন' : 'Tap the Download Icon or Menu (≡)'}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isBn
                        ? 'ইউআরএল বারের পাশে অথবা নিচের মেনুতে (≡) "Add page to" অপশনটি খুঁজুন।'
                        : 'Look for the download arrow in the address bar or tap menu (≡).'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-teal-600/30 text-teal-400 font-black text-xs flex items-center justify-center shrink-0 border border-teal-500/30">
                    ২
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs">
                      {isBn ? '"App screen" বা "Home screen" নির্বাচন করুন' : 'Select "Home screen"'}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isBn
                        ? '"Add page to" ➔ "Home screen" চাপলেই আপনার স্যামসাং ফোনে ইনস্টল হয়ে যাবে।'
                        : 'Choose "Home screen" to pin the Mail Factory app.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Area */}
          <div className="pt-2 border-t border-slate-800 space-y-2.5">
            {/* If direct native install is available on this browser */}
            {hasNativePrompt && !isInstalled && !isStandalone && (
              <button
                onClick={handleDirectInstall}
                disabled={isInstalling}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4 animate-bounce" />
                <span>
                  {isInstalling
                    ? (isBn ? 'ইনস্টল হচ্ছে...' : 'Installing...')
                    : (isBn ? 'সরাসরি এখনই ইনস্টল করুন (1-Click)' : 'Try Direct Install Now (1-Click)')}
                </span>
              </button>
            )}

            {/* Confirm Installed Button */}
            <button
              onClick={handleMarkInstalled}
              disabled={hasConfirmedInstalled}
              className={`w-full py-3 px-4 rounded-2xl text-xs font-black shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                hasConfirmedInstalled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-white/10'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                {hasConfirmedInstalled
                  ? (isBn ? 'সফলভাবে চিহ্নিত হয়েছে!' : 'Marked as Installed!')
                  : (isBn ? 'আমি ইনস্টল সম্পন্ন করেছি (Mark as Installed)' : 'I Have Completed Installation')}
              </span>
            </button>

            <button
              onClick={() => {
                hapticFeedback.light();
                onClose();
              }}
              className="w-full py-2.5 text-center text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              {isBn ? 'পরে করবো / বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallGuideModal;
