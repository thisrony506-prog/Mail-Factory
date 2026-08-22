const fs = require('fs');

['ExchangeView.tsx', 'WithdrawView.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf-8');
  
  // Replace <AlertModal ... /> with nothing
  code = code.replace(/<AlertModal[^>]+isOpen=\{isAlertOpen\}[^>]*\/>/g, '');
  
  fs.writeFileSync(file, code);
});
