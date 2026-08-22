const fs = require('fs');
let code = fs.readFileSync('ExchangeView.tsx', 'utf-8');

// Import AlertModal
code = code.replace(
  "import { hapticFeedback } from './haptics';",
  "import { hapticFeedback } from './haptics';\nimport { AlertModal } from './AlertModal';"
);

// Add error modal state and replace inline error display
code = code.replace(
  "const [errorMessage, setErrorMessage] = useState<string | null>(null);",
  "const [errorMessage, setErrorMessage] = useState<string | null>(null);\n  const [isAlertOpen, setIsAlertOpen] = useState(false);\n\n  const showError = (msg: string) => {\n    setErrorMessage(msg);\n    setIsAlertOpen(true);\n  };"
);

// Replace setErrorMessage with showError in validation
// We only want to replace setErrorMessage(xxx) when it's showing an error
code = code.replace(/setErrorMessage\(([^n][^u][^l][^l][^)]*)\)/g, "showError($1)");
// Wait, `setErrorMessage(null)` should stay `setErrorMessage(null)`
// The regex above will replace setErrorMessage(t.minTwoGmails) with showError(t.minTwoGmails)
// It might replace setErrorMessage(result.message || 'Error') to showError(result.message || 'Error')

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
  /\{errorMessage && \([\s\S]*?<\/div>\s*\)\}/g,
  ""
);

fs.writeFileSync('ExchangeView.tsx', code);
