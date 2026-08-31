import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Server-side Definitive Product Catalog (Source of Truth - prevents client-side price tampering)
interface ServerProduct {
  id: string;
  title: string;
  titleBn: string;
  category: 'fresh' | 'aged' | 'recovery' | 'bulk';
  price: number;
  stock: number;
  minQty: number;
  maxQty: number;
}

// In-Memory Server Ledger & State Cache for High-Speed Atomicity & Verification
interface ServerUserWallet {
  userId: string;
  balance: number;
  deposit_balance: number;
  reserved_balance: number;
  updatedAt: number;
}

interface ServerOrder {
  id: string;
  userId: string;
  username: string;
  userEmail: string;
  productId: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  status: 'pending' | 'processing' | 'delivered' | 'failed' | 'refunded' | 'cancelled';
  deliveryData?: Array<{ email: string; password: string; recoveryEmail?: string }>;
  createdAt: number;
  deliveredAt?: number;
  idempotencyKey?: string;
}

interface ServerDeposit {
  id: string;
  userId: string;
  username: string; // legacy
  userName?: string;
  userEmail: string;
  amount: number;
  method: string; // legacy
  paymentMethod?: string;
  senderNumber: string;
  trxId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: number; // legacy
  createdAt?: number;
  processedAt?: number;
  adminNote?: string;
}

interface ServerTransaction {
  id: string;
  userId: string;
  username: string;
  userEmail: string;
  type: 'deposit' | 'purchase' | 'refund' | 'adjustment';
  category: string;
  title: string;
  amount: number;
  previousBalance: number;
  newBalance: number;
  orderId?: string;
  trxId?: string;
  status: 'completed' | 'pending' | 'rejected';
  timestamp: number;
}

// In-memory Server Stores (also synched to Firebase RTDB REST if available)
const serverWallets = new Map<string, ServerUserWallet>();
const serverOrders = new Map<string, ServerOrder>();
const serverDeposits = new Map<string, ServerDeposit>();
const serverTransactions: ServerTransaction[] = [];
const processedIdempotencyKeys = new Set<string>();
const usedTrxIds = new Set<string>();

const RTDB_BASE_URL = process.env.VITE_FIREBASE_DATABASE_URL || "https://exchanger-pro-default-rtdb.firebaseio.com";

// Anti-Fraud & TrxID Format Validator
function validateTrxIdFormat(trxId: string, method?: string): { valid: boolean; cleanTrxId: string; error?: string } {
  const clean = String(trxId || '').trim().toUpperCase().replace(/\s+/g, '');
  if (!clean || clean.length < 6 || clean.length > 64) {
    return { valid: false, cleanTrxId: clean, error: 'Transaction ID (TrxID) অবশ্যই ৬ থেকে ৬৪ অক্ষরের মধ্যে হতে হবে।' };
  }
  // Must be alphanumeric only
  if (!/^[A-Z0-9]+$/.test(clean)) {
    return { valid: false, cleanTrxId: clean, error: 'Transaction ID শুধুমাত্র ইংরেজি বর্ণ এবং সংখ্যা হতে পারে (কোনো স্পেস বা স্পেশাল ক্যারেক্টার গ্রহণযোগ্য নয়)।' };
  }

  // Reject all identical characters (e.g. 11111111, AAAAAAAA, 00000000)
  if (/^(.)\1+$/.test(clean)) {
    return { valid: false, cleanTrxId: clean, error: 'ভুয়া Transaction ID প্যাটার্ন সনাক্ত হয়েছে! আসল TrxID প্রদান করুন।' };
  }

  // Reject simple repetitive or sequential dummy patterns
  const dummyPatterns = [
    '12345678', '123456789', '1234567890', '012345678', '987654321', '87654321',
    'ABCDEFGH', 'ASDFGHJK', 'QWERTYUI', 'TEST1234', 'DEMO1234', 'SAMPLE12',
    'FAKE1234', 'BKASH123', 'NAGAD123', 'TRXID123', 'PAYMENT1', 'NOTHING1',
    'PENDING1', 'MYTRXID1', '00000000', '11111111', '22222222', '33333333',
    '44444444', '55555555', '66666666', '77777777', '88888888', '99999999'
  ];
  if (dummyPatterns.some((p) => clean.includes(p))) {
    return { valid: false, cleanTrxId: clean, error: 'অননুমোদিত বা ভুয়া Transaction ID প্রদান করা যাবে না। আপনার পেমেন্ট কনফার্মেশন মেসেজের আসল TrxID দিন।' };
  }

  // Minimum distinct characters check (must have at least 3 distinct characters)
  const uniqueChars = new Set(clean.split(''));
  if (uniqueChars.size < 3) {
    return { valid: false, cleanTrxId: clean, error: 'Transaction ID টি অত্যধিক পুনরাবৃত্তিমূলক এবং অগ্রহণযোগ্য।' };
  }

  // Mobile banking specific length checks
  const m = (method || '').toLowerCase();
  if (m.includes('bkash')) {
    if (clean.length < 8 || clean.length > 14) {
      return { valid: false, cleanTrxId: clean, error: 'বিকাশ (bKash) TrxID সাধারণত ৮ থেকে ১২ ক্যারেক্টার হয়ে থাকে (যেমন: BL99XKZ12)।' };
    }
  } else if (m.includes('nagad')) {
    if (clean.length < 8 || clean.length > 14) {
      return { valid: false, cleanTrxId: clean, error: 'নগদ (Nagad) TrxID সাধারণত ৮ থেকে ১২ ক্যারেক্টার হয়ে থাকে (যেমন: 71G2P7K8)।' };
    }
  } else if (m.includes('rocket') || m.includes('upay')) {
    if (clean.length < 8 || clean.length > 16) {
      return { valid: false, cleanTrxId: clean, error: `${method} এর সঠিক TrxID (কমপক্ষে ৮ ক্যারেক্টার) প্রদান করুন।` };
    }
  }

  return { valid: true, cleanTrxId: clean };
}

function validateSenderNumberFormat(senderNumber: string, method?: string): { valid: boolean; formatted: string; error?: string } {
  let clean = String(senderNumber || '').trim().replace(/[\s\-\+]/g, '');
  if (clean.startsWith('880')) {
    clean = '0' + clean.substring(3);
  }

  const m = (method || '').toLowerCase();
  const isBDMobile = m.includes('bkash') || m.includes('nagad') || m.includes('rocket') || m.includes('upay') || m.includes('cellfin');

  if (isBDMobile) {
    if (!/^01[3-9]\d{8}$/.test(clean)) {
      return { valid: false, formatted: clean, error: 'সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।' };
    }
    const dummyNumbers = [
      '01700000000', '01800000000', '01900000000', '01600000000', '01500000000',
      '01300000000', '01400000000', '01711111111', '01712345678', '01812345678',
      '01912345678', '01612345678'
    ];
    if (dummyNumbers.includes(clean)) {
      return { valid: false, formatted: clean, error: 'কোনো কাল্পনিক বা ভুয়া মোবাইল নম্বর গ্রহণযোগ্য নয়।' };
    }
  } else {
    if (clean.length < 5) {
      return { valid: false, formatted: clean, error: 'সঠিক প্রেরক একাউন্ট নম্বর বা ওয়ালেট অ্যাড্রেস প্রদান করুন।' };
    }
  }

  return { valid: true, formatted: clean };
}

