import React, { useState } from 'react';
import { useApp } from './AppContext';
import { translations } from './i18n';
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
  Clipboard,
  ClipboardCheck,
} from 'lucide-react';
import { PaymentMethodConfig } from './types';
import { hapticFeedback } from './haptics';

export const WithdrawView: React.FC = () => {
  const {
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

  const currentMethod = paymentMethods[selectedKey] || methodsArray[0]?.[1];

  const feePercent = currentMethod.feePercent || 0;
  const parsedAmount = Number(amount) || 0;
  const feeAmount = (parsedAmount * feePercent) / 100;
  const netAmount = parsedAmount - feeAmount;

  const handleMaxAmount = () => {
    hapticFeedback.light();
    setAmount(Math.floor(availableBalance).toString());
    setErrorMessage(null);
  };

  const handleQuickAmount = (val: number) => {
    hapticFeedback.light();
    const current = Number(amount) || 0;
    const newAmount = Math.min(current + val, Math.floor(availableBalance));
    setAmount(newAmount.toString());
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    hapticFeedback.medium();

    if (isWithdrawDisabled) {
      setErrorMessage(t.withdrawDisabledAlert);
      return;
    }

    if (!accountNumber.trim()) {
      setErrorMessage(t.accountNumber);
      return;
    }
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage(t.enterValidAmount);
      return;
    }
    if (numAmount < minWithdraw) {
      setErrorMessage(t.minWithdrawLabel + ` ৳${minWithdraw}`);
      return;
    }
    if (numAmount > availableBalance) {
      setErrorMessage(t.insufficientBalance);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await requestWithdraw({
      amount: numAmount,
      feeAmount,
      netAmount,
      method: selectedKey,
      methodName: currentMethod.name,
      accountNumber: accountNumber.trim(),
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
      hapticFeedback.success();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b'],
      });
      setTimeout(() => {
        setIsSuccess(false);
        setAmount('');
        setActiveTab('profile'); // Return to profile after success
      }, 3500);
    } else {
      setErrorMessage(res.message);
      hapticFeedback.error();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white p-6 text-center relative">
          <button
            onClick={() => setActiveTab('profile')}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3 backdrop-blur-sm shadow-inner">
            <Wallet className="w-7 h-7 text-amber-300" />
          </div>
          <h3 className="text-xl font-black tracking-tight">{t.withdraw} 💸</h3>
          <p className="text-sm text-indigo-200 mt-1 font-medium">
            {t.fastPayoutMobile}
          </p>

          {/* Balance display box */}
          <div className="mt-5 p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex justify-around items-center shadow-sm">
            <div>
              <span className="text-xs uppercase font-extrabold text-white/70 block tracking-wider">{t.mainBalance}</span>
              <span className="text-xl font-black text-white font-mono mt-0.5 block">৳{availableBalance.toFixed(2)}</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <span className="text-xs uppercase font-extrabold text-white/70 block tracking-wider">{t.holdBalance}</span>
              <span className="text-xl font-black text-amber-300 font-mono mt-0.5 block">৳{(profile?.hold || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce shadow-sm">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-black text-slate-800 tracking-tight">
              {t.withdrawSuccess}
            </h4>
            <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
              {t.withdrawSuccessDesc}
            </p>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-widest ml-1">
                {t.selectPaymentMethod}
              </label>
              <div className="grid grid-cols-2 gap-3">
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
                      className={`p-3 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-2 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-sm'
                          : 'border-slate-100 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      <CreditCard className="w-6 h-6" style={{ color: method.color || '#4F46E5' }} />
                      <span className="text-xs font-bold truncate w-full">{method.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Account Number Input */}
            <div className="space-y-2 relative">
              <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-widest ml-1">
                {t.accountNumber} ({currentMethod.name})
              </label>
              <div className="relative">
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
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3.5 pr-12 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 bg-slate-50 hover:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      hapticFeedback.light();
                      const text = await navigator.clipboard.readText();
                      if (text) {
                        setAccountNumber(text);
                        if (errorMessage) setErrorMessage(null);
                      }
                    } catch (err) {
                      console.error('Failed to read clipboard', err);
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title="Paste from clipboard"
                >
                  <Clipboard className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Amount Input & Presets */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1 mb-1">
                <label className="text-xs font-extrabold text-slate-600 uppercase tracking-widest">
                  {t.amount}
                </label>
                <span className="text-[11px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
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
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3.5 text-base font-bold text-slate-900 focus:outline-none focus:border-indigo-600 bg-slate-50 hover:bg-white transition-colors"
              />
              
              {/* Quick amount presets */}
              <div className="flex gap-2 pt-2">
                {[100, 200, 500, 1000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAmount(val)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    +৳{val}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleMaxAmount}
                  className="px-4 py-2 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs font-black transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Fee Breakdown */}
            {parsedAmount >= minWithdraw && (
              <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-100 space-y-2">
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>{t.amount}</span>
                  <span className="font-bold text-slate-900">৳{parsedAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>{t.fee} ({feePercent}%)</span>
                  <span className="font-bold text-rose-500">- ৳{feeAmount.toFixed(2)}</span>
                </div>
                <div className="h-px w-full bg-indigo-200/50 my-1" />
                <div className="flex justify-between text-sm">
                  <span className="font-extrabold text-slate-900">{t.netPayable}</span>
                  <div className="text-right">
                    <span className="font-black text-indigo-600 font-mono block">৳{netAmount.toFixed(2)}</span>
                    {selectedKey === 'binance' && (
                      <span className="text-[11px] font-bold text-amber-600 block mt-0.5">
                        ~ ${(netAmount / 120).toFixed(2)} USDT
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSubmitting || isWithdrawDisabled}
              className={`w-full py-4 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-2 ${
                isWithdrawDisabled
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : isSubmitting
                  ? 'bg-indigo-400 text-white cursor-wait'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:shadow-indigo-300'
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
      
      {/* Information Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col gap-2 shadow-sm">
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
          <h4 className="text-sm font-bold text-slate-900">{t.safeData}</h4>
          <p className="text-xs font-medium text-slate-500 leading-relaxed">
            {t.trustedSafe}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col gap-2 shadow-sm">
          <Zap className="w-6 h-6 text-amber-500" />
          <h4 className="text-sm font-bold text-slate-900">{t.fastPayment}</h4>
          <p className="text-xs font-medium text-slate-500 leading-relaxed">
            {t.withdrawSuccessDesc}
          </p>
        </div>
      </div>
    </div>
  );
};
