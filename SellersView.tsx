import React, { useState } from 'react';
import { useApp } from './AppContext';
import { translations } from './i18n';
import {
  Trophy,
  Award,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Edit3,
  Shield,
} from 'lucide-react';
import { TopSellerItem, isExcludedSeller } from './types';

const ADMIN_EMAILS = ['gmrony135@gmail.com', 'mailfactorybd@gmail.com', 'iamronyofficial1@gmail.com'];

export const DEFAULT_BENCHMARK_SELLERS: TopSellerItem[] = [];

export const SellersView: React.FC = () => {
  const { language, topSellers, allUsers, user, setActiveTab, syncRealUsersToTopSellers, addNotification } = useApp();
  const t = translations[language];
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

  const todayStr = React.useMemo(() => new Date().toDateString(), []);
  const todayClaimedUsers = React.useMemo(() => {
    return (allUsers || []).filter((u) => {
      if (!u) return false;
      const isBonusToday = u.lastBonusDate
        ? new Date(u.lastBonusDate).toDateString() === todayStr
        : false;
      return Boolean(u.dailyBonusClaimedToday && isBonusToday);
    });
  }, [allUsers, todayStr]);

  const totalTodayBonusAmount = React.useMemo(() => {
    return todayClaimedUsers.reduce((sum, u) => {
      const amt = Number(u.dailyBonusToday) || 1.50;
      return sum + amt;
    }, 0);
  }, [todayClaimedUsers]);

  // Compute display sellers merging benchmark defaults, admin configured topSellers, and real users
  const displaySellers: TopSellerItem[] = React.useMemo(() => {
    // 1. Valid sellers configured by Admin in topSellers
    const validConfigured = (topSellers || []).filter(
      (s) => s && !isExcludedSeller(s.username, s.email, s.uid)
    );

    // 2. Real registered users
    const realUsersMapped: TopSellerItem[] = (allUsers || [])
      .filter((u) => u && !isExcludedSeller(u.username, u.email, u.uid))
      .map((u, idx) => ({
        uid: u.uid || `real_user_${idx}`,
        username: u.username || (u.email ? u.email.split('@')[0] : 'Seller'),
        email: u.email || '',
        photoURL: u.photoURL || '',
        totalEarnings: Number(u.totalEarnings) || (Number(u.balance || 0) + Number(u.total_withdrawn || 0)) || Number(u.balance || 0),
        balance: Number(u.balance) || 0,
        manual_approved_count: u.manual_approved_count !== undefined ? Number(u.manual_approved_count) : (Number(u.total_submitted) || 0),
        total_submitted: Number(u.total_submitted) || 0,
        badge: 'Gold Partner',
        rank: 0,
      }));

    const listMap = new Map<string, TopSellerItem>();

    // Seed benchmark sellers as default
    DEFAULT_BENCHMARK_SELLERS.forEach((item) => {
      if (!isExcludedSeller(item.username, item.email, item.uid)) {
        listMap.set(item.username.toLowerCase(), item);
      }
    });

    // Merge real registered users if they have activity/earnings
    realUsersMapped.forEach((item) => {
      if (item.totalEarnings > 0 || item.manual_approved_count > 0) {
        listMap.set(item.username.toLowerCase(), item);
      }
    });

    // Override with admin configured topSellers
    validConfigured.forEach((item) => {
      listMap.set(item.username.toLowerCase(), {
        ...item,
        totalEarnings: Number(item.totalEarnings) || 0,
        manual_approved_count: item.manual_approved_count !== undefined ? Number(item.manual_approved_count) : (Number(item.total_submitted) || 0),
      });
    });

    const combinedList = Array.from(listMap.values());
    combinedList.sort((a, b) => (Number(b.totalEarnings) || 0) - (Number(a.totalEarnings) || 0));

    return combinedList.slice(0, 10).map((seller, idx) => ({
      ...seller,
      rank: idx + 1,
      badge: idx === 0 ? 'VIP Champion' : idx < 3 ? 'Diamond VIP' : idx < 6 ? 'Gold Partner' : 'Silver Member',
    }));
  }, [topSellers, allUsers]);

  // Helper to compute payout/earnings from seller item
  const getEarning = (seller: TopSellerItem): number => {
    return Number(seller.totalEarnings) || (Number(seller.balance || 0) + Number(seller.total_withdrawn || 0)) || 0;
  };

  const getApprovedCount = (seller: TopSellerItem): number => {
    return seller.manual_approved_count !== undefined ? Number(seller.manual_approved_count) : (Number(seller.total_submitted) || 0);
  };

  const isSellerVerified = (seller: TopSellerItem): boolean => {
    if (seller.total_withdrawn && Number(seller.total_withdrawn) > 0) return true;
    const matched = allUsers.find(
      (u) =>
        u.uid === seller.uid ||
        (u.username && seller.username && u.username.toLowerCase() === seller.username.toLowerCase()) ||
        (u.email && seller.email && u.email.toLowerCase() === seller.email.toLowerCase())
    );
    if (matched && Number(matched.total_withdrawn) > 0) return true;
    if (seller.uid?.startsWith('top_')) return true;
    return false;
  };

  const topThree = displaySellers.slice(0, 3);
  const restSellers = displaySellers.slice(3, 10);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (isAdmin) {
      await syncRealUsersToTopSellers();
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleRealSync = async () => {
    setIsSyncing(true);
    const synced = await syncRealUsersToTopSellers();
    setIsSyncing(false);
    addNotification('রিয়েল ইউজার সিঙ্ক সফল 🏆', `${synced.length} জন সেলার ডাটাবেজ থেকে রিয়েলটাইমে আপডেট হয়েছে।`, 'success');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-28 space-y-4 animate-in fade-in">
      {/* Header Banner */}
      <div className="text-center py-2">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>{language === 'bn' ? 'টপ ১০ সেলার লিডারবোর্ড' : 'Top 10 Sellers Leaderboard'}</span>
          </div>
        </div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight">
          {language === 'bn' ? 'সেরা ১০ এক্সচেঞ্জ পার্টনারগণ 🏆' : 'Top 10 Exchange Champions 🏆'}
        </h2>
        <div className="flex items-center justify-center gap-2 mt-1">
          <p className="text-xs text-slate-500">
            {language === 'bn'
              ? 'এডমিন ভেরিফাইড সর্বোচ্চ আয়কারী সেরা ১০ সেলারের তালিকা'
              : 'Official verified leaderboard of top 10 earning sellers'}
          </p>
          <button
            onClick={handleRefresh}
            className="p-1 rounded-full bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all"
            title="Refresh List"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* When no top sellers configured yet */}
      {displaySellers.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-slate-800">
            {language === 'bn' ? 'টপ সেলার তালিকা প্রস্তুত হচ্ছে...' : 'Top Sellers Leaderboard Preparing...'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isAdmin
              ? 'এডমিন হিসেবে আপনি ওপরের "টপ ১০ সেলার ম্যানেজার" বাটন থেকে ১০ জন সেলার সেট করুন।'
              : 'এডমিন ভেরিফাইড টপ ১০ সেলারের তালিকা শীঘ্রই প্রকাশিত হবে।'}
          </p>
          {isAdmin ? (
            <button
              onClick={() => setActiveTab('admin_top_sellers')}
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold shadow hover:bg-amber-600 transition-all inline-flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>টপ ১০ সেলার সেট করুন</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setActiveTab('exchange');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow hover:bg-indigo-700 transition-all inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'bn' ? 'প্রথম সেলার হোন' : 'Become the 1st Seller'}</span>
            </button>
          )}
        </div>
      )}

      {/* Top 3 Podium Cards */}
      {displaySellers.length >= 1 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end pt-6 pb-2">
          {/* Rank 2 (Silver) */}
          {topThree[1] ? (
            <div className="rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-300/80 p-3 text-center shadow-sm relative pt-7">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-300 border-2 border-white shadow flex items-center justify-center font-black text-xs text-slate-800">
                🥈 2
              </div>
              {topThree[1].photoURL ? (
                <img src={topThree[1].photoURL} alt={topThree[1].username} width={40} height={40} loading="lazy" decoding="async" className="w-10 h-10 rounded-full object-cover mx-auto mb-1.5 shadow" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-400 text-white font-black text-sm flex items-center justify-center mx-auto mb-1.5 shadow">
                  {(topThree[1].username || topThree[1].email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-xs font-black text-slate-800 truncate flex items-center justify-center gap-0.5">
                <span>{topThree[1].username || topThree[1].email?.split('@')[0] || 'User'}</span>
                {isSellerVerified(topThree[1]) && (
                  <CheckCircle2 className="w-3 h-3 text-sky-500 fill-sky-500/20 shrink-0 inline" />
                )}
              </div>
              <div className="text-sm font-black text-indigo-700 mt-1">
                ৳{getEarning(topThree[1]).toLocaleString('en-US')}
              </div>
              <span className="inline-block text-[8px] font-black uppercase tracking-wider text-slate-700 bg-slate-300/80 px-2 py-0.5 rounded-full mt-1">
                {topThree[1].badge || 'Diamond VIP'}
              </span>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-200 p-4 text-center text-slate-400 text-xs font-bold">
              2nd Position Open
            </div>
          )}

          {/* Rank 1 (Gold - Taller & Highlighted) */}
          {topThree[0] && (
            <div className="rounded-2xl bg-gradient-to-b from-amber-100 via-amber-50 to-amber-200 border-2 border-amber-400 p-3.5 text-center shadow-lg relative pt-8 scale-105 z-10">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 border-2 border-white shadow-md flex items-center justify-center font-black text-sm text-white animate-bounce">
                👑 1
              </div>
              {topThree[0].photoURL ? (
                <img src={topThree[0].photoURL} alt={topThree[0].username} width={48} height={48} loading="lazy" decoding="async" className="w-12 h-12 rounded-full object-cover mx-auto mb-1.5 shadow-md ring-2 ring-amber-300" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white font-black text-base flex items-center justify-center mx-auto mb-1.5 shadow-md ring-2 ring-amber-300">
                  {(topThree[0].username || topThree[0].email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-xs font-black text-slate-900 truncate flex items-center justify-center gap-0.5">
                <span>{topThree[0].username || topThree[0].email?.split('@')[0] || 'Top Seller'}</span>
                {isSellerVerified(topThree[0]) && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 fill-amber-600/20 shrink-0 inline" />
                )}
              </div>
              <div className="text-base font-black text-indigo-800 mt-1">
                ৳{getEarning(topThree[0]).toLocaleString('en-US')}
              </div>
              <span className="inline-block text-[9px] font-black uppercase tracking-wider text-amber-800 bg-amber-300/80 px-2 py-0.5 rounded-full mt-1">
                {topThree[0].badge || 'VIP Champion'}
              </span>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {topThree[2] ? (
            <div className="rounded-2xl bg-gradient-to-b from-amber-50 to-orange-100 border border-orange-200 p-3 text-center shadow-sm relative pt-7">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-orange-300 border-2 border-white shadow flex items-center justify-center font-black text-xs text-white">
                🥉 3
              </div>
              {topThree[2].photoURL ? (
                <img src={topThree[2].photoURL} alt={topThree[2].username} width={40} height={40} loading="lazy" decoding="async" className="w-10 h-10 rounded-full object-cover mx-auto mb-1.5 shadow" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-orange-400 text-white font-black text-sm flex items-center justify-center mx-auto mb-1.5 shadow">
                  {(topThree[2].username || topThree[2].email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-xs font-black text-slate-800 truncate flex items-center justify-center gap-0.5">
                <span>{topThree[2].username || topThree[2].email?.split('@')[0] || 'User'}</span>
                {isSellerVerified(topThree[2]) && (
                  <CheckCircle2 className="w-3 h-3 text-orange-500 fill-orange-500/20 shrink-0 inline" />
                )}
              </div>
              <div className="text-sm font-black text-indigo-700 mt-1">
                ৳{getEarning(topThree[2]).toLocaleString('en-US')}
              </div>
              <span className="inline-block text-[8px] font-black uppercase tracking-wider text-orange-800 bg-orange-200 px-2 py-0.5 rounded-full mt-1">
                {topThree[2].badge || 'Gold Partner'}
              </span>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-200 p-4 text-center text-slate-400 text-xs font-bold">
              3rd Position Open
            </div>
          )}
        </div>
      )}

      {/* Rest of Leaderboard List (Rank 4 to 10) */}
      {restSellers.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'bn' ? 'শীর্ষ ৪-১০ র‍্যাংকিং তালিকা' : 'Top 4-10 Ranking List'}</span>
            </h4>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Admin Verified
            </span>
          </div>

          {restSellers.map((seller, index) => {
            const rank = index + 4;
            const levelBadge = seller.badge || 'Gold Partner';
            return (
              <div
                key={seller.uid || index}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-black text-xs text-slate-400">
                    #{rank}
                  </span>
                  {seller.photoURL ? (
                    <img src={seller.photoURL} alt={seller.username} width={36} height={36} loading="lazy" decoding="async" className="w-9 h-9 rounded-full object-cover shadow-xs" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shadow-xs">
                      {(seller.username || seller.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-extrabold text-slate-800">
                        {seller.username || seller.email?.split('@')[0] || 'Partner'}
                      </span>
                      {isSellerVerified(seller) && (
                        <CheckCircle2 className="w-3 h-3 text-indigo-500 inline" />
                      )}
                    </div>
                    <span className="text-[10px] text-indigo-600 font-bold">
                      {levelBadge}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-indigo-700">
                    ৳{getEarning(seller).toLocaleString('en-US')}
                  </div>
                  <span className="text-[9px] text-slate-400 font-semibold uppercase">Total Payout</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Motivation CTA */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-5 text-center shadow-lg">
        <Sparkles className="w-6 h-6 text-amber-300 mx-auto mb-1.5" />
        <h4 className="text-sm font-black">
          {language === 'bn' ? 'আপনিও হতে পারেন টপ সেলার!' : 'Become a Top Seller!'}
        </h4>
        <p className="text-xs text-indigo-100 max-w-sm mx-auto mt-1 mb-3">
          {language === 'bn'
            ? 'প্রতিদিন জিমেইল সাবমিট করে লেভেল ৫ আনলক করুন এবং সর্বোচ্চ রেট উপভোগ করুন।'
            : 'Submit daily, level up to Diamond VIP, and enjoy the highest exchange rates.'}
        </p>
        <button
          onClick={() => {
            setActiveTab('exchange');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="px-5 py-2.5 rounded-xl bg-white text-indigo-700 text-xs font-black shadow hover:bg-indigo-50 active:scale-95 transition-all"
        >
          {t.startSelling}
        </button>
      </div>
    </div>
  );
};
