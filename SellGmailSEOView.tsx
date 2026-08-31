import React from 'react';
import { useApp } from './AppContext';
import { SEO } from './SEO';
import { 
  ShieldCheck, 
  MessageCircle, 
  ArrowRight, 
  HelpCircle, 
  Award, 
  CheckCircle2, 
  BadgeDollarSign, 
  HeartHandshake, 
  TrendingUp, 
  Layers, 
  Sparkles, 
  Zap, 
  Lock 
} from 'lucide-react';

export const SellGmailSEOView: React.FC = () => {
  const { language, setActiveTab, levels } = useApp();
  const isBn = language === 'bn';

  const defaultLevels = levels && levels.length > 0 ? levels : [
    { level: 1, approved: 0, rate: 15, old_rate: 17, title: 'Bronze Member', perkDescription: 'Standard exchange rate' },
    { level: 2, approved: 40, rate: 16, old_rate: 18, title: 'Silver Member', perkDescription: '+1৳ per Gmail' },
    { level: 3, approved: 100, rate: 17, old_rate: 19, title: 'Gold VIP', perkDescription: '+2৳ per Gmail + Fast payouts' },
    { level: 4, approved: 250, rate: 18, old_rate: 20, title: 'Platinum Partner', perkDescription: '+3৳ per Gmail + Instant audit' },
    { level: 5, approved: 500, rate: 20, old_rate: 22, title: 'Diamond Boss', perkDescription: 'Maximum rate + VIP 24/7 dedicated review' },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Where to sell old Gmail accounts?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Mail Factory is the best place to sell old Gmail in BD with instant bKash payment."
        }
      },
      {
        "@type": "Question",
        "name": "What is old Gmail price in BD?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "2010-2015 Gmail price is 17-22 BDT, 2016-2019 is 15-20 BDT."
        }
      }
    ]
  };

  const handleContactWhatsApp = () => {
    window.open('https://wa.me/8801964182265?text=Hello%20Mail%20Factory,%20I%20want%20to%20sell%20my%20Gmail%20accounts.', '_blank');
  };

  const t = {
    title: isBn ? "আপনার পুরনো ও নতুন জিমেইল বিক্রি করুন - সর্বোচ্চ বাজার দর" : "Sell Your Old & New Gmail Accounts for Instant Cash",
    subtitle: isBn 
      ? "Mail Factory-তে জিমেইল বিক্রি করুন ১০০০+ বিশ্বস্ত সেলারদের মতো। ইনস্ট্যান্ট বিকাশ, নগদ ও রকেটে ২ ঘণ্টার মধ্যে পেমেন্ট নিন।"
      : "Join 1000+ trusted sellers and sell your Gmail accounts at the best prices. Get paid instantly via bKash, Nagad, or Rocket in 2 hours.",
    liveRatesTitle: isBn ? "লাইভ রেট চার্ট (১৫৳ - ২২৳ রেঞ্জ)" : "Live Selling Rates (৳15 - ৳22 Range)",
    liveRatesSub: isBn 
      ? "আপনার জিমেইলের ধরন এবং আপনার সেলার লেভেলের ওপর ভিত্তি করে লাইভ রেট হিসাব করা হয়।" 
      : "Rates are determined by the type of Gmail and your current Seller Level.",
    newGmail: isBn ? "নতুন জিমেইল (New Gmail)" : "New Gmail Accounts",
    newGmailSub: isBn ? "সর্বনিম্ন ১৫৳ থেকে শুরু হয়ে লেভেল অনুযায়ী ২০৳ পর্যন্ত" : "Starting from ৳15 up to ৳20 depending on VIP Level",
    oldGmail: isBn ? "পুরনো জিমেইল (Old Gmail / 2010-2022)" : "Old / Aged Gmail Accounts (2010-2022)",
    oldGmailSub: isBn ? "সর্বনিম্ন ১৭৳ থেকে শুরু হয়ে লেভেল অনুযায়ী ২২৳ পর্যন্ত" : "Starting from ৳17 up to ৳22 depending on VIP Level",
    startSellingBtn: isBn ? "হোয়াটসঅ্যাপে সরাসরি বিক্রি করুন" : "Sell Instantly on WhatsApp",
    viewMarketBtn: isBn ? "সেলার লেভেল ও সুযোগ-সুবিধা দেখুন" : "View Seller Levels & Perks",
    whyUsTitle: isBn ? "কেন Mail Factory-তে জিমেইল বিক্রি করবেন?" : "Why Sell Your Gmail to Mail Factory?",
    whyUsSub: isBn ? "বাংলাদেশী সেলারদের জন্য সবচেয়ে বিশ্বস্ত ও নিরাপদ প্ল্যাটফর্ম।" : "Bangladesh's most secure and highest-paying platform for sellers.",
    levelChartTitle: isBn ? "লেভেল অনুযায়ী লাভজনক রেট চার্ট" : "Seller Level & Reward Rate Structure",
    levelChartSub: isBn 
      ? "আপনার সফলভাবে সাবমিট করা জিমেইলের সংখ্যা যত বাড়বে, আপনার সেলার লেভেল ও রেটও তত বৃদ্ধি পাবে!" 
      : "The more accounts you successfully sell, the higher your Seller Level and payouts grow!",
    levelCol: isBn ? "সেলার লেভেল" : "Seller Level",
    approvedCol: isBn ? "অনুমোদিত জিমেইল" : "Approved Gmails",
    newRateCol: isBn ? "নিউ জিমেইল রেট" : "New Gmail Rate",
    oldRateCol: isBn ? "ওল্ড জিমেইল রেট" : "Old Gmail Rate",
    perkCol: isBn ? "বিশেষ সুবিধা (Perks)" : "Special Benefit",
    stepsTitle: isBn ? "জিমেইল বিক্রি করার ৩টি সহজ ধাপ" : "How to Sell in 3 Easy Steps",
    stepsSub: isBn ? "কোনো জটিলতা ছাড়াই মাত্র ২ ঘণ্টার মধ্যে পেমেন্ট বুঝে নিন" : "Zero hassle, get your cash guaranteed within 2 hours",
    step1Title: isBn ? "ধাপ ১: স্ক্রিনশট পাঠান" : "Step 1: Share Screenshot",
    step1Desc: isBn ? "আপনার জিমেইলের বয়স ও রিকভারি ইমেইলসহ স্ক্রিনশট আমাদের হোয়াটসঅ্যাপে পাঠান।" : "Send screenshots of your Gmail settings (recovery status & creation year) via WhatsApp.",
    step2Title: isBn ? "ধাপ ২: দরদাম ঠিক করুন" : "Step 2: Get Instant Price",
    step2Desc: isBn ? "আমাদের সাপোর্ট টিম জিমেইল চেক করে মাত্র ৫ মিনিটে সর্বোচ্চ রেট জানিয়ে দেবে।" : "Our support team verifies the quality and offers the absolute best market price in 5 minutes.",
    step3Title: isBn ? "ধাপ ৩: ইনস্ট্যান্ট পেমেন্ট নিন" : "Step 3: Instant Cashout",
    step3Desc: isBn ? "জিমেইল সাবমিট করার পর ২ ঘণ্টার মধ্যে বিকাশ, নগদ বা রকেটে টাকা বুঝে নিন।" : "Submit the credentials safely and receive your payment in bKash/Nagad/Rocket within 2 hours.",
    safetyTitle: isBn ? "আপনার ব্যক্তিগত তথ্যের শতভাগ নিরাপত্তা নিশ্চয়তা" : "100% Personal Data Privacy Guarantee",
    safetyDesc: isBn 
      ? "আমরা জিমেইল কেনার পর ব্রাউজিং হিস্ট্রি, ফটো, কন্ট্যাক্টস এবং ব্যক্তিগত সকল ইমেইল সম্পূর্ণ ফ্যাক্টরি রিসেট ও ডিলিট করে দিই। আপনার ডাটা আমাদের কাছে শতভাগ নিরাপদ।" 
      : "After purchasing, we perform a deep secure wipe, deleting all browsing history, photos, contacts, and personal files. Your private data is completely protected and never misused.",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 md:px-8 animate-fade-in selection:bg-indigo-500 selection:text-white">
      <SEO 
        title="Sell Old & New Gmail Accounts for Money - Best Price BD | Mail Factory"
        description="Sell old & new Gmail accounts for money in BD. Best price for 2010-2024 Gmail. Instant bKash, Nagad, PayPal payment in 2 hours. 100% safe & trusted."
        url="https://mailfactory.top/sell-old-gmail-accounts/"
        schemaData={faqSchema}
      />

      <div className="max-w-4xl mx-auto space-y-12">
        {/* Banner Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-10 text-center space-y-5 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(99,102,241,0.12),transparent_60%)]" />
          
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-2 text-[11px] relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 font-extrabold border border-indigo-500/20">
              <Award className="w-3.5 h-3.5" />
              <span>BD's No.1 Trusted Buyer</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-extrabold border border-emerald-500/20">
              <BadgeDollarSign className="w-3.5 h-3.5" />
              <span>Instant Payout in 2 Hours</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 font-extrabold border border-rose-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Personal Data Deleted</span>
            </div>
          </div>
          
          <h1 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tight relative z-10">
            {t.title}
          </h1>
          
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed relative z-10">
            {t.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2 relative z-10">
            <button
              onClick={handleContactWhatsApp}
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs md:text-sm font-black text-white shadow-lg shadow-emerald-600/10 hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
              <span>{t.startSellingBtn}</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#rate-table"
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs md:text-sm font-extrabold text-white transition-all border border-slate-700/60 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>{t.viewMarketBtn}</span>
            </a>
          </div>
        </div>

        {/* 1. HIGHLIGHTED RATES FIRST - Split Card Grid */}
        <div className="space-y-4">
          <div className="text-center md:text-left space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
              <Zap className="w-3 h-3 text-emerald-400" />
              {isBn ? "লাইভ আপডেট করা হয়েছে" : "Live Rates Updated"}
            </div>
            <h2 className="text-lg md:text-xl font-black text-white tracking-tight">
              {t.liveRatesTitle}
            </h2>
            <p className="text-[11px] md:text-xs text-slate-400">
              {t.liveRatesSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* New Gmail Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 p-5 md:p-6 shadow-lg hover:border-emerald-500/50 transition-all duration-300">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  {isBn ? "সদ্য তৈরি জিমেইল" : "Newly Created"}
                </span>
                <span className="text-[10px] font-bold text-slate-400">PVA Account</span>
              </div>
              
              <div className="my-4">
                <span className="text-[11px] text-slate-400 block font-bold uppercase">{t.newGmail}</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl md:text-4xl font-black text-white tracking-tight">৳15 - ৳20</span>
                  <span className="text-xs text-slate-400 font-semibold">/ Account</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 border-t border-slate-900 pt-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{t.newGmailSub}</span>
              </div>
            </div>

            {/* Old / Aged Gmail Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 p-5 md:p-6 shadow-lg hover:border-amber-500/50 transition-all duration-300">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full pointer-events-none" />
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                  {isBn ? "পুরনো ও বিশ্বস্ত জিমেইল" : "Aged (2010 - 2022)"}
                </span>
                <span className="text-[10px] font-bold text-slate-400">High Trust score</span>
              </div>

              <div className="my-4">
                <span className="text-[11px] text-slate-400 block font-bold uppercase">{t.oldGmail}</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl md:text-4xl font-black text-white tracking-tight">৳17 - ৳22</span>
                  <span className="text-xs text-slate-400 font-semibold">/ Account</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 border-t border-slate-900 pt-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{t.oldGmailSub}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Detailed Level Rate Chart Section */}
        <div id="rate-table" className="space-y-4 pt-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
            <div className="space-y-1">
              <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                {t.levelChartTitle}
              </h2>
              <p className="text-[11px] md:text-xs text-slate-400 max-w-xl">
                {t.levelChartSub}
              </p>
            </div>
            <span className="text-[9px] font-black tracking-wider text-indigo-400 uppercase bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/15 self-start">
              {isBn ? "১০০% নিরাপদ সেলিং প্ল্যাটফর্ম" : "100% Safe Selling Platform"}
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 shadow-xl backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="p-4 pl-5">{t.levelCol}</th>
                    <th className="p-4 text-center">{t.approvedCol}</th>
                    <th className="p-4 text-center">{t.newRateCol}</th>
                    <th className="p-4 text-center">{t.oldRateCol}</th>
                    <th className="p-4 text-right pr-5">{t.perkCol}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-xs md:text-sm text-slate-300">
                  {defaultLevels.map((lvl) => (
                    <tr key={lvl.level} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="p-4 pl-5 font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        {lvl.title}
                        {lvl.level === 5 && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-400 font-extrabold px-1.5 py-0.5 rounded border border-amber-500/30 uppercase">
                            VIP
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center font-semibold text-slate-400">
                        {lvl.approved === 0 ? "0 (Start)" : `${lvl.approved}+`}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-extrabold border border-emerald-500/20">
                          ৳{lvl.rate}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 font-extrabold border border-amber-500/20">
                          ৳{lvl.old_rate}
                        </span>
                      </td>
                      <td className="p-4 text-right pr-5 text-xs text-slate-400 font-medium group-hover:text-slate-200 transition-colors">
                        {lvl.perkDescription}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3. How to Sell Gmail for bKash Payment? 3 Steps */}
        <div className="space-y-5 pt-2">
          <div className="space-y-1">
            <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              {t.stepsTitle}
            </h2>
            <p className="text-[11px] md:text-xs text-slate-400">
              {t.stepsSub}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-850 hover:border-slate-800 transition-all duration-300 space-y-3 shadow-xl relative group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xs flex items-center justify-center shadow-lg shadow-indigo-600/10 group-hover:scale-105 transition-transform duration-300">1</div>
              <h4 className="text-sm font-extrabold text-white">{t.step1Title}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {t.step1Desc}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-850 hover:border-slate-800 transition-all duration-300 space-y-3 shadow-xl relative group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xs flex items-center justify-center shadow-lg shadow-indigo-600/10 group-hover:scale-105 transition-transform duration-300">2</div>
              <h4 className="text-sm font-extrabold text-white">{t.step2Title}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {t.step2Desc}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-850 hover:border-slate-800 transition-all duration-300 space-y-3 shadow-xl relative group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xs flex items-center justify-center shadow-lg shadow-indigo-600/10 group-hover:scale-105 transition-transform duration-300">3</div>
              <h4 className="text-sm font-extrabold text-white">{t.step3Title}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {t.step3Desc}
              </p>
            </div>
          </div>
        </div>

        {/* 4. Safety Guarantee banner */}
        <div className="relative overflow-hidden p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm md:text-base font-black text-white flex items-center gap-2">
                {t.safetyTitle}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t.safetyDesc}
              </p>
            </div>
          </div>
        </div>

        {/* 5. SEO / Semantic Content Block */}
        <div className="prose prose-invert max-w-none text-xs text-slate-400 space-y-4 border-t border-slate-900 pt-6">
          <h3 className="text-sm font-extrabold text-slate-200">Where to Sell Old Gmail Accounts for Money in Bangladesh?</h3>
          <p className="leading-relaxed">
            Mail Factory (mailfactory.top) is widely recognized as the premier destination for bulk Gmail sellers in Bangladesh. We purchase fresh PVA accounts, old aged accounts (dating back from 2010 to 2022), and verified channels. Unlike unverified Facebook group buyers, we guarantee safe instant payouts with no middleman risk. If you have been searching online with queries like <strong>gmail bikri korbo</strong>, <strong>puran gmail bikri</strong>, or <strong>gmail accounts kinbo</strong>, your search ends here. Talk to our 24/7 dedicated agents over WhatsApp to audit your accounts and secure maximum payout immediately.
          </p>
        </div>

        {/* 6. FAQ Section */}
        <div className="space-y-5">
          <h3 className="text-base md:text-lg font-black text-white flex items-center gap-2 border-b border-slate-900 pb-2">
            <span className="w-1 h-5 bg-indigo-500 rounded-full" />
            {isBn ? "প্রশ্ন ও উত্তর (FAQ)" : "Frequently Asked Questions"}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                {isBn ? "পেমেন্ট পেতে কত সময় লাগে?" : "How fast is the payment?"}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isBn ? "জিমেইল চেক শেষ হওয়ার মাত্র ২ ঘণ্টার মধ্যে বিকাশ, নগদ বা রকেটে পেমেন্ট করা হয়।" : "Within 2 hours of audit clearance via bKash, Nagad, or Rocket."}
              </p>
            </div>

            <div className="p-4.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                {isBn ? "কোন ধরনের জিমেইল কেনা হয় না?" : "Which accounts are not accepted?"}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isBn ? "আমরা একদম নতুন (২০২৩-২০২৬) জিমেইল অথবা যেগুলোতে রিকভারি ইমেইল যুক্ত নেই তা গ্রহণ করি না।" : "We do not buy unverified/freshly created 2023-2026 accounts without recovery setups."}
              </p>
            </div>

            <div className="p-4.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                {isBn ? "আমার তথ্য কি নিরাপদ থাকবে?" : "Is my security guaranteed?"}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isBn ? "হ্যাঁ, আমরা প্রতিটি অ্যাকাউন্ট কেনার পরেই সম্পূর্ণ ডাটা ওয়াইপ ও ফ্যাক্টরি রিসেট করে নিই।" : "Yes, we factory-wipe and clean all sessions immediately upon transfer."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
