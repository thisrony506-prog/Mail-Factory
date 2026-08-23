import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { translations, LANGUAGES } from './i18n';
import { hapticFeedback } from './haptics';
import { getClientFingerprint, getUrlParam } from './deviceUtils';
import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
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
  ArrowLeft,
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
  Globe,
  Check,
  UserPlus,
  LogIn,
  Key,
  Sparkles,
  Star,
  Quote,
} from 'lucide-react';
import { onValue } from 'firebase/database';
import { Review } from './types';
import { AppLogo3D } from './AppLogo3D';

interface AuthPageViewProps {
  initialMode?: 'register' | 'login';
  onBackToLanding: () => void;
}

export const AuthPageView: React.FC<AuthPageViewProps> = ({
  initialMode = 'register',
  onBackToLanding,
}) => {
  const { language, setLanguage, appLogo, signupBonusUser, signupBonusReferrer } = useApp();
  const t = translations[language] || translations['bn'];

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPass, setConfirmPass] = useState<string>('');
  const [referralCodeInput, setReferralCodeInput] = useState<string>(() => getUrlParam('ref') || '');
  const [showPass, setShowPass] = useState<boolean>(false);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState<boolean>(false);

  // Live real reviews from Firebase
  const [liveReviews, setLiveReviews] = useState<Review[]>([]);

  useEffect(() => {
    try {
      const reviewsRef = ref(db, 'reviews');
      const unsubscribe = onValue(reviewsRef, (snapshot) => {
        const data = snapshot.val();
        if (data && typeof data === 'object') {
          const list: Review[] = Object.keys(data)
            .map((k) => ({ ...data[k], id: k }))
            .filter((r) => r.status !== 'rejected')
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setLiveReviews(list);
        }
      });
      return () => unsubscribe();
    } catch {}
  }, []);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState<boolean>(false);

  // Auto detect referral code from URL search param
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const refParam = urlParams.get('ref');
      if (refParam) {
        setReferralCodeInput(refParam.toUpperCase());
      }
    } catch {
      // Safe ignore
    }
  }, []);

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

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
        let refId: string | null = null;
        const codeToUse = (referralCodeInput.trim() || getUrlParam('ref') || '').toUpperCase();

        if (codeToUse) {
          try {
            const q = query(ref(db, 'users'), orderByChild('referralCode'), equalTo(codeToUse));
            const sn = await get(q);
            if (sn.exists()) {
              sn.forEach((c) => {
                refId = c.key;
              });
            } else {
              const directSnap = await get(ref(db, `users/${codeToUse}`));
              if (directSnap.exists()) {
                refId = codeToUse;
              }
            }
          } catch {
            // safe ignore
          }
        }

        if (refId === googleUser.uid) {
          refId = null;
        }

        const { deviceId, ipAddress } = await getClientFingerprint();

        const newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        await set(ref(db, `users/${googleUser.uid}`), {
          username: googleUser.displayName || 'Google User',
          email: googleUser.email,
          photoURL: googleUser.photoURL || '',
          balance: signupBonusUser,
          hold: 0,
          paymentNumber: '',
          paymentMethod: '',
          createdAt: Date.now(),
          referralCode: newReferralCode,
          referredBy: refId || '',
          referralEarnings: 0,
          last_login: Date.now(),
          login_streak: 1,
          total_submitted: 0,
          total_withdrawn: 0,
          auth_provider: 'google',
          deviceId,
          ipAddress,
        });

        if (refId && signupBonusReferrer > 0) {
          try {
            await update(ref(db, `users/${refId}`), {
              referralEarnings: increment(signupBonusReferrer),
              balance: increment(signupBonusReferrer),
            });
          } catch {
            // Ignore
          }
        }
      }

      hapticFeedback.success();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        const errorString = err.message?.toLowerCase() || '';
        if (errorString.includes('closing') || errorString.includes('hidden') || err.code === 'auth/popup-blocked') {
          try {
            await signInWithRedirect(auth, googleProvider);
            return;
          } catch (redirectErr: any) {
            setErrorMessage(redirectErr.message || 'Google redirect authentication failed.');
          }
        } else {
          hapticFeedback.error();
          setErrorMessage(err.message || 'Google authentication failed.');
        }
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
        let refId: string | null = null;
        const codeToUse = (referralCodeInput.trim() || getUrlParam('ref') || '').toUpperCase();

        if (codeToUse) {
          try {
            const q = query(ref(db, 'users'), orderByChild('referralCode'), equalTo(codeToUse));
            const sn = await get(q);
            if (sn.exists()) {
              sn.forEach((c) => {
                refId = c.key;
              });
            } else {
              const directSnap = await get(ref(db, `users/${codeToUse}`));
              if (directSnap.exists()) {
                refId = codeToUse;
              }
            }
          } catch {
            // safe ignore
          }
        }

        if (refId === res.user.uid) {
          refId = null;
        }

        const { deviceId, ipAddress } = await getClientFingerprint();

        const newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        await set(ref(db, `users/${res.user.uid}`), {
          username: name.trim(),
          email: cleanEmail,
          photoURL: '',
          balance: signupBonusUser,
          hold: 0,
          paymentNumber: '',
          paymentMethod: '',
          createdAt: Date.now(),
          referralCode: newReferralCode,
          referredBy: refId || '',
          referralEarnings: 0,
          last_login: Date.now(),
          login_streak: 1,
          total_submitted: 0,
          total_withdrawn: 0,
          auth_provider: 'email',
          deviceId,
          ipAddress,
        });

        if (refId && signupBonusReferrer > 0) {
          try {
            await update(ref(db, `users/${refId}`), {
              referralEarnings: increment(signupBonusReferrer),
              balance: increment(signupBonusReferrer),
            });
          } catch {
            // Ignore
          }
        }
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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white pb-10">
      {/* Page Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => {
              hapticFeedback.light();
              onBackToLanding();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>{language === 'bn' ? 'ল্যান্ডিং পেজে ফিরে যান' : 'Back to Home'}</span>
          </button>

          <div className="flex items-center gap-2">
            <AppLogo3D size={32} animated glow={false} />
            <span className="font-black text-sm text-white tracking-tight">Mail Factory</span>
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => {
                hapticFeedback.light();
                setIsLangDropdownOpen(!isLangDropdownOpen);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>{currentLangObj.flag}</span>
              <span className="uppercase text-[11px] hidden sm:inline">{currentLangObj.code}</span>
            </button>

            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-1.5 z-50 text-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-slate-700 mb-1">
                  {t.selectLanguage || 'ভাষা নির্বাচন করুন'}
                </div>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      hapticFeedback.medium();
                      setLanguage(lang.code);
                      setIsLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      language === lang.code
                        ? 'bg-indigo-600 text-white'
                        : 'hover:bg-slate-700/70 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </div>
                    {language === lang.code && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md w-full mx-auto px-4 pt-8 flex-1 flex flex-col justify-center">
        <div className="bg-slate-800/90 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden relative">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-extrabold mb-2 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {mode === 'register'
                  ? (language === 'bn' ? `সাইন আপেই ৳${signupBonusUser} বোনাস!` : `৳${signupBonusUser} Welcome Bonus!`)
                  : (language === 'bn' ? 'স্বাগতম সেলার অ্যাকাউন্ট' : 'Welcome Back Seller')}
              </span>
            </div>

            <h2 className="text-xl font-black text-white">
              {mode === 'register'
                ? (language === 'bn' ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create New Account')
                : (language === 'bn' ? 'অ্যাকাউন্টে লগইন করুন' : 'Login to Your Account')}
            </h2>
            <p className="text-xs text-slate-300 font-medium mt-1">
              {mode === 'register'
                ? (language === 'bn' ? 'মাত্র ৩০ সেকেন্ডে জিমেইল বিক্রি শুরু করুন' : 'Start selling fresh/aged Gmails in seconds')
                : (language === 'bn' ? 'আপনার ব্যালেন্স এবং ইনকাম নিয়ন্ত্রণ করুন' : 'Access your dashboard & withdraw balance')}
            </p>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/80 mt-5">
              <button
                type="button"
                onClick={() => {
                  hapticFeedback.light();
                  setMode('register');
                  setErrorMessage(null);
                }}
                className={`py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'register'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'সাইন আপ / রেজিস্ট্রেশন' : 'Sign Up'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  hapticFeedback.light();
                  setMode('login');
                  setErrorMessage(null);
                }}
                className={`py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'লগইন' : 'Login'}</span>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-4">
            {/* Error & Success Messages */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {resetSent && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {language === 'bn'
                    ? 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে!'
                    : 'Password reset link sent to your email!'}
                </span>
              </div>
            )}

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-slate-700/80 hover:bg-slate-700 border border-slate-600 font-extrabold text-xs text-white flex items-center justify-center gap-2.5 transition-all active:scale-98 disabled:opacity-50 cursor-pointer shadow-sm"
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
              <span>
                {mode === 'register'
                  ? (language === 'bn' ? 'Google দিয়ে সরাসরি সাইন আপ' : 'Sign Up with Google')
                  : (language === 'bn' ? 'Google দিয়ে সরাসরি লগইন' : 'Login with Google')}
              </span>
            </button>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-slate-700 w-full" />
              <span className="bg-slate-800 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">
                {language === 'bn' ? 'অথবা ইমেইল ব্যবহার করুন' : 'OR WITH EMAIL'}
              </span>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              {/* Full Name field (Register only) */}
              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">
                    {language === 'bn' ? 'আপনার নাম' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={language === 'bn' ? 'যেমন: মোহাম্মদ তানভীর' : 'e.g. Tanvir Ahmed'}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">
                  {language === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-300 block">
                    {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[11px] font-bold text-indigo-400 hover:underline"
                    >
                      {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator (Register only) */}
                {mode === 'register' && password.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passColor}`}
                        style={{ width: `${passScorePercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold block">
                      {passScore >= 4
                        ? (language === 'bn' ? 'শক্তিশালী পাসওয়ার্ড' : 'Strong Password')
                        : passScore >= 2
                        ? (language === 'bn' ? 'মাঝারি পাসওয়ার্ড' : 'Medium Strength')
                        : (language === 'bn' ? 'দুর্বল পাসওয়ার্ড' : 'Weak Password')}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password (Register only) */}
              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">
                    {language === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Referral Code Field (Register only) */}
              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">
                    {language === 'bn' ? 'রেফারেল কোড (ঐচ্ছিক)' : 'Referral Code (Optional)'}
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={referralCodeInput}
                      onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                      placeholder="REF123"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-xs font-semibold text-white placeholder-slate-500 uppercase focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Terms Checkbox (Register only) */}
              {mode === 'register' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                  />
                  <label htmlFor="terms" className="text-[11px] text-slate-300 font-medium">
                    {language === 'bn'
                      ? 'আমি সকল নিয়মাবলী ও শর্তাবলীতে সম্মত আছি'
                      : 'I agree to the Terms & Privacy Policy'}
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-600 hover:to-pink-700 text-white font-black text-sm shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : mode === 'register' ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{language === 'bn' ? `সাইন আপ করুন (৳${signupBonusUser} বোনাস)` : `Sign Up Now (৳${signupBonusUser} Bonus)`}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{language === 'bn' ? 'লগইন করুন' : 'Log In'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Bottom Toggle Footer */}
            <div className="text-center pt-2 border-t border-slate-700/60">
              {mode === 'register' ? (
                <p className="text-xs text-slate-400 font-medium">
                  {language === 'bn' ? 'আগে থেকেই অ্যাকাউন্ট আছে?' : 'Already have an account?'}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      hapticFeedback.light();
                      setMode('login');
                      setErrorMessage(null);
                    }}
                    className="font-extrabold text-indigo-400 hover:underline cursor-pointer ml-1"
                  >
                    {language === 'bn' ? 'এখানে লগইন করুন' : 'Login Here'}
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-400 font-medium">
                  {language === 'bn' ? 'নতুন ইউজার?' : 'New to Mail Factory?'}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      hapticFeedback.light();
                      setMode('register');
                      setErrorMessage(null);
                    }}
                    className="font-extrabold text-indigo-400 hover:underline cursor-pointer ml-1"
                  >
                    {language === 'bn' ? 'ফ্রিতে সাইন আপ করুন' : 'Register Free'}
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Live Customer Reviews Trust Showcase on Auth Page */}
        {liveReviews.length > 0 && (
          <div className="w-full max-w-md mt-6 p-4 rounded-3xl bg-slate-800/60 border border-slate-700/70 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{language === 'bn' ? 'সেলারদের সাম্প্রতিক রিভিউ' : 'Recent Seller Reviews'}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">
                5.0 ★ ({liveReviews.length} {language === 'bn' ? 'টি রিভিউ' : 'reviews'})
              </span>
            </div>

            <div className="space-y-2">
              {liveReviews.slice(0, 2).map((rev) => (
                <div key={rev.id} className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-600/80 text-white font-bold text-[10px] flex items-center justify-center overflow-hidden">
                        {rev.userPhoto ? (
                          <img src={rev.userPhoto} alt={rev.userName} className="w-full h-full object-cover" />
                        ) : (
                          rev.userName?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <span className="text-xs font-extrabold text-white truncate max-w-[130px]">{rev.userName}</span>
                      {rev.isVerified && <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />}
                    </div>
                    <div className="flex items-center text-amber-400 text-[10px]">
                      {'★'.repeat(rev.rating || 5)}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-300 font-normal italic leading-relaxed line-clamp-2">
                    "{rev.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security Badge Footer */}
        <div className="text-center mt-6 text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            {language === 'bn'
              ? 'নিরাপদ এনক্রিপ্টেড পেমেন্ট ও অথেনটিকেশন ব্যবস্থা'
              : 'Secure encrypted authentication & payment processing'}
          </span>
        </div>
      </main>
    </div>
  );
};