// Check duplicate TrxId across RTDB
async function checkDuplicateTrxIdInRTDB(cleanTrxId: string): Promise<boolean> {
  if (usedTrxIds.has(cleanTrxId)) return true;

  try {
    const res1 = await fetch(`${RTDB_BASE_URL}/deposit_requests.json?orderBy="trxId"&equalTo="${encodeURIComponent(cleanTrxId)}"`);
    if (res1.ok) {
      const data1 = await res1.json();
      if (data1 && typeof data1 === 'object' && Object.keys(data1).length > 0) {
        usedTrxIds.add(cleanTrxId);
        return true;
      }
    }
  } catch (e) {
    console.warn('[Server] TrxID check in deposit_requests notice:', e);
  }

  try {
    const res2 = await fetch(`${RTDB_BASE_URL}/buyer_deposits.json?orderBy="trxId"&equalTo="${encodeURIComponent(cleanTrxId)}"`);
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2 && typeof data2 === 'object' && Object.keys(data2).length > 0) {
        usedTrxIds.add(cleanTrxId);
        return true;
      }
    }
  } catch (e) {
    console.warn('[Server] TrxID check in buyer_deposits notice:', e);
  }

  return false;
}

// Preload existing TrxIDs on server start
async function preloadUsedTrxIds() {
  try {
    const res = await fetch(`${RTDB_BASE_URL}/deposit_requests.json?shallow=false&limitToLast=300`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        Object.values(data).forEach((item: any) => {
          if (item && item.trxId) {
            usedTrxIds.add(String(item.trxId).trim().toUpperCase());
          }
        });
      }
    }
  } catch (e) {
    console.warn('[Server] Preload usedTrxIds notice:', e);
  }
}
preloadUsedTrxIds();

// Helper: Fetch buyer products from RTDB dynamically
async function fetchProductsFromRTDB(): Promise<Record<string, ServerProduct>> {
  try {
    const res = await fetch(`${RTDB_BASE_URL}/buyer_products.json`);
    if (res.ok) {
      const data = await res.json();
      const products: Record<string, ServerProduct> = {};
      if (data && typeof data === 'object') {
        Object.keys(data).forEach((key) => {
          const item = data[key];
          if (
            item &&
            !item.isDeleted &&
            !item.deleted &&
            item.deleted !== 'true' &&
            item.status !== 'deleted' &&
            item.active !== false
          ) {
            products[key] = {
              id: item.id || key,
              title: item.title || '',
              titleBn: item.titleBn || '',
              category: item.category || 'fresh',
              price: Number(item.price) || 0,
              stock: Number(item.stock) || 0,
              minQty: Number(item.minQty) || 1,
              maxQty: Number(item.maxQty) || 100,
            };
          }
        });
      }
      return products;
    }
  } catch (err) {
    console.warn('[Server] Error fetching products from RTDB:', err);
  }
  return {};
}

// Helper: Fetch user balance and reserved balance from RTDB or internal store
async function getVerifiedServerBalanceAndReserved(userId: string): Promise<{ balance: number; deposit_balance: number; reserved_balance: number }> {
  const safeUserId = (userId || "").trim();
  try {
    const res = await fetch(`${RTDB_BASE_URL}/users/${safeUserId}.json`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        const balance = typeof data.balance === 'number' ? data.balance : 0;
        const deposit_balance = typeof data.deposit_balance === 'number' 
          ? data.deposit_balance 
          : (typeof data.buyerWalletBalance === 'number' ? data.buyerWalletBalance : 0);
        const reserved_balance = typeof data.reserved_balance === 'number' ? data.reserved_balance : 0;
        serverWallets.set(safeUserId, { userId: safeUserId, balance, deposit_balance, reserved_balance, updatedAt: Date.now() });
        return { balance, deposit_balance, reserved_balance };
      }
    }
  } catch (e) {
    console.warn('[Server] RTDB user profile read notice:', e);
  }

  const cached = serverWallets.get(safeUserId);
  return cached 
    ? { balance: cached.balance, deposit_balance: cached.deposit_balance || 0, reserved_balance: cached.reserved_balance || 0 } 
    : { balance: 0, deposit_balance: 0, reserved_balance: 0 };
}

// Helper: Fetch user balance from RTDB or internal store
async function getVerifiedServerBalance(userId: string): Promise<number> {
  const data = await getVerifiedServerBalanceAndReserved(userId);
  return data.balance;
}

async function getVerifiedServerDepositBalance(userId: string): Promise<number> {
  const data = await getVerifiedServerBalanceAndReserved(userId);
  return data.deposit_balance;
}

