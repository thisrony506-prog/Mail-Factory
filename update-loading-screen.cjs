const fs = require('fs');
let code = fs.readFileSync('LoadingScreen.tsx', 'utf-8');
code = code.replace(
  '<img',
  '<img\n              width={96}\n              height={96}\n              fetchPriority="high"'
);
fs.writeFileSync('LoadingScreen.tsx', code);
