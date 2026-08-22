const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf-8');

const oldLogic = `  // Show custom branded loading screen only if user is logged in and actively loading data
  if (loading && user) {
    return <LoadingScreen />;
  }`;

const newLogic = `  // Determine if we should show the loading screen
  // If we have a cached profile or an active user, and we are still loading, show LoadingScreen
  // This prevents the "flash of guest view" for returning logged-in users,
  // while allowing new guests (and PageSpeed Insights) to see the GuestLandingView instantly.
  const hasCachedProfile = !!localStorage.getItem('mf_last_user_profile');
  if (loading && (user || hasCachedProfile)) {
    return <LoadingScreen />;
  }`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('App.tsx', code);
