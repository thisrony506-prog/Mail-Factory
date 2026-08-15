import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../lib/i18n';
import { auth, signOut } from '../../lib/firebase';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { hapticFeedback } from '../../lib/haptics';
import {
  Wallet,
  Hourglass,
  Flame,
  Gift,
  Share2,
  Copy,
  Check,
  ChevronRight,
  User,
  Shield,
  Key,
  LogOut,
  HelpCircle,
  Mail,
  FileText,
  Info,
  Trash2,
  Bell,
  Camera,
  Users,
  Award,
  Sparkles,
  TrendingUp,
  Download,
  QrCode,
  Activity
} from 'lucide-react';
import QRCode from 'react-qr-code';
import {
  LineChart,
  Line,
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
  onOpenPrivacy: () => void;
  onOpenAbout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onOpenEditProfile,
  onOpenChangePass,
  onOpenFAQ,
  onOpenContact,
  onOpenPrivacy,
  onOpenAbout,
}) => {
  const {
    profile,
    user,
    language,
    currentLevel,
    nextLevel,
    setWithdrawModalOpen,
    setActiveTab,
    setChatDrawerOpen,
    setNotifDrawerOpen,
    claimDailyStreak,
    commissionPercent,
    signupBonusUser,
    copyText,
    allUsers,
    submissions,
  } = useApp();

  const t = translations[language];
  const { isInstallable, promptInstall } = usePWAInstall();

  const [refTab, setRefTab] = useState<'overview' | 'friends'>('overview');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [claimingStreak, setClaimingStreak] = useState<boolean>(false);
  const [showQR, setShowQR] = useState<boolean>(false);

  // Recharts: Last 30 Days Earnings Trend
  const last30Days = React.useMemo(() => {
    const days: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return days;
  }, []);

  const chartData = React.useMemo(() => {
    const earningsMap: Record<string, number> = {};
    submissions
      .filter((s) => s.status === 'approved')
      .forEach((s) => {
        const d = new Date(s.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        earningsMap[d] = (earningsMap[d] || 0) + (s.totalAmount || 0);
      });
    return last30Days.map((date) => ({
      date,
      amount: earningsMap[date] || 0,
    }));
  }, [submissions, last30Days]);

  const alreadyClaimed = profile?.last_login_date === new Date().toDateString();

  const mainBalance = (Number(profile?.balance) || 0).toFixed(2);
  const holdBalance = (Number(profile?.hold) || 0).toFixed(2);
  const referralCode = profile?.referralCode || 'MFVIP88';
  const referralLink = `${window.location.origin}/?ref=${referralCode}`;

  const handleCopyLink = async () => {
    const ok = await copyText(referralLink, language === 'bn' ? 'রেফারেল লিংক কপি হয়েছে!' : 'Referral link copied!');
    if (ok) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Mail Factory - Trusted Gmail Exchange',
        text: `Join Mail Factory using my referral code ${referralCode} and get bonus cash!`,
        url: referralLink,
      }).catch(() => handleCopyLink());
    } else {
      handleCopyLink();
    }
  };

  const handleClaimStreak = async () => {
    setClaimingStreak(true);
    await claimDailyStreak();
    setClaimingStreak(false);
  };

  const handleLogout = async () => {
    if (window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত যে লগআউট করতে চান?' : 'Are you sure you want to log out?')) {
      await signOut(auth);
      setActiveTab('home');
    }
  };

  // Calculate my referred friends
  const myFriends = allUsers.filter((u) => u.referredBy === user?.uid);

  // Submissions stats
  const totalSubCount = profile?.total_submitted || submissions.length;
  const approvedCount = profile?.manual_approved_count || 0;
  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const rejectedCount = submissions.filter((s) => s.status === 'rejected').length;

  // Level progress percentage
  const currentReq = currentLevel.approved;
  const nextReq = nextLevel ? nextLevel.approved : currentReq + 100;
  const levelProgress = nextLevel
    ? Math.min(100, Math.max(0, ((approvedCount - currentReq) / (nextReq - currentReq)) * 100))
    : 100;

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : 'Member';

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 space-y-4">
      {/* Profile Header Card */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white p-6 shadow-xl relative overflow-hidden text-center">
        {/* Background glow effects */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-amber-400/15 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10">
          {/* Avatar with edit icon */}
          <div className="relative inline-block mb-3">
            <div
              onClick={onOpenEditProfile}
              className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 p-1 mx-auto cursor-pointer shadow-lg hover:scale-105 transition-transform"
            >
              {profile?.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-indigo-900 text-amber-300 font-black text-3xl flex items-center justify-center">
                  {(profile?.username || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <button
              onClick={onOpenEditProfile}
              className="absolute bottom-0 right-0 p-1.5 rounded-full bg-indigo-600 border-2 border-white text-white shadow hover:bg-indigo-700 transition-colors"
              title="Change Photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <h2 className="text-xl font-black text-white">{profile?.username || 'Mail Factory User'}</h2>
          <p className="text-xs text-indigo-200 mt-0.5 font-mono">{profile?.email || user?.email}</p>

          {/* Chips row */}
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>{currentLevel.title}</span>
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{profile?.login_streak || 1} Days Streak</span>
            </span>

            <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-white/10 text-indigo-100">
              Joined {memberSince}
            </span>
          </div>
        </div>
      </div>

      {/* Balance Card & Quick Actions */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Main Balance */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100">
            <div className="flex items-center gap-2 text-indigo-700 text-xs font-extrabold mb-1">
              <Wallet className="w-4 h-4" />
              <span>{t.mainBalance}</span>
            </div>
            <div className="text-2xl font-black text-slate-800 font-mono">
              ৳{mainBalance}
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
              Available to withdraw
            </span>
          </div>

          {/* Hold Balance */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/40 border border-amber-200/70">
            <div className="flex items-center gap-2 text-amber-800 text-xs font-extrabold mb-1">
              <Hourglass className="w-4 h-4" />
              <span>{t.holdBalance}</span>
            </div>
            <div className="text-2xl font-black text-amber-700 font-mono">
              ৳{holdBalance}
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
              In audit review
            </span>
          </div>
        </div>

        {/* Quick Actions Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setWithdrawModalOpen(true)}
            className="py-3 px-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs shadow hover:opacity-95 active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
          >
            <Wallet className="w-5 h-5" />
            <span>{t.withdraw}</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className="py-3 px-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
          >
            <Hourglass className="w-5 h-5 text-indigo-600" />
            <span>{t.history}</span>
          </button>

          <button
            onClick={handleShare}
            className="py-3 px-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs active:scale-95 transition-all flex flex-col items-center justify-center gap-1 border border-indigo-100"
          >
            <Gift className="w-5 h-5 text-indigo-600" />
            <span>{t.invite}</span>
          </button>
        </div>
      </div>

      {/* Daily Login Streak Card */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h4 className="text-[15px] font-black text-slate-800">{t.dailyStreak}</h4>
          <span className="text-sm font-black text-orange-500 bg-orange-50 px-2.5 py-1 rounded-lg">
            {profile?.login_streak || 0} <span className="text-xs font-bold text-orange-400">days</span>
          </span>
        </div>

        {/* 7 Days Indicator */}
        <div className="flex justify-between items-center relative z-10 mb-5">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => {
            const streakNum = profile?.login_streak || 0;
            const streakMod = streakNum % 7 === 0 && streakNum > 0 ? 7 : streakNum % 7;
            
            const isCompleted = i < streakMod;
            const isNext = i === streakMod;

            return (
              <div
                key={i}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-black transition-all ${
                  isCompleted
                    ? 'bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-md shadow-orange-200'
                    : isNext && !alreadyClaimed
                    ? 'bg-orange-100 text-orange-600 border-2 border-orange-400'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>

        <button
          onClick={handleClaimStreak}
          disabled={claimingStreak || alreadyClaimed}
          className={`w-full py-3.5 rounded-2xl text-[14px] font-black transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
            alreadyClaimed 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 hover:opacity-95 text-white shadow-lg shadow-orange-200'
          }`}
        >
          {claimingStreak ? (language === 'bn' ? 'ক্লেইম হচ্ছে...' : 'Claiming...') : alreadyClaimed ? (language === 'bn' ? 'আজকের জন্য ক্লেইম করা হয়েছে ✅' : 'Claimed for Today ✅') : t.streakClaim}
        </button>
      </div>

      {/* Submission Stats */}
      <div className="rounded-3xl bg-white border border-slate-200 p-4 shadow-sm">
        <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          <span>{t.submissionStats}</span>
        </h4>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
            <span className="text-lg font-black text-indigo-700 block">{totalSubCount}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">{t.total}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <span className="text-lg font-black text-emerald-700 block">{approvedCount}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">{t.approved}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-amber-50/60 border border-amber-100">
            <span className="text-lg font-black text-amber-700 block">{pendingCount}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">{t.pending}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-rose-50/60 border border-rose-100">
            <span className="text-lg font-black text-rose-700 block">{rejectedCount}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">{t.rejected}</span>
          </div>
        </div>

        {/* 30 Days Earnings Trend Chart */}
        <div className="mt-5 pt-5 border-t border-slate-100">
          <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-500" />
            <span>Earnings Trend (Last 30 Days)</span>
          </h4>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: '#94a3b8' }} 
                  minTickGap={20}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: '#94a3b8' }} 
                  tickFormatter={(val) => `৳${val}`} 
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                  itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                  formatter={(value) => [`৳${value}`, 'Earned']}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  dot={false} 
                  activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Level VIP Progress Card */}
      <div className="rounded-3xl bg-white border border-slate-200 p-4 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-sm">
              👑
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800">{currentLevel.title}</h4>
              <span className="text-[10px] text-slate-400">
                Approved: {approvedCount} Gmails
              </span>
            </div>
          </div>
          <span className="text-xs font-black text-indigo-700 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100">
            ৳{currentLevel.rate}/Gmail
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
            style={{ width: `${levelProgress}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-slate-400 font-bold">
          <span>Current: {currentLevel.title}</span>
          <span className="text-indigo-600">
            {nextLevel
              ? `Next Level: ${nextLevel.approved - approvedCount} Left`
              : 'Max Level Reached 🏆'}
          </span>
        </div>
      </div>

      {/* Referral Hub V3 with Tabs */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white p-5">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Gift className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-black">{t.inviteAndEarn}</h3>
              <p className="text-xs text-purple-200">
                {t.commission}: <span className="text-amber-300 font-bold">{commissionPercent}%</span> per referral
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10">
            <div className="bg-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm">
              <span className="text-xl font-black">{myFriends.length}</span>
              <span className="text-[10px] uppercase font-bold text-white/80 block">{t.totalRefers}</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm">
              <span className="text-xl font-black">৳{(Number(profile?.referralEarnings) || 0).toFixed(2)}</span>
              <span className="text-[10px] uppercase font-bold text-white/80 block">{t.totalEarned}</span>
            </div>
          </div>
        </div>

        {/* Referral Sub-Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50">
          <button
            onClick={() => setRefTab('overview')}
            className={`flex-1 py-2.5 text-xs font-bold transition-all ${
              refTab === 'overview'
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.overview}
          </button>
          <button
            onClick={() => setRefTab('friends')}
            className={`flex-1 py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              refTab === 'friends'
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t.myFriends} ({myFriends.length})</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {refTab === 'overview' ? (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">
                  YOUR CODE
                </span>
                <span className="text-base font-black font-mono text-indigo-700">
                  {referralCode}
                </span>
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-black shadow hover:bg-indigo-700 active:scale-95 flex items-center gap-1"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied!' : t.copy}</span>
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 space-y-1">
              <div className="font-extrabold flex items-center gap-1 text-indigo-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'রেফারেল সুবিধা:' : 'Referral Perks:'}</span>
              </div>
              <p>✅ {language === 'bn' ? `বন্ধু রেজিস্ট্রেশন করলে আপনি পাবেন ৳${signupBonusUser} বোনাস` : `Instant ৳${signupBonusUser} on friend registration`}</p>
              <p>✅ {language === 'bn' ? `বন্ধু জিমেইল বিক্রি করলে আপনি পাবেন ${commissionPercent}% আজীবন কমিশন` : `Earn ${commissionPercent}% lifetime commission on every valid sell`}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleShare}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-700 text-white text-xs font-black shadow hover:opacity-95 active:scale-98 flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>{t.shareReferral}</span>
              </button>
              
              <button
                onClick={() => setShowQR(!showQR)}
                className="w-full py-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black shadow-sm hover:bg-indigo-100 active:scale-98 flex items-center justify-center gap-2 transition-all"
              >
                <QrCode className="w-4 h-4" />
                <span>{showQR ? (language === 'bn' ? 'লুকান' : 'Hide QR') : (language === 'bn' ? 'QR কোড দেখান' : 'Show QR Code')}</span>
              </button>
            </div>

            {/* QR Code Reveal */}
            {showQR && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center animate-fade-in shadow-sm">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 mb-2">
                  <QRCode value={referralLink} size={140} fgColor="#4f46e5" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Scan to register</p>
              </div>
            )}
          </div>
        ) : (
          /* Tab 2: My Friends */
          <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
            {myFriends.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs font-bold">
                <Users className="w-8 h-8 mx-auto mb-1.5 opacity-30 text-indigo-600" />
                <p>{language === 'bn' ? 'এখনো কোনো বন্ধু যুক্ত হয়নি।' : 'No referred friends yet.'}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {language === 'bn' ? 'আপনার রেফারেল লিংক শেয়ার করে বন্ধুদের আমন্ত্রণ জানান।' : 'Share your invite link to earn commissions.'}
                </p>
              </div>
            ) : (
              myFriends.map((friend, idx) => (
                <div
                  key={friend.uid || idx}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                      {(friend.username || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-800 block">{friend.username}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{friend.email}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold">
                    Active
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Settings & Info Section */}
      <div className="rounded-3xl bg-white border border-slate-200 p-2 shadow-sm divide-y divide-slate-100">
        <div className="px-3 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
          {t.account}
        </div>
        <button
          onClick={onOpenEditProfile}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 rounded-2xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-extrabold text-slate-800">{t.editProfile}</h5>
              <span className="text-[10px] text-slate-400 font-medium">Update name, photo, phone & wallet</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setNotifDrawerOpen(true)}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 rounded-2xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-extrabold text-slate-800">{t.notifications}</h5>
              <span className="text-[10px] text-slate-400 font-medium">Push and audit status alerts</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={onOpenChangePass}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 rounded-2xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-extrabold text-slate-800">{t.changePassword}</h5>
              <span className="text-[10px] text-slate-400 font-medium">Secure your account credential</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <div className="px-3 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider pt-3">
          {t.support} & Advanced
        </div>
        <button
          onClick={() => setChatDrawerOpen(true)}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 rounded-2xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-extrabold text-slate-800">{t.liveChat}</h5>
              <span className="text-[10px] text-slate-400 font-medium">Chat directly with admin team</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 rounded-2xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-extrabold text-slate-800">Payout Reports</h5>
              <span className="text-[10px] text-slate-400 font-medium">View and download your history</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={onOpenFAQ}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 rounded-2xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-extrabold text-slate-800">{t.faq}</h5>
              <span className="text-[10px] text-slate-400 font-medium">Frequently asked questions</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={onOpenContact}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 rounded-2xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-extrabold text-slate-800">{t.contactUs}</h5>
              <span className="text-[10px] text-slate-400 font-medium">Telegram, WhatsApp & Official Email</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <div className="px-3 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider pt-3">
          {t.info}
        </div>
        <button
          onClick={onOpenPrivacy}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 rounded-2xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-extrabold text-slate-800">{t.privacyPolicy}</h5>
              <span className="text-[10px] text-slate-400 font-medium">Data protection & security terms</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={onOpenAbout}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 rounded-2xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-extrabold text-slate-800">{t.aboutUs}</h5>
              <span className="text-[10px] text-slate-400 font-medium">Mail Factory Version 3.2.0</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* PWA Install Button (Mobile View) */}
      {isInstallable && (
        <button
          onClick={() => {
            hapticFeedback.medium();
            promptInstall();
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 text-xs font-black shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <Download className="w-4 h-4" />
          <span>{language === 'bn' ? 'Mail Factory অ্যাপ ইনস্টল করুন' : 'Install Mail Factory App'}</span>
        </button>
      )}

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full py-3.5 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-98"
      >
        <LogOut className="w-4 h-4" />
        <span>{t.logout}</span>
      </button>

      {/* Delete Account (Visual Only) */}
      <button
        onClick={() => {
          alert(language === 'bn' ? 'অ্যাকাউন্ট ডিলিট করতে লাইভ চ্যাটে অ্যাডমিনের সাথে যোগাযোগ করুন।' : 'Please contact admin via Live Chat to delete your account.');
        }}
        className="w-full py-3.5 rounded-2xl text-slate-400 text-[11px] font-bold flex items-center justify-center gap-1.5 hover:text-rose-600 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>{language === 'bn' ? 'অ্যাকাউন্ট ডিলিট করুন' : 'Request Account Deletion'}</span>
      </button>
    </div>
  );
};