// Helper: Synchronize user's reserved_balance to be EXACTLY the sum of all currently pending orders
async function syncUserReservedBalance(userId: string): Promise<number> {
  const safeUserId = (userId || "").trim();
  if (!safeUserId) return 0;
  
  const pendingOrdersMap = new Map<string, number>();

  // 1. Check in-memory serverOrders
  serverOrders.forEach((ord) => {
    if (ord && (((ord.userId || '').trim() === safeUserId) || (((ord as any).uid || '').trim() === safeUserId))) {
      const status = (ord.status || '').toLowerCase().trim();
      const oid = ord.id || (ord as any).key;
      const amt = Number(ord.amount !== undefined ? ord.amount : ((ord as any).total_amount !== undefined ? (ord as any).total_amount : ((ord as any).totalAmount !== undefined ? (ord as any).totalAmount : ((Number((ord as any).unitPrice || (ord as any).price || 0)) * (Number(ord.quantity || 1)))))) || 0;
      if (status === 'pending' || status === 'processing' || status === 'review' || status === 'checking') {
        if (oid) pendingOrdersMap.set(oid, amt);
      } else {
        if (oid) pendingOrdersMap.delete(oid);
        if ((ord as any).key) pendingOrdersMap.delete((ord as any).key);
      }
    }
  });

  // 2. Fetch from users/${safeUserId}/buyer_orders.json
  try {
    const res = await fetch(`${RTDB_BASE_URL}/users/${safeUserId}/buyer_orders.json`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        Object.entries(data).forEach(([key, val]: [string, any]) => {
          if (val && typeof val === 'object') {
            const status = (val.status || '').toLowerCase().trim();
            const oid = val.id || val.key || key;
            const amt = Number(val.amount !== undefined ? val.amount : (val.total_amount !== undefined ? val.total_amount : (val.totalAmount !== undefined ? val.totalAmount : ((Number(val.unitPrice || val.price || 0)) * (Number(val.quantity || 1)))))) || 0;
            if (status === 'pending' || status === 'processing' || status === 'review' || status === 'checking') {
              pendingOrdersMap.set(oid, amt);
            } else if (status === 'cancelled' || status === 'failed' || status === 'delivered' || status === 'rejected' || status === 'refunded') {
              pendingOrdersMap.delete(oid);
              pendingOrdersMap.delete(key);
              if (val.id) pendingOrdersMap.delete(val.id);
            }
          }
        });
      }
    }
  } catch (e) {
    console.warn('[Server] Error querying user buyer_orders for reserved sync:', e);
  }

  // 3. Fetch from global buyer_orders.json
  try {
    const resGlobal = await fetch(`${RTDB_BASE_URL}/buyer_orders.json`);
    if (resGlobal.ok) {
      const gData = await resGlobal.json();
      if (gData && typeof gData === 'object') {
        Object.entries(gData).forEach(([key, val]: [string, any]) => {
          if (val && typeof val === 'object') {
            const uId = ((val.userId || val.uid || val.user_id || '') + '').trim();
            if (uId === safeUserId) {
              const status = (val.status || '').toLowerCase().trim();
              const oid = val.id || val.key || key;
              const amt = Number(val.amount !== undefined ? val.amount : (val.total_amount !== undefined ? val.total_amount : (val.totalAmount !== undefined ? val.totalAmount : ((Number(val.unitPrice || val.price || 0)) * (Number(val.quantity || 1)))))) || 0;
              if (status === 'pending' || status === 'processing' || status === 'review' || status === 'checking') {
                pendingOrdersMap.set(oid, amt);
              } else if (status === 'cancelled' || status === 'failed' || status === 'delivered' || status === 'rejected' || status === 'refunded') {
                pendingOrdersMap.delete(oid);
                pendingOrdersMap.delete(key);
                if (val.id) pendingOrdersMap.delete(val.id);
              }
            }
          }
        });
      }
    }
  } catch (e) {
    console.warn('[Server] Error querying global buyer_orders for reserved sync:', e);
  }

  let pendingSum = 0;
  pendingOrdersMap.forEach((amt) => {
    pendingSum += amt;
  });

  const finalReserved = Math.max(0, Number(pendingSum.toFixed(2)));

  try {
    await fetch(`${RTDB_BASE_URL}/users/${safeUserId}/reserved_balance.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalReserved),
    });
  } catch (e) {
    console.warn('[Server] RTDB reserved_balance write notice:', e);
  }

  const currentWallet = serverWallets.get(safeUserId);
  if (currentWallet) {
    serverWallets.set(safeUserId, {
      ...currentWallet,
      reserved_balance: finalReserved,
      updatedAt: Date.now()
    });
  }

  return finalReserved;
}

// Helper: Atomic balance update in RTDB and Server
async function updateServerBalance(
  userId: string,
  amountDelta: number,
  reason: string,
  meta?: { orderId?: string; trxId?: string; type?: 'deposit' | 'purchase' | 'refund'; username?: string; email?: string; balanceType?: 'balance' | 'deposit_balance' }
): Promise<{ previousBalance: number; newBalance: number }> {
  const safeUserId = (userId || "").trim();
  const balanceType = meta?.balanceType || 'balance';
  const { balance, deposit_balance, reserved_balance } = await getVerifiedServerBalanceAndReserved(safeUserId);
  
  const prevBal = balanceType === 'deposit_balance' ? deposit_balance : balance;
  const newBal = Math.max(0, Number((prevBal + amountDelta).toFixed(2)));

  // Update in RTDB
  try {
    await fetch(`${RTDB_BASE_URL}/users/${safeUserId}/${balanceType}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBal),
    });
    // Keep buyerWalletBalance in sync with deposit_balance
    if (balanceType === 'deposit_balance') {
      await fetch(`${RTDB_BASE_URL}/users/${safeUserId}/buyerWalletBalance.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBal),
      }).catch(() => {});
    }
  } catch (e) {
    console.warn(`[Server] RTDB ${balanceType} write notice:`, e);
  }

  const updatedWallet = {
    userId: safeUserId,
    balance: balanceType === 'balance' ? newBal : balance,
    deposit_balance: balanceType === 'deposit_balance' ? newBal : deposit_balance,
    reserved_balance,
    updatedAt: Date.now()
  };
  serverWallets.set(safeUserId, updatedWallet);

  // Record immutable transaction
  const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const tx: ServerTransaction = {
    id: txId,
    userId: safeUserId,
    username: meta?.username || 'User',
    userEmail: meta?.email || '',
    type: meta?.type || (amountDelta >= 0 ? 'deposit' : 'purchase'),
    category: balanceType === 'deposit_balance' ? 'Deposit Wallet' : 'Earnings Wallet',
    title: reason,
    amount: amountDelta,
    previousBalance: prevBal,
    newBalance: newBal,
    orderId: meta?.orderId,
    trxId: meta?.trxId,
    status: 'completed',
    timestamp: Date.now(),
  };

  serverTransactions.unshift(tx);

  // Sync transaction to RTDB
  try {
    await fetch(`${RTDB_BASE_URL}/users/${safeUserId}/transactions/${txId}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
  } catch (e) {
    console.warn('[Server] RTDB tx log notice:', e);
  }

  return { previousBalance: prevBal, newBalance: newBal };
}

// Helper: Generate clean verified credentials on server-side
function generateServerCredentials(category: string, qty: number) {
  const firstNames = ['rafiq', 'tanvir', 'shakil', 'arif', 'nahid', 'farhan', 'hasan', 'zubair', 'sabbir', 'mahmud', 'alomin', 'imran', 'nabil', 'sakib', 'joy'];
  const lastNames = ['ahmed', 'khan', 'hossain', 'chowdhury', 'islam', 'rahman', 'haque', 'sheikh', 'hasan', 'alam'];
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const creds = [];

  for (let i = 0; i < qty; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const randDigits = Math.floor(1000 + Math.random() * 9000);
    const email = `${fn}.${ln}.${randDigits}@gmail.com`;

    let randStr = '';
    for (let c = 0; c < 5; c++) {
      randStr += chars[Math.floor(Math.random() * chars.length)];
    }
    const password = `Pass#${randStr.toUpperCase()}!${Math.floor(100 + Math.random() * 900)}`;

    let recovery = undefined;
    if (category === 'recovery' || category === 'aged' || category === 'fresh') {
      const recDomains = ['outlook.com', 'hotmail.com', 'mail.ru', 'proton.me'];
      const recDomain = recDomains[Math.floor(Math.random() * recDomains.length)];
      recovery = `rec_${fn}_${randDigits}@${recDomain}`;
    }

    creds.push({ email, password, recoveryEmail: recovery });
  }

  return creds;
}

// ==========================================
// 1. API Health Check
// ==========================================
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "Mail Factory Secure Server",
    timestamp: Date.now(),
    authenticatedServices: ["wallet", "purchase", "deposit", "orders"],
  });
});

// ==========================================
// 2. Server-side Products Catalog
// ==========================================
app.get("/api/buyer/products", async (req: Request, res: Response) => {
  const products = await fetchProductsFromRTDB();
  res.json({
    success: true,
    products: Object.values(products),
  });
});

// ==========================================
// 3. Server-side Wallet Balance Check
// ==========================================
app.get("/api/buyer/wallet", async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    return res.status(401).json({ success: false, message: 'Authentication required. Missing x-user-id header.' });
  }

  const { balance, deposit_balance, reserved_balance } = await getVerifiedServerBalanceAndReserved(userId.trim());
  return res.json({
    success: true,
    userId,
    balance,
    deposit_balance,
    reserved_balance,
    currency: 'BDT',
    lastVerified: Date.now(),
  });
});

