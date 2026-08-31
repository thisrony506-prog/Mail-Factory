const fs = require('fs');
let code = fs.readFileSync('BuyerMarketplaceView.tsx', 'utf8');

code = code.replace(/availableBalance\.toFixed/g, '(Number(availableBalance)||0).toFixed');
code = code.replace(/reservedBalance\.toFixed/g, '(Number(reservedBalance)||0).toFixed');
code = code.replace(/currentBalance\.toFixed/g, '(Number(currentBalance)||0).toFixed');
code = code.replace(/\(product\.rating \|\| 5\)\.toFixed/g, 'Number(product.rating || 5).toFixed');
code = code.replace(/\(product\.price \|\| 0\)\.toFixed/g, 'Number(product.price || 0).toFixed');
code = code.replace(/\(activeProduct\.price \|\| 0\)\.toFixed/g, 'Number(activeProduct.price || 0).toFixed');
code = code.replace(/\(\(checkoutProduct\.price \|\| 0\) \* quantity\)\.toFixed/g, 'Number((checkoutProduct.price || 0) * quantity).toFixed');
code = code.replace(/totalPrice\.toFixed/g, '(Number(totalPrice)||0).toFixed');
code = code.replace(/\(totalPrice \- availableBalance\)\.toFixed/g, 'Number(totalPrice - availableBalance).toFixed');
code = code.replace(/shortfallAmount\.toFixed/g, '(Number(shortfallAmount)||0).toFixed');
// oldPrice is already wrapped in Number()

fs.writeFileSync('BuyerMarketplaceView.tsx', code);
