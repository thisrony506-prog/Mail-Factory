const fs = require('fs');
let code = fs.readFileSync('ProfileView.tsx', 'utf-8');

code = code.replace(
  /const realTotalWithdrawn = withdrawRequests\.filter\([\s\S]*?const displayWithdrawn[\s\S]*?const hasWithdrawn = Boolean\([\s\S]*?\);\n/g,
  ""
);

fs.writeFileSync('ProfileView.tsx', code);
