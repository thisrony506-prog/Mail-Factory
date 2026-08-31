import React from 'react';
import { useApp } from './AppContext';
import { SEO } from './SEO';
import { ShieldCheck, MessageCircle, ArrowRight, HelpCircle, Award, CheckCircle2, BadgeDollarSign, HeartHandshake } from 'lucide-react';

export const SellGmailSEOView: React.FC = () => {
  const { language, setActiveTab } = useApp();
  const isBn = language === 'bn';

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
          "text": "2010-2015 Gmail price is 80-150 BDT, 2016-2019 is 40-70 BDT."
        }
      }
    ]
  };

  const handleContactWhatsApp = () => {
    window.open('https://wa.me/8801700000000?text=Hello%20Mail%20Factory,%20I%20want%20to%20sell%20my%20old%20Gmail%20accounts.', '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 md:px-8 animate-fade-in">
      <SEO 
        title="Sell Old Gmail Accounts for Money - Best Price BD | Mail Factory"
        description="Sell old Gmail accounts for money in BD. Best price for 2010-2024 Gmail. Instant bKash, Nagad, PayPal payment in 2 hours. 100% safe & trusted."
        url="https://mailfactory.top/sell-old-gmail-accounts/"
        schemaData={faqSchema}
      />

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Banner Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 p-8 md:p-12 text-center space-y-6 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.06),transparent_50%)]" />
          
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-2 text-xs">
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
          
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
            Sell Your Old Gmail Accounts for Instant Cash - Best Price in BD
          </h1>
          
          <div className="prose prose-invert max-w-3xl mx-auto">
            <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed">
              Want to <strong className="text-white font-black">sell old gmail accounts for money</strong>? Mail Factory buys your old Gmail at best price in Bangladesh. If you search <strong className="text-white font-black">gmail bikri korbo</strong> or <strong className="text-white font-black">puran gmail bikri</strong>, we are the trusted buyer. We pay instant bKash, Nagad, PayPal. Your data 100% safe - we delete everything after buying.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <button
              onClick={handleContactWhatsApp}
              className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-sm font-black text-white shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
              <span>{isBn ? 'হোয়াটসঅ্যাপে জিমেইল বিক্রি করুন' : 'Sell via WhatsApp Now'}</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setActiveTab('buyer_market')}
              className="px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-sm font-extrabold text-white transition-all border border-slate-700 cursor-pointer"
            >
              {isBn ? 'বাজার দর চেক করুন' : 'View Market Rates'}
            </button>
          </div>
        </div>

        {/* H2: Where to Sell Old Gmail Accounts for Money? */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5 border-b border-slate-800 pb-2">
            <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
            Where to Sell Old Gmail Accounts for Money?
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            <strong className="text-white">Mail Factory is the best place to sell gmail accounts in BD.</strong> We have bought 5000+ old Gmail since 2022. We give highest price and pay within 2 hours. No scam, no waiting.
          </p>
        </div>

        {/* H2: Old Gmail Price in Bangladesh 2026 */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5 border-b border-slate-800 pb-2">
            <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
            Old Gmail Price in Bangladesh 2026
          </h2>
          
          <div className="overflow-x-auto rounded-2xl border border-slate-700/60 shadow-xl">
            <table className="w-full text-left border-collapse bg-slate-800/40">
              <thead>
                <tr className="bg-slate-800 border-b border-slate-700 text-xs font-black uppercase text-slate-300 tracking-wider">
                  <th className="p-4">Gmail Age</th>
                  <th className="p-4">Price BDT</th>
                  <th className="p-4">Price USD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-xs md:text-sm text-slate-300">
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-bold text-white">2010-2015 Gmail</td>
                  <td className="p-4 font-extrabold text-emerald-400">৳800 - 1500</td>
                  <td className="p-4 font-bold text-indigo-300">$8 - $15</td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-bold text-white">2016-2019 Gmail</td>
                  <td className="p-4 font-extrabold text-emerald-400">৳400 - 700</td>
                  <td className="p-4 font-bold text-indigo-300">$4 - $7</td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-bold text-white">2020-2022 Gmail</td>
                  <td className="p-4 font-extrabold text-emerald-400">৳250 - 400</td>
                  <td className="p-4 font-bold text-indigo-300">$2.5 - $4</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* H2: How to Sell Gmail for bKash Payment? 3 Steps */}
        <div className="space-y-6">
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5 border-b border-slate-800 pb-2">
            <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
            How to Sell Gmail for bKash Payment? 3 Steps
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md">1</div>
              <h4 className="text-sm font-extrabold text-white">Step 1: Contact Support</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                WhatsApp us Gmail screenshot (age must be visible) to calculate your rates.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md">2</div>
              <h4 className="text-sm font-extrabold text-white">Step 2: Get Price</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                We tell you price in 5 mins based on current market demands.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md">3</div>
              <h4 className="text-sm font-extrabold text-white">Step 3: Get Paid</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Send Gmail access &gt; Get bKash/Nagad/PayPal payment in 2 hours.
              </p>
            </div>
          </div>
        </div>

        {/* H2: Is it Safe to Sell Gmail? */}
        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 space-y-4">
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5">
            <HeartHandshake className="w-6 h-6 text-indigo-400 shrink-0" />
            Is it Safe to Sell Gmail?
          </h2>
          <div className="space-y-3 text-slate-300 text-xs md:text-sm leading-relaxed">
            <p>
              Yes, 100% safe at Mail Factory. We delete all personal data, photos, emails after purchase. We never misuse. Trusted by 1000+ sellers in BD. We only need old Gmail for business marketing trust.
            </p>
          </div>
        </div>

        {/* H2: FAQ - Sell Gmail */}
        <div className="space-y-6">
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5 border-b border-slate-800 pb-2">
            <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
            FAQ - Sell Gmail
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-2">
              <h4 className="text-xs md:text-sm font-black text-indigo-300 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 shrink-0 text-indigo-400" />
                How fast payment?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Within 2 hours via bKash/Nagad/USDT BEP20.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-2">
              <h4 className="text-xs md:text-sm font-black text-indigo-300 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 shrink-0 text-indigo-400" />
                Which Gmail you don't buy?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                We don't buy new Gmail (2023-2026) or no recovery added Gmail.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-2">
              <h4 className="text-xs md:text-sm font-black text-indigo-300 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 shrink-0 text-indigo-400" />
                Is my data safe?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Yes, 100% safe. We factory reset after buying.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
