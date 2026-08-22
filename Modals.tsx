import React, { useState } from 'react';
import { useApp } from './AppContext';
import { translations } from './i18n';
import { uploadToImgBB } from './imgbb';
import {
  auth,
  db,
  ref,
  set,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from './firebase';
import {
  X,
  Camera,
  Upload,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Mail,
  Send,
  MessageCircle,
  ChevronDown,
  ShieldCheck,
  Key,
  Star,
} from 'lucide-react';
import { FAQItem } from './types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfileData, user, language } = useApp();
  const [name, setName] = useState<string>(profile?.username || '');
  const [phone, setPhone] = useState<string>(profile?.phone || '');
  const [paymentNumber, setPaymentNumber] = useState<string>(profile?.paymentNumber || '');
  const [photoURL, setPhotoURL] = useState<string>(profile?.photoURL || '');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  React.useEffect(() => {
    if (isOpen && profile) {
      setName(profile.username || '');
      setPhone(profile.phone || '');
      setPaymentNumber(profile.paymentNumber || '');
      setPhotoURL(profile.photoURL || '');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const uploadedUrl = await uploadToImgBB(file);
      setPhotoURL(uploadedUrl);
    } catch (err: any) {
      setError(err.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await updateProfileData({
        username: name.trim(),
        phone: phone.trim(),
        paymentNumber: paymentNumber.trim(),
        photoURL,
      });

      if (user && photoURL) {
        try {
          await updateProfile(user, { displayName: name.trim(), photoURL });
        } catch {
          // safe ignore
        }
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-sm font-black text-slate-800">
            {language === 'bn' ? 'প্রোফাইল আপডেট করুন' : 'Edit Profile'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Avatar Upload Area */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-indigo-500 overflow-hidden flex items-center justify-center shadow">
                {photoURL ? (
                  <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-indigo-700">
                    {(name || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <label
                htmlFor="avatar-file"
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700 shadow"
              >
                <Camera className="w-3.5 h-3.5" />
                <input
                  id="avatar-file"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 font-medium">
              {isUploading ? 'Uploading to cloud...' : 'Click camera to change photo'}
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
              Default Payment Wallet
            </label>
            <input
              type="text"
              value={paymentNumber}
              onChange={(e) => setPaymentNumber(e.target.value)}
              placeholder="bKash / Nagad / Rocket Number"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
              Email Address (Read-only)
            </label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-mono text-slate-500 bg-slate-100 cursor-not-allowed"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md transition-all active:scale-98"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export const ChangePasswordModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useApp();
  const [currentPass, setCurrentPass] = useState<string>('');
  const [newPass, setNewPass] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;

    if (newPass.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPass);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPass);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Check current password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-sm font-black text-slate-800">Change Password</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              placeholder="Enter current password"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
              New Password (min 6 characters)
            </label>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Enter new strong password"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>Password updated successfully!</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md transition-all active:scale-98"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export const FAQModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { language } = useApp();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!isOpen) return null;

  const faqs: FAQItem[] = [
    {
      q: language === 'bn' ? 'জিমেইল কিভাবে বিক্রি করব?' : 'How do I sell Gmail accounts?',
      a: language === 'bn'
        ? 'হোমপেজ থেকে জিমেইল টাইপ সিলেক্ট করুন (New বা Old), এরপর ইমেইল ও পাসওয়ার্ড দিয়ে সাবমিট করুন।'
        : 'Select Gmail type on home or exchange view, enter the email and password, and submit.',
    },
    {
      q: language === 'bn' ? 'টাকা কখন এবং কিভাবে পাব?' : 'When and how will I receive payment?',
      a: language === 'bn'
        ? 'আপনার সাবমিট করা জিমেইল প্রতিদিনের রিভিউ শিফট ব্যাচে ভেরিফাই হওয়ার পর মেইন ব্যালেন্সে জমা হবে এবং bKash/Nagad/Rocket/USDT তে উইথড্র করতে পারবেন।'
        : 'Once accounts are verified during the daily shift batches, funds move to Main Balance and can be withdrawn to bKash, Nagad, Rocket, or USDT.',
    },
    {
      q: language === 'bn' ? '২-স্টেপ ভেরিফিকেশন (2FA) কি বন্ধ রাখতে হবে?' : 'Must 2-Step Verification be disabled?',
      a: language === 'bn'
        ? 'হ্যাঁ, জিমেইলের ২-স্টেপ ভেরিফিকেশন বন্ধ থাকতে হবে যাতে চেকার টিম সহজে লগইন নিশ্চিত করতে পারে।'
        : 'Yes, 2FA must be turned off so the automated verification batch can audit the credentials.',
    },
    {
      q: language === 'bn' ? 'রেফারেল কমিশন কিভাবে কাজ করে?' : 'How does the referral commission work?',
      a: language === 'bn'
        ? 'আপনার রেফারেল লিংক দিয়ে কেউ একাউন্ট খুললে আপনি সাইনআপ বোনাস পাবেন এবং সে যত জিমেইল বিক্রি করবে তার ওপর আজীবন কমিশন পাবেন।'
        : 'When someone signs up via your link, you get an instant bonus plus lifetime commission on all their verified sales.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative max-h-[85vh] flex flex-col">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-black text-slate-800">Frequently Asked Questions</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpenItem = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpenItem ? null : idx)}
                  className="w-full p-3.5 text-left flex items-center justify-between text-xs font-black text-slate-800 hover:bg-slate-100/60"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isOpenItem ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  />
                </button>
                {isOpenItem && (
                  <div className="p-3.5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const ContactModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-black text-slate-800">Contact & Official Support</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <a
            href="https://t.me/gmail_marketing02"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-sky-50 border border-sky-100 hover:bg-sky-100 transition-all text-sky-900"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-black">Telegram Channel & Chat</h5>
              <span className="text-[11px] font-mono text-sky-700">@gmail_marketing02</span>
            </div>
          </a>

          <a
            href="https://wa.me/8801964182265"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-all text-emerald-900"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-black">WhatsApp Help Desk</h5>
              <span className="text-[11px] font-mono text-emerald-700">+8801964182265</span>
            </div>
          </a>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-900">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-black">Official Email Support</h5>
              <span className="text-[11px] font-mono text-indigo-700">mailfactorybd@gmail.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const InfoModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
}> = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative max-h-[85vh] flex flex-col">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-sm font-black text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto text-xs text-slate-600 leading-relaxed space-y-2.5">
          {content}
        </div>
      </div>
    </div>
  );
};

export const RateAppModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { language, user, profile, addNotification } = useApp();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitted(true);
    localStorage.setItem('mf_has_rated', '1');

    if (user) {
      try {
        const reviewData = {
          id: user.uid,
          userId: user.uid,
          userName: profile?.username || user.displayName || user.email?.split('@')[0] || 'Member',
          userPhoto: profile?.photoURL || user.photoURL || '',
          rating,
          text: comment.trim() || (language === 'bn' ? 'অসাধারণ সার্ভিস এবং দ্রুত পেআউট!' : 'Great service and quick payouts!'),
          status: 'approved',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isVerified: Boolean(profile?.total_withdrawn && profile.total_withdrawn > 0),
        };
        await set(ref(db, `reviews/${user.uid}`), reviewData);
      } catch (err) {
        console.warn('Could not persist rate modal to firebase:', err);
      }
    }

    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setRating(0);
      setComment('');
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Star className="w-8 h-8 fill-amber-500" />
          </div>
          
          <div>
            <h3 className="text-lg font-black text-slate-800">
              {language === 'bn' ? 'আমাদের অ্যাপটি কেমন লাগছে?' : 'Enjoying Mail Factory?'}
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-1">
              {language === 'bn' 
                ? 'আপনার মূল্যবান রেটিং আমাদের সেবাকে আরও উন্নত করতে সাহায্য করবে।' 
                : 'Your valuable rating helps us improve our service.'}
            </p>
          </div>

          {!submitted ? (
            <>
              <div className="flex items-center justify-center gap-2 py-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110 active:scale-90"
                  >
                    <Star 
                      className={`w-8 h-8 transition-colors ${
                        star <= (hoverRating || rating) 
                          ? 'fill-amber-400 text-amber-400' 
                          : 'fill-slate-100 text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {rating > 0 && (
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={language === 'bn' ? 'মতামত লিখুন (ঐচ্ছিক)...' : 'Write a short feedback (optional)...'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              )}

              <button
                onClick={handleSubmit}
                disabled={rating === 0}
                className={`w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all ${
                  rating > 0 
                    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md active:scale-95' 
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                {language === 'bn' ? 'সাবমিট করুন' : 'Submit Rating'}
              </button>
            </>
          ) : (
            <div className="py-6 flex flex-col items-center justify-center space-y-3 animate-in fade-in zoom-in">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-800">
                {language === 'bn' ? 'ধন্যবাদ! রেটিং সংরক্ষিত হয়েছে।' : 'Thank you! Rating saved.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
