const fs = require('fs');
let code = fs.readFileSync('types.ts', 'utf-8');
if (!code.includes('trxId?: string;')) {
    code = code.replace(
        "transactionNote?: string;",
        "transactionNote?: string;\n  trxId?: string;"
    );
    fs.writeFileSync('types.ts', code);
}
