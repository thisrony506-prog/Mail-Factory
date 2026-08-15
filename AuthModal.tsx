import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../lib/i18n';
import { hapticFeedback } from '../lib/haptics';
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
} from '../lib/firebase';
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

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setAuthModalOpen,
    language,
    appLogo,
    signupBonusUser,
    signupBonusReferrer,
  } = useApp();

  const t = translations[language];

  const [mode, setMode] = useState<'login' | 'register'>('login');
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
          await update(ref(db, `users/${refId}`), {
            balance: increment(signupBonusReferrer),
            referralEarnings: increment(signupBonusReferrer),
          });
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
          await update(ref(db, `users/${refId}`), {
            balance: increment(signupBonusReferrer),
            referralEarnings: increment(signupBonusReferrer),
          });
        }

        setAuthModalOpen(false);
      }
    } catch (err: any) {
      let msg = err.message || 'Authentication error';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = language === 'bn' ? 'ভুল ইমেইল অথবা পাসওয়ার্ড।' : 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = language === 'bn' ? 'এই ইমেইল দিয়ে ইতিমধ্যে একটি একাউন্ট খোলা আছে।' : 'Email is already registered. Please login.';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white p-6 text-center relative">
          <button
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <img 
            src={appLogo} 
            alt="Logo" 
            className="w-14 h-14 rounded-2xl mx-auto mb-2 shadow-md border border-white/20 object-cover" 
          />

          <h3 className="text-lg font-black">{mode === 'login' ? t.welcomeBack : 'Create Your Account'}</h3>
          <p className="text-xs text-indigo-200 mt-0.5">
            {language === 'bn'
              ? 'নিরাপদে জিমেইল বিক্রি করুন ও ক্যাশ পেমেন্ট নিন'
              : 'Bangladesh #1 Trusted Gmail Exchange Platform'}
          </p>

          <div className="flex justify-center gap-4 mt-3 text-[10px] text-white/80 font-bold">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              Trusted
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              Instant
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-amber-300" />
              50K+ Users
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Google Sign-in */}
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleAuth}
            className="w-full py-3 rounded-2xl border-2 border-slate-200 hover:border-indigo-400 bg-white text-slate-700 text-xs font-black shadow-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}</span>
          </button>

          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold">
            <div className="flex-1 h-px bg-slate-200" />
            <span>{t.orWithEmail}</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1 uppercase tracking-wider">
                  {t.fullName}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 pl-9"
                  />
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 mb-1 uppercase tracking-wider">
                {t.gmailAddress}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 pl-9"
                />
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 mb-1 uppercase tracking-wider">
                {t.password}
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 pl-9 pr-9"
                />
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
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
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1 uppercase tracking-wider">
                  {t.confirmPassword}
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 pl-9"
                  />
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] font-bold text-indigo-600 hover:underline"
                >
                  {t.forgotPass}
                </button>
              </div>
            )}

            {mode === 'register' && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="agree" className="text-[11px] text-slate-600">
                  I agree to the Terms & Conditions
                </label>
              </div>
            )}

            {resetSent && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>Password reset link sent to your email!</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white text-xs font-black shadow-md hover:opacity-95 active:scale-98 transition-all"
            >
              {isLoading
                ? 'Connecting...'
                : mode === 'login'
                ? t.login
                : 'Create Account (Get ৳' + signupBonusUser + ' Bonus)'}
            </button>
          </form>

          {/* Toggle login / register */}
          <div className="text-center pt-1 text-xs text-slate-500">
            {mode === 'login' ? (
              <p>
                {t.noAccount}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className="font-extrabold text-indigo-600 hover:underline ml-1"
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
                  className="font-extrabold text-indigo-600 hover:underline ml-1"
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
