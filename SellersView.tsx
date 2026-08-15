import React from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../lib/i18n';
import { Trophy, Medal, Award, Flame, Sparkles } from 'lucide-react';

export const SellersView: React.FC = () => {
  const { language, allUsers, setActiveTab } = useApp();
  const t = translations[language];

  // Sort sellers by balance / approved count
  const sortedSellers = [...allUsers]
    .sort((a, b) => (Number(b.balance) || 0) - (Number(a.balance) || 0));

  const topThree = sortedSellers.slice(0, 3);
  const restSellers = sortedSellers.slice(3, 15);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 space-y-4">
      {/* Header Banner */}
      <div className="text-center py-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black mb-1.5">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span>{language === 'bn' ? 'টপ সেলার লিডারবোর্ড' : 'Top Sellers Leaderboard'}</span>
        </div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight">
          {language === 'bn' ? 'সেরা এক্সচেঞ্জ পার্টনারগণ 🏆' : 'Top Exchange Champions 🏆'}
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
          {language === 'bn'
            ? 'নিয়মিত জিমেইল বিক্রি করে সর্বোচ্চ আয়কারী টপ পারফর্মারদের তালিকা'
            : 'Highest earners and most active Gmail sellers in our verified community'}
        </p>
      </div>

      {/* Top 3 Podium Cards */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end pt-6 pb-2">
          {/* Rank 2 (Silver) */}
          {topThree[1] && (
            <div className="rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-300/80 p-3 text-center shadow-sm relative pt-7">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-300 border-2 border-white shadow flex items-center justify-center font-black text-xs text-slate-800">
                🥈 2
              </div>
              {topThree[1].photoURL ? (
                <img src={topThree[1].photoURL} alt={topThree[1].username} className="w-10 h-10 rounded-full object-cover mx-auto mb-1.5 shadow" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-400 text-white font-black text-sm flex items-center justify-center mx-auto mb-1.5 shadow">
                  {(topThree[1].username || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-xs font-black text-slate-800 truncate">
                {topThree[1].username}
              </div>
              <div className="text-sm font-black text-indigo-700 mt-1">
                ৳{(Number(topThree[1].balance) || 0).toFixed(0)}
              </div>
            </div>
          )}

          {/* Rank 1 (Gold - Taller) */}
          {topThree[0] && (
            <div className="rounded-2xl bg-gradient-to-b from-amber-100 via-amber-50 to-amber-200 border-2 border-amber-400 p-3.5 text-center shadow-lg relative pt-8 scale-105 z-10">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 border-2 border-white shadow-md flex items-center justify-center font-black text-sm text-white animate-bounce">
                👑 1
              </div>
              {topThree[0].photoURL ? (
                <img src={topThree[0].photoURL} alt={topThree[0].username} className="w-12 h-12 rounded-full object-cover mx-auto mb-1.5 shadow-md ring-2 ring-amber-300" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white font-black text-base flex items-center justify-center mx-auto mb-1.5 shadow-md ring-2 ring-amber-300">
                  {(topThree[0].username || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-xs font-black text-slate-900 truncate">
                {topThree[0].username}
              </div>
              <div className="text-base font-black text-indigo-800 mt-1">
                ৳{(Number(topThree[0].balance) || 0).toFixed(0)}
              </div>
              <span className="inline-block text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-300/60 px-2 py-0.5 rounded-full mt-1">
                Champion
              </span>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {topThree[2] && (
            <div className="rounded-2xl bg-gradient-to-b from-amber-50 to-orange-100 border border-orange-200 p-3 text-center shadow-sm relative pt-7">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-orange-300 border-2 border-white shadow flex items-center justify-center font-black text-xs text-white">
                🥉 3
              </div>
              {topThree[2].photoURL ? (
                <img src={topThree[2].photoURL} alt={topThree[2].username} className="w-10 h-10 rounded-full object-cover mx-auto mb-1.5 shadow" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-orange-400 text-white font-black text-sm flex items-center justify-center mx-auto mb-1.5 shadow">
                  {(topThree[2].username || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-xs font-black text-slate-800 truncate">
                {topThree[2].username}
              </div>
              <div className="text-sm font-black text-indigo-700 mt-1">
                ৳{(Number(topThree[2].balance) || 0).toFixed(0)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rest of Leaderboard List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 space-y-2">
        <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
          {language === 'bn' ? 'শীর্ষ র‍্যাংকিং তালিকা' : 'Top Ranking List'}
        </h4>

        {restSellers.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs font-bold">
            {language === 'bn' ? 'আর কোনো সেলার পাওয়া যায়নি।' : 'No more sellers found.'}
          </div>
        ) : (
          restSellers.map((seller, index) => {
            const rank = index + 4;
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
                    <img src={seller.photoURL} alt={seller.username} className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {(seller.username || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-extrabold text-slate-800 block">
                      {seller.username}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Level {(seller.manual_approved_count && seller.manual_approved_count > 100) ? '3+' : '1+'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-indigo-700">
                    ৳{(Number(seller.balance) || 0).toFixed(0)}
                  </div>
                  <span className="text-[9px] text-slate-400 font-semibold uppercase">Total Payout</span>
                </div>
              </div>
            );
          })
        )}
      </div>

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
          onClick={() => setActiveTab('exchange')}
          className="px-5 py-2.5 rounded-xl bg-white text-indigo-700 text-xs font-black shadow hover:bg-indigo-50 active:scale-95 transition-all"
        >
          {t.startSelling}
        </button>
      </div>
    </div>
  );
};
