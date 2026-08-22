const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf-8');

// Remove lazy imports for HomeView and GuestLandingView
code = code.replace("const HomeView = lazyWithRetry(() => import('./HomeView').then(m => ({ default: m.HomeView })));\n", "");
code = code.replace("const GuestLandingView = lazyWithRetry(() => import('./GuestLandingView').then(m => ({ default: m.GuestLandingView })));\n", "");

// Add regular imports at the top
const imports = `import { HomeView } from './HomeView';
import { GuestLandingView } from './GuestLandingView';\n`;

code = code.replace("import { LoadingScreen } from './LoadingScreen';", "import { LoadingScreen } from './LoadingScreen';\n" + imports);

fs.writeFileSync('App.tsx', code);
