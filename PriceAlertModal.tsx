import React, { useState } from 'react';
import { useApp } from './AppContext';
import { PriceAlertSubscription } from './types';
import { hapticFeedback } from './haptics';
import {
  Bell,
  BellRing,
  X,
  Check,
  Trash2,
  TrendingDown,
  Sparkles,
  Zap,
  ShieldCheck,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAccountType?: 'fresh' | 'aged' | 'all';
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  defaultAccountType = 'all',
}) => {
  const {
    language,
    user,
    setAuthModalOpen,
    priceAlerts,
    subscribePriceAlert,
    unsubscribePriceAlert,
    buyerProducts,
    appLogo,
  } = useApp();

  const isBn = language === 'bn';

  const [selectedType, setSelectedType] = useState<'fresh' | 'aged' | 'all'>(defaultAccountType);
  const [direction, setDirection] = useState<'any_change' | 'price_drop' | 'target_or_below'>('price_drop');
  const [customTargetPrice, setCustomTargetPrice] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  // Calculate current average/sample price for reference
  const currentPrices = {
    fresh: buyerProducts.find((p) => p.category === 'fresh')?.price || 15,
    aged: buyerProducts.find((p) => p.category === 'aged')?.price || 40,
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onClose();
      setAuthModalOpen(true, 'login');
      return;
    }

    hapticFeedback.medium();
    setLoading(true);

    const target = customTargetPrice ? parseFloat(customTargetPrice) : undefined;
    const res = await subscribePriceAlert({
      accountType: selectedType,
      direction,
      targetPrice: target && target > 0 ? target : undefined,
    });

    setLoading(false);
    if (res.success) {
      hapticFeedback.success();
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);

      // Request browser notification permission if available
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  };

  const handleRemove = async (id: string) => {
    hapticFeedback.light();
    await unsubscribePriceAlert(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white p-5 flex items-center justify-between relative overflow-hidden shrink-0">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner">
              <BellRing className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black leading-tight">
                {isBn ? 'মূল্য পরিবর্তন অ্যালার্ট (Price Alert)' : 'Gmail Price Drop Alerts'}
              </h3>
              <p className="text-xs text-indigo-100 font-medium pt-0.5">
                {isBn ? 'দাম কমলে সাথে সাথে ইনস্ট্যান্ট নোটিফিকেশন পান' : 'Get notified instantly when prices drop or change'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          
          {/* Subscription Form */}
          <form onSubmit={handleSubscribe} className="space-y-4">
            
            {/* Account Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                {isBn ? '১. জিমেইল অ্যাকাউন্টের ধরণ নির্বাচন করুন:' : '1. Select Account Type:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'all', nameBn: 'সকল প্যাকেজ', nameEn: 'All Types', icon: Layers, color: 'indigo' },
                  { id: 'fresh', nameBn: 'ফ্রেশ জিমেইল', nameEn: 'Fresh Gmail', icon: Zap, color: 'emerald', price: currentPrices.fresh },
                  { id: 'aged', nameBn: 'ওল্ড জিমেইল', nameEn: 'Aged Gmail', icon: ShieldCheck, color: 'amber', price: currentPrices.aged },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSel = selectedType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        hapticFeedback.light();
                        setSelectedType(item.id as any);
                      }}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                        isSel
                          ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-600/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={`w-4 h-4 ${isSel ? 'text-indigo-600' : 'text-slate-400'}`} />
                        {isSel && <Check className="w-3.5 h-3.5 text-indigo-600 font-black" />}
                      </div>
                      <div>
                        <span className={`text-xs font-black block ${isSel ? 'text-indigo-950' : 'text-slate-800'}`}>
                          {isBn ? item.nameBn : item.nameEn}
                        </span>
                        {item.price && (
                          <span className="text-[10px] text-slate-500 font-mono font-bold block pt-0.5">
                            এখন: ৳{item.price}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notification Trigger Condition */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                {isBn ? '২. কখন নোটিফিকেশন পাবেন:' : '2. Alert Condition:'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDirection('price_drop')}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                    direction === 'price_drop'
                      ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <TrendingDown className={`w-4 h-4 shrink-0 mt-0.5 ${direction === 'price_drop' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {isBn ? 'দাম কমলেই অ্যালার্ট দিন' : 'When Price Drops'}
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-tight pt-0.5">
                      {isBn ? 'প্যাকেজের মূল্য হ্রাস পেলেই পাবেন' : 'Triggered on any price reduction'}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDirection('target_or_below')}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                    direction === 'target_or_below'
                      ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-600/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Sparkles className={`w-4 h-4 shrink-0 mt-0.5 ${direction === 'target_or_below' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {isBn ? 'নির্দিষ্ট টার্গেট প্রাইসে' : 'Specific Target Price'}
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-tight pt-0.5">
                      {isBn ? 'আপনার কাঙ্ক্ষিত দামে পৌঁছালে' : 'Triggered when reaches target budget'}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Target Price input if chosen */}
            {direction === 'target_or_below' && (
              <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 animate-fade-in">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>{isBn ? 'টার্গেট মূল্য (৳ প্রতি পিস):' : 'Target Price (৳ per pc):'}</span>
                  <span className="text-[10px] text-indigo-600 font-bold">
                    {isBn ? 'যেমন: ৳12 বা ৳35' : 'e.g. ৳12 or ৳35'}
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">৳</span>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    placeholder="12.00"
                    value={customTargetPrice}
                    onChange={(e) => setCustomTargetPrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 bg-white rounded-xl border border-slate-300 text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-black shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Bell className="w-4 h-4" />
              <span>
                {loading
                  ? (isBn ? 'সাবস্ক্রাইব করা হচ্ছে...' : 'Subscribing...')
                  : (isBn ? 'প্রাইস অ্যালার্ট সাবস্ক্রাইব করুন' : 'Subscribe to Price Alert')}
              </span>
            </button>

            {isSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold animate-fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {isBn
                    ? 'প্রাইস অ্যালার্ট সফলভাবে চালু হয়েছে! দাম পরিবর্তন হলে আপনি সরাসরি নোটিফিকেশন পাবেন।'
                    : 'Price alert activated! You will receive notifications when prices change.'}
                </span>
              </div>
            )}
          </form>

          {/* Active Subscriptions List */}
          <div className="pt-3 border-t border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isBn ? 'আপনার সক্রিয় প্রাইস অ্যালার্ট' : 'Your Active Price Alerts'}</span>
              </h4>
              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {priceAlerts.length}
              </span>
            </div>

            {priceAlerts.length === 0 ? (
              <div className="text-center py-5 px-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-400 font-medium">
                {isBn ? 'এখনও কোনো প্রাইস অ্যালার্ট চালু করা হয়নি।' : 'No active price alerts yet.'}
              </div>
            ) : (
              <div className="space-y-2">
                {priceAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-xl bg-white border border-slate-200 text-indigo-600 shrink-0">
                        {alert.accountType === 'fresh' ? (
                          <Zap className="w-4 h-4 text-emerald-600" />
                        ) : alert.accountType === 'aged' ? (
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                        ) : (
                          <Layers className="w-4 h-4 text-indigo-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-900 capitalize">
                            {alert.accountType === 'all'
                              ? (isBn ? 'সকল প্যাকেজ' : 'All Accounts')
                              : alert.accountType === 'fresh'
                              ? (isBn ? 'ফ্রেশ জিমেইল' : 'Fresh Gmail')
                              : (isBn ? 'ওল্ড জিমেইল' : 'Aged Gmail')}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                            {alert.direction === 'target_or_below' && alert.targetPrice
                              ? `≤ ৳${alert.targetPrice}`
                              : (isBn ? 'দাম হ্রাস' : 'Price Drop')}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block pt-0.5">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(alert.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title={isBn ? 'অ্যালার্ট মুছুন' : 'Remove alert'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Educational Note */}
          <div className="bg-indigo-50/70 p-3 rounded-2xl border border-indigo-100 flex items-start gap-2 text-[11px] text-indigo-900">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              {isBn
                ? 'টিপস: ব্রাউজারের পুশ নোটিফিকেশন এলাউ (Allow) রাখলে ওয়েবসাইট বন্ধ থাকলেও আপনি জিমেইলের দাম কমার সাথে সাথে তাৎক্ষণিক আপডেট পাবেন।'
                : 'Tip: Allow push notifications in your browser to get instant alerts even when the browser tab is closed.'}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
