const fs = require('fs');
let code = fs.readFileSync('ReviewsView.tsx', 'utf-8');

// 1. Update published filter
code = code.replace(
  "const published = allList.filter((r) => r.status !== 'rejected');",
  "const published = allList.filter((r) => r.status === 'approved' || !r.status);"
);

// 2. Update default status on submit
code = code.replace(
  "status: 'approved',",
  "status: 'pending',"
);

fs.writeFileSync('ReviewsView.tsx', code);
