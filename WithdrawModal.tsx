import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../lib/i18n';
import confetti from 'canvas-confetti';
import {
  X,
  Wallet,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Send,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { PaymentMethodConfig } from '../types';
import { hapticFeedback } from '../lib/haptics';

export const WithdrawModal: React.FC = () => {
  const {
    isWithdrawModalOpen,
    setWithdrawModalOpen,
    language,
    profile,
    paymentMethods,
    minWithdraw,
    isWithdrawDisabled,
    requestWithdraw,
    setActiveTab,
  } = useApp();

  const t = translations[language];

  const availableBalance = profile?.balance || 0;
  const methodsArray = (Object.entries(paymentMethods) as [string, PaymentMethodConfig][]).filter(([_, m]) => m.active);

  const [selectedKey, setSelectedKey] = useState<string>(() => {
    return methodsArray[0]?.[0] || 'bkash';
  });
  const [accountNumber, setAccountNumber] = useState<string>(profile?.paymentNumber || '');
  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isWithdrawModalOpen) return null;

  const currentMethod = paymentMethods[selectedKey] || {
    name: 'Mobile Banking',
    icon: 'bi-wallet',
    color: '#4F46E5',
    active: true,
  };

  const handleQuickAmount = (val: number) => {
    const finalVal = Math.min(val, availableBalance);
    setAmount(String(finalVal));
    if (errorMessage) setErrorMessage(null);
  };

  const handleMaxAmount = () => {
    setAmount(String(Math.floor(availableBalance)));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    hapticFeedback.medium();
    const numAmount = Number(amount);

    if (!accountNumber.trim()) {
      hapticFeedback.error();
      setErrorMessage(
        language === 'bn' ? 'অনুগ্রহ করে একাউন্ট নম্বর দিন।' : 'Please enter your account number.'
      );
      return;
    }

    if (!numAmount || isNaN(numAmount) || numAmount < minWithdraw) {
      hapticFeedback.error();
      setErrorMessage(
        language === 'bn'
          ? `সর্বনিম্ন উত্তোলনের পরিমাণ ৳${minWithdraw}।`
          : `Minimum withdrawal amount is ৳${minWithdraw}.`
      );
      return;
    }

    if (numAmount > availableBalance) {
      hapticFeedback.error();
      setErrorMessage(
        language === 'bn'
          ? `অপর্যাপ্ত ব্যালেন্স! আপনার ব্যালেন্স ৳${availableBalance.toFixed(2)}`
          : `Insufficient balance! Available: ৳${availableBalance.toFixed(2)}`
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await requestWithdraw({
      amount: numAmount,
      method: selectedKey,
      methodName: currentMethod.name,
      accountNumber: accountNumber.trim(),
    });

    setIsSubmitting(false);

    if (res.success) {
      hapticFeedback.success();
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.5 },
        });
      } catch {
        // safe ignore
      }
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setWithdrawModalOpen(false);
        setActiveTab('history');
      }, 2000);
    } else {
      setErrorMessage(res.message || 'Withdrawal request failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white p-5 text-center relative">
          <button
            onClick={() => setWithdrawModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
            <Wallet className="w-6 h-6 text-amber-300" />
          </div>
          <h3 className="text-lg font-black">{t.withdraw} 💸</h3>
          <p className="text-xs text-indigo-200 mt-0.5">
            {language === 'bn' ? 'তাৎক্ষণিক মোবাইল ওয়ালেটে টাকা তুলুন' : 'Fast payout directly to your wallet'}
          </p>

          {/* Balance display box */}
          <div className="mt-3 p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex justify-around items-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-white/70 block">{t.mainBalance}</span>
              <span className="text-base font-black text-white font-mono">৳{availableBalance.toFixed(2)}</span>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/70 block">{t.holdBalance}</span>
              <span className="text-base font-black text-amber-300 font-mono">৳{(profile?.hold || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-9 h-9" />
            </div>
            <h4 className="text-lg font-black text-slate-800">
              {language === 'bn' ? 'অনুরোধ সফল হয়েছে!' : 'Withdrawal Submitted!'}
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {language === 'bn'
                ? `৳${amount} উত্তোলনের অনুরোধ গৃহীত হয়েছে। ২৪-৪৮ ঘণ্টার মধ্যে একাউন্টে পৌঁছাবে।`
                : `৳${amount} payout submitted. Payout will be verified and sent within 24-48 hours.`}
            </p>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Payment Method Selector */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-2">
                {t.selectPaymentMethod}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {methodsArray.map(([key, method]) => {
                  const isSelected = selectedKey === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSelectedKey(key);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/80 text-indigo-800 shadow-sm ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" style={{ color: method.color || '#4F46E5' }} />
                      <span className="text-[11px] font-extrabold truncate w-full">{method.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Account Number Input */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                {t.accountNumber} ({currentMethod.name})
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => {
                  setAccountNumber(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={
                  selectedKey === 'binance' ? 'Binance Pay ID / USDT TRC20' : '01XXXXXXXXX (11 digits)'
                }
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              />
            </div>

            {/* Amount Input & Presets */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                  {t.amount}
                </label>
                <span className="text-[10px] font-bold text-rose-600">
                  {t.minWithdrawLabel} ৳{minWithdraw}
                </span>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                min={minWithdraw}
                max={availableBalance}
                placeholder={`Min ৳${minWithdraw}`}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              />

              {/* Quick amount presets */}
              <div className="flex gap-1.5 mt-2">
                {[100, 200, 500, 1000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAmount(val)}
                    className="flex-1 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold transition-all"
                  >
                    +৳{val}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleMaxAmount}
                  className="px-3 py-1 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-[10px] font-black transition-all"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSubmitting || isWithdrawDisabled}
              className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm text-white shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 ${
                isWithdrawDisabled
                  ? 'bg-slate-400 cursor-not-allowed'
                  : isSubmitting
                  ? 'bg-indigo-400 cursor-wait'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 shadow-emerald-200'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>
                {isWithdrawDisabled
                  ? 'Withdraw Disabled'
                  : isSubmitting
                  ? 'Submitting...'
                  : t.submitWithdraw}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
