const fs = require('fs');
let code = fs.readFileSync('types.ts', 'utf-8');

code = code.replace(
  /processedForBalance\?: boolean;/g,
  'processedForBalance?: boolean;\n  notifiedChecking?: boolean;'
);

fs.writeFileSync('types.ts', code);
