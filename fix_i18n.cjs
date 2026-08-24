const fs = require('fs');
let code = fs.readFileSync('i18n.ts', 'utf-8');

code = code.replace(
  /"taskPayout": "Total Payout",/g,
  '"taskPayout": "Task Payout",'
);

code = code.replace(
  /"earnedTotal": "Total Payout",/g,
  '"earnedTotal": "Total Earnings",'
);

fs.writeFileSync('i18n.ts', code);
