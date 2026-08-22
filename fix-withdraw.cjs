const fs = require('fs');
let code = fs.readFileSync('WithdrawView.tsx', 'utf-8');

// 1. Remove AlertModal usage and imports
code = code.replace("import { AlertModal } from './AlertModal';\n", "");

// 2. Change state
code = code.replace(
`  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setIsAlertOpen(true);
  };`,
`  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<{ amount?: string; account?: string; global?: string }>({});
`
);

// 3. handleAccountChange
code = code.replace(
`  const handleAccountChange = (val: string) => {
    setAccountNumber(val);
    if (errorMessage) setErrorMessage(null);`,
`  const handleAccountChange = (val: string) => {
    setAccountNumber(val);
    setFieldErrors(prev => ({ ...prev, account: undefined, global: undefined }));`
);

// 4. handleMaxAmount
code = code.replace(
`  const handleMaxAmount = () => {
    hapticFeedback.light();
    setAmount(Math.floor(availableBalance).toString());
    setErrorMessage(null);
  };`,
`  const handleMaxAmount = () => {
    hapticFeedback.light();
    setAmount(Math.floor(availableBalance).toString());
    setFieldErrors(prev => ({ ...prev, amount: undefined, global: undefined }));
  };`
);

// 5. handleQuickAmount
code = code.replace(
`  const handleQuickAmount = (val: number) => {
    hapticFeedback.light();
    const current = Number(amount) || 0;
    const newAmount = Math.min(current + val, Math.floor(availableBalance));
    setAmount(newAmount.toString());
    setErrorMessage(null);
  };`,
`  const handleQuickAmount = (val: number) => {
    hapticFeedback.light();
    const current = Number(amount) || 0;
    const newAmount = Math.min(current + val, Math.floor(availableBalance));
    setAmount(newAmount.toString());
    setFieldErrors(prev => ({ ...prev, amount: undefined, global: undefined }));
  };`
);

// 6. handlePreSubmit
const oldPreSubmit = `  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    hapticFeedback.medium();
    
    if (isWithdrawDisabled) {
      showError(t.withdrawDisabledAlert);
      return;
    }

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

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      showError(t.enterValidAmount);
      return;
    }
    if (numAmount < currentMinWithdraw) {
      showError(t.minWithdrawLabel + \` ৳\${currentMinWithdraw}\${isUSDT ? ' (~$2)' : ''}\`);
      return;
    }
    if (numAmount > availableBalance) {
      showError(t.insufficientBalance);
      return;
    }

    setShowConfirm(true);
  };`;

const newPreSubmit = `  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    hapticFeedback.medium();
    setFieldErrors({}); // reset errors
    
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

code = code.replace(oldPreSubmit, newPreSubmit);

// 7. Update handleConfirmSubmit
code = code.replace(
`  const handleConfirmSubmit = async () => {
    setShowConfirm(false);
    hapticFeedback.medium();
    
    const numAmount = Number(amount);
    setIsSubmitting(true);
    setErrorMessage(null);`,
`  const handleConfirmSubmit = async () => {
    setShowConfirm(false);
    hapticFeedback.medium();
    
    const numAmount = Number(amount);
    setIsSubmitting(true);
    setFieldErrors({});`
);

code = code.replace(
`    } else {
      showError(res.message);
    }
  };`,
`    } else {
      setFieldErrors({ global: res.message });
      hapticFeedback.error();
    }
  };`
);

fs.writeFileSync('WithdrawView.tsx', code);
