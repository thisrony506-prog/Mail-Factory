import React, { useState } from 'react';
import { BKASH_LOGO, NAGAD_LOGO, NAGAD_DIRECT_LOGO, USDT_LOGO } from './logoPreload';
import { useApp } from './AppContext';
import { hapticFeedback } from './haptics';
import { useUserBalance } from './useUserBalance';
import { PaymentMethodConfig } from './types';
import {
  Wallet,
  Plus,
  PlusCircle,
  Copy,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Clock,
  ArrowRight,
  ArrowLeft,
  Info,
  DollarSign,
  QrCode,
  ExternalLink,
  Check,
} from 'lucide-react';

export const BuyerDepositView: React.FC = () => {
  const {
    language,
    profile,
    user,
    paymentMethods,
    requestDeposit,
    depositRequests,
    copyText,
    setActiveTab,
    setAuthModalOpen,
  } = useApp();

  const isBn = language === 'bn';
  const { depositBalance: realTimeDepositBalance, loading: balanceLoading } = useUserBalance(user);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4 animate-in fade-in">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <PlusCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">
          {isBn ? 'ডিপোজিট করতে লগইন করুন' : 'Login to Add Funds'}
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          {isBn
            ? 'আপনার ওয়ালেটে ফান্ড যোগ করতে এবং বিকাশ/নগদ এর মাধ্যমে ডিপোজিট করতে আপনার অ্যাকাউন্টে সাইন ইন করুন।'
            : 'Please login to your account to deposit funds to your wallet via bKash, Nagad, or Crypto.'}
        </p>
        <button
          onClick={() => setAuthModalOpen(true, 'login')}
          className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition-all cursor-pointer active:scale-95"
        >
          {isBn ? 'লগইন করুন' : 'Login Now'}
        </button>
      </div>
    );
  }

  // Step state: 1 = Choose Amount & Method, 2 = Payment Instructions & Verify
  const [step, setStep] = useState<1 | 2>(1);

  // Extract active payment methods matching WithdrawView
  const methodsArray = (Object.entries(paymentMethods || {}) as [string, PaymentMethodConfig][]).filter(
    ([_, m]) => m && m.active
  );

  const getMethodType = (key: string, name: string) => {
    const lowerKey = key.toLowerCase();
    const lowerName = name.toLowerCase();
    if (lowerKey.includes('bkash') || lowerName.includes('bkash')) return 'bkash';
    if (
      lowerKey.includes('nagad') ||
      lowerKey.includes('nogod') ||
      lowerName.includes('nagad') ||
      lowerName.includes('nogod') ||
      lowerName.includes('নগদ')
    )
      return 'nagad';
    if (lowerKey.includes('rocket') || lowerName.includes('rocket')) return 'rocket';
    if (
      lowerKey.includes('usdt') ||
      lowerKey.includes('binance') ||
      lowerName.includes('usdt') ||
      lowerName.includes('binance')
    )
      return 'usdt';
    return 'default';
  };

  const paymentChannelDetails: Record<
    string,
    {
      brandName: string;
      number: string;
      ussdCode: string;
      type: string;
      typeBn: string;
      minAmount: number;
      accountLabelBn: string;
      accountLabelEn: string;
      accountPlaceholder: string;
      trxLabelBn: string;
      trxLabelEn: string;
      trxPlaceholder: string;
    }
  > = {
    bkash: {
      brandName: 'BKASH',
      number: '01964182265',
      ussdCode: '*247#',
      type: 'Personal (Send Money)',
      typeBn: 'ব্যক্তিগত (সেন্ড মানি)',
      minAmount: 50,
      accountLabelBn: 'আপনার বিকাশ মোবাইল নম্বর (যেখান থেকে টাকা পাঠিয়েছেন):',
      accountLabelEn: 'Your bKash Sender Number:',
      accountPlaceholder: '01XXXXXXXXX',
      trxLabelBn: 'ট্রান্সজেকশন আইডি দিন (Transaction ID / TrxID):',
      trxLabelEn: 'Enter Transaction ID (TrxID):',
      trxPlaceholder: 'e.g. BL92K8X1PQ',
    },
    nagad: {
      brandName: 'NAGAD',
      number: '01964182265',
      ussdCode: '*167#',
      type: 'Personal (Send Money)',
      typeBn: 'ব্যক্তিগত (সেন্ড মানি)',
      minAmount: 50,
      accountLabelBn: 'আপনার নগদ মোবাইল নম্বর (যেখান থেকে টাকা পাঠিয়েছেন):',
      accountLabelEn: 'Your Nagad Sender Number:',
      accountPlaceholder: '01XXXXXXXXX',
      trxLabelBn: 'ট্রান্সজেকশন আইডি দিন (Transaction ID / TrxID):',
      trxLabelEn: 'Enter Transaction ID (TrxID):',
      trxPlaceholder: 'e.g. 7M2N9Q3P',
    },
    rocket: {
      brandName: 'ROCKET',
      number: '01964182265',
      ussdCode: '*322#',
      type: 'Personal (Send Money)',
      typeBn: 'ব্যক্তিগত (সেন্ড মানি)',
      minAmount: 50,
      accountLabelBn: 'আপনার রকেট মোবাইল নম্বর (১২ ডিজিট):',
      accountLabelEn: 'Your Rocket Sender Number (12 digits):',
      accountPlaceholder: '01XXXXXXXXXX',
      trxLabelBn: 'ট্রান্সজেকশন আইডি দিন (Transaction ID / TrxID):',
      trxLabelEn: 'Enter Transaction ID (TrxID):',
      trxPlaceholder: 'e.g. 98234710',
    },
    usdt: {
      brandName: 'USDT',
      number: '0x3563458F696616D199fa688198fA01103A899dEB',
      ussdCode: 'BEP-20',
      type: 'USDT / BEP-20 (Binance Smart Chain)',
      typeBn: 'ইউএসডিটি (BEP-20 / Binance)',
      minAmount: 120, // ~1 USD
      accountLabelBn: 'আপনার প্রেরক ওয়ালেট এড্রেস বা Binance Pay ID:',
      accountLabelEn: 'Your Sender Wallet Address / Binance Pay ID:',
      accountPlaceholder: '0x... or Binance Pay ID',
      trxLabelBn: 'ট্রান্সজেকশন আইডি দিন (TxID / Blockchain Hash):',
      trxLabelEn: 'Enter Transaction ID (TxID / Hash):',
      trxPlaceholder: '0x3a9f8...',
    },
  };

  const renderBrandIcon = (type: string) => {
    if (type === 'bkash') {
      return (
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#E2136E] flex items-center justify-center shadow-md relative overflow-hidden ring-2 ring-pink-500/30 shrink-0 p-0.5">
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
            <svg viewBox="0 0 512 512" className="w-5 h-5 sm:w-7 sm:h-7 text-white fill-current">
              <path d="M380 120L256 50L100 170L70 310L190 230L256 350L350 190L430 210L380 120Z" />
              <path d="M100 170L256 230L190 440L70 310L100 170Z" opacity="0.95" />
            </svg>
          </div>
        </div>
      );
    }
    if (type === 'nagad') {
      return (
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white flex items-center justify-center shadow-md relative overflow-hidden ring-2 ring-red-500/30 shrink-0 p-0.5">
          <img
            src={NAGAD_DIRECT_LOGO}
            alt="Nagad"
            className="w-full h-full object-cover rounded-xl relative z-10 bg-white"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = NAGAD_LOGO;
            }}
          />
        </div>
      );
    }
    if (type === 'rocket') {
      return (
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#8C3494] flex flex-col items-center justify-center shadow-md relative overflow-hidden ring-2 ring-purple-500/30 p-1 shrink-0 text-white font-black">
          <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-current">
            <path d="M12 2L2 7l10 5 10-5-10-5M2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="text-[6px] sm:text-[8px] font-bold uppercase tracking-tighter">Rocket</span>
        </div>
      );
    }
    if (type === 'usdt') {
      return (
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#26A17B] flex items-center justify-center shadow-md relative overflow-hidden ring-2 ring-emerald-500/30 shrink-0 p-0.5">
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
            <svg viewBox="0 0 100 100" className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-current">
              <rect x="25" y="24" width="50" height="12" rx="3" />
              <rect x="44" y="36" width="12" height="38" rx="3" />
              <ellipse cx="50" cy="55" rx="22" ry="7" fill="none" stroke="currentColor" strokeWidth="5" />
            </svg>
          </div>
        </div>
      );
    }
    return (
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-md shrink-0">
        Pay
      </div>
    );
  };

  const [selectedKey, setSelectedKey] = useState<string>(() => {
    return methodsArray[0]?.[0] || 'bkash';
  });

  const selectedMethodConfig = paymentMethods[selectedKey] || {
    name: selectedKey.toUpperCase(),
    color: '#E2136E',
    active: true,
  };

  const selectedType = getMethodType(selectedKey, selectedMethodConfig.name);
  const currentChannel = paymentChannelDetails[selectedType] || paymentChannelDetails.bkash;

  const [amount, setAmount] = useState<string>('100');
  const [senderNumber, setSenderNumber] = useState<string>('');
  const [trxId, setTrxId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successSubmitted, setSuccessSubmitted] = useState<boolean>(false);
  const [copiedNumber, setCopiedNumber] = useState<boolean>(false);

  const presetAmounts = [50, 100, 200, 500, 1000, 2000];

  // Real-time TrxID Analysis & Anti-Fake Detection
  const cleanTrx = trxId.trim().toUpperCase().replace(/\s+/g, '');
  const isTrxDuplicate = Boolean(
    cleanTrx && depositRequests.some((d) => d.trxId && d.trxId.trim().toUpperCase() === cleanTrx)
  );

  const getTrxValidationError = (): string | null => {
    if (!cleanTrx) return null;
    if (cleanTrx.length < 6) return isBn ? 'TrxID কমপক্ষে ৬ অক্ষরের হতে হবে' : 'TrxID must be at least 6 characters';
    if (!/^[A-Z0-9]+$/.test(cleanTrx)) return isBn ? 'TrxID শুধুমাত্র ইংরেজি বর্ণ ও সংখ্যা হতে পারে' : 'TrxID must be alphanumeric';
    if (/^(.)\1+$/.test(cleanTrx)) return isBn ? 'ভুয়া TrxID গ্রহণযোগ্য নয়' : 'Invalid fake pattern';
    const dummyPatterns = [
      '12345678', '123456789', '1234567890', '012345678', '987654321', '87654321',
      'ABCDEFGH', 'ASDFGHJK', 'QWERTYUI', 'TEST1234', 'DEMO1234', 'SAMPLE12',
      'FAKE1234', 'BKASH123', 'NAGAD123', 'TRXID123', 'PAYMENT1', 'NOTHING1',
      'PENDING1', 'MYTRXID1', '00000000', '11111111', '22222222', '33333333'
    ];
    if (dummyPatterns.some((p) => cleanTrx.includes(p))) {
      return isBn ? 'ভুয়া বা ডামি TrxID গ্রহণযোগ্য নয়' : 'Dummy/fake TrxID detected';
    }
    const uniqueChars = new Set(cleanTrx.split(''));
    if (uniqueChars.size < 3) {
      return isBn ? 'অগ্রহণযোগ্য TrxID প্যাটার্ন' : 'Repetitive invalid pattern';
    }
    if (isTrxDuplicate) {
      return isBn ? 'এই TrxID টি ইতিমধ্যে ব্যবহৃত হয়েছে!' : 'This TrxID is already used!';
    }
    return null;
  };

  const trxError = getTrxValidationError();
  const isTrxValid = cleanTrx.length >= 6 && !trxError;

  // Real-time Sender Number Validation
  let cleanSender = senderNumber.trim().replace(/[\s\-\+]/g, '');
  if (cleanSender.startsWith('880')) cleanSender = '0' + cleanSender.substring(3);
  const isBDMethod = ['bkash', 'nagad', 'rocket', 'upay', 'cellfin'].some((m) =>
    selectedKey.toLowerCase().includes(m) || selectedMethodConfig.name.toLowerCase().includes(m)
  );
  const isSenderValid = !cleanSender
    ? false
    : isBDMethod
    ? /^01[3-9]\d{8}$/.test(cleanSender)
    : cleanSender.length >= 5;

  const userPendingCount = depositRequests.filter((d) => d.userId === user?.uid && d.status === 'pending').length;

  const handleCopyNumber = () => {
    hapticFeedback.light();
    copyText(currentChannel.number, isBn ? 'নাম্বার কপি করা হয়েছে!' : 'Number copied!');
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleProceedToPayment = () => {
    hapticFeedback.medium();
    const numAmount = parseFloat(amount);
    if (!numAmount || isNaN(numAmount) || numAmount < currentChannel.minAmount) {
      setErrorMsg(
        isBn
          ? `সর্বনিম্ন ডিপোজিট পরিমাণ ৳${currentChannel.minAmount}`
          : `Minimum deposit amount is ৳${currentChannel.minAmount}`
      );
      return;
    }
    if (numAmount > 50000) {
      setErrorMsg(
        isBn ? 'একবারে সর্বোচ্চ ডিপোজিট পরিমাণ ৳৫০,০০০' : 'Maximum single deposit amount is ৳50,000'
      );
      return;
    }
    setErrorMsg(null);
    setStep(2);
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    const numAmount = parseFloat(amount);
    if (!numAmount || isNaN(numAmount) || numAmount < currentChannel.minAmount) {
      setErrorMsg(
        isBn
          ? `সর্বনিম্ন ডিপোজিট পরিমাণ ৳${currentChannel.minAmount}`
          : `Minimum deposit amount is ৳${currentChannel.minAmount}`
      );
      return;
    }

    if (numAmount > 50000) {
      setErrorMsg(
        isBn ? 'একবারে সর্বোচ্চ ডিপোজিট পরিমাণ ৳৫০,০০০' : 'Maximum single deposit amount is ৳50,000'
      );
      return;
    }

    if (userPendingCount >= 3) {
      setErrorMsg(
        isBn
          ? 'আপনার ইতিমধ্যে ৩টি ডিপোজিট রিকোয়েস্ট পেন্ডিং আছে। অ্যাডমিন অনুমোদন দেওয়া পর্যন্ত অপেক্ষা করুন।'
          : 'You already have 3 pending deposits. Please wait for admin review.'
      );
      return;
    }

    if (!cleanSender || !isSenderValid) {
      setErrorMsg(
        isBn
          ? isBDMethod
            ? 'সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)'
            : `${selectedMethodConfig.name} এর সঠিক প্রেরক একাউন্ট বা নম্বর দিন`
          : `Please provide a valid ${selectedMethodConfig.name} sender number`
      );
      return;
    }

    if (!cleanTrx || !isTrxValid || trxError) {
      setErrorMsg(trxError || (isBn ? 'সঠিক ও আসল Transaction ID (TrxID) প্রদান করুন' : 'Please provide a valid genuine TrxID'));
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    hapticFeedback.heavy();

    try {
      const res = await requestDeposit({
        amount: numAmount,
        method: selectedMethodConfig.name,
        paymentNumber: cleanSender,
        trxId: cleanTrx,
      });

      if (res.success) {
        setSuccessSubmitted(true);
        setSenderNumber('');
        setTrxId('');
      } else {
        setErrorMsg(res.message || (isBn ? 'ডিপোজিট রিকোয়েস্ট ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।' : 'Deposit request failed. Please try again.'));
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error submitting deposit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-5 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex items-center justify-between gap-4 border border-indigo-900/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-indigo-500/20 text-amber-400 border border-indigo-400/20">
              <Plus className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {isBn ? 'ডিপোজিট করুন' : 'Deposit Funds'}
            </h1>
          </div>
          <p className="text-xs text-indigo-200/90 font-medium">
            {isBn
              ? 'বিকাশ, নগদ, রকেট এবং ক্রিপ্টোর মাধ্যমে সহজে ব্যালেন্স যোগ করুন'
              : 'Add funds securely via bKash, Nagad, Rocket, or USDT'}
          </p>
        </div>

        <div className="text-right hidden sm:block bg-white/5 px-4 py-2.5 rounded-2xl border border-white/10 backdrop-blur-xs">
          <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">
            {isBn ? 'ফান্ড যোগ করুন' : 'Add Funds'}
          </span>
          <span className="text-xl font-black text-amber-300 font-mono">
            ৳{balanceLoading ? "..." : Number(realTimeDepositBalance || profile?.deposit_balance || 0).toFixed(2)}
          </span>
        </div>
      </div>



      {/* Step Indicator */}
      <div className="flex items-center justify-between px-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            if (step === 2) {
              hapticFeedback.light();
              setStep(1);
              setErrorMsg(null);
            }
          }}
          className={`flex items-center gap-2 transition-all cursor-pointer ${
            step === 1 ? 'text-indigo-600 font-black' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step === 1 ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-200 text-slate-700'
            }`}
          >
            ১
          </span>
          <span>{isBn ? 'পরিমাণ ও মেথড' : 'Amount & Method'}</span>
        </button>

        <div className="h-0.5 flex-1 mx-3 bg-slate-200 relative">
          <div
            className={`h-full bg-indigo-600 transition-all duration-300 ${
              step === 2 ? 'w-full' : 'w-0'
            }`}
          />
        </div>

        <div
          className={`flex items-center gap-2 ${
            step === 2 ? 'text-indigo-600 font-black' : 'text-slate-400'
          }`}
        >
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step === 2 ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500'
            }`}
          >
            ২
          </span>
          <span>{isBn ? 'নির্দেশনা ও ভেরিফাই' : 'Instructions & Verify'}</span>
        </div>
      </div>

      {/* STEP 1: SELECT AMOUNT & PAYMENT METHOD */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Payment Method Selector Tabs */}
          <div className="space-y-2.5">
            <label className="text-xs font-black text-slate-800 flex items-center justify-between">
              <span>{isBn ? 'পেমেন্ট মেথড নির্বাচন করুন:' : 'Select Payment Method:'}</span>
              <span className="text-[11px] text-indigo-600 font-medium">
                {selectedMethodConfig.name}
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {methodsArray.map(([key, config]) => {
                const isSel = selectedKey === key;
                const type = getMethodType(key, config.name);
                const ch = paymentChannelDetails[type] || paymentChannelDetails.bkash;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      hapticFeedback.light();
                      setSelectedKey(key);
                      setErrorMsg(null);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 relative ${
                      isSel
                        ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                        : 'bg-slate-50/80 border-slate-200 hover:bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {renderBrandIcon(type)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 truncate block">
                          {config.name}
                        </span>
                        {isSel && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium block truncate">
                        {isBn ? ch.typeBn : ch.type}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preset Amount Chips */}
          <div className="space-y-2.5">
            <label className="text-xs font-black text-slate-800 block">
              {isBn ? 'টাকার পরিমাণ নির্বাচন করুন:' : 'Select Deposit Amount (BDT):'}
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {presetAmounts.map((amt) => {
                const isSel = amount === String(amt);
                return (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => {
                      hapticFeedback.light();
                      setAmount(String(amt));
                      setErrorMsg(null);
                    }}
                    className={`py-2.5 px-2 rounded-2xl text-xs font-black font-mono transition-all cursor-pointer border text-center ${
                      isSel
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-500/20'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ৳{amt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {isBn ? 'অথবা কাস্টম পরিমাণ লিখুন (৳):' : 'Or Enter Custom Amount (৳):'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 font-mono text-base">
                ৳
              </span>
              <input
                type="number"
                min={currentChannel.minAmount}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="100"
                required
                className="w-full pl-9 pr-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-mono font-black focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
              <span>
                {isBn
                  ? `সর্বনিম্ন ডিপোজিট: ৳${currentChannel.minAmount}`
                  : `Minimum deposit: ৳${currentChannel.minAmount}`}
              </span>
              {selectedType === 'usdt' && (
                <span className="font-mono text-emerald-600 font-bold">
                  ≈ {Number(parseFloat(amount || "0") / 120).toFixed(2)} USDT (১$ = ১২০৳)
                </span>
              )}
            </div>
          </div>

          {/* Continue Button */}
          <button
            type="button"
            onClick={handleProceedToPayment}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md shadow-indigo-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isBn ? 'পেমেন্ট নির্দেশিকায় যান' : 'Proceed to Payment Instructions'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: INSTRUCTIONS & VERIFY FORM */}
      {step === 2 && (
        <div className="space-y-5 animate-in fade-in">
          {/* Header Summary & Back button */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                hapticFeedback.light();
                setStep(1);
                setErrorMsg(null);
              }}
              className="flex items-center gap-1.5 text-xs font-black text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer py-1.5 px-2.5 rounded-xl hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isBn ? 'পরিমাণ পরিবর্তন' : 'Change Amount'}</span>
            </button>

            <div className="flex items-center gap-3">
              {renderBrandIcon(selectedType)}
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isBn ? 'টাকার পরিমাণ' : 'Amount'}
                </span>
                <span className="text-lg sm:text-xl font-black text-indigo-600 font-mono">
                  ৳{amount}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Form with Transaction ID Box at Top */}
          <form
            onSubmit={handleSubmitDeposit}
            className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isBn ? 'ট্রান্সজেকশন আইডি দিন' : 'Enter Transaction ID'}</span>
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono">
                {selectedMethodConfig.name}
              </span>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{errorMsg}</span>
              </div>
            )}

            {/* Input 1: Transaction ID (TrxID) Box with Live Status */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1">
                  <span>{isBn ? currentChannel.trxLabelBn : currentChannel.trxLabelEn}</span>
                  <span className="text-[10px] text-rose-500 font-bold">*প্রয়োজনীয়</span>
                </label>
                {cleanTrx && (
                  <div className="text-[11px] font-bold">
                    {trxError ? (
                      <span className="text-rose-600 flex items-center gap-1 font-sans">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {trxError}
                      </span>
                    ) : (
                      <span className="text-emerald-600 flex items-center gap-1 font-sans">
                        <Check className="w-3.5 h-3.5" />
                        {isBn ? 'সঠিক ফরম্যাট' : 'Valid Format'}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <input
                type="text"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                placeholder={currentChannel.trxPlaceholder}
                required
                className={`w-full px-4 py-3 bg-slate-50 rounded-2xl border-2 text-sm font-mono font-black uppercase tracking-wider focus:outline-hidden transition-all shadow-2xs ${
                  trxError
                    ? 'border-rose-300 focus:border-rose-500 focus:bg-rose-50/20'
                    : isTrxValid
                    ? 'border-emerald-300 focus:border-emerald-500 focus:bg-emerald-50/20'
                    : 'border-indigo-200 focus:border-indigo-600 focus:bg-white'
                }`}
              />
              <p className="text-[10px] text-slate-400 font-medium">
                {isBn
                  ? '⚠️ বিকাশ/নগদ এসএমএস বা অ্যাপের আসল TrxID দিন। ভুল বা নকল TrxID দেওয়া নিষিদ্ধ।'
                  : 'Enter the exact TrxID from your SMS or Mobile App receipt.'}
              </p>
            </div>

            {/* Input 2: Sender Number / Wallet Address */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1">
                  <span>{isBn ? currentChannel.accountLabelBn : currentChannel.accountLabelEn}</span>
                  <span className="text-[10px] text-rose-500 font-bold">*প্রয়োজনীয়</span>
                </label>
                {cleanSender && (
                  <div className="text-[11px] font-bold">
                    {isSenderValid ? (
                      <span className="text-emerald-600 flex items-center gap-1 font-sans">
                        <Check className="w-3.5 h-3.5" />
                        {isBn ? 'বৈধ নম্বর' : 'Valid Number'}
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1 font-sans">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {isBn ? '১১ ডিজিট দিন' : '11-digit required'}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <input
                type="text"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value.replace(/[\s\-]/g, ''))}
                placeholder={currentChannel.accountPlaceholder}
                required
                className={`w-full px-4 py-3 bg-slate-50 rounded-2xl border text-xs font-mono font-bold focus:outline-hidden transition-all ${
                  isSenderValid
                    ? 'border-emerald-300 focus:border-emerald-500 focus:bg-emerald-50/20'
                    : 'border-slate-200 focus:border-indigo-500 focus:bg-white'
                }`}
              />
            </div>

            {/* STEP-BY-STEP PAYMENT INSTRUCTIONS */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-600" />
                  <span>
                    {isBn
                      ? `${selectedMethodConfig.name} পেমেন্ট মেথড নির্দেশনা:`
                      : `${selectedMethodConfig.name} Payment Instructions:`}
                  </span>
                </span>
              </div>

              {/* bKash Instructions format */}
              {selectedType === 'bkash' && (
                <div className="space-y-2.5 text-xs text-slate-800 leading-relaxed font-medium">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ১
                    </span>
                    <p>
                      <strong className="text-pink-700 font-bold">*247#</strong> ডায়াল করে আপনার{' '}
                      <strong>BKASH</strong> মোবাইল মেনুতে যান অথবা <strong>BKASH</strong> অ্যাপে যান।
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ২
                    </span>
                    <p>
                      <strong>"Send Money"</strong> -এ ক্লিক করুন।
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ৩
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <span>প্রাপক নম্বর হিসেবে এই নম্বরটি লিখুনঃ</span>
                      <span className="font-mono font-black text-sm text-slate-900 bg-pink-50 px-2 py-0.5 rounded-lg border border-pink-200">
                        {currentChannel.number}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyNumber}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-black cursor-pointer active:scale-95 transition-all shadow-2xs"
                      >
                        {copiedNumber ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>কপি হয়েছে</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ৪
                    </span>
                    <p>
                      টাকার পরিমাণঃ{' '}
                      <strong className="font-mono text-pink-700 text-sm font-black">
                        ৳{amount}
                      </strong>
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ৫
                    </span>
                    <p>
                      নিশ্চিত করতে এখন আপনার <strong>BKASH</strong> মোবাইল মেনু পিন লিখুন।
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ৬
                    </span>
                    <p>
                      সবকিছু ঠিক থাকলে, আপনি <strong>BKASH</strong> থেকে একটি নিশ্চিতকরণ বার্তা পাবেন।
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ৭
                    </span>
                    <p>
                      এখন উপরের বক্সে আপনার <strong>Transaction ID</strong> দিন এবং নিচের{' '}
                      <strong className="text-indigo-600 font-black">VERIFY</strong> বাটনে ক্লিক করুন।
                    </p>
                  </div>
                </div>
              )}

              {/* Nagad Instructions format */}
              {selectedType === 'nagad' && (
                <div className="space-y-2.5 text-xs text-slate-800 leading-relaxed font-medium">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ১
                    </span>
                    <p>
                      <strong className="text-orange-700 font-bold">*167#</strong> ডায়াল করে আপনার{' '}
                      <strong>NAGAD</strong> মোবাইল মেনুতে যান অথবা <strong>NAGAD</strong> অ্যাপে যান।
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ২
                    </span>
                    <p>
                      <strong>"Send Money"</strong> -এ ক্লিক করুন।
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ৩
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <span>প্রাপক নম্বর হিসেবে এই নম্বরটি লিখুনঃ</span>
                      <span className="font-mono font-black text-sm text-slate-900 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200">
                        {currentChannel.number}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyNumber}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-black cursor-pointer active:scale-95 transition-all shadow-2xs"
                      >
                        {copiedNumber ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>কপি হয়েছে</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ৪
                    </span>
                    <p>
                      টাকার পরিমাণঃ{' '}
                      <strong className="font-mono text-orange-700 text-sm font-black">
                        ৳{amount}
                      </strong>
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ৫
                    </span>
                    <p>
                      নিশ্চিত করতে এখন আপনার <strong>NAGAD</strong> মোবাইল মেনু পিন লিখুন।
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ৬
                    </span>
                    <p>
                      সবকিছু ঠিক থাকলে, আপনি <strong>NAGAD</strong> থেকে একটি নিশ্চিতকরণ বার্তা পাবেন।
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ৭
                    </span>
                    <p>
                      এখন উপরের বক্সে আপনার <strong>Transaction ID</strong> দিন এবং নিচের{' '}
                      <strong className="text-indigo-600 font-black">VERIFY</strong> বাটনে ক্লিক করুন।
                    </p>
                  </div>
                </div>
              )}

              {/* Rocket Instructions format */}
              {selectedType === 'rocket' && (
                <div className="space-y-2.5 text-xs text-slate-800 leading-relaxed font-medium">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ১
                    </span>
                    <p>
                      <strong className="text-purple-700 font-bold">*322#</strong> ডায়াল করে আপনার{' '}
                      <strong>ROCKET</strong> মোবাইল মেনুতে যান অথবা <strong>ROCKET</strong> অ্যাপে যান।
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ২
                    </span>
                    <p>
                      <strong>"Send Money"</strong> -এ ক্লিক করুন।
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ৩
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <span>প্রাপক নম্বর হিসেবে এই নম্বরটি লিখুনঃ</span>
                      <span className="font-mono font-black text-sm text-slate-900 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
                        {currentChannel.number}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyNumber}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-black cursor-pointer active:scale-95 transition-all shadow-2xs"
                      >
                        {copiedNumber ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>কপি হয়েছে</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ৪
                    </span>
                    <p>
                      টাকার পরিমাণঃ{' '}
                      <strong className="font-mono text-purple-700 text-sm font-black">
                        ৳{amount}
                      </strong>
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ৫
                    </span>
                    <p>
                      নিশ্চিত করতে এখন আপনার <strong>ROCKET</strong> মোবাইল মেনু পিন লিখুন।
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ৬
                    </span>
                    <p>
                      সবকিছু ঠিক থাকলে, আপনি <strong>ROCKET</strong> থেকে একটি নিশ্চিতকরণ বার্তা পাবেন।
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ৭
                    </span>
                    <p>
                      এখন উপরের বক্সে আপনার <strong>Transaction ID</strong> দিন এবং নিচের{' '}
                      <strong className="text-indigo-600 font-black">VERIFY</strong> বাটনে ক্লিক করুন।
                    </p>
                  </div>
                </div>
              )}

              {/* USDT Instructions format */}
              {selectedType === 'usdt' && (
                <div className="space-y-2.5 text-xs text-slate-800 leading-relaxed font-medium">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ১
                    </span>
                    <p>
                      Binance বা যেকোনো Web3 ওয়ালেট থেকে <strong>BEP-20 (BSC)</strong> নেটওয়ার্কে USDT ট্রান্সফার করুন।
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ২
                    </span>
                    <div className="flex flex-col gap-1 w-full">
                      <span>প্রাপক এড্রেস হিসেবে এই এড্রেসটি লিখুনঃ</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[11px] text-slate-900 bg-emerald-50 p-1.5 rounded-lg border border-emerald-200 break-all select-all flex-1">
                          {currentChannel.number}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyNumber}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black cursor-pointer active:scale-95 transition-all shadow-2xs shrink-0"
                        >
                          {copiedNumber ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>কপি হয়েছে</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ৩
                    </span>
                    <p>
                      টাকার পরিমাণঃ{' '}
                      <strong className="font-mono text-emerald-700 text-sm font-black">
                        ৳{amount}
                      </strong>{' '}
                      (≈ {Number(parseFloat(amount || "0") / 120).toFixed(2)} USDT)
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ৪
                    </span>
                    <p>
                      ট্রান্সফার নিশ্চিত করে Blockchain TxID / Transaction Hash সংগ্রহ করুন।
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ৫
                    </span>
                    <p>
                      এখন উপরের বক্সে আপনার <strong>TxID / Hash</strong> দিন এবং নিচের{' '}
                      <strong className="text-indigo-600 font-black">VERIFY</strong> বাটনে ক্লিক করুন।
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Security & Anti-Fraud Policy Box */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-[11px] text-amber-800">
                  {isBn ? 'নিরাপত্তা ও অ্যান্টি-ফ্রড নির্দেশিকা:' : 'Security & Anti-Fraud Policy:'}
                </p>
                <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                  {isBn
                    ? 'আসল পেমেন্টের TrxID প্রদান করুন। একই TrxID বারবার দেওয়া বা কোনো প্রকার ভুল/ভুয়া TrxID সাবমিট করা সম্পূর্ণ নিষিদ্ধ। অসদুপায় অবলম্বন করলে অ্যাকাউন্ট স্থায়ীভাবে ব্যান হবে।'
                    : 'Provide the genuine TrxID from your payment. Submitting duplicate or fake TrxIDs is strictly prohibited and will result in an immediate account ban.'}
                </p>
              </div>
            </div>

            {/* Pending Requests Notice */}
            {userPendingCount >= 3 && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold text-[11px]">
                  {isBn
                    ? 'আপনার ইতিমধ্যে ৩টি ডিপোজিট রিকোয়েস্ট পেন্ডিং রয়েছে। নতুন রিকোয়েস্ট পাঠানোর আগে আগেরগুলো সম্পন্ন হতে হবে।'
                    : 'You already have 3 pending deposits. Please wait for them to be processed.'}
                </span>
              </div>
            )}

            {/* Big Prominent VERIFY Button */}
            <button
              type="submit"
              disabled={isSubmitting || userPendingCount >= 3 || !isTrxValid || !isSenderValid}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm sm:text-base shadow-lg shadow-indigo-600/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed tracking-wider"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>VERIFY</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Success Modal */}
      {successSubmitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
            onClick={() => setSuccessSubmitted(false)}
          />
          <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {isBn ? 'ডিপোজিট রিকোয়েস্ট গৃহীত হয়েছে! 🎉' : 'Deposit Request Submitted! 🎉'}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {isBn
                  ? 'আমাদের সার্ভার ও অটোমেশন সিস্টেম আপনার TrxID যাচাই করছে। সর্বোচ্চ ১-১০ মিনিটের মধ্যে আপনার ওয়ালেটে ব্যালেন্স জমা হয়ে যাবে।'
                  : 'Our system is verifying your transaction. Your balance will be credited within 1-10 minutes.'}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSuccessSubmitted(false);
                  setActiveTab('buyer_wallet');
                }}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <Wallet className="w-4 h-4" />
                <span>{isBn ? 'ওয়ালেট ব্যালেন্স দেখুন' : 'View My Wallet'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSuccessSubmitted(false);
                  setActiveTab('buyer_market');
                }}
                className="w-full py-2.5 rounded-2xl text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {isBn ? 'মার্কেটপ্লেসে ফিরে যান' : 'Back to Marketplace'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
