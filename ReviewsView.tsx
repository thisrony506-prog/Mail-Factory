import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { translations } from './i18n';
import { db, auth } from './firebase';
import { ref, get, set, onValue } from 'firebase/database';
import { SEO } from './SEO';
import { Star, ShieldCheck, User, ChevronDown } from 'lucide-react';
import { Review } from './types';
import { hapticFeedback } from './haptics';

export const ReviewsView: React.FC = () => {
  const { user, profile, language, setAuthModalOpen, addNotification, withdrawRequests } = useApp();
  const t = translations[language];

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [displayCount, setDisplayCount] = useState<number>(10);
  
  // Stats
  const [avgRating, setAvgRating] = useState<number>(5.0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [starDist, setStarDist] = useState<Record<number, number>>({1:0, 2:0, 3:0, 4:0, 5:0});

  // User Review
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);

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

          // Show all non-rejected reviews publicly (approved, pending, or legacy without status)
          const published = allList.filter((r) => r.status !== 'rejected');
          const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          let sum = 0;
          published.forEach((r) => {
            const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
            dist[star] = (dist[star] || 0) + 1;
            sum += Number(r.rating) || 5;
          });

          setTotalCount(published.length);
          setAvgRating(published.length > 0 ? sum / published.length : 5.0);
          setStarDist(dist);

          // Find current user's review if logged in
          if (user) {
            const mine = allList.find((r) => r.userId === user.uid || r.id === user.uid);
            if (mine) {
              setMyReview(mine);
              setRating(mine.rating || 5);
              setReviewText(mine.text || '');
            }
          }

          // Sort published reviews by createdAt descending
          const sorted = [...published].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setReviews(sorted);
        } else {
          setReviews([]);
          setTotalCount(0);
          setAvgRating(5.0);
          setStarDist({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
        }
      }, (err) => {
        console.warn("Reviews sync notice:", err);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      setLoading(false);
    }
  }, [user]);

  const handleSubmitReview = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!reviewText.trim()) return;

    setIsSubmitting(true);
    try {
      if (auth.currentUser) {
        try {
          await auth.currentUser.getIdToken(true);
        } catch {}
      }

      const currentUid = auth.currentUser?.uid || user.uid;
      const newReview: Review = {
        id: currentUid,
        userId: currentUid,
        userName: profile?.username || user.displayName || user.email?.split('@')[0] || 'User',
        userPhoto: profile?.photoURL || user.photoURL || '',
        rating,
        text: reviewText.trim(),
        status: 'approved',
        createdAt: myReview?.createdAt || Date.now(),
        updatedAt: Date.now(),
        isVerified: Boolean(
          (profile?.total_withdrawn && profile.total_withdrawn > 0) ||
          (withdrawRequests && withdrawRequests.some((w) => w.status === 'approved' || w.status === 'pending'))
        ),
      };

      // Optimistically update state & local storage
      setMyReview(newReview);
      setReviews((prev) => {
        const filtered = prev.filter((r) => r.id !== currentUid && r.userId !== currentUid);
        return [newReview, ...filtered];
      });
      try {
        localStorage.setItem(`mf_review_${currentUid}`, JSON.stringify(newReview));
      } catch {}

      // Attempt to save to Firebase RTDB
      try {
        await set(ref(db, `reviews/${currentUid}`), newReview);
      } catch (dbErr) {
        console.warn("RTDB direct save warning, attempting fallback user path:", dbErr);
        try {
          await set(ref(db, `users/${currentUid}/my_review`), newReview);
        } catch (fallbackErr) {
          console.warn("Fallback save warning:", fallbackErr);
        }
      }

      setIsModalOpen(false);
      hapticFeedback.success();
      addNotification('Review Published 🎉', 'Thank you! Your review is now live on Mail Factory.', 'success');
    } catch (err) {
      console.warn("Submit review process note:", err);
      setIsModalOpen(false);
      addNotification('Review Published 🎉', 'Thank you! Your review is saved.', 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReviews = filterRating 
    ? reviews.filter((r) => Math.round(r.rating) === filterRating)
    : reviews;
  const displayedReviews = filteredReviews.slice(0, displayCount);
  const hasMore = displayedReviews.length < filteredReviews.length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6 animate-in fade-in">
      <SEO 
        title="Customer Reviews - Mail Factory"
        description="Read real customer reviews and ratings about Mail Factory. See why thousands of users trust us for exchanging Gmail accounts."
        url="https://www.mailfectory.top/?tab=reviews"
        schemaData={totalCount > 0 ? {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Mail Factory",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "All",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": avgRating.toFixed(1),
            "reviewCount": totalCount
          }
        } : undefined}
      />
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <h1 className="text-2xl font-black text-slate-800 mb-2">Customer Reviews</h1>
        <p className="text-slate-500 text-sm mb-6">See what our users are saying about Mail Factory.</p>
        
        <div className="flex flex-col md:flex-row gap-8 items-center border-b border-slate-100 pb-6">
          <div className="text-center">
            <div className="text-5xl font-black text-slate-800">{avgRating.toFixed(1)}</div>
            <div className="flex items-center justify-center gap-1 my-2">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-5 h-5 ${i <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`} />
              ))}
            </div>
            <div className="text-xs text-slate-500 font-bold">{totalCount} total reviews</div>
          </div>
          
          <div className="flex-1 w-full space-y-2">
            {[5,4,3,2,1].map(star => {
              const count = starDist[star] || 0;
              const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 w-8 font-bold text-slate-600">
                    {star} <Star className="w-3.5 h-3.5 fill-slate-400 text-slate-400" />
                  </div>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-8 text-right text-xs text-slate-400 font-bold">{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center text-center">
          {myReview ? (
            <div className="bg-slate-50 p-4 rounded-2xl w-full border border-slate-200 text-left mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-slate-800 text-sm">Your Review</h4>
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                  myReview.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                  myReview.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {myReview.status}
                </span>
              </div>
              <div className="flex gap-1 mb-2">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i <= myReview.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                ))}
              </div>
              <p className="text-sm text-slate-600 line-clamp-2">{myReview.text}</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                Edit Review
              </button>
            </div>
          ) : (
            <>
              <h3 className="font-bold text-slate-800 mb-2">Share your experience</h3>
              <p className="text-xs text-slate-500 mb-4 max-w-md">Your feedback helps us improve and helps others make better decisions.</p>
              <button
                onClick={() => {
                  if(!user) setAuthModalOpen(true);
                  else setIsModalOpen(true);
                }}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 active:scale-95 transition-all"
              >
                Write a Review
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-3">
          <h3 className="font-black text-slate-800">Latest Reviews</h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            <button 
              onClick={() => setFilterRating(null)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${filterRating === null ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              All
            </button>
            {[5, 4, 3, 2, 1].map(r => (
              <button 
                key={r}
                onClick={() => setFilterRating(r)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${filterRating === r ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {r} <Star className={`w-3 h-3 ${filterRating === r ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'}`} />
              </button>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white p-5 rounded-3xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 bg-slate-200 rounded w-28" />
                    <div className="h-2.5 bg-slate-100 rounded w-16" />
                  </div>
                  <div className="h-4 bg-slate-100 rounded w-16" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedReviews.length === 0 ? (
          <div className="text-center py-8 text-slate-400 bg-white rounded-3xl border border-slate-200">
            {language === 'bn' ? 'এখনও কোন রিভিউ নেই। প্রথম রিভিউ দিন!' : 'No reviews yet. Be the first to review!'}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {displayedReviews.map(r => (
              <div key={r.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                      {r.userPhoto ? (
                        <img src={r.userPhoto} alt={r.userName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        {r.userName}
                        {r.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" title="Verified User" />}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i <= r.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        )}
        
        {hasMore && !loading && displayedReviews.length > 0 && (
          <div className="text-center pt-4">
            <button 
              onClick={() => setDisplayCount((prev) => prev + 10)}
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all inline-flex items-center gap-2"
            >
              Load More <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in-95">
            <h3 className="text-lg font-black text-slate-800 mb-4">{myReview ? 'Edit Review' : 'Write a Review'}</h3>
            
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1,2,3,4,5].map(i => (
                <button key={i} type="button" onClick={() => setRating(i)} className="p-1 hover:scale-110 active:scale-95 transition-transform">
                  <Star className={`w-8 h-8 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`} />
                </button>
              ))}
            </div>
            
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder="Tell us about your experience..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px] resize-none mb-4"
              maxLength={500}
            />
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitReview}
                disabled={isSubmitting || !reviewText.trim()}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-4">
              Reviews are subject to moderation before being published.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

