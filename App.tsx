import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/views/HomeView';
import { ExchangeView } from './components/views/ExchangeView';
import { HistoryView } from './components/views/HistoryView';
import { SellersView } from './components/views/SellersView';
import { ProfileView } from './components/views/ProfileView';
import { WithdrawModal } from './components/WithdrawModal';
import { LiveChatDrawer } from './components/LiveChatDrawer';
import { NotificationDrawer } from './components/NotificationDrawer';
import { AuthModal } from './components/AuthModal';
import {
  EditProfileModal,
  ChangePasswordModal,
  FAQModal,
  ContactModal,
  InfoModal,
} from './components/Modals';
import { IOSInstallGuideModal } from './components/IOSInstallGuideModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { MessageSquare, Bell } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    unreadNotifsCount,
    setChatDrawerOpen,
    setNotifDrawerOpen,
  } = useApp();

  const { showIOSGuide, closeIOSGuide } = usePWAInstall();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [isChangePassOpen, setIsChangePassOpen] = useState<boolean>(false);
  const [isFAQOpen, setIsFAQOpen] = useState<boolean>(false);
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'exchange' && <ExchangeView />}
        {activeTab === 'history' && <HistoryView />}
        {activeTab === 'sellers' && <SellersView />}
        {activeTab === 'profile' && (
          <ProfileView
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
            onOpenChangePass={() => setIsChangePassOpen(true)}
            onOpenFAQ={() => setIsFAQOpen(true)}
            onOpenContact={() => setIsContactOpen(true)}
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
            onOpenAbout={() => setIsAboutOpen(true)}
          />
        )}
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-20 right-4 z-30 flex flex-col gap-2.5">
        <button
          onClick={() => setChatDrawerOpen(true)}
          className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          title="Live Support Chat"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        <button
          onClick={() => setNotifDrawerOpen(true)}
          className="w-12 h-12 rounded-2xl bg-white text-slate-700 border-2 border-slate-200 shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform relative"
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
      <WithdrawModal />
      <LiveChatDrawer />
      <NotificationDrawer />
      <IOSInstallGuideModal isOpen={showIOSGuide} onClose={closeIOSGuide} />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
      <ChangePasswordModal
        isOpen={isChangePassOpen}
        onClose={() => setIsChangePassOpen(false)}
      />
      <FAQModal isOpen={isFAQOpen} onClose={() => setIsFAQOpen(false)} />
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

      <InfoModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        title="Privacy Policy & Security"
        content={
          <>
            <p>
              At <strong>Mail Factory</strong>, data confidentiality and account integrity are our highest priorities.
            </p>
            <p>
              • All account credentials submitted through our exchange system are encrypted and securely verified.
            </p>
            <p>
              • We strictly follow zero-data-leak policies. User personal information and payment wallets are never disclosed to third parties.
            </p>
            <p>
              • Users retain full control over their account history and can delete their profile data at any time.
            </p>
          </>
        }
      />

      <InfoModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        title="About Mail Factory"
        content={
          <div className="text-center space-y-2">
            <div className="font-black text-sm text-indigo-700">Mail Factory v3.2.0</div>
            <p className="text-xs text-slate-500">
              The premier trusted Gmail exchange and monetization network in Bangladesh. Designed for high throughput, automated batch verification, multi-tiered level rewards, and instant mobile payouts.
            </p>
            <div className="pt-2 text-[10px] text-slate-400 font-mono">
              © {new Date().getFullYear()} Mail Factory Team. All rights reserved.
            </div>
          </div>
        }
      />

      {/* Bottom Nav */}
      <BottomNav />
      <Analytics />
      <SpeedInsights />
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
