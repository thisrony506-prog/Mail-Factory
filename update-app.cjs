const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf-8');
code = code.replace(
  /<GuestLandingView \/>/g,
  '<Suspense fallback={<ViewSkeleton />}><GuestLandingView /></Suspense>'
);
fs.writeFileSync('App.tsx', code);
