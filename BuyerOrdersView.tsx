import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { BuyerOrder } from './types';
import { hapticFeedback } from './haptics';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Eye,
  EyeOff,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Search,
  KeyRound,
  FileText,
  Mail,
  XCircle,
  Sparkles,
  X,
  FileType,
  ShieldCheck,
  ChevronRight,
  Package,
  Calendar,
  CreditCard,
  ArrowRight,
} from 'lucide-react';

const OrderWarrantyTracker: React.FC<{
  order: BuyerOrder;
  isBn: boolean;
  setChatDrawerOpen: (open: boolean) => void;
  setActiveTab: (tab: any) => void;
}> = ({ order, isBn, setChatDrawerOpen, setActiveTab }) => {
  const parseOrderDate = (createdAt: any): Date => {
    if (!createdAt) return new Date();
    if (typeof createdAt.toDate === 'function') {
      return createdAt.toDate();
    }
    if (typeof createdAt === 'object' && createdAt.seconds !== undefined) {
      return new Date(createdAt.seconds * 1000);
    }
    const d = new Date(createdAt);
    if (isNaN(d.getTime())) return new Date();
    return d;
  };

  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ hours: 6, minutes: 0, seconds: 0, isExpired: false });

  useState(() => {
    // Initial sync
    const orderTime = parseOrderDate(order.createdAt).getTime();
    const expiryTime = orderTime + 6 * 60 * 60 * 1000;
    const diff = expiryTime - Date.now();
    if (diff <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }
  });

  useEffect(() => {
    const calculateTime = () => {
      const orderTime = parseOrderDate(order.createdAt).getTime();
      const expiryTime = orderTime + 6 * 60 * 60 * 1000;
      const diff = expiryTime - Date.now();

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const padZero = (num: number) => String(num).padStart(2, '0');

  if (!timeLeft.isExpired) {
    return (
      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-5 space-y-4 shadow-2xs">
        {/* Header section with badge */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-emerald-600">
            <span className="text-xl">🛡️</span>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider">{isBn ? '৬ ঘণ্টা লাইভ ওয়ারেন্টি' : '6h Live Warranty'}</h4>
              <p className="text-[9px] text-emerald-500 font-bold">{isBn ? 'লাইভ সাপোর্ট ও রিপ্লেসমেন্ট কাভারেজ' : 'Live Support & Replacement Cover'}</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider animate-pulse">
            {isBn ? 'ওয়ারেন্টি একটিভ' : 'Warranty Active'}
          </span>
        </div>

        {/* Countdown */}
        <div className="bg-white p-3.5 rounded-2xl border border-emerald-500/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-base">⏱️</span>
            <span className="text-xs font-bold text-slate-500">{isBn ? 'ওয়ারেন্টি সময় বাকি:' : 'Warranty Remaining:'}</span>
          </div>
          <span className="text-xs font-black text-emerald-600 font-mono tracking-wider bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/10">
            {padZero(timeLeft.hours)}h {padZero(timeLeft.minutes)}m {padZero(timeLeft.seconds)}s
          </span>
        </div>

        {/* Checklist */}
        <div className="space-y-2 pt-1 border-t border-dashed border-emerald-500/10">
          <div className="flex items-start gap-2 text-xs font-medium text-emerald-800">
            <span className="text-emerald-500 text-sm leading-none">✅</span>
            <span>{isBn ? 'সাপোর্ট যোগাযোগ ও ইনস্ট্যান্ট চ্যাট' : 'Contact Support & Live Instant Chat'}</span>
          </div>
          <div className="flex items-start gap-2 text-xs font-medium text-emerald-800">
            <span className="text-emerald-500 text-sm leading-none">✅</span>
            <span>{isBn ? 'ইস্যু রিপোর্টিং ও লাইভ ওয়ারেন্টি ক্লেইম' : 'Report Issue & Claim Warranty'}</span>
          </div>
          <div className="flex items-start gap-2 text-xs font-medium text-emerald-800">
            <span className="text-emerald-500 text-sm leading-none">✅</span>
            <span>{isBn ? 'প্রয়োজনে ফুল রিপ্লেসমেন্ট অথবা রিফান্ড রিসলিউশন' : 'Full Replacement or Refund Resolution if Needed'}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => {
              hapticFeedback.medium();
              setChatDrawerOpen(true);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] transition-all cursor-pointer shadow-md shadow-emerald-600/10 uppercase tracking-wider"
          >
            <span>🎧 {isBn ? 'সাপোর্ট যোগাযোগ' : 'Contact Support'}</span>
          </button>
          <button
            onClick={() => {
              hapticFeedback.light();
              setActiveTab('buyer_policies');
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] border border-emerald-200/60 transition-all cursor-pointer uppercase tracking-wider"
          >
            <span>📄 {isBn ? 'পলিসি দেখুন' : 'View Policy'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-rose-500/[0.02] border border-rose-500/10 rounded-3xl p-5 space-y-4">
      {/* Header section with badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-rose-600">
          <span className="text-xl">⚠️</span>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider">{isBn ? 'ওয়ারেন্টির মেয়াদ শেষ' : 'Warranty Expired'}</h4>
            <p className="text-[9px] text-rose-400 font-bold">{isBn ? 'এই অর্ডারের ওয়ারেন্টি কভারেজ নেই' : 'This order is no longer covered'}</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] font-black uppercase tracking-wider">
          {isBn ? 'মেয়াদোত্তীর্ণ' : 'Expired'}
        </span>
      </div>

      {/* Checklist */}
      <div className="space-y-2 pt-1 border-t border-dashed border-rose-500/10">
        <div className="flex items-start gap-2 text-xs font-medium text-slate-500">
          <span className="text-rose-500 text-sm leading-none">❌</span>
          <span className="line-through text-slate-400">{isBn ? 'অর্ডারের লাইভ সাপোর্ট বন্ধ' : 'Contact Support for this order disabled'}</span>
        </div>
        <div className="flex items-start gap-2 text-xs font-medium text-slate-500">
          <span className="text-rose-500 text-sm leading-none">❌</span>
          <span className="line-through text-slate-400">{isBn ? 'নতুন ওয়ারেন্টি ক্লেইম গ্রহণযোগ্য নয়' : 'New Warranty Claim will not be accepted'}</span>
        </div>
        <div className="flex items-start gap-2 text-xs font-medium text-slate-500">
          <span className="text-rose-500 text-sm leading-none">❌</span>
          <span className="line-through text-slate-400">{isBn ? 'রিপ্লেসমেন্ট অথবা রিফান্ড ক্লেইম বন্ধ' : 'Replacement/Refund Request is disabled'}</span>
        </div>
      </div>

      {/* Summary Policy text */}
      <p className="text-[10px] leading-relaxed text-slate-400 font-medium bg-rose-500/[0.02] p-3 rounded-2xl border border-rose-500/5">
        {isBn 
          ? 'সহায়তা শুধুমাত্র ৬ ঘণ্টার ওয়ারেন্টি চলাকালীন সময়ে পাওয়া যাবে। মেয়াদ শেষ হওয়ার পর এই অর্ডারের জন্য কোনো ওয়ারেন্টি ক্লেইম বা সাপোর্ট রিকুয়েস্ট গ্রহণ করা হবে না।' 
          : 'Support is available only during the active 6-hour warranty period. Once the warranty expires, warranty claims and support requests for this order will no longer be accepted.'}
      </p>

      {/* Support Unavailable Alert Style */}
      <div className="text-center py-2.5 bg-rose-500/[0.04] text-rose-500/60 font-black text-[10px] rounded-xl border border-rose-500/10 uppercase tracking-wider cursor-not-allowed">
        {isBn ? '🚫 সাপোর্ট নিষ্ক্রিয়' : '🚫 Support Unavailable'}
      </div>
    </div>
  );
};

export const BuyerOrdersView: React.FC = () => {
  const { language, buyerOrders, copyText, setActiveTab, user, setAuthModalOpen, setChatDrawerOpen } = useApp();
  const isBn = language === 'bn';

  const parseOrderDate = (createdAt: any): Date => {
    if (!createdAt) return new Date();
    if (typeof createdAt.toDate === 'function') {
      return createdAt.toDate();
    }
    if (typeof createdAt === 'object' && createdAt.seconds !== undefined) {
      return new Date(createdAt.seconds * 1000);
    }
    const d = new Date(createdAt);
    if (isNaN(d.getTime())) return new Date();
    return d;
  };

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'delivered' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewingOrder, setViewingOrder] = useState<BuyerOrder | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCredential = (text: string, msg: string, fieldId: string) => {
    copyText(text, msg);
    setCopiedId(fieldId);
    setTimeout(() => {
      setCopiedId((prev) => (prev === fieldId ? null : prev));
    }, 2000);
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4 animate-in fade-in">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">
          {isBn ? 'আমার অর্ডারসমূহ দেখতে লগইন করুন' : 'Login to View My Orders'}
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          {isBn
            ? 'আপনার ক্রয়কৃত জিমেইল অ্যাকাউন্টগুলোর আইডি, পাসওয়ার্ড ও ডেলিভারি তথ্য পেতে অনুগ্রহ করে আপনার অ্যাকাউন্টে সাইন ইন করুন।'
            : 'Please login to your account to view your purchased Gmail credentials and track active order statuses.'}
        </p>
        <button
          onClick={() => setAuthModalOpen(true, 'login')}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md transition-all cursor-pointer active:scale-95"
        >
          {isBn ? 'লগইন করুন' : 'Login Now'}
        </button>
      </div>
    );
  }

  const filteredOrders = (buyerOrders || [])
    .filter((o) => o.userId === user.uid)
    .filter((order) => {
    if (activeFilter === 'pending' && order.status !== 'pending' && order.status !== 'processing') return false;
    if (activeFilter === 'delivered' && order.status !== 'delivered') return false;
    if (activeFilter === 'cancelled' && order.status !== 'cancelled' && order.status !== 'failed' && order.status !== 'refunded') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = (order.id || order.key || '').toLowerCase().includes(q);
      const matchTitle = (order.productTitle || '').toLowerCase().includes(q);
      return matchId || matchTitle;
    }
    return true;
  });

  const currentViewingOrder = viewingOrder
    ? (buyerOrders || []).find((o) => o.id === viewingOrder.id || o.key === viewingOrder.key) || viewingOrder
    : null;

  const getCredentials = (order: BuyerOrder) => {
    // Check all possible fields where gmails might be stored
    let raw: any = order.deliveredAccounts;
    if (Array.isArray(raw) && raw.length === 0) raw = undefined;
    if (!raw) raw = order.downloadText;
    if (!raw) raw = order.delivered_gmails;
    if (Array.isArray(raw) && raw.length === 0) raw = undefined;
    if (!raw) raw = order.deliveryData;
    if (Array.isArray(raw) && raw.length === 0) raw = undefined;
    if (!raw) raw = (order as any).gmails || (order as any).credentials || (order as any).data;

    if (!raw) return [];

    let list: Array<{ email: string; password: string; recoveryEmail?: string }> = [];

    const extractFromObj = (item: any) => {
      if (!item || typeof item !== 'object') return null;
      const keys = Object.keys(item);
      const getVal = (possible: string[]) => {
        for (const p of possible) {
          const k = keys.find(key => key.toLowerCase() === p.toLowerCase());
          if (k && item[k]) return String(item[k]).trim();
        }
        return '';
      };
      
      const email = getVal(['email', 'gmail', 'user', 'username', 'account', 'id']);
      const password = getVal(['password', 'pass', 'pwd']);
      const recoveryEmail = getVal(['recovery', 'recoveryemail', 'recovery_email', 'rec', 'recover']);
      return { email, password, recoveryEmail: recoveryEmail || undefined };
    };

    if (Array.isArray(raw)) {
      list = raw.map((item) => {
        if (typeof item === 'string') {
          const parts = item.split(/[:\t,\|\s]+/).filter(Boolean);
          return {
            email: parts[0]?.trim() || '',
            password: parts[1]?.trim() || '',
            recoveryEmail: parts[2]?.trim() || undefined,
          };
        }
        return extractFromObj(item) || { email: '', password: '' };
      });
    } else if (typeof raw === 'string') {
      const strRaw: string = raw;
      try {
        const parsed = JSON.parse(strRaw);
        if (Array.isArray(parsed)) {
          list = parsed.map((item) => {
            if (typeof item === 'string') {
              const parts = item.split(/[:\t,\|\s]+/).filter(Boolean);
              return {
                email: parts[0]?.trim() || '',
                password: parts[1]?.trim() || '',
                recoveryEmail: parts[2]?.trim() || undefined,
              };
            }
            return extractFromObj(item) || { email: '', password: '' };
          });
        }
      } catch (e) {
        list = strRaw
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const parts = line.split(/[:\t,\|\s]+/).filter(Boolean);
            if(parts.length >= 2) {
              return {
                email: parts[0]?.trim() || '',
                password: parts[1]?.trim() || '',
                recoveryEmail: parts[2]?.trim() || undefined,
              };
            }
            return { email: line, password: '', recoveryEmail: undefined };
          });
      }
    }

    return list.filter((item) => item.email || item.password);
  };

  const handleCopyCredentials = (order: BuyerOrder) => {
    hapticFeedback.light();
    const creds = getCredentials(order);
    if (creds.length === 0) return;
    const textToCopy = creds
      .map((item) => `${item.email}:${item.password}${item.recoveryEmail ? `:${item.recoveryEmail}` : ''}`)
      .join('\n');
    copyText(textToCopy, isBn ? 'সকল জিমেইল ডাটা কপি করা হয়েছে!' : 'All Gmail credentials copied to clipboard!');
    const orderKey = order.id || order.key || 'order';
    setCopiedId(orderKey);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadTxt = (order: BuyerOrder) => {
    hapticFeedback.medium();
    const creds = getCredentials(order);
    if (creds.length === 0) return;
    const content = creds
      .map(
        (item, idx) =>
          `[Account #${idx + 1}]\nGmail: ${item.email}\nPassword: ${item.password}${
            item.recoveryEmail ? `\nRecovery: ${item.recoveryEmail}` : ''
          }\nCombo: ${item.email}:${item.password}${item.recoveryEmail ? `:${item.recoveryEmail}` : ''}\n----------------------------------`
      )
      .join('\n\n');

    const orderKey = order.id || order.key || 'order';
    const displayId = (orderKey || 'ORDER').slice(-6).toUpperCase();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Gmail_Order_${displayId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = (order: BuyerOrder) => {
    hapticFeedback.medium();
    const creds = getCredentials(order);
    if (creds.length === 0) return;

    try {
      const doc = new jsPDF();
      const orderKey = order.id || order.key || 'order';
      const displayId = (orderKey || 'ORDER').slice(-8).toUpperCase();

      // Page dimensions
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;

      // 1. Top Header Banner (Deep Professional Navy)
      doc.setFillColor(27, 25, 56); 
      doc.rect(0, 0, pageWidth, 36, 'F');

      // Top Accent line (Violet gradient style)
      doc.setFillColor(124, 58, 237);
      doc.rect(0, 36, pageWidth, 1.5, 'F');

      // Header text with high contrast
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text('MAIL FACTORY - GMAIL CREDENTIALS INVOICE', 14, 16);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(191, 196, 210);
      doc.text(`Official Delivery Document  |  Order ID: #${displayId}`, 14, 25);

      // 2. Order Info Box (Slate styling)
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.setLineWidth(0.5);
      doc.roundedRect(14, 44, 182, 34, 3, 3, 'FD');

      // Labels - Column 1
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('PACKAGE NAME', 20, 52);
      doc.text('ORDER KEY', 20, 60);
      doc.text('DELIVERY DATE', 20, 68);

      // Values - Column 1
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(String(order.productTitle || 'Gmail Accounts'), 50, 52);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`#${displayId}`, 50, 60);
      
      const dateStr = parseOrderDate(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      doc.text(dateStr, 50, 68);

      // Labels - Column 2
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text('QUANTITY', 125, 52);
      doc.text('TOTAL AMOUNT', 125, 60);

      // Values - Column 2
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(`${order.quantity || 1} Pcs`, 155, 52);
      doc.text(`BDT ${(order.amount || 0).toFixed(2)}`, 155, 60);

      // Verification Badge inside the box
      doc.setFillColor(16, 185, 129);
      doc.roundedRect(125, 65, 60, 7, 1.5, 1.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('DELIVERED & VERIFIED', 133, 70);

      // 3. Security Notice Box (Beautiful Warning Box style)
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(254, 205, 211);
      doc.roundedRect(14, 84, 182, 11, 2, 2, 'FD');

      doc.setTextColor(220, 38, 38);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('SECURITY NOTICE:', 20, 91);
      
      doc.setTextColor(127, 29, 29);
      doc.setFont('helvetica', 'normal');
      doc.text('For your security, please change your password immediately after logging in.', 50, 91);

      // 4. Accounts List Header
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text(`Delivered Credentials Info`, 14, 104);

      // Divider line
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 106, 196, 106);

      let y = 111;

      creds.forEach((item, index) => {
        // Card has height 25
        if (y > pageHeight - 38) {
          doc.addPage();
          y = 20;
        }

        // Card Container
        doc.setFillColor(250, 251, 253);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(14, y, 182, 25, 2, 2, 'FD');

        // Sleek left indigo highlight
        doc.setFillColor(79, 70, 229);
        doc.rect(14, y, 1.5, 25, 'F');

        // Beautiful Circle/Badge index on left
        doc.setFillColor(238, 242, 255);
        doc.setDrawColor(199, 210, 254);
        doc.roundedRect(18, y + 5, 9, 15, 1.5, 1.5, 'FD');
        doc.setTextColor(67, 56, 202);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(`${index + 1}`, 21, y + 14);

        // Details column
        doc.setFontSize(8.5);
        
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text('Gmail Address:', 31, y + 7);
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.text(item.email, 56, y + 7);

        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text('Password:', 31, y + 14);
        doc.setTextColor(5, 150, 105); // Elegant green password
        doc.setFont('helvetica', 'bold');
        doc.text(item.password, 56, y + 14);

        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text('Recovery Email:', 31, y + 21);
        doc.setTextColor(2, 132, 199); // Sky blue
        doc.setFont('helvetica', 'bold');
        doc.text(item.recoveryEmail || 'N/A', 56, y + 21);

        // Monospace Combo Copy Box on the right
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(132, y + 4, 60, 17, 1, 1, 'F');
        
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text('COPY/COMBO FORMAT', 136, y + 9);

        doc.setTextColor(51, 65, 85);
        doc.setFont('courier', 'bold');
        doc.setFontSize(8);
        const combo = `${item.email}:${item.password}${item.recoveryEmail ? `:${item.recoveryEmail}` : ''}`;
        if (combo.length > 32) {
          doc.text(`${combo.substring(0, 30)}...`, 136, y + 14);
        } else {
          doc.text(combo, 136, y + 14);
        }

        y += 29;
      });

      // 5. Promotional & Website Link Box (Absolutely zero broken emoji icons)
      if (y > pageHeight - 48) {
        doc.addPage();
        y = 20;
      }

      const websiteUrl = window.location.origin;

      doc.setFillColor(245, 243, 255); // soft violet-50
      doc.setDrawColor(216, 180, 254); // purple-300
      doc.roundedRect(14, y + 4, 182, 28, 2.5, 2.5, 'FD');

      // Title - Clean and elegant with no emoji
      doc.setTextColor(109, 40, 217); // violet-700
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.text('BUY PREMIUM ACCOUNTS ONLINE', 20, y + 11);

      // Body text with dynamic auto-wrapping to prevent line overflow and look highly professional
      doc.setTextColor(71, 85, 105); // slate-600
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const promoLines = doc.splitTextToSize('Thank you for choosing Mail Factory! You can purchase more premium quality accounts anytime directly from our official website.', 170);
      doc.text(promoLines, 20, y + 16);

      const promoLinesHeight = promoLines.length * 4.5; // each line is ~4.5mm in height
      const linkY = y + 14 + promoLinesHeight;

      // Website Link
      doc.setTextColor(79, 70, 229); // indigo-600
      doc.setFont('helvetica', 'bold');
      doc.text('Website Link:', 20, linkY);
      
      doc.setTextColor(15, 23, 42); // dark slate
      doc.textWithLink(websiteUrl, 44, linkY, { url: websiteUrl });
      doc.setTextColor(79, 70, 229); // underlined helper
      doc.text(' (Click to Visit Website)', 44 + doc.getTextWidth(websiteUrl) + 2, linkY);

      // Footer
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`MailFactory Official Order Document - Page ${i} of ${totalPages}`, 14, pageHeight - 8);
        doc.text(`6-12h Live Replacement Warranty Included`, 130, pageHeight - 8);
      }

      // Save PDF via a robust Blob and temporary link to bypass mobile browser iframe download blocks
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Gmail_Order_${displayId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('PDF export error:', e);
      handleDownloadTxt(order);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-8 min-h-screen">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-600/20"
      >
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl -ml-24 -mb-24 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center shadow-inner border border-white/30">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {isBn ? 'আমার অর্ডারসমূহ' : 'My Orders'}
              </h1>
              <p className="text-sm text-indigo-100/80 font-medium mt-1">
                {isBn
                  ? 'আপনার সকল ক্রয়কৃত ডিজিটাল সম্পদের ইতিহাস'
                  : 'Your complete digital asset purchase history'}
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('buyer_market')}
            className="px-6 py-3 rounded-2xl bg-white text-indigo-600 font-black text-sm shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isBn ? 'নতুন অর্ডার করুন' : 'New Purchase'}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-slate-100/80 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200/60 overflow-x-auto scrollbar-none shadow-sm">
          {(['all', 'pending', 'delivered', 'cancelled'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => {
                hapticFeedback.light();
                setActiveFilter(filter);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black capitalize transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeFilter === filter
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {filter === 'all' && <Package className="w-3.5 h-3.5" />}
              {filter === 'pending' && <Clock className="w-3.5 h-3.5" />}
              {filter === 'delivered' && <CheckCircle2 className="w-3.5 h-3.5" />}
              {filter === 'cancelled' && <XCircle className="w-3.5 h-3.5" />}
              
              {filter === 'all' && (isBn ? 'সব' : 'All')}
              {filter === 'pending' && (isBn ? 'পেন্ডিং' : 'Pending')}
              {filter === 'delivered' && (isBn ? 'ডেলিভার্ড' : 'Delivered')}
              {filter === 'cancelled' && (isBn ? 'বাতিলকৃত' : 'Cancelled')}
            </button>
          ))}
        </div>

        <div className="relative group flex-1 max-w-md lg:max-w-xs">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'অর্ডার আইডি বা প্যাকেজ খুঁজুন...' : 'Search ID or package...'}
            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Orders Grid/List */}
      <AnimatePresence mode="popLayout">
        {filteredOrders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-100 shadow-sm space-y-6"
          >
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">
                {isBn ? 'কোনো অর্ডার নেই' : 'No Orders Yet'}
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                {isBn
                  ? 'আপনার তালিকায় কোনো অর্ডার পাওয়া যায়নি। জিমেইল কিনতে মার্কেটপ্লেস ঘুরে দেখুন।'
                  : "You haven't placed any orders yet. Visit our marketplace to browse high-quality verified accounts."}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('buyer_market')}
              className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-xl shadow-indigo-600/20 transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isBn ? 'মার্কেটপ্লেস দেখুন' : 'Browse Marketplace'}</span>
            </button>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 gap-6"
          >
            {filteredOrders.map((order, orderIdx) => {
              const creds = getCredentials(order);
              const hasDeliveryData = creds.length > 0;
              const isPending = order.status === 'pending' || order.status === 'processing';
              const isDelivered = order.status === 'delivered';
              const isCancelled = order.status === 'cancelled' || order.status === 'failed' || order.status === 'refunded';
              const orderKey = order.id || order.key || `order-${orderIdx}`;
              const displayId = (order.id || order.key || 'ORDER').slice(-8).toUpperCase();

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: orderIdx * 0.05 }}
                  key={orderKey}
                  className={`group relative bg-white rounded-[2rem] p-6 border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                    isPending
                      ? 'border-amber-100 hover:border-amber-200 shadow-amber-500/5'
                      : isDelivered
                      ? 'border-emerald-100 hover:border-emerald-200 shadow-emerald-500/5'
                      : 'border-slate-100 hover:border-slate-200 shadow-slate-500/5'
                  }`}
                >
                  {/* Status Indicator Bar */}
                  <div className={`absolute top-0 left-0 w-full h-1.5 rounded-t-[2rem] ${
                    isPending ? 'bg-amber-400' : isDelivered ? 'bg-emerald-500' : 'bg-slate-300'
                  }`} />

                  <div className="flex flex-col gap-6">
                    {/* Top Meta Info */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isPending ? 'bg-amber-100 text-amber-600' : 
                          isDelivered ? 'bg-emerald-100 text-emerald-600' : 
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {isPending ? <Clock className="w-5 h-5 animate-pulse" /> : 
                           isDelivered ? <CheckCircle2 className="w-5 h-5" /> : 
                           <XCircle className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{isBn ? 'অর্ডার আইডি' : 'Order ID'}</span>
                            <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md font-mono">#{displayId}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mt-1">
                            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                            <span>
                              {parseOrderDate(order.createdAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isDelivered && (
                          <div className="flex flex-col items-end">
                            <span className="px-4 py-1.5 rounded-full bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-emerald-500/20 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {isBn ? 'এপ্রুভড (ডেলিভার্ড)' : 'Approved & Delivered'}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 mt-1">{isBn ? 'অ্যাডমিন কর্তৃক এপ্রুভকৃত' : 'Admin Approved'}</span>
                          </div>
                        )}
                        {isPending && (
                          <div className="flex flex-col items-end">
                            <span className="px-4 py-1.5 rounded-full bg-amber-500 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-amber-500/20 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 animate-spin" />
                              {isBn ? 'পেন্ডিং (পর্যালোচনা)' : 'Pending Review'}
                            </span>
                            <span className="text-[10px] font-bold text-amber-600 mt-1">{isBn ? 'অ্যাডমিন চেকিং চলছে' : 'Awaiting Admin Check'}</span>
                          </div>
                        )}
                        {isCancelled && (
                          <div className="flex flex-col items-end">
                            <span className="px-4 py-1.5 rounded-full bg-rose-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-rose-600/20 flex items-center gap-1.5">
                              <XCircle className="w-3.5 h-3.5" />
                              {isBn ? 'রিজেক্ট (বাতিল)' : 'Rejected / Cancelled'}
                            </span>
                            <span className="text-[10px] font-bold text-rose-600 mt-1">{isBn ? 'ব্যালেন্স রিফান্ড হয়েছে' : 'Balance Refunded'}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {isBn ? 'অর্ডারকৃত পণ্য' : 'Ordered Item'}
                          </span>
                          <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {order.productTitle}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 pt-1">
                            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                              <Package className="w-4 h-4 text-indigo-500" />
                              <span className="text-xs font-bold text-slate-700">{order.quantity || 1} {isBn ? 'টি একাউন্ট' : 'Accounts'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                              <CreditCard className="w-4 h-4 text-emerald-600" />
                              <span className="text-xs font-black text-indigo-600 font-mono">৳{(order.amount || 0).toFixed(2)} BDT</span>
                            </div>
                          </div>
                        </div>

                        {isDelivered && (
                          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-lg">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {isBn ? '৬-১২ ঘণ্টা লাইভ ওয়ারেন্টি প্রযোজ্য' : '6-12h Live Warranty Active'}
                          </div>
                        )}
                      </div>

                      {/* Action Area */}
                      <div className="flex flex-wrap items-center justify-end gap-3">
                        {isDelivered && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                hapticFeedback.light();
                                setViewingOrder(order);
                              }}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white font-black text-xs shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                              <span>{isBn ? 'জিমেইল দেখুন' : 'View Gmail'}</span>
                            </motion.button>

                            {hasDeliveryData && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleDownloadPdf(order)}
                                  className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 transition-all cursor-pointer group/btn"
                                  title={isBn ? 'PDF ডাউনলোড' : 'Download PDF'}
                                >
                                  <FileType className="w-4.5 h-4.5" />
                                </button>
                                <button
                                  onClick={() => handleCopyCredentials(order)}
                                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                                    copiedId === orderKey
                                      ? 'bg-emerald-500 text-white border-emerald-500'
                                      : 'bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border-slate-200'
                                  }`}
                                  title={isBn ? 'সব কপি করুন' : 'Copy All'}
                                >
                                  {copiedId === orderKey ? <CheckCircle2 className="w-4.5 h-4.5" /> : <Copy className="w-4.5 h-4.5" />}
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {isDelivered && (
                      <OrderWarrantyTracker
                        order={order}
                        isBn={isBn}
                        setChatDrawerOpen={setChatDrawerOpen}
                        setActiveTab={setActiveTab}
                      />
                    )}

                    {/* Footer/Guidance Area */}
                    {(isPending || (isCancelled && order.adminNote)) && (
                      <div className={`p-4 rounded-[1.5rem] border ${
                        isPending ? 'bg-amber-50/50 border-amber-200/50 text-amber-900' : 
                        'bg-rose-50/50 border-rose-200/50 text-rose-900'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 p-1.5 rounded-lg ${isPending ? 'bg-amber-100' : 'bg-rose-100'}`}>
                            {isPending ? <Clock className="w-3.5 h-3.5 text-amber-600" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-[11px] font-black uppercase tracking-wider mb-1">
                              {isPending ? (isBn ? 'প্রসেসিং স্ট্যাটাস' : 'Processing Status') : (isBn ? 'বাতিলের কারণ' : 'Cancellation Reason')}
                            </h4>
                            <p className="text-xs font-medium leading-relaxed opacity-80">
                              {isPending ? (
                                isBn
                                  ? `আপনার অর্ডারটি অ্যাডমিন পর্যালোচনায় রয়েছে। টাকা বর্তমানে আপনার 'লকড ব্যালেন্স'-এ সংরক্ষিত আছে। অ্যাডমিন এপ্রুভ করলে এটি কেটে নেয়া হবে, আর রিজেক্ট করলে সাথে সাথে ডিপোজিট ব্যালেন্সে রিফান্ড হবে।`
                                  : `Your order is under admin review. Funds are currently secured in your 'Locked Balance'. They will be finalized upon approval or instantly refunded to your Deposit Balance if rejected.`
                              ) : order.adminNote || (isBn ? 'কোনো কারণ উল্লেখ করা হয়নি।' : 'No reason provided.')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* Gmail View Dedicated Modal Popup Dialog   */}
      {/* ========================================== */}
      <AnimatePresence>
        {currentViewingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingOrder(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-2xl text-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden my-auto"
            >
              {/* Modal Top Header */}
              <div className="p-6 sm:p-8 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl flex items-center justify-center shrink-0">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <div className="truncate">
                    <h2 className="text-xl font-black text-white truncate flex items-center gap-2">
                      {isBn ? 'জিমেইল দেখুন' : 'View Gmail'}
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                        Delivered
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" />
                      ID: #{(currentViewingOrder.id || currentViewingOrder.key || '').slice(-8).toUpperCase()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setViewingOrder(null)}
                  className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content Scroll Area */}
              <div className="max-h-[60vh] overflow-y-auto p-6 sm:p-8 space-y-6">
                {/* Stats Summary Card */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Accounts</span>
                    <span className="text-lg font-black text-indigo-400 font-mono">{currentViewingOrder.quantity || 1}</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Status</span>
                    <span className="text-sm font-black text-emerald-400">Ready</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Delivery</span>
                    <span className="text-sm font-black text-white">Instant</span>
                  </div>
                </div>

                {/* Live Warranty Tracker */}
                <OrderWarrantyTracker
                  order={currentViewingOrder}
                  isBn={isBn}
                  setChatDrawerOpen={setChatDrawerOpen}
                  setActiveTab={setActiveTab}
                />

                {/* Security Notice */}
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-black text-rose-400 mb-1">
                      {isBn ? 'আপনার নিরাপত্তার জন্য' : 'Security Notice'}
                    </h4>
                    <p className="text-xs text-rose-300/80 font-medium">
                      {isBn ? '🔐 আপনার নিরাপত্তার জন্য, লগইন করার পর অনুগ্রহ করে আপনার পাসওয়ার্ডটি দ্রুত পরিবর্তন করুন।' : '🔐 For your security, please change your password immediately after logging in.'}
                    </p>
                  </div>
                </div>

                {/* List of Accounts */}
                <div className="space-y-4">
                  {getCredentials(currentViewingOrder).length === 0 ? (
                    <div className="py-12 text-center bg-slate-950 rounded-3xl border border-slate-800">
                      <Mail className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-500 text-sm font-bold">
                        {isBn ? 'কোন ক্রেডেনশিয়াল পাওয়া যায়নি।' : 'No credentials found.'}
                      </p>
                    </div>
                  ) : (
                    getCredentials(currentViewingOrder).map((item, idx) => {
                      const combo = `${item.email}:${item.password}${item.recoveryEmail ? `:${item.recoveryEmail}` : ''}`;
                      return (
                        <div key={idx} className="group/item bg-slate-950 rounded-3xl border border-slate-800 p-5 space-y-4 hover:border-indigo-500/50 transition-all">
                          <div className="flex items-center justify-between">
                            <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                              Account #{idx + 1}
                            </span>
                            <button
                              onClick={() => handleCopyCredential(combo, isBn ? 'কম্বো কপি হয়েছে' : 'Combo copied', `combo-${idx}`)}
                              className="text-[10px] font-black text-slate-500 hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
                            >
                              {copiedId === `combo-${idx}` ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedId === `combo-${idx}` ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'লাইন কপি' : 'Copy Line')}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Email</label>
                              <div className="flex items-center justify-between gap-2 bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800 group-hover/item:border-slate-700 transition-colors">
                                <span className="text-xs font-mono font-bold text-amber-300 truncate select-all">{item.email}</span>
                                <button onClick={() => handleCopyCredential(item.email, isBn ? 'ইমেইল কপি হয়েছে' : 'Email copied', `email-${idx}`)} className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1.5 shrink-0">
                                  {copiedId === `email-${idx}` ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">{copiedId === `email-${idx}` ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}</span>
                                </button>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Password</label>
                              <div className="flex items-center justify-between gap-2 bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800 group-hover/item:border-slate-700 transition-colors">
                                <span className="text-xs font-mono font-bold text-emerald-400 truncate select-all">{item.password}</span>
                                <button onClick={() => handleCopyCredential(item.password, isBn ? 'পাসওয়ার্ড কপি হয়েছে' : 'Password copied', `pass-${idx}`)} className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1.5 shrink-0">
                                  {copiedId === `pass-${idx}` ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">{copiedId === `pass-${idx}` ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {item.recoveryEmail && (
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Recovery Email</label>
                              <div className="flex items-center justify-between gap-2 bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800 group-hover/item:border-slate-700 transition-colors">
                                <span className="text-xs font-mono font-bold text-sky-300 truncate select-all">{item.recoveryEmail}</span>
                                <button onClick={() => handleCopyCredential(item.recoveryEmail, isBn ? 'রিকভারি কপি হয়েছে' : 'Recovery copied', `rec-${idx}`)} className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1.5 shrink-0">
                                  {copiedId === `rec-${idx}` ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">{copiedId === `rec-${idx}` ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Modal Actions Bar */}
              <div className="p-6 sm:p-8 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-end gap-3">
                <button
                  onClick={() => handleDownloadPdf(currentViewingOrder!)}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-600/10 text-rose-500 border border-rose-600/20 hover:bg-rose-600 hover:text-white font-black text-xs transition-all cursor-pointer"
                >
                  <FileType className="w-4 h-4" />
                  <span>PDF Invoice</span>
                </button>
                <button
                  onClick={() => handleCopyCredentials(currentViewingOrder)}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black text-xs shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>{isBn ? 'সব কপি করুন' : 'Copy All Accounts'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

