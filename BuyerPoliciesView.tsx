import React, { useState } from 'react';
import { hapticFeedback } from './haptics';
import {
  FileText,
  ShieldCheck,
  RefreshCw,
  Lock,
  AlertCircle,
  HelpCircle,
  Clock,
  CheckCircle,
  Info,
  Scale,
  DollarSign
} from 'lucide-react';

export const BuyerPoliciesView: React.FC = () => {
  const sections = [
    { id: 'general', label: '1. General Terms', icon: FileText },
    { id: 'escrow', label: '2. Escrow & Reserved Balance', icon: DollarSign },
    { id: 'order', label: '3. Order & Delivery SLA', icon: Clock },
    { id: 'refund', label: '4. Refund & Replacement', icon: RefreshCw },
    { id: 'security', label: '5. Fraud Protection & Security', icon: Lock },
    { id: 'privacy', label: '6. Privacy & Confidentiality', icon: ShieldCheck },
  ];

  const [activeSection, setActiveSection] = useState('general');
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-in fade-in duration-500">
      {/* Policy Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 font-bold text-[11px] uppercase tracking-wider mb-3">
          <Scale className="w-3.5 h-3.5" />
          <span>Legal & Compliance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2 sm:mb-3">
          English Terms & Policies
        </h1>
        <p className="text-sm sm:text-base text-slate-500 font-medium">
          Last Updated: August 27, 2026 • Version 2.1 (Escrow Protected)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-4 bg-slate-50 border border-slate-100 p-3 rounded-2xl md:sticky md:top-24">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-3 mb-2">
            Document Chapters
          </p>
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => {
                    hapticFeedback.light();
                    setActiveSection(section.id);
                  }}
                  className={`w-full flex items-center gap-3 text-left px-4 py-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                    activeSection === section.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                      : 'hover:bg-slate-200/50 text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-100/60 space-y-2">
            <div className="flex items-center gap-2 text-amber-800">
              <Info className="w-4 h-4 shrink-0" />
              <span className="text-xs font-black uppercase tracking-wider">Escrow Notice</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-700 font-medium">
              Every purchase on our platform is protected by our automated Escrow system. Balance is only locked in reserved state during checkout, preventing any unauthorized deductions.
            </p>
          </div>
        </aside>

        {/* Content Panel */}
        <main className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-100/80 shadow-xs space-y-6">
          
          {activeSection === 'general' && (
            <section className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">1. General Terms of Use</h2>
              </div>
              
              <div className="prose prose-slate max-w-none text-slate-600 text-xs sm:text-sm leading-relaxed space-y-3 font-medium">
                <p>
                  Welcome to our marketplace. By registering an account, making deposits, or placing orders, you express full agreement with and consent to all statements in this policy document. If you disagree with any terms, you must immediately terminate service usage.
                </p>
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 space-y-1">
                  <p className="font-black text-xs uppercase tracking-wide flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Strict Age Restriction
                  </p>
                  <p className="text-xs font-semibold leading-relaxed">
                    Users under eighteen (18) years of age are strictly prohibited from creating accounts, selling, or buying on this platform. Verification checks are actively performed.
                  </p>
                </div>
                <p>
                  You are solely responsible for ensuring the legality of accessing our marketplace within your geographic jurisdiction. Any local regulatory or tax compliance must be independently managed.
                </p>
              </div>
            </section>
          )}

          {activeSection === 'escrow' && (
            <section className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">2. Escrow & Reserved Balance</h2>
              </div>
              
              <div className="prose prose-slate max-w-none text-slate-600 text-xs sm:text-sm leading-relaxed space-y-3 font-medium">
                <p className="text-slate-800 font-bold">
                  Our marketplace operates on a secure Escrow-model "Reserved Balance System" designed to maximize safety for both buyers and sellers.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <span className="text-[10px] uppercase font-black text-indigo-600 tracking-wider">Step 1: Funds Locked</span>
                    <p className="text-xs font-black text-slate-900">Order Placement (Pending State)</p>
                    <p className="text-[11px] leading-relaxed text-slate-500">
                      When you click "Buy Now" and place an order, the total amount is immediately transferred to your <strong className="text-slate-800">Reserved Balance</strong>. No money is deducted from your primary wallet balance, keeping it protected.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <span className="text-[10px] uppercase font-black text-emerald-600 tracking-wider">Step 2: Admin Approval</span>
                    <p className="text-xs font-black text-slate-900">Verification & Deduction</p>
                    <p className="text-[11px] leading-relaxed text-slate-500">
                      The amount remains safely locked in the Escrow holding state. Only after the administrator verifies and successfully approves the delivery of functional credentials is the amount deducted from your primary and reserved balance.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-indigo-900 space-y-1">
                  <p className="font-black text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-indigo-600" />
                    Strict Protection Guideline
                  </p>
                  <p className="text-xs font-semibold leading-relaxed">
                    Reserved funds cannot be used to place secondary concurrent orders. If an admin rejects or cancels your order, the reserved funds are instantly returned back to your available balance.
                  </p>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'order' && (
            <section className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Clock className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">3. Order Lifecycle & Delivery SLA</h2>
              </div>
              
              <div className="prose prose-slate max-w-none text-slate-600 text-xs sm:text-sm leading-relaxed space-y-3 font-medium">
                <p>
                  Our system aims to deliver the highest performance standards for account provisioning.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                  <li>
                    <strong className="text-slate-900">Standard Delivery Frame:</strong> The Administration guarantees the processing and delivery of Gmail account details within <span className="text-indigo-600 font-bold">24 Hours</span> of a confirmed transaction.
                  </li>
                  <li>
                    <strong className="text-slate-900">Sellers Payout Hold:</strong> Delivered credentials must meet quality parameters. Real-time logging ensures every account delivered corresponds perfectly with the selected packages.
                  </li>
                  <li>
                    <strong className="text-slate-900">Warranty and Claims:</strong> You have a <span className="text-rose-600 font-black">6-12h live warranty frame</span> from the exact delivery timestamp to report any invalid passwords, disabled accounts, or recovery mismatches.
                  </li>
                </ul>
              </div>
            </section>
          )}

          {activeSection === 'refund' && (
            <section className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">4. Refund & Replacement Policy</h2>
              </div>
              
              <div className="prose prose-slate max-w-none text-slate-600 text-xs sm:text-sm leading-relaxed space-y-3 font-medium">
                <p>
                  Refunds are issued strictly into your marketplace wallet balance when delivery requirements are unfulfilled.
                </p>
                <p className="font-bold text-slate-900">Refunds are guaranteed under these three conditions:</p>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-black flex items-center justify-center shrink-0">1</span>
                    <p className="text-xs text-slate-700 font-semibold leading-normal">
                      Failure to deliver order credentials within the 24-hour guarantee frame.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-black flex items-center justify-center shrink-0">2</span>
                    <p className="text-xs text-slate-700 font-semibold leading-normal">
                      Delivered credentials fail to login or are already disabled prior to delivery (screenshot/video proof of verification required).
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-black flex items-center justify-center shrink-0">3</span>
                    <p className="text-xs text-slate-700 font-semibold leading-normal">
                      Wrong product category delivered (e.g. fresh instead of aged, or recovery email missing where explicitly requested).
                    </p>
                  </div>
                </div>

                <p className="text-xs bg-indigo-50 p-4 rounded-xl text-indigo-950 font-semibold border border-indigo-100">
                  Approved refunds are credited back to your wallet available balance within 1 to 3 business days. Please open a support ticket with your transaction ID and proof attached.
                </p>
              </div>
            </section>
          )}

          {activeSection === 'security' && (
            <section className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">5. Fraud Protection & Security Guidelines</h2>
              </div>
              
              <div className="prose prose-slate max-w-none text-slate-600 text-xs sm:text-sm leading-relaxed space-y-3 font-medium">
                <p>
                  We employ rigorous server-side cryptographic verification and ledger controls to keep our community safe.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                  <li>
                    <strong className="text-slate-900">Zero-Tolerance:</strong> Any attempt to tamper with client-side pricing, wallet state values, or replay transaction hashes results in an instant and permanent account suspension.
                  </li>
                  <li>
                    <strong className="text-slate-900">Confidentiality:</strong> Never share your login credentials or active API keys with anybody. Our staff will never request your password under any situation.
                  </li>
                  <li>
                    <strong className="text-slate-900">Account Sharing:</strong> Sharing your buyer/seller account dashboard with third-parties to perform unauthorized bulk orders is prohibited.
                  </li>
                </ul>
              </div>
            </section>
          )}

          {activeSection === 'privacy' && (
            <section className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">6. Privacy & Confidentiality</h2>
              </div>
              
              <div className="prose prose-slate max-w-none text-slate-600 text-xs sm:text-sm leading-relaxed space-y-3 font-medium">
                <p>
                  Your information confidentiality is of paramount importance to our operations.
                </p>
                <p>
                  We store emails, hashed passwords, and order histories on secure Firestore databases. No sensitive banking/mobile account keys or personal identifiers are stored on our servers. 
                </p>
                <p className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-semibold">
                  We guarantee that your transaction patterns, purchase logs, and delivered Gmail lists will never be sold, leased, or shared with third-party tracking networks.
                </p>
              </div>
            </section>
          )}

          {/* Accept Agreement Box */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <label className="flex items-start gap-3.5 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={agreed}
                onChange={(e) => {
                  hapticFeedback.light();
                  setAgreed(e.target.checked);
                }}
                className="mt-1 h-5 w-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all shrink-0" 
              />
              <span className="text-slate-700 font-bold text-xs sm:text-sm select-none group-hover:text-slate-900 transition-colors">
                I have read and agree to follow all the specified English Terms, Escrow Guidelines, and Marketplace Policies.
              </span>
            </label>
          </div>
        </main>
      </div>

      {/* Trust & Help Contact Footer */}
      <footer className="mt-16 sm:mt-24 pt-8 border-t border-slate-200/60 text-center max-w-md mx-auto space-y-4">
        <div className="flex justify-center gap-2">
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-black uppercase tracking-wider">
            Safe Escrow Certified
          </span>
          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-black uppercase tracking-wider">
            24/7 SLA Support
          </span>
        </div>
        <div className="space-y-1 text-xs text-slate-400 font-medium">
          <p className="text-slate-600 font-bold">Need direct support or custom compliance questions?</p>
          <p>Official Team Email: <span className="text-slate-700 font-semibold select-all">mailfactorybd@gmail.com</span></p>
          <p>WhatsApp Ingress: <span className="text-slate-700 font-semibold select-all">+880 1964182265</span></p>
        </div>
      </footer>
    </div>
  );
};
