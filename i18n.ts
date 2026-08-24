import { Language } from './types';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
];

export interface TranslationSchema {
  appName: string;
  slogan: string;
  trustedSafe: string;
  newGmail: string;
  oldGmail: string;
  startSelling: string;
  startExchange: string;
  activeBadge: string;
  levelRateTitle: string;
  chooseGmailType: string;
  whyChooseUs: string;
  fastPayment: string;
  safeData: string;
  support247: string;
  enterDetails: string;
  yourRate: string;
  addAnother: string;
  bulkPaste: string;
  bulkPasteTitle: string;
  estimatedEarnings: string;
  confirmSubmit: string;
  home: string;
  history: string;
  sellers: string;
  profile: string;
  submissions: string;
  withdraws: string;
  trending: string;
  mainBalance: string;
  holdBalance: string;
  withdraw: string;
  invite: string;
  dailyStreak: string;
  submissionStats: string;
  total: string;
  approved: string;
  pending: string;
  rejected: string;
  inviteAndEarn: string;
  commission: string;
  totalRefers: string;
  totalEarned: string;
  overview: string;
  myFriends: string;
  copy: string;
  shareReferral: string;
  account: string;
  editProfile: string;
  notifications: string;
  changePassword: string;
  logoutAll: string;
  support: string;
  liveChat: string;
  faq: string;
  contactUs: string;
  info: string;
  privacyPolicy: string;
  aboutUs: string;
  dangerZone: string;
  deleteAccount: string;
  logout: string;
  login: string;
  register: string;
  welcomeBack: string;
  orWithEmail: string;
  gmailAddress: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  forgotPass: string;
  noAccount: string;
  haveAccount: string;
  submitWithdraw: string;
  minWithdrawLabel: string;
  accountNumber: string;
  amount: string;
  selectPaymentMethod: string;
  liveReviewShifts: string;
  nextShiftIn: string;
  copySuccess: string;
  streakClaim: string;
  streakClaimed: string;
  selectLanguage: string;
  languageTitle: string;
  
  // Extended UI Keys
  homePage: string;
  submissionHistory: string;
  topSellersList: string;
  myProfile: string;
  back: string;
  save: string;
  saveChanges: string;
  edit: string;
  viewAll: string;
  loading: string;
  all: string;
  search: string;
  noData: string;
  status: string;
  checking: string;
  date: string;
  action: string;
  adminPanel: string;
  manageReviews: string;
  topSellersConfig: string;
  installApp: string;
  minTwoGmails: string;
  emailRequired: string;
  passRequired: string;
  invalidEmail: string;
  submitting: string;
  submissionSuccess: string;
  submissionSuccessDesc: string;
  viewHistory: string;
  submitMore: string;
  ratePerMail: string;
  withdrawDisabledAlert: string;
  insufficientBalance: string;
  enterValidAmount: string;
  withdrawSuccess: string;
  withdrawSuccessDesc: string;
  fee: string;
  netPayable: string;
  quickAdd: string;
  allBalance: string;
  vipLevelRewards: string;
  earningsChart: string;
  days7: string;
  days30: string;
  peakEarning: string;
  totalPeriod: string;
  currentLevelLabel: string;
  nextLevelTarget: string;
  approvedMailCount: string;
  memberSinceLabel: string;
  profileSettings: string;
  securitySettings: string;
  referralTitle: string;
  referralSubtitle: string;
  yourReferralLink: string;
  shareWithFriends: string;
  howItWorks: string;
  customerReviews: string;
  reviewsSubtitle: string;
  writeReview: string;
  rating: string;
  yourComment: string;
  submitReview: string;
  allReviews: string;
  verifiedSeller: string;
  settings: string;
  appPreferences: string;
  notificationsSetting: string;
  withdrawalAlerts: string;
  submissionAlerts: string;
  enterEmail: string;
  enterPassword: string;
  enterFullName: string;
  enterPhone: string;
  referralCodeOptional: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  updatePassword: string;
  passMismatch: string;
  faqTitle: string;
  contactTitle: string;
  telegramSupport: string;
  whatsappSupport: string;
  emailSupport: string;
  rateAppTitle: string;
  rateAppSubtitle: string;
  submitRating: string;
  thankYou: string;
  topSellersTitle: string;
  topSellersDesc: string;
  earnedTotal: string;
  successfulSubmissions: string;
  balanceConverter: string;
  balanceConverterDesc: string;
  perVerifiedAccount: string;
  perAgedAccount: string;
  startExchangeSubtitle: string;
  shiftReceive: string;
  shiftReport: string;
  directWithdrawMethods: string;
  holdBalanceNotice: string;
  dailyStreakBonusSub: string;
  streakBonusClaimedToday: string;
  ratePerTask: string;
  approvedJobsDone: string;
  taskPayout: string;
  auditProcessing: string;
  fastTrack: string;
  levelBadgePerk: string;
  vipVerified: string;
  workAnalyticsTitle: string;
  workAnalyticsSub: string;
  days: string;
  peakSingleEarn: string;
  earnedMoney: string;
  needWithdrawCash: string;
  fastPayoutMobile: string;
  liveTrendingTitle: string;
  liveTrendingSub: string;
  gmailListStatus: string;
  noSubmissionHistory: string;
  noSubmissionHistorySub: string;
  noWithdrawHistory: string;
  searchByEmail: string;
  memberIdCard: string;
  memberIdCardSubtitle: string;
  generalMember: string;
  verifiedMember: string;
  accountStatus: string;
  statusActive: string;
  joinDateLabel: string;
  userIdLabel: string;
  fullNameLabel: string;
  downloadCard: string;
  cardTheme: string;
  scanToVerify: string;
  verificationProof: string;
  verifiedSuccessNotice: string;
  generalMemberNotice: string;
  copyVerificationLink: string;
  verificationLinkCopied: string;
  officialIdBadge: string;
}

