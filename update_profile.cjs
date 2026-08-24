const fs = require('fs');
let code = fs.readFileSync('ProfileView.tsx', 'utf-8');

// Add import
if (!code.includes('useUserStats')) {
  code = code.replace(
    /import \{ useApp \} from '\.\/AppContext';/,
    "import { useApp } from './AppContext';\nimport { useUserStats } from './useUserStats';"
  );
}

// Replace the entire block of calculations with a single hook call
const regex = /const chartDays[\s\S]*?(?=\/\/ Level progress percentage)/;
const replacement = `const {
    totalSubCount,
    approvedCount,
    pendingCount,
    checkingCount,
    rejectedCount,
    realTotalEarnings,
    displayEarnings,
    realTotalWithdrawn,
    displayWithdrawn,
    hasWithdrawn,
    chartData,
    rangeTotal,
    rangePeak,
  } = useUserStats();\n\n  `;

code = code.replace(regex, replacement);

fs.writeFileSync('ProfileView.tsx', code);
