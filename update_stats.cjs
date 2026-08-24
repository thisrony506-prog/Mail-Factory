const fs = require('fs');
let code = fs.readFileSync('useUserStats.ts', 'utf-8');

function fixCount(line) {
  return line.replace(/\(Number\(s\.count\) \|\| Number\(s\.quantity\) \|\| 1\)/g, "(Number(s.count) || Number(s.quantity) || (s.gmails ? s.gmails.length : 1))");
}

code = code.split('\n').map(fixCount).join('\n');
fs.writeFileSync('useUserStats.ts', code);
