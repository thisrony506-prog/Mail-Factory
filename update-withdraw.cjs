const fs = require('fs');
let code = fs.readFileSync('WithdrawView.tsx', 'utf-8');

// Import AlertModal
code = code.replace(
  "import { hapticFeedback } from './haptics';",
  "import { hapticFeedback } from './haptics';\nimport { AlertModal } from './AlertModal';"
);

// Fix profile?.id to profile?.uid
code = code.replace(/profile\?\.id \|\| 'guest'/g, "profile?.uid || 'guest'");

// Add error modal state and replace inline error display
code = code.replace(
  "const [errorMessage, setErrorMessage] = useState<string | null>(null);",
  "const [errorMessage, setErrorMessage] = useState<string | null>(null);\n  const [isAlertOpen, setIsAlertOpen] = useState(false);\n\n  const showError = (msg: string) => {\n    setErrorMessage(msg);\n    setIsAlertOpen(true);\n  };"
);

// Replace setErrorMessage with showError in validation
code = code.replace(/setErrorMessage\(/g, "showError(");

// But we don't want to replace setErrorMessage(null), so let's revert that
code = code.replace(/showError\(null\)/g, "setErrorMessage(null)");

// Add the AlertModal component before the final closing div
code = code.replace(
  "    </div>\n  );\n};",
  `      <AlertModal 
        isOpen={isAlertOpen} 
        message={errorMessage || ''} 
        onClose={() => setIsAlertOpen(false)} 
      />
    </div>
  );
};`
);

// Remove the inline errorMessage display
code = code.replace(
  /\{errorMessage && \([\s\S]*?<\/span>[\s\S]*?<\/div>\s*\)\}/g,
  ""
);

fs.writeFileSync('WithdrawView.tsx', code);
