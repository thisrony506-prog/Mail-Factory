const fs = require('fs');
let code = fs.readFileSync('ExchangeView.tsx', 'utf-8');

const oldCheck = `      if (seenEmails.has(email)) {`;
const newCheck = `      const normalizedEmail = email.replace(/\\./g, '');
      if (seenEmails.has(normalizedEmail)) {`;

code = code.replace(oldCheck, newCheck);

const oldAdd = `      seenEmails.add(email);`;
const newAdd = `      seenEmails.add(normalizedEmail);`;

code = code.replace(oldAdd, newAdd);

fs.writeFileSync('ExchangeView.tsx', code);
