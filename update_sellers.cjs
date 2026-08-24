const fs = require('fs');
let code = fs.readFileSync('SellersView.tsx', 'utf-8');

code = code.replace(
  /return Number\(seller\.totalEarnings\) \|\| Number\(seller\.balance \|\| 0\) \|\| 0;/g,
  "return Number(seller.totalEarnings) || (Number(seller.balance || 0) + Number(seller.total_withdrawn || 0)) || 0;"
);

fs.writeFileSync('SellersView.tsx', code);
