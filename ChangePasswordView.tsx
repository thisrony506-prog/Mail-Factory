import React, { useState, useMemo } from 'react';
import { useApp } from './AppContext';
import { auth, sendPasswordResetEmail, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from './firebase';
import { hapticFeedback } from './haptics';
import {
  Key,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Mail,
  Lock,
  RefreshCw,
  Check,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

export const ChangePasswordView: React.FC = () => {
  const { user, profile, language, setActiveTab } = useApp();

  const [currentPass, setCurrentPass] = useState<string>('');
  const [newPass, setNewPass] = useState<string>('');
  const [confirmPass, setConfirmPass] = useState<string>('');

  const [showCurrent, setShowCurrent] = useState<boolean>(false);
  const [showNew, setShowNew] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isSendingReset, setIsSendingReset] = useState<boolean>(false);
  const [resetSent, setResetSent] = useState<boolean>(false);
  const [resetCooldown, setResetCooldown] = useState<number>(0);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Password Requirements Analysis
  const passAnalysis = useMemo(() => {
    const hasMinLength = newPass.length >= 6;
    const hasNumber = /\d/.exec(newPass) !== null;
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.exec(newPass) !== null;
    const isMatch = newPass.length > 0 && newPass === confirmPass;

    let score = 0;
    if (hasMinLength) score += 33;
    if (hasNumber) score += 33;
    if (hasSpecial) score += 34;

    return {
      hasMinLength,
      hasNumber,
      hasSpecial,
      isMatch,
      score,
    };
  }, [newPass, confirmPass]);

  // Handle direct password update via Firebase
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    hapticFeedback.medium();
    setError(null);
    setSuccess(null);

    if (!user || !user.email) {
      setError(language === 'bn' ? 'ব্যবহারকারী সেশন পাওয়া যায়নি।' : 'User session not found.');
      return;
    }

    if (!currentPass) {
      setError(language === 'bn' ? 'বর্তমান পাসওয়ার্ড লিখুন।' : 'Enter current password.');
      return;
    }

    if (!passAnalysis.hasMinLength) {
      setError(language === 'bn' ? 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'New password must be at least 6 characters.');
      return;
    }

    if (!passAnalysis.isMatch) {
      setError(language === 'bn' ? 'নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।' : 'Passwords do not match.');
      return;
    }

    setIsUpdating(true);

    try {
      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(user.email, currentPass);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPass);

      setSuccess(
        language === 'bn'
          ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!'
          : 'Password updated successfully!'
      );
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err: any) {
      const code = err?.code || '';
      const errMsg = (err?.message || '').toLowerCase();
      const isInvalidCred =
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-credential' ||
        errMsg.includes('wrong-password') ||
        errMsg.includes('invalid-credential');

      if (isInvalidCred || code === 'auth/too-many-requests') {
        console.warn('Password change notice:', code || errMsg);
      } else {
        console.error(err);
      }

      if (isInvalidCred) {
        setError(
          language === 'bn'
            ? 'বর্তমান পাসওয়ার্ডটি সঠিক নয়। আবার চেষ্টা করুন।'
            : 'Current password is incorrect.'
        );
      } else if (code === 'auth/too-many-requests' || errMsg.includes('too-many-requests')) {
        setError(
          language === 'bn'
            ? 'অনেকবার ভুল চেষ্টা করা হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।'
            : 'Too many failed attempts. Try again later.'
        );
      } else {
        setError(err.message || 'পাসওয়ার্ড পরিবর্তন করতে ব্যর্থ হয়েছে।');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Reset Link via Email
  const handleSendResetEmail = async () => {
    if (!user?.email || resetCooldown > 0) return;
    hapticFeedback.light();
    setIsSendingReset(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, user.email);
      setResetSent(true);
      setResetCooldown(60);

      const timer = setInterval(() => {
        setResetCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(
        language === 'bn'
          ? 'ইমেইল পাঠাতে ব্যর্থ হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।'
          : 'Failed to send reset email.'
      );
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-4 pb-28 space-y-5 animate-fade-in">
      {/* Top Header Card */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
        <button
          onClick={() => {
            hapticFeedback.light();
            setActiveTab('profile');
          }}
          className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all flex items-center gap-2 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'bn' ? 'ফিরে যান' : 'Back'}</span>
        </button>

        <div className="text-right">
          <h2 className="text-base font-black text-slate-900">
            {language === 'bn' ? 'পাসওয়ার্ড ও নিরাপত্তা' : 'Password & Security'}
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">
            অ্যাাকাউন্টের পাসওয়ার্ড পরিবর্তন বা রিসেট
          </p>
        </div>
      </div>

      {/* Main Password Update Form */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">
              {language === 'bn' ? 'নতুন পাসওয়ার্ড সেট করুন' : 'Change Password'}
            </h3>
            <p className="text-xs text-slate-500">
              নিরাপত্তার স্বার্থে সময়মতো পাসওয়ার্ড আপডেট রাখুন
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              {language === 'bn' ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'}
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              {language === 'bn' ? 'নতুন পাসওয়ার্ড' : 'New Password'}
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder={language === 'bn' ? 'কমপক্ষে ৬ অক্ষর' : 'At least 6 characters'}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength Meter Bar */}
            {newPass.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      passAnalysis.score <= 33
                        ? 'bg-rose-500 w-1/3'
                        : passAnalysis.score <= 66
                        ? 'bg-amber-500 w-2/3'
                        : 'bg-emerald-500 w-full'
                    }`}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>পাসওয়ার্ড শক্তি</span>
                  <span
                    className={
                      passAnalysis.score <= 33
                        ? 'text-rose-600'
                        : passAnalysis.score <= 66
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }
                  >
                    {passAnalysis.score <= 33 ? 'দুর্বল' : passAnalysis.score <= 66 ? 'মাঝারি' : 'শক্তিশালী 🔒'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              {language === 'bn' ? 'নতুন পাসওয়ার্ড কনফার্ম করুন' : 'Confirm Password'}
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Checklist */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              {passAnalysis.hasMinLength ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1" />
              )}
              <span>কমপক্ষে ৬টি অক্ষর</span>
            </div>
            <div className="flex items-center gap-2">
              {passAnalysis.hasNumber ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1" />
              )}
              <span>একটি সংখ্যা (০-৯)</span>
            </div>
            <div className="flex items-center gap-2">
              {passAnalysis.isMatch ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1" />
              )}
              <span>পাসওয়ার্ড দুটি মিলেছে</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isUpdating ? (
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            <span>{language === 'bn' ? 'পাসওয়ার্ড আপডেট করুন' : 'Update Password'}</span>
          </button>
        </form>
      </div>

      {/* Alternative Reset Email Option */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-indigo-600" />
            <div>
              <h4 className="text-xs font-black text-slate-900">
                {language === 'bn' ? 'ইমেইল রিসেট লিংক পাঠান' : 'Reset via Email'}
              </h4>
              <p className="text-[11px] text-slate-500">
                পাসওয়ার্ড ভুলে গেলে আপনার রেজিস্টার্ড ইমেইলে রিসেট লিংক পেতে পারেন
              </p>
            </div>
          </div>
        </div>

        {resetSent ? (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>
              {language === 'bn'
                ? `রিসেট লিংক পাঠানো হয়েছে! (${resetCooldown}s পর আবার পাঠাতে পারবেন)`
                : `Reset email sent! (${resetCooldown}s cooldown)`}
            </span>
          </div>
        ) : (
          <button
            onClick={handleSendResetEmail}
            disabled={isSendingReset || resetCooldown > 0}
            className="w-full py-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 active:scale-98 text-indigo-700 text-xs font-bold border border-indigo-200/80 transition-all flex items-center justify-center gap-2"
          >
            {isSendingReset ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            <span>
              {resetCooldown > 0
                ? `${resetCooldown}s অপেক্ষা করুন`
                : `${user?.email || 'ইমেইলে'} রিসেট লিংক পাঠান`}
            </span>
          </button>
        )}
      </div>

      {/* Account Security Guidelines Card */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-5 border border-slate-800 space-y-3 shadow-lg">
        <h4 className="text-xs font-black text-amber-400 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          জরুরী একাউন্ট সিকিউরিটি টিপস
        </h4>
        <ul className="text-xs text-slate-300 space-y-2 font-medium leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            <span>অন্যদের সাথে কখনো নিজের লগইন ক্রেডেনশিয়াল বা পাসওয়ার্ড শেয়ার করবেন না।</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            <span>নিয়মিত সময়ের ব্যবধানে পাসওয়ার্ড পরিবর্তন করা নিরাপদ।</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            <span>সন্দেহজনক কার্যকলাপ পরিলক্ষিত হলে সাথে সাথে পাসওয়ার্ড পরিবর্তন করুন।</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
