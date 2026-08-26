import React, { useState, Suspense, lazy } from 'react';
import './logoPreload';
import { AppProvider, useApp } from './AppContext';
import { Navbar } from './Navbar';
import { ViewSkeleton } from './ViewSkeleton';
import { PWAInstallPrompt } from './PWAInstallPrompt';

import { HomeView } from './HomeView';
import { GuestLandingView } from './GuestLandingView';

import { MessageSquare, Bell } from 'lucide-react';

// Resilient dynamic import helper with auto-retry on network drop or new deployment
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(() =>
    factory().catch((error) => {
      console.warn('[Chunk Load Warning] Retrying dynamic import...', error);
      return new Promise<{ default: T }>((resolve, reject) => {
        setTimeout(() => {
          factory().then(resolve).catch(reject);
        }, 1000);
      });
    })
  );
}

// Code-split / Lazy load non-critical views and heavy modules for instant page load
const ExchangeView = lazyWithRetry(() => import('./ExchangeView').then(m => ({ default: m.ExchangeView })));
const HistoryView = lazyWithRetry(() => import('./HistoryView').then(m => ({ default: m.HistoryView })));
const SellersView = lazyWithRetry(() => import('./SellersView').then(m => ({ default: m.SellersView })));
const ProfileView = lazyWithRetry(() => import('./ProfileView').then(m => ({ default: m.ProfileView })));
const WithdrawView = lazyWithRetry(() => import('./WithdrawView').then(m => ({ default: m.WithdrawView })));
const PrivacyView = lazyWithRetry(() => import('./PrivacyView').then(m => ({ default: m.PrivacyView })));
const AboutView = lazyWithRetry(() => import('./AboutView').then(m => ({ default: m.AboutView })));
const ReviewsView = lazyWithRetry(() => import('./ReviewsView').then(m => ({ default: m.ReviewsView })));
const SettingsView = lazyWithRetry(() => import('./SettingsView').then(m => ({ default: m.SettingsView })));
const ChangePasswordView = lazyWithRetry(() => import('./ChangePasswordView').then(m => ({ default: m.ChangePasswordView })));
const EditProfileView = lazyWithRetry(() => import('./EditProfileView').then(m => ({ default: m.EditProfileView })));
const MemberIdCardView = lazyWithRetry(() => import('./MemberIdCardView').then(m => ({ default: m.MemberIdCardView })));
const ReferralLeaderboard = lazyWithRetry(() => import('./ReferralLeaderboard').then(m => ({ default: m.ReferralLeaderboard })));
const LiveChatDrawer = lazyWithRetry(() => import('./LiveChatDrawer').then(m => ({ default: m.LiveChatDrawer })));
const NotificationDrawer = lazyWithRetry(() => import('./NotificationDrawer').then(m => ({ default: m.NotificationDrawer })));
const AuthModal = lazyWithRetry(() => import('./AuthModal').then(m => ({ default: m.AuthModal })));

const FAQModal = lazyWithRetry(() => import('./Modals').then(m => ({ default: m.FAQModal })));
const ContactModal = lazyWithRetry(() => import('./Modals').then(m => ({ default: m.ContactModal })));
const RateAppModal = lazyWithRetry(() => import('./Modals').then(m => ({ default: m.RateAppModal })));

const GlobalSMSPopup = lazyWithRetry(() => import('./GlobalSMSPopup').then(m => ({ default: m.GlobalSMSPopup })));
const FCMSetup = lazyWithRetry(() => import('./FCMSetup').then(m => ({ default: m.FCMSetup })));

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
  } = useApp();

  const [isFAQOpen, setIsFAQOpen] = useState<boolean>(false);
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);

  React.useEffect(() => {
    const handleHashCheck = () => {
      if (window.location.hash.startsWith('#verify')) {
        setActiveTab('id_card');
      }
    };
    handleHashCheck();
    window.addEventListener('hashchange', handleHashCheck);
    return () => window.removeEventListener('hashchange', handleHashCheck);
  }, [setActiveTab]);

  // Preload key routes in idle background time for instantaneous tab switching without lag
  React.useEffect(() => {
    const preloadViews = () => {
      import('./ExchangeView');
      import('./HistoryView');
      import('./SellersView');
      import('./ProfileView');
      import('./WithdrawView');
      import('./ReferralLeaderboard');
    };

    if ('requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number })
        .requestIdleCallback(preloadViews, { timeout: 3000 });
    } else {
      const timer = setTimeout(preloadViews, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // If user is not logged in, support public routes or render the Guest Landing / Welcome Page
  if (!user) {
    const isPublicTab =
      activeTab === 'about' ||
      activeTab === 'privacy' ||
      activeTab === 'reviews' ||
      activeTab === 'sellers' ||
      activeTab === 'id_card';

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

            <main className="flex-1 max-w-4xl w-full mx-auto p-4">
              <Suspense fallback={<ViewSkeleton />}>
                {activeTab === 'reviews' && <ReviewsView />}
                {activeTab === 'sellers' && <SellersView />}
                {activeTab === 'about' && <AboutView />}
                {activeTab === 'privacy' && <PrivacyView />}
                {activeTab === 'id_card' && <MemberIdCardView onBack={() => setActiveTab('home')} />}
              </Suspense>
            </main>
          </div>
        ) : (
          <Suspense fallback={<ViewSkeleton />}><GuestLandingView /></Suspense>
        )}
        <Suspense fallback={null}>
          <AuthModal />
          <LiveChatDrawer />
          <FAQModal
            isOpen={isFAQOpen || activeTab === 'faq'}
            onClose={() => {
              setIsFAQOpen(false);
              if (activeTab === 'faq') setActiveTab('home');
            }}
          />
          <ContactModal
            isOpen={isContactOpen || activeTab === 'contact'}
            onClose={() => {
              setIsContactOpen(false);
              if (activeTab === 'contact') setActiveTab('home');
            }}
          />
        </Suspense>
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
        <Suspense fallback={<ViewSkeleton />}>
          {activeTab === 'home' && <HomeView />}
          {activeTab === 'exchange' && <ExchangeView />}
          {activeTab === 'history' && <HistoryView />}
          {activeTab === 'sellers' && <SellersView />}
          {activeTab === 'privacy' && <PrivacyView />}
          {activeTab === 'about' && <AboutView />}
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
        </Suspense>
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

      {/* Global Modals and Drawers - lazy loaded to prevent rendering overhead */}
      <Suspense fallback={null}>
        <AuthModal />
        <LiveChatDrawer />
        <NotificationDrawer />

        <FAQModal
          isOpen={isFAQOpen || activeTab === 'faq'}
          onClose={() => {
            setIsFAQOpen(false);
            if (activeTab === 'faq') setActiveTab('home');
          }}
        />
        <ContactModal
          isOpen={isContactOpen || activeTab === 'contact'}
          onClose={() => {
            setIsContactOpen(false);
            if (activeTab === 'contact') setActiveTab('home');
          }}
        />
        <RateAppModal isOpen={isRateModalOpen} onClose={() => setRateModalOpen(false)} />
        <GlobalSMSPopup />
        { /* <FCMSetup /> */ }
      </Suspense>
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
