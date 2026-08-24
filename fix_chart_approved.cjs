const fs = require('fs');
let code = fs.readFileSync('ProfileView.tsx', 'utf-8');

code = code.replace(
  /\.filter\(\(s\) => \(s\.status \|\| ''\)\.toLowerCase\(\) === 'approved' \|\| s\.status === undefined\)/g,
  ".filter((s) => (s.status || '').toLowerCase() === 'approved')"
);

fs.writeFileSync('ProfileView.tsx', code);
