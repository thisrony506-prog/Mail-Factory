export type GmailType = 'new' | 'old';

export type SubmissionStatus = 'pending' | 'checking' | 'approved' | 'rejected';

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
  username: string;
  submittedAt: number;
  status: SubmissionStatus;
  gmailsType?: GmailType;
  gmails: GmailItem[];
  totalAmount: number;
  rate: number;
  count: number;
  commission_percent?: number;
}

export interface WithdrawRequest {
  id?: string;
  key?: string;
  userId: string;
  username: string;
  amount: number;
  method: string;
  paymentMethod: string;
  paymentNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: number;
  processedAt?: number;
  transactionNote?: string;
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
  last_login: number;
  last_login_date?: string;
  login_streak: number;
  device?: string;
  forceLogout?: boolean;
  total_submitted: number;
  total_withdrawn: number;
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

export type ActiveTab = 'home' | 'exchange' | 'history' | 'sellers' | 'profile';

export type Language = 'bn' | 'en';
