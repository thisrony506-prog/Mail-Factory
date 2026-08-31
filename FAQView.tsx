import React, { useState } from 'react';
import { useApp } from './AppContext';
import { HelpCircle, ArrowLeft, ChevronDown } from 'lucide-react';
import { FAQItem } from './types';

export const FAQView: React.FC = () => {
  const { language, setActiveTab } = useApp();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
    <div className="max-w-xl mx-auto pb-24 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-b-3xl shadow-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('profile')}
            className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight">
              {language === 'bn' ? 'জিজ্ঞাসিত প্রশ্নোত্তর' : 'Frequently Asked Questions'}
            </h1>
            <p className="text-blue-100 text-xs font-medium">
              {language === 'bn' ? 'সাধারণ প্রশ্নাবলী ও সমাধান' : 'Common questions & resolutions'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 mt-2 space-y-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <HelpCircle className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-3">
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
                    className="w-full p-4 text-left flex items-center justify-between text-xs font-black text-slate-800 hover:bg-slate-100/60 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpenItem ? 'rotate-180 text-indigo-600' : ''
                      }`}
                    />
                  </button>
                  {isOpenItem && (
                    <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
