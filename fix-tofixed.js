const fs = require('fs');
let code = fs.readFileSync('BuyerMarketplaceView.tsx', 'utf8');

// Replace all .toFixed( with a safe call
code = code.replace(/(\w+)\.toFixed\(/g, '(Number($1)||0).toFixed(');
// Also handle things like (something).toFixed(
code = code.replace(/\)\.toFixed\(/g, ')?.toFixed(');

fs.writeFileSync('BuyerMarketplaceView.tsx', code);
