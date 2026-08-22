const fs = require('fs');
let code = fs.readFileSync('WithdrawView.tsx', 'utf-8');

const validationCode = `
    const acc = accountNumber.trim();
    if (!acc) {
      showError(isUSDT ? 'Enter BEP20 Wallet Address' : type === 'bkash' ? 'Enter bKash Account number' : type === 'nagad' ? 'Enter nogod Account number' : t.accountNumber);
      return;
    }

    if (type === 'bkash' || type === 'nagad' || type === 'rocket') {
      const phoneRegex = /^01[3-9][0-9]{8}$/;
      if (!phoneRegex.test(acc)) {
        showError(language === 'bn' ? 'অনুগ্রহ করে একটি সঠিক ১১-ডিজিটের মোবাইল নম্বর দিন!' : 'Please enter a valid 11-digit mobile number!');
        return;
      }
    } else if (isUSDT) {
      if (!acc.startsWith('0x') || acc.length !== 42) {
        showError(language === 'bn' ? 'অনুগ্রহ করে সঠিক Binance BEP20 অ্যাড্রেস দিন (0x দিয়ে শুরু হবে)!' : 'Please enter a valid Binance BEP20 address (starts with 0x)!');
        return;
      }
    }
`;

code = code.replace(
  /if \(!accountNumber\.trim\(\)\) \{[\s\S]*?return;\s*\}/,
  validationCode.trim()
);

fs.writeFileSync('WithdrawView.tsx', code);
