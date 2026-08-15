import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../lib/i18n';
import {
  ListCheck,
  Banknote,
  Flame,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Wallet,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Submission, WithdrawRequest } from '../../types';

export const HistoryView: React.FC = () => {
  const { language, submissions, withdrawRequests, allUsers, setWithdrawModalOpen } = useApp();
  const t = translations[language];

  const [activeSubTab, setActiveSubTab] = useState<'sub' | 'wd' | 'trend'>('sub');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter Submissions
  const filteredSubmissions = submissions.filter((sub) => {
    if (filterStatus !== 'all' && sub.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const hasMatchingEmail = sub.gmails?.some((g) => g.email.toLowerCase().includes(q));
      return hasMatchingEmail || sub.id?.includes(q) || sub.totalAmount.toString().includes(q);
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3" />
            <span>{language === 'bn' ? 'অনুমোদিত' : 'Approved'}</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
            <XCircle className="w-3 h-3" />
            <span>{language === 'bn' ? 'বাতিল' : 'Rejected'}</span>
          </span>
        );
      case 'checking':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3 animate-spin" />
            <span>{language === 'bn' ? 'যাচাই চলছে' : 'Checking'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            <span>{language === 'bn' ? 'পেন্ডিং' : 'Pending'}</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 space-y-4">
      {/* History Tabs Switcher */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-3 gap-1">
        <button
          onClick={() => setActiveSubTab('sub')}
          className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === 'sub'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ListCheck className="w-4 h-4" />
          <span>{t.submissions}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('wd')}
          className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === 'wd'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>{t.withdraws}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('trend')}
          className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === 'trend'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-300" />
          <span>{t.trending}</span>
        </button>
      </div>

      {/* SUBMISSIONS TAB */}
      {activeSubTab === 'sub' && (
        <div className="space-y-3 animate-fade-in">
          {/* Search & Filter Bar */}
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'bn' ? 'ইমেইল দিয়ে খুঁজুন...' : 'Search by email...'}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              <option value="all">{language === 'bn' ? 'সকল' : 'All'}</option>
              <option value="pending">{language === 'bn' ? 'পেন্ডিং' : 'Pending'}</option>
              <option value="approved">{language === 'bn' ? 'অনুমোদিত' : 'Approved'}</option>
              <option value="rejected">{language === 'bn' ? 'বাতিল' : 'Rejected'}</option>
            </select>
          </div>

          {/* Submissions List */}
          {filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
              <Layers className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-600" />
              <p className="text-xs font-bold text-slate-600">
                {language === 'bn' ? 'কোনো সাবমিশন হিস্ট্রি পাওয়া যায়নি।' : 'No submissions found.'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {language === 'bn' ? 'জিমেইল এক্সচেঞ্জ শুরু করে আয় করুন।' : 'Start selling Gmail to see activity here.'}
              </p>
            </div>
          ) : (
            filteredSubmissions.map((sub, index) => {
              const subKey = sub.key || sub.id || String(index);
              const dateFormatted = new Date(sub.submittedAt).toLocaleString('en-GB', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={subKey}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm transition-all hover:border-indigo-200"
                >
                  <div
                    className="flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-indigo-700">৳{sub.totalAmount}</span>
                        <span className="text-xs font-extrabold text-slate-600">
                          ({sub.count || sub.gmails?.length || 0} {language === 'bn' ? 'টি' : 'Gmails'})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{dateFormatted}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(sub.status)}
                    </div>
                  </div>

                  {/* Expanded Individual Gmails list */}
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 animate-fade-in">
                    <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      {language === 'bn' ? 'জিমেইল তালিকা ও স্ট্যাটাস:' : 'Gmail Accounts & Status:'}
                    </div>
                    {sub.gmails?.map((item, gIdx) => (
                      <div
                        key={gIdx}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium"
                      >
                        <span className="truncate max-w-[180px] sm:max-w-[240px] text-slate-800 font-mono text-[11px]">
                          {item.email}
                        </span>
                        <div>{getStatusBadge(item.status || sub.status)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* WITHDRAWALS TAB */}
      {activeSubTab === 'wd' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex justify-between items-center bg-indigo-50/70 p-3 rounded-2xl border border-indigo-100">
            <div>
              <span className="text-xs font-bold text-indigo-950 block">
                {language === 'bn' ? 'টাকা উত্তোলন করতে চান?' : 'Need to withdraw cash?'}
              </span>
              <span className="text-[10px] text-indigo-600 font-medium">
                {language === 'bn' ? 'bKash, Nagad, Rocket বা USDT তে তাৎক্ষণিক' : 'Fast payout to mobile wallet'}
              </span>
            </div>
            <button
              onClick={() => setWithdrawModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-black shadow hover:bg-indigo-700 active:scale-95"
            >
              {t.withdraw}
            </button>
          </div>

          {withdrawRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
              <Wallet className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-600" />
              <p className="text-xs font-bold text-slate-600">
                {language === 'bn' ? 'কোনো উইথড্র হিস্ট্রি নেই।' : 'No withdrawal records yet.'}
              </p>
            </div>
          ) : (
            withdrawRequests.map((wd, index) => {
              const wdDate = new Date(wd.requestedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={wd.key || index}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
                      ৳
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-800">
                        ৳{wd.amount}{' '}
                        <span className="text-xs font-normal text-slate-500">
                          via {wd.paymentMethod || wd.method}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 block">
                        Acc: {wd.paymentNumber} • {wdDate}
                      </span>
                    </div>
                  </div>

                  <div>{getStatusBadge(wd.status)}</div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TRENDING TAB */}
      {activeSubTab === 'trend' && (
        <div className="space-y-3 animate-fade-in">
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-3.5 rounded-2xl shadow-sm flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-200" />
            <div>
              <h4 className="text-xs font-black">
                {language === 'bn' ? 'লাইভ ট্রেন্ডিং পে-আউট ও এক্সচেঞ্জ' : 'Live Platform Payout Feed'}
              </h4>
              <p className="text-[10px] text-amber-100">
                {language === 'bn' ? 'সক্রিয় ব্যবহারকারীদের সাম্প্রতিক আয়ের রেকর্ড' : 'Real-time verified community exchanges'}
              </p>
            </div>
          </div>

          {allUsers.slice(0, 8).map((u, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center">
                  {(u.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-800 block">
                    {u.username || 'Anonymous User'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    ● Verified Seller
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-black text-indigo-700 block">
                  ৳{(Number(u.balance) || 0).toFixed(0)} BDT
                </span>
                <span className="text-[10px] text-slate-400">Total Balance</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
