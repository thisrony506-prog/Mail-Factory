import React, { useState } from 'react';
import './logoPreload';
import { AppProvider, useApp } from './AppContext';
import { Navbar } from './Navbar';
import { ViewSkeleton } from './ViewSkeleton';
import { PWAInstallPrompt } from './PWAInstallPrompt';

import { HomeView } from './HomeView';
import { GuestLandingView } from './GuestLandingView';

import { MessageSquare, Bell } from 'lucide-react';

import { ExchangeView } from './ExchangeView';
import { HistoryView } from './HistoryView';
import { SellersView } from './SellersView';
import { ProfileView } from './ProfileView';
import { WithdrawView } from './WithdrawView';
import { PrivacyView } from './PrivacyView';
import { AboutView } from './AboutView';
import { ReviewsView } from './ReviewsView';
import { FAQView } from './FAQView';
import { ContactView } from './ContactView';
import { SettingsView } from './SettingsView';
import { ChangePasswordView } from './ChangePasswordView';
import { EditProfileView } from './EditProfileView';
import { MemberIdCardView } from './MemberIdCardView';
import { ReferralLeaderboard } from './ReferralLeaderboard';
import { BuyerMarketplaceView } from './BuyerMarketplaceView';
import { BuyerOrdersView } from './BuyerOrdersView';
import { BuyerWalletView } from './BuyerWalletView';
import { BuyerDepositView } from './BuyerDepositView';
import { BuyerTransactionsView } from './BuyerTransactionsView';
import { BuyerPoliciesView } from './BuyerPoliciesView';
import { LiveChatDrawer } from './LiveChatDrawer';
import { NotificationDrawer } from './NotificationDrawer';
import { AuthModal } from './AuthModal';
import { FAQModal, ContactModal, RateAppModal } from './Modals';
import { GlobalSMSPopup } from './GlobalSMSPopup';
import { FCMSetup } from './FCMSetup';
import { BuyGmailSEOView } from './BuyGmailSEOView';
import { SellGmailSEOView } from './SellGmailSEOView';
import { AuthPageView } from './AuthPageView';
import { SEO } from './SEO';

