const fs = require('fs');
let code = fs.readFileSync('ProfileView.tsx', 'utf-8');

code = code.replace(
  /const hasWithdrawn = Boolean\(/,
  `const realTotalWithdrawn = withdrawRequests.filter(w => (w.status || '').toLowerCase() === 'approved').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);\n  const displayWithdrawn = Math.max(Number(profile?.total_withdrawn) || 0, realTotalWithdrawn);\n\n  const hasWithdrawn = Boolean(`
);

code = code.replace(
  /৳\{\(Number\(profile\?\.total_withdrawn\) \|\| 0\)\.toFixed\(2\)\}/g,
  `৳{realTotalWithdrawn.toFixed(2)}`
);

fs.writeFileSync('ProfileView.tsx', code);
