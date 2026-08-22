const fs = require('fs');
let code = fs.readFileSync('WithdrawView.tsx', 'utf-8');

const regex = /const handlePreSubmit = \(e: React\.FormEvent\) => \{[\s\S]*?setShowConfirm\(true\);\n  \};/m;

const newPreSubmit = `const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    hapticFeedback.medium();
    setFieldErrors({});
    
    if (isWithdrawDisabled) {
      setFieldErrors({ global: t.withdrawDisabledAlert });
      hapticFeedback.error();
      return;
    }

    const acc = accountNumber.trim();
    if (!acc) {
      setFieldErrors({ account: isUSDT ? 'Enter BEP20 Wallet Address' : type === 'bkash' ? 'Enter bKash Account number' : type === 'nagad' ? 'Enter nogod Account number' : t.accountNumber });
      hapticFeedback.error();
      return;
    }

    if (type === 'bkash' || type === 'nagad' || type === 'rocket') {
      const phoneRegex = /^01[3-9][0-9]{8}$/;
      if (!phoneRegex.test(acc)) {
        setFieldErrors({ account: language === 'bn' ? 'অনুগ্রহ করে একটি সঠিক ১১-ডিজিটের মোবাইল নম্বর দিন!' : 'Please enter a valid 11-digit mobile number!' });
        hapticFeedback.error();
        return;
      }
    } else if (isUSDT) {
      if (!acc.startsWith('0x') || acc.length !== 42) {
        setFieldErrors({ account: language === 'bn' ? 'অনুগ্রহ করে সঠিক Binance BEP20 অ্যাড্রেস দিন (0x দিয়ে শুরু হবে)!' : 'Please enter a valid Binance BEP20 address (starts with 0x)!' });
        hapticFeedback.error();
        return;
      }
    }

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setFieldErrors({ amount: t.enterValidAmount });
      hapticFeedback.error();
      return;
    }
    if (numAmount < currentMinWithdraw) {
      setFieldErrors({ amount: t.minWithdrawLabel + \` ৳\${currentMinWithdraw}\${isUSDT ? ' (~$2)' : ''}\` });
      hapticFeedback.error();
      return;
    }
    if (numAmount > availableBalance) {
      setFieldErrors({ amount: t.insufficientBalance });
      hapticFeedback.error();
      return;
    }

    setShowConfirm(true);
  };`;

code = code.replace(regex, newPreSubmit);

code = code.replace(/showError\(res\.message\);/g, 'setFieldErrors({ global: res.message });');

fs.writeFileSync('WithdrawView.tsx', code);