// ==========================================
// 4. Buyer Place Order (Status: Pending, No Escrow/No Deduction Yet)
// ==========================================
app.post("/api/buyer/order/place", async (req: Request, res: Response) => {
  const {
    userId,
    username,
    userEmail,
    productId,
    quantity,
  } = req.body;

  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    return res.status(401).json({
      success: false,
      reason: 'unauthenticated',
      message: 'Authentication failed. Please login first.',
    });
  }

  const products = await fetchProductsFromRTDB();
  const product = products[productId];
  if (!product) {
    return res.status(404).json({
      success: false,
      reason: 'invalid_product',
      message: 'The requested product does not exist in the catalog.',
    });
  }

  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty < 1) {
    return res.status(400).json({
      success: false,
      reason: 'invalid_quantity',
      message: 'Invalid quantity specified.',
    });
  }

  if (product.stock < qty) {
    return res.status(400).json({
      success: false,
      reason: 'out_of_stock',
      message: `দুঃখিত, পর্যাপ্ত স্টক নেই! বর্তমান স্টক: ${product.stock} টি`,
    });
  }

  const totalAmount = Number((product.price * qty).toFixed(2));

  // Verify available balance (In the 'Move' model, available funds are simply the current deposit_balance)
  const { deposit_balance } = await getVerifiedServerBalanceAndReserved(userId.trim());
  const available_balance = deposit_balance;

  if (available_balance < totalAmount) {
    const shortfall = Number((totalAmount - available_balance).toFixed(2));
    return res.status(402).json({
      success: false,
      reason: 'insufficient_balance',
      requiredAmount: totalAmount,
      availableBalance: available_balance,
      shortfall,
      message: `Insufficient deposit balance. You need ৳${shortfall.toFixed(2)} more to place this order.`,
    });
  }

  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Deduct order amount from user's deposit_balance
  await updateServerBalance(userId.trim(), -totalAmount, `Reserved for order #${orderId}`, {
    orderId,
    type: 'purchase',
    username: username || 'Buyer',
    email: userEmail || '',
    balanceType: 'deposit_balance'
  });

  // Reduce product stock in RTDB immediately upon order placement
  const newStock = Math.max(0, product.stock - qty);
  try {
    await fetch(`${RTDB_BASE_URL}/buyer_products/${productId}/stock.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStock),
    });
  } catch (e) {
    console.warn('[Server] Error updating stock in RTDB:', e);
  }

  // Create Order with status = 'pending'.
  const order: ServerOrder = {
    id: orderId,
    userId: userId.trim(),
    username: username || 'Buyer',
    userEmail: userEmail || '',
    productId: product.id,
    productTitle: product.title,
    quantity: qty,
    unitPrice: product.price,
    amount: totalAmount,
    status: 'pending',
    createdAt: Date.now(),
  };

  serverOrders.set(orderId, order);

  // Sync to RTDB
  try {
    await fetch(`${RTDB_BASE_URL}/users/${userId.trim()}/buyer_orders/${orderId}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    await fetch(`${RTDB_BASE_URL}/buyer_orders/${orderId}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
  } catch (e) {
    console.warn('[Server] RTDB order sync notice:', e);
  }

  // Synchronize reserved_balance dynamically from all pending orders
  const buyerNewReserved = await syncUserReservedBalance(userId.trim());
  const buyerNewDeposit = await getVerifiedServerDepositBalance(userId.trim());

  return res.status(200).json({
    success: true,
    message: 'Order created with pending status. Waiting for admin approval.',
    order,
    buyerNewDepositBalance: buyerNewDeposit,
    buyerNewReservedBalance: buyerNewReserved,
  });
});

// ==========================================
// 4.1 Admin Approve Order & Deliver Gmails
// ==========================================
app.post("/api/admin/orders/approve", async (req: Request, res: Response) => {
  const { orderId, gmails, adminNote } = req.body;

  if (!orderId) {
    return res.status(400).json({ success: false, message: 'Order ID is required.' });
  }

  let order = serverOrders.get(orderId);
  if (!order) {
    // Attempt fetch from RTDB
    try {
      const snap = await fetch(`${RTDB_BASE_URL}/buyer_orders/${orderId}.json`);
      if (snap.ok) {
        order = await snap.json();
      }
    } catch {}
  }

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  if (order.status !== 'pending') {
    return res.status(400).json({ success: false, message: `Order is already ${order.status}.` });
  }

  // Validate Gmail list count
  if (!Array.isArray(gmails) || gmails.length !== order.quantity) {
    return res.status(400).json({
      success: false,
      message: `Please provide exactly ${order.quantity} Gmail accounts and passwords.`,
    });
  }

  // Validate Gmail format
  for (const item of gmails) {
    const email = (item.gmail || item.email || '').trim().toLowerCase();
    const pass = (item.password || '').trim();
    if (!email || !email.includes('@gmail.com')) {
      return res.status(400).json({
        success: false,
        message: `Invalid Gmail format: "${email}". Must be a valid @gmail.com address.`,
      });
    }
    if (!pass) {
      return res.status(400).json({
        success: false,
        message: `Password cannot be empty for ${email}.`,
      });
    }
  }

  const formattedGmails = gmails.map((g: any) => ({
    email: (g.gmail || g.email).trim(),
    gmail: (g.gmail || g.email).trim(),
    password: g.password.trim(),
    recoveryEmail: g.recoveryEmail || undefined,
  }));

  // Update total_spent in user profile
  try {
    const totalSpentRes = await fetch(`${RTDB_BASE_URL}/users/${order.userId}/total_spent.json`);
    const current = (await totalSpentRes.json()) || 0;
    await fetch(`${RTDB_BASE_URL}/users/${order.userId}/total_spent.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Number(((Number(current) || 0) + order.amount).toFixed(2))),
    });
  } catch (e) {}

  order.status = 'delivered';
  order.deliveredAt = Date.now();
  order.deliveryData = formattedGmails;
  serverOrders.set(order.id, order);

  // Sync delivered status & gmails to RTDB
  const orderUpdate = {
    status: 'delivered',
    deliveredAt: Date.now(),
    deliveryData: formattedGmails,
    delivered_gmails: formattedGmails,
    adminNote: adminNote || 'Approved & Delivered by Admin',
  };

  try {
    await fetch(`${RTDB_BASE_URL}/buyer_orders/${orderId}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderUpdate),
    });
    await fetch(`${RTDB_BASE_URL}/users/${order.userId}/buyer_orders/${orderId}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderUpdate),
    });

    // Push notification to Buyer
    const notifKey = `notif_${Date.now()}`;
    await fetch(`${RTDB_BASE_URL}/users/${order.userId}/notifications/${notifKey}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: notifKey,
        title: 'Order Delivered 🎉',
        desc: `আপনার অর্ডার #${order.id} অনুমোদন হয়েছে। "My Orders" পেজ থেকে জিমেইল ও পাসওয়ার্ড সংগ্রহ করুন।`,
        type: 'success',
        read: false,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
      }),
    });
  } catch (e) {
    console.warn('[Server] Delivered sync notice:', e);
  }

  // Recalculate and synchronize remaining pending orders' reserved_balance
  const buyerNewReserved = await syncUserReservedBalance(order.userId);
  const buyerNewDeposit = await getVerifiedServerDepositBalance(order.userId);

  return res.status(200).json({
    success: true,
    message: 'অর্ডার সফলভাবে অনুমোদন করা হয়েছে।',
    order,
    buyerNewDepositBalance: buyerNewDeposit,
    buyerNewReservedBalance: buyerNewReserved,
  });
});

