const fs = require('fs');

const files = [
  'MemberIdCardView.tsx',
  'ReviewShifts.tsx',
  'GuestLandingView.tsx',
  'AuthPageView.tsx',
  'AppContext.tsx',
  'ReviewsView.tsx',
  'BuyerMarketplaceView.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');
  
  // Replace array slices
  code = code.replace(/displaySellers\.slice/g, '(displaySellers || []).slice');
  code = code.replace(/shiftsArray\.slice/g, '(shiftsArray || []).slice');
  code = code.replace(/combinedList\.slice/g, '(combinedList || []).slice');
  code = code.replace(/displayedReviews\.slice/g, '(displayedReviews || []).slice');
  code = code.replace(/liveReviews\.slice/g, '(liveReviews || []).slice');
  code = code.replace(/prev\.slice/g, '(prev || []).slice');
  code = code.replace(/realFiltered\.slice/g, '(realFiltered || []).slice');
  code = code.replace(/filteredReviews\.slice/g, '(filteredReviews || []).slice');
  
  // Note: we already fixed string slices in previous script, but let's make sure
  fs.writeFileSync(file, code);
}
