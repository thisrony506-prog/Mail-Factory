import React, { useState } from 'react';
import { useApp } from './AppContext';
import { hapticFeedback } from './haptics';
import {
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  ShoppingBag,
  Plus,
} from 'lucide-react';

export const BuyerTransactionsView: React.FC = () => {
  const { language, buyerOrders, depositRequests, copyText, setActiveTab, user, setAuthModalOpen } = useApp();
  const isBn = language === 'bn';

  const [activeType, setActiveType] = useState<'all' | 'deposit' | 'purchase' | 'refund'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4 animate-in fade-in">
        <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CreditCard className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">
          {isBn ? 'ট্রানজেকশন হিস্ট্রি দেখতে লগইন করুন' : 'Login to View Transactions'}
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          {isBn
            ? 'আপনার ডিপোজিট, ক্রয়কৃত অর্ডার ও রিফান্ড সংক্রান্ত সকল ফাইন্যান্সিয়াল হিস্ট্রি দেখতে আপনার অ্যাকাউন্টে সাইন ইন করুন।'
            : 'Please login to your account to view your deposit, purchase, and refund transaction timeline.'}
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

  // Merge deposit requests and buyer orders into a clean timeline
  interface UnifiedTx {
    id: string;
    type: 'deposit' | 'purchase' | 'refund';
    title: string;
    amount: number;
    status: 'completed' | 'pending' | 'rejected';
    timestamp: number;
    meta?: string;
    trxId?: string;
  }

  const txList: UnifiedTx[] = [];

  // Add Deposits
  (depositRequests || []).forEach((dep) => {
    txList.push({
      id: dep.id || dep.key || '',
      type: 'deposit',
      title: `${isBn ? 'ডিপোজিট' : 'Deposit'} via ${dep.paymentMethod || dep.method}`,
      amount: Number(dep.amount) || 0,
      status: dep.status === 'approved' ? 'completed' : dep.status === 'pending' ? 'pending' : 'rejected',
      timestamp: dep.createdAt || dep.requestedAt || 0,
      meta: dep.senderNumber || dep.paymentNumber,
      trxId: dep.trxId,
    });
  });

  // Add Purchases & Refunds
  (buyerOrders || []).forEach((ord) => {
    if (ord.status === 'refunded') {
      txList.push({
        id: `ref_${ord.id}`,
        type: 'refund',
        title: `${isBn ? 'রিফান্ড' : 'Refund'}: ${ord.productTitle}`,
        amount: ord.amount,
        status: 'completed',
        timestamp: ord.updatedAt || ord.createdAt,
        meta: `#${(ord.id || "").slice(-6).toUpperCase()}`,
      });
    } else {
      txList.push({
        id: `ord_${ord.id}`,
        type: 'purchase',
        title: `${isBn ? 'ক্রয়' : 'Purchase'}: ${ord.productTitle} (${ord.quantity}x)`,
        amount: -ord.amount,
        status: ord.status === 'delivered' ? 'completed' : 'pending',
        timestamp: ord.createdAt,
        meta: `#${(ord.id || "").slice(-6).toUpperCase()}`,
      });
    }
  });

  // Sort descending
  txList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  const filteredTx = txList.filter((tx) => {
    if (activeType !== 'all' && tx.type !== activeType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        tx.title.toLowerCase().includes(q) ||
        (tx.trxId && tx.trxId.toLowerCase().includes(q)) ||
        (tx.meta && tx.meta.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const formatDate = (ts: number | string | undefined) => {
    if (!ts) return '';
    const d = new Date(ts);
    if (isNaN(d.getTime())) return String(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">
              {isBn ? 'লেনদেন হিস্ট্রি (Transactions)' : 'Transaction History'}
            </h1>
            <p className="text-xs text-slate-500">
              {isBn
                ? 'ডিপোজিট, জিমেইল ক্রয় ও রিফান্ডের পূর্ণাঙ্গ বিবরণী'
                : 'Complete records of your deposits, purchases & refunds'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('buyer_deposit')}
          className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isBn ? 'নতুন ডিপোজিট' : 'Deposit'}</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl overflow-x-auto scrollbar-none">
          {(['all', 'deposit', 'purchase', 'refund'] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                hapticFeedback.light();
                setActiveType(type);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black capitalize transition-all cursor-pointer whitespace-nowrap ${
                activeType === type
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {type === 'all' && (isBn ? 'সব লেনদেন' : 'All')}
              {type === 'deposit' && (isBn ? 'ডিপোজিট' : 'Deposits')}
              {type === 'purchase' && (isBn ? 'ক্রয় (Purchase)' : 'Purchases')}
              {type === 'refund' && (isBn ? 'রিফান্ড' : 'Refunds')}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'TrxID বা বিবরণ খুঁজুন...' : 'Search by TrxID or title...'}
            className="w-full pl-9 pr-3 py-2 bg-white rounded-2xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Transaction Records */}
      {filteredTx.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs space-y-3">
          <CreditCard className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="text-sm font-bold text-slate-700">
            {isBn ? 'কোনো লেনদেনের রেকর্ড পাওয়া যায়নি' : 'No transactions found'}
          </h3>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-2 sm:p-3 border border-slate-200/80 shadow-xs divide-y divide-slate-100">
          {filteredTx.map((tx) => {
            const isPositive = tx.amount > 0;
            return (
              <div key={tx.id} className="p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 rounded-2xl transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      tx.type === 'deposit'
                        ? 'bg-emerald-50 text-emerald-600'
                        : tx.type === 'purchase'
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'bg-purple-50 text-purple-600'
                    }`}
                  >
                    {tx.type === 'deposit' && <ArrowDownLeft className="w-5 h-5" />}
                    {tx.type === 'purchase' && <ShoppingBag className="w-5 h-5" />}
                    {tx.type === 'refund' && <RefreshCw className="w-5 h-5" />}
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-1">
                      {tx.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{formatDate(tx.timestamp)}</span>
                      {tx.trxId && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-slate-600 flex items-center gap-1">
                            Trx: {tx.trxId}
                            <button
                              onClick={() => copyText(tx.trxId || '', 'TrxID Copied')}
                              className="p-0.5 hover:text-slate-900"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-1 shrink-0">
                  <span
                    className={`text-sm sm:text-base font-black font-mono block ${
                      isPositive ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {isPositive ? `+৳${(tx.amount || 0).toFixed(2)}` : `-৳${(Math.abs(tx.amount || 0)).toFixed(2)}`}
                  </span>

                  <div>
                    {tx.status === 'completed' && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {isBn ? 'সফল' : 'Completed'}
                      </span>
                    )}
                    {tx.status === 'pending' && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        {isBn ? 'পেন্ডিং' : 'Pending'}
                      </span>
                    )}
                    {tx.status === 'rejected' && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                        {isBn ? 'বাতিল' : 'Rejected'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