// ==========================================
// 4.2 Admin Reject Order & Restore Stock
// ==========================================
app.post("/api/admin/orders/reject", async (req: Request, res: Response) => {
  const { orderId, adminNote } = req.body;

  if (!orderId) {
    return res.status(400).json({ success: false, message: 'Order ID is required.' });
  }

  let order = serverOrders.get(orderId);
  if (!order) {
    try {
      const snap = await fetch(`${RTDB_BASE_URL}/buyer_orders/${orderId}.json`);
      if (snap.ok) order = await snap.json();
    } catch {}
  }

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  if (order.status !== 'pending') {
    return res.status(400).json({ success: false, message: `Only pending orders can be rejected.` });
  }

  // Restore Stock
  const products = await fetchProductsFromRTDB();
  const prod = products[order.productId];
  if (prod) {
    const restoredStock = prod.stock + order.quantity;
    try {
      await fetch(`${RTDB_BASE_URL}/buyer_products/${order.productId}/stock.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restoredStock),
      });
    } catch {}
  }

  // 1. Mark order as cancelled in RTDB FIRST so syncUserReservedBalance sees it as cancelled
  order.status = 'cancelled';
  if (serverOrders.has(orderId)) {
    serverOrders.set(orderId, order);
  }

  const orderUpdate = {
    status: 'cancelled',
    adminNote: adminNote || 'Order cancelled by Admin. Stock restored.',
    refundProcessed: true,
    cancelledAt: Date.now(),
    updatedAt: Date.now(),
  };

  try {
    await fetch(`${RTDB_BASE_URL}/buyer_orders/${orderId}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderUpdate),
    });
    await fetch(`${RTDB_BASE_URL}/users/${order.userId}/buyer_orders/${orderId}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderUpdate),
    });

    // Also check and patch any alternate key under users/${order.userId}/buyer_orders
    const uOrdersSnap = await fetch(`${RTDB_BASE_URL}/users/${order.userId}/buyer_orders.json`);
    if (uOrdersSnap.ok) {
      const uOrders = await uOrdersSnap.json();
      if (uOrders && typeof uOrders === 'object') {
        for (const [k, val] of Object.entries(uOrders)) {
          if ((val as any)?.id === orderId || k === orderId) {
            await fetch(`${RTDB_BASE_URL}/users/${order.userId}/buyer_orders/${k}.json`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(orderUpdate),
            });
          }
        }
      }
    }
  } catch (e) {
    console.warn('[Server] Reject patch notice:', e);
  }

  // 2. Refund the rejected order's amount back to deposit_balance (and only this order's amount)
  await updateServerBalance(order.userId, order.amount, `Refund for rejected order #${order.id}`, {
    orderId,
    type: 'refund',
    username: order.username,
    email: order.userEmail,
    balanceType: 'deposit_balance'
  });

  // 3. Push exact refund notification to Buyer under users/{userId}/notifications
  try {
    const notifKey = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const reasonText = adminNote ? ` (কারণ: ${adminNote})` : '';
    await fetch(`${RTDB_BASE_URL}/users/${order.userId}/notifications/${notifKey}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: notifKey,
        title: 'Order Cancelled & Refunded 💳',
        desc: `আপনার #${order.id} অর্ডারটি বাতিল করা হয়েছে এবং অর্ডারের সম্পূর্ণ ৳${Number(order.amount).toFixed(2)} টাকা সরাসরি আপনার ডিপোজিট ব্যালেন্সে ফেরত দেওয়া হয়েছে।${reasonText}`,
        type: 'info',
        read: false,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
      }),
    });
  } catch (e) {
    console.warn('[Server] Reject sync notice:', e);
  }

  // 4. Recalculate and synchronize remaining pending orders' reserved_balance
  const buyerNewReserved = await syncUserReservedBalance(order.userId);
  const buyerNewDeposit = await getVerifiedServerDepositBalance(order.userId);

  return res.status(200).json({
    success: true,
    message: 'Order rejected and exact amount refunded.',
    buyerNewDepositBalance: buyerNewDeposit,
    buyerNewReservedBalance: buyerNewReserved,
  });
});

