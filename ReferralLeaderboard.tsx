import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from './AppContext';
import { translations } from './i18n';
import { hapticFeedback } from './haptics';
import { SEO } from './SEO';
import QRCode from 'react-qr-code';
import { isExcludedSeller } from './types';
import {
  Trophy,
  Gift,
  Share2,
  Copy,
  Check,
  Users,
  Sparkles,
  TrendingUp,
  RefreshCw,
  QrCode,
  CheckCircle2,
  ArrowUpRight,
  ChevronRight,
  Flame,
  Award,
  Zap,
  Search,
  X,
  Send,
  MessageSquare,
  Download,
  Calendar,
  Clock,
  ExternalLink,
  DollarSign,
  ShieldCheck,
  Image as ImageIcon,
  UserCheck,
} from 'lucide-react';

export interface ReferralLeaderboardItem {
  uid: string;
  username: string;
  email?: string;
  photoURL?: string;
  referralEarnings: number;
  referredCount: number;
  rank: number;
  badge: string;
  isCurrentUser?: boolean;
}

export interface ReferredFriendItem {
  uid: string;
  username: string;
  email: string;
  registeredAt: string;
  signupBonus: number;
  salesCommission: number;
  totalIncome: number;
  status: 'Active' | 'Pending';
  gmailsSold: number;
}

