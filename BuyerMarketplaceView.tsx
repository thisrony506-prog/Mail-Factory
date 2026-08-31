import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from './AppContext';
import { translations } from './i18n';
import { BuyerProduct } from './types';
import { hapticFeedback } from './haptics';
import { useUserBalance } from './useUserBalance';
import { PriceAlertModal } from './PriceAlertModal';
import {
  ShoppingBag,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  Star,
  Layers,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Plus,
  Minus,
  X,
  CreditCard,
  Wallet,
  FileText,
  Lock,
  ChevronRight,
  Info,
  Search,
  HelpCircle,
  TrendingUp,
  ArrowUpDown,
  Flame,
  BadgeCheck,
  Copy,
  Check,
  ExternalLink,
  Activity,
  Award,
  Shield,
  Percent,
  RefreshCw,
  SlidersHorizontal,
  Bell,
  BellRing,
} from 'lucide-react';

interface BuyerMarketplaceViewProps {
  onOpenDeposit?: () => void;
  onOpenOrders?: () => void;
  onOpenWallet?: () => void;
}

export const BuyerMarketplaceView: React.FC<BuyerMarketplaceViewProps> = ({
  onOpenDeposit,
  onOpenOrders,
  onOpenWallet,
}) => {
  const {
    language,
    user,
    profile,
    buyerProducts,
    buyerOrders,
    createBuyerOrder,
    setActiveTab,
    setAuthModalOpen,
    copyText,
    isPriceAlertModalOpen,
    setPriceAlertModalOpen,
    priceAlerts,
  } = useApp();

  const [priceAlertCategory, setPriceAlertCategory] = useState<'fresh' | 'aged' | 'all'>('all');

  const t = translations[language];
  const isBn = language === 'bn';

  // Filters & Sorters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'rating' | 'stock'>('popular');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);

  // Modals & Active Selections
  const [activeProduct, setActiveProduct] = useState<BuyerProduct | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<BuyerProduct | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [insufficientModalOpen, setInsufficientModalOpen] = useState<boolean>(false);
  const [shortfallAmount, setShortfallAmount] = useState<number>(0);
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);
  const [faqOpenIdx, setFaqOpenIdx] = useState<number | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<boolean>(false);

  // Auto-dismiss modals if selected product was deleted in admin/RTDB
  useEffect(() => {
    if (activeProduct && !buyerProducts.some((p) => p.id === activeProduct.id)) {
      setActiveProduct(null);
    }
    if (checkoutProduct && !buyerProducts.some((p) => p.id === checkoutProduct.id)) {
      setCheckoutProduct(null);
      setIsProcessing(false);
    }
  }, [buyerProducts, activeProduct, checkoutProduct]);

  // Category list with counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: (buyerProducts || []).length, fresh: 0, aged: 0 };
    (buyerProducts || []).forEach((p) => {
      const cat = p.category || 'fresh';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [buyerProducts]);

  const categories = useMemo(() => [
    {
      id: 'all',
      name: isBn ? 'সকল প্যাকেজ' : 'All Accounts',
      desc: isBn ? 'সব ধরণের ভেরিফাইড প্যাকেজ' : 'Browse all verified packages',
      icon: Layers,
      color: 'indigo',
      count: categoryCounts.all || 0,
    },
    {
      id: 'fresh',
      name: isBn ? 'ফ্রেশ জিমেইল' : 'Fresh Gmails',
      desc: isBn ? '১০০% নতুন ও সক্রিয় অ্যাকাউন্ট' : 'Newly created, active & clean',
      icon: Zap,
      color: 'emerald',
      count: categoryCounts.fresh || 0,
    },
    {
      id: 'aged',
      name: isBn ? 'ওল্ড জিমেইল' : 'Aged Accounts',
      desc: isBn ? 'উচ্চ ট্রাস্ট ও পুরোনো অ্যাকাউন্ট' : 'High trust, matured accounts',
      icon: ShieldCheck,
      color: 'amber',
      count: categoryCounts.aged || 0,
    },
  ], [categoryCounts, isBn]);

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    let result = (buyerProducts || []).filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const titleText = (isBn && p.titleBn ? p.titleBn : p.title || '').toLowerCase();
      const descText = (isBn && p.descriptionBn ? p.descriptionBn : p.description || '').toLowerCase();
      const codeText = (p.code || p.sku || p.id || '').toLowerCase();
      const q = (searchQuery || '').trim().toLowerCase();
      const matchesSearch = !q || titleText.includes(q) || descText.includes(q) || codeText.includes(q);
      const matchesStock = !onlyInStock || (p.stock || 0) > 0;
      return matchesCategory && matchesSearch && matchesStock;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'stock') return (b.stock || 0) - (a.stock || 0);
      // popular
      return ((b.reviewsCount || 0) + (b.rating || 0) * 10) - ((a.reviewsCount || 0) + (a.rating || 0) * 10);
    });

    return result;
  }, [buyerProducts, selectedCategory, searchQuery, sortBy, onlyInStock, isBn]);

  const handleOpenBuyModal = (product: BuyerProduct) => {
    hapticFeedback.medium();
    if (!user) {
      setActiveTab('register');
      return;
    }
    setCheckoutProduct(product);
    setQuantity(product.minQty || 1);
  };

  const handleCopyProductCode = (code: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    hapticFeedback.light();
    copyText(code, isBn ? 'প্রোডাক্ট কোড কপি হয়েছে' : 'Product code copied');
    setCopiedCodeId(code);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#6366f1'],
      });
    } catch {}
  };

  const { depositBalance: realTimeDepositBalance, reservedBalance: realTimeReservedBalance } = useUserBalance(user);

  const handleConfirmPurchase = async () => {
    if (!checkoutProduct || !user) return;
    hapticFeedback.heavy();
    setIsProcessing(true);

    const calculatedTotalPrice = (checkoutProduct.price || 0) * quantity;

    try {
      const result = await createBuyerOrder(checkoutProduct.id, quantity);
      if (result.success && result.orderId) {
        setOrderSuccessId(result.orderId);
        setCheckoutProduct(null);
        triggerConfetti();
      } else if (result.reason === 'insufficient_balance') {
        setShortfallAmount(result.shortfall || 0);
        setCheckoutProduct(null);
        setInsufficientModalOpen(true);
      }
    } catch (e) {
      console.error('Purchase error', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentDepositBalance = Number(realTimeDepositBalance !== undefined ? realTimeDepositBalance : (profile?.deposit_balance || 0));
  const pendingOrdersSum = (buyerOrders || [])
    .filter((o) => o && o.userId === user?.uid && (o.status === 'pending' || o.status === 'processing'))
    .reduce((sum, o) => sum + (Number(o.amount || (Number(o.unitPrice || 0) * Number(o.quantity || 1))) || 0), 0);
  const reservedBalance = pendingOrdersSum > 0 ? pendingOrdersSum : Number(realTimeReservedBalance !== undefined ? realTimeReservedBalance : (profile?.reserved_balance || 0));
  const availableBalance = currentDepositBalance;
  const totalPrice = checkoutProduct ? (checkoutProduct.price || 0) * quantity : 0;
  const isBalanceEnough = availableBalance >= totalPrice;

  const faqs = [
    {
      q: isBn ? "লকড ব্যালেন্স (Locked Balance) কী?" : "What is Locked Balance?",
      a: isBn
        ? "যখন আপনি কোনো জিমেইল অর্ডারে ক্লিক করবেন, আপনার অর্ডার সমপরিমাণ টাকা সরাসরি কেটে নেয়া হবে না; বরং তা 'লকড ব্যালেন্স' এ নিরাপদে থাকবে। অ্যাডমিন অ্যাকাউন্ট ভেরিফাই করে ডেলিভারি দেওয়ার পরই কেবল টাকা কাটা হবে। কোনো সমস্যা হলে বা অর্ডার বাতিল হলে টাকা তাৎক্ষণিক ডিপোজিট ব্যালেন্সে ফেরত আসে।"
        : "When you place an order, your money is not deducted immediately; it is securely held in Locked Balance. Funds are only finalized once valid credentials are provided and approved. If cancelled, funds return to your Deposit Balance instantly.",
    },
    {
      q: isBn ? "ডেলিভারি পেতে কতক্ষণ সময় লাগে?" : "What is the guaranteed delivery timeline?",
      a: isBn
        ? "অধিকাংশ অর্ডার ১ থেকে ৬ ঘণ্টার মধ্যে ডেলিভারি সম্পন্ন হয় এবং সর্বোচ্চ ২৪ ঘণ্টার মানসম্মত এসএলএ (SLA) গ্যারান্টি প্রদান করা হয়। ডেলিভারি সম্পন্ন হওয়ার সাথে সাথে আপনি নোটিফিকেশন ও এসএমএস অ্যালার্ট পাবেন।"
        : "Most orders are delivered within 1 to 6 hours with a strict maximum 24-hour SLA guarantee. You will receive an instant notification and SMS alert once credentials are ready.",
    },
    {
      q: isBn ? "কোনো অ্যাকাউন্টে সমস্যা হলে রিপ্লেসমেন্ট সুবিধা আছে?" : "What is the replacement and warranty policy?",
      a: isBn
        ? "হ্যাঁ! প্রতিটি জিমেইল অ্যাকাউন্টের সাথে রয়েছে ৬-১২ ঘণ্টার লাইভ রিপ্লেসমেন্ট ওয়ারেন্টি। অ্যাকাউন্টে লগইন বা অন্য কোনো সমস্যা হলে সরাসরি আপনার অর্ডার ড্যাশবোর্ড থেকে ১-ক্লিকে ক্লেম বা রিফান্ড রিকোয়েস্ট করতে পারবেন।"
        : "Yes! Every single Gmail account includes an active 6-12h live warranty. If you encounter incorrect passwords or verification issues, submit a claim directly from your orders tab for instant replacement.",
    },
    {
      q: isBn ? "অর্ডার করার পর জিমেইলের পাসওয়ার্ড বা তথ্য কোথায় পাবো?" : "Where do I access the purchased Gmail credentials?",
      a: isBn
        ? "অর্ডার অনুমোদিত হওয়ার সাথে সাথে 'আমার অর্ডারসমূহ (My Orders)' ট্যাবে আপনার জিমেইল আইডি, পাসওয়ার্ড ও রিকভারি মেইল প্রদর্শিত হবে এবং আপনি এক ক্লিকেই সব কপি বা টেক্সট ফাইল হিসেবে ডাউনলোড করতে পারবেন।"
        : "Once delivered, access your Gmail user IDs, passwords, and recovery emails in the 'My Orders' section, with instant 1-click copy and text file export support.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Modern Compact Hero Section */}
      <div className="relative overflow-hidden bg-slate-950 px-4 py-8 sm:py-12 rounded-b-[2.5rem] sm:rounded-b-[4rem] shadow-2xl border-b border-white/5">
        {/* Abstract Mesh Gradient Accents */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/30 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]" />
          <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] bg-emerald-600/15 rounded-full blur-[120px]" />
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-8 sm:gap-12">
          
          {/* Main Hero Copy & Badges */}
          <div className="space-y-5 lg:max-w-xl text-center lg:text-left items-center lg:items-start flex flex-col">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-[11px] font-black text-indigo-200 uppercase tracking-[0.2em] backdrop-blur-xl shadow-xl">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{isBn ? 'ভেরিফাইড মার্কেটপ্লেস' : 'Verified Marketplace'}</span>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.1] drop-shadow-sm">
                {isBn ? 'প্রিমিয়াম ভেরিফাইড জিমেইল' : 'Premium Verified Gmails'}
              </h1>

              <p className="text-[12px] sm:text-sm md:text-base text-slate-400 leading-relaxed max-w-md mx-auto lg:mx-0">
                {isBn
                  ? 'নিরাপদ এসক্রোর মাধ্যমে সচল জিমেইল অ্যাকাউন্ট কিনুন। পেমেন্ট সুরক্ষিত থাকবে ভ্যালিডেশন হওয়া পর্যন্ত।'
                  : 'Get high-quality, verified Gmail accounts with 100% secure escrow protection. Your funds are safe until you verify.'}
              </p>
            </div>

            {/* Premium Pill Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] sm:text-xs font-black text-emerald-400 shadow-lg shadow-emerald-900/10 backdrop-blur-md">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{isBn ? '২৪ঘণ্টা ডেলিভারি' : '24h Delivery'}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] sm:text-xs font-black text-amber-300 shadow-lg shadow-amber-900/10 backdrop-blur-md">
                <Award className="w-3.5 h-3.5" />
                <span>{isBn ? 'ভেরিফাইড এসক্রো' : 'Verified Escrow'}</span>
              </div>
            </div>
          </div>

          {/* Luxury Glass Wallet Widget */}
          <div className="w-full lg:w-88 shrink-0 bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-5 sm:p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-white/5 opacity-50" />
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-700" />
            
            <div className="relative z-10 flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-900/40">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{isBn ? 'ওয়ালেট ব্যালেন্স' : 'Wallet Balance'}</span>
                  <span className="text-[11px] font-bold text-white leading-none">{isBn ? 'সুরক্ষিত ফান্ড' : 'Secured Funds'}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  hapticFeedback.light();
                  if (onOpenOrders) onOpenOrders();
                  else setActiveTab('buyer_orders');
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-4 mb-6 px-1">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider whitespace-nowrap truncate">{isBn ? 'ফান্ড যোগ করুন' : 'Add Funds'}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tracking-tight">৳{availableBalance.toFixed(2).split('.')[0]}</span>
                  <span className="text-[10px] font-bold text-emerald-400/60 font-mono">.{availableBalance.toFixed(2).split('.')[1]}</span>
                </div>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider whitespace-nowrap truncate">{isBn ? 'লকড ব্যালেন্স' : 'Locked Balance'}</span>
                <div className="flex items-baseline gap-1 justify-end">
                  <span className="text-xl sm:text-2xl font-black text-indigo-300 font-mono tracking-tight">৳{reservedBalance.toFixed(2).split('.')[0]}</span>
                  <span className="text-[10px] font-bold text-indigo-300/60 font-mono">.{reservedBalance.toFixed(2).split('.')[1]}</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex flex-col gap-3">
              <button
                onClick={() => {
                  hapticFeedback.medium();
                  if (onOpenDeposit) onOpenDeposit();
                  else setActiveTab('buyer_deposit');
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-black shadow-xl shadow-indigo-900/40 flex items-center justify-center gap-2 transition-all border border-white/10 active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>{isBn ? 'টাকা রিচার্জ করুন' : 'Deposit Funds'}</span>
              </button>
              <button
                onClick={() => {
                  hapticFeedback.light();
                  if (onOpenWallet) onOpenWallet();
                  else setActiveTab('buyer_wallet');
                }}
                className="w-full py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-[10px] font-black text-slate-400 text-center transition-all active:scale-[0.98] tracking-wider"
              >
                {isBn ? 'লেনদেনের বিস্তারিত' : 'TRANSACTION DETAILS'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search, Filter & Category Sorter Toolbar */}
      <div className="space-y-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        
        {/* Top Controls: Search, Stock Toggle & Sorter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBn ? 'প্যাকেজ নাম বা প্রোডাক্ট কোড (#PKG-GM01) দিয়ে খুঁজুন...' : 'Search by package name or SKU code (#PKG-GM01)...'}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 text-slate-800 outline-none placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters: In Stock Only & Sorter */}
          <div className="flex items-center gap-2.5 flex-wrap self-end lg:self-auto">
            
            {/* In Stock Only Toggle */}
            <button
              type="button"
              onClick={() => {
                hapticFeedback.light();
                setOnlyInStock(!onlyInStock);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                onlyInStock
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${onlyInStock ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{isBn ? 'শুধু স্টকে আছে' : 'In Stock Only'}</span>
            </button>

            {/* Sorter Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-2xl text-xs font-bold text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent outline-none cursor-pointer text-slate-800 font-bold"
              >
                <option value="popular">{isBn ? 'জনপ্রিয় প্যাকেজ' : 'Most Popular'}</option>
                <option value="price_asc">{isBn ? 'দাম: কম থেকে বেশি' : 'Price: Low to High'}</option>
                <option value="price_desc">{isBn ? 'দাম: বেশি থেকে কম' : 'Price: High to Low'}</option>
                <option value="rating">{isBn ? 'সর্বোচ্চ রেটিং' : 'Highest Rated'}</option>
                <option value="stock">{isBn ? 'সর্বোচ্চ স্টক' : 'Highest Stock'}</option>
              </select>
            </div>

            {/* Global Price Alert Button */}
            <button
              type="button"
              onClick={() => {
                hapticFeedback.medium();
                setPriceAlertCategory(selectedCategory === 'all' ? 'all' : (selectedCategory as any));
                setPriceAlertModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-black bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-2xs transition-all cursor-pointer"
              title={isBn ? 'প্রাইস ড্রপ অ্যালার্ট সাবস্ক্রাইব করুন' : 'Subscribe to Price Drop Alerts'}
            >
              <BellRing className="w-3.5 h-3.5 text-indigo-600 animate-bounce" />
              <span>{isBn ? 'প্রাইস অ্যালার্ট' : 'Price Alerts'}</span>
              {priceAlerts.filter((a) => a.active).length > 0 && (
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              )}
            </button>
          </div>
        </div>

        {/* Modern Segmented Category Tabs & Status Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
          
          {/* Segmented Category Control - Responsive & Scrollable without truncation */}
          <div className="p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 flex items-center gap-1 w-full md:w-auto overflow-x-auto scrollbar-none whitespace-nowrap">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    hapticFeedback.light();
                    setSelectedCategory(cat.id);
                  }}
                  className={`flex-1 min-w-max flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs transition-all duration-200 cursor-pointer select-none whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/90 font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-bold'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      cat.id === 'fresh'
                        ? 'bg-emerald-500'
                        : cat.id === 'aged'
                        ? 'bg-amber-500'
                        : 'bg-indigo-600'
                    } ${isActive ? 'ring-2 ring-indigo-100' : 'opacity-70'}`}
                  />
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="whitespace-nowrap font-bold">{cat.name}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md font-bold shrink-0 ${
                      isActive ? 'bg-slate-100 text-slate-800' : 'bg-slate-200/60 text-slate-500'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Active Status & Reset */}
          {(searchQuery || selectedCategory !== 'all' || onlyInStock) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setOnlyInStock(false);
              }}
              className="text-indigo-600 font-bold hover:underline cursor-pointer text-xs flex items-center gap-1 self-end md:self-auto"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{isBn ? 'ফিল্টার রিসেট' : 'Reset Filters'}</span>
            </button>
          )}
        </div>

        {/* Results Count Banner */}
        <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-slate-500 font-semibold pt-1 border-t border-slate-100/80 px-0.5">
          <span>
            {isBn
              ? `মোট ${filteredProducts.length} টি ভেরিফাইড প্যাকেজ পাওয়া গেছে`
              : `Found ${filteredProducts.length} verified ${filteredProducts.length === 1 ? 'package' : 'packages'}`}
          </span>
          <span className="text-[11px] text-slate-400">
            {isBn ? '১০০% অটোমেটিক ডেলিভারি ভ্যালিডেশন' : '100% Automated Credential Check'}
          </span>
        </div>
      </div>

      {/* Modern High-Contrast Product Cards Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredProducts.map((product) => {
            const title = (isBn && product.titleBn ? product.titleBn : product.title) || 'Gmail Package';
            const desc = (isBn && product.descriptionBn ? product.descriptionBn : product.description) || '';
            const badge = (isBn && product.badgeBn ? product.badgeBn : product.badge) || '';
            const delivery = (isBn && product.deliveryTimeBn ? product.deliveryTimeBn : product.deliveryTime) || '1 - 24 Hours';
            const productCode = product.code || product.sku || `#PKG-${product.id.slice(0, 6).toUpperCase()}`;

            const rawFeatures = isBn && product.featuresBn ? product.featuresBn : product.features;
            const features = Array.isArray(rawFeatures)
              ? rawFeatures
              : typeof rawFeatures === 'string'
              ? (rawFeatures as string).split(',').map((s) => s.trim()).filter(Boolean)
              : [];

            const unitPrice = Number(product.price || 0);
            const oldPrice = Number(product.oldPrice || 0);
            const discountPercent = oldPrice > unitPrice ? Math.round(((oldPrice - unitPrice) / oldPrice) * 100) : 0;
            const stockCount = Number(product.stock || 0);
            const isLowStock = stockCount > 0 && stockCount <= 15;
            const isOutOfStock = stockCount <= 0;

            // Category thematic badge styling
            const getCategoryTheme = (cat: string) => {
              switch (cat) {
                case 'aged':
                  return {
                    label: isBn ? 'ওল্ড অ্যাকাউন্ট' : 'Aged Account',
                    bg: 'bg-amber-50 text-amber-800 border-amber-200/80',
                  };
                default:
                  return {
                    label: isBn ? 'ফ্রেশ জিমেইল' : 'Fresh Gmail',
                    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
                  };
              }
            };

            const catTheme = getCategoryTheme(product.category);

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl p-5 sm:p-5.5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Top subtle highlight border on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="space-y-3.5">
                  
                  {/* Top Bar: Category Pill, Product Code & Live Stock Badge */}
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${catTheme.bg}`}>
                        {catTheme.label}
                      </span>

                      {/* Click-to-copy Product Code (SKU) */}
                      <button
                        type="button"
                        onClick={(e) => handleCopyProductCode(productCode, e)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-mono font-bold border border-slate-200 transition-colors cursor-pointer"
                        title={isBn ? 'প্রোডাক্ট কোড কপি করুন' : 'Click to copy product code'}
                      >
                        <span className="text-slate-400">SKU:</span>
                        <span>{productCode}</span>
                        {copiedCodeId === productCode ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-400" />
                        )}
                      </button>
                    </div>

                    {/* Stock Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                        !isOutOfStock
                          ? isLowStock
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${!isOutOfStock ? (isLowStock ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500') : 'bg-rose-500'}`} />
                      {!isOutOfStock
                        ? isBn
                          ? `${stockCount} টি স্টক`
                          : `${stockCount} In Stock`
                        : isBn
                        ? 'স্টক আউট'
                        : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Title & Badge */}
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                        {title}
                      </h3>
                      {badge && (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 text-[10px] font-black uppercase tracking-wider border border-amber-200 shadow-2xs">
                          <Flame className="w-3 h-3 text-amber-600" />
                          <span>{badge}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Image with Fallback & no-referrer - Clickable for details page */}
                  {(() => {
                    const imageSrc = product.image || product.imageUrl || product.photo || product.img;
                    if (!imageSrc) return null;
                    return (
                      <div
                        onClick={() => {
                          hapticFeedback.light();
                          setActiveProduct(product);
                        }}
                        className="relative w-full h-36 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 my-2 shadow-2xs group-hover:shadow-md transition-all cursor-pointer group/img"
                        title={isBn ? 'বিস্তারিত পড়তে ছবিটিতে ক্লিক করুন' : 'Click image to read full details'}
                      >
                        <img
                          src={imageSrc}
                          alt={title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const parent = (e.target as HTMLElement).parentElement;
                            if (parent) parent.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center p-2">
                          <span className="bg-white/95 backdrop-blur-xs text-indigo-700 text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 transform translate-y-1 group-hover/img:translate-y-0 transition-transform">
                            <Info className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{isBn ? 'বিস্তারিত পড়ুন' : 'Read Details'}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Product Description - Placed nicely below the image and clickable */}
                  {desc && (
                    <div
                      onClick={() => {
                        hapticFeedback.light();
                        setActiveProduct(product);
                      }}
                      className="bg-slate-50/80 hover:bg-indigo-50/50 rounded-xl p-2.5 border border-slate-200/50 hover:border-indigo-200/80 my-1.5 cursor-pointer transition-colors group/desc"
                      title={isBn ? 'বিস্তারিত পড়তে ক্লিক করুন' : 'Click to read full details'}
                    >
                      <p className="text-xs text-slate-600 group-hover/desc:text-slate-900 leading-relaxed font-medium line-clamp-3">
                        {desc}
                      </p>
                    </div>
                  )}

                  {/* Highlight Specifications & Features */}
                  <div className="space-y-1.5 bg-slate-50/90 rounded-2xl p-3 border border-slate-200/60 text-xs">
                    {(features || []).slice(0, 3).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* SLA Delivery Ribbon */}
                  <div className="flex items-center justify-between text-[10px] bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/60 font-semibold text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-600" />
                      <span>{delivery}</span>
                    </span>
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>{isBn ? '৬-১২ ঘণ্টা ওয়ারেন্টি' : '6-12h Live Warranty'}</span>
                    </span>
                  </div>
                </div>

                {/* Price Labels & High-Contrast Buy Button Bottom Section */}
                <div className="pt-3.5 mt-3.5 border-t border-slate-100 space-y-3">
                  
                  {/* Clear Price Labels Block */}
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        {isBn ? 'মূল্য (প্রতি পিস)' : 'Unit Price'}
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                          ৳{unitPrice.toFixed(2)}
                        </span>
                        {oldPrice > 0 && oldPrice > unitPrice && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400 line-through font-mono">
                              ৳{oldPrice.toFixed(2)}
                            </span>
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded">
                              -{discountPercent}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
                      {isBn ? `ন্যূনতম: ${product.minQty || 1} টি` : `Min: ${product.minQty || 1} pc`}
                    </span>
                  </div>

                  {/* Actions: Info Details + Price Alert + High-Contrast Buy Button */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        hapticFeedback.light();
                        setActiveProduct(product);
                      }}
                      className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
                      title={isBn ? 'বিস্তারিত ফিচার দেখুন' : 'View Full Details'}
                    >
                      <Info className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        hapticFeedback.light();
                        setPriceAlertCategory(product.category as any);
                        setPriceAlertModalOpen(true);
                      }}
                      className="p-2.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer shrink-0"
                      title={isBn ? 'এই ক্যাটাগরির প্রাইস অ্যালার্ট সেট করুন' : 'Set Price Drop Alert for this Account Type'}
                    >
                      <Bell className="w-4 h-4" />
                    </button>

                    {/* High-Contrast Bold Buy Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenBuyModal(product)}
                      disabled={isOutOfStock}
                      className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                        !isOutOfStock
                          ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white shadow-md hover:shadow-lg shadow-indigo-600/25 border-indigo-600'
                          : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4 shrink-0" />
                      <span>
                        {!isOutOfStock
                          ? isBn
                            ? 'এখনই কিনুন'
                            : 'Buy Now'
                          : isBn
                          ? 'স্টক শেষ'
                          : 'Out of Stock'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white border border-slate-200 rounded-3xl max-w-md mx-auto space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">
              {isBn ? 'কোনো প্যাকেজ পাওয়া যায়নি' : 'No matching packages found'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isBn
                ? 'অনুগ্রহ করে অন্য কোনো কীওয়ার্ড দিয়ে সার্চ করুন অথবা ক্যাটাগরি ফিল্টার রিসেট করুন।'
                : 'Try adjusting your search criteria or reset filters to browse all packages.'}
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setOnlyInStock(false);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors cursor-pointer"
          >
            {isBn ? 'ফিল্টার রিসেট করে সব দেখুন' : 'Reset Filters & Show All'}
          </button>
        </div>
      )}

      {/* Interactive FAQ Box */}
      <div className="border border-slate-200 rounded-3xl p-6 bg-white space-y-4 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            {isBn ? 'বায়ারদের জিজ্ঞাসিত প্রশ্নোত্তর (FAQ)' : 'Buyer Questions & Answers'}
          </h3>
        </div>

        <div className="space-y-2.5 pt-1">
          {faqs.map((faq, idx) => {
            const isOpen = faqOpenIdx === idx;
            return (
              <div key={idx} className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => {
                    hapticFeedback.light();
                    setFaqOpenIdx(isOpen ? null : idx);
                  }}
                  className="w-full flex items-center justify-between text-left p-4 text-xs font-black text-slate-800 hover:text-indigo-600 cursor-pointer transition-colors"
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-90 text-indigo-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed font-medium animate-in slide-in-from-top-1 border-t border-slate-100/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Product Details Modal */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs animate-fade-in"
            onClick={() => setActiveProduct(null)}
          />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Header with Back Button */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 gap-3">
              <button
                type="button"
                onClick={() => {
                  hapticFeedback.light();
                  setActiveProduct(null);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition-all cursor-pointer shrink-0 border border-slate-200/60 shadow-2xs hover:shadow-xs"
                title={isBn ? 'পেজে ফিরে যান' : 'Back to Marketplace'}
              >
                <ArrowLeft className="w-4 h-4 text-slate-700" />
                <span>{isBn ? 'ব্যাকে যান' : 'Back'}</span>
              </button>

              <div className="flex-1 text-center min-w-0">
                <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight truncate">
                  {(isBn && activeProduct.titleBn ? activeProduct.titleBn : activeProduct.title) || 'Gmail Package'}
                </h3>
                <div className="flex items-center justify-center gap-1.5 pt-0.5">
                  <span className="text-[11px] font-mono text-indigo-600 font-bold">
                    {activeProduct.code || activeProduct.sku || `#PKG-${activeProduct.id.slice(0, 6).toUpperCase()}`}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveProduct(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
                title={isBn ? 'বন্ধ করুন' : 'Close'}
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              
              {/* Product Image in Modal */}
              {(() => {
                const imgUrl = activeProduct.image || activeProduct.imageUrl || activeProduct.photo || activeProduct.img;
                if (!imgUrl) return null;
                return (
                  <div className="w-full h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img
                      src={imgUrl}
                      alt={activeProduct.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const parent = (e.target as HTMLElement).parentElement;
                        if (parent) parent.style.display = 'none';
                      }}
                    />
                  </div>
                );
              })()}

              {/* Description - Beautifully Styled Below Image */}
              <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200/70 space-y-1.5">
                <p className="text-[11px] text-indigo-600 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isBn ? 'প্যাকেজের বিবরণ' : 'Product Description'}</span>
                </p>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {(isBn && activeProduct.descriptionBn ? activeProduct.descriptionBn : activeProduct.description) ||
                    (isBn ? 'কোনো বিবরণ নেই।' : 'No description available.')}
                </p>
              </div>

              {/* Price & Stock Stats */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">{isBn ? 'প্রতি পিসের মূল্য' : 'Unit Price'}</span>
                  <span className="text-lg font-black text-slate-900 font-mono">৳{Number(activeProduct.price || 0).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">{isBn ? 'মজুদ স্টক' : 'Stock In Inventory'}</span>
                  <span className="text-lg font-black text-emerald-600 font-mono">{activeProduct.stock || 0} Pcs</span>
                </div>
              </div>

              {/* All Features */}
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">
                  {isBn ? 'সকল ফিচারসমূহ' : 'Full Features List'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(() => {
                    const raw = isBn && activeProduct.featuresBn ? activeProduct.featuresBn : activeProduct.features;
                    const list = Array.isArray(raw) ? raw : typeof raw === 'string' ? (raw as string).split(',').map(s => s.trim()).filter(Boolean) : [];
                    return (list || []).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700 font-semibold bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Delivery SLA Guarantee */}
              <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs text-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold">{isBn ? 'ডেলিভারি সময়কাল:' : 'Delivery Window:'}</span>
                </div>
                <span className="font-mono font-bold text-indigo-900">
                  {(isBn && activeProduct.deliveryTimeBn ? activeProduct.deliveryTimeBn : activeProduct.deliveryTime) || '1 - 24 Hours'}
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveProduct(null)}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer"
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>
              <button
                onClick={() => {
                  const prod = activeProduct;
                  setActiveProduct(null);
                  handleOpenBuyModal(prod);
                }}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-500 flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{isBn ? 'কিনতে এগিয়ে যান' : 'Proceed to Checkout'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Buy Now / Escrow Checkout System Modal */}
      {checkoutProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
            onClick={() => setCheckoutProduct(null)}
          />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200 p-5 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto">
            
            {/* Checkout Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-indigo-50 text-indigo-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">
                    {isBn ? 'নিরাপদ এসক্রো চেকআউট' : 'Secure Escrow Checkout'}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    {isBn ? '১০০% ব্যালেন্স প্রটেকশন ও লাইভ ওয়ারেন্টি' : '100% Balance Protection & Live SLA'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setCheckoutProduct(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Package Header with Product Code Chip */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-slate-200/80 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900 leading-tight">
                    {(isBn && checkoutProduct.titleBn ? checkoutProduct.titleBn : checkoutProduct.title) || 'Gmail Package'}
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap pt-0.5">
                    {/* Copyable Product Code */}
                    <button
                      type="button"
                      onClick={(e) => handleCopyProductCode(checkoutProduct.code || checkoutProduct.sku || `#PKG-${checkoutProduct.id.slice(0, 6).toUpperCase()}`, e)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white text-slate-700 text-[10px] font-mono font-bold border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors"
                      title={isBn ? 'প্রোডাক্ট কোড কপি করুন' : 'Copy product code'}
                    >
                      <span className="text-slate-400">SKU:</span>
                      <span>{checkoutProduct.code || checkoutProduct.sku || `#PKG-${checkoutProduct.id.slice(0, 6).toUpperCase()}`}</span>
                      {copiedCodeId === (checkoutProduct.code || checkoutProduct.sku) ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                    </button>

                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      {isBn ? `স্টক: ${checkoutProduct.stock} টি` : `Stock: ${checkoutProduct.stock}`}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-slate-900 font-mono">
                    ৳{Number(checkoutProduct.price || 0).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    {isBn ? 'প্রতি পিস' : 'per unit'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity Stepper & Quick Presets */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  {isBn ? 'ক্রয়কৃত পরিমাণ (Quantity)' : 'Purchase Quantity'}
                </label>
                <span className="text-[11px] text-indigo-600 font-bold">
                  {isBn ? `ন্যূনতম: ${checkoutProduct.minQty || 1} টি` : `Min: ${checkoutProduct.minQty || 1} Pcs`}
                </span>
              </div>

              {/* Stepper with Number Input */}
              <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    hapticFeedback.light();
                    setQuantity((prev) => Math.max(checkoutProduct.minQty || 1, prev - 1));
                  }}
                  className="w-11 h-11 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer active:scale-95 shadow-2xs"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="flex flex-col items-center">
                  <input
                    type="number"
                    min={checkoutProduct.minQty || 1}
                    max={checkoutProduct.stock}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        setQuantity(Math.max(1, Math.min(checkoutProduct.stock, val)));
                      }
                    }}
                    className="w-20 text-center font-mono font-black text-2xl text-slate-900 bg-transparent outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-semibold -mt-0.5">
                    {isBn ? 'পিস অ্যাকাউন্ট' : 'Pcs Accounts'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    hapticFeedback.light();
                    setQuantity((prev) => Math.min(checkoutProduct.stock, prev + 1));
                  }}
                  className="w-11 h-11 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer active:scale-95 shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Add Shortcut Presets */}
              <div className="flex items-center gap-1.5 pt-0.5">
                {[1, 5, 10, 20, 50].map((preset) => {
                  if (preset > checkoutProduct.stock && preset > 1) return null;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        hapticFeedback.light();
                        setQuantity(Math.min(checkoutProduct.stock, Math.max(checkoutProduct.minQty || 1, preset)));
                      }}
                      className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                        quantity === preset
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    hapticFeedback.light();
                    setQuantity(checkoutProduct.stock);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                    quantity === checkoutProduct.stock
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isBn ? 'সর্বোচ্চ' : 'Max'}
                </button>
              </div>
            </div>

            {/* Live Pricing Breakdown Card */}
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between font-semibold">
                <span>{isBn ? 'উপমোট মূল্য (Subtotal)' : 'Subtotal'}</span>
                <span className="font-mono text-slate-800 font-bold">
                  {quantity} × ৳{Number(checkoutProduct.price || 0).toFixed(2)} = ৳{Number((checkoutProduct.price || 0) * quantity).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-emerald-700 font-bold">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isBn ? 'এসক্রো ব্যালেন্স প্রটেকশন ফি' : 'Escrow Protection Insurance'}</span>
                </span>
                <span>{isBn ? '৳০.০০ (ফ্রি)' : '৳0.00 (Free)'}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2.5 text-sm font-black text-slate-900">
                <span>{isBn ? 'সর্বমোট প্রদেয় মূল্য' : 'Total Payable Amount'}</span>
                <span className="font-mono text-indigo-600 text-lg sm:text-xl">
                  ৳{totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Visual Balance Comparison & Meter */}
            <div
              className={`p-4 rounded-2xl border transition-colors space-y-2 ${
                isBalanceEnough
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/80 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <Wallet className="w-4 h-4" />
                  <span>{isBn ? 'ব্যবহারযোগ্য ব্যালেন্স:' : 'Available Balance:'}</span>
                  <span className="font-mono">৳{availableBalance.toFixed(2)}</span>
                </span>

                <span className="font-mono text-[11px]">
                  {isBalanceEnough
                    ? isBn ? 'ব্যালেন্স পর্যাপ্ত' : 'Balance Ready'
                    : isBn ? `ঘাটতি: ৳${(totalPrice - availableBalance).toFixed(2)}` : `Shortfall: ৳${(totalPrice - availableBalance).toFixed(2)}`}
                </span>
              </div>

              {/* Progress Bar of Balance vs Total */}
              <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isBalanceEnough ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{
                    width: `${Math.min(100, (availableBalance / (totalPrice || 1)) * 100)}%`,
                  }}
                />
              </div>

              <div className="text-[11px] leading-relaxed font-semibold">
                {isBalanceEnough ? (
                  <span className="text-emerald-700">
                    {isBn
                      ? '✓ অর্ডার কনফার্ম করলে সমপরিমাণ অর্থ এসক্রো রিজার্ভে লক হবে। ডেলিভারির পর কাটা হবে।'
                      : '✓ Placing this order will lock funds in Escrow Reserve until delivery is completed.'}
                  </span>
                ) : (
                  <span className="text-rose-700">
                    {isBn
                      ? `⚠️ আপনার আরও ৳${(totalPrice - availableBalance).toFixed(2)} ডিপোজিট করা প্রয়োজন। ডিপোজিট করলে চেকআউট অটো-রিজিউম হবে।`
                      : `⚠️ Need ৳${(totalPrice - availableBalance).toFixed(2)} more. Auto-resumes after deposit.`}
                  </span>
                )}
              </div>
            </div>

            {/* 3-Step Escrow Guarantee Visual Timeline */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                {isBn ? 'কীভাবে এসক্রো সুরক্ষা কাজ করে?' : 'How Escrow Protection Works'}
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-600 pt-0.5">
                <div className="p-1.5 rounded-xl bg-white border border-slate-200/60">
                  <span className="text-indigo-600 block font-mono">1. অর্ডার</span>
                  <span>{isBn ? 'রিজার্ভে লক' : 'Escrow Hold'}</span>
                </div>
                <div className="p-1.5 rounded-xl bg-white border border-slate-200/60">
                  <span className="text-indigo-600 block font-mono">2. ভেরিফাই</span>
                  <span>{isBn ? 'কোয়ালিটি চেক' : 'Admin Audit'}</span>
                </div>
                <div className="p-1.5 rounded-xl bg-white border border-slate-200/60">
                  <span className="text-emerald-600 block font-mono">3. ডেলিভারি</span>
                  <span>{isBn ? 'তাৎক্ষণিক মেইল' : 'Instant Pass'}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              {isBalanceEnough ? (
                <button
                  onClick={handleConfirmPurchase}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer border border-indigo-500"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4.5 h-4.5" />
                  )}
                  <span>
                    {isProcessing
                      ? isBn
                        ? 'এসক্রো অর্ডার প্রসেস হচ্ছে...'
                        : 'Locking Escrow Order...'
                      : isBn
                      ? `অর্ডার কনফার্ম ও লক করুন (৳${totalPrice.toFixed(2)})`
                      : `Confirm & Lock Escrow Order (৳${totalPrice.toFixed(2)})`}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShortfallAmount(totalPrice - availableBalance);
                    setCheckoutProduct(null);
                    setInsufficientModalOpen(true);
                  }}
                  className="w-full py-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black shadow-lg shadow-amber-600/25 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer border border-amber-500"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {isBn
                      ? `৳${(totalPrice - availableBalance).toFixed(2)} ডিপোজিট করে অর্ডার করুন`
                      : `Add ৳${(totalPrice - availableBalance).toFixed(2)} Deposit to Order`}
                  </span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Insufficient Balance Alert Modal */}
      {insufficientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setInsufficientModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 text-slate-800 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-900">
                {isBn ? 'অপর্যাপ্ত ওয়ালেট ব্যালেন্স!' : 'Insufficient Wallet Balance'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                {isBn
                  ? `আপনার ওয়ালেটে পর্যাপ্ত পরিমাণ অর্থ নেই। এই অর্ডারটি প্লেস করার জন্য আপনার আরও কমপক্ষে ৳${shortfallAmount.toFixed(2)} রিচার্জ করা প্রয়োজন।`
                  : `You do not have enough available balance. You need an additional ৳${shortfallAmount.toFixed(2)} to complete this purchase.`}
              </p>
            </div>

            {/* Auto-Resume Note */}
            <p className="text-[10px] text-indigo-700 bg-indigo-50 p-3 rounded-2xl border border-indigo-100/80 leading-relaxed font-semibold">
              {isBn
                ? '💡 ডিপোজিট সম্পন্ন হওয়ার সাথে সাথে আপনি সরাসরি এই চেকআউট পেজে ফিরে আসবেন।'
                : '💡 After successful deposit, your checkout will resume automatically.'}
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => {
                  setInsufficientModalOpen(false);
                  if (onOpenDeposit) onOpenDeposit();
                  else setActiveTab('buyer_deposit');
                }}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-indigo-500"
              >
                <CreditCard className="w-4 h-4" />
                <span>{isBn ? 'এখনই ডিপোজিট করুন' : 'Add Deposit Now'}</span>
              </button>

              <button
                onClick={() => setInsufficientModalOpen(false)}
                className="w-full py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-all cursor-pointer border border-slate-200"
              >
                {isBn ? 'বাতিল করুন' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Success Confirmed Modal */}
      {orderSuccessId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setOrderSuccessId(null)}
          />
          <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 text-slate-800 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900 leading-tight">
                {isBn ? 'অর্ডার সফলভাবে জমা হয়েছে! 🎉' : 'Order Placed Successfully!'}
              </h3>
              
              {/* Order ID Tag */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-mono font-bold text-slate-700">
                <span>#{orderSuccessId.slice(-8).toUpperCase()}</span>
                <button
                  onClick={() => {
                    copyText(orderSuccessId);
                    setCopiedOrderId(true);
                    setTimeout(() => setCopiedOrderId(false), 2000);
                  }}
                  className="text-slate-400 hover:text-indigo-600 cursor-pointer"
                  title="Copy Order ID"
                >
                  {copiedOrderId ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                {isBn
                  ? 'আপনার অর্ডারটি এসক্রো রিজার্ভে লক করা হয়েছে। অ্যাডমিন অ্যাকাউন্ট ভেরিফাই করে ডেলিভারি দিলে আপনার মেইন ব্যালেন্স থেকে কাটা হবে।'
                  : 'Your order is safely locked in Escrow. Once verified and delivered by administration, funds will be finalized.'}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setOrderSuccessId(null);
                  if (onOpenOrders) onOpenOrders();
                  else setActiveTab('buyer_orders');
                }}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-indigo-500"
              >
                <FileText className="w-4 h-4" />
                <span>{isBn ? 'আমার অর্ডারসমূহ দেখুন' : 'Track My Orders'}</span>
              </button>

              <button
                onClick={() => setOrderSuccessId(null)}
                className="w-full py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-all cursor-pointer border border-slate-200"
              >
                {isBn ? 'মার্কেটপ্লেসে থাকুন' : 'Continue Shopping'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price Alert Subscription Modal */}
      <PriceAlertModal
        isOpen={isPriceAlertModalOpen}
        onClose={() => setPriceAlertModalOpen(false)}
        defaultAccountType={priceAlertCategory}
      />

    </div>
  );
};
