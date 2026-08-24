import React, { useState } from 'react';
import { useApp } from './AppContext';
import { translations } from './i18n';
import {
  ListCheck,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Wallet,
  Calendar,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { Submission, WithdrawRequest } from './types';

export const HistoryView: React.FC = () => {
  const { language, submissions, withdrawRequests, setWithdrawModalOpen, setActiveTab } = useApp();
  const t = translations[language];

  const [activeSubTab, setActiveSubTab] = useState<'sub' | 'wd'>('sub');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter Submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const subStatus = (sub.status || '').toLowerCase();
    if (filterStatus !== 'all' && subStatus !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const hasMatchingEmail = sub.gmails?.some((g) => g.email.toLowerCase().includes(q));
      return hasMatchingEmail || sub.id?.includes(q) || sub.totalAmount.toString().includes(q);
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'approved':
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3" />
            <span>{t.approved}</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
            <XCircle className="w-3 h-3" />
            <span>{t.rejected}</span>
          </span>
        );
      case 'checking':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3 animate-spin" />
            <span>{t.checking}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            <span>{t.pending}</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 space-y-4">
      {/* History Tabs Switcher */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 gap-1.5">
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
                placeholder={t.searchByEmail}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              <option value="all">{t.allReviews || 'All'}</option>
              <option value="pending">{t.pending}</option>
              <option value="checking">{t.checking || 'Checking'}</option>
              <option value="approved">{t.approved}</option>
              <option value="rejected">{t.rejected}</option>
            </select>
          </div>

          {/* Submissions List */}
          {filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
              <Layers className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-600" />
              <p className="text-xs font-bold text-slate-600">
                {t.noSubmissionHistory}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {t.noSubmissionHistorySub}
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
                          ({sub.count || sub.gmails?.length || 0} Gmails)
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

                  {/* Submission Rejection Reason if any */}
                  {(sub.rejectReason || sub.rejectionReason || sub.reason || sub.adminNote || (sub.status === 'rejected' && sub.note)) && (
                    <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-rose-800 text-[11px]">
                          {language === 'bn' ? 'বাতিলের কারণ / অ্যাডমিন নোট:' : 'Rejection Reason / Admin Note:'}
                        </span>
                        <p className="mt-0.5 leading-snug font-medium text-slate-700">
                          {sub.rejectReason || sub.rejectionReason || sub.reason || sub.adminNote || sub.note}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Expanded Individual Gmails list */}
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 animate-fade-in">
                    <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      {t.gmailListStatus}
                    </div>
                    {sub.gmails?.map((item, gIdx) => (
                      <div
                        key={gIdx}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium"
                      >
                        <span className="truncate flex-1 min-w-0 text-slate-800 font-mono text-[11px]">
                          {item.email}
                        </span>
                        <div className="shrink-0 ml-2">
                          {getStatusBadge(item.status === 'pending' || !item.status ? sub.status : item.status)}
                        </div>
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
                {t.needWithdrawCash}
              </span>
              <span className="text-[10px] text-indigo-600 font-medium">
                {t.fastPayoutMobile}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('withdraw')}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-black shadow hover:bg-indigo-700 active:scale-95"
            >
              {t.withdraw}
            </button>
          </div>

          {withdrawRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
              <Wallet className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-600" />
              <p className="text-xs font-bold text-slate-600">
                {t.noWithdrawHistory}
              </p>
            </div>
          ) : (
            withdrawRequests.map((wd, index) => {
              const dateObj = new Date(wd.requestedAt);
              const wdDate = dateObj.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
              const wdTime = dateObj.toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              });
              const wdDay = dateObj.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                weekday: 'long',
              });

              return (
                <div
                  key={wd.key || index}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
                      ৳
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-black text-slate-800 truncate">
                        ৳{wd.amount}{' '}
                        <span className="text-xs font-normal text-slate-500">
                          via {wd.paymentMethod || wd.method}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 block mt-0.5 truncate">
                        {wdTime} • {wdDate} • {wdDay}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 block mt-0.5 truncate">
                        Acc: {wd.paymentNumber}
                      </span>
                      {wd.feeAmount ? (
                        <div className="text-[10px] font-bold mt-1 text-slate-500 flex gap-2 truncate">
                          <span className="text-rose-500 shrink-0">Fee: ৳{wd.feeAmount.toFixed(2)}</span>
                          <span className="text-emerald-600 truncate">Net: ৳{(wd.netAmount || wd.amount).toFixed(2)}</span>
                        </div>
                      ) : null}
                      {wd.trxId && (
                        <div className="text-[11px] font-bold mt-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md inline-block border border-indigo-100">
                          TrxID: <span className="font-mono">{wd.trxId}</span>
                        </div>
                      )}
                      {(wd.rejectReason || wd.rejectionReason || wd.reason || wd.adminNote || (wd.status === 'rejected' && wd.transactionNote)) && (
                        <div className="mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block text-rose-800 text-[11px]">
                              {language === 'bn' ? 'বাতিলের কারণ:' : 'Rejection Reason:'}
                            </span>
                            <p className="mt-0.5 leading-snug font-medium text-slate-700">
                              {wd.rejectReason || wd.rejectionReason || wd.reason || wd.adminNote || wd.transactionNote}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">{getStatusBadge(wd.status)}</div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
