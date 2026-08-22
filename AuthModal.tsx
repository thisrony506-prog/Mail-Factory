import React, { useState } from 'react';
import { useApp } from './AppContext';
import { translations } from './i18n';
import { hapticFeedback } from './haptics';
import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  sendPasswordResetEmail,
  ref,
  set,
  get,
  update,
  increment,
  query,
  orderByChild,
  equalTo,
} from './firebase';
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  Users,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { AppLogo3D } from './AppLogo3D';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    setAuthModalOpen,
    language,
    appLogo,
    signupBonusUser,
    signupBonusReferrer,
  } = useApp();

  const t = translations[language];

  const [mode, setMode] = useState<'login' | 'register'>('login');

  React.useEffect(() => {
    if (isAuthModalOpen && authModalMode) {
      setMode(authModalMode);
    }
  }, [isAuthModalOpen, authModalMode]);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPass, setConfirmPass] = useState<string>('');
  const [showPass, setShowPass] = useState<boolean>(false);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState<boolean>(false);

  if (!isAuthModalOpen) return null;

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passScore = getPasswordStrength(password);
  const passScorePercent = Math.min(100, passScore * 20);
  const passColor =
    passScore >= 4 ? 'bg-emerald-500' : passScore >= 3 ? 'bg-teal-500' : passScore >= 2 ? 'bg-amber-500' : 'bg-rose-500';

  const handleGoogleAuth = async () => {
    hapticFeedback.light();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      const userSnap = await get(ref(db, `users/${googleUser.uid}`));
      if (!userSnap.exists()) {
        // Create new user profile
        const urlParams = new URLSearchParams(window.location.search);
        const refParam = urlParams.get('ref');
        let refId: string | null = null;

        if (refParam) {
          try {
            const q = query(ref(db, 'users'), orderByChild('referralCode'), equalTo(refParam));
            const sn = await get(q);
            if (sn.exists()) {
              sn.forEach((c) => {
                refId = c.key;
              });
            }
          } catch {
            // safe ignore
          }
        }

        const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        await set(ref(db, `users/${googleUser.uid}`), {
          username: googleUser.displayName || 'Google User',
          email: googleUser.email,
          photoURL: googleUser.photoURL || '',
          balance: signupBonusUser,
          hold: 0,
          paymentNumber: '',
          paymentMethod: '',
          createdAt: Date.now(),
          referralCode,
          referredBy: refId || '',
          referralEarnings: 0,
          last_login: Date.now(),
          login_streak: 1,
          total_submitted: 0,
          total_withdrawn: 0,
          auth_provider: 'google',
        });

        if (refId && signupBonusReferrer > 0) {
          try {
            await update(ref(db, `users/${refId}`), {
              referralEarnings: increment(signupBonusReferrer),
            });
          } catch {
            // Handled securely server-side or ignored if cross-user write is protected
          }
        }
      }

      hapticFeedback.success();
      setAuthModalOpen(false);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        hapticFeedback.error();
        setErrorMessage(err.message || 'Google authentication failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMessage(language === 'bn' ? 'অনুগ্রহ করে ইমেইল দিন।' : 'Please enter an email address.');
      return;
    }

    if (!password) {
      setErrorMessage(language === 'bn' ? 'অনুগ্রহ করে পাসওয়ার্ড দিন।' : 'Please enter a password.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
        setAuthModalOpen(false);
      } else {
        if (!name.trim()) {
          setErrorMessage(language === 'bn' ? 'অনুগ্রহ করে আপনার পুরো নাম দিন।' : 'Please enter your full name.');
          setIsLoading(false);
          return;
        }

        if (password.length < 6) {
          setErrorMessage(language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.');
          setIsLoading(false);
          return;
        }

        if (password !== confirmPass) {
          setErrorMessage(language === 'bn' ? 'পাসওয়ার্ড দুটি মেলেনি!' : 'Passwords do not match!');
          setIsLoading(false);
          return;
        }

        if (!agreeTerms) {
          setErrorMessage(language === 'bn' ? 'নিয়ম ও শর্তাবলী গ্রহণ করতে হবে।' : 'You must accept the terms.');
          setIsLoading(false);
          return;
        }

        const res = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const urlParams = new URLSearchParams(window.location.search);
        const refParam = urlParams.get('ref');
        let refId: string | null = null;

        if (refParam) {
          try {
            const q = query(ref(db, 'users'), orderByChild('referralCode'), equalTo(refParam));
            const sn = await get(q);
            if (sn.exists()) {
              sn.forEach((c) => {
                refId = c.key;
              });
            }
          } catch {
            // safe ignore
          }
        }

        const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        await set(ref(db, `users/${res.user.uid}`), {
          username: name.trim(),
          email: cleanEmail,
          photoURL: '',
          balance: signupBonusUser,
          hold: 0,
          paymentNumber: '',
          paymentMethod: '',
          createdAt: Date.now(),
          referralCode,
          referredBy: refId || '',
          referralEarnings: 0,
          last_login: Date.now(),
          login_streak: 1,
          total_submitted: 0,
          total_withdrawn: 0,
          auth_provider: 'email',
        });

        if (refId && signupBonusReferrer > 0) {
          try {
            await update(ref(db, `users/${refId}`), {
              referralEarnings: increment(signupBonusReferrer),
            });
          } catch {
            // Handled securely server-side or ignored if cross-user write is protected
          }
        }

        setAuthModalOpen(false);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let msg = err.message || 'Authentication error';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = language === 'bn' ? 'ভুল ইমেইল অথবা পাসওয়ার্ড।' : 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = language === 'bn' ? 'এই ইমেইল দিয়ে ইতিমধ্যে একটি একাউন্ট খোলা আছে। অনুগ্রহ করে লগইন করুন।' : 'Email is already registered. Please login.';
      } else if (err.code === 'auth/weak-password') {
        msg = language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        msg = language === 'bn' ? 'অনুগ্রহ করে একটি সঠিক ইমেইল অ্যাড্রেস লিখুন।' : 'Please enter a valid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = language === 'bn' ? 'অতিরিক্ত চেষ্টার কারণে সাময়িকভাবে ব্লক করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।' : 'Too many unsuccessful login attempts. Please try again later.';
      } else if (err.code === 'auth/network-request-failed') {
        msg = language === 'bn' ? 'ইন্টারনেট কানেকশন সমস্যা। সংযোগ চেক করে পুনরায় চেষ্টা করুন।' : 'Network error. Please check your internet connection.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = language === 'bn' ? 'Firebase Console-এ Email/Password অথেনটিকেশন সক্রিয় করা নেই।' : 'Email/Password sign-in is not enabled in Firebase Console.';
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMessage(language === 'bn' ? 'পাসওয়ার্ড রিসেট করতে ইমেইল লিখুন।' : 'Enter your email to receive reset link.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send reset email.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden relative max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-slate-900 text-white p-8 text-center relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500 rounded-full mix-blend-screen filter blur-[32px] opacity-40"></div>
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-500 rounded-full mix-blend-screen filter blur-[32px] opacity-40"></div>
          
          <button
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative z-10">
            <div className="flex justify-center mb-3">
              <AppLogo3D size={56} glow animated />
            </div>
            <h3 className="text-xl font-black tracking-tight">{mode === 'login' ? t.welcomeBack : 'Create Account'}</h3>
            <p className="text-xs text-slate-300 mt-1 font-medium max-w-[200px] mx-auto leading-relaxed">
              {language === 'bn'
                ? 'নিরাপদে জিমেইল বিক্রি করুন ও ক্যাশ পেমেন্ট নিন'
                : 'Bangladesh #1 Trusted Gmail Exchange'}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* Google Sign-in */}
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleAuth}
            className="w-full py-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}</span>
          </button>

          <div className="flex items-center gap-3 text-slate-400 text-xs font-semibold">
            <div className="flex-1 h-px bg-slate-100" />
            <span>{t.orWithEmail}</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 ml-1">
                  {t.fullName}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 bg-slate-50/50 hover:bg-slate-50 transition-all pl-10"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 ml-1">
                {t.gmailAddress}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 bg-slate-50/50 hover:bg-slate-50 transition-all pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 ml-1">
                {t.password}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 bg-slate-50/50 hover:bg-slate-50 transition-all pl-10 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength bar for register */}
              {mode === 'register' && password && (
                <div className="mt-1.5">
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full ${passColor} transition-all duration-300 rounded-full`}
                      style={{ width: `${passScorePercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 ml-1">
                  {t.confirmPassword}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 bg-slate-50/50 hover:bg-slate-50 transition-all pl-10"
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
                >
                  {t.forgotPass}
                </button>
              </div>
            )}

            {mode === 'register' && (
              <div className="flex items-center gap-2.5 pt-2">
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      id="agree"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                    />
                  </div>
                  <div className="ml-2.5 text-xs">
                    <label htmlFor="agree" className="font-medium text-slate-600 cursor-pointer select-none">
                      I agree to the <span className="text-indigo-600 font-bold hover:underline">Terms & Conditions</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {resetSent && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>Password reset link sent to your email!</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100"
            >
              {isLoading
                ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connecting...
                  </span>
                )
                : mode === 'login'
                ? t.login
                : `Create Account (Get ৳${signupBonusUser} Bonus)`}
            </button>
          </form>

          {/* Toggle login / register */}
          <div className="text-center pt-2 text-sm text-slate-500 font-medium">
            {mode === 'login' ? (
              <p>
                {t.noAccount}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline ml-1"
                >
                  {t.register}
                </button>
              </p>
            ) : (
              <p>
                {t.haveAccount}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline ml-1"
                >
                  {t.login}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
