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

export function calculateFriendApprovedStats(
  friendOrUid: string | { uid: string; email?: string; totalEarnings?: number; balance?: number; manual_approved_count?: number; total_submitted?: number },
  allSubmissions: Submission[],
  manualApprovedCount: number = 0,
  fallbackRate: number = 15
): { approvedCount: number; approvedEarnings: number } {
  let approvedCount = 0;
  let approvedEarnings = 0;

  const friendUid = typeof friendOrUid === 'string' ? friendOrUid : friendOrUid?.uid;
  const friendEmail = typeof friendOrUid === 'object' && friendOrUid?.email ? friendOrUid.email.toLowerCase().trim() : '';
  const friendTotalEarnings = typeof friendOrUid === 'object' ? Number(friendOrUid?.totalEarnings) || 0 : 0;
  const friendManualCount = typeof friendOrUid === 'object' && friendOrUid?.manual_approved_count !== undefined
    ? Number(friendOrUid.manual_approved_count) || 0
    : Number(manualApprovedCount) || 0;

  const friendSubs = (allSubmissions || []).filter((sub) => {
    if (!sub) return false;
    if (friendUid && (sub.userId === friendUid || (sub as any).user_id === friendUid || (sub as any).uid === friendUid)) {
      return true;
    }
    if (friendEmail && sub.userEmail && sub.userEmail.toLowerCase().trim() === friendEmail) {
      return true;
    }
    return false;
  });

  if (friendSubs.length > 0) {
    let approvedCountFromSubs = 0;
    let approvedEarningsFromSubs = 0;

    friendSubs.forEach((sub) => {
      const parentStatus = normalizeSubmissionStatus(sub.status);
      const parentCount = Number(sub.count) || Number((sub as any).quantity) || (sub.gmails ? sub.gmails.length : 1);
      const parentTotal = Number(sub.totalAmount) || Number((sub as any).amount) || 0;
      const rate = Number(sub.rate) || (parentCount > 0 && parentTotal > 0 ? parentTotal / parentCount : fallbackRate);

      if (sub.gmails && Array.isArray(sub.gmails) && sub.gmails.length > 0) {
        let hasIndividualStatus = false;
        let sApprovedCount = 0;
        let sApprovedEarnings = 0;

        sub.gmails.forEach((g) => {
          if (g.status && g.status !== 'pending') {
            hasIndividualStatus = true;
            const gStatus = normalizeSubmissionStatus(g.status);
            if (gStatus === 'approved') {
              sApprovedCount += 1;
              const gRate = Number((g as any).rate) || rate;
              sApprovedEarnings += gRate;
            }
          }
        });

        if (hasIndividualStatus) {
          approvedCountFromSubs += sApprovedCount;
          approvedEarningsFromSubs += sApprovedEarnings;
        } else {
          if (parentStatus === 'approved') {
            const effectiveCount = sub.gmails.length || parentCount;
            approvedCountFromSubs += effectiveCount;
            approvedEarningsFromSubs += (parentTotal > 0 ? parentTotal : effectiveCount * rate);
          }
        }
      } else {
        if (parentStatus === 'approved') {
          approvedCountFromSubs += parentCount;
          approvedEarningsFromSubs += (parentTotal > 0 ? parentTotal : parentCount * rate);
        }
      }
    });

    if (approvedCountFromSubs > 0) {
      approvedCount = approvedCountFromSubs;
      approvedEarnings = approvedEarningsFromSubs;
    } else {
      // All submissions found were rejected or pending - zero approved
      approvedCount = 0;
      approvedEarnings = 0;
    }
  } else {
    // Only for legacy accounts without submission documents
    if (friendManualCount > 0) {
      approvedCount = friendManualCount;
      approvedEarnings = friendManualCount * fallbackRate;
    }
  }

  return {
    approvedCount,
    approvedEarnings: Number(approvedEarnings.toFixed(2)),
  };
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
  username?: string;
  userName?: string;
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
  username?: string;
  userName?: string;
  amount: number;
  feeAmount?: number;
  netAmount?: number;
  method?: string;
  paymentMethod?: string;
  paymentNumber?: string;
  senderNumber?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt?: number;
  createdAt?: number;
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
  username?: string;
  userName?: string;
  email: string;
  phone?: string;
  photoURL?: string;
  balance: number;
  deposit_balance?: number;
  reserved_balance?: number;
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
  total_spent?: number;
  auth_provider?: string;
  manual_approved_count?: number;
  is_blocked?: boolean;
  isTopSeller?: boolean;
  admin_message?: string;
  dailyBonusClaimedToday?: boolean;
  dailyBonusToday?: number;
  lastBonusDate?: number;
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
  title?: string;
  time?: string;
  active: boolean;
  order?: number;
  icon?: string;
  startTime?: number;
  start_time?: number;
  timer_started_at?: number;
  started_at?: number;
  startedAt?: number;
  hours?: number;
  duration_hours?: number;
  minutes?: number;
  duration_minutes?: number;
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

export interface PriceAlertSubscription {
  id: string;
  userId: string;
  userEmail?: string;
  accountType: 'fresh' | 'aged' | 'all';
  targetPrice?: number; // Alert when price reaches or drops below this
  direction?: 'any_change' | 'price_drop' | 'target_or_below';
  createdAt: number;
  lastNotifiedPrice?: number;
  active: boolean;
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
  | 'contact'
  | 'buyer_market'
  | 'buyer_orders'
  | 'buyer_wallet'
  | 'buyer_deposit'
  | 'buyer_transactions'
  | 'buyer_policies';
export type Language = 'bn' | 'en';

export interface BuyerProduct {
  id: string;
  code?: string;
  sku?: string;
  title: string;
  titleBn?: string;
  category: 'fresh' | 'aged';
  price: number; // in BDT per unit
  oldPrice?: number;
  stock: number;
  rating: number;
  reviewsCount?: number;
  deliveryTime: string;
  deliveryTimeBn?: string;
  description: string;
  descriptionBn?: string;
  features: string[];
  featuresBn?: string[];
  badge?: string;
  badgeBn?: string;
  minQty: number;
  maxQty?: number;
}

export interface TopSellerItem {
  uid: string;
  username?: string;
  userName?: string;
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

export interface BuyerCredential {
  email: string;
  password: string;
  recoveryEmail?: string;
  gmail?: string; // alias for gmail field
}

export interface BuyerOrder {
  id?: string;
  key?: string;
  userId: string;
  userEmail?: string;
  username?: string;
  userName?: string;
  productId: string;
  productTitle: string;
  packageTitle?: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  amount: number;
  credentials?: BuyerCredential[];
  delivered_gmails?: Array<{ gmail: string; password: string; recoveryEmail?: string }>;
  deliveredAccounts?: Array<any>;
  downloadText?: string;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled' | 'failed' | 'refunded';
  deliveryData?: BuyerCredential[];
  createdAt: number;
  deliveredAt?: number;
  updatedAt?: number;
  adminNote?: string;
}

export interface DepositRequest {
  id?: string;
  key?: string;
  userId: string;
  userEmail?: string;
  username?: string;
  userName?: string;
  amount: number;
  method?: string;
  paymentMethod?: string;
  paymentNumber?: string;
  senderNumber?: string;
  trxId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt?: number;
  createdAt?: number;
  processedAt?: number;
  adminNote?: string;
  note?: string;
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

