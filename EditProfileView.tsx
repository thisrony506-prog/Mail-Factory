import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { uploadToImgBB } from './imgbb';
import { updateProfile } from './firebase';
import { hapticFeedback } from './haptics';
import {
  User,
  Camera,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Upload,
  Phone,
  Wallet,
  Save,
  Mail,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export const EditProfileView: React.FC = () => {
  const { profile, updateProfileData, user, language, setActiveTab } = useApp();

  const [name, setName] = useState<string>(profile?.username || '');
  const [phone, setPhone] = useState<string>(profile?.phone || '');
  const [paymentNumber, setPaymentNumber] = useState<string>(profile?.paymentNumber || '');
  const [photoURL, setPhotoURL] = useState<string>(profile?.photoURL || '');

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (profile) {
      setName(profile.username || '');
      setPhone(profile.phone || '');
      setPaymentNumber(profile.paymentNumber || '');
      setPhotoURL(profile.photoURL || '');
    }
  }, [profile]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setError(language === 'bn' ? 'ফাইল সাইজ ৫০MB এর বেশি হতে পারবে না' : 'File must be under 50MB');
      return;
    }

    setIsUploading(true);
    setError(null);
    hapticFeedback.light();

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
    hapticFeedback.medium();

    if (!name.trim()) {
      setError(language === 'bn' ? 'নাম খালি রাখা যাবে না' : 'Name cannot be empty');
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
        setActiveTab('profile');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-4 pb-28 space-y-5 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
        <button
          onClick={() => {
            hapticFeedback.light();
            setActiveTab('profile');
          }}
          className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all flex items-center gap-2 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'bn' ? 'ফিরে যান' : 'Back'}</span>
        </button>

        <div className="text-right">
          <h2 className="text-base font-black text-slate-900">
            {language === 'bn' ? 'প্রোফাইল সম্পাদনা' : 'Edit Profile'}
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">
            ব্যক্তিগত তথ্য ও ওয়ালেট আপডেট
          </p>
        </div>
      </div>

      {/* Main Profile Form Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-5">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{language === 'bn' ? 'প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে!' : 'Profile updated successfully!'}</span>
          </div>
        )}

        {/* Avatar Upload */}
        <div className="flex flex-col items-center justify-center pt-2">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-slate-100 border-4 border-indigo-500/20 overflow-hidden flex items-center justify-center shadow-lg">
              {photoURL ? (
                <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-indigo-700">
                  {(name || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <label
              htmlFor="edit-profile-avatar-file"
              className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700 shadow-xl border-2 border-white transition-transform active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <input
                id="edit-profile-avatar-file"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>
          <span className="text-xs text-indigo-600 font-extrabold mt-3 animate-pulse">
            {isUploading
              ? (language === 'bn' ? '⚡ ছবিটি অটো-কমপ্রেস ও আপলোড হচ্ছে...' : '⚡ Auto-compressing & uploading photo...')
              : language === 'bn'
              ? 'প্রোফাইল ছবি পরিবর্তন করতে ক্যামেরায় ট্যাপ করুন'
              : 'Tap camera to upload new photo'}
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              {language === 'bn' ? 'আপনার নাম (Full Name)' : 'Full Name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="আপনার নাম"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          {/* Email Read-only */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              ইমেইল অ্যাড্রেস (Email Address)
            </label>
            <input
              type="text"
              readOnly
              value={profile?.email || user?.email || ''}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs font-medium text-slate-500 bg-slate-100 cursor-not-allowed font-mono"
            />
            <span className="text-[10px] text-slate-400 mt-1 block font-medium">
              * ইমেইল পরিবর্তনযোগ্য নয়
            </span>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-indigo-600" />
              মোবাইল নম্বর (Phone Number)
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          {/* Default Payment Wallet */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-indigo-600" />
              ডিফল্ট উইথড্র ওয়ালেট নম্বর (Default Wallet)
            </label>
            <input
              type="text"
              value={paymentNumber}
              onChange={(e) => setPaymentNumber(e.target.value)}
              placeholder="bKash / Nagad / Rocket Number"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
            <span className="text-[10px] text-slate-400 mt-1 block font-medium">
              টাকা উইথড্র করার সময় এই নম্বরটি অটোমেটিক সেট থাকবে
            </span>
          </div>

          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-black text-xs sm:text-sm shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{language === 'bn' ? 'তথ্য সংরক্ষণ করুন' : 'Save Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
