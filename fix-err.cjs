const fs = require('fs');
let code = fs.readFileSync('WithdrawView.tsx', 'utf-8');

code = code.replace(/if\s*\(errorMessage\)\s*setErrorMessage\(null\);/g, 'setFieldErrors({});');

fs.writeFileSync('WithdrawView.tsx', code);