const MainLayout: React.FC = () => {
  const {
    user,
    loading,
    language,
    activeTab,
    setActiveTab,
    unreadNotifsCount,
    setChatDrawerOpen,
    setNotifDrawerOpen,
    isRateModalOpen,
    setRateModalOpen,
    setAuthModalOpen,
    profile,
    addNotification,
  } = useApp();

  const [isFAQOpen, setIsFAQOpen] = useState<boolean>(false);
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);

  // If user is already logged in and navigates to login or register page, redirect to home
  React.useEffect(() => {
    if (user && (activeTab === 'login' || activeTab === 'register')) {
      setActiveTab('home');
    }
  }, [user, activeTab, setActiveTab]);

  // Clear any legacy pending_checkout key from storage
  React.useEffect(() => {
    try {
      localStorage.removeItem('pending_checkout');
    } catch {}
  }, []);

  // Dynamic SEO configurations based on active tab
  const getTabSeo = () => {
    switch (activeTab) {
      case 'home':
        return {
          title: language === 'bn' 
            ? "মেইল ফ্যাক্টরি - সবচেয়ে বিশ্বস্ত জিমেইল এক্সচেঞ্জ প্ল্যাটফর্ম" 
            : "Mail Factory - BD's #1 Trusted Gmail Exchange Platform",
          description: language === 'bn'
            ? "আপনার নতুন বা পুরনো জিমেইল বিক্রি করে ২ ঘণ্টার মধ্যে বিকাশ, রকেট বা নগদে নিশ্চিত পেমেন্ট নিন। ১০০০+ সেলারদের প্রিয় প্ল্যাটফর্ম।"
            : "Sell your fresh or old Gmail accounts in Bangladesh. Get paid instantly within 2 hours via bKash, Nagad, or Rocket with full security.",
          url: "https://mailfactory.top/"
        };
      case 'login':
        return {
          title: language === 'bn' ? "লগইন - মেইল ফ্যাক্টরি" : "Login - Mail Factory | Sell & Buy Gmail BD",
          description: language === 'bn'
            ? "আপনার মেইল ফ্যাক্টরি অ্যাকাউন্টে লগইন করুন এবং জিমেইল সাবমিট করা শুরু করুন।"
            : "Log in to your Mail Factory account to submit Gmails, track approval status, and cashout.",
          url: "https://mailfactory.top/login"
        };
      case 'register':
        return {
          title: language === 'bn' ? "রেজিস্ট্রেশন - মেইল ফ্যাক্টরি" : "Register Account - Mail Factory | BD",
          description: language === 'bn'
            ? "ফ্রিতে অ্যাকাউন্ট খুলুন এবং জিমেইল অ্যাকাউন্ট বিক্রি করে আয় করা শুরু করুন।"
            : "Register for a free Mail Factory account. Start selling your Gmails with direct automated payouts.",
          url: "https://mailfactory.top/register"
        };
      case 'exchange':
        return {
          title: language === 'bn' ? "জিমেইল সাবমিট - মেইল ফ্যাক্টরি" : "Submit Gmails - Mail Factory Exchange",
          description: language === 'bn'
            ? "আপনার জিমেইল অ্যাকাউন্টগুলো নিরাপদে আমাদের কাছে সাবমিট করুন।"
            : "Submit your fresh or aged Gmail credentials safely for automated verification.",
          url: "https://mailfactory.top/exchange"
        };
      case 'history':
        return {
          title: language === 'bn' ? "সাবমিশন হিস্ট্রি - মেইল ফ্যাক্টরি" : "Submission History - Mail Factory",
          description: language === 'bn'
            ? "আপনার সাবমিট করা জিমেইল এবং উইথড্র স্ট্যাটাস রিয়েল-টাইমে চেক করুন।"
            : "Track your submitted accounts, audit logs, and transaction history in real-time.",
          url: "https://mailfactory.top/history"
        };
      case 'sellers':
        return {
          title: language === 'bn' ? "সেরা সেলারদের তালিকা - মেইল ফ্যাক্টরি" : "Top Sellers Leaderboard - Mail Factory",
          description: language === 'bn'
            ? "মেইল ফ্যাক্টরি লিডারবোর্ডের সেরা পারফর্মারদের তালিকা দেখুন।"
            : "View the highest earning VIP sellers and partners on the Mail Factory leaderboard.",
          url: "https://mailfactory.top/sellers"
        };
      case 'profile':
        return {
          title: language === 'bn' ? "আমার প্রোফাইল - মেইল ফ্যাক্টরি" : "My Profile - Mail Factory Seller Dashboard",
          description: language === 'bn'
            ? "আপনার প্রোফাইল পরিচালনা করুন এবং রেফারেল আর্নিং ট্র্যাক করুন।"
            : "Manage your seller profile, track your level VIP perks, and copy your referral link.",
          url: "https://mailfactory.top/profile"
        };
      case 'withdraw':
        return {
          title: language === 'bn' ? "উইথড্র ব্যালেন্স - মেইল ফ্যাক্টরি" : "Withdraw Earnings - Mail Factory Payout",
          description: language === 'bn'
            ? "বিকাশ, নগদ বা রকেটে মাত্র ২ ঘণ্টার মধ্যে আপনার অর্জিত টাকা ক্যাশআউট করুন।"
            : "Cashout your approved earnings to bKash, Nagad, or Rocket securely within 2 hours.",
          url: "https://mailfactory.top/withdraw"
        };
      case 'reviews':
        return {
          title: language === 'bn' ? "গ্রাহকদের রিভিউ ও রেটিং - মেইল ফ্যাক্টরি" : "User Reviews & Ratings - Mail Factory BD",
          description: language === 'bn'
            ? "আমাদের ১০০০+ বিশ্বস্ত গ্রাহকদের মতামত এবং কাজের অভিজ্ঞতা রিভিউ দেখুন।"
            : "Read honest feedback and performance reviews from real users of Mail Factory.",
          url: "https://mailfactory.top/reviews"
        };
      case 'about':
        return {
          title: language === 'bn' ? "আমাদের সম্পর্কে - মেইল ফ্যাক্টরি" : "About Us - Mail Factory | Gmail Broker BD",
          description: language === 'bn'
            ? "মেইল ফ্যাক্টরি এক্সচেঞ্জ প্ল্যাটফর্মের লক্ষ্য এবং নিরাপদ সেলিং ব্যবস্থা।"
            : "Learn about Mail Factory's secure digital assets brokerage and professional buying policies.",
          url: "https://mailfactory.top/about"
        };
      case 'privacy':
        return {
          title: language === 'bn' ? "প্রাইভেসি পলিসি - মেইল ফ্যাক্টরি" : "Privacy & Data Policy - Mail Factory",
          description: language === 'bn'
            ? "আপনার তথ্য সুরক্ষা আমাদের দ্বায়িত্ব। আমরা প্রতিটি মেইল কেনার পর ফ্যাক্টরি রিসেট করি।"
            : "Read how we strictly protect seller privacy and fully delete personal data from bought accounts.",
          url: "https://mailfactory.top/privacy"
        };
      case 'faq':
        return {
          title: language === 'bn' ? "সচরাচর জিজ্ঞাসিত প্রশ্ন - মেইল ফ্যাক্টরি" : "FAQ & Help Center - Mail Factory",
          description: language === 'bn'
            ? "পেমেন্ট স্পিড, জিমেইল টাইপ এবং অ্যাকাউন্ট সিকিউরিটি নিয়ে সকল প্রশ্নের উত্তর।"
            : "Get answers to key questions on Gmail requirements, payout speeds, and secure transfer guidelines.",
          url: "https://mailfactory.top/faq"
        };
      case 'contact':
        return {
          title: language === 'bn' ? "যোগাযোগ করুন - মেইল ফ্যাক্টরি সাপোর্ট" : "Contact Us 24/7 - Mail Factory Support",
          description: language === 'bn'
            ? "যেকোনো সাহায্য বা জিমেইল অডিটের জন্য আমাদের ২৪/৭ সাপোর্ট টিমের সাথে যোগাযোগ করুন।"
            : "Get in touch with Mail Factory customer support agents on WhatsApp or via live chat.",
          url: "https://mailfactory.top/contact"
        };
      case 'buyer_market':
        return {
          title: language === 'bn' ? "বায়ার মার্কেটপ্লেস - মেইল ফ্যাক্টরি" : "Buyer Marketplace - Buy Verified Gmails",
          description: language === 'bn'
            ? "মেইল ফ্যাক্টরি থেকে শতভাগ নিরাপদ এবং ভেরিফাইড জিমেইল পাইকারি দামে কিনুন।"
            : "Buy high quality bulk Gmails, PVA accounts, and aged verified channels at wholesale prices.",
          url: "https://mailfactory.top/buyer/market"
        };
      default:
        return null;
    }
  };

  const seoData = getTabSeo();

  // If user is not logged in, support public routes or render the Guest Landing / Welcome Page
  if (!user) {
    // Intercept full-screen Login / Register views first
    if (activeTab === 'login' || activeTab === 'register') {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
          {seoData && <SEO title={seoData.title} description={seoData.description} url={seoData.url} />}
          <AuthPageView
            initialMode={activeTab}
            onBackToLanding={() => setActiveTab('home')}
          />
          <LiveChatDrawer />
          <PWAInstallPrompt />
        </div>
      );
    }

    const isPublicTab =
      activeTab === 'about' ||
      activeTab === 'privacy' ||
      activeTab === 'reviews' ||
      activeTab === 'sellers' ||
      activeTab === 'id_card' ||
      activeTab === 'buyer_market' ||
      activeTab === 'buyer_policies' ||
      activeTab === 'buyer_orders' ||
      activeTab === 'buyer_wallet' ||
      activeTab === 'buyer_deposit' ||
      activeTab === 'buyer_transactions' ||
      activeTab === 'faq' ||
      activeTab === 'contact' ||
      activeTab === 'buy-gmail-accounts' ||
      activeTab === 'sell-old-gmail-accounts';

    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        {seoData && <SEO title={seoData.title} description={seoData.description} url={seoData.url} />}
        {isPublicTab ? (
          <div className="flex-1 flex flex-col">
            <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
              <button
                onClick={() => setActiveTab('home')}
                className="flex items-center gap-2 text-white font-extrabold text-sm hover:text-indigo-400 transition-colors cursor-pointer"
              >
                ← {language === 'bn' ? 'হোমে ফিরে যান' : 'Back to Home'}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('login')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'লগইন' : 'Login'}
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-xs font-black text-white shadow-md transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'সাইন আপ' : 'Register'}
                </button>
              </div>
            </header>

            <main className="flex-1 max-w-4xl w-full mx-auto p-4 animate-fade-in">
              {activeTab === 'buy-gmail-accounts' && <BuyGmailSEOView />}
              {activeTab === 'sell-old-gmail-accounts' && <SellGmailSEOView />}
              {activeTab === 'reviews' && <ReviewsView />}
              {activeTab === 'sellers' && <SellersView />}
              {activeTab === 'about' && <AboutView />}
              {activeTab === 'privacy' && <PrivacyView />}
              {activeTab === 'faq' && <FAQView />}
              {activeTab === 'contact' && <ContactView />}
              {activeTab === 'buyer_market' && (
                <BuyerMarketplaceView
                  onOpenDeposit={() => setAuthModalOpen(true, 'login')}
                  onOpenOrders={() => setAuthModalOpen(true, 'login')}
                  onOpenWallet={() => setAuthModalOpen(true, 'login')}
                />
              )}
              {activeTab === 'buyer_orders' && <BuyerOrdersView />}
              {activeTab === 'buyer_wallet' && <BuyerWalletView />}
              {activeTab === 'buyer_deposit' && <BuyerDepositView />}
              {activeTab === 'buyer_transactions' && <BuyerTransactionsView />}
              {activeTab === 'buyer_policies' && <BuyerPoliciesView />}
              {activeTab === 'id_card' && <MemberIdCardView onBack={() => setActiveTab('home')} />}
            </main>
          </div>
        ) : (
          <GuestLandingView />
        )}
        <AuthModal />
        <LiveChatDrawer />
        <FAQModal
          isOpen={isFAQOpen}
          onClose={() => setIsFAQOpen(false)}
        />
        <ContactModal
          isOpen={isContactOpen}
          onClose={() => setIsContactOpen(false)}
        />
        <PWAInstallPrompt />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {seoData && <SEO title={seoData.title} description={seoData.description} url={seoData.url} />}
      {/* Top Navbar */}
      <Navbar
        onOpenEditProfile={() => setActiveTab('edit_profile')}
        onOpenChangePass={() => setActiveTab('change_password')}
        onOpenFAQ={() => setActiveTab('faq')}
        onOpenContact={() => setActiveTab('contact')}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-6">
        {activeTab === 'buy-gmail-accounts' && <BuyGmailSEOView />}
        {activeTab === 'sell-old-gmail-accounts' && <SellGmailSEOView />}
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'exchange' && <ExchangeView />}
        {activeTab === 'history' && <HistoryView />}
        {activeTab === 'sellers' && <SellersView />}
        {activeTab === 'privacy' && <PrivacyView />}
        {activeTab === 'about' && <AboutView />}
        {activeTab === 'faq' && <FAQView />}
        {activeTab === 'contact' && <ContactView />}
        {activeTab === 'buyer_market' && (
          <BuyerMarketplaceView
            onOpenDeposit={() => setActiveTab('buyer_deposit')}
            onOpenOrders={() => setActiveTab('buyer_orders')}
            onOpenWallet={() => setActiveTab('buyer_wallet')}
          />
        )}
        {activeTab === 'buyer_orders' && <BuyerOrdersView />}
        {activeTab === 'buyer_wallet' && <BuyerWalletView />}
        {activeTab === 'buyer_deposit' && <BuyerDepositView />}
        {activeTab === 'buyer_transactions' && <BuyerTransactionsView />}
        {activeTab === 'buyer_policies' && <BuyerPoliciesView />}
        {activeTab === 'profile' && (
          <ProfileView
            onOpenEditProfile={() => setActiveTab('edit_profile')}
            onOpenChangePass={() => setActiveTab('change_password')}
            onOpenFAQ={() => setActiveTab('faq')}
            onOpenContact={() => setActiveTab('contact')}
          />
        )}
        {activeTab === 'withdraw' && <WithdrawView />}
        {activeTab === 'reviews' && <ReviewsView />}
        {activeTab === 'referral_leaderboard' && <ReferralLeaderboard />}
        {activeTab === 'change_password' && <ChangePasswordView />}
        {activeTab === 'edit_profile' && <EditProfileView />}
        {activeTab === 'id_card' && <MemberIdCardView onBack={() => setActiveTab('profile')} />}
        {activeTab === 'settings' && (
          <SettingsView
            onOpenEditProfile={() => setActiveTab('edit_profile')}
            onOpenChangePass={() => setActiveTab('change_password')}
            onOpenFAQ={() => setActiveTab('faq')}
            onOpenContact={() => setActiveTab('contact')}
          />
        )}
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-4 z-30 flex flex-col gap-2.5">
        <button
          onClick={() => setChatDrawerOpen(true)}
          className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          title="Live Support Chat"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
        <button
          onClick={() => setNotifDrawerOpen(true)}
          className="w-12 h-12 rounded-2xl bg-white text-slate-700 border-2 border-slate-200 shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform relative cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          {unreadNotifsCount > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </button>
      </div>

      {/* Global Modals and Drawers */}
      <AuthModal />
      <LiveChatDrawer />
      <NotificationDrawer />

      <FAQModal
        isOpen={isFAQOpen}
        onClose={() => setIsFAQOpen(false)}
      />
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
      <RateAppModal isOpen={isRateModalOpen} onClose={() => setRateModalOpen(false)} />
      <GlobalSMSPopup />
      <PWAInstallPrompt />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
