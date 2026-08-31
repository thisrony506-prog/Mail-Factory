import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { translations } from './i18n';
import { db } from './firebase';
import { ref, set, onValue, push, remove, update } from 'firebase/database';
import Swal from 'sweetalert2';
import { SEO } from './SEO';
import { 
  Star, 
  ShieldCheck, 
  User, 
  ChevronDown, 
  Sparkles, 
  MessageSquare, 
  PlusCircle, 
  Calendar, 
  Check, 
  Pin, 
  Clock, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  Loader2 
} from 'lucide-react';
import { hapticFeedback } from './haptics';

export const ReviewsView: React.FC = () => {
  const { user, profile, language, setAuthModalOpen, addNotification } = useApp();
  const isBn = language === 'bn';

  // Global approved reviews for the public feed
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [displayCount, setDisplayCount] = useState<number>(10);
  
  // Public Feed Stats
  const [avgRating, setAvgRating] = useState<number>(5.0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [starDist, setStarDist] = useState<Record<number, number>>({1:0, 2:0, 3:0, 4:0, 5:0});

  // User Reviews & Status Tracker State (real-time from user_reviews/${uid})
  const [myTrackedReviews, setMyTrackedReviews] = useState<any[]>([]);
  const [trackingLoading, setTrackingLoading] = useState<boolean>(false);

  // Review Input State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  // Listen to Global Public Feed
  useEffect(() => {
    try {
      const reviewsRef = ref(db, 'reviews');
      const unsubscribe = onValue(reviewsRef, (snapshot) => {
        setLoading(false);
        const data = snapshot.val();
        if (data && typeof data === 'object') {
          const allList: any[] = Object.keys(data).map((k) => ({
            ...data[k],
            id: k,
          }));

          // Show all approved reviews (or legacy without status)
          const published = allList.filter((r) => {
            const rStatus = (r.status || '').toLowerCase();
            return rStatus === 'approved' || !r.status;
          });

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

          // Sort published reviews by pinned first, then by createdAt descending
          const sorted = [...published].sort((a, b) => {
            const pinA = a.pinned ? 1 : 0;
            const pinB = b.pinned ? 1 : 0;
            if (pinA !== pinB) {
              return pinB - pinA;
            }
            return (b.createdAt || 0) - (a.createdAt || 0);
          });
          setReviews(sorted);
        } else {
          setReviews([]);
          setTotalCount(0);
          setAvgRating(5.0);
          setStarDist({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
        }
      }, (err) => {
        console.warn("Public reviews sync notice:", err);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      setLoading(false);
    }
  }, []);

  // Listen to Real-time User Reviews & Tracker (user_reviews/${uid})
  useEffect(() => {
    if (!user) {
      setMyTrackedReviews([]);
      setTrackingLoading(false);
      return;
    }
    setTrackingLoading(true);
    try {
      const userReviewsRef = ref(db, `user_reviews/${user.uid}`);
      const unsubscribe = onValue(userReviewsRef, (snapshot) => {
        setTrackingLoading(false);
        const data = snapshot.val();
        if (data && typeof data === 'object') {
          const list = Object.keys(data).map((key) => ({
            ...data[key],
            id: key,
          })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setMyTrackedReviews(list);
        } else {
          setMyTrackedReviews([]);
        }
      }, (err) => {
        console.warn("User reviews sync notice:", err);
        setTrackingLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      setTrackingLoading(false);
    }
  }, [user]);

  // Open write review modal
  const handleOpenWriteReview = (existingReview?: any) => {
    if (!user) {
      setAuthModalOpen(true, 'login');
      return;
    }

    // Enforce one review per user limit. If trying to create new but one already exists, direct to edit
    if (!existingReview && myTrackedReviews.length > 0) {
      const firstReview = myTrackedReviews[0];
      setEditingReviewId(firstReview.id);
      setRating(firstReview.rating || 5);
      setReviewText(firstReview.comment || '');
      addNotification(
        isBn ? 'ইতিমধ্যে রিভিউ দিয়েছেন' : 'Review Already Submitted',
        isBn 
          ? 'আপনি ইতিমধ্যে একটি রিভিউ দিয়েছেন। আপনি শুধুমাত্র আপনার আগের রিভিউটি পরিবর্তন বা এডিট করতে পারবেন।' 
          : 'You have already submitted a review. You can only edit your existing feedback.',
        'info'
      );
      setIsModalOpen(true);
      return;
    }

    if (existingReview) {
      setEditingReviewId(existingReview.id);
      setRating(existingReview.rating || 5);
      setReviewText(existingReview.comment || '');
    } else {
      setEditingReviewId(null);
      setRating(5);
      setReviewText('');
    }
    setIsModalOpen(true);
  };

  // Submit/Update user review under user_reviews/${user.uid}/${reviewId}
  const handleSubmitReview = async () => {
    if (!user) {
      setAuthModalOpen(true, 'login');
      return;
    }

    const trimmedComment = reviewText.trim();
    if (!trimmedComment) {
      Swal.fire({
        title: isBn ? 'কমেন্ট প্রয়োজন ⚠️' : 'Comment Required ⚠️',
        text: isBn ? 'অনুগ্রহ করে আপনার মূল্যবান মতামতটি লিখুন।' : 'Please enter your valuable feedback.',
        icon: 'warning',
        confirmButtonColor: '#4f46e5',
        confirmButtonText: isBn ? 'ঠিক আছে' : 'OK',
        customClass: {
          popup: 'rounded-3xl border border-slate-100',
          confirmButton: 'rounded-xl px-5 py-2.5 text-xs font-black text-white'
        }
      });
      return;
    }

    if (trimmedComment.length < 10) {
      Swal.fire({
        title: isBn ? 'রিভিউটি অত্যন্ত সংক্ষিপ্ত ⚠️' : 'Review is too short ⚠️',
        text: isBn 
          ? 'আপনার মূল্যবান মতামতটি কমপক্ষে ১০ অক্ষরের হতে হবে (যেমন: "খুব সুন্দর সার্ভিস, ধন্যবাদ")।' 
          : 'Your valuable feedback must be at least 10 characters long (e.g. "Excellent service, thanks").',
        icon: 'warning',
        confirmButtonColor: '#4f46e5',
        confirmButtonText: isBn ? 'ঠিক আছে' : 'OK',
        customClass: {
          popup: 'rounded-3xl border border-slate-100',
          confirmButton: 'rounded-xl px-5 py-2.5 text-xs font-black text-white'
        }
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewId = editingReviewId || push(ref(db, `user_reviews/${user.uid}`)).key || Date.now().toString();

      const newReview = {
        id: reviewId,
        userId: user.uid,
        userName: profile?.username || user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        avatarUrl: profile?.photoURL || user.photoURL || '',
        rating: Number(rating),
        comment: trimmedComment,
        status: 'pending', // Default status remains pending as requested
        createdAt: Date.now(),
      };

      const updates: Record<string, any> = {};
      updates[`user_reviews/${user.uid}/${reviewId}`] = newReview;
      updates[`reviews/${reviewId}`] = newReview;

      await update(ref(db), updates);

      setIsModalOpen(false);
      hapticFeedback.success();

      Swal.fire({
        title: isBn ? 'রিভিউ সাবমিট হয়েছে 🎉' : 'Review Submitted 🎉',
        text: isBn 
          ? 'ধন্যবাদ! আপনার কাস্টমার রিভিউটি সফলভাবে সাবমিট হয়েছে এবং অনুমোদনের জন্য অপেক্ষমান রয়েছে।' 
          : 'Thank you! Your customer review was successfully submitted and is pending approval.',
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        confirmButtonText: isBn ? 'ঠিক আছে' : 'OK',
        customClass: {
          popup: 'rounded-3xl border border-slate-100',
          confirmButton: 'rounded-xl px-5 py-2.5 text-xs font-black text-white'
        }
      });
    } catch (err: any) {
      console.warn("Submit review process note:", err);
      setIsModalOpen(false);
      
      const errMsg = String(err?.message || err || '').toLowerCase();
      const isPermissionDenied = errMsg.includes('permission') || errMsg.includes('denied') || errMsg.includes('unauthorized');

      if (isPermissionDenied) {
        Swal.fire({
          title: isBn ? 'ডাটাবেজ পারমিশন ত্রুটি ⚠️' : 'Database Permission Error ⚠️',
          text: isBn 
            ? 'ফায়ারবেস ডাটাবেজের "reviews" অথবা "user_reviews" নোডে লেখার অনুমতি নেই। অনুগ্রহ করে চ্যাটে প্রদানকৃত নতুন সিকিউরিটি রুলসটি আপনার ফায়ারবেস কনসোলে আপডেট করুন।' 
            : 'Firebase does not have permission to write to "reviews" or "user_reviews". Please copy and paste the updated Database Rules provided in the chat into your Firebase Console.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          confirmButtonText: isBn ? 'ঠিক আছে' : 'OK'
        });
      } else {
        Swal.fire({
          title: isBn ? 'ত্রুটি হয়েছে' : 'Submission Error',
          text: isBn 
            ? 'দুঃখিত, রিভিউটি সাবমিট করা যায়নি। আবার চেষ্টা করুন।' 
            : 'Could not submit review. Please try again.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          confirmButtonText: isBn ? 'ঠিক আছে' : 'OK'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a review from user tracker atomically across both reviews and user_reviews nodes
  const handleDeleteTrackedReview = async (reviewId: string) => {
    if (!user) return;
    hapticFeedback.medium();
    
    const result = await Swal.fire({
      title: isBn ? 'আপনি কি নিশ্চিত?' : 'Are you sure?',
      text: isBn ? 'আপনি কি এই কাস্টমার রিভিউটি ডিলিট করতে চান?' : 'Do you really want to delete this customer review?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: isBn ? 'হ্যাঁ, ডিলিট করুন' : 'Yes, delete it!',
      cancelButtonText: isBn ? 'বাতিল' : 'Cancel',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-3xl border border-slate-100',
        confirmButton: 'rounded-xl px-5 py-2.5 text-xs font-black text-white',
        cancelButton: 'rounded-xl px-5 py-2.5 text-xs font-black text-white'
      }
    });

    if (result.isConfirmed) {
      try {
        const updates: Record<string, any> = {};
        updates[`user_reviews/${user.uid}/${reviewId}`] = null;
        updates[`reviews/${reviewId}`] = null;
        
        await update(ref(db), updates);
        
        hapticFeedback.success();
        Swal.fire({
          title: isBn ? 'ডিলিট হয়েছে!' : 'Deleted!',
          text: isBn ? 'আপনার কাস্টমার রিভিউটি সফলভাবে ডিলিট করা হয়েছে।' : 'Your customer review has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#4f46e5',
          confirmButtonText: isBn ? 'ঠিক আছে' : 'OK',
          customClass: {
            popup: 'rounded-3xl border border-slate-100',
            confirmButton: 'rounded-xl px-5 py-2.5 text-xs font-black text-white'
          }
        });
      } catch (err) {
        console.warn("Delete review error:", err);
        Swal.fire({
          title: isBn ? 'ত্রুটি হয়েছে' : 'Error',
          text: isBn ? 'রিভিউটি ডিলিট করা যায়নি। আবার চেষ্টা করুন।' : 'Could not delete the review. Please try again.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          confirmButtonText: isBn ? 'ঠিক আছে' : 'OK'
        });
      }
    }
  };

  const filteredReviews = filterRating 
    ? reviews.filter((r) => Math.round(r.rating) === filterRating)
    : reviews;
  const displayedReviews = (filteredReviews || []).slice(0, displayCount);
  const hasMore = displayedReviews.length < filteredReviews.length;

  const getAvatarGradient = (char: string) => {
    const code = char.charCodeAt(0) % 5;
    const gradients = [
      'from-indigo-500 to-purple-600',
      'from-emerald-500 to-teal-600',
      'from-blue-500 to-indigo-600',
      'from-amber-500 to-orange-600',
      'from-rose-500 to-pink-600'
    ];
    return gradients[code];
  };

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

      {/* Top Hero Banner & Analytics Card */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
          <div>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black tracking-wider uppercase mb-3">
              <Sparkles className="w-3 h-3" /> {isBn ? 'গ্রাহকদের মতামত' : 'Community Feedbacks'}
            </span>
            <h1 className="text-2xl font-black text-slate-800 leading-tight">
              {isBn ? 'কাস্টমার রিভিউ ও রেটিংস' : 'Customer Reviews & Ratings'}
            </h1>
            <p className="text-slate-500 text-xs mt-1.5 max-w-xl">
              {isBn 
                ? 'মেল ফ্যাক্টরির সাথে গ্রাহকদের রিয়েল-টাইম অভিজ্ঞতা এবং কাজের সৎ মতামত দেখুন।' 
                : 'See the verified experiences and honest ratings from exchangers across the nation.'}
            </p>
          </div>

          {myTrackedReviews.length === 0 && (
            <div>
              <button
                onClick={() => handleOpenWriteReview()}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 text-white font-black text-xs shadow-md shadow-indigo-600/10 hover:bg-indigo-500 active:scale-95 hover:shadow-lg transition-all cursor-pointer w-full md:w-auto justify-center"
              >
                <PlusCircle className="w-4 h-4" /> {isBn ? 'একটি রিভিউ লিখুন' : 'Write a Review'}
              </button>
            </div>
          )}
        </div>
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-t border-slate-100 pt-6 relative z-10">
          <div className="text-center md:border-r border-slate-100 py-2">
            <div className="text-6xl font-black text-slate-800 tracking-tight">{avgRating.toFixed(1)}</div>
            <div className="flex items-center justify-center gap-0.5 my-2.5">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-4 h-4 ${i <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`} />
              ))}
            </div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              {totalCount} {isBn ? 'টি মোট রিভিউ' : 'total reviews'}
            </div>
          </div>
          
          <div className="col-span-2 space-y-2">
            {[5,4,3,2,1].map(star => {
              const count = starDist[star] || 0;
              const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                  <div className="flex items-center gap-1 w-8 font-black">
                    {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                  <div className="w-8 text-right text-slate-400 font-black">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Real-time "My Review & Status Tracker" Section */}
      {user && (
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-indigo-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                <Clock className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-tight flex items-center gap-2">
                  {isBn ? 'আমার রিভিউ ও স্ট্যাটাস ট্র্যাকার' : 'My Review & Status Tracker'}
                  <span className="text-[9px] bg-indigo-500/30 text-indigo-200 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {isBn ? 'রিয়েল-টাইম' : 'Live'}
                  </span>
                </h2>
                <p className="text-[10px] text-slate-400 font-medium">
                  {isBn ? 'অ্যাডমিন মডারেশন ট্র্যাক করুন সরাসরি আপনার একাউন্ট থেকে' : 'Track admin review statuses in real-time'}
                </p>
              </div>
            </div>


          </div>

          {trackingLoading ? (
            <div className="flex items-center justify-center py-6 text-slate-400 text-xs font-bold gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {isBn ? 'লোড হচ্ছে...' : 'Syncing Tracker...'}
            </div>
          ) : myTrackedReviews.length === 0 ? (
            <div className="text-center py-8 rounded-2xl bg-white/5 border border-white/5 text-slate-400 space-y-2">
              <p className="text-xs font-bold">
                {isBn ? 'আপনি এখনো কোনো কাস্টমার রিভিউ সাবমিট করেননি।' : 'You have not submitted any customer reviews yet.'}
              </p>
              <button 
                onClick={() => handleOpenWriteReview()}
                className="text-xs font-black text-indigo-400 hover:text-indigo-300 hover:underline transition-all cursor-pointer"
              >
                {isBn ? 'এখানে ক্লিক করে প্রথম রিভিউটি দিন ⚡' : 'Click here to submit your first feedback ⚡'}
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {myTrackedReviews.map((r) => {
                const isPending = r.status === 'pending';
                const isApproved = r.status === 'approved';
                const isRejected = r.status === 'rejected';

                return (
                  <div key={r.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2.5 flex-1">
                      {/* Name & Avatar & Stars */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-indigo-500/10 border border-indigo-400/20">
                          {r.avatarUrl ? (
                            <img src={r.avatarUrl} alt={r.userName} width={36} height={36} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-black uppercase text-indigo-200">
                              {(r.userName || 'U').charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-100 flex items-center gap-1">
                            {r.userName || 'Anonymous Exchanger'}
                          </div>
                          <div className="flex gap-0.5 mt-0.5">
                            {[1,2,3,4,5].map(starIdx => (
                              <Star key={starIdx} className={`w-3 h-3 ${starIdx <= (r.rating || 5) ? 'fill-amber-400 text-amber-400' : 'fill-slate-800 text-slate-700'}`} />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Comment body */}
                      <p className="text-xs text-slate-300 font-medium leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                        "{r.comment || r.text || ''}"
                      </p>

                      <div className="text-[10px] text-slate-500 font-bold">
                        {isBn ? 'সাবমিট করা হয়েছে' : 'Submitted'}: {new Date(r.createdAt || Date.now()).toLocaleString()}
                      </div>
                    </div>

                    {/* Status Tracking Steps Card */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 border-t md:border-t-0 border-white/5 pt-4 md:pt-0 shrink-0">
                      {/* Status Flow Badge */}
                      <div className="flex flex-col gap-1 sm:text-right">
                        <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">
                          {isBn ? 'ভেরিফিকেশন স্ট্যাটাস' : 'Verification Status'}
                        </span>
                        <div>
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-black border border-amber-500/20">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              {isBn ? 'পেন্ডিং' : 'Pending Verification'}
                            </span>
                          )}
                          {isApproved && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-black border border-emerald-500/20">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              {isBn ? 'পাবলিক হয়েছে (অনুমোদিত)' : 'Published & Live'}
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-black border border-rose-500/20">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {isBn ? 'প্রত্যাখ্যাত / সংশোধন প্রয়োজন' : 'Rejected'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Tracker Controls */}
                      <div className="flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => handleOpenWriteReview(r)}
                          className="p-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/10 active:scale-95"
                          title={isBn ? "রিভিউ এডিট করুন" : "Edit Review"}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          {isBn ? 'রিভিউ পরিবর্তন করুন' : 'Modify Review'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Review List Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-3">
          <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-500" />
            {isBn ? 'সদস্যদের সাম্প্রতিক রিভিউ সমূহ' : 'Latest Member Reviews'}
          </h3>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
            <button 
              onClick={() => setFilterRating(null)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-black whitespace-nowrap transition-all cursor-pointer ${filterRating === null ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'}`}
            >
              {isBn ? 'সব রিভিউ' : 'All'}
            </button>
            {[5, 4, 3, 2, 1].map(r => (
              <button 
                key={r}
                onClick={() => setFilterRating(r)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-black whitespace-nowrap transition-all cursor-pointer ${filterRating === r ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'}`}
              >
                {r} <Star className={`w-2.5 h-2.5 ${filterRating === r ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'}`} />
              </button>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white p-5 rounded-3xl border border-slate-200/80 space-y-3">
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
          <div className="text-center py-12 text-slate-400 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold">
              {isBn ? 'এখনও কোন রিভিউ নেই। প্রথম রিভিউ দিন!' : 'No reviews yet. Be the first to share your thoughts!'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {displayedReviews.map((r, index) => {
              const uName = r.name || r.userName || 'Exchanger';
              const uComment = r.comment || r.text || '';
              const uRating = Number(r.rating) || 5;
              const uPhoto = r.avatarUrl || r.userPhoto || '';
              const initialLetter = uName.charAt(0).toUpperCase();

              return (
                <div 
                  key={r.id || index} 
                  className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200/60 hover:border-indigo-200/80 hover:scale-[1.01] hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* User Profile Info & Rating */}
                    <div className="flex justify-between items-start gap-2 mb-3.5">
                      {/* ইউজার অ্যাপের রিভিউ কার্ডের বাম পাশে এটি বসিয়ে দিন */}
                      <div className="flex items-center gap-3">
                        {/* ডাইনামিক প্রোফাইল পিকচার রিসলভার */}
                        {(r.avatarUrl || r.avatar || r.photoUrl || r.photo || r.photoURL) ? (
                          <img
                            src={r.avatarUrl || r.avatar || r.photoUrl || r.photo || r.photoURL}
                            alt={r.userName || r.name || 'User'}
                            width={40}
                            height={40}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
                            onError={(e) => {
                              // যদি ইমেজের লিংক ব্রোকেন হয়, তবে এটি হাইড করে লেটার প্লেসহোল্ডার দেখাবে
                              e.currentTarget.style.display = 'none';
                              const sibling = e.currentTarget.nextElementSibling as HTMLElement;
                              if (sibling) sibling.style.display = 'flex';
                            }}
                          />
                        ) : null}

                        {/* ফলব্যাক লেটার প্লেসহোল্ডার (যদি ছবি না থাকে বা ব্রোকেন হয়) */}
                        {(r.avatarUrl || r.avatar || r.photoUrl || r.photo || r.photoURL) ? (
                          <div 
                            style={{ display: 'none' }}
                            className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 font-bold text-base flex items-center justify-center shrink-0 border border-indigo-100"
                          >
                            {(r.userName || r.name)?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 font-bold text-base flex items-center justify-center shrink-0 border border-indigo-100">
                            {(r.userName || r.name)?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        )}

                        {/* নাম এবং তারিখ */}
                        <div>
                          <h5 className="font-bold text-slate-900 text-sm flex items-center gap-1 flex-wrap">
                            {r.userName || r.name || 'সম্মানিত গ্রাহক'}
                            {/* Verified Exchanger Badge */}
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[8px] font-black tracking-wide border border-emerald-100">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              {isBn ? 'ভেরিফাইড' : 'Verified'}
                            </span>
                            {/* Pinned Badge */}
                            {r.pinned && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[8px] font-black tracking-wide border border-amber-200">
                                <Pin className="w-2.5 h-2.5 fill-amber-500" />
                                {isBn ? 'পিনড' : 'Pinned'}
                              </span>
                            )}
                          </h5>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {new Date(r.createdAt).toLocaleDateString('bn-BD')}
                          </p>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex gap-0.5 shrink-0 bg-amber-50/60 px-2 py-1 rounded-xl border border-amber-100/50">
                        {[1,2,3,4,5].map(i => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i <= uRating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`} 
                          />
                        ))}
                      </div>
                    </div>

                    {/* Feedback Comment */}
                    <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-3 rounded-2xl border border-slate-100/80">
                      "{uComment}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {hasMore && !loading && displayedReviews.length > 0 && (
          <div className="text-center pt-4">
            <button 
              onClick={() => setDisplayCount((prev) => prev + 10)}
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs shadow-xs hover:bg-slate-50 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              {isBn ? 'আরো দেখুন' : 'Load More'} <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Write / Edit Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
            <h3 className="text-sm font-black text-slate-800 mb-1.5">
              {editingReviewId ? (isBn ? 'রিভিউ এডিট করুন' : 'Edit Review') : (isBn ? 'একটি কাস্টমার রিভিউ লিখুন' : 'Write a Customer Review')}
            </h3>
            <p className="text-[10px] text-slate-400 mb-5 leading-relaxed">
              {isBn 
                ? 'আপনার মূল্যবান কাজের অভিজ্ঞতা শেয়ার করুন যা মেল ফ্যাক্টরির মান উন্নয়নে সাহায্য করবে।' 
                : 'Share your genuine trading feedback to help us scale and optimize service reliability.'}
            </p>
            
            {/* Interactive Stars Selection */}
            <div className="flex flex-col items-center justify-center gap-1.5 mb-6 py-4 bg-slate-50/80 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2">
                {[1,2,3,4,5].map(i => (
                  <button 
                    key={i} 
                    type="button" 
                    onClick={() => {
                      hapticFeedback.light();
                      setRating(i);
                    }} 
                    className="p-1 hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                  >
                    <Star className={`w-8 h-8 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`} />
                  </button>
                ))}
              </div>
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider">
                {rating === 5 && (isBn ? 'চমৎকার! ⚡' : 'Excellent! ⚡')}
                {rating === 4 && (isBn ? 'খুব ভালো! 👍' : 'Very Good! 👍')}
                {rating === 3 && (isBn ? 'চলনসই! 🙂' : 'Average! 🙂')}
                {rating === 2 && (isBn ? 'উন্নতি প্রয়োজন! 🛠️' : 'Needs Work! 🛠️')}
                {rating === 1 && (isBn ? 'হতাশাজনক! 🙏' : 'Dissatisfied! 🙏')}
              </span>
            </div>
            
            {/* Feedback Content Input */}
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder={isBn ? "মেল ফ্যাক্টরি এক্সচেঞ্জিং প্ল্যাটফর্ম সম্পর্কে আপনার সৎ মতামত লিখুন..." : "Tell us about your experience trading with Mail Factory..."}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[120px] resize-none mb-4 transition-all"
              maxLength={500}
            />
            
            {/* Form Actions */}
            <div className="flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 rounded-xl font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button 
                onClick={handleSubmitReview}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl font-black text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-indigo-600/10"
              >
                {isSubmitting ? (isBn ? 'সাবমিট হচ্ছে...' : 'Submitting...') : (isBn ? 'সাবমিট করুন' : 'Submit')}
              </button>
            </div>
            <p className="text-[9px] text-center text-slate-400 mt-4 leading-relaxed">
              {isBn 
                ? 'সংরক্ষণ করার পর রিভিউটি অ্যাডমিন প্যানেল দ্বারা মডারেশন ও অনুমোদনের পর লাইভ হবে।' 
                : 'Upon submission, your review will be reviewed by admin moderators before going live.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