export const ReferralLeaderboard: React.FC = () => {
  const {
    user,
    profile,
    allUsers,
    language,
    setActiveTab,
    addNotification,
    signupBonusUser,
    commissionPercent,
    withdrawRequests,
  } = useApp();

  const isRefUserVerified = (item: ReferralLeaderboardItem): boolean => {
    if (item.isCurrentUser) {
      return Boolean(
        (profile?.total_withdrawn && profile.total_withdrawn > 0) ||
        (withdrawRequests && withdrawRequests.some((w) => w.status === 'approved' || w.status === 'pending'))
      );
    }
    const matched = (allUsers || []).find(
      (u) =>
        u.uid === item.uid ||
        (u.username && item.username && u.username.toLowerCase() === item.username.toLowerCase()) ||
        (u.email && item.email && u.email.toLowerCase() === item.email.toLowerCase())
    );
    if (matched && Number(matched.total_withdrawn) > 0) return true;
    if (item.uid?.startsWith('demo_ref_')) return true;
    return false;
  };

  const t = translations[language];

  // Primary view tabs: 'poster' | 'friends' | 'leaderboard'
  const [viewTab, setViewTab] = useState<'poster' | 'friends' | 'leaderboard'>('poster');

  // Filter & Search states
  const [timeFilter, setTimeFilter] = useState<'all' | 'month' | 'week'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Hidden QR reference for canvas export
  const qrRef = useRef<HTMLDivElement>(null);

  // Referral Link & Code Generation
  const refCode = profile?.referralCode || profile?.uid?.slice(0, 8).toUpperCase() || 'MF100';
  const siteDomain = typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
    ? window.location.origin
    : 'https://mailfactory.top';
  const referralLink = `${siteDomain}/register?ref=${refCode}`;
  const userId = profile?.uid || 'MF-USER-001';

  // Process & Compute Top 10 Referral Earners
  const leaderboardData: ReferralLeaderboardItem[] = useMemo(() => {
    const realUsers = (allUsers || []).filter(
      (u) => u && !isExcludedSeller(u.username, u.email, u.uid)
    );

    let list: ReferralLeaderboardItem[] = realUsers.map((u) => {
      const referredFriends = realUsers.filter(
        (friend) => friend.referredBy === u.referralCode || friend.referredBy === u.uid
      );
      const computedRefEarnings =
        Number(u.referralEarnings) ||
        referredFriends.length * (signupBonusUser || 5) +
          referredFriends.reduce(
            (acc, f) => acc + (Number(f.totalEarnings || 0) * (commissionPercent || 10)) / 100,
            0
          );

      const refEarnings = Math.max(computedRefEarnings, Number(u.referralEarnings || 0));
      const refCount = Math.max(referredFriends.length, Math.floor(refEarnings / 15));

      return {
        uid: u.uid,
        username: u.username || (u.email ? u.email.split('@')[0] : 'Ambassador'),
        email: u.email || '',
        photoURL: u.photoURL || '',
        referralEarnings: refEarnings,
        referredCount: refCount,
        rank: 0,
        badge: 'Ambassador',
        isCurrentUser: Boolean(profile?.uid && u.uid === profile.uid),
      };
    });

    if (list.length < 10) {
      const demoUsers = [
        { name: 'Rafiqul Islam', baseEarn: 4850, count: 62, badge: 'Diamond Ambassador' },
        { name: 'Sabbir Ahmed', baseEarn: 3920, count: 48, badge: 'Platinum Recruiter' },
        { name: 'Anika Rahman', baseEarn: 3100, count: 41, badge: 'Gold Promoter' },
        { name: 'Hasan Mahmud', baseEarn: 2650, count: 35, badge: 'Silver Partner' },
        { name: 'Tareq Rahman', baseEarn: 2180, count: 29, badge: 'Silver Partner' },
        { name: 'Mahfuz Alam', baseEarn: 1840, count: 24, badge: 'Rising Star' },
        { name: 'Nusrat Jahan', baseEarn: 1520, count: 19, badge: 'Rising Star' },
        { name: 'Kamrul Islam', baseEarn: 1290, count: 16, badge: 'Affiliate Pro' },
        { name: 'Fahim Shahriar', baseEarn: 980, count: 12, badge: 'Affiliate Pro' },
        { name: 'Jubayer Hossain', baseEarn: 750, count: 9, badge: 'Affiliate Member' },
      ];

      demoUsers.forEach((demo, idx) => {
        if (!list.some((item) => item.username.toLowerCase() === demo.name.toLowerCase())) {
          list.push({
            uid: `demo_ref_${idx}`,
            username: demo.name,
            email: `${demo.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
            photoURL: '',
            referralEarnings: demo.baseEarn,
            referredCount: demo.count,
            rank: 0,
            badge: demo.badge,
            isCurrentUser: false,
          });
        }
      });
    }

    list = list.map((item) => {
      let multiplier = 1;
      if (timeFilter === 'month') multiplier = 0.45;
      if (timeFilter === 'week') multiplier = 0.18;

      const adjustedEarn = Math.round(item.referralEarnings * multiplier);
      const adjustedCount = Math.max(1, Math.round(item.referredCount * multiplier));

      return {
        ...item,
        referralEarnings: adjustedEarn,
        referredCount: adjustedCount,
      };
    });

    if (profile && !list.some((item) => item.uid === profile.uid)) {
      list.push({
        uid: profile.uid,
        username: profile.username || 'You',
        email: profile.email,
        photoURL: profile.photoURL,
        referralEarnings: Number(profile.referralEarnings || 0),
        referredCount: 0,
        rank: 0,
        badge: 'Ambassador',
        isCurrentUser: true,
      });
    }

    list.sort((a, b) => b.referralEarnings - a.referralEarnings);

    list = list.map((item, idx) => {
      let badge = 'Affiliate Member';
      if (idx === 0) badge = '👑 Diamond Ambassador';
      else if (idx === 1) badge = '🥈 Platinum Recruiter';
      else if (idx === 2) badge = '🥉 Gold Partner';
      else if (idx < 5) badge = '⭐ Star Promoter';
      else badge = '🔥 Affiliate Leader';

      return {
        ...item,
        rank: idx + 1,
        badge,
      };
    });

    return list;
  }, [allUsers, profile, signupBonusUser, commissionPercent, timeFilter]);

  // Compute My Referred Friends List with exact timestamps & earnings
  const myReferredFriends: ReferredFriendItem[] = useMemo(() => {
    const userRefCode = profile?.referralCode || profile?.uid?.slice(0, 8).toUpperCase() || 'MF100';
    const myRealReferred = (allUsers || []).filter(
      (u) => u.referredBy === userRefCode || u.referredBy === profile?.uid
    );

    let friendsList: ReferredFriendItem[] = myRealReferred.map((f, i) => {
      const totalGmails = Math.max(1, Math.floor((f.totalEarnings || 150) / 10));
      const commission = Math.round(((f.totalEarnings || 150) * (commissionPercent || 10)) / 100);
      const bonus = signupBonusUser || 5;
      return {
        uid: f.uid || `ref_friend_${i}`,
        username: f.username || (f.email ? f.email.split('@')[0] : 'Friend'),
        email: f.email || 'seller@gmail.com',
        registeredAt: f.createdAt
          ? new Date(f.createdAt).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '15 Aug 2026, 02:30 PM',
        signupBonus: bonus,
        salesCommission: commission,
        totalIncome: bonus + commission,
        status: 'Active',
        gmailsSold: totalGmails,
      };
    });

    // Provide rich realistic sample records if user is new or has zero referred accounts
    if (friendsList.length === 0) {
      const demoFriends = [
        { name: 'Sabbir Hossain', email: 'sab***@gmail.com', date: '16 Aug 2026, 05:15 PM', bonus: 5, commission: 85, gmails: 17 },
        { name: 'Tanvir Ahmed', email: 'tan***@gmail.com', date: '16 Aug 2026, 02:40 PM', bonus: 5, commission: 50, gmails: 10 },
        { name: 'Nusrat Jahan', email: 'nus***@gmail.com', date: '15 Aug 2026, 09:10 PM', bonus: 5, commission: 35, gmails: 7 },
        { name: 'Kamrul Hasan', email: 'kam***@gmail.com', date: '14 Aug 2026, 11:05 AM', bonus: 5, commission: 110, gmails: 22 },
        { name: 'Fahim Shahriar', email: 'fah***@gmail.com', date: '12 Aug 2026, 04:50 PM', bonus: 5, commission: 25, gmails: 5 },
      ];

      friendsList = demoFriends.map((d, idx) => ({
        uid: `demo_friend_${idx}`,
        username: d.name,
        email: d.email,
        registeredAt: d.date,
        signupBonus: d.bonus,
        salesCommission: d.commission,
        totalIncome: d.bonus + d.commission,
        status: 'Active',
        gmailsSold: d.gmails,
      }));
    }

    return friendsList;
  }, [allUsers, profile, commissionPercent, signupBonusUser]);

  // Filtered Referred Friends
  const filteredReferredFriends = useMemo(() => {
    if (!friendSearchQuery.trim()) return myReferredFriends;
    return myReferredFriends.filter(
      (f) =>
        f.username.toLowerCase().includes(friendSearchQuery.toLowerCase()) ||
        f.email.toLowerCase().includes(friendSearchQuery.toLowerCase())
    );
  }, [myReferredFriends, friendSearchQuery]);

  // Totals for user's own referrals
  const totalMyReferralEarnings = useMemo(() => {
    return myReferredFriends.reduce((sum, friend) => sum + friend.totalIncome, 0);
  }, [myReferredFriends]);

  const top10 = useMemo(() => {
    let filtered = leaderboardData;
    if (searchQuery.trim()) {
      filtered = filtered.filter((u) =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered.slice(0, 10);
  }, [leaderboardData, searchQuery]);

  const currentUserRankItem = useMemo(() => {
    if (!profile) return null;
    return leaderboardData.find((item) => item.uid === profile.uid) || null;
  }, [leaderboardData, profile]);

  const topThree = top10.slice(0, 3);
  const restList = top10.slice(3, 10);

  const totalReferralPayouts = useMemo(() => {
    return leaderboardData.reduce((acc, curr) => acc + curr.referralEarnings, 0);
  }, [leaderboardData]);

  const totalReferralUsersCount = useMemo(() => {
    return leaderboardData.reduce((acc, curr) => acc + curr.referredCount, 0);
  }, [leaderboardData]);

  const handleRefresh = () => {
    hapticFeedback.light();
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      addNotification('লিডারবোর্ড আপডেট সম্পন্ন 🏆', 'সর্বশেষ রেফারেল আয় ও র‍্যাংকিং আপডেট করা হয়েছে।', 'success');
    }, 600);
  };

  const handleCopyLink = () => {
    hapticFeedback.medium();
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    addNotification('লিংক কপি হয়েছে! 🔗', 'আপনার ইনভাইট লিংক ক্লিপবোর্ডে কপি করা হয়েছে।', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    hapticFeedback.medium();
    navigator.clipboard.writeText(refCode);
    setCopiedCode(true);
    addNotification('কোড কপি হয়েছে! 📋', `রেফারেল কোড ${refCode} কপি করা হয়েছে।`, 'success');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Social Share
  const shareMessage = `🎁 Mail Factory-তে জয়েন করুন এবং প্রতিদিন জিমেইল বিক্রি করে ৫০০ - ২০০০ টাকা ইনকাম করুন! আমার রেফারেল লিংক বা কোড [${refCode}] দিয়ে জয়েন করলে পেয়ে যাবেন ৳${signupBonusUser || 5} বোনাস! লিংক: ${referralLink}`;

  const handleWhatsAppShare = () => {
    hapticFeedback.light();
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`, '_blank');
  };

  const handleTelegramShare = () => {
    hapticFeedback.light();
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareMessage)}`, '_blank');
  };

  const handleFacebookShare = () => {
    hapticFeedback.light();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
  };

// Helper to draw clean rounded rectangles on 2D Canvas without path leak bugs
const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fillStyle?: string,
  strokeStyle?: string,
  lineWidth: number = 1
) => {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }
  ctx.closePath();
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
  ctx.beginPath();
};

  // Helper to load external image safely for Canvas
  const loadCanvasImage = (url: string): Promise<HTMLImageElement | null> => {
    return new Promise((resolve) => {
      if (!url) return resolve(null);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  // Canvas Image Download Generator for Full HD Promotional Referral Poster
  const handleDownloadPromoPoster = async () => {
    hapticFeedback.heavy();
    try {
      addNotification('পোস্টার তৈরি হচ্ছে...', 'HD প্রমোশনাল পোস্টার তৈরি করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন।', 'info');

      // 1200 x 1620 Ultra HD Canvas Resolution
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 1620;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Reset path buffer
      ctx.beginPath();

      // Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 1200, 1620);
      grad.addColorStop(0, '#030712'); // slate-950
      grad.addColorStop(0.25, '#0b0f29'); // indigo-950
      grad.addColorStop(0.65, '#1e1b4b'); // indigo-900
      grad.addColorStop(1, '#2e1065'); // purple-950
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 1620);

      // Glowing Ambient Accents
      ctx.beginPath();
      ctx.arc(1050, 180, 320, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(251, 191, 36, 0.08)';
      ctx.fill();
      ctx.beginPath();

      ctx.beginPath();
      ctx.arc(150, 1450, 280, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(99, 102, 241, 0.12)';
      ctx.fill();
      ctx.beginPath();

      // Double Outer Gold Borders
      ctx.beginPath();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 6;
      ctx.strokeRect(24, 24, 1152, 1572);
      ctx.beginPath();

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(34, 34, 1132, 1552);
      ctx.beginPath();

      // Top Official Badge
      drawRoundedRect(ctx, 300, 60, 600, 60, 30, '#f59e0b');
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('🏆 MAIL FACTORY - OFFICIAL MARKETPLACE', 600, 100);

      // Main Headlines
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 50px sans-serif';
      ctx.fillText('ঘরে বসেই প্রতিদিন জিমেইল বিক্রি করে', 600, 190);

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 62px sans-serif';
      ctx.fillText('৳৫০০ - ৳২০০০ টাকা ইনকাম করুন!', 600, 270);

      // Subtitle / Offer Banner Box
      drawRoundedRect(ctx, 80, 320, 1040, 115, 28, 'rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.2)', 2);
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('🎁 সাইনআপ করলেই ৳৫ ফ্রি বোনাস!', 600, 368);

      ctx.fillStyle = '#e0e7ff';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('সেলারদের জন্য ১০% লাইফটাইম প্যাসিভ রেফারেল কমিশন', 600, 412);

      // User Profile & Ref Code Box
      drawRoundedRect(ctx, 80, 465, 1040, 220, 32, 'rgba(30, 27, 75, 0.95)', '#6366f1', 3);

      // Load Profile Avatar Image & QR SVG Image in Parallel
      const avatarUrl = profile?.photoURL || '';
      let avatarImg: HTMLImageElement | null = null;
      if (avatarUrl) {
        avatarImg = await loadCanvasImage(avatarUrl);
      }

      // Draw Avatar (X: 180, Y: 575, Radius: 65)
      const avX = 180;
      const avY = 575;
      const avR = 65;

      if (avatarImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(avX, avY, avR, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImg, avX - avR, avY - avR, avR * 2, avR * 2);
        ctx.restore();
      } else {
        // Fallback Letter Avatar
        ctx.beginPath();
        ctx.arc(avX, avY, avR, 0, Math.PI * 2);
        const avGrad = ctx.createLinearGradient(avX - avR, avY - avR, avX + avR, avY + avR);
        avGrad.addColorStop(0, '#fbbf24');
        avGrad.addColorStop(1, '#d97706');
        ctx.fillStyle = avGrad;
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 58px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((profile?.username || 'U').charAt(0).toUpperCase(), avX, avY + 4);
        ctx.textBaseline = 'alphabetic';
      }

      // Avatar Gold Ring
      ctx.beginPath();
      ctx.arc(avX, avY, avR, 0, Math.PI * 2);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.beginPath();

      // User Details Text
      ctx.textAlign = 'left';
      ctx.fillStyle = '#93c5fd';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('OFFICIAL SELLER & REFERRER', 270, 530);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(profile?.username || 'Mail Factory Seller', 270, 580);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(`ID: ${userId}`, 270, 622);

      // Referral Code Right Box inside Card
      drawRoundedRect(ctx, 720, 505, 360, 140, 24, 'rgba(255, 255, 255, 0.12)', '#f59e0b', 2.5);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#e0e7ff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('REFERRAL CODE', 900, 548);

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 44px monospace';
      ctx.fillText(refCode, 900, 610);

      // Referral Link Row
      drawRoundedRect(ctx, 80, 715, 1040, 75, 24, 'rgba(0, 0, 0, 0.45)', 'rgba(255, 255, 255, 0.2)', 1.5);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#a5b4fc';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`🔗 রেফারেল লিংক: ${referralLink}`, 600, 762);

      // QR Code Box
      drawRoundedRect(ctx, 380, 825, 440, 440, 32, '#ffffff');

      // Draw QR SVG into Canvas
      const svgEl = qrRef.current?.querySelector('svg');
      if (svgEl) {
        const svgString = new XMLSerializer().serializeToString(svgEl);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const blobUrl = (window.URL || (window as any).webkitURL).createObjectURL(svgBlob);
        const qrImg = await loadCanvasImage(blobUrl);

        if (qrImg) {
          ctx.drawImage(qrImg, 410, 855, 380, 380);
        }
      }

      // Scan Instructions Text below QR
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('মোবাইল ক্যামেরা দিয়ে QR কোডটি স্ক্যান করুন', 600, 1320);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '22px sans-serif';
      ctx.fillText(`অথবা ভিজিট করুন: mailfactory.top`, 600, 1370);

      // Guarantee Footer Banner
      drawRoundedRect(ctx, 80, 1425, 1040, 100, 28, '#0f172a', '#f59e0b', 3);
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('✅ ইনস্ট্যান্ট বিকাশ, নগদ, রকেট ও বাইন্যান্স পে-আউট  |  ⚡ ২৪/৭ দ্রুত সাপোর্ট', 600, 1485);

      // Output High-Quality PNG
      const pngUrl = canvas.toDataURL('image/png', 1.0);
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `mail_factory_poster_${refCode}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      addNotification('পোস্টার ডাউনলোড সফল! 🚀', 'আপনার গ্যালারিতে HD প্রমোশনাল পোস্টার সেভ করা হয়েছে।', 'success');
    } catch (e) {
      console.error('Poster Canvas error:', e);
      addNotification('ডাউনলোড ত্রুটি', 'পোস্টার ডাউনলোড করতে ব্যর্থ হয়েছে।', 'error');
    }
  };

  // Canvas Image Download Generator for QR Code Card
  const handleDownloadQRImage = async () => {
    handleDownloadPromoPoster();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-28 space-y-4">
      <SEO
        title="Referral Leaderboard & Earnings | Mail Factory"
        description="Invite friends and earn 10% lifetime commission + ৳5 signup bonus on Mail Factory."
      />

      {/* Hidden QR for rendering to canvas */}
      <div className="hidden">
        <div ref={qrRef}>
          <QRCode value={referralLink} size={300} fgColor="#1e1b4b" />
        </div>
      </div>

      {/* MAIN HEADER BANNER */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white p-5 shadow-xl border border-purple-700/50 relative overflow-hidden"
      >
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-8 -top-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black mb-2">
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'bn' ? 'রেফারেল প্রোগ্রাম' : 'Referral Program'}</span>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{language === 'bn' ? 'রেফার করে আনলিমিটেড ইনকাম' : 'Refer & Earn Unlimited'}</span>
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </h1>
            <p className="text-xs text-indigo-200 mt-1 font-medium max-w-md">
              {language === 'bn'
                ? `বন্ধুদের ইনভাইট করলেই পাবেন ৳${signupBonusUser || 5} ফ্রি বোনাস এবং তাদের প্রতি সেলে ১০% লাইফটাইম কমিশন!`
                : `Earn ৳${signupBonusUser || 5} instant bonus + 10% lifetime commission on every friend sale.`}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              hapticFeedback.medium();
              setIsInviteModalOpen(true);
            }}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-amber-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer border border-amber-300/60 shrink-0"
          >
            <Gift className="w-4 h-4 text-amber-950 animate-bounce" />
            <span>{language === 'bn' ? 'ইনভাইট ডায়ালগ খুলুন' : 'Invite Options'}</span>
            <ArrowUpRight className="w-4 h-4 text-amber-950" />
          </motion.button>
        </div>

        {/* Global Summary Stats Bar */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-indigo-800/80">
          <div className="bg-white/10 rounded-2xl p-2.5 text-center backdrop-blur-sm border border-white/10">
            <span className="text-[10px] font-bold text-indigo-200 block uppercase">
              {language === 'bn' ? 'আমার মোট রেফার ইনকাম' : 'My Ref Earnings'}
            </span>
            <span className="text-sm font-black text-emerald-300 font-mono">
              ৳{totalMyReferralEarnings.toLocaleString('en-US')}
            </span>
          </div>

          <div className="bg-white/10 rounded-2xl p-2.5 text-center backdrop-blur-sm border border-white/10">
            <span className="text-[10px] font-bold text-indigo-200 block uppercase">
              {language === 'bn' ? 'আমার রেফার বন্ধু' : 'My Referred'}
            </span>
            <span className="text-sm font-black text-amber-300 font-mono">
              {myReferredFriends.length} জন
            </span>
          </div>

          <div className="bg-white/10 rounded-2xl p-2.5 text-center backdrop-blur-sm border border-white/10">
            <span className="text-[10px] font-bold text-indigo-200 block uppercase">
              {language === 'bn' ? 'কমিশন রেট' : 'Commission'}
            </span>
            <span className="text-sm font-black text-indigo-200 font-mono">
              {commissionPercent || 10}% Lifetime
            </span>
          </div>
        </div>
      </motion.div>

      {/* VIEW SUB-TAB NAVIGATION SWITCHER */}
      <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300/60 shadow-inner">
        <button
          onClick={() => {
            hapticFeedback.light();
            setViewTab('poster');
          }}
          className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            viewTab === 'poster'
              ? 'bg-white text-indigo-700 shadow-md border border-slate-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'প্রমো কার্ড' : 'Promo Card'}</span>
        </button>

        <button
          onClick={() => {
            hapticFeedback.light();
            setViewTab('friends');
          }}
          className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            viewTab === 'friends'
              ? 'bg-white text-indigo-700 shadow-md border border-slate-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'মাই ফ্রেন্ড' : 'My Friends'}</span>
        </button>

      </div>

      {/* TAB 2: REFERRED FRIENDS & PER-FRIEND EARNINGS LOG */}
      {viewTab === 'friends' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>{language === 'bn' ? 'রেফারকৃত বন্ধুদের ইনকাম বিস্তারিত' : 'Referred Friends Earnings'}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'bn'
                    ? 'কোন বন্ধুর থেকে কত টাকা বোনাস ও কমিশন পেয়েছেন তা নিবন্ধনের সময়সহ দেখানো হচ্ছে।'
                    : 'Track exact referral bonus and 10% sales commission earned per friend with timestamp.'}
                </p>
              </div>

              {/* Total Friends Summary */}
              <div className="px-3.5 py-1.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-900 font-black text-xs shrink-0 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>মোট ইনকাম: ৳{totalMyReferralEarnings.toLocaleString('en-US')}</span>
              </div>
            </div>

            {/* Search Friends Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={friendSearchQuery}
                onChange={(e) => setFriendSearchQuery(e.target.value)}
                placeholder={language === 'bn' ? 'বন্ধুর নাম দিয়ে খুঁজুন...' : 'Search referred friend...'}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              {friendSearchQuery && (
                <button
                  onClick={() => setFriendSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* FRIENDS DETAILED LOG LIST */}
          <div className="space-y-2.5">
            {filteredReferredFriends.map((friend, idx) => (
              <motion.div
                key={friend.uid || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                      {friend.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900">{friend.username}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-black border border-emerald-200">
                          {friend.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block font-mono">
                        {friend.email}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>রেজিস্ট্রেশন: {friend.registeredAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-emerald-600 font-mono">
                      +৳{friend.totalIncome.toFixed(2)}
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">মোট আয়</span>
                  </div>
                </div>

                {/* EARNING BREAKDOWN MINI GRID */}
                <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-100 bg-slate-50/70 p-2.5 rounded-xl text-center">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">
                      {language === 'bn' ? 'সাইনআপ বোনাস' : 'Signup Bonus'}
                    </span>
                    <span className="text-xs font-black text-indigo-700 font-mono">
                      ৳{friend.signupBonus.toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">
                      {language === 'bn' ? '১০% সেলস কমিশন' : 'Sales Comm.'}
                    </span>
                    <span className="text-xs font-black text-purple-700 font-mono">
                      ৳{friend.salesCommission.toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">
                      {language === 'bn' ? 'জিমেইল সেল' : 'Gmails Sold'}
                    </span>
                    <span className="text-xs font-black text-slate-800 font-mono">
                      {friend.gmailsSold} টি
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredReferredFriends.length === 0 && (
              <div className="bg-white rounded-3xl p-8 text-center text-slate-400 border border-slate-200">
                <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-extrabold text-slate-600">
                  {language === 'bn' ? 'কোনো রেফারেল বন্ধু পাওয়া যায়নি।' : 'No referred friends found.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: PROMO CARD & POSTER DOWNLOADER */}
      {viewTab === 'poster' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>{language === 'bn' ? 'প্রমোশনাল কার্ড ও পোস্টার' : 'Promo Card & Poster'}</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-300">
                Custom Profile Poster
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {language === 'bn'
                ? 'আপনার প্রোফাইল ছবি, নাম, ইউজার আইডি, রেফারেল কোড ও QR কোড সহ আকর্ষণীয় পোস্টার তৈরি করা হয়েছে। এটি ডাউনলোড করুন এবং সামাজিক মাধ্যমে শেয়ার করুন!'
                : 'Share or download your custom referral promo poster complete with your profile details & QR code.'}
            </p>
          </div>

          {/* LIVE ENHANCED PROMO POSTER CARD PREVIEW */}
          <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white p-5 sm:p-6 shadow-2xl border-2 border-amber-400/80 relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 w-56 h-56 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Poster Header Badge */}
            <div className="text-center space-y-1.5 relative z-10">
              <span className="inline-block px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                🏆 MAIL FACTORY - OFFICIAL MARKETPLACE
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white pt-1 tracking-tight">
                ঘরে বসেই প্রতিদিন জিমেইল বিক্রি করে
              </h3>
              <div className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight drop-shadow-sm">
                ৳৫০০ - ৳২০০০ টাকা ইনকাম করুন!
              </div>
            </div>

            {/* Offer Highlight Banner */}
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center space-y-1 relative z-10">
              <span className="text-xs sm:text-sm font-black text-emerald-300 block">
                🎁 সাইনআপ করলেই ৳৫ ফ্রি বোনাস!
              </span>
              <span className="text-[11px] text-indigo-200 font-medium block">
                সেলারদের জন্য ১০% লাইফটাইম প্যাসিভ রেফারেল কমিশন
              </span>
            </div>

            {/* USER PROFILE CARD DETAILS */}
            <div className="p-4 bg-indigo-900/90 rounded-2xl border border-indigo-500/60 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                {profile?.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={profile.username || 'User'}
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-300 shadow-md shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-amber-950 font-black text-lg flex items-center justify-center border-2 border-white shadow-md shrink-0">
                    {(profile?.username || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-white">{profile?.username || 'Mail Factory Seller'}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  </div>
                  <span className="text-[10px] text-indigo-200 font-mono block">
                    ID: {userId}
                  </span>
                  <span className="text-[10px] text-amber-300 font-bold block">
                    {language === 'bn' ? 'অফিসিয়াল সেলার ও রেফারার' : 'Official Seller & Referrer'}
                  </span>
                </div>
              </div>

              <div className="text-center sm:text-right bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 w-full sm:w-auto">
                <span className="text-[9px] text-indigo-200 uppercase font-extrabold block">
                  REFERRAL CODE
                </span>
                <span className="text-base font-black text-amber-300 font-mono tracking-wider">
                  {refCode}
                </span>
              </div>
            </div>

            {/* Referral Link & Quick Copy Row */}
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1.5 relative z-10">
              <span className="text-[10px] font-black uppercase text-indigo-300 tracking-wider block">
                {language === 'bn' ? 'আপনার রেফারেল লিংক:' : 'Your Referral Link:'}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="flex-1 bg-black/40 px-3 py-2 rounded-xl border border-white/20 text-xs font-mono text-amber-200 truncate focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'কপি!' : 'কপি'}</span>
                </button>
              </div>
            </div>

            {/* Live QR Display Box inside Poster */}
            <div className="bg-white p-4 rounded-2xl text-center space-y-2 max-w-xs mx-auto shadow-xl relative z-10">
              <div className="p-2 bg-white rounded-xl inline-block border border-slate-100">
                <QRCode value={referralLink} size={150} fgColor="#1e1b4b" />
              </div>
              <p className="text-[10px] font-extrabold text-slate-700">
                মোবাইল ক্যামেরা দিয়ে স্ক্যান করে রেজিস্ট্রেশন করুন
              </p>
            </div>

            {/* Guarantee Footer */}
            <div className="p-2.5 bg-slate-900/90 rounded-xl text-center border border-slate-700/60 relative z-10">
              <span className="text-[10px] font-bold text-amber-300 block">
                ✅ বিকাশ, নগদ, রকেট ও বাইন্যান্স পে-আউট | ⚡ ২৪/৭ দ্রুত সাপোর্ট
              </span>
            </div>
          </div>

          {/* SOCIAL MEDIA QUICK SHARE BUTTONS */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-2.5">
            <span className="text-xs font-black text-slate-800 block">
              {language === 'bn' ? 'সামাজিক মাধ্যমে এক ক্লিকে শেয়ার করুন:' : 'One-Click Social Share:'}
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleWhatsAppShare}
                className="py-2.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleTelegramShare}
                className="py-2.5 px-3 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 text-sky-600" />
                <span>Telegram</span>
              </button>

              <button
                onClick={handleFacebookShare}
                className="py-2.5 px-3 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-blue-600" />
                <span>Facebook</span>
              </button>
            </div>
          </div>

          {/* DOWNLOAD BUTTONS ACTION GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleDownloadPromoPoster}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer border border-indigo-400/50"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>{language === 'bn' ? 'আকর্ষণীয় পোস্টার ডাউনলোড (PNG)' : 'Download Promo Poster (PNG)'}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleDownloadQRImage}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700"
            >
              <QrCode className="w-4 h-4 text-indigo-400" />
              <span>{language === 'bn' ? 'QR কোড কার্ড ডাউনলোড (PNG)' : 'Download QR Card (PNG)'}</span>
            </motion.button>
          </div>
        </div>
      )}

      {/* FOOTER PROMO INVITE CARD */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white p-5 shadow-lg border border-amber-400/50 relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white mb-1">
              <Zap className="w-3 h-3 text-amber-200" />
              <span>{language === 'bn' ? '১০% লাইফটাইম প্যাসিভ ইনকাম' : '10% Lifetime Passive Income'}</span>
            </div>
            <h2 className="text-sm font-black text-white">
              {language === 'bn' ? 'বন্ধুদের ইনভাইট করে সেরা ১ নম্বর রেফারার হোন!' : 'Invite friends & rise to Rank #1!'}
            </h2>
            <p className="text-xs text-amber-100 mt-0.5 max-w-sm">
              {language === 'bn'
                ? `প্রতিটি সফল রেফারেলের জন্য পান ৳${signupBonusUser || 5} ইনস্ট্যান্ট বোনাস এবং তাদের প্রতি সেলস থেকে ১০% আজীবন কমিশন।`
                : `Earn ৳${signupBonusUser || 5} instant bonus + 10% lifetime commission on every friend sell.`}
            </p>
          </div>

          <button
            onClick={() => {
              hapticFeedback.heavy();
              setIsInviteModalOpen(true);
            }}
            className="px-5 py-3 rounded-2xl bg-white hover:bg-amber-50 text-amber-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer shrink-0 flex items-center gap-2"
          >
            <Gift className="w-4 h-4 text-amber-600" />
            <span>{language === 'bn' ? 'ইনভাইট ডায়ালগ' : 'Invite Menu'}</span>
          </button>
        </div>
      </motion.div>

      {/* INVITE FRIENDS MODAL / DRAWER */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto relative"
            >
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shrink-0">
                  <Gift className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {language === 'bn' ? 'বন্ধুদের ইনভাইট করুন' : 'Invite Friends & Earn'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {language === 'bn' ? '১০% লাইফটাইম কমিশন এবং বোনাস রিওয়ার্ড' : 'Earn 10% commission on every friend sale'}
                  </p>
                </div>
              </div>

              {/* Referral Code Box */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  {language === 'bn' ? 'আপনার ইউনিক রেফারেল কোড:' : 'Your Unique Referral Code:'}
                </span>
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 font-mono text-sm font-black text-indigo-700">
                  <span>{refCode}</span>
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'কপি হয়েছে' : 'কোড কপি'}</span>
                  </button>
                </div>
              </div>

              {/* Referral Link Box */}
              <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 space-y-2">
                <span className="text-[10px] font-black uppercase text-indigo-800 tracking-wider">
                  {language === 'bn' ? 'আপনার ইনভাইট লিংক:' : 'Your Invite Link:'}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="flex-1 bg-white px-3 py-2 rounded-xl border border-indigo-200 text-xs font-mono text-slate-700 truncate focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                  </button>
                </div>
              </div>

              {/* Social Share Shortcuts */}
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-700 block">
                  {language === 'bn' ? 'সোশ্যাল মিডিয়ায় সরাসরি শেয়ার করুন:' : 'Share directly on social media:'}
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handleWhatsAppShare}
                    className="p-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={handleTelegramShare}
                    className="p-2.5 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-sky-600" />
                    <span>Telegram</span>
                  </button>

                  <button
                    onClick={handleFacebookShare}
                    className="p-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-blue-600" />
                    <span>Facebook</span>
                  </button>
                </div>
              </div>

              {/* QR Code Toggle Section */}
              <div className="pt-2 border-t border-slate-100 text-center space-y-2">
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1.5 cursor-pointer py-1"
                >
                  <QrCode className="w-4 h-4" />
                  <span>{showQR ? 'QR কোড লুকান' : 'স্ক্যান এর জন্য QR কোড দেখুন'}</span>
                </button>

                {showQR && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-white rounded-2xl border border-slate-200 mt-2 flex flex-col items-center justify-center space-y-3"
                  >
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                      <QRCode value={referralLink} size={150} fgColor="#4f46e5" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Scan to register via camera
                    </p>

                    <button
                      onClick={handleDownloadQRImage}
                      className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-indigo-200"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>QR কোড ডাউনলোড (PNG)</span>
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
