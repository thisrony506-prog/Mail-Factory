export type GmailType = 'new' | 'old';

export type SubmissionStatus = 'pending' | 'checking' | 'approved' | 'rejected';

export function normalizeSubmissionStatus(status?: string | null): SubmissionStatus {
  if (!status) return 'pending';
  const s = String(status).trim().toLowerCase().replace(/[\s_-]+/g, '');
  if (['approved', 'approve', 'completed', 'complete', 'success', 'passed', 'accepted'].includes(s)) {
    return 'approved';
  }
  if (['rejected', 'reject', 'declined', 'decline', 'failed', 'fail', 'cancelled', 'canceled'].includes(s)) {
    return 'rejected';
  }
  if ([
    'checking',
    'check',
    'reviewing',
    'review',
    'inprogress',
    'audit',
    'auditing',
    'underreview',
    'processing',
    'verifying',
    'verification',
    'testing',
    'working'
  ].includes(s)) {
    return 'checking';
  }
  return 'pending';
}

export interface GmailItem {
  email: string;
  password: string;
  recoveryEmail?: string;
  status?: SubmissionStatus;
  note?: string;
}

export interface Submission {
  id?: string;
  key?: string;
  userId: string;
  userEmail?: string;
  username: string;
  submittedAt: number;
  status: SubmissionStatus;
  gmailsType?: GmailType;
  gmails: GmailItem[];
  totalAmount: number;
  rate: number;
  count: number;
  commission_percent?: number;
  processedForBalance?: boolean;
  balanceCredited?: boolean;
  creditedAmount?: number;
  approvedCount?: number;
  rejectedCount?: number;
  notifiedChecking?: boolean;
  rejectReason?: string;
  rejectionReason?: string;
  reason?: string;
  adminNote?: string;
  note?: string;
}

export interface WithdrawRequest {
  id?: string;
  key?: string;
  userId: string;
  username: string;
  amount: number;
  feeAmount?: number;
  netAmount?: number;
  method: string;
  paymentMethod: string;
  paymentNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: number;
  processedAt?: number;
  transactionNote?: string;
  trxId?: string;
  rejectReason?: string;
  rejectionReason?: string;
  reason?: string;
  adminNote?: string;
  processedForBalance?: boolean;
  notifiedChecking?: boolean;
}

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  phone?: string;
  photoURL?: string;
  balance: number;
  hold: number;
  paymentNumber?: string;
  paymentMethod?: string;
  createdAt: number;
  referralCode: string;
  referredBy?: string;
  referralEarnings: number;
  creditedReferralEarnings?: number;
  lastProcessedRefEarnings?: number;
  referralBalanceSynced?: boolean;
  last_login: number;
  last_login_date?: string;
  login_streak: number;
  device?: string;
  forceLogout?: boolean;
  total_submitted: number;
  total_withdrawn: number;
  totalEarnings?: number;
  auth_provider?: string;
  manual_approved_count?: number;
  is_blocked?: boolean;
  isTopSeller?: boolean;
  admin_message?: string;
}

export interface LevelConfig {
  level: number;
  approved: number;
  rate: number;
  old_rate: number;
  title?: string;
  perkDescription?: string;
}

export interface ShiftInfo {
  title: string;
  time: string;
  active: boolean;
  order?: number;
  icon?: string;
}

export interface PaymentMethodConfig {
  name: string;
  icon: string;
  color: string;
  active: boolean;
  minWithdraw?: number;
  feePercent?: number;
}

export interface AppNotification {
  id: number | string;
  title: string;
  desc: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  read: boolean;
  time: string;
  timestamp: number;
}

export interface ChatMessage {
  id?: string;
  uid?: string;
  username?: string;
  message: string;
  timestamp: number;
  from: 'user' | 'bot' | 'admin';
  read?: boolean;
}

export interface FAQItem {
  q: string;
  a: string;
  category?: string;
}



export type ActiveTab =
  | 'home'
  | 'exchange'
  | 'history'
  | 'sellers'
  | 'profile'
  | 'withdraw'
  | 'privacy'
  | 'about'
  | 'reviews'
  | 'settings'
  | 'referral_leaderboard'
  | 'change_password'
  | 'edit_profile'
  | 'id_card'
  | 'faq'
  | 'contact';
export type Language = 'bn' | 'en';

export interface TopSellerItem {
  uid: string;
  username: string;
  email?: string;
  photoURL?: string;
  totalEarnings: number;
  balance?: number;
  total_submitted?: number;
  manual_approved_count?: number;
  total_withdrawn?: number;
  badge?: string;
  rank?: number;
}

export interface Review {
  id: string; // Document ID (usually same as userId)
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number; // 1-5
  text: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  updatedAt: number;
  isVerified?: boolean;
}

export const isExcludedSeller = (username?: string, email?: string, uid?: string): boolean => {
  if (uid && (uid.startsWith('seller_') || uid.startsWith('test_'))) return true;
  const name = (username || '').toLowerCase().trim();
  const mail = (email || '').toLowerCase().trim();

  if (!name && !mail) return true;
  if (name.startsWith('seller ')) return true;

  // Filter out unwanted / test names requested by user
  const excludedPatterns = [
    'rony',
    'gm rony',
    'gmrony',
    'gmrony135',
    'fftt',
    'ffty',
    'fft',
    'rifat',
    'rifat xx',
    'tanvir hossain',
    'shakil ahmed',
    'test',
    'demo',
    'admin',
  ];

  return excludedPatterns.some(
    (pattern) =>
      name === pattern ||
      name.includes(pattern) ||
      mail.startsWith(pattern) ||
      mail.includes(pattern)
  );
};

