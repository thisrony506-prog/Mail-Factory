const fs = require('fs');
let code = fs.readFileSync('ProfileView.tsx', 'utf-8');

// Fix 1: chartData approved filter
code = code.replace(
  /\.filter\(\(s\) => s\.status === 'approved'\)/g,
  ".filter((s) => (s.status || '').toLowerCase() === 'approved' || s.status === undefined)"
);

// Fix 2: pendingCount, checkingCount, rejectedCount
code = code.replace(
  /const pendingCount = submissions\.filter\(\(s\) => \(s\.status \|\| ''\)\.toLowerCase\(\) === 'pending'\)\.length;/g,
  "const pendingCount = submissions.filter((s) => (s.status || '').toLowerCase() === 'pending' || !s.status).reduce((acc, s) => acc + (Number(s.count) || Number(s.quantity) || 1), 0);"
);

code = code.replace(
  /const checkingCount = submissions\.filter\(\(s\) => \(s\.status \|\| ''\)\.toLowerCase\(\) === 'checking'\)\.length;/g,
  "const checkingCount = submissions.filter((s) => (s.status || '').toLowerCase() === 'checking').reduce((acc, s) => acc + (Number(s.count) || Number(s.quantity) || 1), 0);"
);

code = code.replace(
  /const rejectedCount = submissions\.filter\(\(s\) => \(s\.status \|\| ''\)\.toLowerCase\(\) === 'rejected'\)\.length;/g,
  "const rejectedCount = submissions.filter((s) => (s.status || '').toLowerCase() === 'rejected').reduce((acc, s) => acc + (Number(s.count) || Number(s.quantity) || 1), 0);"
);

fs.writeFileSync('ProfileView.tsx', code);
