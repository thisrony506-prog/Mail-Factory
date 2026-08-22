const fs = require('fs');
let code = fs.readFileSync('AppContext.tsx', 'utf-8');

const oldCheck = `      // Check for duplicate emails already used
      for (const item of data.gmails) {
        const q = query(ref(db, 'used_emails'), orderByChild('email'), equalTo(item.email.toLowerCase().trim()));`;

const newCheck = `      // Check for duplicate emails already used
      for (const item of data.gmails) {
        // Normalize gmail to prevent dot trick (t.e.s.t@gmail.com == test@gmail.com)
        const localPart = item.email.split('@')[0].replace(/\\./g, '');
        const normalizedEmail = \`\${localPart}@gmail.com\`.toLowerCase();
        
        const q = query(ref(db, 'used_emails'), orderByChild('email'), equalTo(normalizedEmail));`;

code = code.replace(oldCheck, newCheck);

const oldSave = `      // Record in used_emails
      for (const g of data.gmails) {
        const emailRef = push(ref(db, 'used_emails'));
        updates[\`used_emails/\${emailRef.key}\`] = { email: g.email.toLowerCase().trim(), submittedAt: Date.now() };
      }`;

const newSave = `      // Record in used_emails
      for (const g of data.gmails) {
        const localPart = g.email.split('@')[0].replace(/\\./g, '');
        const normalizedEmail = \`\${localPart}@gmail.com\`.toLowerCase();
        
        const emailRef = push(ref(db, 'used_emails'));
        updates[\`used_emails/\${emailRef.key}\`] = { email: normalizedEmail, submittedAt: Date.now() };
      }`;

code = code.replace(oldSave, newSave);

fs.writeFileSync('AppContext.tsx', code);
