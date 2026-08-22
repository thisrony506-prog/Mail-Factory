const fs = require('fs');
let code = fs.readFileSync('ExchangeView.tsx', 'utf-8');

const oldRegex = "const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\\.com$/i;";
const newRegex = "const emailRegex = /^[a-zA-Z0-9.]+@gmail\\.com$/i;";

code = code.replace(oldRegex, newRegex);
fs.writeFileSync('ExchangeView.tsx', code);
