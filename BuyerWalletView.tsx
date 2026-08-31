import React from 'react';
import { useApp } from './AppContext';
import { translations } from './i18n';
import { hapticFeedback } from './haptics';
import { useUserBalance } from './useUserBalance';
import {
  Wallet,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShoppingBag,
  CreditCard,
  History,
  Sparkles,
} from 'lucide-react';

export const BuyerWalletView: React.FC = () => {
  const {
    language,
    profile,
    depositRequests,
    buyerOrders,
    setActiveTab,
    user,
    setAuthModalOpen,
    isAdmin,
    verifyBuyerDeposit,
  } = useApp();

  const isBn = language === 'bn';
  const t = translations[language];

  const { depositBalance: realTimeDepositBalance, reservedBalance: realTimeReservedBalance, loading: balanceLoading } = useUserBalance(user);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4 animate-in fade-in">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Wallet className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">
          {isBn ? 'ওয়ালেট দেখতে লগইন করুন' : 'Login to View Wallet'}
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          {isBn
            ? 'আপনার বর্তমান ব্যালেন্স, ডিপোজিট হিস্ট্রি এবং লেনদেন চেক করতে আপনার অ্যাকাউন্টে লগইন করুন।'
            : 'Please login to your account to view your balance, deposit history, and transactions.'}
        </p>
        <button
          onClick={() => setAuthModalOpen(true, 'login')}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md transition-all cursor-pointer active:scale-95"
        >
          {isBn ? 'লগইন করুন' : 'Login Now'}
        </button>
      </div>
    );
  }

  const depositBalance = Number(realTimeDepositBalance !== undefined ? realTimeDepositBalance : (profile?.deposit_balance || 0));
  const pendingOrdersSum = (buyerOrders || [])
    .filter((o) => o && o.userId === user?.uid && (o.status === 'pending' || o.status === 'processing'))
    .reduce((sum, o) => sum + (Number(o.amount || (Number(o.unitPrice || 0) * Number(o.quantity || 1))) || 0), 0);
  const lockedBalance = pendingOrdersSum > 0 ? pendingOrdersSum : Number(realTimeReservedBalance !== undefined ? realTimeReservedBalance : (profile?.reserved_balance || 0));
  const earningsBalance = profile?.balance || 0;

  // Compute summary metrics
  const totalSpent = (buyerOrders || [])
    .filter((o) => o && o.status !== 'refunded')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  const totalDeposited = (depositRequests || [])
    .filter((d) => d && d.status === 'approved')
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  const pendingDeposits = (depositRequests || [])
    .filter((d) => d && d.status === 'pending')
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6 animate-in fade-in duration-300">
      {/* Wallet Balance Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-6 sm:p-8 text-white shadow-xl border border-indigo-500/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-indigo-500/20 via-purple-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md text-amber-400 border border-white/10">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-indigo-200">
                {isBn ? 'বায়ার ওয়ালেট (Buyer Wallet)' : 'Buyer Wallet'}
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isBn ? 'সিকিউর ওয়ালেট' : 'Secure & Encrypted'}</span>
            </div>
          </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block mb-1">
                  {isBn ? 'ডিপোজিট ব্যালেন্স' : 'Deposit Balance'}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono tracking-tight">
                    ৳{Number(depositBalance).toFixed(2).split('.')[0]}
                  </span>
                  <span className="text-[10px] text-indigo-300 font-mono">
                    .{Number(depositBalance).toFixed(2).split('.')[1]}
                  </span>
                </div>
              </div>

              <div className="bg-indigo-500/10 backdrop-blur-md rounded-2xl p-4 border border-indigo-400/20">
                <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block mb-1">
                  {isBn ? 'লকড ব্যালেন্স' : 'Locked Balance'}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                    ৳{Number(lockedBalance).toFixed(2).split('.')[0]}
                  </span>
                  <span className="text-[10px] text-indigo-300 font-mono">
                    .{Number(lockedBalance).toFixed(2).split('.')[1]}
                  </span>
                </div>
              </div>
            </div>



            <div className="pt-2 flex flex-wrap items-center gap-3 mt-2">
            <button
              onClick={() => {
                hapticFeedback.medium();
                setActiveTab('buyer_deposit');
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-black text-xs shadow-lg shadow-amber-400/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isBn ? 'টাকা ডিপোজিট করুন' : 'Add Deposit'}</span>
            </button>

            <button
              onClick={() => {
                hapticFeedback.light();
                setActiveTab('buyer_market');
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 backdrop-blur-md transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-indigo-300" />
              <span>{isBn ? 'জিমেইল ক্রয় করুন' : 'Buy Gmails'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isBn ? 'মোট ডিপোজিট' : 'Total Deposited'}</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900 font-mono">
            ৳{Number(totalDeposited || 0).toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isBn ? 'অর্ডারে খরচ' : 'Total Spent'}</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900 font-mono">
            ৳{Number(totalSpent || 0).toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>{isBn ? 'পেন্ডিং ডিপোজিট' : 'Pending Deposits'}</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-amber-600 font-mono">
            ৳{Number(pendingDeposits || 0).toFixed(2)}
          </p>
        </div>
      </div>



      {/* Deposit History & Status */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm sm:text-base font-black text-slate-900">
              {isBn ? 'ডিপোজিট রিকোয়েস্ট হিস্ট্রি' : 'Recent Deposit Requests'}
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('buyer_deposit')}
            className="text-xs text-indigo-600 font-black hover:underline cursor-pointer"
          >
            {isBn ? 'নতুন ডিপোজিট +' : 'New Deposit +'}
          </button>
        </div>

        {(depositRequests || []).length === 0 ? (
          <div className="py-8 text-center text-slate-400 space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs">{isBn ? 'কোনো ডিপোজিট রিকোয়েস্ট নেই' : 'No deposit requests found'}</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {(depositRequests || []).map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900">{req.paymentMethod || req.method}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-mono text-slate-600">{req.senderNumber || req.paymentNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>TrxID: <strong className="text-slate-600 font-mono">{req.trxId}</strong></span>
                    <span>•</span>
                    <span>{new Date(req.createdAt || req.requestedAt || 0).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <span className="font-mono font-black text-slate-900 block">
                    +৳{Number(req.amount).toFixed(2)}
                  </span>
                  {req.status === 'approved' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      {isBn ? 'অনুমোদিত' : 'Approved'}
                    </span>
                  )}
                  {req.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <Clock className="w-3 h-3 animate-spin" />
                      {isBn ? 'যাচাই চলছে' : 'Pending'}
                    </span>
                  )}
                  {req.status === 'rejected' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      <AlertCircle className="w-3 h-3" />
                      {isBn ? 'বাতিল' : 'Rejected'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
