const fs = require('fs');

['ExchangeView.tsx', 'WithdrawView.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf-8');
  
  // Replace the exact AlertModal string
  code = code.replace(/<AlertModal\s*isOpen=\{isAlertOpen\}\s*message=\{errorMessage \|\| ''\}\s*onClose=\{.*?\}\s*\/>/gs, '');
  
  fs.writeFileSync(file, code);
});