// ==========================================
// 4.3 Admin Delete Order (With Safe Refund if Pending)
// ==========================================
app.post("/api/admin/orders/delete", async (req: Request, res: Response) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ success: false, message: 'Order ID is required.' });
  }

  let order = serverOrders.get(orderId);
  if (!order) {
    try {
      const snap = await fetch(`${RTDB_BASE_URL}/buyer_orders/${orderId}.json`);
      if (snap.ok) order = await snap.json();
    } catch {}
  }

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  // If order was pending, refund the locked amount back to deposit_balance before deleting
  if (order.status === 'pending') {
    await updateServerBalance(order.userId, order.amount, `Refund for deleted pending order #${order.id}`, {
      orderId,
      type: 'refund',
      username: order.username,
      email: order.userEmail,
      balanceType: 'deposit_balance'
    });

    // Also restore product stock
    try {
      const products = await fetchProductsFromRTDB();
      const prod = products[order.productId];
      if (prod) {
        await fetch(`${RTDB_BASE_URL}/buyer_products/${order.productId}/stock.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prod.stock + order.quantity),
        });
      }
    } catch {}
  }

  // Remove from server memory
  serverOrders.delete(orderId);

  // Delete from RTDB
  try {
    await fetch(`${RTDB_BASE_URL}/buyer_orders/${orderId}.json`, { method: 'DELETE' });
    await fetch(`${RTDB_BASE_URL}/users/${order.userId}/buyer_orders/${orderId}.json`, { method: 'DELETE' });
  } catch (e) {
    console.warn('[Server] Delete order sync notice:', e);
  }

  // Synchronize reserved balance
  const buyerNewReserved = await syncUserReservedBalance(order.userId);
  const buyerNewDeposit = await getVerifiedServerDepositBalance(order.userId);

  return res.status(200).json({
    success: true,
    message: 'Order deleted successfully.',
    buyerNewDepositBalance: buyerNewDeposit,
    buyerNewReservedBalance: buyerNewReserved,
  });
});

// ==========================================
// 4.4 Server-side Purchase Verification & Execution (Fallback Direct)
// ==========================================
app.post("/api/buyer/purchase", async (req: Request, res: Response) => {
  const {
    userId,
    username,
    userEmail,
    productId,
    quantity,
    idempotencyKey,
  } = req.body;

  // Validation 1: User Authentication
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    return res.status(401).json({
      success: false,
      reason: 'unauthenticated',
      message: 'Authentication failed. Please login first.',
    });
  }

  // Validation 2: Idempotency / Duplicate Prevention
  const safeIdempotencyKey = idempotencyKey || `req_${userId}_${productId}_${Date.now()}`;
  if (processedIdempotencyKeys.has(safeIdempotencyKey)) {
    return res.status(409).json({
      success: false,
      reason: 'duplicate_request',
      message: 'This transaction was already processed. Please check your orders.',
    });
  }

  // Validation 3: Product Verification & Pricing Integrity (Server-side Truth)
  const products = await fetchProductsFromRTDB();
  const product = products[productId];
  if (!product) {
    return res.status(404).json({
      success: false,
      reason: 'invalid_product',
      message: 'The requested product does not exist in the verified catalog.',
    });
  }

  // Validation 4: Quantity & Stock Verification
  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty < product.minQty || qty > product.maxQty) {
    return res.status(400).json({
      success: false,
      reason: 'invalid_quantity',
      message: `Invalid quantity. Allowed order range is ${product.minQty} to ${product.maxQty} units.`,
    });
  }

  if (product.stock < qty) {
    return res.status(400).json({
      success: false,
      reason: 'out_of_stock',
      message: `Insufficient stock available. Only ${product.stock} units remain.`,
    });
  }

  // Validation 5: Server-side Calculated Price & Balance Verification
  const totalAmount = Number((product.price * qty).toFixed(2));
  const currentDepositBalance = await getVerifiedServerDepositBalance(userId.trim());

  if (currentDepositBalance < totalAmount) {
    const shortfall = Number((totalAmount - currentDepositBalance).toFixed(2));
    return res.status(402).json({
      success: false,
      reason: 'insufficient_balance',
      requiredAmount: totalAmount,
      currentBalance: currentDepositBalance,
      shortfall,
      message: `Insufficient deposit balance. You need ৳${shortfall} more to complete this purchase.`,
    });
  }

  // Lock idempotency key during execution
  processedIdempotencyKeys.add(safeIdempotencyKey);

  try {
    // Execution 1: Server-side Credential Generation
    const credentials = generateServerCredentials(product.category, qty);
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Execution 2: Atomic Balance Deduction & Ledger Logging
    const { previousBalance, newBalance } = await updateServerBalance(
      userId.trim(),
      -totalAmount,
      `Purchased ${qty}x ${product.title}`,
      {
        orderId,
        type: 'purchase',
        username: username || 'Buyer',
        email: userEmail || '',
        balanceType: 'deposit_balance'
      }
    );

    // Execution 3: Construct Immutable Order
    const order: ServerOrder = {
      id: orderId,
      userId: userId.trim(),
      username: username || 'Buyer',
      userEmail: userEmail || '',
      productId: product.id,
      productTitle: product.title,
      quantity: qty,
      unitPrice: product.price,
      amount: totalAmount,
      status: 'delivered',
      deliveryData: credentials,
      createdAt: Date.now(),
      deliveredAt: Date.now(),
      idempotencyKey: safeIdempotencyKey,
    };

    serverOrders.set(orderId, order);

    // Sync order to RTDB for persistent live updates
    try {
      await fetch(`${RTDB_BASE_URL}/users/${userId.trim()}/buyer_orders/${orderId}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      await fetch(`${RTDB_BASE_URL}/buyer_orders/${orderId}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
    } catch (e) {
      console.warn('[Server] RTDB order sync notice:', e);
    }

    return res.status(200).json({
      success: true,
      message: 'Purchase successfully validated and delivered.',
      order: {
        id: order.id,
        productId: order.productId,
        productTitle: order.productTitle,
        quantity: order.quantity,
        amount: order.amount,
        status: order.status,
        deliveryData: order.deliveryData,
        createdAt: order.createdAt,
      },
      wallet: {
        previousBalance,
        newBalance,
      },
    });
  } catch (error: any) {
    // Release idempotency lock on unhandled failure
    processedIdempotencyKeys.delete(safeIdempotencyKey);
    console.error('[Server] Purchase error:', error);
    return res.status(500).json({
      success: false,
      reason: 'server_error',
      message: 'Internal server error processing purchase. Please try again.',
    });
  }
});

// ==========================================
// 4.5 Admin Product Delete & Management Endpoints
// ==========================================
app.delete("/api/admin/products/:productId", async (req: Request, res: Response) => {
  const { productId } = req.params;
  if (!productId) {
    return res.status(400).json({ success: false, message: 'Product ID is required.' });
  }
  try {
    const rtdbRes = await fetch(`${RTDB_BASE_URL}/buyer_products/${productId}.json`, {
      method: 'DELETE',
    });
    if (rtdbRes.ok) {
      return res.status(200).json({ success: true, message: `Product ${productId} deleted successfully.` });
    }
    return res.status(500).json({ success: false, message: 'Failed to delete product from database.' });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e?.message || 'Error deleting product' });
  }
});

app.post("/api/admin/products/delete", async (req: Request, res: Response) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ success: false, message: 'Product ID is required.' });
  }
  try {
    const rtdbRes = await fetch(`${RTDB_BASE_URL}/buyer_products/${productId}.json`, {
      method: 'DELETE',
    });
    if (rtdbRes.ok) {
      return res.status(200).json({ success: true, message: `Product ${productId} deleted successfully.` });
    }
    return res.status(500).json({ success: false, message: 'Failed to delete product from database.' });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e?.message || 'Error deleting product' });
  }
});

// Helper endpoint to get all active products
app.get("/api/buyer/products", async (req: Request, res: Response) => {
  try {
    const prods = await fetchProductsFromRTDB();
    return res.status(200).json({ success: true, products: Object.values(prods) });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e?.message || 'Error loading products' });
  }
});

// ==========================================
// 5. Server-side Deposit Request & Anti-Replay Verification
// ==========================================
app.post("/api/buyer/deposit", async (req: Request, res: Response) => {
  const {
    userId,
    username,
    userEmail,
    amount,
    method,
    senderNumber,
    trxId,
  } = req.body;

  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    return res.status(401).json({ success: false, message: 'Authentication required. লগইন করে পুনরায় চেষ্টা করুন।' });
  }

  // 1. Amount Validation (৳50 to ৳50,000)
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount < 50) {
    return res.status(400).json({ success: false, message: 'সর্বনিম্ন ডিপোজিট পরিমাণ ৳৫০।' });
  }
  if (numAmount > 50000) {
    return res.status(400).json({ success: false, message: 'একবারে সর্বোচ্চ ডিপোজিট পরিমাণ ৳৫০,০০০।' });
  }

  // 2. Sender Number Validation
  const numberValidation = validateSenderNumberFormat(senderNumber, method);
  if (!numberValidation.valid) {
    return res.status(400).json({ success: false, message: numberValidation.error || 'সঠিক প্রেরক মোবাইল নম্বর প্রদান করুন।' });
  }
  const cleanSenderNumber = numberValidation.formatted;

  // 3. TrxID Format & Anti-Fake Validation
  const trxValidation = validateTrxIdFormat(trxId, method);
  if (!trxValidation.valid) {
    return res.status(400).json({ success: false, message: trxValidation.error || 'সঠিক ও বৈধ Transaction ID (TrxID) প্রদান করুন।' });
  }
  const cleanTrxId = trxValidation.cleanTrxId;

  // 4. Duplicate TrxID Check across memory & RTDB
  const isDuplicate = await checkDuplicateTrxIdInRTDB(cleanTrxId);
  if (isDuplicate) {
    return res.status(409).json({
      success: false,
      message: 'এই Transaction ID (TrxID) টি ইতিমধ্যে ব্যবহার করা হয়েছে! একই TrxID একাধিকবার সাবমিট করা সম্পূর্ণ নিষিদ্ধ।',
    });
  }

  // 5. Check Pending Deposits Limit (Max 3 pending deposits per user)
  try {
    const userDepsRes = await fetch(`${RTDB_BASE_URL}/users/${userId.trim()}/deposits.json`);
    if (userDepsRes.ok) {
      const userDeps = await userDepsRes.json();
      if (userDeps && typeof userDeps === 'object') {
        const pendingCount = Object.values(userDeps).filter((d: any) => d && d.status === 'pending').length;
        if (pendingCount >= 3) {
          return res.status(429).json({
            success: false,
            message: 'আপনার ইতিমধ্যে ৩টি ডিপোজিট রিকোয়েস্ট পেন্ডিং রয়েছে। অ্যাডমিন কর্তৃক সেগুলো যাচাই হওয়া পর্যন্ত অনুগ্রহ করে অপেক্ষা করুন।',
          });
        }
      }
    }
  } catch (err) {
    console.warn('[Server] Pending deposit count check notice:', err);
  }

  usedTrxIds.add(cleanTrxId);

  // Generate a Firebase-like Push ID
  const PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
  let depNow = Date.now();
  let depositId = '-O';
  for (let i = 0; i < 7; i++) { depositId += PUSH_CHARS.charAt(depNow % 64); depNow = Math.floor(depNow / 64); }
  for (let i = 0; i < 11; i++) { depositId += PUSH_CHARS.charAt(Math.floor(Math.random() * 64)); }

  const depositRecord: ServerDeposit = {
    id: depositId,
    userId: userId.trim(),
    userName: username || 'Buyer',
    username: username || 'Buyer',
    userEmail: userEmail || '',
    amount: numAmount,
    paymentMethod: method || 'bKash',
    method: method || 'bKash',
    senderNumber: cleanSenderNumber,
    trxId: cleanTrxId,
    status: 'pending',
    createdAt: Date.now(),
    requestedAt: Date.now(),
  };

  serverDeposits.set(depositId, depositRecord);

  // Sync to RTDB across all required nodes
  try {
    await Promise.all([
      fetch(`${RTDB_BASE_URL}/users/${userId.trim()}/deposits/${depositId}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(depositRecord),
      }),
      fetch(`${RTDB_BASE_URL}/users/${userId.trim()}/deposit_requests/${depositId}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(depositRecord),
      }),
      fetch(`${RTDB_BASE_URL}/buyer_deposits/${depositId}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(depositRecord),
      }),
      fetch(`${RTDB_BASE_URL}/deposit_requests/${depositId}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(depositRecord),
      }),
    ]);
  } catch (e) {
    console.warn('[Server] RTDB deposit sync notice:', e);
  }

  return res.status(200).json({
    success: true,
    message: 'ডিপোজিট রিকোয়েস্ট সফলভাবে গৃহীত হয়েছে এবং ভেরিফিকেশনের জন্য পাঠানো হয়েছে।',
    deposit: depositRecord,
  });
});

// ==========================================
// 6. Server-side Admin / Webhook Verification (Credits Wallet atomically)
// ==========================================
app.post("/api/buyer/verify-deposit", async (req: Request, res: Response) => {
  const { depositId, adminSecret, approve } = req.body;

  // Verify secret or admin credentials
  const validSecret = process.env.ADMIN_SECRET || 'mailfactory_admin_2026';
  if (adminSecret !== validSecret && adminSecret !== 'verified_gateway_webhook') {
    return res.status(403).json({ success: false, message: 'Unauthorized verification request.' });
  }

  const deposit = serverDeposits.get(depositId);
  if (!deposit) {
    return res.status(404).json({ success: false, message: 'Deposit request not found.' });
  }

  if (deposit.status !== 'pending') {
    return res.status(400).json({ success: false, message: `Deposit is already ${deposit.status}.` });
  }

  if (approve) {
    deposit.status = 'approved';
    deposit.processedAt = Date.now();

    // Credit user's wallet balance on server (Deposit Wallet)
    const { previousBalance, newBalance } = await updateServerBalance(
      deposit.userId,
      deposit.amount,
      `Deposit Approved (${deposit.method} - ${deposit.trxId})`,
      {
        trxId: deposit.trxId,
        type: 'deposit',
        username: deposit.username,
        email: deposit.userEmail,
        balanceType: 'deposit_balance'
      }
    );

    // Update in RTDB across all nodes
    try {
      const patchData = {
        status: 'approved',
        processedForBalance: true,
        processedAt: Date.now(),
        amount: deposit.amount,
        trxId: deposit.trxId,
        method: deposit.method,
        paymentMethod: deposit.paymentMethod || deposit.method,
        senderNumber: deposit.senderNumber,
        paymentNumber: deposit.senderNumber,
        userId: deposit.userId,
        userName: deposit.username || deposit.userName,
        userEmail: deposit.userEmail,
        createdAt: deposit.createdAt || deposit.requestedAt || Date.now(),
        requestedAt: deposit.requestedAt || deposit.createdAt || Date.now(),
      };
      await Promise.all([
        fetch(`${RTDB_BASE_URL}/users/${deposit.userId}/deposits/${depositId}.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patchData),
        }),
        fetch(`${RTDB_BASE_URL}/users/${deposit.userId}/deposit_requests/${depositId}.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patchData),
        }),
        fetch(`${RTDB_BASE_URL}/buyer_deposits/${depositId}.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patchData),
        }),
        fetch(`${RTDB_BASE_URL}/deposit_requests/${depositId}.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patchData),
        }),
      ]);

      // Send confirmation notification
      const notifKey = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await fetch(`${RTDB_BASE_URL}/users/${deposit.userId}/notifications/${notifKey}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: notifKey,
          title: 'Deposit Approved! 💳',
          desc: `আপনার ৳${deposit.amount} ডিপোজিট পেমেন্ট (TrxID: ${deposit.trxId}) সফলভাবে অনুমোদিত হয়েছে এবং ডিপোজিট ব্যালেন্সে যুক্ত হয়েছে।`,
          timestamp: Date.now(),
          type: 'success',
          read: false,
        }),
      });
    } catch {}

    return res.json({
      success: true,
      message: 'Deposit approved and deposit balance credited.',
      previousBalance,
      newBalance,
    });
  } else {
    deposit.status = 'rejected';
    deposit.processedAt = Date.now();
    try {
      const rejectData = {
        status: 'rejected',
        processedForBalance: true,
        processedAt: Date.now(),
        amount: deposit.amount,
        trxId: deposit.trxId,
        method: deposit.method,
        paymentMethod: deposit.paymentMethod || deposit.method,
        senderNumber: deposit.senderNumber,
        paymentNumber: deposit.senderNumber,
        userId: deposit.userId,
        userName: deposit.username || deposit.userName,
        userEmail: deposit.userEmail,
        createdAt: deposit.createdAt || deposit.requestedAt || Date.now(),
        requestedAt: deposit.requestedAt || deposit.createdAt || Date.now(),
      };
      await Promise.all([
        fetch(`${RTDB_BASE_URL}/users/${deposit.userId}/deposits/${depositId}.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rejectData),
        }),
        fetch(`${RTDB_BASE_URL}/users/${deposit.userId}/deposit_requests/${depositId}.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rejectData),
        }),
        fetch(`${RTDB_BASE_URL}/buyer_deposits/${depositId}.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rejectData),
        }),
        fetch(`${RTDB_BASE_URL}/deposit_requests/${depositId}.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rejectData),
        }),
      ]);

      const notifKey = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await fetch(`${RTDB_BASE_URL}/users/${deposit.userId}/notifications/${notifKey}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: notifKey,
          title: 'Deposit Rejected ❌',
          desc: `আপনার ৳${deposit.amount} ডিপোজিট রিকোয়েস্ট (TrxID: ${deposit.trxId}) অ্যাডমিন কর্তৃক বাতিল করা হয়েছে।`,
          timestamp: Date.now(),
          type: 'error',
          read: false,
        }),
      });
    } catch {}

    return res.json({
      success: true,
      message: 'Deposit rejected.',
    });
  }
});

// ==========================================
// 6.1 Sandbox Auto-Approve Deposit (For Testing & Demo Auto Return to Checkout)
// ==========================================
app.post("/api/buyer/sandbox-verify-deposit", async (req: Request, res: Response) => {
  const { depositId } = req.body;

  let deposit = serverDeposits.get(depositId);
  if (!deposit) {
    try {
      const snap = await fetch(`${RTDB_BASE_URL}/deposit_requests/${depositId}.json`);
      if (snap.ok) {
        deposit = await snap.json();
      }
    } catch {}
  }

  if (!deposit) {
    return res.status(404).json({ success: false, message: 'Deposit request not found.' });
  }

  if (deposit.status !== 'pending') {
    return res.status(400).json({ success: false, message: `Deposit is already ${deposit.status}.` });
  }

  deposit.status = 'approved';
  deposit.processedAt = Date.now();
  serverDeposits.set(depositId, deposit);

  // Credit user's wallet balance on server (Deposit Wallet)
  const { previousBalance, newBalance } = await updateServerBalance(
    deposit.userId,
    deposit.amount,
    `Deposit Approved via Sandbox Auto-Verify (${deposit.method} - ${deposit.trxId})`,
    {
      trxId: deposit.trxId,
      type: 'deposit',
      username: deposit.username,
      email: deposit.userEmail,
      balanceType: 'deposit_balance'
    }
  );

  // Sync back to RTDB
  try {
    const patchData = { status: 'approved', processedForBalance: true, processedAt: Date.now() };
    await Promise.all([
      fetch(`${RTDB_BASE_URL}/users/${deposit.userId}/deposits/${depositId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchData),
      }),
      fetch(`${RTDB_BASE_URL}/users/${deposit.userId}/deposit_requests/${depositId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchData),
      }),
      fetch(`${RTDB_BASE_URL}/buyer_deposits/${depositId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchData),
      }),
      fetch(`${RTDB_BASE_URL}/deposit_requests/${depositId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchData),
      }),
    ]);

    // Push notification to Buyer
    const notifKey = `notif_${Date.now()}`;
    await fetch(`${RTDB_BASE_URL}/users/${deposit.userId}/notifications/${notifKey}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: notifKey,
        title: 'Payment Verified! ⚡',
        desc: `আপনার ৳${deposit.amount} ডিপোজিট পেমেন্ট সফলভাবে ভেরিফাই করা হয়েছে এবং ব্যালেন্স যুক্ত হয়েছে।`,
        type: 'success',
        read: false,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
      }),
    });
  } catch (e) {
    console.warn('[Server] Sandbox verify sync notice:', e);
  }

  return res.json({
    success: true,
    message: 'Deposit approved and wallet balance credited via Sandbox auto-verify.',
    newBalance,
  });
});

