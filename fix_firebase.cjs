const fs = require('fs');
let code = fs.readFileSync('firebase.ts', 'utf-8');
code = code.replace(/export const googleProvider = new GoogleAuthProvider\(\);[\s\S]*?export \{/m, 'export const googleProvider = new GoogleAuthProvider();\n\nexport {');
fs.writeFileSync('firebase.ts', code);
