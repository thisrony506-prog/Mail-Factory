const fs = require('fs');
let code = fs.readFileSync('ProfileView.tsx', 'utf-8');

code = code.replace(
  /const totalSubCount = profile\?\.total_submitted \|\| submissions\.length;\s*const approvedCount = profile\?\.manual_approved_count \|\| 0;/g,
  `const totalSubCount = submissions.reduce((acc, s) => acc + (Number(s.count) || Number(s.quantity) || 1), 0);\n  const approvedCount = submissions.filter((s) => (s.status || '').toLowerCase() === 'approved').reduce((acc, s) => acc + (Number(s.count) || Number(s.quantity) || 1), 0);`
);

fs.writeFileSync('ProfileView.tsx', code);
