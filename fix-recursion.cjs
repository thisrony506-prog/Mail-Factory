const fs = require('fs');

['WithdrawView.tsx', 'ExchangeView.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf-8');
  
  const broken = `  const showError = (msg: string) => {
    showError(msg);
    setIsAlertOpen(true);
  };`;
  
  const fixed = `  const showError = (msg: string) => {
    setErrorMessage(msg);
    setIsAlertOpen(true);
  };`;
  
  code = code.replace(broken, fixed);
  fs.writeFileSync(file, code);
});
