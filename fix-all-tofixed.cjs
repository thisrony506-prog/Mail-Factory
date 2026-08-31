const fs = require('fs');

const files = [
  'BuyerDepositView.tsx',
  'BuyerOrdersView.tsx',
  'BuyerTransactionsView.tsx',
  'BuyerWalletView.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  // Look for any .toFixed( and wrap the caller in Number() if it's not already
  // Because it's hard to regex safely, let's just do known patterns.
  code = code.replace(/\(profile\?\.balance \|\| 0\)\.toFixed/g, 'Number(profile?.balance || 0).toFixed');
  code = code.replace(/\(parseFloat\(amount \|\| '0'\) \/ 120\)\.toFixed/g, 'Number(parseFloat(amount || "0") / 120).toFixed');
  code = code.replace(/order\.amount\.toFixed/g, 'Number(order.amount || 0).toFixed');
  code = code.replace(/tx\.amount\.toFixed/g, 'Number(tx.amount || 0).toFixed');
  code = code.replace(/balance\.toFixed/g, 'Number(balance || 0).toFixed');
  code = code.replace(/totalDeposited\.toFixed/g, 'Number(totalDeposited || 0).toFixed');
  code = code.replace(/totalSpent\.toFixed/g, 'Number(totalSpent || 0).toFixed');
  code = code.replace(/pendingDeposits\.toFixed/g, 'Number(pendingDeposits || 0).toFixed');
  fs.writeFileSync(file, code);
}
