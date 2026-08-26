import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from './AppContext';
import { useUserStats } from './useUserStats';
import { useUserBalance } from './useUserBalance';
import { translations } from './i18n';
import { auth, signOut } from './firebase';
import { usePWAInstall } from './usePWAInstall';
import { hapticFeedback } from './haptics';
import {
  Wallet,
  Hourglass,
  Flame,
  User,
  LogOut,
  Camera,
  Award,
  Trophy,
  Sparkles,
  Settings,
  ShieldCheck,
  Zap,
  History,
  CheckCircle2,
  Activity,
  TrendingUp,
  Crown,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  ChevronRight,
  ArrowUpRight,
  Star,
  QrCode,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ProfileViewProps {
  onOpenEditProfile: () => void;
  onOpenChangePass: () => void;
  onOpenFAQ: () => void;
  onOpenContact: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onOpenEditProfile,
  onOpenChangePass,
  onOpenFAQ,
  onOpenContact,
}) => {
  const {
    profile,
    user,
    language,
    currentLevel,
    nextLevel,
    setWithdrawModalOpen,
    setActiveTab,
    claimDailyStreak,
    submissions,
    withdrawRequests,
    allUsers,
  } = useApp();

  const { balance: realTimeBalance, loading: balanceLoading } = useUserBalance(user);

  const referrerName = useMemo(() => {
    if (!profile?.referredBy) return null;
    const found = allUsers.find(
      (u) =>
        u.referralCode === profile.referredBy ||
        u.uid === profile.referredBy ||
        (profile.referredBy && u.referralCode?.toUpperCase() === profile.referredBy.toUpperCase()) ||
        (profile.referredBy && u.uid === profile.referredBy)
    );
    return found ? found.username || found.email?.split('@')[0] || profile.referredBy : profile.referredBy;
  }, [profile?.referredBy, allUsers]);

  
  const t = translations[language];

  const holdBalance = (profile?.hold || 0).toFixed(2);

  const [claimingStreak, setClaimingStreak] = useState<boolean>(false);
  const [wonBonus, setWonBonus] = useState<number | null>(null);
  const [chartRange, setChartRange] = useState<7 | 14 | 30>(30);

  const todayStr = new Date().toDateString();
  const isBonusDateToday = profile?.lastBonusDate
    ? new Date(profile.lastBonusDate).toDateString() === todayStr
    : profile?.last_login_date === todayStr;

  const alreadyClaimed = Boolean(
    (profile?.dailyBonusClaimedToday && isBonusDateToday) || profile?.last_login_date === todayStr
  );

  const handleClaimStreak = async () => {
    if (alreadyClaimed || claimingStreak) return;
    setClaimingStreak(true);
    try {
      const res = await claimDailyStreak();
      if (res.success && res.bonusAmount) {
        setWonBonus(res.bonusAmount);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClaimingStreak(false);
    }
  };

  // Recharts: Dynamic Earnings Trend Chart Data
  const {
    totalSubCount,
    approvedCount,
    pendingCount,
    checkingCount,
    rejectedCount,
    realTotalEarnings,
    displayEarnings,
    realTotalWithdrawn,
    displayWithdrawn,
    hasWithdrawn,
    chartData,
    rangeTotal,
    rangePeak,
  } = useUserStats();

  // Level progress percentage
  const currentReq = currentLevel?.approved || 0;
  const nextReq = nextLevel?.approved || (currentReq + 100);
  const levelProgress = nextLevel
    ? Math.min(100, Math.max(0, ((approvedCount - currentReq) / (nextReq - currentReq)) * 100))
    : 100;

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : 'Member';

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-28 space-y-5 animate-fade-in">
      {/* 1. TOP PROFILE HEADER CARD */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-950 text-white p-5 sm:p-6 shadow-xl relative overflow-hidden border border-indigo-700/50">
        <button
          onClick={() => {
            hapticFeedback.light();
            setActiveTab('settings');
          }}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-md shadow-md active:scale-95 transition-all flex items-center gap-1.5"
          title="Account Settings"
        >
          <Settings className="w-4 h-4 text-indigo-200" />
          <span className="text-xs font-bold hidden sm:inline">
            {t.settings}
          </span>
        </button>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          {/* Avatar with Edit trigger */}
          <div className="relative group cursor-pointer" onClick={onOpenEditProfile}>
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-1 shadow-xl flex-shrink-0">
              {profile?.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.username || 'User'}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-indigo-950 text-amber-300 font-black text-2xl sm:text-3xl flex items-center justify-center">
                  {(profile?.username || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <button
              onClick={onOpenEditProfile}
              className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-indigo-600 border-2 border-slate-900 text-white shadow-lg group-hover:scale-110 transition-transform"
              title="Edit Profile"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User Details */}
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-1.5">
                <span>{profile?.username || 'User'}</span>
                {hasWithdrawn && (
                  <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20 shrink-0 inline" title="Verified Payout User" />
                )}
              </h2>
            </div>

            <p className="text-xs text-indigo-200 font-mono flex items-center justify-center sm:justify-start gap-1.5">
              {profile?.email || user?.email}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-white/15 border border-white/20 text-amber-300">
                <Award className="w-3.5 h-3.5" />
                <span>Level {currentLevel.level} ({currentLevel.title})</span>
              </span>

              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-white/15 border border-white/20 text-orange-300">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>{profile?.login_streak || 1} Days Streak</span>
              </span>

              {referrerName && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-purple-200">
                  <span>🤝 Referred by: <strong className="text-white">{referrerName}</strong></span>
                </span>
              )}

              <span className="text-[11px] text-indigo-200 font-medium px-2.5 py-1 rounded-full bg-black/20">
                Joined {memberSince}
              </span>
            </div>
          </div>
        </div>

        {/* Member ID Card Quick Access Card */}
        <div className="mt-5 pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-left w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/40 text-amber-300 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">{t.memberIdCard}</span>
                {hasWithdrawn ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-extrabold">
                    {t.verifiedMember}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-extrabold">
                    {t.generalMember}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-indigo-200">
                {t.memberIdCardSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              hapticFeedback.medium();
              setActiveTab('id_card');
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>কার্ড দেখুন ও ডাউনলোড (ID Card)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. MAIN BALANCE & WALLET ACTIONS */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Main Balance (Real-time via useUserBalance hook) */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-2xl shadow-lg">
            <p className="text-xs uppercase tracking-wider opacity-80">Available Balance</p>
            <h2 className="text-3xl font-black mt-1 font-mono">
              {balanceLoading ? "..." : `৳${realTimeBalance.toFixed(2)}`}
            </h2>
          </div>

          {/* Hold Balance */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-extrabold text-amber-800 flex items-center gap-1.5">
                <Hourglass className="w-4 h-4 text-amber-600" />
                {t.holdBalance}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 border border-amber-300 text-[10px] font-bold">
                Reviewing
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-800 font-mono">
              ৳{holdBalance}
            </div>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
              {t.holdBalanceNotice}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            onClick={() => {
              hapticFeedback.medium();
              setWithdrawModalOpen(true);
            }}
            className="py-3 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
          >
            <Wallet className="w-4 h-4" />
            <span>{t.withdraw}</span>
          </button>

          <button
            onClick={() => {
              hapticFeedback.light();
              setActiveTab('history');
            }}
            className="py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs font-bold border border-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <History className="w-4 h-4 text-slate-600" />
            <span>{t.history}</span>
          </button>

          <button
            onClick={() => {
              hapticFeedback.light();
              setActiveTab('sellers');
            }}
            className="col-span-2 sm:col-span-1 py-3 px-3 rounded-2xl bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-900 text-xs font-extrabold border border-amber-200 transition-all flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>{t.sellers}</span>
          </button>
        </div>
      </div>

      {/* 3. DAILY REWARD & LOGIN STREAK */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              {t.dailyStreak}
            </h3>
            <p className="text-xs text-slate-500">
              {t.dailyStreakBonusSub}
            </p>
          </div>
          <span className="text-xs font-black text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 fill-orange-500" />
            {profile?.login_streak || 0} {t.days}
          </span>
        </div>

        {/* 7 Days Matrix Visual */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center py-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((dayName, i) => {
            const streakNum = profile?.login_streak || 0;
            const streakMod = streakNum % 7 === 0 && streakNum > 0 ? 7 : streakNum % 7;
            const isCompleted = i < streakMod;
            const isNext = i === streakMod;

            return (
              <div
                key={i}
                className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-md'
                    : isNext && !alreadyClaimed
                    ? 'bg-orange-50 text-orange-600 border-2 border-orange-400 animate-pulse'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <span className="text-[10px] font-black uppercase opacity-80">{dayName}</span>
                <span className="text-xs font-black mt-0.5">
                  {isCompleted ? '✓' : `Day ${i + 1}`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bonus won alert */}
        {wonBonus !== null && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-1">
            <span className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              {language === 'bn' ? 'আজকের অর্জিত ক্যাশ বোনাস:' : "Today's Cash Bonus Won:"}
            </span>
            <span className="font-mono font-black text-sm text-emerald-700 bg-white px-2.5 py-1 rounded-xl border border-emerald-200 shadow-xs">
              +৳{wonBonus.toFixed(2)}
            </span>
          </div>
        )}

        <button
          onClick={handleClaimStreak}
          disabled={claimingStreak || alreadyClaimed}
          className={`w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black transition-all active:scale-98 flex items-center justify-center gap-2 ${
            alreadyClaimed
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
              : 'bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 hover:opacity-95 text-white shadow-lg shadow-orange-200'
          }`}
        >
          {claimingStreak ? (
            <span>{language === 'bn' ? 'বোনাস জমা হচ্ছে...' : 'Claiming Bonus...'}</span>
          ) : alreadyClaimed ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {wonBonus
                  ? `${language === 'bn' ? 'বোনাস যুক্ত হয়েছে' : 'Bonus Added'} (+৳${wonBonus.toFixed(2)})`
                  : t.streakBonusClaimedToday}
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{t.streakClaim}</span>
            </>
          )}
        </button>
      </div>

      {/* 4. HIGH-CRAFT LEVEL ROADMAP CARD */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-5 sm:p-6 shadow-xl border border-slate-700/80 space-y-4 relative overflow-hidden">
        {/* Glow backdrop decorative effect */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-3.5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/20">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider">VIP Level Status</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold">
                  Level {currentLevel.level}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                {currentLevel.title} Badge
              </h3>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700/80 flex items-center justify-between sm:justify-start gap-2">
            <span className="text-[11px] text-slate-300 font-medium">{t.ratePerTask}</span>
            <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20 font-mono">
              ৳{currentLevel.rate}
            </span>
          </div>
        </div>

        {/* Progress Bar & Target Requirements */}
        <div className="space-y-2 relative z-10">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              {t.approvedJobsDone} <strong className="text-white font-mono">{approvedCount}</strong>
            </span>
            <span className="text-amber-400 font-black font-mono">{levelProgress.toFixed(0)}% Complete</span>
          </div>

          <div className="w-full h-3.5 rounded-full bg-slate-950 p-0.5 border border-slate-700/80 shadow-inner overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-indigo-500 to-emerald-400 transition-all duration-700 shadow-md shadow-amber-500/20 relative"
              style={{ width: `${levelProgress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-0.5">
            <span>বর্তমান: {currentLevel.title}</span>
            <span className="text-indigo-300 font-bold">
              {nextLevel
                ? `পরবর্তী ${nextLevel.title} লেভেলে পৌঁছাতে আরও ${nextLevel.approved - approvedCount} টি অনুমোদিত কাজ দরকার`
                : 'আপনার একাউন্ট সর্বোচ্চ ভিআইপি ভিআইপি স্তরে উন্নীত 👑'}
            </span>
          </div>
        </div>

        {/* Perks Grid */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-center relative z-10">
          <div className="p-2.5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <Star className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-400 block font-bold">{t.taskPayout}</span>
            <span className="text-xs font-black text-white font-mono">৳{currentLevel.rate}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <Zap className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-400 block font-bold">{t.auditProcessing}</span>
            <span className="text-xs font-black text-emerald-400">{t.fastTrack}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <Award className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-400 block font-bold">{t.levelBadgePerk}</span>
            <span className="text-xs font-black text-purple-300">{t.vipVerified}</span>
          </div>
        </div>
      </div>

      {/* 5. PERFORMANCE STATS & MODERN EARNINGS GRAPH CARD */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-5">
        {/* Header & Stats Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                {t.workAnalyticsTitle}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {t.workAnalyticsSub}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl self-start sm:self-auto">
            {[7, 14, 30].map((range) => (
              <button
                key={range}
                onClick={() => {
                  hapticFeedback.light();
                  setChartRange(range as 7 | 14 | 30);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  chartRange === range
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {range} {t.days}
              </button>
            ))}
          </div>
        </div>

        {/* 5 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm flex-shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-indigo-900 uppercase block">{t.total}</span>
              <span className="text-base font-black text-indigo-950 font-mono">{totalSubCount} টি</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100/80 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm flex-shrink-0">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-emerald-900 uppercase block">{t.approved}</span>
              <span className="text-base font-black text-emerald-950 font-mono">{approvedCount} টি</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100/80 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-600 text-white shadow-sm flex-shrink-0">
              <Clock className="w-4 h-4 animate-spin" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-sky-900 uppercase block">{t.checking || 'Checking'}</span>
              <span className="text-base font-black text-sky-950 font-mono">{checkingCount} টি</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100/80 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-600 text-white shadow-sm flex-shrink-0">
              <Hourglass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-amber-900 uppercase block">{t.pending}</span>
              <span className="text-base font-black text-amber-950 font-mono">{pendingCount} টি</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100/80 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-600 text-white shadow-sm flex-shrink-0">
              <XCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-rose-900 uppercase block">{t.rejected}</span>
              <span className="text-base font-black text-rose-950 font-mono">{rejectedCount} টি</span>
            </div>
          </div>
        </div>

        {/* Lifetime Earnings & Payout Summary */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-md relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl" />
            <span className="text-[11px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">
              {language === 'bn' ? 'মোট উপার্জন (লাইফটাইম)' : 'Total Earnings (Lifetime)'}
            </span>
            <span className="text-xl font-black text-emerald-400 font-mono block">
              ৳{(Number(profile?.totalEarnings) || 0).toFixed(2)}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-md relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-sky-500/10 rounded-full blur-xl" />
            <span className="text-[11px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">
              {language === 'bn' ? 'মোট পে-আউট (উত্তোলন)' : 'Total Payout (Withdrawn)'}
            </span>
            <span className="text-xl font-black text-sky-400 font-mono block">
              ৳{realTotalWithdrawn.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Financial Summary Highlight Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between shadow-md mt-2 mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-[11px] text-slate-300 font-bold block">
                গত {chartRange} দিনে মোট উপার্জিত
              </span>
              <span className="text-lg font-black text-emerald-400 font-mono">
                ৳{rangeTotal.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-300 font-bold block">
              {t.peakSingleEarn}
            </span>
            <span className="text-xs font-black text-amber-300 font-mono bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20 inline-block">
              ৳{rangePeak.toFixed(2)}
            </span>
          </div>
        </div>
        {/* Dynamic Recharts Area Chart with Gradient Fill */}
        <div className="pt-2">
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="earningsColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                  minTickGap={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                  tickFormatter={(val) => `৳${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '16px',
                    border: '1px solid #334155',
                    color: '#ffffff',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)',
                    padding: '10px 14px',
                  }}
                  itemStyle={{ color: '#34d399', fontWeight: 'bold' }}
                  labelStyle={{ fontWeight: 'bold', color: '#94a3b8', fontSize: '11px', marginBottom: '2px' }}
                  formatter={(value) => [`৳${value}`, t.earnedMoney]}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#earningsColor)"
                  activeDot={{ r: 6, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
