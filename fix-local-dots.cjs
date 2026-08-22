const fs = require('fs');
let code = fs.readFileSync('ExchangeView.tsx', 'utf-8');

const oldCheck = "const normalizedEmail = email.replace(/\\./g, '');";
const newCheck = "const normalizedEmail = email.split('@')[0].replace(/\\./g, '') + '@gmail.com';";

code = code.replace(oldCheck, newCheck);
fs.writeFileSync('ExchangeView.tsx', code);
