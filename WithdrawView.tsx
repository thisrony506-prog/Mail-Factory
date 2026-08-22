import React, { useState } from 'react';
import { BKASH_LOGO, NAGAD_LOGO, USDT_LOGO } from './logoPreload';
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

  const getMethodType = (key: string, name: string) => {
    const lowerKey = key.toLowerCase();
    const lowerName = name.toLowerCase();
    if (lowerKey.includes('bkash') || lowerName.includes('bkash')) return 'bkash';
    if (lowerKey.includes('nagad') || lowerKey.includes('nogod') || lowerName.includes('nagad') || lowerName.includes('nogod') || lowerName.includes('নগদ')) return 'nagad';
    if (lowerKey.includes('rocket') || lowerName.includes('rocket')) return 'rocket';
    if (lowerKey.includes('usdt') || lowerKey.includes('binance') || lowerName.includes('usdt') || lowerName.includes('binance')) return 'usdt';
    return 'default';
  };

  const renderBrandIcon = (type: string) => {
    if (type === 'bkash') {
      return (
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#E2136E] flex items-center justify-center shadow-md relative overflow-hidden ring-2 ring-pink-500/30 shrink-0 p-1">
          <img 
            src={BKASH_LOGO} 
            alt="bKash" 
            className="w-full h-full object-cover rounded-xl absolute inset-0 z-10" 
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-[#E2136E] flex items-center justify-center text-white z-0">
            <svg viewBox="0 0 512 512" className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-current">
              <path d="M380 120L256 50L100 170L70 310L190 230L256 350L350 190L430 210L380 120Z" />
              <path d="M100 170L256 230L190 440L70 310L100 170Z" opacity="0.95" />
            </svg>
          </div>
        </div>
      );
    }
    if (type === 'nagad') {
      return (
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#EC1C24] flex flex-col items-center justify-center shadow-md relative overflow-hidden ring-2 ring-red-500/30 shrink-0 p-1">
          <img 
            src={NAGAD_LOGO} 
            alt="Nagad" 
            className="w-full h-full object-cover rounded-xl absolute inset-0 z-10" 
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-[#EC1C24] flex flex-col items-center justify-center text-white p-0.5 z-0">
            <svg viewBox="0 0 100 100" className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-current">
              <path d="M50 15 C30 15 15 30 15 50 C15 70 30 85 50 85 C60 85 70 80 77 73 L67 63 C63 67 57 70 50 70 C38 70 30 62 30 50 C30 38 38 30 50 30 C57 30 63 33 67 37 L77 27 C70 20 60 15 50 15 Z" />
              <circle cx="50" cy="50" r="12" />
            </svg>
            <span className="text-[8px] sm:text-[10px] font-black text-white tracking-widest uppercase scale-y-90 font-sans mt-[-2px]">নগদ</span>
          </div>
        </div>
      );
    }
    if (type === 'rocket') {
      return (
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#8C3494] flex flex-col items-center justify-center shadow-md relative overflow-hidden ring-2 ring-white/40 p-1 shrink-0 text-white font-black">
          <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 fill-current">
            <path d="M12 2L2 7l10 5 10-5-10-5M2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="text-[7px] sm:text-[9px] font-bold uppercase tracking-tighter">Rocket</span>
        </div>
      );
    }
    if (type === 'usdt') {
      return (
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#26A17B] flex items-center justify-center shadow-md relative overflow-hidden ring-2 ring-emerald-500/30 shrink-0 p-1">
          <img 
            src={USDT_LOGO} 
            alt="USDT BEP20" 
            className="w-full h-full object-cover rounded-xl absolute inset-0 z-10" 
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-[#26A17B] flex items-center justify-center text-white z-0">
            <svg viewBox="0 0 100 100" className="w-5 h-5 sm:w-7 sm:h-7 text-white fill-current">
              <rect x="25" y="24" width="50" height="12" rx="3"/>
              <rect x="44" y="36" width="12" height="38" rx="3"/>
              <ellipse cx="50" cy="55" rx="22" ry="7" fill="none" stroke="currentColor" strokeWidth="5"/>
            </svg>
          </div>
        </div>
      );
    }
    return (
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-md shrink-0">
        Pay
      </div>
    );
  };

  const [selectedKey, setSelectedKey] = useState<string>(() => {
    return methodsArray[0]?.[0] || 'bkash';
  });

  const getSavedAccount = (key: string) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`saved_account_${profile?.uid || 'guest'}_${key}`);
      if (saved) return saved;
    }
    return profile?.paymentNumber || '';
  };

  const [accountNumber, setAccountNumber] = useState<string>(() => getSavedAccount(methodsArray[0]?.[0] || 'bkash'));
  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<{ amount?: string; account?: string; global?: string }>({});

  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const handleMethodSelect = (key: string) => {
    setSelectedKey(key);
    setAccountNumber(getSavedAccount(key));
    setFieldErrors({});
  };

  const handleAccountChange = (val: string) => {
    setAccountNumber(val);
    setFieldErrors(prev => ({ ...prev, account: undefined, global: undefined }));
    if (typeof window !== 'undefined') {
      localStorage.setItem(`saved_account_${profile?.uid || 'guest'}_${selectedKey}`, val);
    }
  };

  const currentMethod = paymentMethods[selectedKey] || methodsArray[0]?.[1];

  const type = getMethodType(selectedKey, currentMethod.name);
  const isUSDT = type === 'usdt';
  const currentMinWithdraw = isUSDT ? 240 : minWithdraw; // Assuming $2 = 240 BDT

  const feePercent = currentMethod.feePercent || 0;
  const parsedAmount = Number(amount) || 0;
  const feeAmount = (parsedAmount * feePercent) / 100;
  const netAmount = parsedAmount - feeAmount;

  const handleMaxAmount = () => {
    hapticFeedback.light();
    setAmount(Math.floor(availableBalance).toString());
    setFieldErrors(prev => ({ ...prev, amount: undefined, global: undefined }));
  };

  const handleQuickAmount = (val: number) => {
    hapticFeedback.light();
    const current = Number(amount) || 0;
    const newAmount = Math.min(current + val, Math.floor(availableBalance));
    setAmount(newAmount.toString());
    setFieldErrors(prev => ({ ...prev, amount: undefined, global: undefined }));
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    hapticFeedback.medium();
    setFieldErrors({});
    
    if (isWithdrawDisabled) {
      setFieldErrors({ global: t.withdrawDisabledAlert });
      hapticFeedback.error();
      return;
    }

    const acc = accountNumber.trim();
    if (!acc) {
      setFieldErrors({ account: isUSDT ? 'Enter BEP20 Wallet Address' : type === 'bkash' ? 'Enter bKash Account number' : type === 'nagad' ? 'Enter nogod Account number' : t.accountNumber });
      hapticFeedback.error();
      return;
    }

    if (type === 'bkash' || type === 'nagad' || type === 'rocket') {
      const phoneRegex = /^01[3-9][0-9]{8}$/;
      if (!phoneRegex.test(acc)) {
        setFieldErrors({ account: language === 'bn' ? 'অনুগ্রহ করে একটি সঠিক ১১-ডিজিটের মোবাইল নম্বর দিন!' : 'Please enter a valid 11-digit mobile number!' });
        hapticFeedback.error();
        return;
      }
    } else if (isUSDT) {
      if (!acc.startsWith('0x') || acc.length !== 42) {
        setFieldErrors({ account: language === 'bn' ? 'অনুগ্রহ করে সঠিক Binance BEP20 অ্যাড্রেস দিন (0x দিয়ে শুরু হবে)!' : 'Please enter a valid Binance BEP20 address (starts with 0x)!' });
        hapticFeedback.error();
        return;
      }
    }

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setFieldErrors({ amount: t.enterValidAmount });
      hapticFeedback.error();
      return;
    }
    if (numAmount < currentMinWithdraw) {
      setFieldErrors({ amount: t.minWithdrawLabel + ` ৳${currentMinWithdraw}${isUSDT ? ' (~$2)' : ''}` });
      hapticFeedback.error();
      return;
    }
    if (numAmount > availableBalance) {
      setFieldErrors({ amount: t.insufficientBalance });
      hapticFeedback.error();
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirm(false);
    hapticFeedback.medium();
    
    const numAmount = Number(amount);
    setIsSubmitting(true);
    setFieldErrors({});

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
      setFieldErrors({ global: res.message });
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
          <div className="mt-5 p-2 sm:p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex justify-around items-center shadow-sm">
            <div className="px-1 text-center">
              <span className="text-[10px] sm:text-xs uppercase font-extrabold text-white/70 block tracking-widest">{t.mainBalance}</span>
              <span className="text-base sm:text-xl font-black text-white font-mono mt-0.5 block">৳{availableBalance.toFixed(2)}</span>
            </div>
            <div className="w-px h-8 bg-white/20 mx-1" />
            <div className="px-1 text-center">
              <span className="text-[10px] sm:text-xs uppercase font-extrabold text-white/70 block tracking-widest">{t.holdBalance}</span>
              <span className="text-base sm:text-xl font-black text-amber-300 font-mono mt-0.5 block">৳{(profile?.hold || 0).toFixed(2)}</span>
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
          <form onSubmit={handlePreSubmit} className="p-6 space-y-6">
            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-widest ml-1">
                {t.selectPaymentMethod}
              </label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {methodsArray.map(([key, method]) => {
                  const isSelected = selectedKey === key;
                  const type = getMethodType(key, method.name);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleMethodSelect(key)}
                      className={`p-2.5 sm:p-3.5 rounded-2xl border-2 text-center transition-all flex items-center gap-2 sm:gap-3 relative overflow-hidden text-left ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 shadow-md ring-2 ring-indigo-600/20'
                          : 'border-slate-100 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      {renderBrandIcon(type)}
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <span className="text-[11px] sm:text-xs font-black line-clamp-2 leading-tight text-slate-900">{method.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Account Number Input */}
            <div className="space-y-2 relative">
              <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-widest ml-1 line-clamp-2 leading-tight">
                {isUSDT ? 'BEP20 Wallet Address' : type === 'bkash' ? 'bKash Account number' : type === 'nagad' ? 'nogod Account number' : `${t.accountNumber} (${currentMethod.name})`}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  placeholder={
                    isUSDT ? '0xXXXXXXXXXXXXXXXXXXXXXXXX' : '01XXXXXXXXX (11 digits)'
                  }
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 sm:py-3.5 pr-12 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 bg-slate-50 hover:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      hapticFeedback.light();
                      const text = await navigator.clipboard.readText();
                      if (text) {
                        handleAccountChange(text);
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
              {fieldErrors.account && (
                <div className="mt-1.5 flex items-start gap-1.5 text-rose-500 animate-in fade-in slide-in-from-top-1 px-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-[2px]" />
                  <p className="text-xs font-bold leading-snug">{fieldErrors.account}</p>
                </div>
              )}
              {isUSDT && (
                <div className="mt-1 text-[10px] font-bold text-slate-500 uppercase ml-1">
                  Network: <span className="text-emerald-600">BNB Smart Chain (BEP20)</span>
                </div>
              )}
            </div>

            {/* Amount Input & Presets */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-1.5 ml-1 mb-1">
                <label className="text-xs font-extrabold text-slate-600 uppercase tracking-widest leading-tight">
                  {t.amount}
                </label>
                <span className="text-[10px] sm:text-[11px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full inline-block">
                  {t.minWithdrawLabel} ৳{currentMinWithdraw} {isUSDT && '(~$2)'}
                </span>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setFieldErrors(prev => ({ ...prev, amount: undefined, global: undefined }));
                }}
                min={currentMinWithdraw}
                max={availableBalance}
                placeholder={`Min ৳${currentMinWithdraw}${isUSDT ? ' (~$2)' : ''}`}
                className={`w-full rounded-xl border-2 px-4 py-3.5 text-base font-bold text-slate-900 focus:outline-none bg-slate-50 hover:bg-white transition-colors ${fieldErrors.amount ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-600'}`}
              />
              {fieldErrors.amount && (
                <div className="mt-1 flex items-start gap-1.5 text-rose-500 animate-in fade-in slide-in-from-top-1 px-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-[2px]" />
                  <p className="text-xs font-bold leading-snug">{fieldErrors.amount}</p>
                </div>
              )}
              
              {/* Quick amount presets */}
              <div className="flex gap-2 pt-2">
                {[150, 300, 500, 1000].map((val) => (
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
            {parsedAmount >= currentMinWithdraw && (
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
                    {isUSDT && (
                      <span className="text-[11px] font-bold text-amber-600 block mt-0.5">
                        ~ ${(netAmount / 120).toFixed(2)} USDT
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {fieldErrors.global && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 mb-2">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-rose-600 leading-snug">{fieldErrors.global}</p>
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

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Confirm Withdrawal</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">Please check your details carefully.</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 space-y-3 text-left">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Method</span>
                  <span className="block text-sm font-black text-slate-700">{currentMethod.name}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account</span>
                  <span className="block text-sm font-black text-slate-700">{accountNumber}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount</span>
                  <span className="block text-lg font-black text-indigo-600 font-mono">৳{netAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all flex justify-center items-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="opacity-80">Processing...</span>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirm</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};
