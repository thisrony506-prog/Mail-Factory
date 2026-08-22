const fs = require('fs');
let appCtx = fs.readFileSync('AppContext.tsx', 'utf-8');

// Update DEFAULT_PAYMENT_METHODS minWithdraw values
appCtx = appCtx.replace(
  "bkash: { name: 'bKash', icon: 'bi-wallet2', color: '#E2136E', active: true, minWithdraw: 100, feePercent: 6 },",
  "bkash: { name: 'bKash', icon: 'bi-wallet2', color: '#E2136E', active: true, minWithdraw: 150, feePercent: 6 },"
);
appCtx = appCtx.replace(
  "nagad: { name: 'Nagad', icon: 'bi-wallet2', color: '#F6921D', active: true, minWithdraw: 100, feePercent: 6 },",
  "nagad: { name: 'Nagad', icon: 'bi-wallet2', color: '#F6921D', active: true, minWithdraw: 150, feePercent: 6 },"
);
appCtx = appCtx.replace(
  "rocket: { name: 'Rocket', icon: 'bi-send-check', color: '#8C3494', active: true, minWithdraw: 100, feePercent: 6 },",
  "rocket: { name: 'Rocket', icon: 'bi-send-check', color: '#8C3494', active: true, minWithdraw: 150, feePercent: 6 },"
);
appCtx = appCtx.replace(
  "binance: { name: 'USDT (BEP20)', icon: 'bi-currency-exchange', color: '#F0B90B', active: true, minWithdraw: 200, feePercent: 6 },",
  "binance: { name: 'USDT (BEP20)', icon: 'bi-currency-exchange', color: '#F0B90B', active: true, minWithdraw: 240, feePercent: 6 },"
);

fs.writeFileSync('AppContext.tsx', appCtx);
