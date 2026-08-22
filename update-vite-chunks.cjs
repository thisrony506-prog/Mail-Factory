const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf-8');
code = code.replace(
  "ui: ['lucide-react', 'motion']",
  "icons: ['lucide-react'],\n            animation: ['motion']"
);
fs.writeFileSync('vite.config.ts', code);
