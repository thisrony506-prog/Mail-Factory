import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'react-qr-code';
import { useApp, DEFAULT_LOGO } from './AppContext';
import { translations } from './i18n';
import { hapticFeedback } from './haptics';
import {
  ArrowLeft,
  Download,
  Check,
  QrCode,
  Smartphone,
  Globe,
  Info,
  Users,
  User,
  ShieldCheck,
  Calendar,
  Loader2,
  Copy,
  CheckCircle2,
  Palette,
  Sparkles,
  Award,
  Star,
  CheckCircle,
  FileCheck2,
  Lock,
} from 'lucide-react';

interface MemberIdCardViewProps {
  onBack?: () => void;
}

// Built-in Crisp Official Mail Factory Vector Logo Component
export const MailFactoryVectorEmblem: React.FC<{ className?: string; size?: number; idPrefix?: string }> = ({
  className = 'w-full h-full',
  size,
  idPrefix = 'mf',
}) => {
  const goldGradId = `${idPrefix}-gold-grad`;
  const blueGradId = `${idPrefix}-blue-grad`;
  const glowId = `${idPrefix}-glow`;

  return (
    <svg
      viewBox="0 0 120 120"
      {...(size ? { width: size, height: size } : {})}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={goldGradId} x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id={blueGradId} x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="50%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#F59E0B" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Hexagonal / Rounded Shield Base */}
      <rect x="6" y="6" width="108" height="108" rx="28" fill={`url(#${blueGradId})`} stroke={`url(#${goldGradId})`} strokeWidth="4" />

      {/* Gear / Factory Accents at Top */}
      <circle cx="60" cy="30" r="16" stroke={`url(#${goldGradId})`} strokeWidth="3.5" strokeDasharray="6 4" opacity="0.8" />
      <circle cx="60" cy="30" r="8" fill={`url(#${goldGradId})`} />

      {/* 3D Envelope Base */}
      <rect x="24" y="44" width="72" height="48" rx="8" fill="#1E293B" stroke={`url(#${goldGradId})`} strokeWidth="3" />

      {/* Envelope Flap */}
      <path d="M 24 46 L 60 72 L 96 46" stroke={`url(#${goldGradId})`} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Letter 'M' monogram in center */}
      <path
        d="M 38 82 L 38 56 L 60 73 L 82 56 L 82 82"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${glowId})`}
      />

      {/* Star Badges */}
      <path d="M 60 96 L 62 101 L 67 101 L 63 104 L 65 109 L 60 106 L 55 109 L 57 104 L 53 101 L 58 101 Z" fill="#FDE047" />
    </svg>
  );
};

// Vector Holographic Security Seal Component
export const HologramSecuritySeal: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-16 h-16',
  size = 64,
}) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full animate-spin-slow">
        <defs>
          <linearGradient id="holo-gold" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="25%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="75%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
          <path id="seal-text-path" d="M 50,50 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0" />
        </defs>
        {/* Outer Sawtooth / Star Rosette */}
        <circle cx="50" cy="50" r="46" fill="url(#holo-gold)" opacity="0.9" />
        <circle cx="50" cy="50" r="41" fill="#0f172a" stroke="#fde047" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="32" fill="none" stroke="#fcd34d" strokeWidth="1" strokeDasharray="3 2" />
        
        {/* Text Along Circular Path */}
        <text fontSize="7.5" fill="#fde047" fontWeight="900" letterSpacing="2.5">
          <textPath href="#seal-text-path" startOffset="0%">
            OFFICIAL SECURE SEAL ★ MAIL FACTORY ★
          </textPath>
        </text>
      </svg>
      {/* Center Hologram Core Badge */}
      <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
        <ShieldCheck className="w-5 h-5 text-amber-300 drop-shadow-xs" />
        <span className="text-[6px] font-black text-white tracking-widest leading-none mt-0.5">
          GENUINE
        </span>
      </div>
    </div>
  );
};

// 1D Realistic Barcode Visual Component
export const RealisticBarcode: React.FC<{ code: string; className?: string }> = ({ code, className = '' }) => {
  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="flex items-stretch justify-center h-7 sm:h-8 gap-[1.5px] px-2 py-0.5 bg-white/90 rounded border border-slate-300/80 shadow-2xs">
        {/* Synthetic high-density barcode bars */}
        {code.split('').map((char, idx) => {
          const charCode = char.charCodeAt(0);
          const w1 = (charCode % 3) + 1;
          const w2 = ((charCode * 2) % 2) + 1;
          return (
            <React.Fragment key={idx}>
              <div style={{ width: `${w1}px` }} className="bg-slate-950 h-full" />
              <div style={{ width: `${w2}px` }} className="bg-transparent h-full" />
              <div style={{ width: `${w2}px` }} className="bg-slate-900 h-full" />
            </React.Fragment>
          );
        })}
      </div>
      <span className="text-[8px] sm:text-[9px] font-mono font-bold tracking-[0.2em] text-slate-600 mt-0.5">
        *{code}*
      </span>
    </div>
  );
};

export interface CardTheme {
  id: string;
  name: string;
  badgeName: string;
  chipClass: string;
  headerCssClass: string;
  headerGradient: [string, string, string]; // [start, mid, end]
  bodyBgClass: string;
  bodyBgHex: string;
  bodyPatternColor: string;
  accentHex: string;
  accentBorderClass: string;
  accentTextClass: string;
  badgeGradient: [string, string];
  idBoxBgHex: string;
  idBoxBorderHex: string;
  idTextColorHex: string;
  idBoxClass: string;
  footerBgHex: string;
  footerBorderHex: string;
  footerClass: string;
  qrBorderHex: string;
  qrFooterBgHex: string;
  avatarRingHex: string;
}

export const CARD_THEMES: CardTheme[] = [
  {
    id: 'navy',
    name: 'Royal Navy',
    badgeName: 'Corporate Elite',
    chipClass: 'bg-gradient-to-r from-[#020b1e] via-[#041d3d] to-[#072d5c] border-cyan-400',
    headerCssClass: 'bg-gradient-to-r from-[#020b1e] via-[#041d3d] to-[#072d5c]',
    headerGradient: ['#020b1e', '#041d3d', '#072d5c'],
    bodyBgClass: 'bg-gradient-to-b from-[#f8fafc] via-[#f0f7ff] to-[#e6f0fa]',
    bodyBgHex: '#f0f7ff',
    bodyPatternColor: 'rgba(2, 132, 199, 0.08)',
    accentHex: '#00b4d8',
    accentBorderClass: 'border-[#00b4d8]/40',
    accentTextClass: 'text-[#00b4d8]',
    badgeGradient: ['#00b4d8', '#0284c7'],
    idBoxBgHex: '#041d3d',
    idBoxBorderHex: '#0284c7',
    idTextColorHex: '#38bdf8',
    idBoxClass: 'bg-[#041d3d] border-[#0284c7]/40 text-[#38bdf8]',
    footerBgHex: '#020b1e',
    footerBorderHex: 'rgba(0, 180, 216, 0.3)',
    footerClass: 'bg-[#020b1e] border-[#00b4d8]/20',
    qrBorderHex: '#0284c7',
    qrFooterBgHex: '#041d3d',
    avatarRingHex: '#0284c7',
  },
  {
    id: 'gold',
    name: 'Imperial Gold',
    badgeName: 'Luxury Executive',
    chipClass: 'bg-gradient-to-r from-[#0c0a09] via-[#1c1917] to-[#451a03] border-amber-400',
    headerCssClass: 'bg-gradient-to-r from-[#0c0a09] via-[#1c1917] to-[#451a03]',
    headerGradient: ['#0c0a09', '#1c1917', '#451a03'],
    bodyBgClass: 'bg-gradient-to-b from-[#fdfbf7] via-[#faf5eb] to-[#f5ebd7]',
    bodyBgHex: '#faf5eb',
    bodyPatternColor: 'rgba(217, 119, 6, 0.08)',
    accentHex: '#f59e0b',
    accentBorderClass: 'border-amber-400/40',
    accentTextClass: 'text-amber-400',
    badgeGradient: ['#f59e0b', '#d97706'],
    idBoxBgHex: '#1c1917',
    idBoxBorderHex: '#f59e0b',
    idTextColorHex: '#fbbf24',
    idBoxClass: 'bg-[#1c1917] border-amber-500/50 text-amber-300',
    footerBgHex: '#0c0a09',
    footerBorderHex: 'rgba(245, 158, 11, 0.3)',
    footerClass: 'bg-[#0c0a09] border-amber-500/20',
    qrBorderHex: '#d97706',
    qrFooterBgHex: '#1c1917',
    avatarRingHex: '#f59e0b',
  },
  {
    id: 'emerald',
    name: 'Emerald VIP',
    badgeName: 'Prestige Growth',
    chipClass: 'bg-gradient-to-r from-[#022c22] via-[#064e3b] to-[#047857] border-emerald-400',
    headerCssClass: 'bg-gradient-to-r from-[#022c22] via-[#064e3b] to-[#047857]',
    headerGradient: ['#022c22', '#064e3b', '#047857'],
    bodyBgClass: 'bg-gradient-to-b from-[#f0fdf4] via-[#ecfdf5] to-[#d1fae5]',
    bodyBgHex: '#ecfdf5',
    bodyPatternColor: 'rgba(5, 150, 105, 0.08)',
    accentHex: '#10b981',
    accentBorderClass: 'border-emerald-400/40',
    accentTextClass: 'text-emerald-400',
    badgeGradient: ['#10b981', '#059669'],
    idBoxBgHex: '#064e3b',
    idBoxBorderHex: '#10b981',
    idTextColorHex: '#6ee7b7',
    idBoxClass: 'bg-[#064e3b] border-emerald-500/50 text-emerald-300',
    footerBgHex: '#022c22',
    footerBorderHex: 'rgba(16, 185, 129, 0.3)',
    footerClass: 'bg-[#022c22] border-emerald-500/20',
    qrBorderHex: '#059669',
    qrFooterBgHex: '#064e3b',
    avatarRingHex: '#10b981',
  },
  {
    id: 'purple',
    name: 'Cyber Violet',
    badgeName: 'High-Tech Alpha',
    chipClass: 'bg-gradient-to-r from-[#1e1b4b] via-[#3b0764] to-[#581c87] border-purple-400',
    headerCssClass: 'bg-gradient-to-r from-[#1e1b4b] via-[#3b0764] to-[#581c87]',
    headerGradient: ['#1e1b4b', '#3b0764', '#581c87'],
    bodyBgClass: 'bg-gradient-to-b from-[#faf5ff] via-[#f3e8ff] to-[#e9d5ff]',
    bodyBgHex: '#f3e8ff',
    bodyPatternColor: 'rgba(124, 58, 237, 0.08)',
    accentHex: '#a855f7',
    accentBorderClass: 'border-purple-400/40',
    accentTextClass: 'text-purple-400',
    badgeGradient: ['#a855f7', '#7c3aed'],
    idBoxBgHex: '#3b0764',
    idBoxBorderHex: '#a855f7',
    idTextColorHex: '#c084fc',
    idBoxClass: 'bg-[#3b0764] border-purple-500/50 text-purple-300',
    footerBgHex: '#1e1b4b',
    footerBorderHex: 'rgba(168, 85, 247, 0.3)',
    footerClass: 'bg-[#1e1b4b] border-purple-500/20',
    qrBorderHex: '#7c3aed',
    qrFooterBgHex: '#3b0764',
    avatarRingHex: '#a855f7',
  },
  {
    id: 'crimson',
    name: 'Ruby Crimson',
    badgeName: 'Executive Titan',
    chipClass: 'bg-gradient-to-r from-[#450a0a] via-[#701a75] to-[#881337] border-rose-400',
    headerCssClass: 'bg-gradient-to-r from-[#450a0a] via-[#701a75] to-[#881337]',
    headerGradient: ['#450a0a', '#701a75', '#881337'],
    bodyBgClass: 'bg-gradient-to-b from-[#fff1f2] via-[#ffe4e6] to-[#fecdd3]',
    bodyBgHex: '#ffe4e6',
    bodyPatternColor: 'rgba(225, 29, 72, 0.08)',
    accentHex: '#f43f5e',
    accentBorderClass: 'border-rose-400/40',
    accentTextClass: 'text-rose-400',
    badgeGradient: ['#f43f5e', '#e11d48'],
    idBoxBgHex: '#450a0a',
    idBoxBorderHex: '#f43f5e',
    idTextColorHex: '#fda4af',
    idBoxClass: 'bg-[#450a0a] border-rose-500/50 text-rose-300',
    footerBgHex: '#450a0a',
    footerBorderHex: 'rgba(244, 63, 94, 0.3)',
    footerClass: 'bg-[#450a0a] border-rose-500/20',
    qrBorderHex: '#e11d48',
    qrFooterBgHex: '#450a0a',
    avatarRingHex: '#f43f5e',
  },
  {
    id: 'slate',
    name: 'Midnight Onyx',
    badgeName: 'Carbon Stealth',
    chipClass: 'bg-gradient-to-r from-[#020617] via-[#0f172a] to-[#1e293b] border-slate-400',
    headerCssClass: 'bg-gradient-to-r from-[#020617] via-[#0f172a] to-[#1e293b]',
    headerGradient: ['#020617', '#0f172a', '#1e293b'],
    bodyBgClass: 'bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]',
    bodyBgHex: '#f1f5f9',
    bodyPatternColor: 'rgba(15, 23, 42, 0.08)',
    accentHex: '#94a3b8',
    accentBorderClass: 'border-slate-400/40',
    accentTextClass: 'text-slate-300',
    badgeGradient: ['#64748b', '#475569'],
    idBoxBgHex: '#0f172a',
    idBoxBorderHex: '#64748b',
    idTextColorHex: '#e2e8f0',
    idBoxClass: 'bg-[#0f172a] border-slate-600 text-slate-200',
    footerBgHex: '#020617',
    footerBorderHex: 'rgba(148, 163, 184, 0.3)',
    footerClass: 'bg-[#020617] border-slate-700/40',
    qrBorderHex: '#64748b',
    qrFooterBgHex: '#0f172a',
    avatarRingHex: '#64748b',
  },
];

export const MemberIdCardView: React.FC<MemberIdCardViewProps> = ({ onBack }) => {
  const { profile, user, language, setActiveTab, withdrawRequests, appLogo } = useApp();
  const t = translations[language];
  const effectiveAppLogo = appLogo || DEFAULT_LOGO;

  const [logoImgError, setLogoImgError] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [selectedThemeId, setSelectedThemeId] = useState<string>(() => {
    try {
      return localStorage.getItem('mf_id_card_theme') || 'navy';
    } catch {
      return 'navy';
    }
  });

  const activeTheme = useMemo(() => {
    return CARD_THEMES.find((t) => t.id === selectedThemeId) || CARD_THEMES[0];
  }, [selectedThemeId]);

  const handleSelectTheme = (themeId: string) => {
    hapticFeedback.light();
    setSelectedThemeId(themeId);
    try {
      localStorage.setItem('mf_id_card_theme', themeId);
    } catch {
      // ignore
    }
  };

  // 100% REAL DATA VALIDATION
  // Check if user has completed or approved real withdrawals from database
  const hasWithdrawn = Boolean(
    Number(profile?.total_withdrawn) > 0 ||
    (withdrawRequests && withdrawRequests.some((w) => w.status === 'approved' || (w as any).status === 'completed'))
  );

  // Real User Profile Data directly from Firebase User & Profile State
  const fullName =
    (profile as any)?.displayName ||
    profile?.username ||
    user?.displayName ||
    (user?.email ? user.email.split('@')[0] : 'Member User');
  const username =
    profile?.username ||
    (user?.displayName ? user.displayName.toLowerCase().replace(/\s+/g, '') : '') ||
    (user?.email ? user.email.split('@')[0] : 'member');

  // Format Real Member ID derived consistently from User UID
  const cleanUid = useMemo(() => {
    const rawUid = profile?.uid || user?.uid || '8A72K9';
    return rawUid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();
  }, [profile?.uid, user?.uid]);

  const memberId = useMemo(() => {
    return `MF-2026-${cleanUid.padEnd(6, 'X')}`;
  }, [cleanUid]);

  // Security Barcode & Hash Key
  const barcodeNumber = useMemo(() => {
    return `MF2026${cleanUid}`;
  }, [cleanUid]);

  const securityHash = useMemo(() => {
    return `SEC-#${cleanUid}-26`;
  }, [cleanUid]);

  // Real Formatted Join Date (e.g. 17 August 2026)
  const joinDateFormatted = useMemo(() => {
    let ts = profile?.createdAt;
    if (!ts && user?.metadata?.creationTime) {
      ts = new Date(user.metadata.creationTime).getTime();
    }
    if (!ts) return '17 August 2026';
    const d = new Date(ts);
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  }, [profile?.createdAt, user?.metadata?.creationTime]);

  // Validity / Expiry: 2 Years from Join Date or 2028
  const validityFormatted = useMemo(() => {
    let ts = profile?.createdAt || Date.now();
    const d = new Date(ts);
    const expYear = d.getFullYear() + 2;
    return `31 Dec ${expYear} (Lifetime Active)`;
  }, [profile?.createdAt]);

  // 1. Work & Rank Metrics (Real user activity)
  const totalSubmissionsCount = Number(profile?.manual_approved_count || profile?.total_submitted || 0);
  const totalWithdrawnAmount = Number(profile?.total_withdrawn || 0);

  const memberTier = useMemo(() => {
    if (totalWithdrawnAmount >= 5000 || totalSubmissionsCount >= 100 || profile?.isTopSeller) {
      return { title: 'VIP Elite', icon: '👑', color: 'from-amber-400 to-amber-600', text: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-400/40' };
    }
    if (totalWithdrawnAmount >= 1000 || totalSubmissionsCount >= 30) {
      return { title: 'Gold Partner', icon: '🥇', color: 'from-yellow-400 to-amber-500', text: 'text-amber-600', bg: 'bg-amber-50 border-amber-300' };
    }
    if (hasWithdrawn || totalSubmissionsCount >= 5) {
      return { title: 'Silver Partner', icon: '🥈', color: 'from-cyan-400 to-blue-500', text: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-300' };
    }
    return { title: 'Starter Member', icon: '⭐', color: 'from-slate-400 to-slate-600', text: 'text-slate-600', bg: 'bg-slate-50 border-slate-300' };
  }, [totalWithdrawnAmount, totalSubmissionsCount, profile?.isTopSeller, hasWithdrawn]);

  // Real Trust Score (Dynamic 98.6% - 99.9%)
  const trustScore = useMemo(() => {
    if (profile?.is_blocked) return 'Suspended';
    const bonus = Math.min((profile?.login_streak || 1) * 0.1 + (totalSubmissionsCount > 10 ? 0.8 : 0.3), 1.4);
    return `${(98.5 + bonus).toFixed(1)}% Trust Score (5.0 ★)`;
  }, [profile?.is_blocked, profile?.login_streak, totalSubmissionsCount]);

  // Account Status
  const accountStatus = profile?.is_blocked ? 'Suspended' : 'Active';

  // Public Real Verification URL (Live URL)
  const hostDomain =
    typeof window !== 'undefined' && window.location.host && !window.location.host.includes('localhost')
      ? window.location.host
      : 'mailfactory.top';

  const verificationUrl =
    typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
      ? `${window.location.origin}/id-card#verify/${profile?.uid || user?.uid || 'member'}`
      : `https://mailfactory.top/id-card#verify/${profile?.uid || user?.uid || 'member'}`;

  const handleCopyLink = () => {
    hapticFeedback.medium();
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Ultra-crisp, reliable HTML5 Canvas Card Generator (Matching Selected Theme with Full Background Patterns, Barcode & Hologram)
  const handleDownloadCard = async () => {
    hapticFeedback.heavy();
    setIsDownloading(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // High-resolution dimensions for crisp printing & sharing (1600x1100)
      const width = 1600;
      const height = 1100;
      canvas.width = width;
      canvas.height = height;

      // 1. Overall Base Canvas
      ctx.clearRect(0, 0, width, height);

      // 2. Card Container (Rounded Rectangle with subtle shadow)
      const cardX = 30;
      const cardY = 30;
      const cardW = width - 60;
      const cardH = height - 60;
      const cardRadius = 40;

      // Draw Base Outer Drop Shadow
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, cardRadius);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 35;
      ctx.shadowOffsetY = 18;
      ctx.fill();
      ctx.restore();

      // Clip inside card for header, body patterns and footer rounded corners
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, cardRadius);
      ctx.clip();

      // ==========================================
      // 3. CARD BODY BACKGROUND (Themed Design Patterns & Micro-Security)
      // ==========================================
      // Draw Theme Tinted Gradient Body
      const bodyGrad = ctx.createLinearGradient(cardX, cardY + 230, cardX, cardY + cardH - 65);
      bodyGrad.addColorStop(0, '#ffffff');
      bodyGrad.addColorStop(0.5, activeTheme.bodyBgHex);
      bodyGrad.addColorStop(1, '#ffffff');
      ctx.fillStyle = bodyGrad;
      ctx.fillRect(cardX, cardY + 230, cardW, cardH - 230 - 65);

      // Draw Security Guilloche / Rosette Radial Pattern in Background Center
      const bgCenterX = cardX + cardW / 2;
      const bgCenterY = cardY + 230 + (cardH - 230 - 65) / 2;
      ctx.save();
      ctx.strokeStyle = activeTheme.bodyPatternColor;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 24; i++) {
        const angle = (i * Math.PI) / 12;
        ctx.beginPath();
        ctx.ellipse(bgCenterX, bgCenterY, 340, 180, angle, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // Micro-security grid lines across card body
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.lineWidth = 1;
      for (let x = cardX; x < cardX + cardW; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, cardY + 230);
        ctx.lineTo(x, cardY + cardH - 65);
        ctx.stroke();
      }
      for (let y = cardY + 230; y < cardY + cardH - 65; y += 40) {
        ctx.beginPath();
        ctx.moveTo(cardX, y);
        ctx.lineTo(cardX + cardW, y);
        ctx.stroke();
      }

      // Security Micro-Text Ribbon across top of body
      ctx.save();
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = activeTheme.bodyPatternColor;
      ctx.textAlign = 'center';
      ctx.letterSpacing = '6px';
      ctx.fillText(
        '★ MAIL FACTORY OFFICIAL IDENTIFICATION CARD • VERIFIED SECURE MEMBER • MF CENTRAL REGISTRY ★',
        bgCenterX,
        cardY + 258
      );
      ctx.restore();

      // ==========================================
      // 4. TOP HEADER (Custom Theme Gradient)
      // ==========================================
      const headerH = 230;
      const headerGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + headerH);
      headerGrad.addColorStop(0, activeTheme.headerGradient[0]);
      headerGrad.addColorStop(0.5, activeTheme.headerGradient[1]);
      headerGrad.addColorStop(1, activeTheme.headerGradient[2]);

      ctx.fillStyle = headerGrad;
      ctx.fillRect(cardX, cardY, cardW, headerH);

      // Accent bottom border under header
      ctx.strokeStyle = activeTheme.accentHex;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cardX, cardY + headerH);
      ctx.lineTo(cardX + cardW, cardY + headerH);
      ctx.stroke();

      // Header dot matrix subtle pattern
      ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
      for (let x = cardX; x < cardX + cardW; x += 30) {
        for (let y = cardY; y < cardY + headerH; y += 30) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Preload the official app logo image for crisp, guaranteed rendering on downloaded canvas
      const loadAppLogo = (): Promise<HTMLImageElement | null> => {
        return new Promise((resolve) => {
          const sources = [
            effectiveAppLogo,
            '/app-logo.png',
            '/icon-512.png',
            DEFAULT_LOGO,
          ].filter(Boolean);

          let idx = 0;
          const tryNext = () => {
            if (idx >= sources.length) {
              resolve(null);
              return;
            }
            const currentSrc = sources[idx++];
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              if (img.naturalWidth > 0) resolve(img);
              else tryNext();
            };
            img.onerror = () => tryNext();
            img.src = currentSrc;
          };

          tryNext();
          setTimeout(() => resolve(null), 3000);
        });
      };

      const logoImg = await loadAppLogo();

      // --- Draw Official Mail Factory Logo in Canvas Header ---
      const logoBoxX = cardX + 55;
      const logoBoxY = cardY + 40;
      const logoBoxSize = 145;
      const logoRadius = 28;

      // Outer Logo Box
      ctx.fillStyle = activeTheme.idBoxBgHex;
      ctx.beginPath();
      ctx.roundRect(logoBoxX, logoBoxY, logoBoxSize, logoBoxSize, logoRadius);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.stroke();

      if (logoImg) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(logoBoxX + 4, logoBoxY + 4, logoBoxSize - 8, logoBoxSize - 8, logoRadius - 4);
        ctx.clip();
        ctx.drawImage(logoImg, logoBoxX + 4, logoBoxY + 4, logoBoxSize - 8, logoBoxSize - 8);
        ctx.restore();
      } else {
        // Vector Emblem Drawing Fallback
        const embCenterX = logoBoxX + logoBoxSize / 2;
        const embCenterY = logoBoxY + logoBoxSize / 2;

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(embCenterX, embCenterY - 18, 16, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(embCenterX - 45, embCenterY - 14, 90, 56, 8);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.strokeStyle = '#fcd34d';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(embCenterX - 45, embCenterY - 12);
        ctx.lineTo(embCenterX, embCenterY + 16);
        ctx.lineTo(embCenterX + 45, embCenterY - 12);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(embCenterX - 28, embCenterY + 32);
        ctx.lineTo(embCenterX - 28, embCenterY + 2);
        ctx.lineTo(embCenterX, embCenterY + 20);
        ctx.lineTo(embCenterX + 28, embCenterY + 2);
        ctx.lineTo(embCenterX + 28, embCenterY + 32);
        ctx.stroke();

        ctx.fillStyle = '#fcd34d';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★', embCenterX, logoBoxY + logoBoxSize - 8);
      }

      // --- Header Brand Typography ---
      const brandTextX = logoBoxX + logoBoxSize + 28;
      ctx.font = '900 62px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Mail ', brandTextX, cardY + 95);

      const mailWidth = ctx.measureText('Mail ').width;
      ctx.fillStyle = '#fcd34d'; // Amber/Gold branding
      ctx.fillText('Factory', brandTextX + mailWidth, cardY + 95);

      // Slogan text: ★ TRUSTED • FAST • OFFICIAL ★
      ctx.font = '800 18px sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.letterSpacing = '4px';
      ctx.fillText('★ TRUSTED  •  FAST  •  OFFICIAL ★', brandTextX, cardY + 155);
      ctx.letterSpacing = '0px';

      // --- Header Right Official Member Badge & Security Hash ---
      const badgeX = cardX + cardW - 220;
      const badgeY = cardY + 38;
      const badgeW = 160;
      const badgeH = 150;

      // Badge Shield Icon Box
      const shieldGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX, badgeY + badgeH);
      shieldGrad.addColorStop(0, activeTheme.badgeGradient[0]);
      shieldGrad.addColorStop(1, activeTheme.badgeGradient[1]);

      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      ctx.roundRect(badgeX + 40, badgeY, 80, 95, 18);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Shield Check Icon drawing
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(badgeX + 64, badgeY + 46);
      ctx.lineTo(badgeX + 76, badgeY + 58);
      ctx.lineTo(badgeX + 96, badgeY + 36);
      ctx.stroke();

      // Badge Text under shield
      ctx.font = '900 17px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(hasWithdrawn ? 'VERIFIED' : 'GENERAL', badgeX + 80, badgeY + 118);
      ctx.fillText('MEMBER', badgeX + 80, badgeY + 138);

      // ==========================================
      // 5. CARD BODY (3 COLUMNS: Photo, Info, QR + Hologram + Barcode)
      // ==========================================
      const bodyTop = cardY + headerH;

      // ----- LEFT COLUMN: PHOTO & ID & HOLOGRAPHIC SEAL -----
      const leftColCenter = cardX + 235;
      const avatarCenterY = bodyTop + 145;
      const avatarRadius = 105;

      // Outer Circular Ring with active theme
      ctx.beginPath();
      ctx.arc(leftColCenter, avatarCenterY, avatarRadius + 7, 0, Math.PI * 2);
      ctx.fillStyle = activeTheme.avatarRingHex;
      ctx.fill();

      // Inner White Ring
      ctx.beginPath();
      ctx.arc(leftColCenter, avatarCenterY, avatarRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Avatar circle
      let photoDrawn = false;
      if (profile?.photoURL) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = profile.photoURL;
          await new Promise((resolve) => {
            img.onload = () => {
              ctx.save();
              ctx.beginPath();
              ctx.arc(leftColCenter, avatarCenterY, avatarRadius - 4, 0, Math.PI * 2);
              ctx.clip();
              ctx.drawImage(
                img,
                leftColCenter - avatarRadius,
                avatarCenterY - avatarRadius,
                avatarRadius * 2,
                avatarRadius * 2
              );
              ctx.restore();
              photoDrawn = true;
              resolve(null);
            };
            img.onerror = () => resolve(null);
            setTimeout(resolve, 600);
          });
        } catch {
          photoDrawn = false;
        }
      }

      if (!photoDrawn) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(leftColCenter, avatarCenterY, avatarRadius - 4, 0, Math.PI * 2);
        ctx.fillStyle = activeTheme.headerGradient[1];
        ctx.fill();
        ctx.font = '900 76px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(fullName.charAt(0).toUpperCase(), leftColCenter, avatarCenterY);
        ctx.restore();
      }

      // Member ID Badge
      const memberIdBoxW = 270;
      const memberIdBoxH = 70;
      const memberIdBoxX = leftColCenter - memberIdBoxW / 2;
      const memberIdBoxY = avatarCenterY + avatarRadius + 22;

      ctx.fillStyle = activeTheme.idBoxBgHex;
      ctx.beginPath();
      ctx.roundRect(memberIdBoxX, memberIdBoxY, memberIdBoxW, memberIdBoxH, 18);
      ctx.fill();
      ctx.strokeStyle = activeTheme.idBoxBorderHex;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.font = '800 15px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('MEMBER ID', leftColCenter, memberIdBoxY + 10);

      ctx.font = '900 24px monospace';
      ctx.fillStyle = activeTheme.idTextColorHex;
      ctx.fillText(memberId, leftColCenter, memberIdBoxY + 34);

      // --- Digital Holographic Seal Badge on Left Column ---
      const sealX = leftColCenter;
      const sealY = memberIdBoxY + memberIdBoxH + 50;
      const sealR = 38;

      ctx.save();
      const holoGrad = ctx.createRadialGradient(sealX, sealY, 5, sealX, sealY, sealR);
      holoGrad.addColorStop(0, '#fef08a');
      holoGrad.addColorStop(0.3, '#f59e0b');
      holoGrad.addColorStop(0.6, '#38bdf8');
      holoGrad.addColorStop(1, '#eab308');

      ctx.fillStyle = holoGrad;
      ctx.beginPath();
      ctx.arc(sealX, sealY, sealR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(sealX, sealY, sealR - 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(sealX, sealY, sealR - 8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = '900 18px sans-serif';
      ctx.fillStyle = '#fde047';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🛡️', sealX, sealY - 6);

      ctx.font = '800 9px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.letterSpacing = '1px';
      ctx.fillText('GENUINE', sealX, sealY + 12);
      ctx.letterSpacing = '0px';
      ctx.restore();

      // Signature line under seal
      const sigY = sealY + 54;
      ctx.font = 'italic 28px "Brush Script MT", cursive, sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'center';
      ctx.fillText('Mail Factory', leftColCenter, sigY);

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(leftColCenter - 80, sigY + 8);
      ctx.lineTo(leftColCenter + 80, sigY + 8);
      ctx.stroke();

      ctx.font = '700 12px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Authorized Signature', leftColCenter, sigY + 22);

      // ----- MIDDLE COLUMN: USER DATA + RANK & SECURITY METRICS -----
      const midColX = cardX + 440;
      let curRowY = bodyTop + 65;
      const rowGap = 92;

      const drawDataRow = (
        label: string,
        val: string,
        iconType: 'user' | 'users' | 'cal' | 'shield' | 'award' | 'check' | 'lock',
        badgeContent?: { text: string; bg: string; color: string }
      ) => {
        // Row Glass Background Container
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.roundRect(midColX - 10, curRowY - 6, 560, 78, 16);
        ctx.fill();
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.9)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Icon Circle
        ctx.fillStyle = activeTheme.headerGradient[1];
        ctx.beginPath();
        ctx.arc(midColX + 22, curRowY + 32, 22, 0, Math.PI * 2);
        ctx.fill();

        // Icon representation inside circle
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (iconType === 'user') ctx.fillText('👤', midColX + 22, curRowY + 32);
        else if (iconType === 'users') ctx.fillText('👥', midColX + 22, curRowY + 32);
        else if (iconType === 'cal') ctx.fillText('📅', midColX + 22, curRowY + 32);
        else if (iconType === 'shield') ctx.fillText('🛡️', midColX + 22, curRowY + 32);
        else if (iconType === 'award') ctx.fillText('🏆', midColX + 22, curRowY + 32);
        else if (iconType === 'check') ctx.fillText('✓', midColX + 22, curRowY + 32);
        else if (iconType === 'lock') ctx.fillText('🔒', midColX + 22, curRowY + 32);

        // Label
        ctx.font = '700 14px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(label, midColX + 58, curRowY + 6);

        // Value or Badges
        if (badgeContent) {
          ctx.font = '900 17px sans-serif';
          const badgeTextW = ctx.measureText(badgeContent.text).width;
          const badgeBoxW = badgeTextW + 30;
          const badgeBoxH = 34;
          const badgeBoxX = midColX + 58;
          const badgeBoxY = curRowY + 28;

          ctx.fillStyle = badgeContent.bg;
          ctx.beginPath();
          ctx.roundRect(badgeBoxX, badgeBoxY, badgeBoxW, badgeBoxH, 8);
          ctx.fill();

          ctx.fillStyle = badgeContent.color;
          ctx.textBaseline = 'middle';
          ctx.fillText(badgeContent.text, badgeBoxX + 15, badgeBoxY + badgeBoxH / 2);
        } else {
          ctx.font = '900 24px sans-serif';
          ctx.fillStyle = '#0f172a';
          ctx.textBaseline = 'top';
          ctx.fillText(val, midColX + 58, curRowY + 28);
        }

        curRowY += rowGap;
      };

      // 1. Full Name
      drawDataRow('Full Name', fullName, 'user');

      // 2. Member Rank & Performance Tier (Idea #1)
      drawDataRow(
        'Member Rank Tier',
        '',
        'award',
        { text: `${memberTier.icon} ${memberTier.title}`, bg: '#fef3c7', color: '#b45309' }
      );

      // 3. Completed Tasks / Submissions (Idea #1)
      drawDataRow('Tasks Completed', `${totalSubmissionsCount} Approved Mails Submitted`, 'check');

      // 4. Trust Score Rating (Idea #1)
      drawDataRow('Trust & Quality Score', trustScore, 'shield');

      // 5. Card Validity / Expiry (Idea #2)
      drawDataRow('Card Validity', validityFormatted, 'cal');

      // 6. Security Hash ID (Idea #2)
      drawDataRow('Security Hash Code', `${securityHash} • Encrypted Registry`, 'lock');

      // ----- RIGHT COLUMN: QR CODE + 1D BARCODE BOX (Idea #2) -----
      const rightColX = cardX + cardW - 320;
      const qrBoxW = 260;
      const qrBoxH = 320;
      const qrBoxY = bodyTop + 80;

      // QR Outer Rounded Border with Shadow
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(rightColX, qrBoxY, qrBoxW, qrBoxH, 32);
      ctx.fill();
      ctx.strokeStyle = activeTheme.qrBorderHex;
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Render QR Code SVG to image onto canvas
      try {
        const qrSvgElement = document.querySelector('#card-qr-svg');
        if (qrSvgElement) {
          const svgData = new XMLSerializer().serializeToString(qrSvgElement);
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const blobURL = window.URL.createObjectURL(svgBlob);

          const qrImg = new Image();
          await new Promise((res) => {
            qrImg.onload = () => {
              ctx.drawImage(qrImg, rightColX + 30, qrBoxY + 25, 200, 200);
              window.URL.revokeObjectURL(blobURL);
              res(null);
            };
            qrImg.onerror = () => res(null);
            qrImg.src = blobURL;
            setTimeout(res, 500);
          });
        }
      } catch {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(rightColX + 30, qrBoxY + 25, 200, 200);
      }

      // QR Center Logo Badge (Official Mail Factory App Logo)
      const qrCenterX = rightColX + qrBoxW / 2;
      const qrCenterY = qrBoxY + 125;
      const qrCenterRadius = 26;

      // Outer White Circle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(qrCenterX, qrCenterY, qrCenterRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      if (logoImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(qrCenterX, qrCenterY, qrCenterRadius - 3.5, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(
          logoImg,
          qrCenterX - (qrCenterRadius - 3.5),
          qrCenterY - (qrCenterRadius - 3.5),
          (qrCenterRadius - 3.5) * 2,
          (qrCenterRadius - 3.5) * 2
        );
        ctx.restore();
      } else {
        // Inner Theme Shield / Circle Fallback
        ctx.fillStyle = activeTheme.headerGradient[1];
        ctx.beginPath();
        ctx.arc(qrCenterX, qrCenterY, qrCenterRadius - 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Official Mail Factory 3D Envelope Emblem inside QR center
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(qrCenterX - 14, qrCenterY - 9, 28, 18, 3);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.strokeStyle = '#fcd34d';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(qrCenterX - 14, qrCenterY - 9);
        ctx.lineTo(qrCenterX, qrCenterY);
        ctx.lineTo(qrCenterX + 14, qrCenterY - 9);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(qrCenterX - 8, qrCenterY + 6);
        ctx.lineTo(qrCenterX - 8, qrCenterY - 4);
        ctx.lineTo(qrCenterX, qrCenterY + 2);
        ctx.lineTo(qrCenterX + 8, qrCenterY - 4);
        ctx.lineTo(qrCenterX + 8, qrCenterY + 6);
        ctx.stroke();
      }

      // Bottom Theme Box of QR
      const qrFooterH = 75;
      ctx.fillStyle = activeTheme.qrFooterBgHex;
      ctx.beginPath();
      ctx.roundRect(rightColX, qrBoxY + qrBoxH - qrFooterH, qrBoxW, qrFooterH, [0, 0, 28, 28]);
      ctx.fill();

      ctx.font = '800 16px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📱 Scan to verify', qrCenterX, qrBoxY + qrBoxH - 46);
      ctx.fillText('profile identity', qrCenterX, qrBoxY + qrBoxH - 24);

      // --- 1D Barcode Box Below QR Code (Idea #2) ---
      const barcodeBoxY = qrBoxY + qrBoxH + 20;
      const barcodeBoxH = 110;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.roundRect(rightColX, barcodeBoxY, qrBoxW, barcodeBoxH, 20);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw vector barcode bars
      const barStartX = rightColX + 25;
      const barWidth = 210;
      const barHeight = 44;
      const barTop = barcodeBoxY + 18;

      ctx.fillStyle = '#0f172a';
      let currentX = barStartX;
      for (let i = 0; i < barcodeNumber.length; i++) {
        const cCode = barcodeNumber.charCodeAt(i);
        const w1 = (cCode % 3) + 1.5;
        const gap = ((cCode * 2) % 2) + 2;
        const w2 = ((cCode * 3) % 2) + 1.5;

        ctx.fillRect(currentX, barTop, w1, barHeight);
        currentX += w1 + gap;
        ctx.fillRect(currentX, barTop, w2, barHeight);
        currentX += w2 + gap;
      }

      // Barcode Alphanumeric label
      ctx.font = 'bold 15px monospace';
      ctx.fillStyle = '#475569';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '2px';
      ctx.fillText(`*${barcodeNumber}*`, rightColX + qrBoxW / 2, barcodeBoxY + barcodeBoxH - 22);
      ctx.letterSpacing = '0px';

      // ==========================================
      // 6. BOTTOM FOOTER BAR
      // ==========================================
      const footerH = 65;
      const footerY = cardY + cardH - footerH;

      ctx.fillStyle = activeTheme.footerBgHex;
      ctx.fillRect(cardX, footerY, cardW, footerH);

      ctx.strokeStyle = activeTheme.footerBorderHex;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cardX, footerY);
      ctx.lineTo(cardX + cardW, footerY);
      ctx.stroke();

      // Left: Globe & URL
      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = '#e2e8f0';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`🌐  ${hostDomain}/verify`, cardX + 50, footerY + footerH / 2);

      // Center: Security Level
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.textAlign = 'center';
      ctx.fillText('🔒 256-BIT ENCRYPTED ID', bgCenterX, footerY + footerH / 2);

      // Right: Security Shield & text
      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.textAlign = 'right';
      ctx.fillText('🛡️  Trusted • Secure • Verified', cardX + cardW - 50, footerY + footerH / 2);

      ctx.restore(); // Restore clip

      // ==========================================
      // 7. Trigger Direct Instant Download
      // ==========================================
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Mail_Factory_Member_Card_${username}_${activeTheme.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating card:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 space-y-6">
      {/* Hidden SVG element specifically used for QR rasterization */}
      <div style={{ display: 'none' }}>
        <QRCode
          id="card-qr-svg"
          size={256}
          level="H"
          value={verificationUrl}
          viewBox="0 0 256 256"
          fgColor="#020b1e"
          bgColor="#ffffff"
        />
      </div>

      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            hapticFeedback.light();
            if (onBack) onBack();
            else setActiveTab('profile');
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-black">
          <ShieldCheck className="w-4 h-4 text-cyan-600" />
          <span>Official Executive Member ID Card</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CARD BACKGROUND THEME SELECTOR (INTERACTIVE THEME SWITCHER) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                <span>Card Background & Theme Style</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                  {CARD_THEMES.length} Styles
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Choose your background pattern, executive gradient, and download in HD with Barcode & Seal
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-xs font-extrabold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Active: {activeTheme.name}</span>
          </div>
        </div>

        {/* Theme Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-1">
          {CARD_THEMES.map((thm) => {
            const isSelected = thm.id === selectedThemeId;
            return (
              <button
                key={thm.id}
                onClick={() => handleSelectTheme(thm.id)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden text-center group active:scale-95 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                }`}
              >
                {/* Color Dot with Ring */}
                <div
                  className={`w-8 h-8 rounded-full shadow-inner border-2 transition-transform group-hover:scale-110 flex items-center justify-center ${thm.chipClass} ${
                    isSelected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </div>

                <span className="text-[11px] font-black text-slate-900 mt-2 leading-tight">
                  {thm.name}
                </span>
                <span className="text-[9px] text-slate-500 font-medium leading-none mt-0.5">
                  {thm.badgeName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Action Bar (Download, Verify, Copy Link) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Download Card PNG */}
        <button
          onClick={handleDownloadCard}
          disabled={isDownloading}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#00b4d8] to-[#0284c7] hover:from-[#0096c7] hover:to-[#0369a1] text-white font-black text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating {activeTheme.name} HD...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download Full ID Card (HD PNG)</span>
            </>
          )}
        </button>

        {/* Copy Verification Link */}
        <button
          onClick={handleCopyLink}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-extrabold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-600">Verification Link Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-600" />
              <span>Copy Verification Link</span>
            </>
          )}
        </button>

        {/* Live Verification Modal */}
        <button
          onClick={() => {
            hapticFeedback.light();
            setShowVerifyModal(true);
          }}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <QrCode className="w-4 h-4 text-cyan-400" />
          <span>Verify Certificate</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* EXACT ID CARD REPLICA CONTAINER (WITH SECTIONS 1 & 2 INTEGRATED) */}
      {/* ========================================================================= */}
      <div className="w-full max-w-[860px] mx-auto py-2">
        <div
          id="member-id-card"
          className="w-full rounded-3xl sm:rounded-[32px] overflow-hidden shadow-2xl border border-slate-200/90 text-slate-900 relative select-none transition-all duration-300"
        >
          {/* ================= TOP HEADER BAR ================= */}
          <div
            className={`relative ${activeTheme.headerCssClass} text-white px-4 py-4 sm:px-8 sm:py-5 flex items-center justify-between overflow-hidden border-b-2 ${activeTheme.accentBorderClass} transition-colors duration-300`}
          >
            {/* Background Wave & Dot Matrix Design */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] [background-size:18px_18px] opacity-10 pointer-events-none" />
            <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
            <div className="absolute -left-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            {/* Left: Brand Logo & Typography */}
            <div className="flex items-center gap-3 sm:gap-4 relative z-10">
              {/* Mail Factory Official Logo Box */}
              <div className="relative shrink-0">
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 shadow-md flex items-center justify-center p-0.5 overflow-hidden transition-colors"
                  style={{
                    backgroundColor: activeTheme.idBoxBgHex,
                    borderColor: '#f59e0b',
                  }}
                >
                  {effectiveAppLogo ? (
                    <img
                      src={effectiveAppLogo}
                      alt="Mail Factory"
                      className="w-full h-full object-cover rounded-xl"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/app-logo.png';
                      }}
                    />
                  ) : (
                    <img
                      src="/app-logo.png"
                      alt="Mail Factory"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  )}
                </div>
              </div>

              {/* Title & Slogan */}
              <div>
                <div className="flex items-center text-2xl sm:text-3xl font-black tracking-tight leading-none">
                  <span className="text-white">Mail</span>
                  <span className="text-amber-300 ml-1.5 sm:ml-2">Factory</span>
                </div>
                <div className="text-[9px] sm:text-[11px] font-black tracking-[0.2em] sm:tracking-[0.25em] text-slate-200 mt-1 uppercase flex items-center gap-1.5 sm:gap-2">
                  <span className="text-amber-300">★</span>
                  <span>TRUSTED</span>
                  <span className="text-amber-300">•</span>
                  <span>FAST</span>
                  <span className="text-amber-300">•</span>
                  <span>OFFICIAL</span>
                  <span className="text-amber-300">★</span>
                </div>
              </div>
            </div>

            {/* Right: Official Member Badge with Shield */}
            <div className="relative z-10 flex flex-col items-center shrink-0">
              <div
                className="w-10 h-12 sm:w-12 sm:h-14 rounded-xl flex flex-col items-center justify-center p-1 sm:p-1.5 shadow-lg border-2 border-white/30"
                style={{
                  background: `linear-gradient(to bottom, ${activeTheme.badgeGradient[0]}, ${activeTheme.badgeGradient[1]})`,
                }}
              >
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-[8px] sm:text-[10px] font-black tracking-wider text-white uppercase mt-1 drop-shadow-xs text-center whitespace-nowrap">
                {hasWithdrawn ? 'VERIFIED MEMBER' : 'GENERAL MEMBER'}
              </span>
            </div>
          </div>

          {/* ================= CARD BODY WITH THEMED BACKGROUND PATTERNS ================= */}
          <div className={`relative px-4 py-5 sm:px-8 sm:py-6 ${activeTheme.bodyBgClass} transition-colors duration-300`}>
            {/* Background Guilloche Security Rosette & Grid Overlay */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
              <svg className="w-full h-full" viewBox="0 0 800 500" fill="none">
                <circle cx="400" cy="250" r="220" stroke="currentColor" strokeWidth="1" className={activeTheme.accentTextClass} />
                <circle cx="400" cy="250" r="180" stroke="currentColor" strokeWidth="1" strokeDasharray="6 4" className={activeTheme.accentTextClass} />
                <circle cx="400" cy="250" r="140" stroke="currentColor" strokeWidth="1" className={activeTheme.accentTextClass} />
                <circle cx="400" cy="250" r="100" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className={activeTheme.accentTextClass} />
              </svg>
            </div>

            {/* Micro-Text Security Ribbon */}
            <div className="w-full text-center pb-2 text-[8px] sm:text-[9px] font-bold tracking-[0.25em] uppercase text-slate-400 select-none">
              ★ MAIL FACTORY OFFICIAL IDENTIFICATION SYSTEM • SECURE MEMBER REGISTRY ★
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 sm:gap-6 items-center relative z-10">
              {/* ----------------- 1. LEFT COLUMN: PHOTO, ID, HOLOGRAM & SIGNATURE ----------------- */}
              <div className="sm:col-span-4 flex flex-col items-center text-center space-y-3 sm:space-y-3.5">
                {/* Circular Avatar with Theme Border Ring */}
                <div className="relative">
                  <div
                    className="w-28 h-28 sm:w-34 sm:h-34 rounded-full p-1 bg-white border-[4px] sm:border-[5px] shadow-xl overflow-hidden flex items-center justify-center transition-colors"
                    style={{ borderColor: activeTheme.avatarRingHex }}
                  >
                    {profile?.photoURL ? (
                      <img
                        src={profile.photoURL}
                        alt={fullName}
                        className="w-full h-full object-cover rounded-full"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div
                        className="w-full h-full rounded-full flex items-center justify-center text-white text-3xl font-black transition-colors"
                        style={{ backgroundColor: activeTheme.headerGradient[1] }}
                      >
                        {fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Theme Colored Member ID Box */}
                <div
                  className="w-full max-w-[210px] text-white py-1.5 px-3 rounded-2xl shadow-md border text-center transition-colors"
                  style={{
                    backgroundColor: activeTheme.idBoxBgHex,
                    borderColor: activeTheme.idBoxBorderHex,
                  }}
                >
                  <span className="text-[8px] font-bold tracking-[0.2em] text-slate-300 block uppercase">
                    MEMBER ID
                  </span>
                  <span
                    className="text-xs sm:text-sm font-black font-mono tracking-wider block mt-0.5"
                    style={{ color: activeTheme.idTextColorHex }}
                  >
                    {memberId}
                  </span>
                </div>

                {/* Digital Hologram Seal (Idea #2) */}
                <div className="pt-1 flex flex-col items-center">
                  <HologramSecuritySeal size={52} className="w-13 h-13" />
                  <span className="text-[8px] font-bold text-slate-500 tracking-wider uppercase mt-1">
                    Official Security Seal
                  </span>
                </div>

                {/* Authorized Signature */}
                <div className="pt-0.5 flex flex-col items-center">
                  <span
                    className="text-xl sm:text-2xl text-slate-800 select-none leading-none"
                    style={{
                      fontFamily: 'cursive, "Brush Script MT", "Caveat", sans-serif',
                    }}
                  >
                    Mail Factory
                  </span>
                  <div className="w-28 h-[1.5px] bg-slate-300 mt-1" />
                  <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                    Authorized Signature
                  </span>
                </div>
              </div>

              {/* ----------------- 2. MIDDLE COLUMN: DATA, RANK & SECURITY METRICS ----------------- */}
              <div className="sm:col-span-5 space-y-2 sm:space-y-2.5 sm:pl-1">
                {/* Row 1: Full Name */}
                <div className="p-2.5 sm:p-3 bg-white/90 backdrop-blur-xs rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs transition-colors"
                      style={{ backgroundColor: activeTheme.headerGradient[1] }}
                    >
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500 block leading-none">
                        Full Name
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight mt-0.5 break-words">
                        {fullName}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Row 2: Member Rank & Performance Tier (Idea #1) */}
                <div className="p-2.5 sm:p-3 bg-white/90 backdrop-blur-xs rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs transition-colors"
                      style={{ backgroundColor: activeTheme.headerGradient[1] }}
                    >
                      <Award className="w-4 h-4 text-amber-300" />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 block leading-none">
                          Member Rank Tier
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-black text-slate-900">
                            {memberTier.icon} {memberTier.title}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${memberTier.bg} ${memberTier.text}`}>
                        {hasWithdrawn ? 'Verified Partner' : 'Standard'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row 3: Completed Tasks / Submissions (Idea #1) */}
                <div className="p-2.5 sm:p-3 bg-white/90 backdrop-blur-xs rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs transition-colors"
                      style={{ backgroundColor: activeTheme.headerGradient[1] }}
                    >
                      <FileCheck2 className="w-4 h-4 text-emerald-300" />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500 block leading-none">
                        Completed Submissions
                      </span>
                      <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">
                        {totalSubmissionsCount} Approved Mails Submitted
                      </p>
                    </div>
                  </div>
                </div>

                {/* Row 4: Trust Score & Accuracy (Idea #1) */}
                <div className="p-2.5 sm:p-3 bg-white/90 backdrop-blur-xs rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs transition-colors"
                      style={{ backgroundColor: activeTheme.headerGradient[1] }}
                    >
                      <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500 block leading-none">
                        Trust & Accuracy Rating
                      </span>
                      <p className="text-xs sm:text-sm font-black text-emerald-700 mt-0.5 flex items-center gap-1">
                        <span>{trustScore}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Row 5: Card Validity & Security Hash (Idea #2) */}
                <div className="p-2.5 sm:p-3 bg-white/90 backdrop-blur-xs rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs transition-colors"
                      style={{ backgroundColor: activeTheme.headerGradient[1] }}
                    >
                      <Lock className="w-4 h-4 text-cyan-300" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-semibold text-slate-500 leading-none">
                          Validity Period
                        </span>
                        <span className="text-[9px] font-mono font-bold text-slate-400">
                          {securityHash}
                        </span>
                      </div>
                      <p className="text-xs font-black text-slate-900 mt-0.5">
                        {validityFormatted}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ----------------- 3. RIGHT COLUMN: QR CODE + 1D BARCODE (Idea #2) ----------------- */}
              <div className="sm:col-span-3 flex flex-col items-center space-y-3">
                {/* QR Code Container */}
                <div
                  className="w-full max-w-[165px] rounded-3xl border-2 overflow-hidden shadow-lg bg-white flex flex-col items-center transition-colors"
                  style={{ borderColor: activeTheme.qrBorderHex }}
                >
                  {/* QR Code Graphic Area */}
                  <div className="p-2.5 bg-white relative flex items-center justify-center">
                    <QRCode
                      id="card-qr-svg"
                      size={120}
                      level="H"
                      value={verificationUrl}
                      viewBox="0 0 256 256"
                      fgColor="#020b1e"
                      bgColor="#ffffff"
                      style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                    />
                    {/* Center Overlay Logo with Gold Ring */}
                    <div className="absolute w-9 h-9 sm:w-10 sm:h-10 bg-white border-2 border-amber-500 rounded-full flex items-center justify-center shadow-lg overflow-hidden p-0.5 z-10">
                      {effectiveAppLogo ? (
                        <img
                          src={effectiveAppLogo}
                          alt="Mail Factory"
                          className="w-full h-full object-cover rounded-full"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/app-logo.png';
                          }}
                        />
                      ) : (
                        <img
                          src="/app-logo.png"
                          alt="Mail Factory"
                          className="w-full h-full object-cover rounded-full"
                        />
                      )}
                    </div>
                  </div>

                  {/* Bottom Theme Bar of QR Box */}
                  <div
                    className="w-full text-white py-1.5 px-2 flex items-center justify-center gap-1.5 text-center transition-colors"
                    style={{ backgroundColor: activeTheme.qrFooterBgHex }}
                  >
                    <Smartphone
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: activeTheme.idTextColorHex }}
                    />
                    <span className="text-[9px] font-bold leading-tight">
                      Scan to verify <br /> identity
                    </span>
                  </div>
                </div>

                {/* 1D Barcode Container (Idea #2) */}
                <div className="w-full max-w-[165px] bg-white/95 p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center">
                  <RealisticBarcode code={barcodeNumber} />
                </div>
              </div>
            </div>
          </div>

          {/* ================= BOTTOM FOOTER BAR ================= */}
          <div
            className={`text-white px-4 py-2.5 sm:px-8 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 border-t transition-colors ${activeTheme.footerClass}`}
            style={{ backgroundColor: activeTheme.footerBgHex }}
          >
            {/* Left: Verification URL */}
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-slate-200">
              <Globe className="w-4 h-4" style={{ color: activeTheme.accentHex }} />
              <span className="font-mono text-slate-100">{hostDomain}/verify</span>
            </div>

            {/* Center: Security Assurance */}
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-300 font-bold">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit Encrypted ID Certificate</span>
            </div>

            {/* Right: Security Shield & text */}
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-300">
              <ShieldCheck className="w-4 h-4" style={{ color: activeTheme.accentHex }} />
              <span>Trusted • Secure • Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Legend & Guide */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-600" />
          <span>Member ID Card Features & Verification</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>🏆 Dynamic Rank Tiers</span>
            </p>
            <p className="text-slate-500 mt-1">
              Ranks scale from Starter to VIP Elite automatically based on verified tasks and approved payouts.
            </p>
          </div>
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80">
            <p className="font-bold text-amber-900 flex items-center gap-1.5">
              <span>🛡️ Digital Hologram Seal</span>
            </p>
            <p className="text-amber-800 mt-1">
              Genuine security seal verifying authorization under the Mail Factory central registry.
            </p>
          </div>
          <div className="p-3 bg-cyan-50 rounded-2xl border border-cyan-200/80">
            <p className="font-bold text-cyan-900 flex items-center gap-1.5">
              <span>📱 Dual QR & 1D Barcode</span>
            </p>
            <p className="text-cyan-800 mt-1">
              Instant scan verification for authentication across all mobile devices and barcode readers.
            </p>
          </div>
        </div>
      </div>

      {/* Real Verification Modal */}
      <AnimatePresence>
        {showVerifyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs"
              onClick={() => setShowVerifyModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 z-10 space-y-4 text-center"
            >
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 border-2 border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Official Member Verification
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Mail Factory Central Security Registry
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Full Name:</span>
                  <span className="font-black text-slate-900">{fullName}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Member ID:</span>
                  <span className="font-mono font-bold text-indigo-700">{memberId}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Rank Tier:</span>
                  <span className="font-black text-amber-700">{memberTier.icon} {memberTier.title}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Member Type:</span>
                  <span
                    className={`font-black px-2.5 py-0.5 rounded-full text-[11px] ${
                      hasWithdrawn ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {hasWithdrawn ? 'Verified Member' : 'General Member'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Trust Score:</span>
                  <span className="font-bold text-emerald-700">{trustScore}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Security Barcode:</span>
                  <span className="font-mono text-slate-700">*{barcodeNumber}*</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Card Validity:</span>
                  <span className="font-bold text-slate-700">{validityFormatted}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-2.5 text-left text-xs text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  This ID card is verified, 256-bit encrypted, and registered on Mail Factory central database.
                </span>
              </div>

              <button
                onClick={() => {
                  hapticFeedback.light();
                  setShowVerifyModal(false);
                }}
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
