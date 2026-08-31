const fs = require('fs');

const files = [
  'AppContext.tsx',
  'BuyerOrdersView.tsx',
  'BuyerTransactionsView.tsx',
  'MemberIdCardView.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/newOrder\.id\.slice/g, '(newOrder.id || "").slice');
  code = code.replace(/orderKey\.slice/g, '(orderKey || "").slice');
  code = code.replace(/orderId\.slice/g, '(orderId || "").slice');
  code = code.replace(/ord\.id\.slice/g, '(ord.id || "").slice');
  code = code.replace(/rawUid\.replace\(\/\[\^a-zA-Z0-9\]\/g, ''\)\.slice/g, '(rawUid || "").replace(/[^a-zA-Z0-9]/g, "").slice');
  fs.writeFileSync(file, code);
}
