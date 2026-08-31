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

  React.useEffect(() => {
    const handleUrlAndHashCheck = () => {
      const path = window.location.pathname;
      if (path === '/buy-gmail-accounts' || path === '/buy-gmail-accounts/') {
        setActiveTab('buy-gmail-accounts');
      } else if (
        path === '/sell-old-gmail-accounts' || 
        path === '/sell-old-gmail-accounts/' ||
        path === '/sell-gmail-accounts' || 
        path === '/sell-gmail-accounts/'
      ) {
        setActiveTab('sell-old-gmail-accounts');
      } else if (window.location.hash.startsWith('#verify')) {
        setActiveTab('id_card');
      }
    };
    handleUrlAndHashCheck();
    window.addEventListener('hashchange', handleUrlAndHashCheck);
    window.addEventListener('popstate', handleUrlAndHashCheck);
    return () => {
      window.removeEventListener('hashchange', handleUrlAndHashCheck);
      window.removeEventListener('popstate', handleUrlAndHashCheck);
    };
  }, [setActiveTab]);

  React.useEffect(() => {
    const path = window.location.pathname;
    if (activeTab === 'buy-gmail-accounts') {
      if (path !== '/buy-gmail-accounts' && path !== '/buy-gmail-accounts/') {
        window.history.pushState(null, '', '/buy-gmail-accounts/');
      }
    } else if (activeTab === 'sell-old-gmail-accounts') {
      if (path !== '/sell-gmail-accounts' && path !== '/sell-gmail-accounts/') {
        window.history.pushState(null, '', '/sell-gmail-accounts/');
      }
    } else {
      if (
        path === '/buy-gmail-accounts' || 
        path === '/buy-gmail-accounts/' ||
        path === '/sell-old-gmail-accounts' ||
        path === '/sell-old-gmail-accounts/' ||
        path === '/sell-gmail-accounts' ||
        path === '/sell-gmail-accounts/'
      ) {
        window.history.pushState(null, '', '/');
      }
    }
  }, [activeTab]);

  // Clear any legacy pending_checkout key from storage
  React.useEffect(() => {
    try {
      localStorage.removeItem('pending_checkout');
    } catch {}
  }, []);

  // If user is not logged in, support public routes or render the Guest Landing / Welcome Page
  if (!user) {
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
                  onClick={() => setAuthModalOpen(true, 'login')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'লগইন' : 'Login'}
                </button>
                <button
                  onClick={() => setAuthModalOpen(true, 'register')}
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
