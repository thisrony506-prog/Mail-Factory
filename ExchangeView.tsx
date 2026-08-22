import React, { useState } from 'react';
import { useApp } from './AppContext';
import { translations } from './i18n';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Zap,
  Info,
} from 'lucide-react';
import { GmailType } from './types';
import { hapticFeedback } from './haptics';

interface RowState {
  id: string;
  email: string;
  password: string;
  showPass?: boolean;
  error?: string;
}

export const ExchangeView: React.FC = () => {
  const {
    language,
    setActiveTab,
    currentLevel,
    submitGmails,
    maintenanceMode,
    user,
    setAuthModalOpen,
    setRateModalOpen,
  } = useApp();

  const t = translations[language];

  const [gmailType, setGmailType] = useState<GmailType>('new');
  const [rows, setRows] = useState<RowState[]>([
    { id: '1', email: '', password: '', showPass: false },
    { id: '2', email: '', password: '', showPass: false },
  ]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ count: number; totalAmount: number } | null>(null);

  const activeRate = gmailType === 'new' ? currentLevel.rate : currentLevel.old_rate;
  const estimatedTotal = rows.length * activeRate;

  // Add row
  const handleAddRow = () => {
    hapticFeedback.light();
    setRows((prev) => [
      ...prev,
      { id: String(Date.now() + Math.random()), email: '', password: '', showPass: false },
    ]);
  };

  // Remove row
  const handleRemoveRow = (id: string) => {
    hapticFeedback.light();
    if (rows.length <= 2) {
      setGlobalError(t.minTwoGmails);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Update row
  const handleRowChange = (id: string, field: 'email' | 'password', value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value, error: undefined } : r))
    );
    setGlobalError(null);
  };

  const toggleShowPass = (id: string) => {
    hapticFeedback.light();
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, showPass: !r.showPass } : r))
    );
  };

    // Validate & Submit
  const handleValidateAndSubmit = async () => {
    hapticFeedback.medium();
    setGlobalError(null);
    setRows((prev) => prev.map((r) => ({ ...r, error: undefined })));

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (rows.length < 2) {
      hapticFeedback.error();
      setGlobalError(t.minTwoGmails);
      return;
    }

    const emailRegex = /^[a-zA-Z0-9.]+@gmail\.com$/i;
    const seenEmails = new Set<string>();
    const cleanedGmails: Array<{ email: string; password: string }> = [];
    let hasError = false;
    const newRows = [...rows];

    for (let i = 0; i < newRows.length; i++) {
      const email = newRows[i].email.trim().toLowerCase();
      const pass = newRows[i].password.trim();

      if (!email || !pass) {
        newRows[i].error = language === 'bn'
            ? 'ইমেইল বা পাসওয়ার্ড খালি রয়েছে!'
            : 'Empty email or password!';
        hasError = true;
        continue;
      }

      if (email.includes('+')) {
        newRows[i].error = language === 'bn'
            ? 'ইমেইল এলিয়াস (+) ব্যবহার করা যাবে না!'
            : 'Cannot contain email aliases (+ trick)!';
        hasError = true;
        continue;
      }
      
      if (!emailRegex.test(email)) {
        newRows[i].error = language === 'bn'
            ? 'এটি একটি বৈধ @gmail.com নয়!'
            : 'Not a valid @gmail.com!';
        hasError = true;
        continue;
      }

      if (pass.length < 6) {
        newRows[i].error = language === 'bn'
            ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!'
            : 'Password must be at least 6 characters!';
        hasError = true;
        continue;
      }

      const normalizedEmail = email.split('@')[0].replace(/\./g, '') + '@gmail.com';
      if (seenEmails.has(normalizedEmail)) {
        newRows[i].error = language === 'bn'
            ? 'এই ইমেইলটি একাধিকবার দেওয়া হয়েছে!'
            : 'Duplicate email found in the list!';
        hasError = true;
        continue;
      }

      seenEmails.add(normalizedEmail);
      cleanedGmails.push({ email, password: pass });
    }

    if (hasError) {
      hapticFeedback.error();
      setRows(newRows);
      return;
    }

    setIsSubmitting(true);

    const result = await submitGmails({
      gmails: cleanedGmails,
      type: gmailType,
      rate: activeRate,
      totalAmount: cleanedGmails.length * activeRate,
      count: cleanedGmails.length,
    });

    setIsSubmitting(false);

    if (result.success) {
      hapticFeedback.success();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // safe ignore
      }
      
      const subCount = Number(localStorage.getItem('mf_exchange_count') || 0) + 1;
      localStorage.setItem('mf_exchange_count', subCount.toString());

      const hasRated = localStorage.getItem('mf_has_rated') === '1';
      if (subCount === 3 && !hasRated) {
        setTimeout(() => {
          setRateModalOpen(true);
        }, 1500);
      }

      setSuccessData({
        count: cleanedGmails.length,
        totalAmount: cleanedGmails.length * activeRate,
      });

      // reset form
      setRows([
        { id: '1', email: '', password: '', showPass: false },
        { id: '2', email: '', password: '', showPass: false },
      ]);
    } else {
      hapticFeedback.error();
      setGlobalError(result.message || 'Submission failed.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{currentLevel.title}</span>
        </div>
      </div>

      {/* Success Modal / State */}
      {successData && (
        <div className="mb-5 p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl animate-fade-in relative overflow-hidden">
          <div className="relative z-10 text-center">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-black">
              {t.submissionSuccess}
            </h3>
            <p className="text-xs text-emerald-100 mt-1 max-w-md mx-auto">
              {t.submissionSuccessDesc}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setSuccessData(null);
                  setActiveTab('history');
                }}
                className="px-4 py-2 rounded-xl bg-white text-emerald-700 text-xs font-extrabold shadow hover:bg-emerald-50 transition-all active:scale-95"
              >
                {t.viewHistory}
              </button>
              <button
                onClick={() => setSuccessData(null)}
                className="px-4 py-2 rounded-xl bg-emerald-700/60 hover:bg-emerald-700 text-white text-xs font-bold transition-all"
              >
                {t.submitMore}
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Main Grid Layout */}
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Rate Banner */}
          <div className="rounded-2xl bg-slate-900 text-white p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10" />
            
            <div className="relative z-10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                {t.yourRate}
              </span>
              <div className="text-3xl font-black flex items-center gap-2">
                <span className="text-emerald-400">৳{activeRate}</span>
                <span className="text-sm font-semibold text-slate-500">/ Gmail</span>
              </div>
            </div>

            {/* Gmail Type Selector Pills */}
            <div className="relative z-10 flex bg-slate-800 p-1.5 rounded-xl border border-slate-700 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setGmailType('new')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  gmailType === 'new'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.newGmail}
              </button>
              <button
                type="button"
                onClick={() => setGmailType('old')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  gmailType === 'old'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.oldGmail}
              </button>
            </div>
          </div>

          {/* Dynamic Rows List */}
          <div className="space-y-3 pt-2">
            {rows.map((row, index) => {
              const isEmailValid = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(row.email.trim());
              return (
                <div
                  key={row.id}
                  className="relative bg-white rounded-xl border border-slate-200 p-3 shadow-sm transition-all hover:border-slate-300"
                >
                  {rows.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(row.id)}
                      className="absolute -top-2.5 -right-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 p-1 rounded-full shadow-sm transition-all z-10"
                      title="Remove Row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                    {/* Email Input */}
                    <div className="relative min-w-0">
                      <input
                        type="email"
                        value={row.email}
                        onChange={(e) => handleRowChange(row.id, 'email', e.target.value)}
                        placeholder="example@gmail.com"
                        className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-[14px] font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300 focus:border-slate-400 bg-white transition-all placeholder:text-slate-400"
                      />
                      {row.email && isEmailValid && (
                        <CheckCircle className="absolute right-3 top-3 w-4 h-4 text-emerald-500" />
                      )}
                    </div>

                    {/* Password Input */}
                    <div className="relative flex min-w-0">
                      <input
                        type={row.showPass ? 'text' : 'password'}
                        value={row.password}
                        onChange={(e) => handleRowChange(row.id, 'password', e.target.value)}
                        placeholder="Password"
                        className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-[14px] font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300 focus:border-slate-400 bg-white pr-10 transition-all placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowPass(row.id)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {row.showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {row.error && (
                    <div className="mt-2 flex items-start gap-1.5 text-rose-500 animate-in fade-in slide-in-from-top-1">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="text-[13px] font-medium leading-snug">{row.error}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {globalError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-rose-600">{globalError}</p>
              </div>
            )}
            

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-4">
              <button
                type="button"
                onClick={handleAddRow}
                className="w-full py-3 rounded-md bg-[#e5e7eb] hover:bg-[#d1d5db] text-[#374151] text-[15px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Plus className="w-5 h-5" />
                <span>
                  {language === 'bn' ? 'আরও যোগ করুন' : 'Add More'}
                </span>
              </button>

              <button
                type="button"
                disabled={isSubmitting || maintenanceMode}
                onClick={handleValidateAndSubmit}
                className={`w-full py-3 rounded-md font-bold text-[15px] text-white transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
                  maintenanceMode
                    ? 'bg-slate-400 cursor-not-allowed shadow-none'
                    : isSubmitting
                    ? 'bg-[#22c55e]/70 cursor-wait shadow-none'
                    : 'bg-[#22c55e] hover:bg-[#16a34a]'
                }`}
              >
                <span>
                  {isSubmitting
                    ? language === 'bn'
                      ? 'প্রসেস হচ্ছে...'
                      : 'Processing...'
                    : maintenanceMode
                    ? language === 'bn'
                      ? 'সাময়িক স্থগিত'
                      : 'Maintenance Mode'
                    : language === 'bn'
                    ? `${rows.length} টি অ্যাকাউন্ট জমা দিন`
                    : `Submit ${rows.length} Account(s)`}
                </span>
              </button>
            </div>
            
            {/* Minimal Estimated Earnings */}
            <div className="text-center pt-2 pb-4">
              <p className="text-xs text-slate-500 font-medium">
                {language === 'bn' ? 'আনুমানিক মোট:' : 'Estimated Total:'}{' '}
                <span className="font-bold text-slate-700">৳{estimatedTotal}</span>
              </p>
            </div>
          </div>
        </div>
      
    </div>
  );
};