export const translations: Record<Language, TranslationSchema> = {
  bn: {
    appName: "Mail Factory",
    slogan: "★ বিশ্বস্ত ও দ্রুত এক্সচেঞ্জ ★",
    trustedSafe: "১০০% নিরাপদ : আমরা সততার সাথে বিশ্বস্ত সার্ভিস দিচ্ছি।",
    newGmail: "নতুন জিমেইল",
    oldGmail: "পুরাতন জিমেইল",
    startSelling: "জিমেইল বিক্রি শুরু করুন",
    startExchange: "লেনদেন শুরু করুন",
    activeBadge: "সক্রিয়",
    levelRateTitle: "লেভেল রেট",
    chooseGmailType: "জিমেইল টাইপ নির্বাচন করুন",
    whyChooseUs: "কেন আমাদের বেছে নিবেন?",
    fastPayment: "দ্রুত পেমেন্ট",
    safeData: "নিরাপদ ডাটা",
    support247: "২৪/৭ সাপোর্ট",
    enterDetails: "জিমেইল বিবরণ দিন",
    yourRate: "আপনার লেভেল রেট:",
    addAnother: "আরেকটি যোগ করুন",
    bulkPaste: "একসাথে পেস্ট করুন",
    bulkPasteTitle: "একসাথে অনেকগুলো পেস্ট করুন (Email:Password)",
    estimatedEarnings: "সম্ভাব্য মোট আয়",
    confirmSubmit: "কনফার্ম ও সাবমিট করুন",
    home: "হোম",
    history: "হিস্ট্রি",
    sellers: "টপ সেলার",
    profile: "প্রোফাইল",
    submissions: "সাবমিশন",
    withdraws: "উত্তোলন",
    trending: "ট্রেন্ডিং",
    mainBalance: "মেইন ব্যালেন্স",
    holdBalance: "হোল্ড ব্যালেন্স",
    withdraw: "উত্তোলন",
    invite: "রেফার",
    dailyStreak: "ডেইলি লগইন স্ট্রিক",
    submissionStats: "সাবমিশন স্ট্যাটস",
    total: "মোট",
    approved: "অনুমোদিত",
    pending: "পেন্ডিং",
    rejected: "বাতিল",
    inviteAndEarn: "আমন্ত্রণ জানান ও আয় করুন",
    commission: "কমিশন",
    totalRefers: "মোট রেফার",
    totalEarned: "মোট অর্জিত",
    overview: "ওভারভিউ",
    myFriends: "আমার বন্ধুরা",
    copy: "কপি",
    shareReferral: "রেফার লিংক শেয়ার করুন",
    account: "একাউন্ট",
    editProfile: "প্রোফাইল এডিট",
    notifications: "নোটিফিকেশন",
    changePassword: "পাসওয়ার্ড পরিবর্তন",
    logoutAll: "সকল ডিভাইস থেকে লগআউট",
    support: "সাপোর্ট",
    liveChat: "লাইভ চ্যাট সাপোর্ট",
    faq: "প্রশ্নোত্তর",
    contactUs: "যোগাযোগ",
    info: "তথ্য",
    privacyPolicy: "প্রাইভেসি পলিসি",
    aboutUs: "আমাদের সম্পর্কে",
    dangerZone: "ডেঞ্জার জোন",
    deleteAccount: "একাউন্ট মুছে ফেলুন",
    logout: "লগআউট",
    login: "লগইন",
    register: "রেজিস্ট্রেশন",
    welcomeBack: "স্বাগতম Mail Factory তে",
    orWithEmail: "অথবা ইমেইল দিয়ে",
    gmailAddress: "জিমেইল এড্রেস",
    password: "পাসওয়ার্ড",
    confirmPassword: "কনফার্ম পাসওয়ার্ড",
    fullName: "পুরো নাম",
    forgotPass: "পাসওয়ার্ড ভুলে গেছেন?",
    noAccount: "একাউন্ট নেই?",
    haveAccount: "আগে থেকেই একাউন্ট আছে?",
    submitWithdraw: "উত্তোলনের অনুরোধ পাঠান",
    minWithdrawLabel: "সর্বনিম্ন উত্তোলন:",
    accountNumber: "একাউন্ট নম্বর / ওয়ালেট",
    amount: "টাকার পরিমাণ",
    selectPaymentMethod: "পেমেন্ট মেথড সিলেক্ট করুন",
    liveReviewShifts: "লাইভ রিভিউ শিফট",
    nextShiftIn: "পরবর্তী রিভিউ শিফট বাকি:",
    copySuccess: "কপি হয়েছে!",
    streakClaim: "স্ট্রিক বোনাস গ্রহণ করুন 🔥",
    streakClaimed: "আজকের স্ট্রিক বোনাস গৃহীত!",
    selectLanguage: "ভাষা নির্বাচন করুন",
    languageTitle: "ভাষা এবং পছন্দসমূহ",

    // Extended UI Keys
    homePage: "হোম পেজ",
    submissionHistory: "কাজের হিস্ট্রি",
    topSellersList: "সেরা ১০ সেলারদের তালিকা",
    myProfile: "মাই প্রোফাইল",
    back: "ফিরে যান",
    save: "সংরক্ষণ করুন",
    saveChanges: "তথ্য সংরক্ষণ করুন",
    edit: "এডিট",
    viewAll: "সব দেখুন",
    loading: "লোড হচ্ছে...",
    all: "সকল",
    search: "অনুসন্ধান করুন...",
    noData: "কোনো ডাটা পাওয়া যায়নি",
    status: "স্ট্যাটাস",
    checking: "যাচাই চলছে",
    date: "তারিখ",
    action: "অ্যাকশন",
    adminPanel: "এডমিন কন্ট্রোল",
    manageReviews: "রিভিউ ম্যানেজমেন্ট",
    topSellersConfig: "টপ সেলার কনফিগ",
    installApp: "অ্যাপ ইনস্টল করুন",
    minTwoGmails: "কমপক্ষে ২টি জিমেইল সাবমিট করতে হবে।",
    emailRequired: "ইমেইল এড্রেস লিখুন",
    passRequired: "পাসওয়ার্ড লিখুন",
    invalidEmail: "সঠিক জিমেইল এড্রেস দিন (@gmail.com)",
    submitting: "সাবমিট করা হচ্ছে...",
    submissionSuccess: "সাবমিশন সফল হয়েছে! 🎉",
    submissionSuccessDesc: "আপনার জিমেইল সফলভাবে সাবমিট করা হয়েছে। আমাদের রিভিউ টিম দ্রুত চেক করে ব্যালেন্স যোগ করে দেবে।",
    viewHistory: "হিস্ট্রি চেক করুন",
    submitMore: "আরও জমা দিন",
    ratePerMail: "প্রতি অ্যাকাউন্টে পাবেন:",
    withdrawDisabledAlert: "বর্তমানে উত্তোলন সাময়িক বন্ধ আছে।",
    insufficientBalance: "পর্যাপ্ত ব্যালেন্স নেই",
    enterValidAmount: "সঠিক টাকার পরিমাণ দিন",
    withdrawSuccess: "উত্তোলন অনুরোধ সফল হয়েছে!",
    withdrawSuccessDesc: "আপনার উত্তোলনের অনুরোধটি পর্যালোচনা করা হচ্ছে। শিফট অনুযায়ী শীঘ্রই পেমেন্ট সম্পন্ন হবে।",
    fee: "ফি",
    netPayable: "প্রাপ্য টাকা (Net):",
    quickAdd: "দ্রুত যোগ:",
    allBalance: "সব ব্যালেন্স",
    vipLevelRewards: "ভিআইপি লেভেল রিওয়ার্ড",
    earningsChart: "সাপ্তাহিক ও মাসিক আয়ের চার্ট",
    days7: "৭ দিন",
    days30: "৩০ দিন",
    peakEarning: "সর্বোচ্চ আয়",
    totalPeriod: "মোট অর্জিত",
    currentLevelLabel: "বর্তমান লেভেল",
    nextLevelTarget: "পরবর্তী লেভেল লক্ষ্য:",
    approvedMailCount: "অনুমোদিত জিমেইল",
    memberSinceLabel: "সদস্য হয়েছেন:",
    profileSettings: "প্রোফাইল সেটিংস",
    securitySettings: "নিরাপত্তা ও পাসওয়ার্ড",
    referralTitle: "রেফারেল লিডারবোর্ড ও বোনাস",
    referralSubtitle: "বন্ধুদের আমন্ত্রণ জানিয়ে প্রতিটি সফল বিক্রয়ে আকর্ষণীয় কমিশন পান",
    yourReferralLink: "আপনার রেফারেল লিংক",
    shareWithFriends: "বন্ধুদের সাথে শেয়ার করুন",
    howItWorks: "কিভাবে কাজ করে?",
    customerReviews: "কাস্টমার রিভিউ",
    reviewsSubtitle: "আমাদের সাথে কাজ করা সম্মানিত সেলারদের বাস্তব অভিজ্ঞতা ও মতামত",
    writeReview: "রিভিউ লিখুন",
    rating: "রেটিং",
    yourComment: "আপনার মূল্যবান মতামত লিখুন",
    submitReview: "রিভিউ পোস্ট করুন",
    allReviews: "সকল রিভিউ",
    verifiedSeller: "ভেরিফাইড সেলার",
    settings: "সেটিংস",
    appPreferences: "অ্যাপ সেটিংস ও পছন্দ",
    notificationsSetting: "ইমেইল নোটিফিকেশন",
    withdrawalAlerts: "উত্তোলন স্ট্যাটাস আপডেট",
    submissionAlerts: "সাবমিশন অনুমোদন আপডেট",
    enterEmail: "ইমেইল এড্রেস লিখুন",
    enterPassword: "পাসওয়ার্ড লিখুন",
    enterFullName: "আপনার পুরো নাম লিখুন",
    enterPhone: "ফোন নম্বর (ঐচ্ছিক)",
    referralCodeOptional: "রেফারেল কোড (ঐচ্ছিক)",
    currentPassword: "বর্তমান পাসওয়ার্ড",
    newPassword: "নতুন পাসওয়ার্ড",
    confirmNewPassword: "নতুন পাসওয়ার্ড নিশ্চিত করুন",
    updatePassword: "পাসওয়ার্ড আপডেট করুন",
    passMismatch: "নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।",
    faqTitle: "সাধারণ প্রশ্নোত্তর (FAQ)",
    contactTitle: "যোগাযোগ ও সাপোর্ট",
    telegramSupport: "টেলিগ্রাম সাপোর্ট চ্যানেল",
    whatsappSupport: "হোয়াটসঅ্যাপ সাপোর্ট",
    emailSupport: "অফিসিয়াল ইমেইল সাপোর্ট",
    rateAppTitle: "আমাদের অ্যাপটি কেমন লাগছে?",
    rateAppSubtitle: "আপনার মূল্যবান রেটিং আমাদের সেবাকে আরও উন্নত করতে সাহায্য করবে।",
    submitRating: "সাবমিট করুন",
    thankYou: "ধন্যবাদ!",
    topSellersTitle: "টপ সেলার লিডারবোর্ড 🏆",
    topSellersDesc: "এডমিন ভেরিফাইড সর্বোচ্চ আয়কারী সেরা ১০ সেলারের তালিকা",
    earnedTotal: "মোট অর্জিত",
    successfulSubmissions: "সফল সাবমিশন",
    balanceConverter: "ব্যালেন্স কনভার্টার",
    balanceConverterDesc: "৬% ফি বাদ দিয়ে সম্ভাব্য আয় (১ USD = ১২০ BDT)",
    perVerifiedAccount: "প্রতি ভেরিফাইড অ্যাকাউন্ট",
    perAgedAccount: "প্রতি পুরাতন অ্যাকাউন্ট",
    startExchangeSubtitle: "সরাসরি জিমেইল বিক্রি করে টাকা নিন",
    shiftReceive: "রিসিভ করার সময়",
    shiftReport: "রিপোর্ট দেওয়ার সময়",
    directWithdrawMethods: "সরাসরি বিকাশ, নগদ বা রকেটে উইথড্র সম্ভব",
    holdBalanceNotice: "কাজের অডিট শেষ হলে মেইন ব্যালেন্সে জমা হবে",
    dailyStreakBonusSub: "প্রতিদিন লগইন করুন এবং জিতে নিন ৳০.৫০ - ৳৪.০০ ফ্রি ক্যাশ বোনাস",
    streakBonusClaimedToday: "আজকের দৈনিক বোনাস সংগৃহীত হয়েছে ✅",
    ratePerTask: "প্রতি টাস্ক রেট:",
    approvedJobsDone: "অনুমোদিত কাজ সম্পন্ন:",
    taskPayout: "টাস্ক পে-আউট",
    auditProcessing: "অডিট প্রসেসিং",
    fastTrack: "ফাষ্ট ট্র্যাক ⚡",
    levelBadgePerk: "লেভেল ব্যাজ",
    vipVerified: "ভিআইপি ভেরিফাইড",
    workAnalyticsTitle: "কাজের এনালিটিক্স ও ইনকাম গ্রাফ",
    workAnalyticsSub: "রিয়েল-টাইম সাবমিশন রেকর্ড ও আয় বিশ্লেষণ",
    days: "দিন",
    peakSingleEarn: "সর্বোচ্চ এককালীন আয়",
    earnedMoney: "উপার্জিত টাকা",
    needWithdrawCash: "টাকা উত্তোলন করতে চান?",
    fastPayoutMobile: "bKash, Nagad, Rocket বা USDT তে তাৎক্ষণিক",
    liveTrendingTitle: "লাইভ ট্রেন্ডিং পে-আউট ও এক্সচেঞ্জ",
    liveTrendingSub: "সক্রিয় ব্যবহারকারীদের সাম্প্রতিক আয়ের রেকর্ড",
    gmailListStatus: "জিমেইল তালিকা ও স্ট্যাটাস:",
    noSubmissionHistory: "কোনো সাবমিশন হিস্ট্রি পাওয়া যায়নি।",
    noSubmissionHistorySub: "জিমেইল এক্সচেঞ্জ শুরু করে আয় করুন।",
    noWithdrawHistory: "কোনো উইথড্র হিস্ট্রি নেই।",
    searchByEmail: "ইমেইল দিয়ে খুঁজুন...",
    memberIdCard: "ডিজিটাল মেম্বার আইডি কার্ড",
    memberIdCardSubtitle: "অফিসিয়াল মেম্বারশিপ ও ভেরিফিকেশন ব্যাজ",
    generalMember: "সাধারণ সদস্য",
    verifiedMember: "ভেরিফাইড সদস্য",
    accountStatus: "অ্যাকাউন্ট স্ট্যাটাস",
    statusActive: "সক্রিয় (Active)",
    joinDateLabel: "যোগদানের তারিখ",
    userIdLabel: "ইউজার আইডি",
    fullNameLabel: "পূর্ণ নাম",
    downloadCard: "আইডি কার্ড ডাউনলোড",
    cardTheme: "কার্ডের থিম",
    scanToVerify: "যাচাইয়ের জন্য স্ক্যান করুন",
    verificationProof: "অফিসিয়াল ভেরিফিকেশন সার্টিফিকেট",
    verifiedSuccessNotice: "এই মেম্বার কার্ডটি সফলভাবে টাকা উত্তোলনের পর ভেরিফাইড মর্যাদা লাভ করেছে।",
    generalMemberNotice: "প্রথমবার সফল উত্তোলনের পর স্বয়ংক্রিয়ভাবে ভেরিফাইড ব্যাজ সক্রিয় হবে।",
    copyVerificationLink: "ভেরিফিকেশন লিংক কপি",
    verificationLinkCopied: "ভেরিফিকেশন লিংক কপি করা হয়েছে!",
    officialIdBadge: "OFFICIAL MEMBER CARD",
  },
  en: {
    "appName": "Mail Factory",
    "slogan": "★ Fast & Trusted Exchange ★",
    "trustedSafe": "100% Secure : Delivering trustworthy service with honesty.",
    "newGmail": "Fresh Gmail",
    "oldGmail": "Aged Gmail",
    "startSelling": "Start Selling Gmails",
    "startExchange": "Start Exchange",
    "activeBadge": "Active",
    "levelRateTitle": "Level Rates",
    "chooseGmailType": "Select Gmail Type",
    "whyChooseUs": "Why Choose Us?",
    "fastPayment": "Fast Payout",
    "safeData": "Secure Data",
    "support247": "24/7 Support",
    "enterDetails": "Enter Gmail Details",
    "yourRate": "Your Level Rate:",
    "addAnother": "+ Add More",
    "bulkPaste": "Bulk Paste",
    "bulkPasteTitle": "Paste Multiple Accounts (Email:Password)",
    "estimatedEarnings": "Estimated Earnings",
    "confirmSubmit": "Confirm & Submit",
    "home": "Home",
    "history": "History",
    "sellers": "Sellers",
    "profile": "Profile",
    "submissions": "Submissions",
    "withdraws": "Withdrawals",
    "trending": "Trending",
    "mainBalance": "Main Balance",
    "holdBalance": "Hold Balance",
    "withdraw": "Withdraw",
    "invite": "Refer",
    "dailyStreak": "Daily Streak",
    "submissionStats": "Submission Stats",
    "total": "Total",
    "approved": "Approved",
    "pending": "Pending",
    "rejected": "Rejected",
    "inviteAndEarn": "Refer & Earn",
    "commission": "Commission",
    "totalRefers": "Total Referrals",
    "totalEarned": "Total Earned",
    "overview": "Overview",
    "myFriends": "Invited Users",
    "copy": "Copy",
    "shareReferral": "Share Referral Link",
    "account": "Account",
    "editProfile": "Edit Profile",
    "notifications": "Notifications",
    "changePassword": "Change Password",
    "logoutAll": "Logout All Devices",
    "support": "Support",
    "liveChat": "Live Chat",
    "faq": "FAQ",
    "contactUs": "Contact Us",
    "info": "Information",
    "privacyPolicy": "Privacy Policy",
    "aboutUs": "About Us",
    "dangerZone": "Danger Zone",
    "deleteAccount": "Delete Account",
    "logout": "Logout",
    "login": "Login",
    "register": "Register",
    "welcomeBack": "Welcome Back",
    "orWithEmail": "Or with email",
    "gmailAddress": "Gmail Address",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "fullName": "Full Name",
    "forgotPass": "Forgot Password?",
    "noAccount": "Don't have an account?",
    "haveAccount": "Already have an account?",
    "submitWithdraw": "Submit Withdrawal Request",
    "minWithdrawLabel": "Minimum Withdrawal:",
    "accountNumber": "Wallet / Account Number",
    "amount": "Withdrawal Amount (BDT)",
    "selectPaymentMethod": "Select Payment Method",
    "liveReviewShifts": "Audit Shifts",
    "nextShiftIn": "Next Shift In:",
    "copySuccess": "Copied successfully!",
    "streakClaim": "Claim Daily Bonus",
    "streakClaimed": "Bonus Claimed!",
    "selectLanguage": "Select Language",
    "languageTitle": "Change Language",
    "homePage": "Home",
    "submissionHistory": "Submission History",
    "topSellersList": "Top Sellers",
    "myProfile": "My Profile",
    "back": "Back",
    "save": "Save",
    "saveChanges": "Save Changes",
    "edit": "Edit",
    "viewAll": "View All",
    "loading": "Loading...",
    "all": "All",
    "search": "Search",
    "noData": "No data available",
    "status": "Status",
    "checking": "Checking...",
    "date": "Date",
    "action": "Action",
    "adminPanel": "Admin Panel",
    "manageReviews": "Manage Reviews",
    "topSellersConfig": "Top Sellers Config",
    "installApp": "Install App",
    "minTwoGmails": "Submit at least 2 Gmail accounts at once",
    "emailRequired": "Please enter Gmail address",
    "passRequired": "Please enter password",
    "invalidEmail": "Invalid Gmail address",
    "submitting": "Submitting...",
    "submissionSuccess": "Submitted Successfully!",
    "submissionSuccessDesc": "Your accounts have been submitted for review.",
    "viewHistory": "View History",
    "submitMore": "Submit More",
    "ratePerMail": "Rate per account",
    "withdrawDisabledAlert": "Withdrawals are currently under maintenance.",
    "insufficientBalance": "Insufficient balance for this withdrawal.",
    "enterValidAmount": "Please enter a valid amount.",
    "withdrawSuccess": "Withdrawal Requested!",
    "withdrawSuccessDesc": "Your withdrawal request is being processed.",
    "fee": "Fee",
    "netPayable": "Net Payout",
    "quickAdd": "Quick Add",
    "allBalance": "All Balance",
    "vipLevelRewards": "VIP Level Rewards",
    "earningsChart": "Earnings Chart",
    "days7": "Last 7 Days",
    "days30": "Last 30 Days",
    "peakEarning": "Peak Earning",
    "totalPeriod": "Total Period",
    "currentLevelLabel": "Current Level",
    "nextLevelTarget": "Next Level Target",
    "approvedMailCount": "Approved Accounts",
    "memberSinceLabel": "Member Since",
    "profileSettings": "Profile Settings",
    "securitySettings": "Security Settings",
    "referralTitle": "Invite Friends & Earn Commission",
    "referralSubtitle": "Earn lifetime bonus from every approved account your friends submit.",
    "yourReferralLink": "Your Referral Link",
    "shareWithFriends": "Share Link",
    "howItWorks": "How It Works",
    "customerReviews": "Seller Reviews",
    "reviewsSubtitle": "Real feedback from our top sellers and community",
    "writeReview": "Write a Review",
    "rating": "Rating",
    "yourComment": "Your Experience / Comment",
    "submitReview": "Submit Review",
    "allReviews": "All Reviews",
    "verifiedSeller": "Verified Seller",
    "settings": "Settings",
    "appPreferences": "App Preferences",
    "notificationsSetting": "Notification Settings",
    "withdrawalAlerts": "Withdrawal Alerts",
    "submissionAlerts": "Submission Alerts",
    "enterEmail": "Enter Email Address",
    "enterPassword": "Enter Password",
    "enterFullName": "Enter Full Name",
    "enterPhone": "Enter Phone Number",
    "referralCodeOptional": "Referral Code (Optional)",
    "currentPassword": "Current Password",
    "newPassword": "New Password",
    "confirmNewPassword": "Confirm New Password",
    "updatePassword": "Update Password",
    "passMismatch": "Passwords do not match",
    "faqTitle": "Frequently Asked Questions",
    "contactTitle": "Contact Customer Support",
    "telegramSupport": "Telegram Support",
    "whatsappSupport": "WhatsApp Support",
    "emailSupport": "Email Support",
    "rateAppTitle": "Rate Our Platform",
    "rateAppSubtitle": "Your feedback helps us continuously improve our service.",
    "submitRating": "Submit Rating",
    "thankYou": "Thank You!",
    "topSellersTitle": "Top Sellers Leaderboard",
    "topSellersDesc": "Recognizing the top performing sellers and their total payouts.",
    "earnedTotal": "Total Earnings",
    "successfulSubmissions": "Approved Accounts",
    "balanceConverter": "Rate Calculator",
    "balanceConverterDesc": "Calculate your estimated earnings based on current level rate.",
    "perVerifiedAccount": "per Fresh Account",
    "perAgedAccount": "per Aged Account",
    "startExchangeSubtitle": "Sell fresh and aged Gmails for instant payouts to bKash, Nagad, Rocket, or USDT.",
    "shiftReceive": "Shift Hours",
    "shiftReport": "Audit Window",
    "directWithdrawMethods": "Direct Payouts (bKash, Nagad, Rocket, USDT)",
    "holdBalanceNotice": "Hold balance will unlock automatically upon admin audit completion.",
    "dailyStreakBonusSub": "Check in daily to claim ৳0.50 - ৳4.00 free cash bonus!",
    "streakBonusClaimedToday": "Streak bonus already claimed today.",
    "ratePerTask": "Rate / Pcs",
    "approvedJobsDone": "Approved Accounts",
    "taskPayout": "Task Payout",
    "auditProcessing": "Audit in Progress",
    "fastTrack": "Fast Track",
    "levelBadgePerk": "Exclusive Perks",
    "vipVerified": "VIP Verified",
    "workAnalyticsTitle": "Performance & Earnings Analytics",
    "workAnalyticsSub": "Live submission logs and earnings distribution",
    "days": "Days",
    "peakSingleEarn": "Peak Daily Earning",
    "earnedMoney": "Earnings",
    "needWithdrawCash": "Ready to cash out your balance?",
    "fastPayoutMobile": "Fast payouts directly to mobile wallets or USDT",
    "liveTrendingTitle": "Live Payout Feed",
    "liveTrendingSub": "Real-time verified community transactions",
    "gmailListStatus": "Account List & Status:",
    "noSubmissionHistory": "No submission history found.",
    "noSubmissionHistorySub": "Start selling accounts to see your activity here.",
    "noWithdrawHistory": "No withdrawal history yet.",
    "searchByEmail": "Search by email...",
    "memberIdCard": "Digital Member ID Card",
    "memberIdCardSubtitle": "Official Membership & Verification Badge",
    "generalMember": "General Member",
    "verifiedMember": "Verified Member",
    "accountStatus": "Account Status",
    "statusActive": "Active",
    "joinDateLabel": "Join Date",
    "userIdLabel": "User ID",
    "fullNameLabel": "Full Name",
    "downloadCard": "Download ID Card",
    "cardTheme": "Card Theme",
    "scanToVerify": "Scan to Verify",
    "verificationProof": "Official Verification Certificate",
    "verifiedSuccessNotice": "This member card is officially verified after successful payout transactions.",
    "generalMemberNotice": "Will automatically upgrade to Verified status upon your first completed withdrawal.",
    "copyVerificationLink": "Copy Verification Link",
    "verificationLinkCopied": "Verification link copied to clipboard!",
    "officialIdBadge": "OFFICIAL MEMBER CARD"
}
};
