const fs = require('fs');
let code = fs.readFileSync('ExchangeView.tsx', 'utf-8');

const oldCheck = `      if (!emailRegex.test(email)) {
        hapticFeedback.error();
        showError(
          language === 'bn'
            ? \`সারি নম্বর \${i + 1} (\${email}) একটি বৈধ @gmail.com নয়!\`
            : \`Row #\${i + 1} (\${email}) is not a valid @gmail.com!\`
        );
        return;
      }`;

const newCheck = `      if (email.includes('+')) {
        hapticFeedback.error();
        showError(
          language === 'bn'
            ? \`সারি নম্বর \${i + 1} এ ইমেইল এলিয়াস (+) ব্যবহার করা যাবে না!\`
            : \`Row #\${i + 1} cannot contain email aliases (+ trick)!\`
        );
        return;
      }
      
      if (!emailRegex.test(email)) {
        hapticFeedback.error();
        showError(
          language === 'bn'
            ? \`সারি নম্বর \${i + 1} (\${email}) একটি বৈধ @gmail.com নয়!\`
            : \`Row #\${i + 1} (\${email}) is not a valid @gmail.com!\`
        );
        return;
      }`;

code = code.replace(oldCheck, newCheck);
fs.writeFileSync('ExchangeView.tsx', code);