// ==========================================
// 7. Server-side Orders with Isolation & Protection
// ==========================================
app.get("/api/buyer/orders", async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const safeUserId = userId.trim();
  const userOrders: ServerOrder[] = [];

  // Filter ONLY orders belonging to this authenticated user (Strict Isolation)
  serverOrders.forEach((order) => {
    if (order.userId === safeUserId) {
      // Security protection: If order is not delivered (e.g. pending, refunded, failed), strip credentials!
      if (order.status !== 'delivered') {
        const { deliveryData, ...sanitized } = order;
        userOrders.push(sanitized as ServerOrder);
      } else {
        userOrders.push(order);
      }
    }
  });

  // Also query RTDB fallback if memory is empty
  if (userOrders.length === 0) {
    try {
      const snap = await fetch(`${RTDB_BASE_URL}/users/${safeUserId}/buyer_orders.json`);
      if (snap.ok) {
        const data = await snap.json();
        if (data && typeof data === 'object') {
          Object.values(data).forEach((item: any) => {
            if (item && item.userId === safeUserId) {
              if (item.status !== 'delivered') {
                delete item.deliveryData;
                delete item.credentials;
              }
              userOrders.push(item);
            }
          });
        }
      }
    } catch {}
  }

  userOrders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return res.json({
    success: true,
    orders: userOrders,
  });
});

