import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { translations } from './i18n';
import { db } from './firebase';
import { ref, onValue } from 'firebase/database';
import { Star, ArrowRight, ShieldCheck, Pin } from 'lucide-react';
import { Review } from './types';

export const HomeReviewsPreview: React.FC = () => {
  const { setActiveTab, language } = useApp();
  const isBn = language === 'bn';
  const t = translations[language];
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number>(5.0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const reviewsRef = ref(db, 'reviews');
      const unsubscribe = onValue(reviewsRef, (snapshot) => {
        setLoading(false);
        const data = snapshot.val();
        if (data && typeof data === 'object') {
          const allList: Review[] = Object.keys(data).map((k) => ({
            ...data[k],
            id: k,
          }));

          // Only approved or legacy reviews
          const published = allList.filter((r) => {
            const rStatus = (r.status || '').toLowerCase();
            return rStatus === 'approved' || !r.status;
          });

          let sum = 0;
          published.forEach((r) => {
            sum += Number(r.rating) || 5;
          });

          setTotalCount(published.length);
          setAvgRating(published.length > 0 ? sum / published.length : 5.0);

          // Sort by pinned first, then by createdAt descending
          const sorted = [...published].sort((a, b) => {
            const pinA = (a as any).pinned ? 1 : 0;
            const pinB = (b as any).pinned ? 1 : 0;
            if (pinA !== pinB) {
              return pinB - pinA;
            }
            return (b.createdAt || 0) - (a.createdAt || 0);
          });

          setReviews(sorted.slice(0, 3));
        } else {
          setReviews([]);
          setTotalCount(0);
          setAvgRating(5.0);
        }
      }, () => {
        setLoading(false);
      });

      return () => unsubscribe();
    } catch {
      setLoading(false);
    }
  }, []);

  if (loading || reviews.length === 0) return null;

  return (
    <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
            {t.customerReviews}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs font-black text-slate-800">{avgRating.toFixed(1)}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`w-3 h-3 ${i <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`} />
              ))}
            </div>
            <span className="text-[10px] text-slate-500 font-bold">({totalCount})</span>
          </div>
        </div>
        <button 
          onClick={() => setActiveTab('reviews')}
          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          {t.viewAll} <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-3">
        {reviews.map(r => {
          const uName = r.userName || (r as any).name || 'User';
          const uPhoto = r.userPhoto || (r as any).avatarUrl || (r as any).avatar || (r as any).photoUrl || (r as any).photo || (r as any).photoURL || '';
          const uRating = Number(r.rating) || 5;
          const isPinned = (r as any).pinned || false;
          const isVerified = r.isVerified || (r as any).isVerified || false;
          const textToShow = r.text || (r as any).comment || '';

          return (
            <div key={r.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100/80 hover:border-indigo-100 transition-all duration-200">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  {/* Profile Picture Resolver */}
                  {uPhoto ? (
                    <img
                      src={uPhoto}
                      alt={uName}
                      width={32}
                      height={32}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const sibling = e.currentTarget.nextElementSibling as HTMLElement;
                        if (sibling) sibling.style.display = 'flex';
                      }}
                    />
                  ) : null}

                  {/* Fallback Letter Placeholder */}
                  {uPhoto ? (
                    <div 
                      style={{ display: 'none' }}
                      className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-extrabold text-xs flex items-center justify-center shrink-0 border border-indigo-100"
                    >
                      {uName.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-extrabold text-xs flex items-center justify-center shrink-0 border border-indigo-100">
                      {uName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <div className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5 flex-wrap">
                      {uName}
                      {isVerified && (
                        <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded-full bg-emerald-50 text-emerald-600 text-[7px] font-black tracking-wide border border-emerald-100">
                          <ShieldCheck className="w-2 h-2" />
                          {isBn ? 'ভেরিফাইড' : 'Verified'}
                        </span>
                      )}
                      {isPinned && (
                        <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded-full bg-amber-50 text-amber-600 text-[7px] font-black tracking-wide border border-amber-200">
                          <Pin className="w-2 h-2 fill-amber-500 text-amber-500" />
                          {isBn ? 'পিনড' : 'Pinned'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} className={`w-2.5 h-2.5 ${i <= uRating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                        ))}
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold">
                        {new Date(r.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed pl-1">
                "{textToShow}"
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