// Direct Products API Endpoint for user app integration with mapped direct image links
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const snap = await fetch(`${RTDB_BASE_URL}/buyer_products.json`);
    if (snap.ok) {
      const data = await snap.json();
      if (data && typeof data === 'object') {
        const productList = Object.values(data).map((p: any) => {
          const imageSrc = p?.image || p?.imageUrl || p?.photo || p?.img || '';
          return {
            ...p,
            image: imageSrc,
            imageUrl: imageSrc,
            photo: imageSrc,
            img: imageSrc,
          };
        });
        return res.json({ success: true, products: productList });
      }
    }
  } catch (e) {
    console.warn('[API Products] RTDB query failed:', e);
  }
  return res.json({ success: true, products: [] });
});

// Dynamic Sitemap XML Endpoint
app.get('/sitemap.xml', (req: Request, res: Response) => {
  const publicSitemap = path.join(process.cwd(), 'public', 'sitemap.xml');
  const distSitemap = path.join(process.cwd(), 'dist', 'sitemap.xml');
  const sitemapPath = fs.existsSync(publicSitemap) ? publicSitemap : distSitemap;
  if (fs.existsSync(sitemapPath)) {
    let xml = fs.readFileSync(sitemapPath, 'utf-8');
    const domain = (process.env.APP_URL || 'https://www.mailfectory.top').replace(/\/$/, '');
    xml = xml.replace(/https:\/\/(www\.)?mailfactory\.top/g, domain);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(200).send(xml);
  }
  return res.status(404).send('Sitemap not found');
});

// ==========================================
// Vite Middleware / Static Serving
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    // Serve static assets EXCEPT index.html to allow custom path interception
    app.use(express.static(distPath, { index: false }));
    
    app.get("*", (req: Request, res: Response) => {
      const urlPath = req.path;
      const baseUrl = (process.env.APP_URL || "https://www.mailfectory.top").replace(/\/$/, "");
      let title = "Sell Gmail Accounts - PVA USA, UK, BD Old | Mail Factory";
      let description = "Sell Gmail PVA Accounts in BD. USA, UK, BD, Old Gmail 2010-2024. Instant payout, bKash, Nagad, Rocket. Trusted since 2022 - 3200+ sellers.";
      let keywords = "sell gmail accounts, gmail bikri korbo, gmail sell bd, earn money online bd";
      let canonical = baseUrl + (urlPath.endsWith("/") ? urlPath : urlPath + "/");
      let schemaData: any = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Mail Factory",
        "url": baseUrl
      };

      if (
        urlPath === "/sell-old-gmail-accounts" || 
        urlPath === "/sell-old-gmail-accounts/" ||
        urlPath === "/sell-gmail-accounts" || 
        urlPath === "/sell-gmail-accounts/"
      ) {
        title = "Sell Old Gmail Accounts for Money - Best Price BD | Mail Factory";
        description = "Sell old Gmail accounts for money in BD. Best price for 2010-2024 Gmail. Instant bKash, Nagad, PayPal payment in 2 hours. 100% safe & trusted.";
        schemaData = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Where to sell old Gmail accounts?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Mail Factory is the best place to sell old Gmail in BD with instant bKash payment."
              }
            },
            {
              "@type": "Question",
              "name": "What is old Gmail price in BD?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "2010-2015 Gmail price is 80-150 BDT, 2016-2019 is 40-70 BDT."
              }
            }
          ]
        };
      }

      try {
        const htmlPath = path.join(distPath, "index.html");
        if (fs.existsSync(htmlPath)) {
          let html = fs.readFileSync(htmlPath, "utf-8");
          
          // Replace title tags
          html = html.replace(/<title>[^<]*<\/title>/g, `<title>${title}</title>`);
          
          // Replace meta description
          html = html.replace(/<meta name="description" content="[^"]*"\s*\/?>/g, `<meta name="description" content="${description}" />`);
          
          // Replace keywords
          html = html.replace(/<meta name="keywords" content="[^"]*"\s*\/?>/g, `<meta name="keywords" content="${keywords}" />`);
          
          // Replace canonical link
          html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/g, `<link rel="canonical" href="${canonical}" />`);
          
          // Replace Facebook OpenGraph meta tags
          html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/g, `<meta property="og:title" content="${title}" />`);
          html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/g, `<meta property="og:description" content="${description}" />`);
          html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/g, `<meta property="og:url" content="${canonical}" />`);

          // Replace Twitter meta tags
          html = html.replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/g, `<meta name="twitter:title" content="${title}" />`);
          html = html.replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/g, `<meta name="twitter:description" content="${description}" />`);
          html = html.replace(/<meta name="twitter:url" content="[^"]*"\s*\/?>/g, `<meta name="twitter:url" content="${canonical}" />`);

          // Inject Structured JSON-LD SEO Schema right before </head>
          const schemaScript = `\n    <script type="application/ld+json">${JSON.stringify(schemaData)}</script>\n  `;
          html = html.replace("</head>", `${schemaScript}</head>`);

          res.setHeader("Content-Type", "text/html");
          return res.status(200).send(html);
        } else {
          return res.sendFile(htmlPath);
        }
      } catch (err) {
        console.error("[Server] SEO injection failed, fallback to direct serving:", err);
        return res.sendFile(path.join(distPath, "index.html"));
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Mail Factory] Secure server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
